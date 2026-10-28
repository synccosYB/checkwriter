import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import config from 'config';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { SubscriptionService, stripe } from '../stripe.service.js';
import { StripeSubscriptionWebhookService } from '../stripeWebhook.service.js';
import { usersCollection, usersSubscriptionCollection, StripeCustomersCollection,
  StripeSubscriptionsCollection } from '../../models/dbCollections.js';

const product = config.stripe_subscription.checkwriter_product_id;
const service = () => new StripeSubscriptionWebhookService(stripe, product);
const now = Math.floor(Date.now() / 1000);
const sub = (extra = {}) => ({
  id: 'sub_new', customer: 'cus_1', status: 'active', created: now,
  current_period_start: now - 10, current_period_end: now + 86400,
  cancel_at_period_end: false, trial_end: null, canceled_at: null,
  metadata: { userId: 'u1' },
  items: { data: [{ price: { product, unit_amount: 1499, currency: 'usd' } }] },
  ...extra,
});
function query(value) {
  const p = Promise.resolve(value);
  p.lean = () => p;
  p.select = () => p;
  return p;
}
let row, writes;
function setup(initial = null) {
  row = initial; writes = [];
  mock.method(usersCollection, 'findOne', ({ _id }) => query(
    _id === 'u1' ? { _id: 'u1', email: 'payer@example.test', firstName: 'Test', lastName: 'User' } : null
  ));
  mock.method(usersSubscriptionCollection, 'findOne', (filter) => query(row &&
    Object.entries(filter).every(([key, value]) => typeof value === 'object'
      ? row[key] != null : row[key] === value) ? row : null));
  mock.method(usersSubscriptionCollection, 'findOneAndUpdate', (filter, update) => {
    writes.push({ filter, update });
    row = { ...row, ...filter, ...update.$set };
    return query(row);
  });
  mock.method(StripeCustomersCollection, 'findOne', () => query(null));
  mock.method(StripeCustomersCollection, 'findOneAndUpdate', async () => null);
  mock.method(StripeSubscriptionsCollection, 'updateOne', async () => ({}));
  mock.method(mailchimp.lists, 'setListMember', async () => ({ status: 'subscribed' }));
  mock.method(mailchimp.lists, 'getListMemberTags', async () => ({ tags: [] }));
  mock.method(mailchimp.lists, 'updateListMemberTags', async () => ({}));
  mock.method(stripe.customers, 'list', async () => ({ data: [{ id: 'cus_1' }] }));
  mock.method(stripe.subscriptions, 'list', async () => ({ data: [sub()] }));
  mock.method(stripe.subscriptions, 'retrieve', async () => sub());
  mock.method(stripe.prices, 'retrieve', async () => ({ unit_amount: 1499 }));
  for (const method of ['create', 'update', 'cancel', 'del']) {
    mock.method(stripe.subscriptions, method, async () => { throw new Error('Unexpected Stripe mutation'); });
  }
}
test.afterEach(() => mock.restoreAll());

