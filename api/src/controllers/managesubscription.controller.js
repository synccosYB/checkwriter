import express from 'express';
import Stripe from 'stripe';
import { DateTime } from 'luxon';

const router = express.Router();

import {
  createOrUpdateStripeCustomers,
  findOneByFilter,
  updateStripeCustomers,
} from '../models/stripecustomers.model.js';
import {
  stripeSubscriptionsCreate,
  stripesubscriptionFindeOne,
  stripesubscriptionUpdate,
  updateOneBySubscriptionId,
  updateSubscriptionByStripeCustomerId,
} from '../models/stripesubscription.model.js';
import { getUser, updateUser } from '../models/users.model.js';
import config from 'config';
import {
  sendSubscriptionPaymentRequestEmail,
  subscriptionPaymentReceivedEmail,
} from '../services/email.service.js';

import { PaymentLinkStripeService } from '../services/paymentLinkStripe.service.js';
import SubscriptionService from '../services/stripe.service.js';
const {
  stripe_subscription: {
    stripe_secret_key,
    stripe_monthly_subscription_price_id,
    stripe_subscription_trial_period_days,
    stripe_subscription_webhook_endpoint_secret,
    subscription_domain_url,
    payment_method_collection = 'if_required',
  },
} = config;

const stripe = Stripe(stripe_secret_key);

