#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OKF 위키 무결성 린터 (Path B — Claude Code 네이티브 검증용)
사용: python3 lint_okf.py <wiki_dir>
검사: (1) type frontmatter 필수  (2) 깨진 위키링크  (3) 고아 문서(index 미도달)  (4) 출처 표기
"""
import sys, os, re

def load(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

def main(wiki):
    md = []
    for root, _, files in os.walk(wiki):
        for f in files:
            if f.endswith(".md"):
                md.append(os.path.join(root, f))
    concept = [p for p in md if os.path.basename(p) not in ("index.md", "log.md")]

    fails = []
    # rel id 매핑: 파일 -> 'wiki/<path without .md>'
    # 위키링크는 항상 리터럴 'wiki/' 접두사를 쓰므로, 실제 폴더명과 무관하게
    # wiki 디렉터리를 'wiki' 네임스페이스 루트로 고정한다. (폴더명 이식성 확보)
    def to_id(p):
        rel = os.path.relpath(p, wiki).replace(os.sep, "/")
        return "wiki/" + rel[:-3]  # strip .md, prefix 'wiki'
    ids = {to_id(p) for p in md}

    # (1) type frontmatter
    no_type = []
    for p in concept:
        txt = load(p)
        m = re.match(r"^---\s*\n(.*?)\n---", txt, re.S)
        if not m or not re.search(r"^type:\s*\S+", m.group(1), re.M):
            no_type.append(to_id(p))

    # (2) 깨진 링크 + 전체 링크 그래프
    link_re = re.compile(r"\[\[(wiki/[^\]|#]+)")
    edges = {}
    broken = []
    for p in md:
        src = to_id(p)
        targets = set(link_re.findall(load(p)))
        edges[src] = targets
        for t in targets:
            if t not in ids:
                broken.append((src, t))

    # (3) 고아: index.md에서 BFS 도달 불가한 concept
    start = "wiki/index"
    seen = set()
    stack = [start]
    while stack:
        cur = stack.pop()
        if cur in seen:
            continue
        seen.add(cur)
        for t in edges.get(cur, ()):
            stack.append(t)
    orphans = [to_id(p) for p in concept if to_id(p) not in seen]

    # (4) 출처 표기 (raw/...) — concept 문서
    no_src = [to_id(p) for p in concept if not re.search(r"\(raw/[^)]+\)", load(p))]

    print(f"== OKF 린트: {wiki} ==")
    print(f"문서: 전체 {len(md)} / 개념 {len(concept)}")
    def rep(name, lst):
        ok = "PASS" if not lst else "FAIL"
        print(f"[{ok}] {name}: {len(lst)}건" + ("" if not lst else f" -> {lst}"))
        if lst: fails.append(name)
    rep("type frontmatter 누락", no_type)
    rep("깨진 위키링크", [f"{s}->{t}" for s, t in broken])
    rep("고아 문서(index 미도달)", orphans)
    rep("출처(raw/..) 누락", no_src)
    print("== 결과:", "ALL PASS ✅" if not fails else f"FAIL ❌ ({', '.join(fails)})", "==")
    return 0 if not fails else 1

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "wiki"))
