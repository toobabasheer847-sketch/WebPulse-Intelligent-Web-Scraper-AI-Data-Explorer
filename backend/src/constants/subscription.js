export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

export const FREE_TIER = {
  MAX_PROJECTS: 3,
  MAX_RECORDS_PER_MONTH: 100,
};

export const PRO_TIER = {
  MAX_RECORDS_PER_MONTH: 50000,
};

/** Stripe statuses that grant Pro-tier access */
export const PRO_ACCESS_STATUSES = new Set(['active', 'trialing']);

export function hasProAccess(user) {
  if (!user) return false;
  return user.subscription_plan === PLANS.PRO && PRO_ACCESS_STATUSES.has(user.subscription_status);
}
