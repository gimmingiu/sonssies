// ---------- 꿈알 ----------
// 누를 때마다 12단계의 알 모습으로 바뀜. 단계마다 금(움푹 팬 홈)·안에서 새는 빛·떨어져 나가는 껍질 조각·
// 들썩이는 윗뚜껑이 달라지고, 바뀌는 순간마다 통 튀고 찌그러지는 모션이 붙음. 12번째에 뚜껑이 날아가며 손시가 나옴.
let egg=null,eggTaps=0,eggDone=false;const EGG_N=12;
function seeded(n){return()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const EGG_H=2.05,EGG_R=0.8,EGG_K=1.3,EGG_CUT=1-470/1024;   // 높이·반지름·화면 배율·뚜껑이 갈라지는 높이(금이 지나가는 줄)
const eggProfile=t=>{const u=t*2-1;return EGG_R*Math.sqrt(Math.max(0,1-u*u))*(1-0.16*u)};
// 단계별 모습 정의: 금(선), 구멍(빛이 보이는 깨진 자리), 떨어지는 조각 수, 안쪽 빛 세기, 뚜껑 들림
const EGG_STAGES=(()=>{const R=seeded(11),X=0.41;
  const path=(x0,y0,a,L,n,jit)=>{const p=[[x0,y0]];let x=x0,y=y0;for(let i=0;i<n;i++){const aa=a+(R()-.5)*jit;x+=Math.cos(aa)*L/n;y+=Math.sin(aa)*L/n;p.push([x,y])}return p};
  const zig=dir=>{const p=[[0,470]];let x=0,y=470;for(let i=0;i<12;i++){x+=dir*(36+R()*14);y+=(i%2?1:-1)*(20+R()*18);p.push([x,y])}return p};
  const Rz=zig(1),Lz=zig(-1);
  const cracks=[],holes=[];const C=(s,pts,w)=>cracks.push({s,pts,w:(w||8)*1.8});
  const H=(s,[cx,cy],r)=>{const p=[];const n=8;r*=3.6;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=r*(0.6+R()*0.55);p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*0.85])}holes.push({s,p})};   // 깨져 떨어진 자리(가로는 둘레 늘어남만큼 보정)
  C(1,Rz.slice(0,2),6);C(1,path(0,470,-2.2,34,3,0.6),4);
  C(2,Rz.slice(1,3));C(2,Lz.slice(0,2));
  C(3,Lz.slice(1,4));C(3,Rz.slice(2,4));C(3,path(Rz[1][0],Rz[1][1],-1.5,46,4,0.8),5);
  C(4,Rz.slice(3,6));C(4,path(Rz[2][0],Rz[2][1],-1.9,80,5,0.8),5);H(4,Rz[1],15);
  C(5,Lz.slice(3,6));C(5,path(Lz[3][0],Lz[3][1],1.4,90,5,0.8),5);
  C(6,Rz.slice(5,8));C(6,path(Rz[5][0],Rz[5][1],1.5,100,6,0.9),5);H(6,Lz[2],18);
  C(7,Lz.slice(5,8));C(7,path(Lz[6][0],Lz[6][1],-1.6,100,6,0.9),5);H(7,Rz[4],13);
  C(8,Rz.slice(7,10));C(8,Lz.slice(7,10));C(8,path(Rz[1][0],Rz[1][1],-1.3,130,7,0.9),5);
  C(9,Rz.slice(9));C(9,Lz.slice(9));C(9,path(Lz[1][0],Lz[1][1],1.8,120,7,0.9),5);H(9,Rz[6],20);H(9,Lz[5],16);
  C(10,path(Rz[7][0],Rz[7][1],-1.7,120,6,1),4);C(10,path(Lz[5][0],Lz[5][1],-1.2,110,6,1),4);H(10,[0,470],22);
  C(11,path(Rz[3][0],Rz[3][1],1.6,90,5,1),4);C(11,path(0,470,1.57,130,7,0.8),6);H(11,Lz[8],18);H(11,Rz[9],16);
  // 단계별: 떨어질 조각 수, 안쪽 빛(0~1), 뚜껑 들림(높이, 기울기)
  const S=[null,{f:0,g:.05},{f:1,g:.1},{f:0,g:.16},{f:2,g:.24},{f:1,g:.3},{f:2,g:.4},{f:2,g:.48},{f:1,g:.56},{f:3,g:.66},{f:2,g:.76,lid:[.025,.05]},{f:3,g:.88,lid:[.06,-.11]},{f:0,g:1,lid:[.1,.14]}];
  return {cracks,holes,S,X}})();
