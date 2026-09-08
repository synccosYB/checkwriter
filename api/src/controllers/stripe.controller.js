import express from 'express';

import Stripe from 'stripe';
import moment from 'moment';
import demoRestrictionMiddleware from '../middlewares/demoRestriction.middleware.js';

import { updatePaymentLink } from '../models/paymentLink.model.js';
import {
  paymentDoneEmail,
  paymentReceivedEmail,
} from '../services/email.service.js';
import { findOneByFilter } from '../models/stripecustomers.model.js';
import { sendCheque } from '../services/postgrid.services.js';
import { createPostgridDetails } from '../models/postgrid.model.js';
import config from 'config';
import SubscriptionService, { stripe } from '../services/stripe.service.js';
import {
  StripeCustomersCollection,
  StripeSubscriptionsCollection,
  usersCollection,
  usersSubscriptionCollection,
} from '../models/dbCollections.js';

const router = express.Router();

router.get('/get-stripe-portal-link', async (req, res, next) => {
  try {
    const { domain, userId } = req.query;

    const session = await SubscriptionService.getBillingPortal({
      return_url: domain,
      userId,
    });
    return res.status(200).json(session);
  } catch (err) {
    next(err);
  }
});

router.post('/start-trial-session', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId;

    const { domain } = req.body;

    const result = await SubscriptionService.startTrialSession({
      userId,
      redirectUrl: domain,
    });

    res.send(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/create-subscription-session', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { domain } = req.body;

    const result = await SubscriptionService.startSubscriptionSession({
      userId,
      redirectUrl: domain,
    });

    res.send(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/reactivate-subscription', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await SubscriptionService.reactivateSubscription({ userId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/cancel-subscription', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await SubscriptionService.cancelSubscriptionAtPeriodEnd({
      userId,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});


router.post('/subscribe-now', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await SubscriptionService.subscribeNow({
      userId,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/cancel-trial', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await SubscriptionService.cancelTrialAtPeriodEnd({ userId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/checkout/setup-session', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const { returnUrl } = req.body
    const out = await SubscriptionService.createSetupCheckoutSession({ userId, returnUrl })
    res.status(200).json(out)
  } catch (err) { next(err) }
})

router.post('/checkout/finalize-setup', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const { sessionId, setAsDefault } = req.body
    const out = await SubscriptionService.finalizeSetupCheckoutSession({ userId, sessionId, setAsDefault })
    res.status(200).json(out)
  } catch (err) { next(err) }
})

router.delete('/payment-methods/:paymentMethodId', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const { paymentMethodId } = req.params
    const out = await SubscriptionService.deletePaymentMethod({ userId, paymentMethodId })
    res.status(200).json(out)
  } catch (err) { next(err) }
})

router.post('/trial/verify', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const { paymentMethodId } = req.body
    const out = await SubscriptionService.verifyPaymentMethodForTrial({ userId, paymentMethodId })
    res.status(200).json(out)
  } catch (err) { next(err) }
})

router.post('/subscriptions/create', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const { paymentMethodId, trialMode} = req.body
    const out = await SubscriptionService.createSubscriptionViaApi({ userId, paymentMethodId, trialMode })
    res.status(200).json(out)
  } catch (err) { next(err) }
})
router.post('/payment-methods/default', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const { paymentMethodId } = req.body
    const out = await SubscriptionService.updateSubscriptionDefaultPaymentMethod({ userId, paymentMethodId })
    res.status(200).json(out)
  } catch (err) { next(err) }
})


