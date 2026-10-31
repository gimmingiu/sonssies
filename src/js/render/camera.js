// ---------- 카메라 / 배치 ----------
// 기본 몸 길이·머리 높이로 선 깨두의 키(뿔 자리 포함). 카메라 거리는 이 키 기준으로 고정하고, 이보다 큰 손시만 그만큼 물러남
const REF_H=0.78*1+2*0.68*1-0.08+0.3;
const frameH=()=>Math.max(REF_H,charH);
const persp=new THREE.PerspectiveCamera(26,1,0.1,60);
let mode='rot',chars=[],angle=0,target=0,spinning=false,charH=2.2,charW=2.7;
function layout(){
  const w=stage.clientWidth,h=stage.clientHeight,asp=w/h;if(!w||!h)return;
  renderer.setSize(w,h,false);
  const ch=frameH();   // 카메라는 기본 키(깨두) 기준으로 고정 → 작은 손시는 작게 보임. 더 큰 손시만 물러남
  persp.aspect=asp;let d=(asp<1?10.5:8.2)*ch/2.2;const need=(Math.max(charW,2.6)*0.5*1.18)/(Math.tan(persp.fov*Math.PI/360)*asp);if(need>d)d=need;
  const sh=stage.parentNode&&stage.parentNode.dataset?stage.parentNode.dataset.size:'';const tyK=sh==='main'?0.63:0.46;   // 메인은 손시가 박스 아래쪽에 서 있게(시선을 조금 위로)
  camBase={d,y:ch*0.8,ty:ch*tyK,sh:0};placePersp();persp.updateProjectionMatrix();
  // 메인: 발 아래 남는 여백의 절반만큼 손시를 더 아래로(화면 크기와 상관없이 같은 비율). 시선과 카메라를 함께 내려서 각도는 그대로
  if(sh==='main'){persp.updateMatrixWorld(true);const v=new THREE.Vector3(0,0,0).project(persp),gap=h-(1-v.y)/2*h,
    visH=2*persp.position.distanceTo(new THREE.Vector3(0,camBase.ty,0))*Math.tan(persp.fov*Math.PI/360);
    camBase.sh=gap/2/h*visH;placePersp()}
}
