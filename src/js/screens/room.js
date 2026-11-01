// == 방: 위쪽 바(이름·꿈빛·설정), 빠른 버튼(인사·꿈열매·부탁·같이 하기), 오늘의 작은 부탁, 밤(잘 자)·아침(잘 잤어?)
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function roomEnter(){$('hudNameT').textContent=charName;$('nightVeil').classList.toggle('on',ST.room==='night');favorShow()}
$('hudName').onclick=()=>openRename();
$('goSet').onclick=()=>go({scr:'set'});
const QUICK={hello:()=>openSheet('shHello'),fruit:()=>openSheet('shFruit'),together:()=>go({scr:'together'}),
  favor:()=>{const c=$('favorCard');c.scrollIntoView({behavior:'smooth',block:'center'});c.classList.remove('pulse');void c.offsetWidth;c.classList.add('pulse')}};
document.querySelectorAll('.qbtn').forEach(b=>b.onclick=()=>QUICK[b.dataset.q]());
// 인사: 밤이면 방이 어두워지고, 아침이면 밝아짐(꿈빛 계산은 아직)
function roomTime(t){ST.room=t;Save.commit();closeSheet();$('nightVeil').classList.toggle('on',t==='night');
  bounceK=0.6;popT0=0;bounceT0=performance.now();setTimeout(()=>sayLine(t==='night'?'sleep':'wake'),200)}
$('sayNight').onclick=()=>roomTime('night');$('sayMorning').onclick=()=>roomTime('morning');
// 오늘의 작은 부탁: 하루에 하나(다른 거로 바꿀 수 있음). 했어·쉴래 모두 손시가 반겨 줌. 확인은 하지 않음
function favorState(){if(!ST.favor||ST.favor.day!==today())ST.favor={day:today(),i:Math.floor(Math.random()*FAVORS.length),end:''};return ST.favor}
function favorShow(){const f=favorState(),c=$('favorCard');c.classList.toggle('done',!!f.end);
  $('favorText').textContent=f.end==='done'?FAVOR_END.done:f.end==='rest'?FAVOR_END.rest:FAVORS[f.i%FAVORS.length]}
function favorEnd(how){const f=favorState();f.end=how;Save.commit();favorShow();bounceK=how==='done'?1:0.5;popT0=0;bounceT0=performance.now();
  setTimeout(()=>sayLine(how==='done'?'favorDone':'rest'),160)}
$('favorDone').onclick=()=>favorEnd('done');$('favorRest').onclick=()=>favorEnd('rest');
$('favorNext').onclick=()=>{const f=favorState();f.i=(f.i+1)%FAVORS.length;Save.commit();favorShow()};
