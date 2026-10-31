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
function lookAtPart(name){
  const v=VIEW[name]||VIEW['색 · 질감'];
  spinning=false;$('spinBtn').setAttribute('aria-pressed',false);
  target=v.a+Math.round((angle-v.a)/(2*Math.PI))*2*Math.PI;setViewPressed(null);
  setZoom(v.z);focusH=partY(v.h);focusKT=v.f||0;
}
function lookReset(){setZoom(1);focusKT=0}

// ── 하위 탭: 묶인 단계(머리·뿔, 눈·눈썹, 코·입·볼, 팔·다리)는 한 번에 하나만 보여 줌
const subOf=[];   // 단계별 지금 보고 있는 하위 항목 이름
stepEls.forEach((box,i)=>{
  const parts=STEPS[i][1];subOf[i]=parts[0][0]||parts[0][1];
  if(parts.length<2)return;
  const seg=document.createElement('div');seg.className='subtabs';seg.setAttribute('role','tablist');
  const kids=[...box.children],secs=[];
  kids.forEach((el,k)=>{if(el.classList.contains('sub')){const g=kids[k+1],sec=document.createElement('section');sec.dataset.sub=el.textContent;el.replaceWith(sec);
    if(g&&g.classList.contains('grp'))sec.appendChild(g);secs.push(sec)}});
  secs.forEach(sec=>{const b=document.createElement('button');b.type='button';b.textContent=sec.dataset.sub;b.setAttribute('role','tab');
    b.onclick=()=>{showSub(i,sec.dataset.sub);lookAtPart(sec.dataset.sub)};seg.appendChild(b)});
  box.prepend(seg);
});
function showSub(i,name){subOf[i]=name;const box=stepEls[i];
  box.querySelectorAll('section[data-sub]').forEach(s=>s.hidden=s.dataset.sub!==name);
  box.querySelectorAll('.subtabs button').forEach(b=>b.setAttribute('aria-selected',b.textContent===name));
  if(name==='눈'||name==='입')makeThumbs(name==='눈'?'eyeType':'mouthType')}

