export interface IQuickbook {
    ownerId: string;
    ownerType: string
    isActive: boolean;
    accessToken: string
    refreshToken: string
    realmId: string
    accessTokenExpiresAt: Date
    refreshTokenExpiresAt: Date
    createdAt: Date
    updatedAt: Date
}

interface BankAccountDetail {
  _id: string;
  bankName: string;
  accountType: string;
  accountName: string;
  accountNickName: string;
  accountNumber: number;
  bankRoutingNumber: string;
  bankTransitNumber: null | string;
  financialInstituteNumber: null | string;
  country: string;
  bankPreferences: {
    checkNumbers: {};
    defaultCheckNumberLength: number;
    defaultCheckStartNumber: number;
    lastUsedCheckNumber: number;
    _id: string;
  };
  balance: number;
  ownerId: string;
  ownerType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BankAccount {
  _id: string;
  quickbooksId: string;
  ownerId: string;
  ownerType: string;
  entityType: string;
  __v: number;
  createdAt: string;
  internalId: string;
  quickbooksAccountId: string;
  quickbooksName: string;
  updatedAt: string;
  detail: BankAccountDetail;
}

interface PayeeAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: number;
  _id: string;
}

interface PayeeDetail {
  _id: string;
  name: string;
  companyName: string;
  address: PayeeAddress;
  phone: string;
  email: string;
  ownerId: string;
  status: string;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Payee {
  _id: string;
  quickbooksId: string;
  ownerId: string;
  ownerType: string;
  entityType: string;
  __v: number;
  createdAt: string;
  internalId: string;
  quickbooksAccountId: string;
  quickbooksName: string;
  updatedAt: string;
  detail: PayeeDetail;
}

export interface QuickbooksMapping {
  bankAccounts: BankAccount[];
  payees: Payee[];
}