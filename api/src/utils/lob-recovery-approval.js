export function recoveryApproval(row, approvedSha256, currentFingerprint) {
  const fail = message => { const error = new Error(message); error.statusCode = 409; throw error; };
  if (!row) fail('Prepare and review the corrected PDF first.');
  if (row.replacementLobId) return { alreadySubmitted: true, lobId: row.replacementLobId };
  if (row.status !== 'Prepared') fail('This mailing is already submitting or requires reconciliation. It will not be sent again automatically.');
  if (approvedSha256 !== row.pdfSha256 || currentFingerprint !== row.checkFingerprint) fail('The check or signature changed after preparation. Prepare and review it again.');
  return null;
}