// ── 아이콘 탭 (미리보기 바로 아래, 지금 단계 표시 + 눌러서 이동)
const ICONS=[   // 색, 머리·뿔, 귀, 눈·눈썹, 코·입·볼, 몸, 팔·다리, 꼬리 (24칸, 둥근 선)
 '<path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10Z"/>',
 '<rect x="4.5" y="8" width="15" height="12" rx="5"/><path d="M8 8.4 9 4l2.3 4M16 8.4 15 4l-2.3 4"/>',
 '<path d="M14 4.5a5.5 5.5 0 0 0-5.5 5.5v2.5c0 1.6-1.5 2.3-1.5 4a3.5 3.5 0 0 0 6.6 1.6c.6-1.2 1.4-2 2.6-2.8A5.5 5.5 0 0 0 14 4.5Z"/><path d="M12 10a2 2 0 0 1 4 0"/>',
 '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/>',
 '<path d="M7 12.5c1.3 2.2 3 3.2 5 3.2s3.7-1 5-3.2"/><circle cx="12" cy="8" r="1.6"/><circle cx="5" cy="14.5" r="1.4"/><circle cx="19" cy="14.5" r="1.4"/>',
 '<rect x="6" y="5" width="12" height="15" rx="5.5"/><path d="M6 13h12"/>',
 '<path d="M8 20v-5.5M16 20v-5.5M5 11.5 8 9h8l3 2.5"/><rect x="7.5" y="6" width="9" height="9" rx="3.5"/>',
 '<path d="M5 18c5 0 8-2 9-6s3-6 5.5-6"/><circle cx="19.5" cy="6" r="1.8"/>'];
{const bar=document.createElement('div');bar.className='stabs';bar.id='stabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','꾸미기 단계');
 STEPS.forEach(([name],j)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-label',name);b.title=name;b.dataset.j=j;
   b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[j]}</svg>`;
   b.onclick=()=>{const cur=stack[stack.length-1];if(cur.scr==='step'&&cur.step===j)return;go({scr:'step',step:j},{replace:true})};bar.appendChild(b)});
 $('app').querySelector('.stagehold[data-size="step"]').appendChild(bar);}

// ── 되돌리기·다시하기·처음으로 (미리보기 오른쪽)
const UNDO={list:[],i:-1,base:null,mute:false,t:0};
const snapP=()=>{const o={};Object.keys(P).forEach(k=>{if(!POSE_KEYS.includes(k))o[k]=P[k]});return JSON.stringify(o)};
function undoStart(){UNDO.list=[snapP()];UNDO.i=0;UNDO.base=UNDO.list[0];undoUI()}
function undoRecord(){if(UNDO.mute||scrNow!=='step'||UNDO.i<0)return;clearTimeout(UNDO.t);UNDO.t=setTimeout(()=>{const s=snapP();if(s===UNDO.list[UNDO.i])return;
  UNDO.list=UNDO.list.slice(0,UNDO.i+1);UNDO.list.push(s);if(UNDO.list.length>60)UNDO.list.shift();UNDO.i=UNDO.list.length-1;undoUI()},380)}
function undoApply(s){UNDO.mute=true;Object.assign(P,JSON.parse(s));snapAll();syncUI();rebuild();UNDO.mute=false;bump()}
function undoUI(){$('unUndo').disabled=UNDO.i<=0;$('unRedo').disabled=UNDO.i>=UNDO.list.length-1;$('unReset').disabled=snapP()===UNDO.base}
{const box=document.createElement('div');box.className='undos';
 const ic={unUndo:['되돌리기','<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'],unRedo:['다시하기','<path d="m15 7 4.5 4.5L15 16"/><path d="M19 11.5h-9a5 5 0 0 0 0 10h2"/>'],
   unReset:['처음으로','<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4v4.5h4.5"/>']};
 Object.entries(ic).forEach(([id,[l,d]])=>{const b=document.createElement('button');b.type='button';b.id=id;b.setAttribute('aria-label',l);b.title=l;
   b.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;box.appendChild(b)});
 $('app').querySelector('.stagehold[data-size="step"]').appendChild(box);
 $('unUndo').onclick=()=>{if(UNDO.i>0){UNDO.i--;undoApply(UNDO.list[UNDO.i]);undoUI()}};
 $('unRedo').onclick=()=>{if(UNDO.i<UNDO.list.length-1){UNDO.i++;undoApply(UNDO.list[UNDO.i]);undoUI()}};
 $('unReset').onclick=()=>{if(snapP()===UNDO.base)return;undoApply(UNDO.base);UNDO.list=UNDO.list.slice(0,UNDO.i+1);UNDO.list.push(UNDO.base);UNDO.i=UNDO.list.length-1;undoUI()};}

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
  try{opts.forEach(v=>{P[k]=v;rebuild(true);T.url[v]=faceShot(176)})}finally{P[k]=keep;rebuild(true);thumbBusy=false;UNDO.mute=false}
  box.querySelectorAll('[data-v]').forEach(b=>{const im=b.querySelector('img');if(im&&T.url[b.dataset.v])im.src=T.url[b.dataset.v]})},120)}
// 눈·입 모양 버튼을 그림 카드로 바꾸고, 슬라이더는 '세부 조정' 아래로 접음
[['eyeTypes','eyeRow'],['mouthTypes','mouthRow']].forEach(([id,row])=>{
  const box=$(id);box.classList.add('tcards');
  box.querySelectorAll('.pbtn').forEach(b=>{const t=b.textContent.replace(/\s*[∩∪><ω]+.*$/,'').trim();b.classList.add('tcard');b.innerHTML=`<img alt=""><span>${t}</span>`});
  const r=$(row),grp=r.parentNode,fine=document.createElement('details');fine.className='fine';fine.innerHTML='<summary>세부 조정</summary><div class="fine-in"></div>';
  [...grp.children].filter(el=>el!==r&&el.classList.contains('row')).forEach(el=>fine.querySelector('.fine-in').appendChild(el));
  grp.appendChild(fine);
});

// 꾸미기 화면에 들어올 때·단계가 바뀔 때 (flow의 show에서 부름)
function editorEnter(i,fresh){
  if(fresh)undoStart();else undoUI();
  const N=nSteps();document.querySelectorAll('#stabs button').forEach((b,j)=>{b.hidden=j>=N;b.setAttribute('aria-selected',j===i);b.classList.toggle('done',j<i)});
  const parts=STEPS[i][1];if(parts.length>1)showSub(i,subOf[i]);
  lookAtPart(parts.length>1?subOf[i]:parts[0][1]);
}
