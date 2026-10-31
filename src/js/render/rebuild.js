// == 손시 다시 만들기(rebuild): 모양 값 P로 몸·머리·얼굴을 새로 빚고 재질을 갈아 끼움
function dispose(o){o.traverse(m=>{if(m.geometry&&!m.userData.keep)m.geometry.dispose();if(m.material&&m.material.type==='ShadowMaterial')m.material.dispose()})}
let mats=null,earMats=[],depthOnly=null;
function rebuild(fine=true){
  const B=getBody(fine?0.02:0.034);
  chars.forEach(c=>{scene.remove(c);dispose(c)});chars=[];
  if(mats){[mats.body,mats.head,mats.white,mats.dark,mats.pink,mats.pinkIn,mats.sweatMat].forEach(m=>m.dispose());earMats.forEach(m=>m.dispose())}
  earMats=[];
  const bump=true;
  const _hy=B.model.L+0.68*P.headH-0.08, _u=B.model.upper;
  mats={body:maskMat(P.color,1,B.model.mask,bump),head:clay(P.color),white:clay('#f5f9f8'),dark:clay('#1f2629',
    0.75,false,true),pink:clay(P.blushColor||'#f6b3a9'),pinkIn:clay('#f08a86',0.8,false,true),sweatMat:clay('#f2fbfd',
    0.4,false,true)};
  // 귀는 질감 없이 매끈하게 (귓바퀴 라인을 깔끔하게)
  mats.ear=[U=>{const m=maskMat(P.color,2,U,false);earMats.push(m);return m},U=>{const m=maskMat(P.color,2,U,false);earMats.push(m);return m}];
  const n=1;
  for(let i=0;i<n;i++){const c=build(mats,B);scene.add(c);chars.push(c)}
  if(scrNow==='egg'&&!eggDone)chars[0].visible=false;   // 알 화면에선 알이 깨질 때까지 숨김

  const box=new THREE.Box3().setFromObject(chars[0]);charW=box.max.x-box.min.x;
  // 높이는 뿔 유무와 상관없이 '머리 꼭대기 + 뿔 자리'로 고정 → 뿔을 켜고 꺼도 배치·크기가 그대로
  charH=B.model.L+2*0.68*P.headH-0.08+0.3;
  layout();afterRebuild();
}
