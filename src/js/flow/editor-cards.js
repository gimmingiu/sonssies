// ── 부위별 프리셋 그림 카드 (눈·입 모양 카드처럼). 누르면 그 부위 값이 한 번에 바뀌고, 슬라이더는 '세부 조정'에 접어 둠
// 카드 값 v: 실제 값(슬라이더 항목은 S(키, 칸)로 −5~+5 칸을 적음). 적지 않은 슬라이더 항목은 기본값(0칸)으로 돌아감.
// base: 그 부위 카드 모두에 깔리는 값(예: 뿔 카드는 뿔 켜기). shot: 카드 그림 구도
const S=(k,st)=>toVal(k,st);
const PART_CARDS={
 '머리':{shot:'head',items:[['보통',{}],['넓쭉',{headW:S('headW',4),headH:S('headH',-2)}],['길쭉',{headW:S('headW',-3),headH:S('headH',4)}],
   ['동글',{headSq:S('headSq',-5)}],['네모',{headSq:S('headSq',5)}],['큼직',{headW:S('headW',3),headH:S('headH',3),headD:S('headD',2)}]]},
 '뿔':{shot:'head',base:{horns:true},items:[['보통',{}],['짧뚱',{hornH:S('hornH',-3)}],['굵직',{hornRound:S('hornRound',4)}],
   ['길쭉',{hornH:S('hornH',4)}],['넓쭉',{hornX:S('hornX',5)}],['없음',{horns:false}]]},
 '귀':{shot:'ear',items:[['보통',{}],['앙증',{earSize:S('earSize',-4)}],['큼직',{earSize:S('earSize',4)}],
   ['쫑긋',{earY:S('earY',4)}],['작은쫑긋',{earSize:S('earSize',-4),earY:S('earY',4)}],['큰쫑긋',{earSize:S('earSize',4),earY:S('earY',4)}]]},
 // 보통·짧둥·굵직은 깨두 눈썹(비스듬히) 바탕
 '눈썹':{shot:'face',items:[['보통',{browAng:48,browLen:0.124,browThick:0.016}],['짧둥',{browAng:48,browLen:S('browLen',-5),browThick:0.016}],
   ['굵직',{browAng:48,browLen:0.124,browThick:S('browThick',2)}],['순둥',{browAng:S('browAng',-3)}],['일자',{}],['굵은일자',{browThick:S('browThick',3)}]]},
 // 깨두 코(기본) = 네모 계열
 '코':{shot:'face',items:[['네모',{}],['작은네모',{noseSize:S('noseSize',-3)}],['큰네모',{noseSize:S('noseSize',3)}],
   ['동글',{noseSq:S('noseSq',-5)}],['작은동글',{noseSq:S('noseSq',-5),noseSize:S('noseSize',-3)}],['큰동글',{noseSq:S('noseSq',-5),noseSize:S('noseSize',3)}]]},
 '볼터치':{shot:'cheek',items:[['꾸러기',{blush:true,blushType:'clay',blushColor:'#f6b3a9'}],['데헷',{blush:true,blushType:'hatch',blushColor:'#f0607c'}],
   ['개구쟁이',{blush:true,blushType:'freckle'}],['수줍',{blush:true,blushType:'blur',blushColor:'#ffa3a3'}],['발그레',{blush:true,blushType:'blur',blushColor:'#ff6a3d'}],['없음',{blush:false}]]},
 '볼살':{shot:'cheek',items:[['빵빵',{cheek:S('cheek',5)}],['통통',{cheek:S('cheek',3)}],['없음',{}]]},
 '몸':{shot:'body',base:{lowerW:1},items:[['깨두',{}],['꼬마',{bodyLen:0.6,upperW:0.92,lowerW:0.95}],['꼼디',{upperW:1.3,lowerW:1.42,bodyD:1.22}]]},
 '팔':{shot:'body',items:[['보통',{}],['짧뚱',{armLen:S('armLen',-4)}],['길쭉',{armLen:S('armLen',4)}]]},
 '다리':{shot:'body',items:[['보통',{}],['짧뚱',{legSplit:S('legSplit',-4)}],['길쭉',{legSplit:S('legSplit',4)}]]},
 '꼬리':{shot:'tail',base:{tail:true},items:[['보통',{}],['앙증',{tailSize:S('tailSize',-4)}],['큼직',{tailSize:S('tailSize',4)}]]},
};
const groupKeys=name=>{const g=GROUPS.find(([n])=>n===name);return g?g[1].map(r=>r[0]):[]};
const cardVals=(name,it)=>{const v={};groupKeys(name).forEach(k=>v[k]=DEF[k]);return Object.assign(v,PART_CARDS[name].base||{},it[1])};
const sameVal=(k,a,b)=>k in META?stepOf(k,a)===stepOf(k,b):typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<1e-6:a===b;
function cardMatch(name,it){const v=cardVals(name,it);return Object.keys(v).every(k=>sameVal(k,P[k],v[k]))}
function cardSet(name,it){const v=cardVals(name,it);Object.keys(v).forEach(k=>P[k]=k in META?toVal(k,stepOf(k,v[k])):v[k])}
function cardApply(name,it){cardSet(name,it);syncUI();rebuild();bump()}
function markCards(){document.querySelectorAll('.pcards').forEach(box=>{const name=box.dataset.part,set=PART_CARDS[name];
  box.querySelectorAll('.tcard').forEach((b,i)=>b.setAttribute('aria-pressed',cardMatch(name,set.items[i])))})}
