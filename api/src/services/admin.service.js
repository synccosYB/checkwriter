import {
  mailedChecksCollection,
  organizationCollection,
  userToOrganizationCollection,
  usersCollection,
  checksCollection,
  banksCollection,
  payeesCollection,
  transactionsCollection,
  auditLogsCollection,
  platformSettingsCollection,
  attachmentsCollection,
  checkImportCollection,
  StripeCustomersCollection,
  usersSubscriptionCollection,
  plaidAccountDetailsCollection,
  quickBooksAccountDetailsCollection,
} from '../models/dbCollections.js';
import moment from 'moment';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, auditLogs, usersSubscriptions } from '../db/index.js';

export const checkPreRequisitesForBatching = async (req, res) => {
  const { mailCheckIds, batchAllPending } = req.body;

  if (!mailCheckIds?.length && !batchAllPending) {
    return res.status(400).json({
      error: 'Either mailCheckIds or batchAllPending must be provided.',
    });
  }
  if (mailCheckIds && batchAllPending) {
    return res.status(400).json({
      error: 'Provide only one option: mailCheckIds or batchAllPending.',
    });
  }
  return;
};

export const checkPreRequisitesForMailing = (req, res) => {
  const { batchId, markAll, mailCheckIds } = req.body;
};

export const getMailingStats = async ({ status }) => {
  try {
    const filter = {};

    if (status) filter['status'] = status;
    const stat = await mailedChecksCollection.countDocuments(filter);

    return stat;
  } catch (error) {
    throw error;
  }
};

export const getUserIdFromOrganization = async ({ userId }) => {
  try {
    const orgId = userId.toString();

    const org = await organizationCollection.findOne({ _id: orgId });
    if (!org) throw new Error('Organization not found');

    const link = await userToOrganizationCollection.findOne({ organizationId: orgId });
    const primaryUserId = link?.userId || orgId;

    return {
      orgId: primaryUserId.toString(),
      orgName: org.organizationName,
    };
  } catch (error) {
    throw error;
  }
};

export const groupChecksByUserId = async ({ checksToProcess }) => {
  const checksByUser = {};

  for (const check of checksToProcess) {
    let userId = check.ownerId;
    let org = '';

    if (check?.ownerType === 'organization') {
      const { orgId, orgName } = await getUserIdFromOrganization({
        userId: check?.ownerId,
      });
      userId = orgId;
      org = orgName;
    }

    if (!checksByUser[userId]) {
      checksByUser[userId] = [];
    }
    checksByUser[userId].push({
      ...check,
      orgName: check?.ownerType === 'organization' ? org : '',
    });
  }

  return checksByUser;
};


export const getTotalUserStats = async (range) => {
  const now = moment();

  if (range === 'weekly') {
    const startDate = now.clone().startOf('week').subtract(7, 'weeks').startOf('day').toDate();
    const endDate = now.clone().endOf('week').endOf('day').toDate();

    const aggregation = await usersCollection.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: 'week',
              binSize: 1,
              startOfWeek: 'Sun'
            }
          },
          value: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const rawMap = new Map(
      aggregation.map(doc => [
        moment(doc._id).format('YYYY-MM-DD'),
        doc.value
      ])
    );

    const pointer = moment().startOf('week').subtract(7, 'weeks');
    const data = [];

    for (let i = 0; i < 8; i++) {
      const start = pointer.clone();
      const end = start.clone().add(6, 'days');

      const key = start.format('YYYY-MM-DD');
      const value = rawMap.get(key) || 0;
      const prev = i > 0 ? data[i - 1].value : 0;

      const percentChange =
        i > 0
          ? prev === 0
            ? value === 0 ? 0 : 100
            : ((value - prev) / prev) * 100
          : null;

      data.push({
        unit: key,
        label: `${start.format('MMM D')} - ${end.format('MMM D')}`,
        value,
        percentChange: percentChange !== null ? parseFloat(percentChange.toFixed(1)) : null
      });

      pointer.add(1, 'week');
    }

    return data;
  }

  let startDate, endDate, unitType, mongoFormat, momentFormat;

  if (range === 'daily') {
    startDate = now.clone().subtract(29, 'days').startOf('day').toDate();
    endDate = now.clone().endOf('day').toDate();
    unitType = 'day';
    mongoFormat = '%Y-%m-%d';
    momentFormat = 'YYYY-MM-DD';
  } else if (range === 'monthly') {
    startDate = now.clone().subtract(11, 'months').startOf('month').toDate();
    endDate = now.clone().endOf('month').toDate();
    unitType = 'month';
    mongoFormat = '%Y-%m';
    momentFormat = 'YYYY-MM';
  } else {
    startDate = moment('2023-01-01').startOf('year').toDate();
    endDate = now.clone().endOf('year').toDate();
    unitType = 'year';
    mongoFormat = '%Y';
    momentFormat = 'YYYY';
  }

  const aggregation = await usersCollection.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: mongoFormat,
            date: '$createdAt'
          }
        },
        value: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const rawMap = new Map(aggregation.map(doc => [doc._id, doc.value]));

  const pointer = moment(startDate);
  const units = [];

  while (pointer.isSameOrBefore(endDate, unitType)) {
    units.push(pointer.format(momentFormat));
    pointer.add(1, unitType);
  }

  const data = units.map((unit, index) => {
    const value = rawMap.get(unit) || 0;
    const prev = index > 0 ? rawMap.get(units[index - 1]) || 0 : 0;

    const percentChange =
      index > 0
        ? prev === 0
          ? value === 0 ? 0 : 100
          : ((value - prev) / prev) * 100
        : null;

    let label;
    if (range === 'daily') {
      label = moment(unit).format('MMM D');
    } else if (range === 'monthly') {
      label = moment(unit, 'YYYY-MM').format('MMM YYYY');
    } else {
      label = unit;
    }

    return {
      unit,
      value,
      percentChange: percentChange !== null ? parseFloat(percentChange.toFixed(1)) : null,
      label
    };
  });

  return data;
};

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || query.pageSize) || 25));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

