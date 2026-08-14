'use strict';
/* =====================================================
 * 像素桌球 RETRO POOL
 * 物理引擎 + 三种模式 + Web Audio 芯片音乐
 * ===================================================== */

/* ---------------- 常量 ---------------- */
const W = 360, H = 700, BORDER = 14;
const FX0 = BORDER, FY0 = BORDER, FX1 = W - BORDER, FY1 = H - BORDER;
const BALL_R = 11, POCKET_R = 19;
const POCKETS = [
  { x: FX0, y: FY0 }, { x: FX1, y: FY0 },
  { x: FX0, y: FY1 }, { x: FX1, y: FY1 },
  { x: FX0, y: (FY0 + FY1) / 2 }, { x: FX1, y: (FY0 + FY1) / 2 },
];
const HEAD = { x: 180, y: 180 };
const FRICTION = 0.986;
const STOP_EPS = 0.03;
const REST_WALL = 0.92;
const BALL_COLORS = ['#ff4757', '#ffd93d', '#3de0ff', '#b15bff', '#ff8c42', '#2ed573'];

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tableWrap = document.getElementById('tableWrap');
const $ = id => document.getElementById(id);

/* ---------------- 音频引擎 ---------------- */
const AudioEngine = {
  ctx: null, master: null, musicGain: null, sfxGain: null,
  musicOn: true, playing: false, tempo: 104,
  step: 0, nextTime: 0, timerId: null, noiseBuf: null,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.master);
    const len = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); },
  freq(m) { return 440 * Math.pow(2, (m - 69) / 12); },

  /* A 小调放克循环，8 小节 */
  MELODY: [
    [69,1],[72,.5],[76,.5],[81,1],[79,.5],[76,.5],
    [74,.5],[76,.5],[79,.5],[74,.5],[72,1],[69,1],
    [69,1],[72,.5],[76,.5],[81,1],[84,.5],[81,.5],
    [79,.5],[76,.5],[74,.5],[76,.5],[72,1],[74,1],
    [69,1],[72,.5],[76,.5],[81,1],[79,.5],[76,.5],
    [74,.5],[76,.5],[79,.5],[81,.5],[79,.5],[76,.5],[74,1],
    [77,.5],[76,.5],[74,.5],[77,.5],[76,1],[79,1],
    [81,2],[79,.5],[76,.5],[74,1],
  ],
  BASS: [
    [33,1.5],[33,.5],[40,1],[33,1],
    [38,1.5],[38,.5],[33,1],[38,1],
    [41,1.5],[41,.5],[36,1],[41,1],
    [40,1.5],[40,.5],[43,1],[40,1],
    [33,1.5],[33,.5],[40,1],[33,1],
    [38,1.5],[38,.5],[33,1],[38,1],
    [41,1],[36,1],[43,1],[40,1],
    [33,2],[40,1],[33,1],
  ],

  buildEvents(score) {
    const ev = {};
    let s = 0;
    for (const [m, beats] of score) {
      const ds = Math.round(beats * 2);
      (ev[s] = ev[s] || []).push({ m, ds });
      s += ds;
    }
    return ev;
  },
  startMusic() {
    if (!this.ctx || this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.06;
    this.melodyEvents = this.buildEvents(this.MELODY);
    this.bassEvents = this.buildEvents(this.BASS);
    this.timerId = setInterval(() => this.scheduler(), 25);
  },
  stopMusic() {
    this.playing = false;
    if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
  },
  scheduler() {
    if (!this.playing) return;
    const sd = 60 / this.tempo / 2;
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      if (this.musicOn) this.playStep(this.step, this.nextTime, sd);
      this.nextTime += sd;
      this.step = (this.step + 1) % 64;
    }
  },
  playStep(step, t, sd) {
    const m = this.melodyEvents[step];
    if (m) for (const n of m) if (n.m > 0) this.tone(this.freq(n.m), t, n.ds * sd * 0.9, 'square', 0.11);
    const b = this.bassEvents[step];
    if (b) for (const n of b) if (n.m > 0) this.tone(this.freq(n.m), t, n.ds * sd * 0.9, 'triangle', 0.3);
    const beat = step % 8;
    if (beat === 0 || beat === 4) this.drumKick(t);
    if (beat === 2 || beat === 6) this.drumSnare(t);
    this.drumHat(t, beat % 2 === 1 ? 0.07 : 0.04);
  },
  tone(freq, t, dur, type, vol, dest) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest || this.musicGain);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(t, dur, vol, filterType, freq, dest) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = filterType; f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(dest || this.sfxGain);
    s.start(t); s.stop(t + dur + 0.02);
  },
  drumKick(t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.11);
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g).connect(this.musicGain);
    o.start(t); o.stop(t + 0.15);
  },
  drumSnare(t) { this.noise(t, 0.09, 0.13, 'bandpass', 1900, this.musicGain); },
  drumHat(t, v) { this.noise(t, 0.035, v, 'highpass', 7500, this.musicGain); },

  /* ---- 音效 ---- */
  now() { return this.ctx ? this.ctx.currentTime : 0; },
  click() { if (this.ctx) this.tone(880, this.now(), 0.05, 'square', 0.12, this.sfxGain); },
  shoot(p) {
    if (!this.ctx) return;
    this.noise(this.now(), 0.06, 0.25, 'lowpass', 1200);
    this.tone(160 + p * 80, this.now(), 0.08, 'triangle', 0.3, this.sfxGain);
  },
  hit(f) {
    if (!this.ctx) return;
    this.tone(320 + f * 420, this.now(), 0.045, 'square', 0.06 + f * 0.16, this.sfxGain);
  },
  cushionSfx(f) {
    if (!this.ctx) return;
    this.tone(170, this.now(), 0.05, 'triangle', 0.05 + f * 0.1, this.sfxGain);
  },
  pocket() {
    if (!this.ctx) return;
    const t = this.now();
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(760, t);
    o.frequency.exponentialRampToValueAtTime(190, t + 0.16);
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(this.sfxGain);
    o.start(t); o.stop(t + 0.2);
  },
  foul() {
    if (!this.ctx) return;
    const t = this.now();
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(150, t);
    o.frequency.linearRampToValueAtTime(85, t + 0.3);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g).connect(this.sfxGain);
    o.start(t); o.stop(t + 0.34);
  },
  bumper() {
    if (!this.ctx) return;
    this.tone(520, this.now(), 0.07, 'square', 0.16, this.sfxGain);
    this.tone(780, this.now() + 0.04, 0.07, 'square', 0.12, this.sfxGain);
  },
  star() {
    if (!this.ctx) return;
    const t = this.now();
    [88, 93, 100].forEach((m, i) => this.tone(this.freq(m), t + i * 0.07, 0.16, 'square', 0.14, this.sfxGain));
  },
  explode() {
    if (!this.ctx) return;
    const t = this.now();
    this.noise(t, 0.45, 0.5, 'lowpass', 900);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(this.sfxGain);
    o.start(t); o.stop(t + 0.5);
  },
  win() {
    if (!this.ctx) return;
    const t = this.now();
    [81, 85, 88, 93, 88, 93].forEach((m, i) => this.tone(this.freq(m), t + i * 0.11, 0.28, 'square', 0.14, this.sfxGain));
  },
  lose() {
    if (!this.ctx) return;
    const t = this.now();
    [74, 70, 67, 62].forEach((m, i) => this.tone(this.freq(m), t + i * 0.16, 0.3, 'sawtooth', 0.12, this.sfxGain));
  },
  toggleMusic() { this.musicOn = !this.musicOn; return this.musicOn; },
};

