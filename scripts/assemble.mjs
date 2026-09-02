#!/usr/bin/env node
/**
 * 数字殿堂 · 组装脚本
 * 把新版 Astro 主站与各作品的最新产物组装进 dist/，供 GitHub Pages / EdgeOne Pages 发布。
 *
 * 结构：
 *   Astro 主站                  → dist/**
 *   旧作品静态目录（本仓库）     → dist/**
 *   地球厅（digital-earth-series）→ 本地源码优先 + 按需刷新缓存 → dist/earth
 *
 * 用法：node scripts/assemble.mjs
 */
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MONOREPO = 'https://github.com/historyreview-code/digital-earth-series.git';
const CACHE = path.join(ROOT, '.cache', 'digital-earth-series');
const DIST = path.join(ROOT, 'dist');
const DEFAULT_LOCAL_EARTH_REPO = path.resolve(ROOT, '..', '数字地球系列');

const LEGACY_STATIC_PATHS = [
  'assets', 'games', 'cosmos', 'maps', 'novels',
];

function run(cmd, cwd = ROOT) {
  console.log(`\n$ ${cmd}`);
  // 独立缓存目录：绕开本机 npm 缓存被 root 属主污染的问题（EPERM）
  const env = {
    ...process.env,
    CI: process.env.CI || 'true',
    npm_config_cache: path.join(ROOT, '.cache', 'npm-cache'),
  };
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

function hasEarthPortal(repoDir) {
  return (
    existsSync(path.join(repoDir, 'package.json')) &&
    existsSync(path.join(repoDir, 'pnpm-workspace.yaml')) &&
    existsSync(path.join(repoDir, 'apps', 'portal', 'package.json'))
  );
}

function resolveEarthSource() {
  const explicitRepo = process.env.DIGITAL_EARTH_REPO ? path.resolve(process.env.DIGITAL_EARTH_REPO) : '';
  if (explicitRepo) {
    if (!hasEarthPortal(explicitRepo)) {
      console.error(`✗ DIGITAL_EARTH_REPO 不是有效的 digital-earth-series monorepo: ${explicitRepo}`);
      process.exit(1);
    }
    console.log(`  地球厅源码: ${explicitRepo} (DIGITAL_EARTH_REPO)`);
    return explicitRepo;
  }

  if (hasEarthPortal(DEFAULT_LOCAL_EARTH_REPO)) {
    console.log(`  地球厅源码: ${DEFAULT_LOCAL_EARTH_REPO} (本地同级目录)`);
    return DEFAULT_LOCAL_EARTH_REPO;
  }

  const shouldRefresh = process.env.DIGITAL_EARTH_REFRESH === '1';
  if (existsSync(path.join(CACHE, '.git'))) {
    if (shouldRefresh) {
      run('git pull --ff-only origin main', CACHE);
    } else {
      console.log(`  地球厅源码: ${CACHE} (缓存；设置 DIGITAL_EARTH_REFRESH=1 可刷新)`);
    }
    return CACHE;
  }

  if (hasEarthPortal(CACHE)) {
    console.log(`  地球厅源码: ${CACHE} (缓存源码)`);
    return CACHE;
  }

  mkdirSync(path.dirname(CACHE), { recursive: true });
  run(`git clone --depth 1 ${MONOREPO} ${CACHE}`);
  return CACHE;
}

function writePortalBuildConfig(portalApp) {
  const configDir = path.join(ROOT, '.cache', 'vite-config');
  mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'digital-earth-portal.mjs');
  const config = `import { defineConfig } from 'vite';

export default defineConfig({
  root: ${JSON.stringify(portalApp)},
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4176,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.split('\\\\').join('/');
          if (normalized.includes('/node_modules/three/')) return 'vendor-three';
          if (
            normalized.includes('/node_modules/globe.gl/') ||
            normalized.includes('/node_modules/three-globe/') ||
            normalized.includes('/node_modules/d3-') ||
            normalized.includes('/node_modules/topojson-')
          ) return 'vendor-globe';
          if (normalized.includes('/node_modules/')) return 'vendor';
          if (normalized.includes('/packages/core/')) return 'earth-core';
          if (normalized.includes('/packages/themes/universities/')) return 'theme-universities';
          if (normalized.includes('/packages/themes/heritage/')) return 'theme-heritage';
          if (normalized.includes('/packages/themes/f500/')) return 'theme-f500';
        },
      },
    },
  },
});
`;
  writeFileSync(configPath, config);
  return configPath;
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function writeBuildReport() {
  const assets = walkFiles(DIST)
    .filter((p) => /\.(js|css|html|xml|json|png|jpg|jpeg|webp|svg)$/i.test(p))
    .map((p) => {
      const bytes = statSync(p).size;
      return {
        path: path.relative(DIST, p).split(path.sep).join('/'),
        bytes,
        kb: Number((bytes / 1024).toFixed(1)),
      };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const report = {
    generatedAt: new Date().toISOString(),
    largestAssets: assets.slice(0, 20),
    jsOver500KB: assets.filter((a) => a.path.endsWith('.js') && a.bytes > 500 * 1024),
  };
  writeFileSync(path.join(DIST, 'build-report.json'), JSON.stringify(report, null, 2));

  if (report.jsOver500KB.length) {
    console.log('  大型 JS chunk 仍需关注:');
    for (const a of report.jsOver500KB) {
      console.log(`    - ${a.path} ${a.kb}KB`);
    }
  } else {
    console.log('  JS chunk 体检通过: 无超过 500KB 的单文件');
  }
  console.log('  构建体检报告已生成 → dist/build-report.json');
}

// 1. 新版主站：Astro 构建会清理并生成 dist/
run('npm run build:site');

// 1.5 复制旧作品静态目录。公开主站页面由 Astro 接管；旧游戏/天文/隐藏区先保持原路径可访问。
for (const p of LEGACY_STATIC_PATHS) {
  const src = path.join(ROOT, p);
  const dst = path.join(DIST, p);
  if (existsSync(src)) cpSync(src, dst, { recursive: true });
}

// 1.6 复制旧手记正文页和 og 图片，但不覆盖 Astro 生成的 /notes/index.html。
const legacyNotes = path.join(ROOT, 'notes');
const distNotes = path.join(DIST, 'notes');
if (existsSync(legacyNotes)) {
  mkdirSync(distNotes, { recursive: true });
  for (const f of readdirSync(legacyNotes)) {
    const src = path.join(legacyNotes, f);
    const dst = path.join(distNotes, f);
    if (f === 'index.html') continue;
    if (existsSync(src)) cpSync(src, dst, { recursive: true });
  }
}

// 1.8 天文馆内容站内化：cosmic-journey（宇宙之旅五部曲）+ cosmic-evolution（宇宙诞生演进短片）
//     复制构建产物进 dist/cosmos/{journey,evolution}/，放映厅 iframe 改站内相对路径，摆脱 github.io 外链。
const COSMIC_SOURCES = [
  {
    name: 'cosmic-journey', env: 'COSMIC_JOURNEY_REPO',
    repo: 'https://github.com/historyreview-code/cosmic-journey.git',
    local: path.resolve(ROOT, '..', 'cosmic-journey'), dst: 'journey',
    files: ['index.html', 'galaxy.html', 'cosmos.html', 'history.html', 'missions.html', 'audio'],
  },
  {
    name: 'cosmic-evolution', env: 'COSMIC_EVOLUTION_REPO',
    repo: 'https://github.com/historyreview-code/cosmic-evolution.git',
    local: path.resolve(ROOT, '..', 'cosmic-evolution'), dst: 'evolution',
    files: ['index.html', 'audio'],
  },
];

function resolveCosmicSource(cfg) {
  const explicitRepo = process.env[cfg.env] ? path.resolve(process.env[cfg.env]) : '';
  if (explicitRepo && existsSync(explicitRepo)) {
    console.log(`  天文馆·${cfg.name} 源码: ${explicitRepo} (${cfg.env})`);
    return explicitRepo;
  }
  if (existsSync(cfg.local)) {
    console.log(`  天文馆·${cfg.name} 源码: ${cfg.local} (本地同级目录)`);
    return cfg.local;
  }
  const cache = path.join(ROOT, '.cache', cfg.name);
  if (existsSync(path.join(cache, '.git'))) {
    run('git pull --ff-only origin main', cache);
    return cache;
  }
  mkdirSync(path.dirname(cache), { recursive: true });
  run(`git clone --depth 1 ${cfg.repo} ${cache}`);
  return cache;
}

for (const c of COSMIC_SOURCES) {
  try {
    const src = resolveCosmicSource(c);
    const dst = path.join(DIST, 'cosmos', c.dst);
    mkdirSync(dst, { recursive: true });
    for (const f of c.files) {
      const from = path.join(src, f);
      if (existsSync(from)) cpSync(from, path.join(dst, f), { recursive: true });
    }
    console.log(`  天文馆·${c.name} → dist/cosmos/${c.dst}`);
  } catch (e) {
    console.warn(`  ✗ 天文馆·${c.name} 站内化失败（放映厅将回退外链）: ${e.message}`);
  }
}

// 2. 地球厅：本地源码优先；没有本地源码时使用缓存/远程 clone，然后构建门户。
const earthSource = resolveEarthSource();
const portalApp = path.join(earthSource, 'apps', 'portal');
const pnpm = process.env.PNPM_CMD || 'npx --yes pnpm@9';
run(`${pnpm} install --frozen-lockfile=false --store-dir ${path.join(ROOT, '.cache', 'pnpm-store')}`, earthSource);
const portalBuildConfig = writePortalBuildConfig(portalApp);
console.log(`  地球厅 Vite 拆包配置已生成: ${path.relative(ROOT, portalBuildConfig)}`);
run(`${pnpm} exec tsc`, portalApp);
run(`${pnpm} exec vite build --config ${portalBuildConfig}`, portalApp);

const portalDist = path.join(portalApp, 'dist');
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
      cat: catMatch ? catMatch[1].replace(/\s*-->\s*$/, '').trim() : '',
      desc: descMatch ? descMatch[1].trim() : title,
    });
  }
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items;
}
function renderFeedItems(items, hrefPrefix, limit, placeholderHtml, opts = {}) {
  if (items.length === 0) return placeholderHtml;
  const shown = limit ? items.slice(0, limit) : items;
  return shown
    .map(
      (it) =>
        `<a class="item" href="${hrefPrefix}${it.file}"><span class="date">${it.date}</span><span class="txt">${escapeHtml(it.title)}${it.cat ? `<small>${escapeHtml(it.cat)}</small>` : ''}</span>${opts.withDesc && it.desc ? `<span class="desc">${escapeHtml(it.desc)}</span>` : ''}</a>`,
    )
    .join('\n      ');
}
function injectFeed(htmlFile, marker, html) {
  if (!existsSync(htmlFile)) return false;
  const t = readFileSync(htmlFile, 'utf8');
  const re = new RegExp(`<!-- AUTO:${marker} -->[\\s\\S]*?<!-- \\/AUTO:${marker} -->`);
  if (!re.test(t)) return false;
  const updated = t.replace(re, `<!-- AUTO:${marker} -->\n      ${html}\n      <!-- /AUTO:${marker} -->`);
  writeFileSync(htmlFile, updated);
  return true;
}

