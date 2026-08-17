# 手记游客评论 · Twikoo Docker 自建方案（备案通过后执行）

> 定稿：2026-08-16 · 状态：**待备案通过后实施**（本文件不发布，vault/ 不参与组装）

## 决策背景

- 需求：手记文章（`/notes/`）允许**游客匿名留言**。
- 现状：数字殿堂是纯静态站（GitHub Pages 过渡 → 备案后 EdgeOne Pages），无后端，评论必须外接评论系统。
- 方案比选（2026-08-16）：
  - ❌ 腾讯云 CloudBase 部署 Twikoo：官方文档明确一键部署免费额度（数据库 500 读/天）**无法支撑运行**，手动部署需**付费购买环境** → 否决。
  - ❌ Vercel：国内无法访问。❌ Giscus/utterances：需 GitHub 登录，非纯游客。
  - ✅ **轻量服务器 Docker 自建 Twikoo**：零新增月费、数据自持、游客匿名、支持人工审核/反垃圾；仅需等备案通过后域名才能合法解析到境内服务器并签发 HTTPS。
- 过渡期（备案等待期）**不接入评论**，本方案只存档待用。

## 前置条件

- ICP 备案通过，`shuzidiantang.com` DNS 已切回 DNSPod。
- 轻量服务器：`124.221.179.173`（上海 · Ubuntu 24.04 · Docker CE 就绪）。
- SSH：`ssh -i /Users/newclaw/游戏创作/.server-keys/lighthouse_ed25519 ubuntu@124.221.179.173`

## 实施步骤（约 1 小时）

### 1. DNS 解析

DNSPod 添加：主机记录 `comment` · 类型 A · 记录值 `124.221.179.173`

### 2. 服务器部署 Twikoo（Docker）

```sh
ssh -i ~/游戏创作/.server-keys/lighthouse_ed25519 ubuntu@124.221.179.173
mkdir -p ~/twikoo && cd ~/twikoo
docker run --name twikoo \
  -e TWIKOO_THROTTLE=1000 \
  -p 127.0.0.1:8080:8080 \
  -v $HOME/twikoo/data:/app/data \
  --restart unless-stopped -d imaegoo/twikoo
```

- 只绑本机 127.0.0.1（与 autochest 同模式），对外走 Nginx 反代，ufw 不放行 8080。
- 数据默认 lokijs 存 `~/twikoo/data/`（已挂卷），**注意定期备份**（见第 6 步）。
- 若 Docker Hub 拉取失败：`docker pull docker.m.daocloud.io/imaegoo/twikoo && docker tag docker.m.daocloud.io/imaegoo/twikoo imaegoo/twikoo`
- 版本一致性：前端 JS 与镜像版本保持一致（都固定 1.7.19，或都取 latest）。

### 3. HTTPS 反代（腾讯云免费证书 + Nginx）

```sh
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo apt install -y nginx
```

- 腾讯云控制台申请 **comment.shuzidiantang.com** 免费 DV 证书（Nginx 版），上传到 `/etc/nginx/ssl/`。
- 站点配置 `/etc/nginx/sites-available/twikoo.conf`：

```nginx
server {
  listen 80;
  server_name comment.shuzidiantang.com;
  return 301 https://$host$request_uri;
}
server {
  listen 443 ssl;
  server_name comment.shuzidiantang.com;
  ssl_certificate     /etc/nginx/ssl/comment.shuzidiantang.com_bundle.pem;
  ssl_certificate_key /etc/nginx/ssl/comment.shuzidiantang.com.key;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 10m;
  }
}
```

```sh
sudo ln -s /etc/nginx/sites-available/twikoo.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

- 备选：Caddy 自动签发 Let's Encrypt 证书（免手动证书）。

### 4. 初始化管理面板

1. 浏览器访问 `https://comment.shuzidiantang.com/`（即管理面板）→ 首次进入设置**管理员密码**与**暗号**（暗号仅用于向游客隐藏管理入口，勿与密码相同）。
2. 开启**人工审核模式**（评论先审后发——个人备案站 UGC 合规关键）。
3. 反垃圾二选一：Akismet Personal 免费 key，或腾讯云内容安全（已有腾讯云账号）。
4. 图片上传：私有部署无云存储，初期在管理面板**关闭图片上传**（二期可配图床）。

### 5. 前端接入（本仓库，方案 A：assemble 自动注入）

- `scripts/assemble.mjs` 顶部加常量 `TWIKOO_ENV = 'https://comment.shuzidiantang.com'`；
  复制 notes 后对 `dist/notes/*.html` 做标记替换（沿用 `AUTO:` 注释标记机制）：
  `<!-- AUTO:TWIKOO -->` → 评论块 + 脚本（无标记的文件跳过）。
- 注入片段（私有部署用 **twikoo.min.js**，非 all 版）：

```html
<!-- AUTO:TWIKOO -->
<section class="note-comments">
  <h2>留言</h2>
  <div id="tcomment"></div>
</section>
<script src="https://cdn.jsdelivr.net/npm/twikoo@1.7.19/dist/twikoo.min.js"></script>
<script>
twikoo.init({
  envId: 'https://comment.shuzidiantang.com', // 私有部署 envId = 完整 HTTPS 地址
  el: '#tcomment',
  path: location.pathname, // 按文章路径隔离评论区
  lang: 'zh-CN'
});
</script>
<!-- /AUTO:TWIKOO -->
```

- CDN 备选（jsdelivr 国内不稳时）：`https://registry.npmmirror.com/twikoo/1.7.19/files/dist/twikoo.min.js`
- `vault/notes-template.html` 与已发布文章在「← 返回手记」链接**之前**加 `<!-- AUTO:TWIKOO -->` 标记（只放标记，脚本由 assemble 统一注入，避免 envId 散落）。
- 样式：`assets/style.css` 加 `.note-comments`（深底亮字，与比特辉光主题一致）。
- 验证后 push → CI 自动上线。评论数展示在首页/列表页属二期可选，不做。

### 6. 验收与运维

- 验收：匿名发一条测试评论 → 管理面板审核通过 → 前台显示；游客看不到暗号入口；测试后清理测试数据。
- 备份 cron（每天 03:00 打包到 ~/twikoo-backup/，保留 14 份）：

```cron
0 3 * * * mkdir -p $HOME/twikoo-backup && tar czf $HOME/twikoo-backup/twikoo-data-$(date +\%F).tgz $HOME/twikoo/data && find $HOME/twikoo-backup -name '*.tgz' -mtime +14 -delete
```

- 若未来不想自建运维：Twikoo 支持从私有部署导出数据，可迁 Vercel/Netlify 免费部署（海外访问）。

## 合规要点

- 个人备案站开放评论 = UGC，必须：**人工审核模式（先审后发）** + IP 限流 + 反垃圾；评论框旁可加小字"留言经审核后显示"。
- 公安备案（ICP 通过后 30 天内）一并覆盖评论区。
