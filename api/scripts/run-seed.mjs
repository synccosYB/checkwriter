import pg from 'pg';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlFile = join(__dirname, 'seed-data.sql');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: false });
await client.connect();

const sql = readFileSync(sqlFile, 'utf-8');
try {
  await client.query(sql);
  console.log('Seed data loaded successfully');
} catch (e) {
  console.error('Seed error:', e.message);
}
await client.end();
