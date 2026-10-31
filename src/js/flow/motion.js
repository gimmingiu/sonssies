// == 메인 말풍선 + 말랑통통·등장 모션 + 매 프레임(flowFrame)
// 메인: 말풍선(들어올 때마다, 누를 때마다 다른 말 · 멘트는 lines.js) + 누르면 통통
let bounceT0=0,popT0=0,spinT0=0,bounceK=1,sayT=0;
function sayLine(mood){const b=$('mbub'),t=pickLine(mood);b.hidden=false;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');typeText(b,t)}
// 타이핑 효과: 한글은 자판으로 칠 때처럼 자모가 모이며 써짐(ㅇ → 아 → 안). 한 단계 TYPE_MS
const TYPE_MS=42,CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';let typeT=0;
function typeSteps(ch){const k=ch.charCodeAt(0)-0xAC00;if(k<0||k>11171)return [ch];
  const i=Math.floor(k/588),v=Math.floor(k%588/28),f=k%28,st=[CHO[i],String.fromCharCode(0xAC00+i*588+v*28)];if(f)st.push(ch);return st}
function typeText(el,text){clearTimeout(typeT);el.setAttribute('aria-label',text);
  const frames=[];let done='';for(const ch of text){typeSteps(ch).forEach(x=>frames.push(done+x));done+=ch}
  let n=0;const tick=()=>{el.textContent=frames[n++]||text;if(n<frames.length)typeT=setTimeout(tick,TYPE_MS)};tick()}
{let tx=0,ty=0,tt=0;
 canvas.addEventListener('pointerdown',e=>{tx=e.clientX;ty=e.clientY;tt=performance.now()});
 canvas.addEventListener('pointerup',e=>{const onMain=scrNow==='main',onPick=scrNow==='egg'&&eggDone;if(!onMain&&!onPick)return;   // 누르면 말랑통통(메인에선 말도 바뀜)
   if(Math.hypot(e.clientX-tx,e.clientY-ty)<8&&performance.now()-tt<450&&!popT0){bounceT0=performance.now();if(onMain)setTimeout(sayLine,140)}});}

// 말랑통통: 살짝 웅크렸다 → 늘어나며 한 번 뜀 → 착지하며 찌그러진 뒤, 젤리처럼 늘었다 줄었다 하며 잦아듦(관성)
const BOUNCE_MS=1150;
function bounceAt(t){
  const T0=0.09,T1=0.50;   // 웅크림 끝 · 착지 시점(비율)
  if(t<T0)return {dy:0,q:-0.08*Math.sin(Math.PI*t/T0)};
  if(t<T1){const a=(t-T0)/(T1-T0);return {dy:0.5*Math.sin(Math.PI*a),q:0.13*Math.sin(Math.PI*a)*(1-a)}}   // 착지 순간 모양이 0이 되게(갑자기 찌그러지지 않게)
  const u=(t-T1)/(1-T1);return {dy:0,q:-0.12*Math.exp(-4*u)*Math.sin(2*Math.PI*1.6*u)};   // 부드럽게 눌렸다 살짝 늘었다 잦아듦
}
// 매 프레임: 등장(알에서 나올 때)·통통 튀기·말풍선 위치·알 흔들림
function flowFrame(now){
  const c=chars[0];if(!c)return;
  let s=1,dy=0,sx=1,sy=1,spin=0;
  if(popT0){const t=Math.min(1,(now-popT0)/(spinT0?900:750));s=t<0.5?0.15+0.97*Math.sin(t/0.5*Math.PI/2):1.12-0.12*Math.sin((t-0.5)/0.5*Math.PI/2);if(t>=1){popT0=0;s=1}}
  if(spinT0){const t=Math.min(1,(now-spinT0)/900),e=1-Math.pow(1-t,3);spin=(1-e)*Math.PI*2;if(t>=1)spinT0=0}
  if(bounceT0){const t=(now-bounceT0)/BOUNCE_MS;if(t>=1){bounceT0=0;bounceK=1}else{const b=bounceAt(t);dy=b.dy*bounceK;sy=1+b.q*bounceK;sx=1-b.q*0.55*bounceK}}
  c.scale.set(s*sx,s*sy,s*sx);c.position.y=dy;if(spin)c.rotation.y=angle+spin;
  if(scrNow==='main'){const b=$('mbub');if(!b.hidden){const v=new THREE.Vector3(0,(charH+0.12)*s+dy,0).project(persp);
    b.style.left=((v.x+1)/2*stage.clientWidth)+'px';b.style.top=Math.max(58,(1-v.y)/2*stage.clientHeight-4)+'px'}}
  partWiggle(now);
  if(egg)eggFrame(now);
}
