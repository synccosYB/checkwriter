import { banksCollection } from './dbCollections.js';

export const getBankAddressDetails = async (payload) => {
  try {
    const res = await banksCollection.find(payload);
    if (res.length === 0) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const createBankRoutingNum = async (payload) => {
  try {
    const res = await banksCollection.create(payload);
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};
