import { Router } from 'express';
import * as notificationController from '../../controllers/notification/notificationController.js';
import { authenticate } from '../../middleware/auth/authMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { uuidParam } from '../validators.js';

const router = Router();

router.use(authenticate);
router.get('/', notificationController.list);
router.patch('/:id/read', uuidParam(), validate, notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
