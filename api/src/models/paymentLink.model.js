import { AttachmentService } from '../services/attachments.service.js';
import { sendPaymentRequestEmail } from '../services/email.service.js';
import { paymentLinkStripeClient } from '../services/paymentLinkStripe.service.js';
import { EntityType } from './attachment.model.js';
import { addressesCollection, PaymentLinkCollection } from './dbCollections.js';

export const createPaymentLink = async (payload) => {
  try {
    const user = await PaymentLinkCollection.create(payload);
    return user;
  } catch (err) {
    throw err;
  }
};

export const GetUserPaymentDetails = async (payload) => {
  try {
    const res = await PaymentLinkCollection.find(payload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const updatePaymentLink = async (searchFilter, updateFilter) => {
  try {
    const res = await PaymentLinkCollection.findOneAndUpdate(
      searchFilter,
      updateFilter
    );
    if (!res) return;
    return res;
  } catch (err) {
    throw err;
  }
};

export const getPaginatedPaymentLinksByUserId = async ({
  page = 1,
  limit = 10,
  recipientEmail,
  status,
  startDate,
  endDate,
  ownerId,
  ownerType,
  search
}) => {
  try {
    const filter = { ownerId, ownerType };

    if (recipientEmail || search) {
      const andConditions = [];

      if (recipientEmail) {
        const emails = Array.isArray(recipientEmail)
          ? recipientEmail
          : [recipientEmail];
        andConditions.push({ recipientEmail: { $in: emails } });
      }

      if (search && typeof search === 'string') {
        andConditions.push({
          recipientEmail: { $regex: search, $options: 'i' },
        });
      }

      if (andConditions.length === 1) {
        Object.assign(filter, andConditions[0]);
      } else if (andConditions.length > 1) {
        filter.$and = andConditions;
      }
    }

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      filter.status = { $in: statuses };
    }

    if (startDate || endDate) {
      const createdAtUnix = {};
      if (startDate) {
        const start = new Date(startDate).getTime(); 
        if (!isNaN(start)) createdAtUnix.$gte = Math.floor(start / 1000);
      }
      if (endDate) {
        const end = new Date(endDate).getTime();
        if (!isNaN(end)) createdAtUnix.$lte = Math.floor(end / 1000);
      }

      if (Object.keys(createdAtUnix).length) {
        filter.createdAtUnix = createdAtUnix;
      }
    }

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      PaymentLinkCollection.find(filter)
        .sort({ createdAtUnix: -1 })
        .skip(skip)
        .limit(limit),
      PaymentLinkCollection.countDocuments(filter),
    ]);

    const finalResult = await Promise.all(
      results.map(async (item) => {
        const attachments = await AttachmentService.getAttachmentsByEntity({
          entityId: item._id,
          entityType: EntityType.PAYMENT_LINK,
          ownerId: item.ownerId,
          ownerType: item.ownerType,
        });

        return {
          ...item.toObject(),
          attachments,
        };
      })
    );

    return {
      results: finalResult,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw err;
  }
};

export const resendPaymentLink = async (paymentLink) => {
  try{
    // Extract necessary fields
    const {
      email: userEmail,
      recipientEmail,
      recipientName,
      amount,
      purpose,
      invoiceNumber,
      ownerType,
      ownerId,
      paymentLink: link,
    } = paymentLink;

    // Get sender details
    let userDocument;
    let senderOrganisation = '';
    let senderAddress = '';
    let senderName = '';

    if (ownerType === 'organization') {
      userDocument = await organizationCollection.findById(ownerId);
      senderOrganisation = userDocument?.organizationName || '';

      const orgAddress = await addressesCollection.findOne({
        ownerId,
        ownerType,
      });
      senderAddress =
        orgAddress?.addressLine1 +
        ' ' +
        orgAddress?.addressLine2 +
        '\n' +
        orgAddress?.city +
        ' ' +
        orgAddress?.state +
        '\n' +
        orgAddress?.country +
        ' ' +
        orgAddress?.zipCode;
    } else {
      const userAddress = await addressesCollection.findOne({
        ownerId,
        ownerType,
      });
      senderName = userAddress?.name || '';
      senderAddress =
        userAddress?.addressLine1 +
        ' ' +
        userAddress?.addressLine2 +
        '\n' +
        userAddress?.city +
        ' ' +
        userAddress?.state +
        '\n' +
        userAddress?.country +
        ' ' +
        userAddress?.zipCode;
    }

    // Send the email
    await sendPaymentRequestEmail(
      userEmail,
      senderOrganisation,
      senderName,
      senderAddress,
      recipientEmail,
      recipientName,
      amount,
      purpose,
      invoiceNumber,
      link
    );
  }catch(err){
    throw err;
  }
}

export const downloadPaymentReceit = async (paymentLink) => {
      const sessionId = paymentLink.sessionId;
      const session = await paymentLinkStripeClient.checkout.sessions.retrieve(sessionId);
  
      if (!session.payment_intent) {
        return null;
      }
  
      const paymentIntent = await paymentLinkStripeClient.paymentIntents.retrieve(session.payment_intent);
  
      if (!paymentIntent.latest_charge) {
        return null;
      }
  
      // Step 3: Retrieve the Charge
      const charge = await paymentLinkStripeClient.charges.retrieve(paymentIntent.latest_charge);

      return charge.receipt_url;
}