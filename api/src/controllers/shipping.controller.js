import express from 'express';
import { getLOBRates, cancelLOBLetter } from '../services/lob.service.js';
import { checksCollection, mailedChecksCollection } from '../models/dbCollections.js';
import subscriptionMiddleware from '../middlewares/subscription.middleware.js';
import adminPrivilageMiddleware from '../middlewares/adminPrivilage.middleware.js';
import { getLobMailRecords, getLobMailRecord, updateLobMailRecord } from '../models/lob.model.js';
import {
  getCarrierShipments,
  getCarrierShipment,
  updateCarrierShipment,
} from '../models/carrierShipment.model.js';

const router = express.Router();

router.post('/rates', subscriptionMiddleware, async (req, res, next) => {
  try {
    const { checkId, addressFrom, addressTo } = req.body;
    const { userId, organizationId } = req;
    const ownerId = organizationId || userId;

    let resolvedAddressFrom = addressFrom;
    let resolvedAddressTo = addressTo;

    if (checkId && (!addressFrom || !addressTo)) {
      const check = await checksCollection
        .findOne({ _id: checkId, ownerId })
        .populate('payeeId', 'name address')
        .lean();

      if (!check) {
        return res.status(404).json({ error: 'Check not found or access denied' });
      }

      if (!resolvedAddressTo && check.payeeId?.address) {
        resolvedAddressTo = {
          name: check.payeeId.name,
          addressLine1: check.payeeId.address.addressLine1,
          addressLine2: check.payeeId.address.addressLine2,
          city: check.payeeId.address.city,
          state: check.payeeId.address.state,
          zipCode: check.payeeId.address.zipCode,
          country: check.payeeId.address.country || 'US',
        };
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
    }

    const providerErrors = {};
    let lob = [];
    try {
      lob = await getLOBRates();
    } catch (err) {
      console.warn('LOB rates fetch failed:', err?.message);
      providerErrors.lob = err?.message || 'LOB mail delivery is currently unavailable.';
    }

    const grouped = {
      lob: lob.map((r) => ({ ...r, provider: 'lob' })),
    };

    return res.status(200).json({
      checkId,
      rates: grouped,
      allRates: [...lob],
      ...(Object.keys(providerErrors).length > 0 && { providerErrors }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, provider } = req.query;
    const parsedPage = parseInt(page);
    const parsedPageSize = parseInt(pageSize);

    let lobRecords = { data: [], total: 0 };
    let carrierRecords = { data: [], total: 0 };

    if (!provider || provider === 'lob') {
      const lobFilter = {};
      if (status) lobFilter.status = status;
      lobRecords = await getLobMailRecords(lobFilter, {
        page: parsedPage,
        pageSize: parsedPageSize,
      });
    }

    if (!provider || provider === 'ups' || provider === 'fedex' || provider === 'carrier') {
      const carrierFilter = {};
      if (status) carrierFilter.status = status;
      if (provider === 'ups' || provider === 'fedex') carrierFilter.carrier = provider;
      carrierRecords = await getCarrierShipments(carrierFilter, {
        page: parsedPage,
        pageSize: parsedPageSize,
      });
    }

    return res.status(200).json({
      lob: lobRecords,
      carriers: carrierRecords,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/lob/:recordId', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const record = await getLobMailRecord({ _id: recordId });
    if (!record) {
      return res.status(404).json({ error: 'LOB mail record not found' });
    }
    if (record.status === 'Canceled') {
      return res.status(200).json({ success: true, alreadyCanceled: true });
    }
    try {
      await cancelLOBLetter(record.lobId);
    } catch (lobErr) {
      console.warn(`LOB cancel API failed for ${record.lobId}: ${lobErr.message} — updating DB status only`);
    }
    const updated = await updateLobMailRecord(
      { _id: recordId },
      { $set: { status: 'Canceled', canceledAt: new Date() } }
    );
    await mailedChecksCollection.findOneAndUpdate(
      { checkId: record.checkId },
      { $set: { status: 'Canceled' } },
      { upsert: false }
    );
    return res.status(200).json({ success: true, record: updated });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/lob/:recordId', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { status, note } = req.body;
    const ALLOWED_STATUSES = ['Submitted', 'Processing', 'Mailed', 'Canceled', 'Error'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }
    const updateData = { status };
    if (status === 'Canceled') updateData.canceledAt = new Date();
    if (note) updateData.adminNote = note;
    const updated = await updateLobMailRecord({ _id: recordId }, { $set: updateData });
    if (!updated) return res.status(404).json({ error: 'LOB mail record not found' });
    await mailedChecksCollection.findOneAndUpdate(
      { checkId: updated.checkId },
      { $set: { status } },
      { upsert: false }
    );
    return res.status(200).json({ success: true, record: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/carrier/:recordId', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const record = await getCarrierShipment({ _id: recordId });
    if (!record) {
      return res.status(404).json({ error: 'Carrier shipment record not found' });
    }
    if (record.status === 'Canceled') {
      return res.status(200).json({ success: true, alreadyCanceled: true });
    }
    const updated = await updateCarrierShipment(
      { _id: recordId },
      { $set: { status: 'Canceled', canceledAt: new Date() } }
    );
    await mailedChecksCollection.findOneAndUpdate(
      { checkId: record.checkId },
      { $set: { status: 'Canceled' } },
      { upsert: false }
    );
    return res.status(200).json({ success: true, record: updated });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/carrier/:recordId', adminPrivilageMiddleware, async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { status, note } = req.body;
    const ALLOWED_STATUSES = ['Submitted', 'Processing', 'Mailed', 'Canceled', 'Error'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }
    const updateData = { status };
    if (status === 'Canceled') updateData.canceledAt = new Date();
    if (note) updateData.adminNote = note;
    const updated = await updateCarrierShipment({ _id: recordId }, { $set: updateData });
    if (!updated) return res.status(404).json({ error: 'Carrier shipment record not found' });
    await mailedChecksCollection.findOneAndUpdate(
      { checkId: updated.checkId },
      { $set: { status } },
      { upsert: false }
    );
    return res.status(200).json({ success: true, record: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
