import crypto from 'crypto';
import * as apiKeyRepository from '../repositories/apiKeyRepository.js';

export async function apiKeyAuth(req, res, next) {
  let apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const apiKeyRecord = await apiKeyRepository.findByKeyHash(keyHash);

  if (!apiKeyRecord) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }
   
  if (apiKeyRecord.expires_at && new Date() > new Date(apiKeyRecord.expires_at)) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }

  req.user = { id: apiKeyRecord.user_id };
  next();
}
