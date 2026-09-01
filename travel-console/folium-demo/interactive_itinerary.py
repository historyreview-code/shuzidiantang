#!/usr/bin/env python3
"""
交互式路书 HTML — 纸感手账卡片 + 内嵌 folium 活地图(单文件)。

folium-demo 第二个示例: 演示 trip-planner itinerary(-itinerary.html, 静态图版)的交互形态。
    - 道路几何/逐段里程耗时/路名: OSRM 一次请求串全部途经点, legs[] 自带每段数据
    - 地图: anim_route_map 同款(白光晕 + AntPath 流动线 + 序号标记), 直接内联进路书页面
      (提取 folium 渲染结果的 <head>/<body> 片段拼接, 非 iframe, 仍是单文件)
    - 交互: 点击逐日卡片 → 地图 fitBounds 飞到当天路段(两端站+缓冲区)并高亮该卡
依赖: pip install folium
注意: 瓦片需联网; OSRM 公共服务免费请轻量调用。
"""
import json
import re
import subprocess
from pathlib import Path

import folium
from folium.plugins import AntPath

OSRM = "https://router.project-osrm.org/route/v1/driving"

# ── 行程数据: (站名, 纬度, 经度, 当天活动[], 当晚住宿) ──────────────
WAYPOINTS = [
    ("伦敦", 51.5007, -0.1246,
     ["威斯敏斯特议会大厦 & 大本钟", "泰晤士河南岸漫步", "伦敦眼日落"],
     "伦敦·考文特花园公寓"),
    ("剑桥", 52.2049, 0.1164,
     ["国王学院礼拜堂", "康河撑篙", "数学桥 & 三一学院"],
     "剑桥·国王街旅馆"),
    ("约克", 53.9598, -1.0813,
     ["约克大教堂登塔", "肉铺街 The Shambles", "中世纪城墙环形步道"],
     "约克·古城内民宿"),
    ("爱丁堡", 55.9486, -3.1994,
     ["爱丁堡城堡", "皇家一英里", "亚瑟王座日落"],
     "爱丁堡·老城公寓"),
    ("凯恩戈姆斯国家公园", 57.1472, -3.6646,
     ["凯恩戈姆山缆车", "高地荒原徒步", "驯鹿中心"],
     "阿维莫尔·高地木屋"),
    ("斯凯岛·波特里", 57.4130, -6.1934,
     ["老人峰 Old Man of Storr", "Quiraing 玄武岩高地", "波特里彩色码头"],
     "波特里·海景 B&B"),
    ("尼斯湖·奥古斯都堡", 57.1453, -4.6804,
     ["尼斯湖游船寻水怪", "卡莱多尼亚运河闸梯", "湖畔森林步道"],
     "奥古斯都堡·湖畔旅馆"),
    ("格拉斯哥大学", 55.8712, -4.2882,
     ["格拉斯哥大学回廊(哈利波特取景地)", "凯文葛罗夫艺术博物馆", "布坎南街购物"],
     "格拉斯哥·西区酒店"),
    ("温德米尔湖", 54.3636, -2.9192,
     ["温德米尔湖游船", "波尼斯小镇", "奥里斯顿庄园花园"],
     "温德米尔·湖畔酒店"),
    ("埃文河畔斯特拉福德", 52.1920, -1.7046,
     ["莎士比亚故居", "圣三一教堂(莎翁长眠处)", "埃文河泛舟"],
     "斯特拉福德·小镇旅馆"),
    ("牛津", 51.7515, -1.2573,
     ["基督堂学院(霍格沃茨食堂)", "博德利图书馆", "叹息桥"],
     "牛津·学院客房"),
    ("伦敦", 51.5007, -0.1246,
     ["白金汉宫换岗", "大英博物馆", "告别晚餐"],
     ""),
]
TITLE = "英国自驾环线 · 伦敦 → 苏格兰高地 → 湖区 → 伦敦"
DATE_HEAD = "10/01"  # 邮戳起始日(示意)


