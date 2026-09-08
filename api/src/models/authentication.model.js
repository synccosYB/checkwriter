import { authenticationCollection } from './dbCollections.js';

export const createAuthentication = async (payload) => {
  try {
    const res = await authenticationCollection.create(payload);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const updateAuthentication = async (userId, payload) => {
  try {
    const res = await authenticationCollection.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true, upsert: true }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const findAuthentication = async (payload) => {
  try {
    const res = await authenticationCollection.findOne(payload);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};