/* ---------------- 存档 ---------------- */
const store = {
  get bestClassic() { return +localStorage.getItem('rp_best_classic') || 0; },
  set bestClassic(v) { localStorage.setItem('rp_best_classic', v); },
  get bestTime() { return +localStorage.getItem('rp_best_time') || 0; },
  set bestTime(v) { localStorage.setItem('rp_best_time', v); },
  get stars() { try { return JSON.parse(localStorage.getItem('rp_stars')) || []; } catch { return []; } },
  set stars(v) { localStorage.setItem('rp_stars', JSON.stringify(v)); },
  get unlocked() { return +localStorage.getItem('rp_unlocked') || 0; },
  set unlocked(v) { localStorage.setItem('rp_unlocked', v); },
};

/* ---------------- 球 ---------------- */
class Ball {
  constructor(x, y, color, type = 'target') {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.color = color; this.type = type; this.alive = true;
  }
  speed() { return Math.hypot(this.vx, this.vy); }
}

/* ---------------- 关卡 ---------------- */
const LEVELS = [
  {
    name: '直线入门', shots: 3, hint: '直线击球，熟悉手感',
    setup() {
      cueAt(180, 180);
      [[150, 430], [180, 520], [210, 610]].forEach((p, i) => targetAt(p[0], p[1], i));
    },
  },
  {
    name: '炸弹惊喜', shots: 2, hint: '把炸弹球轰进袋，炸散它们！',
    setup() {
      cueAt(180, 170);
      Game.balls.push(new Ball(180, 520, '#2f3542', 'bomb'));
      [[158, 498], [202, 498], [158, 542], [202, 542]].forEach((p, i) => targetAt(p[0], p[1], i));
    },
  },
  {
    name: '黑洞效应', shots: 3, hint: '黑洞弯曲轨迹，也是免费袋口',
    hole: [180, 400],
    setup() {
      cueAt(180, 160);
      [[120, 510], [240, 510], [180, 580]].forEach((p, i) => targetAt(p[0], p[1], i));
    },
  },
  {
    name: '保险杠阵', shots: 3, hint: '利用保险杠反弹进球',
    bumpers: [[110, 380], [250, 380]],
    setup() {
      cueAt(180, 170);
      [[100, 530], [180, 570], [260, 530]].forEach((p, i) => targetAt(p[0], p[1], i));
    },
  },
  {
    name: '一杆进洞', shots: 1, hint: '直线被挡住了，试试翻袋！',
    bumpers: [[158, 380], [202, 380]],
    setup() {
      cueAt(180, 150);
      targetAt(180, 600, 0);
    },
  },
  {
    name: '大师考验', shots: 3, hint: '炸弹 + 黑洞 + 保险杠，祝好运',
    hole: [180, 420],
    bumpers: [[90, 300], [270, 300]],
    setup() {
      cueAt(180, 160);
      Game.balls.push(new Ball(180, 545, '#2f3542', 'bomb'));
      [[140, 575], [220, 575], [180, 615]].forEach((p, i) => targetAt(p[0], p[1], i));
    },
  },
];

