import express from 'express';
import { getUserSignatureBase64 } from '../utils/signature.util.js';

import { Parser } from '@json2csv/plainjs';
import {
  addressesCollection,
  auditLogsCollection,
  banksCollection,
  checksCollection,
  mailedChecksCollection,
  organizationCollection,
  usersCollection,
} from '../models/dbCollections.js';
import {
  checkWriterDb,
  findReferencesInAllCollections,
} from '../utils/mongo-db.util.js';
import subscriptionMiddleware from '../middlewares/subscription.middleware.js';
import {
  compileBlankTemplate,
  compileTemplate,
  compileWrapperTemplate,
  emailPdf,
  generatePDFBuffer,
} from '../utils/checkEmail/checkEmail.utils.js';
import {
  buildChecksFilter,
  checkTrialLimit,
  getCheckPDFUrl,
  getCheckPermissions,
  getChecksChartData,
  getSortedCheckIdsPage,
  getTotalChecksStats,
  isOperationAllowed,
  parseChecksSort,
  printAndUploadBlankChecks,
  uploadCheckPDF,
} from '../services/checks.service.js';
import { isValidObjectId } from '../utils/objectId.util.js';
import trialMiddleware from '../middlewares/trial.middleware.js';
import demoRestrictionMiddleware from '../middlewares/demoRestriction.middleware.js';
import { validateUserOrganization } from '../models/users.model.js';
import { CHECK_STATUS } from '../enums/checks.enum.js';
import { maskAccountNumber } from '../utils/common.util.js';
import { AttachmentService } from '../services/attachments.service.js';
import { EntityType } from '../models/attachment.model.js';
import { getUserDetails } from '../services/users.service.js';
import { ERROR_TYPES } from '../middlewares/error-handler.middleware.js';
import { CheckMailingEmailService } from '../services/checkMail.service.js';
import { AuditLogService } from '../services/auditLog.service.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../enums/auditLog.enum.js';
import { MAILED_CHECK_DEFAULT_CHARGE } from '../models/dbCollections.js';
import SubscriptionService from '../services/stripe.service.js';

const router = express.Router();

/**
 * @swagger
 * /checks/{ownerType}:
 *   get:
 *     summary: Get checks by owner type
 *     description: Retrieves a list of checks for a user or an organization, with optional filters, search, and pagination.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of owner (either 'user' or 'organization').
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Number of records per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated list of check statuses to filter (e.g., DRAFT,CLEARED).
 *       - in: query
 *         name: payeeIds
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated list of payee IDs to filter.
 *       - in: query
 *         name: bankIds
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated list of bank IDs to filter.
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated list of tag IDs to filter.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date for filtering by issuedDate (inclusive).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date for filtering by issuedDate (inclusive).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search text to match memo, description, invoiceId, or checkNumber.
 *     responses:
 *       200:
 *         description: Successfully retrieved checks
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
 *                       ownerId:
 *                         type: string
 *                       ownerType:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       createdAtUnix:
 *                         type: integer
 *                       payee:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           email:
 *                             type: string
 *                       bank:
 *                         type: object
 *                         properties:
 *                           bankName:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           bankRoutingNumber:
 *                             type: string
 *                           accountNickName:
 *                             type: string
 *                 totalCount:
 *                   type: integer
 *                   description: Total number of matching records
 *       400:
 *         description: Invalid pagination values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid page or pageSize values. Both must be positive numbers.'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'An error occurred while fetching checks.'
 */

router.get('/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerType = req.params.ownerType;

    const { filter, pageNumber, pageSizeNumber } = buildChecksFilter({
      userId,
      organizationId,
      ownerType,
      query: req.query,
      includePagination: true,
    });

    const sort = parseChecksSort(req.query);

    let result;
    let totalCount;
    if (sort) {
      // When the client asks for a specific sort, resolve the ordered _ids for
      // this page first (using a SQL-side ORDER BY that can reach into joined
      // tables for payee/bank), then load the full check rows with the same
      // populate/attachment pipeline so behaviour is identical to the default
      // path. _id is appended as a stable tiebreaker so paginated/infinite
      // scroll pages don't repeat or skip rows.
      const skip = (pageNumber - 1) * pageSizeNumber;
      const orderedIdsResult = await Promise.all([
        getSortedCheckIdsPage({
          filter,
          sort,
          skip,
          limit: pageSizeNumber,
        }),
        checksCollection.countDocuments(filter),
      ]);
      const orderedIds = orderedIdsResult[0];
      totalCount = orderedIdsResult[1];

      const pageRows = orderedIds.length === 0
        ? []
        : await checksCollection
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
      [result, totalCount] = await Promise.all([
        checksCollection
          .find(filter)
          .sort({ createdAt: -1, createdDate: -1, _id: -1 })
          .populate('payeeId', 'name address email')
          .populate(
            'bankId',
            'bankName accountNumber bankRoutingNumber accountNickName'
          )
          .skip((pageNumber - 1) * pageSizeNumber)
          .limit(pageSizeNumber)
          .lean(),
        checksCollection.countDocuments(filter),
      ]);
    }

    // Batch-load attachments for all checks in this page in a single query
    // instead of issuing one Attachment.find() per check (N+1).
    const ownerIdForAttachments = ownerType === 'user' ? userId : organizationId;
    const attachmentsByCheckId = await AttachmentService.getAttachmentsByEntities({
      entityType: EntityType.CHECK,
      entityIds: result.map((r) => r._id),
      ownerType,
      ownerId: ownerIdForAttachments,
    });

    const finalResult = result.map(({ payeeId, bankId, ...item }) => ({
      ...item,
      payee: payeeId,
      bank: bankId,
      permissions: getCheckPermissions(item),
      attachments: attachmentsByCheckId.get(item._id?.toString?.() ?? item._id) ?? [],
    }));
    res.status(200).send({
      data: finalResult,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching checks:', {
      message: error?.message || error,
      stack: error?.stack,
      userId: req.userId,
      organizationId: req.organizationId,
      ownerType: req.params.ownerType,
      query: req.query,
    });
    res.status(500).send({ error: 'An error occurred while fetching checks.' });
  }
});

