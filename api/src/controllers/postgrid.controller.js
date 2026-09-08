import express from 'express';
import {
  sendCheque,
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  getChequeById,
  getAllCheques,
  deleteCheque,
  getChequeProgress,
  createWebhook,
  collectPaymentStripePostgrid,
} from '../services/postgrid.services.js';
import subscriptionMiddleware from '../middlewares/subscription.middleware.js';

const router = express.Router();

router.post('/rates', (req, res, next) => {
  try {
    const { checkDetails } = req.body;
    // checkDetails = [checkIds]
    const rates = [];
    const length = checkDetails.length;
    for (let i = 0; i < length; i++) {
      rates.push({ checkId: checkDetails[i], rate: 1.05 * 1.2 });
    }
    return res.status(200).json(rates);
  } catch (err) {
    next(err);
  }
});

router.post('/acceptStripePayment', async (req, res, next) => {
  try {
    const { checksDetails } = req.body;
    // checkDetails -> [{checkNumber, payeeName, totalAmount, checkId}]
    const { userId, organizationId } = req;
    const origin = req.get('Origin') || 'http://localhost:7777';
    if (organizationId) checksDetails.organizationId = organizationId;
    else checksDetails.userId = userId;
    // ! first collect payment through stripe
    const checkoutUrl = await collectPaymentStripePostgrid(
      checksDetails,
      origin
    );
    return res.status(200).json(checkoutUrl);
  } catch (err) {
    next(err);
  }
});

router.get('/bankAccounts', async (req, res, next) => {
  try {
    const bankAccounts = await getBankAccounts();
    return res.status(200).json(bankAccounts);
  } catch (err) {
    next(err);
  }
});

router.get('/bankAccountById/:bankId', async (req, res, next) => {
  try {
    const bankId = req.params.bankId;
    const bankAccount = await getBankAccountById(bankId);
    return res.status(200).json(bankAccount);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/createBankAccount',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { bankDetails } = req.body;
      const response = await createBankAccount(bankDetails);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/cheques/:chequeId', async (req, res, next) => {
  try {
    const chequeId = req.params.chequeId;
    const response = await getChequeById(chequeId);
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/cheques', async (req, res, next) => {
  try {
    const { userId, organizationId } = req;
    const allCheques = await getAllCheques(
      organizationId ? organizationId : userId
    );
    return res.status(200).json(allCheques);
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/cheques/:chequeId',
  subscriptionMiddleware,
  async (req, res, next) => {
    try {
      const { chequeId } = req.params;
      const response = await deleteCheque(chequeId);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/trackCheque/:chequeId', async (req, res, next) => {
  try {
    const { chequeId } = req.params;
    const chequeProgress = await getChequeProgress(chequeId);
    return res.status(200).json(chequeProgress);
  } catch (err) {
    console.error(err.response.data);
    next(err);
  }
});

//ngrok url -> https://5994-117-214-137-233.ngrok-free.app

router.post('/webhook', async (req, res, next) => {
  try {
    const webhook = await createWebhook();
    return res.status(200).json(webhook);
  } catch (err) {
    next(err);
  }
});

router.post('/webhookEvents', async (req, res, next) => {
  try {
    const signature = req.get('X-Signature');
    return res.status(200).send(signature);
  } catch (err) {
    next(err);
  }
});
export default router;
