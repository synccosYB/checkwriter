import express from 'express';
import {
  addBankRoutingNum,
  getRegionAddress,
  fetchBankFromZyla,
} from '../services/autoFill.services.js';
import { getBankAddressDetails } from '../models/bankAutoFill.model.js';

const router = express.Router();

router.get('/getBankAddress/:routingNumber', async (req, res, next) => {
  try {
    const { routingNumber } = req.params;
    if (!routingNumber) {
      throw new Error(
        JSON.stringify({
          statuscode: 400,
          developerMessage: 'No routing Number',
        })
      );
    }

    const payload = {
      routingNumber: routingNumber,
    };

    const resFromDb = await getBankAddressDetails(payload);
    if (resFromDb) {
      return res.status(200).json(resFromDb);
    }

    const bankData = await fetchBankFromZyla(routingNumber);
    if (!bankData) {
      return res.status(200).json([]);
    }

    const addData = addBankRoutingNum(bankData);
    if (!addData) {
      throw new Error('Unable to add data');
    }

    return res.status(200).json([bankData]);
  } catch (err) {
    next(err);
  }
});

router.get('/region/:pincode', async (req, res, next) => {
  try {
    const { pincode } = req.params;
    if (!pincode) {
      throw new Error(
        JSON.stringify({
          statuscode: 400,
          developerMessage: 'No zipcode',
        })
      );
    }
    const resFromDb = await getRegionAddress(pincode);
    if (!resFromDb) {
      throw new Error('unable to get region');
    }
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

export default router;
