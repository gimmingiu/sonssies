// ---------- UI ----------
const $=id=>document.getElementById(id);
// 단계식 슬라이더: 모든 항목이 −5 ~ 0(기본값) ~ +5. 0 위·아래 한 칸 크기는 항목마다 따로(기존 조절 범위 유지)
const unit=(k,d)=>d>0?Math.max(0,META[k].mx-DEF[k])/5:Math.max(0,DEF[k]-META[k].mn)/5;
const toVal=(k,st)=>DEF[k]+(st>=0?st*unit(k,1):st*unit(k,-1));
const stepOf=(k,v)=>{const d=DEF[k],up=unit(k,1),dn=unit(k,-1);let st=v>=d?(up>0?Math.round((v-d)/up):0):(dn>0?-Math.round((d-v)/dn):0);return Math.max(-5,Math.min(5,st))};
const toStep=k=>stepOf(k,P[k]);
const snapAll=()=>Object.keys(META).forEach(k=>P[k]=toVal(k,toStep(k)));
const sgn=st=>st>0?'p':st<0?'n':'z';
function renderStep(k){const st=toStep(k),el=$(k),o=$('o_'+k);
  el.setAttribute('aria-valuenow',st);el.setAttribute('aria-valuetext',(st>0?'+':'')+st);el.dataset.sign=sgn(st);
  o.textContent=(st>0?'+':'')+st;o.dataset.sign=sgn(st);
  el.querySelectorAll('.pip').forEach((p,i)=>{const s=i-5;p.classList.toggle('on',st>0?(s>0&&s<st):st<0?(s<0&&s>st):false);p.classList.toggle('cur',s===st)})}
function setStep(k,st){st=Math.max(META[k].mn>=DEF[k]?0:-5,Math.min(META[k].mx<=DEF[k]?0:5,st));const v=toVal(k,st);
  let on=false;
  if(k==='mouthCurve'&&P.mouthType!=='smile'&&P.mouthType!=='smirk'){P.mouthType='smile';on=true;syncUI()}   // 곡률은 미소 계열 입에 적용
if(k.startsWith('horn')&&!P.horns){P.horns=true;on=true;const h=$('horns');if(h)h.checked=true}   // 뿔을 끈 상태에서 뿔 값을 만지면 다시 켬
  if(Math.abs(P[k]-v)<1e-9){if(on)soon();return}P[k]=v;renderStep(k);markPressed();soon()}
