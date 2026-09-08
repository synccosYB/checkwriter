import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
  index,
  uniqueIndex,
  serial,
  bigint,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

function id() {
  return varchar('_id', { length: 24 }).primaryKey().$defaultFn(() => generateObjectId());
}

function objectIdRef(name: string) {
  return varchar(name, { length: 24 });
}

function ownerFields() {
  return {
    ownerId: objectIdRef('owner_id').notNull(),
    ownerType: text('owner_type').notNull(),
  };
}

function timestamps() {
  return {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  };
}

export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

// ─── Users ───
export const users = pgTable('users', {
  _id: id(),
  firstName: text('first_name'),
  middleName: text('middle_name'),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  lastLogin: timestamp('last_login'),
  preferences: jsonb('preferences'),
  signatureUrl: text('signature_url').default(''),
  signatureAttachmentId: objectIdRef('signature_attachment_id'),
  subscriptionStartedAt: timestamp('subscription_started_at'),
  role: varchar('role', { length: 20 }).default('user'),
  welcomeSeen: boolean('welcome_seen').default(false),
  trialMaxChecks: integer('trial_max_checks'),
  isDemo: boolean('is_demo').default(false),
  demoCreatedAt: timestamp('demo_created_at'),
  isActive: boolean('is_active').default(true).notNull(),
  subscriptionPriceOverride: doublePrecision('subscription_price_override'),
  upsAccountNumber: text('ups_account_number').default(''),
  fedexAccountNumber: text('fedex_account_number').default(''),
  ...timestamps(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_active_idx').on(table.role, table.isActive),
  index('users_is_demo_idx').on(table.isDemo),
]);

// ─── Organizations ───
export const organizations = pgTable('organizations', {
  _id: id(),
  organizationName: text('organization_name').notNull(),
  organizationLogo: text('organization_logo').default(''),
  entityType: text('entity_type').default(''),
  dba: text('dba').default(''),
  formationDate: text('formation_date').default(''),
  industryType: text('industry_type'),
  ein: text('ein').default(''),
  lastUsedCheckNumber: integer('last_used_check_number').default(0),
  signatureUrl: text('signature_url').default(''),
  signatureAttachmentId: objectIdRef('signature_attachment_id'),
  preferences: jsonb('preferences'),
  upsAccountNumber: text('ups_account_number').default(''),
  fedexAccountNumber: text('fedex_account_number').default(''),
  ...timestamps(),
});

// ─── User to Organization mapping ───
export const userToOrganizations = pgTable('user_to_organizations', {
  _id: id(),
  userId: objectIdRef('user_id'),
  organizationId: objectIdRef('organization_id'),
}, (table) => [
  index('user_to_org_user_idx').on(table.userId),
  index('user_to_org_org_idx').on(table.organizationId),
]);

// ─── Addresses ───
export const addresses = pgTable('addresses', {
  _id: id(),
  ...ownerFields(),
  name: text('name'),
  companyName: text('company_name'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  zip: integer('zip'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  ...timestamps(),
});

// ─── Banks ───
export const banks = pgTable('banks', {
  _id: id(),
  bankName: text('bank_name').notNull(),
  accountType: varchar('account_type', { length: 50 }),
  accountName: text('account_name'),
  accountNickName: text('account_nick_name'),
  accountNumber: doublePrecision('account_number'),
  bankRoutingNumber: text('bank_routing_number'),
  bankTransitNumber: doublePrecision('bank_transit_number'),
  financialInstituteNumber: doublePrecision('financial_institute_number'),
  country: text('country'),
  bankAddress1: text('bank_address1'),
  bankCity: text('bank_city'),
  bankState: text('bank_state'),
  bankZip: text('bank_zip'),
  bankPhone: text('bank_phone'),
  bankPreferences: jsonb('bank_preferences'),
  balance: doublePrecision('balance').default(0),
  ...ownerFields(),
  status: varchar('status', { length: 20 }).default('active'),
  ...timestamps(),
}, (table) => [
  index('banks_owner_idx').on(table.ownerId, table.ownerType),
]);

// ─── Payees ───
export const payees = pgTable('payees', {
  _id: id(),
  name: text('name').notNull(),
  nickName: text('nick_name'),
  companyName: text('company_name'),
  address: jsonb('address'),
  phone: text('phone'),
  email: text('email'),
  ...ownerFields(),
  status: varchar('status', { length: 20 }).default('active'),
  ...timestamps(),
}, (table) => [
  index('payees_owner_idx').on(table.ownerId, table.ownerType),
]);

// ─── Tags ───
export const tags = pgTable('tags', {
  _id: id(),
  ...ownerFields(),
  name: text('name'),
  color: text('color'),
  group: objectIdRef('group_id'),
});

// ─── Groups ───
export const groups = pgTable('groups', {
  _id: id(),
  name: text('name'),
  color: text('color'),
  ...ownerFields(),
});

// ─── Checks ───
export const checks = pgTable('checks', {
  _id: id(),
  status: varchar('status', { length: 20 }).default('DRAFT'),
  ...ownerFields(),
  checkNumber: bigint('check_number', { mode: 'number' }).notNull(),
  invoiceId: text('invoice_id'),
  amount: doublePrecision('amount'),
  createdDate: timestamp('created_date'),
  issuedDate: timestamp('issued_date'),
  payeeId: objectIdRef('payee_id'),
  bankId: objectIdRef('bank_id'),
  tags: jsonb('tags').default([]),
  memo: text('memo'),
  description: text('description'),
  createdAtUnix: bigint('created_at_unix', { mode: 'number' }),
  updatedAtUnix: bigint('updated_at_unix', { mode: 'number' }),
  pdfStored: boolean('pdf_stored'),
  isSignatureSelected: boolean('is_signature_selected').default(false),
  isBlankCheck: boolean('is_blank_check').default(false),
  importId: objectIdRef('import_id'),
  qbCheckId: objectIdRef('qb_check_id'),
  ...timestamps(),
}, (table) => [
  index('checks_owner_idx').on(table.ownerId, table.ownerType),
  index('checks_payee_idx').on(table.payeeId),
  index('checks_bank_idx').on(table.bankId),
  index('checks_status_idx').on(table.status),
  index('checks_owner_created_idx').on(table.ownerId, table.ownerType, table.createdAt),
  index('checks_import_idx').on(table.importId),
]);

// ─── Transactions (new check register) ───
export const transactions = pgTable('transactions', {
  _id: id(),
  bankId: objectIdRef('bank_id').notNull(),
  checkId: objectIdRef('check_id'),
  ...ownerFields(),
  type: varchar('type', { length: 20 }).notNull(),
  checkNumber: bigint('check_number', { mode: 'number' }),
  payeeId: objectIdRef('payee_id'),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('open'),
  category: text('category'),
  amount: doublePrecision('amount').notNull(),
  balance: doublePrecision('balance').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  ...timestamps(),
}, (table) => [
  index('transactions_bank_owner_idx').on(table.bankId, table.ownerType, table.ownerId, table.issueDate),
]);

// ─── Check Register Transactions (legacy) ───
export const checkRegisterTransactions = pgTable('check_register_transactions', {
  _id: id(),
  bankAccountId: objectIdRef('bank_account_id').notNull(),
  userId: objectIdRef('user_id').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  checkNo: integer('check_no'),
  payeeName: text('payee_name'),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('open'),
  amount: doublePrecision('amount').notNull(),
  balance: doublePrecision('balance').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Authentications ───
export const authentications = pgTable('authentications', {
  _id: id(),
  userId: objectIdRef('user_id').notNull(),
  email: text('email'),
  password: text('password'),
  encryptedPassword: text('encrypted_password'),
  refreshToken: text('refresh_token'),
  mode: varchar('mode', { length: 20 }).default('standard'),
  createdAtUnix: bigint('created_at_unix', { mode: 'number' }),
  updatedAtUnix: bigint('updated_at_unix', { mode: 'number' }),
  ...timestamps(),
}, (table) => [
  index('auth_user_idx').on(table.userId),
  index('auth_email_idx').on(table.email),
]);

// ─── MFA ───
export const mfa = pgTable('mfa', {
  _id: id(),
  userId: objectIdRef('user_id').notNull(),
  enableMfa: boolean('enable_mfa').default(false),
  methods: jsonb('methods').default({}),
  defaultMethod: varchar('default_method', { length: 30 }).default('email'),
  defaultMethodId: objectIdRef('default_method_id'),
  ...timestamps(),
});

export const mfaTemp = pgTable('mfa_temp', {
  _id: id(),
  userId: objectIdRef('user_id').notNull(),
  enableMfa: boolean('enable_mfa').default(false),
  methods: jsonb('methods').default({}),
  defaultMethod: varchar('default_method', { length: 30 }).default('email'),
  defaultMethodId: objectIdRef('default_method_id'),
  ...timestamps(),
});

// ─── Verification ───
export const verifications = pgTable('verifications', {
  _id: id(),
  email: text('email'),
  otp: integer('otp'),
  status: varchar('status', { length: 20 }),
  createdAtUnix: bigint('created_at_unix', { mode: 'number' }),
  updatedAtUnix: bigint('updated_at_unix', { mode: 'number' }),
}, (table) => [
  index('verifications_email_idx').on(table.email),
]);

// ─── Stripe User ───
export const stripeUsers = pgTable('stripe_users', {
  _id: id(),
  name: text('name'),
  ...ownerFields(),
  stripeAccountId: text('stripe_account_id'),
  businessName: text('business_name'),
  email: text('email'),
});

// ─── Stripe Customers ───
export const stripeCustomers = pgTable('stripe_customers', {
  _id: id(),
  stripeCustomerId: text('stripe_customer_id'),
  user: objectIdRef('user_ref'),
  userId: text('user_id'),
  lastSessionId: text('last_session_id'),
  lastSubscriptionId: text('last_subscription_id'),
  priceId: text('price_id'),
  isSubscriptionValid: boolean('is_subscription_valid').default(false),
  isTrialPeriod: boolean('is_trial_period').default(false),
  stripeSubscriptions: jsonb('stripe_subscriptions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Stripe Subscriptions ───
export const stripeSubscriptions = pgTable('stripe_subscriptions', {
  _id: id(),
  stripeCustomerId: text('stripe_customer_id'),
  user: objectIdRef('user_ref'),
  userId: text('user_id'),
  sessionId: text('session_id'),
  subscriptionId: text('subscription_id'),
  description: text('description'),
  amountTotal: doublePrecision('amount_total'),
  currency: text('currency'),
  interval: text('interval'),
  expiresAt: bigint('expires_at', { mode: 'number' }),
  paymentStatus: text('payment_status'),
  sessionStatus: text('session_status'),
  subscriptionStatus: text('subscription_status'),
  currentPeriodStartAt: bigint('current_period_start_at', { mode: 'number' }),
  currentPeriodEndAt: bigint('current_period_end_at', { mode: 'number' }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end'),
  trialStartAt: bigint('trial_start_at', { mode: 'number' }),
  trialEndAt: bigint('trial_end_at', { mode: 'number' }),
  whResponse: jsonb('wh_response'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Users Subscriptions ───
export const usersSubscriptions = pgTable('users_subscriptions', {
  _id: id(),
  userId: objectIdRef('user_id'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  mode: varchar('mode', { length: 20 }),
  status: varchar('status', { length: 20 }).default('none'),
  isTrialing: boolean('is_trialing').default(false),
  isSubscribed: boolean('is_subscribed').default(false),
  subscriptionPrice: jsonb('subscription_price').default({ price: 0, currency: 'usd' }),
  trialStartDate: timestamp('trial_start_date'),
  trialEndDate: timestamp('trial_end_date'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  cancelDate: timestamp('cancel_date'),
  cancelAt: timestamp('cancel_at'),
  isActive: boolean('is_active').default(false),
  fullAccessOverrideEnabled: boolean('full_access_override_enabled').default(false),
  fullAccessOverrideReason: text('full_access_override_reason'),
  fullAccessOverrideUpdatedAt: timestamp('full_access_override_updated_at'),
  fullAccessOverrideUpdatedBy: objectIdRef('full_access_override_updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('users_subscriptions_user_idx').on(table.userId),
]);

// ─── Mailed Checks ───
export const mailedChecks = pgTable('mailed_checks', {
  _id: id(),
  ...ownerFields(),
  checkId: objectIdRef('check_id').notNull(),
  batchId: objectIdRef('batch_id'),
  status: varchar('status', { length: 20 }).default('Submitted').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  requestedBy: objectIdRef('requested_by'),
  processedAt: timestamp('processed_at'),
  mailedAt: timestamp('mailed_at'),
  canceledAt: timestamp('canceled_at'),
  chargeAmount: doublePrecision('charge_amount').default(1.59).notNull(),
  invoiceId: objectIdRef('invoice_id'),
  processedBy: objectIdRef('processed_by'),
  chargeId: text('charge_id'),
  mailedBy: objectIdRef('mailed_by'),
  customAddress: jsonb('custom_address'),
  errors: jsonb('errors').default([]),
  ...timestamps(),
}, (table) => [
  index('mailed_checks_check_idx').on(table.checkId),
  index('mailed_checks_batch_idx').on(table.batchId),
  index('mailed_checks_status_idx').on(table.status),
  index('mailed_checks_owner_idx').on(table.ownerId, table.ownerType),
  index('mailed_checks_created_idx').on(table.createdAt),
]);

// ─── Mail Batches ───
export const mailBatches = pgTable('mail_batches', {
  _id: id(),
  batchCounter: integer('batch_counter').unique(),
  batchNumber: varchar('batch_number', { length: 20 }).unique(),
  processedBy: objectIdRef('processed_by').notNull(),
  mailedAt: timestamp('mailed_at'),
  status: varchar('status', { length: 20 }).default('Processing').notNull(),
  mailedChecks: jsonb('mailed_checks').default([]),
  createdBy: objectIdRef('created_by'),
  totalAmount: doublePrecision('total_amount').default(0).notNull(),
  ...timestamps(),
});

// ─── Payment Links ───
export const paymentLinks = pgTable('payment_links', {
  _id: id(),
  stripeAccountId: text('stripe_account_id'),
  recipientName: text('recipient_name'),
  recipientEmail: text('recipient_email'),
  transactionId: text('transaction_id'),
  amount: doublePrecision('amount'),
  currency: text('currency'),
  purpose: text('purpose'),
  stripeUserId: objectIdRef('stripe_user_id'),
  status: varchar('status', { length: 20 }).default('pending'),
  ...ownerFields(),
  invoiceNumber: integer('invoice_number'),
  dueDate: text('due_date'),
  paymentLink: text('payment_link'),
  createdAtUnix: bigint('created_at_unix', { mode: 'number' }),
  updatedAtUnix: bigint('updated_at_unix', { mode: 'number' }),
  sessionId: text('session_id'),
  expiredAt: timestamp('expired_at'),
});

// ─── Plaid Account Details ───
export const plaidAccountDetails = pgTable('plaid_account_details', {
  _id: id(),
  userId: text('user_id'),
  accountId: text('account_id'),
  plaidAccessToken: text('plaid_access_token'),
  fundingSourceUrl: text('funding_source_url'),
  dwollaAccessToken: text('dwolla_access_token'),
});

// ─── Postgrid Details ───
export const postgridDetails = pgTable('postgrid_details', {
  _id: id(),
  postgridCheckId: text('postgrid_check_id'),
  checkStatus: text('check_status'),
  synccosCheckId: text('synccos_check_id'),
  paymentStatus: text('payment_status'),
  userId: text('user_id'),
});

// ─── QuickBooks Account Details ───
export const quickbooksAccountDetails = pgTable('quickbooks_account_details', {
  _id: id(),
  ...ownerFields(),
  isActive: boolean('is_active').default(true),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  realmId: text('realm_id').notNull(),
  accessTokenExpiresAt: timestamp('access_token_expires_at').notNull(),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),
  xRefreshTokenExpiresIn: integer('x_refresh_token_expires_in').notNull(),
  expiresIn: integer('expires_in').notNull(),
  tokenType: text('token_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── QuickBooks Mappings ───
export const quickbooksMappings = pgTable('quickbooks_mappings', {
  _id: id(),
  ...ownerFields(),
  entityType: varchar('entity_type', { length: 20 }).notNull(),
  quickbooksId: text('quickbooks_id').notNull(),
  quickbooksName: text('quickbooks_name').notNull(),
  quickbooksAccountId: objectIdRef('quickbooks_account_id').notNull(),
  internalId: objectIdRef('internal_id'),
  rawData: jsonb('raw_data'),
  ...timestamps(),
}, (table) => [
  index('qb_mappings_owner_entity_idx').on(table.ownerId, table.ownerType, table.entityType),
  index('qb_mappings_internal_idx').on(table.internalId),
]);

// ─── QB Checks ───
export const qbChecks = pgTable('qb_checks', {
  _id: id(),
  ...ownerFields(),
  realmId: text('realm_id').notNull(),
  quickbooksId: text('quickbooks_id').notNull(),
  payeeQuickBooksId: text('payee_quickbooks_id').notNull(),
  bankQuickBooksId: text('bank_quickbooks_id').notNull(),
  quickbooksAccountId: text('quickbooks_account_id'),
  amount: doublePrecision('amount').notNull(),
  memo: text('memo'),
  txnDate: timestamp('txn_date').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  rawData: jsonb('raw_data'),
  checkId: objectIdRef('check_id'),
  ...timestamps(),
}, (table) => [
  uniqueIndex('qb_checks_unique_idx').on(table.quickbooksId, table.ownerId, table.ownerType),
]);

// ─── Region (autofill) ───
export const regions = pgTable('regions', {
  _id: id(),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  zipcode: integer('zipcode'),
});

// ─── Audit Logs ───
export const auditLogs = pgTable('audit_logs', {
  _id: id(),
  entityType: text('entity_type').notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  ...ownerFields(),
  action: varchar('action', { length: 50 }).notNull(),
  userId: objectIdRef('user_id').notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ...timestamps(),
}, (table) => [
  index('audit_entity_idx').on(table.entityType, table.entityId, table.createdAt),
  index('audit_user_idx').on(table.userId, table.createdAt),
  index('audit_owner_idx').on(table.ownerId),
]);

// ─── Check Imports ───
export const checkImports = pgTable('check_imports', {
  _id: id(),
  ...ownerFields(),
  createdBy: objectIdRef('created_by').notNull(),
  fileName: text('file_name').notNull(),
  status: varchar('status', { length: 20 }).default('In Review').notNull(),
  bankAccountId: objectIdRef('bank_account_id'),
  rowCounts: jsonb('row_counts').default({ total: 0, valid: 0, invalid: 0, submitted: 0, skipped: 0 }),
  ...timestamps(),
}, (table) => [
  index('check_imports_owner_idx').on(table.ownerId),
  index('check_imports_status_idx').on(table.status),
]);

// ─── Check Import Rows ───
export const checkImportRows = pgTable('check_import_rows', {
  _id: id(),
  importId: objectIdRef('import_id').notNull(),
  ...ownerFields(),
  rowNumber: integer('row_number').notNull(),
  originalCheckNumber: text('original_check_number').default(''),
  originalAmount: text('original_amount').notNull(),
  originalPayeeName: text('original_payee_name').notNull(),
  originalNote: text('original_note').default(''),
  originalInvoiceId: text('original_invoice_id').default(''),
  originalIssueDate: timestamp('original_issue_date'),
  finalCheckNumber: integer('final_check_number'),
  finalAmount: doublePrecision('final_amount'),
  finalPayeeId: objectIdRef('final_payee_id'),
  suggestedPayeeId: objectIdRef('suggested_payee_id'),
  finalNote: text('final_note').default(''),
  finalInvoiceId: text('final_invoice_id').default(''),
  finalIssueDate: timestamp('final_issue_date'),
  validationErrors: jsonb('validation_errors').default({}),
  state: varchar('state', { length: 20 }).default('invalid').notNull(),
  checkId: objectIdRef('check_id'),
  submittedAt: timestamp('submitted_at'),
  submittedBy: objectIdRef('submitted_by'),
  ...timestamps(),
}, (table) => [
  index('import_rows_import_idx').on(table.importId),
  uniqueIndex('import_rows_unique_idx').on(table.importId, table.rowNumber),
  index('import_rows_state_idx').on(table.state),
]);

// ─── LOB Mail Records ───
export const lobMailRecords = pgTable('lob_mail_records', {
  _id: id(),
  lobId: text('lob_id'),
  checkId: objectIdRef('check_id').notNull(),
  ...ownerFields(),
  mailClass: varchar('mail_class', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('Submitted'),
  chargeAmount: doublePrecision('charge_amount').default(0).notNull(),
  stripeChargeId: text('stripe_charge_id'),
  stripeSessionId: text('stripe_session_id'),
  lobResponse: jsonb('lob_response'),
  trackingNumber: text('tracking_number'),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  mailedAt: timestamp('mailed_at'),
  canceledAt: timestamp('canceled_at'),
  ...timestamps(),
}, (table) => [
  index('lob_check_idx').on(table.checkId),
  index('lob_owner_status_idx').on(table.ownerId, table.status),
  index('lob_session_idx').on(table.stripeSessionId),
  index('lob_lob_id_idx').on(table.lobId),
]);

// ─── Carrier Shipments ───
export const carrierShipments = pgTable('carrier_shipments', {
  _id: id(),
  checkId: objectIdRef('check_id').notNull(),
  ...ownerFields(),
  carrier: varchar('carrier', { length: 20 }).notNull(),
  serviceLevel: text('service_level').notNull(),
  serviceLevelName: text('service_level_name'),
  billingMode: varchar('billing_mode', { length: 20 }).notNull(),
  userCarrierAccountNumber: text('user_carrier_account_number'),
  shippoShipmentId: text('shippo_shipment_id'),
  shippoRateId: text('shippo_rate_id'),
  shippoTransactionId: text('shippo_transaction_id'),
  trackingNumber: text('tracking_number'),
  trackingUrl: text('tracking_url'),
  labelUrl: text('label_url'),
  status: varchar('status', { length: 20 }).default('Submitted'),
  chargeAmount: doublePrecision('charge_amount').default(0).notNull(),
  carrierRate: doublePrecision('carrier_rate').default(0),
  marginAmount: doublePrecision('margin_amount').default(0),
  stripeChargeId: text('stripe_charge_id'),
  stripeSessionId: text('stripe_session_id'),
  mailedAt: timestamp('mailed_at'),
  canceledAt: timestamp('canceled_at'),
  lastTrackedAt: timestamp('last_tracked_at'),
  ...timestamps(),
}, (table) => [
  index('carrier_check_idx').on(table.checkId),
  index('carrier_owner_status_idx').on(table.ownerId, table.status),
  index('carrier_tracking_idx').on(table.trackingNumber),
  index('carrier_session_idx').on(table.stripeSessionId),
]);

// ─── Platform Settings ───
export const platformSettings = pgTable('platform_settings', {
  _id: id(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  valueType: varchar('value_type', { length: 20 }).default('string'),
  updatedBy: objectIdRef('updated_by'),
  ...timestamps(),
});

// ─── Admin Messages ───
export const adminMessages = pgTable('admin_messages', {
  _id: id(),
  senderId: objectIdRef('sender_id').notNull(),
  recipientId: objectIdRef('recipient_id').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('sent'),
  isMassEmail: boolean('is_mass_email').default(false).notNull(),
  ...timestamps(),
}, (table) => [
  index('admin_msg_recipient_idx').on(table.recipientId),
  index('admin_msg_sender_idx').on(table.senderId),
]);

// ─── Scheduled Job Runs (idempotency ledger for HTTP-triggered jobs) ───
export const scheduledJobRuns = pgTable('scheduled_job_runs', {
  _id: id(),
  jobName: varchar('job_name', { length: 80 }).notNull(),
  runKey: varchar('run_key', { length: 120 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('running'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
  errorMessage: text('error_message'),
  ...timestamps(),
}, (table) => [
  uniqueIndex('scheduled_job_runs_job_key_uniq').on(table.jobName, table.runKey),
]);

// ─── Attachments ───
export const attachments = pgTable('attachments', {
  _id: id(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: objectIdRef('entity_id').notNull(),
  ...ownerFields(),
  filename: text('filename').notNull(),
  description: text('description'),
  extension: varchar('extension', { length: 20 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  uploadedBy: objectIdRef('uploaded_by').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  ...timestamps(),
}, (table) => [
  index('attachment_entity_idx').on(table.entityType, table.entityId),
  index('attachment_owner_idx').on(table.ownerType, table.ownerId),
  index('attachment_entity_active_idx').on(table.entityType, table.entityId, table.isDeleted),
]);
