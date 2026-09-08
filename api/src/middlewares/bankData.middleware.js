import { ACCOUNT_TYPES_ENUM } from '../enums/account-type.enum.js';
import { validateMandatoryFields } from '../utils/common.util.js';

export const bankDataValidationMiddleware = async (req, res, next) => {
  try {
    if (
      !(
        req.body &&
        req.body.country &&
        ['USA', 'CANADA'].includes(req.body.country.toUpperCase())
      )
    ) {
      return res.status(400).json({
        message: 'Invalid country. Only USA or Canada are allowed.',
        error: {
          type: 'validation',
          field: 'country',
          reason: 'Invalid country. Only USA or Canada are allowed.',
        },
      });
    }

    const country = req.body.country.toUpperCase();
    const requiredFields =
      country === 'USA'
        ? ['bankName', 'accountType', 'accountNumber', 'bankRoutingNumber']
        : [
            'bankName',
            'accountType',
            'accountNumber',
            'bankTransitNumber',
            'financialInstituteNumber',
          ];

    const missingFields = await validateMandatoryFields(
      req.body,
      requiredFields
    );
    if (missingFields && missingFields.length) {
      const fieldList = missingFields.join(', ');
      return res.status(400).json({
        message: `Please provide the following required fields: ${fieldList}.`,
        error: {
          type: 'validation',
          fields: missingFields,
          reason: `Missing required fields: ${fieldList}`,
        },
      });
    }

    req.payload = formatBankDataPayload(req.body);
    return next();
  } catch (err) {
    return next(err);
  }
};

const formatBankDataPayload = (body) => {
  if (!body) {
    return;
  }
  const payload = {
    bankName: body && body.bankName ? body.bankName : null,
    accountType:
      body && body.accountType && ACCOUNT_TYPES_ENUM[body.accountType]
        ? ACCOUNT_TYPES_ENUM[body.accountType]
        : null,
    accountName: body && body.accountName ? body.accountName : null,
    accountNickName: body && body.accountNickName ? body.accountNickName : null,
    accountNumber: body && body.accountNumber ? body.accountNumber : null,
    bankRoutingNumber:
      body && body.bankRoutingNumber ? body.bankRoutingNumber : null,
    bankTransitNumber:
      body && body.bankTransitNumber ? body.bankTransitNumber : null,
    financialInstituteNumber:
      body && body.financialInstituteNumber
        ? body.financialInstituteNumber
        : null,
    country: body && body.country ? body.country.toUpperCase() : null,
    bankAddress1: body && body.bankAddress1 ? body.bankAddress1 : null,
    bankCity: body && body.bankCity ? body.bankCity : null,
    bankState: body && body.bankState ? body.bankState : null,
    bankZip: body && body.bankZip ? body.bankZip : null,
    bankPhone: body && body.bankPhone ? body.bankPhone : null,
    bankPreferences: {
      defaultCheckNumberLength: 6,
      defaultCheckStartNumber: 1,
    },
    balance: 0,
  };
  return payload;
};
