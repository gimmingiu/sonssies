#!/usr/bin/env python3
"""꿈알 12단계 PNG 껍데기·빛 24장(assets/dreamegg/out) → 앱에 넣는 작은 WEBP(data URI) 목록 src/js/flow/egg-art.js
PNG 다시 만들기: cd assets/dreamegg && SS=2 python3 hatch.py 1 2 3 4 5 6 7 8 9 10 11 12
"""
import os, io, base64, glob
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'dreamegg', 'out')
def pack(paths, q, size=640, aq=100):
    uris = []
    for f in paths:
        b = io.BytesIO(); Image.open(f).resize((size, size), Image.LANCZOS).save(b, 'WEBP', quality=q, alpha_quality=aq, method=6)
        uris.append('data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode())
    return uris
shells = [os.path.join(OUT, f'dreamegg_{k:02d}.png') for k in range(1, 13)]
lights = [os.path.join(OUT, f'dreamegg_{k:02d}_light.png') for k in range(1, 13)]
assert all(os.path.exists(f) for f in shells + lights), '꿈알 PNG(껍데기·빛) 24장이 있어야 해요'
S, L = pack(shells, 86), pack(lights, 75, 512, 70)   # 빛은 흐릿해서 작게 줄여도 티가 안 남
out = os.path.join(ROOT, 'src', 'js', 'flow', 'egg-art.js')
with open(out, 'w', encoding='utf8') as w:
    w.write('// 꿈알 12단계 그림 (tools/egg_assets.py가 assets/dreamegg/out의 PNG로 만듦 — 직접 고치지 말 것)\n')
    w.write('// EGG_ART = 껍데기(금은 빛 없는 틈), EGG_LIGHT = 같은 구도의 빛만(틈에서 새는 빛 + 속빛). 앱에서 겹쳐 놓고 빛만 숨 쉬듯 움직임\n')
    w.write('const EGG_ART=[\n' + ',\n'.join(f"'{u}'" for u in S) + '];\n')
    w.write('const EGG_LIGHT=[\n' + ',\n'.join(f"'{u}'" for u in L) + '];\n')
print(os.path.relpath(out, ROOT), 'shell', sum(len(u) for u in S)//1024, 'KB / light', sum(len(u) for u in L)//1024, 'KB')
