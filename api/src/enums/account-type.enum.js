export const ACCOUNT_TYPES_ENUM = {
  checking: 'CHECKING',
  savings: 'SAVINGS',
  moneyMarket: 'MONEY MARKET',
  certificateOfDeposit: 'CERTIFICATE OF DEPOSIT',
  business: 'BUSINESS',
  joint: 'JOINT',
  trust: 'TRUST',
};

export const getAllAccountTypesEnum = () => {
  const result = [];
  Object.keys(ACCOUNT_TYPES_ENUM).forEach((key) =>
    result.push(ACCOUNT_TYPES_ENUM[key])
  );
  return result;
};

// 'CHECKING', 'SAVINGS', 'MONEY MARKET', 'CERTIFICATE OF DEPOSIT', 'BUSINESS', 'JOINT', 'TRUST'
