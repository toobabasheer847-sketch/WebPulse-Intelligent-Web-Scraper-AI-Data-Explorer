import { Router } from 'express';
import * as dashboardController from '../../controllers/dashboard/dashboardController.js';
import { authenticate } from '../../middleware/auth/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/stats', dashboardController.getStats);

export default router;
