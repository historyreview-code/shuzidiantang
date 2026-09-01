#!/usr/bin/env python3
"""
folium 驾车路线动画图 — 独立最小示例, 不依赖任何 skill。

用法:
    python3 anim_route_map.py [输出.html]
依赖:
    pip install folium        (唯一第三方依赖)
原理:
    OSRM 公共路由服务取真实道路几何 → folium(Leaflet.js) 渲染:
    白色描边 PolyLine 打底 + AntPath 流动虚线 = 浏览器端"行车动画"。
注意:
    OSRM 公共服务器免费, 请轻量调用; 底图版权归 OpenStreetMap / Esri。
"""
import json
import subprocess
import sys
from pathlib import Path

import folium
from folium.plugins import AntPath

# ── 在这里改途经点(按行驶顺序)和标题 ──────────────────────
WAYPOINTS = [
    # (名称, 纬度, 经度)
    ("东方明珠", 31.2397, 121.4998),
    ("浦东国际机场", 31.1443, 121.8083),
]
TITLE = "东方明珠 → 浦东国际机场 · 驾车路线"

OSRM = "https://router.project-osrm.org/route/v1/driving"


def fetch_route(waypoints):
    """OSRM 一次串起全部途经点。返回 (坐标序列[(lat,lon)], 距离km, 分钟数)。
    走 curl 子进程: 本机 python SSL 栈与 OSRM 握手会失败, curl 直连没问题;
    直连不通再依次试本机常见代理端口。"""
    pts = ";".join(f"{lon:.4f},{lat:.4f}" for _, lat, lon in waypoints)  # OSRM 要 lon,lat
    url = f"{OSRM}/{pts}?overview=full&geometries=geojson"
    for proxy in [None, "http://127.0.0.1:7897", "http://127.0.0.1:7890"]:
        cmd = ["curl", "-s", "-m", "30"]
        if proxy:
            cmd += ["-x", proxy]
        try:
            r = subprocess.run(cmd + [url], capture_output=True, text=True, timeout=40)
            route = json.loads(r.stdout)["routes"][0]
            coords = [(p[1], p[0]) for p in route["geometry"]["coordinates"]]
            return coords, route["distance"] / 1000, route["duration"] / 60
        except Exception:
            continue
    raise RuntimeError("OSRM 路由查询失败(直连+代理均不通)")


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("route-map.html")
    coords, km, mins = fetch_route(WAYPOINTS)
    dur = f"约 {mins:.0f} 分钟" if mins < 120 else f"约 {mins / 60:.0f} 小时"
    print(f"✅ OSRM: {len(coords)} 个道路点, {km:.1f}km, {dur}")

    c_lat = sum(c[0] for c in coords) / len(coords)
    c_lon = sum(c[1] for c in coords) / len(coords)
    # Leaflet 初始会把已添加的底图全部叠放渲染(后加的在上), 默认想显示谁就把它放最后;
    # 图层控件单选切换一次之后才是互斥的。
    m = folium.Map(location=[c_lat, c_lon], zoom_start=11, tiles=None)
    folium.TileLayer("OpenTopoMap", name="⛰️ 地形图").add_to(m)
    folium.TileLayer("OpenStreetMap", name="🗺️ 街道图").add_to(m)
    # 极简浅色用 Esri 浅灰画布: CartoDB positron 自2025下半年起免key返回水印瓦片
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attr="Tiles © Esri — Esri, DeLorme, NAVTEQ", name="🎨 极简浅色", max_zoom=16,
    ).add_to(m)

    # 路线 = 白色描边底 + AntPath 流动虚线(动画本体)
    folium.PolyLine(coords, color="#ffffff", weight=8, opacity=0.7).add_to(m)
    AntPath(coords, color="#e07b39", weight=4.5, opacity=0.9, dash_array=[10, 8]).add_to(m)

    # 途经点: 白底彩点 + 永久地名标签(起点🚩/终点🏁/中间站📍, 序号①②③…)
    n = len(WAYPOINTS)
    circled = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
    for i, (name, lat, lon) in enumerate(WAYPOINTS):
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
        # 环线(终点=起点)时终点标签放标记下方, 避免和起点标签叠死
        loop_back = i == n - 1 and i > 0 and (lat, lon) == tuple(WAYPOINTS[0][1:3])
        anchor = (0, 14) if loop_back else (0, -20)
        folium.Marker([lat, lon], icon=folium.DivIcon(
            icon_size=(0, 0), icon_anchor=anchor,
            html=('<div style="background:rgba(255,253,249,0.9);padding:2px 8px;'
                  'border-radius:8px;font-size:13px;font-weight:600;color:#2c2c2c;'
                  f'white-space:nowrap;border:1px solid rgba(0,0,0,0.12);">{emoji} {num} {name}</div>')
        )).add_to(m)

    # 图例: 标题 + 里程耗时
    legend = (
        '<div style="position:fixed;top:20px;left:20px;z-index:9999;background:#fffdf9;'
        'padding:10px 16px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.15);'
        'font-family:sans-serif;">'
        f'<div style="font-weight:bold;font-size:14px;">{TITLE}</div>'
        f'<div style="color:#888;font-size:12px;margin-top:4px;">🚗 {km:.0f} km · {dur} · {len(WAYPOINTS)} 站</div>'
        '</div>'
    )
    m.get_root().html.add_child(folium.Element(legend))

    m.fit_bounds(coords, padding=(40, 40))
    folium.LayerControl(collapsed=False).add_to(m)
    m.save(str(out))
    print(f"✅ 已生成 {out.resolve()}")


if __name__ == "__main__":
    main()
