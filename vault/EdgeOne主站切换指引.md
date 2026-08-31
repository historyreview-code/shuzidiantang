# EdgeOne Pages 国内主站切换指引（数字殿堂 · shuzidiantang.com）

> 2026-08-31 起稿 · 前提状态：ICP 备案 ✅（沪ICP备2026042531号，页脚已挂全站）· DNS 已在 DNSPod ✅（cheryl/loaf.dnspod.net）· 现网 = GitHub Pages 海外过渡版。
> 本次切换 = README ⑥ 的剩余部分：**EdgeOne 控制台建项目 + 绑域名**（控制台操作约 20 分钟，需用户本人登录腾讯云）。

## 一、EdgeOne Pages 创建项目（连接 GitHub 仓库）

1. 腾讯云控制台 → 搜索「**EdgeOne**」→ 进入 EdgeOne 控制台 → 左侧「**Pages**」→ 新建项目。
2. Git 平台选 **GitHub** → 授权 `historyreview-code` 账号 → 选择仓库 **`shuzidiantang`**。
3. 构建配置（照抄）：
   | 配置项 | 值 |
   |---|---|
   | 生产分支 | `main` |
   | 根目录 | `/` |
   | 安装命令 | `npm install` |
   | 构建命令 | `npm run assemble` |
   | 输出目录 | `dist` |
   | Node 版本 | `22`（若选项里没有就选最高的 20+） |

4. 保存并部署 → 等首次构建完成（构建日志应能看到「组装 dist/」与地球厅 vite build 成功）。

## 二、绑定自定义域名 + 切换解析

1. 项目 → **自定义域名** → 添加域名 `shuzidiantang.com`（`www.shuzidiantang.com` 一并添加或按提示自动加）。
2. 域名 DNS 在腾讯云 DNSPod 同账号下，控制台可直接**一键解析**（自动把解析切到 EdgeOne 的 CNAME）。
   - 若一键解析失败，手动改：DNSPod 控制台 → `shuzidiantang.com` → **删除**现有记录：
     - `@` A `185.199.108.153`、`@` A `185.199.109.153`
     - `www` CNAME `historyreview-code.github.io`
   - 然后添加：`@` CNAME → EdgeOne 给的加速 CNAME；`www` CNAME → 同上。
3. HTTPS 证书由 EdgeOne 自动签发（几分钟内），无需购买。

## 三、验证清单（切完后逐项过）

- [ ] `https://shuzidiantang.com/` 正常打开，响应头 `server` 不再是 `GitHub.com`
- [ ] 页脚显示「沪ICP备2026042531号」且链接跳工信部
- [ ] 首页 / AI 手记 / 游戏厅 / 地球厅（`/earth/`）各频道可访问
- [ ] 微信内打开首页速度明显变快（国内节点）
- [ ] `https://shuzidiantang.com/sitemap.xml` 正常

## 四、构建环境加固（已完成）

- `main` 已提交 `.npmrc`：`registry=https://registry.npmmirror.com/` —— assemble 里的 `npx pnpm@9` 与依赖安装走国内镜像，避免 EdgeOne 境内构建环境拉不动 npm 官方源。
- 地球厅代码从 `github.com` clone：境内一般可达；若构建日志卡在 `git clone`，改在 assemble.mjs 里给 MONOREPO 加 ghproxy 镜像前缀（`https://mirror.ghproxy.com/`）。

## 五、回滚与备份

- 切换后 GitHub Pages 保持不动（海外兜底）：若 EdgeOne 出问题，把 DNSPod 解析改回 `185.199.108.153 / 185.199.109.153` + www CNAME `historyreview-code.github.io` 即回退，约 5 分钟生效。

## 六、切换后待办

- [ ] 公安备案（次日办理：beian.mps.gov.cn 绑定数据码 `e393b797c...b`，见 `vault/公安备案操作指引.md`）→ 通过后页脚补挂公安备案号
- [ ] 停用/保留 GitHub Pages 过渡部署（CI 每日 02:00 重建可留作海外备份）
- [ ] Twikoo 评论 + Umami 统计（按原计划）
