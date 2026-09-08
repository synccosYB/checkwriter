import express from 'express';
import { bankDataValidationMiddleware } from '../middlewares/bankData.middleware.js';
import demoRestrictionMiddleware from '../middlewares/demoRestriction.middleware.js';
import {
  banksCollection,
  checksCollection,
  usersCollection,
  organizationCollection,
} from '../models/dbCollections.js';
import { findReferencesInAllCollections } from '../utils/mongo-db.util.js';
import {
  detectDuplicateBankAccount,
  extractDuplicateFieldsFromMessage,
  getBankNameByRoutingNumber,
  getBankDetailsByRoutingNumber,
  searchBanksByName,
  getNextAvailableCheckNumber,
  isSignatureBase64String,
  removeSpaces,
} from '../services/banks.service.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../enums/auditLog.enum.js';
import { AuditLogService } from '../services/auditLog.service.js';
import { AttachmentService } from '../services/attachments.service.js';
import { EntityType } from '../models/attachment.model.js';
import { OwnerType } from '../enums/user.enum.js';
import { getBankSignatureUrl } from '../utils/signature.util.js';

const router = express.Router();

/**
 * @swagger
 * /banks/getAllBanks/{ownerType}:
 *   get:
 *     summary: Retrieve a list of banks for a user or organization
 *     description: Fetches all bank accounts associated with the specified owner type (`users` or `organizations`). Supports pagination.
 *     tags:
 *       - Banks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the banks belong to a user or an organization.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination (must be a positive number).
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of results per page (must be a positive number).
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of banks.
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
 *                         example: "65fcd90bda2943b6892dceaa"
 *                       bankName:
 *                         type: string
 *                         example: "Bank of America"
 *                       accountNumber:
 *                         type: string
 *                         example: "123456789"
 *                       bankRoutingNumber:
 *                         type: string
 *                         example: "987654321"
 *                       accountNickName:
 *                         type: string
 *                         example: "My Checking Account"
 *                 totalCount:
 *                   type: integer
 *                   example: 50
 *       400:
 *         description: Invalid page or pageSize query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid page or pageSize values. Both must be positive numbers."
 *       500:
 *         description: Internal server error while fetching banks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching banks."
 */

router.get('/getAllBanks/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { page, pageSize, status, search, includeBankId } = req.query;
    const ownerType = req.params.ownerType;

    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 1000;

    const baseFilter = {
      ownerId: ownerType === 'user' ? userId : organizationId,
      ownerType,
      status: 'active',
    };

    if (status) {
      baseFilter.status = status;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchQuery = { $regex: escapedSearch, $options: 'i' };
      baseFilter.$or = [
        { accountName: searchQuery },
        { bankName: searchQuery },
        { accountType: searchQuery },
        { accountNickName: searchQuery },
        { country: searchQuery },
      ];
    }

    const banksQuery = includeBankId
      ? {
          $or: [
            baseFilter,
            {
              _id: includeBankId.toString(),
              ownerId: baseFilter.ownerId,
              ownerType: baseFilter.ownerType,
            },
          ],
        }
      : baseFilter;

    const [result, totalCount] = await Promise.all([
      banksCollection
        .find(banksQuery)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSizeNumber)
        .limit(pageSizeNumber)
        .lean(),
      banksCollection.countDocuments(banksQuery),
    ]);

    const ownerData =
      ownerType === 'user'
        ? await usersCollection.findById(userId).lean()
        : await organizationCollection.findById(organizationId).lean();

    const updatedResult = await Promise.all(
      result.map(async (bank) => {
        const hasReferences = await findReferencesInAllCollections({
          docId: bank._id,
          fieldsToCheck: ['bankId'],
          collectionsToCheck: ['checks'],
        });

        return {
          ...bank,
          inUse: hasReferences,
          bankPreferences: {
            ...bank?.bankPreferences,
            signatureUrl: await getBankSignatureUrl({
              bankId: bank._id.toString(),
              bankPreferences: bank?.bankPreferences,
              ownerType: ownerType,
              ownerId: ownerType === 'user' ? userId : organizationId,
              defaultOwnerId: ownerType === 'user' ? userId : organizationId,
              ownerData,
            }),
          },
        };
      })
    );

    res.status(200).send({
      data: updatedResult,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).send({ error: 'An error occurred while fetching banks.' });
  }
});

