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
import { findOneByFilter, updateStripeCustomers } from '../models/stripecustomers.model.js';
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
    const snapshot = event.data.object as Stripe.Subscription;
    const subscription = await this.stripe.subscriptions.retrieve(snapshot.id);
    const result = await this.updateSubscriptionInDatabase(subscription);
    if (result?.stripeSubscriptionId === subscription.id && subscription.status === 'active') {
      await this.ensureSingleActiveSubscription(
        subscription.customer as string, subscription.id, subscription.created
      );
    }
    return { processed: true };
  }

  private async handleSubscriptionUpdated(event: Stripe.Event) {
    const snapshot = event.data.object as Stripe.Subscription;
    const subscription = await this.stripe.subscriptions.retrieve(snapshot.id);
    await this.updateSubscriptionInDatabase(subscription);
    return { processed: true };
  }

  private async handleSubscriptionDeleted(event: Stripe.Event) {
    const snapshot = event.data.object as Stripe.Subscription;
    const subscription = await this.stripe.subscriptions.retrieve(snapshot.id);

    await this.updateSubscriptionInDatabase(subscription);
    return { processed: true };
  }

  private async ensureSingleActiveSubscription(
    customerId: string,
    currentSubscriptionId: string,
    currentCreated: number
  ) {
    const subscriptions = await this.getActiveCheckWriterSubscriptions(
      customerId
    );

    // Cancel all except the current one
    await Promise.all(
      subscriptions
        .filter((sub) => sub.id !== currentSubscriptionId && sub.created < currentCreated)
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

  public async updateSubscriptionInDatabase(
    subscription: Stripe.Subscription,
    { userId: requestedUserId }: { userId?: string } = {}
  ) {
    const item = subscription.items.data.find((item) =>
      (typeof item.price.product === 'string' ? item.price.product : item.price.product?.id) === this.productId
    );
    if (!item || !this.productId) return null;
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer : subscription.customer.id;
    const existing = await usersSubscriptionCollection.findOne({ stripeCustomerId: customerId, userId: { $ne: null } });
    let userId = existing?.userId || requestedUserId || subscription.metadata?.userId;
    if (requestedUserId && existing?.userId && String(existing.userId) !== String(requestedUserId)) {
      throw new Error('Stripe customer is already linked to a different user');
    }
    if (!userId) {
      const legacy = await findOneByFilter({ stripeCustomerId: customerId });
      userId = legacy?.userId;
    }
    // Do not create an ownerless row. Admin refresh can recover older accounts
    // by verified email lookup and pass the selected application user explicitly.
    if (!userId) throw new Error('Subscription has no linked user; refresh the user subscription');
    if (!existing?.userId) {
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) throw new Error('Subscription user was not found');
    }
    const linked = await usersSubscriptionCollection.findOne({ userId });
    if (linked?.stripeSubscriptionId && linked.stripeSubscriptionId !== subscription.id) {
      let current;
      try {
        current = await this.stripe.subscriptions.retrieve(linked.stripeSubscriptionId);
      } catch (error) {
        if (error.code !== 'resource_missing') throw error;
      }
      // Late cancellation/failure of an older trial must not revoke a newer plan.
      if (current && ['active', 'trialing'].includes(current.status) &&
          (!['active', 'trialing'].includes(subscription.status) ||
           (current.status === 'active' && subscription.status === 'trialing') ||
           current.created > subscription.created)) return linked;
    }
    // Stripe Basil moved the billing period onto subscription items.
    const periodItem = item as Stripe.SubscriptionItem & {
      current_period_start?: number; current_period_end?: number;
    };
    const periodStart = periodItem.current_period_start ?? subscription.current_period_start;
    const periodEnd = periodItem.current_period_end ?? subscription.current_period_end;
    if (!Number.isFinite(periodStart) || !Number.isFinite(periodEnd)) {
      throw new Error('Subscription billing period is missing');
    }
    const now = new Date();
    const isActive = ['active', 'trialing'].includes(subscription.status) &&
      now <= new Date(periodEnd * 1000);

    var result = await usersSubscriptionCollection.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          isSubscribed: subscription.status === 'active',
          isActive,
          isTrialing: subscription.status === 'trialing',
          currentPeriodStart: new Date(
            periodStart * 1000
          ),
          currentPeriodEnd: new Date(periodEnd * 1000),
          // Keep trialEndDate in sync with Stripe. Clearing it when there is
          // no trial prevents a stale trialEndDate from a previous trial
          // making getSubscriptionDetails treat a fresh trial as expired.
          trialEndDate: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          cancelDate: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          subscriptionPrice: {
            price: (item.price.unit_amount ?? 0) / 100,
            currency: item.price.currency || 'usd',
          },
          mode: subscription.status === 'trialing' ? 'trial' : 'paid',
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    if (!result) throw new Error('Subscription database update did not complete');

    const userDetails = await usersCollection.findOne({ _id: result.userId });
    if (!userDetails) return result;

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
    return result;
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

  private invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
    const newer = invoice as Stripe.Invoice & {
      parent?: { subscription_details?: { subscription?: string | { id: string } } };
    };
    const subscription = invoice.subscription || newer.parent?.subscription_details?.subscription;
    return typeof subscription === 'string' ? subscription : subscription?.id;
  }

  public async reconcileSuccessfulInvoice(invoice: Stripe.Invoice) {
    const subscriptionId = this.invoiceSubscriptionId(invoice);
    if (!subscriptionId) return { processed: false };

    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
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
    if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
      const id = typeof checkoutSession.subscription === 'string'
        ? checkoutSession.subscription : checkoutSession.subscription.id;
      const subscription = await this.stripe.subscriptions.retrieve(id);
      await this.updateSubscriptionInDatabase(subscription, {
        userId: checkoutSession.metadata?.userId,
      });
    }


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
    const subscriptionId = this.invoiceSubscriptionId(invoice);
    if (!subscriptionId) return { processed: false };

    if (invoice.status === 'paid') {
      await this.reconcileSuccessfulInvoice(invoice);
    }

    await updateSubscriptionByStripeCustomerId(
      { stripeCustomerId: invoice.customer as string },
      { subscriptionId: subscriptionId }
    );

    await updateOneBySubscriptionId(
      { subscriptionId: subscriptionId },
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
          lastSubscriptionId: subscriptionId,
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
    const subscriptionId = this.invoiceSubscriptionId(invoice);
    if (!subscriptionId) return { processed: false };
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.updateSubscriptionInDatabase(subscription);


    await updateSubscriptionByStripeCustomerId(
      { stripeCustomerId: invoice.customer as string },
      { subscriptionId: subscriptionId }
    );

    await updateOneBySubscriptionId(
      { subscriptionId: subscriptionId },
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
