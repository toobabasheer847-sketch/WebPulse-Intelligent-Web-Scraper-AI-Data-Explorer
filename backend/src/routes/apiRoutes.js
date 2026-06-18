import { Router } from 'express';
import {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  getScrapedData
} from '../controllers/auth/apiController.js';
import { authenticate } from '../middleware/auth/authMiddleware.js';
import { apiKeyAuth } from '../middleware/auth/apiKeyAuth.js';

const router = Router();

// Protected routes (require user login)
router.post('/keys/generate', authenticate, generateApiKey);
router.get('/keys', authenticate, listApiKeys);
router.delete('/keys/:keyId', authenticate, revokeApiKey);

// Public API route (authenticated via API key)
router.get('/v1/data', apiKeyAuth, getScrapedData);

export default router;
