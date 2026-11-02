import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryApproval } from './lob-recovery-approval.js';
const row = { status: 'Prepared', pdfSha256: 'reviewed-pdf', checkFingerprint: 'original-check' };
test('only the reviewed PDF with unchanged check data can be submitted', () => {
  assert.equal(recoveryApproval(row, 'reviewed-pdf', 'original-check'), null);
  assert.throws(() => recoveryApproval(row, 'other-pdf', 'original-check'));
  assert.throws(() => recoveryApproval(row, 'reviewed-pdf', 'changed-signature'));
  assert.throws(() => recoveryApproval(null, 'reviewed-pdf', 'original-check'));
});
test('repeated submissions return the existing reference and uncertain outcomes block retry', () => {
  assert.deepEqual(recoveryApproval({ ...row, status: 'Submitted', replacementLobId: 'ltr_replacement' }, '', ''), { alreadySubmitted: true, lobId: 'ltr_replacement' });
  for (const status of ['Submitting', 'Needs reconciliation', 'Canceled']) assert.throws(() => recoveryApproval({ ...row, status }, 'reviewed-pdf', 'original-check'));
});
