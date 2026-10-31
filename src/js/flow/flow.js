// ---------- 화면 흐름 (첫 방문: 알 → 시작 고르기 → 꾸미기 8단계 → 이름 → 메인) ----------
let ST=Save.data();   // 저장 묶음 (src/js/save/save.js)
const snapDoll=()=>{const o={};Object.keys(P).forEach(k=>{if(!POSE_KEYS.includes(k))o[k]=P[k]});return {p:o,name:charName,bg:bgColor}};
function loadDoll(d){if(!d)return;Object.assign(P,DEF,d.p||{});POSE_KEYS.forEach(k=>P[k]=DEF[k]);snapAll();setName(d.name||'깨두');setBg(d.bg||'');syncUI();rebuild()}
let psT=0;
function persistSoon(){clearTimeout(psT);psT=setTimeout(()=>{   // 처음 꾸미는 중이면 지금까지를 저장해 두고, 앱을 닫았다 열어도 이어서
  if(ST.done||!ST.hatched)return;const cur=stack[stack.length-1]||{};if(!['egg','step','name'].includes(cur.scr)||(cur.scr==='egg'&&!eggDone))return;
  ST.draft={...snapDoll(),scr:cur.scr,step:cur.step||0};Save.commit()},300)}
function syncNtag(){const t=$('nameLive');if(!rolling){t.textContent=charName||'깨두';hello(charName)}t.style.color=bgColor?(isDark(bgColor)?'#eef4f5':'#1f2a2e'):''}
// '안녕! 나는 ○○야/이야' (받침 있으면 이야)
function hello(){}
function afterRebuild(){applyHeadOnly();syncNtag();persistSoon();undoRecord();if(!$('result').hidden)drawPreview()}

// 꾸미기 8단계: 원래 항목 묶음을 단계별로 모음
const GRP={};document.querySelectorAll('#holder details').forEach(d=>{GRP[d.querySelector('summary').textContent.trim()]=d.querySelector('.grp')});
$('bgRowHold').replaceWith($('bgs').closest('.row'));   // 배경색은 이름 짓기 화면에서
$('posesRow').appendChild($('poses'));                   // 포즈는 카드 만들기 화면에서
const STEPS=[['색 · 질감',[['','색 · 질감']]],['머리 · 뿔',[['머리','머리'],['뿔','뿔']]],['귀',[['','귀']]],['눈 · 눈썹',[['눈','눈'],['눈썹','눈썹']]],
  ['코 · 입 · 볼',[['코','코'],['입','입'],['볼','볼']]],['몸',[['','몸']]],['팔 · 다리',[['팔','팔'],['다리','다리']]],['꼬리',[['','꼬리']]]];
const stepEls=STEPS.map(([,parts])=>{const box=document.createElement('div');box.className='stepbox';
  parts.forEach(([sub,g])=>{if(sub){const h=document.createElement('h3');h.className='sub';h.textContent=sub;box.appendChild(h)}if(GRP[g])box.appendChild(GRP[g])});return box});
stepEls.forEach(e=>{e.hidden=true;$('stepBody').appendChild(e)});   // 모두 문서 안에 두고 지금 단계만 보임(슬라이더 표시가 계속 맞도록)
$('prog').innerHTML=STEPS.map(()=>'<i></i>').join('');

