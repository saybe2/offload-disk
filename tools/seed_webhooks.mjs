import mongoose from 'mongoose';
import { Webhook } from '../dist/models/Webhook.js';

const uri = process.argv[2];
const db = process.argv[3];
const hooks = JSON.parse(Buffer.from(process.argv[4], 'base64').toString('utf8'));

await mongoose.connect(uri, { dbName: db });
for (const url of hooks) {
  await Webhook.updateOne({ url }, { $set: { enabled: true } }, { upsert: true });
}
await mongoose.disconnect();
console.log('seeded', hooks.length);