function cueAt(x, y) { Game.balls.push(new Ball(x, y, '#f8f8f8', 'cue')); }
function targetAt(x, y, i) { Game.balls.push(new Ball(x, y, BALL_COLORS[i % BALL_COLORS.length])); }

/* ---------------- 游戏状态 ---------------- */
const Game = {
  state: 'menu',          // menu | aim | roll | over
  mode: null,             // classic | time | puzzle
  balls: [],
  bumpers: [],
  blackHole: null,
  particles: [],
  score: 0, shots: 0, shotsLeft: 0, timeLeft: 0, combo: 0,
  level: 0,
  pocketedThisShot: [],
  foulThisShot: false,
  aiming: false,
  aimDir: { x: 0, y: 1 },
  aimPower: 0,
  shake: 0, flash: 0,
  timerId: null,
  timerPaused: false,
};

function getCue() { return Game.balls.find(b => b.type === 'cue' && b.alive); }
function remainingTargets() { return Game.balls.filter(b => b.alive && b.type === 'target').length; }
function allStopped() { return Game.balls.every(b => !b.alive || b.speed() < STOP_EPS * 2); }

/* ---------------- 物理 ---------------- */
function physics(dt) {
  const steps = 2;
  for (let s = 0; s < steps; s++) substep(dt / steps);
}

function substep(dt) {
  const hole = Game.blackHole;
  for (const b of Game.balls) {
    if (!b.alive) continue;

    // 黑洞引力
    if (hole) {
      const dx = hole.x - b.x, dy = hole.y - b.y, d = Math.hypot(dx, dy);
      if (d < 13) { pocketBall(b, hole); continue; }
      if (d < 140) {
        const a = Math.min(0.5, 3200 / (d * d)) * dt;
        b.vx += dx / d * a; b.vy += dy / d * a;
      }
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const f = Math.pow(FRICTION, dt);
    b.vx *= f; b.vy *= f;
    if (b.speed() < STOP_EPS) { b.vx = 0; b.vy = 0; }
    cushion(b);
  }

  // 球-球碰撞
  const bs = Game.balls;
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      if (bs[i].alive && bs[j].alive) collide(bs[i], bs[j]);
    }
  }

  // 保险杠
  for (const bp of Game.bumpers) {
    for (const b of bs) if (b.alive) bumperCollide(b, bp);
  }

  // 袋口
  for (const b of bs) {
    if (!b.alive) continue;
    for (const p of POCKETS) {
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d < 30) {
        const s = 0.14 * dt;
        b.vx += (p.x - b.x) / d * s;
        b.vy += (p.y - b.y) / d * s;
      }
      if (d < POCKET_R - 2) { pocketBall(b, p); break; }
    }
  }
}

function nearPocket(x, y, pad) {
  for (const p of POCKETS) if (Math.hypot(p.x - x, p.y - y) < pad) return true;
  return false;
}

function cushion(b) {
  const pad = 30;
  const sp = b.speed();
  if (b.x < FX0 + BALL_R) {
    if (!nearPocket(b.x, b.y, pad)) {
      b.x = FX0 + BALL_R; b.vx = Math.abs(b.vx) * REST_WALL;
      if (sp > 1.5) AudioEngine.cushionSfx(Math.min(1, sp / 16));
    }
  } else if (b.x > FX1 - BALL_R) {
    if (!nearPocket(b.x, b.y, pad)) {
      b.x = FX1 - BALL_R; b.vx = -Math.abs(b.vx) * REST_WALL;
      if (sp > 1.5) AudioEngine.cushionSfx(Math.min(1, sp / 16));
    }
  }
  if (b.y < FY0 + BALL_R) {
    if (!nearPocket(b.x, b.y, pad)) {
      b.y = FY0 + BALL_R; b.vy = Math.abs(b.vy) * REST_WALL;
      if (sp > 1.5) AudioEngine.cushionSfx(Math.min(1, sp / 16));
    }
  } else if (b.y > FY1 - BALL_R) {
    if (!nearPocket(b.x, b.y, pad)) {
      b.y = FY1 - BALL_R; b.vy = -Math.abs(b.vy) * REST_WALL;
      if (sp > 1.5) AudioEngine.cushionSfx(Math.min(1, sp / 16));
    }
  }
}

function collide(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy), min = BALL_R * 2;
  if (d === 0 || d >= min) return;
  const nx = dx / d, ny = dy / d;
  const overlap = (min - d) / 2;
  a.x -= nx * overlap; a.y -= ny * overlap;
  b.x += nx * overlap; b.y += ny * overlap;
  const p = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (p > 0) {
    a.vx -= p * nx; a.vy -= p * ny;
    b.vx += p * nx; b.vy += p * ny;
    AudioEngine.hit(Math.min(1, Math.abs(p) / 14));
    if (Math.abs(p) > 7) Game.shake = Math.max(Game.shake, Math.abs(p) * 0.3);
  }
}

