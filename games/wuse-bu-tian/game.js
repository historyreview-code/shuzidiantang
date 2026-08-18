'use strict';
/* ============================================================
   五色石·补天记 — 游戏主逻辑
   状态机：title / map / play / pause / win / cut
   ============================================================ */
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const DPR = Math.min(2, window.devicePixelRatio || 1);
cv.width = VW * DPR; cv.height = VH * DPR;

function fitCanvas() {
  const s = Math.min(innerWidth / VW, innerHeight / VH) * 0.98;
  cv.style.width = (VW * s) + 'px';
  cv.style.height = (VH * s) + 'px';
}
addEventListener('resize', fitCanvas); fitCanvas();

/* ---------------- 存档 ---------------- */
const SAVE_KEY = 'wuse1';
function defaultSave() {
  return {
    v: 1, unlocked: 1, cleared: false, intro: false, deaths: 0, time: 0, mute: false,
    stones: [false, false, false, false, false],
    stars: [[false, false, false], [false, false, false], [false, false, false], [false, false, false], [false, false, false]],
    up: { pick: false, dash: false, herb: false, lamp: false }
  };
}
let SAVE = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === 1) return Object.assign(defaultSave(), s);
  } catch (e) { }
  return defaultSave();
})();
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { } }
AudioMan.muted = !!SAVE.mute;

/* ---------------- 全局 ---------------- */
const G = {
  state: 'title', t: 0, level: 1, mapSel: 0,
  shake: 0, cam: { x: 0, y: 0 },
  banner: 0, winT: 0, deadTip: '',
  cut: { t: 0, line: 0, done: false }
};
const PARTS = new ParticleSys();
const DK = document.createElement('canvas'); DK.width = VW; DK.height = VH;
const dkx = DK.getContext('2d');

let LV = null;   // 当前关卡运行时
const P = {      // 玩家（小精卫）
  x: 0, y: 0, w: 20, h: 24, vx: 0, vy: 0, face: 1,
  onGround: false, coyote: 0, jbuf: 0, anim: 0, squash: 0,
  hearts: 3, maxHearts: 3, iframes: 0, blocks: 6,
  digTx: -1, digTy: -1, digT: 0, digNeed: 30,
  dashCd: 0, dashT: 0, lightBoost: 0, deadT: 0
};
const DLG = { active: false, spec: null, idx: 0, shown: 0, onDone: null, age: 0 };

/* ---------------- 图块查询 ---------------- */
const SOLID = new Set(['#', 'S', 'I', 'c', 'B']);
function tileAt(tx, ty) {
  if (!LV) return ' ';
  if (tx < 0 || tx >= LV.w) return 'S';       // 左右空气墙
  if (ty < 0 || ty >= LV.h) return ' ';       // 上下开放
  return LV.map[ty][tx];
}
function rectHitsSolid(x, y, w, h, onewayFrom = -1) {
  const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T);
  const y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) {
      const c = tileAt(tx, ty);
      if (SOLID.has(c)) return true;
      if (c === 'W' && onewayFrom >= 0 && ty * T >= onewayFrom) return true;
    }
  return false;
}
// 实体位移 + 碰撞（玩家吃单向板）
function moveEntity(e, oneway = false) {
  const prevBottom = e.y + e.h;
  e.x += e.vx;
  if (e.vx > 0 && rectHitsSolid(e.x, e.y, e.w, e.h)) {
    e.x = Math.floor((e.x + e.w) / T) * T - e.w - 0.01; e.vx = 0; e.hitX = true;
  } else if (e.vx < 0 && rectHitsSolid(e.x, e.y, e.w, e.h)) {
    e.x = (Math.floor(e.x / T) + 1) * T + 0.01; e.vx = 0; e.hitX = true;
  } else e.hitX = false;
  e.y += e.vy;
  e.onGround = false;
  if (e.vy > 0) {
    const y1 = Math.floor((e.y + e.h) / T);
    const x0 = Math.floor(e.x / T), x1 = Math.floor((e.x + e.w - 0.01) / T);
    for (let ty = Math.floor(e.y / T); ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) {
        const c = tileAt(tx, ty);
        if (SOLID.has(c) || (c === 'W' && oneway && prevBottom <= ty * T + 4)) {
          e.y = ty * T - e.h - 0.01; e.vy = 0; e.onGround = true;
        }
      }
  } else if (e.vy < 0 && rectHitsSolid(e.x, e.y, e.w, e.h)) {
    e.y = (Math.floor(e.y / T) + 1) * T + 0.01; e.vy = 0;
  }
}

/* ---------------- 关卡装载 ---------------- */
function startLevel(n) {
  G.level = n;
  const b = buildLevel(n);
  LV = {
    n, w: b.w, h: b.h, map: b.t.map(r => r.slice()),
    biome: BIOMES[n],
    npcs: b.npcs.map(o => ({ ...o, px: o.x * T, feet: (o.y + 1) * T })),
    enemies: [], flyers: [],
    stars: b.stars.map((s, i) => ({
      x: s.x * T + T / 2, y: s.y * T + T / 2, i,
      got: SAVE.stars[n - 1][i]
    })),
    hearts: b.hearts.map(h => ({ x: h.x * T + T / 2, y: h.y * T + T / 2, got: false })),
    bugs: b.bugs.map(g => ({ x: g.x * T + T / 2, y: g.y * T + T / 2, got: false, ph: Math.random() * 7 })),
    checks: b.checkpoints.map(c => ({ x: c.x, y: c.y, on: false })),
    shrine: { x: b.shrine.x, y: b.shrine.y, done: SAVE.stones[n - 1] },
    respawn: { x: b.spawn.x, y: b.spawn.y }
  };
  resetEnemies();
  respawnPlayer(true);
  P.hearts = P.maxHearts = 3 + (SAVE.up.herb ? 1 : 0);
  P.blocks = 6;
  P.lightBoost = 0;
  G.cam.x = clamp(P.x - VW / 2, 0, LV.w * T - VW);
  G.cam.y = clamp(P.y - VH / 2, 0, LV.h * T - VH);
  G.banner = 150; G.winT = 0;
  PARTS.clear();
  G.state = 'play';
  AudioMan.bgmStart(LV.biome.music);
}
function resetEnemies() {
  const b = buildLevel(G.level);
  LV.enemies = b.enemies.map(e => ({
    x: e.x * T + 6, y: (e.y + 1) * T - 26, w: 24, h: 26,
    vx: 0.65, vy: 0, dir: 1, onGround: false, dead: false, t: Math.random() * 60,
    snow: LV.n === 3
  }));
  LV.flyers = b.flyers.map(f => ({
    ax: f.x * T + 16, ay: f.y * T + 16, x: 0, y: 0, w: 26, h: 18,
    dead: false, t: Math.random() * 60, bat: (LV.n === 4)
  }));
}
function respawnPlayer(full) {
  const r = LV.respawn;
  P.x = r.x * T + 6; P.y = (r.y + 1) * T - P.h;
  P.vx = 0; P.vy = 0; P.face = 1; P.iframes = 80; P.deadT = 0;
  P.digT = 0; P.dashT = 0; P.dashCd = 0;
  if (full) { LV.checks.forEach(c => c.on = false); }
}

