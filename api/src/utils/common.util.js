import axios from 'axios';

export const validateMandatoryFields = async (object, mandatoryFields) => {
  try {
    const missingFields = [];

    mandatoryFields.forEach((field) =>
      object && object[field] ? true : missingFields.push(field)
    );

    return missingFields;
  } catch (err) {
    throw err;
  }
};

export const validateName = (name) => {
  try {
    return /^[a-zA-Z ]+$/.test(name);
  } catch (err) {
    throw err;
  }
};

export const validatePhone = (phone) => {
  try {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
      phone
    );
  } catch (err) {
    throw err;
  }
};

export const validateEmail = (email) => {
  try {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  } catch (err) {
    throw err;
  }
};

export const calculateDateDifference = (startDate, endDate) => {
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

  const start = new Date(startDate);
  const end = new Date(endDate);

  const differenceInTime = end - start;
  const differenceInDays = Math.round(differenceInTime / oneDay);

  return differenceInDays;
};

export const isValidSignature = async (url) => {
  try {
    const response = await axios.get(url);
    if (response.status === 403) return false;
    return true;
  } catch (err) {
    if (err.response) {
      if (err.response.status == 403) return false;
    }
  }
};

export const getBasePath = (url, req) => {
  const urlObject = new URL(url, `http://${req.headers.host}`);
  return urlObject.pathname;
};
export const validateMethodType = (methodType) => {
  if (!['email', 'phoneNumber', 'authenticatorApp'].includes(methodType)) {
    throw new Error('Invalid MFA method type');
  }
};

export const validateDefaultDeliveryMethod = (method, methodType) => {
  if (!['sms', 'call'].includes(method) && methodType === 'phoneNumber') {
    throw new Error('Invalid default delivery method');
  }
};

export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const maskEmailAddress = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Invalid email'; // Or handle the error as you see fit
  }

  const [user, domain] = email.split('@');

  if (!user || !domain) {
    return 'Invalid email format';
  }

  const maskedUser =
    user.length <= 2 ? user : user[0] + '*****' + user.slice(-1); //Mask user part. Handle short usernames.
  return maskedUser + '@' + domain;
};

export function maskPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return 'Invalid phone number';
  }

  // Check if the number starts with a +
  if (!phoneNumber.startsWith('+')) {
    return 'Phone number must start with +';
  }

  // Remove any non-digit characters *after* the initial +
  const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '').replace(/^\+/, '+'); //Preserve the +

  const countryCode = cleanedNumber.slice(0, 1); // Extract the + sign (country code)
  const digits = cleanedNumber.slice(1); // Rest of the digits

  if (digits.length <= 3) {
    return countryCode + digits; // Don't mask if only 3 or less digits after country code
  }

  const maskedDigits = digits
    .slice(0, digits.length - 3)
    .replace(/[0-9]/g, '*'); // Mask all but last 3
  const lastThree = digits.slice(-3);

  return countryCode + maskedDigits + lastThree;
}

export const decideEnableMfaStatus = (mfa) => {
  if (!mfa) return false;

  return mfa?.methods?.emails?.length +
    mfa?.methods?.phoneNumbers?.length +
    mfa?.methods?.authenticatorApps?.length <
    1
    ? false
    : mfa?.enableMfa;
};

export const escapeRegex = (str) => {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return '';
  }

  const accStr = String(accountNumber);

  if (accStr.length <= 4) {
    return '*'.repeat(Math.max(0, accStr.length - 1)) + accStr.slice(-1);
  }

  return '*'.repeat(accStr.length - 4) + accStr.slice(-4);
};

export function getDaysUntilExpiration(unixTimestamp) {
  // Convert Unix timestamp to UTC date
  const expirationDate = new Date(unixTimestamp * 1000);
  const expirationUTC = Date.UTC(
    expirationDate.getUTCFullYear(),
    expirationDate.getUTCMonth(),
    expirationDate.getUTCDate()
  );

  // Get current date in UTC
  const now = new Date();
  const nowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const timeDifference = expirationUTC - nowUTC;
  const daysToExpire = Math.floor(timeDifference / oneDay);

  return daysToExpire;
}