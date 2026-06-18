import pool from '../../db/pool.js';

const PUBLIC_USER_FIELDS = `
  id, name, email, role, created_at,
  stripe_customer_id, stripe_subscription_id,
  subscription_status, subscription_plan,
  subscription_trial_end, subscription_current_period_end,
  is_verified, is_two_factor_enabled
`;

export async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findById(id) {
  const result = await pool.query(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findByIdWithSecret(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findByStripeCustomerId(stripeCustomerId) {
  const result = await pool.query(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE stripe_customer_id = $1`,
    [stripeCustomerId]
  );
  return result.rows[0] || null;
}

export async function create({ name, email, passwordHash, role = 'user', verificationOtp, verificationOtpExpiresAt }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, verification_otp, verification_otp_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PUBLIC_USER_FIELDS}`,
    [name, email, passwordHash, role, verificationOtp, verificationOtpExpiresAt]
  );
  return result.rows[0];
}

export async function updateVerification(userId, { isVerified, verificationOtp, verificationOtpExpiresAt }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (isVerified !== undefined) {
    fields.push(`is_verified = $${idx++}`);
    values.push(isVerified);
  }
  if (verificationOtp !== undefined) {
    fields.push(`verification_otp = $${idx++}`);
    values.push(verificationOtp);
  }
  if (verificationOtpExpiresAt !== undefined) {
    fields.push(`verification_otp_expires_at = $${idx++}`);
    values.push(verificationOtpExpiresAt);
  }

  if (fields.length === 0) return findById(userId);

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${PUBLIC_USER_FIELDS}`,
    values
  );
  return result.rows[0] || null;
}

export async function updateSubscription(userId, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const map = {
    stripeCustomerId: 'stripe_customer_id',
    stripeSubscriptionId: 'stripe_subscription_id',
    subscriptionStatus: 'subscription_status',
    subscriptionPlan: 'subscription_plan',
    subscriptionTrialEnd: 'subscription_trial_end',
    subscriptionCurrentPeriodEnd: 'subscription_current_period_end',
  };

  for (const [key, column] of Object.entries(map)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return findById(userId);

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${PUBLIC_USER_FIELDS}`,
    values
  );
  return result.rows[0] || null;
}

export async function countProjects(userId) {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM projects WHERE user_id = $1',
    [userId]
  );
  return result.rows[0].count;
}

export async function updateName(userId, name) {
  const result = await pool.query(
    `UPDATE users SET name = $1 WHERE id = $2 RETURNING ${PUBLIC_USER_FIELDS}`,
    [name, userId]
  );
  return result.rows[0] || null;
}

export async function updateTwoFactor(userId, { twoFactorSecret, isTwoFactorEnabled }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (twoFactorSecret !== undefined) {
    fields.push(`two_factor_secret = $${idx++}`);
    values.push(twoFactorSecret);
  }
  if (isTwoFactorEnabled !== undefined) {
    fields.push(`is_two_factor_enabled = $${idx++}`);
    values.push(isTwoFactorEnabled);
  }

  if (fields.length === 0) return findById(userId);

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${PUBLIC_USER_FIELDS}`,
    values
  );
  return result.rows[0] || null;
}
