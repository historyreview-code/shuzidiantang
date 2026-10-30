export interface ResearchReport {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  date: string;
  evidenceDate: string;
  href: string;
  pdf: string;
  download?: string;
  downloadLabel?: string;
  actionLabel?: string;
  kind?: string;
  coverImage?: string;
  /** 封面底色：浅色封面用浅底，避免卡片内出现深色留边。 */
  coverBackground?: string;
  format?: string;
  tags: string[];
  sources?: number;
  pages: number;
}

// 历史研究子项目：奉系 / 战争与归途。
// 两部专著共用同一段东北亚近代史脉络，首页与专题页都只保留一个子项目入口，
// 具体书目在 /research/history/ 再展开。
export const historyProject: ResearchReport = {
  slug: 'history-fengxi-war',
  title: '奉系 / 战争与归途',
  subtitle: '两部近代东北军政专著',
  summary:
    '《军队、铁路与国家能力：奉系—东北军的兴起与解体》与《战争与归途：日本与俄国、苏联的战略较量》两部专著：从奉系—东北军以军队、铁路与省权立身，到日俄战争、苏联对日宣战与战后抑留归途，围绕近代东北亚的战争、国家能力与人的命运展开。',
  date: '2026-10-29',
  evidenceDate: '2026-10-29',
  href: '/research/history/',
  pdf: '',
  coverImage: '/assets/img/research/history-fengxi-war.png',
  coverBackground: '#f3eee1',
  kind: '历史研究 · 子项目',
  format: '两部专著 · 奉系约 27 万字 · 战争与归途约 6.7 万字',
  actionLabel: '进入历史研究',
  tags: ['奉系—东北军', '日俄战争', '战后归途'],
  pages: 0,
};

export interface HistoryBook {
  slug: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  kind: string;
  summary: string;
  href: string;
  cover: string;
  actionLabel: string;
  download?: string;
  downloadLabel?: string;
  note: string;
}

export const historyBooks: HistoryBook[] = [
  {
    slug: 'fengxi',
    title: '军队、铁路与国家能力',
    subtitle: '奉系—东北军的兴起与解体',
    meta: '六编十八章 · 约 27 万字 · 14 幅图',
    status: '暂定稿 · 供朋友阅读',
    kind: '历史研究 · 图文专著',
    summary:
      '一支从辽西保险队起家的地方武装，为什么能在二十多年里变成拥有铁路、兵工厂、财政和空军的东北军政集团？又为什么在 1931 年几乎一夜之间丢掉根基？把这些问题放回材料里，从头理一遍。',
    href: '/fengxi/',
    cover: '/fengxi/assets/cover-front.jpg',
    actionLabel: '在线阅读',
    note: '暂定稿，非最终出版：地图审图号、照片授权、ISBN 与版次待补。',
  },
  {
    slug: 'war-and-return',
    title: '战争与归途',
    subtitle: '日本与俄国、苏联的战略较量',
    meta: '204 页 · 18 章 · 26 幅地图 · 244 条来源',
    status: 'v1.0 研究分享版',
    kind: '历史研究 · 图文专著',
    summary:
      '从 1904 年日俄战争到 1945 年远东战局，再到战后抑留、归途与日苏关系；十八章与结语串起战略、代价与人的命运，附 26 幅研究地图、历史图版与天皇责任学术述评。',
    href: '/books/war-and-return/',
    cover: '/books/war-and-return/cover.jpg',
    actionLabel: '在线阅读',
    download: '/books/war-and-return/war-and-return-v1.0.epub',
    downloadLabel: '下载 EPUB',
    note: '研究分享版，仅供研究交流；PDF / EPUB 与站内书页同版。',
  },
];

// 首页/专题页的“电子书”条目：两本书独立入口、各自封面，不再共用一个子项目图标。
export const historyBookReports: ResearchReport[] = [
  {
    slug: 'fengxi-book',
    title: '军队、铁路与国家能力',
    subtitle: '奉系—东北军的兴起与解体',
    summary:
      '一支从辽西保险队起家的地方武装，为什么能在二十多年里变成拥有铁路、兵工厂、财政和空军的东北军政集团？又为什么在 1931 年几乎一夜之间丢掉根基？',
    date: '2026-10-29',
    evidenceDate: '2026-10-29',
    href: '/fengxi/',
    pdf: '',
    coverImage: '/assets/img/research/fengxi-wide.png',
    coverBackground: '#f3eee1',
    kind: '历史研究 · 电子书',
    format: '六编十八章 · 约 27 万字 · 14 幅图',
    tags: ['奉系—东北军', '近代东北', '国家能力'],
    pages: 0,
    actionLabel: '在线阅读',
  },
  {
    slug: 'war-and-return-book',
    title: '战争与归途',
    subtitle: '日本与俄国、苏联的战略较量',
    summary:
      '从 1904 年日俄战争到 1945 年远东战局，再到战后抑留、归途与日苏关系；十八章与结语串起战略、代价与人的命运。',
    date: '2026-10-29',
    evidenceDate: '2026-10-29',
    href: '/books/war-and-return/',
    pdf: '',
    download: '/books/war-and-return/war-and-return-v1.0.epub',
    downloadLabel: '下载 EPUB',
    coverImage: '/books/war-and-return/cover-wide.jpg',
    kind: '历史研究 · 电子书',
    format: '204 页 · 18 章 · 26 幅地图',
    tags: ['日俄战争', '战后归途', '日苏关系'],
    sources: 244,
    pages: 204,
    actionLabel: '在线阅读',
  },
];

