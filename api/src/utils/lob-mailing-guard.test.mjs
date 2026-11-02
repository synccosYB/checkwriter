import test from 'node:test';
import assert from 'node:assert/strict';
import { getLOBRates, createLOBLetter, collectPaymentStripeLOB } from '../services/lob.service.js';

for (const [name, operation] of [
  ['rate selection', () => getLOBRates()],
  ['checkout creation', () => collectPaymentStripeLOB([], 'https://example.test', 'test-user')],
  ['letter submission', () => createLOBLetter({})],
]) {
  test(`paused mailing blocks ${name} before contacting Lob or Stripe`, async () => {
    await assert.rejects(operation, error => error.statusCode === 503 && error.message.includes('temporarily paused'));
  });
}
