import {
  generateOTP,
  validateDefaultDeliveryMethod,
  validateMethodType,
} from '../utils/common.util.js';
import { sendOtpVerificationMail } from '../services/email.service.js';
import { MessageCollabSMSClient } from '../utils/messageCollab.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { Twilio } from '../utils/twilioClass.js';
import { generateToken } from '../utils/jwt.util.js';
import {
  mfaCollection,
  mfaTempCollection,
  usersCollection,
} from './dbCollections.js';

export const getUserMfa = async (userId) => {
  try {
    const userMfa = await mfaCollection.findOne({ userId });

    if (!userMfa) return {};

    // Filter out sensitive fields while keeping the IDs
    const data = extractPublicDatafromMfaCollection(userMfa);

    return data;
  } catch (error) {
    throw error;
  }
};

export const addMfaMethod = async (userId, methodData) => {
  try {
    const { methodType, value, defaultDeliveryMethod, authId, label } =
      methodData;

    validateDefaultDeliveryMethod(defaultDeliveryMethod, methodType);
    validateMethodType(methodType);

    const tempUserMfa = await mfaTempCollection.findOne({ userId });

    if (!tempUserMfa) {
      throw new Error('MFA is not verified.');
    }

    let userMfa = await mfaCollection.findOne({ userId });

    if (!userMfa) {
      userMfa = new mfaCollection({
        userId,
        enableMfa: false,
        methods: { emails: [], phoneNumbers: [], authenticatorApps: [] },
      });
    }

    let secret;
    if (methodType === 'authenticatorApp') {
      secret = tempUserMfa.methods.authenticatorApps.find(
        (item) => item._id.toString() === authId
      ).secret;
    }

    let newMethodEntry;
    switch (methodType) {
      case 'email':
        newMethodEntry = { address: value, verified: true, label };
        break;
      case 'phoneNumber':
        newMethodEntry = {
          phoneNumber: value,
          verified: true,
          defaultDeliveryMethod: defaultDeliveryMethod || 'sms',
          label,
        };
        break;
      case 'authenticatorApp':
        newMethodEntry = {
          label: value,
          verified: true,
          secret: secret || 'TEST_SECRET',
        };
        break;
    }

    // Create the subdocument and get the ID immediately
    const newMethod = userMfa.methods[`${methodType}s`].create(newMethodEntry);
    userMfa.methods[`${methodType}s`].push(newMethod);

    const totalMethods =
      userMfa.methods.emails.length +
      userMfa.methods.phoneNumbers.length +
      userMfa.methods.authenticatorApps.length;

    if (totalMethods === 1) {
      userMfa.defaultMethod = methodType;
      userMfa.defaultMethodId = newMethod.id; // Use newMethod.id
    }

    await userMfa.save();

    await mfaTempCollection.deleteOne({ userId });

    return { methodId: newMethod?._id };
  } catch (error) {
    console.error('Error adding MFA method:', error);
    throw new Error(
      error.message || 'An error occurred while adding MFA method.'
    );
  }
};

export const removeMfaMethod = async (userId, mfaData) => {
  try {
    const { methodType, methodId } = mfaData;

    validateMethodType(methodType);

    const userMfa = await getMFACollection({ userId });

    const methodList = userMfa.methods[`${methodType}s`];

    // First check if the method we want to delete exists
    const methodToDelete = methodList.find(
      (method) => method._id.toString() === methodId
    );

    if (!methodToDelete) {
      throw new Error('MFA method not found.');
    }

    await validateIsAccountEmail({
      userId,
      methodType,
      method: methodToDelete,
    });

    // Check if it's the default method before proceeding
    if (
      userMfa.defaultMethod === methodType &&
      userMfa.defaultMethodId.toString() === methodId
    ) {
      throw new Error('Cannot remove the default MFA method.');
    }

    // Calculate total methods excluding the one we're about to delete
    const totalMethodsAfterDeletion =
      userMfa.methods.emails.length +
      userMfa.methods.phoneNumbers.length +
      userMfa.methods.authenticatorApps.length -
      1;

    // Check if removing this would leave us with no methods
    if (totalMethodsAfterDeletion < 1) {
      throw new Error('Cannot remove the only MFA method.');
    }

    // If we've passed all checks, safely remove the method
    userMfa.methods[`${methodType}s`] = methodList.filter(
      (method) => method._id.toString() !== methodId
    );

    await userMfa.save();

    return extractPublicDatafromMfaCollection(userMfa);
  } catch (error) {
    throw error;
  }
};

