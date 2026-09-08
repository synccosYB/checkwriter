import express from 'express';
import {
  banksCollection,
  checksCollection,
  transactionsCollection,
} from '../models/dbCollections.js';
import trialMiddleware from '../middlewares/trial.middleware.js';
import { AttachmentService } from '../services/attachments.service.js';
import { EntityType } from '../models/attachment.model.js';
import { parseListSort, buildMongoSort } from '../utils/listSort.util.js';
import {
  TRANSACTIONS_JOINED_SORTABLE_FIELDS,
  getSortedTransactionIdsPage,
} from '../services/transactions.service.js';

const router = express.Router();

// Allow-list of column-ids that callers may sort on, mapped to the underlying
// Mongo fields. Joined fields (e.g. payee name) are intentionally omitted to
// keep the query indexable. `withdrawals` and `deposits` both map to `amount`
// because amount carries the sign that distinguishes the two.
export const TRANSACTIONS_SORTABLE_FIELDS = {
  issuedDate: ['issueDate'],
  checkNumber: ['checkNumber'],
  description: ['description'],
  category: ['category'],
  status: ['status'],
  withdrawals: ['amount'],
  deposits: ['amount'],
  balance: ['balance'],
};

/**
 * @swagger
 * /checkregister_transactions/{ownerType}:
 *   get:
 *     summary: Get transactions for a user or organization
 *     description: Fetches transactions based on the owner type (user or organization), with optional pagination and bank filtering.
 *     tags:
 *       - Check Register
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether transactions belong to a user or an organization.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (optional).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of records per page (optional).
 *       - in: query
 *         name: bankId
 *         schema:
 *           type: string
 *         description: Filter transactions by bank ID (optional).
 *     responses:
 *       200:
 *         description: Transactions fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       ownerId:
 *                         type: string
 *                         example: "60d21b4967d0d8992e610c86"
 *                       ownerType:
 *                         type: string
 *                         example: "organization"
 *                       bankId:
 *                         type: string
 *                         example: "123456"
 *                       payee:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                 totalCount:
 *                   type: integer
 *                   example: 100
 *       400:
 *         description: Invalid pagination parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid page or pageSize values. Both must be positive numbers."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching transactions."
 */

router.get('/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { page, pageSize, bankId } = req.query;
    const ownerType = req.params.ownerType;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const filter = {
      ownerId,
      ownerType,
      bankId,
    };

    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 1000;

    if (pageNumber < 1 || pageSizeNumber < 1) {
      return res.status(400).send({
        error:
          'Invalid page or pageSize values. Both must be positive numbers.',
      });
    }

    const joinedSpec =
      typeof req.query.sortBy === 'string'
        ? TRANSACTIONS_JOINED_SORTABLE_FIELDS[req.query.sortBy]
        : null;
    const joinedSortOrder =
      req.query.sortOrder === 'asc'
        ? 'asc'
        : req.query.sortOrder === 'desc'
          ? 'desc'
          : null;

    const skipCount = page ? (pageNumber - 1) * pageSizeNumber : 0;
    const limitCount = page ? pageSizeNumber : 1000;

    let result;
    let totalCount;
    if (joinedSpec && joinedSortOrder) {
      // Sorting by a column that lives on a joined collection (e.g. payee
      // name): resolve the ordered _ids via SQL first, then load the full
      // rows through the regular populate pipeline so behaviour is identical
      // to the default path.
      const [orderedIds, count] = await Promise.all([
        getSortedTransactionIdsPage({
          filter,
          spec: joinedSpec,
          sortOrder: joinedSortOrder,
          skip: skipCount,
          limit: limitCount,
        }),
        transactionsCollection.countDocuments(filter),
      ]);
      totalCount = count;

      const pageRows =
        orderedIds.length === 0
          ? []
          : await transactionsCollection
              .find({ _id: { $in: orderedIds } })
              .populate('payeeId', 'name address email')
              .populate(
                'bankId',
                'bankName accountNumber bankRoutingNumber accountNickName'
              )
              .lean();

      const byId = new Map(
        pageRows.map((r) => [r._id?.toString?.() ?? r._id, r])
      );
      result = orderedIds
        .map((id) => byId.get(id?.toString?.() ?? id))
        .filter(Boolean);
    } else {
      const parsedSort = parseListSort(req.query, TRANSACTIONS_SORTABLE_FIELDS);
      const sortSpec = buildMongoSort(parsedSort, {
        issueDate: -1,
        createdAt: -1,
        _id: -1,
      });

      [result, totalCount] = await Promise.all([
        transactionsCollection
          .find(filter)
          .sort(sortSpec)
          .skip(skipCount)
          .limit(limitCount)
          .populate('payeeId', 'name address email')
          .populate(
            'bankId',
            'bankName accountNumber bankRoutingNumber accountNickName'
          )
          .lean(),
        transactionsCollection.countDocuments(filter),
      ]);
    }

    const finalResult = await Promise.all(
      result.map(async ({ payeeId, bankId, ...item }) => {
        const attachments = await AttachmentService.getAttachmentsByEntity({
          entityId: item.checkId || item._id,
          entityType: item.checkId ? EntityType.CHECK : EntityType.TRANSACTION,
          ownerId: item.ownerId,
          ownerType: item.ownerType,
        });
        return { ...item, payee: payeeId, bank: bankId, attachments };
      })
    );

    res.status(200).send({
      data: finalResult,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching transactions.' });
  }
});

