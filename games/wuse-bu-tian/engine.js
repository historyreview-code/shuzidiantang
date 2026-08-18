'use strict';
/* ============================================================
   五色石·补天记 — 引擎层：工具 / 输入 / 音频 / 像素画 / 粒子 / 文本
   ============================================================ */
const T = 32;            // 图块尺寸
const VW = 960, VH = 540;// 逻辑分辨率

const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp  = (a, b, t) => a + (b - a) * t;

// 稳定伪随机（图块纹理用，同一坐标每次一致）
function hash2(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
// 种子随机（BGM 旋律用）
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- 输入 ---------------- */
const GAMEKEYS = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space',
  'KeyX','KeyK','KeyC','KeyE','KeyM','KeyP','KeyR','KeyQ','Escape','Enter',
  'ShiftLeft','ShiftRight','KeyW','KeyA','KeyD','KeyJ','KeyL','KeyZ']);

const Input = {
  down: {}, pressed: {}, onBlur: null,
  init() {
    addEventListener('keydown', e => {
      if (GAMEKEYS.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.down[e.code] = 1; this.pressed[e.code] = 1;
      AudioMan.ensure();
    });
    addEventListener('keyup', e => { this.down[e.code] = 0; });
    addEventListener('blur', () => { this.down = {}; if (this.onBlur) this.onBlur(); });
  },
  d(c) { return !!this.down[c]; },
  p(c) { return !!this.pressed[c]; },
  endFrame() { this.pressed = {}; }
};
// 组合键助手（游戏逻辑用）
const kLeft  = () => Input.d('ArrowLeft') || Input.d('KeyA');
const kRight = () => Input.d('ArrowRight') || Input.d('KeyD');
const kUp    = () => Input.d('ArrowUp') || Input.d('KeyW');
const kDown  = () => Input.d('ArrowDown') || Input.d('KeyS');
const kJump  = () => Input.d('ArrowUp') || Input.d('KeyW') || Input.d('Space');
const kJumpP = () => Input.p('ArrowUp') || Input.p('KeyW') || Input.p('Space');
const kDig   = () => Input.d('KeyX') || Input.d('KeyJ');
const kDigP  = () => Input.p('KeyX') || Input.p('KeyJ');
const kPlace = () => Input.p('KeyK') || Input.p('KeyL');
const kDashP = () => Input.p('KeyC') || Input.p('ShiftLeft') || Input.p('ShiftRight');
const kTalkP = () => Input.p('KeyE') || Input.p('KeyZ') || Input.p('Enter') || Input.p('Space');
const kMuteP = () => Input.p('KeyM');
const kPauseP= () => Input.p('Escape') || Input.p('KeyP');

/* ---------------- 音频 ---------------- */
const AudioMan = {
  ctx: null, master: null, muted: false,
  bgm: null, bgmTimer: null, bgmStep: 0, bgmNext: 0,
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    } catch (e) { /* 无音频环境 */ }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    return this.muted;
  },
  // 基础音：频率滑动
  beep(f0, f1, dur, type = 'square', vol = 0.12, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  noise(dur = 0.08, vol = 0.1, delay = 0, hp = false) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain(); g.gain.value = vol;
    const f = this.ctx.createBiquadFilter();
    f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = hp ? 3000 : 900;
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t0);
  },
  sfx(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'jump':   this.beep(300, 560, 0.10, 'square', 0.08); break;
      case 'dash':   this.noise(0.14, 0.09, 0, true); this.beep(900, 1600, 0.1, 'sine', 0.05); break;
      case 'dighit': this.noise(0.05, 0.10); break;
      case 'digdone':this.noise(0.07, 0.12); this.beep(210, 90, 0.09, 'square', 0.07); break;
      case 'place':  this.beep(190, 150, 0.06, 'triangle', 0.14); break;
      case 'star':   [660, 880, 1320].forEach((f, i) => this.beep(f, f, 0.14, 'sine', 0.10, i * 0.06)); break;
      case 'heart':  [520, 660].forEach((f, i) => this.beep(f, f, 0.12, 'sine', 0.10, i * 0.07)); break;
      case 'hurt':   this.beep(320, 110, 0.20, 'sawtooth', 0.12); break;
      case 'stomp':  this.beep(220, 55, 0.12, 'square', 0.12); this.noise(0.06, 0.08); break;
      case 'talk':   this.beep(720, 700, 0.03, 'sine', 0.06); break;
      case 'ui':     this.beep(600, 620, 0.04, 'sine', 0.07); break;
      case 'check':  [523, 659].forEach((f, i) => this.beep(f, f, 0.12, 'triangle', 0.10, i * 0.08)); break;
      case 'shrine': [523, 659, 784, 1046].forEach((f, i) => this.beep(f, f, 0.2, 'triangle', 0.11, i * 0.09)); break;
      case 'grant':  [392, 523, 659, 784].forEach((f, i) => this.beep(f, f, 0.18, 'triangle', 0.11, i * 0.10)); break;
      case 'die':    this.beep(400, 60, 0.5, 'sawtooth', 0.10); break;
      case 'firefly':[980, 1240].forEach((f, i) => this.beep(f, f, 0.1, 'sine', 0.06, i * 0.05)); break;
    }
  },
  /* ---- 五声音阶 BGM（每个关卡换宫调与节奏）---- */
  bgmStart(cfg) {
    this.ensure();
    this.bgmStop();
    if (!this.ctx) return;
    const rand = mulberry(cfg.seed || 7);
    const scale = [0, 2, 4, 7, 9]; // 宫商角徵羽
    const steps = 32;
    // 生成主旋律：五声音阶上的随机游走
    const lead = []; let deg = 2;
    for (let i = 0; i < steps; i++) {
      if (rand() < cfg.rest || 0.28) { lead.push(null); continue; }
      deg = clamp(deg + Math.floor(rand() * 5) - 2, 0, 9);
      const oct = Math.floor(deg / 5), d = scale[deg % 5];
      lead.push(cfg.root * Math.pow(2, oct + d / 12));
    }
    const bass = [];
    for (let i = 0; i < steps; i += 4) bass.push(cfg.root / 2 * (rand() < 0.3 ? 1.5 : 1));
    this.bgm = { lead, bass, i: 0, dur: 30 / cfg.tempo, cfg };
    this.bgmNext = this.ctx.currentTime + 0.1;
    this.bgmTimer = setInterval(() => this._bgmTick(), 90);
  },
  _bgmTick() {
    if (!this.bgm || !this.ctx || this.muted) return;
    if (this.ctx.state !== 'running') { this.bgmNext = this.ctx.currentTime + 0.1; return; }
    while (this.bgmNext < this.ctx.currentTime + 0.25) {
      const { lead, bass, dur } = this.bgm;
      const i = this.bgm.i % lead.length;
      const f = lead[i];
      const t0 = Math.max(this.bgmNext, this.ctx.currentTime);
      if (f) {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.035, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur * 0.92);
        o.connect(g); g.connect(this.master);
        o.start(t0); o.stop(t0 + dur);
      }
      if (i % 4 === 0) {
        const bf = bass[(i / 4) % bass.length];
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'triangle'; o.frequency.value = bf;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.05, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur * 3.4);
        o.connect(g); g.connect(this.master);
        o.start(t0); o.stop(t0 + dur * 3.6);
      }
      this.bgm.i++; this.bgmNext += dur;
    }
  },
  bgmStop() {
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
    this.bgm = null;
  }
};

