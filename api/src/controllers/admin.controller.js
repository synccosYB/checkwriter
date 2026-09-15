import express from 'express';
import { getUserSignatureBase64 } from '../utils/signature.util.js';
import {
  actAsUser,
  addUser,
  findUserByEmail,
  getAllRegisterUsers,
  stopActUser,
  updateUserRole,
} from '../services/users.service.js';
import { USER_ROLES } from '../constants/index.js';
import {
  addDefaultMfaMethod,
  addDefaultTags,
  manageAuthenticationService,
} from '../services/authentication.service.js';
import {
  addressesCollection,
  checksCollection,
  mailedChecksCollection,
  mailsBatchCollection,
  organizationCollection,
  userToOrganizationCollection,
  usersCollection,
  usersSubscriptionCollection,
  adminMessagesCollection,
} from '../models/dbCollections.js';
import { checkWriterDb } from '../utils/mongo-db.util.js';
import {
  checkPreRequisitesForBatching,
  getMailingStats,
  getTotalUserStats,
  groupChecksByUserId,
  adminActivateUser,
  adminDeactivateUser,
  adminSetSubscriptionPriceOverride,
  adminSetFullAccessOverride,
  adminListChecks,
  adminGetCheck,
  adminUpdateCheck,
  adminDeleteCheck,
  adminVoidCheck,
  adminListBanks,
  adminGetBank,
  adminUpdateBank,
  adminDeleteBank,
  adminListPayees,
  adminGetPayee,
  adminUpdatePayee,
  adminDeletePayee,
  adminListTransactions,
  adminGetTransaction,
  adminListOrganizations,
  adminGetOrganization,
  adminUpdateOrganization,
  adminDeleteOrganization,
  adminListAuditLogs,
  adminGetAuditLog,
  adminListPlatformSettings,
  adminGetPlatformSetting,
  adminUpsertPlatformSetting,
  adminGetIntegrationsOverview,
  adminGetQuickbooksIntegrations,
  adminGetStripeIntegrations,
  adminGetPlaidIntegrations,
  adminListAttachments,
  adminListCheckImports,
  createAuditLog,
} from '../services/admin.service.js';
import {
  compileTemplate,
  compileWrapperTemplate,
  generatePDFBuffer,
} from '../utils/checkEmail/checkEmail.utils.js';
import SubscriptionService from '../services/stripe.service.js';
import { CHECK_MAILED_STATUS } from '../enums/checks.enum.js';
import { generateToken } from '../utils/jwt.util.js';
import { sendForgotPasswordMail, sendAdminSupportEmail, sendRefundReceiptEmail } from '../services/email.service.js';
import { getPasswordResetUrl } from '../utils/password-reset-url.util.js';
import { adminSupportEmailTemplate } from '../utils/email-templates.util.js';
import moment from 'moment';
import { StripeSubscriptionWebhookService } from '../services/stripeWebhook.service.js';
import config from 'config';
import Stripe from 'stripe';
import { addMailchimpContactWithTag } from '../services/mailChimpService.js';
import {
  migrateSignaturesToAttachments,
  rollbackSignatureMigration,
} from '../migrations/signatureMigration.js';
import {
  adminListScheduledJobRuns,
  adminGetScheduledJobJobNames,
  adminGetScheduledJobRunsSummary,
} from '../services/adminScheduledJobs.service.js';

const {
  stripe_subscription: { stripe_secret_key, checkwriter_product_id },
} = config;

export const stripe = new Stripe(stripe_secret_key);
import { CheckMailingEmailService } from '../services/checkMail.service.js';
import adminPrivilageMiddleware from '../middlewares/adminPrivilage.middleware.js';
import { buildMongoSort } from '../utils/listSort.util.js';
import {
  MAILED_CHECKS_SORTABLE_FIELDS,
  parseMailedChecksSort,
  getSortedMailedCheckIdsPage,
} from '../services/mailedChecks.service.js';

export { MAILED_CHECKS_SORTABLE_FIELDS };

const router = express.Router();

router.use(adminPrivilageMiddleware);

