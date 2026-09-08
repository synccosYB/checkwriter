import config from 'config';
import {
  subDays,
  subMonths,
  subYears,
  format,
  parseISO,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from 'date-fns';

import { getTagsById, getUserDetails } from './users.service.js';

import {
  banksCollection,
  checksCollection,
  organizationCollection,
  transactionsCollection,
  userToOrganizationCollection,
} from '../models/dbCollections.js';
import { getUserSignatureBase64 } from '../utils/signature.util.js';

import { weekDay, monthDay } from '../constants/index.js';
import { CHECK_STATUS } from '../enums/checks.enum.js';
import {
  compileBlankTemplate,
  compileWrapperTemplate,
  generatePDFBuffer,
} from '../utils/checkEmail/checkEmail.utils.js';
import { getSignatureBase64 } from '../utils/signature.util.js';

import {
  uploadToS3,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
} from '../utils/s3.util.js';

import { db } from '../db/index.js';
import { checks as checksTable, payees as payeesTable, banks as banksTable } from '../db/schema.js';
import { and, eq, ne, gt, gte, lt, lte, inArray, notInArray, asc, desc, isNull, sql, or } from 'drizzle-orm';

// Some commented-out code here (preserved)

// Example function

export const validateTags = async (userId, tagIds, organizationId) => {
  try {
    if (tagIds.length > 3) {
      throw new Error('Can only associate a check with maximum 3 tags');
    }

    const tags = await getTagsById(userId, tagIds, organizationId);
    if (!tags) {
      throw new Error('Unable to get tags');
    }
    return true;
  } catch (err) {
    throw err;
  }
};

export const generatePresignedURLupload = async (
  userId,
  checkId,
  organizationId
) => {
  try {
    const presignedURL = await getPresignedUploadUrl({
      Bucket: config.s3.bucket_name,
      Key: `${organizationId ? organizationId : userId}/checkWriter/${checkId}`,
      ContentType: 'application/pdf',
    });
    if (!presignedURL) {
      return;
    }

    return presignedURL;
  } catch (err) {
    throw err;
  }
};

export const generatePresignedURLdownload = async (
  userId,
  checkIds,
  organizationId
) => {
  try {
    const signedUrls = [];

    for (const checkId of checkIds) {
      const presignedURL = await getPresignedDownloadUrl({
        Bucket: config.s3.bucket_name,
        Key: `${organizationId ? organizationId : userId}/checkWriter/${checkId}`,
        expiresIn: 60 * 60 * 24 * 7,
      });

      signedUrls.push(presignedURL);
    }

    return signedUrls;
  } catch (err) {
    throw err;
  }
};

export const getTotalChecksStats = async (type, ownerIds, status) => {
  try {
    let totalChecks = 0;

    const ownerMatch = ownerIds.map(({ id, type }) => ({
      ownerId: id,
      ownerType: type,
    }));

    let matchStage = {
      $or: ownerMatch,
    };
    if (status && ['DRAFT', 'CLEARED'].includes(status)) {
      matchStage.status = status;
    }

    if (type === 'Total Checks') {
      totalChecks = await checksCollection.countDocuments(matchStage);
    } else {
      const result = await checksCollection.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: null,
            totalChecks: { $sum: '$amount' },
          },
        },
      ]);

      if (result.length > 0) {
        totalChecks = result[0].totalChecks;
      }
    }

    return totalChecks;
  } catch (error) {
    throw new Error(error);
  }
};

