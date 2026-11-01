// == 설정: 손시 이름 바꾸기(시트), 손시란?(카드 넘기기), 준비 중 항목, 처음부터 다시 만들기
function setEnter(){$('setNameV').textContent=charName}
function openRename(){$('renameIn').value=charName;openSheet('shRename')}
// 저장하지 않고 닫으면(주사위로 바뀐 이름 포함) 원래 이름으로
$('shRename').onclose=()=>{if(ST.doll&&charName!==ST.doll.name)setName(ST.doll.name)};
$('renameIn').addEventListener('input',e=>{if(e.isComposing)return;const c=cleanName(e.target.value);if(c!==e.target.value)e.target.value=c});
$('renameIn').addEventListener('compositionend',e=>{e.target.value=cleanName(e.target.value)});
$('renameDice').onclick=()=>rollName($('renameDice'),$('renameIn'));
$('renameSave').onclick=()=>{const n=cleanName($('renameIn').value),inp=$('renameIn');
  if(!n){inp.classList.remove('nope');void inp.offsetWidth;inp.classList.add('nope');inp.focus();return}
  setName(n);if(ST.doll){ST.doll.name=charName;Save.commit()}closeSheet();setEnter();$('hudNameT').textContent=charName};
$('setName').onclick=openRename;
$('setAbout').onclick=()=>go({scr:'about'});
document.querySelectorAll('[data-soon]').forEach(b=>b.onclick=()=>openSheet('shSoon'));
$('setReset').onclick=()=>openSheet('shReset');
$('resetGo').onclick=()=>{Save.clear();location.reload()};
// 손시란? 카드: 옆으로 넘기면 아래 점이 따라감
$('aboutCards').addEventListener('scroll',()=>{const c=$('aboutCards'),w=c.firstElementChild.offsetWidth+12,i=Math.round(c.scrollLeft/w);
  [...$('aboutDots').children].forEach((d,j)=>d.classList.toggle('on',j===i))},{passive:true});
