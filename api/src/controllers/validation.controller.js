import express from 'express';
import { sendOTPviaPhoneNumber } from '../models/mfa.model.js';
import {
  generateOTP,
  maskEmailAddress,
  maskPhoneNumber,
  validateMethodType,
} from '../utils/common.util.js';
import { sendOtpVerificationMail } from '../services/email.service.js';
import {
  checkSubscription,
  computeMfaExpiresAt,
  generateAuthenticationTokens,
  updateAuthenticationInDb,
  validateAuthenticatorApp,
  validateEmailAndPhoneNumber,
} from '../services/authentication.service.js';
import { mfaCollection } from '../models/dbCollections.js';
import { createMfaGraceJwt } from '../utils/jwt.util.js';

const router = express.Router();

/**
 * @swagger
 * /validate/mfa-methods:
 *   get:
 *     summary: Get masked MFA methods for the authenticated user
 *     description: Retrieves the MFA methods associated with the user, masking sensitive data like email addresses and phone numbers.
 *     tags:
 *       - Validate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved MFA methods.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 defaultMethod:
 *                   type: string
 *                   example: "phone"
 *                 defaultMethodId:
 *                   type: string
 *                   example: "605c72e8f1b6c92ff7e2f7b5"
 *                 userId:
 *                   type: string
 *                   example: "605c72e8f1b6c92ff7e2f7b2"
 *                 enableMfa:
 *                   type: boolean
 *                   example: true
 *                 methods:
 *                   type: object
 *                   properties:
 *                     emails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "605c72e8f1b6c92ff7e2f7b6"
 *                           value:
 *                             type: string
 *                             example: "j***@gmail.com"
 *                     phoneNumbers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "605c72e8f1b6c92ff7e2f7b7"
 *                           value:
 *                             type: string
 *                             example: "+1-***-***-7890"
 *                           defaultDeliveryMethod:
 *                             type: string
 *                             example: "sms"
 *                     authenticatorApps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "605c72e8f1b6c92ff7e2f7b8"
 *                           value:
 *                             type: string
 *                             example: "Google Authenticator"
 *       404:
 *         description: MFA methods not found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "MFA methods not found"
 *       500:
 *         description: Internal server error while retrieving MFA methods.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching MFA methods."
 */

