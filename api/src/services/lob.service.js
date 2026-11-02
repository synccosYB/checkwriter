import axios from 'axios';
import config from 'config';
import { stripe } from './stripe.service.js';
import { getLobConfig, getPlatformSetting } from '../models/platformSettings.model.js';
import { buildLobCheckForm } from '../utils/lob-check-document.js';
import { assertLobCheckMailingReady } from '../utils/lob-mailing-guard.js';

const lobConfig = config.has('lob') ? config.get('lob') : {};
const LOB_BASE_URL = 'https://api.lob.com/v1';
const LOB_WEBHOOK_URL = lobConfig.webhook_url || process.env.LOB_WEBHOOK_URL || '';
const requireVerifiedCheckMailing = async () => assertLobCheckMailingReady({
  enabled: await getPlatformSetting('LOB_ORIGINAL_PDF_ENABLED') === 'true',
});

/**
 * Resolves the active LOB API key.
 * Priority: DB platform setting → environment variable → config file.
 */
export const resolveLobApiKey = async () => {
  try {
    const { apiKey } = await getLobConfig();
    if (apiKey) return apiKey;
  } catch (_) {}
  return lobConfig.api_key || process.env.LOB_API_KEY || '';
};

/**
 * Returns an axios instance authenticated with the active LOB API key.
 */
const getLobAxios = async () => {
  const key = await resolveLobApiKey();
  return axios.create({
    baseURL: LOB_BASE_URL,
    auth: { username: key, password: '' },
  });
};

// Static instance for backwards-compat where key doesn't change at runtime.
// For most calls we prefer getLobAxios() which always picks up the latest key.
const LOB_API_KEY_STATIC = lobConfig.api_key || process.env.LOB_API_KEY || '';
const lobAxios = axios.create({
  baseURL: LOB_BASE_URL,
  auth: { username: LOB_API_KEY_STATIC, password: '' },
});

export const LOB_MAIL_CLASSES = Object.freeze({
  FIRST_CLASS: 'first_class',
  STANDARD: 'standard',
  CERTIFIED: 'certified',
});

const lobPricingConfig = lobConfig.pricing || {};
export const LOB_MAIL_CLASS_PRICES = Object.freeze({
  standard: lobPricingConfig.standard ?? 0.99,
  first_class: lobPricingConfig.first_class ?? 1.79,
  certified: lobPricingConfig.certified ?? 7.89,
});

const LOB_MAIL_CLASS_DISPLAY = Object.freeze({
  standard: 'Standard Mail',
  first_class: 'First Class Mail',
  certified: 'Certified Mail (with Tracking)',
});

const LOB_MAIL_TYPE_MAP = Object.freeze({
  standard: { mail_type: 'usps_standard' },
  first_class: { mail_type: 'usps_first_class' },
  certified: { mail_type: 'usps_first_class', extra_service: 'certified' },
});

const COUNTRY_NAME_TO_ISO = {
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'u.s.a.': 'US',
  'u.s.': 'US',
  'canada': 'CA',
  'mexico': 'MX',
  'uk': 'GB',
  'united kingdom': 'GB',
  'great britain': 'GB',
};

const normalizeCountryCode = (country) => {
  if (!country) return 'US';
  const trimmed = country.trim();
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  return COUNTRY_NAME_TO_ISO[trimmed.toLowerCase()] || trimmed;
};

/**
 * Returns LOB mailing rates for US domestic letters.
 * LOB uses flat-rate pricing by mail class; no per-address quote API exists.
 * Validates the API key is active before returning configured rates.
 * Throws if the key is missing, invalid, or LOB is unreachable.
 * Keep config/default.json → lob.pricing in sync with https://lob.com/pricing/letters.
 */
const MAIL_CLASS_SETTING_KEYS = {
  standard: 'standardMailPrice',
  first_class: 'firstClassMailPrice',
  certified: 'certifiedMailPrice',
};

const parseAdminPrice = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

const resolveMailingPrices = async () => {
  const [standard, firstClass, certified] = await Promise.all([
    getPlatformSetting(MAIL_CLASS_SETTING_KEYS.standard),
    getPlatformSetting(MAIL_CLASS_SETTING_KEYS.first_class),
    getPlatformSetting(MAIL_CLASS_SETTING_KEYS.certified),
  ]);

  return {
    standard: parseAdminPrice(standard, LOB_MAIL_CLASS_PRICES.standard),
    first_class: parseAdminPrice(firstClass, LOB_MAIL_CLASS_PRICES.first_class),
    certified: parseAdminPrice(certified, LOB_MAIL_CLASS_PRICES.certified),
  };
};