/* ---------------- 玩家更新 ---------------- */
function iceUnder() {
  const ty = Math.floor((P.y + P.h + 2) / T);
  const x0 = Math.floor(P.x / T), x1 = Math.floor((P.x + P.w) / T);
  for (let tx = x0; tx <= x1; tx++) if (tileAt(tx, ty) === 'I') return true;
  return false;
}
function hurt(fromX, strong) {
  if (P.iframes > 0) return;
  P.hearts--;
  P.iframes = 70; G.shake = 10;
  P.vy = strong ? -8.6 : -6.5;
  P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * (strong ? 4.5 : 3.5);
  AudioMan.sfx('hurt');
  if (P.hearts <= 0) killPlayer();
}
function killPlayer() {
  if (P.deadT) return;
  P.deadT = 55;
  SAVE.deaths++; save();
  AudioMan.sfx('die');
  const tips = DEATH_TIPS[G.level];
  G.deadTip = tips[Math.floor(Math.random() * tips.length)];
  PARTS.burst(P.x + P.w / 2, P.y + P.h / 2, 16, { color: '#ff9a4d', sp: 3, g: 0.15, life: 40 });
}
function diggableAt(tx, ty) {
  const c = tileAt(tx, ty);
  if (c === '#' || c === 'W') return true;
  if ((c === 'S' || c === 'I') && SAVE.up.pick) return true;
  return false;
}
function digTarget() {
  const cx = P.x + P.w / 2, cy = P.y + P.h / 2;
  const ctx0 = Math.floor(cx / T), cty0 = Math.floor(cy / T);
  const cands = [[P.face, 0], [P.face, 1], [0, 1], [P.face, -1], [0, -1]];
  for (const [dx, dy] of cands) {
    const tx = ctx0 + dx, ty = cty0 + dy;
    const d = Math.hypot(tx * T + 16 - cx, ty * T + 16 - cy);
    if (d <= T * 2.35) return { tx, ty };
  }
  return null;
}
function placeBlocked(tx, ty) {
  const r = { x: tx * T + 2, y: ty * T + 2, w: T - 4, h: T - 4 };
  const hit = e => !(r.x > e.x + e.w || r.x + r.w < e.x || r.y > e.y + e.h || r.y + r.h < e.y);
  if (hit(P)) return true;
  for (const e of LV.enemies) if (!e.dead && hit(e)) return true;
  for (const f of LV.flyers) if (!f.dead && hit({ x: f.x - 13, y: f.y - 9, w: 26, h: 18 })) return true;
  for (const n of LV.npcs) if (hit({ x: n.px, y: n.feet - 32, w: 32, h: 32 })) return true;
  return false;
}
function updatePlayer() {
  if (P.deadT) {   // 死亡演出
    P.deadT--;
    if (P.deadT === 1) {
      respawnPlayer(false);
      resetEnemies();
      P.hearts = P.maxHearts; P.blocks = 6;
    }
    return;
  }
  const ice = P.onGround && iceUnder();
  // 水平
  const acc = P.onGround ? (ice ? 0.12 : 0.55) : 0.3;
  const fric = P.onGround ? (ice ? 0.015 : 0.42) : 0.02;
  if (P.dashT > 0) {          // 冲刺中
    P.dashT--;
    P.vy = 0;
    if (G.t % 2 === 0) PARTS.spawn(P.x + P.w / 2, P.y + P.h / 2, { color: '#ffd9a8', life: 16, size: 4 });
  } else {
    if (kLeft()) { P.vx -= acc; P.face = -1; }
    else if (kRight()) { P.vx += acc; P.face = 1; }
    else {
      if (P.vx > 0) P.vx = Math.max(0, P.vx - fric);
      else if (P.vx < 0) P.vx = Math.min(0, P.vx + fric);
    }
    const cap = 3.1;
    P.vx = clamp(P.vx, -cap, cap);
    // 冲刺
    if (SAVE.up.dash && P.dashCd > 0) P.dashCd--;
    if (SAVE.up.dash && kDashP() && P.dashCd <= 0) {
      P.dashT = 11; P.dashCd = 42;
      P.vx = P.face * 7.5;
      AudioMan.sfx('dash');
    }
    // 重力
    P.vy += 0.55;
    if (P.vy > 11) P.vy = 11;
    // 跳跃（土狼时间 + 预输入）
    if (P.onGround) P.coyote = 7; else if (P.coyote > 0) P.coyote--;
    if (kJumpP()) P.jbuf = 7; else if (P.jbuf > 0) P.jbuf--;
    if (P.jbuf > 0 && P.coyote > 0) {
      P.vy = -11.3; P.jbuf = 0; P.coyote = 0; P.squash = -0.25;
      AudioMan.sfx('jump');
    }
    if (!kJump() && P.vy < -3) P.vy *= 0.55;   // 松键短跳
  }
  const wasAir = !P.onGround, oldVy = P.vy;
  moveEntity(P, true);
  if (P.hitX && P.dashT > 0) P.dashT = 0;
  if (wasAir && P.onGround) {
    P.squash = 0.3;
    if (oldVy > 6) for (let i = 0; i < 5; i++)
      PARTS.spawn(P.x + P.w / 2 + (Math.random() - 0.5) * 16, P.y + P.h, { vx: (Math.random() - .5) * 1.5, vy: -Math.random(), color: '#cbb59a', life: 18, size: 3 });
  }
  P.squash *= 0.85;
  if (P.iframes > 0) P.iframes--;
  if (P.lightBoost > 0) P.lightBoost--;
  // 坠出世界
  if (P.y > (LV.h + 4) * T) { P.hearts = 0; killPlayer(); return; }
  // 危险物
  const hx0 = Math.floor(P.x / T), hx1 = Math.floor((P.x + P.w) / T);
  const hy0 = Math.floor(P.y / T), hy1 = Math.floor((P.y + P.h) / T);
  for (let ty = hy0; ty <= hy1; ty++)
    for (let tx = hx0; tx <= hx1; tx++) {
      const c = tileAt(tx, ty);
      if (c === '~' && P.y + P.h > ty * T + 8) hurt(tx * T + 16, true);
      if (c === '^' && P.y + P.h > ty * T + 14) hurt(tx * T + 16, true);
    }
  /* 挖掘 / 放置 */
  const tgt = digTarget();
  if (tgt && kDig() && diggableAt(tgt.tx, tgt.ty)) {
    if (tgt.tx !== P.digTx || tgt.ty !== P.digTy) { P.digTx = tgt.tx; P.digTy = tgt.ty; P.digT = 0; }
    P.digNeed = SAVE.up.pick ? 15 : 28;
    P.digT++;
    if (P.digT % 9 === 0) {
      AudioMan.sfx('dighit');
      PARTS.burst(tgt.tx * T + 16, tgt.ty * T + 16, 2, { color: LV.biome.dirt, sp: 1.6, g: 0.2, life: 22 });
    }
    if (P.digT >= P.digNeed) {
      LV.map[tgt.ty][tgt.tx] = ' ';
      if (P.blocks < 24) P.blocks++;
      P.digT = 0;
      AudioMan.sfx('digdone');
      PARTS.burst(tgt.tx * T + 16, tgt.ty * T + 16, 8, { color: LV.biome.dirt, sp: 2.4, g: 0.18, life: 30 });
    }
  } else P.digT = 0;
  if (tgt && kPlace() && P.blocks > 0) {
    const c = tileAt(tgt.tx, tgt.ty);
    if ((c === ' ' || c === '~') && tgt.ty >= 0 && tgt.ty < LV.h && !placeBlocked(tgt.tx, tgt.ty)) {
      LV.map[tgt.ty][tgt.tx] = '#';
      P.blocks--;
      AudioMan.sfx('place');
      PARTS.burst(tgt.tx * T + 16, tgt.ty * T + 16, 6, { color: LV.biome.dirt, sp: 1.8, life: 20 });
    }
  }
  // 动画
  if (Math.abs(P.vx) > 0.4 && P.onGround) P.anim += Math.abs(P.vx) * 0.09; else P.anim = 0;
}

