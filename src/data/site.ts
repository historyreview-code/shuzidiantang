export const site = {
  name: '数字殿堂',
  title: '数字殿堂 · 劳伦斯在上海',
  description: '劳伦斯在上海的个人数字作品馆：地球、星空、游戏与手记，每件展品都有真实入口。',
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
    summary: '把全球大学、世界遗产与 500 强总部放到同一颗可旋转的数字地球上。',
    tags: ['Three.js', 'globe.gl', '数据叙事'],
    status: '旗舰作品',
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
    summary: '把一天十二个时辰做成可进入的展览：章节轮换、现场声交互。',
    tags: ['数据艺术', '声音交互', '展览'],
    status: '已上线',
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
    id: 'numsweeper',
    title: '数字扫雷',
    eyebrow: '网页游戏 · 益智策略',
    href: '/games/numsweeper.html',
    image: '/assets/img/games/numsweeper.png',
    summary: '把传统扫雷改造成数字风险决策：一条 250 的生死线，加上概率、策略和语音反馈。',
    tags: ['概率', '策略', '移动端'],
    status: '可试玩',
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
  },
  {
    id: 'pixel-breaker',
    title: '像素打砖块',
    eyebrow: '网页游戏 · 街机',
    href: '/games/pixel-breaker.html',
    image: '/assets/img/games/pixel-breaker.webp',
    summary: '像素风打砖块：接住小球，把砖墙一块块敲掉。',
    tags: ['Canvas', '街机', '手感'],
    status: '可试玩',
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

export const notes = [
  {
    title: '不踩雷，只算数——数字扫雷的创意与进化之路',
    date: '2026-08-17',
    category: '实践手记',
    href: '/notes/2026-08-17-numsweeper.html',
    summary: '从扫雷变体到策略引擎，记录一个小游戏如何在 AI 协作下快速进化。',
  },
  {
    title: '一个会转的地球，装下了大学、地震、世界遗产和 500 强',
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
