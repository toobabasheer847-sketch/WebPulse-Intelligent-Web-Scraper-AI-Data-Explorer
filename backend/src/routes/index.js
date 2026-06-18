import { Router } from 'express';
import authRoutes from './auth/authRoutes.js';
import projectRoutes from './project/projectRoutes.js';
import dashboardRoutes from './dashboard/dashboardRoutes.js';
import notificationRoutes from './notification/notificationRoutes.js';
import billingRoutes from './billing/billingRoutes.js';
import apiRoutes from './apiRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'webpulse-api', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/billing', billingRoutes);
router.use('/projects', projectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', apiRoutes);

export default router;