export const updateDefaultMethod = async (userId, mfaData) => {
  try {
    const { methodType, methodId } = mfaData;

    validateMethodType(methodType);

    const userMfa = await getMFACollection({ userId });

    const methodExists = userMfa.methods[`${methodType}s`].some(
      (method) => method._id.toString() === methodId
    );

    if (!methodExists) {
      throw new Error('Method not found');
    }

    userMfa.defaultMethod = methodType;
    userMfa.defaultMethodId = methodId;

    await userMfa.save();

    return extractPublicDatafromMfaCollection(userMfa);
  } catch (err) {
    throw err;
  }
};

export const updateMfaMethod = async (userId, mfaData) => {
  try {
    const { methodType, methodId, value, label, defaultDeliveryMethod } =
      mfaData;

    validateMethodType(methodType);

    const userMfa = await getMFACollection({ userId });

    const methodIndex = userMfa.methods[`${methodType}s`].findIndex(
      (method) => method._id.toString() === methodId
    );

    // Convert to plain object before spreading
    const existingMethod =
      userMfa.methods[`${methodType}s`][methodIndex].toObject();

    let updatedMethod;
    switch (methodType) {
      case 'email':
        updatedMethod = {
          ...existingMethod,
          label,
        };
        break;
      case 'phoneNumber':
        updatedMethod = {
          ...existingMethod,
          label,
          defaultDeliveryMethod,
        };
        break;
      case 'authenticatorApp':
        updatedMethod = {
          ...existingMethod,
          secret: existingMethod.secret,
          label: value,
        };
        break;
      default:
        throw new Error('Invalid method type');
    }

    userMfa.methods[`${methodType}s`][methodIndex] = updatedMethod;

    await userMfa.save();

    return extractPublicDatafromMfaCollection(userMfa);
  } catch (error) {
    throw error;
  }
};

export const sendVerificationCode = async (methodData, userId, methodType) => {
  try {
    const { defaultDeliveryMethod, authId, value, label } = methodData;

    validateDefaultDeliveryMethod(defaultDeliveryMethod, methodType);

    validateMethodType(methodType);

    const OTP = generateOTP();

    const { addedDoc, newOTP } = await addVerificationCodeInDb({
      methodType,
      userId,
      methodData,
      verificationCode: OTP,
      methodData,
      authId,
    });

    switch (methodType) {
      case 'email':
        await sendOTPviaEmail(value, newOTP ? newOTP : OTP);
        break;
      case 'phoneNumber':
        await sendOTPviaPhoneNumber(
          value,
          newOTP ? newOTP : OTP,
          defaultDeliveryMethod
        );
        break;
      case 'authenticatorApp':
        {
        }
        break;
      default: {
        throw new Error('Invalid method type');
      }
    }

    // Check if the user already has an MFA document

    // Send the verification code
    // This is a placeholder for the actual implementation
    return {
      _id: addedDoc._id,
      requierd: true,
      message: 'Verification code sent successfully',
    };
  } catch (err) {
    throw err;
  }
};

