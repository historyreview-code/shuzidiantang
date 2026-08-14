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
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MONOREPO = 'https://github.com/historyreview-code/digital-earth-series.git';
const CACHE = path.join(ROOT, '.cache', 'digital-earth-series');
const DIST = path.join(ROOT, 'dist');

const STATIC_PATHS = [
  'index.html', '404.html', 'robots.txt', 'sitemap.xml',
  'assets', 'games', 'novels', 'cosmos', 'maps', 'about',
];

function run(cmd, cwd = ROOT) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
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
run(`${pnpm} install --frozen-lockfile=false`, CACHE);
run(`${pnpm} --filter @digital-earth/portal build`, CACHE);

const portalDist = path.join(CACHE, 'apps', 'portal', 'dist');
if (!existsSync(portalDist)) {
  console.error('✗ 门户构建产物不存在：' + portalDist);
  process.exit(1);
}
cpSync(portalDist, path.join(DIST, 'earth'), { recursive: true });

console.log('\n✅ 组装完成 → dist/');
console.log('   本地预览：npx serve dist');
