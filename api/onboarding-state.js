const crypto = require('crypto');

const PASSWORD = 'musashi321';
const COOKIE_NAME = 'onboarding_auth';
const TOKEN = crypto.createHash('sha256').update(PASSWORD + '_inicio_onboarding').digest('hex');

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(c => {
    const [key, ...rest] = c.trim().split('=');
    if (key) cookies[key.trim()] = rest.join('=').trim();
  });
  return cookies;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME] === TOKEN;
}

// Parse KV_REDIS_URL (rediss://default:TOKEN@HOST:PORT) into Upstash REST API credentials
function getRedisConfig() {
  const url = process.env.KV_REDIS_URL || process.env.REDIS_URL || '';
  const match = url.match(/:\/\/[^:]+:([^@]+)@([^:]+)/);
  if (!match) return null;
  return { restUrl: `https://${match[2]}`, restToken: match[1] };
}

async function redisGet(key) {
  const cfg = getRedisConfig();
  if (!cfg) throw new Error('Redis not configured');
  const r = await fetch(`${cfg.restUrl}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${cfg.restToken}` }
  });
  const data = await r.json();
  if (data.result === null) return null;
  try { return JSON.parse(data.result); } catch { return data.result; }
}

async function redisSet(key, value) {
  const cfg = getRedisConfig();
  if (!cfg) throw new Error('Redis not configured');
  const r = await fetch(`${cfg.restUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.restToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value)])
  });
  return r.json();
}

const STATE_KEY = 'onboarding:state';

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const data = await redisGet(STATE_KEY);
      res.json(data || null);
    } catch (e) {
      res.status(500).json({ error: 'Failed to load state', detail: e.message });
    }
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        await redisSet(STATE_KEY, data);
        res.json({ ok: true });
      } catch (e) {
        res.status(400).json({ error: 'Save failed', detail: e.message });
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