/* ---------------- 像素画 ----------------
   网格字符串 → 离屏 canvas。'.' 与 ' ' 为透明。
   行宽自动对齐（容错），调色板缺字则跳过。 */
function makeSprite(rows, pal, scale = 1) {
  const w = Math.max(...rows.map(r => r.length));
  const h = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w * scale; cv.height = h * scale;
  const c = cv.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      c.fillStyle = col;
      c.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return cv;
}

const P_PLAYER = {
  h: '#e9b95c', H: '#c79a3f', b: '#ff9a4d', B: '#e8823b', w: '#ffd9a8',
  e: '#22243a', k: '#ffc233', c: '#ff8f8f', r: '#e04848', f: '#d96a2c'
};
const F_IDLE = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '.HHHHHHHHHHHHHH.',
  '....bbbbbbbb....',
  '...bbeebeeebb...',
  '...bbbbkkbbbb...',
  '..wwbbbbbbbbww..',
  '..wwbbcbbcbbww..',
  '..wwbbbbbbbbww..',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '....BBBBBBBB....',
  '.....BBBBBB.....',
  '.....ff..ff.....',
  '.....ff..ff.....'
];
// 走路帧：脚步错开
const F_WALK = F_IDLE.slice(0, 14).concat([
  '....ff....ff....',
  '....ff....ff....'
]);
// 跳跃帧：翅膀张开、脚收起
const F_JUMP = F_IDLE.slice(0, 7).concat([
  '.wwwbbbbbbbbwww.',
  '.wwwbcbbcbbwww..',
  '.wwwbbbbbbbbwww.',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '....BBBBBBBB....',
  '.....BBBBBB.....',
  '.....f....f.....',
  '................'
]);

