import { verificationCollection } from './dbCollections.js';

export const getVerification = async (payload, fields = null) => {
  try {
    const res = await verificationCollection.findOne(payload, fields);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const createOrUpdateVerification = async (payload) => {
  try {
    const res = await verificationCollection.findOneAndUpdate(
      { email: payload.email },
      payload,
      { upsert: true, new: true }
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateVerification = async (filterPayload, updatePayload) => {
  try {
    const res = await verificationCollection.findOneAndUpdate(
      filterPayload,
      updatePayload,
      { new: true }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const deleteVerification = async (payload) => {
  try {
    const res = await verificationCollection.deleteMany(payload);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};
