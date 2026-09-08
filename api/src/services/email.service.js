import sgMail from '@sendgrid/mail';
import config from 'config';

import {
  welcomeEmailTemplate,
  forgotPasswordTemplate,
  otpVerificationTemplate,
  sendCheckToPayee,
  emailUlTemplate,
  paymentRequesttemplate,
  paymentReceivedTemplate,
  paymentDoneTemplate,
  subscriptionPaymentRequesttemplate,
  subscriptionPaymentReceivedTemplate,
  shippingStatusUpdateTemplate,
  adminSupportEmailTemplate,
  refundReceiptTemplate,
} from '../utils/email-templates.util.js';
import { sendEmail } from '../utils/send-grid.util.js';

const {
  send_grid: { api_key: API_KEY },
} = config;

if (!API_KEY) {
  throw new Error('FATAL: Config File Missing');
}

sgMail.setApiKey(API_KEY);

export const sendWelcomeMail = async (email, template) => {
  try {
    const payload = {
      to: `${email}`,
      from: 'no-reply@synccos.com',
      subject: 'Welcome to Synccos Check Writer',
      html: template.toString(),
      // html: welcomeEmailTemplate(message)
    };
    //await sendEmail(payload);
    return;
  } catch (err) {
    throw err;
  }
};

export const sendForgotPasswordMail = async (email, url) => {
  try {
    const payload = {
      to: `${email}`,
      from: 'no-reply@synccos.com',
      subject: 'Synccos Check Writer Password Reset Confirmation',
      html: forgotPasswordTemplate(url),
    };
    await sendEmail(payload);
    return;
  } catch (err) {
    throw err;
  }
};

export const sendOtpVerificationMail = async (email, otp) => {
  try {
    const payload = {
      to: `${email}`,
      from: 'no-reply@synccos.com',
      subject:
        'One Time Password (OTP) to verify Email account for Synccos Check Writer',
      html: otpVerificationTemplate(otp),
    };
    await sendEmail(payload);
    return;
  } catch (err) {
    throw err;
  }
};

export const sendCheckEmail = async (
  emails,
  urls,
  senderName,
  organization,
  address,
  subject,
  content,
  recipientName,
  checkIds,
  ccEmails
) => {
  try {
    content = sendCheckToPayee(
      urls,
      senderName,
      organization,
      address,
      content,
      recipientName,
      checkIds
    );
    const payload = {
      to: emails,
      from: 'no-reply@synccos.com',
      cc: ccEmails,
      subject: `${subject}`,
      html: content,
    };

    await sendEmail(payload);
    return;
  } catch (err) {
    throw err;
  }
};

export const sendEmailToUl = async (userDetails, mode) => {
  try {
    const payload = {
      to: 'yoel@synccos.com',
      from: 'no-reply@synccos.com',
      subject: 'New User Signup',
      html: emailUlTemplate(userDetails, mode),
    };

    await sendEmail(payload);
    return;
  } catch (err) {
    throw err;
  }
};

export const sendPaymentRequestEmail = async (
  userEmail,
  senderOrganisation,
  senderName,
  senderAddress,
  recipientEmail,
  recipientName,
  amount,
  purpose,
  invoiceNumber,
  paymentUrl
) => {
  try {
    const payload = {
      to: recipientEmail,
      from: 'no-reply@synccos.com',
      subject: 'Payment Request',
      html: paymentRequesttemplate(
        recipientName,
        amount,
        purpose,
        senderName,
        senderOrganisation,
        senderAddress,
        invoiceNumber,
        paymentUrl
      ),
    };

    //await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const paymentReceivedEmail = async (
  userName,
  userEmail,
  recipientName,
  recipientEmail,
  amount,
  transactionId,
  invoiceNumber,
  synccosDetails
) => {
  try {
    const payload = {
      to: userEmail,
      from: 'no-reply@synccos.com',
      subject: 'Payment Received',
      html: paymentReceivedTemplate(
        userName,
        recipientName,
        recipientEmail,
        amount,
        transactionId,
        invoiceNumber,
        synccosDetails
      ),
    };

    //await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const paymentDoneEmail = async (
  recipientEmail,
  recipientName,
  amount,
  transactionId,
  invoiceNumber,
  synccosDetails
) => {
  try {
    const payload = {
      to: recipientEmail,
      from: 'no-reply@synccos.com',
      subject: 'Payment Done',
      html: paymentDoneTemplate(
        recipientName,
        amount,
        transactionId,
        invoiceNumber,
        synccosDetails
      ),
    };

    //await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const sendSubscriptionPaymentRequestEmail = async (
  userEmail,
  recipientName,
  amount,
  paymentUrl,
  senderName = `Synccos Inc\n69 Brookside Ave Suite 224\nChester, NY 10918`
) => {
  try {
    const payload = {
      to: userEmail,
      from: 'no-reply@synccos.com',
      subject: 'Subscription Payment Request',
      html: subscriptionPaymentRequesttemplate(
        recipientName,
        amount,
        paymentUrl,
        senderName
      ),
    };

    //await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const subscriptionPaymentReceivedEmail = async (
  userEmail,
  recipientName,
  amount,
  senderName = `Synccos Inc\n69 Brookside Ave Suite 224\nChester, NY 10918`
) => {
  try {
    const payload = {
      to: userEmail,
      from: 'no-reply@synccos.com',
      subject: 'Subscription payment Received',
      html: subscriptionPaymentReceivedTemplate(
        recipientName,
        amount,
        senderName
      ),
    };

    //await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const sendChecksMailing = async (content, shippingType, attachments) => {
  try {
    const payload = {
      // to: 'email@testreview.xyz',
      to: 'therutvikpanchal@gmail.com',
      from: 'no-reply@synccos.com',
      subject: `Check Details - ${shippingType}`,
      html: content,
      attachments,
    };

    await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const sendAdminSupportEmail = async (recipientEmail, subject, body) => {
  try {
    const payload = {
      to: recipientEmail,
      from: 'support@synccos.com',
      subject: subject,
      html: adminSupportEmailTemplate(subject, body),
    };
    await sendEmail(payload);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const sendRefundReceiptEmail = async ({
  toEmail,
  recipientName,
  refundAmount,
  originalDescription,
  originalDate,
  reason,
}) => {
  try {
    if (!toEmail) return;
    const payload = {
      to: toEmail,
      from: 'no-reply@synccos.com',
      subject: 'Refund Receipt - Synccos',
      html: refundReceiptTemplate({
        recipientName,
        refundAmount,
        originalDescription,
        originalDate,
        reason,
      }),
    };
    await sendEmail(payload);
    return { success: true };
  } catch (err) {
    console.error('Failed to send refund receipt email:', err);
  }
};

export const sendShippingStatusUpdateEmail = async ({
  toEmail,
  recipientName,
  provider,
  status,
  trackingNumber,
  serviceName,
  checkNumber,
}) => {
  try {
    if (!toEmail) return;
    const payload = {
      to: toEmail,
      from: 'no-reply@synccos.com',
      subject: `Check Mailing Update: ${status}`,
      html: shippingStatusUpdateTemplate({
        recipientName,
        provider,
        status,
        trackingNumber,
        serviceName,
        checkNumber,
      }),
    };
    await sendEmail(payload);
    return { success: true };
  } catch (err) {
    console.error('Failed to send shipping status email:', err);
  }
};
