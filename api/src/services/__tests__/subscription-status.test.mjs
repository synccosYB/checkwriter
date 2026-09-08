import test from 'node:test';
import assert from 'node:assert/strict';
import config from 'config';

import { SubscriptionService, stripe } from '../stripe.service.js';
import {
  auditLogsCollection,
  usersCollection,
  usersSubscriptionCollection,
} from '../../models/dbCollections.js';
import { adminSetFullAccessOverride } from '../admin.service.js';
import { db, usersSubscriptions } from '../../db/index.js';

const PRODUCT_ID = config.stripe_subscription.checkwriter_product_id;
const PRICE_ID = config.stripe_subscription.stripe_monthly_subscription_price_id;

const DAY = 24 * 60 * 60 * 1000;

function thenable(doc) {
  const p = Promise.resolve(doc);
  p.lean = () => Promise.resolve(doc);
  return p;
}

function stripeSub({
  id = 'sub_test',
  customer = 'cus_test',
  status = 'active',
  trialEnd = null,
  periodStart = Math.floor((Date.now() - DAY) / 1000),
  periodEnd = Math.floor((Date.now() + 30 * DAY) / 1000),
  cancelAtPeriodEnd = false,
  canceledAt = null,
} = {}) {
  return {
    id,
    customer,
    status,
    trial_end: trialEnd,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
    canceled_at: canceledAt,
    items: {
      data: [{ price: { product: PRODUCT_ID, unit_amount: 1000, id: PRICE_ID } }],
    },
  };
}

// ---- shared mock state ----
let subRow; // row returned by usersSubscriptionCollection.findOne
let dbWrites; // capture of findOneAndUpdate calls

const origSubFindOne = usersSubscriptionCollection.findOne;
const origSubFindOneAndUpdate = usersSubscriptionCollection.findOneAndUpdate;
const origUserFindOne = usersCollection.findOne;
const origUserFindById = usersCollection.findById;
const origAuditCreate = auditLogsCollection.create;
const origDbTransaction = db.transaction;
const origSubsRetrieve = stripe.subscriptions.retrieve;
const origSubsList = stripe.subscriptions.list;
const origSubsCreate = stripe.subscriptions.create;
const origSubsUpdate = stripe.subscriptions.update;
const origPricesRetrieve = stripe.prices.retrieve;

function installMocks() {
  dbWrites = [];
  usersSubscriptionCollection.findOne = () => thenable(subRow);
  usersSubscriptionCollection.findOneAndUpdate = (filter, update, opts) => {
    dbWrites.push({ filter, update, opts });
    // simulate the write landing on the row the UI reads
    if (subRow && update?.$set) Object.assign(subRow, update.$set);
    return thenable(subRow);
  };
  usersCollection.findOne = () => thenable(null); // short-circuits mailchimp
  stripe.prices.retrieve = async () => ({ unit_amount: 1000 });
}

function restoreMocks() {
  usersSubscriptionCollection.findOne = origSubFindOne;
  usersSubscriptionCollection.findOneAndUpdate = origSubFindOneAndUpdate;
  usersCollection.findOne = origUserFindOne;
  usersCollection.findById = origUserFindById;
  auditLogsCollection.create = origAuditCreate;
  db.transaction = origDbTransaction;
  stripe.subscriptions.retrieve = origSubsRetrieve;
  stripe.subscriptions.list = origSubsList;
  stripe.subscriptions.create = origSubsCreate;
  stripe.subscriptions.update = origSubsUpdate;
  stripe.prices.retrieve = origPricesRetrieve;
}

test.afterEach(() => restoreMocks());

// ---------- getSubscriptionDetails status text ----------

test('trialing row with future trial end shows "Trial Ends in N Days"', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'trialing',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() + 10 * DAY),
    currentPeriodEnd: new Date(Date.now() + 10 * DAY),
    subscriptionPrice: { price: 10 },
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.match(d.subscriptionStatusText, /^Trial Ends in \d+ Days$/);
  assert.equal(d.isTrialPeriod, true);
  assert.equal(d.subscriptionMode, 'trial');
  assert.notEqual(d.subscriptionStatusText, 'Canceled');
});

test('active subscription shows "Active"', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'active',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    currentPeriodEnd: new Date(Date.now() + 20 * DAY),
    subscriptionPrice: { price: 10 },
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.subscriptionStatusText, 'Active');
  assert.equal(d.subscriptionMode, 'subscribed');
});

test('canceled subscription shows "Canceled"', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'canceled',
    stripeSubscriptionId: null,
    stripeCustomerId: 'cus_1',
    currentPeriodEnd: null,
    cancelDate: new Date(Date.now() - 5 * DAY),
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.subscriptionStatusText, 'Canceled');
  assert.equal(d.subscriptionMode, 'canceled');
});

