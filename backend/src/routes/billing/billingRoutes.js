import { Router } from 'express';
import * as billingController from '../../controllers/billing/billingController.js';
import { authenticate } from '../../middleware/auth/authMiddleware.js';

const router = Router();

router.post('/create-checkout-session', authenticate, billingController.createCheckoutSession);
router.post('/create-portal-session', authenticate, billingController.createPortalSession);
router.get('/subscription', authenticate, billingController.getSubscription);

export default router;
