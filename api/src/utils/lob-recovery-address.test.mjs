import test from 'node:test';
import assert from 'node:assert/strict';
import { recoverRecipientAddress } from './lob-recovery-address.js';
const original = { name: 'TEST PAYEE', addressLine1: '████', city: 'TEST CITY', state: 'NY', zipCode: '10001-1234' };
const payee = { name: 'Test Payee', address: { addressLine1: '1 Test Way', city: 'Test City', state: 'NY', zipCode: '10001' } };
test('masked provider street is restored only from the same verified payee and postal location', () => {
  assert.equal(recoverRecipientAddress(original, payee).addressLine1, '1 Test Way');
  assert.throws(() => recoverRecipientAddress(original, { ...payee, name: 'Different recipient' }));
  assert.throws(() => recoverRecipientAddress(original, { ...payee, address: { ...payee.address, zipCode: '10002' } }));
  assert.throws(() => recoverRecipientAddress(original, { ...payee, address: { ...payee.address, addressLine1: '████' } }));
});
test('an unmasked original destination is retained even when the payee address later changes', () => {
  const valid = { ...original, addressLine1: '2 Original Way' };
  assert.deepEqual(recoverRecipientAddress(valid, payee), valid);
});
