import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLobCheckStockReady } from './lob-check-stock-guard.js';
test('all new check submissions remain blocked pending provider print-stock confirmation', () => {
  assert.throws(assertLobCheckStockReady, e => e.statusCode === 503 && /check-stock/.test(e.message));
});