/**
 * @swagger
 * /banks/addBank/{ownerType}:
 *   post:
 *     summary: Add a new bank account
 *     description: Creates a new bank account for a user or an organization. The request body is validated using `bankDataValidationMiddleware`.
 *     tags:
 *       - Banks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the bank account belongs to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *                 example: "Bank of America"
 *               accountNumber:
 *                 type: string
 *                 example: "123456789"
 *               bankRoutingNumber:
 *                 type: string
 *                 example: "987654321"
 *               accountNickName:
 *                 type: string
 *                 example: "My Checking Account"
 *     responses:
 *       200:
 *         description: Successfully added the bank account.
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
 *                       example: "65fcd90bda2943b6892dceaa"
 *                     bankName:
 *                       type: string
 *                       example: "Bank of America"
 *                     accountNumber:
 *                       type: string
 *                       example: "123456789"
 *                     bankRoutingNumber:
 *                       type: string
 *                       example: "987654321"
 *                     accountNickName:
 *                       type: string
 *                       example: "My Checking Account"
 *                 message:
 *                   type: string
 *                   example: "Bank added successfully"
 *       500:
 *         description: Internal server error while adding the bank account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while adding the bank."
 */

router.post(
  '/addBank/:ownerType/:countryCode',
  demoRestrictionMiddleware,
  bankDataValidationMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;

      const payload = req.body;
      const { ownerType, countryCode } = req.params;

      const ownerId = ownerType === 'user' ? userId : organizationId;
      if (!ownerId) {
        return res.status(400).json({
          message:
            ownerType === 'organization'
              ? 'No organization is selected. Please select an organization and try again.'
              : 'You must be signed in to add a bank account.',
          error: {
            type: 'validation',
            field: 'ownerId',
            reason: `Missing ${ownerType} id on request`,
          },
        });
      }

      const signaturePayload = payload.bankPreferences?.signatureUrl;

      const isValidString = isSignatureBase64String(signaturePayload);

      let signatureUrl = '';

      await detectDuplicateBankAccount({
        ownerId,
        accountNumber: payload.accountNumber,
        bankRoutingNumber: payload.bankRoutingNumber,
        bankTransitNumber: payload.bankTransitNumber,
        countryCode,
      });

      if (isValidString) {
        // Parse base64 string and prepare for upload after bank creation
        const match = signaturePayload.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          const contentType = match[1];
          signatureUrl = 'pending'; // Placeholder - will be set after bank creation
        }
      }

      const updatedPayload = {
        ...payload,
        bankPreferences: {
          ...payload?.bankPreferences,
          signatureUrl: isValidString ? signatureUrl : signaturePayload,
        },
      };

      const result = await banksCollection.create({
        ...updatedPayload,
        ownerId,
        ownerType,
      });

      // If we have a signature to upload, do it now with the bank ID.
      // If upload fails, roll back the bank insert so the user sees a
      // truthful failure (the signature error message) instead of a
      // half-saved record with a silent server-side warning.
      if (isValidString) {
        try {
          const match = signaturePayload.match(
            /^data:(image\/\w+);base64,(.+)$/
          );
          if (match) {
            const contentType = match[1];
            const buffer = Buffer.from(match[2], 'base64');

            const file = {
              buffer,
              originalname: `signature_${removeSpaces(payload?.bankName)}.${
                contentType.split('/')[1]
              }`,
              mimetype: contentType,
              size: buffer.length,
              description: `Bank signature for ${payload?.bankName}`,
            };

            const attachments = await AttachmentService.createAttachments({
              files: [file],
              entityType: EntityType.BANKS,
              entityId: result._id.toString(),
              ownerType: ownerType,
              ownerId,
              uploadedBy: userId,
            });

            const attachment = attachments[0];
            const downloadResult = await AttachmentService.downloadAttachment({
              attachmentId: attachment._id.toString(),
              ownerType: ownerType,
              userId: ownerId,
            });

            await banksCollection.findByIdAndUpdate(result._id, {
              'bankPreferences.signatureAttachmentId': attachment._id,
              'bankPreferences.signatureUrl': downloadResult.url,
            });

            signatureUrl = downloadResult.url;
          }
        } catch (signatureError) {
          console.error(
            'Error uploading bank signature after creation, rolling back bank:',
            signatureError
          );
          try {
            await banksCollection.findByIdAndDelete(result._id);
          } catch (rollbackError) {
            console.error(
              'Failed to roll back bank after signature upload error:',
              rollbackError
            );
          }
          return res.status(502).json({
            message:
              "We couldn't save your signature for this bank account. Please try again, or turn off the signature toggle and add it later.",
            error: {
              type: 'signature_upload',
              reason: signatureError?.message || 'Signature upload failed',
            },
          });
        }
      }

      await AuditLogService.logAction({
        entityType: AUDIT_ENTITY_TYPES.banks,
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
        .send({ data: result, message: 'Bank added successfully' });
    } catch (error) {
      console.error('Error in /addBank:', error);

      if (error?.code === 'DUPLICATE_BANK') {
        return res.status(409).json({
          message:
            'A bank account with these details already exists for this owner.',
          error: {
            accountId: error?.duplicateBankId,
            type: 'duplicate',
            reason: error.message,
            fields: extractDuplicateFieldsFromMessage(error.message),
          },
        });
      }

      res.status(500).json({
        message:
          "We couldn't save this bank account. Please try again or contact support if the problem persists.",
        error: {
          type: 'server',
          reason: error?.message || 'Internal Server Error',
        },
      });
    }
  }
);

