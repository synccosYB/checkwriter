import express from 'express';
import {
  createNewParcelShippo,
  createNewShipmentShippo,
  createPickupShippo,
  createTransactionShippo,
  getAllAddressesShippo,
  getAllInvoicesShippo,
  getAllTransactionsShippo,
  getTrackingStatus,
  retrieveAddressShippo,
  retrieveShipmentShippo,
  retrieveTransactionShippo,
} from '../services/shippo.service.js';

import subscriptionMiddleware from '../middlewares/subscription.middleware.js';

const router = express.Router();


router.get('/getTransaction/:transactionId', async (req, res, next) => {
  try {
    const transactionId = req.params.transactionId;
    const transaction = await retrieveTransactionShippo(transactionId);
    return res.status(200).json(transaction);
  } catch (err) {
    next(err);
  }
});

router.post('/createParcel', subscriptionMiddleware, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
    };
    const createdParcel = await createNewParcelShippo(payload);
    return res.status(200).json(createdParcel);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/getAllRates/:shipmentId',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const shipmentId = req.params.shipmentId;
      const shipment = await retrieveShipmentShippo(shipmentId);
      return res.status(200).json(shipment.rates);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/getTrackingDetails', async (req, res, next) => {
  try {
    const { trackingNumber, carrier } = req.body;
    const trackingDetails = await getTrackingStatus(carrier, trackingNumber);
    return res.status(200).json(trackingDetails);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/schedulePickup/:transactionId',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { transactionId } = req.params.transactionId;
      const { userId, organizationId } = req;
      const createdPickup = await createPickupShippo(
        transactionId,
        userId,
        organizationId
      );
      return res.status(200).json(createdPickup);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/getAllInvoices', async (req, res, next) => {
  try {
    const invoices = await getAllInvoicesShippo();
    return res.status(200).json(invoices);
  } catch (err) {
    next(err);
  }
});

router.get('/getAllTransactions', async (req, res, next) => {
  try {
    const { userId, organizationId } = req;
    const { results, page } = req.body;
    const transactions = await getAllTransactionsShippo(
      userId,
      organizationId,
      results,
      page
    );
    return res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
});

export default router;
