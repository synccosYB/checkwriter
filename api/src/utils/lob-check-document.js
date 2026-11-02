import crypto from 'node:crypto';

export const CHECK_PDF_VERSION = 'original-check-pdf-v1';

export function buildLobCheckForm({ addressFrom, addressTo, checkId, userId, mailClass,
  description, document, replacesLobId }) {
  const bytes = document?.pdfBuffer;
  if (!Buffer.isBuffer(bytes) || bytes.length < 100 || bytes.length > 20 * 1024 * 1024 || bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('A complete rendered check PDF is required. HTML check summaries cannot be mailed.');
  }
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (!document.fingerprint || document.pdfSha256 !== hash) throw new Error('The check document failed its integrity check.');
  const form = new FormData();
  const append = (name, value) => { if (value !== undefined && value !== null && value !== '') form.append(name, String(value)); };
  for (const [key, address] of Object.entries({ to: addressTo, from: addressFrom })) {
    if (!address?.name || !address.address_line1 || !address.address_city || !address.address_state || !address.address_zip) {
      throw new Error('The complete sender and recipient addresses are required.');
    }
    for (const [field, value] of Object.entries(address)) append(`${key}[${field}]`, value);
  }
  append('description', description || `Check mailing ${checkId}`);
  append('color', false);
  append('double_sided', false);
  append('address_placement', 'insert_blank_page');
  append('mail_type', mailClass === 'standard' ? 'usps_standard' : 'usps_first_class');
  if (mailClass === 'certified') append('extra_service', 'certified');
  for (const [key, value] of Object.entries({ checkId, userId, checkPdfVersion: CHECK_PDF_VERSION,
    checkPdfSha256: hash, checkFingerprint: document.fingerprint, replacesLobId })) append(`metadata[${key}]`, value);
  form.append('file', new Blob([bytes], { type: 'application/pdf' }), `check-${document.checkNumber}.pdf`);
  return form;
}