function bumperCollide(b, bp) {
  const dx = b.x - bp.x, dy = b.y - bp.y;
  const d = Math.hypot(dx, dy), min = BALL_R + bp.r;
  if (d === 0 || d >= min) return;
  const nx = dx / d, ny = dy / d;
  b.x = bp.x + nx * min; b.y = bp.y + ny * min;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) {
    b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny;
    b.vx *= 1.03; b.vy *= 1.03;
    AudioEngine.bumper();
    spawnParticles(b.x - nx * BALL_R, b.y - ny * BALL_R, '#3de0ff', 6, 3);
  }
}

function pocketBall(b, p) {
  if (!b.alive) return;
  b.alive = false;
  spawnParticles(p.x, p.y, b.color, 14, 4);
  if (b.type === 'cue') {
    Game.foulThisShot = true;
    AudioEngine.foul();
  } else {
    Game.pocketedThisShot.push(b);
    AudioEngine.pocket();
    if (b.type === 'bomb') explode(p);
    if (b.type === 'star') AudioEngine.star();
  }
}

function explode(p) {
  AudioEngine.explode();
  Game.shake = 14;
  Game.flash = 1;
  spawnParticles(p.x, p.y, '#ff8c42', 26, 8);
  spawnParticles(p.x, p.y, '#ffd93d', 18, 9);
  spawnParticles(p.x, p.y, '#ff4757', 14, 7);
  for (const b of Game.balls) {
    if (!b.alive) continue;
    const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
    if (d < 150 && d > 0.1) {
      const imp = (1 - d / 150) * 17;
      b.vx += dx / d * imp;
      b.vy += dy / d * imp;
    }
  }
}

function respawnCue() {
  const cue = Game.balls.find(b => b.type === 'cue');
  for (let dy = 0; dy < 320; dy += 24) {
    for (const dx of [0, -26, 26, -52, 52]) {
      const x = HEAD.x + dx, y = HEAD.y + dy;
      if (x < FX0 + BALL_R + 2 || x > FX1 - BALL_R - 2 || y > FY1 - BALL_R - 2) continue;
      const blocked = Game.balls.some(b =>
        b.alive && b !== cue && Math.hypot(b.x - x, b.y - y) < BALL_R * 2 + 3);
      const nearHole = Game.blackHole && Math.hypot(Game.blackHole.x - x, Game.blackHole.y - y) < 60;
      if (!blocked && !nearHole) {
        cue.x = x; cue.y = y; cue.vx = 0; cue.vy = 0; cue.alive = true;
        return;
      }
    }
  }
  cue.x = HEAD.x; cue.y = HEAD.y; cue.vx = 0; cue.vy = 0; cue.alive = true;
}

