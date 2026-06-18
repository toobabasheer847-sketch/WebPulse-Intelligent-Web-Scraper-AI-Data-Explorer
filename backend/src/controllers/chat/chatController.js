import * as aiService from '../../services/ai/aiService.js';
import * as chatRepo from '../../repositories/chat/chatRepository.js';
import * as projectService from '../../services/project/projectService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { message } = req.body;
  await projectService.getProject(projectId, req.user.id);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await aiService.chatWithProject({
      projectId,
      userId: req.user.id,
      message,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
    });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }
  res.end();
});

export const getHistory = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const history = await chatRepo.getHistory(req.params.id, req.user.id);
  res.json({ history });
});

export const clearHistory = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  await chatRepo.clearHistory(req.params.id, req.user.id);
  res.status(204).send();
});