function calculateDateRange(duration) {
  try {
    const today = new Date();
    let startDate, endDate, datePoints;

    switch (duration.toLowerCase()) {
      case 'weekly': {
        endDate = today;
        startDate = subDays(today, 6);

        // Generate array of the 7 days
        datePoints = eachDayOfInterval({ start: startDate, end: endDate }).map(
          (date) => ({
            date,
            key: format(date, 'yyyy-MM-dd'),
            name: weekDay[date.getDay()],
            amount: 0,
            checks: 0,
          })
        );
        break;
      }

      case 'monthly': {
        endDate = today;
        startDate = subMonths(today, 11);

        // Generate array of 12 months
        datePoints = eachMonthOfInterval({
          start: startDate,
          end: endDate,
        }).map((date) => ({
          date,
          key: format(date, 'yyyy-MM'),
          name: monthDay[date.getMonth()],
          amount: 0,
          checks: 0,
        }));
        break;
      }

      case 'yearly': {
        endDate = today;
        startDate = subYears(today, 4);

        // Generate array of 5 years
        datePoints = eachYearOfInterval({ start: startDate, end: endDate }).map(
          (date) => ({
            date,
            key: format(date, 'yyyy'),
            name: format(date, 'yyyy'),
            amount: 0,
            checks: 0,
          })
        );
        break;
      }

      default:
        // Default to weekly if invalid duration
        endDate = today;
        startDate = subDays(today, 6);
        datePoints = eachDayOfInterval({ start: startDate, end: endDate }).map(
          (date) => ({
            date,
            key: format(date, 'yyyy-MM-dd'),
            name: weekDay[date.getDay()],
            amount: 0,
            checks: 0,
          })
        );
    }
    return { datePoints, startDate, endDate };
  } catch (err) {
    throw new Error(err);
  }
}

export const getChecksChartData = async ({
  ownerIds,
  startDate,
  endDate,
  duration,
}) => {
  try {
    const ownerMatch = ownerIds.map(({ id, type }) => ({
      ownerId: id,
      ownerType: type,
    }));
    const checks = await checksCollection
      .find({
        $or: ownerMatch,
        issuedDate: {
          $gte: parseISO(startDate),
          $lte: parseISO(endDate),
        },
      })
      .lean();

    const { datePoints } = calculateDateRange(duration);

    let data = [...datePoints];

    checks.forEach((check) => {
      const checkDate = new Date(check.issuedDate);
      let key;

      switch (duration.toLowerCase()) {
        case 'weekly':
          key = format(checkDate, 'yyyy-MM-dd');
          break;
        case 'monthly':
          key = format(checkDate, 'yyyy-MM');
          break;
        case 'yearly':
          key = format(checkDate, 'yyyy');
          break;
        default:
          key = format(checkDate, 'yyyy-MM-dd');
      }

      const dataPoint = data.find((point) => point.key === key);
      if (dataPoint) {
        dataPoint.amount += parseFloat(check.amount) || 0;
        dataPoint.checks += 1;
      }
    });

    const chartData = data.map((point) => ({
      name: point.name,
      amount: parseFloat(point.amount.toFixed(2)),
      checks: point.checks,
    }));

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    const formattedDateRange = {
      endDate: format(endDate, 'MMM d, yyyy'),
      startDate: format(startDate, 'MMM d, yyyy'),
    };

    return { chartData, total, formattedDateRange };
  } catch (error) {
    throw Error(error);
  }
};

export const uploadCheckPDF = async ({
  userId,
  pdfBuffer,
  organizationId,
  ownerType,
  fileName,
}) => {
  try {
    const s3Key =
      ownerType !== 'user'
        ? `${userId}/checkWriter/organization/${organizationId}/checks/${fileName}`
        : `${userId}/checkWriter/personal/checks/${fileName}`;

    await uploadToS3({
      Bucket: config.s3.bucket_name,
      Key: s3Key,
      ContentType: 'application/pdf',
      Body: pdfBuffer,
    });
    return s3Key;
  } catch (err) {
    throw err;
  }
};

export const getCheckPDFUrl = async ({
  userId,
  organizationId,
  ownerType,
  fileName,
}) => {
  try {
    const s3Key =
      ownerType !== 'user'
        ? `${userId}/checkWriter/organization/${organizationId}/checks/${fileName}`
        : `${userId}/checkWriter/personal/checks/${fileName}`;

    return await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: s3Key,
      expiresIn: 60 * 60,
    });
  } catch (err) {
    throw err;
  }
};

