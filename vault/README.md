# vault · 暂存区（不发布）

本目录存放**尚未达到发布标准**的作品，**不参与组装**（`scripts/assemble.mjs` 不会复制这里的内容）。

## 当前暂存

| 路径 | 说明 | 暂缓原因 |
|---|---|---|
| `vault/games/pacman.html` | 霓虹吃豆人 | 待打磨精选 |
| `vault/games/rotate-labyrinth.html` | 旋转迷宫 | 待打磨精选 |
| `vault/games/ocean-drift.html` | 深海漫游 | 待打磨精选 |
| `vault/games/retro-pool/` | 像素桌球 | 待打磨精选 |
| `novels/`（仓库根目录） | 文学馆：《崤山》《玦·秦晋之好》 | 暂不对外，作品待打磨 |
| `maps/`（仓库根目录） | 地图馆：旅游计划工具 | 内部开发，定位未定 |

## 恢复发布的方法

- 游戏：把文件移回 `games/` 并在 `games/index.html` 加卡片
- 文学馆/地图馆：把目录名加回 `scripts/assemble.mjs` 的 `STATIC_PATHS`，并在各页导航/首页恢复入口
