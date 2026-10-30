#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
去 AI 句式体检脚本（v1.0）

用法：
    python3 去AI句式扫描.py 书稿.md
    python3 去AI句式扫描.py 书稿.md --json
    python3 去AI句式扫描.py 目录/          # 扫描目录下所有 .md/.txt

设计口径（来自 2026-10 奉系/远东/日本俄国三本书的编辑实测）：
  1. 先看「四类对称否定」是否归零——这是作者点名最多的 AI 腔；
  2. 再看「套话 8 项」与「边界词密度」——禁词表不能停在词面，要看句法；
  3. 句长、段内限定语、重复句用于发现节奏问题；
  4. 指标只用于定位，不用于代替人判断；改完要回读，防止「为避禁用词改出病句」。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

CJK_RE = re.compile(r"[\u4e00-\u9fff]")
SENT_SPLIT_RE = re.compile(r"[。！？；]+")
PARA_SPLIT_RE = re.compile(r"\n\s*\n")

# 一、四类对称否定（AI 腔的核心句式族）
SYMMETRIC_PATTERNS = {
    "不能…也不能": r"不能[^。！？；\n]{0,40}?也不能",
    "不是…也不是": r"不是[^。！？；\n]{0,40}?也不是",
    "不必…也不必": r"不必[^。！？；\n]{0,40}?也不必",
    "既不…也不": r"既不[^。！？；\n]{0,40}?也不",
}

# 二、套话 8 项（奉系《文字审阅_去AI味报告》口径）
CLICHE_PATTERNS = {
    "不是…而是": r"不是[^。！？；\n]{0,30}?而是",
    "值得注意的是": r"值得注意的是",
    "需要指出的是": r"需要指出的是",
    "综上所述": r"综上所述",
    "换言之": r"换言之",
    "由此可见": r"由此可见",
    "本章": r"本章",
    "笔者/我们认为": r"笔者|我们认为",
}

# 三、机械替换留下的病句（禁用「不是…而是」后常见）
BROKEN_PATTERNS = {
    "不只是…而是": r"不只是[^。！？；\n]{0,30}?而是",
    "未必是…而是": r"未必是[^。！？；\n]{0,30}?而是",
    "并非…而是": r"并非[^。！？；\n]{0,30}?而是",
    "并不…而是": r"并不[^。！？；\n]{0,30}?而是",
}

BOUNDARY_STRICT = [
    "不能", "不等于", "不等", "尚不", "尚未", "未必", "仍缺", "待核",
    "尚待", "有待", "无法", "只能", "未能", "不足以",
]
BOUNDARY_WIDE_EXTRA = [
    "可能", "需要", "不是", "并非", "怎样", "如何", "这一", "某种",
    "仍待", "仍须", "仍需", "未必能",
]

# 四、模板化/论文骨架（只提示，不算硬伤）
TEMPLATE_MARKERS = ["首先", "其次", "最后", "综上", "总而言之", "总体而言", "本质上", "从某种意义上"]


def cjk_count(text: str) -> int:
    return len(CJK_RE.findall(text))


def clean_markdown(text: str) -> str:
    """去掉标题、表格、代码块、链接目标等非正文装置，避免句长/密度被格式污染。"""
    lines = []
    in_code = False
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if not stripped:
            lines.append("")
            continue
        if stripped.startswith("#"):          # 标题
            continue
        if stripped.startswith("|"):          # 表格
            continue
        if stripped.startswith("!["):         # 图片
            continue
        lines.append(line)
    text = "\n".join(lines)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # 链接保留文字
    return text


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in SENT_SPLIT_RE.split(text) if s.strip()]


def split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in PARA_SPLIT_RE.split(text) if p.strip()]


def count_pattern(text: str, pattern: str) -> int:
    return len(re.findall(pattern, text))


def density(count: int, chars: int) -> float:
    return round(count * 1000 / chars, 2) if chars else 0.0


def scan(text: str, name: str) -> dict:
    text = clean_markdown(text)
    chars = cjk_count(text)
    sents = split_sentences(text)
    paras = split_paragraphs(text)
    sent_lens = [cjk_count(s) for s in sents]
    mean_len = round(sum(sent_lens) / len(sent_lens), 1) if sent_lens else 0.0

    symmetric = {k: count_pattern(text, p) for k, p in SYMMETRIC_PATTERNS.items()}
    cliches = {k: count_pattern(text, p) for k, p in CLICHE_PATTERNS.items()}
    broken = {k: count_pattern(text, p) for k, p in BROKEN_PATTERNS.items()}

    strict_total = sum(text.count(w) for w in BOUNDARY_STRICT)
    wide_total = strict_total + sum(text.count(w) for w in BOUNDARY_WIDE_EXTRA)

    # 段内「可能/可以」超过 1 处：限定语堆叠
    hedge_paragraphs = []
    for idx, para in enumerate(paras):
        n = para.count("可能") + para.count("可以")
        if n > 1:
            hedge_paragraphs.append({"para": idx + 1, "count": n,
                                     "preview": re.sub(r"\s+", " ", para)[:60]})

    # 重复句（去标点与空白后长度 >= 16 个汉字）
    seen = {}
    dups = []
    for s in sents:
        key = re.sub(r"[\s，。！？；：、“”‘’（）()《》【】,.!?;:]", "", s)
        if cjk_count(key) < 16:
            continue
        if key in seen:
            dups.append({"sentence": s[:80], "first_pos": seen[key]})
        else:
            seen[key] = len(dups)

    # 重复段（去标点与空白后长度 >= 60 个汉字）
    seen_para = {}
    dup_paras = []
    for idx, para in enumerate(paras):
        key = re.sub(r"[\s，。！？；：、“”‘’（）()《》【】,.!?;:]", "", para)
        if cjk_count(key) < 60:
            continue
        if key in seen_para:
            dup_paras.append({"para": idx + 1, "first_para": seen_para[key] + 1,
                              "preview": re.sub(r"\s+", " ", para)[:60]})
        else:
            seen_para[key] = idx

    template_counts = {k: text.count(k) for k in TEMPLATE_MARKERS}

    return {
        "file": name,
        "cjk_chars": chars,
        "sentences": len(sents),
        "mean_sentence_len": mean_len,
        "long_sentences_over_80": sum(1 for n in sent_lens if n > 80),
        "short_sentences_under_10": sum(1 for n in sent_lens if n < 10),
        "symmetric_negation": symmetric,
        "symmetric_total": sum(symmetric.values()),
        "cliches": cliches,
        "cliche_total": sum(cliches.values()),
        "broken_replacement": broken,
        "broken_total": sum(broken.values()),
        "boundary_strict": strict_total,
        "boundary_strict_density": density(strict_total, chars),
        "boundary_wide": wide_total,
        "boundary_wide_density": density(wide_total, chars),
        "cant_count": text.count("不能"),
        "zheyi_count": text.count("这一"),
        "hedge_paragraphs": hedge_paragraphs,
        "duplicate_sentences": dups,
        "duplicate_paragraphs": dup_paras,
        "template_markers": template_counts,
    }


