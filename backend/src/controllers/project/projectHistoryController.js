import * as projectService from '../../services/project/projectService.js';
import * as projectHistoryService from '../../services/project/projectHistoryService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getProjectHistory = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const { history, hasPrice } = await projectHistoryService.getProjectHistory(req.params.id);
  res.json({ history, hasPrice });
});
