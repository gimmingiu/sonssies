# 꿈알 12단계 렌더 v3 (Graphic Assets 채팅): 알 모양 유지, 가운데에서 금이 퍼지며 빛이 세짐. 사용: SS=2 python3 hatch.py 1 2 ... 12 (결과는 out/)
import os, sys, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
N = 1024; SS = int(os.environ.get("SS", 2)); W = N * SS
E = 1.55; TILT = np.radians(8)
KD   = np.array([0x6a, 0xc6, 0xdc]) / 255.
DEEP = np.array([0x3f, 0xae, 0xcc]) / 255.
MILK = np.array([0.95, 0.985, 0.99])
GOLD = np.array([1.0, 0.90, 0.62])
H = 1.0; R = 0.74
def egg_d(p):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    k = 1.0 - 0.13 * np.clip(y / H, -1, 1)
    return (np.sqrt((x/(R*k))**2 + (y/H)**2 + (z/(R*k))**2) - 1.0) * R * 0.82
def sdir(p):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    k = 1.0 - 0.13 * np.clip(y / H, -1, 1)
    d = np.stack([x/(R*k), y/H, z/(R*k)], -1); return d/np.linalg.norm(d, axis=-1, keepdims=True)

# ---------- 금 그물(보로노이 조각 경계) ----------
O = np.array([0.0, 0.20, 1.0]); O /= np.linalg.norm(O)       # 처음 금이 가는 자리
rng = np.random.default_rng(11)
def rnd_dirs(n):
    v = rng.normal(size=(n, 3)); return v/np.linalg.norm(v, axis=1, keepdims=True)
far = rnd_dirs(34)
near = O + rng.normal(scale=0.30, size=(7, 3)); near /= np.linalg.norm(near, axis=1, keepdims=True)
SEEDS = np.concatenate([near, far])
def warp(d):
    x, y, z = d[..., 0], d[..., 1], d[..., 2]
    w = np.stack([np.sin(9*y+2*z)+0.5*np.sin(23*z+5*x), np.sin(9*z+3*x)+0.5*np.sin(21*x-4*y), np.sin(9*x+1.7*y)+0.5*np.sin(25*y+3*z)], -1)
    d = d + 0.035*w; return d/np.linalg.norm(d, axis=-1, keepdims=True)
def crack_field(d):
    dw = warp(d)
    dd = np.linalg.norm(dw[:, None, :] - SEEDS[None], axis=-1)
    s = np.sort(dd, 1)
    return (s[:, 1] - s[:, 0]) * 0.5                 # 조각 경계까지 거리

# 단계: 금이 퍼진 각반경(rad), 금 굵기, 빛 세기
STAGES = {1:(0,0,0), 2:(0.17,0.65,0.3), 3:(0.24,0.65,0.35), 4:(0.36,0.75,0.45), 5:(0.50,0.85,0.55),
          6:(0.66,0.95,0.7), 7:(0.84,1.05,0.85), 8:(1.04,1.15,1.0), 9:(1.26,1.3,1.15),
          10:(1.52,1.45,1.3), 11:(1.85,1.65,1.5), 12:(3.3,1.9,1.8)}