function eggUV(px,py){return {u:px/1024,v:1-py/1024}}
function eggPoint(u,v){   // 알 표면 위의 점(알 그룹 좌표)
  const a=u*Math.PI*2,r=eggProfile(v);return new THREE.Vector3(Math.sin(a)*r,v*EGG_H,Math.cos(a)*r)}
function lathePart(t0,t1,n){   // 알의 아래·위 조각. v(세로 텍스처 좌표)는 알 전체 기준으로 맞춤
  const pts=[];for(let i=0;i<=n;i++){const t=t0+(t1-t0)*i/n;pts.push(new THREE.Vector2(Math.max(eggProfile(t),1e-4),t*EGG_H))}
  const g=new THREE.LatheGeometry(pts,72),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setY(i,t0+(t1-t0)*uv.getY(i));return g}
function makeEgg(){
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=1024;return c};
  const base=mk(),bx=base.getContext('2d');
  bx.fillStyle='#fbf7ee';bx.fillRect(0,0,1024,1024);
  const rnd=seeded(5),rr=(a,b)=>a+rnd()*(b-a);bx.fillStyle='#37c3dc';bx.globalAlpha=.85;   // 늘 같은 무늬
  for(let i=0;i<14;i++){const cx=rr(0,1024),cy=rr(250,820),rx=rr(16,30),ry=rx*rr(2.2,2.8);
    for(const ox of[-1024,0,1024]){bx.beginPath();bx.ellipse(cx+ox,cy,rx,ry,0,0,Math.PI*2);bx.fill()}}
  bx.globalAlpha=1;
  const col=mk(),bump=mk(),glow=mk();
  const T=c=>{const t=new THREE.CanvasTexture(c);return t};
  const tex=T(col);tex.encoding=THREE.sRGBEncoding;const btex=T(bump),gtex=T(glow);gtex.encoding=THREE.sRGBEncoding;
  const mat=clay('#ffffff');mat.map=tex;mat.bumpMap=btex;mat.bumpScale=0.045;mat.emissive=new THREE.Color(0xffa21f);mat.emissiveMap=gtex;mat.emissiveIntensity=0;
  const lo=new THREE.Mesh(lathePart(0,EGG_CUT,30),mat),hi=new THREE.Mesh(lathePart(EGG_CUT,1,22),mat);
  [lo,hi].forEach(m=>{m.castShadow=true;m.receiveShadow=true});
  // 뚜껑: 앞쪽 가장자리를 축으로 들림. 들리면 틈 사이로 빛 고리가 보임
  const lid=new THREE.Group(),pv=eggPoint(0,EGG_CUT);lid.position.set(0,pv.y,0);hi.position.y=-pv.y;lid.add(hi);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(eggProfile(EGG_CUT)*0.985,0.03,8,72),new THREE.MeshBasicMaterial({color:0xffc54a,transparent:true,opacity:0}));
  ring.rotation.x=Math.PI/2;ring.position.y=pv.y;
  const g=new THREE.Group();g.add(lo,lid,ring);scene.add(g);
  egg={g,lo,hi,lid,ring,mat,base,col,bump,glow,tex,btex,gtex,wob:0,wv:0,sq:0,hop:0,hv:0,pulse:0,glowT0:0,stage:0,lidY:0,lidR:0,bits:[]};
  eggStage(0);
}
function hatchedUI(on){$('eggHint').hidden=on;$('eggGuide').hidden=!on;$('starts').hidden=!on;$('eggGo').hidden=!on;$('app').querySelector('.stagehold[data-size="egg"]').classList.toggle('done',on)}
function enterEgg(){if(eggDone){hatchedUI(true);if(chars[0])chars[0].visible=true;return}hatchedUI(false);if(!egg)makeEgg();egg.g.visible=true;if(chars[0])chars[0].visible=false;$('eggHint').textContent='알을 깨서 손시를 깨워주세요.'}
function leaveEgg(){if(egg){scene.remove(egg.g);egg.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});[egg.mat,egg.ring.material].forEach(m=>m.dispose());[egg.tex,egg.btex,egg.gtex].forEach(t=>t.dispose());
  egg.bits.forEach(b=>{scene.remove(b.m);b.m.geometry.dispose()});egg=null}if(chars[0])chars[0].visible=true}
