import { MongoClient, ObjectId } from 'mongodb';
import pg from 'pg';
import config from 'config';

const mongoConfig = config.get('mongo_db');
const mongoUri = mongoConfig.live_uri;
const mongoDbName = mongoConfig.database;

const pgUrl = process.env.DATABASE_URL;
if (!pgUrl) { console.error('DATABASE_URL not set'); process.exit(1); }

const pgClient = new pg.Client({ connectionString: pgUrl, ssl: false });

const COLLECTION_MAP = {
  users: { table: 'users', columns: ['_id','first_name','middle_name','last_name','email','phone','date_of_birth','last_login','preferences','signature_url','signature_attachment_id','subscription_started_at','role','welcome_seen','trial_max_checks','is_demo','demo_created_at','ups_account_number','fedex_account_number','created_at','updated_at'] },
  organizations: { table: 'organizations', columns: ['_id','organization_name','organization_logo','entity_type','dba','formation_date','industry_type','ein','last_used_check_number','signature_url','signature_attachment_id','preferences','ups_account_number','fedex_account_number','created_at','updated_at'] },
  usertoorganizations: { table: 'user_to_organizations', columns: ['_id','user_id','organization_id'] },
  addresses: { table: 'addresses', columns: ['_id','owner_id','owner_type','name','company_name','address_line1','address_line2','city','state','country','zip','is_default','is_active','created_at','updated_at'] },
  banks: { table: 'banks', columns: ['_id','bank_name','account_type','account_name','account_nick_name','account_number','bank_routing_number','bank_transit_number','financial_institute_number','country','bank_preferences','balance','owner_id','owner_type','status','created_at','updated_at'] },
  payees: { table: 'payees', columns: ['_id','name','nick_name','company_name','address','phone','email','owner_id','owner_type','status','created_at','updated_at'] },
  tags: { table: 'tags', columns: ['_id','owner_id','owner_type','name','color','group_id'] },
  groups: { table: 'groups', columns: ['_id','name','color','owner_id','owner_type'] },
  checks: { table: 'checks', columns: ['_id','status','owner_id','owner_type','check_number','invoice_id','amount','created_date','issued_date','payee_id','bank_id','tags','memo','description','created_at_unix','updated_at_unix','pdf_stored','is_signature_selected','is_blank_check','import_id','qb_check_id','created_at','updated_at'] },
  transactions: { table: 'transactions', columns: ['_id','bank_id','check_id','owner_id','owner_type','type','check_number','payee_id','description','status','category','amount','balance','issue_date','created_at','updated_at'] },
  checkregistertransactions: { table: 'check_register_transactions', columns: ['_id','bank_account_id','user_id','type','check_no','payee_name','description','status','amount','balance','issue_date','created_at'] },
  authentications: { table: 'authentications', columns: ['_id','user_id','email','password','encrypted_password','refresh_token','mode','created_at_unix','updated_at_unix','created_at','updated_at'] },
  mfas: { table: 'mfa', columns: ['_id','user_id','enable_mfa','methods','default_method','default_method_id','created_at','updated_at'] },
  mfatemps: { table: 'mfa_temp', columns: ['_id','user_id','enable_mfa','methods','default_method','default_method_id','created_at','updated_at'] },
  verifications: { table: 'verifications', columns: ['_id','email','otp','status','created_at_unix','updated_at_unix'] },
  stripeusers: { table: 'stripe_users', columns: ['_id','name','owner_id','owner_type','stripe_account_id','business_name','email'] },
  stripecustomers: { table: 'stripe_customers', columns: ['_id','stripe_customer_id','user_ref','user_id','last_session_id','last_subscription_id','price_id','is_subscription_valid','is_trial_period','stripe_subscriptions','created_at','updated_at'] },
  subscriptions: { table: 'stripe_subscriptions', columns: ['_id','stripe_customer_id','user_ref','user_id','session_id','subscription_id','description','amount_total','currency','interval','expires_at','payment_status','session_status','subscription_status','current_period_start_at','current_period_end_at','cancel_at_period_end','trial_start_at','trial_end_at','wh_response','created_at','updated_at'] },
  userssubscriptions: { table: 'users_subscriptions', columns: ['_id','user_id','stripe_customer_id','stripe_subscription_id','mode','status','is_trialing','is_subscribed','subscription_price','trial_start_date','trial_end_date','current_period_start','current_period_end','cancel_at_period_end','cancel_date','cancel_at','is_active','created_at'] },
  mailed_checks: { table: 'mailed_checks', columns: ['_id','owner_id','owner_type','check_id','batch_id','status','requested_at','requested_by','processed_at','mailed_at','canceled_at','charge_amount','invoice_id','processed_by','charge_id','mailed_by','errors','created_at','updated_at'] },
  mail_batches: { table: 'mail_batches', columns: ['_id','batch_counter','batch_number','processed_by','mailed_at','status','mailed_checks','created_by','total_amount','created_at','updated_at'] },
  paymentlinks: { table: 'payment_links', columns: ['_id','stripe_account_id','recipient_name','recipient_email','transaction_id','amount','currency','purpose','stripe_user_id','status','owner_id','owner_type','invoice_number','due_date','payment_link','created_at_unix','updated_at_unix','session_id','expired_at'] },
  plaidaccountdetails: { table: 'plaid_account_details', columns: ['_id','user_id','account_id','plaid_access_token','funding_source_url','dwolla_access_token'] },
  postgriddetails: { table: 'postgrid_details', columns: ['_id','postgrid_check_id','check_status','synccos_check_id','payment_status','user_id'] },
  quickbookaccountdetails: { table: 'quickbooks_account_details', columns: ['_id','owner_id','owner_type','is_active','access_token','refresh_token','realm_id','access_token_expires_at','refresh_token_expires_at','x_refresh_token_expires_in','expires_in','token_type','created_at','updated_at'] },
  quickbooksmappings: { table: 'quickbooks_mappings', columns: ['_id','owner_id','owner_type','entity_type','quickbooks_id','quickbooks_name','quickbooks_account_id','internal_id','raw_data','created_at','updated_at'] },
  qbchecks: { table: 'qb_checks', columns: ['_id','owner_id','owner_type','realm_id','quickbooks_id','payee_quickbooks_id','bank_quickbooks_id','quickbooks_account_id','amount','memo','txn_date','status','raw_data','check_id','created_at','updated_at'] },
  auditlogs: { table: 'audit_logs', columns: ['_id','entity_type','entity_id','owner_id','owner_type','action','user_id','old_data','new_data','created_at','updated_at'] },
  checkimports: { table: 'check_imports', columns: ['_id','owner_id','owner_type','created_by','file_name','status','bank_account_id','row_counts','created_at','updated_at'] },
  checkimportrows: { table: 'check_import_rows', columns: ['_id','import_id','owner_id','owner_type','row_number','original_check_number','original_amount','original_payee_name','original_note','original_invoice_id','original_issue_date','final_check_number','final_amount','final_payee_id','suggested_payee_id','final_note','final_invoice_id','final_issue_date','validation_errors','state','check_id','submitted_at','submitted_by','created_at','updated_at'] },
  lob_mail_records: { table: 'lob_mail_records', columns: ['_id','lob_id','check_id','owner_id','owner_type','mail_class','status','charge_amount','stripe_charge_id','stripe_session_id','lob_response','tracking_number','expected_delivery_date','mailed_at','canceled_at','created_at','updated_at'] },
  carrier_shipments: { table: 'carrier_shipments', columns: ['_id','check_id','owner_id','owner_type','carrier','service_level','service_level_name','billing_mode','user_carrier_account_number','shippo_shipment_id','shippo_rate_id','shippo_transaction_id','tracking_number','tracking_url','label_url','status','charge_amount','carrier_rate','margin_amount','stripe_charge_id','stripe_session_id','mailed_at','canceled_at','last_tracked_at','created_at','updated_at'] },
  attachments: { table: 'attachments', columns: ['_id','entity_type','entity_id','owner_id','owner_type','filename','description','extension','mime_type','size','uploaded_by','is_deleted','deleted_at','created_at','updated_at'] },
  regions: { table: 'regions', columns: ['_id','country','state','city','zipcode'] },
};

