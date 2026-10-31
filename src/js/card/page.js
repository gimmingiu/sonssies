const resCv=$('resCv');let pv=0;
function placeBubHit(){const h=$('bubHit');if(!h)return;const b=bubbleRect;h.hidden=!b;if(!b)return;
  Object.assign(h.style,{left:(b.x/1080*100)+'%',top:(b.y/1920*100)+'%',width:(b.w/1080*100)+'%',height:(b.h/1920*100)+'%'})}
{const h=$('bubHit');let on=false,sx=0,sy=0,ox=0,oy=0,mv=0;
 h.addEventListener('pointerdown',e=>{on=true;mv=0;sx=e.clientX;sy=e.clientY;ox=bubOff.x;oy=bubOff.y;h.setPointerCapture(e.pointerId);e.preventDefault()});
 h.addEventListener('pointermove',e=>{if(!on)return;const r=$('resCv').getBoundingClientRect(),k=1080/r.width,dx=(e.clientX-sx)*k,dy=(e.clientY-sy)*k;
   mv=Math.max(mv,Math.hypot(e.clientX-sx,e.clientY-sy));if(mv<4)return;bubOff={x:ox+dx,y:oy+dy};drawPreview(true)});
 h.addEventListener('pointerup',()=>{if(!on)return;on=false;if(mv<4)openBubEdit()});
 h.addEventListener('pointercancel',()=>{on=false});
 h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openBubEdit()}});}
// reuse: 3D는 그대로 두고 이름·말풍선·색만 다시 그림. 한 프레임 안의 요청은 하나로 묶고, 하나라도 전체 다시 그리기면 전체로
let pvFull=false;
function drawPreview(reuse){if(!reuse)pvFull=true;if(pv)return;pv=requestAnimationFrame(()=>{pv=0;const full=pvFull;pvFull=false;compose(resCv,1,!full);placeBubEdit()})}
// 말풍선 입력 팝업: 말풍선 바로 아래(꼬리 아래)에 떠서, 쓰는 동안 말풍선이 바뀌는 걸 보면서 입력
function placeBubEdit(){const e=$('bubEdit');if(e.hidden)return;const b=bubbleRect;
  const y=b?Math.min(1920*0.62,b.bottom+30):1920*0.18;e.style.top=(y/1920*100)+'%'}
function openBubEdit(){if(!bubOn){bubOn=true;$('bubOn').checked=true;bubTailDim();drawPreview(true)}const e=$('bubEdit');e.hidden=false;fitBubText();placeBubEdit();const i=$('bubText');i.focus({preventScroll:true});i.setSelectionRange(i.value.length,i.value.length);
  setTimeout(()=>e.scrollIntoView({block:'nearest',behavior:'smooth'}),250)}
// 입력칸 높이를 글 줄 수에 맞춤
function fitBubText(){const t=$('bubText');t.style.height='auto';t.style.height=t.scrollHeight+'px'}
// 비운 채로 완료하면 말풍선이 사라지지 않게 이전 글로 되돌림 (말풍선을 없애려면 '말풍선' 스위치를 끔)
let lastBubText='반가워!';
function closeBubEdit(){const e=$('bubEdit');if(e.hidden)return;e.hidden=true;
  if(!bubText.trim()){bubText=lastBubText;$('bubText').value=lastBubText;bubCount();drawPreview(true)}else lastBubText=bubText}
// 구글 폰트는 글자 범위별로 나뉘어 있어서, 그릴 글자를 넘겨 해당 조각을 미리 받아 둠
async function loadTagFonts(){try{await Promise.all([document.fonts.load('100px Jua',(charName||'깨두')+bubText),document.fonts.load('700 34px "Noto Sans KR"','내 이름은'+bubText),document.fonts.load('26px "Nanum Gothic Coding"','ⓒsonssies')])}catch(_){}}
async function openResult(){
  if($('busy').classList.contains('on'))await new Promise(r=>setTimeout(r,320));
  spinning=false;$('spinBtn').setAttribute('aria-pressed',false);target=angle;
  await loadTagFonts();
  syncTagCols();$('resName').value=charName;$('saveMsg').textContent=dl?'':'이 화면에서는 저장 버튼을 쓸 수 없어요. 화면을 캡처해서 저장해 주세요.';
  $('result').hidden=false;document.body.style.overflow='hidden';
  const card=$('rcard');card.style.animation='none';void card.offsetWidth;card.style.animation='';
  compose(resCv,1,false);$('backBtn').focus({preventScroll:true});
}
function closeResult(){closeBubEdit();$('result').hidden=true;document.body.style.overflow=''}
