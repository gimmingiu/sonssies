// ---------- 꿈알 ----------
let egg=null,eggTaps=0,eggDone=false;const EGG_N=12;
function seeded(n){return()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// 12장의 금: 앞면(카메라 쪽, 가로 0 근처) 가운데에서 시작해 누를 때마다 길어지고 가지가 늘어남. 가로는 0.41배(알 둘레가 늘려 보이는 만큼)
const EGG_CRACKS=(()=>{const R=seeded(11),out=[];const X=0.41;
  const path=(x0,y0,a,L,n,jit)=>{const p=[[x0,y0]];let x=x0,y=y0;for(let i=0;i<n;i++){const aa=a+(R()-.5)*jit;x+=Math.cos(aa)*L/n/X*X;y+=Math.sin(aa)*L/n;p.push([x,y])}return p};
  // 가운데 지그재그 줄(오른쪽·왼쪽으로 자람)
  const zig=(dir)=>{const p=[[0,470]];let x=0,y=470;for(let i=0;i<10;i++){x+=dir*(36+R()*14);y+=(i%2?1:-1)*(20+R()*18);p.push([x,y])}return p};
  const Rz=zig(1),Lz=zig(-1);
  const add=(stage,pts,w)=>out.push({stage,pts,w:(w||7)*1.35});
  add(1,Rz.slice(0,3));add(2,Lz.slice(0,3));add(3,Rz.slice(2,5));add(4,Lz.slice(2,5));
  add(4,path(Rz[2][0],Rz[2][1],-1.9,70,5,0.8),5);
  add(5,Rz.slice(4,7));add(6,Lz.slice(4,7));add(6,path(Lz[3][0],Lz[3][1],1.4,80,5,0.8),5);
  add(7,Rz.slice(6,9));add(7,path(Rz[5][0],Rz[5][1],1.5,90,6,0.9),5);
  add(8,Lz.slice(6,9));add(8,path(Lz[6][0],Lz[6][1],-1.6,90,6,0.9),5);
  add(9,Rz.slice(8));add(9,Lz.slice(8));
  add(10,path(Rz[1][0],Rz[1][1],-1.3,120,7,0.9),5);add(10,path(Lz[1][0],Lz[1][1],1.8,110,7,0.9),5);
  add(11,path(Rz[7][0],Rz[7][1],-1.7,110,6,1),4);add(11,path(Lz[5][0],Lz[5][1],-1.2,100,6,1),4);add(11,path(Rz[3][0],Rz[3][1],1.6,80,5,1),4);
  add(12,path(0,470,-1.57,140,8,0.8),6);add(12,path(0,470,1.57,120,7,0.8),6);
  return out})();
function makeEgg(){
  const H=2.05,R=0.8,pts=[];
  for(let i=0;i<=48;i++){const t=i/48,u=t*2-1,r=R*Math.sqrt(Math.max(0,1-u*u))*(1-0.16*u);pts.push(new THREE.Vector2(Math.max(r,1e-4),t*H))}
  const geo=new THREE.LatheGeometry(pts,72);
  const base=document.createElement('canvas');base.width=base.height=1024;const bx=base.getContext('2d');
  bx.fillStyle='#fbf7ee';bx.fillRect(0,0,1024,1024);
  const rnd=seeded(5),rr=(a,b)=>a+rnd()*(b-a);bx.fillStyle='#37c3dc';bx.globalAlpha=.85;   // 늘 같은 무늬
  for(let i=0;i<14;i++){const cx=rr(0,1024),cy=rr(250,820),rx=rr(16,30),ry=rx*rr(2.2,2.8);
    for(const ox of[-1024,0,1024]){bx.beginPath();bx.ellipse(cx+ox,cy,rx,ry,0,0,Math.PI*2);bx.fill()}}
  bx.globalAlpha=1;
  const cv=document.createElement('canvas');cv.width=cv.height=1024;const x=cv.getContext('2d');x.drawImage(base,0,0);
  const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;
  const mat=clay('#ffffff');mat.map=tex;mat.emissive=new THREE.Color(0xfff6d8);mat.emissiveIntensity=0;
  const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;
  const g=new THREE.Group();g.add(m);scene.add(g);
  egg={g,m,mat,cv,x,base,tex,wob:0,wv:0,sq:0,glowT0:0};
}
function hatchedUI(on){$('eggHint').hidden=on;$('eggGuide').hidden=!on;$('starts').hidden=!on;$('eggGo').hidden=!on;$('app').querySelector('.stagehold[data-size="egg"]').classList.toggle('done',on)}
function enterEgg(){if(eggDone){hatchedUI(true);if(chars[0])chars[0].visible=true;return}hatchedUI(false);if(!egg)makeEgg();egg.g.visible=true;if(chars[0])chars[0].visible=false;$('eggHint').textContent='알을 깨서 손시를 깨워주세요.'}
function leaveEgg(){if(egg){scene.remove(egg.g);egg.m.geometry.dispose();egg.mat.dispose();egg.tex.dispose();egg=null}if(chars[0])chars[0].visible=true}
function eggStage(n){   // n번째 알 모습으로 바꿈
  const x=egg.x;x.drawImage(egg.base,0,0);x.lineCap='round';x.lineJoin='round';
  EGG_CRACKS.filter(c=>c.stage<=n).forEach(c=>{for(const ox of[0,1024]){x.beginPath();c.pts.forEach(([a,b],i)=>{const xx=a*0.41+ox;i?x.lineTo(xx,b):x.moveTo(xx,b)});
    x.lineWidth=c.w+4;x.strokeStyle='rgba(255,255,255,.95)';x.stroke();x.lineWidth=c.w;x.strokeStyle='#5b4a3b';x.stroke()}});
  egg.tex.needsUpdate=true}
canvas.addEventListener('pointerdown',e=>{
  if(scrNow!=='egg')return;e.stopImmediatePropagation();e.preventDefault();if(eggDone||!egg||egg.glowT0)return;
  eggTaps++;eggStage(eggTaps);
  egg.wv+=(0.05+eggTaps*0.011)*(eggTaps%2?-1:1);egg.sq=1;
  try{navigator.vibrate&&navigator.vibrate(10+eggTaps*2)}catch(_){}
  $('eggHint').textContent=eggTaps<4?'알을 깨서 손시를 깨워주세요.':eggTaps<9?'조금만 더!':'곧 나올 것 같아!';
  if(eggTaps>=EGG_N)egg.glowT0=performance.now();
},true);
function eggFrame(now){
  egg.wv+=-egg.wob*0.22;egg.wv*=0.84;egg.wob+=egg.wv;egg.sq*=0.82;
  let sh=0;
  if(egg.glowT0){const t=(now-egg.glowT0)/700;egg.mat.emissiveIntensity=Math.min(1.3,t*1.3);sh=Math.sin(now/22)*0.05*Math.min(1,t);
    if(t>=1&&!eggDone)hatch()}
  egg.g.rotation.z=egg.wob+sh;const K=1.3;egg.g.scale.set(K*(1+egg.sq*0.04),K*(1-egg.sq*0.05),K*(1+egg.sq*0.04));
}
function hatch(){
  eggDone=true;const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),1200);
  setTimeout(()=>{if(egg)egg.g.visible=false;if(chars[0]){chars[0].visible=true}popT0=performance.now();
    hatchedUI(true);layout();ST.hatched=true;Save.commit()},200);
}