/**
 * @swagger
 * /admin/users:
 *
 *   get:
 *     summary: Get all register users
 *     description: Retrieve all users.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         description: Name to search.
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageSize
 *         required: false
 *         description: Page size required.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         description: Page Number required.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         required: false
 *         description: Sort by name,email, recent.
 *         schema:
 *           type: string
 *       - in: query
 *         name: subscriptionStatuses
 *         required: false
 *         description: Subscription statuses to filter by. Accepts an array of strings (e.g., ["trialing", "active","cancelling","No Subscription"]).
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             collectionFormat: multi
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

router.get('/users', async (req, res, next) => {
  try {
    let { search, pageSize, pageNumber, subscriptionStatuses, sortBy, sortOrder, startDate, endDate } =
      req.query;

    if (subscriptionStatuses) {
      subscriptionStatuses = Array.isArray(subscriptionStatuses)
        ? subscriptionStatuses.map((s) => s.trim()).filter(Boolean)
        : subscriptionStatuses
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    } else {
      subscriptionStatuses = [];
    }

    pageSize = parseInt(pageSize, 10);
    pageNumber = parseInt(pageNumber, 10);

    if (
      isNaN(pageSize) ||
      pageSize <= 0 ||
      isNaN(pageNumber) ||
      pageNumber <= 0
    ) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const userDetails = await getAllRegisterUsers(
      pageSize,
      pageNumber,
      search,
      subscriptionStatuses,
      sortBy,
      startDate,
      endDate,
      sortOrder
    );
    return res.status(200).json(userDetails);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/act-as-user:
 *   post:
 *     summary: Act as user (Impersonate a user)
 *     description: Allows a Super Admin to impersonate another user by generating a session token with the impersonated user's ID and the Super Admin's ID.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to impersonate.
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: Impersonation token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The session token that allows impersonating the user.
 *                   example: "jwt.token.generated.for.impersonation"
 *       400:
 *         description: Bad request, missing userId or other parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "userId is required"
 *       401:
 *         description: Unauthorized, Super Admin privileges required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied. Super Admin only."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
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

router.post('/act-as-user', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const adminId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const userDetail = await actAsUser(userId, adminId);

    await manageAuthenticationService({
      userId,
      refreshToken: userDetail.refreshToken,
      mode: 'standard',
    });

    return res.status(200).json(userDetail);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/stop-act-as-user:
 *   get:
 *     summary: Stop impersonating a user and restore the Super Admin session
 *     description: Ends the impersonation session and restores the Super Admin's original session.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Impersonation session ended successfully and new token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Impersonation session ended"
 *                 token:
 *                   type: string
 *                   description: "The session token for the Super Admin after ending the impersonation session."
 *                   example: "jwt.token.generated.for.super.admin"
 *       401:
 *         description: Unauthorized, invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       403:
 *         description: Forbidden, only Super Admin impersonating a user can stop impersonation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only Super Admins impersonating a user can stop impersonation."
 *       404:
 *         description: Super Admin not found or unable to restore session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Super Admin not found"
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

router.get('/stop-act-as-user', async (req, res, next) => {
  try {
    const adminId = req.adminId;
    const userDetail = await stopActUser(adminId);

    await manageAuthenticationService({
      userId: adminId,
      refreshToken: userDetail.refreshToken,
    });

    return res.status(200).json(userDetail);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/updateUser:
 *   put:
 *     summary: Update a user's role
 *     description: Allows a Super Admin to update a user's role to either 'Admin' or 'Super Admin'.
 *     tags:
 *         - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to be updated.
 *                 example: "user123"
 *               role:
 *                 type: string
 *                 enum: [Admin, Super Admin]
 *                 description: The new role for the user. Can be either 'Admin' or 'Super Admin'.
 *                 example: "Admin"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     role:
 *                       type: string
 *                       example: "Admin"
 *       400:
 *         description: Bad request, invalid user ID or role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user ID or role"
 *       401:
 *         description: Unauthorized, only Super Admins can update roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied. Only Super Admins can update user roles."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
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

router.put('/update-user-role', async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const validRoles = [USER_ROLES.USER, USER_ROLES.SUPERADMIN];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `'${role}' is not a valid role. Allowed roles are ${USER_ROLES.USER} or ${USER_ROLES.SUPERADMIN}.`,
      });
    }

    // Optionally, validate 'userId' format if required (e.g., MongoDB ObjectId)
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const userDetail = await updateUserRole(userId, role);
    return res.status(200).json(userDetail);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/checks/mailed:
 *   post:
 *     summary: Retrieve mailed checks
 *     description: Fetches mailed checks with optional filters for status and owner ID. Supports pagination with a default page size of 1000.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter checks by status.
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filter checks by owner ID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1000
 *         description: Number of results per page (default is 1000).
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
 *                       status:
 *                         type: string
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                       payee:
 *                         type: object
 *                         properties:
 *                           name:
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
 *                       check:
 *                         type: object
 *                         properties:
 *                           checkNumber:
 *                             type: string
 *                 totalCount:
 *                   type: integer
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

router.get('/checks/mailed', async (req, res) => {
  try {
    const { page, pageSize, status, ownerId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (ownerId) filter.ownerId = ownerId;

    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 1000;

    if (pageNumber < 1 || pageSizeNumber < 1) {
      return res.status(400).send({
        error:
          'Invalid page or pageSize values. Both must be positive numbers.',
      });
    }

    const parsedSort = parseMailedChecksSort(req.query);

    // Joined sort columns (check no., payee, account, organization, batch
    // number) cannot be expressed as a Mongoose `.sort()` because the values
    // live on populated documents. Resolve the ordered _ids for the page via
    // a SQL query first, then load the same rows through the existing
    // populate pipeline so behaviour is otherwise identical to the default
    // path. _id desc is appended as a stable tiebreaker.
    let checks;
    if (parsedSort && parsedSort.spec.kind === 'joined') {
      const orderedIds = await getSortedMailedCheckIdsPage({
        filter,
        sort: parsedSort,
        skip: (pageNumber - 1) * pageSizeNumber,
        limit: pageSizeNumber,
      });

      if (orderedIds.length === 0) {
        checks = [];
      } else {
        const pageRows = await mailedChecksCollection
          .find({ _id: { $in: orderedIds } })
          .populate({
            path: 'checkId',
            populate: [{ path: 'payeeId' }, { path: 'bankId' }],
          })
          .populate({ path: 'batchId', populate: [{ path: 'createdBy' }] })
          .lean();

        const byId = new Map(
          pageRows.map((r) => [r._id?.toString?.() ?? r._id, r])
        );
        checks = orderedIds
          .map((id) => byId.get(id?.toString?.() ?? id))
          .filter(Boolean);
      }
    } else {
      const sortSpec = parsedSort && parsedSort.spec.kind === 'column'
        ? buildMongoSort(
            { sortOrder: parsedSort.sortOrder, fields: parsedSort.spec.fields },
            { createdAt: -1, _id: -1 },
          )
        : { createdAt: -1, _id: -1 };

      checks = await mailedChecksCollection
        .find(filter)
        .sort(sortSpec)
        .populate({
          path: 'checkId',
          populate: [{ path: 'payeeId' }, { path: 'bankId' }],
        })
        .populate({ path: 'batchId', populate: [{ path: 'createdBy' }] })
        .skip((pageNumber - 1) * pageSizeNumber)
        .limit(pageSizeNumber)
        .lean();
    }

    // Extract unique owner IDs based on type
    const userOwnerIds = [
      ...new Set(
        checks.filter((c) => c.ownerType === 'user').map((c) => c.ownerId)
      ),
    ];
    const orgOwnerIds = [
      ...new Set(
        checks
          .filter((c) => c.ownerType === 'organization')
          .map((c) => c.ownerId)
      ),
    ];

    // Fetch users and organizations separately
    const users = await usersCollection
      .find({ _id: { $in: userOwnerIds } })
      .select('firstName lastName email') // Fetch user details
      .lean();

    const organizations = await organizationCollection
      .find({ _id: { $in: orgOwnerIds } })
      .select('organizationName')
      .lean();

    const orgUserLinks = orgOwnerIds.length > 0
      ? await userToOrganizationCollection.find({ organizationId: { $in: orgOwnerIds } }).lean()
      : [];
    // Pick the same "primary" link the joined-sort path uses (lowest _id per
    // organization) so the displayed account name matches the value we
    // sorted by when sortBy=account.
    const sortedOrgUserLinks = [...orgUserLinks].sort((a, b) => {
      const aId = a._id?.toString?.() ?? a._id ?? '';
      const bId = b._id?.toString?.() ?? b._id ?? '';
      return aId < bId ? -1 : aId > bId ? 1 : 0;
    });
    const orgToUserIdMap = {};
    for (const link of sortedOrgUserLinks) {
      if (!orgToUserIdMap[link.organizationId]) {
        orgToUserIdMap[link.organizationId] = link.userId;
      }
    }
    const orgUserIds = [...new Set(Object.values(orgToUserIdMap))].filter(Boolean);
    const orgUsers = orgUserIds.length > 0
      ? await usersCollection.find({ _id: { $in: orgUserIds } }).select('firstName lastName email').lean()
      : [];
    const orgUserMap = Object.fromEntries(orgUsers.map((u) => [u._id.toString(), u]));

    const userMap = Object.fromEntries(
      users.map((user) => [user._id.toString(), user])
    );
    const orgMap = Object.fromEntries(
      organizations.map((org) => [org._id.toString(), org])
    );

    const finalResult = checks.map(
      ({ checkId, ownerId, ownerType, batchId, ...item }) => {
        let user = null;
        let organization = {};

        if (ownerType === 'user') {
          user = userMap[ownerId] || null;
        } else if (ownerType === 'organization') {
          organization = orgMap[ownerId] || {};
          const primaryUserId = orgToUserIdMap[ownerId];
          user = primaryUserId ? orgUserMap[primaryUserId] || null : null;
        }

        return {
          ...item,
          check: checkId,
          batch: batchId,
          payee: checkId?.payeeId,
          bank: checkId?.bankId,
          user,
          organization,
        };
      }
    );

    const totalCount = await mailedChecksCollection.countDocuments(filter);

    res.status(200).send({ data: finalResult, totalCount });
  } catch (error) {
    res.status(500).send({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /admin/mail-batches:
 *   get:
 *     summary: Retrieve a paginated list of mail batches
 *     description: Fetches mail batches along with mailed checks details, including processing and mailed counts. Supports pagination.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number (must be a positive integer).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of records per page (must be a positive integer).
 *     responses:
 *       200:
 *         description: A paginated list of mail batches.
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
 *                       batchNumber:
 *                         type: string
 *                         description: Unique batch number.
 *                       processedBy:
 *                         type: string
 *                         description: The user who processed the batch.
 *                       mailedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the batch was mailed.
 *                       status:
 *                         type: string
 *                         description: The status of the mail batch.
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         description: The total amount in the batch.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the batch was created.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the batch was last updated.
 *                       totalChecks:
 *                         type: integer
 *                         description: Total number of checks in the batch.
 *                       processingCount:
 *                         type: integer
 *                         description: Number of checks still in processing.
 *                       mailedCount:
 *                         type: integer
 *                         description: Number of checks that have been mailed.
 *                       user:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             description: First name of the user who created the batch.
 *                           lastName:
 *                             type: string
 *                             description: Last name of the user who created the batch.
 *                 totalCount:
 *                   type: integer
 *                   description: The total number of mail batches available.
 *       400:
 *         description: Invalid page or pageSize values.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the issue.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get(`/mail-batches`, async (req, res) => {
  try {
    const { page, pageSize } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 10;

    if (pageNumber < 1 || pageSizeNumber < 1) {
      return res.status(400).send({
        error:
          'Invalid page or pageSize values. Both must be positive numbers.',
      });
    }

    const mailBatches = await mailsBatchCollection.aggregate([
      {
        $lookup: {
          from: 'mailed_checks', // Ensure correct collection name
          localField: 'mailed_checks',
          foreignField: '_id',
          as: 'mailedChecksDetails',
        },
      },
      {
        $addFields: {
          totalChecks: { $size: '$mailedChecksDetails' }, // Total checks
          processingCount: {
            $size: {
              $filter: {
                input: '$mailedChecksDetails',
                as: 'check',
                cond: { $eq: ['$$check.status', 'Processing'] },
              },
            },
          },
          mailedCount: {
            $size: {
              $filter: {
                input: '$mailedChecksDetails',
                as: 'check',
                cond: { $eq: ['$$check.status', 'Mailed'] },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByDetails',
        },
      },
      {
        $unwind: {
          path: '$createdByDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          batchNumber: 1,
          processedBy: 1,
          mailedAt: 1,
          status: 1,
          totalAmount: 1,
          createdAt: 1,
          updatedAt: 1,
          totalChecks: 1,
          processingCount: 1,
          mailedCount: 1,
          user: {
            firstName: '$createdByDetails.firstName',
            lastName: '$createdByDetails.lastName',
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          paginatedResults: [
            { $skip: (pageNumber - 1) * pageSizeNumber },
            { $limit: pageSizeNumber },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    const finalMapping = mailBatches[0].paginatedResults;
    const totalCount =
      mailBatches[0].totalCount.length > 0
        ? mailBatches[0].totalCount[0].count
        : 0;

    res.status(200).send({ data: finalMapping, totalCount });
  } catch (error) {
    res.status(500).send({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /admin/create-check-batch:
 *   post:
 *     summary: Create a new check batch
 *     description: Creates a batch for mailed checks that are in 'Submitted' status. Checks can be specified manually or all pending checks can be batched at once.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mailCheckIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of check IDs to be included in the batch. Required if `batchAllPending` is not set.
 *               batchAllPending:
 *                 type: boolean
 *                 description: If set to `true`, batches all checks in 'Submitted' status.
 *     responses:
 *       201:
 *         description: Check batch created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Check batch created successfully.
 *                 batchId:
 *                   type: string
 *                   description: The ID of the newly created batch.
 *                 numberOfChecks:
 *                   type: integer
 *                   description: The number of checks included in the batch.
 *                 totalAmount:
 *                   type: number
 *                   format: float
 *                   description: The total amount of all checks in the batch.
 *                 batchNumber:
 *                   type: string
 *                   description: Unique batch number assigned to the batch.
 *                 createdAt:
 *                   type: string
 *                   format: date
 *                   description: The creation date of the batch.
 *       400:
 *         description: No valid checks found for processing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No valid checks found for processing.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post('/create-check-batch', async (req, res) => {
  const session = await checkWriterDb.startSession();
  try {
    const { mailCheckIds, batchAllPending } = req.body;

    if (!mailCheckIds && !batchAllPending) {
      return res.status(400).json({
        error: 'Provide either mailCheckIds or set batchAllPending=true.',
      });
    }

    const preReqError = await checkPreRequisitesForBatching(req, res);
    if (preReqError) return;

    session.startTransaction();

    // Build filter
    const baseFilter = { status: 'Submitted' };
    if (mailCheckIds?.length) {
      baseFilter._id = {
        $in: mailCheckIds.map((id) => id.toString()),
      };
    }

    // Find submitted checks with base filter
    const submitted = await mailedChecksCollection
      .find(baseFilter)
      .populate('checkId', 'checkNumber')
      .lean()
      .session(session);

    if (mailCheckIds && submitted.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: 'No valid checks found for processing.' });
    }

    // Eligible = submitted + charged
    const eligible = submitted.filter((mc) => mc.chargeId);

    // Results container
    const results = {
      successfulChecks: [],
      failedChecks: [],
      totalProcessed: mailCheckIds?.length ?? submitted.length,
      totalSuccessful: 0,
      totalFailed: 0,
      totalAmount: 0,
    };

    // Mark submitted-but-not-eligible as Error
    const ineligible = submitted.filter(
      (mc) => !eligible.find((e) => String(e._id) === String(mc._id))
    );

    for (const mc of ineligible) {
      await mailedChecksCollection.updateOne(
        { _id: mc._id },
        {
          $set: { status: 'Error' },
          $push: {
            errors: {
              description: 'Missing chargeId or not charged',
              userId: req.userId,
            },
          },
        },
        { session }
      );

      results.failedChecks.push({
        checkId: mc._id,
        amount: mc.chargeAmount ?? 0,
        reason: 'Missing chargeId',
      });
    }

    // If explicit IDs, mark missing ones as Error too
    if (mailCheckIds) {
      const submittedIds = new Set(submitted.map((mc) => String(mc._id)));
      const missing = mailCheckIds.filter(
        (id) => !submittedIds.has(String(id))
      );
      for (const id of missing) {
        await mailedChecksCollection.updateOne(
          { _id: id },
          {
            $set: { status: 'Error' },
            $push: {
              errors: {
                description: 'Not found or not in Submitted status',
                userId: req.userId,
              },
            },
          },
          { session }
        );

        results.failedChecks.push({
          checkId: id,
          amount: 0,
          reason: 'Not found or not in Submitted status',
        });
      }
    }

    if (eligible.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'No eligible checks found. All marked as Error.',
        results,
      });
    }

    // Create new batch for eligible
    const newBatch = await mailsBatchCollection.create({
      processedBy: req.userId,
      status: 'Processing',
      mailed_checks: eligible.map((mc) => mc._id),
      totalAmount: eligible.reduce(
        (sum, x) => sum + (Number(x.chargeAmount) || 0),
        0
      ),
      createdBy: req.userId,
    });

    // Update eligible checks to Processing
    await mailedChecksCollection.updateMany(
      { _id: { $in: eligible.map((e) => e._id) } },
      {
        $set: {
          batchId: newBatch._id,
          status: 'Processing',
          processedAt: new Date(),
        },
      },
      { session }
    );

    // Build success list
    for (const mc of eligible) {
      results.successfulChecks.push({
        checkId: mc._id,
        amount: mc.chargeAmount ?? 0,
        chargeId: mc.chargeId ?? null,
      });
      results.totalSuccessful++;
      results.totalAmount += Number(mc.chargeAmount) || 0;
    }

    results.totalFailed = results.failedChecks.length;
    results.batchCreated = true;
    results.batchId = newBatch._id;
    results.batchNumber = newBatch.batchNumber;
    results.createdAt = new Date(newBatch.createdAt).toDateString();

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: results.failedChecks.length === 0 ? 'success' : 'partial',
      message:
        results.failedChecks.length === 0
          ? 'Check batch created successfully.'
          : 'Batch created, some checks marked as Error.',
      results,
    });
  } catch (error) {
    console.error('Batch creation error:', error);
    try {
      if (session.inTransaction()) await session.abortTransaction();
    } catch {}
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing the batch',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});
/**
 * @swagger
 * /admin/batch-details/{batchId}:
 *   get:
 *     summary: Get details of a check batch
 *     description: Retrieves details of a specific check batch, including mailed checks, their payee, bank, and owner information.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the batch to retrieve.
 *     responses:
 *       200:
 *         description: Batch details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the batch.
 *                 processedBy:
 *                   type: string
 *                   description: The user ID who processed the batch.
 *                 status:
 *                   type: string
 *                   description: The status of the batch.
 *                 mailed_checks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the mailed check.
 *                       check:
 *                         type: object
 *                         description: The check details.
 *                       payee:
 *                         type: object
 *                         description: The payee details.
 *                       bank:
 *                         type: object
 *                         description: The bank details.
 *                       user:
 *                         type: object
 *                         nullable: true
 *                         description: The user who owns the check, if applicable.
 *                       organization:
 *                         type: object
 *                         nullable: true
 *                         description: The organization details if the check belongs to an organization.
 *       404:
 *         description: Batch not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Batch not found.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get('/batch-details/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await mailsBatchCollection
      .findById(batchId)
      .populate({
        path: 'mailed_checks',
        populate: [
          {
            path: 'checkId',
            populate: [{ path: 'payeeId' }, { path: 'bankId' }],
          },
        ],
      })
      .populate('createdBy')
      .lean();

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const mailedChecks = batch.mailed_checks || [];

    // Extract unique owner IDs for lookup
    const userOwnerIds = [
      ...new Set(
        mailedChecks.filter((c) => c.ownerType === 'user').map((c) => c.ownerId)
      ),
    ];
    const orgOwnerIds = [
      ...new Set(
        mailedChecks
          .filter((c) => c.ownerType === 'organization')
          .map((c) => c.ownerId)
      ),
    ];

    // Fetch users and organizations separately
    const users = await usersCollection
      .find({ _id: { $in: userOwnerIds } })
      .select('firstName lastName email')
      .lean();

    const organizations = await organizationCollection
      .find({ _id: { $in: orgOwnerIds } })
      .select('organizationName')
      .lean();

    const orgUserLinks2 = orgOwnerIds.length > 0
      ? await userToOrganizationCollection.find({ organizationId: { $in: orgOwnerIds } }).lean()
      : [];
    const orgToUserIdMap2 = {};
    for (const link of orgUserLinks2) {
      if (!orgToUserIdMap2[link.organizationId]) {
        orgToUserIdMap2[link.organizationId] = link.userId;
      }
    }
    const orgUserIds2 = [...new Set(Object.values(orgToUserIdMap2))].filter(Boolean);
    const orgUsers2 = orgUserIds2.length > 0
      ? await usersCollection.find({ _id: { $in: orgUserIds2 } }).select('firstName lastName email').lean()
      : [];
    const orgUserMap2 = Object.fromEntries(orgUsers2.map((u) => [u._id.toString(), u]));

    const userMap = Object.fromEntries(
      users.map((user) => [user._id.toString(), user])
    );
    const orgMap = Object.fromEntries(
      organizations.map((org) => [org._id.toString(), org])
    );

    const formattedMailedChecks = mailedChecks.map(
      ({ checkId, ownerId, ownerType, ...item }) => {
        let user = null;
        let organization = {};

        if (ownerType === 'user') {
          user = userMap[ownerId] || null;
        } else if (ownerType === 'organization') {
          organization = orgMap[ownerId] || {};
          const primaryUserId = orgToUserIdMap2[ownerId];
          user = primaryUserId ? orgUserMap2[primaryUserId] || null : null;
        }

        return {
          ...item,
          check: checkId,
          payee: checkId?.payeeId,
          bank: checkId?.bankId,
          user, // Always contains user data
          organization, // Contains organization data if applicable
        };
      }
    );

    // Construct final response
    const finalResponse = {
      ...batch,
      mailed_checks: formattedMailedChecks,
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /admin/mark-checks-mailed:
 *   post:
 *     summary: Mark checks as mailed
 *     description: Updates the status of checks in a batch to "Mailed". If all checks in the batch are marked, the batch status is updated as well.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchId:
 *                 type: string
 *                 description: The ID of the batch.
 *               markAll:
 *                 type: boolean
 *                 description: If true, marks all checks in the batch as mailed.
 *               mailCheckIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of mail check IDs to mark as mailed (required if markAll is false).
 *     responses:
 *       200:
 *         description: Successfully marked checks as mailed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Marked X checks as mailed."
 *                 batchStatusUpdated:
 *                   type: boolean
 *                   description: Indicates if the batch status was updated to "Mailed".
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Batch ID is required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(`/mark-checks-mailed`, async (req, res) => {
  const session = await checkWriterDb.startSession();
  session.startTransaction();

  try {
    const { batchId, markAll, mailCheckIds } = req.body;

    if (!batchId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Batch ID is required.' });
    }

    let checkFilter = { batchId, status: 'Processing' };

    if (!markAll) {
      if (!Array.isArray(mailCheckIds) || mailCheckIds.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: 'Valid mailCheckIds are required when markAll is false.',
        });
      }
      checkFilter._id = { $in: mailCheckIds };
    }

    const docsToMail = await mailedChecksCollection
      .find(checkFilter, { _id: 1, ownerId: 1 })
      .session(session)
      .lean();

    // Update checks in the batch
    const updatedChecks = await mailedChecksCollection
      .updateMany(
        checkFilter,
        { $set: { status: 'Mailed', mailedAt: new Date() } },
        { session }
      )
      .lean();

    // Check if all checks in the batch are mailed
    const remainingChecks = await mailedChecksCollection.countDocuments(
      { batchId, status: { $ne: 'Mailed' } },
      { session }
    );

    let batchStatusUpdated = false;

    if (remainingChecks === 0) {
      await mailsBatchCollection.updateOne(
        { _id: batchId },
        { $set: { status: 'Mailed', mailedAt: new Date() } },
        { session }
      );
      batchStatusUpdated = true;
    }
    await CheckMailingEmailService.sendUserCheckMailedEmail(
      docsToMail.map((check) => check._id)
    );
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Marked ${updatedChecks.modifiedCount} checks as mailed.`,
      batchStatusUpdated,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/mailed-status/{ownerType}:
 *   post:
 *     summary: Retrieve mailed status of checks
 *     description: Retrieve mailed status for multiple checks by their IDs, excluding canceled or errored statuses.
 *     tags:
 *       - Admin
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
 *             required:
 *               - checkIds
 *             properties:
 *               checkIds:
 *                 type: array
 *                 description: Array of check IDs whose mailed status is requested.
 *                 items:
 *                   type: string
 *                 example: ["checkId1", "checkId2", "checkId3"]
 *     responses:
 *       200:
 *         description: Successfully retrieved mailed statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alreadyRequested:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       checkId:
 *                         type: string
 *                         description: ID of the check
 *                         example: "checkId1"
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when mailed status was requested
 *                         example: "2024-05-15T09:30:00Z"
 *                       status:
 *                         type: string
 *                         description: Current status of the mailed check
 *                         example: "mailed"
 *       400:
 *         description: Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid checkIds. Must be a non-empty array."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error message."
 */
