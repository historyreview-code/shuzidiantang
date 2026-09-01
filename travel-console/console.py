#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""旅行控制台 — 旅行内容生产链本地管理面板

扫描磁盘上的行程工作区（含 trip.yaml 的目录）与媒体产物，
按「规划→测算→地图→动画→视频→图文」显示进度，
可一键调用 trip-planner / travel-journal-video 的脚本。

只依赖 Python3 标准库（PyYAML 可选，缺失时降级为文本启发式解析）。
默认只监听 127.0.0.1，文件服务仅限配置的扫描根目录内。

用法: python3 console.py [--port 8740] [--no-browser]
"""
import argparse
import json
import os
import re
import subprocess
import sys
import threading
import time
import uuid
import webbrowser
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

BASE = Path(__file__).resolve().parent
STATIC = BASE / "static"
CONFIG_PATH = BASE / "config.json"
JOB_DIR = BASE / ".jobs"

try:
    import yaml  # noqa: F401
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

# ---------------------------------------------------------------- config

DEFAULT_CONFIG = {
    "port": 8740,
    "roots": ["~/ZCodeProject/_travel_demo"],
    "skills_dir": "~/.agents/skills",
}


def load_config():
    cfg = dict(DEFAULT_CONFIG)
    if CONFIG_PATH.exists():
        try:
            cfg.update(json.loads(CONFIG_PATH.read_text("utf-8")))
        except Exception as e:
            print(f"[warn] config.json 解析失败，用默认配置: {e}")
    return cfg


def save_config(cfg):
    CONFIG_PATH.write_text(
        json.dumps(cfg, ensure_ascii=False, indent=2), "utf-8")


def expand(p):
    return str(Path(p).expanduser().resolve())


def _is_within(path: Path, bases):
    """path 是否位于任一 base 之内（或就是 base 本身）。"""
    for b in bases:
        try:
            path.relative_to(b)
            return True
        except ValueError:
            continue
    return False


# ---------------------------------------------------------------- scanner

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv",
             ".jobs", "Library", "Pictures Photos Library"}
SKIP_FILES = {".DS_Store"}

MEDIA_SUFFIXES = {".mp4", ".gif", ".png", ".jpg", ".jpeg", ".webp",
                  ".html", ".svg", ".md", ".xlsx", ".json", ".wav", ".mp3",
                  ".yaml", ".yml"}

# 素材浏览：照片/视频后缀（browse 端点统计每个文件夹里的素材数）
ASSET_SUFFIXES = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".gif",
                  ".mp4", ".mov", ".webm", ".avi"}


def looks_like_trip_yaml(path: Path):
    """trip.yaml 判定：同时含 stops: 和 legs: 两个顶级键。"""
    try:
        text = path.read_text("utf-8")
    except Exception:
        return None
    if not re.search(r"^stops\s*:", text, re.M) or \
       not re.search(r"^legs\s*:", text, re.M):
        return None
    info = {"path": str(path), "stem": path.stem, "title": "", "dates": "",
            "days": "", "stops": 0, "map_style": "", "routed": False}
    if HAS_YAML:
        try:
            data = yaml.safe_load(text) or {}
            meta = data.get("meta") or {}
            info["title"] = str(data.get("title") or "")
            info["dates"] = str(meta.get("dates") or "")
            info["days"] = meta.get("days") or ""
            info["stops"] = len(data.get("stops") or [])
            info["map_style"] = str(data.get("map_style") or "")
            legs = data.get("legs") or []
            info["routed"] = bool(legs) and all(
                isinstance(l, dict) and l.get("distance_km")
                for l in legs if isinstance(l, dict))
            return info
        except Exception:
            pass
    # 降级：正则抓关键字段
    m = re.search(r"^title:\s*(.+)$", text, re.M)
    if m:
        info["title"] = m.group(1).strip().strip("'\"")
    m = re.search(r"dates:\s*(.+)", text)
    if m:
        info["dates"] = m.group(1).strip()
    m = re.search(r"days:\s*(\d+)", text)
    if m:
        info["days"] = int(m.group(1))
    info["stops"] = len(re.findall(r"^- name:", text, re.M))
    info["routed"] = bool(re.search(r"distance_km:", text))
    return info


def classify(path: Path):
    """产物分类，返回 kind 或 None。"""
    n = path.name
    parent = path.parent.name
    low = n.lower()
    if re.search(r"-map-(svg|folium)\.html$", low) or low.endswith("-map-watercolor.png"):
        return "map"
    if re.search(r"-itinerary\.html$", low):
        return "itinerary"
    if re.search(r"-xhs-cover\.png$", low):
        return "cover"
    if re.search(r"-animation(-watercolor)?\.(mp4|gif)$", low):
        return "animation"
    if n == "图文正文.md" or parent == "xhs_post":
        return "xhs"
    if low.endswith(".mp4") and parent not in ("xhs_post",):
        return "video"          # 成片/视频笔记（animation 已在上面排除）
    if n.startswith("_map_") and low.endswith(".png"):
        return "map"
    if low.endswith((".png", ".jpg", ".jpeg", ".webp")):
        return "image"
    if low.endswith(".gif"):
        return "animation"
    if low.endswith((".html", ".svg")):
        return "doc"
    if low.endswith(".md"):
        return "doc"
    return None


def walk(root: Path, max_depth=4):
    root = Path(expand(root))
    if not root.is_dir():
        return
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames
                       if d not in SKIP_DIRS and not d.startswith(".")]
        depth = Path(dirpath).relative_to(root).parts.__len__()
        if depth >= max_depth:
            dirnames[:] = []
        for fn in filenames:
            if fn in SKIP_FILES:
                continue
            p = Path(dirpath) / fn
            if p.suffix.lower() not in MEDIA_SUFFIXES:
                continue
            yield p


def scan(cfg):
    roots = [Path(expand(r)) for r in cfg["roots"] if Path(expand(r)).is_dir()]
    root_strs = [str(r) for r in roots]

    trips = {}      # dir -> trip dict
    unfiled = {"animation": [], "video": [], "map": [], "image": [],
               "doc": [], "xhs": [], "itinerary": [], "cover": []}

    def in_any_trip(p: Path):
        for d in trips:
            try:
                p.relative_to(d)
                return True
            except ValueError:
                continue
        return False

    def rel(p: Path):
        for r in roots:
            try:
                return str(p.relative_to(r))
            except ValueError:
                continue
        return str(p)

    # 第一遍：找 trip.yaml，登记行程工作区
    for root in roots:
        for p in walk(root):
            if p.suffix.lower() in (".yaml", ".yml"):
                info = looks_like_trip_yaml(p)
                if not info:
                    continue
                d = p.parent.resolve()
                t = trips.setdefault(d, {
                    "id": str(d), "dir": str(d), "yamls": [],
                    "files": {k: [] for k in
                              ("map", "animation", "video", "xhs", "image",
                               "doc", "itinerary", "cover")},
                })
                t["yamls"].append(info)

    # 第二遍：归属产物
    for root in roots:
        for p in walk(root):
            kind = classify(p)
            if not kind:
                continue
            entry = {"path": str(p), "name": p.name, "rel": rel(p),
                     "size": p.stat().st_size,
                     "mtime": int(p.stat().st_mtime)}
            # 归属产物: 嵌套行程时取"最深"的包含目录(子行程不因父行程在前而被抢走)
            owner = None
            for d in trips:
                try:
                    p.relative_to(d)
                except ValueError:
                    continue
                if owner is None or len(d.parts) > len(owner.parts):
                    owner = d
            if owner is not None:
                trips[owner]["files"][kind].append(entry)
            elif len(unfiled.get(kind, [])) < 300:
                unfiled.setdefault(kind, []).append(entry)

    # 素材目录探测（出视频笔记时预填）
    mat_re = re.compile(r"(素材|照片|相册|材料|photo|media|image|img)", re.I)
    skip_names = {"journal_work", "frames_seq", "xhs_post", "output",
                  "output_quality_check"}
    for d, t in trips.items():
        found = []
        try:
            for sub in sorted(Path(d).iterdir()):
                if not sub.is_dir() or sub.name.startswith(".") \
                        or sub.name in SKIP_DIRS or sub.name in skip_names:
                    continue
                if mat_re.search(sub.name):
                    found.append(str(sub))
                else:  # 再看一层（如 高加索/9月素材）
                    for sub2 in sorted(sub.iterdir()):
                        if sub2.is_dir() and mat_re.search(sub2.name) \
                                and sub2.name not in skip_names:
                            found.append(str(sub2))
        except PermissionError:
            pass
        t["material_dirs"] = found[:6]

    # 汇总行程
    out = []
    for d, t in trips.items():
        t["yamls"].sort(key=lambda y: (y["stem"].endswith("_hd"), y["stem"]))
        y0 = t["yamls"][0]
        t["name"] = y0["title"] or d.name
        t["dates"] = y0["dates"]
        t["days"] = y0["days"]
        t["stops"] = y0["stops"]
        mt = max([f["mtime"] for k in t["files"] for f in t["files"][k]]
                 + [int(d.stat().st_mtime)] + [0])
        t["mtime"] = mt
        t["stages"] = {
            "plan": True,
            "route": y0["routed"],
            "map": bool(t["files"]["map"]),
            "animate": bool(t["files"]["animation"]),
            "video": bool(t["files"]["video"]),
            "xhs": bool(t["files"]["xhs"]),
        }
        out.append(t)
    out.sort(key=lambda t: -t["mtime"])
    for k in unfiled:
        unfiled[k].sort(key=lambda f: -f["mtime"])
    return {"trips": out, "unfiled": unfiled, "has_yaml": HAS_YAML}


# ---------------------------------------------------------------- jobs

JOBS = {}
JOB_LOCK = threading.Lock()


def job_env():
    """清掉失效代理（历史坑：死代理劫持 OSRM/网络请求）。"""
    env = dict(os.environ)
    for k in ("http_proxy", "https_proxy", "all_proxy",
              "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY"):
        env.pop(k, None)
    env["NO_PROXY"] = "*"
    env["PYTHONUNBUFFERED"] = "1"
    return env


def start_job(cmd, cwd, label):
    jid = uuid.uuid4().hex[:8]
    JOB_DIR.mkdir(exist_ok=True)
    log_path = JOB_DIR / f"{jid}.log"
    job = {
        "id": jid, "label": label, "cmd": cmd, "cwd": str(cwd),
        "status": "running", "exit_code": None,
        "started": time.time(), "finished": None,
        "log": deque(maxlen=800), "log_path": str(log_path),
    }
    JOBS[jid] = job

    def run():
        try:
            with open(log_path, "w", encoding="utf-8") as lf:
                lf.write("# " + " ".join(cmd) + "\n")
                lf.flush()
                proc = subprocess.Popen(
                    cmd, cwd=str(cwd), env=job_env(),
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    text=True, bufsize=1)
                job["proc"] = proc
                for line in proc.stdout:
                    line = line.rstrip("\n")
                    job["log"].append(line)
                    lf.write(line + "\n")
                    lf.flush()
                job["exit_code"] = proc.wait()
                job["status"] = "done" if job["exit_code"] == 0 else "failed"
        except FileNotFoundError as e:
            job["log"].append(f"[启动失败] {e}")
            job["status"] = "failed"
        except Exception as e:
            job["log"].append(f"[异常] {e}")
            job["status"] = "failed"
        finally:
            job["finished"] = time.time()
            job.pop("proc", None)

    threading.Thread(target=run, daemon=True).start()
    return jid


def job_summary(job):
    return {k: job[k] for k in
            ("id", "label", "cmd", "cwd", "status", "exit_code",
             "started", "finished")}


def job_detail(job):
    d = job_summary(job)
    d["log"] = list(job["log"])[-300:]
    return d


# ---------------------------------------------------------------- actions

ENGINE_ACTIONS = {
    "route":      ("测算道路", lambda y, trip_dir, cfg: [py(), engine(cfg), "route", y]),
    "map":        ("生成地图", lambda y, trip_dir, cfg: [py(), engine(cfg), "map", y, "-m", "both"]),
    "animate":    ("驾车动画", lambda y, trip_dir, cfg: [py(), engine(cfg), "animate", y]),
    "itinerary":  ("行程卡片", lambda y, trip_dir, cfg: [py(), engine(cfg), "itinerary", y]),
    "cover":      ("小红书封面", lambda y, trip_dir, cfg: [py(), engine(cfg), "cover", y]),
    "watercolor": ("水彩地图", lambda y, trip_dir, cfg: [py(), engine(cfg), "map", y, "-m", "watercolor"]),
    "animate_watercolor": ("水彩动画", lambda y, trip_dir, cfg: [py(), engine(cfg), "animate", y, "--style", "watercolor"]),
}


def py():
    return sys.executable or "python3"


def engine(cfg):
    return str(Path(expand(cfg["skills_dir"])) / "trip-planner" / "scripts" / "engine.py")


def journal_py(cfg):
    return str(Path(expand(cfg["skills_dir"])) / "travel-journal-video" / "scripts" / "journal.py")


def xhs_py(cfg):
    return str(Path(expand(cfg["skills_dir"])) / "travel-journal-video" / "scripts" / "xhs_post.py")


def find_journal_assets(trip_dir: Path):
    """在行程目录里找 journal 产物：storyboard.json + frames_seq/。"""
    sb = frames = None
    for cand in trip_dir.rglob("storyboard.json"):
        sb = str(cand)
        break
    for cand in trip_dir.rglob("frames_seq"):
        if cand.is_dir():
            frames = str(cand)
            break
    return sb, frames


# ---------------------------------------------------------------- http

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
    ".mp4": "video/mp4", ".md": "text/plain; charset=utf-8",
    ".yaml": "text/plain; charset=utf-8", ".yml": "text/plain; charset=utf-8",
    ".xlsx": "application/octet-stream",
}


class Handler(BaseHTTPRequestHandler):
    server_version = "TravelConsole/1.0"
    cfg = None

    # ---- helpers
    def log_message(self, fmt, *args):
        pass  # 静默访问日志

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_bytes(self, body, ctype, code=200, rng=None, total=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        if rng is not None:
            self.send_header("Content-Range",
                             f"bytes {rng[0]}-{rng[1]}/{total}")
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(rng[1] - rng[0] + 1))
        else:
            self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return {}

    def safe_file(self, raw):
        """只允许访问扫描根目录内的文件。"""
        if not raw:
            return None
        p = Path(unquote(raw)).resolve()
        for r in self.cfg["roots"]:
            rp = Path(expand(r))
            try:
                p.relative_to(rp)
                return p if p.is_file() else None
            except ValueError:
                continue
        return None

    def browse_dir(self, raw):
        """素材目录浏览的边界: 家目录与扫描根之内的目录(含根本身)。
        返回 (path, bases) 或 (None, None)。"""
        bases = []
        home = Path.home()
        if home.is_dir():
            bases.append(home)
        for r in self.cfg["roots"]:
            rp = Path(expand(r))
            if rp.is_dir() and rp not in bases:
                bases.append(rp)
        p = Path(unquote(raw or "~")).expanduser().resolve()
        for b in bases:
            try:
                p.relative_to(b)
                if p.is_dir():
                    return p, bases
            except ValueError:
                continue
        return None, bases

    # ---- GET
    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/" or u.path == "/index.html":
            f = STATIC / "index.html"
            self.send_bytes(f.read_bytes(), "text/html; charset=utf-8")
            return
        if u.path.startswith("/static/"):
            f = (STATIC / u.path[len("/static/"):]).resolve()
            try:
                f.relative_to(STATIC.resolve())
            except ValueError:
                self.send_json({"error": "forbidden"}, 403)
                return
            if f.is_file():
                self.send_bytes(f.read_bytes(),
                                CONTENT_TYPES.get(f.suffix.lower(),
                                                  "application/octet-stream"))
            else:
                self.send_json({"error": "not found"}, 404)
            return
        if u.path == "/api/state":
            state = scan(self.cfg)
            with JOB_LOCK:
                jobs = sorted(JOBS.values(),
                              key=lambda j: -j["started"])
            state["jobs"] = [job_summary(j) for j in jobs[:30]]
            state["config"] = {"roots": self.cfg["roots"],
                               "skills_dir": self.cfg["skills_dir"],
                               "port": self.cfg["port"]}
            self.send_json(state)
            return
        m = re.match(r"^/api/job/([0-9a-f]+)$", u.path)
        if m:
            job = JOBS.get(m.group(1))
            self.send_json(job_detail(job) if job else {"error": "not found"},
                           200 if job else 404)
            return
        if u.path == "/api/browse":
            q = parse_qs(u.query)
            p, bases = self.browse_dir(q.get("p", [""])[0])
            if p is None:
                self.send_json({"error": "目录不可访问（仅限家目录/扫描根内）"}, 403)
                return
            parent = str(p.parent) if _is_within(p.parent, bases) else None
            entries = []
            try:
                subs = sorted(p.iterdir(), key=lambda s: s.name.lower())
            except PermissionError:
                subs = []
            for sub in subs:
                if not sub.is_dir() or sub.name.startswith(".") \
                        or sub.name in SKIP_DIRS:
                    continue
                n_media = 0
                try:
                    for f in sub.iterdir():
                        if f.is_file() and f.suffix.lower() in ASSET_SUFFIXES:
                            n_media += 1
                except (PermissionError, NotADirectoryError):
                    pass
                entries.append({"name": sub.name, "path": str(sub),
                                "media": n_media})
                if len(entries) >= 300:
                    break
            try:
                media_here = sum(1 for f in p.iterdir()
                                 if f.is_file()
                                 and f.suffix.lower() in ASSET_SUFFIXES)
            except PermissionError:
                media_here = 0
            self.send_json({"path": str(p), "parent": parent,
                            "media_here": media_here, "entries": entries})
            return
        if u.path == "/file":
            q = parse_qs(u.query)
            p = self.safe_file(q.get("p", [""])[0])
            if not p:
                self.send_json({"error": "forbidden"}, 403)
                return
            ctype = CONTENT_TYPES.get(p.suffix.lower(),
                                      "application/octet-stream")
            total = p.stat().st_size
            rng_hdr = self.headers.get("Range")
            data = p.read_bytes()
            if rng_hdr and (mm := re.match(r"bytes=(\d+)-(\d*)", rng_hdr)):
                s = int(mm.group(1))
                e = int(mm.group(2)) if mm.group(2) else total - 1
                e = min(e, total - 1)
                if ctype.startswith("text/"):
                    self.send_bytes(data, ctype)
                else:
                    self.send_bytes(data[s:e + 1], ctype, 206, (s, e), total)
            else:
                self.send_bytes(data, ctype)
            return
        self.send_json({"error": "not found"}, 404)

    # ---- POST
    def do_POST(self):
        u = urlparse(self.path)
        body = self.read_body()
        if u.path == "/api/run":
            resp = self.handle_run(body)
            self.send_json(resp[0], resp[1])
            return
        if u.path == "/api/roots":
            if body.get("add"):
                p = Path(body["add"]).expanduser()
                if not p.is_dir():
                    self.send_json({"error": f"目录不存在: {p}"}, 400)
                    return
                if expand(p) not in [expand(r) for r in self.cfg["roots"]]:
                    self.cfg["roots"].append(str(p))
                    save_config(self.cfg)
            if body.get("remove"):
                self.cfg["roots"] = [
                    r for r in self.cfg["roots"] if expand(r) != expand(body["remove"])]
                save_config(self.cfg)
            self.send_json({"ok": True, "roots": self.cfg["roots"]})
            return
        if u.path == "/api/reveal":
            p = body.get("path", "")
            target = self.safe_file(p) or Path(unquote(p)).resolve()
            subprocess.Popen(["open", "-R", str(target)])
            self.send_json({"ok": True})
            return
        m = re.match(r"^/api/job/([0-9a-f]+)/stop$", u.path)
        if m:
            job = JOBS.get(m.group(1))
            if job and job["status"] == "running":
                proc = job.get("proc")
                if proc:
                    proc.terminate()
                job["log"].append("[控制台] 已发送终止信号")
                self.send_json({"ok": True})
            else:
                self.send_json({"error": "not running"}, 400)
            return
        self.send_json({"error": "not found"}, 404)

    def handle_run(self, body):
        trip_id = body.get("trip_id", "")
        action = body.get("action", "")
        cfg = self.cfg
        trip = next((t for t in scan(cfg)["trips"] if t["id"] == trip_id), None)
        if not trip:
            return {"error": "行程不存在（可能刚移动过，刷新试试）"}, 400
        trip_dir = Path(trip["id"])
        yaml_path = body.get("yaml") or trip["yamls"][0]["path"]
        if expand(yaml_path) not in [expand(y["path"]) for y in trip["yamls"]]:
            return {"error": "yaml 不属于该行程"}, 400
        y = str(Path(expand(yaml_path)))

        if action in ENGINE_ACTIONS:
            label, build = ENGINE_ACTIONS[action]
            cmd = build(y, trip_dir, cfg)
            jid = start_job(cmd, trip_dir, f"{label} · {trip['name']}")
            return {"ok": True, "job": jid}, 200

        if action == "journal":
            inp = body.get("input", "")
            if not inp or not Path(expand(inp)).is_dir():
                return {"error": "需要有效的素材目录（照片/视频所在文件夹）"}, 400
            out = f"{Path(y).stem}-成片.mp4"
            cmd = [py(), journal_py(cfg),
                   "--input", str(Path(expand(inp))), "--trip", y,
                   "-o", out, "-w", "journal_work"]
            jid = start_job(cmd, trip_dir, f"视频笔记 · {trip['name']}")
            return {"ok": True, "job": jid}, 200

        if action == "xhs":
            sb, frames = find_journal_assets(trip_dir)
            if not (sb and frames):
                return {"error": "未找到 storyboard.json + frames_seq/"
                        "（先跑视频笔记的前几步）"}, 400
            cmd = [py(), xhs_py(cfg), "--frames", frames,
                   "--storyboard", sb, "-w", "journal_work"]
            jid = start_job(cmd, trip_dir, f"图文笔记 · {trip['name']}")
            return {"ok": True, "job": jid}, 200

        return {"error": f"未知操作: {action}"}, 400


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="旅行控制台")
    ap.add_argument("--port", type=int, default=None)
    ap.add_argument("--no-browser", action="store_true")
    args = ap.parse_args()

    cfg = load_config()
    if not CONFIG_PATH.exists():
        save_config(cfg)
    if args.port:
        cfg["port"] = args.port
    Handler.cfg = cfg

    srv = ThreadingHTTPServer(("127.0.0.1", cfg["port"]), Handler)
    url = f"http://127.0.0.1:{cfg['port']}"
    print(f"🧭 旅行控制台已启动: {url}")
    print(f"   扫描根目录: {', '.join(expand(r) for r in cfg['roots'])}")
    if not HAS_YAML:
        print("   [提示] 未装 PyYAML，trip.yaml 用降级解析（pip3 install pyyaml 可补）")
    if not args.no_browser:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n再见")


if __name__ == "__main__":
    main()
