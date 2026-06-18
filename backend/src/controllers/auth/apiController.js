import { asyncHandler } from '../../utils/asyncHandler.js';
import { generateKey, listKeys, revokeKey } from '../../services/auth/apiKeyService.js';
import * as projectRepository from '../../repositories/project/projectRepository.js';
import * as scrapeRepository from '../../repositories/project/scrapeRepository.js';

export const generateApiKey = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Key name is required' });
  }

  const { apiKey, rawKey } = await generateKey(req.user.id, name);

  res.status(201).json({
    success: true,
    apiKey: {
      ...apiKey,
      rawKey,
    }
  });
});

export const listApiKeys = asyncHandler(async (req, res) => {
  const keys = await listKeys(req.user.id);

  res.json({ success: true, keys });
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const revoked = await revokeKey(req.user.id, keyId);

  if (!revoked) {
    return res.status(404).json({ error: 'API key not found' });
  }

  res.json({ success: true, message: 'API key revoked successfully' });
});

export const getScrapedData = asyncHandler(async (req, res) => {
  const { project_id } = req.query;

  if (!project_id) {
    return res.status(400).json({ error: 'project_id is required' });
  }

  const project = await projectRepository.findById(project_id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (project.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const latestData = await scrapeRepository.getLatestDataForProject(project_id);

  res.json({
    success: true,
    data: latestData,
    project: {
      id: project.id,
      name: project.name,
      website_url: project.website_url,
    }
  });
});
