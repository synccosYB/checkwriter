import { platformSettingsCollection } from './dbCollections.js';

export const getPlatformSetting = async (key) => {
  const record = await platformSettingsCollection.findOne({ key });
  return record?.value || null;
};

export const setPlatformSetting = async (key, value) => {
  const existing = await platformSettingsCollection.findOne({ key });
  if (existing) {
    return platformSettingsCollection.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { returnDocument: 'after' }
    );
  }
  return platformSettingsCollection.create({ key, value });
};

export const getLobConfig = async () => {
  const [apiKey, webhookSecret] = await Promise.all([
    getPlatformSetting('LOB_API_KEY'),
    getPlatformSetting('LOB_WEBHOOK_SECRET'),
  ]);
  return { apiKey, webhookSecret };
};

export const saveLobConfig = async ({ apiKey, webhookSecret }) => {
  const ops = [];
  if (apiKey !== undefined) ops.push(setPlatformSetting('LOB_API_KEY', apiKey));
  if (webhookSecret !== undefined) ops.push(setPlatformSetting('LOB_WEBHOOK_SECRET', webhookSecret));
  await Promise.all(ops);
};
