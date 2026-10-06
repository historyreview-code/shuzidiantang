export const foods=[
  {
    "id": "chip",
    "name": "Ubiquitous Chip · 12 Ashton Lane",
    "localName": "Ubiquitous Chip · 12 Ashton Lane",
    "dish": "当代苏格兰餐食",
    "kind": "街区滋味",
    "area": "西区 · Ashton Lane",
    "near": [
      "ashton",
      "university",
      "botanic"
    ],
    "description": "用一顿坐下来的餐食结束西区散步，按季节菜单选择本地风味。",
    "tip": "餐厅与楼上酒吧等空间菜单不同；提前核对你预订的场所与套餐。",
    "source": "https://www.ubiquitouschip.co.uk/venues/the-restaurant",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 90,
    "icon": "plate",
    "checkedAt": "2026-10-06",
    "searchQuery": "Ubiquitous Chip · 12 Ashton Lane"
  },
  {
    "id": "india",
    "name": "Mother India’s Cafe Glasgow · 1355 Argyle St",
    "localName": "Mother India’s Cafe Glasgow · 1355 Argyle St",
    "dish": "印度风味分享小盘",
    "kind": "街区滋味",
    "area": "西区 · 凯尔文格罗夫对面",
    "near": [
      "kelvingrove"
    ],
    "description": "少量点几种不同的小盘，和同伴分享香料、蔬菜与主食的组合。",
    "tip": "选择 Cafe Glasgow 门店，别与 Mother India 其他店或爱丁堡分店混淆；辣度和过敏原询问店员。",
    "source": "https://motherindia.co.uk/mother-indias-cafe-glasgow",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 75,
    "icon": "curry",
    "checkedAt": "2026-10-06",
    "searchQuery": "Mother India’s Cafe Glasgow · 1355 Argyle St"
  },
  {
    "id": "ox",
    "name": "Ox and Finch · Sauchiehall Street",
    "localName": "Ox and Finch · Sauchiehall Street",
    "dish": "当季分享盘",
    "kind": "街区滋味",
    "area": "西区东缘 · Sauchiehall Street",
    "near": [
      "kelvingrove",
      "university"
    ],
    "description": "以当日菜单选择几道分享盘，适合愿意给晚餐留完整时间的人。",
    "tip": "预约并核对营业；每季菜品会换，不承诺旧攻略出现的具体菜式。",
    "source": "https://www.oxandfinch.com/",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 90,
    "icon": "plate",
    "checkedAt": "2026-10-06",
    "searchQuery": "Ox and Finch · Sauchiehall Street"
  },
  {
    "id": "tearoom",
    "name": "The Mackintosh Tearooms · Sauchiehall St",
    "localName": "The Mackintosh Tearooms · Sauchiehall St",
    "dish": "设计空间里的下午茶",
    "kind": "街区滋味",
    "area": "市中心 · Sauchiehall Street",
    "near": [
      "mackintosh",
      "buchanan"
    ],
    "description": "在具有整体设计感的房间里慢慢喝茶，让观看与坐下成为同一次体验。",
    "tip": "用餐与导览分别订；若景点停留已包含下午茶，餐单仅作备忘，不再重复加留白。",
    "source": "https://www.nts.org.uk/visit/places/the-mackintosh-tearooms",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 90,
    "icon": "tea",
    "checkedAt": "2026-10-06",
    "searchQuery": "The Mackintosh Tearooms · Sauchiehall St"
  },
  {
    "id": "museumcafe",
    "name": "Kelvingrove Café",
    "localName": "Kelvingrove Café",
    "dish": "馆中热饮与简餐",
    "kind": "街区滋味",
    "area": "西区 · 凯尔文格罗夫馆内",
    "near": [
      "kelvingrove"
    ],
    "description": "两段展厅之间坐下来，给眼睛和脚都留一点恢复的时间。",
    "tip": "核对咖啡区当日营业与菜单，修缮可能影响动线；别把闭馆后的咖啡区作为晚餐后备。",
    "source": "https://www.glasgowlife.org.uk/museums/venues/kelvingrove-art-gallery-and-museum",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 45,
    "icon": "tea",
    "checkedAt": "2026-10-06",
    "searchQuery": "Kelvingrove Café"
  }
];
export function foodIllustration(type){
const art={bun:'<ellipse cx="60" cy="90" rx="45" ry="15" fill="#d3dcd4"/><path d="M24 80q-8-49 37-49t37 49Z" fill="#c89d66"/><path d="M39 75q-12-27 21-27t18 22q-13 13-23-3t11-8" fill="none" stroke="#7c6051" stroke-width="6"/>',pizza:'<path d="M16 48q43-20 88 0L61 107Z" fill="#dfbb7a"/><path d="M22 52q38-18 75 0L61 96Z" fill="#b86f56"/><circle cx="45" cy="60" r="7" fill="#eee1b8"/><circle cx="74" cy="58" r="8" fill="#eee1b8"/><circle cx="61" cy="80" r="6" fill="#eee1b8"/>',wrap:'<path d="M22 51q36-25 78 0L83 101H40Z" fill="#d5b580"/><ellipse cx="61" cy="51" rx="36" ry="16" fill="#8b6656"/><path d="M26 53q30-16 68 0" fill="none" stroke="#8faa79" stroke-width="7"/>',curry:'<ellipse cx="60" cy="83" rx="46" ry="20" fill="#b8c9cc"/><ellipse cx="60" cy="77" rx="38" ry="16" fill="#b98651"/><circle cx="47" cy="75" r="8" fill="#dfc18f"/><circle cx="72" cy="78" r="10" fill="#dfc18f"/><path d="m58 59 13 15m-34 4 13 7" stroke="#8a9d73" stroke-width="5"/>',chocolate:'<path d="M28 40h62v53q-29 20-62 0Z" fill="#e3d7bb"/><ellipse cx="59" cy="41" rx="31" ry="10" fill="#795948"/><path d="M89 47q31-2 19 27-5 9-20 6" fill="none" stroke="#d6c5a2" stroke-width="7"/>' ,plate:'<ellipse cx="60" cy="84" rx="47" ry="17" fill="#c8d6d5"/><ellipse cx="60" cy="79" rx="40" ry="14" fill="#f4eddc"/><path d="M28 78q0-34 28-24q16 5 15 29Z" fill="#8c7663"/><ellipse cx="80" cy="77" rx="16" ry="10" fill="#e4c184"/><ellipse cx="63" cy="84" rx="17" ry="9" fill="#edddb8"/>',pie:'<ellipse cx="61" cy="94" rx="47" ry="12" fill="#d4dcda"/><path d="M22 61h77l-9 28q-30 13-59 0Z" fill="#bc925e"/><ellipse cx="60" cy="62" rx="41" ry="16" fill="#dec18a"/><path d="m43 54 34 16m-25-19 11 23m12-20-29 17" stroke="#b58c5a" stroke-width="3"/>',ice:'<path d="M36 73h48l-24 40Z" fill="#caa46d"/><path d="m44 77 24 20m-17 4 24-20" stroke="#eed3a6" stroke-width="2"/><circle cx="46" cy="63" r="22" fill="#d8b0ac"/><circle cx="72" cy="61" r="22" fill="#e2d1a6"/><circle cx="59" cy="39" r="21" fill="#acbca0"/>',cake:'<ellipse cx="60" cy="101" rx="48" ry="8" fill="#c4d3d5"/><path d="M28 60h65v35H28" fill="#dac093"/><path d="M28 73h65v10H28" fill="#a7767e"/><path d="M25 61q5-11 13-5q7-10 17-4q7-8 16-3q17-6 25 12Z" fill="#f4e7d1"/><circle cx="61" cy="46" r="8" fill="#9c6673"/><path d="m61 39 6-10" stroke="#839482" stroke-width="3"/>',tea:'<ellipse cx="52" cy="94" rx="39" ry="8" fill="#b5c8cf"/><path d="M25 49h52v21q-3 26-26 21-26 0-26-23Z" fill="#e8e1cd"/><path d="M78 52q28-4 20 17-6 13-23 7" fill="none" stroke="#c9c5b5" stroke-width="6"/><ellipse cx="51" cy="49" rx="26" ry="7" fill="#8b7767"/>'};
return `<svg class="food-art" viewBox="0 0 124 120" aria-hidden="true"><g class="food-steam" stroke="#9ba8ac" stroke-width="2" fill="none"><path d="M40 31q-6-8 0-15m18 12q-6-8 0-15"/></g>${art[type]||art.tea}</svg>`;}
