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
      handle: '劳伦斯 · 598047983',
      href: 'https://www.xiaohongshu.com/user/profile/598047983',
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

// 首页作品卡区：按 v3.1 重要性排序。href 为空 = 入馆筹备中（灰卡）。
export const works = [
  {
    id: 'earth',
    title: '数字地球',
    eyebrow: '地球厅',
    href: '/earth/',
    image: '/assets/img/earth.webp',
    summary: '把全球大学、世界遗产与 500 强总部放到同一颗可旋转的数字地球上。',
    tags: ['Three.js', 'globe.gl', '数据叙事'],
    status: '旗舰作品',
  },
  {
    id: 'cosmos',
    title: '天文馆',
    eyebrow: '星空放映厅',
    href: '/cosmos/',
    image: '/assets/img/cosmos.webp',
    summary: '宇宙之旅五集连播与宇宙演化全景，用自动放映厅承载科普叙事和旁白。',
    tags: ['科普', '影像', '叙事'],
    status: '已上线',
  },
  {
    id: 'games',
    title: '游戏厅',
    eyebrow: '网页游戏实验',
    href: '/games/',
    image: '/assets/img/games/games-hall.png',
    summary: '数字扫雷、五色石补天记、像素打砖块与记忆自测，把小规则做成可玩的网页作品。',
    tags: ['Canvas', 'Game Design', 'AI 协作'],
    status: '4 款可玩',
  },
  {
    id: 'clay',
    title: '陶土动物园',
    eyebrow: 'Blender 手作',
    href: '/clay/',
    image: '/assets/img/clay/10.webp',
    summary: '十只用 Blender 捏出来的小动物：一只一只手作入馆，图鉴加全家福。',
    tags: ['Blender', '手作', '图鉴'],
    status: '10 只入馆',
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
    handle: '劳伦斯 · 598047983',
    href: 'https://www.xiaohongshu.com/user/profile/598047983',
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