const ALLOWED_UPDATE_FIELDS = {
  bank: ['bankName', 'accountType', 'accountName', 'accountNickName', 'country', 'bankPreferences', 'balance', 'status'],
  payee: ['name', 'nickName', 'companyName', 'address1', 'address2', 'city', 'state', 'zip', 'country', 'email', 'phone', 'status'],
  organization: ['organizationName', 'phone', 'address', 'city', 'state', 'zip', 'country', 'status'],
  check: ['memo', 'description', 'tags', 'amount', 'payeeId', 'bankId', 'checkNumber', 'invoiceId', 'status', 'date', 'address1', 'address2', 'city', 'state', 'zip'],
};

function maskBankSensitiveFields(bankObj) {
  const masked = { ...bankObj };
  if (masked.accountNumber) {
    const str = String(masked.accountNumber);
    masked.accountNumber = str.length > 4 ? '****' + str.slice(-4) : '****';
  }
  if (masked.bankRoutingNumber) {
    const str = String(masked.bankRoutingNumber);
    masked.bankRoutingNumber = str.length > 4 ? '****' + str.slice(-4) : '****';
  }
  return masked;
}

function filterAllowedFields(updateData, entityType) {
  const allowed = ALLOWED_UPDATE_FIELDS[entityType];
  if (!allowed) return updateData;
  const filtered = {};
  for (const key of Object.keys(updateData)) {
    if (allowed.includes(key)) filtered[key] = updateData[key];
  }
  return filtered;
}

