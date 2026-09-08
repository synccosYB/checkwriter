import SubscriptionService from '../services/stripe.service.js';
import { ERROR_TYPES } from './error-handler.middleware.js';

export default async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new Error(
        JSON.stringify({
          statusCode: 401,
          developerMessage: 'User ID not found in request',
        })
      );
    }

    const { isTrialPeriod, isSubscribed } =
      await SubscriptionService.getSubscriptionDetails({
        userId,
      });

    if (isSubscribed || isTrialPeriod) return next();
    else {
      throw new Error('not subscribed');
    }
  } catch (err) {
    res.status(403).send({
      type: ERROR_TYPES.SUBSCRIPTION.type,
      userMessage: 'Please subscribe to access this feature',
      developerMessage: 'User does not have an active subscription',
    });
  }
};
