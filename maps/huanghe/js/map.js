// 地图组件工厂：滚动叙事图与交互探索图共用
// 依赖全局 d3（vendor/d3.min.js）与 js/data.js
import { COURSES, DIKES, REFS, LAKES, BREACHES, CITIES, PROV_LABELS, SEA_LABELS } from './data.js';

const GEO_VIEW = [[112.2, 30.2], [121.8, 40.8]]; // 地理视野范围
const COURSE_LABEL_POS = {
  yuhe: [114.72, 36.28], zhou602: [116.28, 37.42], han11: [116.60, 36.92],
  beiliu: [115.62, 38.02], dongliu: [117.16, 37.98], nan1128: [115.85, 35.18],
  duohuai: [116.58, 34.14], modern: [117.85, 37.12], fan1938a: [114.88, 33.12],
  fan1938b: [115.62, 33.52]
};

const lineGen = d3.line().curve(d3.curveCatmullRom.alpha(0.6));

// 减少动态：系统减弱动态偏好，或 ?instant=1（截图/低性能环境），跳过动画直设样式
const REDUCED = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  || new URLSearchParams(location.search).has('instant');
// go(sel, dur)：dur>0 且未减动态时返回 transition，否则返回原 selection（直设样式）
const go = (sel, dur) => (dur && !REDUCED ? sel.transition().duration(dur) : sel);

