import AWS from 'aws-sdk';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DO_ACCESS_KEY = process.env.DO_SPACES_ACCESS_KEY_ID;
const DO_SECRET_KEY = process.env.DO_SPACES_SECRET_ACCESS_KEY;
const DO_ENDPOINT = process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';
const DO_BUCKET = process.env.DO_SPACES_BUCKET || 'check-writer-prod-bucket';

const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT_URL;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'check-write-files';

if (!DO_ACCESS_KEY || !DO_SECRET_KEY) {
  console.error('Missing DO_SPACES_ACCESS_KEY_ID or DO_SPACES_SECRET_ACCESS_KEY');
  process.exit(1);
}

if (!R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_ENDPOINT) {
  console.error('Missing R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_ENDPOINT_URL');
  process.exit(1);
}

const source = new AWS.S3({
  accessKeyId: DO_ACCESS_KEY,
  secretAccessKey: DO_SECRET_KEY,
  endpoint: DO_ENDPOINT,
  s3ForcePathStyle: false,
  signatureVersion: 'v4',
  region: 'nyc3',
});

const dest = new AWS.S3({
  accessKeyId: R2_ACCESS_KEY,
  secretAccessKey: R2_SECRET_KEY,
  endpoint: R2_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'auto',
});

const progressFile = path.resolve(__dirname, '../../db-export/migration-progress.json');
mkdirSync(path.dirname(progressFile), { recursive: true });

function loadProgress() {
  if (existsSync(progressFile)) {
    return JSON.parse(readFileSync(progressFile, 'utf8'));
  }
  return { migrated: [] };
}

function saveProgress(migrated) {
  writeFileSync(progressFile, JSON.stringify({ migrated }, null, 2));
}

async function listAllObjects() {
  const objects = [];
  let continuationToken;
  do {
    const params = { Bucket: DO_BUCKET, ContinuationToken: continuationToken };
    const res = await source.listObjectsV2(params).promise();
    objects.push(...(res.Contents || []));
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return objects;
}

async function migrateObject(key, migratedSet) {
  if (migratedSet.has(key)) {
    return 'skipped';
  }

  const getParams = { Bucket: DO_BUCKET, Key: key };
  const obj = await source.getObject(getParams).promise();

  const putParams = {
    Bucket: R2_BUCKET,
    Key: key,
    Body: obj.Body,
    ContentType: obj.ContentType,
    ContentLength: obj.ContentLength,
  };

  if (obj.Metadata) putParams.Metadata = obj.Metadata;

  await dest.putObject(putParams).promise();
  return 'migrated';
}

async function main() {
  console.log(`\nSource: DO Spaces → ${DO_BUCKET}`);
  console.log(`Destination: Cloudflare R2 → ${R2_BUCKET}\n`);

  console.log('Listing all objects in source bucket...');
  const objects = await listAllObjects();
  console.log(`Found ${objects.length} objects to migrate\n`);

  const progress = loadProgress();
  const migratedSet = new Set(progress.migrated);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < objects.length; i++) {
    const { Key, Size } = objects[i];
    const pct = Math.round(((i + 1) / objects.length) * 100);
    if ((i + 1) % 10 === 0 || i === 0) {
      console.log(`[${pct}%] ${i + 1}/${objects.length} | migrated:${migrated} skipped:${skipped} failed:${failed}`);
    }

    try {
      const result = await migrateObject(Key, migratedSet);
      if (result === 'migrated') {
        migrated++;
        migratedSet.add(Key);
        if (migrated % 50 === 0) saveProgress([...migratedSet]);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      failures.push({ key: Key, error: err.message });
    }
  }

  saveProgress([...migratedSet]);

  console.log(`\n\n=== Migration Complete ===`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped (already done): ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailed files:');
    failures.forEach(f => console.log(`  ${f.key}: ${f.error}`));
    writeFileSync(path.resolve(__dirname, '../../db-export/migration-failures.json'), JSON.stringify(failures, null, 2));
  }

  console.log('\nDone! Run again to retry any failures (already-migrated files will be skipped).');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
