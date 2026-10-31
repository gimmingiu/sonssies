// ---------- 카메라 / 배치 ----------
// 기본 몸 길이·머리 높이로 선 깨두의 키(뿔 자리 포함). 카메라 거리는 이 키 기준으로 고정하고, 이보다 큰 손시만 그만큼 물러남
const REF_H=0.78*1+2*0.68*1-0.08+0.3;
const frameH=()=>Math.max(REF_H,charH);
const persp=new THREE.PerspectiveCamera(26,1,0.1,60);
let mode='rot',chars=[],angle=0,target=0,spinning=false,charH=2.2,charW=2.7;
const VIEWS=[['앞','',0],['3/4','',-Math.PI/4],['옆','',-Math.PI/2],['뒤','',Math.PI]];
function layout(){
  const w=stage.clientWidth,h=stage.clientHeight,asp=w/h;if(!w||!h)return;
  renderer.setSize(w,h,false);
  const ch=frameH();   // 카메라는 기본 키(깨두) 기준으로 고정 → 작은 손시는 작게 보임. 더 큰 손시만 물러남
  persp.aspect=asp;let d=(asp<1?10.5:8.2)*ch/2.2;const need=(Math.max(charW,2.6)*0.5*1.18)/(Math.tan(persp.fov*Math.PI/360)*asp);if(need>d)d=need;
  const sh=stage.parentNode&&stage.parentNode.dataset?stage.parentNode.dataset.size:'';const tyK=sh==='main'?0.63:0.46;   // 메인은 손시가 박스 아래쪽에 서 있게(시선을 조금 위로)
  camBase={d,y:ch*0.8,ty:ch*tyK,sh:0};placePersp();persp.updateProjectionMatrix();
  // 메인: 발 아래 남는 여백의 절반만큼 손시를 더 아래로(화면 크기와 상관없이 같은 비율). 시선과 카메라를 함께 내려서 각도는 그대로
  if(sh==='main'){persp.updateMatrixWorld(true);const v=new THREE.Vector3(0,0,0).project(persp),gap=h-(1-v.y)/2*h,visH=2*persp.position.distanceTo(new THREE.Vector3(0,camBase.ty,0))*Math.tan(persp.fov*Math.PI/360);
    camBase.sh=gap/2/h*visH;placePersp()}
}
function dispose(o){o.traverse(m=>{if(m.geometry&&!m.userData.keep)m.geometry.dispose();if(m.material&&m.material.type==='ShadowMaterial')m.material.dispose()})}
let mats=null,earMats=[],depthOnly=null;
function rebuild(fine=true){
  const B=getBody(fine?0.02:0.034);
  chars.forEach(c=>{scene.remove(c);dispose(c)});chars=[];
  if(mats){[mats.body,mats.head,mats.white,mats.dark,mats.pink,mats.pinkIn,mats.sweatMat].forEach(m=>m.dispose());earMats.forEach(m=>m.dispose())}
  earMats=[];
  const bump=true;
  const _hy=B.model.L+0.68*P.headH-0.08, _u=B.model.upper;
  mats={body:maskMat(P.color,1,B.model.mask,bump),head:clay(P.color),white:clay('#f5f9f8'),dark:clay('#1f2629',0.75,false,true),pink:clay(P.blushColor||'#f6b3a9'),pinkIn:clay('#f08a86',0.8,false,true),sweatMat:clay('#f2fbfd',0.4,false,true)};
  // 귀는 질감 없이 매끈하게 (귓바퀴 라인을 깔끔하게)
  mats.ear=[U=>{const m=maskMat(P.color,2,U,false);earMats.push(m);return m},U=>{const m=maskMat(P.color,2,U,false);earMats.push(m);return m}];
  const n=1;
  for(let i=0;i<n;i++){const c=build(mats,B);scene.add(c);chars.push(c)}
  if(scrNow==='egg'&&!eggDone)chars[0].visible=false;   // 알 화면에선 알이 깨질 때까지 숨김

  const box=new THREE.Box3().setFromObject(chars[0]);charW=box.max.x-box.min.x;
  // 높이는 뿔 유무와 상관없이 '머리 꼭대기 + 뿔 자리'로 고정 → 뿔을 켜고 꺼도 배치·크기가 그대로
  charH=B.model.L+2*0.68*P.headH-0.08+0.3;
  document.getElementById('ratio').textContent=RATIO.toFixed(1)+' : 1';
  const lr=P.lowerRatio;document.getElementById('ratio2').textContent=((1-lr)/lr).toFixed(2).replace(/\.?0+$/,'')+' : 1';
  document.getElementById('texChip').textContent=curTex().name;
  layout();afterRebuild();
}
// 돌려보기 줌: 휠·핀치·버튼. 가까워질수록 시선이 얼굴 쪽으로 살짝 올라감
let camBase={d:8,y:1.8,ty:1},zoom=1,zoomT=1;
// 시선 높이: 꾸미기에서 고치는 부위(얼굴 등)로 카메라가 옮겨 갈 때 focusK(0~1)만큼 focusH 쪽으로
let focusK=0,focusKT=0,focusH=0;
// 화면 옮기기(꾸미기에서 확대한 뒤 끌어서 보고 싶은 부위를 가운데로): 시선을 옆·위아래로 panX·panY만큼
let panX=0,panY=0;
function placePersp(){const z=zoom;let ty=camBase.ty+(z-1)*0.18*camBase.ty;if(focusK>1e-3)ty+=(focusH-ty)*focusK;ty+=panY+(camBase.sh||0);persp.position.set(panX,ty+(camBase.y-camBase.ty)/z,camBase.d/z);persp.lookAt(panX,ty,0)}
function panBy(dx,dy){const k=2*(camBase.d/zoom)*Math.tan(persp.fov*Math.PI/360)/Math.max(1,stage.clientHeight);
  panX=clamp(panX-dx*k,-charW*0.55,charW*0.55);panY=clamp(panY+dy*k,-charH*0.75,charH*0.75);placePersp()}
