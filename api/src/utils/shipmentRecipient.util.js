import { usersCollection, organizationCollection } from '../models/dbCollections.js';

function pickRecipient(user) {
  if (!user) return { email: null, name: null };
  return {
    email: user.email || null,
    name: user.firstName || user.name || null,
  };
}

/**
 * Bulk-resolve the recipient (email + display name) for an array of shipment
 * or mail records. Issues at most two collection lookups in total — one for
 * organizations referenced by the records and one for all of the underlying
 * users — instead of 1–2 queries per record.
 *
 * Returns a Map keyed by `${ownerType}:${ownerId}` so callers can look up the
 * resolved recipient for each input record.
 */
export async function resolveShipmentRecipients(records = []) {
  const result = new Map();
  if (!Array.isArray(records) || records.length === 0) return result;

  const userOwnerIds = new Set();
  const orgOwnerIds = new Set();

  for (const r of records) {
    if (!r?.ownerId || !r?.ownerType) continue;
    if (r.ownerType === 'user') userOwnerIds.add(r.ownerId.toString());
    else if (r.ownerType === 'organization') orgOwnerIds.add(r.ownerId.toString());
  }

  const orgIdToUserId = new Map();
  if (orgOwnerIds.size > 0) {
    const orgs = await organizationCollection
      .find({ _id: { $in: [...orgOwnerIds] } })
      .select('_id userId')
      .lean();
    for (const org of orgs) {
      if (org?._id && org?.userId) {
        orgIdToUserId.set(org._id.toString(), org.userId.toString());
        userOwnerIds.add(org.userId.toString());
      }
    }
  }

  const userMap = new Map();
  if (userOwnerIds.size > 0) {
    const users = await usersCollection
      .find({ _id: { $in: [...userOwnerIds] } })
      .select('_id email firstName name')
      .lean();
    for (const u of users) {
      if (u?._id) userMap.set(u._id.toString(), u);
    }
  }

  for (const r of records) {
    if (!r?.ownerId || !r?.ownerType) continue;
    const key = `${r.ownerType}:${r.ownerId}`;
    if (r.ownerType === 'user') {
      result.set(key, pickRecipient(userMap.get(r.ownerId.toString())));
    } else if (r.ownerType === 'organization') {
      const userId = orgIdToUserId.get(r.ownerId.toString());
      result.set(key, pickRecipient(userId ? userMap.get(userId) : null));
    } else {
      result.set(key, { email: null, name: null });
    }
  }

  return result;
}

/**
 * Convenience wrapper for the single-record case (typically a webhook
 * processing one shipment). Internally batches against the same code path.
 */
export async function resolveShipmentRecipient(ownerType, ownerId) {
  const map = await resolveShipmentRecipients([{ ownerType, ownerId }]);
  return map.get(`${ownerType}:${ownerId}`) || { email: null, name: null };
}