/**
 * @swagger
 * /checks/bulk/check/{ownerType}:
 *   post:
 *     summary: Bulk add checks
 *     description: Allows a user or organization to add multiple checks in bulk.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of owner (either 'user' or 'organization').
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 bankId:
 *                   type: string
 *                   description: The ID of the bank associated with the check.
 *                   example: "bank123"
 *                 amount:
 *                   type: number
 *                   description: The amount of the check.
 *                   example: 1000.50
 *                 payeeId:
 *                   type: string
 *                   description: The ID of the payee.
 *                   example: "payee456"
 *                 memo:
 *                   type: string
 *                   description: Memo or description for the check.
 *                   example: "Payment for invoice #789"
 *                 checkNumber:
 *                   type: string
 *                   description: Unique check number.
 *                   example: "CHK-001"
 *     responses:
 *       200:
 *         description: Checks added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "checks added"
 *                 data:
 *                   type: array
 *       400:
 *         description: Bad request, invalid data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post(`/bulk/check/:ownerType`, trialMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerType = req.params.ownerType;
    const ownerId = ownerType === 'user' ? userId : organizationId;
    const now = new Date();
    const unixTimestamp = Math.floor(now.getTime() / 1000);

    // Validate subscription
    const checkLimit = await checkTrialLimit(userId, req.body.length);

    if (checkLimit.status === 'error') {
      return res.status(403).send({
        type: ERROR_TYPES.SUBSCRIPTION.type,
        error: 'Check limit exceeded',
        message: checkLimit.message,
      });
    }

    // Build the array of check documents in memory then bulk-insert them.
    const docsToInsert = req.body.map((currentCheck) => {
      let tags = currentCheck.tags;
      if (tags && Array.isArray(tags)) {
        tags = tags.filter((t) => typeof t === 'string' && t.trim() !== '');
      }
      return {
        ...currentCheck,
        tags,
        createdDate: now,
        status: 'DRAFT',
        ownerType,
        ownerId,
        createdAtUnix: unixTimestamp,
      };
    });

    let insertedChecks;
    try {
      insertedChecks = await checksCollection.insertMany(docsToInsert);
    } catch (error) {
      console.error('Error saving checks (bulk):', error);
      return res
        .status(500)
        .send({ error: 'Failed to save one or more checks.' });
    }

    // Single batched audit log insert instead of N individual inserts.
    AuditLogService.logActionMany(
      insertedChecks.map((savedCheck) => ({
        action: AUDIT_ACTIONS.Created,
        entityType: AUDIT_ENTITY_TYPES.checks,
        entityId: savedCheck._id,
        ownerId: savedCheck.ownerId,
        ownerType: savedCheck.ownerType,
        userId,
        oldData: null,
        newData: savedCheck,
      }))
    );

    // Re-fetch the inserted rows in a single query and populate payee + bank
    // in two batched lookups instead of one round-trip per inserted check.
    const insertedIds = insertedChecks.map((c) => c._id);
    const populatedInsertedChecks = await checksCollection
      .find({ _id: { $in: insertedIds } })
      .populate('payeeId', 'name address email')
      .populate(
        'bankId',
        'bankName accountNumber bankRoutingNumber accountNickName'
      )
      .lean();

    // Send the response after all checks have been successfully inserted
    res.send({ message: 'checks added', data: populatedInsertedChecks });
  } catch (error) {
    // Handle any errors that occur outside of the loop
    console.error('Error processing bulk check request:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /checks/{ownerType}/{checkId}:
 *   put:
 *     summary: Update a check
 *     description: Allows a user or organization to update an existing check.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of owner (either 'user' or 'organization').
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the check to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankId:
 *                 type: string
 *                 description: The ID of the bank associated with the check.
 *                 example: "bank123"
 *               amount:
 *                 type: number
 *                 description: The amount of the check.
 *                 example: 1000.50
 *               payeeId:
 *                 type: string
 *                 description: The ID of the payee.
 *                 example: "payee456"
 *               memo:
 *                 type: string
 *                 description: Memo or description for the check.
 *                 example: "Updated memo"
 *               checkNumber:
 *                 type: string
 *                 description: Unique check number.
 *                 example: "CHK-002"
 *     responses:
 *       200:
 *         description: Check updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Check updated successfully"
 *       400:
 *         description: Bad request, invalid data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Check not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Check not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.put('/check/:ownerType/:checkId', trialMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { checkId, ownerType } = req.params;

    const now = new Date();
    const unixTimestamp = Math.floor(now.getTime() / 1000);

    const rawBody = req.body;
    const filter = {
      _id: checkId,
      ownerId: ownerType === 'user' ? userId : organizationId,
      ownerType: ownerType,
    };

    const allowedFields = [
      'bankId', 'payeeId', 'amount', 'checkNumber', 'memo',
      'description', 'issuedDate', 'status', 'tags', 'invoiceId',
      'isBlankCheck', 'address', 'city', 'state', 'zip', 'country',
    ];

    const checkToUpdate = {};
    for (const key of allowedFields) {
      if (rawBody[key] !== undefined) {
        checkToUpdate[key] = rawBody[key];
      }
    }

    if (checkToUpdate.tags && Array.isArray(checkToUpdate.tags)) {
      checkToUpdate.tags = checkToUpdate.tags.filter(
        (tag) => typeof tag === 'string' && tag.trim() !== ''
      );
    }

    const existingCheck = await checksCollection.findOne(filter).lean();

    if (!existingCheck) {
      return res.status(404).send({
        error: "Check not found or you don't have permission to update it.",
      });
    }

    if (checkToUpdate.status && existingCheck.status !== checkToUpdate.status) {
      const operationAllowed = isOperationAllowed(
        existingCheck,
        checkToUpdate.status
      );
      if (!operationAllowed.allowed) {
        return res.status(400).send({
          error: operationAllowed.message,
        });
      }
    } else {
      const operationAllowed = isOperationAllowed(
        existingCheck,
        CHECK_STATUS.EDIT
      );
      if (!operationAllowed.allowed) {
        return res.status(400).send({
          error: operationAllowed.message,
        });
      }
    }

    const update = {
      $set: {
        ...checkToUpdate,
        updatedDate: now,
        updatedAtUnix: unixTimestamp,
      },
    };

    const result = await checksCollection.findOneAndUpdate(filter, update, {
      new: true,
      context: { userId },
    });

    if (!result) {
      return res.status(404).send({
        error: "Check not found or you don't have permission to update it.",
      });
    }

    res.send({ message: 'Check updated successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});

/**
 * @swagger
 * /checks/{ownerType}/{checkId}:
 *   delete:
 *     summary: Delete a check
 *     description: Deletes a check along with related transactions and updates the bank balance.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the check belongs to a user or an organization.
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the check to be deleted.
 *     responses:
 *       200:
 *         description: Check and related transactions deleted successfully, and the bank balance updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Check and related data deleted successfully"
 *       400:
 *         description: Invalid request data or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Check not found or does not belong to the requesting owner.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Check not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing the request"
 */

