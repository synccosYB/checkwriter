import Stripe from 'stripe';
import {
  usersCollection,
  usersSubscriptionCollection,
} from '../models/dbCollections';
import { addMailchimpContactWithTag } from '../services/mailChimpService.js';
import {
  stripesubscriptionFindeOne,
  stripesubscriptionUpdate,
  updateOneBySubscriptionId,
  updateSubscriptionByStripeCustomerId,
} from '../models/stripesubscription.model.js';
import { updateStripeCustomers } from '../models/stripecustomers.model.js';
import { updateUser } from '../models/users.model.js';
import {
  subscriptionPaymentReceivedEmail,
} from './email.service.js';

export class StripeSubscriptionWebhookService {
  private readonly stripe: Stripe;
  private readonly productId: string;

  constructor(stripe: Stripe, productId: string) {
    this.stripe = stripe;
    this.productId = productId;
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
        return this.handleSubscriptionCreated(event);
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event);
      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event);
      case 'invoice.payment_succeeded':
        return this.handlePaymentSucceeded(event);
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event);
      case 'invoice.paid':
        return this.handleInvoicePaid(event);
      case 'invoice.payment_failed':
        return this.handleInvoicePaymentFailed(event);
      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return { received: true, processed: false };
    }
  }

  private async handleSubscriptionCreated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    await this.ensureSingleActiveSubscription(
      subscription.customer as string,
      subscription.id
    );
    await this.updateSubscriptionInDatabase(subscription);
    return { processed: true };
  }

  private async handleSubscriptionUpdated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    await this.updateSubscriptionInDatabase(subscription);
    return { processed: true };
  }

  private async handleSubscriptionDeleted(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;

    await this.updateSubscriptionInDatabase(subscription);
    return { processed: true };
  }

  private async ensureSingleActiveSubscription(
    customerId: string,
    currentSubscriptionId: string
  ) {
    const subscriptions = await this.getActiveCheckWriterSubscriptions(
      customerId
    );

    // Cancel all except the current one
    await Promise.all(
      subscriptions
        .filter((sub) => sub.id !== currentSubscriptionId)
        .map((sub) => this.stripe.subscriptions.cancel(sub.id))
    );
  }

  private async handleCustomerSubscriptionRemoval({
    customerId,
    subscriptionId,
  }: {
    customerId: string;
    subscriptionId: string;
  }) {
    const subscriptions = await this.getActiveCheckWriterSubscriptions(
      customerId
    );

    await usersSubscriptionCollection.updateOne(
      { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
      {
        $set: {
          isSubscribed: false,
          status: 'canceled',
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          isActive: false,
        },
      }
    );
  }

  public async updateSubscriptionInDatabase(subscription: Stripe.Subscription) {
    const isCheckWriterSubscription = subscription.items.data.some(
      (item) => item.price.product === this.productId
    );
    if (!isCheckWriterSubscription) return;

    const now = new Date();
    const isActive =
      ['active', 'trialing'].includes(subscription.status) &&
      now <= new Date(subscription.current_period_end * 1000);

    var result = await usersSubscriptionCollection.findOneAndUpdate(
      { stripeCustomerId: subscription.customer },
      {
        $set: {
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          isSubscribed: subscription.status === 'active',
          isActive,
          isTrialing: subscription.status === 'trialing',
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          // Keep trialEndDate in sync with Stripe. Clearing it when there is
          // no trial prevents a stale trialEndDate from a previous trial
          // making getSubscriptionDetails treat a fresh trial as expired.
          trialEndDate: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelDate: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          subscriptionPrice: {
            price: subscription.items.data[0].price.unit_amount / 100,
            currency: 'usd',
          },
          mode: subscription.status === 'trialing' ? 'trial' : 'paid',
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    if (!result) return;

    const userDetails = await usersCollection.findOne({ _id: result.userId });
    if (!userDetails) return;

    const subscriptionTag =
      result.status == 'canceled'
        ? 'Canceled'
        : result.cancelAtPeriodEnd
        ? 'Canceling'
        : 'Active';

    await addMailchimpContactWithTag({
      email: userDetails.email,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      tag:
        result.stripeSubscriptionId || result.mode
          ? result.mode == 'paid'
            ? 'Subscription'
            : 'Trial'
          : 'Sign ups',
      subscriptionTag: subscriptionTag,
    });
  }
  private async getActiveCheckWriterSubscriptions(
    customerId: string
  ): Promise<Stripe.Subscription[]> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 100,
    });

    return subscriptions.data.filter((sub) =>
      sub.items.data.some((item) => item.price.product === this.productId)
    );
  }

  private async handlePaymentSucceeded(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      return await this.reconcileSuccessfulInvoice(invoice);
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  public async reconcileSuccessfulInvoice(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return { processed: false };

    const subscription = await this.stripe.subscriptions.retrieve(
      invoice.subscription as string
    );

    if (
      subscription.status === 'active' &&
      !subscription.cancel_at_period_end
    ) {
      await this.cancelExistingTrials(
        subscription.customer as string,
        subscription.id
      );
    }

    await this.updateSubscriptionInDatabase(subscription);
    return { processed: true };
  }

  private async cancelExistingTrials(
    customerId: string,
    keepSubscriptionId: string
  ) {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    });

    const trialsToCancel = subscriptions.data.filter(
      (sub) =>
        sub.id !== keepSubscriptionId &&
        sub.status === 'trialing' &&
        sub.items.data.some((item) => item.price.product === this.productId)
    );

    await Promise.all(
      trialsToCancel.map((sub) => this.stripe.subscriptions.del(sub.id))
    );

    console.info(
      `Canceled ${trialsToCancel.length} trial subscriptions for customer ${customerId}`
    );
  }

  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const stripeSubscription = await stripesubscriptionFindeOne({
      sessionId: checkoutSession.id,
    });

    await stripesubscriptionUpdate(
      {
        sessionId: checkoutSession.id,
      },
      {
        subscriptionId: checkoutSession.subscription,
        sessionStatus: checkoutSession.status,
        paymentStatus: checkoutSession.payment_status,
      }
    );

    if (stripeSubscription) {
      await updateStripeCustomers(
        {
          stripeCustomerId: stripeSubscription.stripeCustomerId,
        },
        {
          lastSubscriptionId: checkoutSession.subscription,
        }
      );
    }

    const shouldSendEmail = parseInt(String(checkoutSession.amount_total)) > 0;

    if (shouldSendEmail) {
      await subscriptionPaymentReceivedEmail(
        checkoutSession.metadata?.Useremail,
        checkoutSession.metadata?.Username,
        checkoutSession.amount_total
      );
    }

    return { processed: true };
  }

  private async handleInvoicePaid(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.status === 'paid') {
      await this.reconcileSuccessfulInvoice(invoice);
    }

    await updateSubscriptionByStripeCustomerId(
      { stripeCustomerId: invoice.customer as string },
      { subscriptionId: invoice.subscription as string }
    );

    await updateOneBySubscriptionId(
      { subscriptionId: invoice.subscription as string },
      {
        paymentStatus: invoice.status,
        amountTotal: invoice.total,
        currency: invoice.currency,
        description: invoice.lines?.data?.[0]?.description,
        interval: invoice.lines?.data?.[0]?.plan?.interval,
        whResponse: invoice,
      }
    );

    if (invoice.status === 'paid') {
      const updatedStripeCustomer = await updateStripeCustomers(
        { stripeCustomerId: invoice.customer as string },
        {
          lastSubscriptionId: invoice.subscription,
          isSubscriptionValid: true,
        }
      );

      if (updatedStripeCustomer) {
        const periodStart = invoice.lines?.data?.[0]?.period?.start;
        const subscriptionStartedAt = periodStart
          ? new Date(periodStart * 1000)
          : null;

        await updateUser(
          { _id: updatedStripeCustomer.userId },
          {
            subscriptionStartedAt,
          }
        );
      }
    }

    return { processed: true };
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    await updateSubscriptionByStripeCustomerId(
      { stripeCustomerId: invoice.customer as string },
      { subscriptionId: invoice.subscription as string }
    );

    await updateOneBySubscriptionId(
      { subscriptionId: invoice.subscription as string },
      {
        paymentStatus: invoice.status,
        amountTotal: invoice.total,
        currency: invoice.currency,
        description: invoice.lines?.data?.[0]?.description,
        interval: invoice.lines?.data?.[0]?.plan?.interval,
        whResponse: invoice,
      }
    );

    const updatedStripeCustomer = await updateStripeCustomers(
      { stripeCustomerId: invoice.customer as string },
      {
        isSubscriptionValid: false,
        isTrialPeriod: false,
      }
    );

    if (updatedStripeCustomer) {
      await updateUser(
        { _id: updatedStripeCustomer.userId },
        {
          subscriptionStartedAt: null,
        }
      );
    }

    return { processed: true };
  }
}