function makeRow(k,l,grp){
    const label=l.replace(/\s*\(°\)/,'');
    const r=document.createElement('div');r.className='row';
    r.innerHTML=`<div class="rl"><span>${label}</span><output id="o_${k}">0</output></div>
      <div class="stepper"><button class="sb" type="button" data-d="-1" aria-label="${label} 한 단계 줄이기">‹</button>
      <div class="pips" id="${k}" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="-5" aria-valuemax="5">${Array.from({length:11},(_,i)=>`<span class="pip${i===5?' mid':''}"></span>`).join('')}</div>
      <button class="sb" type="button" data-d="1" aria-label="${label} 한 단계 늘리기">›</button></div>`;
    grp.appendChild(r);
    if(META[k].mn>=DEF[k]){r.classList.add('plusonly');r.querySelector('.pips').setAttribute('aria-valuemin','0')}   // − 쪽 없음
    if(META[k].mx<=DEF[k]){r.classList.add('minusonly');r.querySelector('.pips').setAttribute('aria-valuemax','0')}   // + 쪽 없음
    r.querySelectorAll('.sb').forEach(b=>b.onclick=()=>setStep(k,toStep(k)+(+b.dataset.d)));
    const pips=r.querySelector('.pips');let down=false;
    const at=e=>{const rc=pips.getBoundingClientRect();const i=Math.floor((e.clientX-rc.left)/rc.width*11);setStep(k,Math.max(0,Math.min(10,i))-5)};
    pips.addEventListener('pointerdown',e=>{down=true;pips.setPointerCapture(e.pointerId);at(e)});
    pips.addEventListener('pointermove',e=>{if(down)at(e)});
    pips.addEventListener('pointerup',()=>down=false);pips.addEventListener('pointercancel',()=>down=false);
    pips.addEventListener('dblclick',()=>setStep(k,0));
    pips.addEventListener('keydown',e=>{const m={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[e.key];
      if(m){e.preventDefault();setStep(k,toStep(k)+m)}else if(e.key==='Home'){e.preventDefault();setStep(k,-5)}else if(e.key==='End'){e.preventDefault();setStep(k,5)}else if(e.key==='0'){setStep(k,0)}});
    return r;
}
GROUPS.forEach(([name,rows])=>{
  const d=document.createElement('details');
  d.innerHTML='<summary>'+name+'</summary><div class="grp"></div>';
  const grp=d.querySelector('.grp');
  rows.forEach(([k,l])=>makeRow(k,l,grp));
  if(name==='뿔'){const lab=document.querySelector('label[for="horns"]');if(lab)grp.prepend(lab)}
  if(name==='꼬리'){const lab=document.querySelector('label[for="tail"]');if(lab)grp.prepend(lab)}
  if(name==='눈')grp.prepend($('eyeRow'));
  if(name==='입')grp.prepend($('mouthRow'));
  if(name==='볼'){grp.prepend($('blushRow'));grp.prepend($('blushTg'))}
  if(name==='포즈'){
    const top=document.createElement('div');
    top.innerHTML='<div class="pbtns" id="poses"></div>';
    grp.prepend(top);
  }
  $('groups').appendChild(d);
});
// 드래그 중엔 거친 해상도로 빠르게, 손을 떼면 매끈하게 다시 계산
let pend=false,fineT;
function soon(){
  if(!pend){pend=true;requestAnimationFrame(()=>{pend=false;rebuild(false)})}
  $('busy').classList.add('on');clearTimeout(fineT);
  fineT=setTimeout(()=>{rebuild(true);$('busy').classList.remove('on')},260);
}
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
  document.querySelectorAll('#texs .pbtn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===P.tex));
  document.querySelectorAll('#colors .sw').forEach(s=>s.setAttribute('aria-pressed',s.dataset.c===P.color));
  $('pick').dataset.on=![...document.querySelectorAll('#colors .sw')].some(s=>s.dataset.c===P.color);
  document.querySelectorAll('.bgset .sw').forEach(s=>s.setAttribute('aria-pressed',s.dataset.bg===bgColor));
  const custom=!!bgColor&&![...document.querySelectorAll('#bgs .sw')].some(s=>s.dataset.bg===bgColor);
  document.querySelectorAll('.bgpick').forEach(p=>{p.dataset.on=custom;if(custom)p.value=bgColor});
}
function apply(obj,full){const keep={tex:P.tex};if(!full){keep.color=P.color;EXPR_KEYS.concat(POSE_KEYS).forEach(k=>keep[k]=P[k])}Object.assign(P,DEF,keep,obj);snapAll();syncUI();rebuild()}
Object.keys(POSES).forEach(n=>{const b=document.createElement('button');b.className='pbtn';b.textContent=n;b.onclick=()=>{POSE_KEYS.forEach(k=>P[k]=DEF[k]);Object.assign(P,POSES[n]);syncUI();rebuild()};$('poses').appendChild(b)});
[['eyeTypes','eyeType',[['dot','점'],['happy','웃는눈 ∩'],['content','감은눈 ∪'],['squint','찡그림 > <'],['line','일자눈'],['wide','초롱눈']]],
 ['mouthTypes','mouthType',[['smile','미소'],['smirk','씩 웃음'],['open','벌린입'],['munch','냠냠 ω'],['o','오입'],['flat','일자입']]]].forEach(([box,k,opts])=>
  opts.forEach(([v,l])=>{const b=document.createElement('button');b.type='button';b.className='pbtn';b.dataset.v=v;b.textContent=l;b.onclick=()=>{P[k]=v;syncUI();rebuild()};$(box).appendChild(b)}));
Object.keys(PRESETS).forEach(n=>{const b=document.createElement('button');b.className='pbtn';b.textContent=n;b.dataset.preset=n;b.setAttribute('aria-pressed','false');b.onclick=()=>{apply(PRESETS[n],true);setName(n)};$('presets').appendChild(b)});
const dice=document.createElement('button');dice.className='pbtn dice';dice.textContent='랜덤';
dice.onclick=()=>{const o={};Object.keys(META).filter(k=>!POSE_KEYS.includes(k)).forEach(k=>{o[k]=toVal(k,Math.floor(Math.random()*9)-4)});
  o.horns=Math.random()<0.85;POSE_KEYS.forEach(k=>o[k]=DEF[k]);   // 랜덤은 항상 기본 포즈
  const en=Object.keys(EXPRS);Object.assign(o,EXPRS[en[Math.floor(Math.random()*en.length)]]);
  rollName();
  o.color='#'+new THREE.Color().setHSL(Math.random(),0.45+Math.random()*0.3,0.74+Math.random()*0.1).getHexString();  // 파스텔 톤 안에서 랜덤 색
  apply(o,true)};
$('presets').appendChild(dice);
function setViewPressed(a){document.querySelectorAll('#views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.a===a))}
document.querySelectorAll('#views button').forEach(b=>b.onclick=()=>{if(b.id==='spinBtn')return;spinning=false;$('spinBtn').setAttribute('aria-pressed',false);const a=parseFloat(b.dataset.a);target=a+Math.round((angle-a)/(2*Math.PI))*2*Math.PI;setViewPressed(b.dataset.a)});
['horns','tail'].forEach(k=>$(k).onchange=e=>{P[k]=e.target.checked;syncUI();rebuild()});
$('blush2').onchange=e=>{P.blush=e.target.checked;syncUI();rebuild()};
// 볼터치 색: 고르면 볼터치도 함께 켬
function setBlushColor(c){P.blushColor=c;P.blush=true;syncUI();rebuild()}
document.querySelectorAll('#blushes .sw').forEach(s=>s.onclick=()=>setBlushColor(s.dataset.c));
$('blushPick').addEventListener('input',e=>{P.blushColor=e.target.value;P.blush=true;syncUI();soon()});
Object.keys(TEX).forEach(t=>{const b=document.createElement('button');b.className='pbtn';b.type='button';b.dataset.t=t;b.textContent=TEX[t].name;b.onclick=()=>{P.tex=t;syncUI();rebuild()};$('texs').appendChild(b)});
$('spinBtn').onclick=()=>{spinning=!spinning;$('spinBtn').setAttribute('aria-pressed',spinning);if(spinning)setViewPressed(null)};
function setColor(c){P.color=c;syncUI();rebuild()}
document.querySelectorAll('#colors .sw').forEach(s=>s.onclick=()=>setColor(s.dataset.c));
// 미리보기 배경색: 비우면 기본(화면 모드에 맞춘 색). 어두운 배경이면 라벨 글자를 밝게
let bgColor='';
const isDark=hex=>{const c=new THREE.Color(hex);return 0.2126*c.r+0.7152*c.g+0.0722*c.b<0.45};
function setBg(c){bgColor=c||'';$('rcard').style.background=bgColor;$('stageBg').style.background=bgColor;stage.style.setProperty('--sfg',bgColor?(isDark(bgColor)?'#eef4f5':'#1f2a2e'):'');syncUI();if(typeof persistSoon==='function')persistSoon();if(!$('result').hidden)drawPreview(true)}
document.querySelectorAll('.bgset .sw').forEach(s=>s.onclick=()=>setBg(s.dataset.bg));
document.querySelectorAll('.bgpick').forEach(p=>p.addEventListener('input',e=>setBg(e.target.value)));
$('pick').addEventListener('input',e=>{P.color=e.target.value;syncUI();soon()});
$('reset').onclick=()=>{apply(PRESETS['깨두'],true);setName('깨두')};
$('copy').onclick=()=>{
  const o={};Object.keys(P).forEach(k=>{if(k in META){if(!POSE_KEYS.includes(k))o[k]=toStep(k)}else if(!POSE_KEYS.includes(k)||k==='sit')o[k]=P[k]});
  o.name=charName;const txt=JSON.stringify(o);const out=$('out');out.value=txt;
  const show=()=>{out.hidden=false;out.focus();out.select();$('toast').textContent='아래 칸의 값을 복사해 주세요.'};
  try{navigator.clipboard.writeText(txt).then(()=>{$('toast').textContent='설정값을 복사했어요.';out.hidden=true},show)}catch(_){show()}
};
// 국어의 로마자 표기법(문화체육관광부 고시)에 따라 이름을 로마자로: 받침 연음, ㄹㄹ→ll, 받침 대표음 규칙 적용
function romanize(str){
  const I=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const V=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  const F=['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
  // 받침이 다음 음절 첫소리로 넘어갈 때(연음)의 초성 인덱스
  const FI=[-1,0,1,-2,2,-2,-2,3,5,-2,-2,-2,-2,-2,-2,-2,6,7,-2,9,10,-1,12,14,15,16,17,18];
  const syl=[];let out='';
  for(const ch of str){const c=ch.charCodeAt(0);
    if(c>=0xAC00&&c<=0xD7A3){const k=c-0xAC00;syl.push({i:Math.floor(k/588),v:Math.floor((k%588)/28),f:k%28})}
    else syl.push({raw:/[A-Za-z0-9]/.test(ch)?ch.toLowerCase():''});}
  for(let n=0;n<syl.length;n++){const a=syl[n],b=syl[n+1];
    if(a.raw!==undefined){out+=a.raw;continue}
    let f=a.f,init=I[a.i];
    if(n>0&&syl[n-1].moved!==undefined)init=I[syl[n-1].moved];
    out+=init+V[a.v];
    if(f&&b&&b.raw===undefined&&b.i===11&&FI[f]>=0){a.moved=FI[f];continue}          // 연음: 받침이 다음 'ㅇ' 자리로
    if(f===8&&b&&b.raw===undefined&&b.i===5){out+='l';continue}                        // ㄹ+ㄹ → ll
    out+=F[f];
  }
  out=out.replace(/lr/g,'ll');
  return out?out[0].toUpperCase()+out.slice(1):'';
}
