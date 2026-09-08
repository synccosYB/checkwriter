import express from 'express';
import crypto from 'crypto';
import {
  getUPSFedExRates,
  createLabelPlatformAccount,
  createLabelUserAccount,
  collectPaymentStripeCarrier,
  getCarrierTrackingStatus,
  mapCarrierStatusToCheckStatus,
} from '../services/carrierShippo.service.js';
import {
  createCarrierShipment,
  updateCarrierShipment,
  getCarrierShipment,
  getCarrierShipments,
} from '../models/carrierShipment.model.js';
import subscriptionMiddleware from '../middlewares/subscription.middleware.js';
import { mailedChecksCollection, checksCollection, BILLING_MODES } from '../models/dbCollections.js';
import { SHIPPING_PLATFORM_MARGIN } from '../constants/shipping.constants.js';
import { sendShippingStatusUpdateEmail } from '../services/email.service.js';
import { resolveShipmentRecipient } from '../utils/shipmentRecipient.util.js';
import { stripe } from '../services/stripe.service.js';

const SHIPPO_WEBHOOK_SECRET = process.env.SHIPPO_WEBHOOK_SECRET || '';

/**
 * Verifies the Shippo webhook signature using HMAC-SHA256.
 * Fail-closed: rejects all requests when SHIPPO_WEBHOOK_SECRET is not configured.
 * Required env var: SHIPPO_WEBHOOK_SECRET (set in Shippo dashboard → Webhooks → signing secret).
 */
const verifyShippoWebhookSignature = (req) => {
  if (!SHIPPO_WEBHOOK_SECRET) {
    console.warn('SHIPPO_WEBHOOK_SECRET is not set. All Shippo webhook events are rejected. Configure SHIPPO_WEBHOOK_SECRET to enable tracking status updates.');
    return false;
  }
  const rawBody = req.rawBody;
  if (!rawBody) return false;
  const signature = req.headers['x-shippo-signature'] || req.headers['shippo-token'];
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', SHIPPO_WEBHOOK_SECRET).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(hmac, 'hex'));
  } catch {
    return false;
  }
};

const router = express.Router();

