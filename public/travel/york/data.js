import {foods} from './food.js';
import {stories} from './stories.js';
export const places=[
  {
    "id": "minster",
    "name": "约克大教堂",
    "localName": "York Minster",
    "en": "York Minster",
    "zone": "north",
    "area": "约克 · 大教堂",
    "kind": "temple",
    "icon": "minster",
    "x": 850,
    "y": 215,
    "minutes": 120,
    "effort": 2,
    "subtitle": "在彩窗前，让眼睛慢一点",
    "description": "哥特式教堂的塔楼、彩色玻璃与石构拱顶共同构成约克的天际线。地下展区帮助理解更早的城市层次；登塔是另一个需要体力和独立安排的项目。",
    "prompt": "同一扇彩窗，从远处看颜色，再靠近看人物，叙事怎样改变？",
    "tip": "礼拜、活动与修缮可能调整参观范围；主堂、地下展区与登塔不要默认一张票全部包含。登塔另查年龄、台阶与天气限制。",
    "source": "https://yorkminster.org/visit/",
    "sourceLabel": "官方 / 场馆资料 · 约克大教堂",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "大教堂",
    "overviewName": "大教堂",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "walls",
    "name": "约克城墙 · 选段步行",
    "localName": "York City Walls",
    "en": "York City Walls",
    "zone": "north",
    "area": "约克 · 城墙",
    "kind": "temple",
    "icon": "walls",
    "x": 1175,
    "y": 360,
    "minutes": 70,
    "effort": 3,
    "subtitle": "走到街屋背后，约克才慢慢展开",
    "description": "城墙步道把城门、街区与花园串在一起。图标代表可选步行体验，并非一个统一入口；高处路段与地面接续共同组成环城路线。",
    "prompt": "从城墙看后院，与从街上看门面，哪一面更像城市的日常？",
    "tip": "按官方地图选入口和出口；本预留只走一段。高风、冰滑或维护可关闭步道，日落前的关门时间随季节变化；部分路段台阶多且较窄。",
    "source": "https://www.york.gov.uk/CityWalls",
    "sourceLabel": "官方 / 场馆资料 · 约克城墙 · 选段步行",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "城墙",
    "overviewName": "城墙",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "shambles",
    "name": "肉铺街",
    "localName": "The Shambles York",
    "en": "The Shambles York",
    "zone": "centre",
    "area": "约克 · 肉铺街",
    "kind": "street",
    "icon": "shambles",
    "x": 1110,
    "y": 595,
    "minutes": 50,
    "effort": 1,
    "subtitle": "在一条窄街上，把镜头放低一点",
    "description": "狭窄街道两侧保留突出的上层木构与旧商铺尺度，街名与过去的肉铺贸易相关。今天这里仍有独立店铺，也有明显的旅游商业。",
    "prompt": "上层出挑之后，天空为什么看起来像一条弯曲的缝？",
    "tip": "避开店门口停拍，不擅入私人空间。这里不是《哈利·波特》电影取景地；不要把流行的联想当成建筑史事实。",
    "source": "https://shamblesyork.co.uk/",
    "sourceLabel": "官方 / 场馆资料 · 肉铺街",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "肉铺街",
    "overviewName": "肉铺街",
    "tags": [
      "街巷生活",
      "慢慢看"
    ]
  },
  {
    "id": "jorvik",
    "name": "约维克维京中心",
    "localName": "JORVIK Viking Centre",
    "en": "JORVIK Viking Centre",
    "zone": "centre",
    "area": "约克 · 维京中心",
    "kind": "museum",
    "icon": "jorvik",
    "x": 1090,
    "y": 805,
    "minutes": 90,
    "effort": 1,
    "subtitle": "从热闹的维京街道，走回一件小物证",
    "description": "中心以考古发现为基础，结合复原场景、乘坐体验和出土物展示，介绍维京时代约克的生活。场景是解释历史的方法，考古物证是理解它的另一层。",
    "prompt": "复原场景中最生动的部分，能对应到哪一种出土证据？",
    "tip": "按预约时段入场；乘坐设施、声光和气味可能不适合所有人，带孩子或有感官需求时先查官方无障碍说明。",
    "source": "https://www.jorvikvikingcentre.co.uk/",
    "sourceLabel": "官方 / 场馆资料 · 约维克维京中心",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "维京中心",
    "overviewName": "维京中心",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "railway",
    "name": "国家铁路博物馆",
    "localName": "National Railway Museum York",
    "en": "National Railway Museum York",
    "zone": "west",
    "area": "约克 · 铁路博物馆",
    "kind": "museum",
    "icon": "railway",
    "x": 260,
    "y": 620,
    "minutes": 150,
    "effort": 1,
    "subtitle": "站在车轮旁边，速度有了重量",
    "description": "机车、车厢与铁路技术把运输史变成可近距离观察的实物。Great Hall 与 Station Hall 的参观入口可能分开，馆区仍有施工与调整。",
    "prompt": "从车轮到座席，速度改变了技术，也改变了谁的生活？",
    "tip": "2026-10-06 核对时馆区仍有工程，两个大厅可能需分别进入；先查当日场馆地图。不能假定所有机车都能登车。",
    "source": "https://www.railwaymuseum.org.uk/visit",
    "sourceLabel": "官方 / 场馆资料 · 国家铁路博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "铁路博物馆",
    "overviewName": "铁路博物馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "gardens",
    "name": "约克博物馆花园",
    "localName": "York Museum Gardens",
    "en": "York Museum Gardens",
    "zone": "northwest",
    "area": "约克 · 博物馆花园",
    "kind": "nature",
    "icon": "gardens",
    "x": 485,
    "y": 285,
    "minutes": 60,
    "effort": 1,
    "subtitle": "让一面残墙，替散步留下空白",
    "description": "树木、草地与圣玛丽修道院遗迹共同构成城市中心的一处绿地，罗马时期的多角塔等遗存呈现更早的城市层次。花园与约克郡博物馆是不同的游览安排。",
    "prompt": "一面失去屋顶的墙，怎样因为树木与天空而变得不同？",
    "tip": "核对花园开放时间；不要攀爬遗迹。这里预留为花园散步，进入约克郡博物馆需另加时间并确认门票。",
    "source": "https://www.yorkmuseumgardens.org.uk/",
    "sourceLabel": "官方 / 场馆资料 · 约克博物馆花园",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "博物馆花园",
    "overviewName": "博物馆花园",
    "tags": [
      "河岸园林",
      "慢慢看"
    ]
  },
  {
    "id": "yorkshire",
    "name": "约克郡博物馆",
    "localName": "Yorkshire Museum",
    "en": "Yorkshire Museum",
    "zone": "northwest",
    "area": "约克 · 约克郡博物馆",
    "kind": "museum",
    "icon": "yorkshire",
    "x": 630,
    "y": 470,
    "minutes": 120,
    "effort": 1,
    "subtitle": "把约克从一张街景，读成好几层时间",
    "description": "考古、自然历史与地方收藏把罗马约克、维京时代及更长的地质时间联系起来。馆外是博物馆花园，可把室内阅读与散步搭配。",
    "prompt": "一件精细的小器物，能让你看见多少关于制作者的信息？",
    "tip": "按官网核对当期展览、开馆日与票务；常设和临展会调整。与花园分别计时，避免只给大馆留一小时。",
    "source": "https://www.yorkshiremuseum.org.uk/",
    "sourceLabel": "官方 / 场馆资料 · 约克郡博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "约克郡博物馆",
    "overviewName": "约克郡博物馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "art",
    "name": "约克美术馆",
    "localName": "York Art Gallery",
    "en": "York Art Gallery",
    "zone": "north",
    "area": "约克 · 美术馆",
    "kind": "museum",
    "icon": "art",
    "x": 595,
    "y": 135,
    "minutes": 100,
    "effort": 1,
    "subtitle": "在一只陶碗面前，重新学习停留",
    "description": "绘画收藏与英国工作室陶瓷是这里的重要线索，CoCA 陶瓷艺术中心让器形、釉色与陈列方式成为可慢看的内容。",
    "prompt": "如果先不读作者名字，你会因什么想靠近一只陶器？",
    "tip": "核对开馆日和临展；不同展览票务可能不同。陶瓷与绘画只选一条主线也足够，不必追求看完全部展厅。",
    "source": "https://www.yorkartgallery.org.uk/",
    "sourceLabel": "官方 / 场馆资料 · 约克美术馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "美术馆",
    "overviewName": "美术馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "merchant",
    "name": "商人冒险家会馆",
    "localName": "Merchant Adventurers Hall York",
    "en": "Merchant Adventurers Hall York",
    "zone": "centre",
    "area": "约克 · 商人会馆",
    "kind": "museum",
    "icon": "merchant",
    "x": 1350,
    "y": 710,
    "minutes": 75,
    "effort": 2,
    "subtitle": "木梁下的大厅，装着一座城的生意",
    "description": "始建于 14 世纪的木构会馆，连接商人组织的公共活动、慈善与宗教生活。大厅、底层空间和小礼拜堂呈现不同的功能尺度。",
    "prompt": "抬头看木构，再低头看通行的门，人如何组织共同生活？",
    "tip": "活动可能占用部分空间；古建筑楼层与通道限制先查。不要把“冒险家”理解成单纯探险旅行者，它与商贸组织历史有关。",
    "source": "https://merchantshallyork.org/",
    "sourceLabel": "官方 / 场馆资料 · 商人冒险家会馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "商人会馆",
    "overviewName": "商人会馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "clifford",
    "name": "克利福德塔",
    "localName": "Clifford's Tower York",
    "en": "Clifford's Tower York",
    "zone": "south",
    "area": "约克 · 克利福德塔",
    "kind": "temple",
    "icon": "clifford",
    "x": 1055,
    "y": 1020,
    "minutes": 75,
    "effort": 3,
    "subtitle": "先读脚下的历史，再看远处的屋顶",
    "description": "土丘上的石塔是约克城堡遗存的一部分，近年的内部参观设施提供理解结构与眺望城市的方式。这里也关联 1190 年约克犹太群体遭迫害的悲剧。",
    "prompt": "当眺望很美时，一块历史说明牌会怎样改变你对地点的感受？",
    "tip": "登丘与塔内含台阶，核对无障碍和开放安排。阅读有关 1190 年事件的资料时保持尊重，不把此地仅当作拍照平台。",
    "source": "https://www.english-heritage.org.uk/visit/places/cliffords-tower-york/things-to-do/",
    "sourceLabel": "官方 / 场馆资料 · 克利福德塔",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "克利福德塔",
    "overviewName": "克利福德塔",
    "tags": [
      "建筑观察",
      "慢慢看"
    ]
  },
  {
    "id": "castle",
    "name": "约克城堡博物馆",
    "localName": "York Castle Museum",
    "en": "York Castle Museum",
    "zone": "south",
    "area": "约克 · 城堡博物馆",
    "kind": "museum",
    "icon": "castle",
    "x": 1300,
    "y": 1080,
    "minutes": 150,
    "effort": 1,
    "subtitle": "走进复原的街道，也看看橱窗背后",
    "description": "博物馆以社会生活收藏见长，Kirkgate 复原街道、服饰与监狱历史把日常细节放到前台。馆名中的“城堡”不表示这里是一座完整中世纪城堡。",
    "prompt": "一扇商店橱窗，怎样透露消费、阶层与生活节奏？",
    "tip": "按当日展区与票务选择重点，复原街道是博物馆展示，不是未经改变保存下来的原街。监狱内容可先判断是否适合孩子。",
    "source": "https://www.yorkcastlemuseum.org.uk/",
    "sourceLabel": "官方 / 场馆资料 · 约克城堡博物馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "城堡博物馆",
    "overviewName": "城堡博物馆",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "treasurer",
    "name": "司库府",
    "localName": "Treasurer's House York",
    "en": "Treasurer's House York",
    "zone": "north",
    "area": "约克 · 司库府",
    "kind": "museum",
    "icon": "treasurer",
    "x": 1110,
    "y": 165,
    "minutes": 75,
    "effort": 2,
    "subtitle": "在大教堂旁边，读一间被重新想象的家",
    "description": "大教堂旁的历史住宅，今日面貌与收藏家 Frank Green 的布置密切相关。它体现的是对历史与收藏的一种个人呈现，不能把室内所有陈设当成同一年代的原状。",
    "prompt": "如果一间房由收藏家的趣味重新安排，它讲的是谁的历史？",
    "tip": "参观常依导览与开放安排进行，先确认日期、预约及进入范围；庭院和室内不一定同时开放。",
    "source": "https://www.nationaltrust.org.uk/visit/yorkshire/treasurers-house-york",
    "sourceLabel": "官方 / 场馆资料 · 司库府",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "司库府",
    "overviewName": "司库府",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "fairfax",
    "name": "费尔法克斯故居",
    "localName": "Fairfax House York",
    "en": "Fairfax House York",
    "zone": "south",
    "area": "约克 · 费尔法克斯故居",
    "kind": "museum",
    "icon": "fairfax",
    "x": 830,
    "y": 915,
    "minutes": 75,
    "effort": 2,
    "subtitle": "漂亮的房间，也有值得追问的生活",
    "description": "乔治时代城市住宅的室内装饰、家具与艺术收藏，让参观从街景转向家庭空间及其社会背景。房间是观看艺术与生活秩序的另一种展柜。",
    "prompt": "精致装饰背后，谁在维护这套舒适生活？",
    "tip": "开放日期、入场方式和楼梯条件请向官方确认。若当天有特别展览或导览，以现场路线为准。",
    "source": "https://visityork.org/business-directory/fairfax-house",
    "sourceLabel": "官方 / 场馆资料 · 费尔法克斯故居",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "费尔法克斯故居",
    "overviewName": "费尔法克斯故居",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "chocolate",
    "name": "约克巧克力故事馆",
    "localName": "York's Chocolate Story",
    "en": "York's Chocolate Story",
    "zone": "centre",
    "area": "约克 · 巧克力故事",
    "kind": "museum",
    "icon": "chocolate",
    "x": 1330,
    "y": 475,
    "minutes": 90,
    "effort": 1,
    "subtitle": "一口甜味之后，再问它从哪里来",
    "description": "导览把约克与巧克力产业的关系串联起来，制作演示和品尝体验依当日项目安排。食物既是城市滋味，也连着企业、工人和原料的历史。",
    "prompt": "从一颗糖果往回追，它经过了哪些看不见的劳动？",
    "tip": "这是定时导览体验，先查预约；过敏、乳制品与饮食限制提前说明。不要与 York Cocoa Works 的另一处工坊混淆。",
    "source": "https://www.yorkschocolatestory.com/",
    "sourceLabel": "官方 / 场馆资料 · 约克巧克力故事馆",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "巧克力故事",
    "overviewName": "巧克力故事",
    "tags": [
      "博物美术",
      "慢慢看"
    ]
  },
  {
    "id": "ouse",
    "name": "乌斯河岸 · 市中心段",
    "localName": "River Ouse York",
    "en": "River Ouse York",
    "zone": "river",
    "area": "约克 · 乌斯河岸",
    "kind": "nature",
    "icon": "ouse",
    "x": 600,
    "y": 805,
    "minutes": 50,
    "effort": 1,
    "subtitle": "沿河走一小段，不急着抵达哪里",
    "description": "乌斯河穿过约克，桥梁、河岸步道与沿岸街区提供从水面方向认识城市的机会。本点指市中心的一段岸边散步，不默认包含游船。",
    "prompt": "从桥上看河岸，再到岸上看桥，城市的比例怎样变化？",
    "tip": "河水上涨可影响低处步道，按现场封闭与官方信息绕行；本图不反映实时水位。游船需另查班次、码头与天气。",
    "source": "https://visityork.org/explore",
    "sourceLabel": "官方 / 场馆资料 · 乌斯河岸 · 市中心段",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "乌斯河岸",
    "overviewName": "乌斯河岸",
    "tags": [
      "河岸园林",
      "慢慢看"
    ]
  },
  {
    "id": "rowntree",
    "name": "朗特里公园",
    "localName": "Rowntree Park York",
    "en": "Rowntree Park York",
    "zone": "river",
    "area": "约克 · 朗特里公园",
    "kind": "nature",
    "icon": "rowntree",
    "x": 535,
    "y": 1160,
    "minutes": 70,
    "effort": 1,
    "subtitle": "把一座甜味城市，读到更安静的地方",
    "description": "位于市中心以南的公园于 1921 年开放，与一战中失去生命的巧克力工厂员工的纪念有关。水面、树木与休闲空间让产业史延伸到日常公共生活。",
    "prompt": "一座纪念公园，怎样同时容纳安静的回忆与普通的快乐？",
    "tip": "市中心往返另留步行时间；临水区域、园内设施与入口按现场开放。别把公园当作只用于游客拍照的场景。",
    "source": "https://her.york.gov.uk/Designation/DYO1673",
    "sourceLabel": "官方 / 场馆资料 · 朗特里公园",
    "access": "开放、预约与票务按出发日期再次确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "朗特里公园",
    "overviewName": "朗特里公园",
    "tags": [
      "河岸园林",
      "慢慢看"
    ]
  }
];
export const routes=[
  {
    "id": "first",
    "title": "从彩窗走进老街",
    "ids": [
      "minster",
      "shambles",
      "merchant",
      "ouse"
    ],
    "mood": "初访古城",
    "reason": "上午看大教堂，午后读街道与商贸历史，最后只选一段河岸散步。",
    "icon": "minster",
    "subtitle": "大教堂 → 肉铺街 → 商人会馆 → 乌斯河岸",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "rain",
    "title": "把雨天交给收藏",
    "ids": [
      "yorkshire",
      "art",
      "chocolate"
    ],
    "mood": "室内为主",
    "reason": "考古、陶瓷与巧克力各有一种观看节奏；巧克力导览时段先订，馆际短途仍需雨具。",
    "icon": "yorkshire",
    "subtitle": "约克郡博物馆 → 美术馆 → 巧克力故事",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "family",
    "title": "火车与花园的半天",
    "ids": [
      "railway",
      "gardens"
    ],
    "mood": "亲子慢游",
    "reason": "铁路馆留足探索时间，过河后在花园休息，不再叠加另一座大馆。",
    "icon": "railway",
    "subtitle": "铁路博物馆 → 博物馆花园",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "history",
    "title": "读到城市的另一面",
    "ids": [
      "clifford",
      "castle"
    ],
    "mood": "历史细读",
    "reason": "塔与社会历史馆相邻，既看城市全景，也读迫害、监狱与日常生活的复杂历史。",
    "icon": "clifford",
    "subtitle": "克利福德塔 → 城堡博物馆",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "wallsday",
    "title": "从城墙回到一间家",
    "ids": [
      "walls",
      "treasurer",
      "minster"
    ],
    "mood": "建筑观察",
    "reason": "选择北侧一段城墙；导览与教堂预约先核对，不追求环城一整圈。",
    "icon": "walls",
    "subtitle": "城墙 → 司库府 → 大教堂",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  },
  {
    "id": "slow",
    "title": "把甜味接到河边",
    "ids": [
      "chocolate",
      "ouse",
      "rowntree"
    ],
    "mood": "轻松散步",
    "reason": "巧克力产业与纪念公园彼此呼应；南部公园往返和河岸通行另查。",
    "icon": "chocolate",
    "subtitle": "巧克力故事 → 乌斯河岸 → 朗特里公园",
    "pause": "留一小时用于用餐与休息；预约时段、排队和住处往返另计。",
    "color": "#6e8676"
  }
];
export const seasons={
  "spring": {
    "name": "春 · 新绿",
    "line": "花园醒来，沿一段城墙看屋顶",
    "caption": "春季花园灵感，花期与城墙开放另查；切换季节保留计划。",
    "color": "#787d61"
  },
  "summer": {
    "name": "夏 · 长昼",
    "line": "把傍晚留给河岸，把午后留给展厅",
    "caption": "日照较长也需核对闭馆、城墙关门时间；切换季节保留计划。",
    "color": "#787d61"
  },
  "autumn": {
    "name": "秋 · 石色",
    "line": "沿街看石色，在馆里读时间",
    "caption": "天气转凉，潮湿石面与河水上涨时调整路线；切换季节保留计划。",
    "color": "#787d61"
  },
  "winter": {
    "name": "冬 · 窗光",
    "line": "在彩窗与热茶之间，慢慢认识古城",
    "caption": "城墙遇冰滑可关闭，优先安排已确认开放的室内馆；切换季节保留计划。",
    "color": "#787d61"
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
  "manners": "https://visityork.org/explore",
  "crowd": "https://www.york.gov.uk/CityWalls",
  "roads": "https://visityork.org/explore"
};
export const city={...{
  "id": "york",
  "name": "约克",
  "brand": "悠游",
  "en": "YORK",
  "subtitle": "一座城，慢慢走",
  "intro": "沿着城墙与乌斯河，把中世纪街巷、博物馆和一口甜，串成自己的约克。",
  "checkedAt": "2026-10-06",
  "sourceNote": "景物与背景参考场馆、大学、市政府和官方旅游资料；编辑手记并非作者亲历，开放提示为核验日快照。",
  "defaultSeason": "autumn",
  "navigationQuery": "YORK",
  "ui": {
    "stamp": "悠",
    "hero": "把时间走慢。",
    "defaultPlan": "我的约克漫游",
    "emptyPlan": "留给约克的一天",
    "discovery": "从一处细节，认识一座城。",
    "guideTitle": "约克 · 怎样慢慢走",
    "featuredStories": [
      "minster",
      "railway",
      "merchant"
    ],
    "etiquette": "沿开放城墙和河岸步道行走，礼拜与纪念场所保持安静；狭窄街道让出通道，展品不触摸。",
    "musicTitle": "城墙上的午后"
  },
  "planning": {
    "connectedZones": [
      "centre|north",
      "north|northwest",
      "centre|south",
      "centre|river",
      "northwest|west"
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
      "art|gardens": [
        5,
        15,
        "相邻片区步行"
      ],
      "gardens|yorkshire": [
        5,
        10,
        "同园区独立参观"
      ],
      "castle|clifford": [
        5,
        15,
        "城堡片区步行"
      ],
      "ouse|rowntree": [
        20,
        35,
        "沿河 / 按通行情况绕行"
      ]
    },
    "advice": [
      {
        "ids": [
          "walls"
        ],
        "message": "城墙只选一段；出发前核对入口、关门与冰滑关闭，无法通行时换地面街巷。"
      },
      {
        "ids": [
          "ouse",
          "rowntree"
        ],
        "message": "低处河岸可能受水位影响，按官方与现场封闭绕行，勿根据示意连线穿越。"
      },
      {
        "ids": [
          "railway"
        ],
        "message": "铁路馆仍有工程安排，Great Hall 与 Station Hall 可能需分别进出。"
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
        "id": "470155",
        "name": "Bootham",
        "path": "M400 15L710 295",
        "label": [
          470,
          155
        ],
        "rotate": 38
      },
      {
        "id": "1035110",
        "name": "Gillygate",
        "path": "M650 280L1320 80",
        "label": [
          1035,
          110
        ],
        "rotate": -17
      },
      {
        "id": "1070400",
        "name": "Petergate",
        "path": "M725 330L1060 450L1390 500",
        "label": [
          1070,
          400
        ],
        "rotate": 20
      },
      {
        "id": "870460",
        "name": "Stonegate",
        "path": "M850 330L870 560",
        "label": [
          870,
          460
        ],
        "rotate": 90
      },
      {
        "id": "515538",
        "name": "Museum St · Lendal Bridge",
        "path": "M405 510L755 505L960 590",
        "label": [
          515,
          538
        ],
        "rotate": 0
      },
      {
        "id": "1050710",
        "name": "Parliament St",
        "path": "M1100 680L985 850",
        "label": [
          1050,
          710
        ],
        "rotate": -57
      },
      {
        "id": "365825",
        "name": "Micklegate · Ouse Bridge",
        "path": "M210 875L860 720",
        "label": [
          365,
          825
        ],
        "rotate": -14
      },
      {
        "id": "9701000",
        "name": "Castlegate",
        "path": "M995 860L1020 1110",
        "label": [
          970,
          1000
        ],
        "rotate": 90
      },
      {
        "id": "12101200",
        "name": "Tower St",
        "path": "M970 1160L1475 1140",
        "label": [
          1210,
          1200
        ],
        "rotate": 0
      }
    ],
    "rivers": [
      {
        "name": "乌斯河 · OUSE",
        "path": "M155 -20Q215 320 375 455T580 740Q685 1030 880 1390",
        "width": 62,
        "label": [
          470,
          1010
        ]
      }
    ],
    "parks": [
      {
        "x": 500,
        "y": 305,
        "rx": 175,
        "ry": 140
      },
      {
        "x": 535,
        "y": 1160,
        "rx": 200,
        "ry": 120
      }
    ],
    "districts": [
      {
        "x": 1180,
        "y": 45,
        "name": "教 堂 与 城 墙",
        "en": "MINSTER QUARTER"
      },
      {
        "x": 70,
        "y": 400,
        "name": "铁 路 与 西 岸",
        "en": "WEST BANK"
      },
      {
        "x": 1180,
        "y": 910,
        "name": "城 堡 片 区",
        "en": "CASTLE QUARTER"
      }
    ],
    "trees": [
      [
        425,
        215
      ],
      [
        550,
        370
      ],
      [
        360,
        1050
      ],
      [
        620,
        1220
      ],
      [
        750,
        1270
      ]
    ],
    "outline": "M715 100Q1060 30 1420 330L1430 865Q1430 1180 980 1220L295 1010L90 630Q80 300 715 100",
    "mapNote": "北向示意 · 城墙只画轮廓，不表示连续可通行步道"
  }
},places,routes,seasons,kinds,foods,stories,sources:SOURCES};
