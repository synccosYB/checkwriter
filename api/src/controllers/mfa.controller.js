import express from 'express';
import config from 'config';
import {
  addMfaMethod,
  enableMfa,
  generateAuthenticatorAppSecret,
  getUserMfa,
  removeMfaMethod,
  sendVerificationCode,
  updateDefaultMethod,
  updateMfaMethod,
  verifyAuthenticatorApp,
  verifyOtp,
} from '../models/mfa.model.js';
import { userExistenceMiddleware } from '../middlewares/userExistence.middleware.js';
import { validateMethodType } from '../utils/common.util.js';
import { usersCollection } from '../models/dbCollections.js';

const router = express.Router();

router.use(userExistenceMiddleware);

/**
 * @swagger
 * /mfa/methods:
 *   get:
 *     summary: Get MFA methods for the user
 *     description: Retrieve the Multi-Factor Authentication (MFA) methods set for the authenticated user.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: The ID of the user
 *                 methods:
 *                   type: object
 *                   properties:
 *                     emails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           address:
 *                             type: string
 *                             description: Email address
 *                           verified:
 *                             type: boolean
 *                             description: Indicates if the email is verified
 *                           label:
 *                             type: string
 *                             description: Label for the email method
 *                     phoneNumbers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           phoneNumber:
 *                             type: string
 *                             description: Phone number
 *                           verified:
 *                             type: boolean
 *                             description: Indicates if the phone number is verified
 *                           defaultDeliveryMethod:
 *                             type: string
 *                             description: Default delivery method (SMS or call)
 *                           label:
 *                             type: string
 *                             description: Label for the phone number method
 *                     authenticatorApps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           secret:
 *                             type: string
 *                             description: Secret for the authenticator app
 *                           verified:
 *                             type: boolean
 *                             description: Indicates if the authenticator app is verified
 *                           label:
 *                             type: string
 *                             description: Label for the authenticator app method
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

router.get('/methods', async (req, res) => {
  try {
    const userMfa = await getUserMfa(req.userId);

    res.send(userMfa);
  } catch (e) {
    console.error(e, 'ERROR IN MFA METHODS');
    res.status(500).send({ error: e });
  }
});

/**
 * @swagger
 * /mfa/add-method:
 *   post:
 *     summary: Create MFA method for a user
 *     description: Save or update Multi-Factor Authentication (MFA) methods for a specific user.
 *     tags:
 *       - MFA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               methodType:
 *                 type: string
 *                 enum:
 *                   - email
 *                   - phoneNumber
 *                   - authenticatorApp
 *                 description: The type of MFA method being added (email, phone number, or authenticator app).
 *               value:
 *                 type: string
 *                 description: The value of the MFA method (e.g., email address, phone number, or authenticator app secret).
 *               defaultDeliveryMethod:
 *                 type: string
 *                 description: The default delivery method for phone number MFA (e.g., SMS or voice).
 *             required:
 *               - methodType
 *             allOf:
 *               - if:
 *                   properties:
 *                     methodType:
 *                       const: phoneNumber
 *                 then:
 *                   required:
 *                     - defaultDeliveryMethod
 *     responses:
 *       201:
 *         description: MFA methods created or updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */

router.post('/add-method', async (req, res) => {
  const body = req.body;
  const userId = req.userId;
  try {
    const userMfa = await addMfaMethod(userId, body);

    res.send(userMfa);
  } catch (e) {
    console.error(e, 'ERROR IN MFA METHODS');
    res.status(500).send({ error: e.message });
  }
});

/**
 * @swagger
 * /mfa/remove-method:
 *   delete:
 *     summary: Delete an MFA method for a user
 *     description: Delete a specific Multi-Factor Authentication (MFA) method (email, phone number, or authenticator app) for the authenticated user.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               methodType:
 *                 type: string
 *                 enum:
 *                   - email
 *                   - phoneNumber
 *                   - authenticatorApp
 *                 description: The type of MFA method being deleted (email, phone number, or authenticator app).
 *               methodId:
 *                 type: string
 *                 description: The identifier of the MFA method (email address, phone number, or secret for the authenticator app).
 *     responses:
 *       200:
 *         description: MFA method deleted successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       404:
 *         description: MFA method not found
 *       500:
 *         description: Internal server error
 */