export const generateAuthenticatorAppSecret = async (
  methodData,
  userId,
  methodType
) => {
  try {
    const { value: label } = methodData;

    if (!label) throw new Error('Label is required');

    const secret = speakeasy.generateSecret({
      name: `SYNCCOS CheckWriter: ${label}`,
    });

    // Save in `tempMfa`
    const result = await mfaTempCollection.findOneAndUpdate(
      { userId },
      {
        $push: {
          'methods.authenticatorApps': {
            secret: secret.base32,
            verified: false,
            label,
          },
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const resultId = result.methods.authenticatorApps.at(-1)._id;

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    return { qrCode: qrCodeDataURL, secret: secret.base32, _id: resultId };
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (methodData, userId, methodType) => {
  try {
    const { otp, authId, value } = methodData;

    // Fetch the user's temp MFA collection
    const userMfa = await getMFACollection({ userId, isTemp: true });

    const keyNames = {
      email: 'address',
      phoneNumber: 'phoneNumber',
      authenticatorApp: 'value',
    };

    const methodIndex = userMfa.methods[`${methodType}s`].findIndex(
      (method) =>
        (method._id.toString() === authId && String(method.verificationCode) === String(otp)) ||
        (method[keyNames[methodType]] === value &&
          String(method.verificationCode) === String(otp))
    );

    if (methodIndex === -1) {
      throw new Error('Invalid or already verified verification code');
    }

    // Mark the method as verified
    userMfa.methods[`${methodType}s`][methodIndex].verified = true;

    // Clear the verification code if it's for an email or phone number
    if (methodType === 'email' || methodType === 'phoneNumber') {
      userMfa.methods[`${methodType}s`][methodIndex].verificationCode = '';
    }

    // Update default method if necessary
    const totalMethods =
      userMfa.methods.emails.length +
      userMfa.methods.phoneNumbers.length +
      userMfa.methods.authenticatorApps.length;

    if (totalMethods === 1) {
      // If only one method exists, make it default
      userMfa.defaultMethod = methodType;
      userMfa.defaultMethodId =
        userMfa.methods[`${methodType}s`][methodIndex]._id;
    } else if (!userMfa.defaultMethod) {
      // If no default is set and more than one method exists, set it to the verified method
      userMfa.defaultMethod = methodType;
      userMfa.defaultMethodId =
        userMfa.methods[`${methodType}s`][methodIndex]._id;
    }

    await userMfa.save(); // Save changes after updates

    return extractPublicDatafromMfaCollection(userMfa);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const verifyAuthenticatorApp = async (methodData, userId) => {
  try {
    const { otp, value, authId } = methodData;

    // Fetch the temporary MFA collection for the user
    const userMfa = await getMFACollection({ userId, isTemp: true });

    // Find the authenticator app by label
    const authenticatorApp = userMfa?.methods?.authenticatorApps.find(
      (app) => app._id.toString() === authId
    );

    if (!authenticatorApp) {
      throw new Error('Authenticator app not found');
    }

    const { secret } = authenticatorApp;

    // Verify the OTP using speakeasy
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
    });

    if (!verified) {
      throw new Error('Invalid OTP');
    }

    return { verified: true };
  } catch (error) {
    throw error;
  }
};

export const enableMfa = async (userId, body, adminId) => {
  try {
    let result = await mfaCollection.findOne({ userId });

    if (!result) {
      const payload = {
        userId,
        methods: {
          emails: [],
          phoneNumbers: [],
          authenticatorApps: [],
        },
      };

      result = new mfaCollection(payload);
    }

    result.enableMfa = body.enableMfa;

    await result.save();

    const tokenPayload = {
      userId,
      isValidated: true,
      enableMfa: body.enableMfa,
    };

    if (adminId) {
      tokenPayload['adminId'] = adminId;
    }

    const accessToken = generateToken(tokenPayload, 15 * 60);
    return { accessToken };
  } catch (error) {
    throw error;
  }
};

const sendOTPviaEmail = async (email, otp) => {
  await sendOtpVerificationMail(email, otp);
};
export const sendOTPviaPhoneNumber = async (
  phoneNumber,
  otp,
  defaultDeliveryMethod
) => {
  try {
    validateDefaultDeliveryMethod(defaultDeliveryMethod);

    switch (defaultDeliveryMethod) {
      case 'sms':
        {
          const smsClient = new MessageCollabSMSClient();

          await smsClient.sendSMSMessage({
            to: phoneNumber,
            message: `Your OTP is: ${otp}`,
          });
        }
        break;
      case 'call':
        {
          const callClient = new Twilio();
          await callClient.triggerVerificationCall({ to: phoneNumber, otp });
        }
        break;
      default:
        throw new Error('Invalid default delivery method');
    }
  } catch (err) {
    throw err;
  }
};

const createNewMfaDocument = async ({
  userId,
  methodData,
  verificationCode = '',
  isTemp = false,
}) => {
  try {
    const { methodType, value, defaultDeliveryMethod } = methodData;

    validateMethodType(methodType);

    // Prepare the method-specific data
    let methodEntry;
    switch (methodType) {
      case 'email':
        methodEntry = { address: value, verificationCode };
        break;
      case 'phoneNumber':
        methodEntry = {
          phoneNumber: value,
          defaultDeliveryMethod: defaultDeliveryMethod || 'sms',
          verificationCode,
        };
        break;
      case 'authenticatorApp':
        methodEntry = { secret: value };
        break;
    }

    const payload = {
      userId,
      methods: {
        emails: methodType === 'email' ? [methodEntry] : [],
        phoneNumbers: methodType === 'phoneNumber' ? [methodEntry] : [],
        authenticatorApps:
          methodType === 'authenticatorApp' ? [methodEntry] : [],
      },
      defaultMethod: methodType,
    };

    // Construct the MFA document with only the relevant method
    const newUserMfa = isTemp
      ? new mfaTempCollection(payload)
      : new mfaCollection(payload);

    return await newUserMfa.save();
  } catch (err) {
    console.error('Error creating new MFA document:', err);
    throw err;
  }
};

const extractPublicDatafromMfaCollection = (mfaCollection) => {
  const filteredMethods = {
    emails: Array.isArray(mfaCollection.methods?.emails)
      ? mfaCollection.methods.emails.map(({ _id, address, label }) => ({
          _id,
          address,
          label,
        }))
      : [],
    phoneNumbers: Array.isArray(mfaCollection.methods?.phoneNumbers)
      ? mfaCollection.methods.phoneNumbers.map(
          ({ _id, phoneNumber, label, defaultDeliveryMethod }) => ({
            _id,
            phoneNumber,
            label,
            defaultDeliveryMethod,
          })
        )
      : [],
    authenticatorApps: Array.isArray(mfaCollection.methods?.authenticatorApps)
      ? mfaCollection.methods.authenticatorApps.map(({ _id, label }) => ({
          _id,
          label,
        }))
      : [],
  };

  return {
    userId: mfaCollection.userId,
    methods: filteredMethods,
    defaultMethod: mfaCollection.defaultMethod,
    defaultMethodId: mfaCollection.defaultMethodId,
    _id: mfaCollection._id,
    enableMfa: mfaCollection.enableMfa,
  };
};

const getMFACollection = async ({ userId, isTemp = false }) => {
  try {
    const userMfa = isTemp
      ? await mfaTempCollection.findOne({ userId })
      : await mfaCollection.findOne({ userId });

    if (!userMfa) throw new Error('MFA not found');

    return userMfa;
  } catch (error) {
    throw error;
  }
};

const checkIfMethodExists = ({ methodType, value, userMfa }) => {
  const existingMethods = userMfa?.methods[`${methodType}s`];

  const isDuplicate = existingMethods.some((method) => {
    switch (methodType) {
      case 'email':
        return method.address === value;
      case 'phoneNumber':
        return method.phoneNumber === value;
      case 'authenticatorApp':
        return method.secret === value;
      default:
        return false;
    }
  });

  if (isDuplicate) {
    throw new Error(`${methodType} value already exists as an mfa enitity`);
  }
  return true;
};

const addVerificationCodeInDb = async ({
  userId,
  methodType,
  verificationCode,
  methodData,
  authId = '',
}) => {
  try {
    const { value, defaultDeliveryMethod, label = '' } = methodData;
    const userMfa = await mfaTempCollection.findOne({ userId });

    let response = {};
    let found = false;

    const newOTP = generateOTP();

    if (!userMfa) {
      // Create a new MFA document if none exists
      const newDoc = await createNewMfaDocument({
        userId,
        methodData,
        verificationCode,
        isTemp: true,
      });

      response = newDoc.methods[`${methodType}s`].at(-1);
    } else {
      let newMethodEntry = {};

      const existingMethods = userMfa?.methods[`${methodType}s`];

      const isDuplicateIndex = existingMethods.findIndex((method) => {
        switch (methodType) {
          case 'email':
            return method.address === value && method._id.toString() === authId;
          case 'phoneNumber':
            return (
              method.phoneNumber === value && method._id.toString() === authId
            );
          case 'authenticatorApp':
            return method.secret === value && method._id.toString() === authId;
          default:
            return false;
        }
      });

      found = isDuplicateIndex !== -1;

      switch (methodType) {
        case 'email':
          newMethodEntry = {
            address: value,
            label,
            verificationCode: found ? newOTP : verificationCode,
          };
          break;
        case 'phoneNumber':
          newMethodEntry = {
            phoneNumber: value,
            label,
            defaultDeliveryMethod: defaultDeliveryMethod || 'sms',
            verificationCode: found ? newOTP : verificationCode,
          };
          break;
        case 'authenticatorApp':
          newMethodEntry = { secret: value, label };
          break;
      }

      if (found) {
        userMfa.methods[`${methodType}s`][isDuplicateIndex] = newMethodEntry;
      }

      // Append the new method entry to the relevant method array
      else {
        userMfa.methods[`${methodType}s`].push(newMethodEntry);
      }

      // Save the updated document
      await userMfa.save();

      response = userMfa.methods[`${methodType}s`].at(-1);
    }

    return { addedDoc: response, newOTP: found ? newOTP : null };
  } catch (error) {
    console.error('error in addTodb function', error);
    throw error;
  }
};

const validateIsAccountEmail = async ({ userId, methodType, method }) => {
  try {
    if (methodType === 'email') {
      const user = await usersCollection.findById(userId);

      const isAccountEmail = method?.address === user.email;

      if (isAccountEmail) {
        throw new Error('Cant Delete Account Email');
      }
    }
  } catch (error) {
    throw error;
  }
};
