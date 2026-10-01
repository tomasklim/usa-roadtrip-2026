import { createHmac } from 'node:crypto';
import { accessCode, validCode, configured, validSession, validBearer, sameOrigin, sessionCookie, clearCookie, loginHtml, loginReturnTo } from '../shared/access.mjs';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  const nativeForm = req.method === 'POST' && req.headers['content-type']?.includes('application/x-www-form-urlencoded');
  let body;
  const fail = (status, error) => {
    if (!nativeForm) return res.status(status).json({error});
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.status(status).send(loginHtml({error,returnTo:body?.returnTo}));
  };
  if (!configured()) return fail(503,'Private access is not configured.');
  const signedIn = validSession(req.headers.cookie);
  if (req.method === 'GET') return signedIn ? res.status(200).json({authenticated:true, code:accessCode()}) : res.status(401).json({authenticated:false});
  if (req.method !== 'POST') {res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
  if (!sameOrigin(req)) return fail(403,'Open the form on this website.');
  try {body = typeof req.body === 'string' ? (req.headers['content-type']?.includes('application/json') ? JSON.parse(req.body) : Object.fromEntries(new URLSearchParams(req.body))) : req.body;} catch {return fail(400,'Invalid request');}
  if (body?.action === 'logout') {res.setHeader('Set-Cookie',clearCookie());return res.status(200).json({ok:true});}
  const url=process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisSecret=process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !redisSecret) return fail(503,'Private access is temporarily unavailable.');
  // Per-IP, fixed-window protection. The IP itself is never stored.
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const key = 'roadtrip:login:'+createHmac('sha256',process.env.TRIP_SHARE_TOKEN).update(ip).digest('hex').slice(0,24)+':'+Math.floor(Date.now()/900000);
  try {
    const reply = await fetch(url+'/pipeline',{method:'POST',headers:{Authorization:`Bearer ${redisSecret}`,'Content-Type':'application/json'},body:JSON.stringify([['INCR',key],['EXPIRE',key,900]]),signal:AbortSignal.timeout(8000)});
    if (!reply.ok) throw Error();
    const results = await reply.json();
    if (!Array.isArray(results) || results.some(x => x.error) || typeof results[0]?.result !== 'number') throw Error();
    if (results[0].result > 20) {res.setHeader('Retry-After','900');return fail(429,'Too many attempts. Try again in 15 minutes.');}
  } catch { return fail(503,'Private access is temporarily unavailable. Please retry.'); }
  if (!validCode(body?.code) && !validBearer(req.headers)) return fail(401,'That code does not match. Please try again.');
  res.setHeader('Set-Cookie',sessionCookie());
  if (req.headers['content-type']?.includes('application/json')) return res.status(200).json({ok:true});
  res.setHeader('Location',loginReturnTo(body?.returnTo));return res.status(303).end();
}
