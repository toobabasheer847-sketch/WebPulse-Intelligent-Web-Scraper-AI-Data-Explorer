import * as dashboardService from '../../services/dashboard/dashboardService.js';
import * as projectService from '../../services/project/projectService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id);
  res.json(stats);
});

export const getAnalytics = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const analytics = await dashboardService.getProjectAnalytics(req.params.id);
  res.json(analytics);
});