export const getCheckPermissions = (check) => {
  if (!check) {
    return {
      canEdit: false,
      canEmail: false,
      canMail: false,
      canDelete: false,
      canPrint: false,
      canVoid: false,
      canClear: false,
    };
  }
  const isDraft = check?.status === CHECK_STATUS.DRAFT;
  const isBlank = check?.status === CHECK_STATUS.BLANK || check?.isBlankCheck;
  const isVoid = check?.status === CHECK_STATUS.VOID;
  const isCleared = check?.status === CHECK_STATUS.CLEARED;
  const isNewBlank =
    check?.status === CHECK_STATUS.BLANK && check?.isBlankCheck;

  return {
    canEdit: isDraft || isBlank,
    canEmail: !isVoid && !isBlank && !isCleared,
    canMail: !isVoid && !isBlank && !isCleared,
    canDelete: isDraft && !check?.qbCheckId,
    canPrint: check?.isBlankCheck
      ? !isCleared
      : !isVoid && !isBlank && !isCleared,
    canVoid: !isVoid && !isDraft,
    canClear: !isCleared && !isVoid && !isDraft,
  };
};

export const isOperationAllowed = (check, operation) => {
  const permissions = getCheckPermissions(check);
  if (!check) return { allowed: false, message: 'Invalid check object' };

  const operationMap = {
    EDIT: 'canEdit',
    EMAILED: 'canEmail',
    MAILED: 'canMail',
    DELETE: 'canDelete',
    PRINTED: 'canPrint',
    VOID: 'canVoid',
    CLEARED: 'canClear',
  };

  const key = operationMap[operation.toUpperCase()];
  if (!key) return { allowed: false, message: 'Unknown operation' };

  return permissions[key]
    ? { allowed: true }
    : { allowed: false, message: `${operation} not allowed in current status` };
};
export const addTransactionOnCheckCreation = async (doc) => {
  try {
    const transaction = new transactionsCollection({
      bankId: doc.bankId,
      checkId: doc._id, // Link to this check
      ownerId: doc.ownerId,
      ownerType: doc.ownerType,
      type: 'transaction',
      checkNumber: doc.checkNumber,
      payeeId: doc.payeeId,
      description: doc.description || `Check #${doc.checkNumber}`,
      amount: doc.amount,
      balance: 0, // Will be calculated by transaction hooks
      issueDate: doc.issuedDate || doc.createdDate || new Date(),
      status: doc.status === 'CLEARED' ? 'paid' : 'open',
    });

    await transaction.save();
  } catch (error) {
    console.error('Error creating transaction after check save:', error);
  }
};

export const updateTransactionOnCheckUpdate = async (doc) => {
  try {
    if (!doc) return;

    const checkId = doc._id;

    const transaction = await transactionsCollection.findOne({ checkId });
    if (!transaction) {
      return;
    }

    // Prepare update object for transaction based on the *current* state of 'doc'
    const transactionUpdate = {};

    if (doc.amount !== undefined) {
      transactionUpdate.amount = doc.amount;
    }

    if (doc.payeeId !== undefined) {
      transactionUpdate.payeeId = doc.payeeId;
    }

    if (doc.description !== undefined) {
      transactionUpdate.description = doc.description;
    }

    if (doc.issuedDate !== undefined) {
      transactionUpdate.issueDate = doc.issuedDate;
    }

    if (doc.status !== undefined) {
      transactionUpdate.status = doc.status === 'CLEARED' ? 'paid' : 'open';
    }

    // Update the transaction if we have relevant fields in the 'doc'
    if (Object.keys(transactionUpdate).length > 0) {
      await transactionsCollection.findByIdAndUpdate(
        transaction._id,
        transactionUpdate
      );
    }
  } catch (error) {
    console.error('Error updating transaction after check update:', error);
  }
};