def render(stage):
    Rad, wid, g = STAGES[stage]
    s = np.linspace(-E, E, W); X, Y = np.meshgrid(s, -s + 0.02)
    ro = np.stack([X, Y*np.cos(TILT) + 3*np.sin(TILT), -Y*np.sin(TILT) + 3*np.cos(TILT)], -1).reshape(-1, 3)
    rd = np.array([0, -np.sin(TILT), -np.cos(TILT)])
    t = np.zeros(len(ro)); hit = np.zeros(len(ro), bool); alive = np.ones(len(ro), bool)
    for _ in range(90):
        ia = np.where(alive)[0]
        if not len(ia): break
        d = egg_d(ro[ia] + rd*t[ia, None]); t[ia] += d*0.9
        h = d < 1e-4; fa = t[ia] > 6; hit[ia[h]] = True; alive[ia[h | fa]] = False
    hi = np.where(hit)[0]; P = ro[hi] + rd*t[hi, None]
    ex = np.eye(3)*1e-3
    n = np.stack([egg_d(P+ex[i]) - egg_d(P-ex[i]) for i in range(3)], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
    v = -rd
    Ld = np.array([-0.4, 0.8, 0.45]); Ld /= np.linalg.norm(Ld)
    nv = np.clip(n @ v, 0, 1); dif = np.clip((n @ Ld + 0.6)/1.6, 0, 1)
    xv, yv = P[:, 0], P[:, 1]
    core = np.exp(-((xv+0.08)**2/0.75 + (yv+0.25)**2/1.1))
    core *= 1 + 0.25*np.exp(-((xv-0.25)**2 + (yv-0.05)**2)/0.08) - 0.15*np.exp(-((xv+0.3)**2 + (yv-0.35)**2)/0.1)
    dens = np.clip(0.05 + 0.95*nv**1.1*core, 0, 1)**1.15
    c1 = np.clip(dens*1.6, 0, 1)[:, None]; c2 = np.clip(dens*1.6 - 0.6, 0, 1)[:, None]
    col = MILK*(1-c1) + KD*c1; col = col*(1-c2) + DEEP*c2
    col = col*(0.84 + 0.18*dif)[:, None] + (0.08*dif**3)[:, None]
    hv = Ld + v; hv /= np.linalg.norm(hv)
    col += (np.clip(n @ hv, 0, 1)**8*0.12)[:, None]
    fr = (1-nv)**3
    col = col*(1-0.55*fr)[:, None] + np.array([0.97, 1, 1])*(0.55*fr)[:, None]
    alpha = np.clip(0.60 + 0.38*nv**0.8 + 0.2*dens, 0, 1)
    glow = np.zeros(len(P))
    if Rad > 0:
        sd = sdir(P)
        ang = np.arccos(np.clip(sd @ O, -1, 1))
        # 퍼진 경계를 고르지 않게
        jag = 0.06*np.sin(7*sd[:, 0] + 3*sd[:, 1]) + 0.05*np.sin(11*sd[:, 1] - 5*sd[:, 2])
        front = Rad + jag - ang
        age = np.clip(front/max(0.30, 0.75*Rad), 0, 1)
        cen = np.exp(-(ang/0.38)**2)                          # 알 가운데 금이 가장 넓고 밝게                      # 오래된 금일수록 굵고 밝게, 끝은 가늘게
        cf = crack_field(sd)
        w_line = 0.0085*wid*(0.35 + 0.65*age)*(0.8 + 0.7*cen)
        w_grv = w_line*2.4
        on = front > 0
        groove = np.where(on, np.clip(1 - cf/w_grv, 0, 1)**1.5, 0)
        line = np.where(on, np.clip(1 - cf/w_line, 0, 1)**0.8, 0)
        col = col*(1 - 0.4*groove)[:, None] + DEEP*0.7*(0.4*groove)[:, None]
        lc = GOLD*(0.85 + 0.15*min(g, 1)) + 0.12*max(g-1, 0)
        col = col*(1-line)[:, None] + np.clip(lc, 0, 1)[None]*line[:, None]
        alpha = np.maximum(alpha, np.maximum(groove*0.95, line))
        glow = line*g*(0.35 + 0.35*age + 0.7*cen)
        # 금이 많이 퍼지면 속빛이 껍데기 전체를 조금씩 데움
        warm = 0.07*max(g-0.8, 0)*np.clip(front/0.6 + 0.5, 0, 1)
        col = col*(1-warm)[:, None] + GOLD*warm[:, None]
    img = np.zeros((W*W, 4)); img[hi, :3] = np.clip(col, 0, 1); img[hi, 3] = alpha
    img = img.reshape(W, W, 4)
    gb = np.zeros(W*W); gb[hi] = glow; gb = gb.reshape(W, W)
    halo = gaussian_filter(gb, 3*SS/2)*0.55 + gaussian_filter(gb, 11*SS)*0.9
    if stage == 12:   # 마지막: 금 사이로 빛이 터져 나옴
        YY = -s[:, None] + 0.02; XX = s[None, :]
        r = np.hypot(XX - 0.03, (YY + 0.0)*0.8); an = np.arctan2(YY, XX - 0.03)
        rays = 0.5 + 0.5*np.cos(an*11 + 0.4)**10
        win = np.clip((1.5 - np.hypot(XX, YY))/0.5, 0, 1)**2
        halo += (np.exp(-(r/0.85)**2)*0.45 + np.exp(-(r/1.1)**2)*rays*0.45)*win*(1 - 0.9*img[..., 3])
    a0 = img[..., 3]; hc = np.clip(halo, 0, 1)
    rgb = img[..., :3]*a0[..., None] + (GOLD*0.85 + 0.15)[None, None]*hc[..., None]*(1 - 0.4*a0[..., None])
    a = np.clip(a0 + hc*(1 - a0)*0.85, 0, 1)
    rgb = np.where(a[..., None] > 0, np.clip(rgb/np.maximum(a[..., None], 1e-6), 0, 1), 0)
    gr = gaussian_filter(np.random.default_rng(7).normal(0, 1, (W, W)), 0.8*SS/2); gr /= gr.std()
    rgb = np.clip(rgb + (gr*0.014)[..., None]*(a0 > 0)[..., None], 0, 1)
    im = Image.fromarray((np.concatenate([rgb, a[..., None]], -1)*255).astype(np.uint8), 'RGBA')
    if W != N: im = im.resize((N, N), Image.LANCZOS)
    os.makedirs('out', exist_ok=True); im.save(f'out/dreamegg_{stage:02d}.png')
if __name__ == '__main__':
    for k in map(int, sys.argv[1:]): render(k); print('done', k, flush=True)
