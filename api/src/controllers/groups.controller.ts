import express from 'express';
import { groupsCollection } from '../models/dbCollections';
import { UserAuthRequest } from '../utils/types';

const router = express.Router();

/**
 * @swagger
 * /groups/{ownerType}:
 *   get:
 *     summary: Retrieve a list of groups for a user or organization
 *     description: Fetches all groups associated with the specified owner type (`user` or `organization`).
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the groups belong to a user or an organization.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "66200f723a91a2b6b73d42ed"
 *                   name:
 *                     type: string
 *                     example: "Finance Team"
 *                   color:
 *                     type: string
 *                     example: "#4287f5"
 *                   ownerId:
 *                     type: string
 *                     example: "661fe8b2458fc0a2d12d0937"
 *                   ownerType:
 *                     type: string
 *                     enum: [user, organization]
 *                     example: "user"
 *       500:
 *         description: Internal server error while fetching groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching groups."
 */

router.get('/:ownerType', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType } = req.params;

    const ownerId = ownerType === 'user' ? userId : orgId;

    const groups = await groupsCollection.find({ ownerId, ownerType });

    res.send(groups);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/{ownerType}:
 *   post:
 *     summary: Create a new group for a user or organization
 *     description: Creates a new group associated with the specified owner type (`user` or `organization`).
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the group belongs to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Engineering Team"
 *               color:
 *                 type: string
 *                 example: "#00BFFF"
 *     responses:
 *       200:
 *         description: Successfully created the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "66200f723a91a2b6b73d42ed"
 *                 name:
 *                   type: string
 *                   example: "Engineering Team"
 *                 color:
 *                   type: string
 *                   example: "#00BFFF"
 *                 ownerId:
 *                   type: string
 *                   example: "661fe8b2458fc0a2d12d0937"
 *                 ownerType:
 *                   type: string
 *                   enum: [user, organization]
 *                   example: "organization"
 *       500:
 *         description: Internal server error while creating the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while creating the group."
 */

router.post('/:ownerType', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType } = req.params;

    const body = req.body;

    const ownerId = ownerType === 'user' ? userId : orgId;

    const newGroup = await groupsCollection.create({
      ...body,
      ownerId,
      ownerType,
    });

    res.send(newGroup);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/{ownerType}/{groupId}:
 *   put:
 *     summary: Update an existing group
 *     description: Updates the details of an existing group belonging to a user or organization.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies the ownership context of the group.
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Team Name"
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *     responses:
 *       200:
 *         description: Successfully updated the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "66200f723a91a2b6b73d42ed"
 *                 name:
 *                   type: string
 *                   example: "Updated Team Name"
 *                 color:
 *                   type: string
 *                   example: "#FF5733"
 *                 ownerId:
 *                   type: string
 *                   example: "661fe8b2458fc0a2d12d0937"
 *                 ownerType:
 *                   type: string
 *                   enum: [user, organization]
 *                   example: "user"
 *       500:
 *         description: Internal server error while updating the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the group."
 */

router.put('/:ownerType/:groupId', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType, groupId } = req.params;

    const ownerId = ownerType === 'user' ? userId : orgId;
    const body = req.body;

    const updatedTag = await groupsCollection.findOneAndUpdate(
      { _id: groupId, ownerId, ownerType },
      { ...body },
      { new: true }
    );

    res.send(updatedTag);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/{ownerType}/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     description: Deletes a group owned by a user or organization.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies the ownership context of the group.
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "66200f723a91a2b6b73d42ed"
 *                 name:
 *                   type: string
 *                   example: "Engineering"
 *                 color:
 *                   type: string
 *                   example: "#3498db"
 *                 ownerId:
 *                   type: string
 *                   example: "661fe8b2458fc0a2d12d0937"
 *                 ownerType:
 *                   type: string
 *                   enum: [user, organization]
 *                   example: "user"
 *       500:
 *         description: Internal server error while updating the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the group."
 */

router.delete('/:ownerType/:groupId', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType, groupId } = req.params;

    const ownerId = ownerType === 'user' ? userId : orgId;

    const tagToDelete = await groupsCollection.findOneAndDelete({
      _id: groupId,
      ownerId,
      ownerType,
    });
    res.send(tagToDelete);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
