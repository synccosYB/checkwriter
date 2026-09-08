import { payeesCollection } from '../models/dbCollections.js';
import {
  validateEmail,
  validateName,
  validatePhone,
} from '../utils/common.util.js';

export const payeeDataValidationMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { body } = req;
    const { ownerType } = req.params;
    const organizationId = req.organizationId;

    const mandatoryFields = ['name'];
    const missingFields = [];
    mandatoryFields.forEach((field) =>
      body && body[field] ? true : missingFields.push(field)
    );
    if (missingFields && missingFields.length) {
      throw new Error(
        'Missing fields - [' + missingFields + '] in request body'
      );
    }

    if (body.phone) {
      // ! Validate payee phone
      let bool = validatePhone(req.body.phone);
      if (!bool)
        throw new Error(
          JSON.stringify({
            userMessage: 'Payee phone is not valid',
            statusCode: 409,
          })
        );
    }

    if (body.email) {
      // ! Validate payee email
      let bool = validateEmail(req.body.email);
      if (!bool)
        throw new Error(
          JSON.stringify({
            userMessage: 'Payee email is not valid',
            statusCode: 409,
          })
        );
    }
    next();
  } catch (error) {
    console.error('err', error);
    res.status(500).send({ error });
  }
};

async function validatePayeeNickname(id, nickName, ownerType) {
  try {
    const payee = await payeesCollection.findOne({
      ownerId: id,
      ownerType,
      nickName,
    });

    if (payee && payee.nickName === nickName) return false;

    return true;
  } catch (error) {
    throw error;
  }
}
