import express from 'express';
import fs from 'fs';
import multer from 'multer';
import util from 'util';

import {
  getUserDetails,
  updateUserDetails,
  getTagsById,
  deleteTagsById,
  addUserTag,
  updateTagById,
  getTagsByUserId,
  updatePreferencesById,
  createGroupById,
  updateGroupById,
  getGroupById,
  deleteGroupById,
  getGroupsById,
  validateGroupById,
  generateOrganizationLogoUrlUpload,
  generateOrganizationLogoUrlDownload,
  deleteOrganizationLogo,
} from '../services/users.service.js';
import { isValidSignature } from '../utils/common.util.js';
import {
  getUserSignatureUrl,
  getSignatureUrl,
} from '../utils/signature.util.js';
import {
  getOrganizationDB,
  getUerSubscriptionInformation,
  getUser,
  updateUser,
  updateOrganizationDB,
} from '../models/users.model.js';
import { AttachmentService } from '../services/attachments.service.js';
import { EntityType } from '../models/attachment.model.js';
import { OwnerType } from '../enums/user.enum.js';
import { validateTags } from '../services/checks.service.js';
import { appCache } from '../utils/nodeCache.util.js';
import {
  addressesCollection,
  organizationCollection,
  userToOrganizationCollection,
} from '../models/dbCollections.js';
import { checkWriterDb } from '../utils/mongo-db.util.js';
import { checkPasswordExistence } from '../services/authentication.service.js';
import SubscriptionService from '../services/stripe.service.js';
import adminPrivilageMiddleware from '../middlewares/adminPrivilage.middleware.js';

const upload = multer({ dest: '/tmp/uploads' });

const router = express.Router();

const unlinkfile = util.promisify(fs.unlink);

/**
 * @swagger
 * /users/user:
 *   get:
 *     summary: Get user details
 *     description: Retrieve details of the user.
 *     tags:
 *       - User
 *
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

router.get('/user', async (req, res, next) => {
  try {
    const userId = req.userId;
    let userDetails;

    if (appCache.has(`User-${userId}`)) {
      userDetails = appCache.get(`User-${userId}`);
    } else {
      userDetails = await getUserDetails(userId);
    }

    if (!userDetails) {
      throw new Error('User not found');
    }

    let returnPayload = {};
    let organizationDetails = {};

    userDetails = userDetails.toJSON();

    if (userDetails.signatureAttachmentId) {
      try {
        // Get fresh signature URL from attachment
        const signatureUrl = await getSignatureUrl({
          signatureAttachmentId: userDetails.signatureAttachmentId,
          ownerType: 'user',
          ownerId: userId,
        });
        userDetails.signatureUrl = signatureUrl;
      } catch (error) {
        console.error('Error refreshing signature URL:', error);
      }
    }

    const hasPassword = await checkPasswordExistence({ userId });

    returnPayload = {
      ...userDetails,
      preferences: userDetails.preferences,
      signatureUrl: userDetails.signatureUrl || '',
      hasPassword,
    };

    return res.status(200).json(returnPayload);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user:
 *   put:
 *     summary: Update user details
 *     description: Update details of the user.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetails'
 *       201:
 *         description: No content provided for update
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.put('/user', async (req, res, next) => {
  try {
    const { firstName, middleName, lastName, phone, dateOfBirth, welcomeSeen } =
      req.body;

    if (
      !(
        firstName ||
        middleName ||
        lastName ||
        phone ||
        dateOfBirth ||
        welcomeSeen !== undefined
      )
    ) {
      return res.status(201).send('No Content');
    }

    const userId = req.userId;
    const resFromDb = await updateUserDetails(userId, {
      firstName,
      middleName,
      lastName,
      phone,
      dateOfBirth,
      welcomeSeen,
    });
    if (!resFromDb) {
      throw new Error('Unable to update User');
    }
    appCache.del(`User-${userId}`);
    return res.status(200).send(resFromDb);
  } catch (err) {
    next(err);
  }
});

//Tags

/**
 * @swagger
 * /users/user/getTags:
 *   get:
 *     summary: Get tags by ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tagIds
 *         required: true
 *         description: IDs of the tags to retrieve
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Bad request - No tagIds found
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Tags not found for the provided tagIds
 *       500:
 *         description: Internal server error
 */

