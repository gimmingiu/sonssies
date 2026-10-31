// ── 부위별 프리셋 그림 카드 6장 (눈·입 모양 카드처럼). 누르면 그 부위 값이 한 번에 바뀌고, 슬라이더는 '세부 조정'에 접어 둠
// 값은 슬라이더 칸(−5~+5). 적지 않은 항목은 0(기본). on: 켜기/끄기(뿔·꼬리·볼터치), c: 볼터치 색
const PART_CARDS={
 '머리':{shot:'head',items:[['기본',{}],['동글',{headSq:-5,headW:-1,headH:1}],['네모',{headSq:5}],['넓적',{headW:4,headH:-2}],['길쭉',{headW:-3,headH:4}],['큼직',{headW:3,headH:3,headD:2}]]},
 '뿔':{shot:'head',items:[['기본',{}],['없음',{},{horns:false}],['짧은',{hornH:-3}],['긴',{hornH:4}],['굵은',{hornRound:4,hornH:-1}],['넓게',{hornX:5,hornH:1}]]},
 '귀':{shot:'head',items:[['기본',{}],['작은',{earSize:-4}],['큰',{earSize:4}],['위로',{earY:4}],['아래로',{earY:-4}],['크고 높이',{earSize:3,earY:3}]]},
 '눈썹':{shot:'face',items:[['일자',{}],['화난',{browAng:4}],['순한',{browAng:-3}],['짧고 굵게',{browLen:-3,browThick:4}],['길고 얇게',{browLen:4,browThick:-3}],['높이',{browY:4,browAng:2}]]},
 '코':{shot:'face',items:[['기본',{}],['작은',{noseSize:-4}],['큰',{noseSize:4}],['동글',{noseSq:-5}],['네모',{noseSq:5}],['아래로',{noseY:-4,noseSize:-1}]]},
 '볼':{shot:'face',items:[['없음',{},{blush:false}],['볼터치',{},{blush:true,blushColor:'#f6b3a9'}],['볼살',{cheek:5},{blush:false}],['볼살 볼터치',{cheek:5},{blush:true,blushColor:'#f6b3a9'}],['진한 볼터치',{},{blush:true,blushColor:'#f0606c'}],['아래 볼터치',{blushY:-4},{blush:true,blushColor:'#f6b3a9'}]]},
 '몸':{shot:'body',items:[['기본',{}],['짧은',{bodyLen:-4}],['긴',{bodyLen:4}],['통통',{upperW:4,bodyD:3}],['날씬',{upperW:-4,bodyD:-3}],['허리 잘록',{lowerRatio:-4}]]},
 '팔':{shot:'body',a:-.5,items:[['기본',{}],['짧은',{armLen:-4}],['긴',{armLen:4}],['굵은',{armThick:4}],['가는',{armThick:-4}],['짧고 굵게',{armLen:-3,armThick:4}]]},
 '다리':{shot:'body',a:-.4,items:[['기본',{}],['짧은',{legSplit:-4}],['긴',{legSplit:4}],['굵은',{legThick:4}],['가는',{legThick:-4}],['짧고 굵게',{legSplit:-3,legThick:4}]]},
 '꼬리':{shot:'body',a:Math.PI*.58,zoom:.6,cy:.26,items:[['기본',{}],['없음',{},{tail:false}],['작은',{tailSize:-3}],['아주 작은',{tailSize:-5}],['넓은',{tailW:4}],['작고 넓게',{tailSize:-3,tailW:4}]]},
};
const ON_DEF={horns:true,tail:true,blush:false};
const groupKeys=name=>{const g=GROUPS.find(([n])=>n===name);return g?g[1].map(r=>r[0]):[]};
function cardMatch(name,[,st,on]){
  if(groupKeys(name).some(k=>toStep(k)!==(st[k]||0)))return false;
  const ons=Object.assign({},...Object.keys(ON_DEF).filter(k=>(name==='뿔'&&k==='horns')||(name==='꼬리'&&k==='tail')||(name==='볼'&&k==='blush')).map(k=>({[k]:ON_DEF[k]})),on||{});
  return Object.entries(ons).every(([k,v])=>P[k]===v)}
function cardApply(name,[,st,on]){
  groupKeys(name).forEach(k=>P[k]=toVal(k,st[k]||0));
  if(name==='뿔')P.horns=true;if(name==='꼬리')P.tail=true;if(name==='볼')P.blush=false;
  Object.assign(P,on||{});syncUI();rebuild();bump()}
