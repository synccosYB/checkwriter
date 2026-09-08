import { validateUserOrganization } from '../models/users.model.js';
import { validateToken } from '../utils/jwt.util.js';
import { getBasePath } from '../utils/common.util.js';
import { usersCollection } from '../models/dbCollections.js';

const nonAuthUrls = [
  '/health-check',
  '/auth',
  '/subscribe',
  '/verify',
  '/docs',
  '/docs.json',
  '/favicon.ico',
  '/payment-link/authorize-oauth',
  '/payment-link/get-oauth-link',
  '/dashboard',
  '/payment-link/payment-success-html',
  '/quickbooks/callback',
  '/quickbooks/webhook',
  '/quickbooks/auth',
  '/plaid/plaid-webhooks',
  '/managesubscription/webhook',
  '/managesubscription/payment-links/webhook',
  '/quickbooks/webhook',
  '/lob/webhookEvents',
  '/carrier-shipment/webhookEvents',
  '/scheduled-jobs'
];

const authButNotMfaUrls = [`/validate`, '/mfa/verify-otp'];

const adminRoutes = [
  '/admin/users',
  '/admin/act-as-user',
  '/admin/stop-act-as-user',
  '/admin/updateUser',
];

export default async (req, res, next) => {
  try {
    if (
      req.url === '/' ||
      nonAuthUrls.filter((ele) => req.url.startsWith(ele)).length
    ) {
      next();
    } else {

      const accessToken =
        req.headers.authorization ||
        req.headers.Authorization ||
        req.query.token;
      if (!accessToken) {
        const error = new Error('Access Token Missing');
        error.statusCode = 400;
        throw error;
      }

      const data = validateToken(accessToken);
      if (!(data && data.userId)) {
        const error = new Error('Unauthorized (Token expired or Invalid)');
        error.statusCode = 401;
        throw error;
      }
      if (data.adminId) {
        req.adminId = data.adminId;
      }
      req.userId = data.userId;
      req.isDemo = data.isDemo === true;

      const currentUser = await usersCollection.findById(data.userId);
      if (currentUser && currentUser.isActive === false) {
        const error = new Error('Account is deactivated. Please contact an administrator.');
        error.statusCode = 403;
        throw error;
      }

      if (adminRoutes.includes(getBasePath(req.url, req)) && !data?.adminId) {
        const error = new Error(
          'Forbidden: You do not have the required super admin role to access this resource.'
        );
        error.statusCode = 403;
        throw error;
      }

      if (
        data?.userId &&
        authButNotMfaUrls.filter((item) => req.url.startsWith(item)).length
      ) {
        return next();
      }

      const mfaValid =
        !!data?.mfaExpiresAt &&
        new Date(data.mfaExpiresAt).getTime() > Date.now();
      if (data?.enableMfa && !mfaValid && !data?.isValidated) {
        return res.status(401).json({
          message: 'MFA required and not validated. Please complete MFA.',
        });
      }

      req.organizationId =
        req.headers.organizationId || req.headers.organizationid || null;

      if (req.organizationId !== null && req.organizationId !== 'undefined') {
        let validate = await validateUserOrganization(
          req.userId,
          req.organizationId
        );

        if (!validate) {
          console.warn(`[auth] User ${req.userId} not authorized for org ${req.organizationId} - falling back to personal profile`);
          req.organizationId = null;
        }
      }
      next();
    }
  } catch (err) {
    next(err);
  }
};