def fetch_route_full(waypoints):
    """OSRM 一次串起全部途经点。返回 (坐标序列[(lat,lon)], 逐段[(km, 分钟, 路名摘要)])。
    curl 子进程绕本机 python SSL 栈握手失败问题, 直连优先+代理回退。"""
    pts = ";".join(f"{lon:.4f},{lat:.4f}" for _, lat, lon, _, _ in waypoints)
    # steps=true 才有 legs[].summary(路段主干道路名, 如 "M11; A14")
    url = f"{OSRM}/{pts}?overview=full&geometries=geojson&steps=true"
    for proxy in [None, "http://127.0.0.1:7897", "http://127.0.0.1:7890"]:
        cmd = ["curl", "-s", "-m", "40"]
        if proxy:
            cmd += ["-x", proxy]
        try:
            r = subprocess.run(cmd + [url], capture_output=True, text=True, timeout=50)
            route = json.loads(r.stdout)["routes"][0]
            coords = [(p[1], p[0]) for p in route["geometry"]["coordinates"]]
            legs = [(l["distance"] / 1000, l["duration"] / 60, l.get("summary", ""))
                    for l in route["legs"]]
            return coords, legs
        except Exception:
            continue
    raise RuntimeError("OSRM 路由查询失败(直连+代理均不通)")


def build_map(waypoints, coords):
    """与 anim_route_map 同款视觉: 白光晕 + AntPath + 序号标记。返回 folium.Map。"""
    c_lat = sum(c[0] for c in coords) / len(coords)
    c_lon = sum(c[1] for c in coords) / len(coords)
    m = folium.Map(location=[c_lat, c_lon], zoom_start=6, tiles=None)
    folium.TileLayer("OpenTopoMap", name="⛰️ 地形图").add_to(m)
    folium.TileLayer("OpenStreetMap", name="🗺️ 街道图").add_to(m)
    # 极简浅色用 Esri 浅灰画布: CartoDB positron 自2025下半年起免key返回水印瓦片
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attr="Tiles © Esri — Esri, DeLorme, NAVTEQ", name="🎨 极简浅色", max_zoom=16,
    ).add_to(m)

    folium.PolyLine(coords, color="#ffffff", weight=8, opacity=0.7).add_to(m)
    AntPath(coords, color="#e07b39", weight=4.5, opacity=0.9, dash_array=[10, 8]).add_to(m)

    n = len(waypoints)
    circled = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
    for i, wp in enumerate(waypoints):
        name, lat, lon = wp[0], wp[1], wp[2]
        if i == 0:
            color, emoji = "#2ecc71", "🚩"
        elif i == n - 1:
            color, emoji = "#c0392b", "🏁"
        else:
            color, emoji = "#2980b9", "📍"
        num = circled[i] if i < len(circled) else str(i + 1)
        folium.CircleMarker([lat, lon], radius=14, color="#ffffff", fill=True,
                            fill_color="#ffffff", fill_opacity=0.9, weight=0).add_to(m)
        folium.CircleMarker([lat, lon], radius=10, color="#ffffff", fill=True,
                            fill_color=color, fill_opacity=0.95, weight=2.5,
                            tooltip=f"{emoji} {num} {name}").add_to(m)
        loop_back = i == n - 1 and (lat, lon) == tuple(waypoints[0][1:3])
        anchor = (0, 14) if loop_back else (0, -20)
        folium.Marker([lat, lon], icon=folium.DivIcon(
            icon_size=(0, 0), icon_anchor=anchor,
            html=('<div style="background:rgba(255,253,249,0.9);padding:2px 8px;'
                  'border-radius:8px;font-size:13px;font-weight:600;color:#2c2c2c;'
                  f'white-space:nowrap;border:1px solid rgba(0,0,0,0.12);">{emoji} {num} {name}</div>')
        )).add_to(m)

    m.fit_bounds(coords, padding=(40, 40))
    folium.LayerControl(collapsed=False).add_to(m)
    return m


