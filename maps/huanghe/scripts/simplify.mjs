// 简化中国省界 GeoJSON：Douglas–Peucker 抽稀 + 去碎小岛
// 用法: node scripts/simplify.mjs [tolerance=0.02] [minArea=0.004]
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

// d3 球面多边形要求外环顺时针（与 RFC 7946 相反），需检测并重绕
const require = createRequire(import.meta.url);
const d3 = require('../vendor/d3.min.js');

function rewind(geometry) {
  if (geometry.type === 'Polygon') {
    return d3.geoArea(geometry) > 2 * Math.PI
      ? { type: 'Polygon', coordinates: geometry.coordinates.map(r => r.slice().reverse()) }
      : geometry;
  }
  if (geometry.type === 'MultiPolygon') {
    return { type: 'MultiPolygon', coordinates: geometry.coordinates.map(p =>
      d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI
        ? p.map(r => r.slice().reverse())
        : p) };
  }
  return geometry;
}

const SRC = new URL('../data/_raw/100000_full.json', import.meta.url);
const OUT = new URL('../data/china-provinces.geojson', import.meta.url);
const tol = parseFloat(process.argv[2] || '0.02');
const minArea = parseFloat(process.argv[3] || '0.004');

const gj = JSON.parse(readFileSync(SRC, 'utf8'));

function perpDist(p, a, b) {
  const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(x - cx, y - cy);
}

function dp(points, tol) {
  if (points.length <= 3) return points;
  let idx = -1, maxD = -1;
  const a = points[0], b = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], a, b);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [a, b];
  const left = dp(points.slice(0, idx + 1), tol);
  const right = dp(points.slice(idx), tol);
  return left.slice(0, -1).concat(right);
}

function ringArea(ring) {
  let s = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % n];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s / 2);
}

let ringsBefore = 0, ptsBefore = 0, ptsAfter = 0;

const features = gj.features.map(f => {
  const g = f.geometry;
  if (!g) return null;
  const walk = (geom) => {
    if (geom.type === 'Polygon') {
      geom.coordinates = geom.coordinates
        .map((ring, i) => {
          ringsBefore++; ptsBefore += ring.length;
          const s = dp(ring, tol);
          ptsAfter += s.length;
          return s.length >= 4 ? s : null;
        })
        .filter(Boolean)
        // 外环（i===0）保留，内环过小则剔除；外环过小整体丢弃
        .filter((ring, i) => i === 0 || ringArea(ring) > minArea);
      if (geom.coordinates.length === 0 || ringArea(geom.coordinates[0]) <= minArea) return null;
      return geom;
    }
    if (geom.type === 'MultiPolygon') {
      const polys = geom.coordinates
        .map(p => walk({ type: 'Polygon', coordinates: p }))
        .filter(Boolean)
        .map(p => p.coordinates);
      if (!polys.length) return null;
      return { type: 'MultiPolygon', coordinates: polys };
    }
    return geom;
  };
  const ng = rewind(walk(g));
  if (!ng) return null;
  return { ...f, geometry: ng };
}).filter(Boolean);

writeFileSync(OUT, JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`rings kept, points ${ptsBefore} -> ${ptsAfter}`);
const kb = (statSync(OUT).size / 1024).toFixed(0);
console.log(`written ${OUT.pathname} (${kb} KB)`);
