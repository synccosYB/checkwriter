import { validateMandatoryFields } from '../utils/common.util.js';

export const checkDataValidationMiddleware = async (req, res, next) => {
  try {
    const requestData = req.body;

    if (requestData && requestData != undefined) {
      let checkDetails = {};

      for (const item of requestData) {
        checkDetails = item;

        if (checkDetails.status != 'BLANK') {
          let missingFields = await validateMandatoryFields(checkDetails, [
            // "checkNumber",
            // "amount",
            // "issuedDate",
            // "payee",
            'bankDetails',
            // "address",
          ]);
          if (missingFields && missingFields.length) {
            throw new Error(
              JSON.stringify({
                statusCode: 400,
                developerMessage:
                  'Fields - ' + missingFields + ' missing in request body',
              })
            );
          }

          if (checkDetails.address) {
            missingFields = await validateMandatoryFields(
              checkDetails.address,
              ['addressId']
            );
            if (missingFields && missingFields.length) {
              throw new Error(
                JSON.stringify({
                  statusCode: 400,
                  developerMessage:
                    'Fields - ' +
                    missingFields +
                    ' missing in request body - address object',
                })
              );
            }
          }
        }

        if (
          checkDetails.issuedDate &&
          !moment(new Date(checkDetails.issuedDate)).isValid
        ) {
          throw new Error(
            JSON.stringify({
              statusCode: 400,
              developerMessage:
                'Invalid Entry for request body parameter - issuedDate',
            })
          );
        }
      }

      next();
    }

    return;
  } catch (error) {
    res.status(500).send({ error });
  }
};
