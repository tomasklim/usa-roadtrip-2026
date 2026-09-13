import { createHash, timingSafeEqual } from 'node:crypto';
import { validField, validPatch } from '../shared/trip-schema.mjs';

const hash = value => createHash('sha256').update(value).digest();
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Authorization');
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const secret = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const invitation = process.env.TRIP_SHARE_TOKEN;
  const configured = !!(url?.startsWith('https://') && secret && invitation && /^[A-Za-z0-9_-]{43}$/.test(invitation));
  if (req.method === 'GET' && req.query?.status === '1') return res.status(200).json({ configured });
  if (!['GET', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!configured) return res.status(503).json({ error: 'Shared trip is not configured yet' });
  const authorization = req.headers.authorization ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(token) || !timingSafeEqual(hash(token), hash(invitation))) return res.status(401).json({ error: 'Invalid invite link' });
  // A private, single-trip workspace. Different checklist fields update independently.
  const redisKey = 'roadtrip:2026:shared:v1';
  const command = async body => {
    const response = await fetch(url, {
      method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw Error('Storage unavailable');
    const data = await response.json();
    if (data.error) throw Error('Storage unavailable');
    return data.result;
  };
  try {
    if (req.method === 'PATCH') {
      if (!req.headers['content-type']?.includes('application/json')) return res.status(415).json({ error: 'JSON required' });
      let patch;
      try { patch = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
      if (!validPatch(patch)) return res.status(400).json({ error: 'Invalid trip changes' });
      await command(['HSET', redisKey, ...Object.entries(patch).flatMap(([k, v]) => [k, JSON.stringify(v)]), '_updatedAt', JSON.stringify(Date.now())]);
    }
    const raw = await command(['HGETALL', redisKey]);
    if (!Array.isArray(raw)) throw Error('Invalid storage response');
    const fields = {};
    let updatedAt = null;
    for (let i = 0; i < raw.length; i += 2) {
      try {
        const value = JSON.parse(raw[i + 1]);
        if (raw[i] === '_updatedAt') updatedAt = value;
        else if (validField(raw[i], value)) fields[raw[i]] = value;
      } catch { /* Ignore malformed stored fields. */ }
    }
    return res.status(200).json({ fields, updatedAt });
  } catch {
    return res.status(502).json({ error: 'Shared storage is temporarily unavailable' });
  }
}
