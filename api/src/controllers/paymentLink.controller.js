import express from 'express';
import config from 'config';
import trialMiddleware from '../middlewares/trial.middleware.js';
import demoRestrictionMiddleware from '../middlewares/demoRestriction.middleware.js';

import {
  createStripeUser,
  deleteUserAccount,
  getUserStripeAccount,
  updateUserAccount,
} from '../models/stripe.model.js';

import { sendPaymentRequestEmail } from '../services/email.service.js';
import {
  GetUserPaymentDetails,
  createPaymentLink,
  downloadPaymentReceit,
  getPaginatedPaymentLinksByUserId,
  resendPaymentLink,
} from '../models/paymentLink.model.js';
import moment from 'moment';
import {
  addressesCollection,
  organizationCollection,
  PaymentLinkCollection,
  usersCollection,
} from '../models/dbCollections.js';
import { paymentLinkStripeClient } from '../services/paymentLinkStripe.service.js';

const {
  stripe_payment_links: { client_id },
} = config;

const router = express.Router();

router.get('/get-oauth-link/:ownerType', demoRestrictionMiddleware, async (req, res, next) => {
  try {
    const { redirectUrl, ownerId } = req.query;
    const { ownerType } = req.params;

    const args = new URLSearchParams({
      state: `${ownerId} ${ownerType}`,
      client_id: client_id,
      scope: 'read_write',
      response_type: 'code',
      redirect_uri: redirectUrl,
    });
    const url = `https://connect.stripe.com/oauth/authorize?${args.toString()}`;
    return res.send({ url });
  } catch (err) {
    next(err);
  }
});

router.get('/authorize-oauth', async (req, res, next) => {
  const { code, state } = req.query;

  const ownerId = state.split(' ')[0];
  const ownerType = state.split(' ')[1];

  try {
    const response = await paymentLinkStripeClient.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const connected_account_id = response.stripe_user_id;

    await saveAccountId(connected_account_id, ownerId, ownerType);

    return res.send({ success: true, message: 'stripe account connected' });
  } catch (err) {
    if (err.type === 'StripeInvalidGrantError') {
      return res
        .status(400)
        .json({ error: 'Invalid authorization code: ' + code });
    } else {
      next(err);
    }
  }
});

const saveAccountId = async (id, ownerId, ownerType) => {
  const payload = {
    ownerId,
    ownerType,
  };

  const accountExists = await getUserStripeAccount(payload);

  if (accountExists) {
    await updateUserAccount(payload, { stripeAccountId: id });
    return;
  }

  payload.stripeAccountId = id;

  await createStripeUser(payload);
};

// success route
const successHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <style>
      /* Success Tick css */

      .main-div svg {
        display: block;
        height: 20vw;
        width: 20vw;
        color: green; /* SVG path use currentColor to inherit this */
        margin: 0 auto 3rem;
      }

      .main-div .circle {
        stroke-dasharray: 76;
        stroke-dashoffset: 76;
        animation: draw 1s forwards;
      }

      .main-div .tick {
        stroke-dasharray: 18;
        stroke-dashoffset: 18;
        animation: draw 1s forwards 1s;
      }

      @keyframes draw {
        to {
          stroke-dashoffset: 0;
        }
      }

      .main-div h2.success-header {
        font-size: 2rem;
        color: rgba(0, 0, 0, 0.7);
      }
      /* For styling demo, not required */

      body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #fff;
      }

      /* Success Tick css ends */
    </style>
  </head>
  <body>
    <div class="main-div">
      <div class="success-tick">
        <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
          <g
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="circle"
              d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"
            />
            <path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621" />
          </g>
        </svg>
      </div>
      <h2 class="success-header">Payment Successfully Done</h2>
    </div>
  </body>