export const deleteTransactionOnCheckDelete = async (doc) => {
  try {
    if (!doc) return;

    await transactionsCollection.findOneAndDelete({ checkId: doc._id });
  } catch (error) {
    console.error('Error deleting transaction after check removal:', error);
  }
};
// Allow-list of fields that the MyChecks list endpoint accepts as a sort key.
// Keys are the public API names sent by the client; values describe how to
// resolve the sort (a plain column on the `checks` table, a column on a
// joined table, or a raw expression for jsonb fields like tags).
export const CHECKS_SORTABLE_FIELDS = {
  checkNumber: { kind: 'column', column: 'checkNumber' },
  status: { kind: 'column', column: 'status' },
  amount: { kind: 'column', column: 'amount' },
  issuedDate: { kind: 'column', column: 'issuedDate' },
  payeeName: { kind: 'joined', table: 'payees', column: 'name', localField: 'payeeId' },
  accountNickname: { kind: 'joined', table: 'banks', column: 'accountNickName', localField: 'bankId' },
  tags: { kind: 'jsonbArrayLength', column: 'tags' },
};

export function parseChecksSort(query = {}) {
  const { sortBy, sortOrder } = query;
  if (!sortBy) return null;
  const spec = CHECKS_SORTABLE_FIELDS[sortBy];
  if (!spec) return null;
  const order = sortOrder === 'asc' ? 'asc' : sortOrder === 'desc' ? 'desc' : null;
  if (!order) return null;
  return { sortBy, sortOrder: order, spec };
}

// Translate the subset of mongo-style filter shapes produced by
// buildChecksFilter() into a Drizzle WHERE expression on the checks table.
// Kept intentionally narrow (only the operators we actually emit) so it stays
// easy to audit and matches existing semantics.
function buildChecksWhere(filter) {
  const conds = [];
  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(value)) {
      const sub = value.map((v) => buildChecksWhere(v)).filter(Boolean);
      if (sub.length > 0) conds.push(or(...sub));
      continue;
    }
    const col = checksTable[key];
    if (!col) continue;

    if (value === null || value === undefined) {
      conds.push(isNull(col));
      continue;
    }

    if (value instanceof RegExp) {
      const flags = value.flags || '';
      conds.push(flags.includes('i') ? sql`${col} ~* ${value.source}` : sql`${col} ~ ${value.source}`);
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case '$eq': conds.push(eq(col, opVal)); break;
          case '$ne': conds.push(ne(col, opVal)); break;
          case '$gt': conds.push(gt(col, opVal)); break;
          case '$gte': conds.push(gte(col, opVal)); break;
          case '$lt': conds.push(lt(col, opVal)); break;
          case '$lte': conds.push(lte(col, opVal)); break;
          case '$in':
            if (Array.isArray(opVal) && opVal.length > 0) {
              if (key === 'tags') {
                // tags is a jsonb array of tag ids; match if any element overlaps.
                const arr = JSON.stringify(opVal.map((v) => (v?.toString ? v.toString() : v)));
                conds.push(sql`${col} ?| array(select jsonb_array_elements_text(${arr}::jsonb))`);
              } else {
                conds.push(inArray(col, opVal.map((v) => (v?.toString ? v.toString() : v))));
              }
            }
            break;
          case '$nin':
            if (Array.isArray(opVal) && opVal.length > 0) {
              conds.push(notInArray(col, opVal.map((v) => (v?.toString ? v.toString() : v))));
            }
            break;
          default: break;
        }
      }
      continue;
    }

    conds.push(eq(col, value));
  }
  if (conds.length === 0) return undefined;
  return conds.length === 1 ? conds[0] : and(...conds);
}

