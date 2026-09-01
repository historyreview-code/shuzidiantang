# 🧭 旅行控制台

旅行内容生产链的本地管理面板：**行程规划 → 路线地图 → 驾车动画 → 视频笔记 → 小红书图文** 一屏总览、一键调用。

## 启动

```bash
cd ~/旅行控制台
python3 console.py          # 自动打开 http://127.0.0.1:8740
```

或者直接双击 `启动控制台.command`。

## 它做什么

- **行程库**：自动扫描所有含 `trip.yaml`（带 `stops:`/`legs:`）的文件夹，每条行程显示产线进度（规划/测算/地图/动画/视频/图文 ✓），产物点开即预览（地图 HTML / 动画 mp4 / 图文 md）
- **一键生产**：调用 trip-planner 与 travel-journal-video 的脚本
  - 测算道路 / 生成地图 / 驾车动画 / 行程卡片 / 小红书封面（engine.py）
  - 出视频笔记（journal.py，需选素材目录，`--trip` 自动带入叙事上下文）
  - 出图文笔记（xhs_post.py，自动找 storyboard.json + frames_seq/）
  - 任务实时日志，可随时停止
- **媒体库**：不在任何行程目录下的视频/地图/图片单独归档
- **设置**：添加/移除扫描目录（存 config.json）

## 概念约定

| 概念 | 定义 |
|---|---|
| 行程 | 一个包含 trip.yaml 的目录（目录=行程工作区） |
| 产物 | `-map-svg.html` `-animation.mp4` `成片*.mp4` `图文正文.md` `xhs_post/` `_map_*.png` 等约定命名文件 |
| 素材目录 | 照片/视频原始文件夹（出视频笔记用，目录名含 素材/photo/media 会被自动识别） |

## 配置

复制 `config.example.json` 为 `config.json` 后按需修改：

```json
{
  "port": 8740,
  "roots": ["~/行程工作区"],
  "skills_dir": "~/.agents/skills"
}
```

- `roots`：要扫描的根目录列表（也可在网页「设置」里加）
- `skills_dir`：trip-planner / travel-journal-video 所在的 skills 目录

## 给仓库访客

- 面板本体只用 Python 标准库，克隆即用；生产引擎（地理编码 / OSRM 道路测算 / 地图渲染 / 动画 / 视频笔记）在作者本机的 AI-agent skills 目录里，**不在本仓库内**——控制台是"驾驶舱"，引擎是"发动机"，二者经 `config.json` 解耦。引擎的核心思路可在 `folium-demo/interactive_itinerary.py`（交互式路书生成器）与 `folium-demo/anim_route_map.py`（水彩驾车动画）中管窥。
- `folium-demo/英国自驾环线-交互式路书.html` 是一份**演示资产**：真实道路几何 + 活地图 + 手账排版，双击即开（前端库走公共 CDN，完全离线时交互样式会缺失），也可部署到任意静态托管（URL 加 `?tour=1` 可进入自动导览模式）。

## 数据源与致谢

- 路线测算：[OSRM](https://project-osrm.org/) 公共服务（轻量使用）
- 底图与地理编码：© [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors；浅灰画布 Tiles © Esri — Esri, DeLorme, NAVTEQ
- 水彩地图底图：© Stamen Design · © OpenStreetMap（自然地理参考 Natural Earth）
- 演示页内联前端库（Leaflet / folium）来自公共 CDN

## 备注

- 只监听 `127.0.0.1`，文件服务仅限扫描根目录内，不对外
- 任务执行环境已自动清掉 `http_proxy` 等变量（防历史坑：死代理劫持 OSRM）
- 未装 PyYAML 时 trip.yaml 用降级文本解析（`pip3 install pyyaml` 可补全 title/days 等字段）
- 视频笔记的 storyboard 目前仍建议人工过一遍（全自动编排是下轮候选方向之一）
