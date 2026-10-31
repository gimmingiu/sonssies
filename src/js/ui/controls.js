// == 부위 버튼·프리셋·랜덤: 눌림 표시(syncUI), 값 한꺼번에 바꾸기(apply), 눈·입 모양 버튼
const BODY_KEYS=()=>Object.keys(META).filter(k=>!POSE_KEYS.includes(k));
function presetMatch(n){const pr=PRESETS[n];return BODY_KEYS().every(k=>stepOf(k,k in pr?pr[k]:DEF[k])===toStep(k))&&EXPR_KEYS.every(k=>(k in pr?pr[k]:DEF[k])===P[k])}
function markPressed(){
  document.querySelectorAll('#presets .pbtn[data-preset],#starts [data-preset]').forEach(b=>b.setAttribute('aria-pressed',presetMatch(b.dataset.preset)));
  document.querySelectorAll('#exprs .pbtn').forEach(b=>{const e=EXPRS[b.textContent];b.setAttribute('aria-pressed',EXPR_KEYS.every(k=>e[k]===P[k]))});
  document.querySelectorAll('#poses .pbtn').forEach(b=>{const e=POSES[b.textContent];b.setAttribute('aria-pressed',POSE_KEYS.every(k=>(k in e?e[k]:DEF[k])===P[k]))});
}
function syncUI(){
  markPressed();
  Object.keys(META).forEach(renderStep);
  document.querySelectorAll('#eyeTypes .pbtn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===P.eyeType));
  document.querySelectorAll('#mouthTypes .pbtn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===P.mouthType));
  document.querySelectorAll('#exprs .pbtn').forEach(b=>{const e=EXPRS[b.textContent];b.setAttribute('aria-pressed',EXPR_KEYS.every(k=>e[k]===P[k]))});

  document.querySelectorAll('#poses .pbtn').forEach(b=>{const e=POSES[b.textContent];b.setAttribute('aria-pressed',POSE_KEYS.every(k=>(k in e?e[k]:DEF[k])===P[k]))});
  document.querySelectorAll('#blushes .sw').forEach(s=>s.setAttribute('aria-pressed',s.dataset.c===P.blushColor));
  $('blushPick').dataset.on=![...document.querySelectorAll('#blushes .sw')].some(s=>s.dataset.c===P.blushColor);
  $('horns').checked=P.horns;$('blush2').checked=P.blush;$('tail').checked=P.tail;$('pick').value=P.color;
  document.querySelectorAll('#colors .sw').forEach(s=>s.setAttribute('aria-pressed',s.dataset.c===P.color));
  $('pick').dataset.on=![...document.querySelectorAll('#colors .sw')].some(s=>s.dataset.c===P.color);
  document.querySelectorAll('.bgset .sw').forEach(s=>s.setAttribute('aria-pressed',s.dataset.bg===bgColor));
  const custom=!!bgColor&&![...document.querySelectorAll('#bgs .sw')].some(s=>s.dataset.bg===bgColor);
  document.querySelectorAll('.bgpick').forEach(p=>{p.dataset.on=custom;if(custom)p.value=bgColor});
}
function apply(obj,full){const keep={tex:P.tex};if(!full){keep.color=P.color;EXPR_KEYS.concat(POSE_KEYS).forEach(k=>keep[k]=P[k])}Object.assign(P,DEF,keep,obj);snapAll();syncUI();rebuild()}
Object.keys(POSES).forEach(n=>{const b=document.createElement('button');b.className='pbtn';b.textContent=n;b.onclick=()=>{POSE_KEYS.forEach(k=>P[k]=DEF[k]);
  Object.assign(P,POSES[n]);syncUI();rebuild()};$('poses').appendChild(b)});
[['eyeTypes','eyeType',[['dot','똘망'],['happy','히죽'],['content','스르르'],['squint','찡긋'],['line','게슴츠레'],['wide','초롱']]],
 ['mouthTypes','mouthType',[['flat','알쏭달쏭'],['smile','미소'],['smirk','씰룩'],['munch','야옹'],['puff','냠냠'],['none','없음']]]].forEach(([box,k,opts])=>
  opts.forEach(([v,l])=>{const b=document.createElement('button');b.type='button';b.className='pbtn';b.dataset.v=v;b.textContent=l;b.onclick=()=>{P[k]=v;syncUI();rebuild()};$(box).appendChild(b)}));
Object.keys(PRESETS).forEach(n=>{const b=document.createElement('button');b.className='pbtn';b.textContent=n;b.dataset.preset=n;
  b.setAttribute('aria-pressed','false');b.onclick=()=>{apply(PRESETS[n],true);setName(n)};$('presets').appendChild(b)});
const dice=document.createElement('button');dice.className='pbtn dice';dice.textContent='랜덤';
dice.onclick=()=>{const o={};Object.keys(META).filter(k=>!POSE_KEYS.includes(k)).forEach(k=>{o[k]=toVal(k,Math.floor(Math.random()*9)-4)});
  o.horns=Math.random()<0.85;POSE_KEYS.forEach(k=>o[k]=DEF[k]);   // 랜덤은 항상 기본 포즈
  const en=Object.keys(EXPRS);Object.assign(o,EXPRS[en[Math.floor(Math.random()*en.length)]]);
  o.color='#'+new THREE.Color().setHSL(Math.random(),0.45+Math.random()*0.3,0.74+Math.random()*0.1).getHexString();  // 파스텔 톤 안에서 랜덤 색
  apply(o,true)};
$('presets').appendChild(dice);