const MONGO_TO_PG_FIELD = {
  '_id': '_id',
  'firstName': 'first_name', 'middleName': 'middle_name', 'lastName': 'last_name',
  'dateOfBirth': 'date_of_birth', 'lastLogin': 'last_login',
  'signatureUrl': 'signature_url', 'signatureAttachmentId': 'signature_attachment_id',
  'subscriptionStartedAt': 'subscription_started_at',
  'welcomeSeen': 'welcome_seen', 'trialMaxChecks': 'trial_max_checks',
  'isDemo': 'is_demo', 'demoCreatedAt': 'demo_created_at',
  'upsAccountNumber': 'ups_account_number', 'fedexAccountNumber': 'fedex_account_number',
  'createdAt': 'created_at', 'updatedAt': 'updated_at',
  'organizationName': 'organization_name', 'organizationLogo': 'organization_logo',
  'entityType': 'entity_type', 'formationDate': 'formation_date',
  'industryType': 'industry_type', 'lastUsedCheckNumber': 'last_used_check_number',
  'userId': 'user_id', 'organizationId': 'organization_id',
  'ownerId': 'owner_id', 'ownerType': 'owner_type',
  'companyName': 'company_name', 'addressLine1': 'address_line1', 'addressLine2': 'address_line2',
  'isDefault': 'is_default', 'isActive': 'is_active',
  'bankName': 'bank_name', 'accountType': 'account_type', 'accountName': 'account_name',
  'accountNickName': 'account_nick_name', 'accountNumber': 'account_number',
  'bankRoutingNumber': 'bank_routing_number', 'bankTransitNumber': 'bank_transit_number',
  'financialInstituteNumber': 'financial_institute_number', 'bankPreferences': 'bank_preferences',
  'nickName': 'nick_name',
  'group': 'group_id',
  'checkNumber': 'check_number', 'invoiceId': 'invoice_id',
  'createdDate': 'created_date', 'issuedDate': 'issued_date',
  'payeeId': 'payee_id', 'bankId': 'bank_id',
  'createdAtUnix': 'created_at_unix', 'updatedAtUnix': 'updated_at_unix',
  'pdfStored': 'pdf_stored', 'isSignatureSelected': 'is_signature_selected',
  'isBlankCheck': 'is_blank_check', 'importId': 'import_id', 'qbCheckId': 'qb_check_id',
  'checkId': 'check_id', 'bankAccountId': 'bank_account_id',
  'checkNo': 'check_no', 'payeeName': 'payee_name', 'issueDate': 'issue_date',
  'encryptedPassword': 'encrypted_password', 'refreshToken': 'refresh_token',
  'enableMfa': 'enable_mfa', 'defaultMethod': 'default_method', 'defaultMethodId': 'default_method_id',
  'batchId': 'batch_id', 'requestedAt': 'requested_at', 'requestedBy': 'requested_by',
  'processedAt': 'processed_at', 'mailedAt': 'mailed_at', 'canceledAt': 'canceled_at',
  'chargeAmount': 'charge_amount', 'processedBy': 'processed_by', 'chargeId': 'charge_id',
  'mailedBy': 'mailed_by', 'mailedChecks': 'mailed_checks',
  'batchCounter': 'batch_counter', 'batchNumber': 'batch_number', 'createdBy': 'created_by',
  'totalAmount': 'total_amount',
  'stripeAccountId': 'stripe_account_id', 'recipientName': 'recipient_name',
  'recipientEmail': 'recipient_email', 'transactionId': 'transaction_id',
  'stripeUserId': 'stripe_user_id', 'invoiceNumber': 'invoice_number',
  'dueDate': 'due_date', 'paymentLink': 'payment_link', 'sessionId': 'session_id',
  'expiredAt': 'expired_at',
  'accountId': 'account_id', 'plaidAccessToken': 'plaid_access_token',
  'fundingSourceUrl': 'funding_source_url', 'dwollaAccessToken': 'dwolla_access_token',
  'postgridCheckId': 'postgrid_check_id', 'checkStatus': 'check_status',
  'synccosCheckId': 'synccos_check_id', 'paymentStatus': 'payment_status',
  'accessToken': 'access_token', 'realmId': 'realm_id',
  'accessTokenExpiresAt': 'access_token_expires_at', 'refreshTokenExpiresAt': 'refresh_token_expires_at',
  'xRefreshTokenExpiresIn': 'x_refresh_token_expires_in', 'expiresIn': 'expires_in',
  'tokenType': 'token_type',
  'quickbooksId': 'quickbooks_id', 'quickbooksName': 'quickbooks_name',
  'quickbooksAccountId': 'quickbooks_account_id', 'internalId': 'internal_id',
  'rawData': 'raw_data',
  'payeeQuickBooksId': 'payee_quickbooks_id', 'bankQuickBooksId': 'bank_quickbooks_id',
  'txnDate': 'txn_date',
  'entityId': 'entity_id', 'oldData': 'old_data', 'newData': 'new_data',
  'fileName': 'file_name', 'rowCounts': 'row_counts',
  'rowNumber': 'row_number', 'originalCheckNumber': 'original_check_number',
  'originalAmount': 'original_amount', 'originalPayeeName': 'original_payee_name',
  'originalNote': 'original_note', 'originalInvoiceId': 'original_invoice_id',
  'originalIssueDate': 'original_issue_date', 'finalCheckNumber': 'final_check_number',
  'finalAmount': 'final_amount', 'finalPayeeId': 'final_payee_id',
  'suggestedPayeeId': 'suggested_payee_id', 'finalNote': 'final_note',
  'finalInvoiceId': 'final_invoice_id', 'finalIssueDate': 'final_issue_date',
  'validationErrors': 'validation_errors', 'submittedAt': 'submitted_at',
  'submittedBy': 'submitted_by',
  'lobId': 'lob_id', 'mailClass': 'mail_class', 'stripeChargeId': 'stripe_charge_id',
  'stripeSessionId': 'stripe_session_id', 'lobResponse': 'lob_response',
  'trackingNumber': 'tracking_number', 'expectedDeliveryDate': 'expected_delivery_date',
  'serviceLevelName': 'service_level_name', 'serviceLevel': 'service_level',
  'billingMode': 'billing_mode', 'userCarrierAccountNumber': 'user_carrier_account_number',
  'shippoShipmentId': 'shippo_shipment_id', 'shippoRateId': 'shippo_rate_id',
  'shippoTransactionId': 'shippo_transaction_id', 'trackingUrl': 'tracking_url',
  'labelUrl': 'label_url', 'carrierRate': 'carrier_rate', 'marginAmount': 'margin_amount',
  'lastTrackedAt': 'last_tracked_at',
  'mimeType': 'mime_type', 'uploadedBy': 'uploaded_by', 'isDeleted': 'is_deleted',
  'deletedAt': 'deleted_at',
  'stripeCustomerId': 'stripe_customer_id', 'user': 'user_ref',
  'lastSessionId': 'last_session_id', 'lastSubscriptionId': 'last_subscription_id',
  'priceId': 'price_id', 'isSubscriptionValid': 'is_subscription_valid',
  'isTrialPeriod': 'is_trial_period', 'stripeSubscriptions': 'stripe_subscriptions',
  'subscriptionId': 'subscription_id', 'amountTotal': 'amount_total',
  'expiresAt': 'expires_at', 'sessionStatus': 'session_status',
  'subscriptionStatus': 'subscription_status', 'currentPeriodStartAt': 'current_period_start_at',
  'currentPeriodEndAt': 'current_period_end_at', 'cancelAtPeriodEnd': 'cancel_at_period_end',
  'trialStartAt': 'trial_start_at', 'trialEndAt': 'trial_end_at', 'whResponse': 'wh_response',
  'stripeSubscriptionId': 'stripe_subscription_id',
  'isTrialing': 'is_trialing', 'isSubscribed': 'is_subscribed',
  'subscriptionPrice': 'subscription_price', 'trialStartDate': 'trial_start_date',
  'trialEndDate': 'trial_end_date', 'currentPeriodStart': 'current_period_start',
  'currentPeriodEnd': 'current_period_end', 'cancelDate': 'cancel_date',
  'cancelAt': 'cancel_at',
  'businessName': 'business_name',
};

