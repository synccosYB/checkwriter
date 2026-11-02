import crypto from 'node:crypto';
import axios from 'axios';
import { checksCollection, usersCollection, organizationCollection, addressesCollection } from '../models/dbCollections.js';
import { compileTemplate, compileWrapperTemplate, generatePDFBuffer } from '../utils/checkEmail/checkEmail.utils.js';
import { getBankSignatureUrl } from '../utils/signature.util.js';

export function validateCheckForMail(check, ownerId, ownerType) {
  const fail = message => { const error = new Error(message); error.statusCode = 422; throw error; };
  if (!check || String(check.ownerId) !== String(ownerId) || check.ownerType !== ownerType) fail('Check ownership could not be verified.');
  if (['VOID', 'CLEARED', 'DELETE', 'BLANK'].includes(check.status)) fail('Voided, cleared, deleted, or blank checks cannot be mailed.');
  if (!check.bankId || String(check.bankId.ownerId) !== String(ownerId) || check.bankId.ownerType !== ownerType) fail('The check bank account does not belong to this check owner.');
  if (!check.payeeId?.name || String(check.payeeId.ownerId) !== String(ownerId) || check.payeeId.ownerType !== ownerType) fail('The check payee could not be verified.');
  if (!Number.isFinite(check.amount) || check.amount <= 0 || !check.checkNumber || !check.issuedDate || Number.isNaN(Date.parse(check.issuedDate))) fail('Check number, date, or amount is missing.');
  const routing = String(check.bankId.bankRoutingNumber || check.bankId.bankTransitNumber || '').replace(/\s/g, '');
  const account = String(check.bankId.accountNumber || '').replace(/\s/g, '');
  if (!/^\d{9}$/.test(routing) || !/^\d{4,17}$/.test(account)) fail('The complete bank routing and account numbers are required for mailing.');
  if (!check.bankId.bankPreferences?.signatureEnabled) fail('A signed check is required for mailing. Enable and review the check signature first.');
  return check;
}

async function embeddedImage(url) {
  if (url.startsWith('data:image/')) return url;
  const result = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000, maxContentLength: 5 * 1024 * 1024 });
  const type = result.headers['content-type']?.split(';')[0];
  if (!type?.startsWith('image/')) throw new Error('The check signature is not a valid image.');
  return `data:${type};base64,${Buffer.from(result.data).toString('base64')}`;
}

export async function renderCheckMailHtml(check, owner, address, signatureData) {
  const ownerId = check.ownerId;
  const ownerType = check.ownerType;
  validateCheckForMail(check, ownerId, ownerType);
  if (!signatureData?.startsWith('data:image/')) throw new Error('An embedded check signature is required.');
  const organization = ownerType === 'organization' ? { ...owner } : null;
  if (organization?.organizationLogo) organization.organizationLogo = await embeddedImage(organization.organizationLogo);
  const userData = { ...address, zip: address.zip || address.zipCode,
    firstName: ownerType === 'user' ? owner.firstName : owner.organizationName,
    lastName: ownerType === 'user' ? owner.lastName : '' };
  const view = { ...check, bankId: check.bankId._id, bank: check.bankId, payee: check.payeeId,
    userData, userId: ownerId, organization, resolvedSignatureUrl: signatureData };
  return { html: await compileWrapperTemplate(await compileTemplate(view)), userData };
}

export async function renderCheckMailPdf(checkId, ownerId, ownerType) {
  const check = await checksCollection.findOne({ _id: checkId, ownerId, ownerType })
    .populate('payeeId').populate('bankId').lean();
  validateCheckForMail(check, ownerId, ownerType);
  const owner = ownerType === 'user'
    ? await usersCollection.findById(ownerId).lean()
    : await organizationCollection.findById(ownerId).lean();
  const address = await addressesCollection.findOne({ ownerId, ownerType }).lean();
  if (!owner || !address?.addressLine1 || !address?.city || !address?.state || !(address?.zip || address?.zipCode)) {
    const error = new Error('The check owner name and mailing address must be complete before mailing.'); error.statusCode = 422; throw error;
  }
  const signature = await getBankSignatureUrl({ bankId: check.bankId._id, bankPreferences: check.bankId.bankPreferences,
    ownerId, ownerType, defaultOwnerId: ownerId, ownerData: owner });
  if (!signature) { const error = new Error('The check signature could not be loaded. No mailing order was created.'); error.statusCode = 422; throw error; }
  const signatureData = await embeddedImage(signature);
  const { html, userData } = await renderCheckMailHtml(check, owner, address, signatureData);
  const pdfBuffer = await generatePDFBuffer(html, { strictAssets: true, preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' } });
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify({
    checkId: String(check._id), ownerId: String(ownerId), ownerType, checkNumber: check.checkNumber,
    amount: check.amount, issuedDate: check.issuedDate, memo: check.memo, bank: check.bankId,
    payee: check.payeeId, userData, signatureData,
  })).digest('hex');
  return { pdfBuffer, pdfSha256: crypto.createHash('sha256').update(pdfBuffer).digest('hex'), fingerprint,
    checkNumber: check.checkNumber, checkId: String(check._id), amount: check.amount,
    payeeName: check.payeeId.name, issuedDate: check.issuedDate };
}
