'use strict';
/* ============================================================
   五色石·补天记 — 关卡与剧情数据
   五方五色：东青木林 / 南焰霞坡 / 西琼霜原 / 北玄渊窟 / 中昆仑墟
   ============================================================ */

// 五色石颜色（青红白黑黄）
const STONE_COLORS = { 1: '#3ecf8e', 2: '#ff5d5d', 3: '#f2f6fa', 4: '#4a4e69', 5: '#ffd23f' };
const STONE_NAMES  = { 1: '青石', 2: '赤石', 3: '白石', 4: '黑石', 5: '黄石' };

const BIOMES = {
  1: {
    name: '青木林 · 东', hint: 'X挖 K放——够不着，就垫一块',
    sky: ['#8fd3ff', '#eafff4'], sun: '#fff3b8',
    hill: '#79c46b', hill2: '#5ba85c',
    dirt: '#a9744a', dirtDark: '#8a5c38', grass: '#63c74d', grassDark: '#46a637',
    stone: '#8a9098', stoneDark: '#6d737c',
    hazard: null, ambient: 'leaf', stars: false, dark: false,
    music: { root: 220.0, tempo: 96, seed: 11 }
  },
  2: {
    name: '焰霞坡 · 南', hint: 'C 冲刺——岩浆：看着烫，踩着更烫',
    sky: ['#3a1d4e', '#ff9a5c'], sun: '#ffd23f',
    hill: '#8a4b32', hill2: '#5e2f22',
    dirt: '#8a4b32', dirtDark: '#6d3a26', grass: '#c76b3f', grassDark: '#a3522c',
    stone: '#7d6a70', stoneDark: '#63525a',
    hazard: 'lava', ambient: 'ember', stars: false, dark: false,
    music: { root: 164.8, tempo: 116, seed: 22 }
  },
  3: {
    name: '琼霜原 · 西', hint: '冰面滑，刹车要提前',
    sky: ['#a8dcff', '#f4fbff'], sun: '#ffffff',
    hill: '#cfe4f2', hill2: '#a9c6da',
    dirt: '#8fa3b0', dirtDark: '#71858f', grass: '#e8f6ff', grassDark: '#c2dcf0',
    stone: '#9aa8b8', stoneDark: '#7c8898',
    hazard: 'water', ambient: 'snow', stars: false, dark: false,
    music: { root: 196.0, tempo: 84, seed: 33 }
  },
  4: {
    name: '玄渊窟 · 北', hint: '黑，跟紧光',
    sky: ['#070912', '#10142a'], sun: null,
    hill: '#141827', hill2: '#0d101c',
    dirt: '#5a5470', dirtDark: '#453f58', grass: '#7a74a0', grassDark: '#5e5880',
    stone: '#4a4e69', stoneDark: '#383b52',
    hazard: null, ambient: 'none', stars: true, dark: true,
    music: { root: 146.8, tempo: 66, seed: 44 }
  },
  5: {
    name: '昆仑墟 · 中', hint: '爬！上头就是天洞',
    sky: ['#0c1238', '#4a3670'], sun: '#ffd23f',
    hill: '#2a2450', hill2: '#1b1738',
    dirt: '#b09a6a', dirtDark: '#8f7c52', grass: '#d9c98a', grassDark: '#b8a468',
    stone: '#8d8aa8', stoneDark: '#6d6a88',
    hazard: 'lava', ambient: 'dust', stars: true, dark: false, vortex: true,
    music: { root: 261.6, tempo: 104, seed: 55 }
  }
};

