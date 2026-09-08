import {
  StripeCustomersCollection,
  StripeSubscriptionsCollection,
} from './dbCollections.js';

export const stripeSubscriptionsCreate = async (data) => {
  try {
    const result = await StripeSubscriptionsCollection.create({
      userId: data.userId,
      stripeCustomerId: data.stripeCustomerId,
      sessionId: data.sessionId,
      amountTotal: data.amountTotal,
      currency: data.currency,
      expiresAt: data.expiresAt,
      paymentStatus: data.paymentStatus,
      sessionStatus: data.sessionStatus,
    });
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    throw err;
  }
};

export const stripesubscriptionUpdate = async (
  filterData,
  createDataOrupdateData
) => {
  try {
    const result = await StripeSubscriptionsCollection.findOneAndUpdate(
      {
        sessionId: filterData.sessionId,
      },
      {
        $set: { ...createDataOrupdateData },
      }
    );
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    throw err;
  }
};

export const stripesubscriptionFindeOne = async (payload, fields = null) => {
  try {
    const result = await StripeSubscriptionsCollection.findOne(payload, fields);
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    throw err;
  }
};

export const updateSubscriptionByStripeCustomerId = async (
  stripeCustomerId,
  subscriptionId
) => {
  const stripeCustomer = await StripeCustomersCollection.findOne(
    stripeCustomerId
  ).select('_id');
  if (stripeCustomer) {
    const stripeSubscription = await StripeSubscriptionsCollection.findOne({
      stripeCustomerId: stripeCustomer?._id,
      sessionStatus: 'open',
      subscriptionId: { $exists: false },
    })
      .select('_id')
      .sort({ _id: -1 });
    if (stripeSubscription && stripeSubscription._id) {
      try {
        await StripeSubscriptionsCollection.updateOne(
          { _id: stripeSubscription?._id },
          { $set: { ...subscriptionId } }
        );
      } catch (error) {
        throw error;
      }
    } else {
      console.error('Subscription or its _id property is undefined or null.');
    }
  }
};

export const updateOneBySubscriptionId = async (
  filterData,
  subscriptionData
) => {
  try {
    await StripeSubscriptionsCollection.updateOne(filterData, {
      ...subscriptionData,
    });
  } catch (error) {
    throw error;
  }
};