/**
 * @swagger
 * /banks/updateBank/{ownerType}/{bankId}:
 *   put:
 *     summary: Update a bank account
 *     description: Updates the details of an existing bank account for a user or an organization.
 *     tags:
 *       - Banks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the bank account belongs to a user or an organization.
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the bank account to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *                 example: "Chase Bank"
 *               accountNumber:
 *                 type: string
 *                 example: "987654321"
 *               bankRoutingNumber:
 *                 type: string
 *                 example: "123456789"
 *               accountNickName:
 *                 type: string
 *                 example: "Savings Account"
 *     responses:
 *       200:
 *         description: Successfully updated the bank account.
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
 *                       example: "65fcd90bda2943b6892dceaa"
 *                     bankName:
 *                       type: string
 *                       example: "Chase Bank"
 *                     accountNumber:
 *                       type: string
 *                       example: "987654321"
 *                     bankRoutingNumber:
 *                       type: string
 *                       example: "123456789"
 *                     accountNickName:
 *                       type: string
 *                       example: "Savings Account"
 *                 message:
 *                   type: string
 *                   example: "Bank updated successfully"
 *       500:
 *         description: Internal server error while updating the bank account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the bank."
 */

router.put('/updateBank/:ownerType/:bankId/:countryCode', demoRestrictionMiddleware, bankDataValidationMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { bankId, ownerType, countryCode } = req.params;
    const organizationId = req.organizationId;

    const ownerId = ownerType === 'user' ? userId : organizationId;
    if (!ownerId) {
      return res.status(400).json({
        message:
          ownerType === 'organization'
            ? 'No organization is selected. Please select an organization and try again.'
            : 'You must be signed in to update a bank account.',
        error: {
          type: 'validation',
          field: 'ownerId',
          reason: `Missing ${ownerType} id on request`,
        },
      });
    }

    const payload = req.body;

    const signaturePayload = payload.bankPreferences?.signatureUrl;

    // Fetch the existing bank account
    const existingBank = await banksCollection.findById(bankId);
    if (!existingBank) {
      return res.status(404).json({
        error: { type: 'not_found', reason: 'Bank account not found' },
      });
    }

    // Check if any of the identifying fields have changed
    const hasIdentifyingInfoChanged =
      payload.accountNumber !== existingBank.accountNumber ||
      (countryCode === 'CANADA'
        ? payload.bankTransitNumber !== existingBank.bankTransitNumber
        : payload.bankRoutingNumber !== existingBank.bankRoutingNumber);

    if (hasIdentifyingInfoChanged) {
      await detectDuplicateBankAccount({
        ownerId,
        accountNumber: payload.accountNumber,
        bankRoutingNumber: payload.bankRoutingNumber,
        bankTransitNumber: payload.bankTransitNumber,
        countryCode,
        existingBankId: bankId,
      });
    }

    const isValidString = isSignatureBase64String(signaturePayload || '');

    let signatureUrl = '';

    let signatureAttachmentId = null;

    if (isValidString) {
      try {
        // Parse base64 string
        const match = signaturePayload.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          const contentType = match[1];
          const buffer = Buffer.from(match[2], 'base64');

          const file = {
            buffer,
            originalname: `signature_${removeSpaces(payload?.bankName)}.${
              contentType.split('/')[1]
            }`,
            mimetype: contentType,
            size: buffer.length,
            description: `Bank signature for ${payload?.bankName}`,
          };

          const attachments = await AttachmentService.createAttachments({
            files: [file],
            entityType: EntityType.BANKS,
            entityId: bankId,
            ownerType: ownerType,
            ownerId,
            uploadedBy: userId,
          });

          // Get download URL
          const attachment = attachments[0];
          const result = await AttachmentService.downloadAttachment({
            attachmentId: attachment._id.toString(),
            ownerType: ownerType,
            userId: ownerId,
          });

          signatureUrl = result.url;
          signatureAttachmentId = attachment._id;
        }
      } catch (error) {
        console.error('Error handling bank signature upload:', error);
        throw error;
      }
    }

    const updatedPayload = {
      ...payload,
      bankPreferences: {
        ...payload?.bankPreferences,
        signatureUrl: signatureUrl
          ? signatureUrl
          : existingBank.bankPreferences?.signatureUrl,
        signatureAttachmentId: signatureAttachmentId
          ? signatureAttachmentId
          : existingBank.bankPreferences?.signatureAttachmentId,
      },
    };

    const result = await banksCollection.findOneAndUpdate(
      {
        _id: bankId,
        ownerId,
        ownerType,
      },
      updatedPayload,
      { new: true }
    );
    if (result) {
      await AuditLogService.logAction({
        entityType: AUDIT_ENTITY_TYPES.banks,
        action: AUDIT_ACTIONS.Updated,
        userId: userId,
        entityId: result._id,
        ownerId: result.ownerId,
        ownerType: result.ownerType,
        oldData: existingBank._doc,
        newData: result._doc,
      });
    }

    res.send({ data: result, message: 'Bank updated successfully' });
  } catch (error) {
    console.error('Error in /updateBank:', error);

    if (error?.code === 'DUPLICATE_BANK') {
      return res.status(409).json({
        message:
          'A bank account with these details already exists for this owner.',
        error: {
          accountId: error?.duplicateBankId,
          type: 'duplicate',
          reason: error.message,
          fields: extractDuplicateFieldsFromMessage(error.message),
        },
      });
    }

    res.status(500).json({
      message:
        "We couldn't update this bank account. Please try again or contact support if the problem persists.",
      error: {
        type: 'server',
        reason: error?.message || 'Internal Server Error',
      },
    });
  }
});

