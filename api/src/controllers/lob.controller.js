import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import {
  getLOBRates,
  createLOBLetter,
  getLOBLetterById,
  cancelLOBLetter,
  createLOBWebhook,
  collectPaymentStripeLOB,
  mapLOBStatusToCheckStatus,
  resolveLobApiKey,
} from '../services/lob.service.js';
import { getLobConfig, saveLobConfig } from '../models/platformSettings.model.js';
import {
  createLobMailRecord,
  updateLobMailRecord,
  getLobMailRecord,
  getLobMailRecords,
} from '../models/lob.model.js';
import subscriptionMiddleware from '../middlewares/subscription.middleware.js';
import adminPrivilageMiddleware from '../middlewares/adminPrivilage.middleware.js';
import { checksCollection, mailedChecksCollection, usersCollection } from '../models/dbCollections.js';
import { resolveShipmentRecipient } from '../utils/shipmentRecipient.util.js';
import { sendShippingStatusUpdateEmail } from '../services/email.service.js';
import { stripe } from '../services/stripe.service.js';

const LOB_WEBHOOK_SECRET = process.env.LOB_WEBHOOK_SECRET || '';

/**
 * Resolves the active LOB webhook secret.
 * Priority: DB platform setting → LOB_WEBHOOK_SECRET env var.
 */
const resolveLobWebhookSecret = async () => {
  try {
    const { webhookSecret } = await getLobConfig();
    if (webhookSecret) return webhookSecret;
  } catch (_) {}
  return LOB_WEBHOOK_SECRET;
};

const verifyLOBWebhookSignature = async (req) => {
  const secret = await resolveLobWebhookSecret();
  if (!secret) {
    console.warn('LOB_WEBHOOK_SECRET is not set. All LOB webhook events are rejected. Configure LOB_WEBHOOK_SECRET to enable status updates.');
    return false;
  }
  const signature = req.headers['lob-signature-v1'] || req.headers['x-lob-signature'];
  if (!signature) return false;
  const rawBody = req.rawBody;
  if (!rawBody) return false;
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(hmac, 'hex'));
  } catch {
    return false;
  }
};

const router = express.Router();

/**
 * GET /lob/status
 * Returns whether LOB is configured (key present and reachable).
 * Checks DB-stored config first, then falls back to env vars.
 */
