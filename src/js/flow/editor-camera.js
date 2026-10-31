// ---------- 꾸미기 화면 도구 ----------
// ① 고치는 부위로 카메라 자동 이동 ② 미리보기 아래 아이콘 탭(단계 바로 가기) ③ 되돌리기·다시하기·처음으로
// ④ 부위별 그림 카드로 고르기(+ 세부 조정 접기) ⑤ 묶인 단계 안의 하위 탭
let thumbBusy=false;

// ── 부위별 카메라 (a: 돌린 각도, z: 확대, f: 시선을 얼마나 옮길지, h: 어디로 'head' 얼굴 / 'top' 머리 위 / 'low' 다리)
const FACE_VIEW={a:0,z:1.5,f:.92,h:'head'};
const VIEW={'피부':FACE_VIEW,'머리':FACE_VIEW,'뿔':{a:0,z:1.55,f:.85,h:'top'},'귀':{a:0,z:1.5,f:.7,h:'head'},
  '눈':{a:0,z:1.95,f:.9,h:'eye'},'눈썹':{a:0,z:1.95,f:.9,h:'eye'},'코':{a:0,z:1.95,f:.9,h:'face'},'입':{a:0,z:1.95,f:.9,h:'face'},
  '볼터치':{a:0,z:1.85,f:.9,h:'face'},'볼살':{a:0,z:1.75,f:.9,h:'face'},
  '몸':{a:0,z:1.05,f:0},'꼬리':{a:Math.PI,z:1.2,f:.5,h:'mid'},'팔':{a:-.45,z:1.15,f:.4,h:'mid'},'다리':{a:-.35,z:1.2,f:.6,h:'low'}};
function partY(h){   // 시선이 향할 높이(손시 위치 기준)
  const c=chars[0];if(!c)return camBase.ty;const HG=c.userData.HG,v=new THREE.Vector3();HG?HG.getWorldPosition(v):v.set(0,charH*0.6,0);
  const hc=v.y+0.68*P.headH*0.75;
  return h==='head'?hc:h==='top'?hc+0.68*P.headH*0.55:h==='eye'?hc+0.02:h==='face'?hc-0.12:h==='mid'?charH*0.3:h==='low'?0.28:camBase.ty}
function lookAtPart(name){
  const v=VIEW[name]||FACE_VIEW;
  spinning=false;$('spinBtn').setAttribute('aria-pressed',false);setViewPressed(null);
  camTo({a:v.a+Math.round((angle-v.a)/(2*Math.PI))*2*Math.PI,z:v.z,k:v.f||0,h:partY(v.h)});
}
function lookReset(){camStop();setZoom(1);focusKT=0;panX=panY=0;placePersp();setHeadOnly(false)}

// 머리만 보이기: 얼굴 단계(피부·머리 ~ 볼·볼살)에서는 몸통을 숨기고 머리통만 보여 줌.
// 처음 만들 때 고칠 게 적어 보이게(이탈 방지). 몸·꼬리·팔·다리는 다 만든 뒤 [수정]의 세부 단계에서.
// 몸통은 반투명하게 번지지 않고 바로 나타나고 사라짐(카메라만 천천히 이동)
let headOnly=false;
function setHeadOnly(on){headOnly=on;applyHeadOnly()}
function applyHeadOnly(){const c=chars[0];if(!c||thumbBusy)return;const HG=c.userData.HG;c.children.forEach(o=>{o.visible=!headOnly||o===HG})}

// ── 고친 부위만 말랑: 카드로 바꾸면 그 부위만 살짝 눌렸다 늘었다 잦아듦(머리 모양·볼살은 머리통, 몸 쪽·피부·되돌리기는 손시 전체를 작게)
const PART_TAG={'피부':'all','머리':'HG','볼살':'HG','뿔':'horn','귀':'ear','눈':'eye','눈썹':'brow','코':'nose','입':'mouth','볼터치':'blush','몸':'all','꼬리':'all','팔':'all','다리':'all'};
let wig=null;const WIG_MS=680;
function partBump(name){const tag=PART_TAG[name]||'all';
  if(tag==='all'){popT0=0;bounceK=0.65;bounceT0=performance.now();return}
  wigEnd();wig={tag,t0:performance.now()}}
function wigTargets(){const c=chars[0];if(!c||!wig)return [];if(wig.tag==='HG')return [c.userData.HG];const out=[];
  c.traverse(o=>{const p=o.userData.part;if(p&&p.startsWith(wig.tag))out.push(o)});return out}
function wigEnd(){wigTargets().forEach(o=>{if(o.userData.bs)o.scale.copy(o.userData.bs)});wig=null}
function partWiggle(now){if(!wig||thumbBusy)return;const u=(now-wig.t0)/WIG_MS;if(u>=1){wigEnd();return}
  const f=0.15*Math.exp(-4.5*u)*Math.sin(2*Math.PI*1.7*u);   // 처음엔 살짝 커졌다(늘어남) 작아지며 잦아듦
  wigTargets().forEach(o=>{if(!o.userData.bs)o.userData.bs=o.scale.clone();const b=o.userData.bs;o.scale.set(b.x*(1-f*0.5),b.y*(1+f),b.z*(1-f*0.5))})}
