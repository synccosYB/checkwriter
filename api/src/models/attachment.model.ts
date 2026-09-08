import { OwnerType } from '../enums/user.enum';
import { attachmentsCollection } from './dbCollections';

export enum EntityType {
  CHECK = 'checks',
  TRANSACTION = 'transactions',
  CHECK_IMPORT = 'checkimports',
  PAYMENT_LINK = 'paymentLink',
  USERS = 'users',
  ORGANIZATIONS = 'organizations',
  BANKS = 'banks',
}

export interface IAttachment {
  _id?: string;
  entityType: EntityType;
  entityId: string;
  ownerType: OwnerType;
  ownerId: string;
  filename: string;
  description?: string;
  extension: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const Attachment = attachmentsCollection;
