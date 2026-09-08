import { escapeRegex } from '../utils/common.util.js';
import { parseListSort, buildMongoSort } from '../utils/listSort.util.js';
import { sql, and, or, ilike, gte, lte, inArray, desc, eq } from 'drizzle-orm';
import { db, users as usersTable, usersSubscriptions as usersSubsTable } from '../db/index.js';

// Allow-list of column-ids that callers may sort the admin user list on
// using the local users-table fields.
export const USERS_SORTABLE_FIELDS = {
  firstName: ['firstName', 'lastName'],
  email: ['email'],
  createdAt: ['createdAt'],
  lastLogin: ['lastLogin'],
  role: ['role'],
};

// Sortable column-ids that live on the joined users_subscriptions table.
// These are handled via a direct Drizzle leftJoin so pagination stays
// stable across pages instead of being re-sorted in memory after a
// per-page Stripe enrichment.
export const USERS_JOINED_SORTABLE_FIELDS = {
  subscriptionStatus: { kind: 'column', column: 'status' },
  price: { kind: 'jsonbNumeric', column: 'subscriptionPrice', key: 'price' },
};
import { appCache } from '../utils/nodeCache.util.js';
import {
  addDefaultTags,
  checkSubscriptionAndTrial,
} from '../services/authentication.service.js';
import { stripesubscriptionFindeOne } from './stripesubscription.model.js';

import {
  usersCollection,
  organizationCollection,
  tagsCollection,
  groupsCollection,
  payeesCollection,
  userToOrganizationCollection,
  usersSubscriptionCollection,
} from './dbCollections.js';
import SubscriptionService from '../services/stripe.service.js';

export const updateUserRoleByUserId = async (userId, role) => {
  try {
    const res = await usersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: { role: role } },
      { new: true }
    );

    if (res) {
      return res;
    }
  } catch (err) {
    throw err;
  }
};

