// ---------- 꿈알 ----------
// 그림 12장(EGG_ART, Graphic Assets에서 만든 꿈알)을 누를 때마다 다음 장으로 바꿔 끼움. 12장 모두 같은 구도라 제자리에서 깨져 보임.
// 바꿀 때마다 모션: 찌그러짐 → 통 뜀 → 착지하며 다시 찌그러짐 → 좌우로 흔들림. 깨질수록 세지고, 빛이 숨 쉬고, 바르르 떨림.
// 마지막 장(빛이 터짐)이 나오면 잠시 뒤 하얗게 번쩍이며 손시가 나옴.
let egg=null,eggTaps=0,eggDone=false;const EGG_N=EGG_ART.length-1;   // 누르는 횟수 = 11 (1장은 멀쩡한 알)
function makeEgg(){
  const hold=$('app').querySelector('.stagehold[data-size="egg"]');
  const box=document.createElement('div');box.className='eggart';box.id='eggArt';box.setAttribute('role','button');box.setAttribute('aria-label','꿈알 두드리기');
  box.innerHTML='<div class="eglow"></div><div class="eggw"><img alt="" draggable="false"></div>';
  hold.appendChild(box);
  const img=box.querySelector('img');img.src=EGG_ART[0];
  EGG_ART.forEach(u=>{const i=new Image();i.src=u;i.decode&&i.decode().catch(()=>{})});   // 미리 풀어 두어 바꿀 때 깜빡임 없게
  box.addEventListener('pointerdown',e=>{e.preventDefault();eggTap()});
  box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();eggTap()}});box.tabIndex=0;
  egg={box,img,w:box.querySelector('.eggw'),glow:box.querySelector('.eglow'),anim:null};
}
function hatchedUI(on){$('eggHint').hidden=on;$('eggGuide').hidden=!on;$('starts').hidden=!on;$('eggGo').hidden=!on;$('app').querySelector('.stagehold[data-size="egg"]').classList.toggle('done',on)}
function enterEgg(){if(eggDone){hatchedUI(true);if(egg)egg.box.hidden=true;if(chars[0])chars[0].visible=true;return}
  hatchedUI(false);if(!egg)makeEgg();egg.box.hidden=false;if(chars[0])chars[0].visible=false;$('eggHint').textContent='알을 깨서 손시를 깨워주세요.'}
function leaveEgg(){if(egg&&eggDone){egg.box.remove();egg=null}if(chars[0])chars[0].visible=true}
function eggTap(){
  if(eggDone||!egg||eggTaps>=EGG_N)return;
  const n=++eggTaps,k=n/EGG_N;egg.img.src=EGG_ART[n];
  egg.box.style.setProperty('--glow',Math.min(1,0.15+k*0.9).toFixed(2));
  egg.box.classList.toggle('shiver',n>=7&&n<EGG_N);egg.box.classList.toggle('breathe',n>=4);
  // 통 튀는 모션(인트로 손시 점프와 같은 말랑한 느낌). 깨질수록 높이·흔들림이 커짐
  const up=6+k*10,rot=(n%2?1:-1)*(3+k*7),sq=0.06+k*0.05;
  if(egg.anim)egg.anim.cancel();
  egg.anim=egg.w.animate([
    {transform:'translateY(0) scale(1,1) rotate(0deg)',easing:'cubic-bezier(.3,0,.7,1)'},
    {transform:`translateY(0) scale(${1+sq},${1-sq}) rotate(0deg)`,offset:.12,easing:'cubic-bezier(.15,.55,.45,1)'},
    {transform:`translateY(-${up}%) scale(${1-sq*0.6},${1+sq*0.7}) rotate(${rot*0.4}deg)`,offset:.42,easing:'cubic-bezier(.55,0,.85,.45)'},
    {transform:`translateY(0) scale(${1+sq*0.9},${1-sq*0.9}) rotate(${-rot*0.3}deg)`,offset:.66,easing:'cubic-bezier(.3,0,.7,1)'},
    {transform:`translateY(0) scale(1,1) rotate(${rot*0.6}deg)`,offset:.8},
    {transform:`translateY(0) scale(1,1) rotate(${-rot*0.3}deg)`,offset:.9},
    {transform:'translateY(0) scale(1,1) rotate(0deg)'}],{duration:640+k*120});
  egg.glow.animate([{opacity:1,transform:'scale(1.15)'},{opacity:0,transform:'scale(1)'}],{duration:420,easing:'ease-out'});   // 누를 때 빛 번쩍
  try{navigator.vibrate&&navigator.vibrate(10+n*2)}catch(_){}
  $('eggHint').textContent=n<4?'알을 깨서 손시를 깨워주세요.':n<8?'조금만 더!':'곧 나올 것 같아!';
  if(n>=EGG_N)setTimeout(hatch,900);
}
function eggFrame(){}
function hatch(){
  eggDone=true;const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),1200);
  setTimeout(()=>{if(egg)egg.box.hidden=true;if(chars[0]){chars[0].visible=true}popT0=performance.now();
    hatchedUI(true);layout();ST.hatched=true;Save.commit()},200);
  // ?egg 테스트에서 이미 만든 손시가 있으면, 깨어나는 모습을 잠깐 보여 준 뒤 메인으로 돌아감
  if(Save.dry&&ST.done&&ST.doll)setTimeout(()=>{if(scrNow==='egg')resetTo({scr:'main'})},2800);
}

