export const site = {
  name: '劳伦斯在上海',
  title: '劳伦斯在上海 · 个人主站',
  description: '劳伦斯在上海的个人主站：数字作品、旅行实验室与手记。',
  url: 'https://shuzidiantang.com',
  social: [
    {
      name: 'B站',
      handle: '劳伦斯在sh · UID 13483307',
      href: 'https://space.bilibili.com/13483307',
      note: '长视频与系列作品',
    },
    {
      name: '小红书',
      handle: '劳伦斯在sh',
      href: 'https://www.xiaohongshu.com/user/profile/5d8d47d80000000001019d89',
      note: '短视频、图文与创作日常',
    },
    {
      name: 'YouTube',
      handle: '@SketchbookBritain',
      href: 'https://www.youtube.com/@SketchbookBritain',
      note: '海外同步 · 英伦漫记系列',
    },
  ],
  beian: {
    icp: '沪ICP备2026042531号',
    icpLink: 'https://beian.miit.gov.cn/',
    // 公安备案通过后追加：gongan / gonganLink（https://beian.mps.gov.cn/）
  },
};

// 首页作品卡片流：不再分厅，直接按卡片平铺。顺序 = 重要程度。
export const works = [
  {
    id: 'earth',
    title: '数字地球',
    eyebrow: '3D 数据可视化',
    href: '/earth/',
    image: '/assets/img/earth.webp',
    summary: '常青藤大学在哪些城市？濒危世界遗产在哪里？全球 500 强总部最多的城市——旋转这颗地球，答案尽在掌握。',
    tags: ['Three.js', 'globe.gl', '数据叙事'],
    status: '旗舰作品',
    github: 'https://github.com/historyreview-code/digital-earth-series',
  },
  {
    id: 'clay',
    title: '陶土动物园',
    eyebrow: 'Blender 手作',
    href: '/clay/',
    image: '/assets/img/clay/10.webp',
    summary: '十七只用 Blender 捏出来的小动物：一只一只手作入馆，图鉴加全家福。',
    tags: ['Blender', '手作', '图鉴'],
    status: '17 只入馆',
  },
  {
    id: 'dataism',
    title: 'dataism《时辰》',
    eyebrow: '数据艺术 · 展品版',
    href: '/dataism/',
    image: '/assets/img/dataism.webp',
    summary: '随十二时辰流转的数据粒子艺术：桌面进现场交互展品，手机看十二时辰静态画册。',
    tags: ['数据艺术', '声音交互', '十二时辰'],
    status: '现场 + 画册',
  },
  {
    id: 'cad',
    title: 'CAD→效果图流水线',
    eyebrow: '流程可视化',
    href: '/cad/',
    image: '/assets/img/cad/01-render.webp',
    summary: '从 CAD 白模到材质再到成片：一条可以拖动的效果图流水线。',
    tags: ['CAD', '渲染', '流程'],
    status: '4 阶段滑杆',
  },
  {
    id: 'shanghai-time-map',
    title: '上海时间地图',
    eyebrow: '数据可视化 · 时空穿越',
    href: 'https://historyreview-code.github.io/shanghai-time-map/',
    image: '/assets/img/shanghai-time-map.webp',
    summary: '1855–2025 六个时代的上海：时间滑杆、卷帘对比与名称变迁，一座城的时空穿越。',
    tags: ['历史地图', '时间轴', '交互'],
    status: '在线可玩',
    external: true,
  },
  {
    id: 'naoliceshi',
    title: '阿兹海默症早期风险自测',
    eyebrow: '3 分钟 · 短期记忆检查',
    href: '/games/naoliceshi.html',
    image: '/assets/img/games/naoliceshi.webp',
    summary: '短期记忆先行衰退是阿兹海默病典型早期征兆：3 分钟两轮回忆，给自己的短期记忆做一次自查。',
    tags: ['记忆力', '自查', '适老'],
    status: '免费自测',
    github: 'https://github.com/historyreview-code/naoliceshi',
  },
  {
    id: 'mini-games',
    title: '创意小游戏',
    eyebrow: '网页游戏 · 精选',
    href: '/games/',
    image: '/assets/img/games/games-hall.webp',
    summary: '数字扫雷与像素打砖块：把小规则做成可玩的网页作品。',
    tags: ['Canvas', 'Game Design', 'AI 协作'],
    status: '2 款可玩',
    github: 'https://github.com/historyreview-code/Numsweeper',
    footer: true,
  },
];

// 天文馆系列：一集一卡，深链直达 /cosmos/?ep=N（与 cosmos/index.html 片单顺序一致）
export const cosmosSeries = [
  { ep: '第 1 集', title: '黄道面之谜', sub: '太阳系为何是一个平面', href: '/cosmos/?ep=0', img: '/assets/img/cosmos/01.webp' },
  { ep: '第 2 集', title: '银河漫游', sub: '从太阳系到银河系之外', href: '/cosmos/?ep=1', img: '/assets/img/cosmos/02.webp' },
  { ep: '第 3 集', title: '宇宙简史', sub: '从大爆炸到黑洞', href: '/cosmos/?ep=2', img: '/assets/img/cosmos/03.webp' },
  { ep: '第 4 集', title: '仰望星空五千年', sub: '人类如何认识宇宙', href: '/cosmos/?ep=3', img: '/assets/img/cosmos/04.webp' },
  { ep: '第 5 集', title: '揽月探火', sub: '人类如何走向另一颗星球', href: '/cosmos/?ep=4', img: '/assets/img/cosmos/05.webp' },
  { ep: '短片', title: '宇宙的诞生与演进', sub: '从大爆炸到旅行者号', href: '/cosmos/?ep=5', img: '/assets/img/cosmos/06.webp' },
];

