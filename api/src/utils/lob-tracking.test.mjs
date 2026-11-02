import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyLobSignature, normalizeLobEvents, lobStatusFromEvents } from './lob-tracking.js';

const now = 1793638800000;
const secret = 'test-only-signing-key';
function signed(body = '{"body":{"id":"ltr_test"}}', timestamp = String(now / 1000)) {
  return { rawBody: body, headers: {
    'lob-signature-timestamp': timestamp,
    'lob-signature': crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex'),
  } };
}
test('accepts Lob timestamp + raw body signature, including millisecond timestamps', () => {
  assert.equal(verifyLobSignature(signed(), secret, now), true);
  assert.equal(verifyLobSignature(signed(undefined, String(now)), secret, now), true);
});
test('rejects altered body, wrong key, malformed/missing signature and old/future requests', () => {
  assert.equal(verifyLobSignature({ ...signed(), rawBody: '{}' }, secret, now), false);
  assert.equal(verifyLobSignature(signed(), 'wrong', now), false);
  assert.equal(verifyLobSignature(signed(), '', now), false);
  for (const sig of [undefined, 'abc', 'z'.repeat(64), ['a'.repeat(64)]]) {
    const req = signed(); req.headers['lob-signature'] = sig;
    assert.equal(verifyLobSignature(req, secret, now), false);
  }
  assert.equal(verifyLobSignature(signed(), secret, now + 301000), false);
  assert.equal(verifyLobSignature(signed(), secret, now - 301000), false);
  const req = signed(); delete req.headers['lob-signature-timestamp'];
  assert.equal(verifyLobSignature(req, secret, now), false);
});
test('normalizes actual tracking_events and sorts USPS times newest first', () => {
  const events = normalizeLobEvents({ id: 'ltr_test', date_created: '2026-11-01T00:00:00Z', tracking_events: [
    { id: 'evnt_1', name: 'Mailed', time: '2026-11-02T00:00:00Z' },
    { id: 'evnt_2', name: 'In Transit', time: '2026-11-03T00:00:00Z' },
  ] });
  assert.deepEqual(events.map(e => e.event_type), ['letter.in_transit', 'letter.mailed', 'letter.created']);
  assert.equal(lobStatusFromEvents(events), 'Processing');
});
test('retains webhook events, ignores malformed dates and deduplicates replayed events', () => {
  const webhook = { id: 'evt_1', event_type: { id: 'letter.billed' }, date_created: '2026-11-02T00:00:00Z' };
  const events = normalizeLobEvents({}, [], webhook);
  assert.deepEqual(normalizeLobEvents({}, events, webhook), events);
  assert.equal(normalizeLobEvents({}, [{ event_type: 'letter.failed', date_created: 'invalid' }]).length, 0);
  assert.equal(lobStatusFromEvents(events), 'Processing');
});
test('delayed creation event cannot hide delivery and rendered events cannot downgrade status', () => {
  const events = normalizeLobEvents({ tracking_events: [{ name: 'Delivered', time: '2026-11-03T00:00:00Z' }] }, [],
    { event_type: { id: 'letter.created' }, date_created: '2026-11-01T00:00:00Z' });
  assert.equal(lobStatusFromEvents(events), 'Mailed');
  assert.equal(lobStatusFromEvents([{ event_type: 'letter.rendered_pdf' }], 'Mailed'), 'Mailed');
});
test('maps certified, failure, return, cancellation and re-routing events', () => {
  for (const [type, status] of Object.entries({
    'letter.certified.delivered': 'Mailed', 'letter.failed': 'Error',
    'letter.returned_to_sender': 'Error', 'letter.deleted': 'Canceled', 'letter.re_routed': 'Processing',
  })) assert.equal(lobStatusFromEvents([{ event_type: type }]), status);
  assert.equal(normalizeLobEvents({}, [], { event_type: { id: 'letter.re-routed' }, date_created: '2026-11-02' })[0].event_type, 'letter.re_routed');
});
