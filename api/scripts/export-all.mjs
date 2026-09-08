import { MongoClient } from 'mongodb';
import AWS from 'aws-sdk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from 'config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportRoot = path.resolve(__dirname, '../../db-export');
const collectionsDir = path.join(exportRoot, 'collections');
const spacesDir = path.join(exportRoot, 'spaces');

const { uri, database } = config.get('mongo_db');
const s3Config = config.get('s3');
const { endpoint_url, access_key_id, secret_access_key, bucket_name } = s3Config;

if (!uri || !database) {
  console.error('MongoDB credentials missing from config.');
  process.exit(1);
}
if (!endpoint_url || !access_key_id || !secret_access_key || !bucket_name) {
  console.error('Digital Ocean Spaces credentials missing from config.');
  process.exit(1);
}

mkdirSync(collectionsDir, { recursive: true });
mkdirSync(spacesDir, { recursive: true });

// ─── MongoDB Export ────────────────────────────────────────────────────────────

console.log('=== Exporting MongoDB ===');
const client = new MongoClient(uri);
await client.connect();
console.log(`Connected to database: ${database}`);

const db = client.db(database);
const collections = await db.listCollections().toArray();
console.log(`Found ${collections.length} collections`);

const mongoSummary = {};
for (const { name } of collections) {
  const docs = await db.collection(name).find({}).toArray();
  await fs.writeFile(path.join(collectionsDir, `${name}.json`), JSON.stringify(docs, null, 2));
  mongoSummary[name] = docs.length;
  console.log(`  ${name}: ${docs.length} documents`);
}

await client.close();
console.log('MongoDB export complete.\n');

// ─── Digital Ocean Spaces Export ──────────────────────────────────────────────

console.log('=== Exporting Digital Ocean Spaces ===');

const s3 = new AWS.S3({
  accessKeyId: access_key_id,
  secretAccessKey: secret_access_key,
  endpoint: endpoint_url,
  s3ForcePathStyle: false,
  signatureVersion: 'v4',
  region: 'nyc3',
});

async function listAllObjects() {
  const objects = [];
  let continuationToken = undefined;
  do {
    const params = { Bucket: bucket_name, ContinuationToken: continuationToken };
    const response = await s3.listObjectsV2(params).promise();
    objects.push(...(response.Contents || []));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
  return objects;
}

function safeFilename(filename) {
  if (filename.length <= 200) return filename;
  const ext = filename.includes('.') ? '.' + filename.split('.').pop() : '';
  return filename.slice(0, 200 - ext.length) + ext;
}

console.log(`Listing objects in bucket: ${bucket_name}`);
const objects = await listAllObjects();
console.log(`Found ${objects.length} objects`);

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const obj of objects) {
  const key = obj.Key;

  if (key.endsWith('/')) {
    const dirPath = path.join(spacesDir, key);
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
    continue;
  }

  const parts = key.split('/');
  const safeParts = parts.map((part, i) => (i === parts.length - 1 ? safeFilename(part) : part));
  const outPath = path.join(spacesDir, ...safeParts);
  const outDir = path.dirname(outPath);

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  if (existsSync(outPath)) {
    skipped++;
    continue;
  }

  try {
    const data = await s3.getObject({ Bucket: bucket_name, Key: key }).promise();
    writeFileSync(outPath, data.Body);
    downloaded++;
    if (downloaded % 100 === 0) {
      console.log(`  Progress: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
    }
  } catch (err) {
    console.error(`  Failed to download ${key}: ${err.message}`);
    failed++;
  }
}

const spacesTotal = downloaded + skipped;
console.log(`Spaces export complete: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed.\n`);

// ─── Write Summary ─────────────────────────────────────────────────────────────

console.log('=== Writing Summary ===');

const totalDocs = Object.values(mongoSummary).reduce((a, b) => a + b, 0);
const lines = [
  '=== DB Export Summary ===',
  `Exported on: ${new Date().toISOString()}`,
  '',
  `--- MongoDB Collections (database: ${database}) ---`,
  '',
  ...Object.entries(mongoSummary).map(([col, count]) => `  ${col}: ${count} documents`),
  '',
  `Total collections: ${Object.keys(mongoSummary).length}`,
  `Total documents: ${totalDocs}`,
  '',
  `--- Digital Ocean Spaces (bucket: ${bucket_name}) ---`,
  '',
  `Total files in bucket: ${objects.filter(o => !o.Key.endsWith('/')).length}`,
  `Files downloaded: ${spacesTotal}`,
  `Failed: ${failed}`,
  '',
  'All files saved to db-export/spaces/ (preserving original folder structure)',
  'All collections saved to db-export/collections/ (one JSON file per collection)',
];

writeFileSync(path.join(exportRoot, 'summary.txt'), lines.join('\n') + '\n');
console.log('Summary written to db-export/summary.txt');
console.log('\nExport complete!');
