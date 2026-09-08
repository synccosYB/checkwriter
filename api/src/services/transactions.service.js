import {
  banksCollection,
  transactionsCollection,
} from '../models/dbCollections';
import { db } from '../db/index.js';
import {
  transactions as transactionsTable,
  payees as payeesTable,
} from '../db/schema.js';
import { and, asc, desc, eq } from 'drizzle-orm';

// Joined-collection sort fields for the Check Register transactions list.
// These can't be expressed as a plain Mongo field path (the column lives on a
// separate collection), so the controller resolves the ordered _ids via SQL
// and then re-fetches the rows through the regular populate pipeline. The
// shape mirrors `CHECKS_SORTABLE_FIELDS` in checks.service.js.
export const TRANSACTIONS_JOINED_SORTABLE_FIELDS = {
  payeeName: { table: 'payees', column: 'name', localField: 'payeeId' },
};

// Run a sort-aware query against the transactions list and return the
// ordered _ids for one page, ordering by a column on a joined collection
// (e.g. payees.name). `_id desc` is appended as a stable tiebreaker so
// paginated/infinite scroll pages don't repeat or skip rows.
export async function getSortedTransactionIdsPage({
  filter,
  spec,
  sortOrder,
  skip,
  limit,
}) {
  let joinTable;
  if (spec.table === 'payees') joinTable = payeesTable;
  else throw new Error(`Unknown join table: ${spec.table}`);

  const idCol = transactionsTable._id;
  const localCol = transactionsTable[spec.localField];
  const joinCol = joinTable[spec.column];
  const orderCol = sortOrder === 'asc' ? asc(joinCol) : desc(joinCol);
  const tiebreaker = desc(idCol);

  const conds = [];
  for (const [key, value] of Object.entries(filter || {})) {
    if (value === undefined || value === null) continue;
    const col = transactionsTable[key];
    if (!col) continue;
    conds.push(eq(col, value));
  }

  let q = db
    .select({ _id: idCol })
    .from(transactionsTable)
    .leftJoin(joinTable, eq(localCol, joinTable._id));
  if (conds.length > 0) q = q.where(and(...conds));
  q = q.orderBy(orderCol, tiebreaker).offset(skip).limit(limit);
  const rows = await q;
  return rows.map((r) => r._id);
}

export const updateBankBalanceAndTransactionBalanceOnTransactionCreation =
  async (doc) => {
    try {
      const bankId = doc?.bankId;
      const issueDate = doc?.issueDate;

      await recalculateBalances(bankId, issueDate);
    } catch (error) {
      throw error;
    }
  };

export const updateBankBalanceAndTransactionBalanceOnTransactionUpdate = async (
  doc
) => {
  try {
    const bankId = doc?.bankId;
    const issueDate = doc?.issueDate;

    await recalculateBalances(bankId, issueDate);
  } catch (error) {
    throw error;
  }
};

export const updateBankBalanceAndTransactionBalanceOnTransactionDelete = async (
  doc
) => {
  try {
    const bankId = doc?.bankId;
    const issueDate = doc?.issueDate;

    await recalculateBalances(bankId, issueDate);
  } catch (error) {
    throw error;
  }
};

async function recalculateBalances(bankId, startDate = null) {
  try {
    const bank = await banksCollection.findById(bankId).lean();
    if (!bank) {
      throw new Error(`Bank with ID ${bankId} not found`);
    }

    // Find the base starting balance
    let baseBalance = 0;
    let previousTransaction;
    if (startDate) {
      previousTransaction = await transactionsCollection
        .findOne({
          bankId,
          issueDate: { $lt: startDate },
        })
        .sort({ issueDate: -1 })
        .lean(); // Use lean()
      if (previousTransaction) {
        baseBalance = previousTransaction.balance;
      }
    }

    // Build query for transactions to update
    const query = { bankId };
    if (startDate) {
      query.issueDate = { $gte: startDate };
    }

    // Get all affected transactions, sorted by date, and use lean()
    const transactions = await transactionsCollection
      .find(query)
      .sort({ issueDate: 1 })
      .lean();

    if (transactions.length === 0) {
      // If no transactions, just set bank balance to base balance
      await banksCollection.updateOne(
        { _id: bankId },
        { $set: { balance: baseBalance } }
      ); // Use updateOne
      return;
    }

    // Update all transactions with new running balances
    let runningBalance = baseBalance;
    const bulkUpdates = [];

    for (const transaction of transactions) {
      const newBalance =
        transaction.type === 'deposit'
          ? runningBalance + transaction.amount
          : runningBalance - transaction.amount;

      if (transaction.balance !== newBalance) {
        bulkUpdates.push({
          updateOne: {
            filter: { _id: transaction._id },
            update: { $set: { balance: newBalance } },
          },
        });
      }
      runningBalance = newBalance;
    }

    // Perform bulk update if there are changes
    if (bulkUpdates.length > 0) {
      await transactionsCollection.bulkWrite(bulkUpdates);
    }

    await banksCollection.updateOne(
      { _id: bankId },
      { $set: { balance: runningBalance } }
    );
  } catch (error) {
    console.error('Error recalculating balances:', error);
    throw error;
  }
}
