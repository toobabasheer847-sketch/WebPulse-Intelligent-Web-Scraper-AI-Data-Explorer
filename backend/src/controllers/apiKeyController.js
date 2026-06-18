import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as apiKeyRepository from '../repositories/apiKeyRepository.js';
import * as projectRepository from '../repositories/project/projectRepository.js';
import * as scrapeRepository from '../repositories/project/scrapeRepository.js';

function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function truncateKey(rawKey) {
  const prefix = rawKey.slice(0, 12);
  const suffix = rawKey.slice(-4);
  return `${prefix}...${suffix}`;
}

export const generateApiKey = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Key name is required' });
  }

  const rawKey = `wp_live_${generateRandomToken()}`;
  const keyHash = hashKey(rawKey);
  const truncatedKey = truncateKey(rawKey);

  const apiKey = await apiKeyRepository.create({
    userId: req.user.id,
    name,
    keyHash,
    truncatedKey,
    expiresAt: null,
  });

  res.status(201).json({
    success: true,
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      truncatedKey: apiKey.truncated_key,
      createdAt: apiKey.created_at,
      rawKey, // Return only once!
    }
  });
});

export const listApiKeys = asyncHandler(async (req, res) => {
  const keys = await apiKeyRepository.findByUserId(req.user.id);

  res.json({ success: true, keys });
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const revoked = await apiKeyRepository.deleteByIdAndUserId(id, req.user.id);

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
