/* 旅行控制台 前端逻辑 — 无依赖原生 JS */
"use strict";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const STAGES = [
  ["plan", "规划"], ["route", "测算"], ["map", "地图"],
  ["animate", "动画"], ["video", "视频"], ["xhs", "图文"],
];

const KIND_META = {
  map: { icon: "🗺️", name: "地图" },
  animation: { icon: "🚗", name: "驾车动画" },
  video: { icon: "🎬", name: "视频成片" },
  xhs: { icon: "📕", name: "图文笔记" },
  itinerary: { icon: "📋", name: "行程卡片" },
  cover: { icon: "🖼️", name: "封面" },
  image: { icon: "📷", name: "图片" },
  doc: { icon: "📄", name: "文档" },
};

const ENGINE_ACTIONS = [
  ["route", "测算道路"], ["map", "生成地图"], ["animate", "驾车动画"],
  ["itinerary", "行程卡片"], ["cover", "小红书封面"], ["watercolor", "水彩地图"],
  ["animate_watercolor", "水彩动画"],
];

let STATE = null;
let stateTimer = null;
let jobTimer = null;
let currentTripYaml = {};   // tripId -> 选中的 yaml path

/* ---------------- 工具 ---------------- */
async function api(path, opts) {
  const r = await fetch(path, opts && {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

function toast(msg, isErr) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = isErr ? "err" : "";
  t.hidden = false;
  clearTimeout(t._h);
  t._h = setTimeout(() => (t.hidden = true), isErr ? 5000 : 2600);
}

function fmtSize(n) {
  if (n > 1e9) return (n / 1e9).toFixed(1) + " GB";
  if (n > 1e6) return (n / 1e6).toFixed(1) + " MB";
  if (n > 1e3) return (n / 1e3).toFixed(0) + " KB";
  return n + " B";
}

function fmtTime(ts) {
  const d = new Date(ts * 1000);
  const now = Date.now() / 1000;
  if (now - ts < 60) return "刚刚";
  if (now - ts < 86400) return Math.floor((now - ts) / 3600) + " 小时前";
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const fileUrl = (p) => "/file?p=" + encodeURIComponent(p);
const ext = (p) => p.split(".").pop().toLowerCase();
const isImg = (p) => ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext(p));
const isVideo = (p) => ["mp4", "mov", "webm", "gif"].includes(ext(p)) && ext(p) !== "gif";

/* ---------------- 状态加载 ---------------- */
async function refresh(silent) {
  try {
    STATE = await api("/api/state");
    if (!silent) toast("已重新扫描");
    render();
  } catch (e) {
    toast("控制台服务未响应，请检查 console.py 是否在运行", true);
  }
}

function render() {
  renderTrips();
  renderMedia();
  renderJobs();
  renderSettings();
  updateRunningBar();
}

/* ---------------- 行程库 ---------------- */
function renderTrips() {
  const wrap = $("#tripList");
  wrap.innerHTML = "";
  const trips = STATE.trips || [];
  $("#tripEmpty").hidden = trips.length > 0;
  $("#subtitle").textContent = trips.length
    ? `${trips.length} 条行程 · 规划 → 地图 → 动画 → 视频 → 图文`
    : "规划 → 地图 → 动画 → 视频 → 图文";

  for (const t of trips) {
    const card = document.createElement("div");
    card.className = "card trip";
    card.innerHTML = `
      <div class="trip-head">
        <div>
          <h2>${esc(t.name)}</h2>
          <div class="trip-meta">
            ${t.dates ? `📅 ${esc(t.dates)} · ` : ""}
            ${t.days ? `<b>${t.days}</b> 天 · ` : ""}<b>${t.stops}</b> 站
            <span class="dir">　${esc(t.dir)}</span>
          </div>
        </div>
        <div style="text-align:right;color:var(--ink-2);font-size:12px">
          ${fmtTime(t.mtime)}<br>${countFiles(t)} 个产物
        </div>
      </div>
      <div class="stages">${STAGES.map(([k, label]) =>
        `<span class="stage ${t.stages[k] ? "done" : ""}">${label}</span>`).join("")}
      </div>
      ${yamlPicker(t)}
      <div class="actions">
        ${ENGINE_ACTIONS.map(([a, label]) =>
          `<button class="btn" data-act="${a}">${label}</button>`).join("")}
        <button class="btn primary" data-act="journal">🎬 出视频笔记</button>
        <button class="btn" data-act="xhs">📕 出图文笔记</button>
      </div>
      <div class="files">${fileChips(t)}</div>
      <div class="media-fold" hidden><div class="media-grid">${thumbs(t)}</div></div>
      <div class="row"><button class="btn small toggle-media">▾ 展开媒体</button></div>
    `;
    wireTrip(card, t);
    wrap.appendChild(card);
  }
}

function countFiles(t) {
  return Object.values(t.files).reduce((s, a) => s + a.length, 0);
}

function yamlPicker(t) {
  if (t.yamls.length <= 1) return "";
  const cur = currentTripYaml[t.id] || t.yamls[0].path;
  return `<div class="yaml-pick">目标 yaml:
    <select data-yaml>
      ${t.yamls.map(y =>
        `<option value="${esc(y.path)}" ${y.path === cur ? "selected" : ""}>
          ${esc(y.stem)}${y.map_style ? `（${esc(y.map_style)}）` : ""}</option>`).join("")}
    </select></div>`;
}

function fileChips(t) {
  const out = [];
  for (const [kind, files] of Object.entries(t.files)) {
    for (const f of files.slice(0, 6)) {
      out.push(`<span class="file-link" data-path="${esc(f.path)}">
        ${KIND_META[kind]?.icon || "📄"} ${esc(f.name)} · ${fmtSize(f.size)}</span>`);
    }
    if (files.length > 6)
      out.push(`<span class="file-link" style="cursor:default">…还有 ${files.length - 6} 个</span>`);
  }
  return out.join("");
}

function thumbs(t) {
  const out = [];
  for (const [kind, files] of Object.entries(t.files)) {
    for (const f of files) {
      const inner = isImg(f.path)
        ? `<img src="${fileUrl(f.path)}" loading="lazy">`
        : `<span>${KIND_META[kind]?.icon || "📄"}</span>`;
      out.push(`<div class="thumb" data-path="${esc(f.path)}">${inner}
        <span class="tag">${esc(f.name)}</span></div>`);
    }
  }
  return out.join("");
}

function wireTrip(card, t) {
  const yamlSel = $("[data-yaml]", card);
  if (yamlSel) yamlSel.onchange = () => (currentTripYaml[t.id] = yamlSel.value);

  $$(".btn[data-act]", card).forEach(btn => {
    btn.onclick = () => runAction(t, btn.dataset.act, card);
  });

  $$(".file-link[data-path]", card).forEach(el => {
    el.onclick = () => previewFile(el.dataset.path, el.textContent.trim());
  });
  $$(".thumb", card).forEach(el => {
    el.onclick = () => previewFile(el.dataset.path);
  });

  const fold = $(".media-fold", card);
  const tg = $(".toggle-media", card);
  tg.onclick = () => {
    fold.hidden = !fold.hidden;
    tg.textContent = fold.hidden ? "▾ 展开媒体" : "▴ 收起媒体";
  };
}

async function runAction(t, action, card) {
  const yaml = currentTripYaml[t.id] || t.yamls[0].path;
  if (action === "journal") {
    openJournalModal(t, yaml);
    return;
  }
  try {
    const r = await api("/api/run", { trip_id: t.id, yaml, action });
    toast(`已启动：${t.name}`);
    pollJobsSoon();
    updateRunningBar();
  } catch (e) {
    toast(e.message, true);
  }
}

/* ---------------- 出视频：素材目录弹窗 ---------------- */
function openJournalModal(t, yaml) {
  const m = $("#inputModal");
  const box = $("#detectedDirs");
  const inp = $("#journalInput");
  box.innerHTML = "";
  const dirs = t.material_dirs || [];
  if (dirs.length) {
    box.innerHTML = `<p class="hint">在行程目录里发现：</p>` + dirs.map(d =>
      `<button class="btn" data-dir="${esc(d)}">📂 ${esc(d)}</button>`).join("");
    $$("button[data-dir]", box).forEach(b =>
      b.onclick = () => (inp.value = b.dataset.dir));
    inp.value = dirs[0];
  } else {
    inp.value = "";
  }
  $("#browseBtn").onclick = () => openFolderBrowser(t.dir, inp);
  $("#journalGo").onclick = async () => {
    try {
      await api("/api/run", {
        trip_id: t.id, yaml, action: "journal", input: inp.value.trim(),
      });
      m.hidden = true;
      toast("视频笔记流水线已启动，切到「任务」看进度");
      pollJobsSoon();
      updateRunningBar();
    } catch (e) {
      toast(e.message, true);
    }
  };
  $("#journalCancel").onclick = () => (m.hidden = true);
  m.hidden = false;
  inp.focus();
}

/* ---------------- 文件夹浏览器 ---------------- */
let folderPath = null;
let folderPickTarget = null;

async function openFolderBrowser(startPath, inputEl) {
  folderPickTarget = inputEl;
  $("#folderModal").hidden = false;
  await loadFolder(startPath || "~");
}

async function loadFolder(p) {
  const list = $("#folderList");
  const crumb = $("#folderCrumb");
  list.innerHTML = `<p class="hint">读取中…</p>`;
  try {
    const d = await api(`/api/browse?p=${encodeURIComponent(p)}`);
    folderPath = d.path;
    const parts = d.path.split("/").filter(Boolean);
    let acc = "";
    crumb.innerHTML = parts.map(seg => {
      acc += "/" + seg;
      const cls = acc === d.path ? "cur" : "";
      return `<span data-path="${esc(acc)}" class="${cls}">${esc(seg)}</span>`;
    }).join(`<span class="sep">›</span>`);
    $$("span[data-path]", crumb).forEach(s =>
      s.onclick = () => loadFolder(s.dataset.path));

    let html = "";
    if (d.media_here)
      html += `<p class="hint">✅ 当前文件夹内有 ${d.media_here} 个照片/视频，可以直接选用。</p>`;
    if (!d.entries.length)
      html += `<p class="hint">（没有子文件夹）</p>`;
    else
      html += d.entries.map(e => `
        <div class="folder-item" data-path="${esc(e.path)}">
          <span>📂 ${esc(e.name)}</span>
          ${e.media ? `<span class="badge">📷 ${e.media}</span>` : ""}
        </div>`).join("");
    list.innerHTML = html;
    $$(".folder-item", list).forEach(el =>
      el.onclick = () => loadFolder(el.dataset.path));
  } catch (e) {
    list.innerHTML = `<p class="hint">${esc(e.message)}</p>`;
  }
}

function initFolderBrowser() {
  $("#folderClose").onclick = $("#folderCancel").onclick = () =>
    ($("#folderModal").hidden = true);
  $("#folderPick").onclick = () => {
    if (folderPickTarget && folderPath) folderPickTarget.value = folderPath;
    $("#folderModal").hidden = true;
  };
}

/* ---------------- 媒体库 ---------------- */
function renderMedia() {
  const wrap = $("#mediaList");
  const u = STATE.unfiled || {};
  let any = false;
  wrap.innerHTML = "";
  for (const [kind, files] of Object.entries(u)) {
    if (!files.length) continue;
    any = true;
    const sec = document.createElement("div");
    sec.className = "media-section";
    sec.innerHTML = `<h3>${KIND_META[kind]?.icon || "📄"} ${
      KIND_META[kind]?.name || kind} · ${files.length}</h3>
      <div class="media-grid">${files.slice(0, 60).map(f => {
        const inner = isImg(f.path)
          ? `<img src="${fileUrl(f.path)}" loading="lazy">`
          : `<span>${KIND_META[kind]?.icon || "📄"}</span>`;
        return `<div class="thumb" data-path="${esc(f.path)}" style="width:150px;height:110px">${inner}
          <span class="tag">${esc(f.name)} · ${fmtSize(f.size)}</span></div>`;
      }).join("")}</div>`;
    wrap.appendChild(sec);
    $$(".thumb", sec).forEach(el =>
      el.onclick = () => previewFile(el.dataset.path));
  }
  $("#mediaEmpty").hidden = any;
}

/* ---------------- 任务 ---------------- */
function renderJobs() {
  const wrap = $("#jobList");
  const jobs = STATE.jobs || [];
  $("#jobEmpty").hidden = jobs.length > 0;
  wrap.innerHTML = "";
  const running = jobs.filter(j => j.status === "running").length;
  const badge = $("#jobBadge");
  badge.hidden = !running;
  badge.textContent = running;

  for (const j of jobs) {
    const el = document.createElement("div");
    el.className = "job";
    el.dataset.jid = j.id;
    el.innerHTML = `
      <div class="job-head">
        <span class="job-title">${esc(j.label)}</span>
        <span style="display:flex;gap:8px;align-items:center">
          <span style="color:var(--ink-2);font-size:12px">${fmtTime(j.started)}</span>
          <span class="job-status ${j.status}">${
            j.status === "running" ? "运行中" : j.status === "done" ? "完成" : "失败"}</span>
          <button class="btn small" data-log>日志</button>
          ${j.status === "running" ? '<button class="btn small danger" data-stop>停止</button>' : ""}
        </span>
      </div>
      <div class="job-cmd">$ ${esc(j.cmd.map(esc).join(" "))}</div>
      <div class="job-log" hidden></div>
    `;
    const logBox = $(".job-log", el);
    $("[data-log]", el).onclick = async () => {
      const d = await api(`/api/job/${j.id}`);
      logBox.textContent = d.log.join("\n") || "（暂无输出）";
      logBox.hidden = !logBox.hidden;
      logBox.scrollTop = logBox.scrollHeight;
    };
    const stopBtn = $("[data-stop]", el);
    if (stopBtn)
      stopBtn.onclick = async () => {
        await api(`/api/job/${j.id}/stop`);
        toast("已发送终止信号");
        setTimeout(refreshSilent, 800);
      };
    wrap.appendChild(el);
  }
}

async function pollJobs() {
  if (!STATE) return;
  const running = (STATE.jobs || []).filter(j => j.status === "running");
  if (!running.length) return;
  const results = await Promise.allSettled(
    running.map(j => api(`/api/job/${j.id}`)));
  let finished = false;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const el = $(`.job[data-jid="${running[i].id}"] .job-log`);
      if (el && !el.hidden) {
        el.textContent = r.value.log.join("\n");
        el.scrollTop = el.scrollHeight;
      }
      if (r.value.status !== "running") finished = true;
    }
  });
  if (finished) {
    await refreshSilent();
    toast("有任务结束了，产物已更新");
  }
}

