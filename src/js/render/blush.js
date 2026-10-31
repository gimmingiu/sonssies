// == 볼터치·주근깨 재질과 주근깨 자리(character.js의 얼굴 조립에서 씀)
// 볼터치 재질(종류·색마다 하나씩 만들어 두고 다시 씀)
const BL_MATS={};
const BLUR_TEX=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'#fff');g.addColorStop(0.35,'#ddd');g.addColorStop(0.75,'#444');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv)})();
function blurMat(hex){const k='b'+hex;return BL_MATS[k]||(BL_MATS[k]=new THREE.MeshStandardMaterial({color:lin(hex),
  roughness:0.9,metalness:0,transparent:true,opacity:0.85,alphaMap:BLUR_TEX,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}))}
// 주근깨 색: 피부와 같은 색 계열에서 조금만 진하게(명도·채도 차이가 크지 않게)
function freckleHex(skin){const c=new THREE.Color(skin),h={};c.getHSL(h);c.setHSL(h.h,Math.min(1,h.s*0.92+0.02),Math.max(0.15,h.l-0.13));return '#'+c.getHexString()}
function freckleMat(skin){const hx=freckleHex(skin),k='f'+hx;return BL_MATS[k]||(BL_MATS[k]=clay(hx,0.85,false,true))}
// 주근깨 점 자리: 볼 위에 동그랗게(해바라기씨 배열로 고르게 + 살짝 흔듦). 반대쪽은 거울 자리에서 아주 조금만 어긋나게(대칭 95% · 비대칭 5%)
function freckleDots(cx,cy,R){
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
  const n=10,half=[],out=[],G=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<n;i++){const r=R*Math.sqrt((i+0.5)/n),a=i*G+0.4;half.push([cx+Math.cos(a)*r*1.15+(rnd()-0.5)*0.012,cy+Math.sin(a)*r*0.85+(rnd()-0.5)*0.012,0.0115+rnd()*0.0035])}
  for(const s of[-1,1])half.forEach(([x,y,r])=>{const j=s>0?0.006:0;out.push([s*(x+(rnd()-0.5)*j),y+(rnd()-0.5)*j,r*(s>0?0.92+rnd()*0.16:1)])});
  return out}