/**
 * @swagger
 * /checkregister_transactions/{ownerType}:
 *   post:
 *     summary: Create a deposit transaction for a user or organization
 *     description: Adds a deposit transaction and updates the bank balance.
 *     tags:
 *       - Check Register
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the deposit belongs to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500.75
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-15"
 *               bankId:
 *                 type: string
 *                 example: "60d21b4967d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Deposit transaction added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     type:
 *                       type: string
 *                       example: "deposit"
 *                     ownerId:
 *                       type: string
 *                       example: "60d21b4967d0d8992e610c86"
 *                     ownerType:
 *                       type: string
 *                       example: "organization"
 *                     amount:
 *                       type: number
 *                       example: 500.75
 *                     issueDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-15"
 *                     bankId:
 *                       type: string
 *                       example: "60d21b4967d0d8992e610c86"
 *                     balance:
 *                       type: number
 *                       example: 1500.00
 *                 message:
 *                   type: string
 *                   example: "Deposit added"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while adding the deposit."
 */

router.post('/:ownerType', trialMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;

    const ownerType = req.params.ownerType;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    if (req.body.amount === 0) {
      throw new Error('Amount cannot be zero');
    }

    const newTransaction = new transactionsCollection({
      ...req.body,
      type: req.body.amount > 0 ? 'deposit' : 'transaction',
      ownerId,
      ownerType,
      balance: 0,
    });

    const result = await newTransaction.save();

    res.send({ data: result, message: 'Transaction saved successfully' });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.patch(
  '/:ownerType/:transactionId',
  trialMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerType = req.params.ownerType;
      const ownerId = ownerType === 'user' ? userId : organizationId;
      const { transactionId } = req.params;

      const existing = await transactionsCollection
        .findOne({ _id: transactionId, ownerId, ownerType }, 'checkId')
        .lean();

      if (!existing) {
        return res
          .status(404)
          .send({ error: 'Transaction not found for this owner.' });
      }

      const hasCheckLinked =
        existing.checkId !== undefined &&
        existing.checkId !== null &&
        String(existing.checkId) !== '';

      if (hasCheckLinked) {
        return res.status(409).send({
          error:
            'This transaction is linked to a check and cannot be modified.',
        });
      }

      const updateData = {};
      const body = req.body || {};
      if (body.amount !== undefined) updateData.amount = body.amount;
      if (body.issueDate !== undefined) updateData.issueDate = body.issueDate;
      if (body.payeeId !== undefined) updateData.payeeId = body.payeeId;
      if (body.bankId !== undefined) updateData.bankId = body.bankId;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status !== undefined) updateData.status = body.status;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).send({
          error: 'No valid fields provided to update.',
        });
      }

      if (updateData.amount !== undefined) {
        if (updateData.amount === 0) {
          return res.status(400).send({ error: 'Amount cannot be zero.' });
        }
        updateData.type = updateData.amount < 0 ? 'transaction' : 'deposit';
      }

      const updated = await transactionsCollection
        .findOneAndUpdate(
          {
            _id: transactionId,
            ownerId,
            ownerType,
          },
          { $set: updateData },
          { new: true, runValidators: true }
        )
        .populate('payeeId', 'name address email')
        .populate(
          'bankId',
          'bankName accountNumber bankRoutingNumber accountNickName'
        )
        .lean();

      if (!updated) {
        return res.status(404).send({
          error: 'Transaction not found.',
        });
      }

      const attachments = await AttachmentService.getAttachmentsByEntity({
        entityId: updated._id,
        entityType: EntityType.TRANSACTION,
        ownerId: updated.ownerId,
        ownerType: updated.ownerType,
      });

      const { payeeId, bankId, ...rest } = updated;
      const finalData = { ...rest, payee: payeeId, bank: bankId, attachments };

      return res
        .status(200)
        .send({ data: finalData, message: 'Transaction updated' });
    } catch (error) {
      console.error('Error updating transaction:', error);
      return res.status(500).send({
        error: 'An error occurred while updating the transaction.',
      });
    }
  }
);

router.put(
  '/:ownerType/:transactionId/status',
  trialMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerType = req.params.ownerType;
      const ownerId = ownerType === 'user' ? userId : organizationId;
      const { transactionId } = req.params;

      let { status } = req.body;
      if (!status) {
        return res.status(400).send({ error: 'Status is required.' });
      }

      const normalized = String(status).toLowerCase();
      const ALLOWED = new Set(['pending', 'cleared']);
      if (!ALLOWED.has(normalized)) {
        return res.status(400).send({
          error: `Invalid status. Allowed: ${Array.from(ALLOWED).join(', ')}`,
        });
      }

      const transaction = await transactionsCollection.findOne({
        _id: transactionId,
        ownerId,
        ownerType,
      });

      if (!transaction) {
        return res.status(404).send({ error: 'Transaction not found.' });
      }

      if (normalized === 'cleared' && transaction.checkId) {
        const checkUpdated = await checksCollection.findOneAndUpdate(
          { _id: transaction.checkId, ownerId, ownerType },
          { $set: { status: 'CLEARED' } },
          { new: true }
        );

        if (!checkUpdated) {
          return res
            .status(404)
            .send({ error: 'Linked check not found for this owner.' });
        }

        transaction.set({ status: 'cleared' });
        await transaction.save();
      } else {
        transaction.set({ status: normalized });
        await transaction.save();
      }

      return res
        .status(200)
        .send({ data: transaction, message: 'Transaction updated' });
    } catch (error) {
      console.error('Error updating transaction:', error);
      return res.status(500).send({
        error: 'An error occurred while updating the transaction.',
      });
    }
  }
);
export default router;
