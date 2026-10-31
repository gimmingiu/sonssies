#!/usr/bin/env python3
"""꿈알 12단계 PNG 껍데기·빛 24장(assets/dreamegg/out) → 사이트·아티팩트에 함께 올리는 작은 WEBP 파일 egg/*.webp
+ 그 파일 이름 목록 src/js/flow/egg-art.js (파일이 바뀌면 ?v= 값이 바뀌어서 휴대폰에 저장된 옛 그림 대신 새 그림을 받음)

PNG 다시 만들기: cd assets/dreamegg && SS=2 python3 hatch.py 1 2 3 4 5 6 7 8 9 10 11 12
그림 다시 만들기: python3 tools/egg_assets.py
목록만 다시 쓰기(egg/ 파일은 그대로): python3 tools/egg_assets.py --list
"""
import os, sys, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'dreamegg', 'out')
EGG = os.path.join(ROOT, 'egg')
NAMES = [f'shell-{k:02d}.webp' for k in range(1, 13)] + [f'light-{k:02d}.webp' for k in range(1, 13)]

def encode():
    from PIL import Image
    os.makedirs(EGG, exist_ok=True)
    for k in range(1, 13):
        for src, dst, q, size, aq in [(f'dreamegg_{k:02d}.png', f'shell-{k:02d}.webp', 86, 640, 100),
                                      (f'dreamegg_{k:02d}_light.png', f'light-{k:02d}.webp', 75, 512, 70)]:   # 빛은 흐릿해서 작게 줄여도 티가 안 남
            p = os.path.join(OUT, src); assert os.path.exists(p), f'{src} 이(가) 있어야 해요'
            Image.open(p).resize((size, size), Image.LANCZOS).save(os.path.join(EGG, dst), 'WEBP', quality=q, alpha_quality=aq, method=6)

def write_list():
    h = hashlib.sha1()
    for n in NAMES: h.update(open(os.path.join(EGG, n), 'rb').read())
    v = h.hexdigest()[:8]
    out = os.path.join(ROOT, 'src', 'js', 'flow', 'egg-art.js')
    with open(out, 'w', encoding='utf8') as w:
        w.write('// 꿈알 12단계 그림 파일 목록 (tools/egg_assets.py가 만듦 — 직접 고치지 말 것). 그림은 egg/ 폴더(페이지 옆)에 따로 있음\n')
        w.write('// EGG_ART = 껍데기(금은 빛 없는 틈), EGG_LIGHT = 같은 구도의 빛만(틈에서 새는 빛 + 속빛). 앱에서 겹쳐 놓고 빛만 숨 쉬듯 움직임\n')
        w.write(f"const EGG_V='{v}',EGG_ART=[],EGG_LIGHT=[];\n")
        w.write("for(let k=1;k<=12;k++){const n=String(k).padStart(2,'0');EGG_ART.push(`egg/shell-${n}.webp?v=${EGG_V}`);EGG_LIGHT.push(`egg/light-${n}.webp?v=${EGG_V}`)}\n")
        w.write("[EGG_ART[0],EGG_LIGHT[0]].forEach(u=>{const i=new Image();i.src=u});   // 첫 장은 페이지가 열리자마자 미리 받아 둠(알이 늦게 뜨지 않게)\n")
    total = sum(os.path.getsize(os.path.join(EGG, n)) for n in NAMES)
    print(os.path.relpath(out, ROOT), f'v={v}', f'egg/ {len(NAMES)}개 {total // 1024}KB')

if __name__ == '__main__':
    if '--list' not in sys.argv: encode()
    write_list()
