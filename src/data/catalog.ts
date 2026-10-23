import { works, cosmosSeries, travelSeries, notes } from './site';
import { research } from './research';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface CatalogItem {
  id: string;
  title: string;
  href: string;
  image?: string;
  summary: string;
  meta: string;
  icon: string;
  external?: boolean;
  github?: string;
}
export interface CatalogGroup {
  id: string;
  title: string;
  english: string;
  description: string;
  icon: string;
  color: string;
  items: CatalogItem[];
  related?: CatalogItem[];
  relatedTitle?: string;
  more?: { label: string; href: string };
}

// 新作品默认进入数字探索，避免更新内容时因漏填分类而消失。
const groups: Record<string, string[]> = {
  media: ['don-quixote-podcast', 'math-beauty-astra', 'babylon-tower', 'single-bit-error', 'droplet', 'math-beauty', 'electricity', 'autumn-train'],
  travel: ['york-wander', 'cambridge-wander', 'glasgow-wander', 'harbin-wander', 'edinburgh-wander', 'kyoto-wander'],
  research: ['jilin-shipyards', 'shamanism', 'huanghe', 'shanghai-time-map'],
  tools: ['cad', 'naoliceshi', 'fireworks-kaleidoscope', 'retro-kaleidoscope', 'mini-games'],
};
const icons: Record<string, string> = {
  earth: 'globe', clay: 'cube', dataism: 'spark', 'seaside-delivery': 'route', 'fireworks-player': 'wave', mindverse: 'book',
  'don-quixote-podcast': 'headphones', 'math-beauty-astra': 'spark', electricity: 'bolt', 'autumn-train': 'route',
  cad: 'layers', naoliceshi: 'grid', 'mini-games': 'game', 'fireworks-kaleidoscope': 'spark', 'retro-kaleidoscope': 'spark',
};
const categoryFor = (id: string) => Object.entries(groups).find(([, ids]) => ids.includes(id))?.[0] || 'explore';
const toItem = (work: (typeof works)[number]): CatalogItem => ({
  id: work.id, title: work.title, href: work.href, image: work.image,
  summary: work.summary, meta: work.eyebrow, icon: icons[work.id] || (categoryFor(work.id) === 'travel' ? 'compass' : categoryFor(work.id) === 'research' ? 'map' : 'play'),
  external: work.external, github: work.github,
});
const itemsFor = (category: string) => works.filter(work => categoryFor(work.id) === category).map(toItem);
const reportItems: CatalogItem[] = research.map(report => ({
  id: report.slug, title: report.title, href: report.href,
  image: report.coverImage, summary: report.subtitle,
  meta: `研究 · ${report.date} · ${report.sources} 条来源`, icon: 'book',
}));

// 延续原组装流程：新手记按文件日期自动入列，无需再维护首页列表。
const notesDirectory = path.join(process.cwd(), 'notes');
const noteItems: CatalogItem[] = readdirSync(notesDirectory)
  .filter(file => /^\d{4}-\d{2}-\d{2}-.+\.html$/.test(file))
  .sort().reverse().map(file => {
    const href = `/notes/${file}`;
    const saved = notes.find(note => note.href === href);
    const html = readFileSync(path.join(notesDirectory, file), 'utf8');
    const title = saved?.title || html.match(/<title>([^<]+)<\/title>/i)?.[1].replace(/\s*·\s*(数字殿堂|劳伦斯在上海|劳伦斯实验室).*$/, '').trim() || file;
    const summary = saved?.summary || html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '阅读这篇创作手记。';
    const category = saved?.category || html.match(/分类[:：]\s*([^<]+)/)?.[1].replace(/\s*-->\s*$/, '').trim() || '手记';
    return { id: file.slice(0, -5), title, href, summary, meta: `${file.slice(0, 10)} · ${category}`, icon: 'pen' };
  });

export const catalog: CatalogGroup[] = [
  {
    id: 'explore', title: '数字探索', english: 'DIGITAL EXPLORATIONS', icon: 'globe', color: 'green',
    description: '转动地球、走进微缩世界，看看代码还能变成什么。', items: itemsFor('explore'),
  },
  {
    id: 'media', title: '影像与播客', english: 'FILM & SOUND', icon: 'headphones', color: 'terracotta',
    description: '有些故事适合看，有些想法适合慢慢听。', items: itemsFor('media'),
    relatedTitle: '天文与宇宙 · 六部科普短片',
    related: cosmosSeries.map((ep, index) => ({ id: `cosmos-${index}`, title: ep.title, href: ep.href, image: ep.img, summary: ep.sub, meta: ep.ep, icon: 'play' })),
    more: { label: '进入天文馆', href: '/cosmos/' },
  },
  {
    id: 'travel', title: '城市漫游', english: 'PLACES & JOURNEYS', icon: 'compass', color: 'blue',
    description: '沿街巷、河流与历史，认识一座城市。',
    items: [...itemsFor('travel'), ...travelSeries.filter(item => item.href && !item.external && !works.some(work => work.href === item.href)).map((item, index) => ({ id: `travel-tool-${index}`, title: item.title, href: item.href, image: item.img, summary: item.sub, meta: '旅行工具', icon: 'route' }))],
    relatedTitle: '手绘跨时空旅行 · 英伦漫记',
    related: travelSeries.filter(item => item.external).map((item, index) => ({ id: `travel-film-${index}`, title: item.title, href: item.href, image: item.img, summary: item.sub, meta: 'B站短片', icon: 'play', external: true })),
    more: { label: '旅行实验室', href: '/travel/' },
  },
  {
    id: 'research', title: '历史与研究', english: 'HISTORY & RESEARCH', icon: 'book', color: 'brown',
    description: '从一个问题出发，沿地图与文献追溯依据。',
    items: [...reportItems, ...itemsFor('research').filter(item => !reportItems.some(report => report.href === item.href))],
    more: { label: '全部研究', href: '/research/' },
  },
  {
    id: 'tools', title: '互动与工具', english: 'PLAY & MAKE', icon: 'grid', color: 'purple',
    description: '点一点、试一试，把小想法变成可以动手的体验。', items: itemsFor('tools'),
    more: { label: '创意小游戏', href: '/games/' },
  },
  {
    id: 'notes', title: '创作手记', english: 'FIELD NOTES', icon: 'pen', color: 'olive',
    description: '记下实践中的问题、选择，以及做成一件事的过程。',
    items: noteItems,
    more: { label: '全部手记', href: '/notes/' },
  },
];
export const catalogCount = catalog.reduce((sum, group) => sum + group.items.length + (group.related?.length || 0), 0);
export const featured = toItem(works.find(work => work.id === 'don-quixote-podcast')!);