/* ---------------- 实体互动 ---------------- */
function overlap(a, b) {
  return !(a.x > b.x + b.w || a.x + a.w < b.x || a.y > b.y + b.h || a.y + a.h < b.y);
}
function updateEntities() {
  // 地面敌兵
  for (const e of LV.enemies) {
    if (e.dead) continue;
    e.t++;
    e.vy += 0.55; if (e.vy > 10) e.vy = 10;
    e.vx = e.dir * 0.65;
    moveEntity(e, true);
    if (e.hitX) e.dir *= -1;
    if (e.onGround) {   // 平台边缘回头
      const aheadX = e.dir > 0 ? e.x + e.w + 2 : e.x - 2;
      const below = tileAt(Math.floor(aheadX / T), Math.floor((e.y + e.h + 4) / T));
      if (!SOLID.has(below) && below !== 'W') e.dir *= -1;
    }
    if (e.y > (LV.h + 4) * T) e.dead = true;
    // 与玩家
    if (!P.deadT && P.iframes <= 0 && overlap(P, e)) {
      if (P.vy > 1 && P.y + P.h - e.y < 14) {
        e.dead = true; P.vy = -8.5; P.squash = -0.2;
        AudioMan.sfx('stomp'); G.shake = 5;
        PARTS.burst(e.x + e.w / 2, e.y + e.h / 2, 10, { color: e.snow ? '#eef6fb' : '#6fc38b', sp: 2.5, g: 0.15, life: 30 });
      } else hurt(e.x + e.w / 2);
    }
  }
  // 飞行敌兵
  for (const f of LV.flyers) {
    if (f.dead) continue;
    f.t++;
    f.x = f.ax + Math.sin(f.t * 0.025) * 52;
    f.y = f.ay + Math.sin(f.t * 0.06) * 24;
    const fb = { x: f.x - 13, y: f.y - 9, w: 26, h: 18 };
    if (!P.deadT && P.iframes <= 0 && overlap(P, fb)) {
      if (P.vy > 1 && P.y + P.h - fb.y < 14) {
        f.dead = true; P.vy = -8.5;
        AudioMan.sfx('stomp');
        PARTS.burst(f.x, f.y, 10, { color: f.bat ? '#8a8fae' : '#ff5d5d', sp: 2.5, g: 0.15, life: 30 });
      } else hurt(f.x);
    }
  }
  // 星屑 / 心 / 萤火
  for (const s of LV.stars) {
    if (s.got) continue;
    if (Math.hypot(P.x + P.w / 2 - s.x, P.y + P.h / 2 - s.y) < 30) {
      s.got = true; SAVE.stars[LV.n - 1][s.i] = true; save();
      AudioMan.sfx('star');
      toast(`星屑 ${LV.stars.filter(x => x.got).length}/3`, '#ffd23f');
      PARTS.burst(s.x, s.y, 12, { color: '#ffd23f', sp: 2.6, life: 36, glow: true });
    }
  }
  for (const h of LV.hearts) {
    if (h.got) continue;
    if (Math.hypot(P.x + P.w / 2 - h.x, P.y + P.h / 2 - h.y) < 30) {
      h.got = true;
      if (P.hearts < P.maxHearts) { P.hearts++; AudioMan.sfx('heart'); toast('体力 +1', '#ff5d6e'); }
      else { AudioMan.sfx('heart'); toast('体力已满', '#ff5d6e'); }
      PARTS.burst(h.x, h.y, 8, { color: '#ff5d6e', sp: 2, life: 30 });
    }
  }
  for (const g of LV.bugs) {
    if (g.got) continue;
    if (Math.hypot(P.x + P.w / 2 - g.x, P.y + P.h / 2 - g.y) < 30) {
      g.got = true; P.lightBoost = 600;
      AudioMan.sfx('firefly'); toast('萤火 · 照亮 10 秒', '#ffe98a');
      PARTS.burst(g.x, g.y, 10, { color: '#ffe98a', sp: 2, life: 34, glow: true });
    }
  }
  // 检查点
  for (const c of LV.checks) {
    if (c.on) continue;
    if (Math.abs(P.x + P.w / 2 - (c.x * T + 16)) < 24 && Math.abs(P.y + P.h - (c.y + 1) * T) < 44) {
      c.on = true; LV.respawn = { x: c.x, y: c.y };
      AudioMan.sfx('check'); toast('小旗 · 已记录', '#3ecf8e');
      PARTS.burst(c.x * T + 16, c.y * T + 8, 10, { color: '#3ecf8e', sp: 2, life: 32 });
    }
  }
  // 神龛（关卡终点，可重复触发；存档只记一次）
  const sh = LV.shrine;
  {
    const r = { x: sh.x * T - 4, y: sh.y * T - 20, w: T + 8, h: T + 20 };
    if (!sh.done && !P.deadT && overlap(P, r)) {
      sh.done = true;
      SAVE.stones[LV.n - 1] = true;
      SAVE.unlocked = Math.max(SAVE.unlocked, Math.min(5, LV.n + 1));
      save();
      AudioMan.sfx('shrine');
      PARTS.burst(sh.x * T + 16, sh.y * T, 26, { color: STONE_COLORS[LV.n], sp: 3, life: 50, glow: true });
      G.state = 'win'; G.winT = 0;
    }
  }
}

/* ---------------- NPC 对话 ---------------- */
function npcNear() {
  for (const n of LV.npcs) {
    if (Math.abs(P.x + P.w / 2 - (n.px + 16)) < 54 && Math.abs(P.y + P.h - n.feet) < 60) return n;
  }
  return null;
}
function openDialog(spec, onDone) {
  DLG.active = true; DLG.spec = spec; DLG.idx = 0; DLG.shown = 0; DLG.onDone = onDone || null; DLG.age = 0;
}
function updateDialog() {
  DLG.age++;
  const spec = DLG.spec;
  const full = spec.lines.length;
  const line = spec.lines[DLG.idx];
  if (DLG.shown < line.length) {
    DLG.shown += 0.6;
    if (Math.floor(DLG.shown) % 7 === 0) AudioMan.sfx('talk');
    if (DLG.age > 4 && kTalkP()) DLG.shown = line.length;
  } else if (DLG.age > 4 && kTalkP()) {
    DLG.idx++;
    DLG.shown = 0;
    if (DLG.idx >= full) {
      DLG.active = false;
      // 发道具
      if (spec.grant && !SAVE.up[spec.grant]) {
        SAVE.up[spec.grant] = true;
        if (spec.grant === 'herb') { P.maxHearts = 4; P.hearts = 4; }
        save();
        AudioMan.sfx('grant');
        toast(spec.grantText, '#ffd23f');
        PARTS.burst(P.x + P.w / 2, P.y, 16, { color: '#ffd23f', sp: 2.6, life: 44, glow: true });
      }
      if (DLG.onDone) DLG.onDone();
    }
  }
}
function talkTo(n) {
  const d = DIALOGUE[n.id];
  if (!d) return;
  if (d.grant && !SAVE.up[d.grant]) openDialog({ speaker: d.speaker, spr: d.spr, lines: d.pre, grant: d.grant, grantText: d.grantText });
  else openDialog({ speaker: d.speaker, spr: d.spr, lines: d.post });
}

/* ---------------- Toast ---------------- */
const TOASTS = [];
function toast(msg, color = '#fff') {
  TOASTS.push({ msg, color, t: 130 });
  if (TOASTS.length > 3) TOASTS.shift();
}

