#!/usr/bin/env python3
"""코드 점검: 지저분해지는 걸 고칠 때마다 바로 잡기 위한 자동 검사. 사이트를 만들 때(build_site.py) 먼저 돌고, 오류가 있으면 멈춤.

오류(고쳐야 반영됨)
  - 한 줄 200자 넘음 (JS·CSS, 그림 데이터 줄은 빼고)
  - 같은 CSS 규칙(선택자)이 한 파일에 두 번
  - JS에서 $('id')·getElementById('id')로 찾는데 화면에 없는 id
경고(확인해 보고 필요 없으면 지움)
  - 어디서도 쓰지 않는 함수·변수·CSS 클래스
  - 150줄 넘는 JS 파일(역할이 둘 이상이면 나누기 — 한 가지 일만 하는 큰 파일은 맨 위에 `check:big-ok` 와 이유)

사용: python3 tools/check.py            (오류가 있으면 끝 코드 1)
일부러 남겨 두는 건 그 줄 끝에 `check:ok` 주석(이유도 함께)을 달면 경고에서 빠짐.
"""
import os, re, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
SKIP = {'js/flow/egg-art.js'}           # 자동 생성 파일
LONG, BIG = 200, 150
rel = lambda p: os.path.relpath(p, SRC)
files = [p for p in glob.glob(os.path.join(SRC, '**', '*.*'), recursive=True) if rel(p) not in SKIP and p.endswith(('.js', '.css', '.html'))]
text = {p: open(p, encoding='utf8').read() for p in files}
js = {p: t for p, t in text.items() if p.endswith('.js')}
css = {p: t for p, t in text.items() if p.endswith('.css')}
html = {p: t for p, t in text.items() if p.endswith('.html')}
# HTML 안 <style>·<script>도 함께 봄
for p, t in html.items():
    for m in re.finditer(r'<style[^>]*>(.*?)</style>', t, re.S): css[p + '#style'] = m.group(1)
    for m in re.finditer(r'<script[^>]*>(.*?)</script>', t, re.S): js[p + '#script'] = m.group(1)
alltext = '\n'.join(text.values())
errs, warns = [], []
ok = lambda line: 'check:ok' in line

# 1. 긴 줄
for p, t in text.items():
    if p.endswith('.html'): continue   # 화면 HTML은 태그 사이 줄바꿈이 모양을 바꿀 수 있어서 검사 안 함
    for i, l in enumerate(t.split('\n'), 1):
        if len(l) > LONG and not ok(l) and 'data:image' not in l: errs.append(f'{rel(p)}:{i}  한 줄 {len(l)}자 (200자 안쪽으로: ; 나 , 뒤에서 줄바꿈)')

# 2. CSS 같은 선택자 두 번 (같은 @media 안에서)
for p, t in css.items():
    t2 = re.sub(r'/\*.*?\*/', '', t, flags=re.S); seen = {}; depth = 0; ctx = ['']; i = 0; buf = ''
    while i < len(t2):
        c = t2[i]
        if c == '{':
            sel = ' '.join(buf.split()); buf = ''
            if sel.startswith('@'): ctx.append(sel)
            else:
                if not sel.startswith(('from', 'to')) and not re.fullmatch(r'[\d.%, ]+', sel) and not any(x.startswith('@keyframes') for x in ctx):
                    key = (ctx[-1], sel); line = t2[:i].count('\n') + 1
                    if key in seen: errs.append(f'{rel(p.split("#")[0])}:{line}  CSS 규칙 "{sel[:60]}"이(가) {seen[key]}번 줄에도 있음 (하나로 합치기)')
                    else: seen[key] = line
                ctx.append(None)
        elif c == '}':
            ctx.pop() if len(ctx) > 1 else None; buf = ''
        elif c == ';': buf = ''
        else: buf += c
        i += 1

# 3. 화면에 없는 id를 찾는 JS
ids = set(re.findall(r'\sid="([^"]+)"', '\n'.join(html.values())))
made = set(re.findall(r"\.id\s*=\s*'([^']+)'", '\n'.join(js.values())))   # JS로 만드는 id
made |= set(re.findall(r'id="([\w-]+)"', '\n'.join(js.values())))             # JS가 innerHTML로 넣는 id
for t in js.values():
    if re.search(r'\.id\s*=\s*[a-z]', t): made |= set(re.findall(r'[{,]\s*([\w-]+)\s*:\s*\[', t))   # {아이디:[…]}를 돌며 b.id=아이디
for p, t in js.items():
    for m in re.finditer(r"(?:\$|getElementById)\('([\w-]+)'\)", t):
        k = m.group(1); line = t[:m.start()].count('\n') + 1
        if k not in ids and k not in made and not ok(t.split('\n')[line - 1]): errs.append(f'{rel(p.split("#")[0])}:{line}  화면에 없는 id "{k}"를 찾음')

# 4. 안 쓰는 것들 (이름이 소스 전체에서 한 번만 나오면 = 만들고 안 씀)
def count(name): return len(re.findall(r'(?<![\w$])' + re.escape(name) + r'(?![\w$])', alltext))
jsall = '\n'.join(js.values())
for m in re.finditer(r'^(?:function\s+([\w$]+)|(?:const|let)\s+([\w$]+)\s*=)', jsall, re.M):
    n = m.group(1) or m.group(2); line = jsall[m.start():jsall.find('\n', m.start())]
    if count(n) == 1 and not ok(line): warns.append(f'안 쓰는 함수·변수: {n}')
csscls = set(re.findall(r'\.([a-zA-Z][\w-]*)', re.sub(r'/\*.*?\*/|url\([^)]*\)|\d+\.\d+', '', '\n'.join(css.values()))))
for c in sorted(csscls):
    if not re.search(r'(?<![\w-])' + re.escape(c) + r'(?![\w-])', '\n'.join(list(html.values()) + list(js.values()))):
        warns.append(f'안 쓰는 CSS 클래스: .{c}')

# 5. 큰 파일
for p, t in text.items():
    if p.endswith('.js') and t.count('\n') > BIG and 'check:big-ok' not in t[:400]: warns.append(f'큰 파일: {rel(p)} {t.count(chr(10))}줄 (역할이 둘 이상이면 나누기)')

for w in warns: print('경고 ', w)
for e in errs: print('오류 ', e)
print(f'점검: 오류 {len(errs)}개 · 경고 {len(warns)}개')
sys.exit(1 if errs else 0)
