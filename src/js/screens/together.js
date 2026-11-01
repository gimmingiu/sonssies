// == 같이 하기: 할 일·시간을 고르고 타이머. 그동안 손시가 옆에서 말을 걸어 줌. 중간에 그만둬도 칭찬
let togT=0,togEnd=0;
const pickOf=box=>box.querySelector('[aria-pressed="true"]');
['togTask','togTime'].forEach(id=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{if(togT)return;
  $(id).querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
function togSay(t){const b=$('togBub');b.hidden=false;typeText(b,t)}
function togEnter(){togStop('');faceFront();angle=target;$('togBub').hidden=true}
function togTick(){const s=Math.max(0,Math.ceil((togEnd-Date.now())/1000));$('togClock').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  if(s<=0)togStop('togDone')}
function togStop(mood){if(togT){clearInterval(togT);togT=0}$('togPick').hidden=false;$('togRun').hidden=true;$('togGo').textContent='같이 시작';
  if(mood){togSay(pickLine(mood));bounceK=1;popT0=0;bounceT0=performance.now()}}
$('togGo').onclick=()=>{if(togT){togStop('togStop');return}
  const m=+pickOf($('togTime')).dataset.m;togEnd=Date.now()+m*60000;
  $('togWhat').textContent=pickOf($('togTask')).textContent+' · '+m+'분';$('togPick').hidden=true;$('togRun').hidden=false;$('togGo').textContent='그만하기';
  togSay(pickLine('togStart'));togTick();togT=setInterval(togTick,250)};
