import axios from 'axios'
import { getUser } from '../models/users.model.js'

const authorizationId = process.env.PLAID_AUTHORIZATION_ID
const transferId = process.env.PLAID_TRANSFER_ID
const fundingAccountId = process.env.PLAID_FUNDING_ACCOUNT_ID

const plaidClientId = process.env.PLAID_CLIENT_ID
const plaidClientSecret = process.env.PLAID_CLIENT_SECRET

export const getLinkToken = async (payload) => {
  try {
    const linkTokenDetails = await axios.post(
      'https://sandbox.plaid.com/link/token/create',
      {
        client_id: plaidClientId,
        secret: plaidClientSecret,
        client_name: 'Synccos',
        user: {
          client_user_id: payload.userId,
          phone_number: '+1 415 5550123',
        },
        products: ['auth', 'transfer'],
        country_codes: ['US'],
        language: 'en',
        webhook: 'http://localhost:7777/plaid/webhook',
        redirect_uri: 'http://localhost:7777/plaid/callback',
      }
    )
    return linkTokenDetails.data.link_token
  } catch (err) {
    throw err
  }
}

export const getPlaidAccessToken = async (publicToken) => {
  try {
    const accessTokenDetails = await axios.post(
      'https://sandbox.plaid.com/item/public_token/exchange',
      {
        client_id: plaidClientId,
        secret: plaidClientSecret,
        public_token: publicToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return accessTokenDetails.data
  } catch (err) {
    throw err
  }
}

export const createTransferAuthorization = async (userId) => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/authorization/create',
      {
        access_token: accessToken,
        account_id: accountId,
        client_id: plaidClientId,
        secret: plaidClientSecret,
        type: 'credit',
        network: 'ach',
        amount: '12.34',
        ach_class: 'ppd',
        user: {
          legal_name: 'Anne Charleston',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const createTransfer = async () => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/create',
      {
        amount: '12.34',
        description: 'payment',
        client_id: plaidClientId,
        secret: plaidClientSecret,
        access_token: accessToken,
        account_id: accountId,
        authorization_id: authorizationId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const cancelTransfer = async () => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/cancel',
      {
        transfer_id: transferId,
        client_id: plaidClientId,
        secret: plaidClientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const getTransfer = async () => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/get',
      {
        transfer_id: transferId,
        client_id: plaidClientId,
        secret: plaidClientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const getTransferList = async () => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/list',
      {
        start_date: '2019-12-06T22:35:49Z',
        end_date: '2019-12-12T22:35:49Z',
        count: 1,
        offset: 0,
        origination_account_id: fundingAccountId,
        client_id: plaidClientId,
        secret: plaidClientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const getTransferEventList = async () => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/event/list',
      {
        start_date: '2019-12-06T22:35:49Z',
        end_date: '2019-12-12T22:35:49Z',
        transfer_id: transferId,
        account_id: accountId,
        transfer_type: 'credit',
        event_types: ['pending', 'posted'],
        count: 14,
        offset: 2,
        origination_account_id: fundingAccountId,
        client_id: plaidClientId,
        secret: plaidClientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (err) {
    throw err
  }
}

export const getSweepInfoBySweepId = async (sweepId) => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/sweep/get',
      {
        sweep_id: sweepId,
        client_id: plaidClientId,
        secret: plaidClientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const syncTransferEvent = async () => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/transfer/event/sync',
      {
        after_id: 4,
        count: 22,
        client_id: plaidClientId,
        secret: plaidClientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

export const createProcessorToken = async (accessToken, accountId) => {
  try {
    const response = await axios.post(
      'https://sandbox.plaid.com/processor/token/create',
      {
        client_id: plaidClientId,
        secret: plaidClientSecret,
        access_token: accessToken,
        account_id: accountId,
        processor: 'dwolla',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}

const dwollaKey = process.env.DWOLLA_KEY
const dwollaSecret = process.env.DWOLLA_SECRET

export const createDwollaAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://api-sandbox.dwolla.com/token',
      {
        grant_type: 'client_credentials',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(dwollaKey + ':' + dwollaSecret),
        },
      }
    )
    return response.data
  } catch (err) {
    throw err
  }
}
export const createRecipient = async (
  recipientFirstName,
  recipientLastName,
  recipientEmail,
  recipientAddress1,
  recipientCity,
  recipientState,
  recipientPostalCode,
  recipientDOB,
  recipientSSN,
  recipientType,
  dwollaAT
) => {
  try {
    const response = await axios.post(
      'https://api-sandbox.dwolla.com/customers',
      {
        firstName: recipientFirstName,
        lastName: recipientLastName,
        email: recipientEmail,
        type: recipientType,
        address1: recipientAddress1,
        city: recipientCity,
        state: recipientState,
        postalCode: recipientPostalCode,
        dateOfBirth: recipientDOB,
        ssn: recipientSSN,
      },
      {
        headers: {
          'Content-Type': 'application/vnd.dwolla.v1.hal+json',
          Accept: 'application/vnd.dwolla.v1.hal+json',
          Authorization: 'Bearer ' + dwollaAT,
        },
      }
    )
    return response.headers.location
  } catch (err) {
    throw err
  }
}

export const getCustomerIdByEmail = async (email) => {
  try {
    const dwollaAT = await createDwollaAccessToken()
    const response = await axios.get(
      `https://api-sandbox.dwolla.com/customers?email=${encodeURIComponent(
        email
      )}`,
      {
        headers: {
          'Content-Type': 'application/vnd.dwolla.v1.hal+json',
          Accept: 'application/vnd.dwolla.v1.hal+json',
          Authorization: 'Bearer ' + dwollaAT.access_token,
        },
      }
    )
    const customerId = response.data._embedded.customers[0].id
    return customerId
  } catch (err) {
    throw err
  }
}

export const createReceiverFundingSource = async (
  customerUrl,
  firstName,
  lastName,
  routingNumber,
  accountNumber,
  accountType,
  dwollaAT
) => {
  try {
    const response = await axios.post(
      `${customerUrl}/funding-sources`,
      {
        routingNumber: routingNumber,
        accountNumber: accountNumber,
        bankAccountType: accountType,
        name: firstName + ' ' + lastName,
      },
      {
        headers: {
          'Content-Type': 'application/vnd.dwolla.v1.hal+json',
          Accept: 'application/vnd.dwolla.v1.hal+json',
          Authorization: 'Bearer ' + dwollaAT,
        },
      }
    )
    return response.headers.location
  } catch (err) {
    throw err
  }
}

export const createSender = async (userId, dwollaAT) => {
  try {
    const payload = {
      _id: userId,
    }
    const fields = {
      firstName: 1,
      lastName: 1,
      email: 1,
    }
    const sender = await getUser(payload, fields)
    const { firstName, lastName, email } = sender
    const response = await axios.post(
      'https://api-sandbox.dwolla.com/customers',
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
      {
        headers: {
          'Content-Type': 'application/vnd.dwolla.v1.hal+json',
          Accept: 'application/vnd.dwolla.v1.hal+json',
          Authorization: 'Bearer ' + dwollaAT,
        },
      }
    )
    const res = {
      url: response.headers.location,
      name: firstName + ' ' + lastName,
    }
    return res
  } catch (err) {
    throw err
  }
}

export const createSenderFundingSource = async (
  customerUrl,
  customerName,
  processorToken,
  dwollaAT
) => {
  try {
    const response = await axios.post(
      `${customerUrl}/funding-sources`,
      {
        plaidToken: processorToken,
        name: customerName,
      },
      {
        headers: {
          'Content-Type': 'application/vnd.dwolla.v1.hal+json',
          Accept: 'application/vnd.dwolla.v1.hal+json',
          Authorization: 'Bearer ' + dwollaAT,
        },
      }
    )
    return response.headers.location
  } catch (err) {
    throw err
  }
}

export const initiateTransfer = async (
  sourceUrl,
  destinationUrl,
  amount,
  dwollaAT
) => {
  try {
    const response = await axios.post(
      'https://api-sandbox.dwolla.com/transfers',
      {
        _links: {
          source: {
            href: sourceUrl,
          },
          destination: {
            href: destinationUrl,
          },
        },
        amount: {
          currency: 'USD',
          value: amount,
        },
      },
      {
        headers: {
          'Content-Type': 'application/vnd.dwolla.v1.hal+json',
          Accept: 'application/vnd.dwolla.v1.hal+json',
          Authorization: 'Bearer ' + dwollaAT,
        },
      }
    )
    return response.headers.location
  } catch (err) {
    throw err
  }
}