</html>`;

// Endpoint to handle payment success
router.get('/payment-success-html', (req, res) => {
  res.send(successHtml);
});

// Route for generating payment link
router.post(
  '/generate-payment-link/:ownerType',
  demoRestrictionMiddleware,
  trialMiddleware,
  async (req, res, next) => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;

      const organizationId = req.organizationId;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const origin = req.headers.host;
      const userEmail = req.body.email;
      const recipientEmail = req.body.recipientEmail;
      const recipientName = req.body.recipientName;
      const amount = req.body.amount;
      const currency = 'USD';
      const purpose = req.body.purpose;
      const invoiceNumber = req.body.invoiceNumber;
      const dueDate = req.body.dueDate;
      const stripeUserId = req.body.stripeUserId;
      const sendEmail = req.body.sendEmail || false;

      const protocol = req.protocol; // http or https
      const host = req.headers.host; // includes domain + port
      const backendUrl = `${protocol}://${host}`;

      let userDocument;
      if (organizationId) {
        userDocument = await organizationCollection.findById(organizationId);
      } else {
        userDocument = await usersCollection.findById(userId);
      }

      let senderOrganisation = '';
      let senderAddress = '';
      let senderName = '';


      if (organizationId) {
        senderOrganisation = userDocument.get('organizationName');

        senderAddress = await addressesCollection
          .findOne({
            ownerId: organizationId,
            ownerType: 'organization',
          })
          .lean();
      } else {
        senderAddress = await addressesCollection
          .findOne({
            ownerId: userId,
            ownerType: 'user',
          })
          .lean();
        senderName = senderAddress?.name;
        senderAddress =
          senderAddress?.addressLine1 +
          ' ' +
          senderAddress?.addressLine2 +
          '\n' +
          senderAddress?.city +
          ' ' +
          senderAddress?.state +
          '\n' +
          senderAddress?.country +
          ' ' +
          senderAddress?.zipCode;
      }

      const user = await getUserStripeAccount({ ownerId, ownerType });

      if (!(user && user.stripeAccountId)) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Create a payment link using Stripe Checkout
      const session = await paymentLinkStripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: recipientEmail,
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: purpose, // Purpose of payment shown in the Checkout page
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          email: userEmail,
          recipientEmail: recipientEmail,
          amount: amount,
          currency: currency,
          purpose: purpose,
          stripeAccountId: user.stripeAccountId,
          userId: userDocument._id.toString(),
          invoiceNumber: invoiceNumber,
          senderName: senderName,
          senderOrganisation: senderOrganisation,
          dueDate: dueDate,
          isPaymentLink: true,
        },
        mode: 'payment',
        success_url: `${backendUrl}/payment-link/payment-success-html`, // URL to redirect after successful payment
        cancel_url: `${backendUrl}/payment-link/payment-cancel`, // URL to redirect if the user cancels payment
        payment_intent_data: {
          // Set the destination account (user's connected Stripe account ID) for the Direct Charge Transfer
          transfer_data: {
            destination: user.stripeAccountId,
          },
        },
      });

      // Send the payment link to User 2's email using sendPaymentLinkEmail function
      if(sendEmail) {
        const result = await sendPaymentRequestEmail(
        userEmail,
        senderOrganisation,
        senderName,
        senderAddress,
        recipientEmail,
        recipientName,
        amount,
        purpose,
        invoiceNumber,
        session.url
      );
      }

      // Save to db
      const payload = {
        email: userEmail,
        stripeAccountId: user.stripeAccountId,
        recipientName: recipientName,
        recipientEmail: recipientEmail,
        // transactionId: .id,
        amount: amount,
        currency: currency,
        purpose: purpose,
        status: 'pending',
        ownerId,
        ownerType,
        invoiceNumber: invoiceNumber,
        dueDate: dueDate,
        paymentLink: session.url,
        createdAtUnix: moment.utc().format('X'),
        updatedAtUnix: moment.utc().format('X'),
        sessionId: session.id,
        stripeUserId,
      };
      const savedPaymentLink = await createPaymentLink(payload);

      res
        .status(200)
        .json({ payment_link: session.url, result: savedPaymentLink, sessionId: session.id });
    } catch (err) {
      console.error('Error generating payment link:', err);
      next(err);
    }
  }
);