// 부위로 옮겨 갈 때: 각도·확대·시선·화면 위치를 한꺼번에 천천히 시작해서 천천히 멈추게(툭 튀지 않게)
let camTw=null;
const easeIO=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function camTo(o,dur=700){
  camTw={t0:performance.now(),dur,f:{a:angle,z:zoom,k:focusK,h:focusH,x:panX,y:panY},t:{a:o.a,z:o.z,k:o.k,h:o.h,x:0,y:0}};
  if(focusK<1e-3)camTw.f.h=o.h;   // 시선을 옮기지 않던 상태면 높이는 바로 목표로(움직임은 k가 맡음)
  target=o.a;zoomT=o.z;focusKT=o.k;focusH=o.h;setZoom(o.z)}
function camStop(){if(!camTw)return;camTw=null;target=angle;zoomT=zoom;focusKT=focusK}
function camStep(now){const T=camTw,u=Math.min(1,(now-T.t0)/T.dur),e=easeIO(u),L=(a,b)=>a+(b-a)*e;
  angle=L(T.f.a,T.t.a);zoom=L(T.f.z,T.t.z);focusK=L(T.f.k,T.t.k);focusH=L(T.f.h,T.t.h);panX=L(T.f.x,T.t.x);panY=L(T.f.y,T.t.y);placePersp();
  if(u>=1)camTw=null}
const ZMIN=0.6,ZMAX=3;
// 슬라이더 위치(0~1): 아래 절반 = 60~100%, 위 절반 = 100~300% (각각 로그 비율) → 100%가 정확히 가운데
const zT=z=>z<=1?0.5*Math.log(z/ZMIN)/Math.log(1/ZMIN):0.5+0.5*Math.log(z)/Math.log(ZMAX);
const zFromT=t=>t<=0.5?ZMIN*Math.pow(1/ZMIN,t/0.5):Math.pow(ZMAX,(t-0.5)/0.5);
function setZoom(z){zoomT=Math.max(ZMIN,Math.min(ZMAX,z));const pc=Math.round(zoomT*100),zv=document.getElementById('zVal');if(zv)zv.textContent=pc+'%';
  const t=zT(zoomT),th=document.getElementById('zThumb');if(th){th.style.top=`calc(6px + ${(1-t).toFixed(4)} * (100% - 12px))`;document.getElementById('zFill').style.height=`calc(${t.toFixed(4)} * (100% - 12px))`;document.getElementById('zTrack').setAttribute('aria-valuenow',pc)}}
