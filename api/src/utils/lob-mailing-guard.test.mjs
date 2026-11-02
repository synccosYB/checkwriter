import test from 'node:test';
import assert from 'node:assert/strict';
import { getLOBRates, createLOBLetter, collectPaymentStripeLOB } from '../services/lob.service.js';
import { platformSettingsCollection } from '../models/dbCollections.js';
import { assertLobCheckMailingReady } from './lob-mailing-guard.js';

const originalFindOne = platformSettingsCollection.findOne;
test.before(() => { platformSettingsCollection.findOne = async () => null; });
test.after(() => { platformSettingsCollection.findOne = originalFindOne; });
test('only an explicitly enabled original-PDF workflow passes the guard', () => {
  assert.doesNotThrow(() => assertLobCheckMailingReady({ enabled: true }));
  assert.throws(() => assertLobCheckMailingReady({ enabled: 'true' }), /temporarily paused/);
});

for (const [name, operation] of [
  ['rate selection', () => getLOBRates()],
  ['checkout creation', () => collectPaymentStripeLOB([], 'https://example.test', 'test-user')],
  ['letter submission', () => createLOBLetter({})],
]) {
  test(`paused mailing blocks ${name} before contacting Lob or Stripe`, async () => {
    await assert.rejects(operation, error => error.statusCode === 503 && /check-stock/.test(error.message));
  });
}