test('trialing row with expired trial end shows "Canceled"', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'trialing',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() - 2 * DAY),
    currentPeriodEnd: new Date(Date.now() - 2 * DAY),
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.subscriptionStatusText, 'Canceled');
  assert.equal(d.subscriptionMode, 'canceled');
});

test('active with cancel_at_period_end keeps access and is marked scheduleToCancel', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'active',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    currentPeriodEnd: new Date(Date.now() + 15 * DAY),
    cancelAtPeriodEnd: true,
    subscriptionPrice: { price: 10 },
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  // While the current period is still paid-for, the status text remains
  // "Active" (isSubscribed wins) but the mode flags the pending cancellation.
  assert.equal(d.subscriptionStatusText, 'Active');
  assert.equal(d.isScheduledToCancel, true);
  assert.equal(d.subscriptionMode, 'scheduleToCancel');
});

test('no subscription row shows "No Subscription"', async () => {
  subRow = null;
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.subscriptionStatusText, 'No Subscription');
  assert.equal(d.subscriptionMode, 'no_subscription');
});

test('manual override grants subscribed access while preserving Stripe state', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'trialing',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() + 10 * DAY),
    currentPeriodEnd: new Date(Date.now() + 10 * DAY),
    fullAccessOverrideEnabled: true,
    fullAccessOverrideReason: 'Customer recovery',
    fullAccessOverrideUpdatedAt: new Date(),
    fullAccessOverrideUpdatedBy: 'admin1',
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.isSubscribed, true);
  assert.equal(d.subscriptionStatusText, 'Manual Full Access');
  assert.equal(d.subscriptionMode, 'manual_access');
  assert.equal(d.underlyingSubscriptionStatus, 'trialing');
  assert.equal(d.fullAccessOverride.reason, 'Customer recovery');
});

test('disabled manual override immediately returns to underlying trial access', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'trialing',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() + 10 * DAY),
    currentPeriodEnd: new Date(Date.now() + 10 * DAY),
    fullAccessOverrideEnabled: false,
  };
  installMocks();
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.isSubscribed, false);
  assert.equal(d.isTrialPeriod, true);
  assert.match(d.subscriptionStatusText, /^Trial Ends in \d+ Days$/);
});

for (const existingStripeState of [
  null,
  {
    _id: 'row1',
    userId: 'u1',
    status: 'active',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    fullAccessOverrideEnabled: false,
  },
]) {
  test(`admin can enable and disable manual access ${
    existingStripeState ? 'with' : 'without'
  } Stripe data and each change is audited`, async () => {
    subRow = existingStripeState ? { ...existingStripeState } : null;
    installMocks();
    usersCollection.findById = () => thenable({ _id: 'u1' });
    const audits = [];
    const writes = [];
    const fakeTransaction = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => (subRow ? [subRow] : []),
          }),
        }),
      }),
      update: () => ({
        set: (update) => ({
          where: async () => {
            writes.push(update);
            Object.assign(subRow, update);
            return [subRow];
          },
        }),
      }),
      insert: (table) => ({
        values: (entry) => {
          if (table === usersSubscriptions) {
            writes.push(entry);
            subRow = { ...entry };
            return Promise.resolve([subRow]);
          }
          audits.push(entry);
          return { returning: async () => [entry] };
        },
      }),
    };
    db.transaction = async (callback) => callback(fakeTransaction);

    const enabled = await adminSetFullAccessOverride(
      'u1',
      true,
      'Exceptional access',
      'admin1'
    );
    assert.equal(enabled.fullAccessOverride.enabled, true);
    assert.equal(writes[0].userId, existingStripeState ? undefined : 'u1');
    assert.equal(writes[0].fullAccessOverrideEnabled, true);
    assert.equal(writes[0].stripeCustomerId, undefined);
    assert.equal(audits[0].action, 'FULL_ACCESS_OVERRIDE_ENABLED');
    assert.equal(audits[0].newData.reason, 'Exceptional access');
    assert.equal(audits[0].userId, 'admin1');

    const disabled = await adminSetFullAccessOverride(
      'u1',
      false,
      'Exception resolved',
      'admin1'
    );
    assert.equal(disabled.fullAccessOverride.enabled, false);
    assert.equal(writes[1].fullAccessOverrideEnabled, false);
    assert.equal(audits[1].action, 'FULL_ACCESS_OVERRIDE_DISABLED');
    assert.equal(audits[1].oldData.enabled, true);
    assert.equal(audits[1].newData.reason, 'Exception resolved');
  });
}

