import moment from 'moment';
import {
  createAuthentication,
  findAuthentication,
  updateAuthentication,
} from '../models/authentication.model.js';
import { addTag } from '../models/users.model.js';
import { generateToken } from '../utils/jwt.util.js';
import bcrypt from 'bcrypt';
import { findOneByFilter } from '../models/stripecustomers.model.js';
import speakeasy from 'speakeasy';
import {
  authenticationCollection,
  mfaCollection,
  usersCollection,
} from '../models/dbCollections.js';
import { generateOTP } from '../utils/common.util.js';
import { generateObjectId } from '../db/schema.js';

export const computeMfaExpiresAt = () =>
  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

export const isMfaWindowValid = (mfaExpiresAt) => {
  if (!mfaExpiresAt) return false;
  return new Date(mfaExpiresAt).getTime() > Date.now();
};

export const validateTokenFromDb1 = async (userId, token) => {
  try {
    const payload = {
      userId,
    };
    const res = await findAuthentication(payload);
    if (!(res && res.refreshToken && res.refreshToken === token)) {
      return;
    }
    return true;
  } catch (err) {
    throw err;
  }
};

export const upsertAuthenticationInDb = async (
  userId,
  email,
  password,
  refreshToken,
  mode
) => {
  try {
    if (!(userId && email && (password || mode) && refreshToken)) {
      return;
    }
    let encryptedPassword;
    if (password) {
      encryptedPassword = await bcrypt.hash(password, 10);
    }
    const payload = {
      userId,
      email,
      password: encryptedPassword || password,
      refreshToken,
      mode,
      createdAtUnix: moment.utc().format('X'),
      updatedAtUnix: moment.utc().format('X'),
    };
    const res = await createAuthentication(payload);

    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const upsertAuthenticationGoogleInDb = async (authObj) => {
  try {
    const { userId, email, refreshToken, mode } = authObj;

    if (!(userId && email && mode && refreshToken)) {
      return;
    }

    const payload = {
      userId,
      email,
      refreshToken,
      mode,
      createdAtUnix: moment.utc().format('X'),
      updatedAtUnix: moment.utc().format('X'),
    };

    const res = await createAuthentication(payload);

    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const validateLoginCredentials = async (email, password) => {
  try {
    if (!(email && password)) {
      return;
    }
    const user = await usersCollection.findOne({ email });
    if (!user) throw new Error('user does not exist');
    const userCredentials = await authenticationCollection.findOne({
      userId: user?._id,
    });

    if (!(userCredentials && userCredentials.password)) {
      return;
    }

    let check = false;

    if (userCredentials.password) {
      check = await bcrypt.compare(password, userCredentials.password);
    } else {
      check = userCredentials.password === password;
    }

    if (!check) return;

    if (!(userCredentials && userCredentials.userId && user.email)) {
      throw new Error('Unable to validate user credentials');
    }

    return { userId: userCredentials.userId, email: user.email };
  } catch (err) {
    throw err;
  }
};

export const generateAuthenticationTokens = async ({
  userId,
  isValidated = true,
  enableMfa = false,
  adminId = '',
  mfaExpiresAt = null,
}) => {
  try {
    const tokenPayload = {
      userId,
      isValidated,
      enableMfa,
      mfaExpiresAt,
    };

    if (adminId) {
      tokenPayload['adminId'] = adminId;
    }

    const accessToken = generateToken(tokenPayload, 15 * 60);
    const refreshToken = generateToken(tokenPayload, 12 * 60 * 60 * 24);
    return { accessToken, refreshToken };
  } catch (err) {
    throw err;
  }
};

export const updateAuthenticationInDb = async (userId, payload) => {
  try {
    if (!userId) {
      return;
    }

    const res = await updateAuthentication(userId, payload);
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const updatePasswordsInDb = async (userId, payload) => {
  try {
    if (!userId) {
      return;
    }
    const { password } = payload;
    const hashedNewPassword = await bcrypt.hash(password, 10);
    payload.password = hashedNewPassword;
    payload.updatedAtUnix = moment.utc().format('X');
    const res = await updateAuthentication(userId, payload);
    if (!res) {
      return;
    }
    return res;
  } catch (error) {
    throw error;
  }
};

export const addDefaultTags = async (userId, organizationId = null) => {
  try {
    const defaultTags = [
      { name: 'Personal', color: '#F39B6D' },
      { name: 'Miscellaneous', color: '#CA3CFF' },
      { name: 'Business', color: '#3E6990' },
    ];

    for (let i = 0; i < 3; i++) {
      const addedRes = await addTag(userId, defaultTags[i], organizationId);
      if (!addedRes) {
        return;
      }
    }
    return true;
  } catch (err) {
    throw err;
  }
};

export const checkSubscription = async (userId) => {
  const userdata = await findOneByFilter({ userId: userId });
  if (userdata) {
    if (
      userdata.isSubscriptionValid === true ||
      userdata.isTrialPeriod === true
    ) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

export const checkSubscriptionAndTrial = async (userId) => {
  const userdata = await findOneByFilter({ userId: userId });

  const isSubscribed = userdata?.isSubscriptionValid === true || false;
  const isTrialPeriod = userdata?.isTrialPeriod === true || false;

  return { isSubscribed, isTrialPeriod };
};

export const generateAuthenticationTokensWithEmail = async (userIdAndEmail) => {
  try {
    const tokenPayload = {
      ...userIdAndEmail,
      mfaExpiresAt: userIdAndEmail?.mfaExpiresAt ?? null, 
    };
    const accessToken = generateToken(tokenPayload, 15 * 60);
    const refreshToken = generateToken(tokenPayload, 12 * 60 * 60 * 24);
    return { accessToken, refreshToken };
  } catch (err) {
    throw err;
  }
};

export const validateAuthenticatorApp = (doc, methodId, methodType, otp) => {
  try {
    const docSecret = doc.methods.authenticatorApps.find(
      (item) => item?._id.toString() === methodId
    );
    if (!docSecret) throw new Error('Invalid OTP');

    const verified = speakeasy.totp.verify({
      secret: docSecret?.secret,
      encoding: 'base32',
      token: otp,
    });
    if (!verified) throw new Error('Invalid OTP');
  } catch (error) {
    throw error;
  }
};

export const validateEmailAndPhoneNumber = async (
  doc,
  methodId,
  methodType,
  otp
) => {
  try {
    const methodIndex = doc.methods[`${methodType}s`].findIndex(
      (item) =>
        item._id.toString() === methodId && String(item.verificationCode) === String(otp)
    );

    if (methodIndex === -1) throw new Error('Invalid OTP');

    doc.methods[`${methodType}s`][methodIndex].verified = true;
    doc.methods[`${methodType}s`][methodIndex].verificationCode = '';

    await doc.save();
  } catch (error) {
    throw error;
  }
};

export const manageAuthenticationService = async ({
  userId,
  refreshToken,
  mode,
  ...rest
}) => {
  try {
    let encryptedPassword;
    if (rest.password) {
      encryptedPassword = await bcrypt.hash(rest.password, 10);
      rest.password = encryptedPassword;
    }

    const existingAuth = await authenticationCollection.findOneAndUpdate(
      { userId },
      { refreshToken, mode, ...rest },
      { upsert: true, new: true }
    );

    return existingAuth;
  } catch (error) {
    throw new Error(`Authentication update failed: ${error.message}`);
  }
};

export const validateTokenFromDb = async ({ userId, refreshToken }) => {
  try {
    const authRecord = await authenticationCollection.findOne({
      userId,
      refreshToken,
    });

    return !!authRecord;
  } catch (error) {
    throw new Error(`Failed to validate refresh token: ${error.message}`);
  }
};

export const checkPasswordExistence = async ({ userId }) => {
  try {
    const authData = await authenticationCollection.findOne({ userId });

    if (authData?.password) {
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(error);
  }
};

export const addDefaultMfaMethod = async ({ userId, email }) => {
  try {
    const emailEntry = {
      _id: generateObjectId(),
      address: email,
      verified: false,
      label: 'Primary Email',
    };

    await mfaCollection.create({
      userId: userId,
      enableMfa: true,
      methods: {
        emails: [emailEntry],
        phoneNumbers: [],
        authenticatorApps: [],
      },
      defaultMethod: 'email',
      defaultMethodId: emailEntry?._id,
    });
  } catch (error) {
    throw error;
  }
};