/* ---------------- 环境粒子 ---------------- */
function ambient() {
  const b = LV.biome, r = Math.random();
  const x = G.cam.x + Math.random() * VW, y = G.cam.y + Math.random() * VH;
  if (b.ambient === 'leaf' && r < 0.07)
    PARTS.spawn(x, G.cam.y - 10, { vy: 0.5 + Math.random(), vx: 0.3, color: Math.random() < 0.5 ? '#63c74d' : '#ffd23f', life: 200, size: 3, sway: 0.8, g: 0 });
  else if (b.ambient === 'ember' && r < 0.06)
    PARTS.spawn(x, G.cam.y + VH + 10, { vy: -0.7 - Math.random(), vx: 0.2, color: Math.random() < 0.5 ? '#ff9a5c' : '#ffd23f', life: 150, size: 3, sway: 0.5, g: 0, glow: true });
  else if (b.ambient === 'snow' && r < 0.16)
    PARTS.spawn(x, G.cam.y - 10, { vy: 0.8 + Math.random() * 0.6, color: '#ffffff', life: 260, size: 2.5, sway: 1.1, g: 0 });
  else if (b.ambient === 'dust' && r < 0.05)
    PARTS.spawn(x, y, { vy: 0.25, color: '#ffe98a', life: 130, size: 2, sway: 0.4, g: 0, glow: true });
}

/* ================= 渲染 ================= */
function drawSky() {
  const b = LV ? LV.biome : BIOMES[1];
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, b.sky[0]); g.addColorStop(1, b.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  if (b.stars) {
    for (let i = 0; i < 90; i++) {
      const sx = (hash2(i, 7) * 1600 - G.cam.x * 0.15) % VW;
      const sy = hash2(i, 13) * VH * 0.75 - G.cam.y * 0.1;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(G.t * 0.02 + i));
      ctx.globalAlpha = tw * 0.8;
      ctx.fillStyle = '#fff';
      ctx.fillRect((sx + VW) % VW, sy, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
  if (b.sun) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = b.sun;
    ctx.beginPath();
    ctx.arc(VW - 140 - G.cam.x * 0.02 % 40, 90, 34, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.arc(VW - 140, 90, 52, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // 天洞（第五关）
  if (b.vortex) {
    const vx = VW / 2 + (LV.w * T / 2 - VW / 2 - G.cam.x) * 0.5;
    ctx.save();
    ctx.translate(vx, 110 - G.cam.y * 0.25);
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.5 - i * 0.07;
      ctx.fillStyle = i % 2 ? '#1a1030' : '#0a0618';
      ctx.beginPath();
      ctx.ellipse(0, 0, 90 - i * 14 + Math.sin(G.t * 0.03 + i) * 4, 34 - i * 5, 0, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(160,120,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 92 + Math.sin(G.t * 0.05) * 5, 36, 0, 0, 7); ctx.stroke();
    ctx.restore();
    if (Math.random() < 0.1) PARTS.spawn(vx + (Math.random() - .5) * 120, 130, { vy: 2.5, color: '#fff', life: 60, size: 2, glow: true, g: 0.03 });
  }
}
function drawHills() {
  const b = LV.biome;
  const layers = [[b.hill2, 0.25, 300, 60, 0.011], [b.hill, 0.45, 360, 46, 0.017]];
  for (const [col, par, base, amp, k] of layers) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, VH);
    for (let sx = 0; sx <= VW; sx += 10) {
      const wy = base - G.cam.y * par * 0.4
        + Math.sin((sx + G.cam.x * par) * k) * amp * 0.35
        + Math.sin((sx + G.cam.x * par) * k * 2.7 + 2) * amp * 0.18;
      ctx.lineTo(sx, wy);
    }
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill();
  }
}
function drawTile(c, tx, ty) {
  const b = LV.biome;
  const x = tx * T, y = ty * T;
  const r1 = hash2(tx, ty), r2 = hash2(tx + 91, ty + 17), r3 = hash2(tx - 5, ty + 55);
  const bevel = (light, dark) => {
    ctx.fillStyle = light; ctx.fillRect(x, y, T, 4); ctx.fillRect(x, y, 4, T);
    ctx.fillStyle = dark; ctx.fillRect(x, y + T - 4, T, 4); ctx.fillRect(x + T - 4, y, 4, T);
  };
  if (c === '#') {
    ctx.fillStyle = b.dirt; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = b.dirtDark;
    ctx.fillRect(x + 4 + r1 * 20, y + 6 + r2 * 20, 5, 4);
    ctx.fillRect(x + 6 + r3 * 18, y + 16 + r1 * 10, 4, 3);
    if (!SOLID.has(tileAt(tx, ty - 1)) && tileAt(tx, ty - 1) !== 'W') {
      ctx.fillStyle = b.grass; ctx.fillRect(x, y, T, 9);
      ctx.fillStyle = b.grassDark;
      for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 8 + (r1 * 4 | 0), y + 9, 4, 3);
    }
    bevel('rgba(255,255,255,.16)', 'rgba(0,0,0,.2)');
  } else if (c === 'S') {
    ctx.fillStyle = b.stone; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = b.stoneDark;
    ctx.fillRect(x + 3 + r1 * 18, y + 5 + r2 * 6, 8, 3);
    ctx.fillRect(x + 6 + r3 * 12, y + 18, 6, 3);
    bevel('rgba(255,255,255,.13)', 'rgba(0,0,0,.25)');
  } else if (c === 'I') {
    ctx.fillStyle = 'rgba(190,228,255,0.96)'; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 20 + r1 * 6, y + 4, 3, 14);
    ctx.fillRect(x + 6 + r2 * 8, y + 16, 3, 10);
    bevel('rgba(255,255,255,.5)', 'rgba(120,170,220,.5)');
  } else if (c === 'W') {
    ctx.fillStyle = '#b07a45'; ctx.fillRect(x, y, T, 14);
    ctx.fillStyle = '#8a5c30';
    ctx.fillRect(x, y + 11, T, 3);
    ctx.fillRect(x + 15, y, 2, 14);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x, y, T, 3);
  } else if (c === 'c') {
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.beginPath(); ctx.arc(x + 9, y + 12, 9, 0, 7); ctx.arc(x + 22, y + 10, 10, 0, 7); ctx.arc(x + 15, y + 18, 8, 0, 7); ctx.fill();
  } else if (c === '~') {
    const lava = LV.biome.hazard === 'lava';
    ctx.fillStyle = lava ? '#e8542f' : '#4da6e8';
    ctx.fillRect(x, y + 6, T, T - 6);
    ctx.fillStyle = lava ? '#ffb42a' : '#9fd8ff';
    const w1 = Math.sin(G.t * 0.08 + tx * 1.3) * 3;
    ctx.fillRect(x, y + 6 + w1, T, 5);
    if (lava && Math.random() < 0.008) PARTS.spawn(x + 16, y + 6, { vy: -1.4, color: '#ffb42a', life: 40, size: 3, glow: true, g: 0.02 });
  } else if (c === '^') {
    ctx.fillStyle = b.stone;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 8, y + T);
      ctx.lineTo(x + i * 8 + 4, y + 12);
      ctx.lineTo(x + i * 8 + 8, y + T);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 8 + 3, y + 14, 1.5, 10);
  }
}
function drawTiles() {
  const x0 = Math.max(0, Math.floor(G.cam.x / T)), x1 = Math.min(LV.w - 1, Math.ceil((G.cam.x + VW) / T));
  const y0 = Math.max(0, Math.floor(G.cam.y / T)), y1 = Math.min(LV.h - 1, Math.ceil((G.cam.y + VH) / T));
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) {
      const c = LV.map[ty][tx];
      if (c !== ' ') drawTile(c, tx, ty);
    }
  // 挖掘进度裂纹
  if (P.digT > 0 && P.digTx >= 0) {
    const p = P.digT / P.digNeed;
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = 2;
    const cx = P.digTx * T, cy = P.digTy * T;
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy + 16); ctx.lineTo(cx + 16 + (r3() - .5) * 24 * p, cy + 16 + (r3() - .5) * 24 * p);
    ctx.moveTo(cx + 10, cy + 10); ctx.lineTo(cx + 10 + (r3() - .5) * 20 * p, cy + 10 + (r3() - .5) * 20 * p);
    ctx.stroke();
  }
  // 目标格高亮
  const tgt = (G.state === 'play' && !P.deadT && !DLG.active) ? digTarget() : null;
  if (tgt) {
    const c = tileAt(tgt.tx, tgt.ty);
    const col = diggableAt(tgt.tx, tgt.ty) ? 'rgba(120,255,150,.8)'
      : ((c === ' ' || c === '~') && P.blocks > 0) ? 'rgba(120,180,255,.8)' : 'rgba(255,120,120,.5)';
    ctx.strokeStyle = col;
    ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
    ctx.strokeRect(tgt.tx * T + 2, tgt.ty * T + 2, T - 4, T - 4);
    ctx.setLineDash([]);
  }
}
const r3 = () => Math.random();