const P_WALKER = {
  h: '#ffd23f', g: '#6fc38b', G: '#4e9c6b', t: '#ffffff',
  e: '#22243a', f: '#3f7d5a'
};
const F_WS1 = [
  '..h..........h..',
  '.hh..........hh.',
  '..gggggggggggg..',
  '.gggggggggggggg.',
  '.geeggggggggeeg.',
  '.gggggggggggggg.',
  '.ggttttttttttgg.',
  '..ggttttttttgg..',
  '..gggggggggggg..',
  '...gggggggggg...',
  '...GGGGGGGGGG...',
  '....GGGGGGGG....',
  '....ff....ff....',
  '....ff....ff....'
];
const F_WS2 = F_WS1.slice(0, 12).concat([
  '...ff......ff...',
  '...ff......ff...'
]);
// 雪傀儡（三关配色）
const P_SNOW = {
  h: '#9fd8ff', g: '#eef6fb', G: '#c3d7e4', t: '#5a87a8',
  e: '#22243a', f: '#8fb4cc'
};

const P_BIRD = {
  w: '#ff8f6b', r: '#ff5d5d', W: '#d94b4b', e: '#fff6da', k: '#ffc233'
};
const F_BIRD1 = [
  '..ww........ww..',
  '.www........www.',
  '.wwrrrrrrrrrrww.',
  '..wrreerreerww..',
  '...rrrrkkrrrr...',
  '...rrrrrrrrrr...',
  '....rrrrrrrr....',
  '....WWWWWWWW....',
  '.....WWWWWW.....',
  '................'
];
const F_BIRD2 = [
  '................',
  '................',
  '.wwrrrrrrrrrrww.',
  '..wrreerreerww..',
  '...rrrrkkrrrr...',
  '...rrrrrrrrrr...',
  '....rrrrrrrr....',
  '..wwWWWWWWWWww..',
  '...wwWWWWWWww...',
  '................'
];
const P_BAT = {
  g: '#8a8fae', v: '#4a4e69', e: '#ffd23f', f: '#ffffff'
};
const F_BAT1 = [
  '..gg........gg..',
  '.ggg........ggg.',
  '.ggvvvvvvvvvvgg.',
  '..vvveevveevv...',
  '...vvvvffvvvv...',
  '...vvvvvvvvvv...',
  '....vvvvvvvv....',
  '....vvvvvvvv....',
  '................',
  '................'
];
const F_BAT2 = [
  '................',
  '................',
  '.ggvvvvvvvvvvgg.',
  '..vvveevveevv...',
  '...vvvvffvvvv...',
  '...vvvvvvvvvv...',
  '....vvvvvvvv....',
  '..ggvvvvvvvvgg..',
  '...gg......gg...',
  '................'
];