export const research: ResearchReport[] = [
  {
    slug: 'russian-far-east',
    title: '俄罗斯远东的形成与变迁',
    subtitle: '疆界 · 人口 · 开发与军事',
    summary: '劳伦斯著。以俄罗斯远东为主体，联系东西伯利亚与北太平洋，沿疆界形成、人口迁移、国家开发与地方生活展开。附左右跨页总图、真实历史照片、四幅研究图与2020—2024人口经济底表。',
    date: '2026-10-29',
    evidenceDate: '2026-10-29',
    href: '/research/russian-far-east/',
    pdf: '',
    download: '/research/russian-far-east/v1-4/russian-far-east-lawrence-v1.4.epub',
    downloadLabel: '下载 EPUB',
    actionLabel: '查看本书与总图',
    kind: '历史地理 · 电子书',
    coverImage: '/research/russian-far-east/v1-4/cover.jpg',
    format: '约6.1万字 · 152页 · 十章 · 四图六表 · 跨页版 v1.4',
    tags: ['俄罗斯远东', '东西伯利亚', '历史地理'],
    sources: 150,
    pages: 0,
  },
  {
    slug: 'jilin-shipyards',
    title: '吉林明清船厂与黑龙江航行',
    subtitle: '造船、军运与下游贡赏的历史考察',
    summary: '以摩崖、碑文与地方志考察船厂建设及吉林城的兴起，辨析明代远航、清初军运和下游贡赏的制度与方向。附互动水系地图、厂址示意与考据。',
    date: '2026-10-05',
    evidenceDate: '2026-10-05',
    href: '/maps/jilin-shipyards/',
    pdf: '',
    download: '/maps/jilin-shipyards/report.md',
    downloadLabel: '下载报告正文',
    actionLabel: '阅读报告与地图',
    kind: '历史地理 · 研究报告',
    coverImage: '/assets/img/jilin-shipyards.webp',
    format: '六节正文 · 两幅地图',
    tags: ['明清东北', '河流交通', '文献考据'],
    sources: 19,
    pages: 0,
  },
  {
    slug: 'yunmeng',
    title: '云梦泽：水的变化，人的选择',
    subtitle: '江汉平原的历史地理与人类活动',
    summary: '从湖群与湿地出发，沿商代聚落、楚国郢都、秦简和三国史事，追踪水土变化与治水围垦。附三组可操作的动态示意、十三个专题及参考资料。',
    date: '2026-10-05',
    evidenceDate: '2026-10-05',
    href: '/research/yunmeng/',
    pdf: '',
    download: '/research/yunmeng/report.md',
    downloadLabel: '下载报告正文',
    actionLabel: '阅读与探索',
    kind: '历史地理 · 研究报告',
    coverImage: '/research/yunmeng/cover.svg',
    format: '十三个专题 · 三组动态示意',
    tags: ['云梦泽', '河湖演变', '人地关系'],
    sources: 21,
    pages: 0,
  },
  {
    slug: 'shamanism',
    title: '萨满：人与万物之间',
    subtitle: '从史前痕迹到今天的传承',
    summary: '沿时间与空间梳理考古线索、亚洲与美洲的联系、东亚族群传统和当代延续。以八分多钟中文科普影片展开，附逐段文案与原始研究来源。',
    date: '2026-10-02',
    evidenceDate: '2026-10-02',
    href: '/research/shamanism/',
    pdf: '',
    download: '/research/shamanism/v2-1/script-zh.txt',
    downloadLabel: '下载解说文案',
    actionLabel: '观看与阅读',
    kind: '文化研究 · 科普影片',
    coverImage: '/research/shamanism/v2-1/poster.webp',
    format: '8 分 26 秒 · 文案与分镜',
    tags: ['萨满文化', '历史与地理', '纪录片式科普'],
    sources: 24,
    pages: 0,
  },
  {
    slug: 'land-renewal',
    title: '土地续期与补地价研究',
    subtitle: '从上海K11到跨地区土地制度比较',
    summary: '围绕续期为何收费、20年如何定价、提前续期如何支持REITs，梳理内地规则与地方实践，集中比较港澳台日及新加坡政策，并纳入持有税费。',
    date: '2026-09-22',
    evidenceDate: '2026-09-20',
    href: '/research/land-renewal/',
    pdf: '/research/land-renewal/land-renewal-report-20260922.pdf',
    tags: ['土地制度', 'REITs', '政策比较'],
    sources: 43,
    pages: 9,
  },
];
