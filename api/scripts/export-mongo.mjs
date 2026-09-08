import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from 'config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { uri, database } = config.get('mongo_db');

if (!uri || !database) {
  console.error('MongoDB URI or database name missing from config.');
  process.exit(1);
}

const outDir = path.resolve(__dirname, '../../db-export/collections');
await fs.mkdir(outDir, { recursive: true });

const client = new MongoClient(uri);
await client.connect();
console.log(`Connected to MongoDB database: ${database}`);

const db = client.db(database);
const collections = await db.listCollections().toArray();
console.log(`Found ${collections.length} collections`);

const summary = {};

for (const { name } of collections) {
  const docs = await db.collection(name).find({}).toArray();
  const filePath = path.join(outDir, `${name}.json`);
  await fs.writeFile(filePath, JSON.stringify(docs, null, 2));
  summary[name] = docs.length;
  console.log(`  Exported ${name}: ${docs.length} documents`);
}

await client.close();

console.log('\nMongoDB export complete. Files written to db-export/collections/');
