#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数字殿堂 · 手记「朋友圈分享包」生成脚本
=========================================

为 notes/ 下的每一篇公开手记：
  1. 生成专属 OG 分享图 (1200×630) → notes/og/<slug>.png（提交仓库，随站部署）
  2. 生成本地朋友圈发布包 → share/<slug>/（.gitignore 忽略，仅本地使用）
       - 朋友圈文案.txt（标准版 + 短版 + 备案期可选结尾）
       - 配图.png（与 OG 图相同）
       - 发布说明.txt（发布步骤）

依赖: Python 3 标准库 + Pillow（无网络依赖）。
运行: python3 scripts/share.py
"""

import os
import re
import shutil
import sys
from datetime import date

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# --------------------------------------------------------------------------
# 路径
# --------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
NOTES_DIR = os.path.join(ROOT, "notes")
OG_DIR = os.path.join(NOTES_DIR, "og")
SHARE_DIR = os.path.join(ROOT, "share")
SITE = "https://shuzidiantang.com"

# --------------------------------------------------------------------------
# 配色 (夜幕金殿)
# --------------------------------------------------------------------------
W, H = 1200, 630
BG_TOP = (10, 13, 24)          # #0a0d18
BG_BOTTOM = (26, 32, 56)       # #1a2038
GOLD = (216, 180, 90)          # #d8b45a
GOLD_BRIGHT = (240, 214, 138)  # #f0d68a
GOLD_DIM = (138, 116, 64)      # #8a7440
TEXT_DIM = (154, 151, 168)     # #9a97a8

# 像素 D 字模 (16 块, 与全站 favicon/logo 同款)
PIXEL_D = [
    (16, 2), (30, 2), (44, 2),
    (16, 16), (58, 16),
    (16, 30), (58, 30),
    (16, 44), (58, 44),
    (16, 58), (58, 58),
    (16, 72), (58, 72),
    (16, 86), (30, 86), (44, 86),
]

FONT_CANDIDATES = {
    "cn": [
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
    ],
    "en": [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
    ],
}
_FONT_CACHE = {}
_WARNED = set()


def _system_font_files():
    dirs = [
        "/System/Library/Fonts",
        "/Library/Fonts",
        os.path.expanduser("~/Library/Fonts"),
    ]
    for d in dirs:
        if not os.path.isdir(d):
            continue
        for root, _dirs, files in os.walk(d):
            for f in files:
                if f.lower().endswith((".ttf", ".ttc", ".otf")):
                    yield os.path.join(root, f)


def load_font(kind, size):
    key = (kind, size)
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    font = None
    for path in FONT_CANDIDATES.get(kind, []):
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, size)
                break
            except Exception:
                continue
    if font is None:
        for path in _system_font_files():
            try:
                font = ImageFont.truetype(path, size)
                break
            except Exception:
                continue
    if font is None:
        if kind not in _WARNED:
            print("[warn] 未找到可用字体 (%s)，回退 PIL 内置位图字体" % kind)
            _WARNED.add(kind)
        font = ImageFont.load_default()
    _FONT_CACHE[key] = font
    return font


def gradient_bg(w, h, top, bottom):
    strip = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / (h - 1)
        strip.putpixel((0, y), (
            int(top[0] + (bottom[0] - top[0]) * t),
            int(top[1] + (bottom[1] - top[1]) * t),
            int(top[2] + (bottom[2] - top[2]) * t),
        ))
    return strip.resize((w, h))


def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_centered(draw, text, font, fill, cx, cy):
    w, h = text_size(draw, text, font)
    bbox = draw.textbbox((0, 0), text, font=font)
    draw.text((cx - w / 2 - bbox[0], cy - h / 2 - bbox[1]), text, font=font, fill=fill)
    return w, h


def fit_font_size(draw, text, kind, start_size, max_width, min_size=28):
    size = start_size
    while size > min_size:
        font = load_font(kind, size)
        w, _h = text_size(draw, text, font)
        if w <= max_width:
            return font, size
        size -= 4
    return load_font(kind, size), size


def wrap_title(title):
    """长标题按字符数均分成两行 (每行 <= 13 字)。"""
    if len(title) <= 13:
        return [title]
    mid = len(title) // 2
    return [title[:mid], title[mid:]]


def draw_pixel_d(img, x0, y0, scale):
    """绘制金色像素 D 字标。"""
    d = ImageDraw.Draw(img)
    for (px, py) in PIXEL_D:
        d.rectangle(
            [x0 + px * scale, y0 + py * scale,
             x0 + (px + 11) * scale - 1, y0 + (py + 11) * scale - 1],
            fill=GOLD,
        )
    return 69 * scale, 95 * scale


# --------------------------------------------------------------------------
# OG 分享图渲染
# --------------------------------------------------------------------------
def render_og(title, meta_line, desc):
    img = gradient_bg(W, H, BG_TOP, BG_BOTTOM).convert("RGBA")
    draw = ImageDraw.Draw(img)

    # 金色弧光装饰 (右上 + 左下, 大半径高斯模糊)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.arc([W - 620, -330, W + 620, 420], start=200, end=330,
           fill=GOLD + (110,), width=6)
    gd.arc([-560, H - 400, 500, H + 300], start=30, end=150,
           fill=GOLD + (80,), width=4)
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    img.alpha_composite(glow)

    # 左上: 像素 logo + 品牌行
    scale = 0.62
    lw, lh = draw_pixel_d(img, 46, 40, scale)
    brand_font = load_font("cn", 27)
    bbox = draw.textbbox((0, 0), "数字殿堂 · 手记", font=brand_font)
    draw.text((46 + lw + 18 - bbox[0], 40 + lh / 2 - 14 - bbox[1]),
              "数字殿堂 · 手记", font=brand_font, fill=GOLD)
    en_font = load_font("en", 15)
    draw.text((46 + lw + 18, 40 + lh / 2 + 8), "SHUZIDIANTANG.COM",
              font=en_font, fill=GOLD_DIM)

    # 主标题 (金色, 柔光垫底, 自动缩字/换行)
    lines = wrap_title(title)
    n = len(lines)
    max_width = W - 160
    sizes = []
    for line in lines:
        _font, size = fit_font_size(draw, line, "cn", 92, max_width)
        sizes.append(size)
    size = min(sizes)
    font = load_font("cn", size)
    line_h = text_size(draw, "测", font)[1] + 26
    block_h = line_h * n
    cy_start = 300 - block_h / 2

    title_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tg = ImageDraw.Draw(title_glow)
    for i, line in enumerate(lines):
        w, h = text_size(tg, line, font)
        bb = tg.textbbox((0, 0), line, font=font)
        tg.text((W / 2 - w / 2 - bb[0], cy_start + i * line_h - h / 2 - bb[1]),
                line, font=font, fill=GOLD + (120,))
    title_glow = title_glow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(title_glow)

    for i, line in enumerate(lines):
        draw_centered(draw, line, font, GOLD_BRIGHT, W / 2, cy_start + i * line_h)

    # 日期 · 分类
    y_meta = cy_start + block_h + 16
    meta_font = load_font("cn", 25)
    draw_centered(draw, meta_line, meta_font, GOLD_DIM, W / 2, y_meta)

    # 摘要 (一行, 超出省略)
    if desc:
        desc_font = load_font("cn", 24)
        max_w = W - 260
        while desc_font.size > 18:
            w, _h = text_size(draw, desc, desc_font)
            if w <= max_w:
                break
            desc_font = load_font("cn", desc_font.size - 2)
        if desc_font.size <= 18:
            desc = desc[: int(len(desc) * max_w / text_size(draw, desc, desc_font)[0]) - 2] + "……"
        draw_centered(draw, desc, desc_font, TEXT_DIM, W / 2, y_meta + 56)

    # 底部品牌
    foot_font = load_font("en", 16)
    draw_centered(draw, "shuzidiantang.com/notes", foot_font, GOLD_DIM, W / 2, H - 44)

    return img


# --------------------------------------------------------------------------
# 手记解析
# --------------------------------------------------------------------------
def collect_notes():
    items = []
    for f in sorted(os.listdir(NOTES_DIR)):
        if not f.endswith(".html"):
            continue
        m = re.match(r"^(\d{4}-\d{2}-\d{2})-(.+)\.html$", f)
        if not m:
            continue
        raw = open(os.path.join(NOTES_DIR, f), encoding="utf-8").read()
        tm = re.search(r"<title>([^<]+)</title>", raw)
        title = re.sub(r"\s*·\s*数字殿堂.*$", "", tm.group(1)).strip() if tm else m.group(2)
        dm = re.search(r'<meta name="description" content="([^"]*)"', raw)
        desc = dm.group(1).strip() if dm else ""
        cm = re.search(r"分类[:：]\s*([^<]+)", raw)
        cat = cm.group(1).strip() if cm else ""
        items.append({
            "file": f,
            "stem": m.group(1) + "-" + m.group(2),
            "date": m.group(1),
            "title": title,
            "desc": desc,
            "cat": cat,
        })
    return items


def make_copy(note):
    """生成朋友圈文案 (标准版 + 短版 + 备案期可选结尾)。"""
    url = "%s/notes/%s" % (SITE, note["file"])
    standard = "%s\n%s\n全文在数字殿堂手记频道 👉 %s" % (
        note["title"], note["desc"], url)
    short = "%s｜新一篇手记，全文 👉 %s" % (note["title"], url)
    backup_note = "（海外节点加载稍慢，备案通过后提速）"
    lines = [
        "【标准版】（%d 字）" % len(standard),
        standard,
        "",
        "【短版】（%d 字）" % len(short),
        short,
        "",
        "【备案期可选结尾】粘贴在文案末尾（备案通过后删除）",
        backup_note,
        "",
    ]
    return "\n".join(lines)


README_TXT = """朋友圈发布步骤（全程约 30 秒）