// 旅行系列：旅行实验室 = 本章总目录（/travel/）。
// 旅行工具：会飞的路书 / 小红书卡片工具 / 唯美记录视频（占位后补）；
// 子栏目「手绘跨时空旅行系列」：目的地卡导流 B站（未来不止英伦）。
export const travelSeries = [
  { title: '旅行实验室', sub: '本章总目录 · 工具与手绘系列', href: '/travel/', img: '/assets/img/travel/lab.webp', github: 'https://github.com/historyreview-code/shuzidiantang/tree/main/travel-console' },
  { title: '会飞的路书', sub: '英国自驾环线 · 点击任意一天，地图飞到当天路段', href: '/travel/uk-roadbook/', img: '/assets/img/travel/uk-roadbook.webp', github: 'https://github.com/historyreview-code/uk-drive' },
  { title: '小红书卡片工具', sub: '基础数据自动生成 · 手机可查', href: '/travel/xhs-card/', img: '/assets/img/travel/lab.webp' },
  { title: '唯美记录视频', sub: '照片自动编排成片 · 打磨中后补', href: '', img: '', pending: true },
  { title: '斯特拉特福德', sub: '莎翁小镇 · 艾汶河畔', href: 'https://www.bilibili.com/video/BV12L8n6mEDK', img: '/assets/img/travel/bili/stratford.webp', external: true, meta: 'B站', groupLabel: '手绘跨时空旅行系列 · B站（未来不止英伦）' },
  { title: '圣比斯', sub: '海边小镇 · 沙滩与徒步', href: 'https://www.bilibili.com/video/BV1t58n6EEzZ', img: '/assets/img/travel/bili/st-bees.webp', external: true, meta: 'B站' },
  { title: '湖区', sub: '自然与文化遗产', href: 'https://www.bilibili.com/video/BV1YW8J6WEuJ', img: '/assets/img/travel/bili/lake-district.webp', external: true, meta: 'B站' },
  { title: '斯凯岛', sub: '中国人的天空之岛', href: 'https://www.bilibili.com/video/BV1Yy8R6dEUj', img: '/assets/img/travel/bili/skye.webp', external: true, meta: 'B站' },
  { title: '巴斯', sub: '从罗马闻名的温泉小城', href: 'https://www.bilibili.com/video/BV1FqtH6vEMo', img: '/assets/img/travel/bili/bath.webp', external: true, meta: 'B站' },
  { title: '约克', sub: '大教堂和铁路博物馆', href: 'https://www.bilibili.com/video/BV1Cs8R6zEu3', img: '/assets/img/travel/bili/york.webp', external: true, meta: 'B站' },
  { title: '爱丁堡', sub: '艺术节 · 城堡与卡尔顿山', href: 'https://www.bilibili.com/video/BV1kt8R6qEca', img: '/assets/img/travel/bili/edinburgh.webp', external: true, meta: 'B站' },
  { title: '牛津', sub: '辉煌的学术与建筑', href: 'https://www.bilibili.com/video/BV1wYtH6MEaL', img: '/assets/img/travel/bili/oxford.webp', external: true, meta: 'B站' },
  { title: '剑桥', sub: '人类群星闪耀', href: 'https://www.bilibili.com/video/BV1JQ4d6FEgP', img: '/assets/img/travel/bili/cambridge.webp', external: true, meta: 'B站' },
  { title: '旅行视频生成', sub: '照片自动编排成片 · 后补', href: '', img: '', pending: true },
];

export const notes = [
  {
    title: '一条 Blender 生产线：陶土手作、室内软装与小区效果图',
    date: '2026-09-01',
    category: '工具篇',
    href: '/notes/2026-09-01-blender-pipeline.html',
    summary: '捏陶土、做软装、出效果图——三个项目一条生产线，以及 AI 在管线里的协作方式。',
  },
  {
    title: '不踩雷，只算数——数字扫雷的创意与进化之路',
    date: '2026-08-17',
    category: '实践手记',
    href: '/notes/2026-08-17-numsweeper.html',
    summary: '从扫雷变体到策略引擎，记录一个小游戏如何在 AI 协作下快速进化。',
  },
  {
    title: '一个会转的地球，装下了大学、世界遗产和 500 强',
    date: '2026-08-16',
    category: '实践手记',
    href: '/notes/2026-08-16-digital-earth-series.html',
    summary: '数字地球系列的设计、数据管线和多主题门户化过程。',
  },
  {
    title: '用好 AI 工具，你也可以拥有个人网站',
    date: '2026-08-16',
    category: '工具篇',
    href: '/notes/2026-08-16-ai-tools-personal-website.html',
    summary: '从作品散落各处，到 AI 协助下三天建成个人网站的全过程。',
  },
];

export const videoChannels = [
  {
    platform: 'B站',
    handle: '劳伦斯在sh · UID 13483307',
    href: 'https://space.bilibili.com/13483307',
    tone: '长视频、系列化作品、科普与项目讲解',
    cta: '进入 B站主页',
  },
  {
    platform: '小红书',
    handle: '劳伦斯在sh',
    href: 'https://www.xiaohongshu.com/user/profile/5d8d47d80000000001019d89',
    tone: '短视频、图文卡片、创作过程与生活化表达',
    cta: '进入小红书主页',
  },
  {
    platform: 'YouTube',
    handle: '@SketchbookBritain',
    href: 'https://www.youtube.com/@SketchbookBritain',
    tone: '海外同步 · 英伦漫记系列',
    cta: '进入 YouTube 频道',
  },
];