// 女娲： robe 的 1-5 即五色石颜色
const P_NUWA = {
  s: '#2b2233', f: '#ffd9b8', e: '#22243a', l: '#d94b6b',
  '1': '#3ecf8e', '2': '#ff5d5d', '3': '#f2f6fa', '4': '#3a3f66', '5': '#ffd23f'
};
const F_NUWA = [
  '......ssss......',
  '.....ssssss.....',
  '....ssssssss....',
  '...ssffffffss...',
  '...sfeeffeefs...',
  '...sffllllffs...',
  '....ffffff......',
  '.....f..f.......',
  '...1122334455...',
  '..112233445511..',
  '..112233445511..',
  '..221144553311..',
  '...2211445533...',
  '...2211445533...',
  '....ff....ff....',
  '....ff....ff....'
];

const P_YUGONG = {
  h: '#e9c46a', f: '#ffd9b8', e: '#22243a', w: '#f4f0e6',
  t: '#7a6a58', p: '#8a5a2c', P: '#9aa2ad'
};
const F_YUGONG = [
  '..hhhhhhhhhhPP..',
  '.hhhhhhhhhhhhhh.',
  '...ffffffffff...',
  '...feefffeeff...',
  '...fwwwwwwwwf...',
  '...wwwwwwwwww...',
  '..twwwwwwwwwwt..',
  '..tttttttttttt..',
  '..tttttttttttt..',
  '..ttttttttttttpp',
  '..ttttttttttttpp',
  '...ttttttttttpp.',
  '...tttttttttt...',
  '....ff....ff....',
  '....ff....ff....',
  '................'
];

const P_KUAFU = {
  f: '#d9a06b', r: '#e04848', e: '#22243a'
};
const F_KUAFU = [
  '.....ffffff.....',
  '....ffffffff....',
  '....rrrrrrrr....',
  '....feeffeef....',
  '....ffffffff....',
  '.....ffffff.....',
  '....ffffffff....',
  '...ffffffffff...',
  '...ffffffffff...',
  '...ffrrrrrrff...',
  '....ffffffff....',
  '....ff....ff....',
  '...ff......ff...',
  '..ff........ff..',
  '................',
  '................'
];

const P_SHENNONG = {
  g: '#4e9c6b', G: '#3a7a52', f: '#ffd9b8', '-': '#b06a5a',
  t: '#b09a6a', c: '#9fe8ff', C: '#6fc9e8'
};
const F_SHENNONG = [
  '....gggggggg....',
  '...gggggggggg...',
  '..gggGggggGggg..',
  '...ffffffffff...',
  '...f--ffff--f...',
  '...ffffffffff...',
  '...tttttttttt...',
  '..tttccccccctt..',
  '..tttccccccctt..',
  '..tttcCCCCcctt..',
  '..ttttcccctttt..',
  '...tttttttttt...',
  '...tttttttttt...',
  '....ff....ff....',
  '....ff....ff....',
  '................'
];

const P_ZHULONG = {
  y: '#ffd23f', o: '#ff8f4d', w: '#f2ead8',
  r: '#c94b4b', R: '#a03a3a', e: '#ffe98a'
};
const F_ZHULONG = [
  '.......yy.......',
  '......yoyy......',
  '......oooo......',
  '.......ww.......',
  '....rrrrrrrr....',
  '...rrreerrrrr...',
  '...rrrrrrrrrr...',
  '....rrrrrrrr....',
  '......rrrr......',
  '.......rrrr.....',
  '....rrrrrr......',
  '...rrrrrrrr.....',
  '...rrrrrrrrrr...',
  '....RRRRRRRR....',
  '.....RRRRRR.....',
  '................'
];

const P_STAR = { s: '#ffd23f', S: '#fff3b8' };
const F_STAR = [
  '....ss....',
  '...sSSs...',
  '...sSSs...',
  '.ssSSSSss.',
  'sSSSSSSSSs',
  '.ssSSSSss.',
  '...sSSs...',
  '..ss..ss..',
  '.s......s.'
];
const P_HEART = { r: '#ff5d6e', R: '#d93b4f', w: '#ffd3d9' };
const F_HEART = [
  '.rr...rr..',
  'rwrr.rrrr.',
  'rwrrrrrrr.',
  'rrrrrrrrr.',
  'Rrrrrrrrr.',
  '.Rrrrrrr..',
  '..Rrrrr...',
  '...Rrr....',
  '....R.....'
];
const P_FLY = { y: '#ffe98a', o: '#ffb42a' };   // 萤火虫
const F_FLYBUG = [
  '..oo..',
  '.oyyo.',
  'oyyyyo',
  '.oyyo.',
  '..oo..'
];

