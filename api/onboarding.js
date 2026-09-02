const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PASSWORD = 'InicioDig1tal!';
const COOKIE_NAME = 'onboarding_auth';
const TOKEN = crypto.createHash('sha256').update(PASSWORD + '_inicio_onboarding').digest('hex');

const ONBOARDING_HTML = fs.readFileSync(path.join(__dirname, 'onboarding-content.html'), 'utf8');

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

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Login — Inicio Digital</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #F7F6F3; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .login { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04); width: 320px; }
  h2 { font-size: 18px; margin: 0 0 1rem; color: #1A1A18; }
  input { width: 100%; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.13); border-radius: 8px; font-size: 14px; font-family: inherit; box-sizing: border-box; outline: none; }
  input:focus { border-color: #2b3154; box-shadow: 0 0 0 3px rgba(29,158,117,0.12); }
  button { width: 100%; margin-top: 12px; padding: 10px; background: #2b3154; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-family: inherit; font-weight: 500; cursor: pointer; }
  button:hover { background: #0F6E56; }
  .error { color: #B91C1C; font-size: 13px; margin-top: 8px; }
</style>
</head>
<body>
<form class="login" method="POST" action="/onboarding">
  <h2>Password required</h2>
  <input type="password" name="password" placeholder="Enter password" autofocus/>
  <button type="submit">Submit</button>
  ERRORMSG
</form>
</body>
</html>`;

module.exports = (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const password = params.get('password');
      if (password === PASSWORD) {
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
        res.writeHead(302, { Location: '/onboarding' });
        res.end();
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(LOGIN_HTML.replace('ERRORMSG', '<p class="error">Incorrect password</p>'));
      }
    });
    return;
  }

  if (isAuthenticated(req)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(ONBOARDING_HTML);
  } else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(LOGIN_HTML.replace('ERRORMSG', ''));
  }
};
