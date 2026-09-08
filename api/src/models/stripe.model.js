import { StripeUserCollection } from './dbCollections.js';

export const createStripeUser = async (payload) => {
  try {
    const user = await StripeUserCollection.create(payload);
    return user;
  } catch (err) {
    throw err;
  }
};

export const getUserStripeAccount = async (payload) => {
  try {
    const res = await StripeUserCollection.findOne(payload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteUserAccount = async (payload) => {
  try {
    const res = await StripeUserCollection.findOneAndDelete(payload);
  } catch (err) {
    throw err;
  }
};

export const updateUserAccount = async (searchPayload, updatePayload) => {
  try {
    const res = await StripeUserCollection.findOneAndUpdate(
      searchPayload,
      updatePayload
    );
    return res;
  } catch (err) {
    throw err;
  }
};
