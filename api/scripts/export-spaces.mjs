import AWS from 'aws-sdk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from 'config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const s3Config = config.get('s3');
const { endpoint_url, access_key_id, secret_access_key, bucket_name } = s3Config;

if (!endpoint_url || !access_key_id || !secret_access_key || !bucket_name) {
  console.error('Digital Ocean Spaces credentials missing from config (s3.endpoint_url, s3.access_key_id, s3.secret_access_key, s3.bucket_name).');
  process.exit(1);
}

const s3 = new AWS.S3({
  accessKeyId: access_key_id,
  secretAccessKey: secret_access_key,
  endpoint: endpoint_url,
  s3ForcePathStyle: false,
  signatureVersion: 'v4',
  region: 'nyc3',
});

const outputDir = path.resolve(__dirname, '../../db-export/spaces');

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
    const dirPath = path.join(outputDir, key);
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
    continue;
  }

  const parts = key.split('/');
  const safeParts = parts.map((part, i) => (i === parts.length - 1 ? safeFilename(part) : part));
  const outPath = path.join(outputDir, ...safeParts);
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

console.log(`\nSpaces export complete.`);
console.log(`Downloaded: ${downloaded}, Skipped (already exists): ${skipped}, Failed: ${failed}`);
console.log(`Total files: ${downloaded + skipped}`);