function convertValue(val) {
  if (val instanceof ObjectId) return val.toHexString();
  if (val instanceof Date) return val;
  if (val === undefined) return null;
  if (typeof val === 'object' && val !== null && !Array.isArray(val) && val._bsontype === 'ObjectId') return val.toHexString();
  return val;
}

function mapDoc(doc, tableConfig) {
  const pgColumns = new Set(tableConfig.columns);
  const row = {};
  
  for (const [mongoKey, value] of Object.entries(doc)) {
    if (mongoKey === '__v') continue;
    
    let pgCol;
    if (mongoKey === '_id') {
      pgCol = '_id';
    } else {
      pgCol = MONGO_TO_PG_FIELD[mongoKey] || mongoKey;
    }
    
    if (!pgColumns.has(pgCol)) continue;
    
    let converted = convertValue(value);
    if (typeof converted === 'object' && converted !== null && !(converted instanceof Date) && !Array.isArray(converted)) {
      for (const [k, v] of Object.entries(converted)) {
        if (v instanceof ObjectId || (v && v._bsontype === 'ObjectId')) {
          converted[k] = v.toHexString ? v.toHexString() : String(v);
        }
      }
    }
    if (Array.isArray(converted)) {
      converted = converted.map(item => {
        if (item instanceof ObjectId || (item && item._bsontype === 'ObjectId')) {
          return item.toHexString ? item.toHexString() : String(item);
        }
        if (typeof item === 'object' && item !== null) {
          const cleaned = {};
          for (const [k, v] of Object.entries(item)) {
            if (v instanceof ObjectId || (v && v._bsontype === 'ObjectId')) {
              cleaned[k] = v.toHexString ? v.toHexString() : String(v);
            } else {
              cleaned[k] = v;
            }
          }
          return cleaned;
        }
        return item;
      });
    }
    
    row[pgCol] = converted;
  }
  
  return row;
}