export const fetchUsersWithFiltersAndPagination = async (
  pageSize = 10,
  pageNumber = 1,
  search = '',
  subscriptionStatuses,
  sortBy,
  startDate,
  endDate,
  sortOrder
) => {
  try {
    const skip = (pageNumber - 1) * pageSize;
    const filter = {};

    if (search && search !== '{search}') {
      const escapedSearch = escapeRegex(search);
      const regex = { $regex: escapedSearch, $options: 'i' };
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        filter.createdAt = { $gte: from, $lte: to };
      }
    }

    const userFilter = { ...filter };

    if (subscriptionStatuses && subscriptionStatuses.length > 0) {
      const userIds = await usersSubscriptionCollection.distinct('userId', {
        status: { $in: subscriptionStatuses },
      });
      userFilter._id = { $in: userIds };
    }

    // Column-based sort (clickable headers) takes precedence when both
    // sortBy and sortOrder match the allow-list. Otherwise fall back to the
    // legacy "Sort By" dropdown values.
    const parsedColumnSort = parseListSort(
      { sortBy, sortOrder },
      USERS_SORTABLE_FIELDS
    );
    const joinedSortSpec =
      !parsedColumnSort &&
      sortBy &&
      USERS_JOINED_SORTABLE_FIELDS[sortBy] &&
      (sortOrder === 'asc' || sortOrder === 'desc')
        ? { ...USERS_JOINED_SORTABLE_FIELDS[sortBy], sortOrder }
        : null;

    let users;
    let totalUsers;

    if (joinedSortSpec) {
      // Sort by a joined users_subscriptions field (status / price). Build a
      // direct Drizzle query that leftJoins users_subscriptions so ordering
      // is applied at the DB layer, then load the matching users via the
      // compat layer to keep enrichment behavior identical.
      const userIdRestriction =
        userFilter._id && userFilter._id.$in ? userFilter._id.$in : null;

      const conditions = [];
      if (search && search !== '{search}') {
        const escaped = escapeRegex(search).replace(/%/g, '\\%').replace(/_/g, '\\_');
        const like = `%${escaped}%`;
        conditions.push(
          or(
            ilike(usersTable.firstName, like),
            ilike(usersTable.lastName, like),
            ilike(usersTable.email, like)
          )
        );
      }
      if (userFilter.createdAt) {
        if (userFilter.createdAt.$gte) {
          conditions.push(gte(usersTable.createdAt, userFilter.createdAt.$gte));
        }
        if (userFilter.createdAt.$lte) {
          conditions.push(lte(usersTable.createdAt, userFilter.createdAt.$lte));
        }
      }
      if (userIdRestriction) {
        if (userIdRestriction.length === 0) {
          return {
            users: [],
            totalRecords: 0,
            totalPages: 0,
            currentPage: pageNumber,
            nextPage: false,
            previousPage: false,
          };
        }
        conditions.push(inArray(usersTable._id, userIdRestriction));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let orderExpr;
      if (joinedSortSpec.kind === 'column') {
        orderExpr = usersSubsTable[joinedSortSpec.column];
      } else if (joinedSortSpec.kind === 'jsonbNumeric') {
        const col = usersSubsTable[joinedSortSpec.column];
        orderExpr = sql`(${col}->>${joinedSortSpec.key})::numeric`;
      }
      // NULLS LAST so users without a subscription row don't dominate the
      // first page in either direction.
      const directionalOrder =
        joinedSortSpec.sortOrder === 'asc'
          ? sql`${orderExpr} ASC NULLS LAST`
          : sql`${orderExpr} DESC NULLS LAST`;
      // Stable tiebreaker on users._id (matches the convention used by the
      // shared `buildMongoSort` helper for column sorts).
      const tiebreaker = desc(usersTable._id);

      let baseQuery = db
        .select({ _id: usersTable._id })
        .from(usersTable)
        .leftJoin(usersSubsTable, eq(usersSubsTable.userId, usersTable._id));
      if (whereClause) baseQuery = baseQuery.where(whereClause);

      const idRows = await baseQuery
        .orderBy(directionalOrder, tiebreaker)
        .offset(skip)
        .limit(pageSize);
      const orderedIds = idRows.map((r) => r._id);

      let countQuery = db
        .select({ count: sql`count(*)::int` })
        .from(usersTable)
        .leftJoin(usersSubsTable, eq(usersSubsTable.userId, usersTable._id));
      if (whereClause) countQuery = countQuery.where(whereClause);
      const countRows = await countQuery;
      totalUsers = Number(countRows?.[0]?.count) || 0;

      if (orderedIds.length === 0) {
        users = [];
      } else {
        const fetched = await usersCollection
          .find({ _id: { $in: orderedIds } })
          .lean();
        const byId = new Map(fetched.map((u) => [String(u._id), u]));
        users = orderedIds.map((id) => byId.get(String(id))).filter(Boolean);
      }
    } else {
      let sortOption;
      if (parsedColumnSort) {
        sortOption = buildMongoSort(parsedColumnSort);
      } else {
        switch (sortBy) {
          case 'recent':
            sortOption = { createdAt: -1, _id: -1 };
            break;
          case 'name':
            sortOption = { firstName: 1, lastName: 1, _id: -1 };
            break;
          case 'email':
            sortOption = { email: 1, _id: -1 };
            break;
          default:
            sortOption = { createdAt: -1, _id: -1 };
            break;
        }
      }

      users = await usersCollection
        .find(userFilter)
        .skip(skip)
        .limit(pageSize)
        .sort(sortOption)
        .lean();

      totalUsers = await usersCollection.countDocuments(userFilter);
    }

    if (!totalUsers) {
      return {
        users: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: pageNumber,
        nextPage: false,
        previousPage: false,
      };
    }

    const totalPages = Math.ceil(totalUsers / pageSize);
    const nextPage = pageNumber < totalPages;
    const previousPage = pageNumber > 1;

    const usersWithSubscription = await Promise.all(
      users.map(async (user) => {
        let subscriptionInfo;
        try {
          subscriptionInfo = await SubscriptionService.getSubscriptionDetails({
            userId: user?._id,
          });
        } catch (err) {
          console.error(`Failed to get subscription for user ${user?._id}:`, err?.message);
          subscriptionInfo = {
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
            underlyingSubscriptionStatus: 'none',
            hasFullAccessOverride: false,
            fullAccessOverride: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          };
        }
        return {
          ...user,
          role: user?.role ? user.role : 'user',
          subscriptionInfo,
        };
      })
    );

    return {
      users: usersWithSubscription,
      totalRecords: totalUsers,
      totalPages,
      currentPage: pageNumber,
      nextPage,
      previousPage,
    };
  } catch (err) {
    throw err;
  }
};

