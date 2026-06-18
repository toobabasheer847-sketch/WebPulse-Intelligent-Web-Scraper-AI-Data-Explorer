import * as billingService from '../../services/billing/billingService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { url, sessionId } = await billingService.createCheckoutSession(req.user.id);
  res.json({ url, sessionId });
});

export const createPortalSession = asyncHandler(async (req, res) => {
  const { url } = await billingService.createPortalSession(req.user.id);
  res.json({ url });
});

export async function handleStripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: { message: 'Missing Stripe signature' } });
  }

  let event;
  try {
    event = billingService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error('[Billing] Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: { message: `Webhook Error: ${err.message}` } });
  }

  console.log(`[Billing] Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await billingService.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await billingService.syncSubscriptionFromStripe(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await billingService.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await billingService.handlePaymentFailed(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[Billing] Webhook handler error (${event.type}):`, err.message);
    return res.status(500).json({ error: { message: 'Webhook handler failed' } });
  }

  res.json({ received: true });
}

export const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await billingService.getSubscriptionSummary(req.user.id);
  res.json({ subscription });
});