router.delete('/remove-method', async (req, res) => {
  const body = req.body;
  const userId = req.userId;
  try {
    const userMfa = await removeMfaMethod(userId, body);

    res.send(userMfa);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * @swagger
 * /mfa/set-default-method:
 *   put:
 *     summary: Set a default MFA method for a user
 *     description: Set a specific Multi-Factor Authentication (MFA) method (email, phone number, or authenticator app) as the default method for the authenticated user.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               methodType:
 *                 type: string
 *                 enum:
 *                   - email
 *                   - phoneNumber
 *                   - authenticatorApp
 *                 description: The type of MFA method to set as default.
 *               methodId:
 *                 type: string
 *                 description: The identifier of the MFA method to set as default (email address, phone number, or secret for the authenticator app).
 *     responses:
 *       200:
 *         description: Default MFA method set successfully
 *       400:
 *         description: Bad request - Invalid input data (e.g., missing methodType or methodId)
 *       404:
 *         description: MFA method not found - The specified method doesn't exist
 *       500:
 *         description: Internal server error
 */

router.put('/set-default-method', async (req, res) => {
  const body = req.body;
  const userId = req.userId;
  try {
    const userMfa = await updateDefaultMethod(userId, body);

    res.send(userMfa);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * @swagger
 * /mfa/update-method:
 *   put:
 *     summary: Update an existing MFA method for a user
 *     description: Update a specific Multi-Factor Authentication (MFA) method (email, phone number, or authenticator app) for the authenticated user.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               methodType:
 *                 type: string
 *                 enum:
 *                   - email
 *                   - phoneNumber
 *                   - authenticatorApp
 *                 description: The type of MFA method to update.
 *               methodId:
 *                 type: string
 *                 description: The identifier of the MFA method to update (email address, phone number, or secret for the authenticator app).
 *               value:
 *                 type: string
 *                 description: The new value for the MFA method (new email, phone number, or secret).
 *     responses:
 *       200:
 *         description: MFA method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedMethod:
 *                   type: object
 *                   description: The updated MFA method object.
 *       400:
 *         description: Bad request - Invalid input data (e.g., missing methodType, methodId, or newValue)
 *       404:
 *         description: MFA method not found - The specified method doesn't exist
 *       500:
 *         description: Internal server error
 */

router.put('/update-method', async (req, res) => {
  const body = req.body;
  const userId = req.userId;
  try {
    const userMfa = await updateMfaMethod(userId, body);

    res.send(userMfa);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * @swagger
 * /mfa/send-otp/{methodType}:
 *   post:
 *     summary: Send OTP for MFA method
 *     description: Update a specific Multi-Factor Authentication (MFA) method (email, phone number, or authenticator app) for the authenticated user.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultDeliveryMethod:
 *                 type: string
 *                 enum:
 *                   - call
 *                   - sms
 *                 description: Only required in case of MethodType = phoneNumber.
 *               authId:
 *                 type: string
 *                 description: The identifier of the MFA method to update (email address, phone number, or secret for the authenticator app), Only if we resend the otp,.
 *               value:
 *                 type: string
 *                 description: The new value for the MFA method (new email, phone number, or secret).
 *     responses:
 *       200:
 *         description: MFA method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedMethod:
 *                   type: object
 *                   description: The updated MFA method object.
 *       400:
 *         description: Bad request - Invalid input data (e.g., missing methodType, methodId, or newValue)
 *       404:
 *         description: MFA method not found - The specified method doesn't exist
 *       500:
 *         description: Internal server error
 */

router.post('/send-otp/:methodType', async (req, res) => {
  try {
    const { methodType } = req.params;
    let response = {};

    validateMethodType(methodType);

    switch (methodType) {
      case 'email':
      case 'phoneNumber':
        response = await sendVerificationCode(req.body, req.userId, methodType);
        break;
      case 'authenticatorApp':
        response = await generateAuthenticatorAppSecret(
          req.body,
          req.userId,
          methodType
        );

        break;
      default:
        throw new Error('Invalid method type');
    }

    // Send OTP to the specified method
    res.send(response);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * @swagger
 * /mfa/verify-otp/{methodType}:
 *   post:
 *     summary: Verify the OTP for a specific MFA method
 *     description: Update a specific Multi-Factor Authentication (MFA) method (email, phone number, or authenticator app) for the authenticated user.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: 6 digit otp.
 *               authId:
 *                 type: string
 *                 description: The identifier of the MFA method to update (email address, phone number, or secret for the authenticator app), Only if we resend the otp,.
 *               value:
 *                 type: string
 *                 description: The new value for the MFA method (new email, phone number, or secret).
 *     responses:
 *       200:
 *         description: MFA method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedMethod:
 *                   type: object
 *                   description: The updated MFA method object.
 *       400:
 *         description: Bad request - Invalid input data (e.g., missing methodType, methodId, or newValue)
 *       404:
 *         description: MFA method not found - The specified method doesn't exist
 *       500:
 *         description: Internal server error
 */

router.post('/verify-otp/:methodType', async (req, res) => {
  try {
    const { methodType } = req.params;
    let response = {};

    validateMethodType(methodType);

    switch (methodType) {
      case 'email':
      case 'phoneNumber':
        response = await verifyOtp(req.body, req.userId, methodType);
        break;
      case 'authenticatorApp':
        response = await verifyAuthenticatorApp(
          req.body,
          req.userId,
          methodType
        );
        break;
      default:
        throw new Error('Invalid method type');
    }

    res.send({ message: `OTP verified for ${methodType}:` });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * @swagger
 * /mfa/enable-mfa:
 *   post:
 *     summary: Enable Multi-Factor Authentication (MFA) for a user
 *     description: Enables MFA for the authenticated user by storing the provided method details.
 *     tags:
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enableMfa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: MFA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "MFA enabled successfully"
 *       400:
 *         description: Invalid request or missing required parameters.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */

router.post('/enable-mfa', async (req, res) => {
  try {
    const userId = req.userId;
    const body = req.body;
    const adminId = req.adminId ? req.adminId : undefined;

    const currentUser = await usersCollection.findById(userId);
    const isSuperAdmin = currentUser?.role === 'superadmin';

    if (!body.enableMfa) {
      if (isSuperAdmin && !config.allowSuperAdminDisableMfa) {
        return res.status(403).send({
          message:
            'Forbidden: Super Admin cannot disable MFA due to system configuration.',
        });
      }
    }

    const token = await enableMfa(userId, body, adminId);

    res.send(token);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
