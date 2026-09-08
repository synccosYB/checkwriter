import twilio from 'twilio';
import config from 'config';

const {
  twilio: { auth_token, phone_number, account_sid },
} = config;

export class Twilio {
  constructor() {
    this.client = twilio(account_sid, auth_token);
  }

  async triggerVerificationCall({ to, otp }) {
    try {
      await this.client.calls.create({
        from: phone_number,
        to,
        twiml: this.#numberToSpokenTwiML(otp),
      });
    } catch (error) {
      console.error('Error details:', error.message);
      throw error;
    }
  }

  #numberToSpokenTwiML(number) {
    const digits = number.toString().split('');

    const speech = digits.map((digit) => `<Say>${digit}</Say>`).join('');

    return `
        <Response>
            <Say voice="man">This is a verification call from Syncohs,</Say>
            <Pause length="1"/>
            <Say voice="man">Your verification code is:</Say>
            <Pause length="1"/>
            ${speech.replace(/<Say>/g, '<Say voice="man">')}
            <Pause length="2"/>
            <Say voice="man">I will repeat that:</Say>
            <Pause length="1"/>
            ${speech.replace(/<Say>/g, '<Say voice="man">')}
            <Say voice="man">Thank you for using Syncohs, Goodbye.</Say>
        </Response>
    `;
  }
}