router.post('/migrate-old-subscriptions', async (req, res) => {
  try {
    // Only consider users that don't already have a subscription record.
    // This avoids loading every user into memory just to skip most of them.
    const alreadyMigratedIds = await usersSubscriptionCollection.distinct('userId', {});
    const baseFilter = alreadyMigratedIds.length > 0
      ? { _id: { $nin: alreadyMigratedIds } }
      : {};

    const totalUsers = await usersCollection.countDocuments(baseFilter);
    console.info(`Found ${totalUsers} users to process`);

    const migrationResults = {
      total: totalUsers,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const BATCH_SIZE = 200;
    let processed = 0;

    while (processed < totalUsers) {
      const batch = await usersCollection
        .find(baseFilter)
        .sort({ _id: 1 })
        .skip(processed)
        .limit(BATCH_SIZE)
        .lean();

      if (batch.length === 0) break;
      processed += batch.length;

      for (const user of batch) {
      try {
        const stripeCustomer = await StripeSubscriptionsCollection.findOne({
          userId: user._id,
          subscriptionId: { $ne : null }
        }).sort({ updatedAt: -1 });

        if (!stripeCustomer) {
          migrationResults.skipped++;
          console.info(`No stripe customer found for user ${user._id}`);
          continue;
        }

        // Get customer data from Stripe
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          stripeCustomer.sessionId,
          {
            expand: ['subscription', 'customer'],
          }
        );

        const stripeCustomerId =
          typeof checkoutSession.customer === 'string'
            ? checkoutSession.customer
            : checkoutSession.customer.id;

        // Get subscription ID and details
        const subscriptionId = checkoutSession.subscription
          ? typeof checkoutSession.subscription === 'string'
            ? checkoutSession.subscription
            : checkoutSession.subscription.id
          : stripeCustomer.subscriptionId;

        // Get full subscription details if not expanded already
        if (!subscriptionId) {
          migrationResults.skipped++;
          console.info(
            `No subscription found in stripe session for user ${user._id}`
          );
          continue;
        }
        const subscription =
          typeof checkoutSession.subscription === 'string'
            ? await stripe.subscriptions.retrieve(checkoutSession.subscription)
            : checkoutSession.subscription;

        const unitAmount = subscription.items.data[0].price.unit_amount;
        const subscriptionPriceDollars = unitAmount / 100;

        // Check if customer has any subscriptions

        const now = new Date();

        const currentPeriodEnd = new Date(
          subscription.current_period_end * 1000
        );
        // Determine subscription status
        const isActive =
          ['active', 'trialing'].includes(subscription.status) ||
          (subscription.cancel_at_period_end && now <= currentPeriodEnd);

        const isTrialing = subscription.status === 'trialing';

        // Create new subscription document
        await usersSubscriptionCollection.create({
          userId: user._id,
          stripeCustomerId: stripeCustomerId,
          stripeSubscriptionId: subscriptionId,
          mode: isTrialing ? 'trial' : 'paid',
          status: subscription.status,
          isTrialing,
          isSubscribed:
            subscription.status === 'active' &&
            subscription?.cancel_at_period_end &&
            !isTrialing,
          trialStartDate: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEndDate: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelDate: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          isActive,
          subscriptionPrice: {
            price: subscriptionPriceDollars,
            currency: 'usd',
          },
        });

        console.info(`Created subscription for user ${user._id}`);
        migrationResults.success++;
      } catch (error) {
        console.error(`Error processing user ${user._id}: ${error.message}`);
        migrationResults.failed++;
        migrationResults.errors.push({
          userId: user._id,
          message: error.message,
        });

        // Still create a record but with minimal data in case of Stripe API errors
        try {
          console.info(
            `Created fallback subscription record for user ${user._id} after error`
          );
        } catch (saveError) {
          console.error(
            `Could not create fallback record for user ${user._id}: ${saveError.message}`
          );
        }
      }
      }

      if (batch.length < BATCH_SIZE) break;
    }

    console.info('Migration completed with the following results:');
    console.info(`Total users processed: ${migrationResults.total}`);
    console.info(`Successfully migrated: ${migrationResults.success}`);
    console.info(`Failed migrations: ${migrationResults.failed}`);
    console.info(`Skipped (already exists): ${migrationResults.skipped}`);

    if (migrationResults.errors.length > 0) {
      console.info('Errors encountered:');
      console.info(migrationResults.errors);
    }

    res.send({ migrationResults });
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Migration failed',
      error: error.message,
    });
  }
});

export default router;
