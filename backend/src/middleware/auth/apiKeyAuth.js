import { verifyKey } from '../../services/auth/apiKeyService.js';

export async function apiKeyAuth(req, res, next) {
  let apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  const user = await verifyKey(apiKey);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }

  req.user = user;
  next();
}
