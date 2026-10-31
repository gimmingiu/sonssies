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
      <div class="pips" id="${k}" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="-5" aria-valuemax="5">${Array.from({length:11},
        (_,i)=>`<span class="pip${i===5?' mid':''}"></span>`).join('')}</div>
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
      if(m){e.preventDefault();setStep(k,toStep(k)+m)}else if(e.key==='Home'){e.preventDefault();setStep(k,-5)}else if(e.key==='End'){e.preventDefault();
        setStep(k,5)}else if(e.key==='0'){setStep(k,0)}});
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
