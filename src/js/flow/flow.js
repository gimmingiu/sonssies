// ---------- 화면 흐름 (첫 방문: 꿈알 → 깨어나 기본형 고르기 → 꾸미기 5단계 → 이름 → 메인) ----------
let ST=Save.data();   // 저장 묶음 (src/js/save/save.js)
const snapDoll=()=>{const o={};Object.keys(P).forEach(k=>{if(!POSE_KEYS.includes(k))o[k]=P[k]});return {p:o,name:charName,bg:bgColor}};
function loadDoll(d){if(!d)return;Object.assign(P,DEF,d.p||{});P.tex='smooth';POSE_KEYS.forEach(k=>P[k]=DEF[k]);snapAll();setName(d.name||'');setBg(d.bg||'');syncUI();rebuild()}
let psT=0;
function persistSoon(){clearTimeout(psT);psT=setTimeout(()=>{   // 처음 꾸미는 중이면 지금까지를 저장해 두고, 앱을 닫았다 열어도 이어서
  if(ST.done||!ST.hatched)return;const cur=stack[stack.length-1]||{};if(!['egg','step','name'].includes(cur.scr)||(cur.scr==='egg'&&!eggDone))return;
  ST.draft={...snapDoll(),scr:cur.scr,step:cur.step||0};Save.commit()},300)}
function syncNtag(){const t=$('nameLive');if(!rolling)t.textContent=charName;t.style.color=bgColor?(isDark(bgColor)?'#eef4f5':'#1f2a2e'):''}
function afterRebuild(){applyHeadOnly();markCards();syncNtag();persistSoon();undoRecord();if(!$('result').hidden)drawPreview()}

// 꾸미기 7단계(둘씩 묶음): 원래 항목 묶음을 단계별로 모음. 처음 만들 때는 앞의 5단계(얼굴)만, [수정]에서는 7단계 모두
const GRP={};document.querySelectorAll('#holder details').forEach(d=>{GRP[d.querySelector('summary').textContent.trim()]=d.querySelector('.grp')});
$('bgRowHold').replaceWith($('bgs').closest('.row'));   // 배경색은 이름 짓기 화면에서
$('posesRow').appendChild($('poses'));                   // 포즈는 카드 만들기 화면에서
const STEPS=[['피부 · 머리',[['피부','피부'],['머리','머리']]],['뿔 · 귀',[['뿔','뿔'],['귀','귀']]],['눈 · 눈썹',[['눈','눈'],['눈썹','눈썹']]],
  ['코 · 입',[['코','코'],['입','입']]],['볼터치 · 볼살',[['볼터치','볼터치'],['볼살','볼살']]],['몸 · 꼬리',[['몸','몸'],['꼬리','꼬리']]],['팔 · 다리',[['팔','팔'],['다리','다리']]]];
const FACE_STEPS=5;
const stepEls=STEPS.map(([,parts])=>{const box=document.createElement('div');box.className='stepbox';
  parts.forEach(([sub,g])=>{if(sub){const h=document.createElement('h3');h.className='sub';h.textContent=sub;box.appendChild(h)}if(GRP[g])box.appendChild(GRP[g])});return box});
stepEls.forEach(e=>{e.hidden=true;$('stepBody').appendChild(e)});   // 모두 문서 안에 두고 지금 단계만 보임(슬라이더 표시가 계속 맞도록)

// 시작 고르기: 프리셋 3개 + 랜덤
let startPick='깨두';
Object.keys(PRESETS).forEach(n=>{const b=document.createElement('button');b.type='button';b.dataset.preset=n;b.style.setProperty('--c',PRESETS[n].color||DEF.color);
  b.innerHTML='<i></i>'+n;b.onclick=()=>{startPick=n;apply(PRESETS[n],true);$('rndBtn').setAttribute('aria-pressed','false');bump(true)};$('starts').appendChild(b)});
// 돌려 본 상태에서 기본형을 다시 고르면: 돌며 등장한 뒤 정면을 보게 (등장 시작 때 아주 작아서 방향을 바로 바꿔도 티 나지 않음)
function toFront(){faceFront();angle=target}
function bump(spin){if(spin){toFront();bounceT0=0;popT0=spinT0=performance.now()}else{popT0=0;bounceT0=performance.now()}}   // spin: 랜덤처럼 돌며 등장
{const b=document.createElement('button');b.type='button';b.className='dice';b.id='rndBtn';b.innerHTML='<i></i>랜덤';
 b.onclick=()=>{startPick='랜덤';dice.onclick();setTimeout(()=>b.setAttribute('aria-pressed','true'),0);bump(true)};$('starts').appendChild(b)}