router.post('/mailed-status/:ownerType', async (req, res) => {
  try {
    const { checkIds } = req.body;
    const { ownerType } = req.params;
    if (!checkIds || !Array.isArray(checkIds) || checkIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid checkIds. Must be a non-empty array.',
      });
    }

    const checkIdsStr = checkIds.map((id) => id.toString());

    const checks = await mailedChecksCollection.aggregate([
      {
        $match: {
          checkId: { $in: checkIdsStr },
          status: {
            $nin: [CHECK_MAILED_STATUS.CANCELED, CHECK_MAILED_STATUS.ERROR],
          },
          ownerId: req.userId.toString(),
          ownerType: ownerType,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$checkId',
          checkId: { $first: '$checkId' },
          requestedAt: { $first: '$requestedAt' },
          status: { $first: '$status' },
        },
      },
      {
        $project: {
          _id: 0,
          checkId: 1,
          requestedAt: 1,
          status: 1,
        },
      },
    ]);

    res.status(200).json({ alreadyRequested: checks });
  } catch (error) {
    console.error('Error fetching mailed status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post(`/generate-check-pdf`, async (req, res) => {
  try {
    const { batchId, mailCheckIds, generateAll } = req.body;

    const filter = { _id: batchId };

    // Step 1: Find the batch
    let batch = await mailsBatchCollection.findOne(filter).lean();

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Step 2: Fetch only the relevant mailed checks based on mailCheckIds
    let mailedChecksQuery = { _id: { $in: batch.mailed_checks } };
    if (!generateAll) {
      mailedChecksQuery._id.$in = mailCheckIds; // Restrict to requested mailCheckIds
    }

    const mailedChecks = await mailedChecksCollection
      .find(mailedChecksQuery)
      .lean();

    if (!mailedChecks.length) {
      return res
        .status(404)
        .json({ error: 'No matching mailed checks found for this batch' });
    }

    // Step 3: Extract only the checkIds from the filtered mailed checks
    const checkIds = mailedChecks.map((mailedCheck) => mailedCheck.checkId);

    // Step 4: Fetch actual check details from checksCollection
    const checks = await checksCollection
      .find({ _id: { $in: checkIds } })
      .populate('payeeId', 'name email address')
      .populate(
        'bankId',
        'bankName accountNumber bankRoutingNumber accountNickName bankPreferences'
      )
      .lean();

    // Process owner and address data
    const enrichedChecks = await Promise.all(
      checks.map(async ({ bankId, payeeId, ...check }) => {
        let owner = null;

        if (check.ownerType === 'user') {
          owner = await usersCollection
            .findById(check.ownerId, 'firstName lastName ')
            .lean();
        } else if (check.ownerType === 'organization') {
          owner = await organizationCollection
            .findById(check.ownerId, 'organizationName ')
            .lean();
        }

        // Fetch the address dynamically based on ownerId & ownerType
        const address = await addressesCollection
          .findOne({ ownerId: check.ownerId, ownerType: check.ownerType })
          .lean();

        return {
          ...check,
          bank: bankId,
          payee: payeeId,
          userId: check.ownerId,
          signatureUrl: await getUserSignatureBase64(
            check.ownerId,
            check.ownerType
          ),
          userData:
            check.ownerType === 'user'
              ? { ...owner, ...address }
              : {
                  firstName: owner?.organizationName,
                  lastName: '',
                  ...address,
                },
        };
      })
    );

    const checkHtmlArray = await Promise.all(
      enrichedChecks.map(async (check) => {
        return `<div style="page-break-after: always;">${await compileTemplate(
          check
        )}</div>`;
      })
    );

    const checksHtml = checkHtmlArray.join('');

    const fullHtml = await compileWrapperTemplate(checksHtml);

    const pdfBuffer = await generatePDFBuffer(fullHtml);

    const fileName = `check_batch_${batch.batchNumber}.pdf`;

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error fetching batch details:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/get-mailing-stats', async (req, res) => {
  try {
    const statuses = [
      '',
      'Processing',
      'Mailed',
      'Submitted',
      'Canceled',
      'Error',
    ];

    const results = await Promise.all(
      statuses.map((status) => getMailingStats({ status }))
    );

    const response = Object.fromEntries(
      statuses.map((status, index) => [
        status ? status.toLowerCase() : 'all',
        results[index],
      ])
    );

    const totalBatches = await mailsBatchCollection.countDocuments();

    res.send({ ...response, totalBatches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(`/update-subscription-price/:userId`, async (req, res) => {
  try {
    const { userId } = req.params;

    const { price } = req.body;

    const result = await SubscriptionService.updateSubscriptionPrice({
      userId,
      newAmount: price,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-trial-end-date/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { trialEndDate } = req.body;

    const result = await SubscriptionService.updateTrialEndDate({
      userId,
      newTrialEndDate: trialEndDate,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.send(result);
  } catch (error) {
    const status = error?.statusCode || 500;
    res
      .status(status)
      .json({ error: error.message, code: error?.code || undefined });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await usersCollection.findById(id);
    if (!user) throw new Error('User not found');

    const tokenPayload = { userId: user?._id.toString() };
    const accessToken = generateToken(tokenPayload, 900);

    const url = getPasswordResetUrl(accessToken);

    await sendForgotPasswordMail(user?.email, url);

    return res
      .status(200)
      .send('The Link to reset password has been shared via mail');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/totalSignups', async (req, res, next) => {
  try {
    const range = req.query.range || 'yearly';

    const result = await getTotalUserStats(range);
    const total = await usersCollection.countDocuments();

    res.status(200).json({
      data: result,
      total,
    });
  } catch (err) {
    console.error('Error fetching signup stats:', err);
    res.status(500).json({ message: 'Error fetching signup stats' });
  }
});

/**
 * @swagger
 * /admin/refreshSuscription:
 *   get:
 *     summary: Refresh Stripe subscription details for a user
 *     description: Fetches the Stripe subscription for the given user ID and updates it in the database.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose subscription should be refreshed
 *     responses:
 *       200:
 *         description: Subscription successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Updated subscription data
 *                 total:
 *                   type: integer
 *                   description: Optional total value (if applicable)
 *       400:
 *         description: Missing or invalid userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error while refreshing subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/refreshSuscription', async (req, res, next) => {
  const { userId, updateAll } = req.body;

  const usersToUpdate = [];

  if (updateAll) {
    const userIds = await usersSubscriptionCollection.distinct('userId');
    usersToUpdate.push(...userIds);
  } else if (userId) {
    usersToUpdate.push(userId);
  } else {
    return res.status(400).json({ message: 'Missing userId' });
  }

  const result = {
    success: [],
    failed: [],
  };

  for (const userId of usersToUpdate) {
    try {
      const userSub = await usersSubscriptionCollection
        .findOne({ userId })
        .lean();

      let sub = null;

      if (userSub && userSub.stripeCustomerId && userSub.stripeSubscriptionId) {
        try {
          sub = await SubscriptionService.retrieveStripeSubscription(
            userSub.stripeSubscriptionId
          );
        } catch (error) {
          if (error.code !== 'resource_missing') {
            throw error;
          }
        }
      }

      if (!sub) {
        const user = await usersCollection.findOne({ _id: userId }).lean();

        sub = await SubscriptionService.findStripeSubscriptionByEmail({
          email: user.email,
        });

        if (sub) {
          await usersSubscriptionCollection.findOneAndUpdate(
            { userId: user?._id },
            {
              stripeCustomerId: sub.customer,
              stripeSubscriptionId: sub.id,
            },
            { upsert: true, new: true }
          );
        }
      }

      if (sub) {
        await new StripeSubscriptionWebhookService(
          stripe,
          checkwriter_product_id
        ).updateSubscriptionInDatabase(sub);

        result.success.push({
          userId,
          message: 'Subscription updated successfully',
        });
      } else {
        const user = await usersCollection.findOne({ _id: userId }).lean();
        await addMailchimpContactWithTag({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tag: userSub?.status
            ? userSub?.mode == 'paid'
              ? 'Subscription'
              : 'Trial'
            : 'Sign ups',
          subscriptionTag: userSub?.status ? 'Canceled' : '',
        });

        result.failed.push({
          userId,
          error: 'No subscription found for this user',
        });
      }
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error);
      result.failed.push({
        userId,
        error: error.message || 'Failed to update subscription',
      });
    }
  }

  res.status(200).send(result);
});

router.post('/register-user', async (req, res, next) => {
  try {
    const { firstName, lastName, email, sendPasswordSetupEmail, domain } =
      req.body || {};

    // Validate presence (explicitly required)
    const missing = [];
    if (!firstName) missing.push('firstName');
    if (!lastName) missing.push('lastName');
    if (!email) missing.push('email');
    if (typeof sendPasswordSetupEmail !== 'boolean')
      missing.push('sendPasswordSetupEmail');
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing fields - [${missing.join(', ')}]` });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'User Already Exists' });
    }

    const payload = {
      firstName,
      lastName,
      email,
    };

    const user = await addUser(payload);
    if (!user) {
      throw new Error('Unable to create User');
    }

    await addDefaultMfaMethod({ userId: user._id, email: user.email });
    await addDefaultTags(user._id);

    if (sendPasswordSetupEmail) {
      const tokenPayload = { userId: user._id.toString() };
      const accessToken = generateToken(tokenPayload, 900);
      const url = getPasswordResetUrl(accessToken);
      await sendForgotPasswordMail(email, url);
    }

    return res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/migrate-signatures:
 *   post:
 *     summary: Migrate old signature URLs to attachment structure
 *     description: Converts legacy signature URLs stored in users, organizations, and banks to the new attachment system. This endpoint requires Super Admin privileges.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollback:
 *                 type: boolean
 *                 description: If true, performs rollback operation to remove signatureAttachmentId fields
 *                 default: false
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the migration was successful
 *                 totalMigrated:
 *                   type: integer
 *                   description: Total number of signatures migrated
 *                 totalFailed:
 *                   type: integer
 *                   description: Total number of signatures that failed to migrate
 *                 results:
 *                   type: object
 *                   properties:
 *                     userSignatures:
 *                       type: object
 *                       properties:
 *                         migrated:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                     organizationSignatures:
 *                       type: object
 *                       properties:
 *                         migrated:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                     bankSignatures:
 *                       type: object
 *                       properties:
 *                         migrated:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid parameters"
 *       401:
 *         description: Unauthorized - Admin privileges required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied. Admin privileges required."
 *       500:
 *         description: Migration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the failure
 *                 details:
 *                   type: string
 *                   description: Additional error details if available
 */
router.post('/migrate-signatures', async (req, res, next) => {
  try {
    const { rollback = false } = req.body;

    let result;

    if (rollback) {
      console.info('🔄 Admin requested signature migration rollback...');
      await rollbackSignatureMigration();
      result = {
        success: true,
        message: 'Signature migration rollback completed successfully',
        rollback: true,
      };
    } else {
      console.info('🚀 Admin requested signature migration...');
      result = await migrateSignaturesToAttachments();
    }

    const statusCode = result.success ? 200 : 207; // Use 207 for partial success

    return res.status(statusCode).json({
      ...result,
      timestamp: new Date().toISOString(),
      requestedBy: req.userId,
    });
  } catch (error) {
    console.error('❌ Migration endpoint error:', error);

    return res.status(500).json({
      error: 'Signature migration failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      requestedBy: req.userId,
    });
  }
});

router.patch('/users/:id/activate', async (req, res, next) => {
  try {
    const result = await adminActivateUser(req.params.id, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/deactivate', async (req, res, next) => {
  try {
    const result = await adminDeactivateUser(req.params.id, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/subscription-price-override', async (req, res, next) => {
  try {
    const { priceOverride } = req.body;
    const price = priceOverride === null || priceOverride === undefined ? null : parseFloat(priceOverride);
    if (price !== null && isNaN(price)) {
      return res.status(400).json({ error: 'priceOverride must be a number or null' });
    }
    const result = await adminSetSubscriptionPriceOverride(req.params.id, price, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/full-access-override', async (req, res, next) => {
  try {
    const { enabled, reason } = req.body;
    const result = await adminSetFullAccessOverride(
      req.params.id,
      enabled,
      reason,
      req.userId
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/checks', async (req, res, next) => {
  try {
    const result = await adminListChecks(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/checks/:id', async (req, res, next) => {
  try {
    if (req.params.id === 'mailed') return next();
    const result = await adminGetCheck(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/checks/:id', async (req, res, next) => {
  try {
    const result = await adminUpdateCheck(req.params.id, req.body, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/checks/:id', async (req, res, next) => {
  try {
    const force = req.query.force === 'true';
    const result = await adminDeleteCheck(req.params.id, req.userId, { force });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/checks/:id/void', async (req, res, next) => {
  try {
    const result = await adminVoidCheck(req.params.id, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/banks', async (req, res, next) => {
  try {
    const result = await adminListBanks(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/banks/:id', async (req, res, next) => {
  try {
    const result = await adminGetBank(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/banks/:id', async (req, res, next) => {
  try {
    const result = await adminUpdateBank(req.params.id, req.body, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/banks/:id', async (req, res, next) => {
  try {
    const result = await adminDeleteBank(req.params.id, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/payees', async (req, res, next) => {
  try {
    const result = await adminListPayees(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/payees/:id', async (req, res, next) => {
  try {
    const result = await adminGetPayee(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/payees/:id', async (req, res, next) => {
  try {
    const result = await adminUpdatePayee(req.params.id, req.body, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/payees/:id', async (req, res, next) => {
  try {
    const result = await adminDeletePayee(req.params.id, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const result = await adminListTransactions(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/transactions/:id', async (req, res, next) => {
  try {
    const result = await adminGetTransaction(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/organizations', async (req, res, next) => {
  try {
    const result = await adminListOrganizations(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/organizations/:id', async (req, res, next) => {
  try {
    const result = await adminGetOrganization(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/organizations/:id', async (req, res, next) => {
  try {
    const result = await adminUpdateOrganization(req.params.id, req.body, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/organizations/:id', async (req, res, next) => {
  try {
    const result = await adminDeleteOrganization(req.params.id, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const result = await adminListAuditLogs(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs/:id', async (req, res, next) => {
  try {
    const result = await adminGetAuditLog(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/scheduled-job-runs', async (req, res, next) => {
  try {
    const result = await adminListScheduledJobRuns(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/scheduled-job-runs/summary', async (req, res, next) => {
  try {
    const result = await adminGetScheduledJobRunsSummary();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/scheduled-job-runs/job-names', async (req, res, next) => {
  try {
    const data = await adminGetScheduledJobJobNames();
    return res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

const RETIRED_SETTING_KEYS = ['priorityMailPrice', 'expressMailPrice', 'internationalMailPrice'];

router.get('/platform-settings', async (req, res, next) => {
  try {
    const result = await adminListPlatformSettings();
    const filtered = result.filter((s) => !RETIRED_SETTING_KEYS.includes(s.key));
    return res.status(200).json({ data: filtered });
  } catch (err) {
    next(err);
  }
});

router.get('/platform-settings/:key', async (req, res, next) => {
  try {
    if (RETIRED_SETTING_KEYS.includes(req.params.key)) {
      return res.status(400).json({ error: `Setting '${req.params.key}' is no longer supported` });
    }
    const result = await adminGetPlatformSetting(req.params.key);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/platform-settings', async (req, res, next) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      if (RETIRED_SETTING_KEYS.includes(key)) continue;
      const result = await adminUpsertPlatformSetting(key, value, undefined, req.userId);
      results.push(result);
    }
    return res.status(200).json({ data: results });
  } catch (err) {
    next(err);
  }
});

router.put('/platform-settings/:key', async (req, res, next) => {
  try {
    if (RETIRED_SETTING_KEYS.includes(req.params.key)) {
      return res.status(400).json({ error: `Setting '${req.params.key}' is no longer supported` });
    }
    const { value, valueType } = req.body;
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'value is required' });
    }
    const result = await adminUpsertPlatformSetting(req.params.key, value, valueType, req.userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/users/mass-email', async (req, res, next) => {
  try {
    const senderId = req.userId;
    const subject = (req.body.subject || '').trim();
    const body = (req.body.body || '').trim();
    const filter = req.body.filter || {};

    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and body are required.' });
    }

    if (subject.length > 200) {
      return res.status(400).json({ message: 'Subject must be 200 characters or less.' });
    }

    if (body.length > 10000) {
      return res.status(400).json({ message: 'Message body must be 10,000 characters or less.' });
    }

    const query = { email: { $nin: [null, ''] } };
    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.subscriptionStatus) {
      if (filter.subscriptionStatus === 'none') {
        // "None" means the user has no real subscription: either no row
        // in users_subscriptions at all, or a row whose status is the
        // sentinel 'none'/empty/null. We compute that as the complement
        // of users who do have a real status.
        const activelySubscribedIds = await usersSubscriptionCollection.distinct(
          'userId',
          { status: { $nin: ['none', '', null] } }
        );
        if (activelySubscribedIds.length > 0) {
          query._id = { $nin: activelySubscribedIds };
        }
      } else {
        const subscribedUserIds = await usersSubscriptionCollection.distinct(
          'userId',
          { status: filter.subscriptionStatus }
        );
        if (subscribedUserIds.length === 0) {
          return res.status(200).json({
            message: 'No users matched the selected filters.',
            recipientCount: 0,
          });
        }
        query._id = { $in: subscribedUserIds };
      }
    }

    const recipients = await usersCollection
      .find(query)
      .select('_id email firstName lastName')
      .lean();
    const recipientCount = recipients.length;

    if (recipientCount === 0) {
      return res.status(200).json({
        message: 'No users matched the selected filters.',
        recipientCount: 0,
      });
    }

    res.status(202).json({
      message: `Mass email initiated for ${recipientCount} recipient(s).`,
      recipientCount,
    });

    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      chunks.push(recipients.slice(i, i + CHUNK_SIZE));
    }

    (async () => {
      for (const chunk of chunks) {
        const sendResults = await Promise.allSettled(
          chunk.map(async (user) => {
            try {
              await sendAdminSupportEmail(user.email, subject, body);
              return { user, status: 'sent' };
            } catch (err) {
              console.error(`[sendMassEmail] Failed to send to ${user.email}:`, err.message);
              return { user, status: 'failed' };
            }
          })
        );

        // Batch the per-chunk audit-trail inserts into a single insertMany
        // instead of N individual create() calls.
        const docs = sendResults
          .filter((r) => r.status === 'fulfilled')
          .map((r) => {
            const { user, status } = r.value;
            return {
              senderId,
              recipientId: user._id,
              recipientEmail: user.email,
              subject,
              body,
              status,
              isMassEmail: true,
            };
          });
        if (docs.length > 0) {
          try {
            await adminMessagesCollection.insertMany(docs);
          } catch (logErr) {
            console.error('[sendMassEmail] Failed to log message batch:', logErr.message);
          }
        }

        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      console.info(`[sendMassEmail] Completed batch of ${recipients.length} emails. Subject: "${subject}"`);
    })();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      console.error('[sendMassEmail] Unexpected error:', err);
    }
  }
});

router.post('/users/mass-email/count', async (req, res, next) => {
  try {
    const filter = req.body.filter || {};

    const query = { email: { $nin: [null, ''] } };
    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.subscriptionStatus) {
      if (filter.subscriptionStatus === 'none') {
        const activelySubscribedIds = await usersSubscriptionCollection.distinct(
          'userId',
          { status: { $nin: ['none', '', null] } }
        );
        if (activelySubscribedIds.length > 0) {
          query._id = { $nin: activelySubscribedIds };
        }
      } else {
        const subscribedUserIds = await usersSubscriptionCollection.distinct(
          'userId',
          { status: filter.subscriptionStatus }
        );
        if (subscribedUserIds.length === 0) {
          return res.status(200).json({ recipientCount: 0 });
        }
        query._id = { $in: subscribedUserIds };
      }
    }

    const recipientCount = await usersCollection.countDocuments(query);

    return res.status(200).json({ recipientCount });
  } catch (err) {
    next(err);
  }
});

router.post('/users/mass-email/preview', async (req, res, next) => {
  try {
    const subject = (req.body.subject || '').trim();
    const body = (req.body.body || '').trim();

    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and body are required.' });
    }

    if (subject.length > 200) {
      return res.status(400).json({ message: 'Subject must be 200 characters or less.' });
    }

    if (body.length > 10000) {
      return res.status(400).json({ message: 'Message body must be 10,000 characters or less.' });
    }

    const html = adminSupportEmailTemplate(subject, body);
    return res.status(200).json({ html });
  } catch (err) {
    next(err);
  }
});

router.post('/users/:userId/send-email', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const senderId = req.userId;
    const subject = (req.body.subject || '').trim();
    const body = (req.body.body || '').trim();

    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and body are required.' });
    }

    if (subject.length > 200) {
      return res.status(400).json({ message: 'Subject must be 200 characters or less.' });
    }

    if (body.length > 10000) {
      return res.status(400).json({ message: 'Message body must be 10,000 characters or less.' });
    }

    const user = await usersCollection.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'User does not have an email address.' });
    }

    await sendAdminSupportEmail(user.email, subject, body);

    const messageRecord = await adminMessagesCollection.create({
      senderId,
      recipientId: userId,
      recipientEmail: user.email,
      subject,
      body,
      status: 'sent',
    });

    return res.status(200).json({
      message: 'Email sent successfully.',
      data: messageRecord,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/integrations', async (req, res, next) => {
  try {
    const result = await adminGetIntegrationsOverview();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/integrations/quickbooks', async (req, res, next) => {
  try {
    const result = await adminGetQuickbooksIntegrations(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/integrations/stripe', async (req, res, next) => {
  try {
    const result = await adminGetStripeIntegrations(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/integrations/plaid', async (req, res, next) => {
  try {
    const result = await adminGetPlaidIntegrations(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/attachments', async (req, res, next) => {
  try {
    const result = await adminListAttachments(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/check-imports', async (req, res, next) => {
  try {
    const result = await adminListCheckImports(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/users/:userId/messages', async (req, res, next) => {
  try {
    const { userId } = req.params;
    let { pageSize, pageNumber } = req.query;

    pageSize = parseInt(pageSize, 10) || 10;
    pageNumber = parseInt(pageNumber, 10) || 1;

    if (pageSize <= 0 || pageNumber <= 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters.' });
    }

    const skip = (pageNumber - 1) * pageSize;

    const messages = await adminMessagesCollection
      .find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await adminMessagesCollection.countDocuments({ recipientId: userId });
    const totalPages = Math.ceil(totalCount / pageSize);

    return res.status(200).json({
      messages,
      totalCount,
      totalPages,
      currentPage: pageNumber,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/refunds/charges/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const sub = await usersSubscriptionCollection.findOne({ userId });
    if (!sub || !sub.stripeCustomerId) {
      return res.status(404).json({ message: 'No Stripe customer found for this user' });
    }

    const charges = await SubscriptionService.listCustomerCharges({
      stripeCustomerId: sub.stripeCustomerId,
    });

    return res.status(200).json({ charges });
  } catch (err) {
    next(err);
  }
});

router.post('/refunds/process', async (req, res, next) => {
  try {
    const { chargeId, amount, reason, userId } = req.body;
    const adminId = req.userId;

    if (!chargeId) {
      return res.status(400).json({ message: 'chargeId is required' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Refund reason is required' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const sub = await usersSubscriptionCollection.findOne({ userId });
    if (!sub || !sub.stripeCustomerId) {
      return res.status(404).json({ message: 'No Stripe customer found for this user' });
    }

    const charge = await stripe.charges.retrieve(chargeId);
    if (charge.customer !== sub.stripeCustomerId) {
      return res.status(403).json({ message: 'Charge does not belong to this user' });
    }

    const refundableAmount = (charge.amount - charge.amount_refunded) / 100;
    if (amount !== undefined && amount !== null) {
      const parsedAmount = parseFloat(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Refund amount must be a positive number' });
      }
      if (parsedAmount > refundableAmount) {
        return res.status(400).json({ message: `Refund amount exceeds refundable balance of $${refundableAmount.toFixed(2)}` });
      }
    }

    const refund = await SubscriptionService.createRefund({
      chargeId,
      amount: amount || undefined,
      reason,
    });

    await createAuditLog({
      actorUserId: adminId,
      action: 'REFUND_PROCESSED',
      entityType: 'refund',
      entityId: refund.id,
      oldData: { chargeId },
      newData: { refundId: refund.id, amount: refund.amount, reason },
    });

    const user = await usersCollection.findById(userId).lean();
    if (user && user.email) {
      sendRefundReceiptEmail({
        toEmail: user.email,
        recipientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
        refundAmount: refund.amount,
        originalDescription: charge?.description || 'Charge',
        originalDate: new Date(charge.created * 1000).toLocaleDateString('en-US'),
        reason,
      }).catch((err) => console.error('Failed to send refund receipt:', err));
    }

    return res.status(200).json({ success: true, refund });
  } catch (err) {
    next(err);
  }
});

export default router;
