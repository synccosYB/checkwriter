/**
 * Apply Database Indexes
 * ======================
 * PURPOSE:
 *   Create / ensure all hot-path indexes used by the API exist in the target
 *   PostgreSQL database. Uses CREATE INDEX IF NOT EXISTS so the script is safe
 *   to re-run.
 *
 * WHEN TO RUN:
 *   - After deploying schema changes that add new indexes
 *   - As a one-time backfill on existing databases that were created before
 *     these indexes were added to the Drizzle schema
 *
 * HOW TO RUN:
 *   npm run db:apply-indexes
 *
 * REQUIREMENTS:
 *   - DATABASE_URL must be set (or pass --db <connection-string>)
 *
 * NOTE:
 *   Indexes are defined declaratively in src/db/schema.ts. This script mirrors
 *   them as raw SQL so it can run against an existing database without going
 *   through drizzle-kit migrations.
 */

import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

const args = process.argv.slice(2);
const dbFlagIndex = args.indexOf('--db');
const dbUrl = dbFlagIndex !== -1
  ? args[dbFlagIndex + 1]
  : (process.env.DATABASE_URL);

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set and --db was not provided.');
  process.exit(1);
}

const INDEXES = [
  // users
  ['users_email_idx', 'users (email)'],
  ['users_role_active_idx', 'users (role, is_active)'],
  ['users_is_demo_idx', 'users (is_demo)'],

  // user_to_organizations
  ['user_to_org_user_idx', 'user_to_organizations (user_id)'],
  ['user_to_org_org_idx', 'user_to_organizations (organization_id)'],

  // checks
  ['checks_owner_created_idx', 'checks (owner_id, owner_type, created_at)'],
  ['checks_import_idx', 'checks (import_id)'],

  // verifications
  ['verifications_email_idx', 'verifications (email)'],

  // mailed_checks
  ['mailed_checks_owner_idx', 'mailed_checks (owner_id, owner_type)'],
  ['mailed_checks_created_idx', 'mailed_checks (created_at)'],

  // lob_mail_records
  ['lob_session_idx', 'lob_mail_records (stripe_session_id)'],
  ['lob_lob_id_idx', 'lob_mail_records (lob_id)'],

  // carrier_shipments
  ['carrier_session_idx', 'carrier_shipments (stripe_session_id)'],

  // quickbooks_mappings
  ['qb_mappings_owner_entity_idx', 'quickbooks_mappings (owner_id, owner_type, entity_type)'],
  ['qb_mappings_internal_idx', 'quickbooks_mappings (internal_id)'],

  // attachments
  ['attachment_entity_active_idx', 'attachments (entity_type, entity_id, is_deleted)'],
];

const safeUrl = dbUrl.replace(/:\/\/[^@]+@/, '://<credentials>@');
console.log(`=== Apply Indexes ===`);
console.log(`Target: ${safeUrl}`);
console.log(`Index count: ${INDEXES.length}`);
console.log('');

const pool = new Pool({ connectionString: dbUrl, max: 1 });

let created = 0;
let existed = 0;
let failed = 0;

try {
  for (const [name, def] of INDEXES) {
    try {
      // Probe BEFORE create so we can distinguish newly created from
      // pre-existing indexes accurately.
      const before = await pool.query(
        `SELECT 1 FROM pg_indexes WHERE indexname = $1 LIMIT 1`,
        [name],
      );
      const preExisted = before.rowCount > 0;

      const sql = `CREATE INDEX IF NOT EXISTS ${name} ON ${def};`;
      const start = Date.now();
      await pool.query(sql);
      const ms = Date.now() - start;

      if (preExisted) {
        console.log(`  exists  ${name}  (${ms}ms, no-op)`);
        existed++;
      } else {
        console.log(`  created ${name}  (${ms}ms)`);
        created++;
      }
    } catch (err) {
      failed++;
      console.error(`  FAIL    ${name}: ${err.message}`);
    }
  }
} finally {
  await pool.end();
}

console.log('');
console.log(`Done. created=${created} exists=${existed} failed=${failed}`);
process.exit(failed > 0 ? 1 : 0);
