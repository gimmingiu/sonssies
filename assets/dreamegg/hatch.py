# 꿈알 12단계 렌더 (Graphic Assets 채팅에서 만든 최종본을 옮김). 사용: SS=2 python3 hatch.py 1 2 ... 12
import sys, os, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

N = 1024; SS = int(os.environ.get("SS", 2)); W = N * SS
E = 1.7                       # 화면 반폭(월드 단위). 모든 단계 동일
TILT = np.radians(8)
KD   = np.array([0x6a, 0xc6, 0xdc]) / 255.
DEEP = np.array([0x3f, 0xae, 0xcc]) / 255.
MILK = np.array([0.95, 0.985, 0.99])
GOLD = np.array([1.0, 0.90, 0.62])   # 새어 나오는 꿈빛
H = 1.0; R = 0.74; TH = 0.045         # 껍데기 두께

# ---------- 갈라지는 선(허리 지그재그) ----------
rng = np.random.default_rng(3)
NV = 16
VT = np.linspace(-np.pi, np.pi, NV + 1)
VY = 0.08 + np.array([(0.075 if i % 2 else -0.06) for i in range(NV + 1)]) + rng.uniform(-0.02, 0.02, NV + 1)
VY[-1] = VY[0]
def yc(th): return np.interp(th, VT, VY)

def egg_d(p):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    k = 1.0 - 0.13 * np.clip(y / H, -1, 1)
    q = np.sqrt((x / (R * k))**2 + (y / H)**2 + (z / (R * k))**2)
    return (q - 1.0) * R * 0.82

def shell(p):
    d = egg_d(p); return np.maximum(d, -d - TH)

def theta(p): return np.arctan2(p[..., 0], p[..., 2])

HOLE = (0.04, 0.36, 0.19)   # 떨어져 나간 조각: θ 범위와 높이
def hole_h(p):
    th = theta(p); t0, t1, hh = HOLE
    mid = (t0 + t1) / 2; half = (t1 - t0) / 2
    cap = yc(th) + hh * np.clip(1 - np.abs(th - mid) / half, 0, 1)
    return np.minimum.reduce([(th - t0) * 0.6, (t1 - th) * 0.6, (cap - p[..., 1]) * 0.7, (p[..., 1] - yc(th) + 0.01) * 0.7])

def Rz(a):
    c, s = np.cos(a), np.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
def Rx(a):
    c, s = np.cos(a), np.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])

# ---------- 단계 정의 ----------
B1 = [(0.39, None), (0.47, 0.12), (0.43, 0.21)]
B2 = [(-0.39, None), (-0.50, -0.10), (-0.64, -0.15)]
B3 = [(0.785, None), (0.95, 0.09), (1.05, 0.06)]
B4 = [(-0.785, None), (-0.72, 0.13), (-0.80, 0.20)]
B5 = [(0.0, None), (-0.06, -0.12)]
STAGES = {
 1:  dict(span=None),
 2:  dict(span=(-0.12, 0.22), glow=0.25),
 3:  dict(span=(-0.42, 0.50), glow=0.35),
 4:  dict(span=(-0.80, 0.85), br=[B1], glow=0.5),
 5:  dict(span=(-1.15, 1.20), br=[B1, B2], glow=0.65),
 6:  dict(span=(-1.65, 1.65), br=[B1, B2, B3, B4], glow=0.8),
 7:  dict(span=(-2.4, 2.4), br=[B1, B2, B3, B4, B5], glow=0.95, hole=True),
 8:  dict(split=True, br=[B1, B2, B3, B4], glow=1.0, hole=True, top=dict(rz=0, rx=0, tr=(0, 0.05, 0))),
 9:  dict(split=True, br=[B1, B2, B3, B4], glow=1.15, hole=True, top=dict(rz=-7, rx=-4, tr=(0.02, 0.13, 0))),
 10: dict(split=True, br=[B1, B2, B3, B4], glow=1.3, hole=True, top=dict(rz=-30, rx=-8, tr=(0.06, 0.18, 0))),
 11: dict(split=True, br=[B1, B2, B3, B4], glow=1.45, hole=True, top=dict(rz=-72, rx=-10, tr=(0.98, -0.30, -0.3), piv=(0, 0.5, 0)), burst=0.35),
 12: dict(split=True, br=[B1, B2, B3, B4], glow=1.6, hole=True, top=dict(rz=-120, rx=-15, tr=(1.18, -1.0, -0.6), piv=(0, 0.5, 0)), burst=1.0),
}
PIV = np.array([0.66, 0.08, 0.0])   # 위 껍데기가 기울 때 경첩(오른쪽 허리)

