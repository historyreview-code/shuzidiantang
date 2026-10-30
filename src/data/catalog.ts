import { works, notes } from './site';
import { research, historyProject } from './research';
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
  /** 窄屏导航用的短标签；缺省用 title。 */
  navLabel?: string;
  /** entry：整组只有汇总入口，渲染为一条宽幅导流卡。 */
  layout?: 'entry';
}

const byId = new Map(works.map((work) => [work.id, work] as const));
const icons: Record<string, string> = {
  earth: 'globe', liberty: 'cube', 'seaside-delivery': 'route', 'fireworks-player': 'wave', mindverse: 'book',
  'don-quixote-podcast': 'headphones', 'math-beauty-astra': 'spark', electricity: 'bolt', 'autumn-train': 'route',
  guandan: 'game', cad: 'layers', naoliceshi: 'grid', 'mini-games': 'game', 'fireworks-kaleidoscope': 'spark', 'retro-kaleidoscope': 'spark',
  'japan-sea-war': 'map', 'babylon-tower': 'play', 'single-bit-error': 'play', droplet: 'play',
  'jilin-shipyards': 'map', huanghe: 'map', 'shanghai-time-map': 'map', shamanism: 'book',
};
const toItem = (work: (typeof works)[number]): CatalogItem => ({
  id: work.id, title: work.title, href: work.href, image: work.image,
  summary: work.summary, meta: work.eyebrow, icon: icons[work.id] || 'play',
  external: work.external, github: work.github,
});
const workItem = (id: string): CatalogItem => {
  const work = byId.get(id);
  if (!work) throw new Error(`catalog: 未知作品 ${id}`);
  return toItem(work);
};

// 每个栏目显式列出条目，保证首页顺序与主编排一致。
const groups: Record<string, string[]> = {
  screen: ['japan-sea-war', 'don-quixote-podcast', 'babylon-tower', 'single-bit-error', 'droplet', 'math-beauty-astra', 'electricity', 'autumn-train'],
  code: ['earth', 'liberty', 'seaside-delivery', 'fireworks-player', 'mindverse', 'guandan', 'cad', 'naoliceshi', 'fireworks-kaleidoscope', 'retro-kaleidoscope', 'mini-games', 'huanghe', 'shanghai-time-map'],
};

const libertyItem: CatalogItem = {
  id: 'liberty',
  title: '自由女神像',
  href: '/liberty/',
  image: 'https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F5f8a4c410665028677cf0e63b021a6923810a7a75bc758f04d979bc19da116c5?filename=cover.png&sig=cxAlmHIX4cwU3Onel9rdRdlIMD1tW0_EZo5wWATNns4=&t=o',
  summary: '以原始高精度交互 3D 呈现冠冕、火炬、书板、铜绿长袍与石质底座，支持旋转、缩放和模型下载。',
  meta: '交互 3D · 原始高精度版',
  icon: 'cube',
};

const reportItems: CatalogItem[] = research.map((report) => ({
  id: report.slug, title: report.title, href: report.href,
  image: report.coverImage, summary: report.subtitle,
  meta: `研究 · ${report.date}${report.sources ? ` · ${report.sources} 条来源` : ''}`, icon: 'book',
}));

// 历史研究子项目：奉系 / 战争与归途，作为一个入口。
const historyItem: CatalogItem = {
  id: historyProject.slug,
  title: historyProject.title,
  href: historyProject.href,
  image: historyProject.coverImage,
  summary: historyProject.subtitle,
  meta: '历史研究 · 子项目 · 两部专著',
  icon: 'book',
};

// 天文馆：六部短片整体作为一个标签入口，不再在首页逐集铺开。
const cosmosItem: CatalogItem = {
  id: 'cosmos-hall',
  title: '天文馆',
  href: '/cosmos/',
  image: '/assets/img/cosmos/06.webp',
  summary: '从黄道面到旅行者号：六部科普短片收在同一个入口，点进去一次看完。',
  meta: '系列入口 · 6 部短片',
  icon: 'play',
};

// 城市悠游：六座城市与两个工具收在 /travel/，首页只留汇总入口。
const cityWalksItem: CatalogItem = {
  id: 'city-walks',
  title: '城市悠游',
  href: '/travel/',
  image: '/assets/img/travel/city-walks-cover.png',
  summary: '约克、剑桥、格拉斯哥、哈尔滨、爱丁堡、京都：六座城市的交互漫游程序，附会飞的路书与小红书卡片工具。',
  meta: '交互旅行程序 · 6 座城市 · 汇总入口',
  icon: 'compass',
};

// 延续原组装流程：新手记按文件日期自动入列，无需再维护首页列表。
const notesDirectory = path.join(process.cwd(), 'notes');
const noteItems: CatalogItem[] = readdirSync(notesDirectory)
  .filter((file) => /^\d{4}-\d{2}-\d{2}-.+\.html$/.test(file))
  .sort().reverse().map((file) => {
    const href = `/notes/${file}`;
    const saved = notes.find((note) => note.href === href);
    const html = readFileSync(path.join(notesDirectory, file), 'utf8');
    const title = saved?.title || html.match(/<title>([^<]+)<\/title>/i)?.[1].replace(/\s*·\s*(数字殿堂|劳伦斯在上海|劳伦斯实验室).*$/, '').trim() || file;
    const summary = saved?.summary || html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '阅读这篇创作手记。';
    const category = saved?.category || html.match(/分类[:：]\s*([^<]+)/i)?.[1].replace(/\s*-->\s*$/, '').trim() || '手记';
    return { id: file.slice(0, -5), title, href, summary, meta: `${file.slice(0, 10)} · ${category}`, icon: 'pen' };
  });

export const catalog: CatalogGroup[] = [
  {
    id: 'screen', title: '本站视频与播客', english: 'FILM & PODCAST', icon: 'headphones', color: 'terracotta',
    description: '站内可看的影像与可听的播客，从历史短片到文学对谈。',
    items: [...groups.screen.map(workItem), cosmosItem],
  },
  {
    id: 'code', title: '技术编程 · 数字作品与游戏', navLabel: '技术编程与游戏', english: 'DIGITAL WORKS & GAMES', icon: 'grid', color: 'green',
    description: '用代码做出来的数字作品、交互实验与小游戏。',
    items: [workItem('earth'), libertyItem, ...groups.code.slice(2).map(workItem)],
    more: { label: '创意小游戏', href: '/games/' },
  },
  {
    id: 'research', title: '专题研究 · 电子书', english: 'RESEARCH & EBOOKS', icon: 'book', color: 'brown',
    description: '有出处、可核验的专题研究与电子书，按研究线索归档。',
    items: [historyItem, ...reportItems],
    more: { label: '全部专题', href: '/research/' },
  },
  {
    id: 'travel', title: '城市悠游', english: 'CITY WALKS', icon: 'compass', color: 'blue',
    description: '六座城市、六段交互漫游；点进去再选城市。',
    items: [cityWalksItem],
    more: { label: '进入城市悠游', href: '/travel/' },
    layout: 'entry',
  },
  {
    id: 'notes', title: '创作手记', english: 'FIELD NOTES', icon: 'pen', color: 'olive',
    description: '记录实践中的问题、选择，以及做成一件事的过程。',
    items: noteItems,
    more: { label: '全部手记', href: '/notes/' },
  },
];
export const catalogCount = catalog.reduce((sum, group) => sum + group.items.length + (group.related?.length || 0), 0);
export const featured = toItem(works.find((work) => work.id === 'don-quixote-podcast')!);
