import { OwnerType } from "./user.types";

export enum EntityType {
  CHECK = 'checks',
  TRANSACTION = 'transactions',
  PAYMENT_LINK = 'paymentLink'
}


export interface Attachment {
  _id: string;
  entityType: string;
  entityId: string;
  ownerType: OwnerType;
  ownerId: string;
  filename: string;
  description: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  isDeleted: boolean;
  extension: string;
}

export interface GetAttachmentsParams {
  entityType: string;
  entityId: string;
}

export interface UploadAttachment {
  buffer: Blob;
  originalname: string;
  mimetype: string;
  size: number;
  description: string;
}

export interface UploadRequest {
  entityType: string;
  entityId: string;
  files: File[];
  descriptions?: string[];
}

export interface UpdateDescriptionPayload {
  updates: { attachmentId: string; description: string }[];
}

export interface DeleteAttachmentsPayload {
  attachmentIds: string[];
}

export interface DownloadResult {
  result: {
    url: string;
  };
}