import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';

const noopSession = {
  startTransaction: () => {},
  commitTransaction: async () => {},
  abortTransaction: async () => {},
  endSession: () => {},
};

export const checkWriterDb = {
  model: () => null,
  startSession: async () => noopSession,
  db: {
    listCollections: () => ({
      toArray: async () => [],
    }),
  },
  collection: () => null,
};

const tableMap = {
  checks: schema.checks,
  banks: schema.banks,
  users: schema.users,
  payees: schema.payees,
  addresses: schema.addresses,
  transactions: schema.transactions,
  tags: schema.tags,
  groups: schema.groups,
  organizations: schema.organizations,
  mailedChecks: schema.mailedChecks,
  mailed_checks: schema.mailedChecks,
  mailBatches: schema.mailBatches,
  mail_batches: schema.mailBatches,
  checkImports: schema.checkImports,
  check_imports: schema.checkImports,
  checkImportRows: schema.checkImportRows,
  checkImportRow: schema.checkImportRows,
  check_import_rows: schema.checkImportRows,
  auditLogs: schema.auditLogs,
  audit_logs: schema.auditLogs,
  attachments: schema.attachments,
  paymentLinks: schema.paymentLinks,
  payment_links: schema.paymentLinks,
  stripeUsers: schema.stripeUsers,
  stripeCustomers: schema.stripeCustomers,
  stripeSubscriptions: schema.stripeSubscriptions,
  lobMailRecords: schema.lobMailRecords,
  carrierShipments: schema.carrierShipments,
  quickbooksmappings: schema.quickbooksMappings,
  quickbooksMappings: schema.quickbooksMappings,
  qbChecks: schema.qbChecks,
  qb_checks: schema.qbChecks,
};

export async function findReferencesInAllCollections({
  docId,
  fieldsToCheck = [],
  collectionsToCheck = [],
  collectionConditions = {},
}) {
  try {
    const docIdStr = docId?.toString ? docId.toString() : docId;

    for (const collName of collectionsToCheck) {
      const table = tableMap[collName];
      if (!table) continue;

      const tableCols = table;

      for (const field of fieldsToCheck) {
        const col = tableCols[field];
        if (!col) continue;

        const extraParts = [];
        const extraConditions = collectionConditions[collName];
        if (extraConditions) {
          for (const [k, v] of Object.entries(extraConditions)) {
            if (tableCols[k]) {
              extraParts.push(sql`${tableCols[k]} = ${v}`);
            }
          }
        }

        const conditionParts = [
          sql`(${col}::text = ${docIdStr} OR ${col}::text LIKE ${'%"' + docIdStr + '"%'})`,
        ];
        if (extraParts.length > 0) {
          conditionParts.push(...extraParts);
        }

        const whereClause = sql.join(conditionParts, sql` AND `);
        const result = await db.select({ id: col }).from(table)
          .where(whereClause)
          .limit(1);

        if (result && result.length > 0) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error finding references:', error);
    throw error;
  }
}
