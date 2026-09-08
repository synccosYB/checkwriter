import { checksCollection } from './dbCollections.js';

export const getChecksDataWithPayeesAndBankingDetails = async (
  userId,
  checkIds,
  ownerType
) => {
  validateCheckIds(userId, checkIds);

  const checksDetails = await checksCollection
    .find({
      ownerId: userId,
      _id: { $in: checkIds },
      ownerType,
    })
    .populate('bankId') // Populates the bank information
    .populate('payeeId') // Populates the payee information
    .lean();

  const printReadyData = checksDetails.map((check) => ({
    id: check._id,
    checkNumber: check.checkNumber,
    amount: check.amount,
    issuedDate: check.issuedDate,
    status: check.status,
    memo: check.memo,

    bankDetails: {
      accountNumber: check.bankId.accountNumber,
      routingNumber: check.bankId.bankRoutingNumber,
      bankName: check.bankId.bankName,
    },
    payee: {
      name: check.payeeId.name,
      companyName: check.payeeId.companyName,
    },
  }));

  return printReadyData;
};

const validateCheckIds = (userId, checkIds) => {
  if (!userId || !Array.isArray(checkIds) || checkIds.length === 0) {
    throw new Error('Invalid input parameters');
  }
};