/* ---------------- 粒子 ---------------- */
function spawnParticles(x, y, color, n = 10, spd = 5) {
  for (let i = 0; i < n; i++) {
    Game.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * spd * 2,
      vy: (Math.random() - 0.5) * spd * 2 - 1,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles(dt) {
  for (const p of Game.particles) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += 0.12 * dt;
    p.life -= 0.028 * dt;
  }
  Game.particles = Game.particles.filter(p => p.life > 0);
}

/* ---------------- 渲染 ---------------- */
let staticLayer = null;

function buildStaticLayer() {
  staticLayer = document.createElement('canvas');
  staticLayer.width = W; staticLayer.height = H;
  const c = staticLayer.getContext('2d');

  // 木框
  c.fillStyle = '#3a2110';
  c.fillRect(0, 0, W, H);
  c.strokeStyle = '#5a3517';
  c.lineWidth = 2;
  c.strokeRect(1, 1, W - 2, H - 2);
  // 金色内饰条
  c.strokeStyle = '#c98f3d';
  c.strokeRect(BORDER - 3, BORDER - 3, W - (BORDER - 3) * 2, H - (BORDER - 3) * 2);

  // 台呢
  c.fillStyle = '#159a4c';
  c.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0);
  // 像素抖动
  c.fillStyle = 'rgba(0,0,0,0.05)';
  for (let y = FY0; y < FY1; y += 8) {
    for (let x = FX0; x < FX1; x += 8) {
      if (((x + y) / 8) % 2 === 0) c.fillRect(x, y, 8, 8);
    }
  }
  // 开球线
  c.strokeStyle = 'rgba(255,255,255,0.13)';
  c.setLineDash([6, 6]);
  c.beginPath();
  c.moveTo(FX0 + 4, HEAD.y);
  c.lineTo(FX1 - 4, HEAD.y);
  c.stroke();
  c.setLineDash([]);

  // 袋口
  for (const p of POCKETS) {
    c.fillStyle = '#050505';
    c.beginPath(); c.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#0d2818';
    c.lineWidth = 3;
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.14)';
    c.fillRect(p.x - 6, p.y - POCKET_R + 3, 4, 3);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(staticLayer, 0, 0);

  if (Game.blackHole) drawBlackHole(Game.blackHole);
  for (const bp of Game.bumpers) drawBumper(bp);
  for (const b of Game.balls) if (b.alive) drawBall(b);

  if (Game.state === 'aim' && Game.aiming) drawAim();

  // 粒子
  for (const p of Game.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // 爆炸闪白
  if (Game.flash > 0.02) {
    ctx.fillStyle = `rgba(255,255,255,${Game.flash * 0.55})`;
    ctx.fillRect(0, 0, W, H);
    Game.flash *= 0.78;
  }

  // 屏幕震动
  if (Game.shake > 0.3) {
    const sx = (Math.random() - 0.5) * Game.shake;
    const sy = (Math.random() - 0.5) * Game.shake;
    canvas.style.transform = `translate(${sx}px,${sy}px)`;
    Game.shake *= 0.88;
  } else if (canvas.style.transform) {
    canvas.style.transform = '';
  }
}

function drawBall(b) {
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(b.x + 2, b.y + 4, BALL_R * 0.9, BALL_R * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // 球体
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(b.x - 4, b.y - 6, 3, 3);
  // 特殊球标记
  if (b.type === 'bomb') {
    ctx.fillStyle = '#ff8c42';
    ctx.fillRect(b.x - 1, b.y - BALL_R - 4, 3, 5);
    ctx.fillStyle = Math.random() < 0.5 ? '#ffd93d' : '#ff4757';
    ctx.fillRect(b.x - 2, b.y - BALL_R - 7, 4, 4);
  } else if (b.type === 'star') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(b.x - 1, b.y - 5, 2, 10);
    ctx.fillRect(b.x - 5, b.y - 1, 10, 2);
  }
}

function drawBlackHole(h) {
  const t = performance.now();
  const pulse = 1 + Math.sin(t / 280) * 0.07;
  ctx.fillStyle = '#05010d';
  ctx.beginPath();
  ctx.arc(h.x, h.y, 13 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b15bff';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.lineDashOffset = -t / 24;
  ctx.beginPath();
  ctx.arc(h.x, h.y, 19 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(177,91,255,0.3)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(h.x, h.y, 26 * pulse, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBumper(bp) {
  ctx.fillStyle = '#101c2e';
  ctx.beginPath();
  ctx.arc(bp.x, bp.y, bp.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3de0ff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#3de0ff';
  ctx.fillRect(bp.x - 2, bp.y - 2, 4, 4);
}

function drawAim() {
  const cue = getCue();
  if (!cue) return;
  const dir = Game.aimDir, pow = Game.aimPower;

  // 预测线
  const segs = predictPath(cue, dir);
  segs.forEach((seg, si) => {
    const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
    const dx = (seg.x2 - seg.x1) / len, dy = (seg.y2 - seg.y1) / len;
    ctx.fillStyle = si === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)';
    const start = si === 0 ? BALL_R + 2 : 2;
    for (let d = start; d < len; d += 8) {
      ctx.fillRect(seg.x1 + dx * d - 1.5, seg.y1 + dy * d - 1.5, 3, 3);
    }
  });
  // 目标球虚影 + 方向
  const s0 = segs[0];
  if (s0 && s0.hitBall) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s0.x2, s0.y2, BALL_R, 0, Math.PI * 2);
    ctx.stroke();
    const hb = s0.hitBall;
    const nx = hb.x - s0.x2, ny = hb.y - s0.y2;
    const nl = Math.hypot(nx, ny) || 1;
    ctx.strokeStyle = 'rgba(61,255,143,0.8)';
    ctx.beginPath();
    ctx.moveTo(hb.x, hb.y);
    ctx.lineTo(hb.x + nx / nl * 26, hb.y + ny / nl * 26);
    ctx.stroke();
  }

  // 球杆
  const gap = 10 + pow * 38;
  const sx = cue.x - dir.x * (BALL_R + gap);
  const sy = cue.y - dir.y * (BALL_R + gap);
  const ex = cue.x - dir.x * (BALL_R + gap + 95);
  const ey = cue.y - dir.y * (BALL_R + gap + 95);
  ctx.strokeStyle = '#d9a066';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = '#3de0ff';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - dir.x * 7, sy - dir.y * 7); ctx.stroke();

  // 力度光圈
  ctx.strokeStyle = pow < 0.5 ? '#3dff8f' : pow < 0.8 ? '#ffd93d' : '#ff4d8d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cue.x, cue.y, BALL_R + 4 + pow * 5, 0, Math.PI * 2);
  ctx.stroke();
}

/* 路径预测（含一次库边反弹） */
function predictPath(cue, dir) {
  const segs = [];
  let from = { x: cue.x, y: cue.y };
  let d = { x: dir.x, y: dir.y };
  let remaining = 640;
  for (let bounce = 0; bounce < 2 && remaining > 0; bounce++) {
    let bestT = Infinity, hitBall = null;
    for (const b of Game.balls) {
      if (!b.alive || b === cue) continue;
      const cx = b.x - from.x, cy = b.y - from.y;
      const proj = cx * d.x + cy * d.y;
      if (proj <= 0) continue;
      const d2 = cx * cx + cy * cy - proj * proj;
      const r = BALL_R * 2;
      if (d2 >= r * r) continue;
      const t = proj - Math.sqrt(r * r - d2);
      if (t < bestT) { bestT = t; hitBall = b; }
    }
    let tWall = Infinity, wallAxis = null;
    if (d.x > 0) { const t = (FX1 - BALL_R - from.x) / d.x; if (t > 0 && t < tWall) { tWall = t; wallAxis = 'x'; } }
    if (d.x < 0) { const t = (FX0 + BALL_R - from.x) / d.x; if (t > 0 && t < tWall) { tWall = t; wallAxis = 'x'; } }
    if (d.y > 0) { const t = (FY1 - BALL_R - from.y) / d.y; if (t > 0 && t < tWall) { tWall = t; wallAxis = 'y'; } }
    if (d.y < 0) { const t = (FY0 + BALL_R - from.y) / d.y; if (t > 0 && t < tWall) { tWall = t; wallAxis = 'y'; } }

    const t = Math.min(bestT, tWall, remaining);
    segs.push({
      x1: from.x, y1: from.y,
      x2: from.x + d.x * t, y2: from.y + d.y * t,
      hitBall: bounce === 0 ? hitBall : null,
    });
    if (hitBall) break;
    if (tWall <= bestT && wallAxis && tWall < remaining) {
      from = { x: from.x + d.x * tWall, y: from.y + d.y * tWall };
      if (wallAxis === 'x') d.x *= -1; else d.y *= -1;
      remaining -= tWall;
    } else break;
  }
  return segs;
}

/* ---------------- 输入 ---------------- */
function toLogical(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height),
  };
}