export const FindUserByUserIdAndUpdate = async (payload) => {
  try {
    const updateResult = await usersCollection.updateOne(
      { _id: payload.userId },
      { $set: { lastLogin: new Date() } }
    );
    if (updateResult.matchedCount === 1) {
      return true;
    }
    return false;
  } catch (err) {
    throw err;
  }
};

export const findUser = async (payload) => {
  try {
    const res = await usersCollection.findOne(payload).count();
    if (res) {
      return true;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const getUser = async (payload, fields = null) => {
  try {
    const res = await usersCollection.findOne(payload);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const createUser = async (payload) => {
  try {
    const res = await usersCollection.create(payload);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const updateUser = async (filterPayload, updatePayload) => {
  try {
    const res = await usersCollection.findOneAndUpdate(
      filterPayload,
      updatePayload,
      { new: true }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const addPayee = async (userId, payload, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const newPayee = await payeesCollection.create({
      ...payload,
      ownerId,
      ownerType,
    });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return newPayee;
  } catch (err) {
    throw err;
  }
};

export const updatePayee = async (
  userId,
  payeeId,
  updatedPayee,
  organizationId
) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const payee = await payeesCollection.findOne({ _id: payeeId, ownerId, ownerType });
    if (!payee) return;
    await payeesCollection.updateOne({ _id: payeeId }, { $set: updatedPayee });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return updatedPayee;
  } catch (err) {
    throw err;
  }
};

export const deletePayee = async (userId, payeeId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const payee = await payeesCollection.findOne({ _id: payeeId, ownerId, ownerType });
    if (!payee) return;
    await payeesCollection.deleteOne({ _id: payeeId });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return payee;
  } catch (err) {
    throw err;
  }
};

export const getPayeeByNickname = async (
  userId,
  payeeNickname,
  organizationId
) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const payee = await payeesCollection.findOne({
      ownerId,
      ownerType,
      nickName: { $regex: `^${payeeNickname}$`, $options: 'i' },
    });
    return payee || undefined;
  } catch (err) {
    throw err;
  }
};

export const deleteTag = async (userId, tagId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const tag = await tagsCollection.findOne({ _id: tagId, ownerId, ownerType });
    if (!tag) return;
    await tagsCollection.deleteOne({ _id: tagId });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return tag;
  } catch (err) {
    throw err;
  }
};

export const addTag = async (userId, payload, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const newTag = await tagsCollection.create({
      ...payload,
      ownerId,
      ownerType,
    });
    if (!newTag) throw new Error('Unable to create tag');
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return newTag;
  } catch (err) {
    throw err;
  }
};

export const updateTag = async (userId, tagId, updatedTag, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const tag = await tagsCollection.findOne({ _id: tagId, ownerId, ownerType });
    if (!tag) return;
    await tagsCollection.updateOne({ _id: tagId }, { $set: updatedTag });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return updatedTag;
  } catch (err) {
    throw err;
  }
};

export const updatePreferences = async (userId, payload, organizationId) => {
  try {
    const collection = organizationId ? organizationCollection : usersCollection;
    const docId = organizationId || userId;
    await collection.updateOne({ _id: docId }, { $set: { preferences: payload } });
    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );
    return payload;
  } catch (err) {
    throw err;
  }
};

export const addGroup = async (userId, payload, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const newGroup = await groupsCollection.create({
      ...payload,
      ownerId,
      ownerType,
    });
    if (!newGroup) throw new Error('Unable to create group');
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return newGroup;
  } catch (err) {
    throw err;
  }
};

export const updateGroup = async (userId, groupId, payload, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const group = await groupsCollection.findOne({ _id: groupId, ownerId, ownerType });
    if (!group) return;
    await groupsCollection.updateOne({ _id: groupId }, { $set: payload });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    const updated = await groupsCollection.findOne({ _id: groupId });
    return updated;
  } catch (err) {
    throw err;
  }
};