function pollJobsSoon() {
  clearInterval(jobTimer);
  jobTimer = setInterval(async () => {
    await pollJobs();
    if (!(STATE.jobs || []).some(j => j.status === "running")) {
      clearInterval(jobTimer);
      jobTimer = setInterval(pollJobs, 30000);
    }
  }, 2000);
}

function updateRunningBar() {
  const running = (STATE.jobs || []).filter(j => j.status === "running");
  $("#runningBar").hidden = !running.length;
  if (running.length)
    $("#runningText").textContent = `「${running[0].label}」运行中…`;
}

async function refreshSilent() {
  try {
    STATE = await api("/api/state");
    render();
  } catch (_) { /* 服务重启中 */ }
}

/* ---------------- 预览 ---------------- */
function previewFile(path, title) {
  const m = $("#modal");
  $("#modalTitle").textContent = title || path.split("/").pop();
  const body = $("#modalBody");
  const e = ext(path);
  if (isImg(path)) {
    body.innerHTML = `<img src="${fileUrl(path)}">`;
  } else if (isVideo(path) || e === "gif") {
    body.innerHTML = e === "gif"
      ? `<img src="${fileUrl(path)}">`
      : `<video controls autoplay src="${fileUrl(path)}"></video>`;
  } else if (e === "html") {
    body.innerHTML = `<iframe src="${fileUrl(path)}"></iframe>`;
  } else if (["md", "yaml", "yml", "json", "txt"].includes(e)) {
    fetch(fileUrl(path)).then(r => r.text()).then(txt => {
      body.innerHTML = `<pre>${esc(txt.slice(0, 50000))}</pre>`;
    });
  } else {
    body.innerHTML = `<p class="hint">该格式不支持预览，可点右上角在 Finder 中查看。</p>`;
  }
  $("#modalReveal").onclick = () => api("/api/reveal", { path });
  $("#modalNewTab").onclick = () => window.open(fileUrl(path), "_blank");
  $("#modalClose").onclick = () => (m.hidden = true);
  m.hidden = false;
}

