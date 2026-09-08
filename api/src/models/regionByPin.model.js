import { regionByPinCollection } from './dbCollections.js';

export const getRegionByPin = async (payload) => {
  try {
    const res = await regionByPinCollection.find(payload);
    if (res.length === 0) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};