function updateAim(e) {
  const cue = getCue();
  if (!cue) return;
  const pos = toLogical(e);
  const dx = pos.x - cue.x, dy = pos.y - cue.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 4) {
    Game.aimDir.x = dx / dist;
    Game.aimDir.y = dy / dist;
  }
  Game.aimPower = Math.max(0, Math.min(1, (dist - 15) / 150));
  $('powerFill').style.height = (Game.aimPower * 100) + '%';
}

canvas.addEventListener('pointerdown', e => {
  if (Game.state !== 'aim') return;
  e.preventDefault();
  Game.aiming = true;
  canvas.setPointerCapture(e.pointerId);
  $('powerMeter').classList.add('show');
  updateAim(e);
});
canvas.addEventListener('pointermove', e => {
  if (!Game.aiming || Game.state !== 'aim') return;
  e.preventDefault();
  updateAim(e);
});
canvas.addEventListener('pointerup', e => {
  if (!Game.aiming || Game.state !== 'aim') { Game.aiming = false; return; }
  e.preventDefault();
  updateAim(e);
  Game.aiming = false;
  $('powerMeter').classList.remove('show');
  if (Game.aimPower > 0.08) shoot();
  Game.aimPower = 0;
  $('powerFill').style.height = '0%';
});
canvas.addEventListener('pointercancel', () => {
  Game.aiming = false;
  $('powerMeter').classList.remove('show');
});

function shoot() {
  const cue = getCue();
  if (!cue) return;
  const sp = 6 + Game.aimPower * 20;
  cue.vx = Game.aimDir.x * sp;
  cue.vy = Game.aimDir.y * sp;
  AudioEngine.shoot(Game.aimPower);
  Game.pocketedThisShot = [];
  Game.foulThisShot = false;
  if (Game.mode === 'classic') Game.shots++;
  if (Game.mode === 'puzzle') Game.shotsLeft--;
  Game.state = 'roll';
  updateHUD();
}

/* ---------------- 主循环 ---------------- */
let lastT = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const dtms = Math.min(50, t - lastT || 16.7);
  lastT = t;
  const dt = dtms / 16.7;
  if (Game.state === 'roll') {
    physics(dt);
    if (allStopped()) onStop();
  }
  updateParticles(dt);
  draw();
}

function onStop() {
  Game.state = 'aim';
  // 确保完全静止
  for (const b of Game.balls) { b.vx = 0; b.vy = 0; }
  const pocketed = Game.pocketedThisShot.slice();
  const foul = Game.foulThisShot;
  Game.pocketedThisShot = [];
  Game.foulThisShot = false;
  if (foul) respawnCue();
  MODES[Game.mode].onStop(pocketed, foul);
  updateHUD();
}