// Run a sort-aware query against the checks list and return the ordered _ids
// for one page. The full check rows are then loaded by the caller through the
// regular populate/attachment pipeline so behaviour stays identical to the
// default (unsorted) path.
export async function getSortedCheckIdsPage({ filter, sort, skip, limit }) {
  const where = buildChecksWhere(filter);
  const idCol = checksTable._id;
  const tiebreaker = desc(idCol);

  let orderExpr;
  if (sort.spec.kind === 'column') {
    const col = checksTable[sort.spec.column];
    if (!col) throw new Error(`Unknown sortable column: ${sort.spec.column}`);
    orderExpr = sort.sortOrder === 'asc' ? asc(col) : desc(col);
  } else if (sort.spec.kind === 'jsonbArrayLength') {
    const col = checksTable[sort.spec.column];
    if (!col) throw new Error(`Unknown sortable column: ${sort.spec.column}`);
    const expr = sql`COALESCE(jsonb_array_length(${col}), 0)`;
    orderExpr = sort.sortOrder === 'asc' ? asc(expr) : desc(expr);
  } else if (sort.spec.kind === 'joined') {
    let joinTable;
    if (sort.spec.table === 'payees') joinTable = payeesTable;
    else if (sort.spec.table === 'banks') joinTable = banksTable;
    else throw new Error(`Unknown join table: ${sort.spec.table}`);

    const joinCol = joinTable[sort.spec.column];
    const localCol = checksTable[sort.spec.localField];
    const orderCol = sort.sortOrder === 'asc' ? asc(joinCol) : desc(joinCol);

    let q = db
      .select({ _id: idCol })
      .from(checksTable)
      .leftJoin(joinTable, eq(localCol, joinTable._id));
    if (where) q = q.where(where);
    q = q.orderBy(orderCol, tiebreaker).offset(skip).limit(limit);
    const rows = await q;
    return rows.map((r) => r._id);
  } else {
    throw new Error(`Unknown sort spec kind: ${sort.spec.kind}`);
  }

  let q = db.select({ _id: idCol }).from(checksTable);
  if (where) q = q.where(where);
  q = q.orderBy(orderExpr, tiebreaker).offset(skip).limit(limit);
  const rows = await q;
  return rows.map((r) => r._id);
}

export function buildChecksFilter({
  ownerType,
  userId,
  organizationId,
  query,
  includePagination,
}) {
  const {
    page,
    pageSize,
    status,
    payeeIds,
    bankIds,
    tagIds,
    startDate,
    endDate,
    search,
    createdAs,
  } = query;
  const baseFilter = {
    ownerId: ownerType === 'user' ? userId : organizationId,
    ownerType,
  };

  if (status) {
    const statuses = Array.isArray(status) ? status : status.split(',');
    if (statuses.includes('UNCLEARED')) {
      baseFilter.status = { $nin: ['CLEARED', 'DRAFT', 'VOID'] };
    } else {
      baseFilter.status = { $in: statuses };
    }
  }

  if (createdAs) {
    const createdAsArray = Array.isArray(createdAs)
      ? createdAs
      : createdAs.split(',');
    if (createdAsArray.includes('blank')) {
      baseFilter.isBlankCheck = true;
    }
    if (createdAsArray.includes('filled')) {
      baseFilter.isBlankCheck = false;
    }
  }

  if (payeeIds) {
    const payeesList = (
      Array.isArray(payeeIds) ? payeeIds : payeeIds.split(',')
    ).map((id) => id.toString());
    baseFilter.payeeId = { $in: payeesList };
  }

  if (bankIds) {
    const banksList = (Array.isArray(bankIds) ? bankIds : bankIds.split(',')).map(
      (id) => id.toString()
    );
    baseFilter.bankId = { $in: banksList };
  }

  if (tagIds) {
    const tagsList = (Array.isArray(tagIds) ? tagIds : tagIds.split(',')).map(
      (id) => id.toString()
    );
    baseFilter.tags = { $in: tagsList };
  }

  if (startDate || endDate) {
    baseFilter.issuedDate = {};
    if (startDate) baseFilter.issuedDate.$gte = new Date(startDate);
    if (endDate) baseFilter.issuedDate.$lte = new Date(endDate);
  }

  let searchFilter = {};
  if (search?.trim()) {
    const trimmedSearch = search.trim();
    const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, 'i');
    const orConditions = [
      { memo: regex },
      { description: regex },
      { invoiceId: regex },
    ];
    if (!isNaN(trimmedSearch)) {
      orConditions.push({ checkNumber: parseInt(trimmedSearch) });
    }
    searchFilter = { $or: orConditions };
  }

  const finalFilter = {
    ...baseFilter,
    ...searchFilter,
  };
  if (includePagination) {
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 1000;

    if (pageNumber < 1 || pageSizeNumber < 1) {
      throw {
        status: 400,
        message:
          'Invalid page or pageSize values. Both must be positive numbers.',
      };
    }

    return { filter: finalFilter, pageNumber, pageSizeNumber };
  }

  return { filter: finalFilter };
}

