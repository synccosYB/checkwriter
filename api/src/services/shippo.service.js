import Shippo from "shippo";
import axios from "axios";
import config from "config";

const shippoConfig = config.has("shippo") ? config.get("shippo") : {};
const shippo_api_token = shippoConfig.api_token || process.env.SHIPPO_API_TOKEN || "";
const shippo_carrier_account_id = process.env.SHIPPO_CARRIER_ACCOUNT_ID;

const shippo = Shippo(shippo_api_token);
const currentDate = new Date();

// ! Addresses

export const getAllAddressesShippo = async () => {
  try {
    const addresses = await shippo.address.list();
    return addresses;
  } catch (err) {
    throw err;
  }
};

export const createNewAddressShippo = async () => {
  try {
    // Create address object
    const createdAddress = await shippo.address.create({
      name: "Shawn Ippotle",
      company: "Shippo",
      street1: "215 Clayton St.",
      city: "San Francisco",
      state: "CA",
      zip: "94117",
      country: "US", // iso2 country code
      phone: "+1 555 341 9393",
      email: "shippotle@goshippo.com",
    });
    return createdAddress;
  } catch (err) {
    throw err;
  }
};

export const retrieveAddressShippo = async (addressId) => {
  try {
    // Retrieve an existing address by object_id
    const searchedAddress = await shippo.address.retrieve(addressId);
    return searchedAddress;
  } catch (err) {
    throw err;
  }
};

// ! Parcels

export const getAllParcelsShippo = async () => {
  try {
    // List all parcels
    const parcels = await shippo.parcel.list();
    return parcels;
  } catch (err) {
    throw err;
  }
};

export const createNewParcelShippo = async (payload) => {
  try {
    // Create parcel object
    const parcel = await shippo.parcel.create({
      length: payload.length,
      width: payload.width,
      height: payload.height,
      distance_unit: payload.distanceUnit,
      weight: payload.weight,
      mass_unit: payload.mass_unit,
    });
    return parcel;
  } catch (err) {
    throw err;
  }
};

// ! Shipments

export const getAllShipmentsShippo = async () => {
  try {
    const shipments = await shippo.shipment.list();
    return shipments;
  } catch (err) {
    throw err;
  }
};

export const createNewShipmentShippo = async (
  addressFrom,
  addressTo,
  parcel,
  customsDeclaration = null
) => {
  try {
    const carrierAccounts = await getAllCarrierAccountsShippo();
    const carrierAccountIds = carrierAccounts.results
      .filter(
        (eachAccount) =>
          eachAccount.carrier === "ups" || eachAccount.carrier === "fedex"
      )
      .map((eachAccount) => eachAccount.object_id);
    let shipment;
    if (customsDeclaration)
      shipment = await shippo.shipment.create({
        address_from: addressFrom,
        address_to: addressTo,
        parcels: [parcel],
        carrier_accounts: carrierAccountIds,
        async: true,
        customs_declaration: customsDeclaration,
      });
    else
      shipment = await shippo.shipment.create({
        address_from: addressFrom,
        address_to: addressTo,
        parcels: [parcel],
        carrier_accounts: carrierAccountIds,
        async: true,
      });
    return shipment;
  } catch (err) {
    throw err;
  }
};

export const retrieveShipmentShippo = async (shipmentId) => {
  try {
    const shipment = await shippo.shipment.retrieve(shipmentId);
    return shipment;
  } catch (err) {
    throw err;
  }
};

// ! Transactions

export const getAllTransactionsShippo = async (
  userId,
  organizationId,
  results,
  page
) => {
  try {
    // List all transactions
    let transactions = await shippo.transaction.list({
      results: results || 20,
      page: page || 1,
    });
    transactions = organizationId
      ? transactions.results.filter(
          (transaction) =>
            transaction.metadata.split(" ")[0] ===
            `Organization-${organizationId}`
        )
      : transactions.results.filter(
          (transaction) =>
            transaction.metadata.split(" ")[0] === `User-${userId}`
        );
    return transactions;
  } catch (err) {
    throw err;
  }
};

export const createTransactionShippo = async (
  rateId,
  userId,
  organizationId,
  checkId
) => {
  try {
    // Get the first rate in the rates results.
    // Customize this based on your business logic.

    // Purchase the desired rate.
    const transaction = await shippo.transaction.create({
      rate: rateId,
      label_file_type: "PDF",
      metadata: organizationId
        ? `Organization-${organizationId} ${checkId}`
        : `User-${userId} ${checkId}`,
      async: true,
    });
    return transaction;
  } catch (err) {
    throw err;
  }
};

export const retrieveTransactionShippo = async (transactionId) => {
  try {
    // Retrieve an existing transaction by object_id
    const transaction = await shippo.transaction.retrieve(transactionId);
    return transaction;
  } catch (err) {
    throw err;
  }
};

// ! Carrier Accounts

export const getAllCarrierAccountsShippo = async () => {
  try {
    // List all carrier accounts
    const carrierAccounts = await shippo.carrieraccount.list({ results: 100 });
    return carrierAccounts;
  } catch (err) {
    throw err;
  }
};

// ! Pickup

export const createPickupShippo = async (
  transactionIds,
  userId,
  organizationId
) => {
  try {
    // Creates pickup
    const { data } = await axios.post(
      "https://api.goshippo.com/pickups/",
      {
        carrier_account: shippo_carrier_account_id,
        location: {
          // location where the package will be picked up.
          // ! location of pickup. Permanent of Synccos Office.
          building_location_type: "Office",
          building_type: "Office",
          instructions: "Behind screen door",
          address: {
            name: "Yoel Bochner",
            company: "Synccos",
            street1: "1021 State Route 32",
            city: "Highland Mills",
            state: "NY",
            zip: "10930",
            country: "US",
            phone: "+13479854847",
            email: "no-reply@synccos.com",
          },
        },
        transactions: transactionIds,
        requested_start_time: new Date().toISOString(),
        requested_end_time: new Date(
          currentDate + 24 * 60 * 60 * 1000
        ).toISOString(),
        metadata: organizationId
          ? `Organization-${organizationId}`
          : `User-${userId}`,
        is_test: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `ShippoToken ${shippo_api_token}`,
        },
      }
    );
    return data;
  } catch (err) {
    throw err;
  }
};

// ! Tracking

export const getTrackingStatus = async (carrier, trackingNumber) => {
  try {
    const { data } = await axios.get(
      `https://api.goshippo.com/tracks/${carrier}/${trackingNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `ShippoToken ${shippo_api_token}`,
        },
      }
    );
    return data;
  } catch (err) {
    throw err;
  }
};

// ! Invoices

export const getAllInvoicesShippo = async () => {
  try {
    const { data } = await axios.get(
      "https://api.goshippo.com/invoices?results=100&page=1",
      {
        headers: {
          Authorization: `ShippoToken ${shippo_api_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (err) {
    throw err;
  }
};

