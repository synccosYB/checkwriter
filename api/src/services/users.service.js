import { ACCOUNT_TYPES_ENUM } from '../enums/account-type.enum.js';
import {
  addGroup,
  addPayee,
  addTag,
  createOrganizationDB,
  createUser,
  deleteGroup,
  deleteOrganizationDB,
  deletePayee,
  deleteTag,
  deleteUsersOrganization,
  findUser,
  getGroup,
  getGroups,
  getOrganizationDB,
  getOrganizationDetailDB,
  getOrganizationsDB,
  getPayeeByNickname,
  getUser,
  updateGroup,
  updateOrganizationDB,
  updatePayee,
  updatePreferences,
  updateTag,
  updateUser,
  fetchUsersWithFiltersAndPagination,
  FindUserByUserIdAndUpdate,
  updateUserRoleByUserId,
} from '../models/users.model.js';
import config from 'config';
import { appCache } from '../utils/nodeCache.util.js';
import { tagsCollection } from '../models/dbCollections.js';
import { generateAuthenticationTokens } from './authentication.service.js';
import SubscriptionService from './stripe.service.js';
import {
  uploadToS3,
  getPresignedDownloadUrl,
  deleteFromS3,
} from '../utils/s3.util.js';

export const updateUserRole = async (userId, role) => {
  try {
    const user = await getUser({ _id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const updateUser = await updateUserRoleByUserId(userId, role);
    return updateUser;
  } catch (err) {
    throw err;
  }
};

export const stopActUser = async (adminId) => {
  try {
    const user = await getUser({ _id: adminId });
    if (!user) {
      throw new Error('User not found');
    }

    return generateAuthenticationTokens({ userId: adminId, adminId });
  } catch (err) {
    throw err;
  }
};
export const actAsUser = async (userId, adminId) => {
  try {
    const userToImpersonate = await getUser({ _id: userId });
    if (!userToImpersonate) {
      throw new Error('User not found');
    }

    return generateAuthenticationTokens({ userId, adminId });
  } catch (err) {
    throw err;
  }
};

export const getAllRegisterUsers = async (
  pageSize,
  pageNumber,
  search,
  subscriptionStatuses,
  sortBy,
  startDate,
  endDate,
  sortOrder
) => {
  try {
    return await fetchUsersWithFiltersAndPagination(
      pageSize,
      pageNumber,
      search,
      subscriptionStatuses,
      sortBy,
      startDate,
      endDate,
      sortOrder
    );
  } catch (err) {
    throw err;
  }
};

export const UpdateUserLastLogin = async (payload) => {
  try {
    if (!payload) {
      return;
    }
    return await FindUserByUserIdAndUpdate(payload);
  } catch (err) {
    throw err;
  }
};

export const findUserByUserIdAndEmail = async (payload) => {
  try {
    if (!payload) {
      return;
    }
    return await findUser(payload);
  } catch (err) {
    throw err;
  }
};
export const findUserByEmail = async (email) => {
  try {
    if (!email) {
      return;
    }
    const payload = {
      email,
    };
    return await findUser(payload);
  } catch (err) {
    throw err;
  }
};

export const getUserIdByEmail = async (email) => {
  try {
    if (!email) {
      return;
    }
    const payload = {
      email,
    };
    const fieldPayload = { _id: 1 };
    return await getUser(payload, fieldPayload);
  } catch (err) {
    throw err;
  }
};

export const getUserDetails = async (userId) => {
  try {
    if (!userId) {
      return;
    }
    const payload = {
      _id: userId.toString(),
    };
    const fields = {
      firstName: 1,
      middleName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      dateOfBirth: 1,
      preferences: 1,
      signatureUrl: 1,
      role: 1,
      welcomeSeen: 1,
      // organizations: 1,
      trialMaxChecks: 1,
    };
    const userDetails = await getUser(payload, fields);
    const userSubscription = await SubscriptionService.getSubscriptionDetails({
          userId,
    });

    if (userSubscription.isSubscribed) {
      userDetails.trialMaxChecks = 0;
    } else {
      if (!userDetails.trialMaxChecks) {
        userDetails.trialMaxChecks = config.trial.trial_max_checks;
      }
    }

    return userDetails;
  } catch (err) {
    throw err;
  }
};

export const addUser = async (body) => {
  try {
    if (!body) {
      return;
    }

    const userPreferences = {
      wantSignature: false,
    };

    const payload = {
      firstName: body && body.firstName ? body.firstName : null,
      middleName: body && body.middleName ? body.middleName : null,
      lastName: body && body.lastName ? body.lastName : null,
      email: body && body.email ? body.email : null,
      phone: body && body.phone ? body.phone : null,
      dateOfBirth: body && body.dateOfBirth ? body.dateOfBirth : null,
      userPreferences,
    };

    const userDetails = await createUser(payload);
    if (!userDetails) {
      return;
    }
    return userDetails;
  } catch (err) {
    throw err;
  }
};

export const updateUserDetails = async (userId, body) => {
  try {
    const payload = {};
    if (body.firstName) {
      payload.firstName = body.firstName;
    }
    if (body.middleName !== undefined) {
      payload.middleName = body.middleName;
    }
    if (body.lastName) {
      payload.lastName = body.lastName;
    }
    if (body.phone) {
      payload.phone = body.phone;
    }
    if (body.dateOfBirth) {
      payload.dateOfBirth = body.dateOfBirth;
    }
    if (body.welcomeSeen !== undefined) {
      payload.welcomeSeen = body.welcomeSeen;
    }
    if (!Object.keys(payload).length) {
      return;
    }
    const res = await updateUser({ _id: userId }, payload);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

// ADDRESS
export const getUserAddress = async (userId, organizationId) => {
  try {
    if (!userId) {
      return;
    }
    if (organizationId) {
      const fields = {
        address: 1,
      };
      return await getOrganizationDB(organizationId, fields);
    }
    const payload = {
      _id: userId,
    };
    const fields = {
      address: 1,
    };
    return await getUser(payload, fields);
  } catch (err) {
    throw err;
  }
};

export const addUserAddress = async (userId, body, organizationId) => {
  try {
    if (!body) {
      return;
    }
    const payload = {
      name: body && body.name ? body.name : null,
      companyName: body && body.companyName ? body.companyName : null,
      addressLine1: body && body.addressLine1 ? body.addressLine1 : null,
      addressLine2: body && body.addressLine2 ? body.addressLine2 : null,
      city: body && body.city ? body.city : null,
      state: body && body.state ? body.state : null,
      country: body && body.country ? body.country : null,
      zipCode: body && body.zipCode ? body.zipCode : null,
    };
    if (organizationId) {
      const res = await updateOrganizationDB(organizationId, {
        $push: { address: payload },
      });
      if (res) {
        return res;
      }
      return;
    }
    const res = await updateUser(
      { _id: userId },
      { $push: { address: payload } }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const updateUserAddress = async (
  userId,
  addressId,
  body,
  organizationId
) => {
  try {
    const payload = {};
    if (body.name) {
      payload.name = body.name;
    }
    if (body.companyName) {
      payload.companyName = body.companyName;
    }
    if (body.addressLine1) {
      payload.addressLine1 = body.addressLine1;
    }
    if (body.addressLine2) {
      payload.addressLine2 = body.addressLine2;
    }
    if (body.city) {
      payload.city = body.city;
    }
    if (body.state) {
      payload.state = body.state;
    }
    if (body.country) {
      payload.country = body.country;
    }
    if (body.zipCode) {
      payload.zipCode = body.zipCode;
    }

    const allAddresses = await getUserAddress(userId, organizationId);
    allAddresses.address.forEach((address) => {
      if (address._id.toString() === addressId) {
        const updateKeys = Object.keys(payload);
        for (let i = 0; i < updateKeys.length; i += 1) {
          address[updateKeys[i]] = payload[updateKeys[i]];
        }
      }
    });
    if (organizationId) {
      const res = await updateOrganizationDB(organizationId, {
        address: [...allAddresses.address],
      });
      if (res) {
        return res;
      }
      return;
    }
    const res = await updateUser(
      { _id: userId },
      { address: [...allAddresses.address] }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const deleteUserAddress = async (userId, addressId, organizationId) => {
  try {
    const allAddresses = await getUserAddress(userId, organizationId);
    const updatedAddress = allAddresses.address.filter(
      (address) => address._id.toString() !== addressId
    );
    if (organizationId) {
      const res = await updateOrganizationDB(organizationId, {
        address: [...updatedAddress],
      });
      if (res) {
        return res;
      }
      return;
    }
    const res = await updateUser(
      { _id: userId },
      { address: [...updatedAddress] }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

// BANK DETAILS
export const getUserBankDetails = async (
  userId,
  organizationId,
  page,
  pageSize
) => {
  try {
    if (!userId) {
      return;
    }
    if (organizationId) {
      return await getOrganizationDB(
        organizationId,
        { bankDetails: 1 },
        page,
        pageSize
      );
    }
    const payload = {
      _id: userId,
    };
    const fields = {
      bankDetails: 1,
    };
    return await getUser(payload, fields);
  } catch (err) {
    throw err;
  }
};

export const getUserBankDetailsById = async (
  userId,
  organizationId,
  bankId
) => {
  try {
    if (!userId) return;
    let userDocument;
    if (organizationId) {
      userDocument = await getOrganizationDB(organizationId, {
        bankDetails: 1,
      });
    } else {
      userDocument = await getUser({ _id: userId }, { bankDetails: 1 });
    }
    return userDocument.bankDetails.filter((bank) => bank._id == bankId)[0];
  } catch (err) {
    throw err;
  }
};

export const addUserBankDetails = async (userId, body, organizationId) => {
  try {
    if (!body) {
      return;
    }
    const payload = {
      bankName: body && body.bankName ? body.bankName : null,
      accountType:
        body && body.accountType && ACCOUNT_TYPES_ENUM[body.accountType]
          ? ACCOUNT_TYPES_ENUM[body.accountType]
          : null,
      accountName: body && body.accountName ? body.accountName : null,
      accountNickName:
        body && body.accountNickName ? body.accountNickName : null,
      accountNumber: body && body.accountNumber ? body.accountNumber : null,
      bankRoutingNumber:
        body && body.bankRoutingNumber ? body.bankRoutingNumber : null,
      bankTransitNumber:
        body && body.bankTransitNumber ? body.bankTransitNumber : null,
      financialInstituteNumber:
        body && body.financialInstituteNumber
          ? body.financialInstituteNumber
          : null,
      country: body && body.country ? body.country.toUpperCase() : null,
      bankPreferences: {
        defaultCheckNumberLength: 6,
        defaultCheckStartNumber: 1,
      },
      balance: 0,
    };
    if (organizationId) {
      const res = await updateOrganizationDB(organizationId, {
        $push: { bankDetails: payload },
      });
      if (res) {
        return res;
      }
      return;
    }
    const res = await updateUser(
      { _id: userId },
      { $push: { bankDetails: payload } }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const updateUserBankDetailsById = async (
  userId,
  bankId,
  body,
  organizationId
) => {
  try {
    const payload = {};
    if (body.bankName) {
      payload.bankName = body.bankName;
    }
    if (body.accountType) {
      if (ACCOUNT_TYPES_ENUM[body.accountType]) {
        payload.accountType = ACCOUNT_TYPES_ENUM[body.accountType];
      }
    }
    if (body.accountName) {
      payload.accountName = body.accountName;
    }
    if (body.accountNickName) {
      payload.accountNickName = body.accountNickName;
    }
    if (body.accountNumber) {
      payload.accountNumber = body.accountNumber;
    }
    if (body.bankRoutingNumber) {
      payload.bankRoutingNumber = body.bankRoutingNumber;
    }
    if (body.bankTransitNumber) {
      payload.bankTransitNumber = body.bankTransitNumber;
    }
    if (body.financialInstituteNumber) {
      payload.financialInstituteNumber = body.financialInstituteNumber;
    }

    if (body.balance !== undefined) {
      payload.balance = body.balance;
    }
    if (body.country) {
      payload.country = body.country.toUpperCase();
    }

    if (body.bankPreferences) payload.bankPreferences = body.bankPreferences;

    const allBankDetails = await getUserBankDetails(userId, organizationId);
    allBankDetails.bankDetails.forEach((bank) => {
      if (bank._id.equals(bankId)) {
        const updateKeys = Object.keys(payload);
        for (let i = 0; i < updateKeys.length; i += 1) {
          bank[updateKeys[i]] = payload[updateKeys[i]];
        }
      }
    });
    if (organizationId) {
      const res = await updateOrganizationDB(organizationId, {
        bankDetails: [...allBankDetails.bankDetails],
      });
      if (res) {
        return res;
      }
      return;
    } else {
      const res = await updateUser(
        { _id: userId },
        { bankDetails: [...allBankDetails.bankDetails] }
      );
      if (res) {
        return res;
      }
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const deleteUserBankDetails = async (userId, bankId, organizationId) => {
  try {
    const allBankDetails = await getUserBankDetails(userId, organizationId);
    const updatedBankDetails = allBankDetails.bankDetails.filter(
      (bank) => bank._id.toString() !== bankId
    );
    if (organizationId) {
      const res = await updateOrganizationDB(organizationId, {
        bankDetails: [...updatedBankDetails],
      });
      if (res) {
        return res;
      }
      return;
    }
    const res = await updateUser(
      { _id: userId },
      { bankDetails: [...updatedBankDetails] }
    );
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const validateBankAccountNickName = async (
  userId,
  nickName,
  organizationId
) => {
  try {
    let result = true;
    if (!nickName) {
      return result;
    }
    const resFromDb = await getUserBankDetails(userId, organizationId);

    const { bankDetails } = resFromDb;
    if (bankDetails && bankDetails.length) {
      bankDetails.forEach((bank) => {
        if (
          bank &&
          bank.accountNickName &&
          bank.accountNickName.toLowerCase().trim() ===
            nickName.toLowerCase().trim()
        ) {
          result = false;
        }
      });
    }
    return result;
  } catch (err) {
    throw err;
  }
};

export const validateBankAccountNumber = async (
  userId,
  accountNumber,
  organizationId
) => {
  try {
    let result = true;
    if (!accountNumber) {
      return result;
    }

    const resFromDb = await getUserBankDetails(userId, organizationId);

    const { bankDetails } = resFromDb;
    if (bankDetails && bankDetails.length) {
      bankDetails.forEach((bank) => {
        if (
          bank &&
          bank.accountNumber &&
          bank.accountNumber === accountNumber
        ) {
          result = false;
        }
      });
    }
    return result;
  } catch (err) {
    throw err;
  }
};

// PAYEE
export const addUserPayee = async (userId, body, organizationId) => {
  try {
    const addressPayload = {
      name: body && body.name ? body.name : null,
      companyName:
        body && body.address && body.address.companyName
          ? body.address.companyName
          : null,
      addressLine1:
        body && body.address && body.address.addressLine1
          ? body.address.addressLine1
          : null,
      addressLine2:
        body && body.address && body.address.addressLine2
          ? body.address.addressLine2
          : null,
      city:
        body && body.address && body.address.city ? body.address.city : null,
      state:
        body && body.address && body.address.state ? body.address.state : null,
      country:
        body && body.address && body.address.country
          ? body.address.country
          : null,
      zipCode:
        body && body.address && body.address.zipCode
          ? body.address.zipCode
          : null,
    };
    const payeePayload = {
      name: body && body.name ? body.name : null,
      nickName: body && body.nickName ? body.nickName : null,
      companyName: body && body.companyName ? body.companyName : null,
      address: addressPayload,
      phone: body && body.phone ? body.phone : null,
      email: body && body.email ? body.email : null,
    };

    const res = await addPayee(userId, payeePayload, organizationId);
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const getUserPayeeByEmail = async (userId, email, organizationId) => {
  try {
    let userPayees;
    if (organizationId) {
      userPayees = await getOrganizationDB(organizationId, {
        payees: 1,
        _id: 0,
      });
    } else {
      userPayees = await getUser({ _id: userId }, { payees: 1, _id: 0 });
    }

    // Check if payees exist
    if (!userPayees || !userPayees.payees) {
      return null;
    }

    // Since payees are stored as a Map, we need to iterate over it
    let result = null;
    for (let [payeeId, payee] of userPayees.payees) {
      if (payee.email === email) {
        result = payee;
        break; // Exit loop once we find the matching email
      }
    }

    if (!result) {
      return null; // No payee found with the given email
    }

    // Destructure the necessary fields from the result
    const {
      _id,
      name,
      nickName,
      companyName,
      address: {
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipCode,
      } = {},
      phone,
    } = result;

    return {
      _id,
      name,
      nickName,
      companyName,
      address: {
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipCode,
      },
      email,
      phone,
    };
  } catch (err) {
    throw err;
  }
};

export const getAllUserPayees = async (userId, organizationId) => {
  try {
    let userPayees;
    if (organizationId)
      userPayees = await getOrganizationDB(organizationId, {
        payees: 1,
        _id: 0,
      });
    else userPayees = await getUser({ _id: userId }, { payees: 1, _id: 0 });
    const result = [];
    userPayees.payees.forEach((value, key) => {
      const {
        name,
        nickName,
        companyName,
        address: { addressLine1, addressLine2, city, state, country, zipCode },
        email,
        phone,
        _id,
      } = value;

      const payee = {
        name,
        nickName,
        companyName,
        address: {
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          zipCode,
        },
        email,
        phone,
        id: key,
      };

      payee.address.name = name;
      payee.address.companyName = companyName;

      result.push(payee);
    });
    return result;
  } catch (err) {
    throw err;
  }
};

export const getUserPayeeById = async (userId, payeeId, organizationId) => {
  try {
    let userPayees;
    if (organizationId)
      userPayees = await getOrganizationDB(organizationId, {
        payees: 1,
        _id: 0,
      });
    else userPayees = await getUser({ _id: userId }, { payees: 1, _id: 0 });

    const result = userPayees.payees.get(payeeId);
    if (!result) {
      return;
    }

    const {
      name,
      nickName,
      companyName,
      address: { addressLine1, addressLine2, city, state, country, zipCode },
      email,
      phone,
    } = result;
    return {
      name,
      nickName,
      companyName,
      address: {
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipCode,
      },
      email,
      phone,
    };
  } catch (err) {
    throw err;
  }
};

export const updateUserPayeeById = async (
  userId,
  payeeId,
  body,
  organizationId
) => {
  try {
    const { name, nickName, companyName, address, email, phone } = body;

    const payee = await getUserPayeeById(userId, payeeId, organizationId);

    const updatedPayee = { ...payee };
    if (name) {
      updatedPayee.name = name;
    }
    if (nickName) {
      updatedPayee.nickName = nickName;
    }
    if (companyName) {
      updatedPayee.companyName = companyName;
    }
    if (address) {
      const { addressLine1, addressLine2, city, state, country, zipCode } =
        address;

      if (addressLine1) {
        updatedPayee.address.addressLine1 = addressLine1;
      }
      if (addressLine2) {
        updatedPayee.address.addressLine2 = addressLine2;
      }
      if (city) {
        updatedPayee.address.city = city;
      }
      if (state) {
        updatedPayee.address.state = state;
      }
      if (country) {
        updatedPayee.address.country = country;
      }
      if (zipCode) {
        updatedPayee.address.zipCode = zipCode;
      }
    }
    if (email) {
      updatedPayee.email = email;
    }
    if (phone) {
      updatedPayee.phone = phone;
    }

    const res = await updatePayee(
      userId,
      payeeId,
      updatedPayee,
      organizationId
    );
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteUserPayeeById = async (userId, payeeId, organizationId) => {
  try {
    const res = await deletePayee(userId, payeeId, organizationId);
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const validatePayeeNickname = async (
  userId,
  payeeNickname,
  organizationId
) => {
  try {
    const res = await getPayeeByNickname(
      userId,
      payeeNickname.toLowerCase(),
      organizationId
    );
    return !res;
  } catch (err) {
    throw err;
  }
};

export const isPayeeEdited = async (payload, check) => {
  try {
    const editedFields = [];

    const compareObjects = (obj1, obj2, path = '') => {
      for (const key in obj1) {
        const newPath = path ? `${path}.${key}` : key;

        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          compareObjects(obj1[key], obj2[key], newPath);
        } else if (obj1[key] !== obj2[key]) {
          editedFields.push(newPath);
        }
      }
    };

    compareObjects(payload, check.payee);

    return !!editedFields.length;
  } catch (err) {
    throw err;
  }
};

//TAGS

export const getTagsById = async (userId, tagIds, organizationId) => {
  try {
    let userTags;
    if (organizationId)
      userTags = await getOrganizationDB(organizationId, { tags: 1 });
    else userTags = await getUser({ _id: userId }, { tags: 1 });
    const tags = [];

    for (const tagId of tagIds) {
      const tag = userTags.tags.get(tagId);
      if (!tag) {
        throw new Error('Tag does not exist');
      }
      tags.push(tag);
    }

    return tags;
  } catch (err) {
    throw err;
  }
};

export const getTagById = async (userId, tagId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const tag = await tagsCollection.findOne({ _id: tagId, ownerId, ownerType });

    if (!tag) {
      throw new Error('Tag does not exist');
    }

    return tag;
  } catch (err) {
    throw err;
  }
};

export const deleteTagsById = async (userId, tagId, organizationId) => {
  try {
    const res = await deleteTag(userId, tagId, organizationId);
    if (!res) {
      throw new Error('Unable to delete tag');
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const addUserTag = async (userId, body, organizationId) => {
  try {
    const tagPayload = {
      name: body && body.name ? body.name : null,
      color: body && body.color ? body.color : null,
      group:
        body && body.group ? body.group.toString() : null,
    };
    const res = await addTag(userId, tagPayload, organizationId);
    if (!res) {
      throw new Error('Unable to add tag');
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateTagById = async (userId, tagId, body, organizationId) => {
  try {
    const { name, color, group } = body;
    const updatedTag = await getTagById(userId, tagId, organizationId);

    if (name) {
      updatedTag.name = name;
    }

    if (color) {
      updatedTag.color = color;
    }

    if (group) {
      updatedTag.group = group;
    }

    const res = await updateTag(userId, tagId, updatedTag, organizationId);
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const getTagsByUserId = async (userId, organizationId) => {
  try {
    const ownerId = organizationId || userId;
    const ownerType = organizationId ? 'organization' : 'user';
    const allTags = await tagsCollection.find({ ownerId, ownerType });
    if (!allTags || allTags.length === 0) return;
    const tagsMap = new Map();
    allTags.forEach(t => tagsMap.set(t._id, t));
    return tagsMap;
  } catch (err) {
    throw err;
  }
};

//Preferences

export const updatePreferencesById = async (userId, body, organizationId) => {
  try {
    const res = await updatePreferences(userId, body, organizationId);
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

//Groups

export const createGroupById = async (userId, body, organizationId) => {
  try {
    const { name, color } = body;
    const payload = {
      name,
      color,
    };

    const res = await addGroup(userId, payload, organizationId);
    if (!res) {
      throw new Error('Unable to add group');
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateGroupById = async (
  userId,
  groupId,
  body,
  organizationId
) => {
  try {
    const { name, color } = body;
    let updatedGroup = await getGroupById(userId, groupId, organizationId);

    if (name) {
      updatedGroup.name = name;
    }
    if (color) {
      updatedGroup.color = color;
    }

    const res = await updateGroup(
      userId,
      groupId,
      updatedGroup,
      organizationId
    );
    if (!res) {
      return;
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const getGroupById = async (userId, groupId, organizationId) => {
  try {
    const res = await getGroup(userId, groupId, organizationId);
    if (!res) {
      return;
    }

    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteGroupById = async (userId, groupId, organizationId) => {
  try {
    const res = await deleteGroup(userId, groupId, organizationId);
    if (!res) {
      throw new Error('Unable to delete Group');
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const getGroupsById = async (userId, organizationId) => {
  try {
    const res = await getGroups(userId, organizationId);
    if (!res) {
      return;
    }

    return res;
  } catch (err) {
    throw err;
  }
};

export const validateGroupById = async (userId, groupId, organizationId) => {
  try {
    return await getGroupById(userId, groupId, organizationId);
  } catch (err) {
    throw err;
  }
};

// Organization

export const createOrganization = async (userId, body) => {
  try {
    const payload = {
      ...body,
      preferences: {
        wantSignature: false,
      },
    };
    const createdOrganization = await createOrganizationDB(userId, payload);
    if (!createdOrganization) {
      throw new Error(
        'Cannot create Organization. Maybe an organization with same name exists.'
      );
    }
    return createdOrganization;
  } catch (err) {
    throw err;
  }
};

export const generateOrganizationLogoUrlUpload = async (
  organizationId,
  fileContent
) => {
  try {
    return uploadToS3({
      Bucket: config.s3.bucket_name,
      Key: `${organizationId}/checkWriter/orgLogo`,
      ContentType: 'image/png',
      Body: fileContent,
    });
  } catch (err) {
    throw err;
  }
};

export const deleteOrganizationLogo = async (organizationId) => {
  try {
    await deleteFromS3({
      Bucket: config.s3.bucket_name,
      Key: `${organizationId}/checkWriter/orgLogo`,
    });
    const organization = await getOrganizationDetailDB(organizationId, {
      organizationLogo: 1,
    });
    organization.organizationLogo = '';
    await organization.save();
    return;
  } catch (err) {
    throw err;
  }
};

export const generateOrganizationLogoUrlDownload = async (organizationId) => {
  try {
    const presignedURL = await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: `${organizationId}/checkWriter/orgLogo`,
      expiresIn: 60 * 60 * 24 * 7,
    });
    if (!presignedURL) return;

    return presignedURL;
  } catch (err) {
    throw err;
  }
};

export const updateOrganization = async (organizationId, body) => {
  try {
    const organizationDetails = await getOrganizationDB(organizationId, {
      bankDetails: 0,
      payees: 0,
      groups: 0,
      tags: 0,
      users: 0,
      address: 0,
    });
    if (body.organizationName)
      organizationDetails.organizationName = body.organizationName;
    if (body.location) organizationDetails.location = body.location;
    if (body.industryType) organizationDetails.industryType = body.industryType;
    if (body.organizationLogo)
      organizationDetails.organizationLogo = body.organizationLogo;
    if (body.city) organizationDetails.city = body.city;
    if (body.state) organizationDetails.state = body.state;
    if (body.addressLine1) organizationDetails.addressLine1 = body.addressLine1;
    if (body.addressLine2) organizationDetails.addressLine2 = body.addressLine2;
    if (body.zip) organizationDetails.zip = body.zip;
    if (body.country) organizationDetails.country = body.country;
    if (body.entityType) organizationDetails.entityType = body.entityType;
    if (body.dba) organizationDetails.dba = body.dba;
    if (body.formationDate)
      organizationDetails.formationDate = body.formationDate;
    if (body.ein) organizationDetails.ein = body.ein;
    const updatedOrganization = await updateOrganizationDB(
      organizationId,
      organizationDetails
    );
    if (!updatedOrganization) throw new Error('Cannot update organization.');
    return organizationDetails;
  } catch (err) {
    throw err;
  }
};

export const deleteOrganization = async (userId, organizationId) => {
  try {
    // delete organization
    await deleteOrganizationDB(organizationId);
    // delete all users map to organization
    await deleteUsersOrganization(organizationId);
  } catch (err) {
    throw err;
  }
};

export const getAllOrganizations = async (userId) => {
  try {
    const organizationIds = await getOrganizationsDB(userId);
    const unwantedFields = {
      bankDetails: 0,
      groups: 0,
      payees: 0,
      tags: 0,
      users: 0,
    };
    const orgPromises = organizationIds.map((orgId) =>
      getOrganizationDetailDB(orgId.organizationId, unwantedFields)
    );
    const orgDetails = await Promise.all(orgPromises);
    if (!orgDetails) return;
    return orgDetails;
  } catch (err) {
    throw err;
  }
};

// Signature

export const generateSignatureUrlUpload = async (
  userId,
  fileContent,
  organizationId
) => {
  try {
    return uploadToS3({
      Bucket: config.s3.bucket_name,
      Key: organizationId
        ? `${userId}/checkWriter/organization/${organizationId}/uniqueSignature`
        : `${userId}/checkWriter/personal/uniqueSignature`,
      ContentType: 'image/png',
      Body: fileContent,
    });
  } catch (err) {
    throw err;
  }
};

export const generateSignatureUrlDownload = async (userId, organizationId) => {
  try {
    const presignedURL = await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: organizationId
        ? `${userId}/checkWriter/organization/${organizationId}/uniqueSignature`
        : `${userId}/checkWriter/personal/uniqueSignature`,
      expiresIn: 60 * 60 * 24 * 7,
    });
    if (!presignedURL) return;

    let userDetails;
    if (organizationId)
      userDetails = await getOrganizationDB(organizationId, {
        signatureUrl: 1,
      });
    else userDetails = await getUserDetails(userId, { signatureUrl: 1 });

    userDetails.signatureUrl = presignedURL;

    await userDetails.save();

    appCache.del(
      organizationId ? `Organization-${organizationId}` : `User-${userId}`
    );

    return presignedURL;
  } catch (err) {
    throw err;
  }
};

export const renewSignatureUrlDownload = async (url) => {
  try {
    const key = new URL(url).pathname.replace('/', '');
    const presignedURL = await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: key,
      expiresIn: 60 * 60 * 24 * 7,
    });
    if (!presignedURL) return;
    return presignedURL;
  } catch (err) {
    throw err;
  }
};
