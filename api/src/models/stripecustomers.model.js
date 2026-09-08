import { StripeCustomersCollection } from './dbCollections.js';

export const findOneByFilter = async (payload, fields = null) => {
  try {
    const res = await StripeCustomersCollection.findOne(payload, fields);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const createOrUpdateStripeCustomers = async (
  filterData,
  createDataOrupdateData
) => {
  try {
    const result = await StripeCustomersCollection.findOneAndUpdate(
      {
        userId: filterData.userId,
        stripeCustomerId: filterData.stripeCustomerId,
      },
      {
        $set: { ...createDataOrupdateData },
      },
      { upsert: true, returnOriginal: false }
    );
    if (!result) {
      throw err;
    }
    return result;
  } catch (err) {
    throw err;
  }
};

export const updateStripeCustomers = async (filterData, updateData) => {
  try {
    const result = await StripeCustomersCollection.findOneAndUpdate(
      filterData,
      {
        $set: { ...updateData },
      },
      { returnOriginal: false }
    );
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    throw err;
  }
};
