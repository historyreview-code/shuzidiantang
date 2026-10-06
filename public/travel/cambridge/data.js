import {foods} from './food.js';
import {stories} from './stories.js';
export const places=[
  {
    "id": "kings",
    "name": "国王学院礼拜堂",
    "localName": "King's College Chapel Cambridge",
    "en": "King's College Chapel Cambridge",
    "zone": "college",
    "area": "剑桥 · 国王学院",
    "kind": "temple",
    "icon": "kings",
    "x": 740,
    "y": 620,
    "minutes": 90,
    "effort": 1,
    "subtitle": "抬头以后，我想把脚步放得更慢",
    "description": "扇形拱顶、彩色玻璃与修长石构让礼拜堂成为剑桥的代表性空间。学院庭院、礼拜堂参观和宗教音乐活动有不同的进入方式。",
    "prompt": "扇形拱顶像植物伸展，也像结构计算；你先看见哪一种？",
    "tip": "按官方票务核对可进入区域；礼拜与音乐活动不是普通参观附赠节目。考试、学院活动或修缮会改变开放。",
    "source": "https://www.kings.cam.ac.uk/visit-kings",
    "sourceLabel": "官方 / 场馆资料 · 国王学院礼拜堂",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "国王学院",
    "overviewName": "国王学院",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "trinity",
    "name": "三一学院 · 按开放路线",
    "localName": "Trinity College Cambridge",
    "en": "Trinity College Cambridge",
    "zone": "college",
    "area": "剑桥 · 三一学院",
    "kind": "temple",
    "icon": "trinity",
    "x": 725,
    "y": 395,
    "minutes": 75,
    "effort": 1,
    "subtitle": "在大门之内，给别人的日常留一条路",
    "description": "学院建筑、庭院与学术传统可通过当日官方参观安排理解。公共到访并不意味着可以自由进入所有庭院、礼堂或图书馆。",
    "prompt": "一座仍在运作的学院，与供人观看的古迹，有哪些不同？",
    "tip": "核对学院当前导览和开放区域；Wren 图书馆有独立规则，不默认包含在学院参观内。不要穿越私人院落。",
    "source": "https://www.trin.cam.ac.uk/about/visiting-trinity-college/",
    "sourceLabel": "官方 / 场馆资料 · 三一学院 · 按开放路线",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "三一学院",
    "overviewName": "三一学院",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "johns",
    "name": "圣约翰学院 · 外观",
    "localName": "St John's College Cambridge",
    "en": "St John's College Cambridge",
    "zone": "college",
    "area": "剑桥 · 圣约翰外观",
    "kind": "temple",
    "icon": "johns",
    "x": 600,
    "y": 220,
    "minutes": 25,
    "effort": 1,
    "subtitle": "把一扇关着的门，也写进行程",
    "description": "砖石门楼与学院建筑构成圣约翰街的重要街景。本点当前按外观观察安排；学院内部庭院与叹息桥不属于默认可自由进入的城市公共空间。",
    "prompt": "不走进院落，也能从门楼读到哪些关于学院身份的线索？",
    "tip": "2026-10-06 核对时，官网称学院 grounds 暂停一般旅游参观。本点只计公共街道外观；恢复与例外资格请查官网，勿按旧游记直接入内。",
    "source": "https://www.joh.cam.ac.uk/visit-us/visitor-information",
    "sourceLabel": "官方 / 场馆资料 · 圣约翰学院 · 外观",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "圣约翰外观",
    "overviewName": "圣约翰外观",
    "tags": [
      "建筑观察",
      "慢慢看"
    ],
    "notice": "2026-10-06 核对时，官网称学院 grounds 暂停一般旅游参观。本点只计公共街道外观；恢复与例外资格请查官网，勿按旧游记直接入内。"
  },
  {
    "id": "queens",
    "name": "数学桥 · 银街视角",
    "localName": "Mathematical Bridge Cambridge",
    "en": "Mathematical Bridge Cambridge",
    "zone": "river",
    "area": "剑桥 · 数学桥",
    "kind": "temple",
    "icon": "queens",
    "x": 620,
    "y": 845,
    "minutes": 25,
    "effort": 1,
    "subtitle": "在银街的桥边，看看直线怎样变成弧",
    "description": "王后学院的数学桥以直木构件组成富有曲线感的跨河结构。这里按公共 Silver Street 桥附近的外观视角安排，进入学院需另核对。",
    "prompt": "一组直线，为什么能在远看时形成柔和的弧？",
    "tip": "桥不是牛顿设计；最初方案出自 William Etheridge，1749 年由 James Essex 建造，现桥经历重建。不要把“无钉桥”传说当事实。",
    "source": "https://history.queens.cam.ac.uk/college/mathematical-bridge",
    "sourceLabel": "官方 / 场馆资料 · 数学桥 · 银街视角",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "数学桥",
    "overviewName": "数学桥",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "backs",
    "name": "学院后花园 · 公共步道",
    "localName": "The Backs Cambridge",
    "en": "The Backs Cambridge",
    "zone": "river",
    "area": "剑桥 · 学院后花园",
    "kind": "nature",
    "icon": "backs",
    "x": 385,
    "y": 575,
    "minutes": 60,
    "effort": 1,
    "subtitle": "走到学院背后，才看见更多天空",
    "description": "沿 Queens' Road 一带公共步道看康河、草地与学院背面的轮廓。The Backs 是一组空间关系，并非所有草坪和桥都属于公共公园。",
    "prompt": "学院的背面，与门楼正面相比，怎样改变你的感受？",
    "tip": "沿明确开放的公共路径，尊重草坪、桥梁和学院边界。不同岸段不一定相通，不按抽象地图的直线穿越。",
    "source": "https://www.sport.cam.ac.uk/camrun/walking-and-running-routes",
    "sourceLabel": "官方 / 场馆资料 · 学院后花园 · 公共步道",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "学院后花园",
    "overviewName": "学院后花园",
    "tags": [
      "河岸园林",
      "慢慢看"
    ]
  },
  {
    "id": "punting",
    "name": "康河撑篙 · Mill Lane",
    "localName": "Scudamore's Mill Lane Punting Cambridge",
    "en": "Scudamore's Mill Lane Punting Cambridge",
    "zone": "river",
    "area": "剑桥 · 康河撑篙",
    "kind": "nature",
    "icon": "punting",
    "x": 840,
    "y": 815,
    "minutes": 60,
    "effort": 1,
    "subtitle": "把步行的剑桥，换成水面的速度",
    "description": "平底船以长篙推动，低于岸边视线的乘船角度让桥梁、河岸与学院轮廓显得不同。本点取 Mill Lane 上船片区，其他码头和航线须单独确认。",
    "prompt": "当身体降到水面附近，同一座桥为什么像换了尺度？",
    "tip": "选择正规运营者，核对码头、航线、集合与天气取消规则。导览船、自撑和不同河段时长不同；船票不包含学院入场。",
    "source": "https://www.scudamores.com/",
    "sourceLabel": "官方 / 场馆资料 · 康河撑篙 · Mill Lane",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "康河撑篙",
    "overviewName": "康河撑篙",
    "tags": [
      "河岸园林",
      "慢慢看"
    ]
  },
  {
    "id": "fitz",
    "name": "菲茨威廉博物馆",
    "localName": "Fitzwilliam Museum Cambridge",
    "en": "Fitzwilliam Museum Cambridge",
    "zone": "south",
    "area": "剑桥 · 菲茨威廉",
    "kind": "museum",
    "icon": "fitz",
    "x": 1040,
    "y": 940,
    "minutes": 150,
    "effort": 1,
    "subtitle": "给两间展厅一个下午，也不算少",
    "description": "大学博物馆的收藏横跨古代文明、绘画与装饰艺术。古典立面之后，是可以按个人兴趣选择的多条观看路线，常设与特别展览安排须区分。",
    "prompt": "古代器物和近代绘画，能否围绕同一个生活问题一起看？",
    "tip": "核对开馆日、入口及临展票务；一般收藏与特别展览预约可能不同。选两个主题比一次扫完全馆更从容。",
    "source": "https://fitzmuseum.cam.ac.uk/plan-your-visit",
    "sourceLabel": "官方 / 场馆资料 · 菲茨威廉博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "菲茨威廉",
    "overviewName": "菲茨威廉",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "kettle",
    "name": "Kettle's Yard 艺术之家",
    "localName": "Kettle's Yard Cambridge",
    "en": "Kettle's Yard Cambridge",
    "zone": "north",
    "area": "剑桥 · 艺术之家",
    "kind": "museum",
    "icon": "kettle",
    "x": 320,
    "y": 160,
    "minutes": 100,
    "effort": 1,
    "subtitle": "如果一间家，也能教人怎样看艺术",
    "description": "Jim 与 Helen Ede 曾居住的房屋把现代艺术、家具、石子和生活空间放在一起；旁边的画廊举办当代展览。住宅与画廊的进入安排并不相同。",
    "prompt": "如果作品与椅子、窗光放在一起，你还会按展厅的方式看它吗？",
    "tip": "住宅通常需按官方方式订时段，画廊与住宅分别核对。尊重室内拍摄和触碰规则，不因空间像家就自行使用陈设。",
    "source": "https://www.museums.cam.ac.uk/museums/kettles-yard",
    "sourceLabel": "官方 / 场馆资料 · Kettle's Yard 艺术之家",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "艺术之家",
    "overviewName": "艺术之家",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "round",
    "name": "圆教堂",
    "localName": "Round Church Cambridge",
    "en": "Round Church Cambridge",
    "zone": "north",
    "area": "剑桥 · 圆教堂",
    "kind": "temple",
    "icon": "round",
    "x": 980,
    "y": 280,
    "minutes": 45,
    "effort": 1,
    "subtitle": "从高耸的礼拜堂，走进一个圆",
    "description": "约建于 1130 年的圆形诺曼建筑，以紧凑体量与环形空间区别于高耸的学院礼拜堂。访客中心以展览与影片介绍其自身的历史叙述。",
    "prompt": "在圆形空间里，视线是否还像长形教堂里那样一直向前？",
    "tip": "核对访客中心开放和票务。展览有其基督教历史叙述视角，可以结合大学和城市资料阅读，不将一种解读等同全部历史。",
    "source": "https://roundchurchcambridge.org/round-church-visitor-centre/",
    "sourceLabel": "官方 / 场馆资料 · 圆教堂",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "圆教堂",
    "overviewName": "圆教堂",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "stmary",
    "name": "大圣玛丽教堂",
    "localName": "Great St Mary's Cambridge",
    "en": "Great St Mary's Cambridge",
    "zone": "centre",
    "area": "剑桥 · 大圣玛丽",
    "kind": "temple",
    "icon": "stmary",
    "x": 990,
    "y": 585,
    "minutes": 60,
    "effort": 3,
    "subtitle": "如果想登高，就只认真登这一次",
    "description": "大学教堂位于市中心，塔楼观景与地面参访提供不同体验。从高处看学院和市场，能把分散的地标重新放回城市结构中。",
    "prompt": "从高处看，学院庭院和普通街道占据的空间有何不同？",
    "tip": "塔楼有狭窄螺旋台阶，登塔体力与入场规则先查；不适合时只看地面空间。礼拜期间尊重现场安排。",
    "source": "https://www.greatstmarys.org/visit",
    "sourceLabel": "官方 / 场馆资料 · 大圣玛丽教堂",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "大圣玛丽",
    "overviewName": "大圣玛丽",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "market",
    "name": "市场广场",
    "localName": "Cambridge Market Square",
    "en": "Cambridge Market Square",
    "zone": "centre",
    "area": "剑桥 · 市场广场",
    "kind": "street",
    "icon": "market",
    "x": 1230,
    "y": 580,
    "minutes": 50,
    "effort": 1,
    "subtitle": "在学院之间，找一顿普通的午饭",
    "description": "摊位、街头餐食与独立商贩让大学城露出日常的一面。广场并非固定不变的菜单，摊位与营业会依日期、天气和个体经营调整。",
    "prompt": "如果只用一种食物认识这座城市，你会先问摊主什么？",
    "tip": "先看当日摊位与过敏信息；不要用旧游记里的单一摊位作为必吃保证。购物和排队请避开自行车与行人通道。",
    "source": "https://www.cambridge.gov.uk/markets",
    "sourceLabel": "官方 / 场馆资料 · 市场广场",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "市场广场",
    "overviewName": "市场广场",
    "tags": [
      "街巷生活",
      "慢慢看"
    ]
  },
  {
    "id": "botanic",
    "name": "剑桥大学植物园",
    "localName": "Cambridge University Botanic Garden",
    "en": "Cambridge University Botanic Garden",
    "zone": "south",
    "area": "剑桥 · 大学植物园",
    "kind": "nature",
    "icon": "botanic",
    "x": 1210,
    "y": 1250,
    "minutes": 120,
    "effort": 1,
    "subtitle": "在一片叶子上，读到另一种剑桥",
    "description": "活体植物收藏、温室与园路把观赏、教学和研究放在同一空间里。这里并非学院后花园，而是市中心以南需要单独安排的植物园。",
    "prompt": "同样是一片叶子，它的形状怎样回应水分、光线与气候？",
    "tip": "门票、入口和温室开放另查；花期依天气变化。与市中心之间的步行及返程另留缓冲，不用地图压缩距离估算分钟。",
    "source": "https://www.botanic.cam.ac.uk/",
    "sourceLabel": "官方 / 场馆资料 · 剑桥大学植物园",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "大学植物园",
    "overviewName": "大学植物园",
    "tags": [
      "河岸园林",
      "慢慢看"
    ]
  },
  {
    "id": "zoology",
    "name": "大学动物学博物馆",
    "localName": "University Museum of Zoology Cambridge",
    "en": "University Museum of Zoology Cambridge",
    "zone": "museum",
    "area": "剑桥 · 动物学馆",
    "kind": "museum",
    "icon": "zoology",
    "x": 1320,
    "y": 780,
    "minutes": 100,
    "effort": 1,
    "subtitle": "从一头鲸的骨架，看到自己的肩膀",
    "description": "大厅悬挂的长须鲸骨架和动物标本展示演化、多样性与灭绝的线索。巨大的尺度之外，小型标本同样值得认真看。",
    "prompt": "骨骼看起来差别很大时，能否找到仍然相似的结构？",
    "tip": "核对开放日、活动与无障碍入口。这里主要看标本与研究展示，不是活体动物园；可按孩子兴趣缩小主题。",
    "source": "https://www.museums.cam.ac.uk/museums/museum-zoology",
    "sourceLabel": "官方 / 场馆资料 · 大学动物学博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "动物学馆",
    "overviewName": "动物学馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "maa",
    "name": "考古与人类学博物馆",
    "localName": "Museum of Archaeology and Anthropology Cambridge",
    "en": "Museum of Archaeology and Anthropology Cambridge",
    "zone": "museum",
    "area": "剑桥 · 考古人类学",
    "kind": "museum",
    "icon": "maa",
    "x": 1300,
    "y": 975,
    "minutes": 100,
    "effort": 1,
    "subtitle": "读一件物品，也读它来到这里的路",
    "description": "当地考古与世界各地的物品收藏，呈现人类生活、技艺与社会关系。物品的制作、使用及进入博物馆的过程，都值得一起阅读。",
    "prompt": "如果一件物品离开原来的社区，它失去了什么，又被赋予了什么？",
    "tip": "按馆内文化与拍摄说明参观，尊重神圣或敏感物品。避免把不同社会的物品笼统看成奇异装饰。",
    "source": "https://www.museums.cam.ac.uk/museums/museum-archaeology-and-anthropology",
    "sourceLabel": "官方 / 场馆资料 · 考古与人类学博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "考古人类学",
    "overviewName": "考古人类学",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "sedgwick",
    "name": "塞奇威克地球科学博物馆",
    "localName": "Sedgwick Museum Cambridge",
    "en": "Sedgwick Museum Cambridge",
    "zone": "museum",
    "area": "剑桥 · 地球科学馆",
    "kind": "museum",
    "icon": "sedgwick",
    "x": 1080,
    "y": 765,
    "minutes": 90,
    "effort": 2,
    "subtitle": "把一天的时间，放进一块岩石旁边",
    "description": "岩石、矿物和化石把地球的漫长历史带到眼前，禽龙骨架复制品等展示帮助理解古生命。原件、模型与复制件应按展签区分。",
    "prompt": "一块石头上的纹路，怎样从形状变成关于过去的证据？",
    "tip": "核对开放、入口和无障碍条件；不要把所有骨架都当原始化石。儿童可先选恐龙或矿物一条线。",
    "source": "https://www.museums.cam.ac.uk/museums/sedgwick-museum-earth-sciences",
    "sourceLabel": "官方 / 场馆资料 · 塞奇威克地球科学博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "地球科学馆",
    "overviewName": "地球科学馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "polar",
    "name": "极地博物馆",
    "localName": "The Polar Museum Cambridge",
    "en": "The Polar Museum Cambridge",
    "zone": "south",
    "area": "剑桥 · 极地博物馆",
    "kind": "museum",
    "icon": "polar",
    "x": 1460,
    "y": 1120,
    "minutes": 90,
    "effort": 1,
    "subtitle": "在一件旧衣服前，想一想身体的边界",
    "description": "极地探险、科学工作与极地生活的物品资料，让地图边缘的地区拥有具体的人和经验。仪器、日记与衣物可以相互补充地阅读。",
    "prompt": "一件保暖衣物，能讲述多少关于技术、身体与当地知识的事？",
    "tip": "核对开放日与特别活动；把极地居民与科学工作者的经验一起看，不只追逐英雄式探险故事。",
    "source": "https://www.museums.cam.ac.uk/museums/polar-museum",
    "sourceLabel": "官方 / 场馆资料 · 极地博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "极地博物馆",
    "overviewName": "极地博物馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  }
];
export const routes=[
  {
    "id": "first",
    "title": "拱顶、河岸与一杯茶",
    "ids": [
      "kings",
      "backs",
      "queens",
      "market"
    ],
    "mood": "初访剑桥",
    "reason": "一座学院看深入，外部步道与数学桥补足河岸视角，再用市场午餐收尾。",
    "icon": "kings",
    "subtitle": "国王学院 → 学院后花园 → 数学桥 → 市场广场",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "rain",
    "title": "一条街，三种看世界的方法",
    "ids": [
      "fitz",
      "sedgwick",
      "zoology"
    ],
    "mood": "室内为主",
    "reason": "绘画、地质与动物演化构成知识路线；三馆较充实，可按兴趣删去一馆，先核对共同开放日。",
    "icon": "fitz",
    "subtitle": "菲茨威廉 → 地球科学馆 → 动物学馆",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "artday",
    "title": "从艺术之家走到圆教堂",
    "ids": [
      "kettle",
      "round",
      "trinity"
    ],
    "mood": "艺术与建筑",
    "reason": "先确认住宅预约与学院导览，再用圆形教堂对照房屋和庭院的尺度。",
    "icon": "kettle",
    "subtitle": "艺术之家 → 圆教堂 → 三一学院",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "riverday",
    "title": "把康河留给半天",
    "ids": [
      "punting",
      "queens",
      "fitz"
    ],
    "mood": "河上与馆内",
    "reason": "确认 Mill Lane 上船点；乘船后走到数学桥，再去博物馆，风雨取消时直接转室内。",
    "icon": "punting",
    "subtitle": "康河撑篙 → 数学桥 → 菲茨威廉",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "curiosity",
    "title": "给好奇心选两个展柜",
    "ids": [
      "maa",
      "zoology",
      "market"
    ],
    "mood": "亲子 / 人与自然",
    "reason": "两座大学馆加市场午餐，避免把孩子的注意力消耗在连续学院门楼上。",
    "icon": "maa",
    "subtitle": "考古人类学 → 动物学馆 → 市场广场",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "southday",
    "title": "从极地走进一座植物园",
    "ids": [
      "polar",
      "botanic"
    ],
    "mood": "南部慢游",
    "reason": "室内理解环境与生存，再观察活体植物；两处分别核对开馆日和入口。",
    "icon": "polar",
    "subtitle": "极地博物馆 → 大学植物园",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  }
];
export const seasons={
  "spring": {
    "name": "春 · 河绿",
    "line": "从新叶看起，沿河遇见一座学院",
    "caption": "季节灵感，花况与学院开放按日期确认；切换季节保留计划。",
    "color": "#688879"
  },
  "summer": {
    "name": "夏 · 长日",
    "line": "把河上的一小时，留给轻一点的风",
    "caption": "乘船需看天气和码头；晴热时保留室内休息；切换季节保留计划。",
    "color": "#688879"
  },
  "autumn": {
    "name": "秋 · 书页",
    "line": "在叶色与展柜之间，把好奇心放慢",
    "caption": "开学与学院活动可能调整游客路线；切换季节保留计划。",
    "color": "#688879"
  },
  "winter": {
    "name": "冬 · 室内光",
    "line": "让博物馆，把短日照的一天展开",
    "caption": "冬季户外尽量排白天，开馆日逐馆核对；切换季节保留计划。",
    "color": "#688879"
  }
};
export const kinds={
  "all": "全部景点",
  "temple": "城市地标",
  "street": "街巷生活",
  "nature": "河岸园林",
  "museum": "博物美术",
  "saved": "我的收藏"
};
export const SOURCES={
  "manners": "https://www.visitcambridge.org/",
  "crowd": "https://www.museums.cam.ac.uk/",
  "roads": "https://www.visitcambridge.org/"
};
export const city={...{
  "id": "cambridge",
  "name": "剑桥",
  "brand": "悠游",
  "en": "CAMBRIDGE",
  "subtitle": "一座城，慢慢走",
  "intro": "从扇形拱顶到鲸的骨架，沿康河把学院、艺术与科学，走成好奇心的路径。",
  "checkedAt": "2026-10-06",
  "sourceNote": "景物与背景参考场馆、大学、市政府和官方旅游资料；编辑手记并非作者亲历，开放提示为核验日快照。",
  "defaultSeason": "autumn",
  "navigationQuery": "CAMBRIDGE",
  "ui": {
    "stamp": "悠",
    "hero": "沿河读世界。",
    "defaultPlan": "我的剑桥漫游",
    "emptyPlan": "留给剑桥的一天",
    "discovery": "从一处细节，认识一座城。",
    "guideTitle": "剑桥 · 怎样慢慢走",
    "featuredStories": [
      "kings",
      "kettle",
      "zoology"
    ],
    "etiquette": "学院仍是学习与生活场所，按官方游客路线进入，不踩限制草坪；河道按运营者要求乘船，公共桥面与自行车通道不久占。",
    "musicTitle": "康河慢拍"
  },
  "planning": {
    "connectedZones": [
      "college|north",
      "centre|college",
      "college|river",
      "centre|museum",
      "museum|south",
      "river|south"
    ],
    "sameZone": [
      10,
      20
    ],
    "connected": [
      15,
      30
    ],
    "crossZone": [
      25,
      45
    ],
    "legReserves": {
      "punting|queens": [
        5,
        15,
        "银街 / Mill Lane 步行"
      ],
      "sedgwick|zoology": [
        5,
        15,
        "大学博物馆片区"
      ],
      "maa|sedgwick": [
        5,
        15,
        "Downing Site 步行"
      ],
      "fitz|polar": [
        10,
        20,
        "南部街区步行"
      ]
    },
    "advice": [
      {
        "ids": [
          "johns"
        ],
        "message": "圣约翰学院：截至 2026-10-06 官网暂停一般旅游参观。本点仅外观；恢复情况请重新核对。"
      },
      {
        "ids": [
          "kings",
          "trinity"
        ],
        "message": "学院按出发日核对游客路线和预约，礼拜、教学或活动可能调整开放。"
      },
      {
        "ids": [
          "punting"
        ],
        "message": "撑篙确认 Mill Lane 集合点与航线，船票不含学院入场；风雨取消可改大学博物馆。"
      },
      {
        "ids": [
          "botanic"
        ],
        "message": "植物园位于中心南侧，门票与温室开放另查，住处往返另留时间。"
      }
    ]
  },
  "map": {
    "width": 1600,
    "height": 1360,
    "focus": {
      "x": 810,
      "y": 690
    },
    "anchors": [],
    "mountains": [],
    "roads": [
      {
        "id": "245170",
        "name": "Castle St",
        "path": "M215 5L445 310",
        "label": [
          245,
          170
        ],
        "rotate": 54
      },
      {
        "id": "460365",
        "name": "Bridge St · Magdalene Bridge",
        "path": "M445 310L900 350",
        "label": [
          460,
          365
        ],
        "rotate": 0
      },
      {
        "id": "870460",
        "name": "St John’s St · Trinity St",
        "path": "M870 350V525L920 600",
        "label": [
          870,
          460
        ],
        "rotate": 90
      },
      {
        "id": "920665",
        "name": "King’s Parade",
        "path": "M900 580L910 760",
        "label": [
          920,
          665
        ],
        "rotate": 90
      },
      {
        "id": "225730",
        "name": "Queens’ Road",
        "path": "M225 300Q190 640 365 900",
        "label": [
          225,
          730
        ],
        "rotate": 78
      },
      {
        "id": "635925",
        "name": "Silver St",
        "path": "M370 910L960 900",
        "label": [
          635,
          925
        ],
        "rotate": 0
      },
      {
        "id": "10001080",
        "name": "Trumpington St",
        "path": "M965 810L1020 1180",
        "label": [
          1000,
          1080
        ],
        "rotate": 80
      },
      {
        "id": "1250867",
        "name": "Downing St",
        "path": "M965 840L1460 830",
        "label": [
          1250,
          867
        ],
        "rotate": 0
      },
      {
        "id": "12801248",
        "name": "Lensfield Rd",
        "path": "M1000 1210H1500",
        "label": [
          1280,
          1248
        ],
        "rotate": 0
      }
    ],
    "rivers": [
      {
        "name": "康河 · CAM",
        "path": "M385 -20Q420 140 455 270Q530 345 505 500Q455 660 540 825T840 1100L890 1410",
        "width": 48,
        "label": [
          490,
          720
        ]
      }
    ],
    "parks": [
      {
        "x": 365,
        "y": 580,
        "rx": 165,
        "ry": 250
      },
      {
        "x": 1280,
        "y": 1170,
        "rx": 185,
        "ry": 150
      }
    ],
    "districts": [
      {
        "x": 1005,
        "y": 95,
        "name": "学 院 与 艺 术",
        "en": "COLLEGES & ART"
      },
      {
        "x": 1160,
        "y": 420,
        "name": "市 场 街 区",
        "en": "CITY CENTRE"
      },
      {
        "x": 1250,
        "y": 1100,
        "name": "植 物 与 研 究",
        "en": "LIVING COLLECTIONS"
      }
    ],
    "trees": [
      [
        270,
        510
      ],
      [
        270,
        650
      ],
      [
        350,
        750
      ],
      [
        430,
        900
      ],
      [
        1170,
        1260
      ],
      [
        1430,
        1200
      ]
    ],
    "mapNote": "北向示意 · 学院草地与桥梁不表示公共通行"
  }
},places,routes,seasons,kinds,foods,stories,sources:SOURCES};
