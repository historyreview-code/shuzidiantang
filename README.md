# 劳伦斯实验室 · 总站门户

> 一座收藏数字作品的殿堂 —— 地球厅 · 游戏厅 · 天文馆
> 主域名：`shuzidiantang.com`（已上线腾讯云 EdgeOne Pages，ICP 备案：沪ICP备2026042531号）· 海外兜底：GitHub Pages

## 目录结构

```
劳伦斯实验室/
├── index.html            # 首页（手记文章流 + 作品展厅）
├── notes/                # 手记频道（公开文章，文件名 YYYY-MM-DD- 开头，自动列表+RSS+sitemap）
├── assets/style.css      # 比特辉光主题（深空黑蓝 · 比特青 × 算力紫）
├── games/                # 游戏厅（精选机台：数字扫雷 / 像素打砖块）
├── cosmos/ about/               # 天文馆 / 馆主手记
├── novels/               # 文学馆（暂不对外，作品待打磨）
├── maps/                 # 地图馆（旅游计划工具，内部开发，暂不发布）
├── hidden/               # 暗室（不公开入口的主题，如投资研究；robots 屏蔽）
├── vault/                # 暂存区（未达发布标准的游戏机台等，不参与组装）
├── scripts/assemble.mjs  # 组装脚本：静态页 + 地球厅构建产物 → dist/
├── .github/workflows/deploy.yml    # CI：每日组装 + GitHub Pages 部署
└── dist/                 # 组装产物（不入库，由 CI/托管平台生成）
```

## 本地开发

```bash
npm run dev         # 只开发 Astro 主站
npm run assemble    # 组装全站到 dist/（主站 + 旧作品 + 地球厅）
npm run preview     # 本地预览 dist/
```

### 地球厅接入方式

数字地球系列保持独立 monorepo，主站只在组装阶段把门户构建产物放进 `dist/earth/`。
`scripts/assemble.mjs` 的源码选择顺序：

1. `DIGITAL_EARTH_REPO=/path/to/digital-earth-series npm run assemble`
   - 显式指定本地源码，适合调试不同分支。
2. `../数字地球系列`
   - 本机默认使用同级目录 `/Users/newclaw/游戏创作/数字地球系列`。
3. `.cache/digital-earth-series`
   - CI 或没有同级目录时使用缓存；缓存不存在才首次 clone。

默认不会每次 `git pull` 地球仓库。需要刷新远程源码时显式执行：

```bash
DIGITAL_EARTH_REFRESH=1 npm run assemble
```

CI 会缓存 `.cache/digital-earth-series`、`.cache/pnpm-store` 和 `.cache/npm-cache`；
每日定时任务会设置 `DIGITAL_EARTH_REFRESH=1`，普通 push 构建优先复用缓存。

## 暗室（隐藏入口）

不对外展示的主题（如投资研究）放在 `hidden/` 下：首页/导航/站点地图均无入口，
`robots.txt` 已屏蔽搜索引擎。发布新暗室：

1. 建 `hidden/<名字>/index.html`（可复制 `hidden/invest/index.html` 改内容；页面自带 noindex）
2. 直接访问 `https://shuzidiantang.com/hidden/<名字>/`，把地址只发给想给的人

> 现成暗室：**投资研究** `hidden/invest/`（每周笔记+文章，发文流程见 `vault/README.md`，
> 文章模板 `vault/invest-article-template.html`，含免责声明）。

> ⚠️ 说明：这是"路径隐藏"而非真正的鉴权——知道地址即可访问（GitHub Pages 纯静态无法做
> 密码验证）。若未来需要真保护：备案通过后在轻量服务器用 Nginx basic-auth，或使用带
> 口令的静态页（前端校验，防君子不防小人）。

## 部署（双轨）

| 轨道 | 平台 | 用途 |
|---|---|---|
| 国内主站 | 腾讯云 EdgeOne Pages | 备案通过后接入；构建命令 `npm run assemble`，输出目录 `dist` |
| 海外/过渡 | Cloudflare Pages | 备案期间先行上线；GitHub Actions 每日自动部署（见 deploy.yml） |

### Cloudflare Pages 配置（自动部署需设置 3 个仓库 Secrets）

```
CF_ACCOUNT_ID     # Cloudflare 账号 ID（Dashboard 右侧）
CF_API_TOKEN      # API Token（My Profile → API Tokens → Edit Cloudflare Workers）
CF_PROJECT_NAME   # Pages 项目名（如 shuzidiantang）
```

不设 Secrets 也能用：直接在 Cloudflare Pages 控制台连接本仓库，
构建命令 `npm run assemble`、输出目录 `dist`。

> ⚠️ GitHub Actions 工作流文件（`.github/workflows/deploy.yml`）因当前 gh 登录令牌缺
> `workflow` 权限暂未入库。启用自动部署需在本地执行一次：
> ```bash
> gh auth refresh -h github.com -s workflow   # 浏览器授权一次
> cd 劳伦斯实验室 && git add .github && git commit -m "启用 CI" && git push
> ```

### 访问计数器（Vercount，已接入）

