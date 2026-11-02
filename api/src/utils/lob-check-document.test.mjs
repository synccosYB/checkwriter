import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { buildLobCheckForm, CHECK_PDF_VERSION } from './lob-check-document.js';
import { validateCheckForMail, renderCheckMailHtml } from '../services/checkMailPdf.service.js';

export const syntheticCheck = {
  _id: '000000000000000000000001', ownerId: '000000000000000000000002', ownerType: 'user', status: 'DRAFT',
  checkNumber: 123, amount: 12.34, issuedDate: '2026-10-29T12:00:00Z', memo: 'VOID - TEST DOCUMENT - NOT A PAYMENT',
  bankId: { _id: '000000000000000000000003', ownerId: '000000000000000000000002', ownerType: 'user',
    bankName: 'TEST BANK - VOID', bankRoutingNumber: '000000000', accountNumber: '0000000000', bankPreferences: { signatureEnabled: true } },
  payeeId: { ownerId: '000000000000000000000002', ownerType: 'user', name: 'VOID TEST PAYEE',
    address: { addressLine1: '1 TEST WAY', city: 'TEST CITY', state: 'NY', zipCode: '10001' } },
};
export const testSignature = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="250" height="65"><text x="5" y="40" font-size="24" font-style="italic">TEST SIGNATURE</text></svg>').toString('base64');
export const testOwner = { firstName: 'VOID TEST', lastName: 'DOCUMENT' };
export const testAddress = { addressLine1: '2 TEST WAY', city: 'TEST CITY', state: 'NY', zip: '10001' };

test('mailing requires ownership, complete bank details, signature and an unpaid check', () => {
  assert.doesNotThrow(() => validateCheckForMail(syntheticCheck, syntheticCheck.ownerId, 'user'));
  for (const status of ['VOID', 'CLEARED', 'DELETE', 'BLANK']) assert.throws(() => validateCheckForMail({ ...syntheticCheck, status }, syntheticCheck.ownerId, 'user'));
  assert.throws(() => validateCheckForMail(syntheticCheck, 'wrong-owner', 'user'));
  for (const bankChange of [{ ownerId: 'wrong-owner' }, { accountNumber: '' }, { bankRoutingNumber: '' }, { bankPreferences: {} }]) {
    assert.throws(() => validateCheckForMail({ ...syntheticCheck, bankId: { ...syntheticCheck.bankId, ...bankChange } }, syntheticCheck.ownerId, 'user'));
  }
  assert.throws(() => validateCheckForMail({ ...syntheticCheck, amount: NaN }, syntheticCheck.ownerId, 'user'));
});

test('shared full-check template includes the exact number, bank line, amount, payee and embedded signature', async () => {
  const { html } = await renderCheckMailHtml(syntheticCheck, testOwner, testAddress, testSignature);
  for (const text of ['000123', '12.34', 'VOID TEST PAYEE', '000000000', '0000000000', testSignature.replace(/=/g, '&#x3D;'), 'GnuMICR']) assert.ok(html.includes(text), `Missing expected original-check field: ${text.slice(0, 40)}`);
  assert.ok(html.includes('VOID - TEST DOCUMENT - NOT A PAYMENT'));
});

const bytes = Buffer.from('%PDF-1.7\n' + 'synthetic non-negotiable test bytes '.repeat(10));
const document = { pdfBuffer: bytes, pdfSha256: crypto.createHash('sha256').update(bytes).digest('hex'), fingerprint: 'test-fingerprint', checkNumber: 123 };
const address = { name: 'TEST', address_line1: '1 TEST WAY', address_city: 'TEST CITY', address_state: 'NY', address_zip: '10001', address_country: 'US' };
test('multipart submission preserves exact PDF bytes and adds a separate addressing sheet', async () => {
  const form = buildLobCheckForm({ addressFrom: address, addressTo: address, checkId: 'check-test', userId: 'owner-test', mailClass: 'first_class', document, replacesLobId: 'ltr_original' });
  assert.deepEqual(Buffer.from(await form.get('file').arrayBuffer()), bytes);
  assert.equal(form.get('file').type, 'application/pdf');
  assert.equal(form.get('address_placement'), 'insert_blank_page');
  assert.equal(form.get('double_sided'), 'false');
  assert.equal(form.get('metadata[checkPdfSha256]'), document.pdfSha256);
  assert.equal(form.get('metadata[checkPdfVersion]'), CHECK_PDF_VERSION);
  assert.equal(form.get('metadata[replacesLobId]'), 'ltr_original');
});
test('summary HTML, modified bytes and incomplete addresses cannot be submitted', () => {
  const options = { addressFrom: address, addressTo: address, document };
  assert.throws(() => buildLobCheckForm({ ...options, document: { ...document, pdfBuffer: Buffer.from('<html>summary</html>') } }));
  assert.throws(() => buildLobCheckForm({ ...options, document: { ...document, pdfSha256: 'wrong' } }));
  assert.throws(() => buildLobCheckForm({ ...options, addressTo: {} }));
});
