// ---------- 꾸미기 화면 도구 ----------
// ① 고치는 부위로 카메라 자동 이동 ② 미리보기 아래 아이콘 탭(단계 바로 가기) ③ 되돌리기·다시하기·처음으로
// ④ 부위별 그림 카드로 고르기(+ 세부 조정 접기) ⑤ 묶인 단계 안의 하위 탭
let thumbBusy=false;

// ── 부위별 카메라 (a: 돌린 각도, z: 확대, f: 시선을 얼마나 옮길지, h: 어디로 'head' 얼굴 / 'top' 머리 위 / 'low' 다리)
const FACE_VIEW={a:0,z:1.5,f:.92,h:'head'};
const VIEW={'피부':FACE_VIEW,'머리':FACE_VIEW,'뿔':{a:-.35,z:1.55,f:.85,h:'top'},'귀':{a:-.75,z:1.5,f:.7,h:'head'},
  '눈':{a:0,z:1.95,f:.9,h:'eye'},'눈썹':{a:0,z:1.95,f:.9,h:'eye'},'코':{a:0,z:1.95,f:.9,h:'face'},'입':{a:0,z:1.95,f:.9,h:'face'},
  '볼터치':{a:-.25,z:1.85,f:.9,h:'face'},'볼살':{a:-.4,z:1.75,f:.9,h:'face'},
  '몸':{a:0,z:1.05,f:0},'꼬리':{a:Math.PI*.82,z:1.2,f:.5,h:'mid'},'팔':{a:-.45,z:1.15,f:.4,h:'mid'},'다리':{a:-.35,z:1.2,f:.6,h:'low'}};
function partY(h){   // 시선이 향할 높이(손시 위치 기준)
  const c=chars[0];if(!c)return camBase.ty;const HG=c.userData.HG,v=new THREE.Vector3();HG?HG.getWorldPosition(v):v.set(0,charH*0.6,0);
  const hc=v.y+0.68*P.headH*0.75;
  return h==='head'?hc:h==='top'?hc+0.68*P.headH*0.55:h==='eye'?hc+0.02:h==='face'?hc-0.12:h==='mid'?charH*0.3:h==='low'?0.28:camBase.ty}
function lookAtPart(name){
  const v=VIEW[name]||FACE_VIEW;
  spinning=false;$('spinBtn').setAttribute('aria-pressed',false);setViewPressed(null);
  camTo({a:v.a+Math.round((angle-v.a)/(2*Math.PI))*2*Math.PI,z:v.z,k:v.f||0,h:partY(v.h)});
}
function lookReset(){camStop();setZoom(1);focusKT=0;panX=panY=0;placePersp();setHeadOnly(false,true)}

// 머리만 보이기: 얼굴 단계(피부·머리 ~ 볼·볼살)에서는 몸통을 숨기고 머리통만 보여 줌.
// 처음 만들 때 고칠 게 적어 보이게(이탈 방지). 몸·꼬리·팔·다리는 다 만든 뒤 [수정]의 세부 단계에서.
// 얼굴 단계 ↔ 몸 단계를 오갈 때 몸통은 툭 나타나지 않고 서서히 나타나고 사라짐
let headOnly=false,bodyA=1,bodyFrom=1,bodyT0=0;const BODY_MS=520;
function setHeadOnly(on,now){if(on===headOnly&&!now)return;headOnly=on;
  if(now||!chars[0]){bodyA=on?0:1;bodyT0=0}else{bodyFrom=bodyA;bodyT0=performance.now()}applyHeadOnly()}
function applyHeadOnly(){const c=chars[0];if(!c||thumbBusy)return;const HG=c.userData.HG,a=bodyA;
  c.children.forEach(o=>{if(o!==HG)o.visible=a>0.001});
  if(typeof mats!=='undefined'&&mats&&mats.body){const m=mats.body,tr=a<0.999;if(m.transparent!==tr){m.transparent=tr;m.needsUpdate=true}m.opacity=a;m.depthWrite=a>0.5}}
function bodyFade(now){if(!bodyT0)return;const u=Math.min(1,(now-bodyT0)/BODY_MS),e=easeIO(u),to=headOnly?0:1;bodyA=bodyFrom+(to-bodyFrom)*e;if(u>=1){bodyA=to;bodyT0=0}applyHeadOnly()}