function buildSort(query, defaultField = 'createdAt') {
  const sortBy = query.sortBy || defaultField;
  const sortOrder = (query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  return { [sortBy]: sortOrder };
}

function buildDateFilter(dateFrom, dateTo, field = 'createdAt') {
  const filter = {};
  if (dateFrom) filter[field] = { ...(filter[field] || {}), $gte: new Date(dateFrom) };
  if (dateTo) filter[field] = { ...(filter[field] || {}), $lte: new Date(dateTo) };
  return filter;
}

export async function createAuditLog({ actorUserId, action, entityType, entityId, oldData = null, newData = null }, transaction = null) {
  const safeEntityId = entityId ? String(entityId).substring(0, 100) : 'system';
  const entry = {
    entityType,
    entityId: safeEntityId,
    ownerId: actorUserId,
    ownerType: 'system',
    action,
    userId: actorUserId,
    oldData,
    newData,
  };
  if (transaction) {
    const [created] = await transaction
      .insert(auditLogs)
      .values({ _id: randomBytes(12).toString('hex'), ...entry })
      .returning();
    return created;
  }
  return auditLogsCollection.create(entry);
}

export async function adminActivateUser(userId, actorUserId) {
  const user = await usersCollection.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const oldData = { isActive: user.isActive };
  await usersCollection.findByIdAndUpdate(userId, { isActive: true });

  await createAuditLog({
    actorUserId,
    action: 'USER_ACTIVATED',
    entityType: 'user',
    entityId: userId,
    oldData,
    newData: { isActive: true },
  });

  return { message: 'User activated successfully' };
}

export async function adminDeactivateUser(userId, actorUserId) {
  const user = await usersCollection.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const oldData = { isActive: user.isActive };
  await usersCollection.findByIdAndUpdate(userId, { isActive: false });

  await createAuditLog({
    actorUserId,
    action: 'USER_DEACTIVATED',
    entityType: 'user',
    entityId: userId,
    oldData,
    newData: { isActive: false },
  });

  return { message: 'User deactivated successfully' };
}

export async function adminSetSubscriptionPriceOverride(userId, priceOverride, actorUserId) {
  const user = await usersCollection.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  if (priceOverride !== null && priceOverride < 0) {
    throw Object.assign(new Error('Price override cannot be negative'), { statusCode: 400 });
  }

  const oldData = { subscriptionPriceOverride: user.subscriptionPriceOverride };
  await usersCollection.findByIdAndUpdate(userId, { subscriptionPriceOverride: priceOverride });

  await createAuditLog({
    actorUserId,
    action: 'SUBSCRIPTION_PRICE_OVERRIDE_SET',
    entityType: 'user',
    entityId: userId,
    oldData,
    newData: { subscriptionPriceOverride: priceOverride },
  });

  return { message: priceOverride !== null ? 'Subscription price override set' : 'Subscription price override cleared', subscriptionPriceOverride: priceOverride };
}

export async function adminSetFullAccessOverride(userId, enabled, reason, actorUserId) {
  const user = await usersCollection.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  if (typeof enabled !== 'boolean') {
    throw Object.assign(new Error('enabled must be a boolean'), { statusCode: 400 });
  }
  const cleanReason = typeof reason === 'string' ? reason.trim() : '';
  if (!cleanReason) {
    throw Object.assign(new Error('Reason is required'), { statusCode: 400 });
  }

  const changedAt = new Date();
  const newData = {
    enabled,
    reason: cleanReason,
    updatedAt: changedAt,
    updatedBy: actorUserId,
  };

  const oldData = await db.transaction(async (transaction) => {
    const [existing] = await transaction
      .select()
      .from(usersSubscriptions)
      .where(eq(usersSubscriptions.userId, userId))
      .limit(1);
    const previous = {
      enabled: Boolean(existing?.fullAccessOverrideEnabled),
      reason: existing?.fullAccessOverrideReason || null,
      updatedAt: existing?.fullAccessOverrideUpdatedAt || null,
      updatedBy: existing?.fullAccessOverrideUpdatedBy || null,
    };
    const update = {
        fullAccessOverrideEnabled: enabled,
        fullAccessOverrideReason: cleanReason,
        fullAccessOverrideUpdatedAt: changedAt,
        fullAccessOverrideUpdatedBy: actorUserId,
    };

    if (existing) {
      await transaction
        .update(usersSubscriptions)
        .set(update)
        .where(eq(usersSubscriptions.userId, userId));
    } else {
      await transaction.insert(usersSubscriptions).values({
        _id: randomBytes(12).toString('hex'),
        userId,
        ...update,
      });
    }

    await createAuditLog({
      actorUserId,
      action: enabled ? 'FULL_ACCESS_OVERRIDE_ENABLED' : 'FULL_ACCESS_OVERRIDE_DISABLED',
      entityType: 'usersSubscriptions',
      entityId: userId,
      oldData: previous,
      newData,
    }, transaction);
    return previous;
  });

  return {
    message: enabled ? 'Manual full access enabled' : 'Manual full access disabled',
    fullAccessOverride: newData,
    previousFullAccessOverride: oldData,
  };
}

export async function adminListChecks(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.userId) {
    filter.ownerId = query.userId;
    filter.ownerType = 'user';
  }
  if (query.organizationId) {
    filter.ownerId = query.organizationId;
    filter.ownerType = 'organization';
  }
  if (query.bankAccountId || query.bankId) filter.bankId = query.bankAccountId || query.bankId;
  if (query.payeeId) filter.payeeId = query.payeeId;
  if (query.checkNumber) filter.checkNumber = parseInt(query.checkNumber);

  const dateFilter = buildDateFilter(query.dateFrom, query.dateTo, 'createdDate');
  Object.assign(filter, dateFilter);

  if (query.amountMin || query.amountMax) {
    filter.amount = {};
    if (query.amountMin) filter.amount.$gte = parseFloat(query.amountMin);
    if (query.amountMax) filter.amount.$lte = parseFloat(query.amountMax);
  }

  if (query.search) {
    filter.$or = [
      { memo: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { invoiceId: { $regex: query.search, $options: 'i' } },
    ];
  }

  let mailingStatusCheckIds = null;
  if (query.mailingStatus) {
    const mailedChecks = await mailedChecksCollection
      .find({ status: query.mailingStatus })
      .select('checkId')
      .lean();
    mailingStatusCheckIds = mailedChecks.map(mc => mc.checkId).filter(Boolean);
    if (mailingStatusCheckIds.length === 0) {
      return { data: [], pagination: { page, limit, total: 0 } };
    }
    filter._id = { $in: mailingStatusCheckIds };
  }

  const sortObj = buildSort(query, 'createdAt');

  const [data, total] = await Promise.all([
    checksCollection.find(filter)
      .populate('payeeId')
      .populate('bankId')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    checksCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(c => c.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(check => ({
    ...check,
    user: userMap[check.ownerId] || null,
    organization: orgMap[check.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetCheck(checkId) {
  const check = await checksCollection.findById(checkId);
  if (!check) throw Object.assign(new Error('Check not found'), { statusCode: 404 });

  const checkObj = check.toObject ? check.toObject() : check;
  const [payee, bank] = await Promise.all([
    checkObj.payeeId ? payeesCollection.findById(checkObj.payeeId).lean() : null,
    checkObj.bankId ? banksCollection.findById(checkObj.bankId).lean() : null,
  ]);

  let user = null, organization = null;
  if (checkObj.ownerType === 'user') {
    user = await usersCollection.findById(checkObj.ownerId).lean();
  } else {
    organization = await organizationCollection.findById(checkObj.ownerId).lean();
  }

  return { ...checkObj, payee, bank, user, organization };
}

export async function adminUpdateCheck(checkId, updateData, actorUserId) {
  const check = await checksCollection.findById(checkId);
  if (!check) throw Object.assign(new Error('Check not found'), { statusCode: 404 });

  const checkObj = check.toObject ? check.toObject() : check;
  const safeData = filterAllowedFields(updateData, 'check');

  const safeStatuses = ['DRAFT'];
  if (!safeStatuses.includes(checkObj.status)) {
    const allowedFields = ['memo', 'description', 'tags'];
    const attemptedFields = Object.keys(safeData);
    const disallowed = attemptedFields.filter(f => !allowedFields.includes(f));
    if (disallowed.length > 0) {
      throw Object.assign(new Error(`Cannot update fields [${disallowed.join(', ')}] on a check with status ${checkObj.status}`), { statusCode: 400 });
    }
  }

  const oldData = { ...checkObj };
  await checksCollection.findByIdAndUpdate(checkId, safeData);

  await createAuditLog({
    actorUserId,
    action: 'CHECK_UPDATED',
    entityType: 'check',
    entityId: checkId,
    oldData,
    newData: safeData,
  });

  return await adminGetCheck(checkId);
}

export async function adminDeleteCheck(checkId, actorUserId, { force = false } = {}) {
  const check = await checksCollection.findById(checkId);
  if (!check) throw Object.assign(new Error('Check not found'), { statusCode: 404 });

  const checkObj = check.toObject ? check.toObject() : check;

  const [mailedCount, transactionCount] = await Promise.all([
    mailedChecksCollection.countDocuments({ checkId }),
    transactionsCollection.countDocuments({ checkId }),
  ]);

  const hasDependencies = mailedCount > 0 || transactionCount > 0;

  if (hasDependencies && !force) {
    if (checkObj.status !== 'VOID') {
      await checksCollection.findByIdAndUpdate(checkId, { status: 'VOID' });
      await createAuditLog({
        actorUserId,
        action: 'CHECK_VOIDED',
        entityType: 'check',
        entityId: checkId,
        oldData: { status: checkObj.status },
        newData: { status: 'VOID', reason: 'Auto-voided due to dependencies on delete attempt' },
      });
      return { message: 'Check has dependencies (mailing/transactions) and was voided instead of deleted. Use force=true to hard delete.', voided: true };
    }
    throw Object.assign(new Error(`Check has ${mailedCount} mailing record(s) and ${transactionCount} transaction(s). Use force=true to hard delete.`), { statusCode: 400 });
  }

  await createAuditLog({
    actorUserId,
    action: 'CHECK_DELETED',
    entityType: 'check',
    entityId: checkId,
    oldData: checkObj,
    newData: null,
  });

  await checksCollection.findByIdAndDelete(checkId);
  return { message: 'Check deleted successfully' };
}

export async function adminVoidCheck(checkId, actorUserId) {
  const check = await checksCollection.findById(checkId);
  if (!check) throw Object.assign(new Error('Check not found'), { statusCode: 404 });

  const checkObj = check.toObject ? check.toObject() : check;
  if (checkObj.status === 'VOID') {
    throw Object.assign(new Error('Check is already voided'), { statusCode: 400 });
  }

  const oldData = { status: checkObj.status };
  await checksCollection.findByIdAndUpdate(checkId, { status: 'VOID' });

  await createAuditLog({
    actorUserId,
    action: 'CHECK_VOIDED',
    entityType: 'check',
    entityId: checkId,
    oldData,
    newData: { status: 'VOID' },
  });

  return { message: 'Check voided successfully' };
}

export async function adminListBanks(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.userId) {
    filter.ownerId = query.userId;
    filter.ownerType = 'user';
  }
  if (query.organizationId) {
    filter.ownerId = query.organizationId;
    filter.ownerType = 'organization';
  }
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { bankName: { $regex: query.search, $options: 'i' } },
      { accountName: { $regex: query.search, $options: 'i' } },
      { accountNickName: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sortObj = buildSort(query, 'createdAt');

  const [data, total] = await Promise.all([
    banksCollection.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
    banksCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(b => b.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(bank => ({
    ...maskBankSensitiveFields(bank),
    user: userMap[bank.ownerId] || null,
    organization: orgMap[bank.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetBank(bankId) {
  const bank = await banksCollection.findById(bankId);
  if (!bank) throw Object.assign(new Error('Bank not found'), { statusCode: 404 });

  const bankObj = bank.toObject ? bank.toObject() : bank;
  let user = null, organization = null;
  if (bankObj.ownerType === 'user') {
    user = await usersCollection.findById(bankObj.ownerId).lean();
  } else {
    organization = await organizationCollection.findById(bankObj.ownerId).lean();
  }

  return { ...maskBankSensitiveFields(bankObj), user, organization };
}

export async function adminUpdateBank(bankId, updateData, actorUserId) {
  const bank = await banksCollection.findById(bankId);
  if (!bank) throw Object.assign(new Error('Bank not found'), { statusCode: 404 });

  const safeData = filterAllowedFields(updateData, 'bank');
  const oldData = bank.toObject ? bank.toObject() : bank;
  await banksCollection.findByIdAndUpdate(bankId, safeData);

  await createAuditLog({
    actorUserId,
    action: 'BANK_UPDATED',
    entityType: 'bank',
    entityId: bankId,
    oldData,
    newData: safeData,
  });

  return await adminGetBank(bankId);
}

export async function adminDeleteBank(bankId, actorUserId) {
  const bank = await banksCollection.findById(bankId);
  if (!bank) throw Object.assign(new Error('Bank not found'), { statusCode: 404 });

  const bankObj = bank.toObject ? bank.toObject() : bank;

  await createAuditLog({
    actorUserId,
    action: 'BANK_DELETED',
    entityType: 'bank',
    entityId: bankId,
    oldData: bankObj,
    newData: null,
  });

  await banksCollection.findByIdAndDelete(bankId);
  return { message: 'Bank deleted successfully' };
}

export async function adminListPayees(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.userId) {
    filter.ownerId = query.userId;
    filter.ownerType = 'user';
  }
  if (query.organizationId) {
    filter.ownerId = query.organizationId;
    filter.ownerType = 'organization';
  }
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { nickName: { $regex: query.search, $options: 'i' } },
      { companyName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sortObj = buildSort(query, 'createdAt');

  const [data, total] = await Promise.all([
    payeesCollection.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
    payeesCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(p => p.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(payee => ({
    ...payee,
    user: userMap[payee.ownerId] || null,
    organization: orgMap[payee.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetPayee(payeeId) {
  const payee = await payeesCollection.findById(payeeId);
  if (!payee) throw Object.assign(new Error('Payee not found'), { statusCode: 404 });

  const payeeObj = payee.toObject ? payee.toObject() : payee;
  let user = null, organization = null;
  if (payeeObj.ownerType === 'user') {
    user = await usersCollection.findById(payeeObj.ownerId).lean();
  } else {
    organization = await organizationCollection.findById(payeeObj.ownerId).lean();
  }

  return { ...payeeObj, user, organization };
}

export async function adminUpdatePayee(payeeId, updateData, actorUserId) {
  const payee = await payeesCollection.findById(payeeId);
  if (!payee) throw Object.assign(new Error('Payee not found'), { statusCode: 404 });

  const safeData = filterAllowedFields(updateData, 'payee');
  const oldData = payee.toObject ? payee.toObject() : payee;
  await payeesCollection.findByIdAndUpdate(payeeId, safeData);

  await createAuditLog({
    actorUserId,
    action: 'PAYEE_UPDATED',
    entityType: 'payee',
    entityId: payeeId,
    oldData,
    newData: safeData,
  });

  return await adminGetPayee(payeeId);
}

export async function adminDeletePayee(payeeId, actorUserId) {
  const payee = await payeesCollection.findById(payeeId);
  if (!payee) throw Object.assign(new Error('Payee not found'), { statusCode: 404 });

  const payeeObj = payee.toObject ? payee.toObject() : payee;

  await createAuditLog({
    actorUserId,
    action: 'PAYEE_DELETED',
    entityType: 'payee',
    entityId: payeeId,
    oldData: payeeObj,
    newData: null,
  });

  await payeesCollection.findByIdAndDelete(payeeId);
  return { message: 'Payee deleted successfully' };
}

export async function adminListTransactions(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.userId) {
    filter.ownerId = query.userId;
    filter.ownerType = 'user';
  }
  if (query.organizationId) {
    filter.ownerId = query.organizationId;
    filter.ownerType = 'organization';
  }
  if (query.bankAccountId || query.bankId) filter.bankId = query.bankAccountId || query.bankId;
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;

  const dateFilter = buildDateFilter(query.dateFrom, query.dateTo, 'issueDate');
  Object.assign(filter, dateFilter);

  if (query.amountMin || query.amountMax) {
    filter.amount = {};
    if (query.amountMin) filter.amount.$gte = parseFloat(query.amountMin);
    if (query.amountMax) filter.amount.$lte = parseFloat(query.amountMax);
  }

  if (query.search) {
    filter.$or = [
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sortObj = buildSort(query, 'issueDate');

  const [data, total] = await Promise.all([
    transactionsCollection.find(filter)
      .populate('payeeId')
      .populate('bankId')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    transactionsCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(t => t.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(txn => ({
    ...txn,
    user: userMap[txn.ownerId] || null,
    organization: orgMap[txn.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetTransaction(transactionId) {
  const txn = await transactionsCollection.findById(transactionId);
  if (!txn) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

  const txnObj = txn.toObject ? txn.toObject() : txn;
  const [payee, bank] = await Promise.all([
    txnObj.payeeId ? payeesCollection.findById(txnObj.payeeId).lean() : null,
    txnObj.bankId ? banksCollection.findById(txnObj.bankId).lean() : null,
  ]);

  let user = null, organization = null;
  if (txnObj.ownerType === 'user') {
    user = await usersCollection.findById(txnObj.ownerId).lean();
  } else {
    organization = await organizationCollection.findById(txnObj.ownerId).lean();
  }

  return { ...txnObj, payee, bank, user, organization };
}

export async function adminListOrganizations(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.search) {
    filter.$or = [
      { organizationName: { $regex: query.search, $options: 'i' } },
      { dba: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    organizationCollection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    organizationCollection.countDocuments(filter),
  ]);

  const orgIds = data.map(o => o._id.toString());
  const links = orgIds.length > 0
    ? await userToOrganizationCollection.find({ organizationId: { $in: orgIds } }).lean()
    : [];

  const userIds = [...new Set(links.map(l => l.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await usersCollection.find({ _id: { $in: userIds } }).select('firstName lastName email').lean()
    : [];
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const orgUserMap = {};
  for (const link of links) {
    if (!orgUserMap[link.organizationId]) orgUserMap[link.organizationId] = [];
    const u = userMap[link.userId];
    if (u) orgUserMap[link.organizationId].push(u);
  }

  const enriched = data.map(org => ({
    ...org,
    users: orgUserMap[org._id.toString()] || [],
    userCount: (orgUserMap[org._id.toString()] || []).length,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetOrganization(orgId) {
  const org = await organizationCollection.findById(orgId);
  if (!org) throw Object.assign(new Error('Organization not found'), { statusCode: 404 });

  const orgObj = org.toObject ? org.toObject() : org;

  const links = await userToOrganizationCollection.find({ organizationId: orgId }).lean();
  const userIds = links.map(l => l.userId).filter(Boolean);
  const users = userIds.length > 0
    ? await usersCollection.find({ _id: { $in: userIds } }).select('firstName lastName email').lean()
    : [];

  return { ...orgObj, users, userCount: users.length };
}

export async function adminUpdateOrganization(orgId, updateData, actorUserId) {
  const org = await organizationCollection.findById(orgId);
  if (!org) throw Object.assign(new Error('Organization not found'), { statusCode: 404 });

  const safeData = filterAllowedFields(updateData, 'organization');
  const oldData = org.toObject ? org.toObject() : org;
  await organizationCollection.findByIdAndUpdate(orgId, safeData);

  await createAuditLog({
    actorUserId,
    action: 'ORGANIZATION_UPDATED',
    entityType: 'organization',
    entityId: orgId,
    oldData,
    newData: safeData,
  });

  return await adminGetOrganization(orgId);
}

export async function adminDeleteOrganization(orgId, actorUserId) {
  const org = await organizationCollection.findById(orgId);
  if (!org) throw Object.assign(new Error('Organization not found'), { statusCode: 404 });

  const orgFilter = { ownerId: orgId, ownerType: 'organization' };
  const [dependentChecks, dependentBanks, dependentPayees, dependentTransactions] = await Promise.all([
    checksCollection.countDocuments(orgFilter),
    banksCollection.countDocuments(orgFilter),
    payeesCollection.countDocuments(orgFilter),
    transactionsCollection.countDocuments(orgFilter),
  ]);

  const dependencies = [];
  if (dependentChecks > 0) dependencies.push(`${dependentChecks} check(s)`);
  if (dependentBanks > 0) dependencies.push(`${dependentBanks} bank(s)`);
  if (dependentPayees > 0) dependencies.push(`${dependentPayees} payee(s)`);
  if (dependentTransactions > 0) dependencies.push(`${dependentTransactions} transaction(s)`);

  if (dependencies.length > 0) {
    throw Object.assign(new Error(`Cannot delete organization with dependent records: ${dependencies.join(', ')}. Remove or reassign them first.`), { statusCode: 400 });
  }

  const orgObj = org.toObject ? org.toObject() : org;

  await createAuditLog({
    actorUserId,
    action: 'ORGANIZATION_DELETED',
    entityType: 'organization',
    entityId: orgId,
    oldData: orgObj,
    newData: null,
  });

  await userToOrganizationCollection.deleteMany({ organizationId: orgId });
  await organizationCollection.findByIdAndDelete(orgId);
  return { message: 'Organization deleted successfully' };
}

export async function adminListAuditLogs(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.entityType) filter.entityType = query.entityType;
  if (query.action) filter.action = query.action;
  if (query.actorUserId) filter.userId = query.actorUserId;
  if (query.targetUserId) {
    filter.entityType = filter.entityType || 'user';
    filter.entityId = query.targetUserId;
  }
  if (query.entityId) filter.entityId = query.entityId;

  const dateFilter = buildDateFilter(query.dateFrom, query.dateTo, 'createdAt');
  Object.assign(filter, dateFilter);

  const [data, total] = await Promise.all([
    auditLogsCollection.find(filter).sort(buildSort(query, 'createdAt')).skip(skip).limit(limit).lean(),
    auditLogsCollection.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total } };
}

export async function adminGetAuditLog(logId) {
  const log = await auditLogsCollection.findById(logId);
  if (!log) throw Object.assign(new Error('Audit log not found'), { statusCode: 404 });
  return log.toObject ? log.toObject() : log;
}

export async function adminListPlatformSettings() {
  const settings = await platformSettingsCollection.find({}).sort({ key: 1 }).lean();
  return settings;
}

export async function adminGetPlatformSetting(key) {
  const setting = await platformSettingsCollection.findOne({ key });
  if (!setting) throw Object.assign(new Error(`Setting '${key}' not found`), { statusCode: 404 });
  return setting.toObject ? setting.toObject() : setting;
}

function coercePlatformSettingValue(value, valueType) {
  switch (valueType) {
    case 'number': {
      const num = Number(value);
      if (isNaN(num)) throw Object.assign(new Error(`Invalid number value: ${value}`), { statusCode: 400 });
      return String(num);
    }
    case 'boolean': {
      if (value === true || value === 'true' || value === '1') return 'true';
      if (value === false || value === 'false' || value === '0') return 'false';
      throw Object.assign(new Error(`Invalid boolean value: ${value}`), { statusCode: 400 });
    }
    case 'json': {
      if (typeof value === 'object') return JSON.stringify(value);
      try { JSON.parse(value); return value; } catch { throw Object.assign(new Error('Invalid JSON value'), { statusCode: 400 }); }
    }
    case 'string':
    default:
      return String(value);
  }
}

function parsePlatformSettingValue(storedValue, valueType) {
  switch (valueType) {
    case 'number': return Number(storedValue);
    case 'boolean': return storedValue === 'true';
    case 'json': try { return JSON.parse(storedValue); } catch { return storedValue; }
    default: return storedValue;
  }
}

export async function adminUpsertPlatformSetting(key, value, valueType, actorUserId) {
  const existing = await platformSettingsCollection.findOne({ key });
  const resolvedType = valueType || (existing ? (existing.valueType || 'string') : 'string');
  const coercedValue = coercePlatformSettingValue(value, resolvedType);

  let oldData = null;
  if (existing) {
    oldData = existing.toObject ? existing.toObject() : existing;
    await platformSettingsCollection.findOneAndUpdate({ key }, { value: coercedValue, valueType: resolvedType, updatedBy: actorUserId });
  } else {
    const setting = new platformSettingsCollection({ key, value: coercedValue, valueType: resolvedType, updatedBy: actorUserId });
    await setting.save();
  }

  await createAuditLog({
    actorUserId,
    action: 'PLATFORM_SETTING_UPDATED',
    entityType: 'platform_setting',
    entityId: key,
    oldData,
    newData: { key, value: coercedValue, valueType: resolvedType },
  });

  const result = await adminGetPlatformSetting(key);
  if (result) {
    const obj = result.toObject ? result.toObject() : result;
    obj.parsedValue = parsePlatformSettingValue(obj.value, obj.valueType);
    return obj;
  }
  return result;
}

export async function adminGetIntegrationsOverview() {
  const [qbCount, stripeCount, plaidCount] = await Promise.all([
    quickBooksAccountDetailsCollection.countDocuments({}),
    StripeCustomersCollection.countDocuments({}),
    plaidAccountDetailsCollection.countDocuments({}),
  ]);

  return {
    quickbooks: { totalConnections: qbCount },
    stripe: { totalCustomers: stripeCount },
    plaid: { totalAccounts: plaidCount },
  };
}

export async function adminGetQuickbooksIntegrations(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.userId) filter.ownerId = query.userId;

  const [data, total] = await Promise.all([
    quickBooksAccountDetailsCollection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    quickBooksAccountDetailsCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(d => d.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(item => ({
    _id: item._id,
    ownerId: item.ownerId,
    ownerType: item.ownerType,
    isActive: item.isActive,
    realmId: item.realmId,
    accessTokenExpiresAt: item.accessTokenExpiresAt,
    refreshTokenExpiresAt: item.refreshTokenExpiresAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    user: userMap[item.ownerId] || null,
    organization: orgMap[item.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetStripeIntegrations(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.userId) filter.userId = query.userId;

  const [data, total] = await Promise.all([
    StripeCustomersCollection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StripeCustomersCollection.countDocuments(filter),
  ]);

  const userIds = [...new Set(data.map(d => d.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await usersCollection.find({ _id: { $in: userIds } }).select('firstName lastName email').lean()
    : [];
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const subs = userIds.length > 0
    ? await usersSubscriptionCollection.find({ userId: { $in: userIds } }).lean()
    : [];
  const subMap = Object.fromEntries(subs.map(s => [s.userId, s]));

  const enriched = data.map(item => ({
    ...item,
    user: userMap[item.userId] || null,
    subscription: subMap[item.userId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminGetPlaidIntegrations(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.userId) filter.userId = query.userId;

  const [data, total] = await Promise.all([
    plaidAccountDetailsCollection.find(filter).skip(skip).limit(limit).lean(),
    plaidAccountDetailsCollection.countDocuments(filter),
  ]);

  const userIds = [...new Set(data.map(d => d.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await usersCollection.find({ _id: { $in: userIds } }).select('firstName lastName email').lean()
    : [];
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const enriched = data.map(item => ({
    _id: item._id,
    userId: item.userId,
    accountId: item.accountId,
    fundingSourceUrl: item.fundingSourceUrl,
    user: userMap[item.userId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminListAttachments(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.entityType) filter.entityType = query.entityType;
  if (query.entityId) filter.entityId = query.entityId;
  if (query.userId) filter.ownerId = query.userId;
  if (query.isDeleted !== undefined) filter.isDeleted = query.isDeleted === 'true';

  const [data, total] = await Promise.all([
    attachmentsCollection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    attachmentsCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(a => a.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(att => ({
    ...att,
    user: userMap[att.ownerId] || null,
    organization: orgMap[att.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}

export async function adminListCheckImports(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.userId) filter.ownerId = query.userId;
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    checkImportCollection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    checkImportCollection.countDocuments(filter),
  ]);

  const ownerIds = [...new Set(data.map(ci => ci.ownerId))];
  const [users, orgs] = await Promise.all([
    usersCollection.find({ _id: { $in: ownerIds } }).select('firstName lastName email').lean(),
    organizationCollection.find({ _id: { $in: ownerIds } }).select('organizationName').lean(),
  ]);
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
  const orgMap = Object.fromEntries(orgs.map(o => [o._id.toString(), o]));

  const enriched = data.map(ci => ({
    ...ci,
    user: userMap[ci.ownerId] || null,
    organization: orgMap[ci.ownerId] || null,
  }));

  return { data: enriched, pagination: { page, limit, total } };
}
