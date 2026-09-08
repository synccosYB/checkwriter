import express from 'express';
import config from 'config';
import crypto from 'crypto';
import { QuickbooksService } from '../services/quickbooks.services';
import demoRestrictionMiddleware from '../middlewares/demoRestriction.middleware.js';
import { OwnerType } from '../enums/user.enum';
import {
  banksCollection,
  payeesCollection,
  quickBooksAccountDetailsCollection,
  quickbooksmappingsCollection,
} from '../models/dbCollections';
import { QuickbooksMappingService } from '../services/quickbooksMapping.service';
import { QUICKBOOKS_ENTITY_TYPE } from '../enums/quickboos.enum';

const router = express.Router();

interface QuickbooksMappingFilter {
  ownerType: string;
  ownerId: string;
  entityType: string;
  quickbooksName?: { $regex: string; $options: string };
  internalId?: string | null | { $ne: null };
}

interface QuickbooksMappingRow {
  _id: string;
  internalId?: string | null;
  [key: string]: unknown;
}

interface DetailRow {
  _id: string;
  [key: string]: unknown;
}

router.get('/auth', demoRestrictionMiddleware, (req, res) => {
  res.redirect(QuickbooksService.getAuthorizeUri());
});

router.get('/oauth/callback', demoRestrictionMiddleware, async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const result = await QuickbooksService.createOrUpdateToken(
      fullUrl,
      req.userId,
      req.organizationId
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.get('/user/:ownerType', async (req, res) => {
  try {
    const ownerType = req.params.ownerType;
    const result = await QuickbooksService.getUserQuickbooksDetail(
      req.organizationId ? req.organizationId : req.userId,
      ownerType as OwnerType
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.delete('/user/:ownerType', async (req, res) => {
  try {
    const ownerType = req.params.ownerType;
    const result = await QuickbooksService.removeUserQuickbooksDetail(
      req.organizationId ? req.organizationId : req.userId,
      ownerType as OwnerType
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.put('/user/updateMapping/:ownerType', demoRestrictionMiddleware, async (req, res) => {
  try {
    const ownerType = req.params.ownerType;
    const ownerId = req.organizationId || req.userId;

    const { entityType, quickbooksId, internalId } = req.body;

    if (entityType === QUICKBOOKS_ENTITY_TYPE.PAYEE) {
      const record = await payeesCollection.findOne({
        ownerId,
        ownerType,
        _id: internalId,
      });
      if (!record) {
        res.status(404).send({ error: 'Payee record not found' });
        return;
      }
    } else {
      const record = await banksCollection.findOne({
        ownerId,
        ownerType,
        _id: internalId,
      });
      if (!record) {
        res.status(404).send({ error: 'Bank record not found' });
        return;
      }
    }

    const response = await QuickbooksMappingService.setQuickbookProfileMapping(
      ownerType,
      ownerId,
      entityType,
      quickbooksId,
      internalId
    );
    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err });
  }
});

router.get('/user/getQuickbooksBanks/:ownerType', async (req, res) => {
  try {
    const ownerType = req.params.ownerType;
    const ownerId = req.organizationId || req.userId;
    const { page = 1, limit = 10, search = '', mappedProfile } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const lim = parseInt(limit as string);

    const baseFilter: QuickbooksMappingFilter = {
      ownerType,
      ownerId,
      entityType: QUICKBOOKS_ENTITY_TYPE.BANK,
    };

    if (search) {
      baseFilter.quickbooksName = { $regex: search as string, $options: 'i' };
    }
    if (mappedProfile === 'true') {
      baseFilter.internalId = { $ne: null };
    } else if (mappedProfile === 'false') {
      baseFilter.internalId = null;
    }

    const total = await quickbooksmappingsCollection.countDocuments(baseFilter);

    const rawBanks = (await quickbooksmappingsCollection
      .find(baseFilter)
      .skip(skip)
      .limit(lim)
      .lean()) as QuickbooksMappingRow[];

    // Batch lookup of bank details: one query for all referenced internalIds
    // instead of one round-trip per row.
    const internalIds = rawBanks
      .map((b) => b.internalId)
      .filter((id): id is string => Boolean(id));
    const detailRows = internalIds.length
      ? ((await banksCollection
          .find({
            ownerId,
            ownerType,
            _id: { $in: internalIds },
          })
          .lean()) as DetailRow[])
      : [];
    const detailById = new Map<string, DetailRow>();
    for (const d of detailRows) {
      detailById.set(String(d._id), d);
    }
    const banks = rawBanks.map((bank) => ({
      ...bank,
      detail: bank.internalId
        ? (detailById.get(String(bank.internalId)) ?? null)
        : null,
    }));

    res.json({
      data: banks,
      meta: {
        total,
        page: parseInt(page as string),
        limit: lim,
        totalPages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.get('/user/getQuickbooksPayees/:ownerType', async (req, res) => {
  try {
    const ownerType = req.params.ownerType;
    const ownerId = req.organizationId || req.userId;
    const { page = 1, limit = 10, search = '', mappedProfile } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const lim = parseInt(limit as string);

    const baseFilter: QuickbooksMappingFilter = {
      ownerType,
      ownerId,
      entityType: QUICKBOOKS_ENTITY_TYPE.PAYEE,
    };

    if (search) {
      baseFilter.quickbooksName = { $regex: search as string, $options: 'i' };
    }
    if (mappedProfile === 'true') {
      baseFilter.internalId = { $ne: null };
    } else if (mappedProfile === 'false') {
      baseFilter.internalId = null;
    }

    const total = await quickbooksmappingsCollection.countDocuments(baseFilter);

    const rawPayees = (await quickbooksmappingsCollection
      .find(baseFilter)
      .skip(skip)
      .limit(lim)
      .lean()) as QuickbooksMappingRow[];

    // Batch lookup of payee details: one query for all referenced internalIds
    // instead of one round-trip per row.
    const payeeInternalIds = rawPayees
      .map((p) => p.internalId)
      .filter((id): id is string => Boolean(id));
    const payeeDetailRows = payeeInternalIds.length
      ? ((await payeesCollection
          .find({
            ownerId,
            ownerType,
            _id: { $in: payeeInternalIds },
          })
          .lean()) as DetailRow[])
      : [];
    const payeeDetailById = new Map<string, DetailRow>();
    for (const d of payeeDetailRows) {
      payeeDetailById.set(String(d._id), d);
    }
    const payees = rawPayees.map((payee) => ({
      ...payee,
      detail: payee.internalId
        ? (payeeDetailById.get(String(payee.internalId)) ?? null)
        : null,
    }));

    res.json({
      data: payees,
      meta: {
        total,
        page: parseInt(page as string),
        limit: lim,
        totalPages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res): Promise<void> => {
    try {
      const payload = req.body;

      const latestEvents = QuickbooksService.getLatestQboEvents(payload);

      await QuickbooksService.insertLatestEvents(latestEvents);

      res.status(200).json(latestEvents);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  }
);

export default router;