function frame(){
  if(mode==='rot'&&chars[0]&&camTw){camStep(performance.now());chars[0].rotation.y=angle}
  else if(mode==='rot'&&chars[0]){if(spinning&&!dragging)target+=0.006;angle+=(target-angle)*0.12;chars[0].rotation.y=angle;
    if(Math.abs(zoomT-zoom)>1e-4||Math.abs(focusKT-focusK)>1e-3){zoom+=(zoomT-zoom)*0.14;focusK+=(focusKT-focusK)*0.14;placePersp()}}
  flowFrame(performance.now());
  if(stage.offsetParent!==null&&!thumbBusy)renderer.render(scene,persp);requestAnimationFrame(frame);   // 미리보기가 안 보이는 화면에선 그리지 않음(배터리)
  if(chars[0]&&!frame.ok){frame.ok=1;window.__dkIntroReady&&window.__dkIntroReady()}
}
let dragging=false,lastX=0,lastY=0,sx=0,sy=0,axis=null;const ptrs=new Map();let pinch0=0,zoom0=1,mid0=null;
// 끌기: 옆으로 = 돌리기, 위아래로 = 화면 옮기기(꾸미기 화면에서만). 처음 움직인 방향으로 정해짐. 두 손가락 = 확대·축소 + 화면 옮기기
const canPan=()=>typeof scrNow!=='undefined'&&scrNow==='step';
const midOf=()=>{const [a,b]=[...ptrs.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
canvas.addEventListener('pointerdown',e=>{if(mode!=='rot')return;camStop();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);zoom0=zoomT;mid0=midOf();dragging=false}
  else{dragging=true;lastX=sx=e.clientX;lastY=sy=e.clientY;axis=null;canvas.style.cursor='grabbing'}});
canvas.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2&&pinch0>0){const [a,b]=[...ptrs.values()];const z=zoom0*Math.hypot(a.x-b.x,a.y-b.y)/pinch0;setZoom(z);zoom=zoomT;
    const m=midOf();if(canPan())panBy(m.x-mid0.x,m.y-mid0.y);mid0=m;placePersp();return}
  if(!dragging)return;
  if(!axis){if(Math.hypot(e.clientX-sx,e.clientY-sy)<6)return;axis=canPan()&&Math.abs(e.clientY-sy)>Math.abs(e.clientX-sx)*1.1?'y':'x'}
  if(axis==='x'){target+=(e.clientX-lastX)*0.012;setViewPressed(null)}else panBy(0,e.clientY-lastY);
  lastX=e.clientX;lastY=e.clientY});
const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;if(ptrs.size===0){dragging=false;canvas.style.cursor=''}else if(ptrs.size===1){const p=[...ptrs.values()][0];lastX=sx=p.x;lastY=sy=p.y;axis=null;dragging=true}};
canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
canvas.addEventListener('wheel',e=>{if(mode!=='rot')return;e.preventDefault();camStop();setZoom(zoomT*Math.exp(-e.deltaY*0.0015))},{passive:false});
canvas.addEventListener('dblclick',()=>{if(mode!=='rot')return;camStop();setZoom(1);panX=panY=0;placePersp()});
// +/−: 지금 값이 어디든 5% 단위 칸으로 이동 (102% → + → 105%, − → 100%)
const zStep=d=>{const p=Math.round(zoomT*1000)/10;setZoom((d>0?(Math.floor(p/5+1e-6)+1):(Math.ceil(p/5-1e-6)-1))*5/100)};
document.getElementById('zIn').onclick=()=>zStep(1);
document.getElementById('zOut').onclick=()=>zStep(-1);
{const tr=document.getElementById('zTrack');let on=false;
 const at=e=>{const r=tr.getBoundingClientRect(),t=Math.max(0,Math.min(1,1-(e.clientY-r.top-6)/(r.height-12)));setZoom(zFromT(t))};
 tr.addEventListener('pointerdown',e=>{on=true;tr.setPointerCapture(e.pointerId);at(e);e.preventDefault()});
 tr.addEventListener('pointermove',e=>{if(on)at(e)});
 const off=()=>{on=false};tr.addEventListener('pointerup',off);tr.addEventListener('pointercancel',off);
 tr.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowRight'){zStep(1);e.preventDefault()}else if(e.key==='ArrowDown'||e.key==='ArrowLeft'){zStep(-1);e.preventDefault()}});}
setZoom(1);

