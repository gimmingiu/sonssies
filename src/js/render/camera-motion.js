// == 카메라 움직임: 확대·시선·화면 옮기기·부위로 천천히 이동(camTo), 매 프레임 그리기(frame)
// 돌려보기 줌: 휠·핀치·버튼. 가까워질수록 시선이 얼굴 쪽으로 살짝 올라감
let camBase={d:8,y:1.8,ty:1},zoom=1,zoomT=1;
// 시선 높이: 꾸미기에서 고치는 부위(얼굴 등)로 카메라가 옮겨 갈 때 focusK(0~1)만큼 focusH 쪽으로
let focusK=0,focusKT=0,focusH=0;
// 화면 옮기기(꾸미기에서 확대한 뒤 끌어서 보고 싶은 부위를 가운데로): 시선을 옆·위아래로 panX·panY만큼
let panX=0,panY=0;
function placePersp(){const z=zoom;let ty=camBase.ty+(z-1)*0.18*camBase.ty;if(focusK>1e-3)ty+=(focusH-ty)*focusK;
  ty+=panY+(camBase.sh||0);persp.position.set(panX,ty+(camBase.y-camBase.ty)/z,camBase.d/z);persp.lookAt(panX,ty,0)}
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
function setZoom(z){zoomT=Math.max(ZMIN,Math.min(ZMAX,z))}   // 확대는 손가락 벌리기·휠·부위 이동으로만(슬라이더 없음)
function frame(){
  if(mode==='rot'&&chars[0]&&camTw){camStep(performance.now());chars[0].rotation.y=angle}
  else if(mode==='rot'&&chars[0]){if(spinning&&!dragging)target+=0.006;angle+=(target-angle)*0.12;chars[0].rotation.y=angle;
    if(Math.abs(zoomT-zoom)>1e-4||Math.abs(focusKT-focusK)>1e-3){zoom+=(zoomT-zoom)*0.14;focusK+=(focusKT-focusK)*0.14;placePersp()}}
  flowFrame(performance.now());
  if(stage.offsetParent!==null&&!thumbBusy)renderer.render(scene,persp);requestAnimationFrame(frame);   // 미리보기가 안 보이는 화면에선 그리지 않음(배터리)
  if(chars[0]&&!frame.ok){frame.ok=1;window.__dkIntroReady&&window.__dkIntroReady()}
}
