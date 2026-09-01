#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数字殿堂 · 全站品牌 OG 图 (assets/og/brand.png) 生成脚本
纸感配色：米纸 / 墨 / 琥珀，与 share.py 共用绘制工具。
运行: python3 scripts/make-brand.py
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFilter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, SCRIPT_DIR)
import share as S  # noqa: E402

W, H = S.W, S.H
OUT = os.path.join(ROOT, "assets", "og", "brand.png")


def main():
    img = S.gradient_bg(W, H, S.BG_TOP, S.BG_BOTTOM).convert("RGBA")
    draw = ImageDraw.Draw(img)

    # 琥珀弧光装饰（右上 + 左下）
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.arc([W - 620, -330, W + 620, 420], start=200, end=330,
           fill=S.CYAN + (90,), width=6)
    gd.arc([-560, H - 400, 500, H + 300], start=30, end=150,
           fill=S.CYAN + (70,), width=4)
    glow = glow.filter(ImageFilter.GaussianBlur(24))
    img.alpha_composite(glow)

    # 左上：朱印 + 品牌行
    lw, lh = S.draw_seal(img, 46, 40, 62)
    brand_font = S.load_font("cn", 27)
    bbox = draw.textbbox((0, 0), "劳伦斯在上海", font=brand_font)
    draw.text((46 + lw + 18 - bbox[0], 40 + lh / 2 - 14 - bbox[1]),
              "劳伦斯在上海", font=brand_font, fill=S.CYAN)
    en_font = S.load_font("en", 15)
    draw.text((46 + lw + 18, 40 + lh / 2 + 8), "SHUZIDIANTANG.COM",
              font=en_font, fill=S.CYAN_DIM)

    # 主标题
    title_font, _size = S.fit_font_size(draw, "劳伦斯在上海", "cn", 150, W - 220)
    S.draw_centered(draw, "劳伦斯在上海", title_font, S.CYAN_BRIGHT, W / 2, 270)

    # 副题
    sub_font = S.load_font("cn", 30)
    S.draw_centered(draw, "个人主站 · 数字作品 / 旅行 / 手记", sub_font,
                    S.TEXT_DIM, W / 2, 400)

    # 页脚
    foot_font = S.load_font("en", 16)
    S.draw_centered(draw, "shuzidiantang.com", foot_font, S.CYAN_DIM, W / 2, H - 44)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print("brand.png -> %s (%d bytes)" % (OUT, os.path.getsize(OUT)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