router.get('/mfa-methods', async (req, res, next) => {
  try {
    const userId = req.userId;
    const mfaMethods = await mfaCollection.findOne({ userId });

    if (!mfaMethods) {
      throw new Error('MFA methods not found');
    }

    const maskedEmails = mfaMethods?.methods?.emails?.map(
      ({ _id, address }) => {
        return { _id, value: maskEmailAddress(address) };
      }
    );

    const maskedPhoneNumbers = mfaMethods?.methods?.phoneNumbers?.map(
      ({ _id, phoneNumber, defaultDeliveryMethod }) => {
        return {
          _id,
          value: maskPhoneNumber(phoneNumber),
          defaultDeliveryMethod,
        };
      }
    );

    const maskedAuthenticatorApps = mfaMethods?.methods?.authenticatorApps?.map(
      ({ _id, label }) => {
        return { _id, value: label };
      }
    );

    const maskedMehods = {
      defaultMethod: mfaMethods.defaultMethod,
      defaultMethodId: mfaMethods.defaultMethodId,
      userId: mfaMethods.userId,
      enableMfa: mfaMethods.enableMfa,
      methods: {
        emails: maskedEmails,
        phoneNumbers: maskedPhoneNumbers,
        authenticatorApps: maskedAuthenticatorApps,
      },
    };

    return res.status(200).json(maskedMehods);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /validate/mfa/send-verification-code:
 *   post:
 *     summary: Send MFA Verification Code
 *     description: Sends a verification code to the user's email or phone for MFA. Authenticator apps do not require a verification code.
 *     tags:
 *       - Validate
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - methodType
 *               - methodId
 *             properties:
 *               methodType:
 *                 type: string
 *                 enum: [email, phoneNumber, authenticatorApp]
 *                 description: Type of MFA method. `authenticatorApp` does not require sending a code.
 *               methodId:
 *                 type: string
 *                 format: uuid
 *                 description: Unique identifier of the MFA method.
 *                 example: "605c72e8f1b6c92ff7e2f7b5"
 *               defaultDeliveryMethod:
 *                 type: string
 *                 enum: [sms, call]
 *                 description: Only applicable for `phoneNumber` MFA type.
 *                 example: "sms"
 *     responses:
 *       200:
 *         description: Verification code sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 codeSent:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Verification Code Sent"
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authenticator App does not need sending verification code"
 *       404:
 *         description: MFA method not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Method not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while processing the request."
 */

router.post('/mfa/send-verification-code', async (req, res, next) => {
  try {
    const userId = req.userId;

    const { methodType, methodId, defaultDeliveryMethod } = req.body;

    if (methodType === 'authenticatorApp') {
      new Error('Authnticator App does not need sending verification code');
    }

    validateMethodType(methodType);

    const verificationCode = generateOTP();

    const doc = await mfaCollection.findOne({ userId });

    if (!doc) throw new Error('No Mfa Method Defined');

    const methodIndex = doc.methods[`${methodType}s`].findIndex(
      (item) => item._id.toString() === methodId
    );

    if (methodIndex === -1) throw new Error('Method not found');

    doc.methods[`${methodType}s`][methodIndex].verificationCode =
      verificationCode;

    const value =
      doc.methods[`${methodType}s`][methodIndex].address ||
      doc.methods[`${methodType}s`][methodIndex].phoneNumber;

    await doc.save();

    switch (methodType) {
      case 'email':
        await sendOtpVerificationMail(value, verificationCode);

        break;
      case 'phoneNumber':
        await sendOTPviaPhoneNumber(
          value,
          verificationCode,
          defaultDeliveryMethod
        );
        break;
      default:
        break;
    }

    return res
      .status(200)
      .json({ codeSent: true, message: 'Verification Code Sent' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /validate/mfa/verify-otp:
 *   post:
 *     summary: Verify MFA OTP
 *     description: Verifies the OTP for the specified MFA method. If valid, generates new authentication tokens.
 *     tags:
 *       - Validate
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - methodType
 *               - otp
 *               - methodId
 *             properties:
 *               methodType:
 *                 type: string
 *                 enum: [email, phoneNumber, authenticatorApp]
 *                 description: The MFA method being verified.
 *                 example: "email"
 *               otp:
 *                 type: string
 *                 description: The one-time password (OTP) provided by the user.
 *                 example: "123456"
 *               methodId:
 *                 type: string
 *                 format: uuid
 *                 description: Unique identifier of the MFA method.
 *                 example: "605c72e8f1b6c92ff7e2f7b5"
 *     responses:
 *       200:
 *         description: MFA verification successful. Returns new authentication tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1..."
 *                 refreshToken:
 *                   type: string
 *                   example: "dGhpcyBpcyBhIHJlZnJlc2hUb2tlbg..."
 *                 subscriptionTaken:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid OTP or method type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP"
 *       404:
 *         description: MFA method not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No MFA Method Defined"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while processing the request."
 */

router.post('/mfa/verify-otp', async (req, res, next) => {
  try {
    const userId = req.userId;
    const adminId = req.adminId;
    const { methodType, otp, methodId } = req.body;

    let response = {};

    validateMethodType(methodType);

    const doc = await mfaCollection.findOne({ userId });

    if (!doc) throw new Error('No Mfa Method Defined');

    switch (methodType) {
      case 'email':
      case 'phoneNumber':
        response = await validateEmailAndPhoneNumber(
          doc,
          methodId,
          methodType,
          otp,
          res
        );
        break;
      case 'authenticatorApp':
        response = validateAuthenticatorApp(doc, methodId, methodType, otp);
        break;
      default:
        throw new Error('Invalid MFA method type');
    }
    const mfaExpiresAt = computeMfaExpiresAt();
    const tokenPayload = {
      userId,
      isValidated: true,
      enableMfa: true,
      mfaExpiresAt,
    };

    if (adminId) {
      tokenPayload['adminId'] = adminId;
    }

    const newTokens = await generateAuthenticationTokens(tokenPayload);

    const resFromDb = await updateAuthenticationInDb(userId, {
      refreshToken: newTokens.refreshToken,
    });

    if (!resFromDb) {
      throw new Error('Unable to update user authentication tokens');
    }

    let subscription_taken = false;
    subscription_taken = await checkSubscription(userId);
    newTokens['subscriptionTaken'] = subscription_taken;

    const isProd = process.env.NODE_ENV === 'production';

    const host = req.hostname; 
    let cookieDomain = undefined;

    if (isProd && host.includes('.')) {
      const parts = host.split('.');
      cookieDomain = `.${parts.slice(-2).join('.')}`; // ".synccoschecking.com"
    }

    res.cookie('mfa_grace', createMfaGraceJwt({ userId, mfaExpiresAt }), {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: 'Lax',
      path: '/',
      ...(isProd ? { domain: cookieDomain } : {}),
      maxAge: 24 * 60 * 60 * 1000,
      expires: mfaExpiresAt,
    });

    return res.status(200).json(newTokens);
  } catch (error) {
    next(error);
  }
});

export default router;
