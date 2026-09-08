import Stripe from 'stripe';
import config from 'config';
import { PaymentLinkCollection } from '../models/dbCollections';

const {
  stripe_payment_links: {
    stripe_secret_key,
    stripe_subscription_webhook_endpoint_secret,
  },
} = config;

export const paymentLinkStripeClient = new Stripe(stripe_secret_key, {
  apiVersion: '2022-11-15',
});

interface UpdateStatusPayload {
  eventId: string;
  status: string;
  expiredAt?: Date;
}

export class PaymentLinkStripeService {
  static async #updatePaymentLinkStatus({
    eventId,
    status,
    expiredAt,
  }: UpdateStatusPayload) {
    const session = await paymentLinkStripeClient.checkout.sessions.retrieve(
      eventId
    );

    const payload: Record<string, any> = { status };
    if (expiredAt) payload.expiredAt = expiredAt;

    const isPaymentLink = session.metadata.isPaymentLink;

    if (isPaymentLink) {
      const stripeAccountId = session?.metadata?.stripeAccountId;

      await PaymentLinkCollection.findOneAndUpdate(
        { stripeAccountId, sessionId: session?.id },
        payload
      );
    } else {
    }
  }

  static async #isPaymentLinkAlreadyCanceled({ eventId }) {
    const session = await paymentLinkStripeClient.checkout.sessions.retrieve(
      eventId
    );
    const isPaymentLink = session.metadata.isPaymentLink;
    if (isPaymentLink) {
      const stripeAccountId = session?.metadata?.stripeAccountId;

      const existingLink = await PaymentLinkCollection.findOne({
        sessionId: session?.id,
        stripeAccountId,
      });
      return existingLink.status === 'canceled';
    }

    return false;
  }

  static async handleWebhookEvent({ body, sig }) {
    let event;
    try {
      event = paymentLinkStripeClient.webhooks.constructEvent(
        body,
        sig,
        stripe_subscription_webhook_endpoint_secret
      );
    } catch (err) {
      console.error(err.message);
      throw new Error(`error: ${err?.message || 'Server Error'}`);
    }

    const data = event.data.object;

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          this.#updatePaymentLinkStatus({ eventId: data?.id, status: 'paid' });
          break;
        }
        case 'checkout.session.expired': {
          const isAlreadyCanceled = await this.#isPaymentLinkAlreadyCanceled({
            eventId: data?.id,
          });

          if (!isAlreadyCanceled) {
            await this.#updatePaymentLinkStatus({
              eventId: data?.id,
              status: 'expired',
              expiredAt: new Date(),
            });
            break;
          }
        }

        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }

      return { success: true, event: event.type };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new Error(`error: ${error?.message || 'Server Error'}`);
    }
  }
}
