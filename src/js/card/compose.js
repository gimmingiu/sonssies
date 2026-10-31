// ---------- 완성 페이지 · 이미지(세로 1080×1920) ----------
// 피부색에서 명찰 색을 뽑음: 진한 테두리·글씨, 옅은 윗띠
// 이름표 색: 기본은 피부색에서 뽑은 진한 색. '내 이름은' 띠는 테두리 색을 옅게 만든 색
let tagColor='';
function autoTagColor(){const c=new THREE.Color(P.color),h={};c.getHSL(h);return '#'+new THREE.Color().setHSL(h.h,Math.min(0.5,h.s*0.7+0.12),0.42).getHexString()}
function tagColors(){const deep=tagColor||autoTagColor(),h={};new THREE.Color(deep).getHSL(h);
  const pale=new THREE.Color().setHSL(h.h,Math.min(0.6,h.s*0.85),0.89);
  return {deep,pale:'#'+pale.getHexString()}}
function syncTagCols(){const a=$('tagAuto');a.style.background=autoTagColor();
  document.querySelectorAll('#tagCols .sw').forEach(s=>s.setAttribute('aria-pressed',s.dataset.c===tagColor));
  const pk=$('tagPick');pk.dataset.on=!!tagColor&&![...document.querySelectorAll('#tagCols .sw')].some(s=>s.dataset.c===tagColor);if(pk.dataset.on==='true')pk.value=tagColor}
