import moment from 'moment';
import {
  createOrUpdateVerification,
  deleteVerification,
  getVerification,
  updateVerification,
} from '../models/verification.model.js';

export const upsertVerificationInDb = async (email, otp, status) => {
  try {
    const payload = {
      email,
      otp,
      status,
      createdAtUnix: moment.utc().format('X'),
      updatedAtUnix: moment.utc().format('X'),
    };
    await createOrUpdateVerification(payload);
  } catch (err) {
    throw err;
  }
};

export const deleteVerificationByEmail = async (email) => {
  try {
    await deleteVerification({ email });
  } catch (err) {
    throw err;
  }
};

export const getVerificationByEmail = async (email) => {
  try {
    const res = await getVerification({ email });
    if (res) {
      return res;
    }
    return;
  } catch (err) {
    throw err;
  }
};

export const getVerificationStatusByEmail = async (email) => {
  try {
    const res = await getVerification({ email });
    if (!(res && res.status)) {
      return;
    }
    if (res.status === 'PENDING') {
      return;
    } else if (res.status === 'VERIFIED') {
      return true;
    }
  } catch (err) {
    throw err;
  }
};

export const updateVerificationByEmail = async (email, body) => {
  try {
    const payload = {};
    if (body.otp) {
      payload.otp = body.otp;
    }
    if (body.status) {
      payload.status = body.status;
    }
    payload.updatedAtUnix = moment.utc().format('X');
    await updateVerification({ email }, payload);
  } catch (err) {
    throw err;
  }
};