router.get('/user/getTags', async (req, res, next) => {
  try {
    const userId = req.userId;
    let { tagIds } = req.query;
    const organizationId = req.organizationId;
    if (!Array.isArray(tagIds) || typeof tagIds === 'string') {
      const stringToArr = [];
      stringToArr.push(tagIds);
      tagIds = stringToArr;
    }

    if (!tagIds[0]) {
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage: 'No tagIds found',
        })
      );
    }

    const resFromDb = await getTagsById(userId, tagIds, organizationId);
    if (!resFromDb) {
      throw new Error('No tags found for this id');
    }
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/tags/tag/{tagId}:
 *   delete:
 *     summary: Delete a tag by ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: ID of the tag to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - Invalid tagId
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Tag not found for the provided tagId
 *       500:
 *         description: Internal server error
 */

router.delete('/user/tags/tag/:tagId', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { tagId } = req.params;
    const organizationId = req.organizationId;
    // get tag by tagId from db - get the objectId

    const resTagFromDb = await getTagsById(userId, [tagId], organizationId);
    if (!resTagFromDb) {
      throw new Error('No tag found for this id');
    }

    // if tag has some groupId
    if (resTagFromDb[0].group) {
      const groupId = resTagFromDb[0].group.toString();

      const GroupResFromDb = await getGroupById(
        userId,
        groupId,
        organizationId
      );
      if (!GroupResFromDb) {
        throw new Error(
          JSON.stringify({
            statusCode: 404,
            developerMessage: 'Unable to get Group',
          })
        );
      }

      const parsedGroupId = groupId.toString();
      const tagsInGroup = [];
      const tags = await getTagsByUserId(userId, organizationId);
      const tagsObject = Object.fromEntries(tags);

      Object.keys(tagsObject).forEach((key) => {
        const currentTag = tagsObject[key];
        if (
          currentTag.group &&
          currentTag.group.toString() === parsedGroupId
        ) {
          tagsInGroup.push(currentTag);
        }
      });

      // Deleting the group if only one tag exists
      if (tagsInGroup.length === 1) {
        await deleteGroupById(userId, groupId, organizationId);
      }
    }

    const resFromDb = await deleteTagsById(userId, tagId, organizationId);
    if (!resFromDb) {
      throw new Error('Not able to delete tags from this Id');
    }
    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/tags/:
 *   post:
 *     summary: Add a new tag
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Tag object to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tag'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Bad request - Missing required fields in the request body
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

router.post('/user/tags/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { body } = req;
    const { name } = body;
    const organizationId = req.organizationId;
    const mandatoryFields = ['name', 'color'];
    const missingFields = [];
    mandatoryFields.forEach((field) =>
      body && body[field] ? true : missingFields.push(field)
    );

    if (missingFields && missingFields.length) {
      throw new Error(
        'Missing fields - [' + missingFields + '] in request body'
      );
    }

    const tags = await getTagsByUserId(userId, organizationId);
    const tagsObject = Object.fromEntries(tags);

    Object.keys(tagsObject).forEach((key) => {
      const currentTag = tagsObject[key];
      if (currentTag.name === name) {
        throw new Error(
          JSON.stringify({
            statusCode: 409,
            userMessage:
              'Tag already exists with same name. Please choose a different name.',
          })
        );
      }
    });

    const resFromDb = await addUserTag(userId, body, organizationId);
    if (!resFromDb) {
      throw new Error('Unable to add tag');
    }
    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/tags/tag/{tagId}:
 *   put:
 *     summary: Update a tag by ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: ID of the tag to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated tag object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tag'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found or unable to update tag
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

router.put('/user/tags/tag/:tagId', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { tagId } = req.params;
    const { body } = req;
    const { name, group } = body;

    const organizationId = req.organizationId;

    if (!tagId) {
      return;
    }

    if (group) {
      const groupId = group;

      const validateTag = validateTags(userId, [tagId], organizationId);

      if (!validateTag) {
        throw new Error('Invalid tags');
      }

      const validateGroup = validateGroupById(userId, groupId, organizationId);

      if (!validateGroup) {
        throw new Error('Invalid group');
      }

      // getting tag by tagId
      const resFromDb = await getTagsById(userId, [tagId], organizationId);
      if (!resFromDb) {
        throw new Error('No tag found for this id');
      }

      if (!resFromDb[0].group) {
        const resFromDb = await updateTagById(
          userId,
          tagId,
          body,
          organizationId
        );
        if (!resFromDb) {
          throw new Error(
            JSON.stringify({
              statusCode: 404,
              developerMessage: 'Unable to update Tag',
            })
          );
        }
        return res.status(200).json(resFromDb);
      }

      const oldgroupId = resFromDb[0].group.toString();

      const OldGroupResFromDb = await getGroupById(
        userId,
        oldgroupId,
        organizationId
      );
      if (!OldGroupResFromDb) {
        throw new Error(
          JSON.stringify({
            statusCode: 404,
            developerMessage: 'Unable to get Group',
          })
        );
      }

      const parsedGroupId = oldgroupId.toString();
      const tagsInGroup = [];
      const tags = await getTagsByUserId(userId, organizationId);
      const tagsObject = Object.fromEntries(tags);

      Object.keys(tagsObject).forEach((key) => {
        const currentTag = tagsObject[key];
        if (
          currentTag.group &&
          currentTag.group.toString() === parsedGroupId
        ) {
          tagsInGroup.push(currentTag);
        }
      });

      if (tagsInGroup.length === 1 && tagsInGroup[0]._id.toString() === tagId) {
        // Delete the old group
        await deleteGroupById(userId, oldgroupId, organizationId);
      }
    }

    const tags = await getTagsByUserId(userId, organizationId);

    const tagsObject = Object.fromEntries(tags);

    for (const key in tagsObject) {
      if (key === tagId) {
        continue;
      }

      const currentTag = tagsObject[key];
      if (currentTag.name === name) {
        throw new Error(
          JSON.stringify({
            statusCode: 409,
            userMessage:
              'Tag already exists with same name. Please choose a different name.',
          })
        );
      }
    }

    const resFromDb = await updateTagById(userId, tagId, body, organizationId);
    if (!resFromDb) {
      throw new Error(
        JSON.stringify({
          statusCode: 404,
          developerMessage: 'Unable to update Tag',
        })
      );
    }

    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );

    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/tags:
 *   get:
 *     summary: Get all tags for a user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

router.get('/user/tags', async (req, res, next) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const resFromDb = await getTagsByUserId(userId, organizationId);
    if (!resFromDb) {
      throw new Error('Unable to get tags');
    }
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

//Preferences

/**
 * @swagger
 * /users/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User preferences object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         description: Bad request - Invalid or missing request body
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Preferences not found
 *       500:
 *         description: Internal server error
 */

router.put('/user/preferences/:type', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { body } = req;
    const type = req.params.type;
    const organizationId = type === 'user' ? null : req.organizationId;

    const resFromDb = await updatePreferencesById(userId, body, organizationId);
    if (!resFromDb) {
      throw new Error(
        JSON.stringify({
          statusCode: 404,
          developerMessage: 'Unable to update Preferences',
        })
      );
    }

    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );

    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

router.get('/user/carrier-accounts', async (req, res, next) => {
  try {
    const { userId, organizationId } = req;
    let doc;
    if (organizationId) {
      doc = await organizationCollection.findById(organizationId).select('upsAccountNumber fedexAccountNumber').lean();
    } else {
      doc = await getUser({ _id: userId });
    }
    if (!doc) return res.status(404).json({ error: 'Account not found' });
    return res.status(200).json({
      upsAccountNumber: doc.upsAccountNumber || '',
      fedexAccountNumber: doc.fedexAccountNumber || '',
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/user/carrier-accounts', async (req, res, next) => {
  try {
    const { userId, organizationId } = req;
    const { upsAccountNumber, fedexAccountNumber } = req.body;
    const update = { $set: {} };
    if (upsAccountNumber !== undefined) update.$set.upsAccountNumber = upsAccountNumber;
    if (fedexAccountNumber !== undefined) update.$set.fedexAccountNumber = fedexAccountNumber;
    if (Object.keys(update.$set).length === 0) {
      return res.status(400).json({ error: 'No carrier account fields provided' });
    }
    if (organizationId) {
      await updateOrganizationDB(organizationId, update);
      appCache.del(`Organization-${organizationId}`);
    } else {
      await updateUser({ _id: userId }, update);
      appCache.del(`User-${userId}`);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

//Groups

/**
 * @swagger
 * /users/user/groups:
 *   post:
 *     summary: Create a new group
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Group object that needs to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Bad request - Missing required fields in the request body
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

router.post('/user/groups', async (req, res, next) => {
  try {
    const { body } = req;
    const userId = req.userId;
    const { name } = body;
    const organizationId = req.organizationId;
    const mandatoryFields = ['name', 'color'];
    const missingFields = [];
    mandatoryFields.forEach((field) =>
      body && body[field] ? true : missingFields.push(field)
    );

    if (missingFields && missingFields.length) {
      throw new Error(
        'Missing fields - [' + missingFields + '] in request body'
      );
    }

    const groups = await getGroupsById(userId, organizationId);
    const groupsObject = Object.fromEntries(groups);

    Object.keys(groupsObject).forEach((key) => {
      const currentGroup = groupsObject[key];
      if (
        currentGroup.name.trim().toLowerCase() === name.trim().toLowerCase()
      ) {
        throw new Error(
          JSON.stringify({
            statusCode: 409,
            userMessage:
              'Group already exists with same name. Please choose a different name.',
          })
        );
      }
    });

    const resFromDb = await createGroupById(userId, body, organizationId);
    if (!resFromDb) {
      throw new Error('Unable to add tag');
    }
    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/groups/group/{groupId}:
 *   put:
 *     summary: Update a group by ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated group object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Bad request - Missing required fields in the request body
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.put('/user/groups/group/:groupId', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { body } = req;
    const userId = req.userId;
    const { name } = body;
    const organizationId = req.organizationId;
    if (!groupId) {
      return;
    }

    const groups = await getGroupsById(userId, organizationId);
    const groupsObject = Object.fromEntries(groups);

    for (const key in groupsObject) {
      if (key === groupId) {
        continue;
      }

      const currentGroup = groupsObject[key];
      if (
        currentGroup.name.trim().toLowerCase() === name.trim().toLowerCase()
      ) {
        throw new Error(
          JSON.stringify({
            statusCode: 409,
            userMessage:
              'Group already exists with same name. Please choose a different name.',
          })
        );
      }
    }

    const resFromDb = await updateGroupById(
      userId,
      groupId,
      body,
      organizationId
    );
    if (!resFromDb) {
      throw new Error(
        JSON.stringify({
          statusCode: 404,
          developerMessage: 'Unable to update Group',
        })
      );
    }

    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );

    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/groups/group/{groupId}:
 *   get:
 *     summary: Get a group by ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.get('/user/groups/group/:groupId', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    const organizationId = req.organizationId;
    if (!groupId) {
      return;
    }
    const resFromDb = await getGroupById(userId, groupId, organizationId);
    if (!resFromDb) {
      throw new Error(
        JSON.stringify({
          statusCode: 404,
          developerMessage: 'Unable to get Group',
        })
      );
    }

    const parsedGroupId = groupId.toString();
    const tagsInGroup = [];
    const tags = await getTagsByUserId(userId, organizationId);
    const tagsObject = Object.fromEntries(tags);

    Object.keys(tagsObject).forEach((key) => {
      const currentTag = tagsObject[key];
      if (
        currentTag.group &&
        currentTag.group.toString() === parsedGroupId
      ) {
        tagsInGroup.push(currentTag);
      }
    });

    const modifiedRes = {
      ...resFromDb.toObject(),
      tags: tagsInGroup,
    };

    return res.status(200).json(modifiedRes);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/groups/group/{groupId}:
 *   delete:
 *     summary: Delete a group by ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.delete('/user/groups/group/:groupId', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    const organizationId = req.organizationId;
    const resFromDb = await deleteGroupById(userId, groupId, organizationId);
    let userDocument;
    if (organizationId) {
      userDocument = await getOrganizationDB(organizationId, {
        tags: 1,
      });
    } else {
      userDocument = await getUser(
        { _id: userId },
        {
          tags: 1,
        }
      );
    }
    const tags = userDocument.tags;
    const tagsObject = Object.fromEntries(tags);

    Object.keys(tagsObject).forEach((key) => {
      const currentTag = tagsObject[key];
      if (currentTag.group && currentTag.group.toString() === groupId) {
        // todo: delete this tag
        userDocument.tags.delete(key);
      }
    });
    await userDocument.save();
    if (!resFromDb) {
      throw new Error('Not able to delete tags from this Id');
    }
    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/user/groups:
 *   get:
 *     summary: Get user groups
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Groups not found
 *       500:
 *         description: Internal server error
 */

router.get('/user/groups', async (req, res, next) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const groups = await getGroupsById(userId, organizationId);
    const tags = await getTagsByUserId(userId, organizationId);
    const tagsObject = Object.fromEntries(tags);

    const groupsArray = [...groups.values()];

    const groupsWithTags = groupsArray.map((group) => {
      const tagsInGroup = [];
      Object.keys(tagsObject).forEach((key) => {
        const currentTag = tagsObject[key];
        if (
          currentTag.group &&
          currentTag.group.toString() === group._id.toString()
        ) {
          tagsInGroup.push(currentTag);
        }
      });

      const modifiedRes = {
        ...group.toObject(),
        tags: tagsInGroup,
      };
      return modifiedRes;
    });

    const noTagsGroup = [];
    Object.keys(tagsObject).forEach((key) => {
      const currentTag = tagsObject[key];
      if (!currentTag.group) {
        noTagsGroup.push(currentTag);
      }
    });

    groupsWithTags.push({
      tags: noTagsGroup,
    });

    return res.status(200).json(groupsWithTags);
  } catch (err) {
    next(err);
  }
});

// Signature
/**
 * @swagger
 * /users/user/signatureUpload/{type}:
 *   post:
 *     summary: Upload a signature
 *     description: Uploads a signature for a user or an organization.
 *     tags:
 *       - Signature
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the signature belongs to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: The signature file to be uploaded.
 *     responses:
 *       200:
 *         description: Signature uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "https://s3-bucket-url.com/signature.png"
 *       400:
 *         description: Invalid request or missing file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Signature file is required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while uploading the signature."
 */

router.post(
  '/user/signatureUpload/:type',
  upload.single('signature'),
  async (req, res, next) => {
    try {
      const userId = req.userId;
      const file = req.file;
      const type = req.params.type; // This is the owner type: 'user' or 'organization'
      const organizationId = type === 'user' ? null : req.organizationId;

      if (!file) {
        return res.status(400).json({ error: 'Signature file is required.' });
      }

      // Use type parameter directly as owner type
      const ownerType =
        type === 'user' ? OwnerType.USER : OwnerType.ORGANIZATION;
      const ownerId = type === 'user' ? userId : organizationId;
      const entityType =
        type === 'user' ? EntityType.USERS : EntityType.ORGANIZATIONS;

      // Read file buffer
      const fileBuffer = fs.readFileSync(file.path);

      // Format file for attachment service
      const attachmentFile = {
        buffer: fileBuffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: fileBuffer.length,
        description:
          type === 'user' ? 'Personal signature' : 'Organization signature',
      };

      // Create attachment using attachment service
      const attachments = await AttachmentService.createAttachments({
        files: [attachmentFile],
        entityType,
        entityId: ownerId,
        ownerType,
        ownerId,
        uploadedBy: userId,
      });

      const attachment = attachments[0];

      // Get download URL
      const downloadResult = await AttachmentService.downloadAttachment({
        attachmentId: attachment._id.toString(),
        ownerType,
        userId: ownerId,
      });

      // Update user/organization record with attachment reference
      const updateData = {
        signatureAttachmentId: attachment._id,
        signatureUrl: downloadResult.url, // Keep for backward compatibility during transition
      };

      if (type === 'organization') {
        await updateOrganizationDB(organizationId, updateData);
      } else {
        await updateUser({ _id: userId }, updateData);
      }

      // Clean up temporary file
      await unlinkfile(file.path);

      // Clear cache
      appCache.del(
        type === 'organization'
          ? `Organization-${organizationId}`
          : `User-${userId}`
      );

      return res.status(200).json(downloadResult.url);
    } catch (err) {
      console.error(err, 'SIGNATURE_UPLOAD_ERROR');
      // Clean up file on error
      if (req.file?.path) {
        await unlinkfile(req.file.path).catch(() => {});
      }
      next(err);
    }
  }
);

/**
 * @swagger
 * /users/user/createOrganization:
 *   post:
 *     summary: Create a new organization
 *     description: Creates a new organization, associates it with the user, and optionally uploads an organization logo.
 *     tags:
 *       - Organization
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: "Acme Corp"
 *               address:
 *                 type: string
 *                 description: JSON string containing address details.
 *                 example: '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001"}'
 *               organizationLogo:
 *                 type: string
 *                 format: binary
 *                 description: Organization logo image file.
 *     responses:
 *       200:
 *         description: Organization created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "605c72e8f1b6c92ff7e2f7b5"
 *                 organizationName:
 *                   type: string
 *                   example: "Acme Corp"
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     wantSignature:
 *                       type: boolean
 *                       example: false
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["605c72e8f1b6c92ff7e2f7b2"]
 *                 organizationLogo:
 *                   type: string
 *                   example: "https://s3.amazonaws.com/bucket-name/org-logos/acme-corp.png"
 *       400:
 *         description: Invalid request payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid address format"
 *       409:
 *         description: Conflict error, missing organization name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 userMessage:
 *                   type: string
 *                   example: "No organization name provided."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while creating the organization."
 */

router.post(
  '/user/createOrganization',
  upload.single('organizationLogo'),
  async (req, res, next) => {
    try {
      const userId = req.userId;
      const file = req.file;

      if (!req.body.organizationName) {
        throw new Error(
          JSON.stringify({
            statusCode: 409,
            userMessage: 'No organization name provided.',
          })
        );
      }

      // ! save details to DB
      const { address, ...payload } = {
        ...req.body,
      };

      const session = await checkWriterDb.startSession();
      let organizationDetails = {};
      try {
        session.startTransaction();

        organizationDetails = await organizationCollection.create({
          ...payload,
          preferences: {
            wantSignature: false,
          },
        });

        await userToOrganizationCollection.create({
          userId: userId,
          organizationId: organizationDetails._id,
        });

        await addressesCollection.create({
          ...JSON.parse(address),
          ownerId: organizationDetails?._id,
          ownerType: 'organization',
        });

        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        console.error('transaction failed, ending transaction');
        await session.endSession();
        throw new Error(error);
      }

      if (!file) {
        return res.status(200).json(organizationDetails);
      }
      // ! generate url to aws organizationLogo
      const fileStream = fs.createReadStream(file.path);
      const organizationLogoUploadDetails =
        await generateOrganizationLogoUrlUpload(
          organizationDetails._id,
          fileStream
        );
      await unlinkfile(file.path);
      const organizationLogoDownloadUrl =
        await generateOrganizationLogoUrlDownload(organizationDetails._id);
      organizationDetails.organizationLogo = organizationLogoDownloadUrl;
      await organizationDetails.save();
      return res.status(200).json(organizationDetails);
    } catch (err) {
      next(err);
    }
  }
);

// Update organization
/**
 * @swagger
 * /users/user/updateOrganization/{organizationId}:
 *   put:
 *     summary: Update an existing organization
 *     description: Updates the details of an organization, including name, location, industry type, and optionally uploads a new organization logo.
 *     tags:
 *       - Organization
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: "Acme Corp Updated"
 *               address:
 *                 type: string
 *                 description: JSON string containing updated address details.
 *                 example: '{"street": "456 New St", "city": "San Francisco", "state": "CA", "zip": "94105"}'
 *               industryType:
 *                 type: string
 *                 example: "Technology"
 *               organizationLogo:
 *                 type: string
 *                 format: binary
 *                 description: Updated organization logo image file.
 *     responses:
 *       200:
 *         description: Organization updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "605c72e8f1b6c92ff7e2f7b5"
 *                 organizationName:
 *                   type: string
 *                   example: "Acme Corp Updated"
 *                 industryType:
 *                   type: string
 *                   example: "Technology"
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     wantSignature:
 *                       type: boolean
 *                       example: false
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["605c72e8f1b6c92ff7e2f7b2"]
 *                 organizationLogo:
 *                   type: string
 *                   example: "https://s3.amazonaws.com/bucket-name/org-logos/acme-corp-updated.png"
 *       400:
 *         description: Invalid request payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid address format"
 *       404:
 *         description: Organization not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Organization not found"
 *       409:
 *         description: Conflict error, missing organization ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 userMessage:
 *                   type: string
 *                   example: "No organization id provided."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the organization."
 */

router.put(
  '/user/updateOrganization/:organizationId',
  upload.single('organizationLogo'),
  async (req, res, next) => {
    try {
      const organizationId = req.params.organizationId;
      const userId = req.userId;
      const file = req.file;
      // todo: check whether user is part of this organization before updating
      if (!organizationId) {
        throw new Error(
          JSON.stringify({
            statusCode: 409,
            userMessage: 'No organization id provided.',
          })
        );
      }
      // ! update details in DB
      // fields getting updated - organizationName, location, organizationLogo, industryType
      const { address, removeLogo, ...payload } = {
        ...req.body,
      };
      if (file) {
        const stream = fs.createReadStream(file.path);
        try {
          await generateOrganizationLogoUrlUpload(organizationId, stream);
          const url = await generateOrganizationLogoUrlDownload(organizationId);
          payload.organizationLogo = url;
        } finally {
          await unlinkfile(file.path);
        }
      } else if (removeLogo === 'true') {
        await deleteOrganizationLogo(organizationId).catch(() => {});
        payload.organizationLogo = '';
      }

      const session = await checkWriterDb.startSession();

      let updatedOrg = {};

      try {
        session.startTransaction();
        updatedOrg = await organizationCollection.findByIdAndUpdate(
          organizationId,
          { $set: payload },
          { new: true, session }
        );

        if (!updatedOrg) {
          throw new Error('Organization not found');
        }

        // 2️⃣ Update the related address
        await addressesCollection.findOneAndUpdate(
          { ownerId: organizationId, ownerType: 'organization' },
          {
            $set: { ...JSON.parse(address) },
          },
          { new: true, upsert: true, session }
        );

        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        console.error('transaction failed, ending transaction');
        await session.endSession();
        throw new Error(error);
      }

      appCache.del(`Organization-${organizationId}`);
      return res.status(200).json(updatedOrg);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /users/user/deleteOrganization/{organizationId}:
 *   delete:
 *     summary: Delete an organization
 *     description: Permanently deletes an organization and its associated address from the database.
 *     tags:
 *       - Organization
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization to be deleted.
 *     responses:
 *       200:
 *         description: Organization deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: "Organization deleted successfully."
 *       404:
 *         description: Organization not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Organization not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while deleting the organization."
 */

// delete organization
router.delete(
  '/user/deleteOrganization/:organizationId',
  async (req, res, next) => {
    try {
      const organizationId = req.params.organizationId;

      const session = await checkWriterDb.startSession();
      try {
        session.startTransaction();

        const deletedOrg = await organizationCollection.findByIdAndDelete(
          organizationId,
          { session }
        );

        if (!deletedOrg) {
          throw new Error('Organization not found');
        }

        await addressesCollection.deleteOne(
          { ownerId: organizationId },
          { session }
        );

        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error deleting organization:', error);
        throw error;
      }

      appCache.del(`Organization-${organizationId}`);
      return res
        .status(200)
        .json({ success: 'Organization deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// get a specific organization
/**
 * @swagger
 * /users/user/getOrganization/{organizationId}:
 *   get:
 *     summary: Get organization details
 *     description: Retrieves organization details by organization ID. Uses caching for faster retrieval if available.
 *     tags:
 *       - Organization
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved organization details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "605c72e8f1b6c92ff7e2f7b5"
 *                 organizationName:
 *                   type: string
 *                   example: "Acme Corp"
 *                 address:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                       example: "123 Main St"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     state:
 *                       type: string
 *                       example: "NY"
 *                     zip:
 *                       type: string
 *                       example: "10001"
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     wantSignature:
 *                       type: boolean
 *                       example: false
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["605c72e8f1b6c92ff7e2f7b2"]
 *       404:
 *         description: Organization not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Organization not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while retrieving the organization."
 */

router.get('/user/getOrganization/:organizationId', async (req, res, next) => {
  try {
    const userId = req.userId;
    const organizationId = req.params.organizationId;
    let organization;
    if (appCache.has(`Organization-${organizationId}`))
      organization = appCache.get(`Organization-${organizationId}`);
    else {
      organization = await getOrganizationDB(organizationId);
      // appCache.set(`Organization-${organizationId}`, organization);
    }
    return res.status(200).json(organization);
  } catch (err) {
    next(err);
  }
});

// get all user organizations
/**
 * @swagger
 * /users/user/getAllOrganizations:
 *   get:
 *     summary: Get all organizations for the authenticated user
 *     description: Retrieves a list of all organizations the authenticated user is a part of.
 *     tags:
 *       - Organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of organizations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "605c72e8f1b6c92ff7e2f7b5"
 *                   organizationName:
 *                     type: string
 *                     example: "Acme Corp"
 *                   industryType:
 *                     type: string
 *                     example: "Technology"
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                         example: "123 Main St"
 *                       city:
 *                         type: string
 *                         example: "New York"
 *                       state:
 *                         type: string
 *                         example: "NY"
 *                       zip:
 *                         type: string
 *                         example: "10001"
 *                   preferences:
 *                     type: object
 *                     properties:
 *                       wantSignature:
 *                         type: boolean
 *                         example: false
 *                   users:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["605c72e8f1b6c92ff7e2f7b2"]
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while retrieving organizations."
 */

router.get('/user/getAllOrganizations', async (req, res, next) => {
  try {
    const userId = req.userId;

    const userOrgLinks = await userToOrganizationCollection.find({
      userId: userId.toString(),
    }).lean();

    const orgIds = userOrgLinks.map((link) => link.organizationId).filter(Boolean);
    if (orgIds.length === 0) {
      return res.status(200).json([]);
    }

    const orgs = await organizationCollection.find({
      _id: { $in: orgIds },
    }).lean();

    const orgResults = await Promise.all(
      orgs.map(async (org) => {
        const address = await addressesCollection.findOne({
          ownerId: org._id?.toString(),
        }).lean();

        const orgPlain = typeof org.toObject === 'function' ? org.toObject() : { ...org };
        if (address) {
          const addrPlain = typeof address.toObject === 'function' ? address.toObject() : { ...address };
          const { _id: addrId, createdAt: _ac, updatedAt: _au, id: _aid, ...addrFields } = addrPlain;
          return { ...orgPlain, ...addrFields, address: addrPlain };
        }
        return { ...orgPlain, address: null };
      })
    );

    return res.status(200).json(orgResults);
  } catch (err) {
    next(err);
  }
});

// ! delete organization logo
/**
 * @swagger
 * /users/user/organization/logo:
 *   delete:
 *     summary: Delete an organization's logo
 *     description: Removes the logo associated with a specific organization.
 *     tags:
 *       - Organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted the organization logo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organization logo deleted successfully"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while deleting the organization logo."
 */

router.delete('/user/organization/logo', async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    await deleteOrganizationLogo(organizationId);
    return res.status(200).json({
      message: 'Organization logo deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/subscription:
 *   get:
 *     summary: Get user subscription information
 *     description: Retrieves the subscription details for the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved subscription details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan:
 *                   type: string
 *                   example: "Premium"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 renewalDate:
 *                   type: string
 *                   format: date
 *                   example: "2025-04-01"
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Unlimited Access", "Priority Support", "Custom Reports"]
 *       404:
 *         description: Subscription information not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Subscription not found"
 *       500:
 *         description: Internal server error while retrieving subscription information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching subscription details."
 */

router.get('/subscription', async (req, res, next) => {
  try {
    const { userId: userIdFromQuery } = req.query;
    const authenticatedUserId = req.userId;

    if (userIdFromQuery && String(userIdFromQuery) !== String(authenticatedUserId)) {
      const requester = await getUser({ _id: authenticatedUserId });
      if (!requester || requester.role !== 'superadmin') {
        return res.status(403).json({ error: "Admin access required to view other users' subscriptions." });
      }
    }

    const userId = userIdFromQuery || authenticatedUserId;

    const response = await SubscriptionService.getSubscriptionDetails({ userId });
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
});

router.get('/paymentmethods', async (req, res, next) => {
  try {
    const userId = req.userId;
    const paymentMethods = await SubscriptionService.listCustomerPaymentMethods(
      userId
    );
    return res.status(200).json(paymentMethods);
  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
});

export default router;
