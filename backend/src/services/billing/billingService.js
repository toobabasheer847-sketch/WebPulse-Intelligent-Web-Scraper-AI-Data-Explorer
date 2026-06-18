import Stripe from 'stripe';
import config from '../../config/index.js';
import * as userRepo from '../../repositories/user/userRepository.js';
import { PLANS } from '../../constants/subscription.js';
import { badRequest, notFound } from '../../utils/errors.js';

let stripeClient = null;

function getStripe() {
  if (!config.stripe.secretKey) {
    throw badRequest('Stripe is not configured. Set STRIPE_SECRET_KEY in environment.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripe.secretKey);
  }
  return stripeClient;
}

function mapStripeStatus(stripeStatus) {
  const allowed = new Set(['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused']);
  return allowed.has(stripeStatus) ? stripeStatus : 'free';
}

function subscriptionPlanFromStatus(stripeStatus) {
  if (['active', 'trialing', 'past_due'].includes(stripeStatus)) {
    return PLANS.PRO;
  }
  return PLANS.FREE;
}

async function ensureStripeCustomer(user) {
  const stripe = getStripe();

  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });

  await userRepo.updateSubscription(user.id, {
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export async function createCheckoutSession(userId) {
  if (!config.stripe.proPriceId) {
    throw badRequest('Stripe Pro price is not configured. Set STRIPE_PRO_PRICE_ID in environment.');
  }

  const user = await userRepo.findById(userId);
  if (!user) throw notFound('User not found');

  const stripe = getStripe();
  const customerId = await ensureStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: config.stripe.proPriceId, quantity: 1 }],
    success_url: `${config.frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontendUrl}/billing/cancel`,
    subscription_data: {
      metadata: { userId: user.id },
    },
    metadata: { userId: user.id },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw badRequest('Failed to create Stripe Checkout session');
  }

  return { url: session.url, sessionId: session.id };
}

export async function createPortalSession(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw notFound('User not found');

  if (!user.stripe_customer_id) {
    throw badRequest('No billing account found. Subscribe to Pro first.');
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${config.frontendUrl}/settings`,
  });

  return { url: session.url };
}

export async function syncSubscriptionFromStripe(subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  let user = await userRepo.findByStripeCustomerId(customerId);
  if (!user && subscription.metadata?.userId) {
    user = await userRepo.findById(subscription.metadata.userId);
  }

  if (!user) {
    console.warn('[Billing] No user found for subscription', subscription.id);
    return null;
  }

  const status = mapStripeStatus(subscription.status);
  const plan = subscriptionPlanFromStatus(subscription.status);

  return userRepo.updateSubscription(user.id, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: status,
    subscriptionPlan: plan,
    subscriptionTrialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
    subscriptionCurrentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
  });
}

export async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  if (!userId) {
    console.warn('[Billing] checkout.session.completed missing userId');
    return null;
  }

  await userRepo.updateSubscription(userId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: 'active',
    subscriptionPlan: PLANS.PRO,
  });

  if (subscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return syncSubscriptionFromStripe(subscription);
  }

  return userRepo.findById(userId);
}

export async function handleSubscriptionDeleted(subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  const user = await userRepo.findByStripeCustomerId(customerId);
  if (!user) {
    console.warn('[Billing] subscription.deleted: user not found for customer', customerId);
    return null;
  }

  return userRepo.updateSubscription(user.id, {
    subscriptionStatus: 'canceled',
    subscriptionPlan: PLANS.FREE,
    stripeSubscriptionId: null,
    subscriptionTrialEnd: null,
    subscriptionCurrentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
  });
}

export async function handlePaymentFailed(invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;

  const user = await userRepo.findByStripeCustomerId(customerId);
  if (!user) return null;

  return userRepo.updateSubscription(user.id, {
    subscriptionStatus: 'past_due',
  });
}

export async function getSubscriptionSummary(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw notFound('User not found');

  return {
    plan: user.subscription_plan,
    status: user.subscription_status,
    trialEnd: user.subscription_trial_end,
    currentPeriodEnd: user.subscription_current_period_end,
    hasProAccess: user.subscription_plan === PLANS.PRO &&
      ['active', 'trialing'].includes(user.subscription_status),
  };
}

export function constructWebhookEvent(rawBody, signature) {
  if (!config.stripe.webhookSecret) {
    throw badRequest('Stripe webhook secret is not configured.');
  }

  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
}
