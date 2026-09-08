import express from 'express'
import {
  getLinkToken,
  createTransferAuthorization,
  createTransfer,
  cancelTransfer,
  getTransfer,
  getTransferList,
  getTransferEventList,
  getSweepInfoBySweepId,
  syncTransferEvent,
  createProcessorToken,
  createRecipient,
  createDwollaAccessToken,
  getCustomerIdByEmail,
  createReceiverFundingSource,
  createSender,
  createSenderFundingSource,
  initiateTransfer,
  getPlaidAccessToken,
} from '../services/plaid.services.js'
import {
  createPlaidAccountDetails,
  getPlaidAccountDetails,
} from '../models/plaid.model.js'
import subscriptionMiddleware from "../middlewares/subscription.middleware.js";

const router = express.Router()

router.get('/getLinkToken', async (req, res, next) => {
  try {
    const userId = req.userId
    const organizationId = req.organizationId
    const linkToken = await getLinkToken({
      userId: organizationId ? organizationId : userId,
    })
    return res.status(200).json({
      linkToken: linkToken,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/getAccessToken', async (req, res, next) => {
  try {
    const { publicToken, metadata } = req.body
    const accessTokenDetails = await getAccessToken(publicToken)
    return res.status(200).json(accessTokenDetails.access_token)
  } catch (err) {
    next(err)
  }
})

router.post('/createTransferAuthorization', subscriptionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const response = await createTransferAuthorization(userId)
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/createTransfer', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await createTransfer()
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/cancelTransfer', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await cancelTransfer()
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/getTransfer', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await getTransfer()
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/getTransferList', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await getTransferList()
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/getTransferEventList', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = getTransferEventList()
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/getSweepInfo/:sweepId', subscriptionMiddleware, async (req, res, next) => {
  try {
    const sweepId = req.params.sweepId
    const response = await getSweepInfoBySweepId(sweepId)
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/syncTransferEvent', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await syncTransferEvent()
    return res.status(200).json(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/plaid-webhooks', async (req, res, next) => {
  try {
    const webhookPayload = req.body
    if (
      webhookPayload.webhook_type === 'TRANSFER' &&
      webhookPayload.webhook_code === 'TRANSFER_EVENTS_UPDATE'
    ) {
      const newSyncTransferEvent = await syncTransferEvent()
      //save newSyncTransferEvent to db
      return res.status(200).send('Webhook received and processed')
    } else {
      return res.status(400).send('Invalid webhook code')
    }
  } catch (err) {
    next(err)
  }
})

router.post('/generateLinkToken', async (req, res, next) => {
  try {
    const userId = req.userId
    const organizationId = req.organizationId
    const linkToken = await getLinkToken({
      userId: organizationId ? organizationId : userId,
    })
    res.status(200).send(linkToken)
  } catch (err) {
    next(err)
  }
})

router.post('/plaid-link', async (req, res, next) => {
  try {
    const userId = req.userId
    const organizationId = req.organizationId

    const { publicToken, metadata } = req.body

    //get sender account id from metadata
    const accountId = metadata.account_id

    const plaidAccessTokenDetails = await getPlaidAccessToken(publicToken)
    const plaidAccessToken = plaidAccessTokenDetails.access_token

    const plaidProcessorTokenDetails = await createProcessorToken(
      plaidAccessToken,
      accountId
    )
    const plaidProcessorToken = plaidProcessorTokenDetails.processor_token

    const dwollaAccessTokenDetails = await createDwollaAccessToken()
    const dwollaAccessToken = dwollaAccessTokenDetails.access_token

    //create sender

    const senderCustomer = await createSender(userId, dwollaAccessToken)
    const senderCustomerUrl = senderCustomer.url
    const senderCustomerName = senderCustomer.name
    const senderFundingSourceUrl = await createSenderFundingSource(
      senderCustomerUrl,
      senderCustomerName,
      plaidProcessorToken,
      dwollaAccessToken
    )

    const createdUser = await createPlaidAccountDetails({
      userId: organizationId ? organizationId : userId,
      accountId: accountId,
      plaidAccessToken: plaidAccessToken,
      fundingSourceUrl: senderFundingSourceUrl,
      dwollaAccessToken: dwollaAccessToken,
    })
    return res.status(200).json(createdUser)
  } catch (err) {
    next(err)
  }
})

router.post('/initiateTransfer', subscriptionMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId
    const organizationId = req.organizationId
    const senderInfo = await getPlaidAccountDetails(
      {
        userId: organizationId ? organizationId : userId,
      },
      {
        fundingSourceUrl: 1,
      }
    )
    const senderFundingSourceUrl = senderInfo.fundingSourceUrl
    const dwollaAccessTokenDetails = await createDwollaAccessToken()
    const dwollaAccessToken = dwollaAccessTokenDetails.access_token
    const { recipientInfo, amount } = req.body
    const {
      recipientFirstName,
      recipientLastName,
      recipientEmail,
      recipientAddress,
      recipientDOB,
      recipientSSN,
      recipientType,
      recipientRoutingNumber,
      recipientAccountNumber,
      recipientAccountType,
    } = recipientInfo
    const {
      recipientAddress1,
      recipientCity,
      recipientState,
      recipientPostalCode,
    } = recipientAddress

    const recipientCustomerUrl = await createRecipient(
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
      dwollaAccessToken
    )

    const recipientFundingSourceUrl = await createReceiverFundingSource(
      recipientCustomerUrl,
      recipientFirstName,
      recipientLastName,
      recipientRoutingNumber,
      recipientAccountNumber,
      recipientAccountType,
      dwollaAccessToken
    )

    // Create Transfer
    const transferUrl = await initiateTransfer(
      senderFundingSourceUrl,
      recipientFundingSourceUrl,
      amount,
      dwollaAccessToken
    )

    res.status(200).send(transferUrl)

  } catch (err) {
    console.error(err.response.data._embedded)
    next(err)
  }
})

router.post('/createProcessorToken', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await createProcessorToken()
    return res.status(200).send(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/createDwollaAccessToken', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await createDwollaAccessToken()
    return res.status(200).send(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/createRecipient', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await createRecipient()
    return res.status(200).send(response)
  } catch (err) {
    next(err)
  }
})

router.get('/getCustomerIdByEmail', subscriptionMiddleware, async (req, res, next) => {
  try {
    const customerId = await getCustomerIdByEmail('john@nomail.net')
    return res.status(200).send(customerId)
  } catch (err) {
    next(err)
  }
})

router.post('/createReceiverFundingSource', subscriptionMiddleware, async (req, res, next) => {
  try {
    const customerId = await getCustomerIdByEmail('john@nomail.net')
    const response = await createReceiverFundingSource(customerId)
    return res.status(200).send(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

router.post('/createSender', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await createSender()
    return res.status(200).send(response)
  } catch (err) {
    next(err)
  }
})

router.post('/createSenderFundingSource', subscriptionMiddleware, async (req, res, next) => {
  try {
    const response = await createSenderFundingSource(customerId)
    return res.status(200).send(response)
  } catch (err) {
    console.error(err.response.data)
    next(err)
  }
})

export default router
