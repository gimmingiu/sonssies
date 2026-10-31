#!/usr/bin/env python3
"""나눠 둔 소스(src/)를 한 파일로 합침 → build/sonssies.html

- src/page.html 이 뼈대. 그 안의 `@@include 경로` 줄이 해당 파일 내용으로 바뀜.
- 결과물 하나가 아티팩트(claude.ai)로도, 사이트(index.html, tools/build_site.py)로도 쓰임.
사용: python3 tools/assemble.py [출력경로]
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

def expand(path, seen=()):
    if path in seen:
        raise SystemExit(f'순환 포함: {path}')
    out = []
    with open(os.path.join(SRC, path), encoding='utf8') as f:
        for line in f.read().splitlines(keepends=True):
            m = re.fullmatch(r'@@include\s+(\S+)\s*', line)
            if m:
                inc = m.group(1)
                if not os.path.exists(os.path.join(SRC, inc)):
                    raise SystemExit(f'없는 파일: src/{inc} (src/{path}에서 포함)')
                out.append(expand(inc, seen + (path,)))
            else:
                out.append(line)
    return ''.join(out)

if __name__ == '__main__':
    dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'build', 'sonssies.html')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    html = expand('page.html')
    with open(dst, 'w', encoding='utf8') as f:
        f.write(html)
    print(f'{os.path.relpath(dst, ROOT)}  {len(html.encode())//1024}KB')