// 카드 만들기: 각 부위 묶음 맨 위에 카드, 원래 있던 슬라이더·스위치는 '세부 조정' 안으로
Object.entries(PART_CARDS).forEach(([name,set])=>{
  const grp=GRP[name];if(!grp)return;
  const box=document.createElement('div');box.className='pbtns tcards pcards';box.dataset.part=name;box.setAttribute('role','group');box.setAttribute('aria-label',name+' 모양');
  set.items.forEach(it=>{const b=document.createElement('button');b.type='button';b.className='pbtn tcard';b.innerHTML=`<img alt=""><span>${it[0]}</span>`;
    b.onclick=()=>cardApply(name,it);box.appendChild(b)});
  const fine=document.createElement('details');fine.className='fine';fine.innerHTML='<summary>세부 조정</summary><div class="fine-in"></div>';
  [...grp.children].forEach(el=>fine.querySelector('.fine-in').appendChild(el));
  grp.append(box,fine);
});
// 카드 그림 찍기: 손시를 rotY만큼 돌려 aim(c)가 돌려준 점을 가운데에 두고, 폭 span만큼 찍음(화면 카메라·모습은 그대로 되돌림)
function aimShot(px,rotY,span,aim,onlyHead){
  const c=chars[0],HG=c.userData.HG,rot=c.rotation.y,sc=c.scale.clone(),py=c.position.y;c.rotation.y=rotY||0;c.scale.setScalar(1);c.position.y=0;c.updateMatrixWorld(true);
  const vis=c.children.map(o=>o.visible);c.children.forEach(o=>{o.visible=!onlyHead||o===HG});
  const mb=mats.body;if(mb.transparent||mb.opacity<1){mb.transparent=false;mb.opacity=1;mb.depthWrite=true;mb.needsUpdate=true}
  const f=aim(c),pr=renderer.getPixelRatio(),fov=persp.fov,asp=persp.aspect,pos=persp.position.clone(),q=persp.quaternion.clone();
  renderer.setPixelRatio(1);renderer.setSize(px,px,false);persp.aspect=1;persp.fov=10;
  const d=span/2/Math.tan(5*Math.PI/180);persp.position.set(f.x,f.y,f.z+d);persp.lookAt(f);persp.updateProjectionMatrix();
  renderer.render(scene,persp);const u=renderer.domElement.toDataURL('image/png');
  c.children.forEach((o,i)=>{o.visible=vis[i]});c.rotation.y=rot;c.scale.copy(sc);c.position.y=py;persp.fov=fov;persp.aspect=asp;persp.position.copy(pos);persp.quaternion.copy(q);persp.updateProjectionMatrix();
  renderer.setPixelRatio(pr);layout();return u}
const headC=c=>{const v=new THREE.Vector3();c.userData.HG.getWorldPosition(v);v.y+=0.68*P.headH*0.75;return v};
function bodyShot(px){const span=Math.max(charH*0.92,charW)*1.02;return aimShot(px,0,span,()=>new THREE.Vector3(0,charH*0.47,0),false)}
// 귀: 오른쪽 귀만 크게(얼굴은 잘림). 높이는 기본 귀 자리로 고정해서 '위로' 붙은 귀는 위로 보임
function earShot(px){return aimShot(px,-0.5,1.3,c=>{let ear=null;c.traverse(o=>{if(o.userData.part==='ear1')ear=o});
  const v=ear?new THREE.Box3().setFromObject(ear).getCenter(new THREE.Vector3()):headC(c);v.y=headC(c).y+DEF.earY*P.headH;return v},true)}
// 꼬리: 바로 뒤에서 꼬리 둘레를 크게
function tailShot(px){return aimShot(px,Math.PI,0.95,c=>{const body=c.children[0],g=body.geometry,pa=g.attributes.position,tl=g.attributes.aTail,v=new THREE.Vector3();let n=0;
  if(tl)for(let i=0;i<pa.count;i++)if(tl.getX(i)>0.5){v.x+=pa.getX(i);v.y+=pa.getY(i);v.z+=pa.getZ(i);n++}
  if(n){v.multiplyScalar(1/n);v.x=0;body.localToWorld(v)}else v.set(0,charH*0.22,0.3);v.y+=0.05;return v},false)}
const SHOT={head:()=>faceShot(176,2.15,0.08),face:()=>faceShot(176),cheek:()=>faceShot(176,1.7,-0.05),ear:()=>earShot(176),body:()=>bodyShot(200),tail:()=>tailShot(200)};
// 카드 그림: 그 부위만 바꾼 지금 손시를 찍음. 다른 값이 바뀌면 다시 그림
const CARD_SIG={};let cardT=0;
function partCards(name){const set=PART_CARDS[name];if(!set)return;markCards();clearTimeout(cardT);cardT=setTimeout(()=>{
  const keys=[...new Set(set.items.flatMap(it=>Object.keys(cardVals(name,it))))];
  const sig=JSON.stringify(Object.keys(P).filter(x=>!keys.includes(x)&&!POSE_KEYS.includes(x)).map(x=>P[x]));
  if(CARD_SIG[name]===sig)return;CARD_SIG[name]=sig;
  const keep={};keys.forEach(k=>keep[k]=P[k]);const urls=[];
  thumbBusy=true;UNDO.mute=true;
  try{set.items.forEach(it=>{cardSet(name,it);rebuild(!['body','tail'].includes(set.shot));urls.push(SHOT[set.shot]())})}
  finally{Object.assign(P,keep);rebuild(true);thumbBusy=false;UNDO.mute=false;applyHeadOnly()}
  $('app').querySelectorAll(`.pcards[data-part="${name}"] img`).forEach((im,i)=>{if(urls[i])im.src=urls[i]})},120)}
