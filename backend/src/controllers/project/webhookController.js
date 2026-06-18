import { asyncHandler } from '../../utils/asyncHandler.js';
import * as webhookRepo from '../../repositories/webhookRepository.js';
import { sendTestNotification } from '../../services/project/webhookService.js';
import * as projectService from '../../services/project/projectService.js';

const ALLOWED_PLATFORMS = ['slack', 'discord'];

// GET /api/projects/:id/webhooks
export const listWebhooks = asyncHandler(async (req, res) => {
  // Verify the project belongs to the authenticated user
  await projectService.getProject(req.params.id, req.user.id);
  const hooks = await webhookRepo.findAllByProject(req.params.id);
  res.json({ success: true, webhooks: hooks });
});

// POST /api/projects/:id/webhooks
export const createWebhook = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);

  const { platform, url } = req.body;

  if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: 'platform must be "slack" or "discord"' });
  }

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'A valid webhook URL is required' });
  }

  const hook = await webhookRepo.create({ projectId: req.params.id, platform, url });
  res.status(201).json({ success: true, webhook: hook });
});

// DELETE /api/projects/:id/webhooks/:webhookId
export const deleteWebhook = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const deleted = await webhookRepo.remove(req.params.webhookId, req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  res.json({ success: true, message: 'Webhook deleted' });
});

// POST /api/projects/:id/webhooks/:webhookId/test
export const testWebhook = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);

  const hooks = await webhookRepo.findAllByProject(req.params.id);
  const hook = hooks.find((h) => h.id === req.params.webhookId);

  if (!hook) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  const result = await sendTestNotification(hook.platform, hook.url);

  if (!result.ok) {
    return res.status(502).json({
      error: `Test delivery failed (HTTP ${result.status}). Check your webhook URL and try again.`,
    });
  }

  res.json({ success: true, message: 'Test webhook sent successfully!' });
});
