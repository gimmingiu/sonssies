// == 모험 지도: 구불구불한 길·발판(스테이지)·선물 상자·지도 위 손시 말. 아래(1번)에서 위로 올라감. 지금은 간단한 도형으로만
// 진행은 ST.adv = {stars:[판마다 받은 별 0~3], at:손시가 서 있는 발판, gifts:{연 상자 번호:true}}
// 깬 판 수 = stars.length. 다음 판은 별 개수와 상관없이 열림(별은 보너스). 생명·에너지 제한 없음
const ADV={n:12,gap:112,pad:70,gifts:[2,5,8,11]};   // gifts: 이 번호 판을 깨면 옆 상자가 열림
let advHop=-1;   // 결과 뒤 지도로 돌아오면 이 발판으로 뛰어감
const advSt=()=>ST.adv||(ST.adv={stars:[],at:0,gifts:{}});
const advH=()=>ADV.pad*2+(ADV.n-1)*ADV.gap;
const advXY=i=>({x:50+30*Math.sin(i*1.15),y:advH()-ADV.pad-i*ADV.gap});   // x는 %, y는 px
// 상자: 두 발판 사이 길에서 옆으로 비켜 둠(마지막 상자는 끝 발판 위)
const giftXY=k=>{const a=advXY(k),b=advXY(Math.min(k+1,ADV.n-1)),m=(a.x+b.x)/2;
  return {x:Math.min(88,Math.max(12,m<50?m+32:m-32)),y:k+1<ADV.n?(a.y+b.y)/2:a.y-ADV.gap*.55}};
const STAR3=n=>[0,1,2].map(j=>`<i class="${j<n?'on':''}">★</i>`).join('');
const LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
function advEnter(){const s=advSt(),done=s.stars.length,map=$('advMap'),H=advH();
  $('advStars').lastChild.textContent=s.stars.reduce((a,b)=>a+b,0)+' / '+ADV.n*3;
  map.style.height=H+'px';
  // 길: 발판을 잇는 부드러운 곡선(깬 데까지는 진하게)
  const pts=[...Array(ADV.n)].map((_,i)=>advXY(i)),W=360,X=p=>p.x/100*W;
  const path=k=>pts.slice(0,k+1).map((p,i)=>i?`C${X(pts[i-1])},${p.y+ADV.gap/2} ${X(p)},${pts[i-1].y-ADV.gap/2} ${X(p)},${p.y}`:`M${X(p)},${p.y}`).join(' ');
  let h=`<svg class="advpath" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${path(ADV.n-1)}"/>`+
    (done?`<path class="on" d="${path(Math.min(done,ADV.n-1))}"/>`:'')+'</svg>';
  pts.forEach((p,i)=>{const st=i<done?'done':i===done?'open':'lock';
    h+=`<button type="button" class="node ${st}" data-i="${i}" style="left:${p.x}%;top:${p.y}px" aria-label="스테이지 ${i+1}">`+
      (st==='lock'?LOCK:`<b>${i+1}</b>`)+(st==='done'?`<span class="nstars">${STAR3(s.stars[i])}</span>`:'')+'</button>'});
  ADV.gifts.forEach(k=>{const g=giftXY(k),st=s.gifts[k]?'got':done>k?'ready':'lock';
    h+=`<button type="button" class="gift ${st}" data-k="${k}" style="left:${g.x}%;top:${g.y}px" aria-label="선물 상자"><i></i></button>`});
  h+=`<div class="mover" id="advMover" aria-hidden="true"><i style="background:${P.color}"></i></div>`;
  map.innerHTML=h;
  map.querySelectorAll('.node').forEach(b=>b.onclick=()=>advTap(+b.dataset.i,b));
  map.querySelectorAll('.gift').forEach(b=>b.onclick=()=>giftTap(+b.dataset.k,b));
  moverAt(Math.min(s.at,done),false);
  const sc=$('advScroll');sc.scrollTop=advXY(advHop>=0?advHop:s.at).y-sc.clientHeight/2;   // 손시가 있는 데가 가운데
  if(advHop>=0){const to=advHop;advHop=-1;setTimeout(()=>moverHop(to),380)}}
// 손시 말: 발판 위에 서 있음. 다른 발판을 누르면 통통 뛰어서 감
function moverAt(i,anim){const m=$('advMover'),p=advXY(i);m.classList.toggle('anim',anim);m.style.left=p.x+'%';m.style.top=p.y+'px'}
function moverHop(i){const s=advSt(),m=$('advMover');if(!m)return;s.at=i;Save.commit();moverAt(i,true);
  m.firstChild.classList.remove('hop');void m.offsetWidth;m.firstChild.classList.add('hop')}
const shake=b=>{b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake')};
function advTap(i,b){const s=advSt();if(i>s.stars.length){shake(b);return}
  if(s.at===i){go({scr:'play',i});return}
  moverHop(i);setTimeout(()=>{if(scrNow==='adv')go({scr:'play',i})},560)}
// 선물 상자: 옆 판을 깨면 열 수 있음. 한 번만
function giftTap(k,b){const s=advSt();if(s.gifts[k])return;if(s.stars.length<=k){shake(b);return}
  s.gifts[k]=true;Save.commit();b.className='gift got';$('giftText').textContent='꿈빛 5개가 들어 있었어요. 꿈빛 모으기는 아직 준비 중이에요.';openSheet('shGift')}
