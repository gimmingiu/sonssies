// == 보기 각도 버튼·켜고 끄기·피부색·볼터치 색·배경색
function setViewPressed(a){document.querySelectorAll('#views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.a===a))}
document.querySelectorAll('#views button').forEach(b=>b.onclick=()=>{if(b.id==='spinBtn')return;spinning=false;
  $('spinBtn').setAttribute('aria-pressed',false);const a=parseFloat(b.dataset.a);target=a+Math.round((angle-a)/(2*Math.PI))*2*Math.PI;
  setViewPressed(b.dataset.a)});
['horns','tail'].forEach(k=>$(k).onchange=e=>{P[k]=e.target.checked;syncUI();rebuild()});
$('blush2').onchange=e=>{P.blush=e.target.checked;syncUI();rebuild()};
// 볼터치 색: 고르면 볼터치도 함께 켬
function setBlushColor(c){P.blushColor=c;P.blush=true;syncUI();rebuild()}
document.querySelectorAll('#blushes .sw').forEach(s=>s.onclick=()=>setBlushColor(s.dataset.c));
$('blushPick').addEventListener('input',e=>{P.blushColor=e.target.value;P.blush=true;syncUI();soon()});
$('spinBtn').onclick=()=>{spinning=!spinning;$('spinBtn').setAttribute('aria-pressed',spinning);if(spinning)setViewPressed(null)};
function setColor(c){P.color=c;syncUI();rebuild()}
document.querySelectorAll('#colors .sw').forEach(s=>s.onclick=()=>setColor(s.dataset.c));
// 미리보기 배경색: 비우면 기본(화면 모드에 맞춘 색). 어두운 배경이면 라벨 글자를 밝게
let bgColor='';
const isDark=hex=>{if(!hex)return false;const c=new THREE.Color(hex);return 0.2126*c.r+0.7152*c.g+0.0722*c.b<0.45};
function setBg(c){bgColor=c||'';$('rcard').style.background=bgColor;$('stageBg').style.background=bgColor;stage.style.setProperty('--sfg',bgColor?(isDark(bgColor)?'#eef4f5':'#1f2a2e'):'');
  syncUI();if(typeof persistSoon==='function')persistSoon();if(!$('result').hidden)drawPreview(true)}
document.querySelectorAll('.bgset .sw').forEach(s=>s.onclick=()=>setBg(s.dataset.bg));
document.querySelectorAll('.bgpick').forEach(p=>p.addEventListener('input',e=>setBg(e.target.value)));
$('pick').addEventListener('input',e=>{P.color=e.target.value;syncUI();soon()});