test('admin manual access override requires a reason', async () => {
  subRow = null;
  installMocks();
  usersCollection.findById = () => thenable({ _id: 'u1' });
  await assert.rejects(
    adminSetFullAccessOverride('u1', true, '   ', 'admin1'),
    (err) => err.statusCode === 400 && /Reason is required/.test(err.message)
  );
});

// ---------- updateTrialEndDate DB sync (the bug) ----------

test('canceled -> trial: creates new Stripe sub, syncs DB row, status becomes Trial', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'canceled',
    stripeSubscriptionId: 'sub_old',
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() - 30 * DAY), // stale expired trial
    currentPeriodEnd: null,
    cancelDate: new Date(Date.now() - 10 * DAY),
  };
  installMocks();

  const trialEnd = Math.floor((Date.now() + 365 * DAY) / 1000);
  stripe.subscriptions.retrieve = async () =>
    stripeSub({ id: 'sub_old', customer: 'cus_1', status: 'canceled' });
  let created;
  stripe.subscriptions.create = async (params) => {
    created = params;
    return stripeSub({
      id: 'sub_new',
      customer: 'cus_1',
      status: 'trialing',
      trialEnd,
      periodEnd: trialEnd,
    });
  };

  const res = await SubscriptionService.updateTrialEndDate({
    userId: 'u1',
    newTrialEndDate: new Date(Date.now() + 365 * DAY).toISOString(),
  });
  assert.equal(res.success, true);
  assert.ok(created, 'new Stripe subscription should be created');

  // DB row must have been synced with the NEW subscription
  assert.equal(dbWrites.length, 1);
  const $set = dbWrites[0].update.$set;
  assert.equal(dbWrites[0].filter.stripeCustomerId, 'cus_1');
  assert.equal($set.stripeSubscriptionId, 'sub_new');
  assert.equal($set.status, 'trialing');
  assert.equal($set.isTrialing, true);
  assert.equal($set.isActive, true);
  assert.equal($set.mode, 'trial');
  assert.ok($set.trialEndDate instanceof Date && $set.trialEndDate > new Date());

  // The UI now reads Trial, never Canceled
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.match(d.subscriptionStatusText, /^Trial Ends in \d+ Days$/);
  assert.equal(d.stripeSubscriptionId, 'sub_new');
});

test('removed sub (null stripeSubscriptionId) -> trial: creates new Stripe sub without retrieve, syncs DB', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'canceled',
    stripeSubscriptionId: null, // fully removed by customer.subscription.deleted
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() - 30 * DAY),
    currentPeriodEnd: null,
    cancelDate: new Date(Date.now() - 10 * DAY),
  };
  installMocks();

  const trialEnd = Math.floor((Date.now() + 30 * DAY) / 1000);
  stripe.subscriptions.retrieve = async () => {
    throw new Error('retrieve must not be called when stripeSubscriptionId is null');
  };
  let created;
  stripe.subscriptions.create = async (params) => {
    created = params;
    assert.equal(params.customer, 'cus_1');
    return stripeSub({
      id: 'sub_new',
      customer: 'cus_1',
      status: 'trialing',
      trialEnd,
      periodEnd: trialEnd,
    });
  };

  const res = await SubscriptionService.updateTrialEndDate({
    userId: 'u1',
    newTrialEndDate: new Date(Date.now() + 30 * DAY).toISOString(),
  });
  assert.equal(res.success, true);
  assert.ok(created, 'new Stripe subscription should be created');

  assert.equal(dbWrites.length, 1);
  const $set = dbWrites[0].update.$set;
  assert.equal($set.stripeSubscriptionId, 'sub_new');
  assert.equal($set.status, 'trialing');
  assert.equal($set.isTrialing, true);

  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.match(d.subscriptionStatusText, /^Trial Ends in \d+ Days$/);
  assert.equal(d.stripeSubscriptionId, 'sub_new');
});

test('no stripe ids at all throws a NO_STRIPE_CUSTOMER 404 error', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'canceled',
    stripeSubscriptionId: null,
    stripeCustomerId: null,
  };
  installMocks();
  await assert.rejects(
    SubscriptionService.updateTrialEndDate({
      userId: 'u1',
      newTrialEndDate: new Date(Date.now() + 30 * DAY).toISOString(),
    }),
    (err) => {
      assert.match(err.message, /doesn't have a Stripe customer record/);
      assert.equal(err.code, 'NO_STRIPE_CUSTOMER');
      assert.equal(err.statusCode, 404);
      return true;
    }
  );
});

