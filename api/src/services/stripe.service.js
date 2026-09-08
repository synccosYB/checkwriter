import Stripe from "stripe";
import config from "config";
import {
  usersCollection,
  usersSubscriptionCollection,
} from "../models/dbCollections.js";
import {
  sendSubscriptionPaymentRequestEmail,
  subscriptionPaymentReceivedEmail,
} from "./email.service.js";
import { StripeSubscriptionWebhookService } from "./stripeWebhook.service.js";
import { getDaysUntilExpiration } from "../utils/common.util.js";

const {
  stripe_subscription: {
    stripe_secret_key,
    stripe_monthly_subscription_price_id,
    stripe_subscription_webhook_endpoint_secret,
    stripe_subscription_trial_period_days,
    checkwriter_product_id,
    payment_method_collection = "if_required",
  },
} = config;

export const stripe = new Stripe(stripe_secret_key);

export class SubscriptionService {
  // Private method to get user information
  static async #getUserInformation({ userId }) {
    try {
      const currentUser = await usersCollection.findOne({ _id: userId }).lean();

      if (!currentUser) {
        throw new Error("User not found");
      }

      const subscription = await usersSubscriptionCollection.findOne({
        userId: currentUser?._id,
      });

      return {
        ...currentUser,
        subscriptionId: subscription?.stripeSubscriptionId,
        customerId: subscription?.stripeCustomerId,
      };
    } catch (err) {
      throw err;
    }
  }
  // Private method to ensure user has an active Stripe subscription
  static async #requireStripeSubscriptionId({ userId }) {
    const subDoc = await usersSubscriptionCollection.findOne({ userId }).lean();
    if (!subDoc || !subDoc.stripeSubscriptionId) {
      throw new Error("Active Stripe subscription not found");
    }
    return {
      stripeSubscriptionId: subDoc.stripeSubscriptionId,
      stripeCustomerId: subDoc.stripeCustomerId,
    };
  }

  // Private method to check existing subscription status
  static async #checkExistingSubscription({
    userId,
    isStartingPaidSubscription = false,
  }) {
    try {
      const existingSubscription = await usersSubscriptionCollection.findOne({
        userId,
      });

      if (existingSubscription) {
        // Check for currently active trial
        if (
          existingSubscription.status === "trialing" &&
          existingSubscription.isTrialing &&
          existingSubscription.trialEndDate > new Date() &&
          !isStartingPaidSubscription
        ) {
          throw new Error(`error: 'You are currently in a trial period.'`);
        }

        // Check for currently active paid subscription
        if (
          existingSubscription.status === "active" &&
          existingSubscription.mode === "paid" &&
          existingSubscription.isSubscribed &&
          !existingSubscription.isTrialing && // Ensure not in trial
          existingSubscription.currentPeriodEnd > new Date() // Ensure current period hasn't ended
        ) {
          throw new Error(`error: 'You are already a paying subscriber.'`);
        }

        if (
          existingSubscription.stripeSubscriptionId &&
          existingSubscription.status === "past_due" &&
          !isStartingPaidSubscription
        ) {
          throw new Error(
            `error: 'Your subscription is past due. Please update your payment information.'`
          );
        }

        // If none of the above conditions are met, it means:
        // - No existing subscription
        // - Trial has expired (trialEndDate <= new Date())
        // - Paid subscription period has ended (currentPeriodEnd <= new Date())
        // - Subscription was canceled (status === 'canceled')
        // - Subscription was unpaid (status === 'unpaid')
        // In these cases, we should allow the user to proceed with a new trial or subscription.
        return existingSubscription;
      }

      return null; // No currently active conflicting subscription
    } catch (error) {
      console.error("error", JSON.stringify(error));
      throw new Error(error);
    }
  }

  static async #sendEmailToNotifyUser({
    email,
    name,
    amount,
    url,
    type = "Payment Request",
  }) {
    try {
      if (type === "Payment Request")
        await sendSubscriptionPaymentRequestEmail(email, name, amount, url);
      else await subscriptionPaymentReceivedEmail(email, name, amount);
    } catch (err) {
      throw new Error(`Error in sending mail to user, ${err?.message} `);
    }
  }

  static async getSubscriptionDetails({ userId }) {
  try {
    const sub = await usersSubscriptionCollection.findOne({ userId });

    // helper: price to show when not currently active
    const getStripePriceUsd = async () => {
      try {
        const priceId = config.stripe_subscription.stripe_monthly_subscription_price_id;
        if (!priceId) return 0;
        const price = await stripe.prices.retrieve(priceId);
        const cents = price.unit_amount_decimal
          ? Number(price.unit_amount_decimal)
          : Number(price.unit_amount);
        return Number.isFinite(cents) ? cents / 100 : 0;
      } catch (err) {
        console.warn('getStripePriceUsd failed, returning 0:', err?.message);
        return 0;
      }
    };

    // No row at all => truly new user
    if (!sub) {
      return {
        isSubscribed: false,
        isTrialPeriod: false,
        isActive: false,
        price: await getStripePriceUsd(),
        subscriptionId: null,
        cancelAtPeriodEnd: false,
        cancelDate: null,
        cancelAt: null,
        trialEndsAt: null,
        isScheduledToCancel: false,
        subscriptionStatus: 'none',
        subscriptionStatusText: 'No Subscription',
        subscriptionMode: 'no_subscription',
        underlyingSubscriptionStatus: 'none',
        hasFullAccessOverride: false,
        fullAccessOverride: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialDays: stripe_subscription_trial_period_days
      };
    }

    const now = new Date();
    const hasStripeSubscription = Boolean(sub.stripeSubscriptionId);
    const currentPeriodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
    const cancelAt = sub.cancelAt ? new Date(sub.cancelAt) : null;

    // Trial window
    const trialEndDate = sub.trialEndDate || currentPeriodEnd;
    const isTrialPeriod = sub.status === 'trialing' && trialEndDate && now <= trialEndDate;
    const trialExpired = sub.status === 'trialing' && trialEndDate && now > trialEndDate;

    // Cancellation flags
    const isCancelAtPeriodEnd = Boolean(sub.cancelAtPeriodEnd);
    const isCurrentPeriodActive = currentPeriodEnd && now <= currentPeriodEnd;

    let effectiveEndDate = null;
    if (isCancelAtPeriodEnd && currentPeriodEnd) effectiveEndDate = currentPeriodEnd;
    else if (cancelAt) effectiveEndDate = cancelAt;
    else if (sub.cancelDate) effectiveEndDate = new Date(sub.cancelDate);

    const isScheduledToCancel = Boolean(
      (isCancelAtPeriodEnd && isCurrentPeriodActive) ||
      (cancelAt && now < cancelAt) ||
      (sub.cancelDate ? !!sub.currentPeriodEnd : false)
    );

    const hasAccess = effectiveEndDate ? now < effectiveEndDate : true;
    const isSubscribed = sub.status === 'active' && hasAccess && !isTrialPeriod;
    const isActive = hasAccess && (isTrialPeriod || sub.status === 'active');
    const hasFullAccessOverride = Boolean(sub.fullAccessOverrideEnabled);

    const response = {
      isSubscribed: isSubscribed || hasFullAccessOverride,
      isTrialPeriod,
      isActive: isActive || hasFullAccessOverride,
      price: isActive ? (Number.isFinite(Number(sub.subscriptionPrice?.price)) ? Number(sub.subscriptionPrice.price) : 0) : await getStripePriceUsd(),
      subscriptionId: sub._id,
      cancelAtPeriodEnd: isCancelAtPeriodEnd,
      cancelDate: sub.cancelDate ? Math.floor(new Date(sub.cancelDate).getTime() / 1000) : null,
      cancelAt: currentPeriodEnd ? Math.floor(currentPeriodEnd.getTime() / 1000) : null,
      isScheduledToCancel,
      subscriptionStatus: sub.status || 'none',
      underlyingSubscriptionStatus: sub.status || 'none',
      subscriptionStatusText: 'No Subscription', // set below
      hasFullAccessOverride,
      fullAccessOverride: hasFullAccessOverride
        ? {
            enabled: true,
            reason: sub.fullAccessOverrideReason || null,
            updatedAt: sub.fullAccessOverrideUpdatedAt || null,
            updatedBy: sub.fullAccessOverrideUpdatedBy || null,
          }
        : null,
      stripeCustomerId: sub.stripeCustomerId || null,
      stripeSubscriptionId: sub.stripeSubscriptionId || null,
      trialDays: stripe_subscription_trial_period_days
    };

    if (isTrialPeriod && trialEndDate) {
      response.trialEndsAt = Math.floor(trialEndDate.getTime() / 1000);
    }

    // -------- Status text (explicit first) --------
    const s = sub.status || 'none';
    if (hasFullAccessOverride) {
      response.subscriptionStatusText = 'Manual Full Access';
    } else if (s === 'past_due') {
      response.subscriptionStatusText = 'Past Due';
    } else if (isTrialPeriod && trialEndDate) {
      const daysLeft = getDaysUntilExpiration(response.trialEndsAt);
      response.subscriptionStatusText =
        daysLeft <= 0 ? 'Trial Ends Today' : `Trial Ends in ${daysLeft} Days`;
    } else if (isSubscribed) {
      response.subscriptionStatusText = 'Active';
    } else if (s === 'canceled' || trialExpired) {
      response.subscriptionStatusText = 'Canceled';
    } else if (isScheduledToCancel && effectiveEndDate) {
      const daysLeft = getDaysUntilExpiration(response.cancelAt);
      response.subscriptionStatusText =
        daysLeft <= 0
          ? 'Canceled'
          : daysLeft === 0
          ? 'Cancels Today'
          : `Cancels in ${daysLeft} Days`;
    } else if (s === 'none') {
      response.subscriptionStatusText = 'No Subscription';
    } else {
      // other terminal-ish states
      response.subscriptionStatusText = 'No Subscription';
    }

    // -------- subscriptionMode (explicit first; order matters) --------
    let mode;
    if (hasFullAccessOverride) {
      mode = 'manual_access';
    } else if (isTrialPeriod) {
      mode = 'trial';
    } else if (s === 'active') {
      mode = isScheduledToCancel ? 'scheduleToCancel' : 'subscribed';
    } else if (s === 'canceled' || trialExpired) {
      // Your requirement: "should be canceled when a user cancels active or cancels trial or trial expires"
      mode = 'canceled';
    } else if (['past_due', 'unpaid', 'incomplete_expired', 'incomplete'].includes(s)) {
      // choose how you want to treat these; using 'canceled' keeps UI simple
      mode = 'canceled';
    } else if (!hasStripeSubscription || s === 'none') {
      // True “brand new” state (has customer but never had a Stripe subscription)
      mode = 'no_subscription';
    } else {
      mode = 'canceled';
    }

    response.subscriptionMode = mode;
    return response;
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return {
      isSubscribed: false,
      isTrialPeriod: false,
      isActive: false,
      price: 0,
      subscriptionId: null,
      cancelAtPeriodEnd: false,
      cancelDate: null,
      cancelAt: null,
      trialEndsAt: null,
      isScheduledToCancel: false,
      subscriptionStatus: 'none',
      subscriptionStatusText: 'No Subscription',
      subscriptionMode: 'no_subscription',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialDays: stripe_subscription_trial_period_days
    };
  }
}


  static async #getOrCreateStripeCustomer(user, stripeCustomerId) {
    try {
      if (stripeCustomerId) {
        const existingCustomer = await stripe.customers.retrieve(
          stripeCustomerId
        );
        return existingCustomer;
      }

      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        description: `customer created ${user?.email} =>  ${user?.firstName} ${user?.lastName}`,
      });

      await usersSubscriptionCollection.findOneAndUpdate(
        { userId: user?._id },
        { stripeCustomerId: newCustomer.id },
        { upsert: true, new: true }
      );

      return newCustomer;
    } catch (error) {
      throw error;
    }
  }

  // Start Trial via Stripe Checkout Session
  static async startTrialSession({ userId, redirectUrl }) {
    try {
      await this.#checkExistingSubscription({ userId });

      const currentUser = await this.#getUserInformation({ userId });

      const trialDays = stripe_subscription_trial_period_days || 14;

      const metadata = {
        userId,
        subscriptionType: "trial",
        email: currentUser.email,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
      };

      const { id: customerId } = await this.#getOrCreateStripeCustomer(
        currentUser,
        currentUser?.customerId
      );

      const sessionParams = {
        mode: "subscription",
        payment_method_collection: payment_method_collection, // this hides the payment method
        line_items: [
          { price: stripe_monthly_subscription_price_id, quantity: 1 },
        ],
        subscription_data: {
          trial_period_days: trialDays,
          metadata,
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
        },
        metadata,
        success_url: redirectUrl,
        cancel_url: redirectUrl,
        customer: customerId,
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      return { success: true, url: session.url };
    } catch (error) {
      console.error("Error starting trial session:", JSON.stringify(error));
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async findStripeSubscriptionByEmail({ email }) {
    const { data: customers } = await stripe.customers.list({
      email,
      limit: 10,
    });
    if (!customers.length) return null;

    for (const c of customers) {
      const subs = await stripe.subscriptions.list({
        customer: c.id,
        limit: 10,
      });

      const activeNow = subs.data.filter((sub) =>
        ["active", "trialing"].includes(sub.status)
      );

      const matchedSub = activeNow.find((s) =>
        s.items.data.some((it) => {
          const prodId = it.price?.product;
          return prodId === checkwriter_product_id;
        })
      );

      if (matchedSub) return matchedSub;
    }

    return null;
  }

  static async startSubscriptionSession({ userId, redirectUrl }) {
    try {
      const currentSubscription = await this.#checkExistingSubscription({
        userId,
        isStartingPaidSubscription: true,
      });

      const currentUser = await this.#getUserInformation({ userId });

      const metadata = {
        userId,
        subscriptionType: "paid",
        email: currentUser.email,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
      };

      const { id: customerId, ...rest } = await this.#getOrCreateStripeCustomer(
        currentUser,
        currentUser?.customerId
      );

      // Add information about the trial subscription if it exists
      if (
        currentSubscription?.status === "trialing" &&
        currentSubscription?.stripeSubscriptionId
      ) {
        metadata.previousTrialSubscriptionId =
          currentSubscription.stripeSubscriptionId;
        metadata.isUpgradeFromTrial = "true";
      }

      // Prepare session params
      const sessionParams = {
        mode: "subscription",
        subscription_data: {
          items: [
            {
              plan: stripe_monthly_subscription_price_id,
              quantity: 1,
            },
          ],
          metadata,
        },
        metadata,
        success_url: redirectUrl,
        cancel_url: redirectUrl,
        customer: customerId,
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      await this.#sendEmailToNotifyUser({
        amount: session.amount_total / 100,
        email: currentUser.email,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        url: session.url,
        type: "Payment Request",
      });

      return { success: true, url: session.url };
    } catch (error) {
      console.error("Error starting subscription session:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  // Generate Billing Portal Link (user cancels via Stripe UI)
  static async getBillingPortal({ userId, return_url }) {
    try {
      const sub = await usersSubscriptionCollection.findOne({ userId });

      if (!sub || !sub.stripeCustomerId) {
        throw new Error("Customer not found");
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url,
      });

      return { success: true, url: portalSession.url };
    } catch (error) {
      console.error("Error generating billing portal:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async addOneTimeCarge({
    userId,
    amount,
    description = "One-time charge",
  }) {
    try {
      const sub = await usersSubscriptionCollection.findOne({ userId });

      if (!sub || !sub.stripeCustomerId) {
        throw new Error(`Customer not found`);
      }

      const invoiceItem = await stripe.invoiceItems.create({
        customer: sub.stripeCustomerId,
        amount: amount,
        currency: "usd",
        description,
      });

      return { success: true, invoiceItem };
    } catch (error) {
      console.error("Error adding one-time charge:", error);
      throw new Error(
        `Failed to create charge: ${error.message || "Unknown error"}`
      );
    }
  }

  static async listPendingCharges({ userId }) {
    try {
      const sub = await usersSubscriptionCollection.findOne({ userId });

      if (!sub || !sub.stripeCustomerId) {
        throw new Error("Customer not found");
      }

      const invoices = await stripe.invoices.list({
        customer: sub.stripeCustomerId,
        subscription: sub.stripeSubscriptionId,
        pending: true,
      });

      return invoices.data;
    } catch (error) {
      console.error("Error listing pending charges:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async updateSubscriptionPrice({ userId, newAmount }) {
    try {
      const sub = await usersSubscriptionCollection.findOne({ userId });

      if (!sub || !sub.stripeSubscriptionId) {
        throw new Error("Active subscription not found");
      }

      const subscription = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId
      );
      const subscriptionItem = subscription.items.data[0];

      const updatedItem = await stripe.subscriptionItems.update(
        subscriptionItem.id,
        {
          price_data: {
            currency: "usd",
            product: subscriptionItem.price.product,
            unit_amount: Math.round(+newAmount * 100), // Stripe expects cents
            recurring: { interval: "month" }, // must match original
          },
          proration_behavior: "create_prorations",
        }
      );

      // Re-fetch the full subscription and sync the local row so the
      // displayed subscriptionPrice matches the new Stripe price.
      const refreshed = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId
      );
      await new StripeSubscriptionWebhookService(
        stripe,
        checkwriter_product_id
      ).updateSubscriptionInDatabase(refreshed);

      return { success: true, updatedItem };
    } catch (error) {
      console.error("Error updating subscription price:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async listCustomerPaymentMethods(userId) {
    const subDoc = await usersSubscriptionCollection.findOne({ userId })
  if (!subDoc?.stripeCustomerId) return { hasStripeCustomer: false, paymentMethods: [] }

  const customer = await stripe.customers.retrieve(subDoc.stripeCustomerId)
  const defaultPm =
    typeof customer?.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer?.invoice_settings?.default_payment_method?.id || null

  const { data } = await stripe.paymentMethods.list({
    customer: subDoc.stripeCustomerId,
    type: 'card',
  })

  const paymentMethods = data.map(pm => ({
    id: pm.id,
    brand: pm.card?.brand,
    last4: pm.card?.last4,
    exp_month: pm.card?.exp_month,
    exp_year: pm.card?.exp_year,
    isDefault: pm.id === defaultPm,
  }))

  return { hasStripeCustomer: true, paymentMethods }
  }

  static async chargeChecksNowWithInvoice({ userId, checks, paymentMethodId }) {
    if (!Array.isArray(checks) || checks.length === 0) {
      return { success: false, error: "No checks to bill." };
    }

    const sub = await usersSubscriptionCollection.findOne({ userId });
    if (!sub) return { success: false, error: "Stripe customer not found" };

    const customerId = sub.stripeCustomerId;

    if (!customerId)
      return { success: false, error: "Stripe customer not found" };

    // retrieve payment methid
    const customer = await stripe.customers.retrieve(customerId);
    let pmId =
      paymentMethodId ||
      customer?.invoice_settings?.default_payment_method ||
      null;

    if (!pmId) {
      const list = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });
      pmId = list?.data?.[0]?.id || null;
    }
    if (!pmId) {
      return {
        success: false,
        error: "No payment method on file. Please add a card.",
      };
    }

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "charge_automatically",
      auto_advance: false,
      default_payment_method: pmId,
      metadata: {
        userId: String(userId),
        reason: "mailed_checks_charges",
      },
    });

    // add invoice items
    for (const chk of checks) {
      const amountInCents = Math.round(Number(chk.chargeAmount) * 100);
      if (!Number.isFinite(amountInCents) || amountInCents <= 0) continue;

      const description = chk?.orgName
        ? `Check Mailing [${chk.orgName}] : ${chk?.checkNumber ?? ""}`.trim()
        : `Check Mailing : ${chk?.checkNumber ?? ""}`.trim();

      await stripe.invoiceItems.create({
        customer: customerId,
        amount: amountInCents,
        currency: "usd",
        description,
        invoice: invoice.id,
        metadata: {
          checkId: String(chk._id),
          userId: String(userId),
        },
      });
    }

    // Finalize
    let finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    // If, finalize failed to charge, try to pay again.
    if (finalized.status !== "paid") {
      try {
        finalized = await stripe.invoices.pay(finalized.id, {
          payment_method: pmId,
        });
      } catch (err) {
        await stripe.invoices.voidInvoice(finalized.id);
        return {
          success: false,
          error: err.message || "Invoice payment failed",
          invoiceId: invoice.id,
        };
      }
    }

    return { success: true, invoiceId: finalized.id };
  }

  static async retrieveStripeSubscription(stripeSubscriptionId) {
    return await stripe.subscriptions.retrieve(stripeSubscriptionId);
  }

  static async updateTrialEndDate({ userId, newTrialEndDate }) {
    try {
      const subscription = await usersSubscriptionCollection.findOne({
        userId,
      });

      if (
        !subscription ||
        (!subscription.stripeSubscriptionId && !subscription.stripeCustomerId)
      ) {
        const err = new Error(
          "This user doesn't have a Stripe customer record yet, so a trial can't be set for them. The user needs to sign up for a plan first."
        );
        err.code = "NO_STRIPE_CUSTOMER";
        err.statusCode = 404;
        throw err;
      }

      // If the old subscription was fully removed (e.g. via a
      // customer.subscription.deleted webhook that nulled out
      // stripeSubscriptionId), fall back to creating a fresh trialing
      // subscription for the stored customer.
      const stripeSub = subscription.stripeSubscriptionId
        ? await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
        : { status: "canceled", customer: subscription.stripeCustomerId };

      const now = Date.now();
      const trialEnd = new Date(newTrialEndDate).getTime();
      const msInDay = 24 * 60 * 60 * 1000;
      const diffInDays = (trialEnd - now) / msInDay;
      const trialEndTimestamp = Math.floor(trialEnd / 1000);

      let updatedSubscription;

      if (stripeSub.status === "canceled" || stripeSub.status === "expired") {
        const customerId = stripeSub.customer;

        updatedSubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: stripe_monthly_subscription_price_id }],
          trial_end: diffInDays <= 0 ? "now" : trialEndTimestamp,
          trial_settings: {
            end_behavior: {
              missing_payment_method: "cancel",
            },
          },
          proration_behavior: "create_prorations",
          metadata: {
            userId,
          },
        });
      } else {
        updatedSubscription = await stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            trial_end: diffInDays <= 0 ? "now" : trialEndTimestamp,
            proration_behavior: "create_prorations",
          }
        );
      }

      // Sync the local users_subscriptions row so the UI reflects the new
      // status immediately (same pattern as cancelTrialAtPeriodEnd /
      // reactivateSubscription). This also updates stripeSubscriptionId when
      // a brand-new subscription was created for a canceled user.
      await new StripeSubscriptionWebhookService(
        stripe,
        checkwriter_product_id
      ).updateSubscriptionInDatabase(updatedSubscription);

      return { success: true, updatedSubscription };
    } catch (error) {
      console.error("Error updating trial end date:", error);
      if (error?.code === "NO_STRIPE_CUSTOMER") {
        throw error;
      }
      throw new Error(
        `error: ${error?.message || "Failed to update trial end date"}`
      );
    }
  }

  static async cancelTrialAtPeriodEnd({ userId }) {
    const { stripeSubscriptionId } = await this.#requireStripeSubscriptionId({
      userId,
    });
    const curr = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    if (curr.status !== "trialing") {
      throw new Error("Not currently in trial");
    }
    const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
      proration_behavior: "none",
    });
    await new StripeSubscriptionWebhookService(
      stripe,
      checkwriter_product_id
    ).updateSubscriptionInDatabase(updated);

    return await this.getSubscriptionDetails({ userId });
  }

  static async reactivateSubscription({ userId }) {
    try {
      const { stripeSubscriptionId } = await this.#requireStripeSubscriptionId({
        userId,
      });

      const current = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      if (
        current.status === "canceled" ||
        current.status === "unpaid" ||
        current.status === "incomplete_expired"
      ) {
        throw new Error(
          `Subscription status "${current.status}" cannot be reactivated`
        );
      }

      let updated = current;

      // Case A: custom cancel-at was set → clear it
      if (current.cancel_at) {
        updated = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at: null,
          proration_behavior: "none",
        });
      }
      // Case B: cancel at period end flag → clear it
      else if (current.cancel_at_period_end) {
        updated = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: false,
          proration_behavior: "none",
        });
      }

      await new StripeSubscriptionWebhookService(
        stripe,
        checkwriter_product_id
      ).updateSubscriptionInDatabase(updated);

      return {
        success: true,
        subscription: updated,
      };
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async cancelSubscriptionAtPeriodEnd({ userId }) {
    try {
      const { stripeSubscriptionId } = await this.#requireStripeSubscriptionId({
        userId,
      });

      const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
        proration_behavior: "none",
      });

      await new StripeSubscriptionWebhookService(
        stripe,
        checkwriter_product_id
      ).updateSubscriptionInDatabase(updated);

      return {
        success: true,
        subscription: updated,
      };
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async subscribeNow({ userId }) {
    try {
      const { stripeSubscriptionId, stripeCustomerId } =
        await this.#requireStripeSubscriptionId({ userId });

      const cust = await stripe.customers.retrieve(stripeCustomerId);
      const defaultPm = cust?.invoice_settings?.default_payment_method;
      if (!defaultPm) {
        throw new Error(
          "No default payment method on file. Please add a card first."
        );
      }

      const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
        trial_end: "now",
        proration_behavior: "create_prorations",
      });

      await new StripeSubscriptionWebhookService(
        stripe,
        checkwriter_product_id
      ).updateSubscriptionInDatabase(updated);

      return {
        success: true,
        subscription: updated,
      };
    } catch (error) {
      console.error("Error subscribing now:", error);
      throw new Error(`error: ${error?.message || "Server Error"}`);
    }
  }

  static async createSetupCheckoutSession({ userId, returnUrl }) {
    const user = await this.#getUserInformation({ userId });
    const { id: customerId } = await this.#getOrCreateStripeCustomer(
      user,
      user?.customerId
    );

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: 'auto',        
      phone_number_collection: { enabled: false }, 
      success_url: `${returnUrl}?setup_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?setup_canceled=true`,
    });

    return { success: true, sessionId: session.id, url: session.url };
  }

  static async finalizeSetupCheckoutSession({
    userId,
    sessionId,
    setAsDefault = true,
  }) {
    const user = await this.#getUserInformation({ userId });
    if (!user?.customerId) throw new Error("Stripe customer not found");

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"],
    });
    if (!session?.setup_intent)
      throw new Error("No setup intent found on session");

    const setupIntentId =
      typeof session.setup_intent === "string"
        ? session.setup_intent
        : session.setup_intent.id;
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    const paymentMethodId = setupIntent.payment_method;
    if (!paymentMethodId)
      throw new Error("No payment method created in setup intent");

    // Attach PM if it’s not attached already
    await stripe.paymentMethods
      .attach(paymentMethodId, { customer: user.customerId })
      .catch((err) => {
        if (!String(err?.message || "").includes("already exists")) throw err;
      });

    if (setAsDefault) {
      await stripe.customers.update(user.customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      // if there’s an active subscription, also set default on sub
      const subDoc = await usersSubscriptionCollection.findOne({ userId });
      if (subDoc?.stripeSubscriptionId) {
        await stripe.subscriptions.update(subDoc.stripeSubscriptionId, {
          default_payment_method: paymentMethodId,
          proration_behavior: "none",
        });
      }
    }

    // Return normalized PM summary
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    return {
      success: true,
      paymentMethod: {
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        exp_month: pm.card?.exp_month,
        exp_year: pm.card?.exp_year,
        isDefault: !!setAsDefault,
      },
    };
  }

  static async verifyPaymentMethodForTrial({ userId, paymentMethodId }) {
  const user = await this.#getUserInformation({ userId });
  const { id: customerId } = await this.#getOrCreateStripeCustomer(user, user?.customerId);

  if (!paymentMethodId) {
    throw new Error('No payment method provided.');
  }

  const priceForHold = 100; 

  let intent;
  try {
    intent = await stripe.paymentIntents.create(
      {
        amount: priceForHold,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        off_session: true,
        capture_method: 'manual', 
        description: 'Trial verification (auth-only)',
        metadata: {
          purpose: 'trial_verification',
          userId: String(userId),
          customerId,
          paymentMethodId,
        },
      },
    );
  } catch (err) {
    const code = err?.raw?.code || err?.code;
    if (code === 'authentication_required' || code === 'card_requires_authentication') {
      throw new Error(
        'Your bank requires additional authentication for this card. Please add or verify the card in-app and try again.'
      );
    }
    throw new Error(err?.message || 'Card verification failed. Please try another card.');
  }


  switch (intent.status) {
    case 'requires_capture': {
      // Void the authorization (no Stripe fees)
      await stripe.paymentIntents.cancel(intent.id, {
        cancellation_reason: 'requested_by_customer',
      });
      return { success: true, paymentIntentId: intent.id, status: 'voided' };
    }
    case 'requires_action': {
      throw new Error(
        'Your card needs additional authentication. Please verify your card and try again.'
      );
    }
    case 'requires_payment_method':
    case 'canceled': {
      throw new Error('Card verification failed or was canceled. Please try another card.');
    }
    default: {
      // For any unexpected state, try to cancel if possible.
      try {
        await stripe.paymentIntents.cancel(intent.id, {
          cancellation_reason: 'requested_by_customer',
        });
      } catch (e) {
      }
      throw new Error('Unexpected verification state. Please try again.');
    }
  }
}

  static async createSubscriptionViaApi({
    userId,
    paymentMethodId,
    trialMode,
  }) {
    const user = await this.#getUserInformation({ userId });
    const { id: customerId } = await this.#getOrCreateStripeCustomer(
      user,
      user?.customerId
    );

    if (paymentMethodId) {
      await stripe.paymentMethods
        .attach(paymentMethodId, { customer: customerId })
        .catch(() => {});
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    const subscriptionParams = {
      customer: customerId,
      items: [
        {
          price: config.stripe_subscription.stripe_monthly_subscription_price_id,
          quantity: 1,
        },
      ],
      default_payment_method: paymentMethodId,
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      metadata: {
        userId: String(userId),
        priceId: config.stripe_subscription.stripe_monthly_subscription_price_id,
        type: 'checkwriter_subscription',
      },
    };

    if(trialMode){
      subscriptionParams.trial_period_days = stripe_subscription_trial_period_days;
    }

    const sub = await stripe.subscriptions.create(subscriptionParams);

    await new StripeSubscriptionWebhookService(
      stripe,
      checkwriter_product_id
    ).updateSubscriptionInDatabase(sub);

    return await this.getSubscriptionDetails({ userId });
  }

  static async deletePaymentMethod({ userId, paymentMethodId }) {
    const subDoc = await usersSubscriptionCollection.findOne({ userId });
    if (!subDoc?.stripeCustomerId) throw new Error("Stripe customer not found");

    const customer = await stripe.customers.retrieve(subDoc.stripeCustomerId);
    const defaultPm =
      typeof customer?.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : customer?.invoice_settings?.default_payment_method?.id || null;

    // Guard: do not allow deleting default PM if there’s an active/incomplete subscription
    const activeStatuses = ["trialing", "active", "past_due", "incomplete"];
    if (defaultPm === paymentMethodId && subDoc?.stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(
        subDoc.stripeSubscriptionId
      );
      if (activeStatuses.includes(sub.status)) {
        throw new Error(
          "This card is the default for an active subscription. Please choose another default first."
        );
      }
    }

    await stripe.paymentMethods.detach(paymentMethodId);
    return { success: true };
  }

  static async updateSubscriptionDefaultPaymentMethod({ userId, paymentMethodId }) {
  const subDoc = await usersSubscriptionCollection.findOne({ userId })
  if (!subDoc?.stripeCustomerId) throw new Error('Stripe customer not found')

  await stripe.paymentMethods.attach(paymentMethodId, { customer: subDoc.stripeCustomerId }).catch(() => {})
  await stripe.customers.update(subDoc.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  if (subDoc?.stripeSubscriptionId) {
    const updated = await stripe.subscriptions.update(subDoc.stripeSubscriptionId, {
      default_payment_method: paymentMethodId,
      proration_behavior: 'none',
    })
  }

  return { success: true }
}

  // Handle webhook events
  static async handleWebhookEvent({ body, sig }) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        stripe_subscription_webhook_endpoint_secret
      );
    } catch (err) {
      console.error(err.message);
      const sigError = new Error(`Webhook signature verification failed: ${err?.message || "Server Error"}`);
      sigError.code = 'STRIPE_SIGNATURE_VERIFICATION_FAILED';
      throw sigError;
    }

    const stripeWebhook = new StripeSubscriptionWebhookService(
      stripe,
      checkwriter_product_id
    );

    const result = await stripeWebhook.handleWebhookEvent(event);
    return result;
  }

  static async listCustomerCharges({ stripeCustomerId, limit = 100 }) {
    try {
      if (!stripeCustomerId) {
        throw new Error("Stripe customer ID is required");
      }

      const charges = await stripe.charges.list({
        customer: stripeCustomerId,
        limit,
      });

      return charges.data.map((charge) => ({
        id: charge.id,
        amount: charge.amount / 100,
        amountRefunded: charge.amount_refunded / 100,
        currency: charge.currency,
        status: charge.status,
        refunded: charge.refunded,
        description: charge.description || "N/A",
        created: new Date(charge.created * 1000).toISOString(),
        paymentIntentId: charge.payment_intent,
        receiptUrl: charge.receipt_url,
        metadata: charge.metadata,
      }));
    } catch (error) {
      console.error("Error listing customer charges:", error);
      throw new Error(`Failed to list charges: ${error.message || "Unknown error"}`);
    }
  }

  static async createRefund({ chargeId, amount, reason }) {
    try {
      if (!chargeId) {
        throw new Error("Charge ID is required");
      }

      const refundParams = {
        charge: chargeId,
        reason: "requested_by_customer",
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundParams);

      return {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        chargeId: refund.charge,
        reason: reason || refund.reason,
        created: new Date(refund.created * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Error creating refund:", error);
      throw new Error(`Failed to create refund: ${error.message || "Unknown error"}`);
    }
  }
}

export default SubscriptionService;
