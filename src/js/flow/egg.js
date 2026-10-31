// ---------- 꿈알 ----------
// 그림 12장(EGG_ART, Graphic Assets에서 만든 꿈알)을 누를 때마다 다음 장으로 바꿔 끼움. 12장 모두 같은 구도라 제자리에서 깨져 보임.
// 바꿀 때마다 모션: 찌그러짐 → 통 뜀 → 착지하며 다시 찌그러짐 → 좌우로 흔들림. 깨질수록 세지고, 빛이 숨 쉬고, 바르르 떨림.
// 마지막 장(빛이 터짐)이 나오면 잠시 뒤 빛이 화면을 다 덮고, 조금 머문 뒤 걷히면서 알이 있던 자리에서 손시가 나옴.
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
function hatchedUI(on){$('eggHint').hidden=on;$('eggGuide').classList.toggle('inv',!on);$('pickBox').hidden=!on;$('app').querySelector('.stagehold[data-size="egg"]').classList.toggle('done',on)}
function enterEgg(){if(eggDone){hatchedUI(true);if(egg)egg.box.hidden=true;if(chars[0])chars[0].visible=true;return}
  hatchedUI(false);if(!egg)makeEgg();egg.box.hidden=false;if(chars[0])chars[0].visible=false;$('eggHint').textContent='터치하여 알 깨기'}
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
  $('eggHint').textContent=n<4?'터치하여 알 깨기':n<8?'손시가 깨어나고 있어요!':'손시가 곧 태어나요!';
  if(n>=EGG_N)setTimeout(hatch,900);
}
// 알 그림의 알 가운데가 손시의 몸 가운데와 겹치게 세로 위치를 맞춤(손시가 알이 있던 자리에서 나오게)
const EGG_CY=0.506;   // 그림 안에서 알 가운데의 세로 위치(비율)
function eggFrame(){
  if(!egg||egg.box.hidden)return;
  const v=new THREE.Vector3(0,charH*0.44,0).project(persp),hh=stage.clientHeight,ew=egg.w.offsetHeight;if(!hh||!ew)return;
  const off=Math.round((1-v.y)/2*hh-hh/2-(EGG_CY-0.5)*ew);
  if(off!==egg.off){egg.off=off;egg.w.style.translate=`0 ${off}px`}
}
function hatch(){
  eggDone=true;
  const IN=650,HOLD=1000,OUT=1000;   // 빛이 덮는 시간 · 머무는 시간 · 걷히는 시간(ms)
  const f=document.createElement('div');f.className='flash';document.body.appendChild(f);
  f.animate([{opacity:0},{opacity:1}],{duration:IN,easing:'ease-in',fill:'forwards'});
  try{navigator.vibrate&&navigator.vibrate([30,60,60])}catch(_){}
  // 화면이 다 덮였을 때 뒤에서 몰래 바꿈: 알 숨기기, 고르기 화면 준비(미리보기 칸 크기는 그대로라 아무것도 움직이지 않음)
  setTimeout(()=>{if(egg)egg.box.hidden=true;hatchedUI(true);layout();if(chars[0])chars[0].visible=false;ST.hatched=true;Save.commit()},IN+40);
  // 빛이 걷히면서 손시가 '뿅'
  setTimeout(()=>{if(chars[0])chars[0].visible=true;spinT0=0;bounceT0=0;popT0=performance.now();
    const a=f.animate([{opacity:1},{opacity:0}],{duration:OUT,easing:'ease-out',fill:'forwards'});a.onfinish=()=>f.remove();setTimeout(sparks,420)},IN+HOLD);
  // ?egg 테스트에서 이미 만든 손시가 있으면, 깨어나는 모습을 잠깐 보여 준 뒤 메인으로 돌아감
  if(Save.dry&&ST.done&&ST.doll)setTimeout(()=>{if(scrNow==='egg')resetTo({scr:'main'})},IN+HOLD+OUT+2200);
}



// 등장 뒤 반짝이: 손시 몸에서 한꺼번에 '차란~' 퍼졌다가 금방 사라짐(1초 남짓)
function sparks(){
  if(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const hold=$('app').querySelector('.stagehold[data-size="egg"]');if(!hold)return;
  const W=stage.clientWidth,H=stage.clientHeight,R=Math.min(W,H);
  const v=new THREE.Vector3(0,charH*0.44,0).project(persp),cx=(v.x+1)/2*W,cy=(1-v.y)/2*H;
  const lay=document.createElement('div');lay.className='sparks';hold.appendChild(lay);
  for(let i=0;i<26;i++){
    const d=document.createElement('i'),star=i%3===0,sz=star?16+Math.random()*14:8+Math.random()*12;
    if(star)d.className='st';d.style.setProperty('--s',sz.toFixed(1)+'px');lay.appendChild(d);
    const a=(i/26)*Math.PI*2+Math.random()*0.5,r0=R*(0.04+Math.random()*0.08),r1=R*(0.26+Math.random()*0.26);
    const x0=cx+Math.cos(a)*r0,y0=cy+Math.sin(a)*r0*0.8,x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1*0.75-R*0.05;
    const P=k=>`translate(${(x0+(x1-x0)*k).toFixed(1)}px,${(y0+(y1-y0)*k).toFixed(1)}px)`,rot=star?Math.random()*40-20:0;
    d.animate([
      {transform:`${P(0)} scale(.2) rotate(${rot}deg)`,opacity:0},
      {transform:`${P(.55)} scale(1.15) rotate(${rot+15}deg)`,opacity:1,offset:.14},
      {transform:`${P(.8)} scale(.85) rotate(${rot+30}deg)`,opacity:.7,offset:.38},
      {transform:`${P(.9)} scale(1) rotate(${rot+40}deg)`,opacity:1,offset:.5},
      {transform:`${P(1)} scale(.3) rotate(${rot+60}deg)`,opacity:0}],
      {duration:900+Math.random()*450,delay:Math.random()*120,easing:'cubic-bezier(.2,.7,.4,1)',fill:'both'});
  }
  setTimeout(()=>lay.remove(),1800);
}
