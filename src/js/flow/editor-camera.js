// ---------- 꾸미기 화면 도구 ----------
// ① 고치는 부위로 카메라 자동 이동 ② 미리보기 아래 아이콘 탭(단계 바로 가기) ③ 되돌리기·다시하기·처음으로
// ④ 눈·입 모양을 손시 얼굴 그림 카드로 고르기(+ 세부 조정 접기) ⑤ 묶인 단계 안의 하위 탭
let thumbBusy=false;

// ── 단계·하위 항목별 카메라 (a: 돌린 각도, z: 확대, f: 시선을 얼마나 옮길지, h: 어디로 'head' 얼굴 / 'top' 머리 위 / 'low' 다리)
const VIEW={'색 · 질감':{a:0,z:1,f:0},'머리':{a:0,z:1.3,f:.6,h:'head'},'뿔':{a:-.35,z:1.55,f:.85,h:'top'},'귀':{a:-.75,z:1.45,f:.7,h:'head'},
  '눈':{a:0,z:1.95,f:.9,h:'eye'},'눈썹':{a:0,z:1.95,f:.9,h:'eye'},'코':{a:0,z:1.95,f:.9,h:'face'},'입':{a:0,z:1.95,f:.9,h:'face'},'볼':{a:-.25,z:1.85,f:.9,h:'face'},
  '몸':{a:-.3,z:1.05,f:0},'팔':{a:-.45,z:1.15,f:.4,h:'mid'},'다리':{a:-.35,z:1.2,f:.6,h:'low'},'꼬리':{a:Math.PI*.82,z:1.2,f:.5,h:'mid'}};
function partY(h){   // 시선이 향할 높이(손시 위치 기준)
  const c=chars[0];if(!c)return camBase.ty;const HG=c.userData.HG,v=new THREE.Vector3();HG?HG.getWorldPosition(v):v.set(0,charH*0.6,0);
  const hc=v.y+0.68*P.headH*0.75;
  return h==='head'?hc:h==='top'?hc+0.68*P.headH*0.55:h==='eye'?hc+0.02:h==='face'?hc-0.12:h==='mid'?charH*0.3:h==='low'?0.28:camBase.ty}
// 얼굴 단계(색·질감 ~ 코·입·볼)는 처음 만들 때든 수정할 때든 얼굴(머리) 위주로 크게 보여 줌. 몸·팔다리·꼬리만 전체 모습
const FACE_VIEW={a:0,z:1.5,f:.92,h:'head'};
const FACE_PARTS=['색 · 질감','머리','귀','눈','눈썹','코','입','볼','뿔'];
function lookAtPart(name){
  let v=VIEW[name]||VIEW['색 · 질감'];
  if(name==='색 · 질감'||name==='머리')v=FACE_VIEW;
  else if(FACE_PARTS.includes(name)&&v.z<FACE_VIEW.z)v={...v,z:FACE_VIEW.z};   // 뿔·귀도 얼굴 크기 그대로 각도만
  spinning=false;$('spinBtn').setAttribute('aria-pressed',false);
  target=v.a+Math.round((angle-v.a)/(2*Math.PI))*2*Math.PI;setViewPressed(null);
  setZoom(v.z);focusH=partY(v.h);focusKT=v.f||0;
}
function lookReset(){setZoom(1);focusKT=0;setHeadOnly(false)}
// 머리만 보이기: 얼굴 단계(색·질감 ~ 코·입·볼)에서는 몸통을 숨기고 머리통만 보여 줌.
// 처음 만들 때 고칠 게 적어 보이게(이탈 방지). 몸·팔다리·꼬리는 다 만든 뒤 [수정]의 세부 단계에서.
let headOnly=false;
function setHeadOnly(on){headOnly=on;applyHeadOnly()}
function applyHeadOnly(){const c=chars[0];if(!c||thumbBusy)return;const HG=c.userData.HG;c.children.forEach(o=>{o.visible=!headOnly||o===HG})}

