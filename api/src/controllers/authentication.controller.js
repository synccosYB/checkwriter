import express from 'express';
import axios from 'axios';
import {
  validateToken,
  generateToken,
  validateSSOToken,
  verifyMfaGraceJwt,
} from '../utils/jwt.util.js';
import {
  generateAuthenticationTokens,
  validateLoginCredentials,
  validateTokenFromDb,
  updatePasswordsInDb,
  addDefaultTags,
  checkSubscription,
  generateAuthenticationTokensWithEmail,
  manageAuthenticationService,
  checkPasswordExistence,
  addDefaultMfaMethod,
  isMfaWindowValid,
} from '../services/authentication.service.js';

import {
  findUserByEmail,
  addUser,
  getUserIdByEmail,
  getUserDetails,
  UpdateUserLastLogin,
} from '../services/users.service.js';
import {
  sendEmailToUl,
  sendForgotPasswordMail,
} from '../services/email.service.js';
import authorization from '../middlewares/authorization.middleware.js';
import {
  decideEnableMfaStatus,
  validateMandatoryFields,
} from '../utils/common.util.js';

import { mfaCollection, usersCollection } from '../models/dbCollections.js';
import { USER_ROLES } from '../constants/index.js';
import { addMailchimpContactWithTag } from '../services/mailChimpService.js';
import { createDemoAccount } from '../services/demo.service.js';
import { getVerificationStatusByEmail } from '../services/verification.service.js';

const router = express.Router();

