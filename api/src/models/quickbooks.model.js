import { quickBooksAccountDetailsCollection } from './dbCollections.js';

export const createQuickBooksAccountDetails = async (payload) => {
  try {
    const res = await quickBooksAccountDetailsCollection.create(payload);
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateQuickBooksAccountDetails = async (
  searchPayload,
  updatePayload
) => {
  try {
    const res = await quickBooksAccountDetailsCollection.findOneAndUpdate(
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

export const getQuickBooksAccountDetails = async (searchPayload) => {
  try {
    const res = await quickBooksAccountDetailsCollection.findOne(searchPayload);
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteQuickBooksAccountDetails = async (searchPayload) => {
  try {
    const res = await quickBooksAccountDetailsCollection.deleteOne(
      searchPayload
    );
    if (res.deletedCount === 0) return null;
    return res;
  } catch (err) {
    throw err;
  }
};