/**
 * @swagger
 * /banks/deleteBank/{ownerType}/{bankId}:
 *   delete:
 *     summary: Delete a bank account
 *     description: Deletes a bank account associated with a user or an organization.
 *     tags:
 *       - Banks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the bank account belongs to a user or an organization.
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the bank account to be deleted.
 *     responses:
 *       200:
 *         description: Successfully deleted the bank account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example:
 *                     _id: "65fcd90bda2943b6892dceaa"
 *                     bankName: "Chase Bank"
 *                     accountNumber: "987654321"
 *                     bankRoutingNumber: "123456789"
 *                     accountNickName: "Savings Account"
 *                 message:
 *                   type: string
 *                   example: "Bank deleted successfully"
 *       404:
 *         description: Bank account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bank not found"
 *       500:
 *         description: Internal server error while deleting the bank account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while deleting the bank."
 */
router.delete('/deleteBank/:ownerType/:bankId', demoRestrictionMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { bankId, ownerType } = req.params;
    const organizationId = req.organizationId;

    const areReferences = await findReferencesInAllCollections({
      docId: bankId,
      fieldsToCheck: ['bankId'],
      collectionsToCheck: ['checks'],
    });

    if (areReferences) {
      return res.status(400).send({
        message: 'Cannot delete bank because it is in use.',
      });
    }

    const result = await banksCollection.findOneAndDelete({
      _id: bankId,
      ownerId: ownerType === 'user' ? userId : organizationId,
      ownerType,
    });

    if (result) {
      await AuditLogService.logAction({
        entityType: AUDIT_ENTITY_TYPES.banks,
        action: AUDIT_ACTIONS.Deleted,
        userId: userId,
        entityId: result._id,
        ownerId: result.ownerId,
        ownerType: result.ownerType,
        oldData: result,
        newData: null,
      });
    }

    res.send({ data: result, message: 'Bank deleted successfully' });
  } catch (error) {
    res.status(500).send({ error });
  }
});

/**
 * @swagger
 * /banks/next-available-check-number/{ownerType}/{bankId}:
 *   get:
 *     summary: Get the next available check number
 *     description: Retrieves the next available check number for a bank account associated with a user or an organization.
 *     tags:
 *       - Banks
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the bank account belongs to a user or an organization.
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the bank account.
 *     responses:
 *       200:
 *         description: Successfully retrieved the next available check number.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nextAvailableCheckNumber:
 *                   type: integer
 *                   example: 105
 *                 message:
 *                   type: string
 *                   example: "Next available check number"
 *       404:
 *         description: Bank account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bank not found"
 *       500:
 *         description: Internal server error while retrieving the check number.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while retrieving the next available check number."
 */

router.get(
  '/next-available-check-number/:ownerType/:bankId',
  async (req, res) => {
    try {
      const userId = req.userId;
      const { ownerType, bankId } = req.params;
      const organizationId = req.organizationId;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      let nextAvailableCheckNumber = await getNextAvailableCheckNumber({
        ownerId,
        ownerType,
        bankId,
      });

      res.send({
        nextAvailableCheckNumber,
        message: 'Next available check number',
      });
    } catch (error) {
      res.status(500).send({ error: error?.message });
    }
  }
);