// 给手记页注入 og:image（朋友圈/微信链接卡片用）:
//   有专属配图 (notes/og/<slug>.png, 由 scripts/share.py 生成) 用专属图,
//   没有则回退全站品牌图。绝对 URL, 微信抓取更稳。
function injectOgImage(notesDistDir, file, stem) {
  const p = path.join(notesDistDir, file);
  if (!existsSync(p)) return false;
  let t = readFileSync(p, 'utf8');
  if (/property="og:image"/.test(t)) return false; // 已手动声明则尊重原文
  const img = existsSync(path.join(notesDistDir, 'og', stem + '.png'))
    ? `https://shuzidiantang.com/notes/og/${stem}.png`
    : 'https://shuzidiantang.com/assets/og/brand.png';
  const meta = [
    `<meta property="og:type" content="article">`,
    `<meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${img}">`,
  ].join('\n');
  // 锚点: meta description 之后; 没有 description 则插到 <meta charset 之后
  if (/<meta name="description"[^>]*>/i.test(t)) {
    t = t.replace(/<meta name="description"[^>]*>/i, (m) => m + '\n' + meta);
  } else {
    t = t.replace(/<meta charset="UTF-8"[^>]*>/i, (m) => m + '\n' + meta);
  }
  writeFileSync(p, t);
  return true;
}