/* ---------------- 模式 ---------------- */
const MODES = {
  classic: {
    setup() {
      Game.balls = [];
      cueAt(HEAD.x, HEAD.y);
      const pos = [[0, 0], [-12, 21], [12, 21], [-24, 42], [0, 42], [24, 42]];
      pos.forEach((o, i) => targetAt(180 + o[0], 470 + o[1], i));
      Game.shots = 0;
      setHudLabels('杆数', '进球', '最佳');
    },
    onStop(pocketed, foul) {
      if (foul) {
        Game.shots++;
        floatText('犯规 +1杆', 180, 300, 'bad');
      }
      if (pocketed.length) {
        floatText(`+${pocketed.length} 球`, 180, 260);
      }
      if (remainingTargets() === 0) {
        const total = Game.shots;
        const best = store.bestClassic;
        if (!best || total < best) store.bestClassic = total;
        endGame({
          emoji: '🏆', title: '清台完成！',
          sub: total <= (best || total) && total === store.bestClassic ? '新纪录！' : '干得漂亮！',
          stats: [['总杆数', total], ['最佳', store.bestClassic]],
          primary: '再来一次',
        });
        AudioEngine.win();
      }
    },
    hud() {
      return [Game.shots, (6 - remainingTargets()) + '/6', store.bestClassic || '--'];
    },
  },

  time: {
    setup() {
      Game.balls = [];
      cueAt(HEAD.x, HEAD.y);
      Game.score = 0; Game.combo = 0; Game.timeLeft = 60;
      for (let i = 0; i < 4; i++) spawnRandomBall();
      setHudLabels('分数', '时间', '连击');
      this.startTimer();
    },
    startTimer() {
      clearInterval(Game.timerId);
      Game.timerId = setInterval(() => {
        if (Game.state === 'over') { clearInterval(Game.timerId); return; }
        Game.timeLeft--;
        if (Game.timeLeft <= 0) {
          Game.timeLeft = 0;
          clearInterval(Game.timerId);
          const best = store.bestTime;
          if (Game.score > best) store.bestTime = Game.score;
          endGame({
            emoji: '⏰', title: '时间到！',
            sub: Game.score >= store.bestTime && Game.score > 0 ? '新纪录！' : '再来一局突破自己！',
            stats: [['得分', Game.score], ['最佳', store.bestTime]],
            primary: '再来一局',
          });
          AudioEngine.lose();
        }
        updateHUD();
      }, 1000);
    },
    onStop(pocketed, foul) {
      if (pocketed.length) {
        Game.combo = Math.min(Game.combo + 1, 5);
        let pts = 0;
        for (const b of pocketed) {
          pts += b.type === 'star' ? 300 : b.type === 'bomb' ? 150 : 100;
        }
        pts *= Game.combo;
        Game.score += pts;
        floatText('+' + pts, 180, 260);
        if (Game.combo > 1) floatText(`COMBO x${Game.combo}`, 180, 330, 'combo');
      } else {
        Game.combo = 0;
      }
      if (foul) {
        Game.combo = 0;
        Game.score = Math.max(0, Game.score - 100);
        floatText('犯规 -100', 180, 300, 'bad');
      }
      // 补充球
      let guard = 0;
      while (Game.balls.filter(b => b.alive && b.type !== 'cue').length < 4 && guard++ < 10) {
        spawnRandomBall();
      }
    },
    hud() {
      return [Game.score, Game.timeLeft + 's', Game.combo > 1 ? 'x' + Game.combo : '--'];
    },
  },

  puzzle: {
    setup() {
      const lv = LEVELS[Game.level];
      Game.balls = [];
      Game.bumpers = (lv.bumpers || []).map(p => ({ x: p[0], y: p[1], r: 14 }));
      Game.blackHole = lv.hole ? { x: lv.hole[0], y: lv.hole[1] } : null;
      Game.shotsLeft = lv.shots;
      lv.setup();
      setHudLabels('关卡', '剩余杆', '目标');
      floatText(lv.hint, 180, 300, 'combo');
    },
    onStop(pocketed, foul) {
      if (foul) floatText('犯规！', 180, 300, 'bad');
      if (remainingTargets() === 0) {
        const stars = Game.shotsLeft >= 2 ? 3 : Game.shotsLeft >= 1 ? 2 : 1;
        const arr = store.stars;
        arr[Game.level] = Math.max(arr[Game.level] || 0, stars);
        store.stars = arr;
        store.unlocked = Math.max(store.unlocked, Math.min(Game.level + 1, LEVELS.length - 1));
        const isLast = Game.level >= LEVELS.length - 1;
        endGame({
          emoji: stars === 3 ? '🌟' : '✅',
          title: isLast ? '全部通关！' : '关卡完成！',
          sub: LEVELS[Game.level].name,
          stars,
          stats: [['剩余杆', Game.shotsLeft], ['评价', '★'.repeat(stars)]],
          primary: '再玩一次',
          next: !isLast,
        });
        AudioEngine.win();
      } else if (Game.shotsLeft <= 0) {
        endGame({
          emoji: '💥', title: '杆数用完…',
          sub: '差一点点，再试一次！',
          stats: [['剩余目标', remainingTargets()]],
          primary: '重新挑战',
        });
        AudioEngine.lose();
      }
    },
    hud() {
      return [`${Game.level + 1}/${LEVELS.length}`, Game.shotsLeft, remainingTargets() + '球'];
    },
  },
};

function spawnRandomBall() {
  for (let tries = 0; tries < 60; tries++) {
    const x = 40 + Math.random() * 280;
    const y = 380 + Math.random() * 260;
    if (POCKETS.some(p => Math.hypot(p.x - x, p.y - y) < 46)) continue;
    if (Game.balls.some(b => b.alive && Math.hypot(b.x - x, b.y - y) < BALL_R * 2 + 8)) continue;
    const r = Math.random();
    if (r < 0.12) Game.balls.push(new Ball(x, y, '#ffd93d', 'star'));
    else if (r < 0.24) Game.balls.push(new Ball(x, y, '#2f3542', 'bomb'));
    else Game.balls.push(new Ball(x, y, BALL_COLORS[(Math.random() * 6) | 0]));
    return;
  }
}

/* ---------------- UI / 流程 ---------------- */
function setHudLabels(l1, l2, l3) {
  $('hudL1').textContent = l1;
  $('hudL2').textContent = l2;
  $('hudL3').textContent = l3;
}