CSS = """
  :root { --paper:#efe8db; --paper-card:#faf6ee; --paper-sunk:#eee7d8;
          --ink:#3d3226; --ink-soft:#8a7a64; --line:#e3d9c6; --line-strong:#cdbfa4;
          --accent:#b06f3c; --stamp-red:#c0392b;
          --serif:'Songti SC','Noto Serif SC',Georgia,serif;
          --sans:-apple-system,'PingFang SC','Hiragino Sans GB',sans-serif; }
  * { margin:0; padding:0; box-sizing:border-box; }
  /* 保险: 抵消可能残留的 folium 全屏样式, 防整页被锁进一屏 */
  html, body { height:auto !important; overflow:visible !important; }
  body { background:var(--paper); display:flex; flex-direction:column; align-items:center;
         font-family:var(--sans); padding:28px 16px; min-height:100vh;
         color:var(--ink); line-height:1.65; }
  .journal { max-width:920px; width:100%; background:var(--paper-card); border-radius:16px;
             box-shadow:0 2px 18px rgba(61,50,38,.07); overflow:hidden;
             border:1px solid var(--line); }
  .hero { padding:40px 36px 28px; border-bottom:1px solid var(--line); position:relative; }
  .hero .washi { position:absolute; top:-9px; left:36px; width:96px; height:20px;
                 background:rgba(126,200,160,.35); transform:rotate(-3deg); border-radius:2px; }
  .hero-head { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; }
  .hero-kicker { font-size:11px; letter-spacing:.28em; color:var(--ink-soft); margin-bottom:10px; }
  .hero-title { font-family:var(--serif); font-size:29px; font-weight:900; line-height:1.35;
                color:var(--ink); letter-spacing:.02em; }
  .hero-sub { margin-top:10px; font-size:13.5px; color:var(--ink-soft); }
  .postmark { width:92px; height:92px; border:2.5px solid var(--stamp-red); border-radius:50%;
              color:var(--stamp-red); display:flex; flex-direction:column; align-items:center;
              justify-content:center; transform:rotate(8deg); opacity:.9; flex-shrink:0;
              font-family:var(--serif); position:relative; }
  .postmark::before { content:''; position:absolute; inset:5px; border:1px solid var(--stamp-red);
                      border-radius:50%; }
  .postmark .pm-d { font-size:14px; font-weight:700; }
  .postmark .pm-n { font-size:21px; font-weight:900; }

  .livemap-sec { padding:22px 36px 26px; }
  .livemap-hint { font-size:12px; color:var(--ink-soft); margin-bottom:10px;
                  display:flex; align-items:center; gap:8px; }
  .live-map { height:460px; border:1px solid var(--line-strong); border-radius:10px;
              overflow:hidden; background:var(--paper-sunk); }

  .tickets { display:flex; gap:0; padding:20px 36px 24px; flex-wrap:wrap; }
  .ticket { flex:1; min-width:110px; background:var(--paper-card); border:1px solid var(--line-strong);
            padding:12px 16px; position:relative; text-align:center; margin-left:-1px; }
  .ticket:first-child { border-radius:10px 0 0 10px; margin-left:0; }
  .ticket:last-child { border-radius:0 10px 10px 0; }
  .t-num { font-family:var(--serif); font-size:23px; font-weight:900; color:var(--accent);
           display:block; line-height:1.2; }
  .t-label { font-size:11px; color:var(--ink-soft); letter-spacing:.12em; }

  .section { padding:24px 36px; }
  .section + .section { border-top:1px dashed var(--line-strong); }
  .sec-title { font-family:var(--serif); font-size:18px; font-weight:700; margin-bottom:15px;
               display:flex; align-items:baseline; gap:10px; }
  .sec-title::before { content:'§'; color:var(--accent); font-size:15px; }
  .sec-title small { font-size:11px; color:var(--ink-soft); letter-spacing:.2em;
                     font-weight:400; font-family:var(--sans); }

  table.legs { width:100%; border-collapse:collapse; font-size:13px; }
  table.legs th { text-align:left; padding:8px; color:var(--ink-soft); font-weight:500;
                  border-bottom:1.5px solid var(--line-strong); font-size:11px; letter-spacing:.14em; }
  table.legs td { padding:8px; border-bottom:1px solid var(--line); vertical-align:top; }
  .leg-emoji { font-size:15px; }
  .leg-route { font-weight:600; }
  .leg-arrow { color:var(--accent); }
  .leg-dist { color:var(--accent); font-weight:600; font-variant-numeric:tabular-nums; }
  .leg-time { color:var(--ink-soft); white-space:nowrap; }
  .leg-note { color:var(--ink-soft); font-size:12px; }

  .tl-item { display:flex; gap:16px; }
  .tl-axis { width:16px; flex-shrink:0; position:relative; display:flex; justify-content:center; }
  .tl-dot { width:13px; height:13px; border-radius:50%; margin-top:5px; flex-shrink:0;
            border:2.5px solid var(--paper-card); box-shadow:0 0 0 1.5px var(--line-strong); z-index:1; }
  .tl-line { position:absolute; top:20px; bottom:-2px; width:2px; background:var(--line-strong); opacity:.6; }
  .tl-item:last-child .tl-line { display:none; }
  .tl-card { flex:1; padding:12px 12px 20px; min-width:0; border-radius:8px; cursor:pointer;
             border:1px solid transparent; transition:background .15s, border-color .15s; }
  .tl-card:hover { background:var(--paper-sunk); }
  .tl-card.active { background:var(--paper-sunk); border-color:var(--accent);
                    box-shadow:0 1px 8px rgba(176,111,60,.18); }
  .day-head { display:flex; align-items:center; gap:9px; flex-wrap:wrap; margin-bottom:6px; }
  .day-id { font-family:var(--serif); font-size:12px; font-weight:700; color:var(--paper-card);
            padding:3px 9px; border-radius:4px; letter-spacing:.06em; background:var(--accent); }
  .day-date { font-size:12px; color:var(--ink-soft); font-variant-numeric:tabular-nums; }
  .day-title { font-size:14.5px; font-weight:700; flex:1; min-width:200px; }
  .day-fly { font-size:11px; color:var(--accent); background:transparent; border:1px solid var(--accent);
             padding:2px 9px; border-radius:3px; white-space:nowrap; }
  .day-body { font-size:13.5px; color:#5a4f40; line-height:1.7; }
  .act { padding:2.5px 0; }
  .day-drive { display:flex; align-items:center; gap:10px; margin-top:8px; font-size:12px;
               color:var(--ink-soft); }
  .dd-bar { flex:1; max-width:220px; height:7px; background:var(--paper-sunk);
            border:1px solid var(--line); border-radius:4px; overflow:hidden; display:inline-block; }
  .dd-bar i { display:block; height:100%; border-radius:4px; }
  .dd-warn { color:#c0392b; font-weight:700; font-size:11.5px; }
  .hotel { font-size:12px; color:var(--ink-soft); margin-top:6px; }

  .drive-chart { display:flex; flex-direction:column; gap:7px; }
  .drive-row { display:flex; align-items:center; gap:10px; font-size:12px; }
  .drive-day { width:34px; font-family:var(--serif); font-weight:700; color:var(--ink-soft);
               text-align:right; flex-shrink:0; }
  .drive-bar-bg { flex:1; height:18px; background:var(--paper-sunk); border:1px solid var(--line);
                  border-radius:4px; overflow:hidden; display:block; }
  .drive-bar { height:100%; display:block; border-radius:3px; }
  .drive-hr { width:46px; font-weight:700; flex-shrink:0; font-variant-numeric:tabular-nums; }
  .drive-info { font-size:11px; color:var(--ink-soft); white-space:nowrap; }

  .hotel-list { display:flex; flex-direction:column; gap:7px; align-items:flex-start; }
  .luggage-tag { display:flex; gap:12px; align-items:center; background:var(--paper-sunk);
                 border:1px solid var(--line-strong); border-radius:6px; padding:7px 14px 7px 26px;
                 position:relative; font-size:13px; }
  .luggage-tag::before { content:''; position:absolute; left:9px; top:50%; transform:translateY(-50%);
                         width:7px; height:7px; border-radius:50%; background:var(--paper-card);
                         border:1px solid var(--line-strong); }
  .hotel-day { color:var(--ink-soft); font-size:12px; min-width:86px; }
  .hotel-name { font-weight:600; }

  .tips-list { display:flex; flex-direction:column; gap:7px; }
  .sticky-note { background:#fbf6e8; border-left:3px solid #e6c96a; padding:8px 14px;
                 font-size:13px; transform:rotate(-.3deg); }
  .sticky-note:nth-child(even) { transform:rotate(.3deg); }

  .footer { display:flex; justify-content:space-around; padding:16px 24px;
            border-top:1px solid var(--line); color:var(--ink-soft); font-size:12px;
            letter-spacing:.08em; }

  @media (max-width:600px) {
    .hero { padding:26px 20px 20px; } .hero-title { font-size:22px; }
    .livemap-sec, .tickets, .section { padding-left:20px; padding-right:20px; }
    .live-map { height:340px; }
    .day-title { min-width:100%; } .drive-info, .leg-note { display:none; }
  }
  @media print {
    body { background:white; padding:0; }
    .journal { max-width:100%; border-radius:0; box-shadow:none; border:none; }
    .livemap-sec { display:none; }  /* 活地图依赖网络与 JS, 打印用静态版路书 */
    .tl-card, .luggage-tag, .sticky-note { break-inside:avoid; }
    .footer { display:none; }
  }
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>__TITLE__ · 交互式路书</title>
<style>__CSS__</style>
__FOLIUM_HEAD__
</head>
<body>
<div class="journal">

  <div class="hero">
    <div class="washi"></div>
    <div class="hero-head">
      <div class="hero-text">
        <div class="hero-kicker">INTERACTIVE TRAVEL ITINERARY · 交互式路书</div>
        <h1 class="hero-title">__TITLE__</h1>
        <div class="hero-sub">__DATES__ · 伦敦出发环线 · 英国</div>
      </div>
      <div class="postmark"><span class="pm-d">__DATE_HEAD__</span><span class="pm-n">__DAYN__天</span></div>
    </div>
  </div>

  <div class="livemap-sec" id="livemap">
    <div class="livemap-hint">🗺️ 活地图 — 可拖拽 / 切换底图；<b>点击任意一天，地图自动飞到当天路段</b>；普通滚轮滚动页面，<b>⌘/Ctrl + 滚轮</b>缩放地图</div>
    <div class="live-map">
__FOLIUM_BODY__
    </div>
  </div>

  <div class="tickets">
    <div class="ticket"><span class="t-num">__TOTAL_KM__</span><span class="t-label">自驾 KM</span></div>
    <div class="ticket"><span class="t-num">__TOTAL_HR__H</span><span class="t-label">驾驶时长</span></div>
    <div class="ticket"><span class="t-num">__STOPN__</span><span class="t-label">途经站点</span></div>
    <div class="ticket"><span class="t-num">__DAYN__</span><span class="t-label">天</span></div>
  </div>

  <div class="section">
    <div class="sec-title">逐日行程 <small>DAY BY DAY · 点击卡片定位地图</small></div>
    <div class="days">
__DAYS_HTML__
    </div>
  </div>

  <div class="section">
    <div class="sec-title">驾驶强度 <small>DRIVE LOAD</small></div>
    <div class="drive-chart">
__DRIVE_BARS__
    </div>
  </div>

  <div class="section">
    <div class="sec-title">住宿一览 <small>STAY</small></div>
    <div class="hotel-list">
__HOTELS__
    </div>
  </div>

  <div class="section">
    <div class="sec-title">备忘 <small>NOTES</small></div>
    <div class="tips-list">
      <div class="sticky-note">🌤️ 英国春秋 5-15°C / 夏 15-25°C · 多雨备伞，高地风大</div>
      <div class="sticky-note">🚗 英国右舵左行，环岛让右侧来车；高地单车道需用让车点</div>
      <div class="sticky-note">🛥️ 斯凯岛与高地段建议提前订 B&B，10 月后旺季结束房间仍紧张</div>
    </div>
  </div>

  <div class="footer">
    <span>__STOPN__ 个站点</span><span>__LEGN__ 段交通</span><span>__DAYN__ 天</span>
  </div>
</div>

<script>
// 逐日路段范围(两端站 + 缓冲区), 点击日程卡 → 地图飞过去
const DAY_BOUNDS = __DAY_BOUNDS_JSON__;
document.querySelectorAll('.tl-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.tl-card.active').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const div = document.querySelector('.folium-map');
    const mapObj = div ? window[div.id] : null;   // folium 全局地图变量名 = 容器 div id
    if (mapObj && DAY_BOUNDS[card.dataset.day]) {
      mapObj.fitBounds(DAY_BOUNDS[card.dataset.day], {padding: [25, 25], maxZoom: 11, animate: false});
    }
    document.getElementById('livemap').scrollIntoView({behavior: 'auto', block: 'start'});
  });
});

// 滚轮策略: 普通滚轮留给页面滚动, ⌘/Ctrl(或触控板捏合)时才缩放地图 —
// 否则点完日程卡页面滚到地图上, 光标处滚轮全被地图吞掉, 页面"滚不下去"。
// capture 先于 Leaflet 自己的 wheel 监听执行, 保证解除武装发生在 Leaflet 消费事件之前。
const __c = document.querySelector('.folium-map');
const __m = __c ? window[__c.id] : null;
if (__m && __m.scrollWheelZoom) {
  __m.scrollWheelZoom.disable();
  __c.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();                       // 浏览器默认的 Ctrl+滚轮 = 整页缩放, 必须拦下
      if (!__m.scrollWheelZoom.enabled()) {     // 首次手势手动补一档, 之后交给 Leaflet 原生手感
        __m.scrollWheelZoom.enable();
        __m.setZoom(__m.getZoom() + (e.deltaY < 0 ? 1 : -1), {animate: false});
      }
    } else if (__m.scrollWheelZoom.enabled()) {
      __m.scrollWheelZoom.disable();
    }
  }, {passive: false, capture: true});
  __c.addEventListener('mouseleave', () => __m.scrollWheelZoom.disable());
}

// 自动导览: URL 带 ?tour=1 时, 每 3.4s 依次飞到 D1→Dn, 像放映幻灯片;
// 访客任意点击/滚动/按键立即停止, 控制权交还 — 给展示页 iframe 嵌入用。
(function () {
  if (new URLSearchParams(location.search).get('tour') !== '1') return;
  const cards = Array.from(document.querySelectorAll('.tl-card'));
  let i = 0, timer = null;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, stop, {passive: true}));
  const step = () => {
    if (i >= cards.length) { stop(); return; }
    cards[i++].dispatchEvent(new MouseEvent('click', {bubbles: true}));
  };
  setTimeout(() => { step(); timer = setInterval(step, 3400); }, 900);
})();
</script>
</body>
</html>"""


