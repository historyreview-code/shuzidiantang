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
  'assets', 'games', 'cosmos', 'about', 'hidden',
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

// 3. 暗室·投资研究: 博客式列表自动生成
//    扫描 hidden/invest/notes/*.html, 按文件名日期倒序注入首页列表 (最新在上, 旧的自动下沉)
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function buildInvestNoteList() {
  const indexFile = path.join(DIST, 'hidden', 'invest', 'index.html');
  const notesDir = path.join(ROOT, 'hidden', 'invest', 'notes');
  if (!existsSync(indexFile)) return;

  let items = [];
  if (existsSync(notesDir)) {
    for (const f of readdirSync(notesDir).sort()) {
      if (!f.endsWith('.html')) continue;
      const m = f.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.html$/);
      if (!m) continue;
      const raw = readFileSync(path.join(notesDir, f), 'utf8');
      const titleMatch = raw.match(/<title>([^<]+)<\/title>/);
      const catMatch = raw.match(/分类[:：]\s*([^<]+)/);
      let title = titleMatch ? titleMatch[1].replace(/\s*·\s*(投资研究|数字殿堂).*/g, '').trim() : m[2];
      const cat = catMatch ? catMatch[1].trim() : '';
      items.push({ date: m[1], file: f, title, cat });
    }
  }
  items.sort((a, b) => (a.date < b.date ? 1 : -1));

  let html = '';
  if (items.length > 0) {
    html = items
      .map(
        (it) =>
          `<a class="item" href="notes/${it.file}"><span class="date">${it.date}</span><span class="txt">${escapeHtml(it.title)}${it.cat ? `<small>${escapeHtml(it.cat)}</small>` : ''}</span></a>`,
      )
      .join('\n      ');
  } else {
    html = '<div class="item"><span class="date">筹备中</span><span class="txt">第一期笔记撰写中<small>每周更新 · 敬请期待</small></span></div>';
  }

  const t = readFileSync(indexFile, 'utf8');
  const updated = t.replace(
    /(<div class="feed" id="invest-notes">)[\s\S]*?(<\/div>\s*<\/section>)/,
    `$1\n      ${html}\n    $2`,
  );
  if (updated !== t) {
    writeFileSync(indexFile, updated);
    console.log(`  投资研究笔记列表已生成: ${items.length} 篇 (最新在前)`);
  }
}
buildInvestNoteList();

console.log('\n✅ 组装完成 → dist/');
console.log('   本地预览：npx serve dist');
