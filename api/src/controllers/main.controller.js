import adminController from '../controllers/admin.controller.js';
import healthCheckController from './health-check.controller.js';
import subscribeController from './subscribe.controller.js';
import usersController from './users.controller.js';
import authenticateController from './authentication.controller.js';
import checksController from './checks.controller.js';
import verificationController from './verification.controller.js';
import autoFillController from './autoFill.controller.js';
import shippoController from './shippo.controller.js';
import stripeController from './stripe.controller.js';
import plaidController from './plaid.controller.js';
import paymentLinkController from './paymentLink.controller.js';
import quickbooksController from './quickbooks.controller.js';
import postgridController from './postgrid.controller.js';
import manageSubscriptionController from './managesubscription.controller.js';
import transactionsController from './transactions.controller.js';
import mfaController from './mfa.controller.js';
import validationController from './validation.controller.js';
import payeesController from './payees.controller.js';
import banksController from './banks.controller.js';
import addressesController from './addresses.controller.js';
import tagsController from './tags.controller.js';
import groupsController from './groups.controller.js';
import attachmentsController from './attachments.controller.js';
import checksImportController from './checkImport.controller.js';
import lobController from './lob.controller.js';
import carrierShipmentController from './carrierShipment.controller.js';
import shippingController from './shipping.controller.js';
import scheduledJobsController from './scheduledJobs.controller.js';

export const routes = (app, express) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    return res
      .status(200)
      .send(
        'Welcome Test to synccos-check-writer, Hope you are not having a bad day like me! :=( '
      );
  });

  app.use('/', router);
  app.use('/health-check', healthCheckController);
  app.use('/subscribe', subscribeController);
  app.use('/users', usersController);
  app.use('/auth', authenticateController);
  app.use('/checks', checksController);
  app.use('/verify', verificationController);
  app.use('/autoFill', autoFillController);
  app.use('/shippo', shippoController);
  app.use('/stripe', stripeController);
  app.use('/plaid', plaidController);
  app.use('/payment-link', paymentLinkController);
  app.use('/quickbooks', quickbooksController);
  app.use('/postgrid', postgridController);
  app.use('/managesubscription', manageSubscriptionController);
  app.use('/checkregister_transactions', transactionsController);
  app.use('/mfa', mfaController);
  app.use('/validate', validationController);
  app.use('/admin', adminController);
  app.use('/payees', payeesController);
  app.use('/banks', banksController);
  app.use('/addresses', addressesController);
  app.use('/tags', tagsController);
  app.use('/groups', groupsController);
  app.use('/attachments', attachmentsController);
  app.use('/checks-import', checksImportController);
  app.use('/lob', lobController);
  app.use('/carrier-shipment', carrierShipmentController);
  app.use('/shipping', shippingController);
  app.use('/scheduled-jobs', scheduledJobsController);
};