export function createMap(container, opts = {}) {
  const wheelZoom = opts.wheelZoom !== false; // 滚动叙事图禁用滚轮缩放，避免与页面滚动冲突
  let width = container.clientWidth || 800;
  let height = container.clientHeight || 600;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('display', 'block');

  const gZoom = svg.append('g');
  const gBasemap = gZoom.append('g');
  const gProvLabels = gZoom.append('g');
  const gRefs = gZoom.append('g');
  const gLakes = gZoom.append('g');
  const gDikes = gZoom.append('g');
  const gCourses = gZoom.append('g');
  const gBreaches = gZoom.append('g');
  const gCities = gZoom.append('g');
  const gCourseLabels = gZoom.append('g');
  const gCallout = gZoom.append('g');
  const gSeaLabels = gZoom.append('g');

  let projection = null;
  let path = null;
  let zoom = null;

  // 状态
  let state = {
    year: 2026,          // 探索模式当前年份
    mode: 'year',        // 'year' | 'chapter' | 'atlas'
    chapter: null,
    toggles: { provinces: true, refs: true, dikes: true, breaches: true, cities: true, labels: true },
    hovered: null
  };

  const tooltip = d3.select(container).append('div').attr('class', 'map-tip');

  function showTip(event, html) {
    const [mx, my] = d3.pointer(event, container);
    tooltip.html(html).style('opacity', 1)
      .style('left', Math.min(mx + 14, width - 180) + 'px')
      .style('top', (my + 14) + 'px');
  }
  function hideTip() { tooltip.style('opacity', 0); }

  // ---------- 绘制 ----------
  function render() {
    // 用 MultiPoint 定视野：球面几何无缠绕歧义（Polygon 会因环向被解释成反相全球面）
    const fc = { type: 'FeatureCollection', features: [{
      type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: [GEO_VIEW[0], GEO_VIEW[1]] }
    }]};
    projection = d3.geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], fc);
    path = d3.geoPath(projection);

    // 省界
    gBasemap.selectAll('path').data(basemapFeatures).join('path')
      .attr('d', path)
      .attr('class', 'prov');
    gProvLabels.selectAll('text').data(PROV_LABELS).join('text')
      .attr('class', 'prov-label')
      .attr('transform', d => `translate(${projection([d.x, d.y])})`)
      .text(d => d.name);
    gSeaLabels.selectAll('text').data(SEA_LABELS).join('text')
      .attr('class', 'sea-label')
      .attr('transform', d => `translate(${projection([d.x, d.y])})`)
      .text(d => d.name);

    // 参考水系
    gRefs.selectAll('path').data(REFS).join('path')
      .attr('class', d => `ref ref-${d.id}`)
      .attr('d', d => lineGen(d.points.map(projection)))
      .style('stroke', d => d.color)
      .style('stroke-width', d => d.width)
      .style('stroke-dasharray', d => d.dashes || null)
      .on('mousemove', (e, d) => showTip(e, `<b>${d.name}</b><span>${d.id === 'canal' ? '参考线：京杭大运河（元以后）' : '今淮河，1855年后经入江水道入长江'}</span>`))
      .on('mouseleave', hideTip);

    // 湖泊
    const lakeProj = LAKES.map(l => ({ ...l, proj: l.ring.map(projection) }));
    gLakes.selectAll('path').data(lakeProj).join('path')
      .attr('class', d => `lake lake-${d.id}`)
      .attr('d', d => lineGen(d.proj) + 'Z')
      .on('mousemove', (e, d) => showTip(e, `<b>${d.name}</b>`))
      .on('mouseleave', hideTip);

    // 堤防
    gDikes.selectAll('path').data(DIKES).join('path')
      .attr('class', d => `dike dike-${d.id}`)
      .attr('d', d => lineGen(d.points.map(projection)))
      .style('stroke', d => d.color)
      .on('mousemove', (e, d) => showTip(e, `<b>${d.name}</b><span>${d.sub}</span>`))
      .on('mouseleave', hideTip);

    // 河道
    gCourses.selectAll('path').data(COURSES).join('path')
      .attr('class', d => `course course-${d.id}`)
      .attr('d', d => lineGen(d.points.map(projection)))
      .style('stroke', d => d.color)
      .style('stroke-dasharray', d => d.dashes || null)
      .on('mousemove', function (e, d) {
        d3.select(this).raise().classed('hover', true);
        const spans = d.spans.map(s => `${yr(s[0])}—${yr(s[1])}`).join('，');
        showTip(e, `<b>${d.name}</b><span>${d.sub}</span><span>${spans}</span>`);
        if (state.onHover) state.onHover(d.id);
      })
      .on('mouseleave', function (e, d) {
        d3.select(this).classed('hover', false);
        hideTip();
        if (state.onHover) state.onHover(null);
      });

    // 河道名标注
    const labelData = COURSES.filter(c => COURSE_LABEL_POS[c.id])
      .map(c => ({ ...c, pos: projection(COURSE_LABEL_POS[c.id]) }));
    gCourseLabels.selectAll('text').data(labelData).join('text')
      .attr('class', d => `course-label cl-${d.id}`)
      .attr('transform', d => `translate(${d.pos})`)
      .style('fill', d => d.color)
      .text(d => d.name)
      .on('mousemove', (e, d) => showTip(e, `<b>${d.name}</b><span>${d.sub}</span>`))
      .on('mouseleave', hideTip);

    // 决口点
    gBreaches.selectAll('g').data(BREACHES).join('g')
      .attr('class', d => `breach breach-${d.id}`)
      .attr('transform', d => `translate(${projection([d.x, d.y])})`)
      .html(d => breachMark(d))
      .on('mousemove', (e, d) => showTip(e, `<b>${d.name}</b><span>${d.yearLabel} 决口</span>`))
      .on('mouseleave', hideTip);

    // 城邑
    gCities.selectAll('g').data(CITIES).join('g')
      .attr('class', d => `city tier${d.tier}`)
      .attr('transform', d => `translate(${projection([d.x, d.y])})`)
      .html(d => `<circle r="${d.tier === 1 ? 3 : 2.2}"></circle><text dx="6" dy="3.5">${d.name}</text>`);

    applyState(true);
  }

  function breachMark(d) {
    const labels = { e: [10, 4, 'start'], w: [-10, 4, 'end'], n: [0, -10, 'middle'] };
    const [dx, dy, anchor] = labels[d.anchor] || [10, 4, 'start'];
    return `<circle class="pulse" r="4"></circle><circle class="core" r="3.4"></circle>` +
      `<text class="breach-label" dx="${dx}" dy="${dy}" text-anchor="${anchor}">${d.name} ${d.yearLabel}</text>`;
  }

  // ---------- 状态应用 ----------
  function applyState(instant) {
    const t = state.toggles;
    const dur = instant ? 0 : 420;

    gBasemap.style('opacity', t.provinces ? 1 : 0);
    gProvLabels.style('opacity', t.labels && t.provinces ? 1 : 0);
    gRefs.style('opacity', t.refs ? 1 : 0);
    gSeaLabels.style('opacity', 1);

    // 湖泊：按章节/年代过滤
    const showLakes = new Set(state.mode === 'chapter' && state.chapter ? state.chapter.show.lakes : []);
    gLakes.style('opacity', 1);
    go(gLakes.selectAll('path'), dur)
      .style('opacity', d => (state.mode === 'chapter' ? (showLakes.has(d.id) ? 1 : 0) : (yearVisibleLake(d) ? 0.95 : 0)));

    // 堤防
    const dikeVisible = d => {
      if (!t.dikes) return 0;
      if (state.mode === 'chapter') return state.chapter && state.chapter.dike === d.id ? 0.95 : 0;
      return state.year >= 1495 ? 0.9 : 0;
    };
    go(gDikes.selectAll('path'), dur).style('opacity', dikeVisible);

    // 河道
    gCourses.selectAll('path').each(function (d) {
      const el = d3.select(this);
      const [op, w] = courseStyle(d);
      go(el, dur).style('opacity', op).style('stroke-width', (d.width || 2.4) * w);
      el.classed('ghost', op > 0 && op < 0.5);
    });
    go(gCourseLabels.selectAll('text'), dur)
      .style('opacity', function (d) { return courseStyle(d)[0] >= 0.9 && t.labels ? 1 : 0; });

    // 决口点
    const marks = new Set(state.mode === 'chapter' && state.chapter ? state.chapter.marks : []);
    gBreaches.style('opacity', t.breaches ? 1 : 0);
    go(gBreaches.selectAll('g'), dur).style('opacity', d => {
      if (state.mode === 'chapter') return marks.has(d.id) ? 1 : 0;
      return state.year >= d.year ? 1 : 0;
    });
    gCities.style('opacity', t.cities ? 1 : 0);

    // 叙事标注（callout）
    renderCallout(dur);
  }

  function yearVisibleLake(d) {
    if (d.id === 'daluze') return state.year < 700;
    if (d.id === 'hongze') return state.year >= 1194 || state.year >= 1938;
    if (d.id === 'dapinghu') return state.year >= 1855;
    return false;
  }

  // 河道在当前状态下的不透明度与宽度系数
  function courseStyle(d) {
    if (state.mode === 'atlas') return [0.95, 1];
    if (state.mode === 'chapter') {
      const ids = state.chapter ? state.chapter.courseIds : [];
      return ids.includes(d.id) ? [1, 1] : [0.13, 0.85];
    }
    // year 模式
    const on = d.spans.some(s => state.year >= s[0] && state.year <= s[1]);
    if (on) return [1, 1];
    const ended = d.spans.some(s => state.year > s[1]);
    if (ended) return [0.30, 0.75];
    return [0, 1];
  }

  function renderCallout(dur) {
    const c = state.mode === 'chapter' && state.chapter ? state.chapter.callout : null;
    const sel = gCallout.selectAll('g').data(c ? [c] : []);
    go(sel.exit(), dur).style('opacity', 0).remove();
    const enter = sel.enter().append('g').style('opacity', 0);
    enter.append('line').attr('class', 'callout-line');
    enter.append('circle').attr('r', 3).attr('class', 'callout-dot');
    const txt = enter.append('text').attr('class', 'callout-text');
    txt.append('tspan').attr('class', 't1').attr('x', 0);
    txt.append('tspan').attr('class', 't2').attr('x', 0).attr('dy', 14);
    enter.merge(sel).each(function (d) {
      const [px, py] = projection([d.x, d.y]);
      const [lx, ly] = [px + 46, py - 40];
      const g = d3.select(this);
      go(g, dur).style('opacity', 1);
      g.select('line').attr('x1', px).attr('y1', py).attr('x2', lx).attr('y2', ly + 8);
      g.select('circle').attr('cx', px).attr('cy', py);
      g.select('text').attr('transform', `translate(${lx + 6},${ly})`);
      g.select('.t1').text(d.name);
      g.select('.t2').text(d.text);
    });
  }

  // ---------- 相机 ----------
  function flyTo(bbox, duration = 900) {
    if (!projection) return;
    const [a, b] = bbox.map(p => projection(p));
    const dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]);
    const k = Math.max(1, Math.min(6, Math.min(width / dx, height / dy) * 0.86));
    const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
    const t = d3.zoomIdentity.translate(width / 2 - k * cx, height / 2 - k * cy).scale(k);
    if (REDUCED) { svg.call(zoom.transform, t); return; }
    svg.transition().duration(duration).ease(d3.easeCubicInOut).call(zoom.transform, t);
  }

  // ---------- 对外 API ----------
  const api = {
    setYear(year, { instant = false } = {}) {
      state.mode = 'year';
      state.year = year;
      applyState(instant);
    },
    setChapter(chapter, { fly = true } = {}) {
      state.mode = 'chapter';
      state.chapter = chapter;
      applyState(false);
      if (fly) api.flyTo(chapter.bbox);
    },
    setAtlas(on) {
      state.mode = on ? 'atlas' : 'year';
      if (on) flyTo(GEO_VIEW, 700);
      applyState(false);
    },
    flyTo,
    setToggle(k, v) { state.toggles[k] = v; applyState(false); },
    get mode() { return state.mode; },
    pulse(id) {
      if (REDUCED) return;
      const g = gBreaches.select(`.breach-${id}`);
      if (g.empty()) return;
      const p = g.select('.pulse');
      p.interrupt().attr('r', 4).attr('opacity', 0.85)
        .transition().duration(1100).ease(d3.easeCubicOut)
        .attr('r', 22).attr('opacity', 0)
        .on('end', function () { d3.select(this).attr('r', 4).attr('opacity', 0); });
    },
    onHover(fn) { state.onHover = fn; },
    resize() {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === width && h === height) return;
      width = w; height = h;
      svg.attr('viewBox', `0 0 ${width} ${height}`);
      render();
    }
  };

  // 底图数据由 index.html 以 fetch 预载后传入
  api.setBasemap = function (fc) {
    basemapFeatures = fc.features;
    zoom = d3.zoom().scaleExtent([1, 8])
      .filter(ev => wheelZoom ? (!ev.button) : (!ev.button && ev.type !== 'wheel'))
      .on('zoom', ev => gZoom.attr('transform', ev.transform));
    svg.call(zoom).on('dblclick.zoom', null);
    render();
    const ro = new ResizeObserver(() => api.resize());
    ro.observe(container);
  };

  let basemapFeatures = [];

  return api;
}

function yr(y) { return y < 0 ? `前${-y}年` : (y >= 2100 ? '今' : `${y}年`); }
