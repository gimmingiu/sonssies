// == 카드 만들기 화면 조작: 카드 돌리기·말풍선 글·이름표·이름(지금은 들어가는 버튼 없음, 나중에 사용)
// 미리보기 카드를 좌우로 끌면 캐릭터가 돌아감
{let drag=false,lx=0,moved=0;
 resCv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;moved=0});
 // 완성 화면에서는 끌어도 회전하지 않음(스크롤 방해 없음). 움직임은 탭과 구분하는 데만 씁
 resCv.addEventListener('pointermove',e=>{if(!drag)return;moved+=Math.abs(e.clientX-lx);lx=e.clientX});
 resCv.addEventListener('pointerup',e=>{drag=false;if(moved>6)return;
   // 그냥 누른 거라면: 말풍선(또는 머리 위 빈 자리)을 누르면 아래 말풍선 입력칸으로
   const r=resCv.getBoundingClientRect(),cx=(e.clientX-r.left)/r.width*1080,cy=(e.clientY-r.top)/r.height*1920,b=bubbleRect;
   if(b?(cx>b.x-30&&cx<b.x+b.w+30&&cy>b.y-30&&cy<b.bottom+20):cy<760)openBubEdit();else closeBubEdit()});
 resCv.addEventListener('pointercancel',()=>{drag=false});}
const bubCount=()=>{const n=[...$('bubText').value].length;$('bubCnt').textContent=n+'/'+BUB_MAX;$('bubCnt').classList.toggle('full',n>=BUB_MAX)};
$('bubText').addEventListener('input',e=>{fitBubText();const v=[...e.target.value];if(v.length>BUB_MAX)e.target.value=v.slice(0,
  BUB_MAX).join('');bubText=e.target.value;bubCount();loadTagFonts().then(()=>drawPreview(true))});
// 엔터는 줄바꿈(최대 5줄). 끝낼 때는 '완료' 버튼 또는 Esc
$('bubText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&(e.target.value.split('\n').length>=5)){e.preventDefault()}else if(e.key==='Escape'){e.stopPropagation();
  closeBubEdit()}});
$('bubDone').addEventListener('pointerdown',e=>e.preventDefault());
$('bubDone').onclick=()=>{$('bubText').blur();closeBubEdit()};
document.querySelectorAll('#tagCols .sw').forEach(b=>b.onclick=()=>{tagColor=b.dataset.c;syncTagCols();drawPreview(true)});
$('tagPick').addEventListener('input',e=>{tagColor=e.target.value;syncTagCols();drawPreview(true)});
$('resDice').onclick=()=>rollName($('resDice'),$('resName'));
function bubTailDim(){$('bubTail').style.opacity=bubOn?'':'.4';$('bubTail').style.pointerEvents=bubOn?'':'none'}
$('bubOn').onchange=e=>{bubOn=e.target.checked;bubTailDim();if(!bubOn)closeBubEdit();drawPreview(true)};
$('tagOn').onchange=e=>{tagOn=e.target.checked;$('tagCols').style.opacity=tagOn?'':'.4';$('tagCols').style.pointerEvents=tagOn?'':'none';drawPreview()};
document.querySelectorAll('#bubTail .pbtn').forEach(b=>b.onclick=()=>{bubTail=b.dataset.v;document.querySelectorAll('#bubTail .pbtn').forEach(o=>o.setAttribute('aria-pressed',
  o===b));drawPreview(true)});
bindName($('resName'),()=>{$('charName').value=charName;$('nameTitle').textContent=charName||'깨두';loadTagFonts().then(()=>drawPreview(true))});
$('resName').addEventListener('blur',()=>{setName($('resName').value);drawPreview(true)});
$('resName').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;e.preventDefault();setName($('resName').value);$('resName').blur();drawPreview(true)});