/* ---------------- 关卡构建器 ---------------- */
class LB {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.t = Array.from({ length: h }, () => Array(w).fill(' '));
    this.spawn = { x: 3, y: 0 };
    this.npcs = []; this.enemies = []; this.flyers = [];
    this.stars = []; this.hearts = []; this.bugs = [];
    this.checkpoints = []; this.shrine = null;
  }
  set(x, y, c) { if (y >= 0 && y < this.h && x >= 0 && x < this.w) this.t[y][x] = c; }
  get(x, y) { return (y >= 0 && y < this.h && x >= 0 && x < this.w) ? this.t[y][x] : ' '; }
  // 地面：top 为最高一行的 y，向下填到底
  ground(x0, x1, top, mat = '#') {
    for (let x = x0; x <= x1; x++)
      for (let y = top; y < this.h; y++) this.set(x, y, mat);
    return this;
  }
  plat(x, y, w, mat = 'W') {
    for (let i = 0; i < w; i++) this.set(x + i, y, mat);
    return this;
  }
  box(x0, y0, x1, y1, mat = 'S') {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) this.set(x, y, mat);
    return this;
  }
  // 危险液池：液面 y，下垫两层石头
  pool(x0, x1, y) {
    for (let x = x0; x <= x1; x++) {
      this.set(x, y, '~');
      this.set(x, y + 1, 'S'); this.set(x, y + 2, 'S');
    }
    return this;
  }
  spikes(x0, x1, y) {
    for (let x = x0; x <= x1; x++) this.set(x, y, '^');
    return this;
  }
  carve(x0, y0, x1, y1) {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) this.set(x, y, ' ');
    return this;
  }
  wall(x, y0, y1, mat = '#') {
    for (let y = y0; y <= y1; y++) this.set(x, y, mat);
    return this;
  }
  at(x, y) { this.spawn = { x, y }; return this; }
  npc(id, x, y) { this.npcs.push({ id, x, y }); return this; }
  enemy(x, y, kind = 'walker') {
    (kind === 'flyer' ? this.flyers : this.enemies).push({ x, y });
    return this;
  }
  star(x, y) { this.stars.push({ x, y }); return this; }
  heart(x, y) { this.hearts.push({ x, y }); return this; }
  bug(x, y) { this.bugs.push({ x, y }); return this; }
  check(x, y) { this.checkpoints.push({ x, y }); return this; }
  shrineAt(x, y) { this.shrine = { x, y }; return this; }
}

