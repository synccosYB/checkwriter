import crypto from 'node:crypto';
import axios from 'axios';
import config from 'config';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db, lobMailRecoveries, lobMailRecords } from '../db/index.js';
import { getLobMailRecord, getLobMailRecords } from '../models/lob.model.js';
import { getLOBLetterById, submitLobCheckPdf, findLobReplacements } from './lob.service.js';
import { checksCollection } from '../models/dbCollections.js';
import { recoverRecipientAddress } from '../utils/lob-recovery-address.js';
import { renderCheckMailPdf } from './checkMailPdf.service.js';
import { uploadToS3, s3Client } from '../utils/s3.util.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { recoveryApproval } from '../utils/lob-recovery-approval.js';

export const RECOVERY_SINCE = '2026-10-27T04:00:00.000Z';
const bucket = () => config.s3.bucket_name;
const fail = (message, statusCode = 409) => { const e = new Error(message); e.statusCode = statusCode; throw e; };
const postalAddress = a => ({ name: a?.name || a?.company, companyName: a?.company,
  addressLine1: a?.address_line1, addressLine2: a?.address_line2, city: a?.address_city,
  state: a?.address_state, zipCode: a?.address_zip, country: a?.address_country || 'US' });

async function recipientFor(source, original) {
  const check = await checksCollection.findOne({ _id: source.checkId, ownerId: source.ownerId, ownerType: source.ownerType }).populate('payeeId').lean();
  const payee = check?.payeeId;
  if (!payee || String(payee.ownerId) !== String(source.ownerId) || payee.ownerType !== source.ownerType) fail('Recipient ownership could not be verified.', 422);
  return recoverRecipientAddress(original, payee);
}

export async function listLobRecoveries() {
  const sources = await getLobMailRecords({ createdAt: { $gte: new Date(RECOVERY_SINCE) } },
    { page: 1, pageSize: 1000, sort: { createdAt: 1 } });
  if (sources.total > 1000) fail('More than 1,000 records require a paginated recovery audit.', 422);
  const prepared = await db.select().from(lobMailRecoveries);
  const byId = new Map(prepared.map(r => [r.sourceLobId, r]));
  return sources.data.filter(r => r.lobId && !r.lobResponse?.metadata?.checkPdfVersion && !r.lobResponse?.metadata?.replacesLobId)
    .map(r => {
      const p = byId.get(r.lobId);
      return { sourceLobId: r.lobId, sourceRecordId: String(r._id), checkId: String(r.checkId),
        ownerId: String(r.ownerId), ownerType: r.ownerType, originalStatus: r.status,
        createdAt: r.createdAt, mailClass: r.mailClass,
        state: p?.status || (r.status === 'Canceled' ? 'Excluded: canceled' : 'Needs preparation'),
        pdfSha256: p?.pdfSha256, snapshot: p?.snapshot,
        replacementLobId: p?.replacementLobId, failure: p?.failure };
    });
}

async function sourceRecord(lobId) {
  const record = await getLobMailRecord({ lobId });
  if (!record || new Date(record.createdAt) < new Date(RECOVERY_SINCE) || record.status === 'Canceled') fail('This original mailing is not eligible for the October 27 recovery.', 422);
  if (record.lobResponse?.metadata?.checkPdfVersion || record.lobResponse?.metadata?.replacesLobId) fail('This mailing already uses the complete-check workflow.', 422);
  return record;
}