- `scripts/assemble.mjs` 组装时自动注入全站：页脚显示「全站浏览 / 独立访客」，手记文章页另加「本文阅读」；暗室 `hidden/` 不注入（地址保密）。
- 数据存于第三方公共实例 [vercount.one](https://vercount.one)（可登录验证域名后自定义初始值）；备案通过后可自建 Vercount / EdgeOne 边缘函数 + KV 替换脚本地址，前端不用动。

---

## 馆主操作清单（人工步骤，按顺序执行）

### ① 腾讯云账号（一次性，约 10 分钟）
1. [cloud.tencent.com](https://cloud.tencent.com) 注册个人账号
2. 完成**实名认证**（身份证，个人认证）
3. 记住实名主体姓名 —— 备案网站名将用它（如"数字殿堂·个人作品站"）

### ② 注册域名（约 ¥80–100/个/年，2 个）
1. 腾讯云控制台 → 域名注册，购买：
   - `shuzidiantang.com`（主）
   - `shuzidiantang.cn`（保护，防止抢注）
2. 完成**域名实名认证**（约 1–2 天，与备案并行不冲突）

### ③ 购买轻量应用服务器（备案主体 + 源站，新用户 ≈ ¥99/年）
1. 控制台 → 轻量应用服务器 → 新用户促销款（2C2G 即可）
2. 地域选国内任意（如广州/上海），镜像随意（后期用不上它跑业务）
3. 这台机器 = 备案接入凭证 + 二期 autochest 后端 + 自建统计

### ④ 提交备案（约 2–4 周，与⑤并行）
1. 控制台 → 网站备案 → 开始备案
2. 网站名称建议：**数字殿堂·个人作品站**（勿含"公司/商城/平台"等字）
3. 按引导完成：身份证件 → 人脸核验（微信小程序"腾讯云网站备案"）→ 短信核验
4. 等待管局审核；期间**域名不可解析到境内服务器**，走⑤的海外过渡

### ⑤ Cloudflare Pages 过渡上线（备案等待期，约 30 分钟）

> ⚠️ 2026-08 实测：新注册账号遭遇 **pages.dev 子域账号级封锁**（Cloudflare 反钓鱼风控，
> 任何项目名都报 "Subdomain is blocked"，社区大量同类报告）。
> 已改走 **GitHub Pages** 过渡（自动部署见 `.github/workflows/deploy.yml`），步骤：

1. [dash.cloudflare.com](https://dash.cloudflare.com) 注册免费账号（已完成，但 pages.dev 被账号级封锁，暂不可用；已向 abusereply 申诉备用）
2. GitHub Pages 自动部署：仓库已启用 Pages（source: GitHub Actions），每次 push main / 每日 02:00 UTC 自动组装发布
3. 自定义域名：已在仓库 Pages 设置绑定 `shuzidiantang.com`（GitHub 自动签发 HTTPS 证书）
4. DNSPod 添加解析（见下方记录），全球即可访问 https://shuzidiantang.com ✅
5. 若日后 Cloudflare 解封：可再建 Pages 项目（构建命令 `npm run assemble`、输出目录 `dist`）作海外备份

#### DNSPod 解析记录（GitHub Pages）

| 主机记录 | 类型 | 记录值 |
|---|---|---|
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| www | CNAME | historyreview-code.github.io |

> 注：DNSPod 免费版同一主机最多 2 条 A 记录（负载均衡限额），GitHub Pages 4 个 IP 配 2 个即可，无需升级套餐。

### ⑥ 备案通过后：切国内主站（约 1 小时）
1. 腾讯云 → DNSPod → 添加域名 `shuzidiantang.com`，接管 DNS（把域名 NS 从 Cloudflare 改到 DNSPod 提供的 NS）
2. 腾讯云 → EdgeOne → Pages → 创建项目 → 连接本 GitHub 仓库（构建命令同上）
3. 绑定自定义域名 `shuzidiantang.com` + `www`（已备案，直接生效）
4. 首页页脚补上备案号 + 工信部链接
5. Cloudflare Pages 保留（海外备份 + R2 媒体存储）

### ⑦ 域名邮箱 + 统计（可选，约 30 分钟）
1. 腾讯企业邮箱免费版：绑定 `shuzidiantang.com` → 开通 `hello@shuzidiantang.com`，按引导加 MX 解析
2. 轻量服务器上部署 Umami 统计（Docker 一条命令），首页注入统计脚本

### ⑧ 手记游客评论（备案通过后，约 1 小时）
- Twikoo Docker 自建（零新增月费、游客匿名、人工审核）：DNS `comment` → 服务器 →
  `docker run imaegoo/twikoo` → 腾讯云免费证书 + Nginx 反代 → 管理面板开审核 → assemble 注入前端
- 完整定稿步骤见 `vault/twikoo-评论系统部署方案.md`（过渡期不接入）

---

## 作品来源

| 馆 | 来源仓库 |
|---|---|
| 地球厅 | [digital-earth-series](https://github.com/historyreview-code/digital-earth-series)（独立 monorepo，本地源码优先，组装时构建注入 `/earth/`） |
| 游戏厅 | [Numsweeper](https://github.com/historyreview-code/Numsweeper)（数字扫雷）· 像素打砖块（收录于 games/）；其余机台暂存 vault/games/ 打磨 |
| 文学馆（未发布） | [xiaoshan](https://github.com/historyreview-code/xiaoshan) · [wenyin](https://github.com/historyreview-code/wenyin)（作品待打磨，暂不对外） |
| 天文馆 | [cosmic-journey](https://github.com/historyreview-code/cosmic-journey)（宇宙之旅五集 · 云健男声旁白 · 放映厅自动连播）· [cosmic-evolution](https://github.com/historyreview-code/cosmic-evolution)（宇宙演化全景）；solar-ecliptic 已下架（内容并入第一集） |
| 地图馆（未发布） | europe-orchestra-tour · caucasus-v2 · uk-drive · caucasus-map（旅游计划工具，内部开发，暂不发布） |
