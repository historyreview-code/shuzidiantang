#!/usr/bin/env node
/**
 * 暗室·专题研究装配
 * 从创意编程探索源目录复制 4 份研究报告进 hidden/invest/research/，
 * 并给每个 HTML 注入免责横幅 + noindex。源目录可用 RESEARCH_SRC 覆盖。
 *
 * 用法：node scripts/copy-research.mjs
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.RESEARCH_SRC || '/Users/newclaw/创意编程探索';
const DST = path.join(ROOT, 'hidden', 'invest', 'research');

const ITEMS = [
  { id: 'airport', src: '机场行业投资研究', files: ['index.html'] },
  { id: 'zhongmian', src: path.join('中免封关研究', '驾驶舱'), files: ['dashboard.html', 'data'] },
  { id: 'laodeng', src: '老登股扫描', files: ['index.html', 'a-share.html', 'global.html', 'report.html'] },
  { id: 'musk', src: '马斯克投资研究', files: ['index.html', '太空算力.html'] },
];

const BANNER = [
  '<div class="rs-banner">',
  '  <a class="rs-back" href="/hidden/invest/research/">← 暗室 · 专题研究</a>',
  '  <span>⚠️ 馆主个人研究记录 · 仅供自用与朋友交流 · 不构成任何投资建议 · 请勿公开转发</span>',
  '</div>',
].join('\n');

function inject(file) {
  let t = readFileSync(file, 'utf8');
  if (t.includes('rs-banner')) return false;
  // head：注入样式 + noindex
  const headInjection = [
    '<meta name="robots" content="noindex, nofollow">',
    '<link rel="stylesheet" href="/hidden/invest/research-banner.css">',
  ].join('\n');
  if (/<head[^>]*>/i.test(t)) {
    t = t.replace(/<head[^>]*>/i, (m) => `${m}\n${headInjection}`);
  }
  // body：注入横幅
  if (/<body[^>]*>/i.test(t)) {
    t = t.replace(/<body[^>]*>/i, (m) => `${m}\n${BANNER}`);
  }
  writeFileSync(file, t);
  return true;
}

function walkHtml(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

mkdirSync(DST, { recursive: true });
for (const item of ITEMS) {
  const from = path.join(SRC, item.src);
  const to = path.join(DST, item.id);
  if (!existsSync(from)) {
    console.warn(`✗ 跳过 ${item.id}：源目录不存在 ${from}`);
    continue;
  }
  mkdirSync(to, { recursive: true });
  let injected = 0;
  for (const f of item.files) {
    const sf = path.join(from, f);
    if (!existsSync(sf)) continue;
    cpSync(sf, path.join(to, f), { recursive: true });
  }
  for (const h of walkHtml(to)) {
    if (inject(h)) injected++;
  }
  console.log(`✓ ${item.id} → hidden/invest/research/${item.id}/ (注入横幅 ${injected} 页)`);
}
