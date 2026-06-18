import { body, param } from 'express-validator';

export const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const verifyOtpValidator = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
];

export const resendOtpValidator = [
  body('email').isEmail().normalizeEmail(),
];

export const projectValidator = [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('websiteUrl').isURL({ require_protocol: true }).withMessage('Valid URL required'),
  body('scraperType').optional().isIn(['auto', 'cheerio', 'puppeteer']),
  body('schedule').optional().isIn(['none', 'hourly', 'daily', 'weekly']),
];

export const projectUpdateValidator = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('websiteUrl').optional().isURL({ require_protocol: true }),
  body('scraperType').optional().isIn(['auto', 'cheerio', 'puppeteer']),
  body('schedule').optional().isIn(['none', 'hourly', 'daily', 'weekly']),
];

export const chatValidator = [
  body('message').trim().isLength({ min: 1, max: 4000 }),
];

export const uuidParam = (name = 'id') => [
  param(name).isUUID().withMessage('Invalid ID format'),
];