// 시작 고르기: 프리셋 3개 + 랜덤
let startPick='깨두';
Object.keys(PRESETS).forEach(n=>{const b=document.createElement('button');b.type='button';b.dataset.preset=n;b.style.setProperty('--c',PRESETS[n].color||DEF.color);
  b.innerHTML='<i></i>'+n;b.onclick=()=>{startPick=n;apply(PRESETS[n],true);setName(n);$('rndBtn').setAttribute('aria-pressed','false');bump(true)};$('starts').appendChild(b)});
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
  if(st.scr==='step'){const i=st.step||0,N=nSteps();$('stepTitle').textContent=STEPS[i][0];$('stepPrev').disabled=stack.length<=1;stepEls.forEach((e,j)=>e.hidden=j!==i);
    $('prog').style.gridTemplateColumns=`repeat(${N},1fr)`;$('prog').querySelectorAll('i').forEach((e,j)=>{e.hidden=j>=N;e.classList.toggle('on',j<=i)});$('pnum').textContent=(i+1)+'/'+N;
    $('prog').setAttribute('aria-valuemax',N);$('prog').setAttribute('aria-valuenow',i+1);const last=i>=N-1;$('stepNext').hidden=last;$('stepMake').hidden=!last;$('stepMake').textContent=editing?'완료':'생성하기';
    editorEnter(i,prev!=='step')}
  else if(prev==='step')lookReset();
  if(st.scr==='name')syncNtag();
  if(st.scr==='main'){
    if(editing){editing=false;if(ST.doll)loadDoll(ST.doll)}            // 꾸미다 저장하지 않고 돌아오면 원래대로
    else if(POSE_KEYS.some(k=>P[k]!==DEF[k])){POSE_KEYS.forEach(k=>P[k]=DEF[k]);syncUI();rebuild()}   // 카드에서 바꾼 포즈는 메인에선 기본으로
    if(ST.doll)setBg(ST.doll.bg||'');
    faceFront();sayLine();}
  if(st.scr==='card'){faceFront();angle=target;if(ST.doll)setBg(ST.doll.bg||'');openResult()}
  if(st.scr!=='main')$('mbub').hidden=true;
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
$('stepPrev').onclick=goBack;
$('startGo').onclick=()=>go({scr:'step',step:0});
const nSteps=()=>editing?STEPS.length:5;
$('stepNext').onclick=()=>{const i=stack[stack.length-1].step||0;go(i<nSteps()-1?{scr:'step',step:i+1}:{scr:'name'})};
$('stepMake').onclick=()=>go({scr:'name'});
$('saveDoll').onclick=()=>{setName($('charName').value);ST.doll=snapDoll();ST.done=true;ST.hatched=true;delete ST.draft;Save.commit();editing=false;resetTo({scr:'main'})};
$('goEdit').onclick=()=>{editing=true;go({scr:'step',step:0})};
if($('goCard'))$('goCard').onclick=()=>go({scr:'card'});
$('goWall').onclick=()=>go({scr:'wall'});

// 메인: 말풍선(들어올 때마다, 누를 때마다 다른 말) + 누르면 통통
const LINES={morning:['잘 잤어?','좋은 아침!','오늘도 힘내!'],noon:['밥 먹었어?','점심 맛있게 먹어!','배고파…'],evening:['오늘 어땠어?','수고했어!','저녁 먹었어?'],night:['졸려…','잘 자!','꿈에서 만나!'],
  any:['안녕!','반가워!','보고 싶었어!','나랑 놀자!','헤헤','오늘도 고마워!']};
let lastLine='',bounceT0=0,popT0=0,spinT0=0;
function pickLine(){const h=new Date().getHours(),t=h>=5&&h<11?'morning':h>=11&&h<14?'noon':h>=17&&h<22?'evening':h>=22||h<5?'night':'';
  const pool=(LINES[t]||[]).concat(LINES.any);let x;do{x=pool[Math.floor(Math.random()*pool.length)]}while(x===lastLine&&pool.length>1);return lastLine=x}
function sayLine(){const b=$('mbub');b.textContent=pickLine();b.hidden=false;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
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
  if(bounceT0){const t=(now-bounceT0)/BOUNCE_MS;if(t>=1)bounceT0=0;else{const b=bounceAt(t);dy=b.dy;sy=1+b.q;sx=1-b.q*0.55}}
  c.scale.set(s*sx,s*sy,s*sx);c.position.y=dy;if(spin)c.rotation.y=angle+spin;
  if(scrNow==='main'){const b=$('mbub');if(!b.hidden){const v=new THREE.Vector3(0,(charH+0.12)*s+dy,0).project(persp);
    b.style.left=((v.x+1)/2*stage.clientWidth)+'px';b.style.top=Math.max(58,(1-v.y)/2*stage.clientHeight-4)+'px'}}
  if(egg)eggFrame(now);
}

