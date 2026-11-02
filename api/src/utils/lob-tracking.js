import crypto from 'node:crypto';

// https://help.lob.com/print-and-mail/getting-data-and-results/using-webhooks
export function verifyLobSignature({ headers, rawBody }, secret, now = Date.now()) {
  const signature = headers['lob-signature'];
  const timestamp = headers['lob-signature-timestamp'];
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature) ||
      typeof timestamp !== 'string' || !/^\d+$/.test(timestamp) ||
      (typeof rawBody !== 'string' && !Buffer.isBuffer(rawBody))) return false;
  const value = Number(timestamp);
  // Lob integrations have used both Unix seconds and milliseconds.
  const time = value < 1e12 ? value * 1000 : value;
  if (!Number.isSafeInteger(value) || Math.abs(now - time) > 300_000) return false;
  const expected = crypto.createHmac('sha256', secret)
    .update(timestamp + '.').update(rawBody).digest();
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), expected);
}

export function normalizeLobEvents(letter = {}, savedEvents = [], webhook = null) {
  const candidates = [...savedEvents, ...(letter.events || [])];
  for (const event of letter.tracking_events || []) {
    const name = (event.name || '').toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
    if (name) candidates.push({ id: event.id, event_type: `letter.${name}`,
      date_created: event.time || event.date_created });
  }
  if (letter.date_created) candidates.push({ id: `${letter.id}:created`,
    event_type: 'letter.created', date_created: letter.date_created });
  if (webhook) candidates.push({ id: webhook.id,
    event_type: webhook.event_type?.id || webhook.event_type,
    date_created: webhook.date_created });
  const events = new Map();
  for (const event of candidates) {
    const type = typeof event.event_type === 'string' ? event.event_type.replace('re-routed', 're_routed') : event.event_type?.id;
    if (!type || Number.isNaN(Date.parse(event.date_created))) continue;
    // De-duplicate creation/tracking events fetched both by API and webhook.
    const key = `${type}:${event.date_created}`;
    events.set(key, { id: event.id, event_type: type, date_created: event.date_created });
  }
  return [...events.values()].sort((a, b) => Date.parse(b.date_created) - Date.parse(a.date_created)).slice(0, 100);
}

export function lobStatusFromEvents(events, fallback = 'Submitted') {
  const statuses = {
    mailed: 'Mailed', in_transit: 'Processing', in_local_area: 'Processing',
    processed_for_delivery: 'Mailed', delivered: 'Mailed', re_routed: 'Processing',
    returned_to_sender: 'Error', failed: 'Error', rejected: 'Error',
    deleted: 'Canceled', cancelled: 'Canceled', billed: 'Processing',
    created: 'Submitted',
  };
  for (const event of events) {
    const name = event.event_type.replace(/^letter\.(certified\.)?/, '');
    if (name === 'created' && fallback !== 'Submitted') continue;
    if (statuses[name]) return statuses[name];
  }
  return fallback;
}
