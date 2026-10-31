#!/usr/bin/env python3
"""꿈알 12단계 PNG(assets/dreamegg/out) → 앱에 넣는 작은 WEBP(data URI) 목록 src/js/flow/egg-art.js
PNG 다시 만들기: cd assets/dreamegg && SS=2 python3 hatch.py 1 2 3 4 5 6 7 8 9 10 11 12
"""
import os, io, base64, glob
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fs = sorted(glob.glob(os.path.join(ROOT, 'assets', 'dreamegg', 'out', 'dreamegg_*.png')))
assert len(fs) == 12, f'꿈알 PNG가 12장이어야 해요 ({len(fs)}장)'
uris = []
for f in fs:
    b = io.BytesIO(); Image.open(f).resize((640, 640), Image.LANCZOS).save(b, 'WEBP', quality=86, method=6)
    uris.append('data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode())
out = os.path.join(ROOT, 'src', 'js', 'flow', 'egg-art.js')
with open(out, 'w', encoding='utf8') as w:
    w.write('// 꿈알 12단계 그림 (tools/egg_assets.py가 assets/dreamegg/out의 PNG로 만듦 — 직접 고치지 말 것)\n')
    w.write('const EGG_ART=[\n' + ',\n'.join(f"'{u}'" for u in uris) + '];\n')
print(os.path.relpath(out, ROOT), sum(len(u) for u in uris) // 1024, 'KB')