export const deleteGroup = async (userId, groupId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const group = await groupsCollection.findOne({ _id: groupId, ownerId, ownerType });
    if (!group) return;
    await groupsCollection.deleteOne({ _id: groupId });
    if (organizationId) appCache.del(`Organization-${organizationId}`);
    return group;
  } catch (err) {
    throw err;
  }
};

export const getGroup = async (userId, groupId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const group = await groupsCollection.findOne({ _id: groupId, ownerId, ownerType });
    return group || undefined;
  } catch (err) {
    throw err;
  }
};

export const getGroups = async (userId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const allGroups = await groupsCollection.find({ ownerId, ownerType });
    if (!allGroups || allGroups.length === 0) return;
    const groupsMap = new Map();
    allGroups.forEach(g => groupsMap.set(g._id, g));
    return groupsMap;
  } catch (err) {
    throw err;
  }
};

export const createOrganizationDB = async (userId, payload) => {
  try {
    let organizationDetails = await organizationCollection.create(payload);
    if (!organizationDetails) return;
    // ! Save userToOrganization Details.
    await addDefaultTags(userId, organizationDetails._id);
    await userToOrganizationCollection.create({
      userId: userId,
      organizationId: organizationDetails._id,
    });
    organizationDetails = await getOrganizationDB(organizationDetails._id, {
      checkNumbers: 0,
      bankDetails: 0,
      payees: 0,
      groups: 0,
      tags: 0,
      lastUsedCheckNumber: 0,
      preferences: 0,
      users: 0,
      signatureUrl: 0,
    });
    if (!organizationDetails) return;
    return organizationDetails;
  } catch (err) {
    throw err;
  }
};

export const getOrganizationDB = async (
  organizationId,
  fields = null,
  page,
  pageSize
) => {
  try {
    const organization = await organizationCollection.findOne(
      { _id: organizationId },
      fields
    );
    if (!organization) return;
    return organization;
  } catch (err) {
    throw err;
  }
};

export const updateOrganizationDB = async (organizationId, payload) => {
  try {
    const updatedOrganization = await organizationCollection.findOneAndUpdate(
      { _id: organizationId },
      payload,
      { new: true }
    );
    if (!updatedOrganization) return;
    return updatedOrganization;
  } catch (err) {
    throw err;
  }
};

export const deleteOrganizationDB = async (organizationId) => {
  try {
    await organizationCollection.findByIdAndDelete({ _id: organizationId });
  } catch (err) {
    throw err;
  }
};
export const deleteUsersOrganization = async (organizationId) => {
  try {
    await userToOrganizationCollection.deleteMany({ organizationId });
  } catch (err) {
    throw err;
  }
};

export const getOrganizationsDB = async (userId) => {
  try {
    const organizationIds = await userToOrganizationCollection.find(
      { userId },
      { organizationId: 1 }
    );
    if (!organizationIds) return;
    return organizationIds;
  } catch (err) {
    throw err;
  }
};

export const getOrganizationDetailDB = async (
  organizationId,
  fields = null
) => {
  try {
    const organization = await organizationCollection.findOne(
      {
        _id: organizationId,
      },
      fields
    );
    if (!organization) return;
    return organization;
  } catch (err) {
    throw err;
  }
};

export const validateUserOrganization = async (userId, organizationId) => {
  try {
    const link = await userToOrganizationCollection.findOne({
      userId: userId.toString(),
      organizationId: organizationId.toString(),
    });
    return !!link;
  } catch (err) {
    console.error('Error validating user organization access:', err);
    throw new Error('Database query failed');
  }
};

export const getUerSubscriptionInformation = async (userId) => {
  try {
    const { isSubscribed, isTrialPeriod } = await checkSubscriptionAndTrial(
      userId
    );

    let response = {
      isSubscribed,
      isTrialPeriod,
    };

    if (isTrialPeriod) {
      const subscriptionData = await stripesubscriptionFindeOne({ userId });

      if (!subscriptionData) throw new Error('Subscription data not found');

      response = {
        ...response,
        trialEndAt: subscriptionData?.trialEndAt,
      };
    }
    return response;
  } catch (error) {
    throw error;
  }
};
