export const foods=[
  {
    "id": "bettys",
    "name": "Bettys York · St Helen’s Square",
    "localName": "Bettys York · St Helen’s Square",
    "dish": "下午茶与点心",
    "kind": "街区滋味",
    "area": "市中心 · St Helen’s Square",
    "near": [
      "minster",
      "art",
      "shambles"
    ],
    "description": "用茶和一小块点心给古城散步留停顿；正式下午茶与普通到店用餐有不同安排。",
    "tip": "确认 York 门店；可预约的下午茶与普通茶室等位不能混为一谈。",
    "source": "https://www.bettys.co.uk/cafe-tea-rooms/our-locations/bettys-york",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 80,
    "icon": "tea",
    "checkedAt": "2026-10-06",
    "searchQuery": "Bettys York · St Helen’s Square"
  },
  {
    "id": "roast",
    "name": "York Roast Co · Stonegate",
    "localName": "York Roast Co · Stonegate",
    "dish": "约克郡布丁卷",
    "kind": "街区滋味",
    "area": "市中心 · Stonegate",
    "near": [
      "minster",
      "shambles"
    ],
    "description": "把烤肉餐的味道包进约克郡布丁卷，适合老城散步中的较快午餐。",
    "tip": "2026-10-06 官网列 Stonegate 可到访，Low Petergate 店升级关闭；出发前再查所选门店。",
    "source": "https://www.yorkroast.co/",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 40,
    "icon": "wrap",
    "checkedAt": "2026-10-06",
    "searchQuery": "York Roast Co · Stonegate"
  },
  {
    "id": "kitchen",
    "name": "Shambles Kitchen · 28 Shambles",
    "localName": "Shambles Kitchen · 28 Shambles",
    "dish": "烟熏肉三明治",
    "kind": "街区滋味",
    "area": "老城 · Shambles",
    "near": [
      "shambles",
      "jorvik",
      "merchant"
    ],
    "description": "浓郁馅料与面包适合分量明确的一顿街边餐；先看当天菜单再决定。",
    "tip": "以外带安排为主，不把店铺当作一定有座位的休息点；过敏与分量现场确认。",
    "source": "https://shamblesyork.co.uk/business-type/eat-and-drink-in-the-shambles/",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 35,
    "icon": "wrap",
    "checkedAt": "2026-10-06",
    "searchQuery": "Shambles Kitchen · 28 Shambles"
  },
  {
    "id": "cocoa",
    "name": "York Cocoa Works",
    "localName": "York Cocoa Works",
    "dish": "热巧克力与巧克力小点",
    "kind": "街区滋味",
    "area": "市中心 · Castlegate",
    "near": [
      "fairfax",
      "clifford",
      "castle"
    ],
    "description": "把城市的巧克力故事接到一杯热饮上，留意不同可可风味，不必一次买齐。",
    "tip": "工坊活动、咖啡区与巧克力故事馆是不同地点与项目；制作课程另行预订。",
    "source": "https://www.yorkcocoahouse.co.uk/",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 40,
    "icon": "chocolate",
    "checkedAt": "2026-10-06",
    "searchQuery": "York Cocoa Works"
  },
  {
    "id": "market",
    "name": "Shambles Market · 当日摊位",
    "localName": "Shambles Market · 当日摊位",
    "dish": "市场午餐",
    "kind": "街区滋味",
    "area": "老城 · Shambles Market",
    "near": [
      "shambles",
      "jorvik"
    ],
    "description": "从当天营业摊位里选一份合适的热餐，把午饭放进老城生活的节奏里。",
    "tip": "摊位和菜单会换，不保证旧攻略某家仍在；先查配料，雨天另找室内座位。",
    "source": "https://visityork.org/business-directory/shambles-market",
    "sourceLabel": "经营者 / 场馆官方 · 到访与菜单",
    "reserve": 45,
    "icon": "plate",
    "checkedAt": "2026-10-06",
    "searchQuery": "Shambles Market · 当日摊位"
  }
];
export function foodIllustration(type){
const art={bun:'<ellipse cx="60" cy="90" rx="45" ry="15" fill="#d3dcd4"/><path d="M24 80q-8-49 37-49t37 49Z" fill="#c89d66"/><path d="M39 75q-12-27 21-27t18 22q-13 13-23-3t11-8" fill="none" stroke="#7c6051" stroke-width="6"/>',pizza:'<path d="M16 48q43-20 88 0L61 107Z" fill="#dfbb7a"/><path d="M22 52q38-18 75 0L61 96Z" fill="#b86f56"/><circle cx="45" cy="60" r="7" fill="#eee1b8"/><circle cx="74" cy="58" r="8" fill="#eee1b8"/><circle cx="61" cy="80" r="6" fill="#eee1b8"/>',wrap:'<path d="M22 51q36-25 78 0L83 101H40Z" fill="#d5b580"/><ellipse cx="61" cy="51" rx="36" ry="16" fill="#8b6656"/><path d="M26 53q30-16 68 0" fill="none" stroke="#8faa79" stroke-width="7"/>',curry:'<ellipse cx="60" cy="83" rx="46" ry="20" fill="#b8c9cc"/><ellipse cx="60" cy="77" rx="38" ry="16" fill="#b98651"/><circle cx="47" cy="75" r="8" fill="#dfc18f"/><circle cx="72" cy="78" r="10" fill="#dfc18f"/><path d="m58 59 13 15m-34 4 13 7" stroke="#8a9d73" stroke-width="5"/>',chocolate:'<path d="M28 40h62v53q-29 20-62 0Z" fill="#e3d7bb"/><ellipse cx="59" cy="41" rx="31" ry="10" fill="#795948"/><path d="M89 47q31-2 19 27-5 9-20 6" fill="none" stroke="#d6c5a2" stroke-width="7"/>' ,plate:'<ellipse cx="60" cy="84" rx="47" ry="17" fill="#c8d6d5"/><ellipse cx="60" cy="79" rx="40" ry="14" fill="#f4eddc"/><path d="M28 78q0-34 28-24q16 5 15 29Z" fill="#8c7663"/><ellipse cx="80" cy="77" rx="16" ry="10" fill="#e4c184"/><ellipse cx="63" cy="84" rx="17" ry="9" fill="#edddb8"/>',pie:'<ellipse cx="61" cy="94" rx="47" ry="12" fill="#d4dcda"/><path d="M22 61h77l-9 28q-30 13-59 0Z" fill="#bc925e"/><ellipse cx="60" cy="62" rx="41" ry="16" fill="#dec18a"/><path d="m43 54 34 16m-25-19 11 23m12-20-29 17" stroke="#b58c5a" stroke-width="3"/>',ice:'<path d="M36 73h48l-24 40Z" fill="#caa46d"/><path d="m44 77 24 20m-17 4 24-20" stroke="#eed3a6" stroke-width="2"/><circle cx="46" cy="63" r="22" fill="#d8b0ac"/><circle cx="72" cy="61" r="22" fill="#e2d1a6"/><circle cx="59" cy="39" r="21" fill="#acbca0"/>',cake:'<ellipse cx="60" cy="101" rx="48" ry="8" fill="#c4d3d5"/><path d="M28 60h65v35H28" fill="#dac093"/><path d="M28 73h65v10H28" fill="#a7767e"/><path d="M25 61q5-11 13-5q7-10 17-4q7-8 16-3q17-6 25 12Z" fill="#f4e7d1"/><circle cx="61" cy="46" r="8" fill="#9c6673"/><path d="m61 39 6-10" stroke="#839482" stroke-width="3"/>',tea:'<ellipse cx="52" cy="94" rx="39" ry="8" fill="#b5c8cf"/><path d="M25 49h52v21q-3 26-26 21-26 0-26-23Z" fill="#e8e1cd"/><path d="M78 52q28-4 20 17-6 13-23 7" fill="none" stroke="#c9c5b5" stroke-width="6"/><ellipse cx="51" cy="49" rx="26" ry="7" fill="#8b7767"/>'};
return `<svg class="food-art" viewBox="0 0 124 120" aria-hidden="true"><g class="food-steam" stroke="#9ba8ac" stroke-width="2" fill="none"><path d="M40 31q-6-8 0-15m18 12q-6-8 0-15"/></g>${art[type]||art.tea}</svg>`;}
