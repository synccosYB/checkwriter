import { transactionsCollection } from './dbCollections.js';
export const createTransaction = async (payload) => {
  try {
    let res = await transactionsCollection.create(payload);
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};