router.get('/access-token', async (req, res, next) => {
  try {
    const token =
      req.headers.authorization || req.headers.Authorization || req.query.token;
    if (!token) {
      throw new Error(
        JSON.stringify({
          developerMessage: 'Missing Token',
          statusCode: 400,
        })
      );
    }

    const data = validateToken(token);
    if (!data) {
      throw new Error(
        JSON.stringify({
          developerMessage: 'Invalid Token',
          statusCode: 401,
        })
      );
    }
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const token =
      req.headers.authorization || req.headers.Authorization || req.query.token;

    if (!token) {
      const err = new Error('Missing Token');
      err.statusCode = 401;
      throw err;
    }

    const data = validateToken(token);
    if (!(data && data.userId)) {
      const err = new Error('Invalid Token (Token expired or Invalid)');
      err.statusCode = 401;
      throw err;
    }

    const resFromDb = await validateTokenFromDb({
      userId: data.userId,
      refreshToken: token,
    });
    if (!resFromDb) {
      const err = new Error(
        'Invalid Token (Token does not match with the last generated refresh token'
      );
      err.statusCode = 401;
      throw err;
    }

    // Prefer the signed mfaExpiresAt from the refresh token itself
    let mfaExpiresAt = isMfaWindowValid(data.mfaExpiresAt) ? data.mfaExpiresAt : null;
    // Fallback to cookie 
    if (!mfaExpiresAt && req.cookies?.mfa_grace) {
      const decoded = verifyMfaGraceJwt(req.cookies.mfa_grace);
      if (decoded?.userId?.toString() === data.userId && isMfaWindowValid(decoded.mfaExpiresAt)) {
        mfaExpiresAt = decoded.mfaExpiresAt;
      }
    }

    const tokenPayload = {
      userId: data.userId,
      isValidated: !!mfaExpiresAt || !!data.isValidated,
      enableMfa: data?.enableMfa,
      mfaExpiresAt,
    };

    if (data?.adminId) {
      tokenPayload['adminId'] = data?.adminId;
    }

    const accessToken = generateToken(tokenPayload, 15 * 60);
    return res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: |
 *       This endpoint allows a user to log in by providing their email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 */

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      throw new Error(
        'Missing fields - email or password in request body parameters'
      );
    }

    const userDetails = await usersCollection.findOne({ email });

    if (!userDetails) {
      throw new Error('User does not exist. Please sign up');
    }

    if (userDetails.isActive === false) {
      throw new Error(
        JSON.stringify({
          userMessage: 'Account is deactivated. Please contact an administrator.',
          statusCode: 403,
        })
      );
    }

    const userId = userDetails._id.toString();
    const role = userDetails?.role;

    const userIdAndEmail = await validateLoginCredentials(email, password);
    if (!userIdAndEmail) {
      throw new Error(
        JSON.stringify({
          userMessage: 'Incorrect Password',
          statusCode: 401,
        })
      );
    }

    const mfa = await mfaCollection.findOne({ userId });
    const enableMfa = decideEnableMfaStatus(mfa);

    
   let carriedMfaExpiresAt = null;
   const ticket = req.cookies?.mfa_grace;
   if (ticket) {
     const decoded = verifyMfaGraceJwt(ticket);
     if (decoded?.userId?.toString() === userId && isMfaWindowValid(decoded.mfaExpiresAt)) {
       carriedMfaExpiresAt = decoded.mfaExpiresAt;
     }
   }
    const isValidated = !!carriedMfaExpiresAt;

    const tokenPayload = {
      ...userIdAndEmail,
      isValidated,
      enableMfa,
      mfaExpiresAt: carriedMfaExpiresAt || null,
    };

    if (role === USER_ROLES.SUPERADMIN) {
      tokenPayload['adminId'] = userId;
    }

    const newTokens = await generateAuthenticationTokensWithEmail(tokenPayload);

    const resFromDb = await manageAuthenticationService({
      userId: userIdAndEmail.userId,
      refreshToken: newTokens.refreshToken,
      mode: 'standard',
    });

    if (!resFromDb) {
      throw new Error('Unable to update user authentication tokens');
    }

    await UpdateUserLastLogin(userIdAndEmail);

    let subscription_taken = false;
    subscription_taken = await checkSubscription(userIdAndEmail.userId);
    newTokens['subscriptionTaken'] = subscription_taken;

    return res.status(200).json({
      tokens: newTokens,
      enableMfa,
      userId: userIdAndEmail?.userId,
      role: userDetails?.role,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       200:
 *         description: Successful signup
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       400:
 *         description: Bad request - Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please fill in all required fields."
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The user with this email already exists."
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred."
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

router.post('/signup', async (req, res, next) => {
  try {
    const mandatoryFields = ['firstName', 'lastName', 'email', 'password'];
    const { body } = req;

    const missingFields = [];
    mandatoryFields.forEach((field) =>
      body && body[field] ? true : missingFields.push(field)
    );
    if (missingFields && missingFields.length) {
      throw new Error(
        'Missing fields - [' + missingFields + '] in request body'
      );
    }

    const isUser = await findUserByEmail(body.email);
    if (isUser) {
      throw new Error(
        JSON.stringify({
          userMessage: 'User Already Exists',
          statusCode: 409,
        })
      );
    }

    const userDetails = await addUser(body);
    if (!userDetails) {
      throw new Error('Unable to create User');
    }

    const userId = userDetails._id;
    const newTokens = await generateAuthenticationTokens({ userId });

    await addDefaultMfaMethod({ userId, email: userDetails.email });

    const result = await addDefaultTags(userId);
    if (!result) {
      throw new Error('Unable to add default tags');
    }

    const resFromDb = await manageAuthenticationService({
      userId,
      email: body.email,
      password: body.password,
      refreshToken: newTokens.refreshToken,
      mode: 'standard',
    });
    if (!resFromDb) {
      throw new Error('Unable to upsert user authentication tokens');
    }

    const payload = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    };

    await sendEmailToUl(payload, 'App Signup');
    await addMailchimpContactWithTag({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      status: 'subscribed',
      tag: 'Sign ups',
    });

    return res.status(200).json(newTokens);
  } catch (err) {
    next(err);
  }
});

router.post('/update-password', async (req, res, next) => {
  try {
    const mandatoryFields = ['email', 'oldPassword', 'newPassword'];
    const { body } = req;

    const missingFields = [];
    mandatoryFields.forEach((field) =>
      body && body[field] ? true : missingFields.push(field)
    );
    if (missingFields && missingFields.length) {
      throw new Error(
        'Missing fields - [' + missingFields + '] in request body'
      );
    }

    const userInfo = await usersCollection.findOne({ email: body.email });
    if (!userInfo) {
      throw new Error('User not found');
    }

    const hasPassword = await checkPasswordExistence({ userId: userInfo?._id });
    if (hasPassword) {
      const userIdAndEmail = await validateLoginCredentials(
        body.email,
        body.oldPassword
      );
      if (!userIdAndEmail) {
        throw new Error(
          JSON.stringify({
            userMessage: 'Incorrect Old Password',
            statusCode: 401,
          })
        );
      }

      // update password in Db
      const resFromDb = await updatePasswordsInDb(userInfo?._id, {
        password: body.newPassword,
      });
      if (!resFromDb) {
        throw new Error('Unable to update user password');
      }
    } else {
      await manageAuthenticationService({
        userId: userInfo?._id,
        password: body.newPassword,
      });
    }

    return res
      .status(200)
      .json({ message: hasPassword ? 'Password updated' : 'Password created' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get User by Email
 *     description: Retrieve user information by email.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         description: User's email address
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

router.get('/user', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      throw new Error('Missing Query parameter - email');
    }
    let isUser;
    try {
      isUser = await findUserByEmail(email);
    } catch (dbErr) {
      console.error('Database error during user lookup:', dbErr.message);
      return res.status(503).json({
        error: 'Service temporarily unavailable. Please try again later.',
        code: 'DB_CONNECTION_ERROR',
      });
    }

    return res.send({ isUser: !!isUser });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', authorization, async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      body: { password },
    } = req;
    if (!password) {
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage: 'Password cannot be empty',
        })
      );
    }
    const resFromDb = await updatePasswordsInDb(userId, { password });
    if (!resFromDb) {
      throw new Error('Unable to update user password');
    }
    return res.status(200).json(resFromDb);
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email, domain } = req.body;
    if (!email) {
      throw new Error('Missing Query parameter - email');
    }
    const isUser = await findUserByEmail(email);
    if (!isUser) {
      return res.status(404).send('User not found');
    }
    const userDetails = await getUserIdByEmail(email);

    // generateAccess token
    const tokenPayload = { userId: userDetails._id.toString() };
    const accessToken = generateToken(tokenPayload, 900);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
      'https://app.synccos.com',
      'http://localhost:3000',
      'http://localhost:5000',
    ].filter(Boolean);

    let safeDomain = allowedOrigins[0] || 'https://app.synccos.com';
    if (domain) {
      try {
        const parsed = new URL(domain);
        if (allowedOrigins.includes(parsed.origin)) {
          safeDomain = parsed.origin;
        }
      } catch (e) {
      }
    }

    const url = `${safeDomain}/auth/reset-password?token=${accessToken.toString()}`;
    await sendForgotPasswordMail(email, url);

    return res
      .status(200)
      .send('The Link to reset password has been shared via mail');
  } catch (err) {
    next(err);
  }
});

