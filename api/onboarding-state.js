const { kv } = require('@vercel/kv');

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
    const data = await kv.get(STATE_KEY);
    res.json(data || null);
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        await kv.set(STATE_KEY, data);
        res.json({ ok: true });
      } catch (e) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