// n단계 알 그림(색·홈·빛 세 장)을 그림. 오래된 금일수록 조금씩 벌어짐
function eggStage(n){
  const {cracks,holes,X}=EGG_STAGES,c=egg.col.getContext('2d'),b=egg.bump.getContext('2d'),g=egg.glow.getContext('2d');
  c.drawImage(egg.base,0,0);b.fillStyle='#fff';b.fillRect(0,0,1024,1024);g.fillStyle='#000';g.fillRect(0,0,1024,1024);
  [c,b,g].forEach(x=>{x.lineCap='round';x.lineJoin='round'});
  const poly=(x,pts,ox)=>{x.beginPath();pts.forEach(([a,y],i)=>{const xx=a*X+ox;i?x.lineTo(xx,y):x.moveTo(xx,y)})};
  for(const ox of[0,1024]){
    cracks.filter(k=>k.s<=n).forEach(k=>{const age=n-k.s,w=k.w*(1+Math.min(age,6)*0.12);
      poly(b,k.pts,ox);b.lineWidth=w+10;b.strokeStyle='#8a8a8a';b.stroke();b.lineWidth=w;b.strokeStyle='#000';b.stroke();   // 움푹 팬 홈
      poly(c,k.pts,ox);c.lineWidth=w+5;c.strokeStyle='rgba(255,255,255,.95)';c.stroke();c.lineWidth=w;c.strokeStyle='#5b4a3b';c.stroke();
      if(n>=3){poly(c,k.pts,ox);c.lineWidth=Math.max(2,w*0.45);c.strokeStyle='#ffb31a';c.stroke();
        poly(g,k.pts,ox);g.save();g.shadowColor='#fff';g.shadowBlur=10+n*2;g.lineWidth=Math.max(3,w*0.8);g.strokeStyle='#fff';g.stroke();g.restore()}});   // 금 사이로 새는 빛
    holes.filter(h=>h.s<=n).forEach(h=>{
      poly(b,h.p,ox);b.closePath();b.fillStyle='#000';b.fill();
      poly(c,h.p,ox);c.closePath();c.fillStyle='#5b4a3b';c.fill();c.lineWidth=5;c.strokeStyle='rgba(255,255,255,.95)';c.stroke();
      const sh=h.p.map(([a,y])=>[a*0.72+h.p[0][0]*0+ (h.p.reduce((s,q)=>s+q[0],0)/h.p.length)*0.28,y*0.72+(h.p.reduce((s,q)=>s+q[1],0)/h.p.length)*0.28]);
      poly(c,sh,ox);c.closePath();c.fillStyle='#ffc23d';c.fill();poly(g,h.p,ox);g.closePath();g.save();g.shadowColor='#fff';g.shadowBlur=24;g.fillStyle='#fff';g.fill();g.restore()});
  }
  egg.tex.needsUpdate=egg.btex.needsUpdate=egg.gtex.needsUpdate=true;egg.stage=n;
}
// 떨어져 나가는 껍질 조각: 금 근처에서 튀어나와 굴러 떨어지며 작아짐
function eggBits(n,cnt){
  const {cracks,X}=EGG_STAGES,R=seeded(100+n),ks=cracks.filter(k=>k.s===n||k.s===n-1);if(!ks.length)return;
  for(let i=0;i<cnt;i++){const k=ks[Math.floor(R()*ks.length)],p=k.pts[Math.floor(R()*k.pts.length)];
    const u=((p[0]*X)/1024+1)%1,v=1-p[1]/1024,pt=eggPoint(u,v).multiplyScalar(EGG_K);
    const s=0.07+R()*0.06,geo=new THREE.SphereGeometry(s*2.2,8,6,0,0.9+R()*0.5,1.1,0.8+R()*0.4);
    const m=new THREE.Mesh(geo,egg.mat);m.castShadow=true;m.position.copy(pt).add(egg.g.position);
    const out=new THREE.Vector3(pt.x,0,pt.z).normalize();
    scene.add(m);egg.bits.push({m,v:new THREE.Vector3(out.x*(0.9+R()*0.8)+(R()-.5)*0.8,1.6+R()*1.4,out.z*1.2+0.6),w:new THREE.Vector3(R()*8,R()*8,R()*8),t:0})}
}
canvas.addEventListener('pointerdown',e=>{
  if(scrNow!=='egg')return;e.stopImmediatePropagation();e.preventDefault();if(eggDone||!egg||egg.glowT0)return;
  eggTaps++;const n=eggTaps,S=EGG_STAGES.S[n];eggStage(n);
  egg.wv+=(0.05+n*0.012)*(n%2?-1:1);egg.sq=1;egg.hv=0.9+n*0.08;egg.pulse=1;   // 찌그러짐 → 통 뜀 → 흔들림 → 빛 번쩍
  if(S.f)eggBits(n,S.f);
  try{navigator.vibrate&&navigator.vibrate(10+n*2)}catch(_){}
  $('eggHint').textContent=n<4?'알을 깨서 손시를 깨워주세요.':n<9?'조금만 더!':'곧 나올 것 같아!';
  if(n>=EGG_N)egg.glowT0=performance.now();
},true);
let eggLast=0;
function eggFrame(now){
  const dt=Math.min(0.05,eggLast?(now-eggLast)/1000:0.016);eggLast=now;
  const S=EGG_STAGES.S[egg.stage]||{g:0};
  egg.wv+=-egg.wob*0.22;egg.wv*=0.84;egg.wob+=egg.wv;egg.sq*=0.82;
  egg.hop+=egg.hv*dt;egg.hv-=9*dt;if(egg.hop<0){egg.hop=0;if(egg.hv<-0.5)egg.sq=Math.max(egg.sq,0.6);egg.hv=0}   // 통 뜀(착지하면 한 번 더 찌그러짐)
  egg.pulse*=0.9;
  let sh=0,glow=S.g*1.1+egg.pulse*0.5;
  if(egg.stage>=8)sh+=Math.sin(now/45)*0.004*(egg.stage-7);                       // 깨지기 직전엔 계속 바르르
  if(egg.stage>=6)glow+=Math.sin(now/260)*0.08;                                    // 안쪽 빛이 숨 쉬듯
  // 뚜껑: 단계에 맞춰 부드럽게 들썩
  const L=S.lid||[0,0];egg.lidY+=(L[0]-egg.lidY)*0.18;egg.lidR+=(L[1]-egg.lidR)*0.18;
  if(egg.glowT0){const t=(now-egg.glowT0)/700;glow=1.2+t*1.4;sh=Math.sin(now/22)*0.05*Math.min(1,t);egg.lidY+=t*0.02;
    if(t>=1&&!eggDone)hatch()}
  egg.mat.emissiveIntensity=Math.max(0,glow);
  egg.lid.position.y=eggPoint(0,EGG_CUT).y+egg.lidY;egg.lid.rotation.z=egg.lidR;
  egg.ring.material.opacity=Math.min(1,egg.lidY*14);
  egg.g.position.y=egg.hop*0.25;egg.g.rotation.z=egg.wob+sh;
  egg.g.scale.set(EGG_K*(1+egg.sq*0.05),EGG_K*(1-egg.sq*0.07),EGG_K*(1+egg.sq*0.05));
  egg.bits=egg.bits.filter(b=>{b.t+=dt;b.v.y-=6*dt;b.m.position.addScaledVector(b.v,dt);if(b.m.position.y<0.05){b.m.position.y=0.05;b.v.y*=-0.3;b.v.x*=0.6;b.v.z*=0.6}
    b.m.rotation.x+=b.w.x*dt;b.m.rotation.y+=b.w.y*dt;const k=Math.max(0,1-Math.max(0,b.t-0.9)/0.5);b.m.scale.setScalar(k);
    if(k<=0){scene.remove(b.m);b.m.geometry.dispose();return false}return true});
}
function hatch(){
  eggDone=true;const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),1200);
  setTimeout(()=>{if(egg)egg.g.visible=false;if(chars[0]){chars[0].visible=true}popT0=performance.now();
    hatchedUI(true);layout();ST.hatched=true;Save.commit()},200);
}