// 캐릭터를 그려 1080×1920 캔버스(dst)에 합성. q=렌더 배율(저장 2, 미리보기 1)
// reuse=true면 3D는 다시 그리지 않고 직전 미리보기 그림을 재사용(이름·말풍선·색만 바뀔 때 빠르게)
let lastChar=null,tagOn=true,tagNameShow=null,tagScale=1;
const CHAR_MAXW=920;   // 카드(1080) 안에서 캐릭터 가로 최대 폭 → 좌우 여백 최소 80px씩
function renderChar(q){
  const OW=1080,OH=1920,RH=1660,pr=renderer.getPixelRatio(),ch=frameH();
  renderer.setPixelRatio(q);renderer.setSize(OW,RH,false);
  const cb=camBase;persp.aspect=OW/RH;camBase={d:12*ch/2.2,y:ch*0.8,ty:ch*0.46};placePersp();persp.updateProjectionMatrix();
  chars[0].rotation.y=angle;chars[0].updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(chars[0]);
  const span=()=>{let mn=1e9,mx=-1e9;for(const X of [bb.min.x,bb.max.x])for(const Y of [bb.min.y,bb.max.y])for(const Z of [bb.min.z,bb.max.z]){const v=new THREE.Vector3(X,Y,Z).project(persp);const px=(v.x+1)/2*OW;mn=Math.min(mn,px);mx=Math.max(mx,px)}return [mn,mx]};
  // 가로로 너무 넓으면 카메라를 뒤로 물려 정해진 폭 안에 들어오게
  let [mnx,mxx]=span();
  if(mxx-mnx>CHAR_MAXW){camBase.d*=(mxx-mnx)/CHAR_MAXW*1.01;placePersp();persp.updateProjectionMatrix();[mnx,mxx]=span()}
  const py=v=>(1-new THREE.Vector3(0,v,0).project(persp).y)/2*RH, tpx=py(charH), fpx=py(-0.05);
  const sx=Math.round(OW/2-(mnx+mxx)/2);
  const hv=new THREE.Vector3();chars[0].userData.HG?chars[0].userData.HG.getWorldPosition(hv):hv.set(0,charH*0.7,0);
  hv.y+=0.68*P.headH*0.75;   // 목 → 머리 가운데
  const hp=hv.clone().project(persp),headX=(hp.x+1)/2*OW+sx,headCY=(1-hp.y)/2*RH;
  renderer.render(scene,persp);
  const img=document.createElement('canvas');img.width=renderer.domElement.width;img.height=renderer.domElement.height;img.getContext('2d').drawImage(renderer.domElement,0,0);
  camBase=cb;renderer.setPixelRatio(pr);layout();
  return {img,sx,tpx,fpx,headX,headCY,q};
}
function compose(dst,q,reuse){
  const OW=1080,OH=1920,RH=1660;
  const C=(reuse&&lastChar&&lastChar.q===q)?lastChar:renderChar(q);if(q===1)lastChar=C;
  const {tpx,fpx,sx,headX}=C;
  // 캐릭터·이름표 위치는 말풍선 종류·길이와 상관없이 고정 (머리 위에 말풍선 자리를 늘 비워 둠). 이름표를 끄면 캐릭터만 가운데로
  const tagH=tagOn?230:0,gap=tagOn?250:0,RES=360;
  const x=dst.getContext('2d');
  const B=bubbleLayout(x);
  let y0=Math.round((OH-(RES+fpx-tpx+gap+tagH))/2+RES-tpx)+(tagOn?40:0);
  y0=Math.min(y0,OH-70-tagH-gap-fpx);y0=Math.max(y0,40+RES-tpx);
  x.clearRect(0,0,OW,OH);
  if(bgColor){x.fillStyle=bgColor;x.fillRect(0,0,OW,OH)}
  x.drawImage(C.img,sx,y0,OW,RH);
  // 명찰: 흰 카드 + 테두리·윗띠, 살짝 기울여 붙인 스티커처럼 (그림자 없음)
  if(tagOn){
    const name=tagNameShow||charName||'깨두',{deep,pale}=tagColors();
    // 이름 글자는 흰 칸(윗띠 아래) 안에 '실제 글자 모양' 기준으로 맞춤 → 겹받침(ㄼ 등)이 아래로 삐져나오지 않음
    const NF=f=>f+'px Jua, "Noto Sans KR", sans-serif';
    let fs=100;x.font=NF(fs);
    const ink=()=>{const m=x.measureText(name),r=x.measureText('깨둥');return {w:m.width,asc:Math.max(m.actualBoundingBoxAscent,r.actualBoundingBoxAscent),desc:Math.max(m.actualBoundingBoxDescent,r.actualBoundingBoxDescent)}};
    let M=ink();const cw=Math.min(900,Math.max(440,M.w+130)),boxH=tagH-72-34;
    const k=Math.min(1,(cw-90)/M.w,boxH/(M.asc+M.desc));if(k<1){fs=Math.floor(fs*k);x.font=NF(fs);M=ink()}
    const nameY=(-tagH/2+72+tagH/2-12)/2+(M.asc-M.desc)/2;   // 흰 칸 가운데에 글자 묶음 가운데
    const cx=OW/2,cy=y0+fpx+gap+tagH/2;
    x.save();x.translate(cx,cy);x.rotate(-2.5*Math.PI/180);x.scale(tagScale,tagScale);
    x.beginPath();x.roundRect(-cw/2,-tagH/2,cw,tagH,42);x.fillStyle='#fff';x.fill();
    x.save();x.beginPath();x.roundRect(-cw/2,-tagH/2,cw,tagH,42);x.clip();x.fillStyle=pale;x.fillRect(-cw/2,-tagH/2,cw,72);x.restore();
    x.lineWidth=12;x.strokeStyle=deep;x.beginPath();x.roundRect(-cw/2+6,-tagH/2+6,cw-12,tagH-12,36);x.stroke();
    x.textAlign='center';x.textBaseline='middle';
    x.fillStyle=deep;x.font='700 34px "Noto Sans KR", sans-serif';x.fillText('내 이름은',0,-tagH/2+40);
    x.fillStyle=tagNameShow?'#7b888c':'#1f2a2e';x.font=NF(fs);x.textBaseline='alphabetic';x.fillText(name,0,nameY);
    x.restore();
  }
  bubbleRect=B?drawBubble(x,B,y0+tpx,headX,y0+C.headCY):null;placeBubHit();
  // 저작권 표기: 카드 오른쪽 아래에 작게 (배경 밝기에 맞춰 글자색)
  x.save();x.font='400 26px "Nanum Gothic Coding", monospace';x.textAlign='right';x.textBaseline='alphabetic';
  x.fillStyle=bgColor&&isDark(bgColor)?'rgba(255,255,255,.55)':'rgba(31,42,46,.5)';x.fillText('ⓒsonssies',OW-44,OH-44);x.restore();
}
