import * as notificationRepo from '../../repositories/notification/notificationRepository.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { notFound } from '../../utils/errors.js';

export const list = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const notifications = await notificationRepo.findByUser(req.user.id, { unreadOnly });
  const unreadCount = await notificationRepo.countUnread(req.user.id);
  res.json({ notifications, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationRepo.markRead(req.params.id, req.user.id);
  if (!notification) throw notFound('Notification not found');
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationRepo.markAllRead(req.user.id);
  res.status(204).send();
});
