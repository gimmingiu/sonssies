// == 화면 버튼: 만들기·저장(꾸미기)·저장하기(이름)·수정·포즈
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
Object.keys(POSES).forEach(n=>{const b=document.createElement('button');b.type='button';b.className='mpose';b.dataset.pose=n;
  b.textContent=n;b.onclick=()=>setPose(n,true);$('mainPoses').appendChild(b)});
$('goWall').onclick=()=>go({scr:'wall'});
