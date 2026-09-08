import express from 'express';
import { tagsCollection } from '../models/dbCollections';
import { UserAuthRequest } from '../utils/types';
import { migrateData } from '../migrations/tagsMigration.js';
import { AuditLogService } from '../services/auditLog.service';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../enums/auditLog.enum';
import { db } from '../db/index.js';
import { checks } from '../db/schema.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

/**
 * @swagger
 * /tags/{ownerType}:
 *   get:
 *     summary: Retrieve a list of tags for a user or organization
 *     description: Fetches all tags associated with the specified owner type (`user` or `organization`) and includes an `inUse` flag indicating whether the tag is referenced in other collections.
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the tags belong to a user or an organization.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "66200e8f3a91a2b6b73d42ea"
 *                   ownerId:
 *                     type: string
 *                     example: "661fe8b2458fc0a2d12d0937"
 *                   ownerType:
 *                     type: string
 *                     enum: [user, organization]
 *                     example: "user"
 *                   name:
 *                     type: string
 *                     example: "Important"
 *                   color:
 *                     type: string
 *                     example: "#FF5733"
 *                   group:
 *                     type: string
 *                     example: "66200f723a91a2b6b73d42ed"
 *                   inUse:
 *                     type: boolean
 *                     example: true
 *                     description: Indicates whether the tag is referenced in other collections (e.g., checks).
 *       500:
 *         description: Internal server error while fetching tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching tags."
 */

