import express from 'express';

import { payeeDataValidationMiddleware } from '../middlewares/payeeData.middleware.js';
import { payeesCollection } from '../models/dbCollections.js';
import { findReferencesInAllCollections } from '../utils/mongo-db.util.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../enums/auditLog.enum.js';
import { AuditLogService } from '../services/auditLog.service.js';
import { parseListSort, buildMongoSort } from '../utils/listSort.util.js';

const router = express.Router();

// Allow-list of column-ids that callers may sort the payee list on.
export const PAYEES_SORTABLE_FIELDS = {
  name: ['name'],
  payeeAddress: ['address.addressLine1'],
  email: ['email'],
  phone: ['phone'],
  status: ['status'],
};

/**
 * @swagger
 * /payees/getAllPayees/{ownerType}:
 *   get:
 *     summary: Retrieve all payees
 *     description: Fetches a paginated list of payees associated with a user or an organization.
 *     tags:
 *       - Payees
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the payees belong to a user or an organization.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination (must be a positive integer).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of records per page (must be a positive integer).
 *     responses:
 *       200:
 *         description: Successfully retrieved payees.
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
 *                         example: "605c72e8f1b6c92ff7e2f7b5"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       accountNumber:
 *                         type: string
 *                         example: "1234567890"
 *                       bankName:
 *                         type: string
 *                         example: "Bank of America"
 *                       ownerId:
 *                         type: string
 *                         example: "605c72e8f1b6c92ff7e2f7b2"
 *                       ownerType:
 *                         type: string
 *                         example: "users"
 *                 totalCount:
 *                   type: integer
 *                   example: 100
 *       400:
 *         description: Invalid pagination values.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid page or pageSize values. Both must be positive numbers."
 *       500:
 *         description: Internal server error while retrieving payees.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching payees."
 */

router.get('/getAllPayees/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { page, pageSize, includePayeeId, status } = req.query;
    const ownerType = req.params.ownerType;

    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 1000;

    if (pageNumber < 1 || pageSizeNumber < 1) {
      return res.status(400).send({
        error:
          'Invalid page or pageSize values. Both must be positive numbers.',
      });
    }

    const baseFilter = {
      ownerId: ownerType === 'user' ? userId : organizationId,
      ownerType,
    };

    if (status) {
      baseFilter.status = status;
    }

    const payeeQuery = includePayeeId
      ? {
          $or: [
            baseFilter,
            {
              _id: includePayeeId.toString(),
              ownerId: baseFilter.ownerId,
              ownerType: baseFilter.ownerType,
            },
          ],
        }
      : baseFilter;

    const parsedSort = parseListSort(req.query, PAYEES_SORTABLE_FIELDS);
    const sortSpec = buildMongoSort(parsedSort);

    const [result, totalCount] = await Promise.all([
      payeesCollection
        .find(payeeQuery)
        .sort(sortSpec)
        .skip((pageNumber - 1) * pageSizeNumber)
        .limit(pageSizeNumber)
        .lean(),
      payeesCollection.countDocuments(payeeQuery),
    ]);

    const resultWithUsage = await Promise.all(
      result.map(async (payee) => {
        const hasReferences = await findReferencesInAllCollections({
          docId: payee._id,
          fieldsToCheck: [
            'payeeId',
            'suggestedPayeeId',
            'finalPayeeId',
            'internalId',
          ],
          collectionsToCheck: [
            'checks',
            'transactions',
            'checkImportRow',
            'quickbooksmappings',
          ],
          collectionConditions: {
            quickbooksmappings: { entityType: 'User' },
          },
        });

        return {
          ...payee,
          inUse: hasReferences,
        };
      })
    );

    res.status(200).send({
      data: resultWithUsage,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching payees:', error);
    res.status(500).send({ error: 'An error occurred while fetching payees.' });
  }
});

/**
 * @swagger
 * /payees/addPayee/{ownerType}:
 *   post:
 *     summary: Add a new payee
 *     description: Adds a payee associated with a user or an organization.
 *     tags:
 *       - Payees
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the payee belongs to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               bankName:
 *                 type: string
 *                 example: "Bank of America"
 *               bankBranch:
 *                 type: string
 *                 example: "Downtown Branch"
 *               accountType:
 *                 type: string
 *                 example: "Savings"
 *     responses:
 *       200:
 *         description: Payee added successfully.
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
 *                       example: "605c72e8f1b6c92ff7e2f7b5"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     accountNumber:
 *                       type: string
 *                       example: "1234567890"
 *                     bankName:
 *                       type: string
 *                       example: "Bank of America"
 *                     bankBranch:
 *                       type: string
 *                       example: "Downtown Branch"
 *                     accountType:
 *                       type: string
 *                       example: "Savings"
 *                     ownerId:
 *                       type: string
 *                       example: "605c72e8f1b6c92ff7e2f7b2"
 *                     ownerType:
 *                       type: string
 *                       example: "users"
 *                 message:
 *                   type: string
 *                   example: "Payee added successfully"
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation failed: Account number is required."
 *       500:
 *         description: Internal server error while adding payee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while adding the payee."
 */