// --- 公开手记 ---
const PUBLIC_NOTES_DIR = path.join(ROOT, 'notes');
const publicItems = collectNotes(PUBLIC_NOTES_DIR, /\s*·\s*(数字殿堂|劳伦斯在上海|劳伦斯实验室).*$/);
const placeholderPublic =
  '<div class="item"><span class="date">筹备中</span><span class="txt">第一篇手记撰写中<small>每天一篇 · 敬请期待</small></span></div>';

// 手记页 og:image 注入 (朋友圈/微信分享卡片)
{
  const distNotes = path.join(DIST, 'notes');
  let ogCount = 0;
  for (const it of publicItems) {
    const m = it.file.match(/^(\d{4}-\d{2}-\d{2}-.+)\.html$/);
    if (m && injectOgImage(distNotes, it.file, m[1])) ogCount++;
  }
  console.log(`  手记页 og:image 已注入: ${ogCount} 篇`);
}

if (injectFeed(path.join(DIST, 'index.html'), 'NOTES_FEED', renderFeedItems(publicItems, 'notes/', 12, placeholderPublic))) {
  console.log(`  首页手记列表已生成: ${Math.min(publicItems.length, 12)} 篇 (最新在前)`);
}
if (injectFeed(path.join(DIST, 'notes', 'index.html'), 'NOTES_LIST', renderFeedItems(publicItems, '', 0, placeholderPublic))) {
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
    <title>劳伦斯实验室 · 手记</title>
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
// 2026-09-01 起暗室移出公开仓库（本地备份 ~/数字殿堂-暗室备份/hidden），
// 待架构完善后以二级域名独立建设。仅当完整暗室（含 invest/index.html）回填时才注入；
// 晨报机器人每日重建的 hidden/invest/notes 不触发（缺 index.html）。
if (existsSync(path.join(ROOT, 'hidden', 'invest', 'index.html'))) {
const investItems = collectNotes(
  path.join(ROOT, 'hidden', 'invest', 'notes'),
  /\s*·\s*(投资研究|数字殿堂).*/g,
);
if (injectFeed(
  path.join(DIST, 'hidden', 'invest', 'index.html'),
  'INVEST_NOTES',
  renderFeedItems(investItems, 'notes/', 0, '<div class="item"><span class="date">筹备中</span><span class="txt">第一期笔记撰写中<small>每周更新 · 敬请期待</small></span></div>', { withDesc: true }),
)) {
  console.log(`  投资研究笔记列表已生成: ${investItems.length} 篇 (最新在前)`);
}

// --- 暗室·投资研究：首页统计 + RSS（子站独立宣传） ---
if (injectFeed(
  path.join(DIST, 'hidden', 'invest', 'index.html'),
  'INVEST_STATS',
  [
    `<div class="iv-stat"><b>${investItems.length}</b><span>研究笔记</span></div>`,
    `<div class="iv-stat"><b>${investItems.length ? investItems[0].date : '—'}</b><span>最近更新</span></div>`,
    `<div class="iv-stat"><b>${new Set(investItems.map((i) => i.cat).filter(Boolean)).size}</b><span>研究分类</span></div>`,
    `<div class="iv-stat"><b>每周</b><span>更新频率</span></div>`,
  ].join('\n      '),
)) {
  console.log(`  投资研究首页统计已注入: ${investItems.length} 篇`);
}

function buildInvestRss(items) {
  const itemXml = items
    .slice(0, 20)
    .map(
      (it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>https://shuzidiantang.com/hidden/invest/notes/${it.file}</link>
      <guid>https://shuzidiantang.com/hidden/invest/notes/${it.file}</guid>
      <pubDate>${rfc822(it.date)}</pubDate>
      <description>${escapeXml(it.desc)}</description>
    </item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>数字殿堂 · 投资研究（暗室）</title>
    <link>https://shuzidiantang.com/hidden/invest/</link>
    <description>馆主的个人投资学习与研究笔记：个股深度、板块全景、行业快评与每日晨报。仅限受邀访客，不构成投资建议。</description>
    <language>zh-CN</language>
    <lastBuildDate>${rfc822(new Date().toISOString().slice(0, 10))}</lastBuildDate>
${itemXml}
  </channel>
</rss>
`;
}
const investFeedPath = path.join(DIST, 'hidden', 'invest', 'feed.xml');
mkdirSync(path.dirname(investFeedPath), { recursive: true });
writeFileSync(investFeedPath, buildInvestRss(investItems));
console.log(`  投资研究 RSS 已生成 → dist/hidden/invest/feed.xml (${Math.min(investItems.length, 20)} 条)`);
} else {
console.log('  暗室已移出公开仓库，跳过投资研究注入（恢复：把备份回填 hidden/ 即可）');
}

// 4. 访问计数器注入 (Vercount 公共实例, 备案后可按 README ⑦ 换成自建)
//    给所有带 site-footer 的页面注入计数位 + 脚本; 暗室 hidden/ 不注入 (地址保密)。
function walkHtml(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
{
  let count = 0;
  for (const p of walkHtml(DIST)) {
    const rel = path.relative(DIST, p).split(path.sep).join('/');
    if (rel.startsWith('hidden/')) continue;
    let t = readFileSync(p, 'utf8');
    if (!t.includes('class="site-footer"') || t.includes('vercount_value_site_pv')) continue;
    const isArticle = /^notes\/\d{4}-\d{2}-\d{2}-.+\.html$/.test(rel);
    const pagePart = isArticle ? ' · 本文阅读 <b id="vercount_value_page_pv">—</b>' : '';
    const block =
      `<p class="counter"><span class="bits">0101</span> 全站浏览 <b id="vercount_value_site_pv">—</b>` +
      ` · 独立访客 <b id="vercount_value_site_uv">—</b>${pagePart} <span class="bits">1010</span></p>\n` +
      `<script defer src="https://events.vercount.one/js"></script>`;
    t = t.replace('</footer>', `${block}\n</footer>`);
    writeFileSync(p, t);
    count++;
  }
  console.log(`  访问计数器已注入: ${count} 页 (Vercount, hidden/ 跳过)`);
}

writeBuildReport();

console.log('\n✅ 组装完成 → dist/');
console.log('   本地预览：npm run preview -- --port 4321');