router.get('/:ownerType', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType } = req.params;

    const ownerId = ownerType === 'user' ? userId : orgId;

    interface TagRow {
      _id: string;
      [key: string]: unknown;
    }
    interface TagInUseRow extends Record<string, unknown> {
      tag_id: string;
    }

    const tags = (await tagsCollection
      .find({ ownerType, ownerId })
      .lean()) as TagRow[];

    // Resolve "is this tag referenced by any check?" in a single query
    // instead of N copies of findReferencesInAllCollections.
    const inUse = new Set<string>();
    if (tags.length > 0) {
      const tagIds = tags.map((t) => String(t._id));
      const result = await db.execute<TagInUseRow>(sql`
        SELECT DISTINCT t.value AS tag_id
        FROM ${checks} c, jsonb_array_elements_text(
          CASE jsonb_typeof(c.tags) WHEN 'array' THEN c.tags ELSE '[]'::jsonb END
        ) AS t(value)
        WHERE c.owner_id = ${ownerId}
          AND c.owner_type = ${ownerType}
          AND t.value = ANY(${tagIds}::text[])
      `);
      const resultRows: TagInUseRow[] = Array.isArray(result)
        ? (result as unknown as TagInUseRow[])
        : ((result as { rows?: TagInUseRow[] }).rows ?? []);
      for (const row of resultRows) {
        if (row?.tag_id) inUse.add(String(row.tag_id));
      }
    }

    const updatedResult = tags.map((tag) => ({
      ...tag,
      inUse: inUse.has(String(tag._id)),
    }));

    res.send(updatedResult);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/migrate-old-tags', async (req, res) => {
  try {
    const result = await migrateData();

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /tags/{ownerType}:
 *   post:
 *     summary: Create a new tag for a user or organization
 *     description: Creates a tag associated with a specific user or organization based on the owner type.
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the tag belongs to a user or an organization.
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
 *                 example: "Urgent"
 *               color:
 *                 type: string
 *                 example: "#00FF00"
 *               group:
 *                 type: string
 *                 example: "66200f723a91a2b6b73d42ed"
 *     responses:
 *       200:
 *         description: Tag created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "66200e8f3a91a2b6b73d42ea"
 *                 ownerId:
 *                   type: string
 *                   example: "661fe8b2458fc0a2d12d0937"
 *                 ownerType:
 *                   type: string
 *                   enum: [user, organization]
 *                   example: "user"
 *                 name:
 *                   type: string
 *                   example: "Urgent"
 *                 color:
 *                   type: string
 *                   example: "#00FF00"
 *                 group:
 *                   type: string
 *                   example: "66200f723a91a2b6b73d42ed"
 *       500:
 *         description: Internal server error while creating tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while creating the tag."
 */

router.post('/:ownerType', async (req: UserAuthRequest, res) => {
  const userId = req.userId;
  const orgId = req.organizationId;
  const { ownerType } = req.params;

  const ownerId = ownerType === 'user' ? userId : orgId;

  const body = req.body;

  const newTag = await tagsCollection.create({ ...body, ownerId, ownerType });
  await AuditLogService.logAction({
    entityType: AUDIT_ENTITY_TYPES.tags,
    action: AUDIT_ACTIONS.Created,
    userId: userId,
    entityId: newTag._id,
    ownerType: newTag.ownerType,
    ownerId: newTag.ownerId,
    oldData: null,
    newData: newTag.toObject(),
  });
  res.send(newTag);

  try {
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /tags/{ownerType}/{tagId}:
 *   put:
 *     summary: Update a tag for a user or organization
 *     description: Updates an existing tag identified by tagId for the specified owner type (`user` or `organization`).
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the tag belongs to a user or an organization.
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tag to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Tag Name"
 *               color:
 *                 type: string
 *                 example: "#123456"
 *               group:
 *                 type: string
 *                 example: "66200f723a91a2b6b73d42ed"
 *     responses:
 *       200:
 *         description: Tag updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "66200e8f3a91a2b6b73d42ea"
 *                 ownerId:
 *                   type: string
 *                   example: "661fe8b2458fc0a2d12d0937"
 *                 ownerType:
 *                   type: string
 *                   enum: [user, organization]
 *                   example: "user"
 *                 name:
 *                   type: string
 *                   example: "Updated Tag Name"
 *                 color:
 *                   type: string
 *                   example: "#123456"
 *                 group:
 *                   type: string
 *                   example: "66200f723a91a2b6b73d42ed"
 *       500:
 *         description: Internal server error while updating the tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the tag."
 */

router.put('/:ownerType/:tagId', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType, tagId } = req.params;

    const ownerId = ownerType === 'user' ? userId : orgId;
    const body = req.body;

    const oldTag = await tagsCollection.findOne({
      _id: tagId,
      ownerId,
      ownerType,
    });

    const updatedTag = await tagsCollection.findOneAndUpdate(
      { _id: tagId, ownerId, ownerType },
      { ...body },
      { new: true }
    );

    if(updatedTag){
      await AuditLogService.logAction({
        entityType: AUDIT_ENTITY_TYPES.tags,
        action: AUDIT_ACTIONS.Updated,
        userId: userId,
        entityId: updatedTag._id,
        ownerId: updatedTag.ownerId,
        ownerType: updatedTag.ownerType,
        oldData: oldTag.toObject(),
        newData: updatedTag.toObject(),
      });
    }

    res.send(updatedTag);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /tags/{ownerType}/{tagId}:
 *   delete:
 *     summary: Delete a tag for a user or organization
 *     description: Deletes a tag identified by tagId for the specified owner type (`user` or `organization`).
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the tag belongs to a user or an organization.
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tag to delete.
 *     responses:
 *       200:
 *         description: Tag deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "66200e8f3a91a2b6b73d42ea"
 *                 ownerId:
 *                   type: string
 *                   example: "661fe8b2458fc0a2d12d0937"
 *                 ownerType:
 *                   type: string
 *                   enum: [user, organization]
 *                   example: "user"
 *                 name:
 *                   type: string
 *                   example: "Important"
 *                 color:
 *                   type: string
 *                   example: "#FF5733"
 *                 group:
 *                   type: string
 *                   example: "66200f723a91a2b6b73d42ed"
 *       500:
 *         description: Internal server error while deleting the tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while deleting the tag."
 */

router.delete('/:ownerType/:tagId', async (req: UserAuthRequest, res) => {
  try {
    const userId = req.userId;
    const orgId = req.organizationId;
    const { ownerType, tagId } = req.params;

    const ownerId = ownerType === 'user' ? userId : orgId;

    const tagToDelete = await tagsCollection.findOneAndDelete({
      _id: tagId,
      ownerId,
      ownerType,
    }, {new: true});

    await AuditLogService.logAction({
      entityType: AUDIT_ENTITY_TYPES.tags,
      action: AUDIT_ACTIONS.Deleted,
      userId: userId,
      entityId: tagToDelete._id,
      ownerId: tagToDelete.ownerId,
      ownerType: tagToDelete.ownerType,
      oldData: tagToDelete.toObject(),
      newData: null,
    });

    res.send(tagToDelete);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
