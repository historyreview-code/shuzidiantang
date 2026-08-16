#!/usr/bin/env node
/**
 * 数字殿堂 · 组装脚本
 * 把各作品的最新产物组装进 dist/，供 Cloudflare Pages / EdgeOne Pages 直接发布。
 *
 * 结构：
 *   静态页面（本仓库）         → dist/**
 *   地球厅（digital-earth-series）→ clone + pnpm build → dist/earth
 *
 * 用法：node scripts/assemble.mjs
 */
import { execSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MONOREPO = 'https://github.com/historyreview-code/digital-earth-series.git';
const CACHE = path.join(ROOT, '.cache', 'digital-earth-series');
const DIST = path.join(ROOT, 'dist');

const STATIC_PATHS = [
  'index.html', '404.html', 'robots.txt', 'sitemap.xml',
  'assets', 'games', 'cosmos', 'about', 'notes', 'hidden',
];

function run(cmd, cwd = ROOT) {
  console.log(`\n$ ${cmd}`);
  // 独立缓存目录：绕开本机 npm 缓存被 root 属主污染的问题（EPERM）
  const env = {
    ...process.env,
    npm_config_cache: path.join(ROOT, '.cache', 'npm-cache'),
  };
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

// 1. 清理 + 复制静态页面
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
for (const p of STATIC_PATHS) {
  const src = path.join(ROOT, p);
  const dst = path.join(DIST, p);
  if (existsSync(src)) cpSync(src, dst, { recursive: true });
}

// 2. 地球厅：拉取 monorepo 最新代码并构建门户
if (existsSync(path.join(CACHE, '.git'))) {
  run('git pull --ff-only origin main', CACHE);
} else {
  mkdirSync(path.dirname(CACHE), { recursive: true });
  run(`git clone --depth 1 ${MONOREPO} ${CACHE}`);
}
const pnpm = process.env.PNPM_CMD || 'npx --yes pnpm@9';
run(`${pnpm} install --frozen-lockfile=false --store-dir ${path.join(ROOT, '.cache', 'pnpm-store')}`, CACHE);
run(`${pnpm} --filter @digital-earth/portal build`, CACHE);

const portalDist = path.join(CACHE, 'apps', 'portal', 'dist');
if (!existsSync(portalDist)) {
  console.error('✗ 门户构建产物不存在：' + portalDist);
  process.exit(1);
}
cpSync(portalDist, path.join(DIST, 'earth'), { recursive: true });

// 2.5 主题 SEO 静态落地页 → /earth/themes/<id>/ (叠加在门户之上, 供搜索引擎收录)
const themesSrc = path.join(ROOT, 'earth', 'themes');
if (existsSync(themesSrc)) {
  cpSync(themesSrc, path.join(DIST, 'earth', 'themes'), { recursive: true });
  console.log('  主题 SEO 落地页已叠加 → dist/earth/themes/');
}

// 3. 笔记流（博客式自动列表 + RSS + sitemap）
//    公开手记 notes/*.html 与 暗室投资研究 hidden/invest/notes/*.html 共用这套机制:
//    按文件名日期倒序生成列表 (最新在上, 旧的自动下沉)
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function collectNotes(notesDir, titleStripRe) {
  const items = [];
  if (!existsSync(notesDir)) return items;
  for (const f of readdirSync(notesDir).sort()) {
    if (!f.endsWith('.html')) continue;
    const m = f.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.html$/);
    if (!m) continue;
    const raw = readFileSync(path.join(notesDir, f), 'utf8');
    const titleMatch = raw.match(/<title>([^<]+)<\/title>/);
    const catMatch = raw.match(/分类[:：]\s*([^<]+)/);
    const descMatch = raw.match(/<meta name="description" content="([^"]*)"/);
    const title = titleMatch ? titleMatch[1].replace(titleStripRe, '').trim() : m[2];
    items.push({
      date: m[1],
      file: f,
      title,
      cat: catMatch ? catMatch[1].trim() : '',
      desc: descMatch ? descMatch[1].trim() : title,
    });
  }
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items;
}
function renderFeedItems(items, hrefPrefix, limit, placeholderHtml) {
  if (items.length === 0) return placeholderHtml;
  const shown = limit ? items.slice(0, limit) : items;
  return shown
    .map(
      (it) =>
        `<a class="item" href="${hrefPrefix}${it.file}"><span class="date">${it.date}</span><span class="txt">${escapeHtml(it.title)}${it.cat ? `<small>${escapeHtml(it.cat)}</small>` : ''}</span></a>`,
    )
    .join('\n      ');
}
function injectFeed(htmlFile, containerId, html) {
  if (!existsSync(htmlFile)) return false;
  const t = readFileSync(htmlFile, 'utf8');
  const re = new RegExp(`(<div class="feed" id="${containerId}">)[\\s\\S]*?(<\\/div>\\s*<\\/section>)`);
  const updated = t.replace(re, `$1\n      ${html}\n    $2`);
  if (updated !== t) {
    writeFileSync(htmlFile, updated);
    return true;
  }
  return false;
}

