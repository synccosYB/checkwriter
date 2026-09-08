import axios from "axios";
import Stripe from "stripe";
import config from "config";

const {
  postgrid: { 
    api_key,
    base_url,
    webhook_url
  },
  stripe_subscription:{
    stripe_secret_key
  }
} = config;

const apiKey = api_key;
const baseUrl = base_url || "https://api.postgrid.com/print-mail/v1";
const stripe = Stripe(stripe_secret_key);

// {
//     from: {
//       companyName: "PostGrid",
//       addressLine1: "20-20 bay st",
//       addressLine2: "floor 11",
//       city: "toronto",
//       provinceOrState: "on",
//       postalOrZip: "M5V 4G9",
//     },
//     to: {
//       companyName: "PostGrid",
//       addressLine1: "20-20 bay st",
//       addressLine2: "floor 11",
//       city: "toronto",
//       provinceOrState: "on",
//       postalOrZip: "M5V 4G9",
//     },

//     description: "Test",
//     bankAccount: "bank_e1DGEzDfYWkKQXZ5yPTW8m",
//     amount: "10000",
//     memo: "A short memo.",
//     number: "5049",
//   }

export const sendCheque = async (
  addressFrom,
  addressTo,
  amount,
  memo,
  checkNumber,
  checkId,
  userId
) => {
  try {
    const bankAccount = "bank_e1DGEzDfYWkKQXZ5yPTW8m";
    const response = await axios.post(
      `${baseUrl}/cheques`,
      {
        from: addressFrom,
        to: addressTo,
        bankAccount: bankAccount,
        amount: amount,
        memo: memo,
        number: checkNumber,
        metadata: {
          userId,
          checkId,
        },
      },
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getBankAccounts = async () => {
  try {
    const bankAccounts = await axios.get(`${baseUrl}/bank_accounts`, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    return bankAccounts.data;
  } catch (err) {
    throw err;
  }
};

export const getBankAccountById = async (bankId) => {
  try {
    const { data: bankAccount } = await axios.get(
      `${baseUrl}/bank_accounts/${bankId}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    return bankAccount;
  } catch (err) {
    throw err;
  }
};

// {
//     bankName: "Example Bank",
//     accountNumber: "9876543211",
//     routingNumber: "123456789",
//     bankCountryCode: "US",
//     signatureText: "Sample Signature",
//     bankPrimaryLine: "100 Garden Street",
//     bankSecondaryLine: "Gananoque, ON K7G 1H9",
//     description: "My american bank with a signature text",
//     metadata: {
//       country: "America",
//     },
//   }
export const createBankAccount = async (body) => {
  try {
    const response = await axios.post(`${baseUrl}/bank_accounts`, body, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getChequeById = async (chequeId) => {
  try {
    const { data: chequeDetails } = await axios.get(
      `${baseUrl}/cheques/${chequeId}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    return chequeDetails;
  } catch (err) {
    throw err;
  }
};

export const getAllCheques = async (userId) => {
  try {
    const { data: allCheques } = await axios.get(`${baseUrl}/cheques`, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    let userChecks = allCheques.data.filter(
      (check) => check?.metadata?.userId === userId
    );
    const userCheckListing = userChecks.map((check) => {
      return {
        checkNumber: check.number,
        amount: check.amount,
        payeeName: check.to.companyName,
        trackingId: check.id,
        trackingStatus: check.status,
        trackingUrl: "",
      };
    });
    return userCheckListing;
  } catch (err) {
    throw err;
  }
};

export const deleteCheque = async (chequeId) => {
  try {
    const { data: deletedCheque } = await axios.delete(
      `${baseUrl}/cheques/${chequeId}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    return deletedCheque;
  } catch (err) {
    console.error(err.response.data);
    throw err;
  }
};

export const getChequeProgress = async (chequeId) => {
  try {
    const { data: chequeProgress } = await axios.post(
      `${baseUrl}/cheques/${chequeId}/progressions`,
      {},
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    return chequeProgress;
  } catch (err) {
    throw err;
  }
};

export const collectPaymentStripePostgrid = async (checkDetails, origin) => {
  try {
    // checkDetails -> [{checkNumber, payeeName, totalAmount, checkId}]
    const session = await stripe.checkout.sessions.create({
      line_items: checkDetails.map((item) => ({
        price_data: {
          currency: "usd",
          unit_amount: item.totalAmount * 100,
          product_data: {
            name: `Mail Check-${item.checkNumber} to ${item.payeeName}`,
          },
        },
        quantity: 1,
      })),
      mode: "payment",
      metadata: {
        userId: checkDetails.userId || "",
        organizationId: checkDetails.organizationId || "",
        checkIds: JSON.stringify(
          checkDetails.map((checkDetails) => checkDetails.checkId)
        ),
      },
      success_url: `${origin}/dashboard/all-orders?session_id={CHECKOUT_SESSION_ID}&status=true`,
      cancel_url: `${origin}/dashboard/all-orders?session_id={CHECKOUT_SESSION_ID}&status=false`,
    });
    return session.url;
  } catch (err) {
    throw err;
  }
};

export const createWebhook = async () => {
  try {
    const response = await axios.post(
      `${baseUrl}/webhooks`,
      {
        description: "Cheque Created or Updated",
        url: webhook_url,
        enabledEvents: ["cheque.created", "cheque.updated"],
      },
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};