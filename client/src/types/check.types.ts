import { OwnerType } from './user.types';

export const CHECK_STATUS = Object.freeze({
    DRAFT:'DRAFT',
    VOID:'VOID',
    CLEARED:'CLEARED',
    BLANK:'BLANK',
    PRINTED:'PRINTED',
    SUBMITTED:'SUBMITTED',
    MAILED:'MAILED',
    EMAILED:'EMAILED',
    UNCLEARED:'UNCLEARED'
})

export const CHECK_PERMISSIONS = Object.freeze({
      canEdit: 'canEdit',
      canEmail: 'canEmail',
      canMail: 'canMail',
      canDelete: 'canDelete',
      canPrint: 'canPrint',
      canVoid: 'canVoid',
      canClear: 'canClear'
})

export type ICheckStatus = (typeof CHECK_STATUS)[keyof typeof CHECK_STATUS];

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IPermission {
      canEdit: boolean;
      canEmail: boolean;
      canMail: boolean;
      canDelete: boolean;
      canPrint: boolean;
      canVoid: boolean;
      canClear: boolean;
}

export interface ICheck {
  _id?: string;
  status: ICheckStatus;
  ownerId: string;
  ownerType: OwnerType;
  checkNumber: number;
  invoiceId?: string;
  amount?: number;
  createdDate?: string; 
  issuedDate?: string;
  payeeId?: string;
  bankId?: string;
  address?: IAddress;
  tags?: string[] 
  memo?: string;
  description?: string;
  createdAtUnix?: number;
  updatedAtUnix?: number;
  pdfStored?: boolean;
  isSignatureSelected?: boolean;
  isBlankCheck?: boolean;
  permissions: IPermission;
}