// --- 公开手记 ---
const PUBLIC_NOTES_DIR = path.join(ROOT, 'notes');
const publicItems = collectNotes(PUBLIC_NOTES_DIR, /\s*·\s*数字殿堂.*$/);
const placeholderPublic =
  '<div class="item"><span class="date">筹备中</span><span class="txt">第一篇手记撰写中<small>每天一篇 · 敬请期待</small></span></div>';

if (injectFeed(path.join(DIST, 'index.html'), 'notes-feed', renderFeedItems(publicItems, 'notes/', 12, placeholderPublic))) {
  console.log(`  首页手记列表已生成: ${Math.min(publicItems.length, 12)} 篇 (最新在前)`);
}
if (injectFeed(path.join(DIST, 'notes', 'index.html'), 'notes-list', renderFeedItems(publicItems, '', 0, placeholderPublic))) {
  console.log(`  手记频道列表已生成: ${publicItems.length} 篇 (最新在前)`);
}

// --- RSS (公开手记) ---
function rfc822(dateStr) {
  return new Date(`${dateStr}T08:00:00+08:00`).toUTCString();
}
function buildRss(items) {
  const itemXml = items
    .slice(0, 20)
    .map(
      (it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>https://shuzidiantang.com/notes/${it.file}</link>
      <guid>https://shuzidiantang.com/notes/${it.file}</guid>
      <pubDate>${rfc822(it.date)}</pubDate>
      <description>${escapeXml(it.desc)}</description>
    </item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>数字殿堂 · 手记</title>
    <link>https://shuzidiantang.com/</link>
    <description>馆主的手记与经验分享：每天一篇，记录作品开发与生活见闻。</description>
    <language>zh-CN</language>
    <lastBuildDate>${rfc822(new Date().toISOString().slice(0, 10))}</lastBuildDate>
${itemXml}
  </channel>
</rss>
`;
}
writeFileSync(path.join(DIST, 'feed.xml'), buildRss(publicItems));
console.log(`  RSS 已生成 → dist/feed.xml (${Math.min(publicItems.length, 20)} 条)`);

// --- sitemap 注入手记条目 ---
if (publicItems.length > 0) {
  const smFile = path.join(DIST, 'sitemap.xml');
  const sm = readFileSync(smFile, 'utf8');
  const entries = publicItems
    .map((it) => `  <url><loc>https://shuzidiantang.com/notes/${it.file}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
    .join('\n');
  writeFileSync(smFile, sm.replace('</urlset>', `${entries}\n</urlset>`));
  console.log(`  sitemap 已注入 ${publicItems.length} 条手记`);
}

// --- 暗室·投资研究 (同一套机制) ---
const investItems = collectNotes(
  path.join(ROOT, 'hidden', 'invest', 'notes'),
  /\s*·\s*(投资研究|数字殿堂).*/g,
);
if (injectFeed(
  path.join(DIST, 'hidden', 'invest', 'index.html'),
  'invest-notes',
  renderFeedItems(investItems, 'notes/', 0, '<div class="item"><span class="date">筹备中</span><span class="txt">第一期笔记撰写中<small>每周更新 · 敬请期待</small></span></div>'),
)) {
  console.log(`  投资研究笔记列表已生成: ${investItems.length} 篇 (最新在前)`);
}

console.log('\n✅ 组装完成 → dist/');
console.log('   本地预览：npx serve dist');