async function importCollection(mongoDB, collectionName, tableConfig) {
  const docs = await mongoDB.collection(collectionName).find({}).toArray();
  if (docs.length === 0) {
    console.log(`  ${collectionName}: 0 docs, skipping`);
    return 0;
  }
  
  let imported = 0;
  let errors = 0;
  
  for (const doc of docs) {
    const row = mapDoc(doc, tableConfig);
    if (!row._id) continue;
    
    const columns = Object.keys(row);
    const values = Object.values(row).map(v => {
      if (v instanceof Date) return v.toISOString();
      if (typeof v === 'object' && v !== null) return JSON.stringify(v);
      return v;
    });
    
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const quotedCols = columns.map(c => `"${c}"`).join(', ');
    const sql = `INSERT INTO "${tableConfig.table}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT ("_id") DO NOTHING`;
    
    try {
      await pgClient.query(sql, values);
      imported++;
    } catch (err) {
      errors++;
      if (errors <= 3) {
        console.error(`  Error inserting into ${tableConfig.table}:`, err.message.split('\n')[0]);
        console.error(`  Row keys:`, columns.join(', '));
      }
    }
  }
  
  console.log(`  ${collectionName} -> ${tableConfig.table}: ${imported}/${docs.length} imported${errors > 0 ? ` (${errors} errors)` : ''}`);
  return imported;
}

