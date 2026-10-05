import {foods} from './food.js';
import {stories} from './stories.js';
export const places=[
  {
    "id": "central",
    "name": "中央大街",
    "localName": "中央大街",
    "en": "Central Street",
    "zone": "daoli",
    "area": "道里 · 百年步行街",
    "kind": "street",
    "icon": "central",
    "x": 650,
    "y": 700,
    "minutes": 90,
    "effort": 2,
    "subtitle": "先抬头，再往江边走",
    "description": "方石路面串起风格各异的街屋、商铺与街口。沿街向北可走到防洪纪念塔，适合把建筑观察和用餐安排在同一段散步中。",
    "prompt": "看一栋街屋的窗、檐口和招牌，哪些属于不同年代？",
    "tip": "冬季石面可能滑；店铺营业与排队各不相同。走累了就坐下，不必一次走遍。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114254/202503/c00_31824273.shtml",
    "sourceLabel": "黑龙江文旅 · 地铁春游指南",
    "tags": [
      "建筑细读",
      "街边滋味"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "中央大街",
    "overviewName": "中央大街"
  },
  {
    "id": "sophia",
    "name": "圣索菲亚教堂广场",
    "localName": "圣索菲亚教堂广场",
    "en": "Saint Sophia Square",
    "zone": "daoli",
    "area": "道里 · 索菲亚广场",
    "kind": "temple",
    "icon": "sophia",
    "x": 865,
    "y": 780,
    "minutes": 60,
    "effort": 1,
    "subtitle": "从红砖的细部，看见穹顶的重量",
    "description": "绿色穹顶、红砖墙体和拱券共同形成城市熟悉的轮廓。先在广场绕行观察不同立面；进入建筑与活动票务须另查。",
    "prompt": "靠近砖墙与退到广场边缘，看到的尺度有何不同？",
    "tip": "广场观景和室内参观不是同一种安排；拍照时保持通道畅通，勿默认有固定音乐演出。",
    "source": "https://hrbggzy.harbin.gov.cn/xxgk/005004/20241115/ae0deae2-de8a-4c5c-b57a-b590cd7e12c9.html",
    "sourceLabel": "索菲亚景区官方介绍",
    "tags": [
      "穹顶",
      "城市地标"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "圣索菲亚教堂广场",
    "overviewName": "索菲亚"
  },
  {
    "id": "flood",
    "name": "防洪纪念塔",
    "localName": "防洪纪念塔",
    "en": "Flood Control Memorial Tower",
    "zone": "river",
    "area": "江南 · 中央大街北端",
    "kind": "temple",
    "icon": "flood",
    "x": 620,
    "y": 510,
    "minutes": 35,
    "effort": 1,
    "subtitle": "街道在这里，把视线交给大江",
    "description": "中央大街通向松花江的城市节点。纪念塔与开阔的江岸广场，让旅行从繁忙的街道进入更大的河流尺度。",
    "prompt": "对比塔的高度和江面的宽度，谁更改变你的视线？",
    "tip": "江边体感与街巷不同；只走正式开放区域，不因看到他人上冰就自行踏上江面。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114254/202503/c00_31824273.shtml",
    "sourceLabel": "黑龙江文旅 · 地铁春游指南",
    "tags": [
      "城市记忆",
      "江岸"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "防洪纪念塔",
    "overviewName": "防洪纪念塔"
  },
  {
    "id": "stalin",
    "name": "斯大林公园",
    "localName": "斯大林公园",
    "en": "Stalin Park",
    "zone": "river",
    "area": "江南 · 滨江林荫",
    "kind": "nature",
    "icon": "stalin",
    "x": 410,
    "y": 570,
    "minutes": 60,
    "effort": 1,
    "subtitle": "把一段江岸，走成生活的速度",
    "description": "沿松花江展开的带状公园，与防洪纪念塔、街区相接。树荫、江面与市民休闲组成更日常的哈尔滨。",
    "prompt": "同一条江岸，清晨和傍晚会出现怎样不同的人？",
    "tip": "这里按一段岸边散步预留时间，不是走完全园。轮渡与索道是否运行需分别确认。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114254/202503/c00_31824273.shtml",
    "sourceLabel": "黑龙江文旅 · 地铁春游指南",
    "tags": [
      "林荫",
      "江风"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "斯大林公园",
    "overviewName": "斯大林公园"
  },
  {
    "id": "railway",
    "name": "滨洲铁路桥",
    "localName": "滨洲铁路桥",
    "en": "Songhua Railway Bridge",
    "zone": "river",
    "area": "江南—江北 · 老江桥",
    "kind": "temple",
    "icon": "railway",
    "x": 1070,
    "y": 445,
    "minutes": 60,
    "effort": 2,
    "subtitle": "从钢梁之间，读一座铁路城市",
    "description": "老江桥的结构和保留下来的铁路元素，提供观察哈尔滨与铁路关系的现场。桥上视野开阔，也比街区更暴露于风中。",
    "prompt": "重复的钢梁怎样把很长的距离分成一格一格？",
    "tip": "按开放步道行走；风大或冰滑时缩短停留。跨到另一岸后的返程不包含在这一小时里。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114254/202503/c00_31824273.shtml",
    "sourceLabel": "黑龙江文旅 · 地铁春游指南",
    "tags": [
      "工业遗产",
      "桥上远眺"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "滨洲铁路桥",
    "overviewName": "滨洲铁路桥"
  },
  {
    "id": "baroque",
    "name": "中华巴洛克街区",
    "localName": "中华巴洛克街区",
    "en": "Chinese Baroque Quarter",
    "zone": "daowai",
    "area": "道外 · 靖宇街一带",
    "kind": "street",
    "icon": "baroque",
    "x": 1290,
    "y": 620,
    "minutes": 100,
    "effort": 2,
    "subtitle": "绕过华丽门脸，再看院落",
    "description": "临街装饰借鉴巴洛克形式，细部融入中国传统吉祥图案，门脸背后连接合院空间。建筑、商铺和街巷讲述老道外的生活。",
    "prompt": "从门外到院内，哪一处最明显地改变了你的感受？",
    "tip": "只进入公开开放的院落，尊重居民与商户；不同修缮区域不能当作同一年代的原貌。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114169/202404/c00_31731149.shtml",
    "sourceLabel": "黑龙江文旅 · 中华巴洛克",
    "tags": [
      "合院",
      "老道外"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "中华巴洛克街区",
    "overviewName": "中华巴洛克"
  },
  {
    "id": "zhaolin",
    "name": "兆麟公园",
    "localName": "兆麟公园",
    "en": "Zhaolin Park",
    "zone": "daoli",
    "area": "道里 · 兆麟街",
    "kind": "nature",
    "icon": "zhaolin",
    "x": 840,
    "y": 445,
    "minutes": 60,
    "effort": 1,
    "subtitle": "树荫、冰灯与一段需要记住的历史",
    "description": "公园与李兆麟将军的纪念相关，也是哈尔滨冰灯文化的重要地点。暖季可观察园林与水鸟，冬季活动以当年公告为准。",
    "prompt": "除了冰灯，公园里还有哪些日常和纪念的线索？",
    "tip": "纪念区域保持安静；观鸟不追逐、不擅自投喂。冬季冰灯不能按往届日期认定已开放。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114274/202507/c00_31856603.shtml",
    "sourceLabel": "黑龙江文旅 · 兆麟公园",
    "tags": [
      "冰灯记忆",
      "城市公园"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "兆麟公园",
    "overviewName": "兆麟公园"
  },
  {
    "id": "citymuseum",
    "name": "哈尔滨市博物馆",
    "localName": "哈尔滨市博物馆",
    "en": "Harbin Museum",
    "zone": "daoli",
    "area": "道里 · 柳树街13号",
    "kind": "museum",
    "icon": "citymuseum",
    "x": 820,
    "y": 600,
    "minutes": 120,
    "effort": 1,
    "subtitle": "进几栋楼，拼出城市的多副面孔",
    "description": "博物馆以不同主题展馆连接城市历史、艺术与收藏。可先看城市历史展，再按兴趣选择油画、版画或其他展厅。",
    "prompt": "一件日常用品能讲出怎样的城市变迁？",
    "tip": "多楼栋、多主题，先看导览再选重点。具体展厅、预约与闭馆安排查场馆当日公告。",
    "source": "https://www.hrbmuseum.cn/museum/1001.html",
    "sourceLabel": "哈尔滨市博物馆 · 城市历史展",
    "tags": [
      "城市历史",
      "室内停留"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "哈尔滨市博物馆",
    "overviewName": "市博物馆"
  },
  {
    "id": "provincial",
    "name": "黑龙江省博物馆",
    "localName": "黑龙江省博物馆",
    "en": "Heilongjiang Provincial Museum",
    "zone": "nangang",
    "area": "南岗 · 红军街老馆区域",
    "kind": "museum",
    "icon": "provincial",
    "x": 805,
    "y": 1000,
    "minutes": 120,
    "effort": 1,
    "subtitle": "把城市的百年，放回更长的北方历史",
    "description": "综合性博物馆的历史与自然资料，让旅行从街屋扩展到地域文化、考古与生态。此卡按红军街老馆区域示意。",
    "prompt": "先选一条历史或自然线索，能否把三件展品连起来？",
    "tip": "新馆有建设与筹展资料，但本次未确认正式开放公告；出发前核对实际接待馆址与展厅，勿直接前往江北新馆。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114195/202011/c00_31051876.shtml",
    "sourceLabel": "黑龙江文旅 · 省博物馆",
    "tags": [
      "地域历史",
      "自然知识"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "省博物馆 · 老馆",
    "overviewName": "省博老馆"
  },
  {
    "id": "art",
    "name": "黑龙江省美术馆",
    "localName": "黑龙江省美术馆",
    "en": "Heilongjiang Art Museum",
    "zone": "daoli",
    "area": "道里 · 地段街一带",
    "kind": "museum",
    "icon": "art",
    "x": 1060,
    "y": 805,
    "minutes": 80,
    "effort": 1,
    "subtitle": "走进画里，看另一种北方",
    "description": "以展览与收藏呈现美术创作。将它作为索菲亚街区附近的看展备选，具体作品和媒介随展期调整。",
    "prompt": "先不看标题，同一幅画的远看和近看有何不同？",
    "tip": "不同历史资料的门牌存在差异；请按场馆最新公告确认地段街入口。这里不把已结束的临展当作常设展。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114262/202607/c00_31957860.shtml",
    "sourceLabel": "黑龙江文旅 · 省美术馆展览资料",
    "tags": [
      "绘画",
      "室内停留"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "黑龙江省美术馆",
    "overviewName": "省美术馆"
  },
  {
    "id": "gogol",
    "name": "果戈里大街",
    "localName": "果戈里大街",
    "en": "Gogol Street",
    "zone": "nangang",
    "area": "南岗 · 果戈里街区",
    "kind": "street",
    "icon": "gogol",
    "x": 1040,
    "y": 1055,
    "minutes": 80,
    "effort": 2,
    "subtitle": "把景点名单，换成普通街角",
    "description": "街区的建筑、店铺和儿童公园，让南岗散步有不同于中央大街的节奏。可择一段步行，与省博物馆分段安排。",
    "prompt": "一条仍在使用的街道，怎样把旧建筑放进今天？",
    "tip": "这是通行街道而非整条步行街。过街走人行通道；公园小火车属季节运营项目，另查公告。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114169/202605/c00_31938747.shtml",
    "sourceLabel": "黑龙江文旅 · 果戈里大街儿童公园",
    "tags": [
      "南岗街巷",
      "公园日常"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "果戈里大街",
    "overviewName": "果戈里大街"
  },
  {
    "id": "wenmiao",
    "name": "哈尔滨文庙 · 民族博物馆",
    "localName": "哈尔滨文庙 · 民族博物馆",
    "en": "Harbin Confucian Temple",
    "zone": "east",
    "area": "南岗东部 · 文庙街25号",
    "kind": "museum",
    "icon": "wenmiao",
    "x": 1390,
    "y": 860,
    "minutes": 90,
    "effort": 1,
    "subtitle": "在红墙与屋檐之间，换一种阅读速度",
    "description": "文庙建筑与黑龙江省民族博物馆的展示，为城市旅行带来传统建筑和地域人文视角。庭院与室内陈列各有阅读重点。",
    "prompt": "从中轴线望过去，院落怎样组织行走和停留？",
    "tip": "庭院有户外部分，冬季不能当成全程室内景点。展厅、开放与活动安排先查官方信息。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114264/202408/c00_31763184.shtml",
    "sourceLabel": "黑龙江文旅 · 博物馆名录",
    "tags": [
      "传统建筑",
      "民族文化"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "mixed",
    "mapName": "文庙 · 民族博物馆",
    "overviewName": "文庙"
  },
  {
    "id": "opera",
    "name": "哈尔滨大剧院",
    "localName": "哈尔滨大剧院",
    "en": "Harbin Grand Theatre",
    "zone": "north",
    "area": "松北 · 文化中心岛",
    "kind": "museum",
    "icon": "opera",
    "x": 865,
    "y": 160,
    "minutes": 90,
    "effort": 2,
    "subtitle": "像一阵风，停在湿地边",
    "description": "流动的白色建筑轮廓，与周围开阔环境形成鲜明关系。外观散步、场馆参观和观看演出是三种不同的行程。",
    "prompt": "沿外部开放步道走一小段，建筑的轮廓怎样变化？",
    "tip": "此处90分钟只作外观与获准参观预留，不含演出。剧场和屋顶是否可进入以公告及现场指引为准。",
    "source": "https://hrbtheatre.polyt.cn/",
    "sourceLabel": "哈尔滨大剧院 · 参观与演出",
    "tags": [
      "当代建筑",
      "演出备选"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "mixed",
    "mapName": "哈尔滨大剧院",
    "overviewName": "大剧院"
  },
  {
    "id": "sun",
    "name": "太阳岛",
    "localName": "太阳岛",
    "en": "Sun Island",
    "zone": "north",
    "area": "江北 · 太阳岛风景区",
    "kind": "nature",
    "icon": "sun",
    "x": 605,
    "y": 280,
    "minutes": 150,
    "effort": 2,
    "subtitle": "夏天看绿，冬天看雪的体积",
    "description": "松花江北岸的生态与文化景区。暖季适合园林、绿地与水岸散步；冬季雪博会是另外需要核对的季节性安排。",
    "prompt": "一片绿地或一座雪雕，怎样用光影表现层次？",
    "tip": "园区较大，先选游览片区。雪博会、园内项目、轮渡与索道不等于全年同票同开放。",
    "source": "https://www.hlj.gov.cn/hlj/c108519/202503/c00_31816708.shtml",
    "sourceLabel": "黑龙江省政府 · 太阳岛",
    "tags": [
      "四季景观",
      "江北"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "太阳岛",
    "overviewName": "太阳岛"
  },
  {
    "id": "ice",
    "name": "冰雪大世界 · 冬季室外园",
    "localName": "冰雪大世界 · 冬季室外园",
    "en": "Harbin Ice and Snow World",
    "zone": "north",
    "area": "江北 · 太阳岛西侧",
    "kind": "nature",
    "icon": "ice",
    "x": 315,
    "y": 315,
    "minutes": 180,
    "effort": 2,
    "subtitle": "等天色变蓝，看冰从材料变成光",
    "description": "冬季室外冰雕与灯光园区，以大尺度冰雪景观形成季节性的城市体验。白天看冰的纹理，亮灯后观察色彩与空间。",
    "prompt": "同一块冰在自然光和灯光里，会变成几种颜色？",
    "tip": "本卡专指冬季室外园区。夏季室内冰雪馆、啤酒节等为其他产品，不能直接套用此行程；当季开闭园、门票与预约另查。",
    "source": "https://ice.hrbicesnow.com/",
    "sourceLabel": "哈尔滨冰雪大世界官方",
    "tags": [
      "冬季限定",
      "冰雕灯光"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "冰雪大世界",
    "overviewName": "冰雪大世界",
    "seasonRestriction": "冬季室外冰雪园；开放日期待当季公告确认。"
  },
  {
    "id": "volga",
    "name": "伏尔加庄园",
    "localName": "伏尔加庄园",
    "en": "Volga Manor",
    "zone": "remote",
    "area": "东南近郊 · 阿什河畔",
    "kind": "temple",
    "icon": "volga",
    "x": 1390,
    "y": 1165,
    "minutes": 240,
    "effort": 2,
    "subtitle": "给木屋、水岸和俄式风情一整段时间",
    "description": "以俄罗斯文化和建筑景观为主题的庄园，结合园林、水岸与季节项目。适合作为独立的一日安排，而非市中心散步的附加站。",
    "prompt": "景观建筑、桥和树木，怎样组成不同的取景框？",
    "tip": "郊区往返需独立安排，别照示意图估算距离。建筑含复建与主题营造；季节项目、接驳和套票逐项核对。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114165/202402/c00_31713032.shtml",
    "sourceLabel": "黑龙江文旅 · 伏尔加庄园",
    "tags": [
      "独立一日",
      "郊区风景"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "伏尔加庄园",
    "overviewName": "伏尔加庄园"
  },
  {
    "id": "music",
    "name": "群力音乐公园",
    "localName": "群力音乐公园",
    "en": "Qunli Music Park",
    "zone": "west",
    "area": "群力 · 友谊西路沿江",
    "kind": "nature",
    "icon": "music",
    "x": 170,
    "y": 790,
    "minutes": 60,
    "effort": 1,
    "subtitle": "让江风，替行程留一段空白",
    "description": "群力新区的滨江音乐主题公共空间，可以观察音乐文化景观，沿江散步。适合已有西部行程时顺路停留。",
    "prompt": "不用手机配乐，周围本来的声音是什么？",
    "tip": "大雪人等装置属于季节性布置，不承诺全年可见。江岸风大，日落前预想好返程方式。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114165/202407/c00_31748063.shtml",
    "sourceLabel": "黑龙江文旅 · 群力音乐公园",
    "tags": [
      "江岸散步",
      "音乐城市"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "outdoor",
    "mapName": "群力音乐公园",
    "overviewName": "群力音乐公园"
  },
  {
    "id": "unit731",
    "name": "侵华日军第七三一部队罪证陈列馆",
    "localName": "侵华日军第七三一部队罪证陈列馆",
    "en": "Unit 731 Evidence Exhibition Hall",
    "zone": "south",
    "area": "平房 · 新疆大街23号",
    "kind": "museum",
    "icon": "unit731",
    "x": 310,
    "y": 1165,
    "minutes": 150,
    "effort": 1,
    "subtitle": "把时间留给证据与记忆",
    "description": "遗址与专题陈列记录侵华日军细菌战及人体实验罪行。文物、档案和证言需要认真阅读，参访宜留出独立时段。",
    "prompt": "一份档案、一件遗物与一段证言怎样互相印证？",
    "tip": "通过官方渠道预约，核对新馆与本部旧址安排。内容沉重，同行儿童是否适合参观由监护人判断；保持肃穆，遵守拍摄规定。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114254/202501/c00_31798291.shtml",
    "sourceLabel": "黑龙江文旅 · 陈列馆参观公告",
    "tags": [
      "历史证据",
      "纪念参访"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "七三一罪证陈列馆",
    "overviewName": "七三一陈列馆"
  },
  {
    "id": "botanic",
    "name": "黑龙江省森林植物园",
    "localName": "黑龙江省森林植物园",
    "en": "Heilongjiang Forest Botanical Garden",
    "zone": "southcity",
    "area": "香坊 · 哈平路一带",
    "kind": "nature",
    "icon": "botanic",
    "x": 750,
    "y": 1210,
    "minutes": 120,
    "effort": 2,
    "subtitle": "在树叶的尺度里，重新慢下来",
    "description": "城市中的森林植物园，将植物观察、科普和散步放在同一片绿地。适合在暖季给街区游留一个更舒展的下午。",
    "prompt": "挑一片叶子，观察叶脉、叶缘和它投下的影子。",
    "tip": "存在冬季闭园安排；本次核到2026年4月25日开园公告，秋末闭园另查。禁止野外用火、挖野菜与挂吊床。",
    "source": "https://wlt.hlj.gov.cn/wlt/c114254/202604/c00_31935147.shtml",
    "sourceLabel": "黑龙江文旅 · 2026 植物园开园公告",
    "tags": [
      "暖季散步",
      "植物观察"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn"
    ],
    "exposure": "outdoor",
    "mapName": "森林植物园",
    "overviewName": "森林植物园",
    "seasonRestriction": "暖季开放，冬季可能闭园，请查看园方公告。"
  },
  {
    "id": "print",
    "name": "黑龙江版画馆 · 市博物馆内",
    "localName": "黑龙江版画馆 · 市博物馆内",
    "en": "Heilongjiang Printmaking Gallery",
    "zone": "daoli",
    "area": "道里 · 市博物馆园区",
    "kind": "museum",
    "icon": "print",
    "x": 660,
    "y": 875,
    "minutes": 60,
    "effort": 1,
    "subtitle": "从一根刻线，看见黑土的力量",
    "description": "位于哈尔滨市博物馆体系中的专题展馆，以黑龙江版画作品为线索观察创作与地方经验。作为市博物馆的深入专题选项。",
    "prompt": "黑与白如何让纸上的风、雪或人物有了重量？",
    "tip": "与市博物馆同一园区，地图为阅读错位排布。120分钟市博概览已可选版画展；两者都加入会重复计时，只有深看时才另加。",
    "source": "https://www.hrbmuseum.cn/museum/1042.html",
    "sourceLabel": "哈尔滨市博物馆 · 黑龙江版画馆",
    "tags": [
      "版画专题",
      "室内停留"
    ],
    "access": "开放、预约与展览请按出发日期再确认。",
    "seasons": [
      "spring",
      "summer",
      "autumn",
      "winter"
    ],
    "exposure": "indoor",
    "mapName": "版画馆 · 市博内",
    "overviewName": "版画馆",
    "sameSiteAs": "citymuseum"
  }
];
export const routes=[
  {
    "id": "first",
    "mood": "初到冰城",
    "title": "从一条老街，走向一条江",
    "ids": [
      "sophia",
      "citymuseum",
      "central",
      "flood"
    ],
    "icon": "sophia",
    "subtitle": "穹顶 → 城市历史 → 老街 → 江岸",
    "reason": "先看建筑，再进馆补上历史，最后沿中央大街向北。用室内展馆打断连续户外停留。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91"
  },
  {
    "id": "winter",
    "mood": "冬季专线",
    "title": "把傍晚，交给冰与光",
    "ids": [
      "citymuseum",
      "ice"
    ],
    "icon": "ice",
    "subtitle": "市博物馆 → 热餐与取暖 → 冰雪大世界",
    "reason": "上午看展，午后用餐再过江；把体力集中给一个大型冰雪景区，避免一天叠加两个寒冷的户外大园。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91",
    "seasons": [
      "winter"
    ]
  },
  {
    "id": "summer",
    "mood": "暖季江北",
    "title": "一座绿岛，一阵建筑里的风",
    "ids": [
      "sun",
      "opera"
    ],
    "icon": "opera",
    "subtitle": "太阳岛 → 跨区交通 → 大剧院外观",
    "reason": "两个江北片区之间需要交通。大剧院参观与演出票另行核对，太阳岛只选一片区域慢走。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91",
    "seasons": [
      "spring",
      "summer",
      "autumn"
    ]
  },
  {
    "id": "artday",
    "mood": "室内为主",
    "title": "把北方，读成几幅画",
    "ids": [
      "provincial",
      "art",
      "citymuseum"
    ],
    "icon": "art",
    "subtitle": "地域历史 → 当期美术展 → 城市收藏",
    "reason": "三馆各选一个主题，开放入口与预约先确认。馆际仍有户外交通，适合天气不理想时缩短步行。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91"
  },
  {
    "id": "oldtown",
    "mood": "街巷与铁路",
    "title": "走进门脸后面的老道外",
    "ids": [
      "baroque",
      "railway",
      "stalin"
    ],
    "icon": "baroque",
    "subtitle": "合院街区 → 老江桥 → 滨江散步",
    "reason": "这条路线以户外为主，温暖天气更从容；冬天在街区先吃热餐，风大时删掉桥上停留。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91"
  },
  {
    "id": "manor",
    "mood": "独立一日",
    "title": "把近郊的一天，留给庄园",
    "ids": [
      "volga"
    ],
    "icon": "volga",
    "subtitle": "市区往返另计 → 庄园慢游",
    "reason": "只设一个主要目的地。当前合计不含市区或住处往返，请另预留交通与返程缓冲。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91"
  },
  {
    "id": "memory",
    "mood": "肃穆参访",
    "title": "给历史，一段完整的时间",
    "ids": [
      "unit731"
    ],
    "icon": "unit731",
    "subtitle": "提前预约 → 阅读证据 → 安静整理",
    "reason": "不把纪念参访与娱乐打卡强行压在一个半天；平房区往返另留充分时间。",
    "pause": "至少留一小时用于用餐与休息；冬季另核对取暖点、日落和返程。",
    "color": "#577e91"
  }
];
export const seasons={
  "spring": {
    "name": "春 · 丁香",
    "color": "#9992af",
    "line": "等花开，也给春风留一件外套",
    "caption": "季节灵感 · 开江期只走正式步道，花期另查"
  },
  "summer": {
    "name": "夏 · 江风",
    "color": "#7e9c83",
    "line": "绿岛与长昼，把一天还给江风",
    "caption": "季节灵感 · 晴热与雷雨天调整户外时长"
  },
  "autumn": {
    "name": "秋 · 金叶",
    "color": "#b78c5d",
    "line": "沿着老街，走进北方的金色",
    "caption": "季节灵感 · 日照渐短，园区闭园日期另查"
  },
  "winter": {
    "name": "冬 · 冰光",
    "color": "#7499b0",
    "line": "看冰雪，也照顾自己的温度",
    "caption": "冬季室外园区开放依当季公告；切换季节不会清空计划"
  }
};
export const kinds={all:'全部景点',temple:'城市地标',street:'街巷生活',nature:'江岸园林',museum:'博物美术',saved:'我的收藏'};
export const SOURCES={
  "manners": "https://wlt.hlj.gov.cn/",
  "crowd": "https://ice.hrbicesnow.com/",
  "roads": "https://wlt.hlj.gov.cn/wlt/c114254/202503/c00_31824273.shtml"
};
export const city={...{
  "id": "harbin",
  "name": "哈尔滨",
  "brand": "悠游",
  "en": "HARBIN",
  "subtitle": "一座城，慢慢走",
  "intro": "沿着松花江，把冰雪、老街和热腾腾的日常，收进一段刚刚好的漫游。",
  "checkedAt": "2026-10-05",
  "sourceNote": "景点参照黑龙江文旅、场馆与景区官方资料；旧公告仅支持背景，不代表今天开放。",
  "defaultSeason": "autumn",
  "navigationQuery": "哈尔滨",
  "ui": {
    "featuredStories": [
      "sophia",
      "ice",
      "baroque"
    ],
    "stamp": "悠",
    "hero": "心里有暖。",
    "defaultPlan": "我的哈尔滨漫游",
    "emptyPlan": "留给哈尔滨的一天",
    "discovery": "从一处风景，认识一座北方城市。",
    "guideTitle": "沿一条江，走进哈尔滨",
    "etiquette": "沿正式开放步道走，冰面与临水区域遵守现场管理。纪念馆保持肃穆，居民院落不擅入；冬季把取暖与返程写进行程。"
  },
  "planning": {
    "legReserves": {
      "central|flood": [
        15,
        25,
        "步行 / 全街距离"
      ],
      "flood|stalin": [
        5,
        15,
        "江岸步行"
      ],
      "central|sophia": [
        15,
        30,
        "街区步行"
      ],
      "central|citymuseum": [
        15,
        25,
        "街区步行"
      ],
      "citymuseum|zhaolin": [
        10,
        20,
        "街区步行"
      ],
      "art|sophia": [
        10,
        20,
        "街区步行"
      ],
      "citymuseum|print": [
        0,
        10,
        "同园区 / 已含概览可不另加"
      ],
      "flood|railway": [
        20,
        35,
        "沿江步行"
      ],
      "baroque|railway": [
        20,
        35,
        "街区步行"
      ],
      "gogol|provincial": [
        20,
        35,
        "步行 / 选取街段"
      ],
      "ice|sun": [
        25,
        45,
        "地铁 / 景区入口步行"
      ],
      "opera|sun": [
        35,
        60,
        "交通 / 跨景区"
      ]
    },
    "connectedZones": [
      "daoli|river",
      "daoli|nangang",
      "daowai|river",
      "east|nangang",
      "nangang|southcity"
    ],
    "sameZone": [
      20,
      40
    ],
    "connected": [
      30,
      55
    ],
    "crossZone": [
      60,
      100
    ]
  },
  "map": {
    "width": 1600,
    "height": 1360,
    "focus": {
      "x": 770,
      "y": 740
    },
    "roads": [
      {
        "id": "central",
        "name": "中央大街",
        "path": "M650 520V840",
        "label": [
          598,
          740
        ],
        "rotate": -90
      },
      {
        "id": "youyi",
        "name": "友谊路",
        "path": "M330 650Q660 535 900 555L1140 570",
        "label": [
          415,
          690
        ],
        "rotate": -15
      },
      {
        "id": "shangzhi",
        "name": "尚志大街",
        "path": "M755 490L785 860",
        "label": [
          772,
          747
        ],
        "rotate": -87
      },
      {
        "id": "jingyu",
        "name": "靖宇街",
        "path": "M1130 690H1460",
        "label": [
          1205,
          716
        ],
        "rotate": 0
      },
      {
        "id": "jinhong",
        "name": "霁虹街",
        "path": "M620 888L955 890",
        "label": [
          630,
          919
        ],
        "rotate": 0
      },
      {
        "id": "hongjun",
        "name": "红军街",
        "path": "M900 890L805 1020",
        "label": [
          860,
          943
        ],
        "rotate": -52
      },
      {
        "id": "dazhi",
        "name": "东大直街",
        "path": "M705 1080L1330 930",
        "label": [
          1175,
          985
        ],
        "rotate": -14
      },
      {
        "id": "gogol",
        "name": "果戈里大街",
        "path": "M975 944L1090 1180",
        "label": [
          1130,
          1118
        ],
        "rotate": 64
      },
      {
        "id": "songbei",
        "name": "松北大道 / 公路大桥",
        "path": "M230 180L390 415L270 920",
        "label": [
          295,
          620
        ],
        "rotate": -74
      },
      {
        "id": "taiyang",
        "name": "太阳大道",
        "path": "M340 350Q480 385 630 365",
        "label": [
          496,
          399
        ],
        "rotate": 0
      },
      {
        "id": "west",
        "name": "友谊西路",
        "path": "M20 895L360 718",
        "label": [
          128,
          924
        ],
        "rotate": -25
      }
    ],
    "rivers": [
      {
        "name": "松 花 江 · SONGHUA",
        "path": "M-80 770Q200 420 530 435T1060 360Q1310 260 1690 430",
        "width": 80,
        "label": [
          760,
          385
        ]
      }
    ],
    "parks": [
      {
        "x": 600,
        "y": 270,
        "rx": 225,
        "ry": 128
      },
      {
        "x": 890,
        "y": 150,
        "rx": 166,
        "ry": 100
      },
      {
        "x": 745,
        "y": 1210,
        "rx": 173,
        "ry": 67
      },
      {
        "x": 842,
        "y": 454,
        "rx": 70,
        "ry": 66
      }
    ],
    "districts": [
      {
        "x": 170,
        "y": 140,
        "name": "江 北 · 冰 雪 与 湿 地",
        "en": "NORTH OF THE RIVER"
      },
      {
        "x": 445,
        "y": 975,
        "name": "道 里",
        "en": "OLD STREETS"
      },
      {
        "x": 1200,
        "y": 770,
        "name": "老 道 外",
        "en": "COURTYARDS"
      },
      {
        "x": 1190,
        "y": 1060,
        "name": "南 岗",
        "en": "NANGANG"
      },
      {
        "x": 35,
        "y": 1020,
        "name": "群 力",
        "en": "RIVERSIDE"
      }
    ],
    "trees": [
      [
        515,
        183
      ],
      [
        707,
        165
      ],
      [
        1010,
        200
      ],
      [
        192,
        660
      ],
      [
        370,
        655
      ],
      [
        1190,
        470
      ],
      [
        1140,
        810
      ],
      [
        920,
        1190
      ],
      [
        610,
        1195
      ],
      [
        90,
        850
      ],
      [
        1450,
        1150
      ]
    ],
    "mountains": [],
    "anchors": []
  }
},places,routes,seasons,kinds,foods,stories,sources:SOURCES};
