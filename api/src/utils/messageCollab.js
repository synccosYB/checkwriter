import config from 'config';
import axios from 'axios';

const {
  message_collab: { sms_api_url, auth_token, phone_number, account_id },
} = config;

export class MessageCollabSMSClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: sms_api_url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth_token}`,
      },
    });
  }

  async sendSMSMessage({ to, message, media = [], displayInPortal = true }) {
    try {
      const authToken = `Bearer ${auth_token}`;
      const data = {
        to,
        message,
        media,
        displayInPortal,
        from: phone_number,
      };

      const response = await this.axiosInstance.post(
        `/api/v1/sms/${account_id}`,
        data,
        {
          headers: { Authorization: authToken },
        }
      );

      return response.data;
    } catch (err) {
      console.error(
        'Error details:',
        err.response?.data?.errors || err.message,
        Object.keys(err)
      );
      throw err;
    }
  }
}