export async function prepareLobRecovery(lobId, actorId) {
  const source = await sourceRecord(lobId);
  const [existing] = await db.select().from(lobMailRecoveries).where(eq(lobMailRecoveries.sourceLobId, lobId));
  if (existing?.replacementLobId || existing?.status === 'Submitting') return existing;
  if (existing?.status === 'Needs reconciliation') fail('This submission needs provider reconciliation before any new attempt.');
  const original = await getLOBLetterById(lobId);
  if (original.deleted) fail('The original mailing was canceled; review it separately.', 422);
  const document = await renderCheckMailPdf(source.checkId, source.ownerId, source.ownerType);
  const key = `mail-recovery/${source.ownerId}/${lobId}/${document.pdfSha256}.pdf`;
  await uploadToS3({ Bucket: bucket(), Key: key, ContentType: 'application/pdf', Body: document.pdfBuffer });
  const row = { sourceLobId: lobId, sourceRecordId: String(source._id), checkId: String(source.checkId),
    ownerId: String(source.ownerId), ownerType: source.ownerType, status: 'Prepared', pdfKey: key,
    pdfSha256: document.pdfSha256, checkFingerprint: document.fingerprint, preparedBy: String(actorId),
    preparedAt: new Date(), failure: null,
    snapshot: { checkNumber: document.checkNumber, amount: document.amount, payeeName: document.payeeName,
      issuedDate: document.issuedDate, mailClass: source.mailClass,
      addressFrom: postalAddress(original.from), addressTo: await recipientFor(source, postalAddress(original.to)) } };
  // Do not reset an existing submission if preparation races with approval.
  await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lobId}, 0))`);
    const [current] = await tx.select().from(lobMailRecoveries).where(eq(lobMailRecoveries.sourceLobId, lobId));
    if (current?.replacementLobId || current?.status === 'Submitting') return;
    if (current?.status === 'Needs reconciliation') fail('This submission needs provider reconciliation before any new attempt.');
    await tx.insert(lobMailRecoveries).values(row).onConflictDoUpdate({ target: lobMailRecoveries.sourceLobId, set: row });
  });
  const [result] = await db.select().from(lobMailRecoveries).where(eq(lobMailRecoveries.sourceLobId, lobId));
  return result;
}

export async function recoveryPdf(lobId) {
  const [row] = await db.select().from(lobMailRecoveries).where(eq(lobMailRecoveries.sourceLobId, lobId));
  if (!row) fail('Prepare this mailing before viewing the corrected PDF.', 404);
  const object = await s3Client.send(new GetObjectCommand({ Bucket: bucket(), Key: row.pdfKey }));
  const bytes = Buffer.from(await object.Body.transformToByteArray());
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== row.pdfSha256) fail('The stored check PDF failed its integrity check. Prepare it again.');
  return { bytes, row };
}

export async function originalRecoveryPdf(lobId) {
  await sourceRecord(lobId);
  const letter = await getLOBLetterById(lobId);
  if (!letter.url?.startsWith('https://lob-assets.com/')) fail('The original Lob document is unavailable.', 404);
  const response = await axios.get(letter.url, { responseType: 'arraybuffer', timeout: 15000, maxContentLength: 20 * 1024 * 1024 });
  return Buffer.from(response.data);
}

export async function submitLobRecovery(lobId, approvedSha256, actorId) {
  const source = await sourceRecord(lobId);
  // Financial fields and signature must still match the PDF reviewed by the operator.
  const current = await renderCheckMailPdf(source.checkId, source.ownerId, source.ownerType);
  let submissionStarted = false;
  try { return await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lobId}, 0))`);
    const [row] = await tx.select().from(lobMailRecoveries).where(eq(lobMailRecoveries.sourceLobId, lobId));
    const already = recoveryApproval(row, approvedSha256, current.fingerprint);
    if (already) return already;
    const { bytes } = await recoveryPdf(lobId);
    const addressTo = await recipientFor(source, row.snapshot.addressTo);
    await tx.update(lobMailRecoveries).set({ status: 'Submitting', failure: null }).where(eq(lobMailRecoveries.sourceLobId, lobId));
    submissionStarted = true;
    const s = row.snapshot;
    const replacement = await submitLobCheckPdf({ addressFrom: s.addressFrom, addressTo,
      checkId: row.checkId, userId: actorId, mailClass: s.mailClass, replacesLobId: lobId,
      lobDescription: `Corrected original check PDF; replaces ${lobId}`,
      idempotencyKey: s.rejectedRequestReview ? `recovery-address-v2-${lobId}` : `recovery-pdf-v1-${lobId}`,
      document: { pdfBuffer: bytes, pdfSha256: row.pdfSha256, fingerprint: row.checkFingerprint, checkNumber: s.checkNumber } });
    // Retain every original record, and link the new provider reference to it.
    await tx.insert(lobMailRecords).values({ lobId: replacement.id, checkId: row.checkId, ownerId: row.ownerId,
      ownerType: row.ownerType, mailClass: s.mailClass, chargeAmount: 0, status: 'Submitted',
      lobResponse: { ...replacement, recoveryApprovedBy: String(actorId) } });
    await tx.update(lobMailRecoveries).set({ status: 'Submitted', replacementLobId: replacement.id,
      submittedAt: new Date() }).where(eq(lobMailRecoveries.sourceLobId, lobId));
    return { lobId: replacement.id, sourceLobId: lobId };
  }); } catch (error) {
    const rejected = error.response?.status === 422;
    if (submissionStarted) {
      await db.update(lobMailRecoveries).set({ status: rejected ? 'Rejected' : 'Needs reconciliation',
        failure: rejected ? `Lob rejected the request: ${error.response?.data?.error?.message || 'Invalid mailing data'}. No replacement was created.` : 'The submission outcome needs provider reconciliation. Automatic retry is blocked to prevent duplicate checks.' })
        .where(and(eq(lobMailRecoveries.sourceLobId, lobId), isNull(lobMailRecoveries.replacementLobId), eq(lobMailRecoveries.status, 'Prepared')));
    }
    if (rejected) { const e = new Error(`Lob rejected the mailing: ${error.response?.data?.error?.message || 'Invalid mailing data'}.`); e.statusCode = 422; throw e; }
    throw error;
  }
}