function drawEntities() {
  // 神龛
  const sh = LV.shrine;
  {
    const sx = sh.x * T + 16, sy = (sh.y + 1) * T;
    ctx.fillStyle = '#c9c2b0'; ctx.fillRect(sx - 16, sy - 22, 32, 22);
    ctx.fillStyle = '#a8a090'; ctx.fillRect(sx - 20, sy - 6, 40, 6);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(sx - 16, sy - 22, 32, 4);
    if (!sh.done) {
      const bob = Math.sin(G.t * 0.06) * 5;
      const col = STONE_COLORS[LV.n];
      ctx.save();
      ctx.shadowColor = col; ctx.shadowBlur = 18;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 52 + bob); ctx.lineTo(sx + 10, sy - 40 + bob);
      ctx.lineTo(sx, sy - 28 + bob); ctx.lineTo(sx - 10, sy - 40 + bob);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fillRect(sx - 3, sy - 48 + bob, 3, 6);
    }
  }
  // 检查点小旗
  for (const c of LV.checks) {
    const fx = c.x * T + 8, fy = (c.y + 1) * T;
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(fx, fy - 44, 4, 44);
    ctx.fillStyle = c.on ? '#3ecf8e' : '#9aa2ad';
    const w = c.on ? Math.sin(G.t * 0.1) * 3 : 0;
    ctx.beginPath();
    ctx.moveTo(fx + 4, fy - 44); ctx.lineTo(fx + 26 + w, fy - 37); ctx.lineTo(fx + 4, fy - 30);
    ctx.closePath(); ctx.fill();
  }
  // NPC
  for (const n of LV.npcs) {
    const spr = NPC_SPR[n.id];
    const bob = Math.sin(G.t * 0.04 + n.x) * 2;
    ctx.drawImage(spr, n.px, n.feet - 32 + bob, 32, 32);
    if (!DLG.active && G.state === 'play' && npcNear() === n) {
      const by = n.feet - 52 + Math.sin(G.t * 0.12) * 3;
      ctx.fillStyle = 'rgba(20,24,40,.85)';
      rr(ctx, n.px + 10, by, 14, 16, 4); ctx.fill();
      txt(ctx, 'E', n.px + 17, by + 13, { size: 13, color: '#ffd23f', align: 'center', stroke: '#000' });
    }
  }
  // 星屑（藏进实心块的先不显示）
  for (const s of LV.stars) {
    if (s.got) continue;
    const t = tileAt(Math.floor(s.x / T), Math.floor(s.y / T));
    if (SOLID.has(t)) continue;
    const bob = Math.sin(G.t * 0.07 + s.i * 2) * 4;
    const sc = 1 + Math.sin(G.t * 0.1 + s.i) * 0.12;
    ctx.save();
    ctx.translate(s.x, s.y + bob); ctx.scale(sc, sc);
    ctx.drawImage(Sprites.star, -7, -7, 14, 14);
    ctx.restore();
  }
  // 心
  for (const h of LV.hearts) {
    if (h.got) continue;
    ctx.drawImage(Sprites.heart, h.x - 10, h.y - 9 + Math.sin(G.t * 0.08) * 3, 20, 18);
  }
  // 萤火虫
  for (const g of LV.bugs) {
    if (g.got) continue;
    const bx = g.x + Math.sin(G.t * 0.03 + g.ph) * 14;
    const by = g.y + Math.sin(G.t * 0.05 + g.ph * 2) * 10;
    ctx.globalAlpha = 0.75 + Math.sin(G.t * 0.15 + g.ph) * 0.25;
    ctx.drawImage(Sprites.bug, bx - 7, by - 6, 14, 12);
    ctx.globalAlpha = 1;
  }
  // 地面敌兵
  for (const e of LV.enemies) {
    if (e.dead) continue;
    const fr = Sprites[e.snow ? 'snow' : 'walker'][Math.floor(e.t / 14) % 2];
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h);
    ctx.scale(e.dir > 0 ? 2 : -2, 2);
    ctx.drawImage(fr, -16, -28);
    ctx.restore();
  }
  // 飞行敌兵
  for (const f of LV.flyers) {
    if (f.dead) continue;
    const fr = Sprites[f.bat ? 'bat' : 'bird'][Math.floor(f.t / 9) % 2];
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(2, 2);
    ctx.drawImage(fr, -16, -10);
    ctx.restore();
  }
}
function drawPlayer() {
  if (P.deadT && P.deadT < 40) {   // 死亡旋转飞出
    ctx.save();
    ctx.translate(P.x + P.w / 2, P.y + P.h / 2);
    ctx.rotate((55 - P.deadT) * 0.2);
    ctx.drawImage(Sprites.player[0], -16, -16, 32, 32);
    ctx.restore();
    return;
  }
  if (P.iframes > 0 && Math.floor(G.t / 4) % 2 === 0) return;
  let fr;
  if (!P.onGround) fr = Sprites.player[2];
  else if (Math.abs(P.vx) > 0.4) fr = Math.floor(P.anim) % 2 === 0 ? Sprites.player[1] : Sprites.player[0];
  else fr = Sprites.player[0];
  const sq = P.squash;
  ctx.save();
  ctx.translate(P.x + P.w / 2, P.y + P.h);
  ctx.scale(P.face * (1 - sq * 0.3), 1 + sq * 0.4);
  ctx.drawImage(fr, -16, -32, 32, 32);
  // 头顶显示携带的方块
  if (P.blocks > 0) {
    ctx.fillStyle = LV.biome.dirt; ctx.fillRect(-5, -38, 10, 7);
    ctx.fillStyle = LV.biome.grass; ctx.fillRect(-5, -38, 10, 2.5);
  }
  ctx.restore();
}
function drawDarkness() {
  dkx.clearRect(0, 0, VW, VH);
  dkx.fillStyle = 'rgba(3,5,14,0.94)';
  dkx.fillRect(0, 0, VW, VH);
  const hole = (x, y, r, a = 1) => {
    const g = dkx.createRadialGradient(x - G.cam.x, y - G.cam.y, r * 0.15, x - G.cam.x, y - G.cam.y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    dkx.globalCompositeOperation = 'destination-out';
    dkx.fillStyle = g;
    dkx.beginPath(); dkx.arc(x - G.cam.x, y - G.cam.y, r, 0, 7); dkx.fill();
    dkx.globalCompositeOperation = 'source-over';
  };
  const base = SAVE.up.lamp ? 265 : 150;
  hole(P.x + P.w / 2, P.y + P.h / 2, base + (P.lightBoost > 0 ? 60 : 0));
  for (const g of LV.bugs) if (!g.got) hole(g.x, g.y, 66 + Math.sin(G.t * 0.1 + g.ph) * 10, 0.9);
  for (const f of LV.flyers) if (!f.dead) hole(f.x, f.y, 26, 0.65);   // 黑暗里一双双发光的眼
  hole(LV.shrine.x * T + 16, LV.shrine.y * T, 90, 0.9);
  for (const n of LV.npcs) if (n.id === 'zhulong') hole(n.px + 16, n.feet - 20, 130 + Math.sin(G.t * 0.02) * 40, 0.95);
  ctx.drawImage(DK, 0, 0);
}
function drawHUD() {
  // 生命
  for (let i = 0; i < P.maxHearts; i++) {
    ctx.globalAlpha = i < P.hearts ? 1 : 0.25;
    ctx.drawImage(Sprites.heart, 14 + i * 26, 12, 22, 20);
  }
  ctx.globalAlpha = 1;
  // 方块库存
  ctx.fillStyle = LV.biome.dirt; ctx.fillRect(16, 42, 16, 16);
  ctx.fillStyle = LV.biome.grass; ctx.fillRect(16, 42, 16, 5);
  txt(ctx, '× ' + P.blocks, 38, 55, { size: 16, color: '#fff', stroke: '#000' });
  // 星屑
  const got = LV.stars.filter(s => s.got).length;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i < got ? 1 : 0.25;
    ctx.drawImage(Sprites.star, 90 + i * 22, 44, 16, 16);
  }
  ctx.globalAlpha = 1;
  // 五色石进度
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(VW - 26 - i * 24, 24, 8, 0, 7);
    ctx.fillStyle = SAVE.stones[i] ? STONE_COLORS[i + 1] : 'rgba(255,255,255,.15)';
    ctx.fill();
    if (SAVE.stones[i]) { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke(); }
  }
  // 冲刺冷却
  if (SAVE.up.dash) {
    const r = 1 - P.dashCd / 42;
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(30, 92, 10, 0, 7); ctx.stroke();
    ctx.strokeStyle = r >= 1 ? '#ffd23f' : 'rgba(255,210,63,.5)';
    ctx.beginPath(); ctx.arc(30, 92, 10, -1.57, -1.57 + r * 6.28); ctx.stroke();
    txt(ctx, '冲', 30, 97, { size: 11, color: '#fff', align: 'center', stroke: '#000' });
  }
  // 关卡名 / 静音
  txt(ctx, BIOMES[G.level].name, VW - 16, 52, { size: 14, color: 'rgba(255,255,255,.7)', align: 'right', stroke: 'rgba(0,0,0,.5)' });
  if (AudioMan.muted) txt(ctx, '🔇', VW - 24, 80, { size: 16, align: 'right' });
  // 开场横幅
  if (G.banner > 0) {
    const a = clamp(Math.min(G.banner, 60) / 60, 0, 1) * 0.9;
    ctx.fillStyle = `rgba(10,12,26,${a * 0.55})`;
    ctx.fillRect(0, VH / 2 - 64, VW, 104);
    txt(ctx, BIOMES[G.level].name, VW / 2, VH / 2 - 18, { size: 34, color: STONE_COLORS[G.level], align: 'center', stroke: '#000', alpha: a });
    txt(ctx, BIOMES[G.level].hint, VW / 2, VH / 2 + 18, { size: 16, color: '#fff', align: 'center', stroke: '#000', alpha: a * 0.9 });
  }
}
function drawToasts() {
  TOASTS.forEach((t, i) => {
    const a = clamp(t.t / 30, 0, 1);
    txt(ctx, t.msg, VW / 2, 100 + i * 28, { size: 17, color: t.color, align: 'center', stroke: '#000', alpha: a });
  });
}
function drawDialogBox() {
  const spec = DLG.spec;
  const H = 128, Y = VH - H - 12;
  ctx.fillStyle = 'rgba(12,15,30,.93)';
  rr(ctx, 16, Y, VW - 32, H, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,63,.55)'; ctx.lineWidth = 2;
  rr(ctx, 16, Y, VW - 32, H, 12); ctx.stroke();
  // 立绘
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  rr(ctx, 28, Y + 12, 96, H - 24, 8); ctx.fill();
  if (spec.spr && NPC_SPR[spec.spr]) ctx.drawImage(NPC_SPR[spec.spr], 44, Y + 16, 64, 64);
  txt(ctx, spec.speaker, 140, Y + 30, { size: 18, color: '#ffd23f', stroke: '#000' });
  const line = spec.lines[DLG.idx];
  const shown = line.slice(0, Math.floor(DLG.shown));
  const rows = wrapText(ctx, shown, VW - 200, 17);
  rows.forEach((r, i) => txt(ctx, r, 140, Y + 58 + i * 24, { size: 17, color: '#fff' }));
  const last = DLG.idx === spec.lines.length - 1 && DLG.shown >= line.length;
  txt(ctx, last ? '▼ 结束' : '▼ 继续', VW - 44, Y + H - 14, { size: 13, color: 'rgba(255,255,255,.6)', align: 'right' });
}

