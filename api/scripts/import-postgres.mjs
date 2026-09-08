/**
 * PostgreSQL Import Script
 * ========================
 * PURPOSE:
 *   Restores a .sql dump file (created by export-postgres.mjs) into the
 *   production PostgreSQL database after a deployment.
 *
 * WHEN TO RUN:
 *   Run this AFTER deploying to production, pointing at the dump file you
 *   created before the deployment.
 *
 * HOW TO RUN:
 *   npm run import:postgres -- <path-to-dump.sql>
 *
 *   Example:
 *     npm run import:postgres -- db-export/postgres/dump-2025-01-15_10-30-00.sql
 *
 * REQUIREMENTS:
 *   - `psql` must be available on your PATH (ships with PostgreSQL client tools)
 *   - Set PRODUCTION_DATABASE_URL, PROD_DATABASE_URL, or DATABASE_URL in the environment
 *     (checked in that order). Alternatively, pass the URL via the --db flag:
 *       npm run import:postgres -- <dump.sql> --db <connection-string>
 *
 * WARNING:
 *   This script will execute SQL statements against the target database.
 *   Existing data may be overwritten depending on the dump contents.
 *   You will be asked to confirm before any changes are made.
 *
 * WORKFLOW:
 *   1. npm run export:postgres          ← run this first (dev machine)
 *   2. Deploy the app to production
 *   3. npm run import:postgres -- <path-to-dump.sql>   ← run this after deploy
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { createInterface } from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Parse arguments ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);

const dbFlagIndex = args.indexOf('--db');
let targetUrl = dbFlagIndex !== -1 ? args[dbFlagIndex + 1] : null;
let targetUrlSource = '--db flag';
if (!targetUrl) {
  if (process.env.PRODUCTION_DATABASE_URL) {
    targetUrl = process.env.PRODUCTION_DATABASE_URL;
    targetUrlSource = 'PRODUCTION_DATABASE_URL';
  } else if (process.env.PROD_DATABASE_URL) {
    targetUrl = process.env.PROD_DATABASE_URL;
    targetUrlSource = 'PROD_DATABASE_URL';
  } else if (process.env.DATABASE_URL) {
    targetUrl = process.env.DATABASE_URL;
    targetUrlSource = 'DATABASE_URL';
  }
}

const dumpFile = args.find(a => !a.startsWith('--') && a !== (targetUrl));

if (!dumpFile) {
  console.error('ERROR: No dump file path provided.');
  console.error('');
  console.error('Usage:  npm run import:postgres -- <path-to-dump.sql>');
  console.error('Example: npm run import:postgres -- db-export/postgres/dump-2025-01-15_10-30-00.sql');
  process.exit(1);
}

if (!targetUrl) {
  console.error('ERROR: No target database URL found.');
  console.error('');
  console.error('Set one of the following environment variables, or pass it via --db:');
  console.error('  PRODUCTION_DATABASE_URL  (preferred for production)');
  console.error('  PROD_DATABASE_URL');
  console.error('  DATABASE_URL             (fallback)');
  console.error('  --db <connection-string> (flag override)');
  console.error('');
  console.error('Example: npm run import:postgres -- <dump.sql> --db <connection-string>');
  process.exit(1);
}

const resolvedDump = path.resolve(process.cwd(), dumpFile);

if (!existsSync(resolvedDump)) {
  console.error(`ERROR: Dump file not found: ${resolvedDump}`);
  process.exit(1);
}

const fileSizeMb = (statSync(resolvedDump).size / 1024 / 1024).toFixed(2);
const safeUrl = targetUrl.replace(/:\/\/[^@]+@/, '://<credentials>@');

// ─── Confirmation prompt ───────────────────────────────────────────────────────

console.log('=== PostgreSQL Import ===');
console.log('');
console.log(`  Dump file : ${resolvedDump}`);
console.log(`  File size : ${fileSizeMb} MB`);
console.log(`  Target DB : ${safeUrl}  (from ${targetUrlSource})`);
console.log('');
console.log('WARNING: This will execute the dump against the target database.');
console.log('         Existing data may be overwritten. This action cannot be undone.');
console.log('');

const rl = createInterface({ input: process.stdin, output: process.stdout });

await new Promise((resolve, reject) => {
  rl.question('Type "yes" to continue, or anything else to cancel: ', (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log('');
      console.log('Import cancelled. No changes were made.');
      process.exit(0);
    }
    resolve();
  });
});

// ─── Run import ───────────────────────────────────────────────────────────────

console.log('');
console.log('Running psql...');

try {
  execSync(`psql "${targetUrl}" --file="${resolvedDump}" --echo-errors`, {
    stdio: 'inherit',
    env: { ...process.env },
  });
} catch (err) {
  console.error('');
  console.error('ERROR: psql failed. Make sure psql is installed and the target DATABASE_URL is correct.');
  console.error(err.message);
  process.exit(1);
}

console.log('');
console.log('Import complete!');
console.log(`  Database: ${safeUrl}`);
console.log(`  Restored from: ${resolvedDump}`);