export async function printAndUploadBlankChecks({
  mappedChecks,
  ownerId,
  ownerType,
  userId,
  organizationId,
}) {
  const signatureUrl = await getUserSignatureBase64(ownerId, ownerType);
  const organization = await organizationCollection.findById(organizationId);
  const checkHtmlArray = await Promise.all(
    mappedChecks.map(async (check) => {
      const html = await compileBlankTemplate({
        ...check,
        signatureUrl,
        userId,
        organizationId,
        ownerType,
      });
      return `<div style="page-break-after: always;">${html}</div>`;
    })
  );

  const checksHtml = checkHtmlArray.join('');

  const fullHtml = await compileWrapperTemplate(checksHtml);
  const pdfBuffer = await generatePDFBuffer(fullHtml);

  const fileName = `check_${mappedChecks
    .map((c) => c.checkNumber)
    .join('_')}.pdf`;
  await uploadCheckPDF({
    userId,
    pdfBuffer,
    organizationId,
    ownerType,
    fileName,
  });

  const s3Url = await getCheckPDFUrl({
    userId,
    organizationId,
    ownerType,
    fileName,
  });
  return s3Url;
}

export async function checkTrialLimit(userId, insertedChecks) {
  const userDetail = await getUserDetails(userId);
  if (!userDetail) throw new Error('User not found');

  const ownerIds = [];

  const userOrganizations = await userToOrganizationCollection.find({
    userId: userId,
  });

  if (userOrganizations) {
    userOrganizations.forEach((val) => {
      ownerIds.push(val.organizationId);
    });
  }

  if (userDetail.trialMaxChecks > 0) {
    const totalOrgChecks = await checksCollection.countDocuments({
      ownerId: {
        $in: ownerIds,
      },
      ownerType: 'organization',
    });
    const totalUserChecks = await checksCollection.countDocuments({
      ownerId: userId,
      ownerType: 'user',
    });
    if (
      totalOrgChecks + totalUserChecks + insertedChecks >
      userDetail.trialMaxChecks
    ) {
      return {
        status: 'error',
        message: `You have reached the maximum limit of ${userDetail.trialMaxChecks} checks for your trial period.`,
      };
    }
  }

  return {
    status: '',
    message: 'Trial limit check passed',
  };
}

export const getNextAvailableCheckNumber = async (
  ownerId,
  ownerType,
  bankId
) => {
  const bank = await banksCollection.findOne({
    ownerId,
    _id: bankId,
    ownerType,
  });

  if (!bank) {
    throw new Error('No bank found');
  }

  const latestCheck = await checksCollection
    .findOne({
      ownerId,
      ownerType,
      bankId,
    })
    .sort({ checkNumber: -1 })
    .lean();

  const isAutoGeneration = bank.bankPreferences?.checkNoGeneration === 'auto';

  const defaultStartNumber = bank?.bankPreferences?.defaultCheckStartNumber;

  let nextAvailableCheckNumber;

  if (!latestCheck) {
    nextAvailableCheckNumber = isAutoGeneration ? +defaultStartNumber : 1;
  } else {
    if (isAutoGeneration) {
      nextAvailableCheckNumber =
        Math.max(+defaultStartNumber, latestCheck.checkNumber) + 1;
    } else {
      nextAvailableCheckNumber = latestCheck.checkNumber + 1;
    }
  }

  return nextAvailableCheckNumber;
};
