import {
  Attachment,
  IAttachment,
  EntityType,
} from '../models/attachment.model';
import { generateObjectId } from '../db/schema';
import config from 'config';
import { OwnerType } from '../enums/user.enum';
import { uploadToS3, getPresignedDownloadUrl } from '../utils/s3.util.js';

interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  description?: string;
}

export class AttachmentService {
  static async createAttachments({
    files,
    entityType,
    entityId,
    ownerType,
    ownerId,
    uploadedBy,
  }: {
    files: UploadFile[];
    entityType: EntityType;
    entityId: string;
    ownerType: OwnerType;
    ownerId: string;
    uploadedBy: string;
  }): Promise<IAttachment[]> {
    const attachments: IAttachment[] = [];

    for (const file of files) {
      const attachmentId = generateObjectId();
      const extension = file.originalname.split('.').pop()!;
      const s3Key = `attachments/${ownerType}/${ownerId}/${entityType}/${entityId}/${attachmentId}.${extension}`;

      await uploadToS3({
        Bucket: config.s3.bucket_name,
        Key: s3Key,
        ContentType: file.mimetype,
        Body: file.buffer,
      });

      const attachment = await Attachment.create({
        _id: attachmentId,
        entityType,
        entityId,
        ownerType,
        ownerId,
        filename: file.originalname,
        description: file.description,
        extension,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy,
        isDeleted: false,
      });

      attachments.push(attachment);
    }

    return attachments;
  }

  static async getAttachmentsByEntity({
    entityType,
    entityId,
    ownerType,
    ownerId,
  }: {
    entityType: string;
    entityId: string;
    ownerType: 'user' | 'organization';
    ownerId: string;
  }) {
    return Attachment.find({
      entityType,
      entityId,
      ownerType,
      ownerId,
      isDeleted: false,
    }).lean();
  }

  /**
   * Batch lookup of attachments for many entities of the same type/owner.
   * Returns a Map keyed by entityId. Replaces the N+1 pattern of calling
   * getAttachmentsByEntity inside a per-row loop.
   */
  static async getAttachmentsByEntities({
    entityType,
    entityIds,
    ownerType,
    ownerId,
  }: {
    entityType: string;
    entityIds: string[];
    ownerType: 'user' | 'organization';
    ownerId: string;
  }): Promise<Map<string, IAttachment[]>> {
    const map = new Map<string, IAttachment[]>();
    if (!entityIds || entityIds.length === 0) return map;

    const rows = (await Attachment.find({
      entityType,
      entityId: { $in: entityIds },
      ownerType,
      ownerId,
      isDeleted: false,
    }).lean()) as IAttachment[];

    for (const row of rows) {
      const rawKey: unknown = (row as { entityId?: unknown }).entityId;
      const key =
        typeof rawKey === 'string'
          ? rawKey
          : rawKey != null && typeof (rawKey as { toString?: () => string }).toString === 'function'
            ? (rawKey as { toString: () => string }).toString()
            : String(rawKey);
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return map;
  }

  static async updateAttachmentDescriptions({
    attachmentId,
    description,
    ownerType,
    ownerId,
  }: {
    attachmentId: string;
    description: string;
    ownerType: 'user' | 'organization';
    ownerId: string;
  }) {
    const attachment = await Attachment.findOne({
      _id: attachmentId,
      ownerType,
      ownerId,
      isDeleted: false,
    });

    if (!attachment) {
      throw new Error('Attachment not found or access denied');
    }

    if (attachment) {
      attachment.description = description;
      await attachment.save();
    }

    return { success: true };
  }

  static async deleteAttachments({
    attachmentIds,
    ownerType,
    ownerId,
  }: {
    attachmentIds: string[];
    ownerType: 'user' | 'organization';
    ownerId: string;
  }) {
    const now = new Date();
    await Attachment.updateMany(
      {
        _id: { $in: attachmentIds },
        ownerType,
        ownerId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: now,
        },
      }
    );

    return { success: true };
  }

  static async downloadAttachment({
    attachmentId,
    ownerType,
    userId,
  }: {
    attachmentId: string;
    ownerType: 'user' | 'organization';
    userId: string;
  }) {
    const attachment = await Attachment.findOne({
      _id: attachmentId,
      ownerType,
      ownerId: userId,
      isDeleted: false,
    });

    if (!attachment) {
      throw new Error('Attachment not found or access denied');
    }
    const s3Key = `attachments/${attachment.ownerType}/${attachment.ownerId}/${attachment.entityType}/${attachment.entityId}/${attachmentId}.${attachment.extension}`;
    const s3Url = await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: s3Key,
      expiresIn: 60 * 60,
    });

    return { url: s3Url };
  }
}