router.delete('/bulk-delete/:ownerType', trialMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { ownerType } = req.params;
    const { checkIds } = req.body; // Expecting checkIds as an array

    if (!Array.isArray(checkIds) || checkIds.length === 0) {
      return res
        .status(400)
        .send({ error: 'checkIds must be a non-empty array' });
    }

    const successfulDeletions = [];
    const failedDeletions = [];
    const ownerId = ownerType === 'user' ? userId : organizationId;

    // 1. Fetch all candidate checks owned by the caller in one query.
    const candidates = await checksCollection
      .find({ _id: { $in: checkIds }, ownerType, ownerId })
      .lean();
    const candidateById = new Map(
      candidates.map((c) => [c._id?.toString?.() ?? c._id, c]),
    );

    for (const checkId of checkIds) {
      if (!candidateById.has(checkId)) {
        failedDeletions.push({
          checkId,
          reason: 'Check not found or not owned by requesting user',
        });
      }
    }

    // 2. Find which of the remaining checks are still referenced. Run the
    //    reference probes in parallel using allSettled so a transient failure
    //    on one probe only fails that check, not the whole request.
    const idsToCheck = [...candidateById.keys()];
    const refResults = await Promise.allSettled(
      idsToCheck.map((id) =>
        findReferencesInAllCollections({
          docId: id,
          collectionsToCheck: ['mailed_checks', 'mail_batches'],
          fieldsToCheck: ['checkId'],
        }),
      ),
    );

    const idsToDelete = [];
    const deletedDocsForAudit = [];
    refResults.forEach((settled, idx) => {
      const id = idsToCheck[idx];
      const doc = candidateById.get(id);
      if (settled.status === 'rejected') {
        failedDeletions.push({
          checkId: id,
          reason: settled.reason?.message || 'Reference check failed',
        });
        return;
      }
      if (settled.value) {
        failedDeletions.push({ checkId: id, reason: 'Has references' });
        return;
      }
      const operationAllowed = isOperationAllowed(doc, CHECK_STATUS.DELETE);
      if (!operationAllowed.allowed) {
        failedDeletions.push({
          checkId: id,
          reason: 'Delete operation not allowed for the requested check',
        });
        return;
      }
      idsToDelete.push(id);
      deletedDocsForAudit.push(doc);
    });

    // 3. One bulk delete instead of N findOneAndDelete calls.
    if (idsToDelete.length > 0) {
      try {
        await checksCollection.deleteMany({
          _id: { $in: idsToDelete },
          ownerType,
          ownerId,
        });
        successfulDeletions.push(...idsToDelete);

        // 4. Single batched audit log insert.
        await AuditLogService.logActionMany(
          deletedDocsForAudit.map((deletedCheck) => ({
            entityType: AUDIT_ENTITY_TYPES.checks,
            action: AUDIT_ACTIONS.Deleted,
            userId,
            entityId: deletedCheck._id,
            ownerId: deletedCheck.ownerId,
            ownerType: deletedCheck.ownerType,
            oldData: deletedCheck,
            newData: null,
          })),
        );
      } catch (error) {
        for (const id of idsToDelete) {
          failedDeletions.push({
            checkId: id,
            reason: error.message || 'Deletion failed',
          });
        }
      }
    }

    if (failedDeletions.length > 0) {
      res.status(207).send({
        message: 'Some checks were not deleted as they are under use.',
        successfulDeletions,
        failedDeletions,
      });
    } else {
      res.send({
        message: 'All checks and related data deleted',
        successfulDeletions,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});
/**
 * @swagger
 * /checks/print-multiple-checks/{ownerType}:
 *   post:
 *     summary: Generate and print multiple checks as a PDF
 *     description: Retrieves multiple checks, compiles them into a printable HTML template, converts them to a PDF, and updates their status to "PRINTED".
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the checks belong to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of check IDs to be printed.
 *                 example: ["check123", "check456"]
 *     responses:
 *       200:
 *         description: PDF containing the checks is generated and returned.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: One or more checks not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some checks were not found"
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing the request"
 */
router.post(
  '/print-multiple-checks/:ownerType',
  trialMiddleware,
  async (req, res) => {
    try {
      const { checkIds } = req.body;
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const checks = await checksCollection
        .find({
          _id: { $in: checkIds },
          ownerType,
          ownerId,
        })
        .populate('payeeId', 'name email address')
        .populate(
          'bankId',
          'bankName accountNumber bankRoutingNumber bankTransitNumber accountNickName bankPreferences'
        )
        .lean();

      for (const check of checks) {
        const operationAllowed = isOperationAllowed(
          check,
          CHECK_STATUS.PRINTED
        );
        if (!operationAllowed.allowed) {
          return res.status(400).send({
            error: operationAllowed.message,
          });
        }
      }

      const ownerData = ownerType === 'user'
        ? await usersCollection.findById(ownerId).lean()
        : await organizationCollection.findById(ownerId).lean();

      const address = await addressesCollection
        .findOne({ ownerId, ownerType })
        .lean();

      const ownerUserData = ownerType === 'user'
        ? { firstName: ownerData?.firstName || '', lastName: ownerData?.lastName || '', ...address }
        : { firstName: ownerData?.organizationName || '', lastName: '', ...address };

      const mappedChecks = checks.map(
        ({ payeeId, bankId, ownerId: checkOwnerId, ownerType: checkOwnerType, ...rest }) => ({
          ...rest,
          payee: payeeId,
          bank: bankId,
          userData: ownerUserData,
          ownerId: checkOwnerId,
          ownerType: checkOwnerType,
          userId,
        })
      );

      const signatureUrl = await getUserSignatureBase64(ownerId, ownerType);

      const organization = await organizationCollection.findById(
        organizationId
      );

      const checkHtmlArray = await Promise.all(
        mappedChecks.map(async (check) => {
          return `<div style="page-break-after: always;">${await compileTemplate(
            {
              ...check,
              signatureUrl,
              organization,
            }
          )}</div>`;
        })
      );

      const checksHtml = checkHtmlArray.join('');

      const fullHtml = await compileWrapperTemplate(checksHtml);

      const pdfBuffer = await generatePDFBuffer(fullHtml);

      const fileName = `check_${mappedChecks
        .map((check) => check.checkNumber)
        .join('_')}.pdf`;

      await uploadCheckPDF({
        userId,
        pdfBuffer,
        organizationId,
        ownerType,
        fileName,
      });

      const s3Url = await getCheckPDFUrl({
        userId,
        organizationId,
        ownerType,
        fileName,
      });

      // Single batched update instead of one round-trip per checkId.
      await checksCollection.updateMany(
        { _id: { $in: checkIds }, ownerType, ownerId },
        { status: 'PRINTED' },
      );

      res.json({ success: true, url: s3Url });
    } catch (error) {
      res.status(500).send({ error: error.message || 'An error occurred' });
    }
  }
);

/**
 * @swagger
 * /checks/sendEmailWithCheck/{ownerType}:
 *   post:
 *     summary: Send checks as PDF attachments via email
 *     description: Retrieves multiple checks, generates PDFs for them, and sends them as email attachments to specified recipients.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the checks belong to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of check IDs to be emailed.
 *                 example: ["check123", "check456"]
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: List of recipient email addresses.
 *                 example: ["recipient1@example.com", "recipient2@example.com"]
 *               subject:
 *                 type: string
 *                 description: Subject of the email.
 *                 example: "Your Check Documents"
 *               content:
 *                 type: string
 *                 description: Email body content.
 *                 example: "Please find the attached check(s) for your reference."
 *     responses:
 *       200:
 *         description: Emails sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Emails sent successfully"
 *       400:
 *         description: Invalid request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: One or more checks not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some checks were not found"
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing the request"
 */
router.post(
  '/sendEmailWithCheck/:ownerType',
  trialMiddleware,
  async (req, res) => {
    try {
      const { checkIds, content, emails, subject } = req.body;
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const checks = await checksCollection
        .find({
          _id: { $in: checkIds },
          ownerType,
          ownerId,
        })
        .populate('payeeId', 'name email address')
        .populate(
          'bankId',
          'bankName accountNumber bankRoutingNumber bankTransitNumber accountNickName bankPreferences'
        )
        .lean();

      for (const check of checks) {
        const operationAllowed = isOperationAllowed(
          check,
          CHECK_STATUS.EMAILED
        );
        if (!operationAllowed.allowed) {
          return res.status(400).send({
            error: operationAllowed.message,
          });
        }
      }

      const ownerData = ownerType === 'user'
        ? await usersCollection.findById(ownerId).lean()
        : await organizationCollection.findById(ownerId).lean();

      const address = await addressesCollection
        .findOne({ ownerId, ownerType })
        .lean();

      const ownerUserData = ownerType === 'user'
        ? { firstName: ownerData?.firstName || '', lastName: ownerData?.lastName || '', ...address }
        : { firstName: ownerData?.organizationName || '', lastName: '', ...address };

      const mappedChecks = checks.map(
        ({ payeeId, bankId, ownerId: checkOwnerId, ownerType: checkOwnerType, ...rest }) => ({
          ...rest,
          payee: payeeId,
          bank: bankId,
          userData: ownerUserData,
          ownerId: checkOwnerId,
          ownerType: checkOwnerType,
        })
      );

      const signatureUrl = await getUserSignatureBase64(ownerId, ownerType);

      const attachments = await Promise.all(
        mappedChecks.map(async (check) => {
          const htmlContent = await compileTemplate({
            ...check,
            signatureUrl,
          });

          const wrappedHtml = await compileWrapperTemplate(htmlContent);
          const pdfBuffer = await generatePDFBuffer(wrappedHtml);

          return {
            content: pdfBuffer,
            filename: `check_${check.checkNumber}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
          };
        })
      );

      for (const email of emails) {
        await emailPdf({
          email,
          attachments,
          content,
          subject,
        });
      }

      await checksCollection.updateMany(
        { _id: { $in: checkIds }, ownerType, ownerId },
        { $set: { status: 'EMAILED' } }
      );

      res.send({ message: 'Emails sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message || 'An error occurred' });
    }
  }
);

/**
 * @swagger
 * /checks/checks-stats/{ownerType}:
 *   get:
 *     summary: Get statistics for checks
 *     description: Retrieves statistics related to checks, including total checks, draft checks, cleared checks, and chart data for multiple organizations and/or the personal profile. The `ownerType` determines whether to include only the user's data or organizational data.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies the context of the statistics. Use "user" for personal profile or "organization" for organizational data.
 *       - in: query
 *         name: organizationIds
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Comma-separated list of organization IDs to include in the statistics.
 *         example: 603e9e0f0c1df0001dce5e99,603e9e0f0c1df0001dce5e9a
 *       - in: query
 *         name: includePersonalProfile
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether to include the user's personal profile data in the statistics.
 *         example: "true"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Total Checks, Total Amount]
 *         description: Type of statistics to retrieve (Total Checks = count, Total Amount = sum of amounts).
 *         example: "Total Checks"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering check statistics.
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering check statistics.
 *         example: "2024-12-31"
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *         description: Time duration granularity for chart data grouping.
 *         example: "monthly"
 *     responses:
 *       200:
 *         description: Successfully retrieved check statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalChecks:
 *                   type: number
 *                   example: 150
 *                 totalDraftChecks:
 *                   type: number
 *                   example: 45
 *                 totalClearedChecks:
 *                   type: number
 *                   example: 105
 *                 checksChartData:
 *                   type: object
 *                   properties:
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Jan 2024"
 *                           amount:
 *                             type: string
 *                             example: "1280.50"
 *                           checks:
 *                             type: integer
 *                             example: 17
 *                     total:
 *                       type: number
 *                       example: 5120.75
 *                     formattedDateRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           example: "Jan 1, 2024"
 *                         endDate:
 *                           type: string
 *                           example: "Dec 31, 2024"
 *       400:
 *         description: Invalid request parameters or unauthorized organization access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid organizationId: 123. You do not have access."
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving check statistics"
 */
router.get('/checks-stats/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;

    const {
      type,
      startDate,
      endDate,
      duration,
      organizationIds,
      includePersonalProfile,
    } = req.query;

    let ownerIds = [];
    if (organizationIds) {
      const orgIds = Array.isArray(organizationIds)
        ? organizationIds
        : organizationIds.split(',');

      const validatedOrgIds = [];

      for (const orgId of orgIds) {
        const isValid = await validateUserOrganization(userId, orgId);
        if (!isValid) {
          return res.status(400).json({
            error: `Invalid organizationId: ${orgId}. You do not have access.`,
          });
        }
        validatedOrgIds.push({
          id: orgId.toString(),
          type: 'organization',
        });
      }

      ownerIds.push(...validatedOrgIds);
    }

    if (includePersonalProfile === 'true') {
      ownerIds.push({ id: userId.toString(), type: 'user' });
    }

    if (ownerIds.length === 0) {
      return res.status(400).json({
        error: 'No valid organizationIds or personal profile included.',
      });
    }
    const totalChecks = await getTotalChecksStats(type, ownerIds);
    const totalDraftChecks = await getTotalChecksStats(type, ownerIds, 'DRAFT');

    const totalClearedChecks = await getTotalChecksStats(
      type,
      ownerIds,
      'CLEARED'
    );

    const checksCartData = await getChecksChartData({
      ownerIds,
      startDate,
      endDate,
      duration,
    });

    res.send({
      totalChecks,
      totalDraftChecks,
      totalClearedChecks,
      checksCartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});

/**
 * @swagger
 * /checks/mailed/{ownerType}:
 *   get:
 *     summary: Retrieve mailed check statistics
 *     description: |
 *       Fetches a paginated list of mailed checks based on owner type (user or organization).
 *       Users can filter results by status and paginate results.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Number of results per page (default is 1000).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter the mailed checks by status.
 *     responses:
 *       200:
 *         description: Successfully retrieved mailed checks.
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
 *                       ownerId:
 *                         type: string
 *                       ownerType:
 *                         type: string
 *                       payee:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       bank:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           bankName:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           bankRoutingNumber:
 *                             type: string
 *                           accountNickName:
 *                             type: string
 *                       check:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           checkNumber:
 *                             type: string
 *                 totalCount:
 *                   type: integer
 *                   description: Total number of mailed checks found.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid query parameters. Page number and page size must be positive integers."
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access. Please log in."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while retrieving mailed checks."
 */

router.get('/mailed/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { page, pageSize, status } = req.query;
    const ownerType = req.params.ownerType;

    const filter = {
      ownerId: ownerType === 'user' ? userId : organizationId,
      ownerType,
    };

    if (status) {
      filter['status'] = status;
    }

    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 1000;

    if (pageNumber < 1 || pageSizeNumber < 1) {
      return res.status(400).send({
        error:
          'Invalid page or pageSize values. Both must be positive numbers.',
      });
    }

    const [result, totalCount] = await Promise.all([
      mailedChecksCollection
        .find(filter)
        .populate({
          path: 'checkId',
          populate: [{ path: 'payeeId' }, { path: 'bankId' }],
        })
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSizeNumber)
        .limit(pageSizeNumber)
        .lean(),
      mailedChecksCollection.countDocuments(filter),
    ]);

    const finalResult = result.map(({ payeeId, bankId, checkId, ...item }) => ({
      ...item,
      payee: checkId.payeeId,
      bank: checkId.bankId,
      check: checkId,
    }));

    res.status(200).send({
      data: finalResult,
      totalCount,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});

/**
 * @swagger
 * /checks/mail/cancel/{ownerType}:
 *   post:
 *     summary: Cancel mailed checks
 *     description: Cancels mailed checks for a given owner type (user or organization). Only checks with 'Submitted' status can be canceled.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of check IDs to be canceled.
 *     responses:
 *       200:
 *         description: Successfully processed check cancellations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canceledChecks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mailCheckId:
 *                         type: string
 *                       status:
 *                         type: string
 *                 failedChecks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mailCheckId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       error:
 *                         type: string
 *       400:
 *         description: Invalid input or no checks found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No checks found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while processing the request."
 */

router.post('/mail/cancel/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerType = req.params.ownerType;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const { checkIds } = req.body;

    const checks = await mailedChecksCollection.find({
      _id: { $in: checkIds },
      ownerId,
      ownerType,
    });

    if (!checks.length) throw new Error('No checks found');

    const canceledChecks = [];
    const failedChecks = [];

    for (const check of checks) {
      if (check.status === 'Submitted') {
        check.status = 'Canceled';
        check.canceledAt = new Date();
        await check.save();
        canceledChecks.push({ mailCheckId: check._id, status: 'Canceled' });
      } else {
        failedChecks.push({
          mailCheckId: check._id,
          status: check.status,
          error: `Cannot cancel a ${check.status.toLowerCase()} check.`,
        });
      }
    }

    return res.json({ canceledChecks, failedChecks });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});

/**
 * @swagger
 * /checks/mail/{ownerType}:
 *   post:
 *     summary: Submit mailed checks
 *     description: Submits checks for mailing under a given owner type (user or organization).
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of check IDs to be mailed.
 *     responses:
 *       200:
 *         description: Successfully submitted mailed checks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submittedChecks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: "Submitted"
 *       500:
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while processing the request."
 */

router.post('/mail/:ownerType', demoRestrictionMiddleware, trialMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerType = req.params.ownerType;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const { checkIds, paymentMethodId, customAddresses } = req.body;

    if (customAddresses && typeof customAddresses === 'object') {
      for (const [checkId, addr] of Object.entries(customAddresses)) {
        if (!addr.addressLine1?.trim() || !addr.city?.trim() || !addr.state?.trim() || !String(addr.zip || '').trim()) {
          return res.status(400).json({
            error: 'Custom address is incomplete. Address line 1, city, state, and ZIP are required.',
          });
        }
      }
    }

    let org = null;

    if (ownerType === 'organization' && organizationId) {
      org = await organizationCollection.findById(organizationId);
    }

    const checks = await checksCollection.find({
      _id: { $in: checkIds },
      ownerId,
      ownerType,
    });

    for (const check of checks) {
      const operationAllowed = isOperationAllowed(check, CHECK_STATUS.MAILED);
      if (!operationAllowed.allowed) {
        return res.status(400).send({
          error: operationAllowed.message,
        });
      }
    }

    const toBill = checks.map((c) => ({
      _id: c._id,
      chargeAmount: MAILED_CHECK_DEFAULT_CHARGE,
      checkNumber: c.checkNumber,
      orgName: org ? org.organizationName : null,
    }));

    const charge = await SubscriptionService.chargeChecksNowWithInvoice({
      userId,
      checks: toBill,
      paymentMethodId: paymentMethodId,
    });

    if (!charge.success) {
      return res.status(402).json({
        error: charge.error || 'Payment required',
        message: charge.error,
      });
    }

    const submittedChecks = await Promise.all(
      checks.map(async (check) => {
        const customAddr = customAddresses?.[check._id] || null;
        const mailedCheck = new mailedChecksCollection({
          ownerId: check.ownerId,
          ownerType: check.ownerType,
          checkId: check._id,
          status: 'Submitted',
          requestedAt: new Date(),
          requestedBy: userId,
          chargeId: charge.invoiceId,
          chargeAmount: MAILED_CHECK_DEFAULT_CHARGE,
          ...(customAddr ? { customAddress: customAddr } : {}),
        });
        await checksCollection.findByIdAndUpdate(check._id, {
          status: 'SUBMITTED',
        });
        await mailedCheck.save();
        return { id: mailedCheck._id, status: mailedCheck.status };
      })
    );
    if (submittedChecks.length > 0) {
      await CheckMailingEmailService.sendUserCheckSubmissionEmail(
        ownerId,
        ownerType,
        userId,
        submittedChecks.map((check) => check.id)
      );
      await CheckMailingEmailService.sendAdminNewSubmissionEmail(
        ownerId,
        ownerType,
        userId,
        submittedChecks.map((check) => check.id)
      );
    }

    res.send({ submittedChecks });
  } catch (error) {
    res.status(500).send({ error: error.message || 'An error occurred' });
  }
});

/**
 * @swagger
 * /checks/validate-check-numbers/{ownerType}:
 *   get:
 *     summary: Validate a range of manual check numbers for a bank
 *     description: |
 *       Checks if the provided range of manual check numbers is available (not already used) for a specific bank account.
 *       Only works if the bank is in manual check number mode.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Indicates whether the bank belongs to a user or organization.
 *       - in: query
 *         name: bankAccountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the bank account to check against.
 *       - in: query
 *         name: startingCheckNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The starting check number entered by the user.
 *       - in: query
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of consecutive checks the user wants to generate.
 *     responses:
 *       200:
 *         description: Availability result
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       example: false
 *                     conflicts:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1012, 1014]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required query parameters"
 *       404:
 *         description: Bank account not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bank account not found or access denied"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/validate-check-numbers/:ownerType', async (req, res) => {
  try {
    const { bankAccountId, startingCheckNumber, count } = req.query;

    const ownerType = req.params.ownerType;
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerId = ownerType === 'user' ? userId : organizationId;
    if (!bankAccountId || !startingCheckNumber || !count) {
      return res
        .status(400)
        .json({ message: 'Missing required query parameters' });
    }

    if (!isValidObjectId(bankAccountId)) {
      return res.status(400).json({ message: 'Invalid bankAccountId format' });
    }

    const bank = await banksCollection.findOne({
      _id: bankAccountId,
      ownerType,
      ownerId,
    });

    if (!bank) {
      return res
        .status(404)
        .json({ message: 'Bank account not found or access denied' });
    }

    const isManual = bank?.bankPreferences?.checkNoGeneration === 'manual';
    if (!isManual) {
      return res
        .status(400)
        .json({ message: 'Bank is not set to manual check number mode' });
    }

    const start = parseInt(startingCheckNumber, 10);
    const numChecks = parseInt(count, 10);

    if (isNaN(start) || isNaN(numChecks) || start <= 0 || numChecks <= 0) {
      return res.status(400).json({
        message: 'startingCheckNumber and count must be greater than 0',
      });
    }

    const range = Array.from({ length: numChecks }, (_, i) => start + i);
    const existingChecks = await checksCollection
      .find({
        bankId: bank._id,
        checkNumber: { $in: range },
      })
      .select('checkNumber')
      .lean();

    if (!existingChecks.length) {
      return res.json({ available: true });
    }

    const conflicts = existingChecks.map((c) => c.checkNumber);
    return res.json({ available: false, conflicts });
  } catch (err) {
    console.error('Error validating check numbers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /checks/bulk/create-blank/{ownerType}:
 *   post:
 *     summary: Create multiple blank checks manually
 *     description: |
 *       Creates a batch of blank checks (status: BLANK) for a user or organization using manual check numbers.
 *       Validates check number availability and signature requirements.
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of owner creating the checks.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankAccountId
 *               - count
 *               - startingCheckNumber
 *             properties:
 *               bankAccountId:
 *                 type: string
 *                 description: ID of the bank to associate with the checks.
 *                 example: "660ff834e5f1460c5c5d48a2"
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of blank checks to create.
 *                 example: 5
 *               startingCheckNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: First manual check number to use.
 *                 example: 1001
 *               signed:
 *                 type: boolean
 *                 description: Whether to include a signature on the check.
 *                 example: true
 *     responses:
 *       200:
 *         description: Blank checks created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blank checks created successfully"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 conflicts:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1003, 1004]
 *       404:
 *         description: Bank not found or access denied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bank not found or access denied"
 *       500:
 *         description: Server error during check creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post(
  `/bulk/create-blank/:ownerType`,
  trialMiddleware,
  async (req, res) => {
    const session = await checkWriterDb.startSession();
    try {
      const { ownerType } = req.params;
      const { bankAccountId, count, startingCheckNumber, signed } = req.body;

      const userId = req.userId;
      const organizationId = req.organizationId;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const checksLimit = await checkTrialLimit(userId, count);

      if (checksLimit.status === 'error') {
        return res.status(403).json({
          type: ERROR_TYPES.SUBSCRIPTION.type,
          error: 'check limits exceeded',
          message: checksLimit.message,
        });
      }

      if (checksLimit.status === 'error') {
        return res.status(403).json({
          type: ERROR_TYPES.SUBSCRIPTION.type,
          error: 'check limits exceeded',
          message: checksLimit.message,
        });
      }

      // Validate inputs
      if (
        !isValidObjectId(bankAccountId) ||
        !count ||
        count <= 0 ||
        !startingCheckNumber ||
        startingCheckNumber <= 0
      ) {
        return res.status(400).json({ message: 'Invalid input' });
      }

      session.startTransaction();

      // Bank ownership & check mode validation
      const bank = await banksCollection.findOne(
        { _id: bankAccountId, ownerType, ownerId },
        null,
        { session }
      );

      if (!bank) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ message: 'Bank not found or access denied' });
      }

      const checkNumbers = Array.from(
        { length: count },
        (_, i) => Number(startingCheckNumber) + i
      );
      const existing = await checksCollection
        .find({
          bankId: bank._id,
          checkNumber: { $in: checkNumbers },
        })
        .select('checkNumber')
        .session(session)
        .lean();

      if (existing.length > 0) {
        await session.abortTransaction();
        const conflicts = existing.map((c) => c.checkNumber);
        return res
          .status(400)
          .json({ message: 'Some check numbers already exist', conflicts });
      }

      const now = new Date();
      const unixTimestamp = Math.floor(now.getTime() / 1000);
      const blankChecks = checkNumbers.map((checkNumber) => ({
        ownerId,
        ownerType,
        bankId: bank._id,
        checkNumber,
        status: 'BLANK',
        amount: null,
        payeeId: null,
        memo: null,
        description: null,
        createdDate: now,
        issuedDate: null,
        createdAtUnix: unixTimestamp,
        pdfStored: false,
        isSignatureSelected: !!signed,
        isBlankCheck: true,
      }));

      const createdBlankChecks = await checksCollection.insertMany(
        blankChecks,
        { session }
      );
      const auditDocs = createdBlankChecks.map((doc) => ({
        entityType: AUDIT_ENTITY_TYPES.checks,
        ownerType: doc.ownerType,
        ownerId: doc.ownerId,
        entityId: doc._id,
        action: AUDIT_ACTIONS.Created,
        userId: userId,
        oldData: null,
        newData: doc.toObject ? doc.toObject() : doc,
      }));

      await banksCollection.updateOne(
        { _id: bank._id },
        { $set: { inUse: true } },
        { session }
      );

      const address = await addressesCollection
        .findOne({ ownerId, ownerType })
        .lean();

      const insertedChecks = await checksCollection
        .find(
          {
            ownerId,
            ownerType,
            bankId: bank._id,
            checkNumber: { $in: checkNumbers },
          },
          null,
          { session }
        )
        .populate(
          'bankId',
          'bankName accountNumber bankRoutingNumber bankTransitNumber accountNickName bankPreferences'
        )
        .lean();

      const ownerData = ownerType === 'user'
        ? await usersCollection.findById(ownerId).lean()
        : await organizationCollection.findById(ownerId).lean();

      const ownerUserData = ownerType === 'user'
        ? { firstName: ownerData?.firstName || '', lastName: ownerData?.lastName || '', ...address }
        : { firstName: ownerData?.organizationName || '', lastName: '', ...address };

      const mappedChecks = insertedChecks.map(
        ({ bankId, ownerId: checkOwnerId, ownerType: checkOwnerType, ...rest }) => ({
          ...rest,
          payee: null,
          bank: bankId,
          userData: ownerUserData,
          ownerId: checkOwnerId,
          ownerType: checkOwnerType,
        })
      );

      const s3Url = await printAndUploadBlankChecks({
        mappedChecks,
        ownerId,
        ownerType,
        userId,
        organizationId,
      });

      await session.commitTransaction();
      await AuditLogService.logActionMany(auditDocs);
      session.endSession();

      res.json({ success: true, url: s3Url || '' });
    } catch (error) {
      console.error('Error creating blank checks:', error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /checks/print-multiple-blank-checks/{ownerType}:
 *   post:
 *     summary: Generate and print multiple blank checks as a PDFs
 *     description: Retrieves multiple checks, compiles them into a printable HTML template, converts them to a PDF, and updates their status to "PRINTED".
 *     tags:
 *       - Checks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the checks belong to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of check IDs to be printed.
 *                 example: ["check123", "check456"]
 *     responses:
 *       200:
 *         description: PDF containing the checks is generated and returned.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: One or more checks not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some checks were not found"
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing the request"
 */
router.post(
  '/print-multiple-blank-checks/:ownerType',
  trialMiddleware,
  async (req, res) => {
    try {
      const { checkIds } = req.body;
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const checks = await checksCollection
        .find({
          _id: { $in: checkIds },
          ownerType,
          ownerId,
        })
        .populate(
          'bankId',
          'bankName accountNumber bankRoutingNumber bankTransitNumber accountNickName bankPreferences'
        )
        .lean();

      for (const check of checks) {
        const operationAllowed = isOperationAllowed(
          check,
          CHECK_STATUS.PRINTED
        );
        if (!operationAllowed.allowed) {
          return res.status(400).send({
            error: operationAllowed.message,
          });
        }
      }

      const ownerData = ownerType === 'user'
        ? await usersCollection.findById(ownerId).lean()
        : await organizationCollection.findById(ownerId).lean();

      const address = await addressesCollection
        .findOne({ ownerId, ownerType })
        .lean();

      const ownerUserData = ownerType === 'user'
        ? { firstName: ownerData?.firstName || '', lastName: ownerData?.lastName || '', ...address }
        : { firstName: ownerData?.organizationName || '', lastName: '', ...address };

      const mappedChecks = checks.map(
        ({ bankId, ownerId: checkOwnerId, ownerType: checkOwnerType, ...rest }) => ({
          ...rest,
          amount: null,
          memo: null,
          payee: null,
          bank: bankId,
          userData: ownerUserData,
          ownerId: checkOwnerId,
          ownerType: checkOwnerType,
        })
      );

      const s3Url = await printAndUploadBlankChecks({
        mappedChecks,
        ownerId,
        ownerType,
        userId,
        organizationId,
      });

      res.json({ success: true, url: s3Url });
    } catch (error) {
      res.status(500).send({ error: error.message || 'An error occurred' });
    }
  }
);

router.get('/export/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerType = req.params.ownerType;

    const { filter } = buildChecksFilter({
      userId,
      organizationId,
      ownerType,
      query: req.query,
      includePagination: false,
    });

    const result = await checksCollection
      .find(filter)
      .sort({ createdDate: 1 })
      .populate('payeeId', 'name address email')
      .populate(
        'bankId',
        'bankName accountNumber bankRoutingNumber accountNickName'
      )
      .populate('tags')
      .lean();

    const finalResult = result.map(({ payeeId, bankId, tags, ...item }) => {
      const tagNames = tags ? tags.map((i) => i.name).join(', ') : '';
      return {
        checkNumber: item.checkNumber,
        issueDate: item.issuedDate
          ? item.issuedDate.toISOString().split('T')[0]
          : '',
        payeeName: payeeId?.name || '',
        payeeEmail: payeeId?.email || '',
        bankName: bankId?.bankName || '',
        accountNumber: maskAccountNumber(bankId?.accountNumber) || '',
        memo: item.memo || '',
        tags: tagNames,
        status: item.status,
        amount: item.amount,
        invoice: item.invoiceId || '',
        bankAccountNickName: bankId?.accountNickName || '',
        payeeAddress: `${payeeId?.address?.addressLine1}  ${payeeId?.address?.addressLine2}, ${payeeId?.address?.city}, ${payeeId?.address?.state}, ${payeeId?.address?.country}, ${payeeId?.address?.zipCode}`,
      };
    });

    const fields = [
      { label: 'Issue Date', value: 'issueDate' },
      { label: 'Check Number', value: 'checkNumber' },
      { label: 'Amount', value: 'amount' },
      { label: 'Status', value: 'status' },
      { label: 'Payee Name', value: 'payeeName' },
      { label: 'Payee Email', value: 'payeeEmail' },
      { label: 'Payee Address', value: 'payeeAddress' },
      { label: 'Bank Name', value: 'bankName' },
      { label: 'Account Number', value: 'accountNumber' },
      { label: 'Memo', value: 'memo' },
      { label: 'Invoice ID', value: 'invoice' },
      { label: 'Tags', value: 'tags' },
      { label: 'Bank Account Nickname', value: 'bankAccountNickName' },
    ];

    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(finalResult);

    const timestamp = new Date().toISOString().replace(/[-:T\.Z]/g, '');
    const filename = `checks_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.status(200).send(csvData);
  } catch (error) {
    console.error('Error exporting checks to CSV with custom mapping:', error);
    res.status(500).send({
      error:
        'An error occurred while exporting checks to CSV with custom mapping.',
    });
  }
});

router.post(
  '/bulk-void-checks/:ownerType',
  trialMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const ownerType = req.params.ownerType;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const { checkIds } = req.body;

      const checks = await checksCollection.find({
        _id: { $in: checkIds },
        ownerId,
        ownerType,
      });

      for (const check of checks) {
        const operationAllowed = isOperationAllowed(check, CHECK_STATUS.VOID);
        if (!operationAllowed.allowed) {
          return res.status(400).send({
            error: operationAllowed.message,
          });
        }
      }

      const result = await checksCollection.updateMany(
        { _id: { $in: checkIds }, ownerId, ownerType },
        { $set: { status: 'VOID', amount: 0 } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          message:
            "No checks found with the provided IDs or status already 'VOID'.",
        });
      }

      res.status(200).json({
        message: `${result.modifiedCount} checks updated to VOID successfully.`,
      });
    } catch (error) {
      res.status(500).send({
        error: error?.message,
      });
    }
  }
);

router.get('/check/:checkId/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { ownerType, checkId } = req.params;

    const ownerId = ownerType === 'user' ? userId : organizationId;

    const check = await checksCollection
      .findOne({ ownerId, ownerType, _id: checkId })
      .populate('payeeId', 'name address email')
      .populate(
        'bankId',
        'bankName accountNumber bankRoutingNumber accountNickName'
      )
      .lean();

    if (!check) throw new Error('Check not found');

    const attachments = await AttachmentService.getAttachmentsByEntity({
      entityId: check._id,
      entityType: EntityType.CHECK,
      ownerId,
      ownerType,
    });

    const permissions = getCheckPermissions(check);

    const { payeeId, bankId, ...restCheck } = check;

    res.send({
      ...restCheck,
      payee: payeeId,
      bank: bankId,
      permissions,
      attachments,
    });
  } catch (error) {
    res.status(500).send({
      error: error?.message,
    });
  }
});

export default router;
