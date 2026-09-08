import { plaidAccountDetailsCollection } from './dbCollections.js';

export const createPlaidAccountDetails = async (payload) => {
  try {
    const res = await plaidAccountDetailsCollection.create(payload);
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};

export const updatePlaidAccountDetails = async (
  searchPayload,
  updatePayload
) => {
  try {
    const res = await plaidAccountDetailsCollection.findOneAndUpdate(
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

export const getPlaidAccountDetails = async (searchPayload, filterPayload) => {
  try {
    const res = await plaidAccountDetailsCollection.findOne(
      searchPayload,
      filterPayload
    );
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};