/* ---------------- 各状态渲染 ---------------- */
function renderPlay() {
  ctx.save();
  if (G.shake > 0) { G.shake--; ctx.translate((Math.random() - .5) * G.shake, (Math.random() - .5) * G.shake); }
  drawSky(); drawHills();
  ctx.translate(-Math.round(G.cam.x), -Math.round(G.cam.y));
  drawTiles(); drawEntities(); drawPlayer();
  PARTS.draw(ctx, G.cam);
  ctx.restore();
  if (LV.biome.dark) drawDarkness();
  drawHUD();
  drawToasts();
  if (DLG.active) drawDialogBox();
  if (P.deadT) {
    const a = clamp((55 - P.deadT) / 30, 0, 1) * 0.75;
    ctx.fillStyle = `rgba(8,6,14,${a})`; ctx.fillRect(0, 0, VW, VH);
    txt(ctx, G.deadTip, VW / 2, VH / 2, { size: 26, color: '#ffb0b0', align: 'center', stroke: '#000' });
  }
}
function renderTitle() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#141a3a'); g.addColorStop(0.6, '#2a2450'); g.addColorStop(1, '#4a3670');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 70; i++) {
    const sx = (hash2(i, 3) * 1300 + G.t * (0.2 + hash2(i, 5) * 0.3)) % VW;
    const sy = hash2(i, 9) * VH;
    ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(G.t * 0.02 + i));
    ctx.fillStyle = ['#3ecf8e', '#ff5d5d', '#f2f6fa', '#4a4e69', '#ffd23f'][i % 5];
    ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.globalAlpha = 1;
  // 大标题（五色石三字分色）
  const title = '五色石';
  ctx.font = 'bold 72px "PingFang SC","Microsoft YaHei",sans-serif';
  const w0 = ctx.measureText(title).width;
  const tx0 = VW / 2 - (w0 + ctx.measureText('·补天记').width) / 2;
  let cx = tx0;
  for (const ch of title) {
    const cw = ctx.measureText(ch).width;
    txt(ctx, ch, cx + cw / 2, 205, { size: 72, align: 'center', color: STONE_COLORS['五色石'.indexOf(ch) + 1], stroke: '#0a0c1a', strokeW: 9 });
    cx += cw;
  }
  txt(ctx, '·补天记', cx, 205, { size: 72, color: '#fff', stroke: '#0a0c1a', strokeW: 9 });
  txt(ctx, '迷你沙盒 × 上古补天神话', VW / 2, 248, { size: 19, color: '#c9c2e8', align: 'center', stroke: '#0a0c1a' });
  // 小精卫
  const bob = Math.sin(G.t * 0.05) * 8;
  ctx.drawImage(Sprites.player[Math.floor(G.t / 30) % 2], VW / 2 - 32, 300 + bob, 64, 64);
  if (SAVE.cleared) txt(ctx, '✦ 天已补好 · 五色常在', VW / 2, 278, { size: 15, color: '#ffd23f', align: 'center', stroke: '#000' });
  if (Math.floor(G.t / 35) % 2 === 0)
    txt(ctx, '按 回车 开始', VW / 2, 420, { size: 24, color: '#fff', align: 'center', stroke: '#000' });
  txt(ctx, 'M 音效 · 进度自动保存 · 纯键盘操作', VW / 2, 462, { size: 14, color: 'rgba(255,255,255,.55)', align: 'center' });
  txt(ctx, '剧情/美工/代码：ZCode 与 小精卫', VW / 2, VH - 18, { size: 12, color: 'rgba(255,255,255,.35)', align: 'center' });
}
const MAP_NODES = [
  { x: 690, y: 250, lvl: 1, label: '东 · 青木林' },
  { x: 480, y: 412, lvl: 2, label: '南 · 焰霞坡' },
  { x: 270, y: 250, lvl: 3, label: '西 · 琼霜原' },
  { x: 480, y: 96, lvl: 4, label: '北 · 玄渊窟' },
  { x: 480, y: 258, lvl: 5, label: '中 · 昆仑墟' }
];
function renderMap() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#0c1238'); g.addColorStop(1, '#232048');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  txt(ctx, '五方 · 寻石', VW / 2, 60, { size: 34, color: '#fff', align: 'center', stroke: '#000' });
  const total = SAVE.stars.flat().filter(Boolean).length;
  txt(ctx, `星屑 ${total}/15 · 阵亡 ${SAVE.deaths} 次`, VW / 2, 92, { size: 15, color: '#c9c2e8', align: 'center' });
  // 路径
  ctx.strokeStyle = 'rgba(255,255,255,.22)';
  ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
  ctx.beginPath();
  MAP_NODES.forEach((n, i) => i ? ctx.lineTo(n.x, n.y) : ctx.moveTo(n.x, n.y));
  ctx.stroke(); ctx.setLineDash([]);
  for (const n of MAP_NODES) {
    const locked = n.lvl > SAVE.unlocked;
    const sel = MAP_NODES[G.mapSel] === n;
    const col = STONE_COLORS[n.lvl];
    // 节点
    ctx.beginPath(); ctx.arc(n.x, n.y, sel ? 26 : 21, 0, 7);
    ctx.fillStyle = locked ? 'rgba(255,255,255,.08)' : (SAVE.stones[n.lvl - 1] ? col : 'rgba(255,255,255,.16)');
    ctx.fill();
    ctx.strokeStyle = locked ? 'rgba(255,255,255,.2)' : col;
    ctx.lineWidth = sel ? 4 : 2.5;
    ctx.stroke();
    if (sel) {
      ctx.globalAlpha = 0.35 + Math.sin(G.t * 0.1) * 0.2;
      ctx.beginPath(); ctx.arc(n.x, n.y, 34, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 关卡序号 / 石
    txt(ctx, locked ? '🔒' : ['青', '赤', '白', '黑', '黄'][n.lvl - 1], n.x, n.y + 8, { size: 20, color: locked ? '#888' : '#0a0c1a', align: 'center', bold: true });
    txt(ctx, n.label, n.x, n.y + 48, { size: 15, color: locked ? 'rgba(255,255,255,.35)' : '#fff', align: 'center', stroke: '#000' });
    // 星
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = SAVE.stars[n.lvl - 1][i] ? 1 : 0.2;
      ctx.drawImage(Sprites.star, n.x - 24 + i * 17, n.y + 56, 14, 14);
    }
    ctx.globalAlpha = 1;
  }
  txt(ctx, '←→ 选择 · 回车 出发 · Esc 标题', VW / 2, VH - 24, { size: 15, color: 'rgba(255,255,255,.6)', align: 'center' });
}
function renderWin() {
  renderPlay();
  const col = STONE_COLORS[G.level];
  ctx.fillStyle = 'rgba(8,10,22,.62)'; ctx.fillRect(0, 0, VW, VH);
  txt(ctx, `五色石之 · ${STONE_NAMES[G.level]} 归位！`, VW / 2, VH / 2 - 30, { size: 36, color: col, align: 'center', stroke: '#000' });
  const got = LV.stars.filter(s => s.got).length;
  txt(ctx, `本关星屑 ${got}/3`, VW / 2, VH / 2 + 16, { size: 19, color: '#ffd23f', align: 'center', stroke: '#000' });
  if (G.level < 5)
    txt(ctx, '下一方已解锁', VW / 2, VH / 2 + 48, { size: 15, color: 'rgba(255,255,255,.7)', align: 'center' });
}
function renderCut() {
  const c = G.cut;
  c.t++;
  // 夜空 → 破晓
  let top = [12, 18, 56], bot = [42, 36, 80];
  if (c.t > 320) {
    const k = clamp((c.t - 320) / 240, 0, 1);
    top = [lerp(12, 100, k), lerp(18, 160, k), lerp(56, 230, k)];
    bot = [lerp(42, 255, k), lerp(36, 200, k), lerp(80, 130, k)];
  }
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, `rgb(${top.map(Math.round)})`);
  g.addColorStop(1, `rgb(${bot.map(Math.round)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 80; i++) {
    ctx.globalAlpha = (0.5 + 0.5 * Math.sin(G.t * 0.02 + i)) * clamp(1 - (c.t - 320) / 200, 0.1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(hash2(i, 3) * VW, hash2(i, 9) * VH * 0.7, 2, 2);
  }
  ctx.globalAlpha = 1;
  // 天洞与补丁
  const hx = VW / 2, hy = 130;
  const seal = clamp((c.t - 300) / 80, 0, 1);
  if (seal < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - seal;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#1a1030' : '#0a0618';
      ctx.beginPath();
      ctx.ellipse(hx, hy, 100 - i * 15 + Math.sin(c.t * 0.05 + i) * 5, 40 - i * 6, 0, 0, 7);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(160,120,255,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(hx, hy, 104, 42, 0, 0, 7); ctx.stroke();
    ctx.restore();
  }
  // 五色石飞升
  for (let k = 0; k < 5; k++) {
    const t0 = 70 + k * 34, t1 = t0 + 55;
    if (c.t < t0 || c.t > t1 + 10) {
      if (c.t === t0) AudioMan.sfx('star');
      continue;
    }
    const q = clamp((c.t - t0) / (t1 - t0), 0, 1);
    const e = q * q * (3 - 2 * q);
    const sx = VW / 2 + (k - 2) * 150, sy = VH + 60;
    const mx = sx + (hx - sx) * 0.3, my = 40;
    const x = lerp(lerp(sx, mx, e), lerp(mx, hx, e), e);
    const y = lerp(lerp(sy, my, e), lerp(my, hy, e), e);
    ctx.save();
    ctx.shadowColor = STONE_COLORS[k + 1]; ctx.shadowBlur = 20;
    ctx.fillStyle = STONE_COLORS[k + 1];
    ctx.translate(x, y); ctx.rotate(c.t * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(10, 0); ctx.lineTo(0, 13); ctx.lineTo(-10, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 白闪
  if (c.t >= 295 && c.t < 330) {
    ctx.fillStyle = `rgba(255,255,255,${1 - Math.abs(c.t - 312) / 18})`;
    ctx.fillRect(0, 0, VW, VH);
  }
  // 彩虹（女娲的针脚）
  if (c.t > 400) {
    const a = clamp((c.t - 400) / 140, 0, 1) * 0.55;
    const cols = ['#ff5d5d', '#ffd23f', '#3ecf8e', '#6fa8ff', '#4a4e69'];
    ctx.lineCap = 'round';
    cols.forEach((col, i) => {
      ctx.strokeStyle = col; ctx.globalAlpha = a;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(VW / 2, VH + 260, 620 - i * 13, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  // 云台上的女娲与小精卫剪影
  ctx.fillStyle = 'rgba(30,22,50,.9)';
  ctx.beginPath(); ctx.ellipse(150, VH - 46, 120, 30, 0, 0, 7); ctx.fill();
  ctx.drawImage(Sprites.nuwa, 120, VH - 118, 64, 64);
  ctx.drawImage(Sprites.player[0], 190, VH - 104, 48, 48);
  // 字幕
  if (c.t > 340) {
    const idx = c.line;
    if (idx < CUT_LINES.length) {
      ctx.fillStyle = 'rgba(10,12,26,.8)';
      rr(ctx, 100, VH - 150, VW - 200, 76, 10); ctx.fill();
      const rows = wrapText(ctx, CUT_LINES[idx], VW - 250, 19);
      rows.forEach((r, i) => txt(ctx, r, VW / 2, VH - 116 + i * 28, { size: 19, color: idx === CUT_LINES.length - 1 ? '#ffd23f' : '#fff', align: 'center' }));
      txt(ctx, '▼', VW / 2, VH - 60, { size: 13, color: 'rgba(255,255,255,.5)', align: 'center' });
    } else {
      const total = SAVE.stars.flat().filter(Boolean).length;
      const mm = String(Math.floor(SAVE.time / 60)).padStart(2, '0');
      const ss = String(Math.floor(SAVE.time % 60)).padStart(2, '0');
      txt(ctx, `— 天，补好了 —`, VW / 2, 210, { size: 34, color: '#ffd23f', align: 'center', stroke: '#000' });
      txt(ctx, `星屑 ${total}/15 · 阵亡 ${SAVE.deaths} 次 · 历时 ${mm}:${ss}`, VW / 2, 258, { size: 18, color: '#fff', align: 'center', stroke: '#000' });
      if (total < 15) txt(ctx, '（集齐 15 枚星屑，可再见五色极光）', VW / 2, 292, { size: 14, color: 'rgba(255,255,255,.6)', align: 'center' });
      if (Math.floor(G.t / 35) % 2 === 0)
        txt(ctx, '按 回车 回到标题', VW / 2, 350, { size: 20, color: '#fff', align: 'center', stroke: '#000' });
    }
  }
}
function renderPause() {
  renderPlay();
  ctx.fillStyle = 'rgba(8,10,22,.7)'; ctx.fillRect(0, 0, VW, VH);
  txt(ctx, '暂停', VW / 2, 190, { size: 40, color: '#fff', align: 'center', stroke: '#000' });
  const items = ['Esc 继续', 'R 重玩本关', 'Q 回五方地图', 'M 音效开关'];
  items.forEach((s, i) => txt(ctx, s, VW / 2, 250 + i * 36, { size: 19, color: '#c9c2e8', align: 'center', stroke: '#000' }));
  const got = LV.stars.filter(s => s.got).length;
  txt(ctx, `${BIOMES[G.level].name} · 星屑 ${got}/3 · 方块 ${P.blocks}`, VW / 2, 420, { size: 15, color: 'rgba(255,255,255,.55)', align: 'center' });
}

/* ---------------- 场景切换 ---------------- */
function gotoTitle() { G.state = 'title'; AudioMan.bgmStop(); }
function gotoMap() {
  G.state = 'map';
  G.mapSel = clamp(SAVE.unlocked - 1, 0, 4);
  AudioMan.bgmStart({ root: 220, tempo: 88, seed: 5 });
}

/* ---------------- 主循环 ---------------- */
function step() {
  G.t++;
  if (kMuteP()) { const m = AudioMan.toggleMute(); SAVE.mute = m; save(); toast(m ? '音效关' : '音效开'); }
  if (G.banner > 0 && G.state === 'play') G.banner--;
  TOASTS.forEach(t => t.t--);
  while (TOASTS.length && TOASTS[0].t <= 0) TOASTS.shift();
  switch (G.state) {
    case 'title':
      if (!DLG.active && Input.p('Enter')) {
        if (!SAVE.intro) openDialog({ speaker: DIALOGUE.intro.speaker, spr: DIALOGUE.intro.spr, lines: DIALOGUE.intro.lines },
          () => { SAVE.intro = true; save(); gotoMap(); });
        else gotoMap();
      }
      if (DLG.active) updateDialog();
      break;
    case 'map':
      if (Input.p('ArrowLeft') || Input.p('KeyA')) { G.mapSel = (G.mapSel + 4) % 5; AudioMan.sfx('ui'); }
      if (Input.p('ArrowRight') || Input.p('KeyD')) { G.mapSel = (G.mapSel + 1) % 5; AudioMan.sfx('ui'); }
      if (Input.p('Escape')) gotoTitle();
      if (Input.p('Enter')) {
        const lvl = MAP_NODES[G.mapSel].lvl;
        if (lvl <= SAVE.unlocked) { AudioMan.sfx('ui'); startLevel(lvl); }
        else toast('先取前一方五色石', '#ff8f8f');
      }
      break;
    case 'play':
      SAVE.time += 1 / 60;
      if (DLG.active) { updateDialog(); break; }
      if (kPauseP()) { G.state = 'pause'; break; }
      updatePlayer();
      if (!P.deadT) {
        updateEntities();
        const n = npcNear();
        if (n && (Input.p('KeyE') || Input.p('KeyZ'))) talkTo(n);
      }
      ambient();
      PARTS.update();
      // 相机
      const tx = clamp(P.x + P.w / 2 - VW / 2, 0, Math.max(0, LV.w * T - VW));
      const ty = clamp(P.y + P.h / 2 - VH / 2 - 30, 0, Math.max(0, LV.h * T - VH));
      G.cam.x = lerp(G.cam.x, tx, 0.12);
      G.cam.y = lerp(G.cam.y, ty, 0.12);
      break;
    case 'pause':
      if (kPauseP() || Input.p('Enter')) G.state = 'play';
      if (Input.p('KeyR')) startLevel(G.level);
      if (Input.p('KeyQ')) gotoMap();
      break;
    case 'win':
      G.winT++;
      if (G.level === 5 && SAVE.stones[0] && SAVE.stones[1] && SAVE.stones[2] && SAVE.stones[3]) {
        // 天洞就在头顶——直接进入补天
        if (G.winT > 80) {
          SAVE.cleared = true; save();
          G.cut = { t: 0, line: 0 };
          G.state = 'cut';
          AudioMan.bgmStart({ root: 262, tempo: 90, seed: 99 });
        }
      } else if (G.winT > 150 || (G.winT > 30 && kTalkP())) {
        gotoMap();
      }
      break;
    case 'cut':
      PARTS.update();
      if (G.cut.t > 350) {
        if (G.cut.line < CUT_LINES.length) {
          if (kTalkP()) { G.cut.line++; AudioMan.sfx('ui'); }
        } else if (Input.p('Enter')) {
          SAVE.cleared = true; save(); gotoTitle();
        }
      }
      break;
  }
}
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;
  switch (G.state) {
    case 'title': renderTitle(); if (DLG.active) { ctx.fillStyle = 'rgba(5,6,14,.6)'; ctx.fillRect(0, 0, VW, VH); drawDialogBox(); } break;
    case 'map': renderMap(); break;
    case 'play': renderPlay(); break;
    case 'pause': renderPause(); break;
    case 'win': renderWin(); break;
    case 'cut': renderCut(); break;
  }
  if (G.state !== 'play') drawToasts();
}
let last = 0, acc = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!last) last = ts;
  let dt = (ts - last) / 1000; last = ts;
  if (dt > 0.25) dt = 0.25;
  acc += dt;
  while (acc >= 1 / 60) { step(); acc -= 1 / 60; }
  render();
  Input.endFrame();
}
G.autoPause = () => { if (G.state === 'play' && !DLG.active) G.state = 'pause'; };
Input.onBlur = () => G.autoPause();
Input.init();
requestAnimationFrame(loop);
