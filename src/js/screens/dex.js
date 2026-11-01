// == 도감: 뭉치·배지 칸(아직 빈칸), 모은 날 달력(이번 달, 오늘 표시)
let dexTab='mungchi';
function dexEnter(){dexSlots();dexCal()}
document.querySelectorAll('#dexSeg button').forEach(b=>b.onclick=()=>{dexTab=b.dataset.d;
  document.querySelectorAll('#dexSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));dexSlots()});
function dexSlots(){$('dexSlots').innerHTML=Array.from({length:dexTab==='mungchi'?12:8},()=>'<i>?</i>').join('')}
function dexCal(){const d=new Date(),y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  let h='일월화수목금토'.split('').map(w=>`<b>${w}</b>`).join('')+'<span class="blank"></span>'.repeat(first);
  for(let i=1;i<=days;i++)h+=`<span${i===d.getDate()?' class="today"':''}>${i}</span>`;
  $('dexCal').innerHTML=h;$('dexCal').previousElementSibling.textContent='모은 날 · '+(m+1)+'월'}
