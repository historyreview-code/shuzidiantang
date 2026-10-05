import {foods} from './food.js';
import {stories} from './stories.js';
export const CHECKED_AT='2026-10-05';
export const SOURCES={
  "manners": "https://edinburgh.org/",
  "crowd": "https://www.historicenvironment.scot/visit/all/holyrood-park/",
  "areas": "https://edinburgh.org/neighbourhoods/",
  "roads": "https://edinburghtour.com/wp-content/uploads/2025/04/250304_EBT_A2Guide_EBT.pdf"
};
export const places=[
  {
    "id": "castle",
    "name": "爱丁堡城堡",
    "localName": "Edinburgh Castle",
    "en": "Edinburgh Castle",
    "zone": "old",
    "area": "老城 · 城堡岩",
    "kind": "temple",
    "icon": "castle",
    "x": 405,
    "y": 660,
    "minutes": 150,
    "effort": 3,
    "subtitle": "火山岩上的城，不只一个观景台",
    "description": "城堡占据老城西端的岩丘。大礼堂、圣玛格丽特礼拜堂与不同院落，把军事、防守和王室生活放在同一条上坡路上。",
    "prompt": "从城墙回望，找到谷地对面的新城。",
    "tip": "内部有坡道和石面；热门日期先查入场时段。礼炮与展厅开放按当天公告。",
    "source": "https://www.edinburghcastle.scot/see-and-do/",
    "sourceLabel": "爱丁堡城堡官方",
    "tags": [
      "城堡岩",
      "历史建筑"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "爱丁堡城堡",
    "overviewName": "爱丁堡城堡"
  },
  {
    "id": "camera",
    "name": "暗箱与幻象世界",
    "localName": "Camera Obscura and World of Illusions",
    "en": "Camera Obscura and World of Illusions",
    "zone": "old",
    "area": "老城 · Castlehill",
    "kind": "museum",
    "icon": "camera",
    "x": 520,
    "y": 705,
    "minutes": 100,
    "effort": 3,
    "subtitle": "在镜子里迷路，再去屋顶找回城市",
    "description": "从互动错觉、镜面空间到屋顶暗箱演示，这里把“看见”本身变成主题。屋顶能换一个角度观察城堡与老城。",
    "prompt": "比较镜子里的空间和窗外真正的距离。",
    "tip": "楼层之间只有楼梯，没有电梯；室内景点也需要体力。演示安排现场确认。",
    "source": "https://www.camera-obscura.co.uk/",
    "sourceLabel": "场馆官方",
    "tags": [
      "光学幻象",
      "亲子"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "暗箱幻象馆",
    "overviewName": "暗箱幻象馆"
  },
  {
    "id": "writers",
    "name": "作家博物馆",
    "localName": "The Writers’ Museum",
    "en": "The Writers’ Museum",
    "zone": "old",
    "area": "老城 · Lady Stair’s Close",
    "kind": "museum",
    "icon": "writers",
    "x": 610,
    "y": 620,
    "minutes": 60,
    "effort": 2,
    "subtitle": "从一条小巷，走进三个作家的房间",
    "description": "Lady Stair’s House 内以彭斯、司各特、史蒂文森为线索，展出肖像、书籍与个人物件。狭小街巷与老宅本身，也值得放慢阅读。",
    "prompt": "一本书的作者，也会用什么样的桌椅？",
    "tip": "老宅空间与楼梯较窄；不是完整文学史展，先选一位感兴趣的作家。",
    "source": "https://cultureedinburgh.com/our-venues/writers-museum",
    "sourceLabel": "爱丁堡文化场馆官方",
    "tags": [
      "文学",
      "老宅"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "作家博物馆",
    "overviewName": "作家博物馆"
  },
  {
    "id": "stgiles",
    "name": "圣吉尔斯大教堂",
    "localName": "St Giles’ Cathedral",
    "en": "St Giles’ Cathedral",
    "zone": "old",
    "area": "老城 · 皇家一英里",
    "kind": "temple",
    "icon": "stgiles",
    "x": 720,
    "y": 715,
    "minutes": 55,
    "effort": 1,
    "subtitle": "街道中央，一顶石头王冠",
    "description": "皇家一英里上的教堂以冠形塔尖识别。这里仍是礼拜场所，也提供理解苏格兰宗教与城市历史的入口。",
    "prompt": "抬头看拱顶，再看看光落在哪里。",
    "tip": "官网自 2026-10-05 起调整游客票务；不要沿用旧攻略的免费入场说法。礼拜安排优先。",
    "source": "https://www.stgilescathedral.org.uk/",
    "sourceLabel": "教堂官方",
    "tags": [
      "宗教建筑",
      "城市历史"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "圣吉尔斯大教堂",
    "overviewName": "圣吉尔斯大教堂"
  },
  {
    "id": "victoria",
    "name": "维多利亚街与草市场",
    "localName": "Victoria Street Grassmarket",
    "en": "Victoria Street Grassmarket",
    "zone": "old",
    "area": "老城 · 街巷坡道",
    "kind": "street",
    "icon": "victoria",
    "x": 510,
    "y": 830,
    "minutes": 65,
    "effort": 2,
    "subtitle": "沿着弯弯的彩色店面，走下一段坡",
    "description": "维多利亚街弯曲的立面与草市场开阔街区，呈现老城在不同高度展开的生活。独立小店、街角与城堡背景可以慢慢看。",
    "prompt": "同一间店，从上层步道和街面看有什么不同？",
    "tip": "这是有车流和居民生活的街道；不要把整条街当作摄影布景。店铺时段各异。",
    "source": "https://edinburgh.org/neighbourhoods/grassmarket/",
    "sourceLabel": "Forever Edinburgh 官方旅游指南",
    "tags": [
      "彩色街屋",
      "小店"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "维多利亚街",
    "overviewName": "维多利亚街"
  },
  {
    "id": "greyfriars",
    "name": "灰衣修士墓园",
    "localName": "Greyfriars Kirkyard",
    "en": "Greyfriars Kirkyard",
    "zone": "old",
    "area": "老城 · Greyfriars",
    "kind": "temple",
    "icon": "greyfriars",
    "x": 630,
    "y": 935,
    "minutes": 45,
    "effort": 1,
    "subtitle": "小狗故事之外，也听见石碑的沉默",
    "description": "墓园与仍在使用的 Greyfriars Kirk 相邻。Bobby 的故事让很多人来到这里，古老碑刻、树木和城市记忆则值得安静观察。",
    "prompt": "在不触碰石碑的前提下，看看岁月怎样留下纹理。",
    "tip": "保持轻声，不攀爬墓碑，不拓印；小狗守墓故事含传说成分，教堂与墓园开放安排不同。",
    "source": "https://greyfriarskirk.com/visit/",
    "sourceLabel": "Greyfriars Kirk 官方",
    "tags": [
      "城市记忆",
      "静步"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "灰衣修士墓园",
    "overviewName": "灰衣修士"
  },
  {
    "id": "museum",
    "name": "苏格兰国家博物馆",
    "localName": "National Museum of Scotland",
    "en": "National Museum of Scotland",
    "zone": "old",
    "area": "老城 · Chambers Street",
    "kind": "museum",
    "icon": "museum",
    "x": 835,
    "y": 920,
    "minutes": 150,
    "effort": 1,
    "subtitle": "先抬头，再把目光交给一件小东西",
    "description": "明亮的 Grand Gallery 与苏格兰历史、自然、科学、世界文化等展区共同组成一座内容丰富的博物馆。多莉羊是馆内知名展项之一。",
    "prompt": "从一个你熟悉的物件开始，再问一个不熟悉的问题。",
    "tip": "先选两三个展区；专题展与常设展安排不同，不保证每件藏品当天可见。",
    "source": "https://www.nms.ac.uk/national-museum-of-scotland/see-and-do/explore-the-galleries",
    "sourceLabel": "苏格兰国家博物馆官方",
    "tags": [
      "自然科学",
      "历史与设计"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "国家博物馆",
    "overviewName": "国家博物馆"
  },
  {
    "id": "holyrood",
    "name": "荷里路德宫",
    "localName": "Palace of Holyroodhouse",
    "en": "Palace of Holyroodhouse",
    "zone": "royal",
    "area": "东端 · 荷里路德",
    "kind": "temple",
    "icon": "holyrood",
    "x": 1015,
    "y": 790,
    "minutes": 120,
    "effort": 2,
    "subtitle": "山脚下，王室生活的另一种尺度",
    "description": "皇家一英里的东端通向这座仍承担王室职能的宫殿。国家公寓、玛丽女王相关房间、修道院遗迹与花园各有不同气氛。",
    "prompt": "把富丽房间和露天遗迹的空间感放在一起比较。",
    "tip": "王室活动可能改变开放；特定房间、花园与修道院区域以当天可进入范围为准。",
    "source": "https://www.rct.uk/visit/palace-of-holyroodhouse",
    "sourceLabel": "Royal Collection Trust",
    "tags": [
      "王室宫殿",
      "修道院"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "荷里路德宫",
    "overviewName": "荷里路德宫"
  },
  {
    "id": "arthur",
    "name": "亚瑟王座",
    "localName": "Arthur’s Seat",
    "en": "Arthur’s Seat",
    "zone": "royal",
    "area": "东南 · 荷里路德公园",
    "kind": "nature",
    "icon": "arthur",
    "x": 1120,
    "y": 1010,
    "minutes": 150,
    "effort": 3,
    "subtitle": "走到城边，地面开始像一座山",
    "description": "古老火山地貌形成草坡、岩壁和城市天际线。亚瑟王座位于荷里路德公园，登高的体验与在市区散步明显不同。",
    "prompt": "每升高一段，找找刚才走过的老城山脊。",
    "tip": "需按风雨、日照和鞋履决定路线与折返点；不要沿旧游记进入封闭步道。恶劣天气改看展。",
    "source": "https://www.historicenvironment.scot/visit/all/holyrood-park/",
    "sourceLabel": "Historic Environment Scotland",
    "tags": [
      "登高",
      "火山地貌"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "亚瑟王座",
    "overviewName": "亚瑟王座"
  },
  {
    "id": "calton",
    "name": "卡尔顿山",
    "localName": "Calton Hill",
    "en": "Calton Hill",
    "zone": "new",
    "area": "新城东端 · 卡尔顿",
    "kind": "nature",
    "icon": "calton",
    "x": 915,
    "y": 500,
    "minutes": 70,
    "effort": 3,
    "subtitle": "柱廊、圆亭和屋顶，排进同一片天空",
    "description": "山上散布国家纪念碑、杜格尔德·斯图尔特纪念亭与旧天文台等建筑。它是理解新城、老城和远处海湾关系的观景点。",
    "prompt": "先辨认城市方向，再决定镜头朝哪边。",
    "tip": "有上坡和台阶；山顶风较大，黄昏拍照也要预留天黑前下山时间。",
    "source": "https://www.edinburghoutdoors.org.uk/directory-record/19/calton-hill",
    "sourceLabel": "爱丁堡市公园信息",
    "tags": [
      "城市全景",
      "纪念建筑"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "卡尔顿山",
    "overviewName": "卡尔顿山"
  },
  {
    "id": "princes",
    "name": "王子街花园",
    "localName": "Princes Street Gardens",
    "en": "Princes Street Gardens",
    "zone": "new",
    "area": "新旧城之间 · 谷地",
    "kind": "nature",
    "icon": "princes",
    "x": 425,
    "y": 525,
    "minutes": 55,
    "effort": 1,
    "subtitle": "把城堡放在背景，把长椅留给自己",
    "description": "花园位于王子街与老城之间的谷地，草地、路径和树木展开一段城市留白。本标记以花园散步为主，司各特纪念塔另查入场。",
    "prompt": "沿谷地走时，观察城堡的轮廓怎样变化。",
    "tip": "花园有坡道和阶梯；活动、季节和现场关闭会影响通行，本计划不包含登塔。",
    "source": "https://edinburgh.org/neighbourhoods/new-town/",
    "sourceLabel": "Forever Edinburgh 官方旅游指南",
    "tags": [
      "谷地花园",
      "城堡远景"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "王子街花园",
    "overviewName": "王子街花园"
  },
  {
    "id": "gallery",
    "name": "苏格兰国家美术馆",
    "localName": "Scottish National Gallery",
    "en": "Scottish National Gallery",
    "zone": "new",
    "area": "新城 · The Mound",
    "kind": "museum",
    "icon": "gallery",
    "x": 610,
    "y": 510,
    "minutes": 110,
    "effort": 1,
    "subtitle": "在城市的接缝，给一幅画留十分钟",
    "description": "位于 The Mound 的美术馆收藏欧洲与苏格兰绘画。既可以追随熟悉的作品，也可以通过苏格兰艺术看这里的风景与生活。",
    "prompt": "比较画里的苏格兰天空与今天窗外的天空。",
    "tip": "馆藏轮换，部分展览另有票务；先查展单，别把名作清单当成当天展陈承诺。",
    "source": "https://www.nationalgalleries.org/visit/scottish-national-gallery",
    "sourceLabel": "National Galleries of Scotland",
    "tags": [
      "欧洲绘画",
      "苏格兰艺术"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "国家美术馆",
    "overviewName": "国家美术馆"
  },
  {
    "id": "portrait",
    "name": "苏格兰国家肖像馆",
    "localName": "Scottish National Portrait Gallery",
    "en": "Scottish National Portrait Gallery",
    "zone": "new",
    "area": "新城 · Queen Street",
    "kind": "museum",
    "icon": "portrait",
    "x": 735,
    "y": 355,
    "minutes": 90,
    "effort": 1,
    "subtitle": "先走进一座红石宫殿，再认识里面的人",
    "description": "红砂岩哥特式外观之后是装饰丰富的大厅。馆藏以肖像呈现与苏格兰有关的人物，让历史从抽象年代变成一张张具体的脸。",
    "prompt": "先不读名牌，猜一猜人物希望被怎样看见。",
    "tip": "大厅建筑与肖像展都值得留时间；人物展陈和临展依当期展单。",
    "source": "https://www.nationalgalleries.org/visit/scottish-national-portrait-gallery",
    "sourceLabel": "National Galleries of Scotland",
    "tags": [
      "人物肖像",
      "红砂岩"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "肖像馆",
    "overviewName": "肖像馆"
  },
  {
    "id": "modern",
    "name": "苏格兰国家现代美术馆",
    "localName": "Scottish National Gallery of Modern Art",
    "en": "Scottish National Gallery of Modern Art",
    "zone": "west",
    "area": "西区 · Belford Road",
    "kind": "museum",
    "icon": "modern",
    "x": 130,
    "y": 455,
    "minutes": 120,
    "effort": 1,
    "subtitle": "在草地、雕塑和展厅之间换一种眼光",
    "description": "Modern One 与 Modern Two 分居道路两侧，室外雕塑空间和现代艺术展厅共同构成参观。与迪恩村可组成艺术和河谷的一天。",
    "prompt": "从户外雕塑开始，感受作品和身体的距离。",
    "tip": "两馆展览、收费和开放分别确认；不要默认两个馆的所有展厅同日开放。",
    "source": "https://www.nationalgalleries.org/visit/scottish-national-gallery-modern-art",
    "sourceLabel": "National Galleries of Scotland",
    "tags": [
      "当代艺术",
      "雕塑花园"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "现代美术馆",
    "overviewName": "现代美术馆"
  },
  {
    "id": "dean",
    "name": "迪恩村",
    "localName": "Dean Village",
    "en": "Dean Village",
    "zone": "west",
    "area": "西区 · 利斯河谷",
    "kind": "street",
    "icon": "dean",
    "x": 280,
    "y": 375,
    "minutes": 55,
    "effort": 2,
    "subtitle": "从车声里拐下去，河谷接住了城市",
    "description": "沿利斯河的旧村落以石桥、临水建筑和起伏步道形成紧凑景观。它仍是住宅区，适合从公共道路和桥上感受空间变化。",
    "prompt": "站在桥上看两边，同一条河有什么不同表情？",
    "tip": "湿石路和上下坡要留意；不进入居民庭院，不照搬游记中的非正式涉水或越栏拍照点。",
    "source": "https://www.waterofleith.org.uk/walkway/",
    "sourceLabel": "Water of Leith Conservation Trust",
    "tags": [
      "河谷",
      "住宅街区"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "迪恩村",
    "overviewName": "迪恩村"
  },
  {
    "id": "stockbridge",
    "name": "斯托克布里奇",
    "localName": "Stockbridge Circus Lane",
    "en": "Stockbridge Circus Lane",
    "zone": "north",
    "area": "西北 · 斯托克布里奇",
    "kind": "street",
    "icon": "stockbridge",
    "x": 445,
    "y": 300,
    "minutes": 75,
    "effort": 2,
    "subtitle": "把小巷、面包店和一段河岸排在一起",
    "description": "这个街区有乔治时期建筑、独立店铺和临河路径，Circus Lane 的小尺度街景尤其适合慢走。市集要另查举办日期。",
    "prompt": "从主街走进一条巷子，听听城市声音怎样变小。",
    "tip": "住宅门前保持通行，不靠住户门窗摆拍；与植物园之间也要留转场时间。",
    "source": "https://edinburgh.org/neighbourhoods/stockbridge/",
    "sourceLabel": "Forever Edinburgh 官方旅游指南",
    "tags": [
      "街区生活",
      "河岸"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "斯托克布里奇",
    "overviewName": "斯托克布里奇"
  },
  {
    "id": "botanic",
    "name": "皇家植物园",
    "localName": "Royal Botanic Garden Edinburgh",
    "en": "Royal Botanic Garden Edinburgh",
    "zone": "north",
    "area": "北区 · Inverleith",
    "kind": "nature",
    "icon": "botanic",
    "x": 540,
    "y": 135,
    "minutes": 120,
    "effort": 1,
    "subtitle": "把一天的一部分，交给叶片",
    "description": "岩石园、林地、树木收藏与中国山坡等户外区域，让园艺、植物研究和散步相遇。不同季节有不同的枝叶与结构可看。",
    "prompt": "比较两片叶子的边缘、质地与光泽。",
    "tip": "温室分区开放：官网已公布棕榈温室重开安排，其他温室仍有修复限制；户外园区也可能因天气关闭。",
    "source": "https://www.rbge.org.uk/visit/royal-botanic-garden-edinburgh/",
    "sourceLabel": "Royal Botanic Garden Edinburgh",
    "tags": [
      "植物",
      "林地步行"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "皇家植物园",
    "overviewName": "皇家植物园"
  },
  {
    "id": "leith",
    "name": "利斯 · The Shore",
    "localName": "The Shore Leith",
    "en": "The Shore Leith",
    "zone": "harbour",
    "area": "东北 · 利斯港区",
    "kind": "street",
    "icon": "leith",
    "x": 1030,
    "y": 300,
    "minutes": 75,
    "effort": 1,
    "subtitle": "在水边，看见另一种爱丁堡",
    "description": "The Shore 的河口水岸、旧港建筑与餐饮街区，有别于老城石阶的生活节奏。把它与不列颠尼亚号安排在一片区较从容。",
    "prompt": "找找旧港口留下的建筑线索。",
    "tip": "港区与市中心不是步行几分钟的关系；河边不是所有码头都可进入，按公共步道走。",
    "source": "https://edinburgh.org/neighbourhoods/leith/",
    "sourceLabel": "Forever Edinburgh 官方旅游指南",
    "tags": [
      "港口街区",
      "水岸"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "利斯 · The Shore",
    "overviewName": "利斯 · The Shore"
  },
  {
    "id": "britannia",
    "name": "不列颠尼亚号",
    "localName": "The Royal Yacht Britannia",
    "en": "The Royal Yacht Britannia",
    "zone": "harbour",
    "area": "东北 · Ocean Terminal",
    "kind": "museum",
    "icon": "britannia",
    "x": 1010,
    "y": 145,
    "minutes": 120,
    "effort": 1,
    "subtitle": "从会客室，走到船员的甲板",
    "description": "退役皇家游艇停泊利斯，以五层甲板展示王室接待与船上工作生活。驾驶台、国家公寓和船员区域的空间对比值得细看。",
    "prompt": "同一艘船上，哪些空间用于被看见，哪些用于工作？",
    "tip": "从 Ocean Terminal 游客入口进入；这是停泊参观，不是出海船票。船上茶室需持游艇门票。",
    "source": "https://www.royalyachtbritannia.co.uk/visit/",
    "sourceLabel": "Royal Yacht Britannia 官方",
    "tags": [
      "皇家游艇",
      "船上生活"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "皇家游艇",
    "overviewName": "皇家游艇"
  },
  {
    "id": "portobello",
    "name": "波多贝罗海滨",
    "localName": "Portobello Beach",
    "en": "Portobello Beach",
    "zone": "coast",
    "area": "东部 · 海滨",
    "kind": "nature",
    "icon": "portobello",
    "x": 1280,
    "y": 465,
    "minutes": 90,
    "effort": 1,
    "subtitle": "走到沙滩，给石头城市换一种声音",
    "description": "波多贝罗有沙滩与海滨步道，是离开中心城区、接触海风的一段休息。这里的体验取决于天气，不必以海水浴为目的。",
    "prompt": "不拍地标，试着记住浪和风的节奏。",
    "tip": "海滨在图上压缩显示，需单独留交通时间；留意风雨、潮汐与当地水域提示。",
    "source": "https://edinburgh.org/neighbourhoods/portobello/",
    "sourceLabel": "Forever Edinburgh 官方旅游指南",
    "tags": [
      "沙滩",
      "海风"
    ],
    "access": "开放、票务与临时限制请在出发前查官网。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "mapName": "波多贝罗",
    "overviewName": "波多贝罗"
  }
];
export const byId=Object.fromEntries(places.map(p=>[p.id,p]));
export const kinds={all:'全部景点',temple:'城堡古迹',street:'街巷生活',nature:'山海散步',museum:'博物美术',saved:'我的收藏'};
export const seasons={
  "spring": {
    "name": "春 · 新叶",
    "color": "#8c9c80",
    "line": "在石墙与新叶之间，发现春天",
    "caption": "季节灵感 · 开花与天气请另查"
  },
  "summer": {
    "name": "夏 · 长昼",
    "color": "#b59a62",
    "line": "把长长的白昼，留给一段远眺",
    "caption": "季节灵感 · 艺术节期间先安排预约"
  },
  "autumn": {
    "name": "秋 · 微光",
    "color": "#967b80",
    "line": "走过石头的城，停在有光的地方",
    "caption": "季节灵感 · 山路按风雨与日照调整"
  },
  "winter": {
    "name": "冬 · 炉火",
    "color": "#8298ab",
    "line": "短一些的白昼，长一些的看展时间",
    "caption": "季节灵感 · 早做室内备选，别摸黑下山"
  }
};
export const routes=[
  {
    "id": "oldtown",
    "mood": "初次爱丁堡",
    "title": "沿山脊，走进老城",
    "ids": [
      "castle",
      "stgiles",
      "victoria",
      "greyfriars"
    ],
    "icon": "castle",
    "subtitle": "城堡 → 教堂 → 彩色街巷 → 墓园",
    "reason": "以老城为核心，先上城堡，再沿街巷往低处走。坡道、入场排队和湿石路都需要弹性。",
    "pause": "至少留一小时给用餐、休息与临时发现；排队和绕行另留时间。",
    "color": "#66798a"
  },
  {
    "id": "rain",
    "mood": "风雨备选",
    "title": "把雨天，交给艺术",
    "ids": [
      "museum",
      "gallery",
      "portrait"
    ],
    "icon": "museum",
    "subtitle": "历史与科学 → 绘画 → 肖像",
    "reason": "三馆各挑一个主题，避免每馆从头刷到尾。馆际仍需户外转场；休馆和临展先核对。",
    "pause": "至少留一小时给用餐、休息与临时发现；排队和绕行另留时间。",
    "color": "#66798a"
  },
  {
    "id": "river",
    "mood": "艺术与河谷",
    "title": "顺着河，看见日常",
    "ids": [
      "modern",
      "dean",
      "stockbridge"
    ],
    "icon": "dean",
    "subtitle": "现代艺术 → 河谷石桥 → 独立小店",
    "reason": "从西区美术馆接迪恩村，再往斯托克布里奇；沿线步道若关闭，改走正式街道。",
    "pause": "至少留一小时给用餐、休息与临时发现；排队和绕行另留时间。",
    "color": "#66798a"
  },
  {
    "id": "royal",
    "mood": "山脚与王室",
    "title": "宫殿之外，是一座山",
    "ids": [
      "holyrood",
      "arthur"
    ],
    "icon": "arthur",
    "subtitle": "王室房间 → 火山地貌",
    "reason": "只选一段登山作为当天户外重点。先查公园步道、风雨和日落，天气不好可撤掉登山，再加入博物馆。",
    "pause": "至少留一小时给用餐、休息与临时发现；排队和绕行另留时间。",
    "color": "#66798a"
  },
  {
    "id": "harbour",
    "mood": "另一面城市",
    "title": "去利斯，等一阵海风",
    "ids": [
      "britannia",
      "leith"
    ],
    "icon": "britannia",
    "subtitle": "船上五层甲板 → 港区水岸",
    "reason": "利斯自成半日或一日；与中心城的往返另留时间。不把远处波多贝罗沙滩顺手塞进同一条步行线。",
    "pause": "至少留一小时给用餐、休息与临时发现；排队和绕行另留时间。",
    "color": "#66798a"
  },
  {
    "id": "green",
    "mood": "慢步与远眺",
    "title": "新城的绿，与屋顶",
    "ids": [
      "botanic",
      "stockbridge",
      "calton"
    ],
    "icon": "botanic",
    "subtitle": "植物园 → 街区午餐 → 城市远眺",
    "reason": "先用植物园和街区慢走打开一天，再坐交通到卡尔顿山。两段跨区移动与最后登高都要看体力。",
    "pause": "至少留一小时给用餐、休息与临时发现；排队和绕行另留时间。",
    "color": "#66798a"
  }
];
export const city={...{
  "id": "edinburgh",
  "name": "爱丁堡",
  "brand": "悠游",
  "en": "EDINBURGH",
  "subtitle": "一座城，慢慢走",
  "intro": "走过石头的城，把山坡、故事和海风收进行程。",
  "checkedAt": "2026-10-05",
  "sourceNote": "景点参考场馆官网、爱丁堡官方旅游指南及公园管理资料。",
  "defaultSeason": "autumn",
  "navigationQuery": "Edinburgh Scotland",
  "ui": {
    "featuredStories": [
      "castle",
      "museum",
      "dean"
    ],
    "stamp": "悠",
    "hero": "慢一点，看见。",
    "defaultPlan": "我的爱丁堡漫游",
    "emptyPlan": "留给爱丁堡的一天",
    "discovery": "点一处风景，听它讲一个小故事。",
    "guideTitle": "在高低之间，认识爱丁堡",
    "etiquette": "住宅区沿公共道路走，保持门前畅通；墓园与礼拜场所保持安静。山地按风雨、日照与正式开放步道决定路线，海滨距离不能按这张示意图估算。"
  },
  "planning": {
    "legReserves": {
      "castle|stgiles": [
        15,
        30,
        "步行 / 坡道"
      ],
      "stgiles|victoria": [
        10,
        20,
        "步行 / 坡道"
      ],
      "greyfriars|victoria": [
        10,
        20,
        "步行"
      ],
      "camera|castle": [
        5,
        15,
        "步行"
      ],
      "camera|writers": [
        5,
        15,
        "步行"
      ],
      "stgiles|writers": [
        5,
        15,
        "步行"
      ],
      "greyfriars|museum": [
        5,
        15,
        "步行"
      ],
      "gallery|museum": [
        20,
        35,
        "步行 / 坡道"
      ],
      "gallery|portrait": [
        15,
        25,
        "步行"
      ],
      "gallery|princes": [
        5,
        15,
        "步行"
      ],
      "dean|modern": [
        15,
        30,
        "步行 / 坡道"
      ],
      "dean|stockbridge": [
        20,
        35,
        "步行"
      ],
      "botanic|stockbridge": [
        20,
        35,
        "步行"
      ],
      "arthur|holyrood": [
        15,
        30,
        "至步道入口"
      ],
      "holyrood|stgiles": [
        25,
        40,
        "步行"
      ],
      "britannia|leith": [
        20,
        35,
        "步行"
      ],
      "calton|holyrood": [
        25,
        40,
        "步行 / 坡道"
      ]
    },
    "connectedZones": [
      "new|old",
      "old|royal",
      "new|north",
      "north|west",
      "new|west",
      "harbour|new"
    ],
    "sameZone": [
      20,
      35
    ],
    "connected": [
      30,
      50
    ],
    "crossZone": [
      45,
      70
    ]
  },
  "map": {
    "width": 1400,
    "height": 1150,
    "focus": {
      "x": 610,
      "y": 747
    },
    "roads": [
      {
        "id": "royal",
        "name": "皇家一英里",
        "path": "M405 685 Q500 662 590 697 T825 729 L1035 806",
        "label": [
          875,
          766
        ],
        "rotate": 8
      },
      {
        "id": "princes",
        "name": "王子街",
        "path": "M310 562 L870 562",
        "label": [
          455,
          593
        ],
        "rotate": 0
      },
      {
        "id": "george",
        "name": "George St",
        "path": "M320 440H795",
        "label": [
          500,
          457
        ],
        "rotate": 0
      },
      {
        "id": "queen",
        "name": "Queen St",
        "path": "M375 390H795",
        "label": [
          626,
          416
        ],
        "rotate": 0
      },
      {
        "id": "mound",
        "name": "The Mound",
        "path": "M593 558L610 648",
        "label": [
          557,
          602
        ],
        "rotate": -77
      },
      {
        "id": "bridge",
        "name": "North / South Bridge",
        "path": "M820 545L842 907",
        "label": [
          866,
          862
        ],
        "rotate": 85
      },
      {
        "id": "leithwalk",
        "name": "Leith Walk",
        "path": "M875 520L1042 334",
        "label": [
          1010,
          422
        ],
        "rotate": -46
      },
      {
        "id": "regent",
        "name": "Regent Rd",
        "path": "M890 550Q1000 565 1068 723",
        "label": [
          1044,
          606
        ],
        "rotate": 20
      },
      {
        "id": "belford",
        "name": "Belford Rd",
        "path": "M116 483Q230 510 315 452",
        "label": [
          170,
          523
        ],
        "rotate": 0
      },
      {
        "id": "raeburn",
        "name": "Raeburn Pl",
        "path": "M352 275L520 254",
        "label": [
          395,
          251
        ],
        "rotate": -8
      }
    ],
    "rivers": [
      {
        "name": "WATER OF LEITH · 利斯河",
        "path": "M-20 390Q105 325 194 400T332 360Q371 245 477 246T710 183Q835 170 892 245T1051 291L1090 168",
        "width": 15,
        "label": [
          700,
          224
        ]
      }
    ],
    "parks": [
      {
        "x": 468,
        "y": 132,
        "rx": 158,
        "ry": 77
      },
      {
        "x": 524,
        "y": 555,
        "rx": 215,
        "ry": 48
      },
      {
        "x": 1100,
        "y": 980,
        "rx": 206,
        "ry": 124
      },
      {
        "x": 897,
        "y": 479,
        "rx": 120,
        "ry": 72
      }
    ],
    "districts": [
      {
        "x": 100,
        "y": 620,
        "name": "河 谷 · 西 区",
        "en": "DEAN & THE WEST"
      },
      {
        "x": 505,
        "y": 345,
        "name": "新 城",
        "en": "NEW TOWN"
      },
      {
        "x": 790,
        "y": 1040,
        "name": "老 城",
        "en": "OLD TOWN"
      },
      {
        "x": 1102,
        "y": 230,
        "name": "利 斯",
        "en": "LEITH"
      },
      {
        "x": 1185,
        "y": 570,
        "name": "海 滨",
        "en": "PORTOBELLO"
      }
    ],
    "trees": [
      [
        68,
        413
      ],
      [
        210,
        345
      ],
      [
        384,
        134
      ],
      [
        651,
        116
      ],
      [
        505,
        540
      ],
      [
        725,
        568
      ],
      [
        905,
        538
      ],
      [
        1137,
        903
      ],
      [
        1210,
        1022
      ],
      [
        357,
        342
      ]
    ],
    "mountains": [],
    "anchors": []
  }
},places,routes,seasons,kinds,foods,stories,sources:SOURCES};