def _esc(s) -> str:
    if s is None:
        return ""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def main():
    out = Path(__file__).parent / "英国自驾环线-交互式路书.html"

    coords, legs = fetch_route_full(WAYPOINTS)
    total_km = sum(l[0] for l in legs)
    total_hr = sum(l[1] for l in legs) / 60  # legs 存的是分钟
    n_days = len(legs)
    print(f"✅ OSRM: {len(coords)} 道路点, {total_km:.0f}km, {total_hr:.1f}h, {n_days} 段")

    # 地图对象 → 内联拼接。注意 folium 的初始化 <script>(含全部坐标)在 </body> 之后,
    # 要取 <body> 到 </html> 之间的全部内容, 只去掉闭合标签。
    m = build_map(WAYPOINTS, coords)
    rendered = m.get_root().render()
    folium_head = rendered.split("<head>")[1].split("</head>")[0]
    # folium 自带 "html,body{width/height:100%}" 全屏样式(单页地图用), 拼进路书会把
    # flex 布局的 body 锁成一屏高、.journal(overflow:hidden 裁圆角)把下面内容全部裁掉,
    # 整页无法滚动 — 必须剥掉这块。
    folium_head = re.sub(r"<style>\s*html,\s*body\s*\{.*?\}\s*</style>", "", folium_head, flags=re.S)
    folium_body = rendered.split("<body>")[1].rsplit("</html>")[0].replace("</body>", "", 1)

    # 逐日卡片 + 驾驶强度 + 住宿 + 逐日地图范围
    day_cards, drive_bars, hotels, bounds = [], [], [], {}
    max_hr = max(l[1] for l in legs)
    for i, (km, mins, summary) in enumerate(legs):
        did = f"D{i + 1}"
        frm, to = WAYPOINTS[i], WAYPOINTS[i + 1]
        la1, lo1, la2, lo2 = frm[1], frm[2], to[1], to[2]
        bounds[did] = [[min(la1, la2) - 0.10, min(lo1, lo2) - 0.15],
                       [max(la1, la2) + 0.10, max(lo1, lo2) + 0.15]]

        bar_color = "#c0392b" if mins >= 240 else ("#d98e32" if mins >= 120 else "#6a9978")
        warn = '<span class="dd-warn">⚠️ 疲劳预警</span>' if mins >= 240 else ""
        acts = "".join(f'<div class="act">· {_esc(a)}</div>' for a in to[3])
        hotel = f'<div class="hotel">🛏️ {_esc(to[4])}</div>' if to[4] else ""
        day_cards.append(
            f"""<div class="tl-item">
            <div class="tl-axis"><div class="tl-dot" style="background:{bar_color};"></div><div class="tl-line"></div></div>
            <div class="tl-card" data-day="{did}">
              <div class="day-head">
                <span class="day-id" style="background:{bar_color};">{did}</span>
                <span class="day-date">10/{i + 1:02d}</span>
                <span class="day-title">{_esc(frm[0])} → {_esc(to[0])}</span>
                <span class="day-fly">📍 地图定位</span>
              </div>
              <div class="day-body">{acts}</div>
              <div class="day-drive"><span>🚗 {km:.0f} km · {mins / 60:.1f} h</span>
                <span class="dd-bar"><i style="width:{min(mins / max_hr * 100, 100):.0f}%;background:{bar_color};"></i></span>
                {warn}</div>
              {hotel}
            </div>
          </div>"""
        )
        drive_bars.append(
            f'<div class="drive-row"><span class="drive-day">{did}</span>'
            f'<span class="drive-bar-bg"><span class="drive-bar" style="width:{mins / max_hr * 100:.0f}%;background:{bar_color};"></span></span>'
            f'<span class="drive-hr">{mins / 60:.1f}h</span>'
            f'<span class="drive-info">{km:.0f}km · {_esc(summary[:24])}{" ⚠️疲劳" if mins >= 240 else ""}</span></div>'
        )
        if to[4]:
            hotels.append(
                f'<div class="luggage-tag"><span class="hotel-day">{did} · 10/{i + 1:02d}</span>'
                f'<span class="hotel-name">{_esc(to[4])}</span></div>'
            )

    html = (HTML_TEMPLATE
            .replace("__CSS__", CSS)
            .replace("__FOLIUM_HEAD__", folium_head)
            .replace("__FOLIUM_BODY__", folium_body)
            .replace("__TITLE__", _esc(TITLE))
            .replace("__DATES__", "10/01 – 10/11")
            .replace("__DATE_HEAD__", DATE_HEAD)
            .replace("__DAYN__", str(n_days))
            .replace("__STOPN__", str(len(WAYPOINTS)))
            .replace("__LEGN__", str(len(legs)))
            .replace("__TOTAL_KM__", f"{total_km:.0f}")
            .replace("__TOTAL_HR__", f"{total_hr:.0f}")
            .replace("__DAYS_HTML__", "\n".join(day_cards))
            .replace("__DRIVE_BARS__", "\n".join(drive_bars))
            .replace("__HOTELS__", "\n".join(hotels))
            .replace("__DAY_BOUNDS_JSON__", json.dumps(bounds, ensure_ascii=False)))

    out.write_text(html, encoding="utf-8")
    print(f"✅ 已生成 {out.resolve()} ({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
