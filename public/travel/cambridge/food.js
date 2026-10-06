export const foods=[
  {
    "id": "fitzbun",
    "name": "Fitzbillies · Trumpington Street",
    "localName": "Fitzbillies · Trumpington Street",
    "dish": "Chelsea Bun 葡萄干甜卷",
    "kind": "街区滋味",
    "area": "南部 · Trumpington Street",
    "near": [
      "fitz",
      "queens",
      "kings"
    ],
    "description": "黏甜的 Chelsea Bun 与一杯茶，适合作为博物馆参访之间的小憩。",
    "tip": "选原店街道，其他分店位置不同；下午茶、堂食和外带条件分别确认。",
    "source": "https://www.fitzbillies.com/pages/cafes",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 40,
    "icon": "bun",
    "checkedAt": "2026-10-06",
    "searchQuery": "Fitzbillies · Trumpington Street"
  },
  {
    "id": "aromi",
    "name": "Aromi · Bene’t Street",
    "localName": "Aromi · Bene’t Street",
    "dish": "西西里风味披萨与烘焙",
    "kind": "街区滋味",
    "area": "市中心 · Bene’t Street",
    "near": [
      "market",
      "kings",
      "stmary"
    ],
    "description": "选一片热披萨或烘焙小食，让学院间的午餐简单一点。",
    "tip": "Bene’t Street 与 Peas Hill 项目不同；看清门店和当日菜单，不默认可以预约座位。",
    "source": "https://www.aromi.co.uk/faqs",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 45,
    "icon": "pizza",
    "checkedAt": "2026-10-06",
    "searchQuery": "Aromi · Bene’t Street"
  },
  {
    "id": "jacks",
    "name": "Jack’s Gelato · Bene’t Street",
    "localName": "Jack’s Gelato · Bene’t Street",
    "dish": "手作冰淇淋",
    "kind": "街区滋味",
    "area": "市中心 · Bene’t Street",
    "near": [
      "market",
      "kings",
      "stmary"
    ],
    "description": "按当天口味选一两球，在散步中尝一点变化，不必只追热门榜单。",
    "tip": "排队另计；奶、蛋、坚果等过敏原现场确认，天气冷时可换热饮。",
    "source": "https://www.jacksgelato.com/",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 25,
    "icon": "ice",
    "checkedAt": "2026-10-06",
    "searchQuery": "Jack’s Gelato · Bene’t Street"
  },
  {
    "id": "marketmeal",
    "name": "Cambridge Market · 当日摊位",
    "localName": "Cambridge Market · 当日摊位",
    "dish": "市场街头午餐",
    "kind": "街区滋味",
    "area": "市中心 · Market Square",
    "near": [
      "market",
      "stmary",
      "kings"
    ],
    "description": "在当日营业摊位里选合适的一餐，给午饭留出真正坐下或从容停留的时间。",
    "tip": "摊位会变化，按市政府市场信息与现场为准；不将某个摊位写成每日保证。",
    "source": "https://www.cambridge.gov.uk/markets",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 45,
    "icon": "plate",
    "checkedAt": "2026-10-06",
    "searchQuery": "Cambridge Market · 当日摊位"
  },
  {
    "id": "fitzcafe",
    "name": "Fitzwilliam Museum Café",
    "localName": "Fitzwilliam Museum Café",
    "dish": "看展间的茶与简餐",
    "kind": "街区滋味",
    "area": "南部 · 博物馆内",
    "near": [
      "fitz"
    ],
    "description": "把热饮和一顿轻食放在两段看展之间，让下午仍有注意力。",
    "tip": "核对咖啡区开放、菜单和入口安排；参观与用餐分别留时，避免重复计入已安排的休息。",
    "source": "https://fitzmuseum.cam.ac.uk/plan-your-visit/galleries/the-courtyard",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 45,
    "icon": "tea",
    "checkedAt": "2026-10-06",
    "searchQuery": "Fitzwilliam Museum Café"
  }
];
export function foodIllustration(type){
const art={bun:'<ellipse cx="60" cy="90" rx="45" ry="15" fill="#d3dcd4"/><path d="M24 80q-8-49 37-49t37 49Z" fill="#c89d66"/><path d="M39 75q-12-27 21-27t18 22q-13 13-23-3t11-8" fill="none" stroke="#7c6051" stroke-width="6"/>',pizza:'<path d="M16 48q43-20 88 0L61 107Z" fill="#dfbb7a"/><path d="M22 52q38-18 75 0L61 96Z" fill="#b86f56"/><circle cx="45" cy="60" r="7" fill="#eee1b8"/><circle cx="74" cy="58" r="8" fill="#eee1b8"/><circle cx="61" cy="80" r="6" fill="#eee1b8"/>',wrap:'<path d="M22 51q36-25 78 0L83 101H40Z" fill="#d5b580"/><ellipse cx="61" cy="51" rx="36" ry="16" fill="#8b6656"/><path d="M26 53q30-16 68 0" fill="none" stroke="#8faa79" stroke-width="7"/>',curry:'<ellipse cx="60" cy="83" rx="46" ry="20" fill="#b8c9cc"/><ellipse cx="60" cy="77" rx="38" ry="16" fill="#b98651"/><circle cx="47" cy="75" r="8" fill="#dfc18f"/><circle cx="72" cy="78" r="10" fill="#dfc18f"/><path d="m58 59 13 15m-34 4 13 7" stroke="#8a9d73" stroke-width="5"/>',chocolate:'<path d="M28 40h62v53q-29 20-62 0Z" fill="#e3d7bb"/><ellipse cx="59" cy="41" rx="31" ry="10" fill="#795948"/><path d="M89 47q31-2 19 27-5 9-20 6" fill="none" stroke="#d6c5a2" stroke-width="7"/>' ,plate:'<ellipse cx="60" cy="84" rx="47" ry="17" fill="#c8d6d5"/><ellipse cx="60" cy="79" rx="40" ry="14" fill="#f4eddc"/><path d="M28 78q0-34 28-24q16 5 15 29Z" fill="#8c7663"/><ellipse cx="80" cy="77" rx="16" ry="10" fill="#e4c184"/><ellipse cx="63" cy="84" rx="17" ry="9" fill="#edddb8"/>',pie:'<ellipse cx="61" cy="94" rx="47" ry="12" fill="#d4dcda"/><path d="M22 61h77l-9 28q-30 13-59 0Z" fill="#bc925e"/><ellipse cx="60" cy="62" rx="41" ry="16" fill="#dec18a"/><path d="m43 54 34 16m-25-19 11 23m12-20-29 17" stroke="#b58c5a" stroke-width="3"/>',ice:'<path d="M36 73h48l-24 40Z" fill="#caa46d"/><path d="m44 77 24 20m-17 4 24-20" stroke="#eed3a6" stroke-width="2"/><circle cx="46" cy="63" r="22" fill="#d8b0ac"/><circle cx="72" cy="61" r="22" fill="#e2d1a6"/><circle cx="59" cy="39" r="21" fill="#acbca0"/>',cake:'<ellipse cx="60" cy="101" rx="48" ry="8" fill="#c4d3d5"/><path d="M28 60h65v35H28" fill="#dac093"/><path d="M28 73h65v10H28" fill="#a7767e"/><path d="M25 61q5-11 13-5q7-10 17-4q7-8 16-3q17-6 25 12Z" fill="#f4e7d1"/><circle cx="61" cy="46" r="8" fill="#9c6673"/><path d="m61 39 6-10" stroke="#839482" stroke-width="3"/>',tea:'<ellipse cx="52" cy="94" rx="39" ry="8" fill="#b5c8cf"/><path d="M25 49h52v21q-3 26-26 21-26 0-26-23Z" fill="#e8e1cd"/><path d="M78 52q28-4 20 17-6 13-23 7" fill="none" stroke="#c9c5b5" stroke-width="6"/><ellipse cx="51" cy="49" rx="26" ry="7" fill="#8b7767"/>'};
return `<svg class="food-art" viewBox="0 0 124 120" aria-hidden="true"><g class="food-steam" stroke="#9ba8ac" stroke-width="2" fill="none"><path d="M40 31q-6-8 0-15m18 12q-6-8 0-15"/></g>${art[type]||art.tea}</svg>`;}
