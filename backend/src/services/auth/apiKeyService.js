import crypto from 'crypto';
import * as apiKeyRepository from '../../repositories/apiKeyRepository.js';

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

export async function generateKey(userId, name, expiresAt = null) {
  const rawKey = `wp_live_${generateRandomToken()}`;
  const keyHash = hashKey(rawKey);
  const truncatedKey = truncateKey(rawKey);

  const apiKey = await apiKeyRepository.create({
    userId,
    name,
    keyHash,
    truncatedKey,
    expiresAt,
  });

  return { apiKey, rawKey };
}

export async function listKeys(userId) {
  return await apiKeyRepository.findByUserId(userId);
}

export async function revokeKey(userId, keyId) {
  return await apiKeyRepository.deleteByIdAndUserId(keyId, userId);
}

export async function verifyKey(rawKey) {
  const keyHash = hashKey(rawKey);
  const apiKeyRecord = await apiKeyRepository.findByKeyHash(keyHash);

  if (!apiKeyRecord) {
    return null;
  }

  if (apiKeyRecord.expires_at && new Date() > new Date(apiKeyRecord.expires_at)) {
    return null;
  }

  await apiKeyRepository.updateLastUsedAt(apiKeyRecord.id);

  return {
    id: apiKeyRecord.user_id,
    name: apiKeyRecord.user_name,
    email: apiKeyRecord.user_email,
    apiKeyId: apiKeyRecord.id,
  };
}