export const getLOBRates = async () => {
  await requireVerifiedCheckMailing();
  const key = await resolveLobApiKey();
  if (!key) {
    throw new Error('LOB API key is not configured. Mail delivery via LOB is unavailable.');
  }

  const client = await getLobAxios();
  try {
    await client.get('/letters?limit=1');
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      throw new Error('LOB API key is invalid or not authorized. Please update the LOB_API_KEY.');
    }
    throw new Error(
      `LOB service is currently unavailable (${err.message || 'network error'}). Please try again later.`
    );
  }

  const prices = await resolveMailingPrices();

  return Object.entries(prices).map(([mailClass, price]) => ({
    provider: 'lob',
    type: 'mail',
    mailClass,
    displayName: LOB_MAIL_CLASS_DISPLAY[mailClass] || mailClass,
    price,
    currency: 'USD',
    estimatedDays: mailClass === 'certified' ? 3 : mailClass === 'first_class' ? 3 : 7,
    pricingModel: 'flat_rate',
    priceSource: 'lob_published_schedule',
  }));
};

export const createLOBLetter = async (options) => {
  await requireVerifiedCheckMailing();
  return submitLobCheckPdf(options);
};

// Only callers holding a server-rendered, reviewed PDF may submit a document.
export const submitLobCheckPdf = async ({
  addressFrom, addressTo, checkId, userId, mailClass = 'first_class',
  lobDescription, document, replacesLobId, idempotencyKey,
}) => {
  const address = (a) => ({
    name: a.name || a.companyName, company: a.companyName,
    address_line1: a.addressLine1, address_line2: a.addressLine2,
    address_city: a.city, address_state: a.state,
    address_zip: String(a.zipCode || a.zip || a.postalOrZip || ''),
    address_country: normalizeCountryCode(a.country),
  });
  const form = buildLobCheckForm({ addressFrom: address(addressFrom), addressTo: address(addressTo),
    checkId: String(checkId), userId: String(userId), mailClass, description: lobDescription,
    document, replacesLobId });
  const client = await getLobAxios();
  const response = await client.post('/letters', form, {
    timeout: 30000,
    headers: { 'Idempotency-Key': idempotencyKey || `check-pdf-v1-${checkId}-${document.fingerprint}` },
  });
  return response.data;
};

export const getLOBLetterById = async (lobLetterId) => {
  const client = await getLobAxios();
  try {
    const response = await client.get(`/letters/${lobLetterId}`);
    return response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const error = new Error(status === 404
        ? 'This letter was not found in the configured Lob account. Check the letter ID and Test/Live API key.'
        : status === 401 || status === 403
          ? 'Lob could not authorize this lookup. An administrator needs to check the mailing API key.'
          : 'Lob tracking is temporarily unavailable. Please retry.');
      error.statusCode = status === 404 ? 404 : 503;
      throw error;
    }
    throw err;
  }
};

export const cancelLOBLetter = async (lobLetterId) => {
  const client = await getLobAxios();
  try {
    const response = await client.delete(`/letters/${lobLetterId}`);
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(`LOB API error: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
};

export const createLOBWebhook = async (webhookUrl) => {
  const client = await getLobAxios();
  try {
    const response = await client.post('/webhooks', {
      url: webhookUrl || LOB_WEBHOOK_URL,
      description: 'LOB letter and check mailing status updates',
      event_types: [
        { id: 'letter.created' },
        { id: 'letter.mailed' },
        { id: 'letter.in_transit' },
        { id: 'letter.in_local_area' },
        { id: 'letter.processed_for_delivery' },
        { id: 'letter.delivered' },
        { id: 'letter.failed' },
      ],
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(`LOB API error: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
};

export const collectPaymentStripeLOB = async (
  checksDetails,
  origin,
  userId,
  organizationId
) => {
  await requireVerifiedCheckMailing();
  try {
    const prices = await resolveMailingPrices();
    const session = await stripe.checkout.sessions.create({
      line_items: checksDetails.map((item) => {
        const authorizedPrice =
          prices[item.mailClass] ??
          prices.first_class;
        return {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(authorizedPrice * 100),
            product_data: {
              name: `LOB Mail Check-${item.checkNumber} to ${item.payeeName} (${item.mailClass})`,
            },
          },
          quantity: 1,
        };
      }),
      mode: 'payment',
      metadata: {
        userId: organizationId ? '' : String(userId),
        organizationId: organizationId ? String(organizationId) : '',
        checkIds: JSON.stringify(checksDetails.map((c) => c.checkId)),
        provider: 'lob',
        mailClasses: JSON.stringify(checksDetails.map((c) => c.mailClass)),
      },
      success_url: `${origin}/dashboard/all-orders?session_id={CHECKOUT_SESSION_ID}&status=true&provider=lob`,
      cancel_url: `${origin}/dashboard/all-orders?session_id={CHECKOUT_SESSION_ID}&status=false&provider=lob`,
    });
    return session.url;
  } catch (err) {
    throw err;
  }
};

export const mapLOBStatusToCheckStatus = (lobStatus) => {
  const map = {
    in_transit: 'Processing',
    in_local_area: 'Processing',
    processed_for_delivery: 'Mailed',
    delivered: 'Mailed',
    re_routed: 'Processing',
    returned_to_sender: 'Error',
    mailed: 'Mailed',
    cancelled: 'Canceled',
    created: 'Submitted',
  };
  return map[lobStatus] || 'Submitted';
};
