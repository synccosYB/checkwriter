import { postgridDetailsCollection } from './dbCollections.js';

export const createPostgridDetails = async (payload) => {
  try {
    const res = await postgridDetailsCollection.create(payload);
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};

export const updatePostgridDetails = async (searchPayload, updatePayload) => {
  try {
    const res = await postgridDetailsCollection.findOneAndUpdate(
      searchPayload,
      updatePayload,
      {
        new: true,
      }
    );
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};

export const getPostgridDetails = async (searchPayload) => {
  try {
    const res = await postgridDetailsCollection.findOne(searchPayload);
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};