/* ---------------- 五关 ---------------- */
const LDEFS = [null, {
  name: '青木林', make(b) {
    b.at(3, 18);
    b.ground(0, 15, 19);
    b.plat(7, 15, 3, 'W'); b.star(8, 14);
    b.ground(19, 34, 18);
    b.npc('yugong', 32, 17);
    b.wall(36, 12, 17, '#');                 // 愚公的土墙：挖穿它
    b.ground(35, 47, 18);
    b.ground(40, 47, 16);                    // 缓坡上行
    b.carve(43, 20, 44, 21); b.star(43, 20); // 地下星屑
    b.ground(51, 63, 18);
    b.check(53, 17);
    b.enemy(25, 17); b.enemy(57, 17);
    b.heart(22, 17);
    b.plat(58, 14, 3, 'W'); b.star(59, 13);
    b.ground(67, 77, 17);
    b.enemy(70, 16);
    b.heart(69, 16);
    b.shrineAt(74, 16);
  }
}, {
  name: '焰霞坡', make(b) {
    b.at(3, 18);
    b.ground(0, 10, 19);
    b.npc('kuafu', 6, 18);
    b.pool(11, 15, 19);                      // 冲刺教学池
    b.ground(16, 26, 19);
    b.spikes(21, 21, 18);
    b.enemy(24, 15, 'flyer');
    b.pool(27, 41, 18);                      // 岩浆湖
    b.plat(27, 16, 3, 'W'); b.plat(32, 14, 3, 'W'); b.plat(37, 12, 3, 'W');
    b.box(27, 19, 41, 21, 'S');              // 湖底岩层（可挖隧道）
    b.set(34, 20, 'S'); b.star(34, 20);      // 岩层里的星屑：挖出来
    b.ground(42, 56, 13);
    b.check(44, 12);
    b.spikes(49, 49, 12);
    b.enemy(52, 9, 'flyer');
    b.plat(44, 10, 2, 'W'); b.star(44, 9);
    b.ground(60, 87, 15);
    b.check(61, 14);
    b.enemy(68, 14);
    b.plat(63, 11, 2, 'W'); b.star(63, 10);
    b.spikes(72, 72, 14);
    b.heart(75, 14);
    b.shrineAt(83, 14);
  }
}, {
  name: '琼霜原', make(b) {
    b.at(3, 18);
    b.ground(0, 14, 19, 'I');
    b.npc('shennong', 6, 18);
    b.pool(15, 19, 19);
    b.plat(16, 17, 2, 'I');                  // 过冰水的踏脚石
    b.ground(20, 38, 19, 'I');
    b.enemy(26, 18); b.enemy(33, 18);
    b.plat(30, 15, 2, 'I'); b.plat(34, 12, 2, 'I'); b.star(34, 11);
    b.pool(39, 46, 18);
    b.plat(40, 16, 3, 'I'); b.plat(45, 14, 3, 'I'); b.star(46, 13);
    b.ground(47, 60, 16, 'I');
    b.check(49, 15);
    b.spikes(54, 54, 15);
    b.heart(58, 15);
    b.ground(64, 81, 15, 'I');
    b.enemy(70, 14);
    b.carve(71, 19, 72, 21); b.star(71, 19); // 冰下星屑
    b.shrineAt(78, 14);
  }
}, {
  name: '玄渊窟', make(b) {
    b.at(3, 18);
    b.box(0, 0, 81, 6, 'S');                 // 窟顶
    b.ground(0, 21, 19, 'S');
    b.npc('zhulong', 7, 18);
    b.carve(12, 20, 13, 21); b.star(12, 20); // 黑暗里的星屑
    b.bug(17, 15); b.bug(38, 11); b.bug(62, 13); b.bug(74, 14);
    b.spikes(20, 21, 18);
    b.ground(23, 33, 20, 'S');
    b.spikes(24, 31, 19);
    b.plat(24, 16, 3, 'S'); b.plat(29, 14, 3, 'S'); b.star(30, 13);
    b.ground(34, 43, 19, 'S');
    b.check(36, 18);
    b.enemy(40, 14, 'flyer');
    b.plat(44, 15, 2, 'S'); b.plat(48, 13, 2, 'S'); b.star(49, 12);
    b.plat(52, 11, 2, 'S');
    b.ground(54, 66, 11, 'S');
    b.enemy(58, 7, 'flyer');
    b.heart(61, 10);
    b.plat(67, 13, 2, 'S'); b.plat(70, 15, 2, 'S');
    b.ground(68, 81, 17, 'S');
    b.check(69, 16);
    b.shrineAt(78, 16);
  }
}, {
  name: '昆仑墟', make(b) {
    b.at(3, 43);
    b.ground(0, 8, 44);                      // A 台
    b.plat(10, 42, 2, 'W'); b.star(10, 41);  // 岩浆上摘星
    b.pool(9, 13, 44);
    b.ground(14, 22, 44, 'I');               // B 台（冰）
    b.spikes(20, 20, 43);
    // 之字天梯
    b.plat(18, 41, 3, 'W'); b.plat(23, 38, 3, 'W'); b.plat(28, 35, 3, 'W');
    b.plat(33, 32, 3, 'S');  b.star(34, 31);
    b.plat(28, 29, 3, 'W');  b.plat(23, 26, 3, 'I'); b.enemy(24, 25);
    b.plat(18, 23, 3, 'W');  b.star(19, 22);
    b.plat(13, 20, 3, 'S');  b.check(14, 19);
    b.plat(18, 17, 3, 'W');  b.enemy(19, 16);
    b.plat(23, 14, 3, 'I');  b.check(24, 13);
    b.plat(20, 11, 3, 'S');  b.heart(21, 10);
    b.box(24, 8, 43, 9, 'S');                // 昆仑之巅（悬空石台）
    b.shrineAt(36, 7);
    b.plat(5, 12, 3, 'c'); b.plat(38, 13, 2, 'c');   // 云块（装饰路）
    // 底部回程垫脚（防止跳到 C 台困死）
    b.plat(31, 41, 2, 'W'); b.plat(26, 42, 2, 'W');
    b.ground(35, 43, 44, 'S');               // C 台
    b.heart(40, 43);
    b.enemy(31, 33, 'flyer'); b.enemy(12, 30, 'flyer'); b.enemy(30, 13, 'flyer');
    b.heart(24, 37);
  }
}];