def polylines(st):
    out = []
    if st.get('span'):
        a, b = st['span']
        ts = [a] + [t for t in VT if a < t < b] + [b]
        out.append([(t, yc(t)) for t in ts])
    for br in st.get('br', []):
        t0 = br[0][0]; y0 = yc(t0)
        out.append([(t, y0 + (dy or 0)) for t, dy in br])
    segs = []
    for pl in out:
        for (t1, y1), (t2, y2) in zip(pl[:-1], pl[1:]):
            segs.append((t1, y1, t2, y2))
    return np.array(segs) if segs else np.zeros((0, 4))

def crack_dist(p, segs):
    """껍데기 표면 좌표(θ·0.72, y)에서 금까지의 거리"""
    u = theta(p) * 0.72; y = p[..., 1]
    d = np.full(u.shape, 9.0)
    for t1, y1, t2, y2 in segs:
        ax, ay, bx, by = t1 * .72, y1, t2 * .72, y2
        vx, vy = bx - ax, by - ay
        h = np.clip(((u - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy), 0, 1)
        d = np.minimum(d, np.hypot(u - ax - vx * h, y - ay - vy * h))
    return d

def make_scene(st):
    hole = st.get('hole', False)
    if not st.get('split'):
        def whole(p):
            d = shell(p)
            if hole: d = np.maximum(d, hole_h(p))
            return d
        return [(whole, None)]
    tp = st['top']
    M = Rz(np.radians(tp['rz'])) @ Rx(np.radians(tp['rx']))
    Minv = M.T; tr = np.array(tp['tr'])
    pv = np.array(tp.get('piv', PIV))
    def to_local(p): return (p - pv - tr) @ Minv.T + pv
    def bottom(p): return np.maximum(shell(p), (p[..., 1] - yc(theta(p))) * 0.7)
    def top(p):
        q = to_local(p)
        d = np.maximum(shell(q), (yc(theta(q)) - q[..., 1]) * 0.7)
        if hole: d = np.maximum(d, hole_h(q))
        return d
    return [(bottom, None), (top, to_local)]

def render(stage):
    st = STAGES[stage]; objs = make_scene(st)
    sdf = lambda p: np.min(np.stack([f(p) for f, _ in objs]), 0)
    s = np.linspace(-E, E, W)
    X, Y = np.meshgrid(s, -s + 0.02)
    ro = np.stack([X, Y * np.cos(TILT) + 3 * np.sin(TILT), -Y * np.sin(TILT) + 3 * np.cos(TILT)], -1)
    rd = np.array([0, -np.sin(TILT), -np.cos(TILT)])
    ro = ro.reshape(-1, 3)
    t = np.zeros(len(ro)); hit = np.zeros(len(ro), bool)
    alive = np.ones(len(ro), bool)
    for _ in range(160):
        ia = np.where(alive)[0]
        if len(ia) == 0: break
        p = ro[ia] + rd * t[ia, None]
        d = sdf(p)
        t[ia] += np.maximum(d * 0.6, 2e-4)
        h = d < 2.5e-4; far = t[ia] > 6.5
        hit[ia[h]] = True; alive[ia[h | far]] = False
    hi = np.where(hit)[0]
    P = ro[hi] + rd * t[hi, None]
    ds = np.stack([f(P) for f, _ in objs]); oid = np.argmin(ds, 0)
    e = 1e-3
    def nrm(P):
        ex = np.eye(3) * e
        n = np.stack([sdf(P + ex[i]) - sdf(P - ex[i]) for i in range(3)], -1)
        return n / np.linalg.norm(n, axis=-1, keepdims=True)
    n = nrm(P); v = -rd
    L = P.copy()
    for k, (_, tl) in enumerate(objs):
        if tl is not None: L[oid == k] = tl(P[oid == k])
    eg = egg_d(L)
    outer = eg > -0.006; inner = eg < -TH + 0.006; edge = ~outer & ~inner

    col = np.zeros((len(P), 3)); alpha = np.ones(len(P)); glow = np.zeros(len(P))
    Ld = np.array([-0.4, 0.8, 0.45]); Ld /= np.linalg.norm(Ld)
    nv = np.clip(np.abs(n @ v), 0, 1)
    dif = np.clip((n @ Ld + 0.6) / 1.6, 0, 1)
    xv, yv = L[:, 0], L[:, 1]
    thick = nv**1.1
    core = np.exp(-((xv + 0.08)**2 / 0.75 + (yv + 0.25)**2 / 1.1))
    core *= 1 + 0.25 * np.exp(-((xv - 0.25)**2 + (yv - 0.05)**2) / 0.08) - 0.15 * np.exp(-((xv + 0.3)**2 + (yv - 0.35)**2) / 0.1)
    dens = np.clip(0.05 + 0.95 * thick * core, 0, 1)**1.15
    c1 = np.clip(dens * 1.6, 0, 1)[:, None]; c2 = np.clip(dens * 1.6 - 0.6, 0, 1)[:, None]
    oc = MILK * (1 - c1) + KD * c1; oc = oc * (1 - c2) + DEEP * c2
    oc = oc * (0.84 + 0.18 * dif)[:, None] + (0.08 * dif**3)[:, None]
    hv = Ld + v; hv /= np.linalg.norm(hv)
    oc += (np.clip(n @ hv, 0, 1)**8 * 0.12)[:, None]
    fr = (1 - nv)**3
    oc = oc * (1 - 0.55 * fr)[:, None] + np.array([0.97, 1, 1]) * (0.55 * fr)[:, None]
    oa = np.clip(0.60 + 0.38 * nv**0.8 + 0.2 * dens, 0, 1)

    g = st.get('glow', 0.0)
    segs = polylines(st)
    if len(segs):
        cd = crack_dist(L, segs)
        groove = np.clip(1 - cd / 0.024, 0, 1)**1.5          # 금 주변이 살짝 패여 짙어짐
        line = np.clip(1 - cd / 0.0115, 0, 1)                # 금 가운데: 빛이 새는 틈
        oc = oc * (1 - 0.45 * groove)[:, None] + DEEP * 0.75 * (0.45 * groove)[:, None]
        oc = oc * (1 - line)[:, None] + (GOLD * (0.85 + 0.15 * min(g, 1)))[None] * line[:, None]
        oa = np.maximum(oa, groove)
        glow += line * g * outer
    col[outer] = oc[outer]; alpha[outer] = oa[outer]
    inn = GOLD * 0.9 + 0.1
    col[inner] = inn * (0.92 + 0.08 * nv[inner])[:, None]; alpha[inner] = 1
    glow[inner] += 0.9 * g
    if st.get('split'):
        # 떨어져 나간 위 껍데기 안쪽은 빛이 빠져 은은한 깨두 색
        ti = inner & (oid == 1)
        tc = (MILK * 0.3 + KD * 0.7) * (0.72 + 0.2 * nv[ti])[:, None]
        far_ = 1.0 if st.get('burst') else 0.0
        col[ti] = col[ti] * (1 - far_) + tc * far_; alpha[ti] = 1
        glow[ti] *= (1 - 0.85 * far_)
        te = edge & (oid == 1); glow[te] *= (1 - 0.7 * far_)
    col[edge] = np.array([1.0, 0.99, 0.95]); alpha[edge] = 1
    glow[edge] += 0.5 * g

    img = np.zeros((W * W, 4)); img[hi, :3] = np.clip(col, 0, 1); img[hi, 3] = alpha
    img = img.reshape(W, W, 4)
    gb = np.zeros(W * W); gb[hi] = glow; gb = gb.reshape(W, W)
    halo = gaussian_filter(gb, 4) * 0.9 + gaussian_filter(gb, 22) * 1.6
    bu = st.get('burst', 0)
    if bu:
        cy = 0.10; cx = 0.0
        sy = cy * np.cos(TILT)
        YY = -s[:, None] + 0.02; XX = s[None, :]
        dx, dy = XX - cx, YY - sy
        r = np.hypot(dx, dy * 0.85); ang = np.arctan2(dy, dx)
        rays = 0.55 + 0.45 * np.cos(ang * 9 + 0.6)**8
        up = np.clip(0.55 + 0.45 * np.sin(ang), 0.25, 1)
        burst = (np.exp(-(r / (0.32 + 0.25 * bu))**2) * 1.1 + np.exp(-(r / (0.70 + 0.35 * bu))**2) * rays * 0.6) * up * bu
        burst_b = burst
    else:
        burst_b = 0
    a0 = img[..., 3]
    halo = halo + burst_b * (1 - 0.92 * a0)
    halo = np.clip(halo, 0, 1.4)
    hc = np.clip(halo, 0, 1)
    rgb = img[..., :3] * a0[..., None]
    rgb = rgb + (GOLD * 0.6 + 0.4)[None, None] * hc[..., None] * (1 - 0.35 * a0[..., None])
    a = np.clip(a0 + hc * (1 - a0) * 0.85, 0, 1)
    rgb = np.where(a[..., None] > 0, np.clip(rgb / np.maximum(a[..., None], 1e-6), 0, 1), 0)
    gr = gaussian_filter(np.random.default_rng(7).normal(0, 1, (W, W)), 0.8); gr /= gr.std()
    rgb = np.clip(rgb + (gr * 0.014)[..., None] * (a0 > 0)[..., None], 0, 1)
    out = np.concatenate([rgb, a[..., None]], -1)
    im = Image.fromarray((out * 255).astype(np.uint8), 'RGBA')
    if W != N: im = im.resize((N, N), Image.LANCZOS)
    os.makedirs('out', exist_ok=True)
    im.save(f'out/dreamegg_{stage:02d}.png')

if __name__ == '__main__':
    for sgi in map(int, sys.argv[1:]): render(sgi); print('done', sgi, flush=True)
