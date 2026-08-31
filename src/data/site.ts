export const site = {
  name: '数字殿堂',
  title: '数字殿堂 · 个人数字作品馆',
  description: '收藏 AI 共创的编程作品、互动实验、视频创作与实践手记。',
  url: 'https://shuzidiantang.com',
  social: [
    {
      name: 'GitHub',
      handle: 'historyreview-code',
      href: 'https://github.com/historyreview-code',
      note: '源码与项目仓库',
    },
    {
      name: 'B站',
      handle: 'UID 13483307',
      href: 'https://space.bilibili.com/13483307',
      note: '长视频与系列作品',
    },
    {
      name: '小红书',
      handle: '劳伦斯 · 598047983',
      href: '',
      note: '短视频、图文与创作日常',
    },
  ],
  beian: {
    icp: '沪ICP备2026042531号',
    icpLink: 'https://beian.miit.gov.cn/',
    // 公安备案通过后追加：gongan / gonganLink（https://beian.mps.gov.cn/）
  },
};

export const works = [
  {
    id: 'earth',
    title: '数字地球',
    eyebrow: '3D 数据可视化',
    href: '/earth/',
    image: '/assets/og/brand.png',
    summary: '把全球大学、世界遗产与 500 强总部放到同一颗可旋转的数字地球上。',
    tags: ['Three.js', 'globe.gl', '数据叙事'],
    status: '旗舰作品',
  },
  {
    id: 'games',
    title: '游戏厅',
    eyebrow: '网页游戏实验',
    href: '/games/',
    image: '/assets/img/games/games-hall.png',
    summary: '数字扫雷、五色石补天记、像素打砖块与记忆自测，把小规则做成可玩的网页作品。',
    tags: ['Canvas', 'Game Design', 'AI 协作'],
    status: '持续上新',
  },
  {
    id: 'cosmos',
    title: '天文馆',
    eyebrow: '交互科普影像',
    href: '/cosmos/',
    image: '/assets/og/voyage.png',
    summary: '宇宙之旅五集连播与宇宙演化全景，用自动放映厅承载科普叙事和旁白。',
    tags: ['科普', '影像', '叙事'],
    status: '已上线',
  },
  {
    id: 'numsweeper',
    title: '数字扫雷',
    eyebrow: '益智策略游戏',
    href: '/games/numsweeper.html',
    image: '/assets/img/games/numsweeper.png',
    summary: '把传统扫雷改造成数字风险决策：一条 250 的生死线，加上概率、策略和语音反馈。',
    tags: ['概率', '策略', '移动端'],
    status: '可试玩',
  },
];

export const notes = [
  {
    title: '不踩雷，只算数——数字扫雷的创意与进化之路',
    date: '2026-08-17',
    category: '作品复盘',
    href: '/notes/2026-08-17-numsweeper.html',
    summary: '从扫雷变体到策略引擎，记录一个小游戏如何在 AI 协作下快速进化。',
  },
  {
    title: '一个会转的地球，装下了大学、地震、世界遗产和 500 强',
    date: '2026-08-16',
    category: '数字作品',
    href: '/notes/2026-08-16-digital-earth-series.html',
    summary: '数字地球系列的设计、数据管线和多主题门户化过程。',
  },
  {
    title: '用好 AI 工具，你也可以拥有个人网站',
    date: '2026-08-16',
    category: '建站运营',
    href: '/notes/2026-08-16-ai-tools-personal-website.html',
    summary: '从作品散落各处，到 AI 协助下三天建成个人网站的全过程。',
  },
];

export const videoChannels = [
  {
    platform: 'B站',
    handle: 'UID 13483307',
    href: 'https://space.bilibili.com/13483307',
    tone: '长视频、系列化作品、科普与项目讲解',
    cta: '进入 B站主页',
  },
  {
    platform: '小红书',
    handle: '劳伦斯 · 598047983',
    href: '',
    tone: '短视频、图文卡片、创作过程与生活化表达',
    cta: '主页链接待确认',
  },
];
