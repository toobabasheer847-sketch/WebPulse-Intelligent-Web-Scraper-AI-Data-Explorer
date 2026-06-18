import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import config from '../../config/index.js';
import * as userRepo from '../../repositories/user/userRepository.js';
import { badRequest, unauthorized, forbidden } from '../../utils/errors.js';
import { sendVerificationEmail } from '../email/emailService.js';

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    stripe_customer_id: user.stripe_customer_id || null,
    subscription_status: user.subscription_status || 'free',
    subscription_plan: user.subscription_plan || 'free',
    subscription_trial_end: user.subscription_trial_end,
    subscription_current_period_end: user.subscription_current_period_end,
    is_verified: user.is_verified,
    is_two_factor_enabled: user.is_two_factor_enabled || false,
  };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateOtpExpiry() {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export async function register({ name, email, password }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw badRequest('Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpExpiry = generateOtpExpiry();

  const user = await userRepo.create({ 
    name, 
    email, 
    passwordHash,
    verificationOtp: otp,
    verificationOtpExpiresAt: otpExpiry
  });

  await sendVerificationEmail(email, otp);

  return { 
    message: "Verification code sent to your email.", 
    email: user.email, 
    requireVerification: true 
  };
}

export async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw unauthorized('Invalid email or password');

  if (!user.is_verified) {
    throw forbidden('Please verify your email first.', {
      unverified: true,
      email: user.email
    });
  }

  if (user.is_two_factor_enabled) {
    // Generate a temporary token for 2FA verification
    const tempToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: '5m' }
    );
    return {
      require2FA: true,
      tempToken,
    };
  }

  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function generate2FA(userId) {
  console.log("Generating 2FA secret for user:", userId);
  const user = await userRepo.findByIdWithSecret(userId);
  if (!user) throw unauthorized('User not found');

  const secret = speakeasy.generateSecret({
    name: `WebPulse: ${user.email}`,
    issuer: 'WebPulse'
  });

  console.log("Generated 2FA secret, saving to database...");
  // Save secret temporarily
  await userRepo.updateTwoFactor(userId, {
    twoFactorSecret: secret.base32
  });

  console.log("Generating QR code...");
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  console.log("2FA setup generated successfully!");
  return {
    qrCodeUrl,
    secret: secret.base32
  };
}

export async function enable2FA(userId, code) {
  const user = await userRepo.findByIdWithSecret(userId);
  if (!user) throw unauthorized('User not found');
  if (!user.two_factor_secret) throw badRequest('No 2FA setup in progress');

  const verified = speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (!verified) throw badRequest('Invalid verification code');

  await userRepo.updateTwoFactor(userId, {
    isTwoFactorEnabled: true
  });

  return { message: '2FA enabled successfully!' };
}

export async function disable2FA(userId, code) {
  const user = await userRepo.findByIdWithSecret(userId);
  if (!user) throw unauthorized('User not found');
  if (!user.is_two_factor_enabled) throw badRequest('2FA is not enabled');

  const verified = speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (!verified) throw badRequest('Invalid verification code');

  await userRepo.updateTwoFactor(userId, {
    twoFactorSecret: null,
    isTwoFactorEnabled: false
  });

  return { message: '2FA disabled successfully!' };
}

export async function verifyLogin2FA(tempToken, code) {
  // Verify temp token
  let decoded;
  try {
    decoded = jwt.verify(tempToken, config.jwt.secret);
  } catch (err) {
    throw badRequest('Invalid or expired temporary token');
  }

  const user = await userRepo.findByIdWithSecret(decoded.userId);
  if (!user) throw unauthorized('User not found');
  if (!user.is_two_factor_enabled) throw badRequest('2FA is not enabled');

  const verified = speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (!verified) throw badRequest('Invalid verification code');

  const token = generateToken(user);
  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function verifyOtp({ email, otp }) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw badRequest('Invalid email or verification code');

  if (!user.verification_otp || user.verification_otp !== otp) {
    throw badRequest('Invalid verification code');
  }

  if (new Date() > new Date(user.verification_otp_expires_at)) {
    throw badRequest('Verification code has expired. Please request a new one.');
  }

  const updatedUser = await userRepo.updateVerification(user.id, {
    isVerified: true,
    verificationOtp: null,
    verificationOtpExpiresAt: null
  });

  const token = generateToken(updatedUser);
  return {
    user: sanitizeUser(updatedUser),
    token,
  };
}

export async function resendOtp({ email }) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw badRequest('No account found with this email');

  if (user.is_verified) {
    throw badRequest('Email is already verified');
  }

  const otp = generateOtp();
  const otpExpiry = generateOtpExpiry();

  await userRepo.updateVerification(user.id, {
    verificationOtp: otp,
    verificationOtpExpiresAt: otpExpiry
  });

  await sendVerificationEmail(email, otp);

  return {
    message: 'New verification code sent to your email.',
    email: user.email
  };
}

export async function getProfile(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw unauthorized('User not found');
  return sanitizeUser(user);
}

export async function updateProfile(userId, { name }) {
  if (!name || name.trim() === '') {
    throw badRequest('Name is required');
  }
  const user = await userRepo.updateName(userId, name.trim());
  if (!user) throw unauthorized('User not found');
  return sanitizeUser(user);
}
