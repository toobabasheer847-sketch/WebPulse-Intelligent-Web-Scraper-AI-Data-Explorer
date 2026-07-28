import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import routes from './routes/index.js';
import { handleStripeWebhook } from './controllers/billing/billingController.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();


// Security middleware
app.use(helmet());


// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);


// Logging
app.use(
  morgan(config.env === 'development' ? 'dev' : 'combined')
);


// Health check endpoint (for Render / monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WebPulse API is running',
    environment: config.env,
  });
});


// Stripe webhook must receive raw body
// IMPORTANT: keep this before express.json()
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);


// JSON parser
app.use(
  express.json({
    limit: '2mb',
  })
);


// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests',
      code: 'RATE_LIMIT',
    },
  },
});


app.use('/api', limiter);


// API routes
app.use('/api', routes);


// Global error handler
app.use(errorHandler);


export default app;