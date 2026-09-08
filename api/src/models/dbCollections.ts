import { createModel, registerPopulateTable } from '../db/compat.js';
import {
  addresses,
  authentications,
  banks,
  carrierShipments,
  checkImportRows,
  checkImports,
  checkRegisterTransactions,
  checks,
  groups,
  lobMailRecords,
  mfa,
  mfaTemp,
  mailedChecks,
  mailBatches,
  organizations,
  payees,
  paymentLinks,
  plaidAccountDetails,
  postgridDetails,
  qbChecks,
  quickbooksAccountDetails,
  quickbooksMappings,
  regions,
  stripeCustomers,
  stripeSubscriptions,
  stripeUsers,
  tags,
  transactions,
  userToOrganizations,
  users,
  usersSubscriptions,
  verifications,
  attachments,
  auditLogs,
  platformSettings,
  adminMessages,
} from '../db/schema.js';

export const addressesCollection = createModel(addresses);
export const transactionsCollection = createModel(transactions);
export const payeesCollection = createModel(payees);
export const banksCollection = createModel(banks);
export const usersCollection = createModel(users);
export const organizationCollection = createModel(organizations);
export const tagsCollection = createModel(tags);
export const groupsCollection = createModel(groups);
export const checksCollection = createModel(checks);
export const authenticationCollection = createModel(authentications);
export const checkRegisterTransactionsCollection = createModel(checkRegisterTransactions);
export const mfaCollection = createModel(mfa);
export const mfaTempCollection = createModel(mfaTemp);
export const userToOrganizationCollection = createModel(userToOrganizations);
export const PaymentLinkCollection = createModel(paymentLinks);
export const plaidAccountDetailsCollection = createModel(plaidAccountDetails);
export const postgridDetailsCollection = createModel(postgridDetails);
export const quickBooksAccountDetailsCollection = createModel(quickbooksAccountDetails);
export const regionByPinCollection = createModel(regions);
export const StripeUserCollection = createModel(stripeUsers);
export const StripeCustomersCollection = createModel(stripeCustomers);
export const StripeSubscriptionsCollection = createModel(stripeSubscriptions);
export const verificationCollection = createModel(verifications);
export const usersSubscriptionCollection = createModel(usersSubscriptions);
export const mailedChecksCollection = createModel(mailedChecks);
export const mailsBatchCollection = createModel(mailBatches);
export const checkImportCollection = createModel(checkImports);
export const checkImportRowCollection = createModel(checkImportRows);
export const quickbooksmappingsCollection = createModel(quickbooksMappings);
export const qbChecksCollection = createModel(qbChecks);
export const auditLogsCollection = createModel(auditLogs);
export const lobMailRecordsCollection = createModel(lobMailRecords);
export const carrierShipmentsCollection = createModel(carrierShipments);
export const attachmentsCollection = createModel(attachments);
export const platformSettingsCollection = createModel(platformSettings);
export const adminMessagesCollection = createModel(adminMessages);

registerPopulateTable('addresses', addresses);
registerPopulateTable('address', addresses);
registerPopulateTable('payeeId', payees);
registerPopulateTable('payee', payees);
registerPopulateTable('payees', payees);
registerPopulateTable('bankId', banks);
registerPopulateTable('bank', banks);
registerPopulateTable('banks', banks);
registerPopulateTable('checkId', checks);
registerPopulateTable('check', checks);
registerPopulateTable('checks', checks);
registerPopulateTable('userId', users);
registerPopulateTable('user', users);
registerPopulateTable('users', users);
registerPopulateTable('requestedBy', users);
registerPopulateTable('processedBy', users);
registerPopulateTable('mailedBy', users);
registerPopulateTable('createdBy', users);
registerPopulateTable('batchId', mailBatches);
registerPopulateTable('mailBatches', mailBatches);
registerPopulateTable('mail_batches', mailBatches);
registerPopulateTable('importId', checkImports);
registerPopulateTable('stripeUserId', stripeUsers);
registerPopulateTable('qbCheckId', qbChecks);
registerPopulateTable('mailed_checks', mailedChecks);
registerPopulateTable('mailedChecks', mailedChecks);
registerPopulateTable('transactions', transactions);
registerPopulateTable('organizations', organizations);
registerPopulateTable('authentications', authentications);
registerPopulateTable('tags', tags);
registerPopulateTable('groups', groups);

export interface IQuickBooksMapping {
  ownerType: 'user' | 'organization';
  ownerId: string;
  entityType: 'payees' | 'banks';
  quickbooksId: string;
  quickbooksName: string;
  quickbooksAccountId: string;
  internalId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  rawData?: any;
}

export interface IQbCheck {
  ownerType: 'user' | 'organization';
  ownerId: string;
  realmId: string;
  quickbooksId: string;
  payeeQuickBooksId: string;
  bankQuickBooksId: string;
  quickbooksAccountId: string;
  amount: number;
  memo?: string;
  txnDate: Date;
  status: 'pending' | 'ready';
  rawData?: any;
  createdAt?: Date;
  updatedAt?: Date;
  checkId: string;
}

export interface IAuditLog {
  entityType: string;
  entityId: string;
  ownerId: string;
  ownerType: string;
  action: string;
  userId: string;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export const MAILED_CHECK_DEFAULT_CHARGE = 1.59;

export const BILLING_MODES = Object.freeze({
  PLATFORM: 'platform',
  USER_ACCOUNT: 'user_account',
});