// 화면 이동: 내부 목록(stack) + 브라우저 기록(휴대폰 뒤로가기와 같게)
let scrNow='',stack=[],hist=true,popTo=null,editing=false;
const isStandalone=(matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
function show(st,dir){
  const prev=scrNow;scrNow=st.scr;
  document.querySelectorAll('.scr').forEach(el=>{const on=el.dataset.scr===st.scr;el.classList.toggle('on',on);el.classList.toggle('back',on&&dir<0)});
  document.querySelectorAll('[data-back]').forEach(b=>b.style.visibility=stack.length>1?'':'hidden');
  const hold=document.querySelector(`.scr[data-scr="${st.scr}"] .stagehold`);
  if(hold&&stage.parentNode!==hold)hold.prepend(stage);
  if(prev==='card'&&st.scr!=='card')closeResult();
  if(st.scr==='egg')enterEgg();else leaveEgg();
  if(st.scr==='step'){const i=st.step||0,N=nSteps();$('stepTitle').textContent=STEPS[i][0];stepEls.forEach((e,j)=>e.hidden=j!==i);
    editorEnter(i,prev!=='step');requestAnimationFrame(saveBarCheck)}
  else if(prev==='step')lookReset();
  if(st.scr==='name'){faceFront();angle=target;syncNtag()}   // 이름 짓기는 늘 정면(꾸미기에서 돌려 본 각도를 따라오지 않게)
  if(st.scr==='main'){
    if(editing){editing=false;if(ST.doll)loadDoll(ST.doll)}            // 꾸미다 저장하지 않고 돌아오면 원래대로
    setPose(ST.pose,false);                                             // 메인에서 고른 포즈
    if(ST.doll)setBg(ST.doll.bg||'');
    faceFront();angle=target;
    if(enterSpin){enterSpin=false;const m=sayMood;$('mbub').hidden=true;bounceT0=0;popT0=spinT0=performance.now();clearTimeout(sayT);sayT=setTimeout(()=>{if(scrNow==='main')sayLine(m)},980)}   // 돌며 등장이 끝나면 말풍선 뿅
    else sayLine(sayMood);
    sayMood='';}
  if(st.scr==='card'){faceFront();angle=target;if(ST.doll)setBg(ST.doll.bg||'');openResult()}
  if(st.scr!=='main'){$('mbub').hidden=true;clearTimeout(sayT)}
  layout();scrollTo(0,0);persistSoon();
}
function faceFront(){spinning=false;$('spinBtn').setAttribute('aria-pressed',false);target=Math.round(angle/(2*Math.PI))*2*Math.PI;setViewPressed('0')}
function go(st,o={}){
  if(o.replace&&stack.length){stack[stack.length-1]=st;try{history.replaceState({d:stack.length},'')}catch(e){}}
  else{stack.push(st);if(hist)try{history.pushState({d:stack.length},'')}catch(e){hist=false}}
  show(st,1)}
function goBack(){if(stack.length<=1)return;if(hist)history.back();else{stack.pop();show(stack[stack.length-1],-1)}}
function resetTo(st){const n=stack.length-1;if(n>0&&hist){popTo=st;history.go(-n)}else{stack=[st];show(st,-1)}}
addEventListener('popstate',e=>{
  if(popTo){const st=popTo;popTo=null;stack=[st];try{history.replaceState({d:1},'')}catch(_){}show(st,-1);return}
  const d=(e.state&&e.state.d)||1;
  if(d<stack.length){stack.length=Math.max(1,d);show(stack[stack.length-1],-1)}
  else if(d>stack.length){history.go(stack.length-d)}   // 앞으로 가기는 막음
});
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=goBack);

// 각 화면 버튼
$('safariGo').onclick=()=>go({scr:'egg'},{replace:true});
$('eggGo').onclick=()=>go({scr:'step',step:0});   // 뒤로 오면 깨어난 손시·프리셋 화면(알은 다시 안 나옴)
const nSteps=()=>editing?STEPS.length:FACE_STEPS;
$('stepSave').onclick=()=>go({scr:'name'});
// 저장 버튼: 꾸미기 화면 맨 아래까지 내려왔을 때 나타남(내용이 짧아 내릴 곳이 없으면 바로 보임)
function saveBarCheck(){if(scrNow!=='step')return;const end=innerHeight+scrollY>=document.documentElement.scrollHeight-16;$('saveBar').classList.toggle('show',end)}
addEventListener('scroll',saveBarCheck,{passive:true});addEventListener('resize',saveBarCheck);
try{new ResizeObserver(saveBarCheck).observe($('stepBody'))}catch(_){}
// 이름 짓기 → 저장하기. 이름이 비어 있으면 입력칸을 흔들어 알려 줌
let sayMood='',enterSpin=false;   // enterSpin: 이름 짓고 저장한 뒤 메인에서 돌며 등장   // 다음에 메인에 들어갈 때 말풍선 상황(lines.js): 처음 만든 뒤 'first', 수정해서 바뀐 뒤 'edited'
$('saveDoll').onclick=()=>{setName($('charName').value);
  if(!charName){const inp=$('charName');inp.classList.remove('nope');void inp.offsetWidth;inp.classList.add('nope');inp.focus();return}
  const before=ST.done&&ST.doll?JSON.stringify(ST.doll.p):null;
  ST.doll=snapDoll();sayMood=!ST.done?'first':before!==JSON.stringify(ST.doll.p)?'edited':'';
  ST.done=true;ST.hatched=true;delete ST.draft;Save.commit();editing=false;enterSpin=true;resetTo({scr:'main'})};