router.get('/', async (req, res, next) => {
  try {
    const isTrialPeriod = req.query.isTrialPeriod;
    const recurring = 'monthly';
    const { userId } = req;
    const User = await getUser({ _id: userId });

    const stripeCustomer = await findOneByFilter({ userId: userId });

    if (stripeCustomer?.isSubscriptionValid)
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage: 'User already subscribed.',
        })
      );

    const products = {
      monthly: {
        price: stripe_monthly_subscription_price_id,
        quantity: 1,
      },
    };

    let stripeCustomerObj;
    if (stripeCustomer?.stripeCustomerId) {
      stripeCustomerObj = await stripe.customers.retrieve(
        stripeCustomer.stripeCustomerId
      );
    } else if (!stripeCustomerObj) {
      stripeCustomerObj = await stripe.customers.create({
        email: User.email,
      });
    }
    // Create a payment link using Stripe Checkout
    const stripeCheckoutSession = {
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [products[recurring]],
      customer: stripeCustomerObj.id,
      success_url: `${subscription_domain_url}/dashboard/main`,
      cancel_url: `${subscription_domain_url}/subscription/failure`,

      //dont ask for method if payment is not due
      payment_method_collection: payment_method_collection,

      metadata: {
        Useremail: User.email,
        Username: User.firstName + ' ' + User.lastName,
        amountId: stripe_monthly_subscription_price_id,
        currency: 'USD',
      },
    };

    if (isTrialPeriod) {
      stripeCheckoutSession['subscription_data'] = {
        trial_period_days: stripe_subscription_trial_period_days,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(
      stripeCheckoutSession
    );

    try {
      const updatedStripeCustomer = await createOrUpdateStripeCustomers(
        {
          userId: userId,
          stripeCustomerId: stripeCustomerObj.id,
        },
        {
          userId: userId,
          stripeCustomerId: stripeCustomerObj.id,
          lastSessionId: session.id,
          stripeSubscriptions: session,
        }
      );
      const data = {
        userId: userId,
        stripeCustomerId: updatedStripeCustomer._id,
        sessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        expiresAt: session.expires_at,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
      };

      await stripeSubscriptionsCreate(data);

      const amount = updatedStripeCustomer?.stripeSubscriptions?.amount_total;

      if (!isTrialPeriod || amount > 0)
        await sendSubscriptionPaymentRequestEmail(
          User?.email,
          User?.firstName + User?.lastName,
          session?.amount_total,
          session.url
        );
    } catch (error) {
      throw new BadRequestException(
        'Some problem occurred while processing checkout request'
      );
    }

    res.status(200).json({ stripeCheckoutUrl: session.url });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/cancel', async (req, res, next) => {
  try {
    const { userId } = req;
    const stripeCustomer = await findOneByFilter({
      userId: userId,
    });

    const customer = await stripe.customers.retrieve(
      stripeCustomer.stripeCustomerId,
      {
        expand: ['subscriptions'],
      }
    );
    const subscriptionId = customer['subscriptions']?.data?.[0]?.id;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      await new Promise((r) => setTimeout(r, 5000));
    } else {
      return res.status(400).json('Subscriptions data Not found.');
    }
    return res.status(200).json('Subscriptions successful cancel.');
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.post('/webhook1', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];

    let event;

    // checking the webhook is coming from official stripe or not
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripe_subscription_webhook_endpoint_secret
      );
    } catch (err) {
      console.error(err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case 'customer.subscription.created':
        // Then define and call a function to handle the event customer.subscription.created
        try {
          const customerSubscriptionCreated = event.data.object;

          await updateSubscriptionByStripeCustomerId(
            { stripeCustomerId: customerSubscriptionCreated.customer },
            { subscriptionId: customerSubscriptionCreated.id }
          );

          await updateOneBySubscriptionId(
            { subscriptionId: customerSubscriptionCreated.id },
            {
              currentPeriodStartAt:
                customerSubscriptionCreated.current_period_start,
              currentPeriodEndAt:
                customerSubscriptionCreated.current_period_end,
              trialStartAt: customerSubscriptionCreated.trial_start,
              trialEndAt: customerSubscriptionCreated.trial_end,
              subscriptionStatus: customerSubscriptionCreated.status,
            }
          );

          if (customerSubscriptionCreated.status === 'trialing') {
            await updateStripeCustomers(
              {
                stripeCustomerId: customerSubscriptionCreated.customer,
              },
              {
                lastSubscriptionId: customerSubscriptionCreated.subscription,
                isTrialPeriod: true,
              }
            );
          }
        } catch (err) {
          throw err;
        }
        break;

      case 'customer.subscription.updated':
        // Then define and call a function to handle the event customer.subscription.updated
        try {
          const customerSubscriptionUpdated = event.data.object;

          await updateSubscriptionByStripeCustomerId(
            { stripeCustomerId: customerSubscriptionUpdated.customer },
            { subscriptionId: customerSubscriptionUpdated.id }
          );

          await updateOneBySubscriptionId(
            { subscriptionId: customerSubscriptionUpdated.id },
            {
              currentPeriodStartAt:
                customerSubscriptionUpdated.current_period_start,
              currentPeriodEndAt:
                customerSubscriptionUpdated.current_period_end,
              trialStartAt: customerSubscriptionUpdated.trial_start,
              trialEndAt: customerSubscriptionUpdated.trial_end,
              subscriptionStatus: customerSubscriptionUpdated.status,
            }
          );

          if (customerSubscriptionUpdated.status !== 'active') {
            const updatedStripeCustomer = await updateStripeCustomers(
              { stripeCustomerId: customerSubscriptionUpdated.customer },
              {
                lastSubscriptionId: customerSubscriptionUpdated.subscription,
                isSubscriptionValid: false,
                isTrialPeriod: false,
              }
            );
            await updateUser(
              { _id: updatedStripeCustomer.userId },
              {
                subscriptionStartedAt: null,
              }
            );
          }
        } catch (err) {
          err.message = `Webhook - ${event.type}: ${err.message}`;
          throw err;
        }
        break;

      case 'customer.subscription.deleted':
        // Then define and call a function to handle the event customer.subscription.deleted
        try {
          const customerSubscriptionDeleted = event.data.object;
          const updatedStripeCustomer = await updateStripeCustomers(
            { stripeCustomerId: customerSubscriptionDeleted.customer },
            {
              isSubscriptionValid: false,
              isTrialPeriod: false,
            }
          );

          await updateUser(
            { _id: updatedStripeCustomer.userId },
            {
              subscriptionStartedAt: null,
            }
          );

          await updateOneBySubscriptionId(
            { subscriptionId: customerSubscriptionDeleted.id },
            {
              subscriptionStatus: customerSubscriptionDeleted.status,
            }
          );
        } catch (err) {
          err.message = `Webhook - ${event.type}: ${err.message}`;
          throw err;
        }
        break;
      case 'invoice.paid':
        // Then define and call a function to handle the event invoice.paid
        try {
          const invoicePaid = event.data.object;
          await updateSubscriptionByStripeCustomerId(
            { stripeCustomerId: invoicePaid.customer },
            { subscriptionId: invoicePaid.subscription }
          );

          await updateOneBySubscriptionId(
            { subscriptionId: invoicePaid.subscription },
            {
              paymentStatus: invoicePaid.status,
              amountTotal: invoicePaid.total,
              currency: invoicePaid.currency,
              description: invoicePaid.lines?.data?.[0]?.description,
              interval: invoicePaid.lines?.data?.[0]?.plan?.interval,
              whResponse: invoicePaid,
            }
          );

          if (invoicePaid.status === 'paid') {
            const updatedStripeCustomer = await updateStripeCustomers(
              { stripeCustomerId: invoicePaid.customer },
              {
                lastSubscriptionId: invoicePaid.subscription,
                isSubscriptionValid: true,
              }
            );

            const subscriptionStartedAt = DateTime.fromSeconds(
              invoicePaid.lines?.data?.[0]?.period?.start
            ).toJSDate();

            await updateUser(
              { _id: updatedStripeCustomer.userId },
              {
                subscriptionStartedAt: subscriptionStartedAt,
              }
            );
          }
        } catch (err) {
          err.message = `Webhook - ${event.type}: ${err.message}`;
          throw err;
        }
        break;
      case 'invoice.payment_failed':
        // Then define and call a function to handle the event invoice.payment_failed
        try {
          const invoicePaymentFailed = event.data.object;
          await updateSubscriptionByStripeCustomerId(
            { stripeCustomerId: invoicePaymentFailed.customer },
            { subscriptionId: invoicePaymentFailed.subscription }
          );

          await updateOneBySubscriptionId(
            { subscriptionId: invoicePaymentFailed.subscription },
            {
              paymentStatus: invoicePaymentFailed.status,
              amountTotal: invoicePaymentFailed.total,
              currency: invoicePaymentFailed.currency,
              description: invoicePaymentFailed.lines?.data?.[0]?.description,
              interval: invoicePaymentFailed.lines?.data?.[0]?.plan?.interval,
              whResponse: invoicePaymentFailed,
            }
          );

          const updatedStripeCustomer = await updateStripeCustomers(
            { stripeCustomerId: invoicePaymentFailed.customer },
            {
              isSubscriptionValid: false,
              isTrialPeriod: false,
            }
          );

          await updateUser(
            { _id: updatedStripeCustomer.userId },
            {
              subscriptionStartedAt: null,
            }
          );
        } catch (err) {
          err.message = `Webhook - ${event.type}: ${err.message}`;
          throw err;
        }
        break;
      case 'checkout.session.completed':
        try {
          const checkoutSessionCompleted = event.data.object;
          // Then define and call a function to handle the event checkout.session.completed
          const stripeSubscription = await stripesubscriptionFindeOne({
            sessionId: checkoutSessionCompleted.id,
          });

          await stripesubscriptionUpdate(
            {
              sessionId: checkoutSessionCompleted.id,
            },
            {
              subscriptionId: checkoutSessionCompleted.subscription,
              sessionStatus: checkoutSessionCompleted.status,
              paymentStatus: checkoutSessionCompleted.payment_status,
            }
          );

          await updateStripeCustomers(
            {
              stripeCustomerId: stripeSubscription.stripeCustomerId,
            },
            {
              lastSubscriptionId: checkoutSessionCompleted.subscription,
            }
          );

          const shouldSendEmail = parseInt(event.data.object.amount_total) > 0;

          if (shouldSendEmail)
            await subscriptionPaymentReceivedEmail(
              event.data.object.metadata?.Useremail,
              event.data.object.metadata?.Username,
              event.data.object.amount_total
            );
        } catch (err) {
          err.message = `Webhook - ${event.type}: ${err.message}`;
          throw err;
        }
        break;
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }
    // Return a 200 res to acknowledge receipt of the event
    res.status(200).json(`webhook ${event.type} run success`);
    return;
  } catch (err) {
    next(err);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const body = req.rawBody;
    const result = await SubscriptionService.handleWebhookEvent({ body, sig });
    res.status(200).send(result);
  } catch (error) {
    console.error('error in stripe webhook', error?.message, error?.stack);
    if (error?.code === 'STRIPE_SIGNATURE_VERIFICATION_FAILED') {
      res.status(400).send({ error: error?.message });
    } else {
      res.status(200).send({ received: true, error: 'internal processing error logged' });
    }
  }
});

router.post('/payment-links/webhook', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const body = req.rawBody;
    const result = await PaymentLinkStripeService.handleWebhookEvent({
      body,
      sig,
    });
    res.send(result);
  } catch (error) {
    console.error('error in stripe webhook', error?.message);
    res.status(500).send({ error: error?.message || 'internal server error' });
  }
});

export default router;