router.get('/status', async (req, res, next) => {
  try {
    const { apiKey: dbApiKey, webhookSecret: dbWebhookSecret } = await getLobConfig();
    const resolvedKey = dbApiKey || process.env.LOB_API_KEY || '';
    const resolvedWebhookSecret = dbWebhookSecret || LOB_WEBHOOK_SECRET;

    const apiKeyPresent = !!resolvedKey;
    const webhookSecretPresent = !!resolvedWebhookSecret;
    const apiKeySource = dbApiKey ? 'database' : (process.env.LOB_API_KEY ? 'environment' : null);

    if (!apiKeyPresent) {
      return res.status(200).json({
        configured: false,
        apiKeyPresent: false,
        webhookSecretPresent,
        apiKeySource: null,
        message: 'LOB API key is not configured. Set it in Integrations → Mailing to enable mail delivery.',
      });
    }

    try {
      await getLOBRates();
      return res.status(200).json({
        configured: true,
        apiKeyPresent: true,
        webhookSecretPresent,
        apiKeySource,
        message: webhookSecretPresent
          ? 'LOB is active. API key valid and webhook secret configured.'
          : 'LOB API key is valid but webhook secret is not set — delivery status updates will not be received.',
      });
    } catch (err) {
      return res.status(200).json({
        configured: false,
        apiKeyPresent: true,
        webhookSecretPresent,
        apiKeySource,
        message: err.message || 'LOB API key appears invalid or LOB is unreachable.',
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /lob/configure
 * Admin-only: validate and persist LOB API key and webhook secret to platform settings.
 */
router.post('/configure', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { apiKey, webhookSecret } = req.body;

    if (!apiKey && !webhookSecret) {
      return res.status(400).json({ error: 'Provide apiKey and/or webhookSecret to save.' });
    }

    if (apiKey) {
      const testAxios = axios.create({
        baseURL: 'https://api.lob.com/v1',
        auth: { username: apiKey, password: '' },
      });
      try {
        await testAxios.get('/letters?limit=1');
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          return res.status(400).json({ error: 'LOB API key is invalid or unauthorized.' });
        }
        return res.status(400).json({ error: `Could not reach LOB API: ${err.message}` });
      }
    }

    await saveLobConfig({ apiKey, webhookSecret });

    return res.status(200).json({
      success: true,
      message: 'LOB configuration saved successfully.',
      apiKeySaved: !!apiKey,
      webhookSecretSaved: !!webhookSecret,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/rates', async (req, res, next) => {
  try {
    const rates = await getLOBRates();
    return res.status(200).json(rates);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/acceptStripePayment',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { checksDetails } = req.body;
      const { userId, organizationId } = req;
      const origin = req.get('Origin') || 'http://localhost:7777';
      const checkoutUrl = await collectPaymentStripeLOB(
        checksDetails,
        origin,
        userId,
        organizationId
      );
      return res.status(200).json(checkoutUrl);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/sendLetter',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { addressFrom, addressTo, checkId, mailClass, stripeSessionId } = req.body;
      const { userId, organizationId } = req;
      const ownerId = organizationId || userId;
      const ownerType = organizationId ? 'organization' : 'user';

      if (!stripeSessionId) {
        return res.status(400).json({
          error: 'stripeSessionId is required. Complete payment via POST /lob/acceptStripePayment first.',
        });
      }

      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (session.payment_status !== 'paid') {
        return res.status(402).json({ error: 'Payment has not been completed for this session' });
      }

      const sessionCheckIds = JSON.parse(session.metadata?.checkIds || '[]').map(String);
      if (!sessionCheckIds.includes(String(checkId))) {
        return res.status(403).json({ error: 'This check was not included in the payment session' });
      }

      const existing = await getLobMailRecord({ stripeSessionId });
      if (existing) {
        return res.status(200).json({ success: true, alreadyProcessed: true, record: existing });
      }

      const check = await checksCollection
        .findOne({ _id: checkId, ownerId })
        .populate('payeeId', 'name')
        .populate('bankId', 'bankName')
        .lean();
      if (!check) {
        return res.status(403).json({ error: 'Check not found or access denied' });
      }

      const rateInfo = (await getLOBRates()).find((r) => r.mailClass === mailClass);
      const chargeAmount = rateInfo ? rateInfo.price : 1.59;

      const lobResponse = await createLOBLetter({
        addressFrom,
        addressTo,
        checkId,
        userId,
        mailClass,
        checkData: {
          checkNumber: check.checkNumber,
          amount: check.amount,
          issuedDate: check.issuedDate,
          payeeName: check.payeeId?.name || '',
          bankName: check.bankId?.bankName || '',
          memo: check.memo || '',
        },
      });

      const record = await createLobMailRecord({
        lobId: lobResponse.id,
        checkId,
        ownerId,
        ownerType,
        mailClass,
        chargeAmount,
        status: 'Submitted',
        lobResponse,
        stripeSessionId,
      });

      await mailedChecksCollection.findOneAndUpdate(
        { checkId },
        { $set: { status: 'Submitted' } },
        { upsert: false }
      );

      return res.status(201).json({ success: true, record, lobResponse });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/letter/:lobId', async (req, res, next) => {
  try {
    const { lobId } = req.params;
    const { userId, organizationId } = req;
    const ownerId = organizationId || userId;

    const record = await getLobMailRecord({ lobId });

    const currentUser = await usersCollection.findById(userId);
    const isAdmin = currentUser?.role === 'superadmin';

    if (!record || (!isAdmin && record.ownerId.toString() !== String(ownerId))) {
      return res.status(403).json({ error: 'Letter not found or access denied' });
    }

    const letter = await getLOBLetterById(lobId);
    return res.status(200).json(letter);
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/letter/:lobId',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { lobId } = req.params;
      const { userId, organizationId } = req;
      const ownerId = organizationId || userId;

      const record = await getLobMailRecord({ lobId });

      const currentUser = await usersCollection.findById(userId);
      const isAdmin = currentUser?.role === 'superadmin';

      if (!record || (!isAdmin && record.ownerId.toString() !== String(ownerId))) {
        return res.status(403).json({ error: 'Letter not found or access denied' });
      }

      const result = await cancelLOBLetter(lobId);

      await updateLobMailRecord(
        { lobId },
        { $set: { status: 'Canceled', canceledAt: new Date() } }
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/records', async (req, res, next) => {
  try {
    const { userId, organizationId } = req;
    const { page = 1, pageSize = 20, status } = req.query;
    const ownerId = organizationId || userId;
    const filter = { ownerId };
    if (status) filter.status = status;

    const result = await getLobMailRecords(filter, {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/finalizePayment',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      const { userId, organizationId } = req;
      const ownerId = organizationId || userId;
      const ownerType = organizationId ? 'organization' : 'user';

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const existingRecords = await getLobMailRecords({ stripeSessionId: sessionId, ownerId }, { page: 1, pageSize: 1 });
      if (existingRecords?.data?.length > 0) {
        return res.status(200).json({ success: true, alreadyProcessed: true, records: existingRecords.data });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      const checkIds = JSON.parse(session.metadata.checkIds || '[]');
      const mailClasses = JSON.parse(session.metadata.mailClasses || '[]');

      const DEFAULT_ADDRESS_FROM = {
        name: 'Synccos',
        companyName: 'Synccos',
        addressLine1: '1021 State Route 32',
        city: 'Highland Mills',
        state: 'NY',
        zipCode: '10930',
        country: 'US',
      };

      const lobRates = await getLOBRates();
      const records = [];

      for (let i = 0; i < checkIds.length; i++) {
        const checkId = checkIds[i];
        const mailClass = mailClasses[i] || 'first_class';

        const check = await checksCollection
          .findOne({ _id: checkId, ownerId })
          .populate('payeeId', 'name address')
          .populate('bankId', 'bankName')
          .lean();
        if (!check) {
          console.warn(`LOB finalize: checkId ${checkId} not found or not owned by ${ownerId}`);
          continue;
        }

        const mailedRecord = await mailedChecksCollection
          .findOne({ checkId, ownerId })
          .sort({ requestedAt: -1 })
          .lean();
        const customAddr = mailedRecord?.customAddress;

        const payeeAddr = check.payeeId?.address;
        if (!customAddr && !payeeAddr) continue;

        const addressTo = customAddr
          ? {
              name: customAddr.name || check.payeeId?.name || '',
              addressLine1: customAddr.addressLine1,
              addressLine2: customAddr.addressLine2 || '',
              city: customAddr.city,
              state: customAddr.state,
              zipCode: customAddr.zip || customAddr.zipCode || '',
              country: customAddr.country || 'US',
            }
          : {
              name: check.payeeId.name,
              addressLine1: payeeAddr.addressLine1,
              addressLine2: payeeAddr.addressLine2 || '',
              city: payeeAddr.city,
              state: payeeAddr.state,
              zipCode: payeeAddr.zipCode,
              country: payeeAddr.country || 'US',
            };

        const rateInfo = lobRates.find((r) => r.mailClass === mailClass);
        const chargeAmount = rateInfo ? rateInfo.price : 1.59;

        let lobResponse;
        let lobError = null;
        try {
          lobResponse = await createLOBLetter({
            addressFrom: DEFAULT_ADDRESS_FROM,
            addressTo,
            checkId,
            userId,
            mailClass,
            checkData: {
              checkNumber: check.checkNumber,
              amount: check.amount,
              issuedDate: check.issuedDate,
              payeeName: check.payeeId?.name || '',
              bankName: check.bankId?.bankName || '',
              memo: check.memo || '',
            },
          });
        } catch (letterErr) {
          console.error(`LOB finalize: letter creation failed for checkId ${checkId}: ${letterErr.message}`);
          lobError = letterErr.message || 'Letter creation failed';
        }

        let record;
        if (lobError) {
          record = await createLobMailRecord({
            checkId,
            ownerId,
            ownerType,
            mailClass,
            chargeAmount: 0,
            status: 'Error',
            note: `Letter creation failed after payment: ${lobError}`,
            stripeSessionId: sessionId,
          });
          await mailedChecksCollection.findOneAndUpdate(
            { checkId },
            { $set: { status: 'Error' } },
            { upsert: false }
          );
        } else {
          record = await createLobMailRecord({
            lobId: lobResponse.id,
            checkId,
            ownerId,
            ownerType,
            mailClass,
            chargeAmount,
            status: 'Submitted',
            lobResponse,
            stripeSessionId: sessionId,
          });
          await mailedChecksCollection.findOneAndUpdate(
            { checkId },
            { $set: { status: 'Submitted' } },
            { upsert: false }
          );
        }

        records.push(record);
      }

      return res.status(201).json({ success: true, records });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/webhook/register', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { webhookUrl } = req.body;
    const result = await createLOBWebhook(webhookUrl);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/webhookEvents', async (req, res, next) => {
  try {
    if (!await verifyLOBWebhookSignature(req)) {
      console.warn('LOB webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    const lobObject = event?.body || {};

    const lobId = lobObject.id;
    const lobStatus = lobObject.status || '';
    const trackingNumber = lobObject.tracking_number || lobObject.certified_tracking_number || null;
    const expectedDeliveryDate = lobObject.expected_delivery_date ? new Date(lobObject.expected_delivery_date) : null;

    if (lobId) {
      const checkStatus = mapLOBStatusToCheckStatus(lobStatus);
      const updateData = { status: checkStatus };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (expectedDeliveryDate) updateData.expectedDeliveryDate = expectedDeliveryDate;
      if (checkStatus === 'Mailed') updateData.mailedAt = new Date();
      if (checkStatus === 'Canceled') updateData.canceledAt = new Date();

      await updateLobMailRecord({ lobId }, { $set: updateData });

      const lobRecord = await getLobMailRecord({ lobId });
      if (lobRecord) {
        await mailedChecksCollection.findOneAndUpdate(
          { checkId: lobRecord.checkId },
          { $set: { status: checkStatus } },
          { upsert: false }
        );

        try {
          const { email: userEmail, name: userName } = await resolveShipmentRecipient(
            lobRecord.ownerType,
            lobRecord.ownerId
          );
          if (userEmail) {
            const check = lobRecord.checkId ? await checksCollection.findOne({ _id: lobRecord.checkId }) : null;
            await sendShippingStatusUpdateEmail({
              toEmail: userEmail,
              recipientName: userName,
              provider: 'lob',
              status: checkStatus,
              trackingNumber: trackingNumber || lobRecord.trackingNumber,
              serviceName: lobRecord.mailClass ? lobRecord.mailClass.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null,
              checkNumber: check?.checkNumber,
            });
          }
        } catch (emailErr) {
          console.error('LOB status email error:', emailErr);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('LOB webhook error:', err);
    return res.status(200).json({ received: true });
  }
});

export default router;