// 组装精灵表
const Sprites = {
  player:  [F_IDLE, F_WALK, F_JUMP].map(f => makeSprite(f, P_PLAYER)),
  walker:  [F_WS1, F_WS2].map(f => makeSprite(f, P_WALKER)),
  snow:    [F_WS1, F_WS2].map(f => makeSprite(f, P_SNOW)),
  bird:    [F_BIRD1, F_BIRD2].map(f => makeSprite(f, P_BIRD)),
  bat:     [F_BAT1, F_BAT2].map(f => makeSprite(f, P_BAT)),
  nuwa:    makeSprite(F_NUWA, P_NUWA),
  yugong:  makeSprite(F_YUGONG, P_YUGONG),
  kuafu:   makeSprite(F_KUAFU, P_KUAFU),
  shennong:makeSprite(F_SHENNONG, P_SHENNONG),
  zhulong: makeSprite(F_ZHULONG, P_ZHULONG),
  star:    makeSprite(F_STAR, P_STAR),
  heart:   makeSprite(F_HEART, P_HEART),
  bug:     makeSprite(F_FLYBUG, P_FLY)
};
// NPC id → 精灵
const NPC_SPR = {
  nuwa: Sprites.nuwa, yugong: Sprites.yugong, kuafu: Sprites.kuafu,
  shennong: Sprites.shennong, zhulong: Sprites.zhulong
};

/* ---------------- 粒子 ---------------- */
class ParticleSys {
  constructor() { this.list = []; }
  spawn(x, y, o = {}) {
    if (this.list.length > 260) this.list.shift();
    this.list.push({
      x, y,
      vx: o.vx || 0, vy: o.vy || 0,
      g: o.g || 0,
      life: o.life || 40, max: o.life || 40,
      size: o.size || 3,
      color: o.color || '#fff',
      glow: o.glow || false,
      sway: o.sway || 0, ph: Math.random() * 6.28
    });
  }
  burst(x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (o.sp || 2.2) * (0.4 + Math.random() * 0.8);
      this.spawn(x, y, Object.assign({}, o, {
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0),
        life: (o.life || 34) * (0.6 + Math.random() * 0.7)
      }));
    }
  }
  update() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life--;
      p.vy += p.g;
      p.x += p.vx + (p.sway ? Math.sin(p.ph + p.life * 0.1) * p.sway : 0);
      p.y += p.vy;
      if (p.life <= 0) this.list.splice(i, 1);
    }
  }
  draw(ctx, cam) {
    for (const p of this.list) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      const s = p.size * (0.5 + a * 0.5);
      ctx.fillRect(p.x - cam.x - s / 2, p.y - cam.y - s / 2, s, s);
      if (p.glow) {
        ctx.globalAlpha = a * 0.25;
        ctx.fillRect(p.x - cam.x - s, p.y - cam.y - s, s * 2, s * 2);
      }
    }
    ctx.globalAlpha = 1;
  }
  clear() { this.list = []; }
}

/* ---------------- 文本 ---------------- */
function txt(ctx, s, x, y, o = {}) {
  const size = o.size || 18;
  ctx.save();
  ctx.font = `${o.bold === false ? '' : 'bold '}${size}px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  if (o.stroke) {
    ctx.lineWidth = o.strokeW || Math.max(3, size / 6);
    ctx.strokeStyle = o.stroke;
    ctx.lineJoin = 'round';
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(s, x, y);
  ctx.restore();
}
// 中文按字符宽度换行
function wrapText(ctx, s, maxW, size) {
  ctx.font = `bold ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  const lines = []; let cur = '';
  for (const ch of s) {
    if (ch === '\n') { lines.push(cur); cur = ''; continue; }
    if (ctx.measureText(cur + ch).width > maxW) { lines.push(cur); cur = ch; }
    else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}
function rr(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  else { ctx.beginPath(); ctx.rect(x, y, w, h); }
}
