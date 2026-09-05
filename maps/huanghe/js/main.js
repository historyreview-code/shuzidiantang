// 页面装配：英豪区、滚动叙事、交互探索、附录
import { createMap } from './map.js';
import { COURSES, DIKES, REFS, EVENTS, CHAPTERS, TABLE_ROWS, SOURCES, STATS, BREACHES } from './data.js';

const $ = s => document.querySelector(s);
const fmtYear = y => y < 0 ? `公元前${-y}年` : `公元${y}年`;

let scrollyMap, explorerMap;
const explorer = { playing: false, timer: null, atlas: false };

init();

async function init() {
  const fc = await fetch('data/china-provinces.geojson').then(r => r.json());
  scrollyMap = createMap($('#scrolly-map'), { wheelZoom: false });
  explorerMap = createMap($('#explorer-map'), { wheelZoom: true });
  scrollyMap.setBasemap(fc);
  explorerMap.setBasemap(fc);
  buildHero();
  buildScrolly();
  buildExplorer();
  buildAppendix();
}

// ---------- 英豪区 ----------
function buildHero() {
  $('#hero-stats').innerHTML = STATS.map(s =>
    `<div class="stat"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`
  ).join('');
}

// ---------- 滚动叙事 ----------
function buildScrolly() {
  const wrap = $('#steps');
  wrap.innerHTML = CHAPTERS.map((c, i) => `
    <div class="step" data-i="${i}">
      <div class="step-kicker"><span>${c.kicker}</span><span>${c.yearLabel}</span></div>
      <h3 class="step-title">${c.title}</h3>
      ${c.paragraphs.map(p => `<p>${p}</p>`).join('')}
    </div>`).join('');

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        wrap.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
        en.target.classList.add('active');
        scrollyMap.setChapter(CHAPTERS[+en.target.dataset.i]);
      }
    });
  }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
  wrap.querySelectorAll('.step').forEach(el => io.observe(el));

  // 首章
  scrollyMap.setChapter(CHAPTERS[0], { fly: false });

  // 调试/无渲染环境钩子：显式激活某一章（IntersectionObserver 在不渲染帧的环境里不触发）
  window.__activateStep = (i) => {
    const els = wrap.querySelectorAll('.step');
    els.forEach(el => el.classList.remove('active'));
    if (els[i]) els[i].classList.add('active');
    scrollyMap.setChapter(CHAPTERS[i]);
  };
}

// ---------- 交互探索 ----------
function buildExplorer() {
  const btns = $('#era-btns');
  btns.innerHTML = EVENTS.map((e, i) =>
    `<button class="era-btn" data-i="${i}"><span class="era-year">${e.yearLabel}</span><span class="era-short">${e.short}</span></button>`
  ).join('');
  btns.addEventListener('click', ev => {
    const b = ev.target.closest('.era-btn');
    if (b) stopPlay(), setEvent(+b.dataset.i, true);
  });

  const slider = $('#year-slider');
  slider.min = -800; slider.max = 2026; slider.value = 2026;
  slider.addEventListener('input', () => { stopPlay(); setYear(+slider.value); });

  // 刻度
  const min = -800, max = 2026;
  $('#slider-ticks').innerHTML = EVENTS.filter(e => e.year >= min).map(e =>
    `<span class="tick" style="left:${((e.year - min) / (max - min) * 100).toFixed(2)}%"><i></i>${e.yearLabel}</span>`
  ).join('');

  $('#btn-play').addEventListener('click', () => explorer.playing ? stopPlay() : play());
  $('#btn-atlas').addEventListener('click', () => {
    explorer.atlas = !explorer.atlas;
    $('#btn-atlas').classList.toggle('on', explorer.atlas);
    explorerMap.setAtlas(explorer.atlas);
    if (!explorer.atlas) setYear(+$('#year-slider').value);
  });
  $('#btn-view').addEventListener('click', () => explorerMap.flyTo([[112.2, 30.2], [121.8, 40.8]], 700));

  // 图层开关
  const toggles = [
    ['provinces', '省界'], ['refs', '参考水系'], ['dikes', '堤防'],
    ['breaches', '决口点'], ['cities', '城邑'], ['labels', '河名标注']
  ];
  $('#toggles').innerHTML = toggles.map(([k, label]) =>
    `<label class="chip"><input type="checkbox" data-k="${k}" checked><span>${label}</span></label>`
  ).join('');
  $('#toggles').addEventListener('change', ev => {
    const k = ev.target.dataset.k;
    if (!k) return;
    explorerMap.setToggle(k, ev.target.checked);
  });

  // 图例
  const legend = [
    ...COURSES.map(c => ({ color: c.color, name: c.name, sub: c.sub, span: spanText(c), cls: `course-${c.id}`, dash: !!c.dashes })),
    ...DIKES.map(d => ({ color: d.color, name: d.name, sub: d.sub, span: '1495—1855', cls: `dike-${d.id}`, dash: true })),
    ...REFS.map(r => ({ color: r.color, name: r.name, sub: '参考线', span: '今', cls: `ref-${r.id}`, dash: !!r.dashes }))
  ];
  $('#legend').innerHTML = legend.map(l => `
    <div class="legend-item" data-cls="${l.cls}">
      <span class="swatch" style="background:${l.color}"></span>
      <div><div class="legend-name">${l.name} <em>${l.span}</em></div><div class="legend-sub">${l.sub}</div></div>
    </div>`).join('');
  $('#legend').addEventListener('mouseover', ev => {
    const item = ev.target.closest('.legend-item');
    if (item) d3.select(`#explorer-map .${item.dataset.cls}`).classed('hover', true);
  });
  $('#legend').addEventListener('mouseout', ev => {
    const item = ev.target.closest('.legend-item');
    if (item) d3.select(`#explorer-map .${item.dataset.cls}`).classed('hover', false);
  });

  setEvent(EVENTS.length - 1, true);

  // 深链：?era=<事件id> 定位年代，&atlas=1 进入全览（便于分享某个历史时刻的视图）
  const q = new URLSearchParams(location.search);
  const eraIdx = EVENTS.findIndex(e => e.id === q.get('era'));
  if (eraIdx >= 0) setEvent(eraIdx, true);
  if (q.get('atlas')) {
    explorer.atlas = true;
    $('#btn-atlas').classList.add('on');
    explorerMap.setAtlas(true);
  }
}