router.post('/detect-duplicates/:ownerId', async (req, res) => {
  try {
    const { key, value } = req.body;
    const { ownerId } = req.params;

    let query = { ownerId: ownerId.toString() };

    switch (key) {
      case 'accountNumber':
        query.accountNumber = +value;
        break;
      case 'bankRoutingNumber':
        query.bankRoutingNumber = +value;
        break;
      case 'bankTransitNumber':
        query.bankTransitNumber = +value;
        break;
      case 'bankPreferences.defaultCheckStartNumber':
        query['bankPreferences.defaultCheckStartNumber'] = +value;
        break;
      default:
        return res.status(400).json({ error: 'Invalid key provided.' });
    }

    const duplicate = await banksCollection.countDocuments(query);

    if (duplicate > 0) {
      return res.status(200).json({
        message: `${key}: ${value} already exists.`,
        isDuplicate: true,
      });
    }
    return res
      .status(200)
      .json({ message: 'No duplicates found.', isDuplicate: false });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

router.post(
  '/validate-manual-check-number/:ownerType/:bankId',
  async (req, res) => {
    try {
      const userId = req.userId;
      const { bankId, ownerType } = req.params;
      const organizationId = req.organizationId;

      const { checkNumber } = req.body;
      const check = await checksCollection
        .findOne({
          ownerId: ownerType === 'user' ? userId : organizationId,
          ownerType,
          bankId,
          checkNumber,
        })
        .lean();

      if (check) {
        return res.status(200).json({
          message: 'Check number already exists.',
          isDuplicate: true,
        });
      }

      return res.status(200).json({
        message: 'Check number is available.',
        isDuplicate: false,
      });
    } catch (error) {
      res.status(500).send({ error });
    }
  }
);

router.get('/get-bank/:bankId/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { bankId, ownerType } = req.params;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const bank = await banksCollection.findOne({ _id: bankId, ownerId }).lean();

    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }

    res.status(200).json({ data: bank });
  } catch (error) {
    console.error('Error fetching bank:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the bank.' });
  }
});

/**
 * @swagger
 * /banks/lookup:
 *   get:
 *     summary: Look up bank details by U.S. routing number
 *     description: >
 *       Given a 9-digit ABA routing number, returns full bank details including
 *       name, address, and logo URL. If no bank is found, returns `{ bank: null }`.
 *     tags:
 *       - Banks
 *     parameters:
 *       - in: query
 *         name: rn
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{9}$'
 *         description: 9-digit U.S. ABA routing number.
 *         example: "021000021"
 *     responses:
 *       200:
 *         description: Bank details result (null if not found).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bank:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       example: "JPMORGAN CHASE BANK, N.A."
 *                     routingNumber:
 *                       type: string
 *                       example: "021000021"
 *                     address1:
 *                       type: string
 *                       nullable: true
 *                       example: "1 CHASE MANHATTAN PLAZA"
 *                     city:
 *                       type: string
 *                       nullable: true
 *                       example: "NEW YORK"
 *                     state:
 *                       type: string
 *                       nullable: true
 *                       example: "NY"
 *                     zip:
 *                       type: string
 *                       nullable: true
 *                       example: "10005"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     logoUrl:
 *                       type: string
 *                       nullable: true
 *             examples:
 *               found:
 *                 summary: Bank found
 *                 value:
 *                   bank:
 *                     bankName: "JPMORGAN CHASE BANK, N.A."
 *                     routingNumber: "021000021"
 *                     address1: "1 CHASE MANHATTAN PLAZA"
 *                     city: "NEW YORK"
 *                     state: "NY"
 *                     zip: "10005"
 *                     phone: "212-270-6000"
 *                     logoUrl: "https://logo.clearbit.com/chase.com"
 *               notFound:
 *                 summary: No match
 *                 value:
 *                   bank: null
 *       500:
 *         description: Unexpected server error.
 */

router.get('/lookup', async (req, res) => {
  const rn = (req.query.rn || '').trim();
  if (!rn || !/^\d{9}$/.test(rn)) {
    return res.status(200).send({ bank: null });
  }
  const bank = await getBankDetailsByRoutingNumber(rn);
  return res.status(200).send({ bank });
});

router.get('/search', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name || name.length < 2) {
    return res.status(200).send({ banks: [] });
  }
  const banks = await searchBanksByName(name);
  return res.status(200).send({ banks });
});

export default router;
