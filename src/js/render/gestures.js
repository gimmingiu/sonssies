// == 미리보기 손가락·마우스 조작: 끌기(돌리기·옮기기)·두 손가락(확대)·휠·두 번 누르기
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
const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;if(ptrs.size===0){dragging=false;canvas.style.cursor=''}else if(ptrs.size===1){const p=[...ptrs.values()][0];
  lastX=sx=p.x;lastY=sy=p.y;axis=null;dragging=true}};
canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
canvas.addEventListener('wheel',e=>{if(mode!=='rot')return;e.preventDefault();camStop();setZoom(zoomT*Math.exp(-e.deltaY*0.0015))},{passive:false});
canvas.addEventListener('dblclick',()=>{if(mode!=='rot')return;camStop();setZoom(1);panX=panY=0;placePersp()});
setZoom(1);
