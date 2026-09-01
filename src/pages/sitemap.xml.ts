import type { APIRoute } from 'astro';

const urls = [
  ['/', 'weekly', '1.0'],
  ['/works/', 'weekly', '0.9'],
  ['/notes/', 'weekly', '0.8'],
  ['/videos/', 'monthly', '0.7'],
  ['/about/', 'yearly', '0.5'],
  ['/earth/', 'weekly', '0.9'],
  ['/games/', 'monthly', '0.8'],
  ['/cosmos/', 'monthly', '0.7'],
  ['/clay/', 'monthly', '0.7'],
  ['/cad/', 'monthly', '0.7'],
  ['/dataism/', 'monthly', '0.7'],
  ['/travel/', 'monthly', '0.7'],
  ['/travel/uk-roadbook/', 'monthly', '0.7'],
  ['/travel/xhs-card/', 'monthly', '0.7'],
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
