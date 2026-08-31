#!/usr/bin/env python3
"""全站链接巡检：检查 dist 内所有 HTML 的内部链接/图片目标是否存在。"""
import os
import re
import sys

DIST = sys.argv[1] if len(sys.argv) > 1 else "dist"
missing = []
checked = 0
pages = 0

href_re = re.compile(r'(?:href|src)="([^"#]+)"')

for root, _dirs, files in os.walk(DIST):
    for f in files:
        if not f.endswith(".html"):
            continue
        pages += 1
        p = os.path.join(root, f)
        html = open(p, encoding="utf-8", errors="replace").read()
        for m in href_re.finditer(html):
            target = m.group(1)
            if target.startswith(("http://", "https://", "mailto:", "data:", "javascript:")):
                continue
            if target.startswith("//") or target.startswith("${"):
                continue
            target = target.split("?")[0]
            checked += 1
            base = os.path.dirname(p)
            if target.startswith("/"):
                resolved = os.path.join(DIST, target.lstrip("/"))
            else:
                resolved = os.path.normpath(os.path.join(base, target))
            if not os.path.exists(resolved):
                missing.append((os.path.relpath(p, DIST), target))

print(f"pages={pages} links_checked={checked} missing={len(missing)}")
for src, tgt in missing[:60]:
    print(f"  MISSING {src} -> {tgt}")
sys.exit(1 if missing else 0)
