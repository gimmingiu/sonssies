// ── 하위 탭: 묶인 단계(머리·뿔, 눈·눈썹, 코·입·볼, 팔·다리)는 한 번에 하나만 보여 줌
const subOf=[];   // 단계별 지금 보고 있는 하위 항목 이름
stepEls.forEach((box,i)=>{
  const parts=STEPS[i][1];subOf[i]=parts[0][0]||parts[0][1];
  if(parts.length<2)return;
  const seg=document.createElement('div');seg.className='subtabs';seg.setAttribute('role','tablist');
  const kids=[...box.children],secs=[];
  kids.forEach((el,k)=>{if(el.classList.contains('sub')){const g=kids[k+1],sec=document.createElement('section');sec.dataset.sub=el.textContent;el.replaceWith(sec);
    if(g&&g.classList.contains('grp'))sec.appendChild(g);secs.push(sec)}});
  secs.forEach(sec=>{const b=document.createElement('button');b.type='button';b.textContent=sec.dataset.sub;b.setAttribute('role','tab');
    b.onclick=()=>{showSub(i,sec.dataset.sub);lookAtPart(sec.dataset.sub)};seg.appendChild(b)});
  box.prepend(seg);
});
function showSub(i,name){subOf[i]=name;const box=stepEls[i];
  box.querySelectorAll('section[data-sub]').forEach(s=>s.hidden=s.dataset.sub!==name);
  box.querySelectorAll('.subtabs button').forEach(b=>b.setAttribute('aria-selected',b.textContent===name));
  if(name==='눈'||name==='입')makeThumbs(name==='눈'?'eyeType':'mouthType');else partCards(name)}

// ── 아이콘 탭 (미리보기 바로 아래, 지금 단계 표시 + 눌러서 이동)
const ICONS=[   // 색, 머리·뿔, 귀, 눈·눈썹, 코·입·볼, 몸, 팔·다리, 꼬리 (24칸, 둥근 선)
 '<path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10Z"/>',
 '<rect x="4.5" y="8" width="15" height="12" rx="5"/><path d="M8 8.4 9 4l2.3 4M16 8.4 15 4l-2.3 4"/>',
 '<path d="M14 4.5a5.5 5.5 0 0 0-5.5 5.5v2.5c0 1.6-1.5 2.3-1.5 4a3.5 3.5 0 0 0 6.6 1.6c.6-1.2 1.4-2 2.6-2.8A5.5 5.5 0 0 0 14 4.5Z"/><path d="M12 10a2 2 0 0 1 4 0"/>',
 '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/>',
 '<path d="M7 12.5c1.3 2.2 3 3.2 5 3.2s3.7-1 5-3.2"/><circle cx="12" cy="8" r="1.6"/><circle cx="5" cy="14.5" r="1.4"/><circle cx="19" cy="14.5" r="1.4"/>',
 '<rect x="6" y="5" width="12" height="15" rx="5.5"/><path d="M6 13h12"/>',
 '<path d="M8 20v-5.5M16 20v-5.5M5 11.5 8 9h8l3 2.5"/><rect x="7.5" y="6" width="9" height="9" rx="3.5"/>',
 '<path d="M5 18c5 0 8-2 9-6s3-6 5.5-6"/><circle cx="19.5" cy="6" r="1.8"/>'];
{const bar=document.createElement('div');bar.className='stabs';bar.id='stabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','꾸미기 단계');
 STEPS.forEach(([name],j)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-label',name);b.title=name;b.dataset.j=j;
   b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[j]}</svg>`;
   b.onclick=()=>{const cur=stack[stack.length-1];if(cur.scr==='step'&&cur.step===j)return;go({scr:'step',step:j},{replace:true})};bar.appendChild(b)});
 $('app').querySelector('.stagehold[data-size="step"]').appendChild(bar);}

