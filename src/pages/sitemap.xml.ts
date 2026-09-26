import type { APIRoute } from 'astro';
import { research } from '../data/research';

const urls = [
  ['/', 'weekly', '1.0'],
  ['/works/', 'weekly', '0.9'],
  ['/films/single-bit-error/', 'monthly', '0.8'],
  ['/films/droplet/', 'monthly', '0.8'],
  ['/research/', 'monthly', '0.8'],
  ...research.map(report => [report.href, 'monthly', '0.8']),
  ['/notes/', 'weekly', '0.8'],
  ['/about/', 'yearly', '0.5'],
  ['/earth/', 'weekly', '0.9'],
  ['/games/', 'monthly', '0.8'],
  ['/cosmos/', 'monthly', '0.7'],
  ['/maps/', 'monthly', '0.6'],
  ['/maps/huanghe/', 'monthly', '0.7'],
  ['/mindverse/', 'monthly', '0.7'],
  ['/novels/', 'monthly', '0.6'],
  ['/clay/', 'monthly', '0.7'],
  ['/cad/', 'monthly', '0.7'],
  ['/dataism/', 'monthly', '0.7'],
  ['/fireworks/', 'monthly', '0.7'],
  ['/seaside-delivery/', 'monthly', '0.8'],
  ['/autumn-train/', 'monthly', '0.8'],
  ['/travel/', 'monthly', '0.7'],
  ['/travel/uk-roadbook/', 'monthly', '0.7'],
  ['/travel/xhs-card/', 'monthly', '0.7'],
  ['/games/fireworks-kaleidoscope.html', 'monthly', '0.7'],
  ['/games/retro-kaleidoscope/', 'monthly', '0.7'],
  ['/games/numsweeper.html', 'monthly', '0.6'],
  ['/games/pixel-breaker.html', 'monthly', '0.6'],
  ['/games/naoliceshi.html', 'monthly', '0.6'],
];

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, changefreq, priority]) => `  <url><loc>https://shuzidiantang.com${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
