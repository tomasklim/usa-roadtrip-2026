import { createHash, createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
export const COOKIE = '__Host-roadtrip';
const secret = () => process.env.TRIP_SHARE_TOKEN || '';
export const configured = () => /^[A-Za-z0-9_-]{43}$/.test(secret());
const equal = (a,b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
export const accessCode = () => createHmac('sha256', secret()).update('roadtrip-access-code-v1').digest('hex').slice(0,20).match(/.{4}/g).join('-');
export function validCode(value) {
  if (!configured() || typeof value !== 'string' || value.length > 200) return false;
  return equal(value.trim(), secret()) || equal(value.toLowerCase().replace(/[^a-z0-9]/g,''), accessCode().replaceAll('-',''));
}
export function validBearer(headers) {
  const v = headers.authorization ?? '';
  return configured() && typeof v === 'string' && v.startsWith('Bearer ') && equal(v.slice(7), secret());
}
const signature = payload => createHmac('sha256', secret()).update(`session-v1:${payload}`).digest('base64url');
export function sessionCookie() {
  const payload = `${Math.floor(Date.now()/1000) + 30*86400}.${randomBytes(16).toString('hex')}`;
  return `${COOKIE}=${payload}.${signature(payload)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30*86400}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
export function validSession(cookie = '') {
  if (!configured() || typeof cookie !== 'string') return false;
  const value = cookie.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1) ?? '';
  const parts = value.match(/^(\d{10})\.([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/);
  if (!parts || +parts[1] <= Date.now()/1000 || +parts[1] > Date.now()/1000+31*86400) return false;
  return equal(parts[3], signature(`${parts[1]}.${parts[2]}`));
}
export function sameOrigin(req) {
  const host = req.headers.host;
  try { return !!host && new URL(req.headers.origin).host === host; } catch { return false; }
}
export function loginHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Private trip</title><style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f3f1e8;color:#283d33;font:17px system-ui}main{max-width:390px;padding:32px;margin:20px;background:#fffef9;border:1px solid #d7decd;border-radius:18px}h1{font:38px Georgia;margin:12px 0}p{line-height:1.6;color:#627166}label{display:grid;gap:10px;margin:28px 0 16px}input,button{box-sizing:border-box;width:100%;padding:14px;font:inherit;border-radius:8px;border:1px solid #b7c4af}button{background:#2b493b;color:white;cursor:pointer}#message{min-height:24px}small{letter-spacing:.13em}</style><script src="/access.js" defer></script></head><body><main><small>JUST FOR US</small><h1>Our private trip.</h1><p>Enter the shared access code to open the itinerary and your notes.</p><form id="access" action="/api/auth" method="post"><label>Access code<input name="code" type="password" required maxlength="200" autocomplete="current-password" autofocus></label><button>Open our trip</button></form><p id="message" role="status"></p></main></body></html>`;
}
