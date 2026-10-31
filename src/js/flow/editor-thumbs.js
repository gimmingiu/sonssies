// ── 눈·입 모양 그림 카드: 지금 손시 얼굴에 각 모양을 씌워 그림(색·모양이 바뀌면 다시 그림)
const THUMB={eyeType:{sig:'',url:{}},mouthType:{sig:'',url:{}}};
function faceShot(px){   // 정면 얼굴만 작게 찍기 (화면 카메라·크기는 그대로 되돌림)
  const c=chars[0],HG=c.userData.HG,rot=c.rotation.y,sc=c.scale.clone(),py=c.position.y;c.rotation.y=0;c.scale.setScalar(1);c.position.y=0;c.updateMatrixWorld(true);
  const vis=c.children.map(o=>o.visible);c.children.forEach(o=>{o.visible=(o===HG)});
  const hv=new THREE.Vector3();HG.getWorldPosition(hv);hv.y+=0.68*P.headH*0.75-0.06;
  const pr=renderer.getPixelRatio(),fov=persp.fov,asp=persp.aspect,pos=persp.position.clone(),q=persp.quaternion.clone();
  renderer.setPixelRatio(1);renderer.setSize(px,px,false);persp.aspect=1;persp.fov=10;
  const d=1.25/2/Math.tan(5*Math.PI/180);persp.position.set(0,hv.y,hv.z+d);persp.lookAt(0,hv.y,hv.z);persp.updateProjectionMatrix();
  renderer.render(scene,persp);const u=renderer.domElement.toDataURL('image/png');
  c.children.forEach((o,i)=>{o.visible=vis[i]});c.rotation.y=rot;c.scale.copy(sc);c.position.y=py;persp.fov=fov;persp.aspect=asp;persp.position.copy(pos);persp.quaternion.copy(q);persp.updateProjectionMatrix();
  renderer.setPixelRatio(pr);layout();return u}
let thumbT=0;
function makeThumbs(k){clearTimeout(thumbT);thumbT=setTimeout(()=>{
  const box=$(k==='eyeType'?'eyeTypes':'mouthTypes'),T=THUMB[k];
  const sig=JSON.stringify(Object.keys(P).filter(x=>x!==k&&!POSE_KEYS.includes(x)).map(x=>P[x]));
  if(T.sig===sig)return;T.sig=sig;
  const keep=P[k],opts=[...box.querySelectorAll('[data-v]')].map(b=>b.dataset.v);
  thumbBusy=true;UNDO.mute=true;
  try{opts.forEach(v=>{P[k]=v;rebuild(true);T.url[v]=faceShot(176)})}finally{P[k]=keep;rebuild(true);thumbBusy=false;UNDO.mute=false;applyHeadOnly()}
  box.querySelectorAll('[data-v]').forEach(b=>{const im=b.querySelector('img');if(im&&T.url[b.dataset.v])im.src=T.url[b.dataset.v]})},120)}
// 눈·입 모양 버튼을 그림 카드로 바꾸고, 슬라이더는 '세부 조정' 아래로 접음
[['eyeTypes','eyeRow'],['mouthTypes','mouthRow']].forEach(([id,row])=>{
  const box=$(id);box.classList.add('tcards');
  box.querySelectorAll('.pbtn').forEach(b=>{const t=b.textContent.replace(/\s*[∩∪><ω]+.*$/,'').trim();b.classList.add('tcard');b.innerHTML=`<img alt=""><span>${t}</span>`});
  const r=$(row),grp=r.parentNode,fine=document.createElement('details');fine.className='fine';fine.innerHTML='<summary>세부 조정</summary><div class="fine-in"></div>';
  [...grp.children].filter(el=>el!==r&&el.classList.contains('row')).forEach(el=>fine.querySelector('.fine-in').appendChild(el));
  grp.appendChild(fine);
});