router.post('/google/signup', async (req, res, next) => {
  try {
    const {
      googleAuthToken,
      firstName,
      lastName,
      middleName,
      phone,
      email,
      dateOfBirth,
    } = req.body;

    let missingFields = await validateMandatoryFields(req.body, [
      'googleAuthToken',
      'firstName',
      'lastName',
      'email',
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


    const token = googleAuthToken;

    if (!token) {
      throw new Error('Missing Token');
    }

    let googleVerified = false;
    let userEmail = email;

    try {
      let result = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (result && result.data && result.data.email) {
        if (result.data.email !== email) {
          throw new Error(
            JSON.stringify({
              statusCode: 400,
              developerMessage: 'Validation failed (Invalid Input - Email)',
            })
          );
        }
        userEmail = result.data.email;
        googleVerified = true;
      }
    } catch (googleErr) {
      if (googleErr.message && googleErr.message.includes('Validation failed')) {
        throw googleErr;
      }
      const isEmailVerified = await getVerificationStatusByEmail(email);
      if (!isEmailVerified) {
        throw new Error(
          JSON.stringify({
            statusCode: 401,
            userMessage: 'Your Google session expired. Please try signing up again.',
            developerMessage: 'Google token expired and email not verified via OTP',
          })
        );
      }
      googleVerified = true;
    }

    const isUser = await findUserByEmail(userEmail);

    if (isUser) {
      throw new Error('User already exists');
    }

    const payload = {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      dateOfBirth,
    };

    const userDetails = await addUser(payload);
    if (!userDetails) {
      throw new Error('Unable to create user');
    }

    const userId = userDetails._id;
    const newTokens = await generateAuthenticationTokens({ userId });

    await addDefaultMfaMethod({ userId, email: userDetails.email });

    const resFromDb = await manageAuthenticationService({
      userId,
      refreshToken: newTokens.refreshToken,
      email,
      mode: 'oauth',
    });

    if (!resFromDb) {
      throw new Error('Unable to upsert user authentication in db');
    }

    const tagsResult = await addDefaultTags(userId);
    if (!tagsResult) {
      throw new Error('Unable to add default tags');
    }

    await sendEmailToUl(payload, 'Google Signup');

    await addMailchimpContactWithTag({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      status: 'subscribed',
      tag: 'Sign ups',
    });

    let subscription_taken = false;
    subscription_taken = await checkSubscription(userId);
    newTokens['subscriptionTaken'] = subscription_taken;

    return res.status(200).json(newTokens);
  } catch (err) {
    next(err);
  }
});

router.post('/google/login', async (req, res, next) => {
  try {
    const { googleAuthToken, originalToken } = req.body;
    const token = googleAuthToken;

    if (!token) {
      throw new Error('Missing Token');
    }

    const result = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (!(result && result.data && result.data.email)) {
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage: 'Validation failed (Invalid token)',
        })
      );
    }

    const userData = result.data;
    const userEmail = userData.email;

    let userDetails;
    try {
      userDetails = await usersCollection.findOne({ email: userEmail });
    } catch (dbErr) {
      console.error('Database error during Google login user lookup:', dbErr.message);
      return res.status(503).json({
        error: 'Service temporarily unavailable. Please try again later.',
        code: 'DB_CONNECTION_ERROR',
      });
    }

    if (!userDetails) {
      throw new Error('User does not exist. Please sign up');
    }

    if (userDetails.isActive === false) {
      throw new Error(
        JSON.stringify({
          userMessage: 'Account is deactivated. Please contact an administrator.',
          statusCode: 403,
        })
      );
    }

    const userId = userDetails._id;
    const role = userDetails?.role;

    let mfa, enableMfa, newTokens, resFromDb, subscription_taken;
    try {
      mfa = await mfaCollection.findOne({ userId });

      enableMfa = decideEnableMfaStatus(mfa);

      let carriedMfaExpiresAt = null;
      const ticket = req.cookies?.mfa_grace;
      if (ticket) {
        const decoded = verifyMfaGraceJwt(ticket);
        if (decoded?.userId?.toString() === userId.toString() && isMfaWindowValid(decoded.mfaExpiresAt)) {
          carriedMfaExpiresAt = decoded.mfaExpiresAt;
        }
      }

      const isValidated = !!carriedMfaExpiresAt;

      const tokenPayload = {
        userId,
        isValidated,
        enableMfa,
        mfaExpiresAt: carriedMfaExpiresAt || null,
      };

      if (role === USER_ROLES.SUPERADMIN) {
        tokenPayload['adminId'] = userId;
      }

      newTokens = await generateAuthenticationTokens(tokenPayload);

      resFromDb = await manageAuthenticationService({
        userId,
        refreshToken: newTokens.refreshToken,
        mode: 'oauth',
      });

      if (!resFromDb) {
        throw new Error('Unable to update user authentication tokens');
      }

      await UpdateUserLastLogin({ userId });

      subscription_taken = false;
      subscription_taken = await checkSubscription(userId);
      newTokens['subscriptionTaken'] = subscription_taken;
    } catch (dbErr) {
      if (dbErr.message === 'Unable to update user authentication tokens') {
        throw dbErr;
      }
      console.error('Database error during Google login:', dbErr.message);
      return res.status(503).json({
        error: 'Service temporarily unavailable. Please try again later.',
        code: 'DB_CONNECTION_ERROR',
      });
    }

    return res.status(200).json({
      tokens: newTokens,
      enableMfa: enableMfa,
      role: userDetails?.role,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verifyuser-and-getnewtoken', async (req, res, next) => {
  try {
    const token =
      req.headers.authorization || req.headers.Authorization || req.query.token;

    if (!token) {
      throw new Error(
        JSON.stringify({
          developerMessage: 'Missing Token',
          statusCode: 400,
        })
      );
    }

    const data = validateSSOToken(token);

    if (!data) {
      throw new Error(
        JSON.stringify({
          developerMessage: 'Invalid Token',
          statusCode: 401,
        })
      );
    }

    const existuserId = await getUserIdByEmail(data.email);
    const existuser = await getUserDetails(existuserId);
    if (!existuser) {
      throw new Error('User not found');
    }

    const newTokens = await generateAuthenticationTokens({
      userId: existuser._id,
    });

    const resFromDb = await manageAuthenticationService({
      userId: existuser._id,
      refreshToken: newTokens.refreshToken,
    });

    if (!resFromDb) {
      throw new Error('Unable to update user authentication tokens');
    }

    let subscription_taken = false;
    subscription_taken = await checkSubscription(existuser._id);
    newTokens['subscriptionTaken'] = subscription_taken;

    return res.status(200).json(newTokens);
  } catch (err) {
    next(err);
  }
});

router.post('/demo-login', async (req, res, next) => {
  try {
    const { user, organization } = await createDemoAccount();

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      isValidated: true,
      enableMfa: false,
      mfaExpiresAt: null,
      isDemo: true,
    };

    const newTokens = await generateAuthenticationTokensWithEmail(tokenPayload);

    await manageAuthenticationService({
      userId: user._id.toString(),
      refreshToken: newTokens.refreshToken,
      mode: 'standard',
    });

    newTokens['subscriptionTaken'] = true;

    return res.status(200).json({
      tokens: newTokens,
      enableMfa: false,
      userId: user._id.toString(),
      role: user.role || 'user',
      isDemo: true,
      organizationId: organization._id.toString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
