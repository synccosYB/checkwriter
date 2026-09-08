import Shippo from 'shippo';
import axios from 'axios';
import config from 'config';
import { stripe } from './stripe.service.js';
import {
  SHIPPING_PLATFORM_MARGIN,
  OVERNIGHT_SERVICE_LEVELS,
  UPS_EXPRESS_SERVICE_LEVELS,
  FEDEX_EXPRESS_SERVICE_LEVELS,
  SERVICE_LEVEL_DISPLAY_NAMES,
} from '../constants/shipping.constants.js';

const shippoConfig = config.has('shippo') ? config.get('shippo') : {};
const SHIPPO_API_TOKEN =
  shippoConfig.api_token ||
  process.env.SHIPPO_API_TOKEN ||
  '';

const shippo = Shippo(SHIPPO_API_TOKEN);

export const getUPSFedExRates = async (addressFrom, addressTo, parcelDimensions) => {
  try {
    const parcel = {
      length: parcelDimensions?.length || '9',
      width: parcelDimensions?.width || '6',
      height: parcelDimensions?.height || '0.5',
      distance_unit: 'in',
      weight: parcelDimensions?.weight || '0.5',
      mass_unit: 'lb',
    };

    const shipment = await shippo.shipment.create({
      address_from: {
        name: addressFrom.name || addressFrom.companyName,
        company: addressFrom.companyName,
        street1: addressFrom.addressLine1,
        street2: addressFrom.addressLine2 || '',
        city: addressFrom.city,
        state: addressFrom.state,
        zip: String(addressFrom.zipCode || addressFrom.postalOrZip || ''),
        country: addressFrom.country || 'US',
      },
      address_to: {
        name: addressTo.name || addressTo.companyName,
        company: addressTo.companyName,
        street1: addressTo.addressLine1,
        street2: addressTo.addressLine2 || '',
        city: addressTo.city,
        state: addressTo.state,
        zip: String(addressTo.zipCode || addressTo.postalOrZip || ''),
        country: addressTo.country || 'US',
      },
      parcels: [parcel],
      async: false,
    });

    const rates = shipment.rates || [];
    const filteredRates = rates.filter(
      (rate) =>
        rate.servicelevel &&
        OVERNIGHT_SERVICE_LEVELS.includes(rate.servicelevel.token)
    );

    const margin = SHIPPING_PLATFORM_MARGIN;

    return filteredRates.map((rate) => {
      const basePrice = parseFloat(rate.amount);
      const priceWithMargin = parseFloat((basePrice * (1 + margin)).toFixed(2));
      const carrier = UPS_EXPRESS_SERVICE_LEVELS.includes(rate.servicelevel.token)
        ? 'ups'
        : 'fedex';

      return {
        provider: carrier,
        type: 'carrier',
        rateId: rate.object_id,
        shipmentId: shipment.object_id,
        serviceLevel: rate.servicelevel.token,
        serviceLevelName:
          SERVICE_LEVEL_DISPLAY_NAMES[rate.servicelevel.token] ||
          rate.servicelevel.name,
        carrierPrice: basePrice,
        price: priceWithMargin,
        currency: rate.currency || 'USD',
        estimatedDays: rate.estimated_days || 1,
        days: rate.days,
        carrier: carrier,
      };
    });
  } catch (err) {
    console.error('Error fetching UPS/FedEx rates:', err.message);
    throw err;
  }
};

export const createLabelPlatformAccount = async ({
  rateId,
  userId,
  organizationId,
  checkId,
}) => {
  try {
    const transaction = await shippo.transaction.create({
      rate: rateId,
      label_file_type: 'PDF',
      metadata: organizationId
        ? `Organization-${organizationId} ${checkId}`
        : `User-${userId} ${checkId}`,
      async: false,
    });
    return transaction;
  } catch (err) {
    throw err;
  }
};

