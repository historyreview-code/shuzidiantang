/* 纸上实验室 · 片头放映本体（外置脚本，全站共享浏览器缓存）
   由 BaseLayout 内联门控在「本会话首次访问 / ?intro=1 / ?freeze=秒」时动态加载；
   门控负责 sessionStorage、减弱动效判定与超时兜底，本文件只负责放映。
   Canvas 2D 零依赖。 */
(function () {
  var el = document.getElementById('paper-intro');
  var cv = document.getElementById('intro-cv');
  var ctx = cv && cv.getContext('2d');
  if (!el || !ctx) { document.body.classList.remove('intro-hold'); if (el && el.parentNode) el.remove(); return; }
  var OPTS = window.__INTRO_OPTS || {};
  var FREEZE = OPTS.freeze != null ? OPTS.freeze : null;
  window.__INTRO_BOOTED = true;
/* 纸上实验室：毛边纸窗里的纸上电影 ——
   纸窗光圈 → 一粒墨生根开花 → 速写本蒙太奇（站内六件作品）→ 墨画宫门 →
   推镜穿门 → 孔明灯灯夜 + 手写题字 → 升起交接首页。Canvas 2D 零依赖。 */
var sc = document.createElement('canvas');
var g = sc.getContext('2d');
var W = 0, H = 0, DPR = 1, MD = 0, CX = 0, CY = 0, RC = 0;

var PAPER = '#efe8da', INK = '#2a251c', INK_SOFT = '#4a4234',
    AMBER = '#b4551e', AMBER_L = '#d8893f', CINN = '#a83f2e', GOLD = '#d9a23f',
    SLATE = '#5d6b7a', PINE = '#5a7050', SAGE = '#7d8c6f',
    NIGHT1 = '#121724', NIGHT2 = '#080b13', BG = '#05070c', CREAM = '#f4ecd8';

// 分镜时间轴（秒，模拟时间推进）
var TL = {
  irisEnd: 0.70, growEnd: 3.05, montageEnd: 5.21, doorEnd: 6.61,
  zoomEnd: 7.21, flashEnd: 7.35, titleStart: 8.30, nightEnd: 11.05, done: 11.85
};
var CARDS_T = []; for (var ci = 0; ci <= 6; ci++) CARDS_T.push(3.05 + ci * 0.36);
var SPLICES = [TL.growEnd]; // 幕间接片黑帧

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
function norm(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
function lerp(a, b, k) { return a + (b - a) * k; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t) { return t * t * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOutBack(t) { var c = 1.70158; t -= 1; return t * t * ((c + 1) * t + c) + 1; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var TAU = Math.PI * 2;

var paperTile = null, vig = null, grains = [], masks = [], world = {}, tree = null;

function makePaperTile() {
  var s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  var pc = c.getContext('2d'), rnd = mulberry32(7);
  pc.fillStyle = PAPER; pc.fillRect(0, 0, s, s);
  for (var i = 0; i < 2600; i++) {
    var v = rnd();
    pc.fillStyle = v < 0.5 ? 'rgba(120,105,80,' + (0.02 + rnd() * 0.04) + ')' : 'rgba(255,252,244,' + (0.02 + rnd() * 0.04) + ')';
    pc.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 1.6, 1 + rnd() * 1.6);
  }
  pc.strokeStyle = 'rgba(140,125,95,0.05)'; pc.lineWidth = 1;
  for (i = 0; i < 14; i++) {
    pc.beginPath();
    var x0 = rnd() * s, y0 = rnd() * s;
    pc.moveTo(x0, y0);
    pc.quadraticCurveTo(x0 + (rnd() - 0.5) * 60, y0 + (rnd() - 0.5) * 60, x0 + (rnd() - 0.5) * 90, y0 + (rnd() - 0.5) * 90);
    pc.stroke();
  }
  paperTile = c;
}
function makeGrains() {
  for (var i = 0; i < 8; i++) {
    var s = 180, c = document.createElement('canvas'); c.width = c.height = s;
    var gc = c.getContext('2d'), id = gc.createImageData(s, s), d = id.data;
    for (var p = 0; p < d.length; p += 4) {
      var v = 40 + Math.random() * 175 | 0;
      d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = Math.random() < 0.55 ? 0 : 34;
    }
    gc.putImageData(id, 0, 0); grains.push(c);
  }
}
function makeVignette() {
  vig = document.createElement('canvas'); vig.width = 320; vig.height = 320;
  var vc = vig.getContext('2d');
  var gr = vc.createRadialGradient(160, 160, 70, 160, 160, 235);
  gr.addColorStop(0, 'rgba(8,7,5,0)'); gr.addColorStop(1, 'rgba(8,7,5,0.30)');
  vc.fillStyle = gr; vc.fillRect(0, 0, 320, 320);
}
// 毛边圆形纸窗遮罩 ×3（逐帧轮换 = 胶片片门爬边）
function makeMasks() {
  masks = [];
  for (var m = 0; m < 3; m++) {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var mc = c.getContext('2d'), rnd = mulberry32(100 + m * 17);
    var ph1 = rnd() * TAU, ph2 = rnd() * TAU;
    mc.beginPath();
    var steps = 160;
    for (var k = 0; k <= steps; k++) {
      var a = k / steps * TAU;
      var rr = RC * (1 + 0.013 * Math.sin(9 * a + ph1) + 0.009 * Math.sin(23 * a + ph2) + (rnd() - 0.5) * 0.006);
      var x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr;
      k === 0 ? mc.moveTo(x, y) : mc.lineTo(x, y);
    }
    mc.closePath();
    mc.fillStyle = '#fff'; mc.fill();
    mc.globalCompositeOperation = 'destination-out';
    for (var n = 0; n < 10; n++) {
      var an = rnd() * TAU;
      mc.beginPath();
      mc.arc(CX + Math.cos(an) * RC * 1.004, CY + Math.sin(an) * RC * 1.004, 1 + rnd() * 2.2, 0, TAU);
      mc.fill();
    }
    masks.push(c);
  }
}
// 生成树（单位长度，之后按 RC 缩放）：短干 + 主枝横展的宽冠
function genTree(seed) {
  var rnd = mulberry32(seed), branches = [], tips = [];
  function branch(x, y, ang, len, w, depth) {
    var x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
    branches.push({ x0: x, y0: y, x1: x1, y1: y1, w: w, d: depth, j: (rnd() - 0.5) * 0.10 });
    if (depth >= 7 || len < 0.045) { tips.push({ x: x1, y: y1, d: depth, r: rnd() }); return; }
    var n = depth === 0 ? 3 : (rnd() < 0.7 ? 2 : 3);
    for (var i = 0; i < n; i++) {
      var spread = (depth < 2 ? 0.85 : 0.62) + rnd() * 0.38;
      var na = ang + (i - (n - 1) / 2) * spread + (rnd() - 0.5) * 0.26;
      if (depth === 0) na = na * 0.9 + (-Math.PI / 2) * 0.1;
      branch(x1, y1, na, len * (0.66 + rnd() * 0.14), w * 0.64, depth + 1);
    }
  }
  branch(0, 0, -Math.PI / 2, 0.22, 1, 0);
  var roots = [];
  function root(x, y, ang, len, w, depth) {
    var x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
    roots.push({ x0: x, y0: y, x1: x1, y1: y1, w: w, d: depth });
    if (depth >= 3 || len < 0.04) return;
    for (var i = 0; i < 2; i++) {
      var na = ang + (i - 0.5) * (0.5 + rnd() * 0.3) + (rnd() - 0.5) * 0.3;
      na = na * 0.8 + (Math.PI / 2) * 0.2;
      root(x1, y1, na, len * (0.62 + rnd() * 0.15), w * 0.62, depth + 1);
    }
  }
  for (var r = 0; r < 4; r++) root(0, 0, Math.PI / 2 + (r - 1.5) * 0.55 + (rnd() - 0.5) * 0.2, 0.13, 0.8, 0);
  return { branches: branches, tips: tips, roots: roots };
}
function buildWorld() {
  var rnd = mulberry32(20260903), i;
  world.stars = [];
  for (i = 0; i < 46; i++) world.stars.push({ x: rnd(), y: rnd() * 0.62, r: 0.6 + rnd() * 1.3, ph: rnd() * TAU, sp: 0.6 + rnd() * 1.4 });
  var FAR = ['#8a4a3e', '#a06a3a', '#8f7a4a', '#7a4a4a'];
  var MID = ['#c96a5e', '#d8893f', '#c9a04a', '#c0705a'];
  var NEAR = ['#d97a5f', '#e09a58', '#cc6a66'];
  world.lanterns = [];
  for (i = 0; i < 7; i++) world.lanterns.push({ x: 0.06 + rnd() * 0.88, y: 0.10 + rnd() * 0.40, s: 0.009 + rnd() * 0.004, col: FAR[i % 4], a: 0.38 + rnd() * 0.16, ph: rnd() * TAU, drift: 0.05 + rnd() * 0.06, sw: 0.008 + rnd() * 0.010 });
  for (i = 0; i < 6; i++) world.lanterns.push({ x: 0.08 + rnd() * 0.84, y: 0.18 + rnd() * 0.34, s: 0.017 + rnd() * 0.007, col: MID[i % 4], a: 0.58 + rnd() * 0.18, ph: rnd() * TAU, drift: 0.06 + rnd() * 0.05, sw: 0.012 + rnd() * 0.010 });
  for (i = 0; i < 4; i++) world.lanterns.push({ x: [0.20, 0.44, 0.66, 0.86][i] + (rnd() - 0.5) * 0.06, y: [0.36, 0.16, 0.42, 0.28][i], s: [0.028, 0.023, 0.032, 0.025][i], col: NEAR[i % 3], a: 0.72 + rnd() * 0.12, ph: rnd() * TAU, drift: 0.07 + rnd() * 0.04, sw: 0.016 + rnd() * 0.010 });
  world.swirls = [];
  for (i = 0; i < 3; i++) {
    var pts = [], rr = 0.02 + rnd() * 0.02, aa = rnd() * TAU;
    for (var q = 0; q < 40; q++) pts.push({ a: aa + q * 0.24, r: rr + q * 0.0035 });
    world.swirls.push({ x: 0.18 + rnd() * 0.64, y: 0.16 + rnd() * 0.4, pts: pts, rot: rnd() * TAU, sp: (rnd() - 0.5) * 0.05 });
  }
  world.houses = [
    { x: 0.30, w: 0.075, h: 0.075, roof: 'tri', win: [{ dx: -0.2, dy: 0.6, s: 0.13, ph: 1.2, on: true }, { dx: 0.22, dy: 0.45, s: 0.11, ph: 3.7, on: true }] },
    { x: 0.44, w: 0.055, h: 0.058, roof: 'tri', win: [{ dx: 0, dy: 0.58, s: 0.13, ph: 2.4, on: true }] },
    { x: 0.565, w: 0.064, h: 0.08, roof: 'round', win: [{ dx: -0.05, dy: 0.55, s: 0.12, ph: 0.6, on: true }] },
    { x: 0.90, w: 0.05, h: 0.052, roof: 'tri', win: [{ dx: 0, dy: 0.6, s: 0.12, ph: 4.2, on: true }] }
  ];
  world.trees = [{ x: 0.36, r: 0.038 }, { x: 0.51, r: 0.030 }, { x: 0.66, r: 0.042 }, { x: 0.78, r: 0.034 }];
}

function paperBg() {
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.fillStyle = g.createPattern(paperTile, 'repeat'); g.fillRect(0, 0, W, H);
}
function inkLine(x0, y0, x1, y1, w, col) {
  g.strokeStyle = col || INK; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
}

// ---------- S0+S1 生长 ----------
function drawGrow(t) {
  paperBg();
  var local = norm(t, TL.irisEnd * 0.6, TL.growEnd);
  var gx = CX, gy = CY + RC * 0.34;
  var scl = RC * 1.9;
  var kl = easeOutCubic(norm(local, 0, 0.08));
  if (kl > 0) {
    g.strokeStyle = INK; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(gx - RC * 0.86 * kl, gy);
    g.quadraticCurveTo(gx, gy + 2, gx + RC * 0.86 * kl, gy); g.stroke();
  }
  var ks = norm(local, 0.02, 0.14);
  if (ks > 0 && ks < 1) {
    var sy = lerp(gy - RC * 0.9, gy, easeInCubic(ks));
    g.fillStyle = INK_SOFT;
    g.beginPath(); g.ellipse(gx, sy, 5, 7, 0.3, 0, TAU); g.fill();
  }
  var seedA = norm(local, 0.14, 0.3);
  if (ks >= 1 && seedA < 1) {
    g.globalAlpha = 1 - seedA; g.fillStyle = INK_SOFT;
    g.beginPath(); g.ellipse(gx, gy, 5, 7, 0.3, 0, TAU); g.fill();
    g.globalAlpha = 1;
  }
  var i, b;
  for (i = 0; i < tree.roots.length; i++) {
    b = tree.roots[i];
    var kr = easeOutCubic(norm(local, 0.14 + b.d * 0.055, 0.14 + b.d * 0.055 + 0.16));
    if (kr <= 0) continue;
    inkLine(gx + b.x0 * scl, gy + b.y0 * scl * 0.8, gx + lerp(b.x0, b.x1, kr) * scl, gy + lerp(b.y0, b.y1, kr) * scl * 0.8,
      Math.max(0.8, (4 - b.d) * 1.1 * b.w), 'rgba(74,66,52,0.75)');
  }
  for (i = 0; i < tree.branches.length; i++) {
    b = tree.branches[i];
    var birth = 0.16 + b.d * 0.058;
    var kb = easeOutCubic(norm(local, birth, birth + 0.18));
    if (kb <= 0) continue;
    var mx = lerp(b.x0, b.x1, kb), my = lerp(b.y0, b.y1, kb);
    var jx = b.j * scl * 0.12;
    g.strokeStyle = '#3a3227'; g.lineCap = 'round';
    g.lineWidth = Math.max(0.9, (8 - b.d) * 1.15 * b.w);
    g.beginPath(); g.moveTo(gx + b.x0 * scl, gy + b.y0 * scl);
    g.quadraticCurveTo(gx + (b.x0 + mx) / 2 * scl + jx, gy + (b.y0 + my) / 2 * scl, gx + mx * scl, gy + my * scl);
    g.stroke();
  }
  var rndL = mulberry32(88);
  for (i = 0; i < tree.tips.length; i++) {
    var tp = tree.tips[i];
    var tb = 0.42 + tp.d * 0.030 + tp.r * 0.13;
    var kp = easeOutBack(norm(local, tb, tb + 0.16));
    if (kp <= 0) continue;
    var tx = gx + tp.x * scl, ty = gy + tp.y * scl;
    var nLeaf = 6, baseR = RC * 0.068 * (0.8 + tp.r * 0.5);
    for (var lfi = 0; lfi < nLeaf; lfi++) {
      var la = rndL() * TAU, lr = baseR * (0.3 + rndL() * 0.8);
      var lx = tx + Math.cos(la) * lr, ly = ty + Math.sin(la) * lr * 0.8;
      var ls = baseR * (0.55 + rndL() * 0.6) * kp;
      g.save(); g.translate(lx, ly); g.rotate(la + 0.6);
      g.fillStyle = rndL() < 0.55 ? PINE : (rndL() < 0.75 ? SAGE : SLATE);
      g.globalAlpha = Math.min(1, kp * 1.3) * 0.92;
      g.beginPath(); g.ellipse(0, 0, ls, ls * 0.55, 0, 0, TAU); g.fill();
      g.restore();
    }
  }
  var rndF = mulberry32(99);
  for (i = 0; i < tree.tips.length; i++) {
    var tf = tree.tips[i];
    if (tf.r < 0.38) continue;
    var fb = 0.60 + tf.r * 0.22;
    var kf = easeOutBack(norm(local, fb, fb + 0.16));
    if (kf <= 0) continue;
    var fx = gx + tf.x * scl + (rndF() - 0.5) * RC * 0.05, fy = gy + tf.y * scl + (rndF() - 0.5) * RC * 0.05;
    var fr = RC * 0.016 * kf;
    g.globalAlpha = Math.min(1, kf * 1.4);
    g.fillStyle = rndF() < 0.5 ? AMBER_L : (rndF() < 0.75 ? AMBER : CINN);
    for (var pti = 0; pti < 5; pti++) {
      var pa = pti / 5 * TAU - Math.PI / 2;
      g.beginPath(); g.arc(fx + Math.cos(pa) * fr * 1.15, fy + Math.sin(pa) * fr * 1.15, fr, 0, TAU); g.fill();
    }
    g.fillStyle = GOLD;
    g.beginPath(); g.arc(fx, fy, fr * 0.7, 0, TAU); g.fill();
    g.globalAlpha = 1;
  }
  if (local > 0.86) {
    var rndP = mulberry32(55);
    for (i = 0; i < 3; i++) {
      var pk = norm(local, 0.86 + i * 0.03, 1.05);
      if (pk <= 0 || pk >= 1) continue;
      var px0 = gx + (rndP() - 0.5) * RC * 0.9, py0 = gy - RC * (0.5 + rndP() * 0.5);
      var px = px0 + Math.sin(pk * 9 + i * 2) * RC * 0.05, py = py0 + pk * RC * 0.55;
      g.globalAlpha = (1 - pk) * 0.9;
      g.fillStyle = i === 1 ? CINN : AMBER_L;
      g.save(); g.translate(px, py); g.rotate(pk * 5 + i);
      g.beginPath(); g.ellipse(0, 0, RC * 0.014, RC * 0.008, 0, 0, TAU); g.fill();
      g.restore(); g.globalAlpha = 1;
    }
  }
}

// ---------- S2 速写本蒙太奇（站内六件作品） ----------
function drawCardGlobe() {
  var r = RC * 0.46;
  g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  g.save(); g.beginPath(); g.arc(0, 0, r * 0.985, 0, TAU); g.clip();
  g.lineWidth = 1.6;
  var i;
  for (i = -2; i <= 2; i++) {
    g.beginPath(); g.ellipse(0, 0, Math.abs(r * Math.sin(i * 0.5)) + 0.01, r, 0, 0, TAU);
    g.strokeStyle = 'rgba(42,37,28,0.75)'; g.stroke();
  }
  for (i = -2; i <= 2; i++) {
    var yy = i * r * 0.36;
    g.beginPath(); g.ellipse(0, yy, r * Math.sqrt(Math.max(0.05, 1 - (yy / r) * (yy / r))), r * 0.16, 0, 0, TAU);
    g.strokeStyle = 'rgba(42,37,28,0.5)'; g.stroke();
  }
  g.restore();
  var rnd = mulberry32(4);
  for (i = 0; i < 6; i++) {
    var a = rnd() * TAU, rr = r * (0.25 + rnd() * 0.6);
    g.fillStyle = i % 2 ? AMBER : AMBER_L;
    g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.8, RC * 0.012, 0, TAU); g.fill();
  }
}
function drawCardShichen() {
  var r = RC * 0.44, i;
  g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  g.lineWidth = 1.5;
  g.beginPath(); g.arc(0, 0, r * 0.72, 0, TAU); g.stroke();
  for (i = 0; i < 12; i++) {
    var a = i / 12 * TAU - Math.PI / 2;
    var long = i % 3 === 0;
    inkLine(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72, Math.cos(a) * r * (long ? 0.98 : 0.88), Math.sin(a) * r * (long ? 0.98 : 0.88), long ? 3 : 1.6);
  }
  var a0 = 7 / 12 * TAU - Math.PI / 2, a1 = 8 / 12 * TAU - Math.PI / 2;
  g.fillStyle = 'rgba(184,85,30,0.20)';
  g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r * 0.70, a0, a1); g.closePath(); g.fill();
  inkLine(0, 0, Math.cos((a0 + a1) / 2) * r * 0.62, Math.sin((a0 + a1) / 2) * r * 0.62, 3, AMBER);
  g.fillStyle = AMBER; g.beginPath(); g.arc(0, 0, RC * 0.018, 0, TAU); g.fill();
}
function drawCardClay() {
  function blob(x, y, s, col, ears) {
    g.fillStyle = 'rgba(93,107,122,0.16)';
    g.beginPath(); g.ellipse(x, y + s * 0.95, s * 1.05, s * 0.18, 0, 0, TAU); g.fill();
    g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(x, y, s, s * 0.86, 0, 0, TAU); g.fill(); g.stroke();
    if (ears === 'round') {
      g.beginPath(); g.arc(x - s * 0.55, y - s * 0.72, s * 0.30, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.arc(x + s * 0.55, y - s * 0.72, s * 0.30, 0, TAU); g.fill(); g.stroke();
    } else if (ears === 'long') {
      g.beginPath(); g.ellipse(x - s * 0.3, y - s * 1.15, s * 0.16, s * 0.55, -0.15, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(x + s * 0.3, y - s * 1.15, s * 0.16, s * 0.55, 0.15, 0, TAU); g.fill(); g.stroke();
    }
    g.strokeStyle = 'rgba(244,236,216,0.55)'; g.lineWidth = 3;
    g.beginPath(); g.arc(x - s * 0.15, y - s * 0.1, s * 0.55, Math.PI * 1.15, Math.PI * 1.55); g.stroke();
    g.fillStyle = INK;
    g.beginPath(); g.arc(x - s * 0.25, y - s * 0.05, s * 0.055, 0, TAU); g.fill();
    g.beginPath(); g.arc(x + s * 0.25, y - s * 0.05, s * 0.055, 0, TAU); g.fill();
  }
  blob(-RC * 0.30, RC * 0.06, RC * 0.15, '#b4703f', 'round');
  blob(0, RC * 0.02, RC * 0.17, '#a8643c', 'long');
  blob(RC * 0.31, RC * 0.10, RC * 0.115, '#8c5a3c', null);
}
function drawCardMap() {
  g.strokeStyle = 'rgba(93,107,122,0.6)'; g.lineWidth = 2;
  var i;
  for (i = 0; i < 2; i++) {
    g.beginPath(); g.moveTo(-RC * 0.55, -RC * (0.05 - i * 0.14));
    g.bezierCurveTo(-RC * 0.2, -RC * (0.30 - i * 0.14), RC * 0.15, RC * (0.18 + i * 0.14), RC * 0.55, -RC * (0.02 - i * 0.14));
    g.stroke();
  }
  function pin(x, y, s, col) {
    g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y - s * 0.6, s * 0.55, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - s * 0.42, y - s * 0.35); g.lineTo(x, y + s * 0.45); g.lineTo(x + s * 0.42, y - s * 0.35); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = PAPER; g.beginPath(); g.arc(x, y - s * 0.6, s * 0.2, 0, TAU); g.fill();
  }
  var ax = -RC * 0.28, ay = RC * 0.24, bx = RC * 0.30, by = -RC * 0.20;
  g.strokeStyle = INK; g.lineWidth = 2.5; g.setLineDash([7, 6]);
  g.beginPath(); g.moveTo(ax, ay);
  g.bezierCurveTo(ax + RC * 0.2, ay - RC * 0.35, bx - RC * 0.3, by + RC * 0.3, bx, by);
  g.stroke(); g.setLineDash([]);
  pin(ax, ay, RC * 0.055, AMBER);
  pin(bx, by, RC * 0.055, CINN);
  g.strokeStyle = INK; g.lineWidth = 1.6;
  var nx = RC * 0.42, ny = RC * 0.34;
  g.beginPath(); g.arc(nx, ny, RC * 0.045, 0, TAU); g.stroke();
  inkLine(nx, ny + RC * 0.03, nx, ny - RC * 0.03, 2, AMBER);
}
function drawCardCad() {
  var hw = RC * 0.26, hh = RC * 0.20, bx = -RC * 0.06, by = RC * 0.02;
  g.strokeStyle = INK; g.lineWidth = 2.2;
  g.strokeRect(bx - hw, by - hh, hw * 2, hh * 2);
  g.beginPath(); g.moveTo(bx - hw, by - hh); g.lineTo(bx, by - hh * 1.7); g.lineTo(bx + hw, by - hh); g.stroke();
  var vx = RC * 0.42, vy = by - RC * 0.10;
  [[bx - hw, by - hh], [bx + hw, by - hh], [bx + hw, by + hh], [bx - hw, by + hh], [bx, by - hh * 1.7]].forEach(function (p) {
    g.strokeStyle = 'rgba(42,37,28,0.4)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(vx, vy); g.stroke();
  });
  g.fillStyle = 'rgba(93,107,122,0.25)';
  g.fillRect(bx - hw + 6, by - hh + 6, hw * 0.7, hh * 0.8);
  var dy = by + hh + RC * 0.07;
  inkLine(bx - hw, dy, bx + hw, dy, 1.4, INK_SOFT);
  inkLine(bx - hw, dy - 5, bx - hw, dy + 5, 1.4, INK_SOFT);
  inkLine(bx + hw, dy - 5, bx + hw, dy + 5, 1.4, INK_SOFT);
  var ty = RC * 0.36, tx0 = -RC * 0.30, tx1 = RC * 0.30;
  inkLine(tx0, ty, tx1, ty, 3, INK);
  for (var i = 0; i < 4; i++) inkLine(lerp(tx0, tx1, i / 3), ty - 5, lerp(tx0, tx1, i / 3), ty + 5, 2, INK_SOFT);
  g.fillStyle = AMBER; g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.arc(lerp(tx0, tx1, 0.62), ty, RC * 0.026, 0, TAU); g.fill(); g.stroke();
}
function drawCardLattice() {
  var r = RC * 0.44;
  g.strokeStyle = INK; g.lineWidth = 3;
  g.strokeRect(-r, -r, r * 2, r * 2);
  var i, n = 4;
  g.lineWidth = 1.8;
  for (i = 1; i < n; i++) {
    var p = -r + (i / n) * r * 2;
    inkLine(p, -r, p, r, 1.8); inkLine(-r, p, r, p, 1.8);
  }
  g.strokeStyle = 'rgba(42,37,28,0.35)'; g.lineWidth = 1;
  for (i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      if ((i + j) % 2) continue;
      var x0 = -r + (i / n) * r * 2, y0 = -r + (j / n) * r * 2, s = r * 2 / n;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + s, y0 + s); g.stroke();
      g.beginPath(); g.moveTo(x0 + s, y0); g.lineTo(x0, y0 + s); g.stroke();
    }
  }
  g.strokeStyle = AMBER; g.lineWidth = 2.5;
  var s0 = r * 0.16;
  g.beginPath();
  g.moveTo(-s0, -s0); g.lineTo(s0, -s0); g.lineTo(s0, s0); g.lineTo(-s0, s0); g.closePath();
  g.moveTo(-s0 * 0.5, -s0 * 0.5); g.lineTo(s0 * 0.5, -s0 * 0.5); g.lineTo(s0 * 0.5, s0 * 0.15); g.lineTo(-s0 * 0.1, s0 * 0.15);
  g.stroke();
}
var CARD_FNS = [drawCardGlobe, drawCardShichen, drawCardClay, drawCardMap, drawCardCad, drawCardLattice];
function drawMontage(t) {
  paperBg();
  var idx = 0;
  for (var i = 0; i < 6; i++) if (t >= CARDS_T[i]) idx = i;
  var local = norm(t, CARDS_T[idx], CARDS_T[idx] + 0.36);
  var pop = 0.94 + 0.06 * easeOutCubic(norm(local, 0, 0.22));
  g.save(); g.translate(CX, CY); g.scale(pop, pop);
  CARD_FNS[idx]();
  g.restore();
}

// ---------- S3 墨画宫门 ----------
function drawDoorScene(t, glowBoost) {
  paperBg();
  var local = norm(t, TL.montageEnd + 0.06, TL.doorEnd - 0.42);
  var glow = norm(t, TL.doorEnd - 0.48, TL.doorEnd);
  glow = Math.max(glow, glowBoost || 0);
  var dy = RC * 0.06, u = RC;
  g.save(); g.translate(CX, CY);
  function ph(a, b) { return easeOutCubic(norm(local, a, b)); }
  var pRoof = ph(0, 0.26), pFrame = ph(0.26, 0.50), pLeaf = ph(0.50, 0.66), pStud = ph(0.66, 0.84), pBase = ph(0.84, 1);
  if (pRoof > 0) {
    g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = 'round';
    var k1 = norm(pRoof, 0, 0.5), k2 = norm(pRoof, 0.5, 1);
    if (k1 > 0) {
      g.beginPath(); g.moveTo(-u * 0.74, dy - u * 0.24);
      g.quadraticCurveTo(-u * 0.42, dy - u * 0.46, lerp(-u * 0.74, 0, k1), lerp(dy - u * 0.24, dy - u * 0.56, easeInOut(k1)));
      g.stroke();
    }
    if (k2 > 0) {
      g.beginPath(); g.moveTo(0, dy - u * 0.56);
      g.quadraticCurveTo(u * 0.42 * k2, lerp(dy - u * 0.56, dy - u * 0.46, k2), lerp(0, u * 0.74, k2), lerp(dy - u * 0.56, dy - u * 0.24, easeInOut(k2)));
      g.stroke();
    }
    if (pRoof > 0.6) {
      var kf = norm(pRoof, 0.6, 1);
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(-u * 0.74, dy - u * 0.24); g.quadraticCurveTo(-u * 0.80, dy - u * 0.26, -u * 0.82, dy - u * (0.24 + 0.09 * kf)); g.stroke();
      g.beginPath(); g.moveTo(u * 0.74, dy - u * 0.24); g.quadraticCurveTo(u * 0.80, dy - u * 0.26, u * 0.82, dy - u * (0.24 + 0.09 * kf)); g.stroke();
      g.beginPath(); g.moveTo(-u * 0.10, dy - u * 0.565); g.lineTo(u * 0.10, dy - u * 0.565); g.stroke();
      g.lineWidth = 2.5; g.globalAlpha = 0.7 * kf;
      g.beginPath(); g.moveTo(-u * 0.66, dy - u * 0.20); g.quadraticCurveTo(0, dy - u * 0.44, u * 0.66, dy - u * 0.20); g.stroke();
      g.globalAlpha = 1;
    }
  }
  if (pFrame > 0) {
    var fy0 = dy - u * 0.22, fy1 = dy + u * 0.60;
    inkLine(-u * 0.56, fy0, -u * 0.56, lerp(fy0, fy1, pFrame), 5);
    inkLine(u * 0.56, fy0, u * 0.56, lerp(fy0, fy1, pFrame), 5);
    if (pFrame > 0.45) {
      var km = norm(pFrame, 0.45, 1);
      inkLine(-u * 0.50, dy - u * 0.10, lerp(-u * 0.50, u * 0.50, km), dy - u * 0.10, 4);
    }
  }
  if (pLeaf > 0) {
    var dw = u * 0.44, dh0 = dy - u * 0.06, dh1 = dy + u * 0.58;
    g.globalAlpha = pLeaf * 0.92;
    g.fillStyle = CINN;
    g.fillRect(-dw, dh0, dw - 2, dh1 - dh0);
    g.fillRect(2, dh0, dw - 2, dh1 - dh0);
    g.globalAlpha = 1;
    g.strokeStyle = INK; g.lineWidth = 3;
    g.strokeRect(-dw, dh0, dw - 2, dh1 - dh0);
    g.strokeRect(2, dh0, dw - 2, dh1 - dh0);
  }
  if (pStud > 0) {
    var dw2 = u * 0.44, ds0 = dy - u * 0.0, ds1 = dy + u * 0.52;
    g.fillStyle = GOLD;
    var row, col;
    for (row = 0; row < 4; row++) for (col = 0; col < 4; col++) {
      var kk = norm(pStud, (row * 4 + col) / 16, (row * 4 + col) / 16 + 0.15);
      if (kk <= 0) continue;
      var sx = lerp(-dw2 + u * 0.07, -u * 0.07, col / 3), sy = lerp(ds0, ds1, row / 3);
      g.globalAlpha = kk;
      g.beginPath(); g.arc(sx, sy, u * 0.016, 0, TAU); g.fill();
      g.beginPath(); g.arc(-sx, sy, u * 0.016, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    g.strokeStyle = GOLD; g.lineWidth = 3;
    var ky = dy + u * 0.26;
    g.beginPath(); g.arc(-u * 0.10, ky, u * 0.045, 0, TAU); g.stroke();
    g.beginPath(); g.arc(u * 0.10, ky, u * 0.045, 0, TAU); g.stroke();
    g.fillStyle = INK;
    g.beginPath(); g.arc(-u * 0.10, ky - u * 0.05, u * 0.016, 0, TAU); g.fill();
    g.beginPath(); g.arc(u * 0.10, ky - u * 0.05, u * 0.016, 0, TAU); g.fill();
  }
  if (pBase > 0) {
    var byy = dy + u * 0.62;
    inkLine(-u * 0.60, byy, lerp(-u * 0.60, u * 0.60, pBase), byy, 5);
    if (pBase > 0.5) {
      var ks2 = norm(pBase, 0.5, 1);
      g.globalAlpha = ks2;
      inkLine(-u * 0.48, byy + u * 0.055, u * 0.48, byy + u * 0.055, 2.5, INK_SOFT);
      g.fillStyle = INK; g.fillRect(-u * 0.17, dy - u * 0.225, u * 0.34 * ks2, u * 0.09);
      if (ks2 > 0.8 && fontReady) {
        g.fillStyle = GOLD;
        g.font = u * 0.062 + 'px MaShanZhengFilm, "Noto Serif SC", serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('劳伦斯', 0, dy - u * 0.178);
      }
      g.globalAlpha = 1;
    }
  }
  if (glow > 0) {
    var gy0 = dy + u * 0.26;
    var gr0 = g.createRadialGradient(0, gy0, 1, 0, gy0, u * (0.3 + glow * 1.3));
    gr0.addColorStop(0, 'rgba(255,190,110,' + 0.85 * glow + ')');
    gr0.addColorStop(0.35, 'rgba(230,140,60,' + 0.35 * glow + ')');
    gr0.addColorStop(1, 'rgba(230,140,60,0)');
    g.save(); g.translate(0, gy0); g.scale(1, 1.25); g.translate(0, -gy0);
    g.fillStyle = gr0; g.fillRect(-u * 1.6, gy0 - u * 2, u * 3.2, u * 4);
    g.restore();
    g.fillStyle = 'rgba(255,220,160,' + 0.9 * glow + ')';
    g.fillRect(-1.5, dy - u * 0.06, 3, u * 0.64);
  }
  g.restore();
}

// ---------- S4+S5 灯夜题字 ----------
function drawLanternShape(x, y, s, col, alpha, t, ph) {
  var bob = Math.sin(t * 1.1 + ph) * s * 0.10;
  var sway = Math.cos(t * 0.7 + ph * 1.3) * s * 0.20;
  var tilt = Math.sin(t * 0.6 + ph) * 0.07;
  x += sway; y += bob;
  var flick = 0.82 + 0.18 * Math.sin(t * 7 + ph * 3) * Math.sin(t * 3.1 + ph);
  var gl = g.createRadialGradient(x, y + s * 0.3, s * 0.1, x, y, s * 2.6);
  gl.addColorStop(0, 'rgba(255,168,88,' + 0.17 * alpha * flick + ')');
  gl.addColorStop(0.5, 'rgba(255,150,80,' + 0.06 * alpha + ')');
  gl.addColorStop(1, 'rgba(255,150,80,0)');
  g.fillStyle = gl; g.fillRect(x - s * 2.6, y - s * 2.6, s * 5.2, s * 5.2);
  g.save(); g.translate(x, y); g.rotate(tilt);
  g.beginPath();
  g.moveTo(0, -s);
  g.bezierCurveTo(s * 0.62, -s * 0.92, s * 0.78, s * 0.2, s * 0.6, s);
  g.bezierCurveTo(s * 0.3, s * 1.08, -s * 0.3, s * 1.08, -s * 0.6, s);
  g.bezierCurveTo(-s * 0.78, s * 0.2, -s * 0.62, -s * 0.92, 0, -s);
  g.closePath();
  g.save(); g.clip();
  var body = g.createRadialGradient(0, s * 0.42, s * 0.06, 0, s * 0.1, s * 1.25);
  body.addColorStop(0, 'rgba(255,214,160,' + (0.55 + 0.4 * flick) * alpha + ')');
  body.addColorStop(0.45, col);
  body.addColorStop(1, 'rgba(26,18,14,0.92)');
  g.fillStyle = body; g.fillRect(-s * 1.1, -s * 1.2, s * 2.2, s * 2.4);
  g.strokeStyle = 'rgba(24,16,10,' + 0.22 * alpha + ')'; g.lineWidth = Math.max(0.6, s * 0.055);
  g.beginPath(); g.ellipse(0, 0, s * 0.34, s, 0, 0, TAU); g.stroke();
  g.beginPath(); g.ellipse(0, 0, s * 0.62, s * 1.02, 0, 0, TAU); g.stroke();
  var sh = g.createLinearGradient(0, -s * 1.1, 0, -s * 0.45);
  sh.addColorStop(0, 'rgba(26,18,14,' + 0.5 * alpha + ')'); sh.addColorStop(1, 'rgba(26,18,14,0)');
  g.fillStyle = sh; g.fillRect(-s * 0.9, -s * 1.2, s * 1.8, s * 0.8);
  g.restore();
  g.strokeStyle = 'rgba(20,14,10,' + 0.55 * alpha + ')'; g.lineWidth = Math.max(0.8, s * 0.09);
  g.beginPath(); g.ellipse(0, -s, s * 0.30, s * 0.09, 0, 0, TAU); g.stroke();
  g.beginPath(); g.ellipse(0, s, s * 0.52, s * 0.12, 0, 0, TAU); g.stroke();
  g.restore();
  if (s > MD * 0.013) {
    g.fillStyle = 'rgba(255,238,200,' + 0.75 * alpha * flick + ')';
    g.beginPath(); g.arc(x, y + s * 0.42, s * 0.10, 0, TAU); g.fill();
  }
  if (s > MD * 0.020) {
    var ts = Math.sin(t * 1.6 + ph * 2) * s * 0.10;
    g.strokeStyle = 'rgba(220,140,80,' + 0.5 * alpha + ')'; g.lineWidth = Math.max(0.7, s * 0.05);
    g.beginPath(); g.moveTo(x, y + s * 1.08); g.quadraticCurveTo(x + ts, y + s * 1.3, x + ts * 1.2, y + s * 1.5); g.stroke();
  }
}
function drawMoon(x, y, r, alpha) {
  var gl = g.createRadialGradient(x, y, r * 0.2, x, y, r * 3.2);
  gl.addColorStop(0, 'rgba(240,230,200,' + 0.10 * alpha + ')');
  gl.addColorStop(1, 'rgba(240,230,200,0)');
  g.fillStyle = gl; g.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  g.fillStyle = 'rgba(238,228,200,' + 0.92 * alpha + ')';
  g.beginPath();
  g.arc(x, y, r, Math.PI * 0.35, Math.PI * 1.65, false);
  g.arc(x + r * 0.42, y - r * 0.10, r * 0.86, Math.PI * 1.58, Math.PI * 0.42, true);
  g.closePath(); g.fill();
}
function drawTitle(t) {
  if (t < TL.titleStart) return;
  var chars = ['劳', '伦', '斯', '实', '验', '室'];
  var px = Math.min(W * 0.098, H * 0.155, 116);
  var spacing = px * 1.04;
  var x0 = CX - spacing * 2.5, y0 = H * 0.40;
  var rnd = mulberry32(2026);
  var jit = [], i;
  for (i = 0; i < 6; i++) jit.push({ r: (rnd() - 0.5) * 0.07, dx: (rnd() - 0.5) * 3, dy: (rnd() - 0.5) * 4 });
  var drift = easeInOut(norm(t, TL.titleStart, TL.nightEnd)) * -H * 0.012;
  var fadeOut = 1 - norm(t, TL.nightEnd, TL.nightEnd + 0.32); // 升起时题字先退场
  if (fadeOut <= 0) return;
  var ks = easeOutBack(norm(t, TL.titleStart - 0.06, TL.titleStart + 0.22));
  if (ks > 0) {
    var sx = x0 - spacing * 0.85, sy = y0 - px * 0.1 + drift;
    g.save(); g.translate(sx, sy); g.rotate(t * 0.15); g.globalAlpha = Math.min(1, ks * 1.3) * 0.9 * fadeOut;
    g.strokeStyle = CREAM; g.lineWidth = 2;
    for (i = 0; i < 8; i++) {
      var a = i / 8 * TAU, rl = px * 0.16 * ks * (i % 2 ? 0.55 : 1);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * rl, Math.sin(a) * rl); g.stroke();
    }
    g.restore(); g.globalAlpha = 1;
  }
  if (!fontReady) return;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (i = 0; i < 6; i++) {
    var ka = easeOutBack(norm(t, TL.titleStart + i * 0.20, TL.titleStart + i * 0.20 + 0.36));
    if (ka <= 0) continue;
    var cxx = CX + (i - 2.5) * spacing + jit[i].dx;
    var cyy = y0 + (1 - ka) * 16 + jit[i].dy + drift;
    g.save();
    g.translate(cxx, cyy); g.rotate(jit[i].r);
    g.globalAlpha = Math.min(1, ka * 1.4) * fadeOut;
    g.fillStyle = PAPER;
    g.font = px + 'px MaShanZhengFilm, MaShanZheng, "Noto Serif SC", serif';
    g.fillText(chars[i], 0, 0);
    g.restore();
  }
  g.globalAlpha = 1;
  var kb = easeOutCubic(norm(t, TL.titleStart + 1.35, TL.titleStart + 1.9));
  if (kb > 0) {
    var sub1 = '数字 · AI · 探索', sub2 = 'S H U Z I D I A N T A N G . C O M';
    var f1 = Math.max(15, px * 0.20), f2 = Math.max(10, px * 0.115);
    g.font = f1 + 'px "Noto Serif SC", "Songti SC", serif';
    var w1 = g.measureText(sub1).width;
    g.font = f2 + 'px "SF Mono","Cascadia Code",Consolas,monospace';
    var w2 = g.measureText(sub2).width;
    var gap = px * 0.16, total = w1 + gap + w2, sx0 = CX - total / 2, syy = y0 + px * 0.86 + drift;
    g.globalAlpha = kb * 0.92 * fadeOut;
    g.textAlign = 'left';
    g.fillStyle = AMBER_L;
    g.font = f1 + 'px "Noto Serif SC", "Songti SC", serif';
    g.fillText(sub1, sx0, syy);
    g.fillStyle = 'rgba(216,224,240,0.55)';
    g.font = f2 + 'px "SF Mono","Cascadia Code",Consolas,monospace';
    g.fillText(sub2, sx0 + w1 + gap, syy + 1);
    g.globalAlpha = 1;
  }
}
function drawNight(t) {
  var local = norm(t, TL.flashEnd, TL.nightEnd);
  var sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, NIGHT2); sky.addColorStop(1, NIGHT1);
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  var i;
  for (i = 0; i < world.stars.length; i++) {
    var st = world.stars[i];
    var tw = 0.35 + 0.65 * Math.abs(Math.sin(t * st.sp + st.ph));
    g.fillStyle = 'rgba(216,224,240,' + 0.30 * tw + ')';
    g.fillRect(st.x * W, st.y * H, st.r, st.r);
  }
  g.strokeStyle = 'rgba(170,190,215,0.05)';
  for (i = 0; i < world.swirls.length; i++) {
    var sw = world.swirls[i];
    g.save(); g.translate(sw.x * W, sw.y * H); g.rotate(sw.rot + t * sw.sp);
    g.beginPath();
    for (var q = 0; q < sw.pts.length; q++) {
      var p = sw.pts[q], rr = p.r * MD;
      var px2 = Math.cos(p.a) * rr, py2 = Math.sin(p.a) * rr * 0.7;
      q === 0 ? g.moveTo(px2, py2) : g.lineTo(px2, py2);
    }
    g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
  drawMoon(W * 0.79, H * 0.16, MD * 0.045, easeOutCubic(norm(local, 0, 0.2)));
  var rise = easeOutCubic(norm(local, 0.02, 0.5));
  for (i = 0; i < world.lanterns.length; i++) {
    var L = world.lanterns[i];
    var ly = (L.y + (1 - rise) * 0.24 - L.drift * local) * H;
    drawLanternShape(L.x * W + Math.sin(t * 0.4 + L.ph) * L.sw * W, ly, L.s * MD, L.col, L.a * (0.45 + 0.55 * rise), t, L.ph);
  }
  var SIL = '#04060a';
  var groundY = H * lerp(1.06, 0.85, easeOutCubic(norm(local, 0.08, 0.55)));
  g.fillStyle = SIL;
  g.beginPath(); g.ellipse(W * 0.2, groundY + H * 0.06, W * 0.55, H * 0.13, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(W * 0.55, groundY + H * 0.05, W * 0.4, H * 0.08, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(W * 0.87, groundY + H * 0.08, W * 0.6, H * 0.15, 0, 0, TAU); g.fill();
  g.fillRect(0, groundY + H * 0.06, W, H);
  // 角楼（北京印记：重檐城楼剪影）
  var tx = W * 0.185, tw = MD * 0.075, base = groundY + H * 0.045, th = MD * 0.11;
  g.fillRect(tx - tw * 0.5, base - th * 0.55, tw, th * 0.55);
  g.beginPath();
  g.moveTo(tx - tw * 0.72, base - th * 0.55);
  g.quadraticCurveTo(tx, base - th * 0.78, tx + tw * 0.72, base - th * 0.55);
  g.lineTo(tx + tw * 0.62, base - th * 0.47); g.lineTo(tx - tw * 0.62, base - th * 0.47);
  g.closePath(); g.fill();
  g.fillRect(tx - tw * 0.34, base - th * 0.92, tw * 0.68, th * 0.30);
  g.beginPath();
  g.moveTo(tx - tw * 0.58, base - th * 0.92);
  g.quadraticCurveTo(tx, base - th * 1.18, tx + tw * 0.58, base - th * 0.92);
  g.lineTo(tx + tw * 0.50, base - th * 0.85); g.lineTo(tx - tw * 0.50, base - th * 0.85);
  g.closePath(); g.fill();
  var wf0 = 0.75 + 0.25 * Math.sin(t * 1.7);
  g.fillStyle = 'rgba(240,180,110,' + 0.55 * wf0 + ')';
  g.fillRect(tx - tw * 0.10, base - th * 0.42, tw * 0.20, th * 0.14);
  for (i = 0; i < world.trees.length; i++) {
    var tr = world.trees[i], tx2 = tr.x * W, ty2 = groundY + H * 0.04, trr = tr.r * MD;
    g.fillStyle = SIL;
    g.fillRect(tx2 - trr * 0.05, ty2 - trr * 0.9, trr * 0.1, trr * 0.95);
    g.beginPath(); g.arc(tx2, ty2 - trr * 1.02, trr * 0.60, 0, TAU); g.fill();
    g.beginPath(); g.arc(tx2, ty2 - trr * 1.15, trr * 0.62, 0, TAU); g.fill();
    g.beginPath(); g.arc(tx2 - trr * 0.34, ty2 - trr * 0.92, trr * 0.44, 0, TAU); g.fill();
    g.beginPath(); g.arc(tx2 + trr * 0.34, ty2 - trr * 0.95, trr * 0.46, 0, TAU); g.fill();
  }
  for (i = 0; i < world.houses.length; i++) {
    var hs = world.houses[i], hx = hs.x * W, hw = hs.w * MD, hh = hs.h * MD, bse = groundY + H * 0.045;
    var bodyH = hh * 0.62;
    g.fillStyle = SIL;
    g.fillRect(hx - hw / 2, bse - bodyH, hw, bodyH);
    g.beginPath();
    if (hs.roof === 'round') { g.arc(hx, bse - bodyH, hw * 0.52, Math.PI, TAU); }
    else { g.moveTo(hx - hw * 0.62, bse - bodyH); g.lineTo(hx, bse - bodyH - hh * 0.42); g.lineTo(hx + hw * 0.62, bse - bodyH); }
    g.closePath(); g.fill();
    for (var wi = 0; wi < hs.win.length; wi++) {
      var wnd = hs.win[wi]; if (!wnd.on) continue;
      var wx2 = hx + wnd.dx * hw, wy2 = bse - bodyH * wnd.dy;
      var wf = 0.78 + 0.22 * Math.sin(t * 1.7 + wnd.ph);
      var wg = g.createRadialGradient(wx2, wy2, 1, wx2, wy2, hw * 0.55);
      wg.addColorStop(0, 'rgba(255,182,104,' + 0.15 * wf + ')'); wg.addColorStop(1, 'rgba(255,182,104,0)');
      g.fillStyle = wg; g.fillRect(wx2 - hw * 0.6, wy2 - hw * 0.6, hw * 1.2, hw * 1.2);
      g.fillStyle = 'rgba(240,180,110,' + (0.5 + 0.3 * wf) + ')';
      var ww2 = wnd.s * hw;
      g.fillRect(wx2 - ww2 / 2, wy2 - ww2 * 0.62, ww2, ww2 * 1.25);
    }
  }
  for (i = 0; i < 2; i++) {
    var fcx = W * (0.5 + 0.38 * Math.sin(t * 0.05 + i * 2.1));
    var fy02 = groundY - H * 0.012 * (i + 1);
    var fgr = g.createRadialGradient(fcx, fy02, 1, fcx, fy02, W * 0.36);
    fgr.addColorStop(0, 'rgba(148,166,200,' + (0.055 - i * 0.02) + ')');
    fgr.addColorStop(1, 'rgba(148,166,200,0)');
    g.save(); g.translate(fcx, fy02); g.scale(1, 0.10); g.translate(-fcx, -fy02);
    g.fillStyle = fgr; g.beginPath(); g.arc(fcx, fy02, W * 0.36, 0, TAU); g.fill(); g.restore();
  }
  drawTitle(t);
}

// ---------- 胶片后处理（颗粒轮换/卡位抖动/闪烁/划痕/暗角） ----------
var frame = 0, flCur = 0;
function post(t) {
  var fr = mulberry32(frame * 2654435761 >>> 0);
  var jx = 0, jy = 0;
  if (frame % 2 === 0) { world.jx = (fr() - 0.5) * 5; world.jy = (fr() - 0.5) * 5; }
  if (fr() < 0.04) { world.jx = (fr() - 0.5) * 14; world.jy = (fr() - 0.5) * 14; }
  jx = Math.round(world.jx || 0); jy = Math.round(world.jy || 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(sc, jx * DPR - 3, jy * DPR - 3, cv.width + 6, cv.height + 6);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  flCur = clamp(flCur + (fr() - 0.5) * 0.05, -0.07, 0.07);
  var pop = fr() < 0.015 ? 0.13 : 0;
  var fl = flCur + (fr() - 0.5) * 0.02 + pop;
  if (Math.abs(fl) > 0.004) {
    ctx.fillStyle = fl > 0 ? 'rgba(255,250,240,' + fl + ')' : 'rgba(10,8,6,' + -fl + ')';
    ctx.fillRect(0, 0, W, H);
  }
  var gA = t > TL.flashEnd ? 0.10 : 0.08;
  if (t < TL.irisEnd) gA = 0.13;
  ctx.globalAlpha = gA;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grains[frame % grains.length], 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  for (var i = 0; i < 2; i++) {
    if (fr() > 0.4) {
      var sx = W * (i === 0 ? 0.31 : 0.72) + Math.round((fr() - 0.5) * 6);
      ctx.strokeStyle = 'rgba(238,232,218,' + (0.02 + fr() * 0.05) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + (fr() - 0.5) * 4, H); ctx.stroke();
    }
  }
  ctx.drawImage(vig, 0, 0, W, H);
}

function applyMask(zoomK, focalY) {
  var mk = masks[frame % 3];
  g.save();
  g.globalCompositeOperation = 'destination-in';
  if (zoomK && zoomK > 1) {
    g.translate(CX, focalY); g.scale(zoomK, zoomK); g.translate(-CX, -focalY);
  }
  g.drawImage(mk, 0, 0);
  g.restore();
}

// ---------- 调度 ----------
function render(t) {
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  var k;
  for (k = 0; k < SPLICES.length; k++) {
    if (Math.abs(t - SPLICES[k]) < 0.022) {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      post(t); return;
    }
  }
  if (t > CARDS_T[0] + 0.05 && t < TL.montageEnd) {
    for (k = 1; k < 6; k++) {
      if (Math.abs(t - CARDS_T[k]) < 0.012) {
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
        post(t); return;
      }
    }
  }
  if (t < TL.growEnd) {
    drawGrow(t);
    if (t < TL.irisEnd) {
      var r = easeOutCubic(norm(t, 0.03, TL.irisEnd * 0.9));
      g.fillStyle = BG;
      g.beginPath(); g.rect(0, 0, W, H);
      g.arc(CX, CY, Math.max(1, r * RC * 1.06), 0, TAU);
      g.fill('evenodd');
    }
    applyMask(1, CY);
  } else if (t < TL.montageEnd) {
    drawMontage(t);
    applyMask(1, CY);
  } else if (t < TL.doorEnd) {
    drawDoorScene(t, 0);
    applyMask(1, CY);
  } else if (t < TL.zoomEnd) { // 穿门推镜：位图以门心为焦点放大
    var pz = easeInCubic(norm(t, TL.doorEnd, TL.zoomEnd));
    var zk = 1 + pz * 11;
    var fy = CY + RC * 0.32;
    drawDoorScene(t, norm(t, TL.doorEnd, TL.zoomEnd));
    var tmp = document.createElement('canvas');
    tmp.width = sc.width; tmp.height = sc.height;
    tmp.getContext('2d').drawImage(sc, 0, 0);
    g.save();
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    g.translate(CX, fy); g.scale(zk, zk); g.translate(-CX, -fy);
    g.drawImage(tmp, 0, 0, W, H);
    g.restore();
    applyMask(zk, fy);
    var la = Math.pow(pz, 2);
    var lg = g.createRadialGradient(CX, fy, 1, CX, fy, MD * 1.2);
    lg.addColorStop(0, 'rgba(255,200,130,' + 0.9 * la + ')');
    lg.addColorStop(0.5, 'rgba(240,150,70,' + 0.4 * la + ')');
    lg.addColorStop(1, 'rgba(240,150,70,0)');
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
  } else if (t < TL.flashEnd) {
    g.fillStyle = '#fff6e6'; g.fillRect(0, 0, W, H);
  } else {
    drawNight(t);
  }
  post(t);
}

var simT = 0, last = 0, raf = 0, booted = false, fontReady = false, liftOn = false, ended = false;

function doLift() {
  if (liftOn) return;
  liftOn = true;
  el.classList.add('lift');
  document.body.classList.remove('intro-hold');
  setTimeout(function () {
    ended = true; window.__INTRO_ENDED = true;
    cancelAnimationFrame(raf);
    if (el.parentNode) el.remove();
  }, 950);
}
function loop() {
  if (ended) return;
  var now = performance.now();
  if (!last) last = now;
  var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); // 模拟时间：后台节流只是慢放
  last = now;
  simT += dt;
  frame = Math.floor(simT * 24);
  render(simT);
  if (simT >= TL.nightEnd) doLift(); // 灯夜题字落定 → 纸面升起，露出首页
  raf = requestAnimationFrame(loop);
}
function boot() {
  if (booted) return; booted = true;
  if (FREEZE != null) { frame = Math.floor(FREEZE * 24); render(FREEZE); return; }
  last = 0;
  raf = requestAnimationFrame(loop);
}
cv.addEventListener('click', function () { // 点击 = 跳过
  if (FREEZE != null || ended) return;
  doLift();
});
addEventListener('keydown', function (e) {
  if ((e.key === 'Escape' || e.key === ' ') && FREEZE == null && !ended) doLift();
});
function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight; MD = Math.min(W, H);
  CX = W / 2; CY = H / 2; RC = MD * 0.40;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  sc.width = cv.width; sc.height = cv.height;
  makeMasks();
}
addEventListener('resize', function () {
  if (ended) return;
  clearTimeout(resize._rt);
  resize._rt = setTimeout(function () {
    resize();
    if (FREEZE != null) { frame = Math.floor(FREEZE * 24); render(FREEZE); }
  }, 180);
});
document.addEventListener('visibilitychange', function () {
  if (!document.hidden && !ended && !liftOn && FREEZE == null) { simT = 0; last = 0; frame = 0; flCur = 0; }
});

makePaperTile(); makeGrains(); makeVignette(); buildWorld(); tree = genTree(20260903); resize();

// 等书法字体就绪再开机（1.6s 超时回落衬线，片头仍完整）
var F = new FontFace('MaShanZhengFilm', 'url(/assets/fonts/mashanzheng-intro.woff2)');
F.load().then(function (f) { document.fonts.add(f); fontReady = true; }).catch(function () { }).finally(function () {
  try { document.fonts.load('64px MaShanZhengFilm', '劳伦斯实验室').then(boot, boot); } catch (e) { boot(); }
});
setTimeout(boot, 1600);
})();