export async function reconcileLobRecovery(lobId, actorId, evidence) {
  const source = await sourceRecord(lobId);
  const matches = await findLobReplacements(lobId);
  if (matches.length > 1) fail('Multiple provider replacements were found. Manual review is required.');
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lobId}, 0))`);
    const [row] = await tx.select().from(lobMailRecoveries).where(eq(lobMailRecoveries.sourceLobId, lobId));
    if (row?.replacementLobId) return { state: 'Submitted', lobId: row.replacementLobId };
    if (!row || !['Needs reconciliation', 'Rejected'].includes(row.status)) fail('Only blocked submissions can be reconciled.');
    if (matches.length) {
      const letter = matches[0];
      if (letter.metadata?.checkPdfSha256 !== row.pdfSha256 || String(letter.metadata?.checkId) !== row.checkId) fail('The provider document does not match the reviewed check.');
      const [record] = await tx.select().from(lobMailRecords).where(eq(lobMailRecords.lobId, letter.id));
      if (!record) await tx.insert(lobMailRecords).values({ lobId: letter.id, checkId: row.checkId, ownerId: row.ownerId, ownerType: row.ownerType, mailClass: row.snapshot.mailClass, chargeAmount: 0, status: 'Submitted', lobResponse: letter });
      await tx.update(lobMailRecoveries).set({ status: 'Submitted', replacementLobId: letter.id, submittedAt: new Date(), failure: null }).where(eq(lobMailRecoveries.sourceLobId, lobId));
      return { state: 'Submitted', lobId: letter.id };
    }
    // Absence from the provider list alone never permits another financial submission.
    if (evidence?.confirmation !== 'I_VERIFIED_LOB_REJECTED_THIS_REQUEST_WITH_NO_REFERENCE' ||
        evidence.statusCode !== 422 || !/^log_[a-z0-9]+$/.test(evidence.logId || '') ||
        evidence.idempotencyKey !== `recovery-pdf-v1-${lobId}`) fail('No replacement was found. Verify the exact rejected request in Lob API Logs before resetting it.');
    const addressTo = await recipientFor(source, row.snapshot.addressTo);
    await tx.update(lobMailRecoveries).set({ status: 'Prepared', failure: null,
      snapshot: { ...row.snapshot, addressTo, rejectedRequestReview: { ...evidence, reviewedBy: String(actorId), reviewedAt: new Date().toISOString() } } })
      .where(eq(lobMailRecoveries.sourceLobId, lobId));
    return { state: 'Prepared', addressTo };
  });
}