function spanText(c) {
  const yr = y => y < 0 ? `前${-y}` : `${y}`;
  return c.spans.map(s => `${yr(s[0])}—${yr(s[1])}`).join('，');
}

function setEvent(i, fly = false) {
  const ev = EVENTS[i];
  $('#year-slider').value = Math.max(-800, ev.year);
  explorerMap.setYear(ev.year);
  if (fly) explorerMap.flyTo(ev.bbox, 800);
  const b = BREACHES.find(x => x.year === ev.year);
  if (b) explorerMap.pulse(b.id);
  updateCard(ev);
  markActiveBtn(i);
}

function setYear(y) {
  explorerMap.setYear(y);
  let idx = 0;
  EVENTS.forEach((e, i) => { if (e.year <= y) idx = i; });
  updateCard(EVENTS[idx]);
  markActiveBtn(idx);
}

function updateCard(ev) {
  $('#event-card').innerHTML = `
    <div class="card-era">${ev.yearLabel}</div>
    <div class="card-title">${ev.title}</div>
    <dl class="card-meta">
      <div><dt>决口</dt><dd>${ev.place}</dd></div>
      <div><dt>入海</dt><dd>${ev.mouth}</dd></div>
      <div><dt>行用</dt><dd>${ev.span}</dd></div>
      ${ev.nature ? `<div><dt>性质</dt><dd class="nature-${ev.nature}">${ev.nature}</dd></div>` : ''}
    </dl>
    <p class="card-brief">${ev.brief}</p>`;
}

function markActiveBtn(i) {
  document.querySelectorAll('.era-btn').forEach((b, j) => b.classList.toggle('active', j === i));
}

function play() {
  explorer.playing = true;
  $('#btn-play').textContent = '暂停';
  let i = 0;
  setEvent(0, true);
  const step = () => {
    explorer.timer = setTimeout(() => {
      i += 1;
      if (i >= EVENTS.length) { stopPlay(); return; }
      setEvent(i, true);
      step();
    }, 3600);
  };
  step();
}

function stopPlay() {
  if (!explorer.playing) { clearTimeout(explorer.timer); return; }
  explorer.playing = false;
  clearTimeout(explorer.timer);
  $('#btn-play').textContent = '播放两千年';
}

// ---------- 附录 ----------
function buildAppendix() {
  $('#table-body').innerHTML = TABLE_ROWS.map(r => `
    <tr>
      <td class="td-year">${r.year}<em>${r.era}</em></td>
      <td>${r.place}</td>
      <td>${r.mouth}</td>
      <td>${r.span}</td>
      <td><span class="tag tag-${r.nature}">${r.nature}</span></td>
    </tr>`).join('');
  $('#sources-list').innerHTML = SOURCES.map(s => `<li>${s}</li>`).join('');
}