$('goEdit').onclick=()=>{editing=true;POSE_KEYS.forEach(k=>P[k]=DEF[k]);syncUI();rebuild();go({scr:'step',step:0})};   // 꾸밀 때는 기본 포즈로
// 메인 포즈: 기본·차렷·앉기·갸우뚱 (고른 포즈는 저장해 둠)
function setPose(n,anim){n=POSES[n]?n:'기본';const same=POSE_KEYS.every(k=>P[k]===(k in POSES[n]?POSES[n][k]:DEF[k]));
  if(ST.pose!==n){ST.pose=n;Save.commit()}
  document.querySelectorAll('#mainPoses button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pose===n));
  if(same)return;POSE_KEYS.forEach(k=>P[k]=DEF[k]);Object.assign(P,POSES[n]);syncUI();rebuild();if(anim)bump()}
Object.keys(POSES).forEach(n=>{const b=document.createElement('button');b.type='button';b.className='mpose';b.dataset.pose=n;b.textContent=n;b.onclick=()=>setPose(n,true);$('mainPoses').appendChild(b)});
if($('goCard'))$('goCard').onclick=()=>go({scr:'card'});
$('goWall').onclick=()=>go({scr:'wall'});

// 메인: 말풍선(들어올 때마다, 누를 때마다 다른 말 · 멘트는 lines.js) + 누르면 통통
let bounceT0=0,popT0=0,spinT0=0,bounceK=1,sayT=0;
function sayLine(mood){const b=$('mbub');b.textContent=pickLine(mood);b.hidden=false;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
{let tx=0,ty=0,tt=0;
 canvas.addEventListener('pointerdown',e=>{tx=e.clientX;ty=e.clientY;tt=performance.now()});
 canvas.addEventListener('pointerup',e=>{const onMain=scrNow==='main',onPick=scrNow==='egg'&&eggDone;if(!onMain&&!onPick)return;   // 누르면 말랑통통(메인에선 말도 바뀜)
   if(Math.hypot(e.clientX-tx,e.clientY-ty)<8&&performance.now()-tt<450&&!popT0){bounceT0=performance.now();if(onMain)setTimeout(sayLine,140)}});}

// 말랑통통: 살짝 웅크렸다 → 늘어나며 한 번 뜀 → 착지하며 찌그러진 뒤, 젤리처럼 늘었다 줄었다 하며 잦아듦(관성)
const BOUNCE_MS=1150;
function bounceAt(t){
  const T0=0.09,T1=0.50;   // 웅크림 끝 · 착지 시점(비율)
  if(t<T0)return {dy:0,q:-0.08*Math.sin(Math.PI*t/T0)};
  if(t<T1){const a=(t-T0)/(T1-T0);return {dy:0.5*Math.sin(Math.PI*a),q:0.13*Math.sin(Math.PI*a)*(1-a)}}   // 착지 순간 모양이 0이 되게(갑자기 찌그러지지 않게)
  const u=(t-T1)/(1-T1);return {dy:0,q:-0.12*Math.exp(-4*u)*Math.sin(2*Math.PI*1.6*u)};   // 부드럽게 눌렸다 살짝 늘었다 잦아듦
}
// 매 프레임: 등장(알에서 나올 때)·통통 튀기·말풍선 위치·알 흔들림
function flowFrame(now){
  const c=chars[0];if(!c)return;
  let s=1,dy=0,sx=1,sy=1,spin=0;
  if(popT0){const t=Math.min(1,(now-popT0)/(spinT0?900:750));s=t<0.5?0.15+0.97*Math.sin(t/0.5*Math.PI/2):1.12-0.12*Math.sin((t-0.5)/0.5*Math.PI/2);if(t>=1){popT0=0;s=1}}
  if(spinT0){const t=Math.min(1,(now-spinT0)/900),e=1-Math.pow(1-t,3);spin=(1-e)*Math.PI*2;if(t>=1)spinT0=0}
  if(bounceT0){const t=(now-bounceT0)/BOUNCE_MS;if(t>=1){bounceT0=0;bounceK=1}else{const b=bounceAt(t);dy=b.dy*bounceK;sy=1+b.q*bounceK;sx=1-b.q*0.55*bounceK}}
  c.scale.set(s*sx,s*sy,s*sx);c.position.y=dy;if(spin)c.rotation.y=angle+spin;
  if(scrNow==='main'){const b=$('mbub');if(!b.hidden){const v=new THREE.Vector3(0,(charH+0.12)*s+dy,0).project(persp);
    b.style.left=((v.x+1)/2*stage.clientWidth)+'px';b.style.top=Math.max(58,(1-v.y)/2*stage.clientHeight-4)+'px'}}
  bodyFade(now);partWiggle(now);
  if(egg)eggFrame(now);
}

