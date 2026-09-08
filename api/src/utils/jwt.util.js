import jwt from 'jsonwebtoken';
import config from 'config';

const { jwt_secret_key: secretKey, connect_me_jwt_secret_key: ssoSecretKey } = config;

if (!secretKey) {
    throw new Error('FATAL: Config File Missing');
}

export const generateToken = (payload, expireInSeconds) => {
    try {
        if (!payload) {
            return;
        }
        return jwt.sign(payload, secretKey, { expiresIn: (parseInt(expireInSeconds, 10) || 900) });
    } catch (err) {
        throw err;
    }
};

export const validateToken = (token) => {
    try {
        const res = jwt.verify(token, secretKey);
        if (!res) {
            return;
        }
        return res;
    } catch (err) {
        return;
    }
}

export const validateSSOToken = (token) => {
    try {
        const res = jwt.verify(token, ssoSecretKey);
        if (!res) {
            return;
        }
        return res;
    } catch (err) {
        return;
    }
}

export const createMfaGraceJwt = ({ userId, mfaExpiresAt }) => {
  const ttlSeconds = Math.max(
    1,
    Math.floor((new Date(mfaExpiresAt).getTime() - Date.now()) / 1000)
  );
  return generateToken({ userId, mfaExpiresAt }, ttlSeconds);
};

export const verifyMfaGraceJwt = (cookieValue) => {
  return validateToken(cookieValue);
};