router.post(
  '/addPayee/:ownerType',
  payeeDataValidationMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;

      const payload = req.body;
      const ownerType = req.params.ownerType;

      const result = await payeesCollection.create({
        ...payload,
        ownerId: ownerType === 'user' ? userId : organizationId,
        ownerType,
      });

      await AuditLogService.logAction({
        entityType: AUDIT_ENTITY_TYPES.payees,
        action: AUDIT_ACTIONS.Created,
        userId: userId,
        entityId: result._id,
        ownerType: result.ownerType,
        ownerId: result.ownerId,
        oldData: null,
        newData: result,
      });

      res
        .status(200)
        .send({ data: result, message: 'Payee added successfully' });
    } catch (error) {
      console.error('error', error);
      res.status(500).send({ error });
    }
  }
);

/**
 * @swagger
 * /payees/updatePayee/{ownerType}/{payeeId}:
 *   put:
 *     summary: Update an existing payee
 *     description: Updates a payee's details for a user or an organization.
 *     tags:
 *       - Payees
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the payee belongs to a user or an organization.
 *       - in: path
 *         name: payeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the payee to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               accountNumber:
 *                 type: string
 *                 example: "9876543210"
 *               bankName:
 *                 type: string
 *                 example: "Chase Bank"
 *               bankBranch:
 *                 type: string
 *                 example: "Main Street Branch"
 *               accountType:
 *                 type: string
 *                 example: "Checking"
 *     responses:
 *       200:
 *         description: Payee updated successfully.
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
 *                       example: "605c72e8f1b6c92ff7e2f7b5"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     accountNumber:
 *                       type: string
 *                       example: "9876543210"
 *                     bankName:
 *                       type: string
 *                       example: "Chase Bank"
 *                     bankBranch:
 *                       type: string
 *                       example: "Main Street Branch"
 *                     accountType:
 *                       type: string
 *                       example: "Checking"
 *                     ownerId:
 *                       type: string
 *                       example: "605c72e8f1b6c92ff7e2f7b2"
 *                     ownerType:
 *                       type: string
 *                       example: "users"
 *                 message:
 *                   type: string
 *                   example: "Payee updated successfully"
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid payee ID or missing required fields."
 *       404:
 *         description: Payee not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Payee not found."
 *       500:
 *         description: Internal server error while updating payee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the payee."
 */

router.put(
  '/updatePayee/:ownerType/:payeeId',
  payeeDataValidationMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const { payeeId, ownerType } = req.params;
      const organizationId = req.organizationId;

      const payload = req.body;

      const oldDoc = await payeesCollection.findOne({
        _id: payeeId,
        ownerId: ownerType === 'user' ? userId : organizationId,
        ownerType,
      });

      if (!oldDoc) {
        return res.status(404).send({ error: 'Payee not found.' });
      }

      const result = await payeesCollection.findOneAndUpdate(
        {
          _id: payeeId,
          ownerId: ownerType === 'user' ? userId : organizationId,
          ownerType,
        },
        payload,
        { new: true }
      );

      if (result) {
        await AuditLogService.logAction({
          entityType: AUDIT_ENTITY_TYPES.payees,
          action: AUDIT_ACTIONS.Updated,
          userId: userId,
          entityId: result._id,
          ownerId: result.ownerId,
          ownerType: result.ownerType,
          oldData: oldDoc._doc,
          newData: result._doc,
        });
      }

      res.send({ data: result, message: 'Payee updated successfully' });
    } catch (error) {
      res.status(500).send({ error });
    }
  }
);

/**
 * @swagger
 * /payees/deletePayee/{ownerType}/{payeeId}:
 *   delete:
 *     summary: Delete a payee
 *     description: Deletes a payee associated with a user or an organization.
 *     tags:
 *       - Payees
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the payee belongs to a user or an organization.
 *       - in: path
 *         name: payeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the payee to delete.
 *     responses:
 *       200:
 *         description: Payee deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example:
 *                     _id: "605c72e8f1b6c92ff7e2f7b5"
 *                     name: "John Doe"
 *                     accountNumber: "9876543210"
 *                     bankName: "Chase Bank"
 *                     bankBranch: "Main Street Branch"
 *                     accountType: "Checking"
 *                     ownerId: "605c72e8f1b6c92ff7e2f7b2"
 *                     ownerType: "users"
 *                 message:
 *                   type: string
 *                   example: "Payee deleted successfully"
 *       404:
 *         description: Payee not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Payee not found."
 *       500:
 *         description: Internal server error while deleting payee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while deleting the payee."
 */

router.delete('/deletePayee/:ownerType/:payeeId', async (req, res) => {
  try {
    const userId = req.userId;
    const { payeeId, ownerType } = req.params;
    const organizationId = req.organizationId;

    const areReferences = await findReferencesInAllCollections({
      docId: payeeId,
      fieldsToCheck: ['payeeId'],
      collectionsToCheck: ['checks'],
    });

    if (areReferences) {
      return res.status(400).send({
        message: 'Cannot delete payee because it is in use.',
      });
    }

    const result = await payeesCollection.findOneAndDelete({
      _id: payeeId,
      ownerId: ownerType === 'user' ? userId : organizationId,
      ownerType,
    });

    if (result) {
      await AuditLogService.logAction({
        entityType: AUDIT_ENTITY_TYPES.payees,
        action: AUDIT_ACTIONS.Deleted,
        userId: userId,
        entityId: result._id,
        ownerId: result.ownerId,
        ownerType: result.ownerType,
        oldData: result,
        newData: null,
      });
    }

    res.send({ data: result, message: 'Payee deleted successfully' });
  } catch (error) {
    res.status(500).send({ error });
  }
});

export default router;
