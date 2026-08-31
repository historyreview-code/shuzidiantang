import type { APIRoute } from 'astro';

export const GET: APIRoute = () => new Response(`User-agent: *
Allow: /
Disallow: /hidden/

Sitemap: https://shuzidiantang.com/sitemap.xml
`, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
