/**
 * PostgreSQL Export Script
 * ========================
 * PURPOSE:
 *   Dumps the dev PostgreSQL database to a timestamped .sql file so it can be
 *   restored into production after a deployment.
 *
 * WHEN TO RUN:
 *   Run this BEFORE deploying to production, while the dev database still holds
 *   all your data.
 *
 * HOW TO RUN:
 *   npm run export:postgres
 *
 * REQUIREMENTS:
 *   - `pg_dump` must be available on your PATH (ships with PostgreSQL client tools)
 *   - DATABASE_URL must be set in the environment (or loaded via .env)
 *
 * OUTPUT:
 *   db-export/postgres/dump-<timestamp>.sql
 *
 * WORKFLOW:
 *   1. npm run export:postgres          ← run this first (dev machine)
 *   2. Deploy the app to production
 *   3. npm run import:postgres -- <path-to-dump.sql>   ← run this after deploy
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.resolve(__dirname, '../../db-export/postgres');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  console.error('Set DATABASE_URL to your dev PostgreSQL connection string and try again.');
  process.exit(1);
}

if (!existsSync(exportDir)) {
  mkdirSync(exportDir, { recursive: true });
  console.log(`Created output directory: ${exportDir}`);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const dumpFile = path.join(exportDir, `dump-${timestamp}.sql`);

console.log('=== PostgreSQL Export ===');
console.log(`Source: ${databaseUrl.replace(/:\/\/[^@]+@/, '://<credentials>@')}`);
console.log(`Output: ${dumpFile}`);
console.log('');
console.log('Running pg_dump...');

try {
  execSync(`pg_dump "${databaseUrl}" --no-owner --no-acl --format=plain --file="${dumpFile}"`, {
    stdio: 'inherit',
    env: { ...process.env },
  });
} catch (err) {
  console.error('');
  console.error('ERROR: pg_dump failed. Make sure pg_dump is installed and DATABASE_URL is correct.');
  console.error(err.message);
  process.exit(1);
}

console.log('');
console.log(`Export complete! Dump saved to:`);
console.log(`  ${dumpFile}`);
console.log('');
console.log('Next steps:');
console.log('  1. Deploy your app to production');
console.log('  2. Run:  npm run import:postgres -- ' + dumpFile);
