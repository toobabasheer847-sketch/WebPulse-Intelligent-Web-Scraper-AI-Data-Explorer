import dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',

  // Render provides PORT automatically
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Redis
  redisUrl: process.env.REDIS_URL || '',

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },

  // Frontend connection
  corsOrigin:
    process.env.CORS_ORIGIN || 'http://localhost:5173',

  frontendUrl:
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    'http://localhost:5173',

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1' || false,
    requireTls: process.env.SMTP_REQUIRE_TLS === 'true' || process.env.SMTP_REQUIRE_TLS === '1' || false,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'noreply@webpulse.com',
  },
  email: {
    provider: (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase(),
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || '',
  },

  // Rate limit
  rateLimit: {
    windowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '900000',
      10
    ),
    max: parseInt(
      process.env.RATE_LIMIT_MAX || '100',
      10
    ),
  },
};

export default config;