test('active -> trial extension: updates Stripe sub and syncs DB', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'active',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    currentPeriodEnd: new Date(Date.now() + 5 * DAY),
    subscriptionPrice: { price: 10 },
  };
  installMocks();

  const trialEnd = Math.floor((Date.now() + 30 * DAY) / 1000);
  stripe.subscriptions.retrieve = async () =>
    stripeSub({ id: 'sub_1', customer: 'cus_1', status: 'active' });
  stripe.subscriptions.update = async (id, params) => {
    assert.equal(id, 'sub_1');
    assert.ok(params.trial_end);
    return stripeSub({
      id: 'sub_1',
      customer: 'cus_1',
      status: 'trialing',
      trialEnd,
      periodEnd: trialEnd,
    });
  };

  const res = await SubscriptionService.updateTrialEndDate({
    userId: 'u1',
    newTrialEndDate: new Date(Date.now() + 30 * DAY).toISOString(),
  });
  assert.equal(res.success, true);
  assert.equal(dbWrites.length, 1);
  assert.equal(dbWrites[0].update.$set.status, 'trialing');

  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.match(d.subscriptionStatusText, /^Trial Ends in \d+ Days$/);
});

test('trial -> paid: webhook sync marks row active and status text is Active', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'trialing',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    trialEndDate: new Date(Date.now() + 1 * DAY),
    currentPeriodEnd: new Date(Date.now() + 1 * DAY),
    subscriptionPrice: { price: 10 },
  };
  installMocks();

  const { StripeSubscriptionWebhookService } = await import(
    '../stripeWebhook.service.js'
  );
  await new StripeSubscriptionWebhookService(stripe, PRODUCT_ID)
    .updateSubscriptionInDatabase(
      stripeSub({ id: 'sub_1', customer: 'cus_1', status: 'active', trialEnd: null })
    );

  assert.equal(dbWrites.length, 1);
  assert.equal(dbWrites[0].update.$set.status, 'active');
  // stale trialEndDate must be cleared so it cannot resurface later
  assert.equal(dbWrites[0].update.$set.trialEndDate, null);

  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.subscriptionStatusText, 'Active');
});

for (const eventType of ['invoice.payment_succeeded', 'invoice.paid']) {
  test(`${eventType} retrieves and reconciles the canonical subscription row`, async () => {
    subRow = {
      _id: 'row1',
      userId: 'u1',
      status: 'trialing',
      stripeSubscriptionId: 'sub_1',
      stripeCustomerId: 'cus_1',
      trialEndDate: new Date(Date.now() + DAY),
    };
    installMocks();
    stripe.subscriptions.retrieve = async () =>
      stripeSub({ id: 'sub_1', customer: 'cus_1', status: 'active' });
    stripe.subscriptions.list = async () => ({ data: [] });

    const { StripeSubscriptionWebhookService } = await import(
      '../stripeWebhook.service.js'
    );
    const service = new StripeSubscriptionWebhookService(stripe, PRODUCT_ID);
    await service.handleWebhookEvent({
      type: eventType,
      data: {
        object: {
          subscription: 'sub_1',
          customer: 'cus_1',
          status: 'paid',
          lines: { data: [] },
        },
      },
    });

    assert.equal(dbWrites[0].update.$set.status, 'active');
    assert.equal(dbWrites[0].update.$set.isTrialing, false);
    assert.equal(dbWrites[0].update.$set.trialEndDate, null);
  });
}

test('paid -> canceled: webhook sync marks row canceled and status text is Canceled', async () => {
  subRow = {
    _id: 'row1',
    userId: 'u1',
    status: 'active',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
    currentPeriodEnd: new Date(Date.now() + 10 * DAY),
    subscriptionPrice: { price: 10 },
  };
  installMocks();

  const { StripeSubscriptionWebhookService } = await import(
    '../stripeWebhook.service.js'
  );
  await new StripeSubscriptionWebhookService(stripe, PRODUCT_ID)
    .updateSubscriptionInDatabase(
      stripeSub({
        id: 'sub_1',
        customer: 'cus_1',
        status: 'canceled',
        canceledAt: Math.floor(Date.now() / 1000),
        periodEnd: Math.floor(Date.now() / 1000),
      })
    );

  assert.equal(dbWrites[0].update.$set.status, 'canceled');
  // getSubscriptionDetails path: canceled row -> Canceled. The webhook
  // write set currentPeriodEnd to "now"; cancelDate is set too. Row status
  // canceled dominates over schedule-to-cancel text only when access ended.
  subRow.currentPeriodEnd = null;
  subRow.cancelAtPeriodEnd = false;
  const d = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
  assert.equal(d.subscriptionStatusText, 'Canceled');
});
