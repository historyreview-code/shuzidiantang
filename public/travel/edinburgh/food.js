export const foods=[
  {
    "id": "haggis",
    "name": "The Haggis Box",
    "localName": "The Haggis Box Scottish Storytelling Centre",
    "dish": "哈吉斯与土豆泥",
    "kind": "苏格兰热餐",
    "area": "皇家一英里 · 叙事中心",
    "icon": "plate",
    "near": [
      "stgiles",
      "holyrood"
    ],
    "description": "在老城给午餐留一张桌子，试试哈吉斯搭配芜菁泥与土豆泥。店内也有素食与纯素版本，适合把地方滋味变成一次轻松尝试。",
    "tip": "传统哈吉斯含动物内脏；素食、酱汁与过敏原请按当日菜单确认。位于 Scottish Storytelling Centre。",
    "reserve": 50,
    "source": "https://www.thehaggisbox.com/",
    "sourceLabel": "店铺官方 · 菜单与到访",
    "checkedAt": "2026-10-05"
  },
  {
    "id": "scran",
    "name": "The Scran & Scallie",
    "localName": "The Scran and Scallie",
    "dish": "苏格兰家常料理",
    "kind": "坐下用餐",
    "area": "斯托克布里奇 · Comely Bank Road",
    "icon": "pie",
    "near": [
      "stockbridge",
      "botanic"
    ],
    "description": "逛过小巷与植物园，在街区酒馆坐下来吃一顿热餐。餐厅强调苏格兰食材与季节菜单，适合把午餐或晚餐当作当天的正式停留。",
    "tip": "菜单随季节变化；提前查预订与用餐时段。步道到餐厅还有一段路，不能只按景点标记估算。",
    "reserve": 80,
    "source": "https://scranandscallie.com/",
    "sourceLabel": "店铺官方 · 菜单与到访",
    "checkedAt": "2026-10-05"
  },
  {
    "id": "mary",
    "name": "Mary’s Milk Bar",
    "localName": "Mary’s Milk Bar Grassmarket",
    "dish": "当日口味意式冰淇淋",
    "kind": "甜味小憩",
    "area": "老城 · 19 Grassmarket",
    "icon": "ice",
    "near": [
      "victoria",
      "castle"
    ],
    "description": "在草市场选一份当日口味的 gelato，看城堡从街屋后升起。这里也供应热巧克力配冰淇淋，冷天可以换一种吃法。",
    "tip": "口味每天可能变化，排队另外留时间；选两种喜欢的就好，不把所有口味当成任务。",
    "reserve": 25,
    "source": "https://www.marysmilkbar.com/",
    "sourceLabel": "店铺官方 · 菜单与到访",
    "checkedAt": "2026-10-05"
  },
  {
    "id": "mimi",
    "name": "Mimi’s · City Art Centre",
    "localName": "Mimi’s Bakehouse City Art Centre",
    "dish": "司康、蛋糕与茶",
    "kind": "烘焙下午茶",
    "area": "老城边缘 · City Art Centre",
    "icon": "cake",
    "near": [
      "stgiles",
      "gallery",
      "writers"
    ],
    "description": "从皇家一英里往车站方向慢慢走，给蛋糕、司康与一杯茶留一点空白。可把下午茶作为看展与街巷之间的休息。",
    "tip": "此条选 City Art Centre 门店；下午茶、单点菜单和预约分别确认。不要按旧攻略寻找已不在现行门店目录的 Shore 店。",
    "reserve": 55,
    "source": "https://mimisbakehouse.com/",
    "sourceLabel": "店铺官方 · 菜单与到访",
    "checkedAt": "2026-10-05"
  },
  {
    "id": "deck",
    "name": "Royal Deck Tearoom",
    "localName": "Royal Deck Tearoom Britannia",
    "dish": "甲板茶点与司康",
    "kind": "船上小憩",
    "area": "利斯 · 皇家游艇船上",
    "icon": "tea",
    "near": [
      "britannia"
    ],
    "description": "参观五层甲板后，在船上的茶室停一停。菜单包含茶、汤、三明治及船上制作的蛋糕与司康，水岸景色成为这段停留的一部分。",
    "tip": "必须购买不列颠尼亚号参观票才能进入茶室。按到店顺序安排座位，不能把它当成可独立免费进入的港边咖啡馆。",
    "reserve": 50,
    "source": "https://www.royalyachtbritannia.co.uk/visit/royal-deck-tearoom/",
    "sourceLabel": "店铺官方 · 菜单与到访",
    "checkedAt": "2026-10-05"
  }
];
export function foodIllustration(type){
const art={plate:'<ellipse cx="60" cy="84" rx="47" ry="17" fill="#c8d6d5"/><ellipse cx="60" cy="79" rx="40" ry="14" fill="#f4eddc"/><path d="M28 78q0-34 28-24q16 5 15 29Z" fill="#8c7663"/><ellipse cx="80" cy="77" rx="16" ry="10" fill="#e4c184"/><ellipse cx="63" cy="84" rx="17" ry="9" fill="#edddb8"/>',pie:'<ellipse cx="61" cy="94" rx="47" ry="12" fill="#d4dcda"/><path d="M22 61h77l-9 28q-30 13-59 0Z" fill="#bc925e"/><ellipse cx="60" cy="62" rx="41" ry="16" fill="#dec18a"/><path d="m43 54 34 16m-25-19 11 23m12-20-29 17" stroke="#b58c5a" stroke-width="3"/>',ice:'<path d="M36 73h48l-24 40Z" fill="#caa46d"/><path d="m44 77 24 20m-17 4 24-20" stroke="#eed3a6" stroke-width="2"/><circle cx="46" cy="63" r="22" fill="#d8b0ac"/><circle cx="72" cy="61" r="22" fill="#e2d1a6"/><circle cx="59" cy="39" r="21" fill="#acbca0"/>',cake:'<ellipse cx="60" cy="101" rx="48" ry="8" fill="#c4d3d5"/><path d="M28 60h65v35H28" fill="#dac093"/><path d="M28 73h65v10H28" fill="#a7767e"/><path d="M25 61q5-11 13-5q7-10 17-4q7-8 16-3q17-6 25 12Z" fill="#f4e7d1"/><circle cx="61" cy="46" r="8" fill="#9c6673"/><path d="m61 39 6-10" stroke="#839482" stroke-width="3"/>',tea:'<ellipse cx="52" cy="94" rx="39" ry="8" fill="#b5c8cf"/><path d="M25 49h52v21q-3 26-26 21-26 0-26-23Z" fill="#e8e1cd"/><path d="M78 52q28-4 20 17-6 13-23 7" fill="none" stroke="#c9c5b5" stroke-width="6"/><ellipse cx="51" cy="49" rx="26" ry="7" fill="#8b7767"/>'};
return `<svg class="food-art" viewBox="0 0 124 120" aria-hidden="true"><g class="food-steam" stroke="#9ba8ac" stroke-width="2" fill="none"><path d="M40 31q-6-8 0-15m18 12q-6-8 0-15"/></g>${art[type]||art.tea}</svg>`;}
