import { Router, Request, Response } from 'express';
import multer from 'multer';
import { AttachmentService } from '../services/attachments.service';
import { OwnerType } from '../enums/user.enum';
import { SynccosRequest } from '../types/express';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /attachments/{ownerType}:
 *   get:
 *     summary: Get all attachments for an entity
 *     tags:
 *       - Attachments
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether to retrieve addresses for a user or an organization.
 *       - in: query
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           example: checks
 *       - in: query
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attachments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       500:
 *         description: Failed to fetch attachments
 */

router.get(
  '/:ownerType',
  async (req: SynccosRequest, res: Response): Promise<void> => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === OwnerType.USER ? userId : organizationId;

      const { entityType, entityId } = req.query;

      const attachments = await AttachmentService.getAttachmentsByEntity({
        entityType,
        entityId,
        ownerType,
        ownerId,
      });

      res.json({ attachments });
    } catch (err) {
      console.error('getAttachmentsByEntity error:', err);
      res.status(500).json({ error: 'Failed to fetch attachments' });
    }
  }
);

/**
 * @swagger
 * /attachments/{ownerType}:
 *   post:
 *     summary: Upload attachments
 *     tags:
 *       - Attachments
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - descriptions
 *               - entityType
 *               - entityId
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               descriptions:
 *                type: array
 *                items:
 *                   type: string
 *               entityType:
 *                 type: string
 *                 example: checks
 *               entityId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attachments uploaded successfully
 *       400:
 *         description: Missing metadata or no files
 *       500:
 *         description: Failed to upload attachments
 */

router.post(
  '/:ownerType',
  upload.array('files'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === OwnerType.USER ? userId : organizationId;

      let { descriptions, entityType, entityId } = req.body;

      if (!entityType || !entityId || !ownerType || !ownerId) {
        res.status(400).json({ error: 'Missing required metadata fields' });
        return;
      }

      const files = req.files as Express.Multer.File[];

      if (!files?.length) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      if (!Array.isArray(descriptions)) {
        descriptions = descriptions ? [descriptions] : [];
      }

      const formattedFiles = files.map((file, i) => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        description: descriptions[i] || '',
      }));

      const attachments = await AttachmentService.createAttachments({
        files: formattedFiles,
        entityType,
        entityId,
        ownerType: ownerType as OwnerType,
        ownerId,
        uploadedBy: userId,
      });

      res.status(201).json({ attachments });
    } catch (err) {
      console.error('createAttachments error:', err);
      res.status(500).json({ error: 'Failed to upload attachments' });
    }
  }
);

/**
 * @swagger
 * /attachments/updateDescription/{ownerType}:
 *   put:
 *     summary: Update descriptions for multiple attachments
 *     tags:
 *       - Attachments
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - attachmentId
 *                     - description
 *                   properties:
 *                     attachmentId:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Descriptions updated successfully
 *       500:
 *         description: Failed to update descriptions
 */

router.put(
  '/updateDescription/:ownerType',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === OwnerType.USER ? userId : organizationId;

      const { updates } = req.body; // [{ attachmentId, description }]

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({ error: 'Missing or invalid updates array' });
        return;
      }

      for (const update of updates) {
        const { attachmentId, description } = update;
        if (!attachmentId || !description) {
          res.status(400).json({ error: 'Missing required fields in updates' });
          return;
        }
        await AttachmentService.updateAttachmentDescriptions({
          attachmentId,
          description,
          ownerType: ownerType as OwnerType,
          ownerId: ownerId.toString(),
        });
      }

      res.json({ message: 'Descriptions updated' });
    } catch (err) {
      console.error('updateAttachmentDescriptions error:', err);
      res.status(500).json({ error: 'Failed to update descriptions' });
    }
  }
);

/**
 * @swagger
 * /attachments/{ownerType}:
 *   delete:
 *     summary: Soft delete attachments
 *     tags:
 *       - Attachments
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attachmentIds
 *             properties:
 *               attachmentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Attachments deleted successfully
 *       500:
 *         description: Failed to delete attachments
 */

router.delete(
  '/:ownerType',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === OwnerType.USER ? userId : organizationId;

      const { attachmentIds } = req.body;

      await AttachmentService.deleteAttachments({
        attachmentIds,
        ownerType: ownerType as OwnerType,
        ownerId: ownerId.toString(),
      });

      res.json({ message: 'Attachments deleted' });
    } catch (err) {
      console.error('deleteAttachments error:', err);
      res.status(500).json({ error: 'Failed to delete attachments' });
    }
  }
);

/**
 * @swagger
 * /attachments/download/{ownerType}/{attachmentId}:
 *   get:
 *     summary: Generate a pre-signed download URL for an attachment
 *     tags:
 *       - Attachments
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: The type of owner (user or organization)
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download URL returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       500:
 *         description: Failed to generate download URL
 */

router.get(
  '/download/:ownerType/:attachmentId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;
      const organizationId = req.organizationId;

      const ownerId = ownerType === OwnerType.USER ? userId : organizationId;

      const { attachmentId } = req.params;

      const result = await AttachmentService.downloadAttachment({
        attachmentId: attachmentId as string,
        ownerType: ownerType as OwnerType,
        userId: ownerId,
      });
      res.status(200).json({ result });
    } catch (err) {
      console.error('getAttachmentById error:', err);
      res.status(500).json({ error: 'Failed to fetch attachment' });
    }
  }
);

export default router;
