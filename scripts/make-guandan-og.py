#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
掼蛋大师 · 分享卡片（OG 图 1200×630）
与手记分享图共用同一套纸感排版（scripts/share.py 的字体/弧光/印章工具），
只是标题与页脚指向游戏入口。输出：public/games/guandan/og-cover.png（提交仓库，随站部署）。
运行: python3 scripts/make-guandan-og.py
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFilter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, SCRIPT_DIR)
import share as S  # noqa: E402

W, H = S.W, S.H
OUT = os.path.join(ROOT, "public", "games", "guandan", "og-cover.png")

TITLE = "掼蛋大师 2.0"
META = "单机陪练 · 好友联机 · AI 复盘重打"
DESC = "创建房间，把邀请链接发到群里，就能和朋友一起打。"
FOOT = "shuzidiantang.com/games/guandan"


def main():
    img = S.gradient_bg(W, H, S.BG_TOP, S.BG_BOTTOM).convert("RGBA")

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.arc([W - 620, -330, W + 620, 420], start=200, end=330, fill=S.CYAN + (110,), width=6)
    gd.arc([-560, H - 400, 500, H + 300], start=30, end=150, fill=S.CYAN + (80,), width=4)
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(30)))
    draw = ImageDraw.Draw(img)

    lw, lh = S.draw_seal(img, 46, 40, 62)
    draw = ImageDraw.Draw(img)
    brand = S.load_font("cn", 27)
    draw.text((46 + lw + 18, 40 + lh / 2 - 16), "劳伦斯实验室 · 掼蛋大师",
              font=brand, fill=S.CYAN)
    en = S.load_font("en", 15)
    draw.text((46 + lw + 18, 40 + lh / 2 + 10), "SHUZIDIANTANG.COM / GAMES / GUANDAN",
              font=en, fill=S.CYAN_DIM)

    title_font = S.load_font("cn", 92)
    S.draw_centered(draw, TITLE, title_font, S.CYAN_BRIGHT, W / 2, 296)
    meta_font = S.load_font("cn", 28)
    S.draw_centered(draw, META, meta_font, S.CYAN, W / 2, 386)
    desc_font = S.load_font("cn", 24)
    S.draw_centered(draw, DESC, desc_font, S.TEXT_DIM, W / 2, 444)
    foot_font = S.load_font("en", 16)
    S.draw_centered(draw, FOOT, foot_font, S.CYAN_DIM, W / 2, H - 44)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.convert("RGB").save(OUT, optimize=True)
    print("wrote", os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
