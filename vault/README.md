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
| `vault/notes-template.html` | 手记/随笔文章模板 | 发布新一期手记时复制此模板 |
| `vault/invest-article-template.html` | 投资研究文章模板（暗室） | 发布投资笔记时复制此模板 |
| `vault/earth-themes-voyage/` | 大航海时代 SEO 落地页 | 主题暂下线（个人储备），代码仍在 monorepo `packages/themes/voyage` |

## 恢复发布的方法

- 游戏：把文件移回 `games/` 并在 `games/index.html` 加卡片
- 文学馆/地图馆：把目录名加回 `scripts/assemble.mjs` 的 `STATIC_PATHS`，并在各页导航/首页恢复入口

## 发布一期手记的方法

1. 复制 `vault/notes-template.html` → `about/notes/YYYY-MM-DD-短标题.html`（如 `2026-08-20-first-note.html`）
2. 填写标题 / meta 摘要 / 日期期数 / 正文
3. 在 `about/index.html` 的"手记 · 随笔"feed 列表里加一条：`<a class="item" href="notes/文件名">…</a>`
4. push 后 CI 自动上线（约 1 分钟）

## 发布一期投资研究笔记的方法（暗室 · 自动博客流）

1. 复制 `vault/invest-article-template.html` → `hidden/invest/notes/YYYY-MM-DD-短标题.html`
   （文件名日期决定排序，**务必**用 `YYYY-MM-DD-` 开头，如 `2026-08-20-fed-rate.html`）
2. 填写标题（`<title>` 和 `<h1>`）、meta 摘要、日期期数、分类、正文（免责声明保留勿删）
3. push → CI 自动上线（约 1 分钟）
   - **列表自动更新**：`scripts/assemble.mjs` 扫描 notes/ 目录按日期倒序生成首页列表——
     最新一期自动置顶，以往笔记自动下沉，无需手动改列表
   - 访问 `https://shuzidiantang.com/hidden/invest/`，地址只发给受邀的人
