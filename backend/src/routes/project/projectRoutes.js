import { Router } from 'express';
import * as projectController from '../../controllers/project/projectController.js';
import * as projectHistoryController from '../../controllers/project/projectHistoryController.js';
import * as dashboardController from '../../controllers/dashboard/dashboardController.js';
import * as chatController from '../../controllers/chat/chatController.js';
import * as exportController from '../../controllers/export/exportController.js';
import * as webhookController from '../../controllers/project/webhookController.js';
import { authenticate } from '../../middleware/auth/authMiddleware.js';
import { checkSubscriptionLimits, checkScrapeRecordLimits } from '../../middleware/billing/checkSubscriptionLimits.js';
import { validate } from '../../middleware/validate.js';
import {
  projectValidator,
  projectUpdateValidator,
  chatValidator,
  uuidParam,
} from '../validators.js';

const router = Router();

router.use(authenticate);

router.get('/', projectController.list);
router.post('/', checkSubscriptionLimits, projectValidator, validate, projectController.create);
router.get('/:id', uuidParam(), validate, projectController.get);
router.put('/:id', uuidParam(), projectUpdateValidator, validate, projectController.update);
router.delete('/:id', uuidParam(), validate, projectController.remove);

router.post('/:id/scrape', uuidParam(), validate, checkScrapeRecordLimits, projectController.triggerScrape);
router.get('/:id/runs', uuidParam(), validate, projectController.getRuns);
router.get('/:id/data', uuidParam(), validate, projectController.getData);
router.get('/:id/changes', uuidParam(), validate, projectController.getChanges);
router.get('/:id/analytics', uuidParam(), validate, dashboardController.getAnalytics);
router.get('/:id/history', uuidParam(), validate, projectHistoryController.getProjectHistory);
router.get('/:id/export', uuidParam(), validate, exportController.exportProject);
router.get('/:id/runs/:runId/export', uuidParam('id'), uuidParam('runId'), validate, exportController.exportRun);

router.post('/:id/chat', uuidParam(), chatValidator, validate, chatController.sendMessage);
router.get('/:id/chat', uuidParam(), validate, chatController.getHistory);
router.delete('/:id/chat', uuidParam(), validate, chatController.clearHistory);

// Webhook routes
router.get('/:id/webhooks', uuidParam(), validate, webhookController.listWebhooks);
router.post('/:id/webhooks', uuidParam(), validate, webhookController.createWebhook);
router.delete('/:id/webhooks/:webhookId', uuidParam(), uuidParam('webhookId'), validate, webhookController.deleteWebhook);
router.post('/:id/webhooks/:webhookId/test', uuidParam(), uuidParam('webhookId'), validate, webhookController.testWebhook);

export default router;