/* ---------------- 设置 ---------------- */
function renderSettings() {
  const ul = $("#rootList");
  ul.innerHTML = (STATE.config.roots || []).map(r => `
    <li><span>${esc(r)}</span>
      <button class="btn small danger" data-rm="${esc(r)}">移除</button></li>`).join("");
  $$("[data-rm]", ul).forEach(b => b.onclick = async () => {
    await api("/api/roots", { remove: b.dataset.rm });
    await refreshSilent();
    toast("已移除，重新扫描");
  });

  const c = STATE.config;
  $("#envList").innerHTML = `
    <li><span>skills 目录</span><span>${esc(c.skills_dir)}</span></li>
    <li><span>端口</span><span>127.0.0.1:${c.port}</span></li>
    <li><span>yaml 解析</span><span>${STATE.has_yaml ? "PyYAML ✓" : "降级文本解析（建议 pip3 install pyyaml）"}</span></li>
    <li><span>配置文件</span><span>~/旅行控制台/config.json</span></li>`;
}

/* ---------------- tabs / init ---------------- */
function switchTab(name) {
  $$(".tab").forEach(s => (s.classList.toggle("active", s.id === `tab-${name}`)));
  $$("#tabs button[data-tab]").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === name));
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function init() {
  $$("#tabs button[data-tab]").forEach(b =>
    b.onclick = () => switchTab(b.dataset.tab));
  $("#refreshBtn").onclick = () => refresh(false);
  $("#addRootBtn").onclick = async () => {
    const v = $("#newRoot").value.trim();
    if (!v) return;
    try {
      await api("/api/roots", { add: v });
      $("#newRoot").value = "";
      await refreshSilent();
      toast("已添加并重新扫描");
    } catch (e) {
      toast(e.message, true);
    }
  };
  $$(".modal").forEach(m =>
    m.addEventListener("mousedown", e => {
      if (e.target === m && m.id !== "inputModal") m.hidden = true;
    }));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") $$(".modal").forEach(m => (m.hidden = true));
  });

  initFolderBrowser();
  refresh(true);
  stateTimer = setInterval(() => {
    if (document.visibilityState === "visible") refreshSilent();
  }, 15000);
  jobTimer = setInterval(pollJobs, 30000);
}

init();