def verdict(r: dict) -> tuple[str, list[str]]:
    hard, tips = [], []
    if r["symmetric_total"]:
        hard.append(f"四类对称否定 {r['symmetric_total']} 处（目标 0）")
    if r["broken_total"]:
        hard.append(f"机械替换病句 {r['broken_total']} 处（如「不只是…而是」，应改写）")
    if r["cliche_total"]:
        hard.append(f"套话 {r['cliche_total']} 处（目标 0）")
    if r["duplicate_paragraphs"]:
        hard.append(f"重复段 {len(r['duplicate_paragraphs'])} 处")
    if r["mean_sentence_len"] > 36:
        tips.append(f"句均 {r['mean_sentence_len']} 字，偏长（参照带 29—34）")
    if r["long_sentences_over_80"]:
        tips.append(f"80 字以上长句 {r['long_sentences_over_80']} 句，逐句看是否该断")
    if r["boundary_strict_density"] > 2.0:
        tips.append(f"边界词密度 {r['boundary_strict_density']}‰，偏高于参考线 2‰")
    if r["hedge_paragraphs"]:
        tips.append(f"{len(r['hedge_paragraphs'])} 段出现两处以上「可能/可以」")
    if r["duplicate_sentences"]:
        tips.append(f"重复句 {len(r['duplicate_sentences'])} 句")
    return ("建议先改" if hard else "机械指标通过"), hard + tips


def print_report(r: dict) -> None:
    level, issues = verdict(r)
    print(f"\n=== 去 AI 句式体检：{r['file']} ===")
    print(f"汉字 {r['cjk_chars']}｜句数 {r['sentences']}｜句均 {r['mean_sentence_len']} 字"
          f"｜80+ 字长句 {r['long_sentences_over_80']}｜10- 字短句 {r['short_sentences_under_10']}")
    print(f"边界词（严格表）{r['boundary_strict']} 处 / {r['boundary_strict_density']}‰"
          f"；宽表 {r['boundary_wide']} 处 / {r['boundary_wide_density']}‰"
          f"；「不能」{r['cant_count']} 次；「这一」{r['zheyi_count']} 次")
    print("\n-- 对称否定 --")
    for k, v in r["symmetric_negation"].items():
        print(f"  {k}: {v}")
    print("\n-- 套话 8 项 --")
    for k, v in r["cliches"].items():
        if v:
            print(f"  {k}: {v}")
    if r["broken_total"]:
        print("\n-- 机械替换病句 --")
        for k, v in r["broken_replacement"].items():
            if v:
                print(f"  {k}: {v}")
    if r["duplicate_paragraphs"]:
        print("\n-- 重复段 --")
        for d in r["duplicate_paragraphs"][:5]:
            print(f"  第 {d['para']} 段与第 {d['first_para']} 段重复：{d['preview']}…")
    if r["hedge_paragraphs"]:
        print("\n-- 限定语堆叠段 --")
        for d in r["hedge_paragraphs"][:5]:
            print(f"  第 {d['para']} 段 {d['count']} 处：{d['preview']}…")
    markers = {k: v for k, v in r["template_markers"].items() if v}
    if markers:
        print(f"\n-- 模板骨架词（提示，非硬伤）-- {markers}")
    print(f"\n结论：{level}" + ("；" + "；".join(issues) if issues else ""))


def iter_files(target: Path) -> list[Path]:
    if target.is_file():
        return [target]
    return sorted(p for p in target.rglob("*") if p.suffix.lower() in {".md", ".txt"})


def main() -> int:
    ap = argparse.ArgumentParser(description="扫描中文书稿里的 AI 句式与节奏问题")
    ap.add_argument("path", help="文件或目录（.md/.txt）")
    ap.add_argument("--json", action="store_true", help="输出 JSON")
    args = ap.parse_args()

    target = Path(args.path).expanduser()
    if not target.exists():
        print(f"找不到：{target}", file=sys.stderr)
        return 2

    results = []
    for f in iter_files(target):
        try:
            text = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = f.read_text(encoding="utf-8", errors="ignore")
        results.append(scan(text, str(f)))

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for r in results:
            print_report(r)

    worst = max(results, key=lambda r: r["symmetric_total"] + r["broken_total"] + r["cliche_total"])
    return 1 if (worst["symmetric_total"] + worst["broken_total"] + worst["cliche_total"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