router.post(
  '/rates',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { addressFrom, addressTo, parcelDimensions } = req.body;
      if (!addressFrom || !addressTo) {
        return res.status(400).json({ error: 'addressFrom and addressTo are required' });
      }
      const rates = await getUPSFedExRates(addressFrom, addressTo, parcelDimensions);
      return res.status(200).json(rates);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/acceptStripePayment',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { checksDetails } = req.body;
      const { userId, organizationId } = req;
      const origin = req.get('Origin') || 'http://localhost:7777';
      const checkoutUrl = await collectPaymentStripeCarrier(
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
  '/createLabel',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const {
        checkId,
        addressFrom,
        addressTo,
        carrier,
        serviceLevel,
        serviceLevelName,
        billingMode,
        userCarrierAccountNumber,
        parcelDimensions,
        chargeAmount,
        carrierRate,
      } = req.body;
      let rateId = req.body.rateId;
      let shipmentId = req.body.shipmentId;

      const { userId, organizationId } = req;
      const ownerId = organizationId || userId;
      const ownerType = organizationId ? 'organization' : 'user';

      if (billingMode === BILLING_MODES.PLATFORM) {
        return res.status(400).json({
          error: 'Platform billing requires payment via Stripe checkout. Use POST /carrier-shipment/acceptStripePayment then POST /carrier-shipment/finalizePayment.',
        });
      }

      const check = await checksCollection.findOne({ _id: checkId, ownerId });
      if (!check) {
        return res.status(403).json({ error: 'Check not found or access denied' });
      }

      let resolvedAddressFrom = addressFrom;
      let resolvedAddressTo = addressTo;

      if (!resolvedAddressTo && check.payeeId) {
        const populated = await checksCollection.findById(checkId).populate('payeeId', 'name address').lean();
        if (populated?.payeeId?.address) {
          resolvedAddressTo = {
            name: populated.payeeId.name,
            addressLine1: populated.payeeId.address.addressLine1,
            addressLine2: populated.payeeId.address.addressLine2 || '',
            city: populated.payeeId.address.city,
            state: populated.payeeId.address.state,
            zipCode: populated.payeeId.address.zipCode,
            country: populated.payeeId.address.country || 'US',
          };
        }
      }

      if (!resolvedAddressFrom) {
        resolvedAddressFrom = {
          name: 'Synccos',
          companyName: 'Synccos',
          addressLine1: '1021 State Route 32',
          city: 'Highland Mills',
          state: 'NY',
          zipCode: '10930',
          country: 'US',
        };
      }

      let transaction;
      let finalCarrierRate = carrierRate || 0;
      let finalChargeAmount = chargeAmount || 0;
      let marginAmount = 0;

      if (billingMode === BILLING_MODES.USER_ACCOUNT) {
        if (!userCarrierAccountNumber) {
          return res.status(400).json({ error: 'Carrier account number is required for user account billing' });
        }
        const result = await createLabelUserAccount({
          addressFrom: resolvedAddressFrom,
          addressTo: resolvedAddressTo,
          parcelDimensions,
          serviceLevel,
          carrier,
          carrierAccountNumber: userCarrierAccountNumber,
          userId,
          organizationId,
          checkId,
        });
        transaction = result.transaction;
        shipmentId = result.shipmentId || shipmentId;
        rateId = result.rateId || rateId;
        finalChargeAmount = 0;
      } else {
        return res.status(400).json({ error: 'Invalid billing mode' });
      }

      const shipmentRecord = await createCarrierShipment({
        checkId,
        ownerId,
        ownerType,
        carrier,
        serviceLevel,
        serviceLevelName,
        billingMode,
        userCarrierAccountNumber: billingMode === BILLING_MODES.USER_ACCOUNT ? userCarrierAccountNumber : undefined,
        shippoShipmentId: shipmentId,
        shippoRateId: rateId,
        shippoTransactionId: transaction.object_id,
        trackingNumber: transaction.tracking_number,
        trackingUrl: transaction.tracking_url_provider,
        labelUrl: transaction.label_url,
        status: transaction.status === 'SUCCESS' ? 'Processing' : 'Submitted',
        chargeAmount: finalChargeAmount,
        carrierRate: finalCarrierRate,
        marginAmount,
      });

      await mailedChecksCollection.findOneAndUpdate(
        { checkId },
        { $set: { status: transaction.status === 'SUCCESS' ? 'Processing' : 'Submitted' } },
        { upsert: false }
      );

      return res.status(201).json({
        success: true,
        shipmentRecord,
        transaction,
      });
    } catch (err) {
      next(err);
    }
  }
);

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

      const existingRecords = await getCarrierShipments({ stripeSessionId: sessionId, ownerId }, { page: 1, pageSize: 1 });
      if (existingRecords?.data?.length > 0) {
        return res.status(200).json({ success: true, alreadyProcessed: true, records: existingRecords.data });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      const checkIds = JSON.parse(session.metadata.checkIds || '[]');
      const rateIds = JSON.parse(session.metadata.rateIds || '[]');
      const carriers = JSON.parse(session.metadata.carriers || '[]');
      const serviceLevels = JSON.parse(session.metadata.serviceLevels || '[]');

      const records = [];

      for (let i = 0; i < checkIds.length; i++) {
        const checkId = checkIds[i];
        const rateId = rateIds[i];
        const carrier = carriers[i];
        const serviceLevel = serviceLevels[i];

        if (!rateId) continue;

        const checkOwned = await checksCollection.findOne({ _id: checkId, ownerId });
        if (!checkOwned) {
          console.warn(`Carrier finalize: checkId ${checkId} not found or not owned by ${ownerId}`);
          continue;
        }

        let transaction;
        let labelError = null;
        try {
          transaction = await createLabelPlatformAccount({
            rateId,
            userId,
            organizationId,
            checkId,
          });
        } catch (labelErr) {
          console.error(`Carrier finalize: label purchase failed for checkId ${checkId} rateId ${rateId}: ${labelErr.message}`);
          labelError = labelErr.message || 'Label purchase failed';
        }

        let shipmentRecord;
        if (labelError) {
          shipmentRecord = await createCarrierShipment({
            checkId,
            ownerId,
            ownerType,
            carrier,
            serviceLevel,
            billingMode: BILLING_MODES.PLATFORM,
            shippoRateId: rateId,
            status: 'Error',
            note: `Label purchase failed after payment: ${labelError}`,
            chargeAmount: 0,
            carrierRate: 0,
            marginAmount: 0,
            stripeSessionId: sessionId,
          });
          await mailedChecksCollection.findOneAndUpdate(
            { checkId },
            { $set: { status: 'Error' } },
            { upsert: false }
          );
        } else {
          const finalCarrierRate = parseFloat(transaction.rate_amount || 0);
          const marginAmount = parseFloat((finalCarrierRate * SHIPPING_PLATFORM_MARGIN).toFixed(2));
          const finalChargeAmount = parseFloat((finalCarrierRate + marginAmount).toFixed(2));

          shipmentRecord = await createCarrierShipment({
            checkId,
            ownerId,
            ownerType,
            carrier,
            serviceLevel,
            billingMode: BILLING_MODES.PLATFORM,
            shippoRateId: rateId,
            shippoTransactionId: transaction.object_id,
            trackingNumber: transaction.tracking_number,
            trackingUrl: transaction.tracking_url_provider,
            labelUrl: transaction.label_url,
            status: transaction.status === 'SUCCESS' ? 'Processing' : 'Submitted',
            chargeAmount: finalChargeAmount,
            carrierRate: finalCarrierRate,
            marginAmount,
            stripeSessionId: sessionId,
          });

          await mailedChecksCollection.findOneAndUpdate(
            { checkId },
            { $set: { status: 'Processing' } },
            { upsert: false }
          );
        }

        records.push(shipmentRecord);
      }

      return res.status(201).json({ success: true, records });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/records', async (req, res, next) => {
  try {
    const { userId, organizationId } = req;
    const { page = 1, pageSize = 20, status, carrier } = req.query;
    const ownerId = organizationId || userId;
    const filter = { ownerId };
    if (status) filter.status = status;
    if (carrier) filter.carrier = carrier;

    const result = await getCarrierShipments(filter, {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/tracking/:shipmentId', async (req, res, next) => {
  try {
    const { shipmentId } = req.params;
    const { userId, organizationId } = req;
    const ownerId = organizationId || userId;

    const shipment = await getCarrierShipment({ _id: shipmentId, ownerId });
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found or access denied' });
    }

    if (!shipment.trackingNumber || !shipment.carrier) {
      return res.status(200).json({ shipment, tracking: null });
    }

    const tracking = await getCarrierTrackingStatus(
      shipment.carrier,
      shipment.trackingNumber
    );

    const newStatus = mapCarrierStatusToCheckStatus(
      tracking?.tracking_status?.status
    );

    if (newStatus !== shipment.status) {
      await updateCarrierShipment(
        { _id: shipmentId },
        { $set: { status: newStatus, lastTrackedAt: new Date() } }
      );

      await mailedChecksCollection.findOneAndUpdate(
        { checkId: shipment.checkId },
        { $set: { status: newStatus } },
        { upsert: false }
      );
    }

    return res.status(200).json({ shipment, tracking });
  } catch (err) {
    next(err);
  }
});

router.post('/webhookEvents', async (req, res, next) => {
  try {
    if (!verifyShippoWebhookSignature(req)) {
      console.warn('Shippo webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    const trackingData = event?.data || {};
    const trackingNumber = trackingData.tracking_number;
    const trackingStatus = trackingData.tracking_status?.status;

    if (trackingNumber && trackingStatus) {
      const newStatus = mapCarrierStatusToCheckStatus(trackingStatus);
      const shipment = await getCarrierShipment({ trackingNumber });

      if (shipment) {
        const updateData = { status: newStatus, lastTrackedAt: new Date() };
        if (newStatus === 'Mailed') updateData.mailedAt = new Date();
        if (newStatus === 'Canceled') updateData.canceledAt = new Date();

        await updateCarrierShipment({ trackingNumber }, { $set: updateData });

        await mailedChecksCollection.findOneAndUpdate(
          { checkId: shipment.checkId },
          { $set: { status: newStatus } },
          { upsert: false }
        );

        try {
          const { email: userEmail, name: userName } = await resolveShipmentRecipient(
            shipment.ownerType,
            shipment.ownerId
          );
          if (userEmail) {
            const check = shipment.checkId ? await checksCollection.findOne({ _id: shipment.checkId }) : null;
            await sendShippingStatusUpdateEmail({
              toEmail: userEmail,
              recipientName: userName,
              provider: shipment.carrier,
              status: newStatus,
              trackingNumber: shipment.trackingNumber,
              serviceName: shipment.serviceLevelName || shipment.serviceLevel,
              checkNumber: check?.checkNumber,
            });
          }
        } catch (emailErr) {
          console.error('Carrier status email error:', emailErr);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Carrier webhook error:', err);
    return res.status(200).json({ received: true });
  }
});

export default router;
