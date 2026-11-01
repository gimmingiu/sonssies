// == 앱 틀: 아래 탭바(방·모험·도감), 아래에서 올라오는 시트 열고 닫기, 브라우저 확대 막기
const TABS=['main','adv','dex'];
// 탭 화면에서만 탭바를 보이고, 지금 탭을 표시. 탭끼리 옮길 때는 기록을 쌓지 않음(뒤로가기로 탭을 되짚지 않게)
function tabUI(){const on=TABS.includes(scrNow);$('tabbar').hidden=!on;
  document.querySelectorAll('#tabbar button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===scrNow))}
document.querySelectorAll('#tabbar button').forEach(b=>b.onclick=()=>{if(scrNow!==b.dataset.tab)go({scr:b.dataset.tab},{replace:true})});
// 시트: 한 번에 하나. 바깥(어두운 곳)이나 [닫기]를 누르면 닫힘
let sheetOn=null;
function openSheet(id){closeSheet();sheetOn=$(id);sheetOn.hidden=false;$('sheetBg').hidden=false}
function closeSheet(){if(!sheetOn)return;const s=sheetOn;sheetOn=null;s.hidden=true;$('sheetBg').hidden=true;if(s.onclose)s.onclose()}
$('sheetBg').onclick=closeSheet;
document.querySelectorAll('.sheet [data-close]').forEach(b=>b.onclick=closeSheet);
// 두 손가락으로 화면 전체가 확대되지 않게(아이폰 사파리는 확대 금지 설정을 무시해서). 미리보기의 두 손가락 확대는 그대로
['gesturestart','gesturechange'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
