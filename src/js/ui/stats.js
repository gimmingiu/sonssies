// ---------- 누적 통계 버튼 (집계는 준비 중: 숫자 자리는 '–') ----------
{const INFO={visit:['누적 방문객 수','지금까지 이곳을 찾아온 사람을 세는 자리요. 집계는 아직 준비 중이오.'],
  made:['누적 손시 수','지금까지 만들어진 손시를 세는 자리요. 집계는 아직 준비 중이오.'],
  like:['누적 좋아요 수','이곳이 받은 좋아요를 세는 자리요. 집계는 아직 준비 중이오.']};
 const tip=$('statTip'),hdr=tip.parentElement;let cur=null;
 const close=()=>{tip.hidden=true;if(cur)cur.setAttribute('aria-expanded','false');cur=null};
 document.querySelectorAll('.stat').forEach(b=>b.addEventListener('click',e=>{
   e.stopPropagation();if(cur===b){close();return}close();cur=b;b.setAttribute('aria-expanded','true');
   const [t,d]=INFO[b.dataset.k];$('stTitle').textContent=t;$('stBody').textContent=d;
   tip.hidden=false;tip.style.animation='none';void tip.offsetWidth;tip.style.animation='';
   // 버튼 바로 아래, 화면 밖으로 나가지 않게 왼쪽 위치를 맞추고 꼬리는 버튼 가운데를 가리킴
   const hr=hdr.getBoundingClientRect(),br=b.getBoundingClientRect(),w=tip.offsetWidth;
   const left=Math.max(0,Math.min(br.left-hr.left,document.documentElement.clientWidth-32-w-(hr.left-16)));
   tip.style.left=left+'px';tip.style.top=(br.bottom-hr.top+12)+'px';
   tip.style.setProperty('--tx',Math.max(22,Math.min(w-22,br.left-hr.left+br.width/2-left))+'px')}));
 document.addEventListener('click',e=>{if(cur&&!tip.contains(e.target))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cur)close()});
 addEventListener('resize',close);}$('backBtn').onclick=()=>goBack();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('result').hidden){if(!$('bubEdit').hidden)closeBubEdit();else goBack()}});
