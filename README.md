# 数字殿堂 · 总站门户

> 一座收藏数字作品的殿堂 —— 地球厅 · 游戏厅 · 文学馆 · 天文馆 · 地图馆
> 主域名：`shuzidiantang.com`（已注册，实名通过，ICP 备案审核中）· 海外过渡：Cloudflare Pages

## 目录结构

```
数字殿堂/
├── index.html            # 正殿（五馆门户首页）
├── assets/style.css      # 夜幕金殿主题
├── games/                # 游戏厅（单文件游戏即开即玩）
├── novels/ cosmos/ maps/ about/   # 文学馆 / 天文馆 / 地图馆 / 馆主手记
├── scripts/assemble.mjs  # 组装脚本：静态页 + 地球厅构建产物 → dist/
├── .github/workflows/deploy.yml    # CI：每日组装 + Cloudflare Pages 部署
└── dist/                 # 组装产物（不入库，由 CI/托管平台生成）
```

## 本地开发

```bash
npm run assemble    # 组装全站到 dist/（会拉取 digital-earth-series 并构建门户）
npm run preview     # 本地预览 dist/
```

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
> cd 数字殿堂 && git add .github && git commit -m "启用 CI" && git push
> ```

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
1. [dash.cloudflare.com](https://dash.cloudflare.com) 注册免费账号
2. Workers & Pages → Create → Pages → Connect to Git → 授权 GitHub
3. 选择 `historyreview-code/shuzidiantang` 仓库
4. 构建命令 `npm run assemble`，输出目录 `dist`，保存并部署
5. 部署成功后：自定义域添加 `shuzidiantang.com` + `www` → 按提示把 DNS 交给 Cloudflare（此时 DNS 托管在 CF，暂不解析国内线路）
6. 全球即可访问 https://shuzidiantang.com ✅

### ⑥ 备案通过后：切国内主站（约 1 小时）
1. 腾讯云 → DNSPod → 添加域名 `shuzidiantang.com`，接管 DNS（把域名 NS 从 Cloudflare 改到 DNSPod 提供的 NS）
2. 腾讯云 → EdgeOne → Pages → 创建项目 → 连接本 GitHub 仓库（构建命令同上）
3. 绑定自定义域名 `shuzidiantang.com` + `www`（已备案，直接生效）
4. 首页页脚补上备案号 + 工信部链接
5. Cloudflare Pages 保留（海外备份 + R2 媒体存储）

### ⑦ 域名邮箱 + 统计（可选，约 30 分钟）
1. 腾讯企业邮箱免费版：绑定 `shuzidiantang.com` → 开通 `hello@shuzidiantang.com`，按引导加 MX 解析
2. 轻量服务器上部署 Umami 统计（Docker 一条命令），首页注入统计脚本

---

## 作品来源

| 馆 | 来源仓库 |
|---|---|
| 地球厅 | [digital-earth-series](https://github.com/historyreview-code/digital-earth-series)（monorepo，构建注入） |
| 游戏厅 | neon-pacman / retro-pool 等（成品静态文件收录于本仓库 games/） |
| 文学馆 | [xiaoshan](https://github.com/historyreview-code/xiaoshan) · [wenyin](https://github.com/historyreview-code/wenyin) |
| 天文馆 | [cosmic-journey](https://github.com/historyreview-code/cosmic-journey) · [cosmic-evolution](https://github.com/historyreview-code/cosmic-evolution) |
| 地图馆 | europe-orchestra-tour · caucasus-v2 · uk-drive · caucasus-map |