test('refresh recovers a missing user-linked row without a manual override', async () => {
  setup();
  await SubscriptionService.refreshSubscription({ userId: 'u1' });
  assert.equal(row.userId, 'u1');
  assert.equal(row.stripeSubscriptionId, 'sub_new');
  assert.equal(row.fullAccessOverrideEnabled, undefined);
  assert.equal((await SubscriptionService.getSubscriptionDetails({ userId: 'u1' })).isSubscribed, true);
});
test('refresh replaces a canceled stored subscription with the new paid one', async () => {
  setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_old', status: 'canceled' });
  stripe.subscriptions.retrieve = async () => sub({ id: 'sub_old', status: 'canceled', created: now - 100 });
  await SubscriptionService.refreshSubscription({ userId: 'u1' });
  assert.equal(row.stripeSubscriptionId, 'sub_new');
  assert.equal(row.status, 'active');
});
test('refresh reports missing subscriptions instead of success', async () => {
  setup(); stripe.customers.list = async () => ({ data: [] });
  await assert.rejects(SubscriptionService.refreshSubscription({ userId: 'u1' }), /No subscription found/);
  assert.equal(writes.length, 0);
});
test('refresh refuses ambiguous paying subscriptions', async () => {
  setup(); stripe.subscriptions.list = async () => ({ data: [sub(), sub({ id: 'sub_other' })] });
  await assert.rejects(SubscriptionService.refreshSubscription({ userId: 'u1' }), /Multiple subscriptions/);
  assert.equal(writes.length, 0);
});
test('lookup paginates customers and subscriptions', async () => {
  setup();
  stripe.customers.list = async ({ starting_after }) => starting_after
    ? { data: [{ id: 'cus_2' }] } : { data: [{ id: 'cus_1' }], has_more: true };
  stripe.subscriptions.list = async ({ customer, starting_after }) => customer === 'cus_1'
    ? { data: [] } : starting_after ? { data: [sub({ customer: 'cus_2' })] }
      : { data: [sub({ id: 'sub_canceled', status: 'canceled' })], has_more: true };
  assert.equal((await SubscriptionService.findStripeSubscriptionByEmail({ email: 'payer@example.test' })).customer, 'cus_2');
});
test('webhook metadata creates a user-linked record', async () => {
  setup(); await service().updateSubscriptionInDatabase(sub());
  assert.equal(writes[0].filter.userId, 'u1');
  assert.equal(row.stripeCustomerId, 'cus_1');
});
test('webhook refuses ownerless records', async () => {
  setup(); await assert.rejects(service().updateSubscriptionInDatabase(sub({ metadata: {} })), /no linked user/);
  assert.equal(writes.length, 0);
});
test('refresh cannot take a customer already linked to another user', async () => {
  setup({ userId: 'someone_else', stripeCustomerId: 'cus_1' });
  await assert.rejects(service().updateSubscriptionInDatabase(sub(), { userId: 'u1' }), /different user/);
  assert.equal(writes.length, 0);
});
test('item-level periods and expanded product are supported', async () => {
  setup(); const value = sub();
  delete value.current_period_start; delete value.current_period_end;
  Object.assign(value.items.data[0], { current_period_start: now - 10, current_period_end: now + 86400 });
  value.items.data[0].price.product = { id: product };
  await service().updateSubscriptionInDatabase(value);
  assert.equal(row.currentPeriodEnd.getTime(), (now + 86400) * 1000);
});
for (const status of ['past_due', 'unpaid', 'canceled']) {
  test(`failed renewal reconciles ${status} and removes paid access`, async () => {
    setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_new', status: 'active' });
    stripe.subscriptions.retrieve = async () => sub({ status });
    await service().handleWebhookEvent({ type: 'invoice.payment_failed', data: { object: {
      customer: 'cus_1', parent: { subscription_details: { subscription: 'sub_new' } }, status: 'open',
    } } });
    assert.equal(row.status, status);
    const info = await SubscriptionService.getSubscriptionDetails({ userId: 'u1' });
    assert.equal(info.isSubscribed, false); assert.equal(info.isActive, false);
  });
}
test('late event retrieves current status instead of restoring stale access', async () => {
  setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_new' });
  stripe.subscriptions.retrieve = async () => sub({ status: 'past_due' });
  await service().handleWebhookEvent({ type: 'customer.subscription.updated', data: { object: sub() } });
  assert.equal(row.status, 'past_due');
});
test('old trial cancellation cannot overwrite a newer paid subscription', async () => {
  setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_new', status: 'active' });
  await service().updateSubscriptionInDatabase(sub({ id: 'sub_old', status: 'canceled', created: now - 100 }));
  assert.equal(writes.length, 0); assert.equal(row.status, 'active');
});
test('stale active row stops granting access when its paid period ends', async () => {
  setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_new', status: 'active', currentPeriodEnd: new Date((now - 1) * 1000) });
  assert.equal((await SubscriptionService.getSubscriptionDetails({ userId: 'u1' })).isSubscribed, false);
});
test('manual override remains explicit; disabling it restores billing-based access', async () => {
  setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_new', fullAccessOverrideEnabled: true });
  await service().updateSubscriptionInDatabase(sub({ status: 'past_due' }));
  assert.equal(row.fullAccessOverrideEnabled, true);
  row.fullAccessOverrideEnabled = false;
  assert.equal((await SubscriptionService.getSubscriptionDetails({ userId: 'u1' })).isSubscribed, false);
});


test('late creation of a canceled plan cannot cancel the current paid plan', async () => {
  setup({ userId: 'u1', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_new', status: 'active' });
  stripe.subscriptions.retrieve = async (id) => id === 'sub_old'
    ? sub({ id, status: 'canceled', created: now - 100 }) : sub();
  await service().handleWebhookEvent({ type: 'customer.subscription.created', data: { object: sub({ id: 'sub_old' }) } });
  assert.equal(row.status, 'active');
  assert.equal(writes.length, 0);
});