1. 把「配图.png」传到手机：
   微信「文件传输助手」→ 发送 → 手机长按保存相册
2. 复制「朋友圈文案.txt」里的【标准版】（或【短版】）
3. 打开微信 → 发现 → 朋友圈 → 右上角相机 → 从相册选「配图.png」
4. 粘贴文案，链接会留在文字里，微信打开时自动识别为卡片
5. 发布 ✅

发布后 30 分钟内（SOP）：
- 回复每一条评论
- 对明显感兴趣的熟人主动私聊深聊——这是朋友圈最高效的转化动作

注：备案等待期国内打开海外节点会偏慢，可把「备案期可选结尾」
一起贴进文案做预期管理。
"""


# --------------------------------------------------------------------------
# 主流程
# --------------------------------------------------------------------------
def main():
    notes = collect_notes()
    if not notes:
        print("[error] notes/ 下没有找到任何手记 (文件名需 YYYY-MM-DD-标题.html)")
        return 1

    os.makedirs(OG_DIR, exist_ok=True)
    os.makedirs(SHARE_DIR, exist_ok=True)

    for note in notes:
        meta_line = "%s · %s" % (note["date"], note["cat"] or "手记")
        img = render_og(note["title"], meta_line, note["desc"])

        og_path = os.path.join(OG_DIR, note["stem"] + ".png")
        img.convert("RGB").save(og_path, "PNG", optimize=True)
        print("OG 图  %-40s %8d bytes" % (os.path.relpath(og_path, ROOT), os.path.getsize(og_path)))

        # 本地发布包
        pkg = os.path.join(SHARE_DIR, note["stem"])
        os.makedirs(pkg, exist_ok=True)
        with open(os.path.join(pkg, "朋友圈文案.txt"), "w", encoding="utf-8") as f:
            f.write(make_copy(note))
        with open(os.path.join(pkg, "发布说明.txt"), "w", encoding="utf-8") as f:
            f.write(README_TXT)
        shutil.copyfile(og_path, os.path.join(pkg, "配图.png"))
        print("发布包 %-38s 文案+配图+说明" % os.path.relpath(pkg, ROOT))

    print("\n完成：OG 图 -> notes/og/（提交仓库）；发布包 -> share/（本地，不入库）")
    print("今天是 %s，共 %d 篇手记" % (date.today().isoformat(), len(notes)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