function markCards(){document.querySelectorAll('.pcards').forEach(box=>{const name=box.dataset.part,set=PART_CARDS[name];
  box.querySelectorAll('.tcard').forEach((b,i)=>b.setAttribute('aria-pressed',cardMatch(name,set.items[i])))})}
// 카드 만들기: 각 부위 묶음 맨 위에 카드 6장, 원래 있던 슬라이더·스위치는 '세부 조정' 안으로
Object.entries(PART_CARDS).forEach(([name,set])=>{
  const grp=GRP[name];if(!grp)return;
  const box=document.createElement('div');box.className='pbtns tcards pcards';box.dataset.part=name;box.setAttribute('role','group');box.setAttribute('aria-label',name+' 모양');
  set.items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';b.className='pbtn tcard';b.innerHTML=`<img alt=""><span>${it[0]}</span>`;
    b.onclick=()=>cardApply(name,it);box.appendChild(b)});
  const fine=document.createElement('details');fine.className='fine';fine.innerHTML='<summary>세부 조정</summary><div class="fine-in"></div>';
  [...grp.children].forEach(el=>fine.querySelector('.fine-in').appendChild(el));
  grp.append(box,fine);
});
// 카드 그림: 그 부위만 바꾼 지금 손시를 찍음(얼굴 부위는 얼굴만, 몸 부위는 전체). 다른 값이 바뀌면 다시 그림
function bodyShot(px,rotY,zm=1,cyK=0.47){
  const c=chars[0],rot=c.rotation.y,sc=c.scale.clone(),py=c.position.y;c.rotation.y=rotY||0;c.scale.setScalar(1);c.position.y=0;c.updateMatrixWorld(true);
  const vis=c.children.map(o=>o.visible);c.children.forEach(o=>{o.visible=true});
  const pr=renderer.getPixelRatio(),fov=persp.fov,asp=persp.aspect,pos=persp.position.clone(),q=persp.quaternion.clone();
  renderer.setPixelRatio(1);renderer.setSize(px,px,false);persp.aspect=1;persp.fov=10;
  const span=Math.max(charH*0.92,charW)*1.02*zm,cy=charH*cyK,d=span/2/Math.tan(5*Math.PI/180);
  persp.position.set(0,cy+d*0.12,d);persp.lookAt(0,cy,0);persp.updateProjectionMatrix();
  renderer.render(scene,persp);const u=renderer.domElement.toDataURL('image/png');
  c.children.forEach((o,i)=>{o.visible=vis[i]});c.rotation.y=rot;c.scale.copy(sc);c.position.y=py;persp.fov=fov;persp.aspect=asp;persp.position.copy(pos);persp.quaternion.copy(q);persp.updateProjectionMatrix();
  renderer.setPixelRatio(pr);layout();return u}
const CARD_SIG={};let cardT=0;
function partCards(name){const set=PART_CARDS[name];if(!set)return;markCards();clearTimeout(cardT);cardT=setTimeout(()=>{
  const keys=groupKeys(name).concat(['horns','tail','blush','blushColor']);
  const sig=JSON.stringify(Object.keys(P).filter(x=>!keys.includes(x)&&!POSE_KEYS.includes(x)).map(x=>P[x]));
  if(CARD_SIG[name]===sig)return;CARD_SIG[name]=sig;
  const keep={};keys.forEach(k=>keep[k]=P[k]);const urls=[];
  thumbBusy=true;UNDO.mute=true;
  try{set.items.forEach(it=>{groupKeys(name).forEach(k=>P[k]=toVal(k,it[1][k]||0));if(name==='뿔')P.horns=true;if(name==='꼬리')P.tail=true;if(name==='볼')P.blush=false;Object.assign(P,it[2]||{});
    rebuild(set.shot!=='body');urls.push(set.shot==='face'?faceShot(176):set.shot==='head'?faceShot(176,2.15,0.08):bodyShot(200,set.a,set.zoom,set.cy))})}
  finally{Object.assign(P,keep);rebuild(true);thumbBusy=false;UNDO.mute=false;applyHeadOnly()}
  $('app').querySelectorAll(`.pcards[data-part="${name}"] img`).forEach((im,i)=>{if(urls[i])im.src=urls[i]})},120)}