async function main() {
  console.log('Connecting to MongoDB...');
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const mongoDB = mongoClient.db(mongoDbName);
  console.log('Connected to MongoDB');
  
  console.log('Connecting to PostgreSQL...');
  await pgClient.connect();
  console.log('Connected to PostgreSQL');
  
  let totalImported = 0;
  
  const importOrder = [
    'users', 'organizations', 'usertoorganizations', 'addresses', 'banks', 'payees',
    'tags', 'groups', 'checks', 'transactions', 'checkregistertransactions',
    'authentications', 'mfas', 'mfatemps', 'verifications',
    'stripeusers', 'stripecustomers', 'subscriptions', 'userssubscriptions',
    'mailed_checks', 'mail_batches', 'paymentlinks',
    'plaidaccountdetails', 'postgriddetails', 'quickbookaccountdetails',
    'quickbooksmappings', 'qbchecks', 'auditlogs',
    'checkimports', 'checkimportrows', 'lob_mail_records', 'carrier_shipments',
    'attachments', 'regions',
  ];
  
  console.log('\nStarting import...\n');
  
  for (const colName of importOrder) {
    const config = COLLECTION_MAP[colName];
    if (!config) {
      console.log(`  ${colName}: no mapping, skipping`);
      continue;
    }
    const count = await importCollection(mongoDB, colName, config);
    totalImported += count;
  }
  
  console.log(`\nDone! Total rows imported: ${totalImported}`);
  
  console.log('\nVerifying row counts...');
  for (const colName of importOrder) {
    const config = COLLECTION_MAP[colName];
    if (!config) continue;
    try {
      const res = await pgClient.query(`SELECT count(*) as cnt FROM "${config.table}"`);
      console.log(`  ${config.table}: ${res.rows[0].cnt} rows`);
    } catch(e) {}
  }
  
  await mongoClient.close();
  await pgClient.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