function updateHUD() {
  if (!Game.mode || !MODES[Game.mode]) return;
  const [v1, v2, v3] = MODES[Game.mode].hud();
  $('hudV1').textContent = v1;
  $('hudV2').textContent = v2;
  $('hudV3').textContent = v3;
  $('hudV2').classList.toggle('alert', Game.mode === 'time' && Game.timeLeft <= 10);
}

function floatText(text, x, y, cls = '') {
  const el = document.createElement('div');
  el.className = 'float-text ' + cls;
  el.textContent = text;
  const scale = canvas.clientWidth / W;
  el.style.left = (canvas.offsetLeft + x * scale) + 'px';
  el.style.top = (canvas.offsetTop + y * scale) + 'px';
  tableWrap.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function showOverlay(id) {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('show'));
  if (id) $(id).classList.add('show');
}

function startMode(mode, level = 0) {
  AudioEngine.init();
  AudioEngine.resume();
  AudioEngine.startMusic();
  Game.mode = mode;
  Game.level = level;
  Game.bumpers = [];
  Game.blackHole = null;
  Game.particles = [];
  Game.state = 'aim';
  Game.aiming = false;
  clearInterval(Game.timerId);
  MODES[mode].setup();
  showOverlay(null);
  updateHUD();
}

function endGame({ emoji, title, sub, stars, stats, primary, next }) {
  Game.state = 'over';
  $('resultEmoji').textContent = emoji;
  $('resultTitle').textContent = title;
  $('resultSub').textContent = sub || '';
  const starsHtml = stars ? `<div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>` : '';
  $('resultStats').innerHTML = starsHtml +
    '<div class="result-stats">' +
    stats.map(([k, v]) => `<div class="result-stat"><b>${v}</b><span>${k}</span></div>`).join('') +
    '</div>';
  $('resultPrimary').textContent = primary || '再来一次';
  $('resultNext').style.display = next ? 'inline-block' : 'none';
  showOverlay('resultScreen');
}

function buildLevelGrid() {
  const grid = $('levelGrid');
  grid.innerHTML = '';
  const stars = store.stars;
  LEVELS.forEach((lv, i) => {
    const locked = i > store.unlocked;
    const card = document.createElement('button');
    card.className = 'level-card' + (locked ? ' locked' : '');
    const st = stars[i] || 0;
    card.innerHTML = `
      <div class="level-num">${locked ? '🔒' : i + 1}</div>
      <div class="level-name">${lv.name}</div>
      <div class="level-stars">${locked ? '···' : '★'.repeat(st) + '☆'.repeat(3 - st)}</div>`;
    if (!locked) {
      card.addEventListener('click', () => {
        AudioEngine.click();
        startMode('puzzle', i);
      });
    }
    grid.appendChild(card);
  });
}

function updateBestLine() {
  const bc = store.bestClassic, bt = store.bestTime;
  $('bestLine').textContent =
    `CLASSIC BEST: ${bc || '--'} 杆\nTIME BEST: ${bt || '--'} 分`;
}

/* ---------------- 事件绑定 ---------------- */
$('startBtn').addEventListener('click', () => {
  AudioEngine.init();
  AudioEngine.resume();
  AudioEngine.startMusic();
  AudioEngine.click();
  updateBestLine();
  showOverlay('modeScreen');
});

document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    AudioEngine.click();
    const mode = card.dataset.mode;
    if (mode === 'puzzle') {
      buildLevelGrid();
      showOverlay('levelScreen');
    } else {
      startMode(mode);
    }
  });
});

$('levelBackBtn').addEventListener('click', () => {
  AudioEngine.click();
  showOverlay('modeScreen');
});

$('resultPrimary').addEventListener('click', () => {
  AudioEngine.click();
  startMode(Game.mode, Game.level);
});

$('resultNext').addEventListener('click', () => {
  AudioEngine.click();
  startMode('puzzle', Math.min(Game.level + 1, LEVELS.length - 1));
});

$('resultMenu').addEventListener('click', () => {
  AudioEngine.click();
  Game.state = 'menu';
  clearInterval(Game.timerId);
  updateBestLine();
  showOverlay('modeScreen');
});

$('musicBtn').addEventListener('click', () => {
  AudioEngine.init();
  const on = AudioEngine.toggleMusic();
  $('musicBtn').textContent = on ? '🎵' : '🔇';
  $('musicBtn').classList.toggle('off', !on);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (Game.mode === 'time' && Game.state !== 'over' && Game.timerId) {
      clearInterval(Game.timerId);
      Game.timerId = null;
      Game.timerPaused = true;
    }
    AudioEngine.suspend();
  } else {
    AudioEngine.resume();
    if (Game.timerPaused && Game.mode === 'time' && Game.state !== 'over') {
      MODES.time.startTimer();
      Game.timerPaused = false;
    }
  }
});

/* ---------------- 画布尺寸 ---------------- */
function fitCanvas() {
  const availW = tableWrap.clientWidth;
  const availH = tableWrap.clientHeight;
  const scale = Math.min(availW / W, availH / H);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}
window.addEventListener('resize', fitCanvas);
window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 100));

/* ---------------- 启动 ---------------- */
buildStaticLayer();
fitCanvas();
updateBestLine();
requestAnimationFrame(loop);
