import { validSession, loginHtml } from './shared/access.mjs';
export const config = { runtime: 'nodejs' };
export default function middleware(request: Request) {
  const path = new URL(request.url).pathname;
  if (['/api/auth', '/access.js', '/robots.txt'].includes(path)) return;
  // The API also checks authorization itself, including existing invite clients.
  if (path === '/api/trip') return;
  if (validSession(request.headers.get('cookie') ?? '')) return;
  const html = request.headers.get('accept')?.includes('text/html') || path === '/';
  return new Response(html ? loginHtml() : 'Authentication required', {status:401, headers:{
    'Content-Type':html ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow, noarchive',
    'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; form-action 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"
  }});
}