router.post('/getUserPayments/:ownerType', async (req, res, next) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;

    const { ownerType } = req.params;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const userDocument = await getPaginatedPaymentLinksByUserId({ ...req.body, ownerType, ownerId });

    res.status(200).send(userDocument);
  } catch (err) {
    next(err);
  }
});

router.get('/getUserStripeAccount/:ownerType', async (req, res, next) => {
  try {
    const { ownerType } = req.params;
    const userId = req.userId;

    const organizationId = req.organizationId;

    const ownerId = ownerType === 'user' ? userId : organizationId;

    let userAccount = await getUserStripeAccount({
      ownerType,
      ownerId,
    });

    if (!userAccount) {
      userAccount = null;
    }

    res.status(200).send({ userAccount });
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/deleteUserAccount/:ownerType',
  trialMiddleware,
  async (req, res, next) => {
    try {
      const { ownerType } = req.params;
      const userId = req.userId;

      const organizationId = req.organizationId;

      const ownerId = ownerType === 'user' ? userId : organizationId;
      await deleteUserAccount({ ownerId, ownerType });

      res.status(200).json({ message: 'Deleted user account successfully' });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/:id/:ownerType/cancel', async (req, res, next) => {
  try {
    const { id, ownerType } = req.params;
    const userId = req.userId;

    const organizationId = req.organizationId;

    const ownerId = ownerType === 'user' ? userId : organizationId;

    const paymentLink = await PaymentLinkCollection.findOne({
      _id: id,
      ownerId,
    });

    if (!paymentLink) throw new Error('Payment Link not found');

    const sessionId = paymentLink.sessionId;

    const currentSession =
      await paymentLinkStripeClient.checkout.sessions.retrieve(sessionId);

    if (currentSession.status === 'expired') {
      return res.status(500).send({
        message:
          'Payment Link is already expired and therefore not cancellable.',
        sessionStatus: currentSession.status,
      });
    } else if (currentSession.status === 'complete') {
      return res.status(500).send({
        message:
          'Payment Link has already been completed and therefore not cancellable.',
        sessionStatus: currentSession.status,
      });
    }

    await PaymentLinkCollection.findOneAndUpdate(
      { sessionId, _id: id, ownerId },
      { status: 'canceled' }
    );

    await paymentLinkStripeClient.checkout.sessions.expire(sessionId);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.send({ message: 'Link Expired successfully' });
  } catch (error) {
    next(error);
  }
});


router.post('/resend-email/:id/:ownerType', async (req, res, next) => {
  try {
    const { id, ownerType } = req.params;
    const userId = req.userId;
    const organizationId = req.organizationId;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const paymentLink = await PaymentLinkCollection.findOne({
      _id: id,
      ownerId,
    });

    if (!paymentLink) {
      return res.status(404).json({ message: 'Payment link not found' });
    }

    await resendPaymentLink(paymentLink)

    res.status(200).json({ message: 'Email resent successfully' });
  } catch (err) {
    console.error('Error resending email:', err);
    next(err);
  }
});

router.post('/download-receipt/:id/:ownerType', async (req, res, next) => {
   try {
       const { id, ownerType } = req.params;
        const userId = req.userId;
        const organizationId = req.organizationId;
        const ownerId = ownerType === 'user' ? userId : organizationId;

      const paymentLink = await PaymentLinkCollection.findOne({
      _id: id,
      ownerId,
      });

      if (!paymentLink) throw new Error('Payment Link not found');

      const url = await downloadPaymentReceit(paymentLink);
  
      res.status(200).json({ url });
  
    } catch (error) {
      console.error('Error resending email:', error);
      res.status(500).json(error)
    }
})

export default router;