export const createLabelUserAccount = async ({
  addressFrom,
  addressTo,
  parcelDimensions,
  serviceLevel,
  carrier,
  carrierAccountNumber,
  userId,
  organizationId,
  checkId,
}) => {
  try {
    const parcel = {
      length: parcelDimensions?.length || '9',
      width: parcelDimensions?.width || '6',
      height: parcelDimensions?.height || '0.5',
      distance_unit: 'in',
      weight: parcelDimensions?.weight || '0.5',
      mass_unit: 'lb',
    };

    const shipment = await shippo.shipment.create({
      address_from: {
        name: addressFrom.name || addressFrom.companyName,
        company: addressFrom.companyName,
        street1: addressFrom.addressLine1,
        street2: addressFrom.addressLine2 || '',
        city: addressFrom.city,
        state: addressFrom.state,
        zip: String(addressFrom.zipCode || addressFrom.postalOrZip || ''),
        country: addressFrom.country || 'US',
      },
      address_to: {
        name: addressTo.name || addressTo.companyName,
        company: addressTo.companyName,
        street1: addressTo.addressLine1,
        street2: addressTo.addressLine2 || '',
        city: addressTo.city,
        state: addressTo.state,
        zip: String(addressTo.zipCode || addressTo.postalOrZip || ''),
        country: addressTo.country || 'US',
      },
      parcels: [parcel],
      async: false,
      extra: {
        billing: {
          type: 'THIRD_PARTY',
          account: carrierAccountNumber,
          country: 'US',
          zip: String(addressFrom.zipCode || addressFrom.postalOrZip || ''),
        },
      },
    });

    const rates = shipment.rates || [];
    const selectedRate = rates.find(
      (r) => r.servicelevel && r.servicelevel.token === serviceLevel
    );

    if (!selectedRate) {
      throw new Error(`No rate found for service level ${serviceLevel}`);
    }

    const transaction = await shippo.transaction.create({
      rate: selectedRate.object_id,
      label_file_type: 'PDF',
      metadata: organizationId
        ? `Organization-${organizationId} ${checkId}`
        : `User-${userId} ${checkId}`,
      async: false,
    });

    return {
      transaction,
      rateId: selectedRate.object_id,
      shipmentId: shipment.object_id,
    };
  } catch (err) {
    throw err;
  }
};

const getShippoRateById = async (rateId) => {
  const { data } = await axios.get(`https://api.goshippo.com/rates/${rateId}`, {
    headers: { Authorization: `ShippoToken ${SHIPPO_API_TOKEN}` },
  });
  return data;
};

export const collectPaymentStripeCarrier = async (
  checksDetails,
  origin,
  userId,
  organizationId
) => {
  try {
    const lineItems = await Promise.all(
      checksDetails.map(async (item) => {
        let authorizedPrice;
        try {
          const rate = await getShippoRateById(item.rateId);
          const basePrice = parseFloat(rate.amount);
          authorizedPrice = parseFloat((basePrice * (1 + SHIPPING_PLATFORM_MARGIN)).toFixed(2));
        } catch {
          throw new Error(`Unable to retrieve rate ${item.rateId} from Shippo. Rate may be expired — please refresh rates and retry.`);
        }
        return {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(authorizedPrice * 100),
            product_data: {
              name: `${item.carrier?.toUpperCase()} ${item.serviceLevelName} - Check #${item.checkNumber}`,
            },
          },
          quantity: 1,
        };
      })
    );
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        userId: organizationId ? '' : String(userId),
        organizationId: organizationId ? String(organizationId) : '',
        checkIds: JSON.stringify(checksDetails.map((c) => c.checkId)),
        provider: 'carrier',
        rateIds: JSON.stringify(checksDetails.map((c) => c.rateId)),
        carriers: JSON.stringify(checksDetails.map((c) => c.carrier)),
        serviceLevels: JSON.stringify(checksDetails.map((c) => c.serviceLevel)),
      },
      success_url: `${origin}/dashboard/all-orders?session_id={CHECKOUT_SESSION_ID}&status=true&provider=carrier`,
      cancel_url: `${origin}/dashboard/all-orders?session_id={CHECKOUT_SESSION_ID}&status=false&provider=carrier`,
    });
    return session.url;
  } catch (err) {
    throw err;
  }
};

export const getCarrierTrackingStatus = async (carrier, trackingNumber) => {
  try {
    const { data } = await axios.get(
      `https://api.goshippo.com/tracks/${carrier}/${trackingNumber}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
        },
      }
    );
    return data;
  } catch (err) {
    throw err;
  }
};

export const mapCarrierStatusToCheckStatus = (shippoStatus) => {
  const map = {
    TRANSIT: 'Processing',
    DELIVERED: 'Mailed',
    FAILURE: 'Error',
    RETURNED: 'Error',
    UNKNOWN: 'Submitted',
    PRE_TRANSIT: 'Submitted',
    WAITING: 'Submitted',
    DELIVERED_TO_MAILROOM: 'Mailed',
    OUT_FOR_DELIVERY: 'Processing',
  };
  return map[shippoStatus?.toUpperCase()] || 'Submitted';
};
