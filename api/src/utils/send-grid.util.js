import sgMail from '@sendgrid/mail';
import config from 'config';

const {
  send_grid: { api_key: API_KEY },
} = config;

if (!API_KEY) {
  throw new Error('FATAL: Config File Missing');
}

sgMail.setApiKey(API_KEY);

export const sendEmail = async (payload) => {
  try {
    const mandatoryFields = ['to', 'from', 'subject', 'html'];
    const missingFields = mandatoryFields.filter((field) => !payload?.[field]);

    if (missingFields.length) {
      throw new Error(
        `Fields - ${missingFields.join(
          ', '
        )} missing in payload to send email via SendGrid.`
      );
    }

    if (Array.isArray(payload.attachments)) {
      payload.attachments = payload.attachments.map((attachment) => {
        // Debug the incoming attachment

        if (Buffer.isBuffer(attachment.content)) {
          // Properly handle Buffer
          return {
            ...attachment,
            content: attachment.content.toString('base64'),
          };
        } else if (typeof attachment.content === 'string') {
          // Already a string (possibly base64)
          return attachment;
        } else {
          console.error('Invalid attachment type:', typeof attachment.content);
          throw new Error(
            'Attachment content must be a Buffer or a base64-encoded string.'
          );
        }
      });
    }

    await sgMail.send(payload);
    return { statusCode: 200, message: 'Email sent successfully' };
  } catch (err) {
    console.error('Error sending email:', err);
    throw {
      statusCode: 500,
      userMessage: 'Failed to send email',
      developerMessage: err.message || JSON.stringify(err),
    };
  }
};