function buildLevel(n) {
  const b = new LB(n === 5 ? 46 : Math.max(78, [0, 78, 88, 82, 82, 46][n]), n === 5 ? 48 : 24);
  LDEFS[n].make(b);
  return b;
}

/* ---------------- 剧情 ---------------- */
const DIALOGUE = {
  intro: {
    speaker: '女娲', spr: 'nuwa',
    lines: [
      '天，漏了个洞。共工那家伙一头撞在不周山上，星星跟漏米似的往外掉。',
      '我炼了三百六十五块五色石，刚要补天——好家伙，一阵妖风，五颗主石刮散到了五方。',
      '小精卫，你娘当年衔石填海，是出了名的犟。这份犟，随你吗？',
      '东边青木林里有颗青石……去吧。挖得动就挖，够不着就垫方块——天下的路，都是这么凑出来的。'
    ]
  },
  yugong: {
    speaker: '愚公', spr: 'yugong', grant: 'pick', itemName: '铁镐',
    grantText: '【获得 · 铁镐】可挖掘石头与冰，挖掘速度翻倍',
    pre: [
      '后生，老朽愚公，挖了一辈子山。',
      '眼前这堵土墙，山神说是考你的。要我说——哪有什么考不考，挖就完了。',
      '这把铁镐给你。石头、寒冰，皆可开。'
    ],
    post: [
      '子子孙孙无穷匮也……你一只鸟，倒比我全家加起来能干。',
      '挖山这事儿，讲究的不是力气，是不停。'
    ]
  },
  kuafu: {
    speaker: '夸父', spr: 'kuafu', grant: 'dash', itemName: '疾风靴',
    grantText: '【获得 · 疾风靴】按 C / Shift 冲刺，跨越宽沟',
    pre: [
      '呼……呼……追完第十万个太阳，腿都快冒烟了。',
      '你看这岩浆，像不像桃汁？……不像。渴。',
      '草鞋送你。跑起来的时候，风会替你使劲。'
    ],
    post: [
      '跑吧跑吧。记住，跑久了要喝水——别问我怎么知道的。'
    ]
  },
  shennong: {
    speaker: '神农', spr: 'shennong', grant: 'herb', itemName: '药囊',
    grantText: '【获得 · 药囊】生命上限 +1，并回满',
    pre: [
      '咳，老朽神农。这肚皮是水晶的，尝百草的时候看得分明。',
      '就是上次尝了株断肠草，躺了三天，肚子里全是紫的。',
      '这个药囊拿去，里面有七叶胆，疼的时候按一按。'
    ],
    post: [
      '雪原的草别乱吃——除了我给的。',
      '对了，断肠草的味道……其实还行。'
    ]
  },
  zhulong: {
    speaker: '烛龙', spr: 'zhulong', grant: 'lamp', itemName: '烛龙提灯',
    grantText: '【获得 · 烛龙提灯】黑暗中的照亮范围大增',
    pre: [
      '…………',
      '（它缓缓睁开一只眼，洞窟亮如白昼）',
      '小家伙，方才我打了个盹。睁眼是昼，闭眼是夜——把你困在这黑里了，抱歉。',
      '这盏提灯借你。我的目光太烈，凡灯温些。'
    ],
    post: [
      '补好天以后，替我看一眼真正的白天。',
      '看仔细点。我睁了一千年，还没看够。'
    ]
  }
};

const CUT_LINES = [
  '五颗五色石，在昆仑之巅聚齐了。',
  '女娲拢袖一挥，神火腾起——五石熔作五道流光，直上天洞。',
  '洞，补上了。',
  '后来，每逢雨过天晴，人们望见云缝里洇开一道五色的光。',
  '他们说，那是女娲留下的针脚。',
  '——后人管它叫，彩虹。'
];

const DEATH_TIPS = {
  1: ['被磕到了……', '摔得羽毛都乱了。'],
  2: ['火候大了点……', '烤鸟警告。'],
  3: ['寒气入骨！', '冰：你猜我滑不滑。'],
  4: ['黑灯瞎火……', '谁在那儿？！'],
  5: ['高处不胜寒……', '天梯不好爬啊。']
};
