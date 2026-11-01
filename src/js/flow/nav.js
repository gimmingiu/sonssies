// == 화면 이동: show(화면마다 들어갈 때 할 일) · go · goBack · resetTo · 휴대폰 뒤로가기
// 화면 이동: 내부 목록(stack) + 브라우저 기록(휴대폰 뒤로가기와 같게)
let scrNow='',stack=[],hist=true,popTo=null,editing=false;
const isStandalone=(matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
function show(st,dir){
  const prev=scrNow;scrNow=st.scr;
  document.querySelectorAll('.scr').forEach(el=>{const on=el.dataset.scr===st.scr;el.classList.toggle('on',on);el.classList.toggle('back',on&&dir<0)});
  document.querySelectorAll('[data-back]').forEach(b=>b.style.visibility=stack.length>1?'':'hidden');
  const hold=document.querySelector(`.scr[data-scr="${st.scr}"] .stagehold`);
  if(hold&&stage.parentNode!==hold)hold.prepend(stage);
  if(prev==='card'&&st.scr!=='card')closeResult();
  if(st.scr==='egg')enterEgg();else leaveEgg();
  if(st.scr==='step'){const i=st.step||0,N=nSteps();$('stepTitle').textContent=STEPS[i][0];stepEls.forEach((e,j)=>e.hidden=j!==i);
    editorEnter(i,prev!=='step')}
  else if(prev==='step')lookReset();
  if(st.scr==='name'){faceFront();angle=target;syncNtag()}   // 이름 짓기는 늘 정면(꾸미기에서 돌려 본 각도를 따라오지 않게)
  if(st.scr==='main'){roomEnter();
    if(editing){editing=false;if(ST.doll)loadDoll(ST.doll)}            // 꾸미다 저장하지 않고 돌아오면 원래대로
    setPose(ST.pose,false);                                             // 메인에서 고른 포즈
    if(ST.doll)setBg(ST.doll.bg||'');
    faceFront();angle=target;
    if(enterSpin){enterSpin=false;const m=sayMood;$('mbub').hidden=true;bounceT0=0;popT0=spinT0=performance.now();
      clearTimeout(sayT);sayT=setTimeout(()=>{if(scrNow==='main')sayLine(m)},980)}   // 돌며 등장이 끝나면 말풍선 뿅
    else sayLine(sayMood);
    sayMood='';}
  if(st.scr==='card'){faceFront();angle=target;if(ST.doll)setBg(ST.doll.bg||'');openResult()}
  if(st.scr!=='main'){$('mbub').hidden=true;clearTimeout(sayT)}
  if(st.scr==='together')togEnter();else if(prev==='together')togStop('');
  if(st.scr==='dex')dexEnter();
  if(st.scr==='set')setEnter();
  closeSheet();tabUI();
  const sc=document.querySelector(`.scr[data-scr="${st.scr}"] .scroll`);if(sc&&dir>0)sc.scrollTop=0;   // 새로 들어간 화면은 맨 위부터
  layout();persistSoon();
}
function faceFront(){spinning=false;$('spinBtn').setAttribute('aria-pressed',false);target=Math.round(angle/(2*Math.PI))*2*Math.PI;setViewPressed('0')}
function go(st,o={}){
  if(o.replace&&stack.length){stack[stack.length-1]=st;try{history.replaceState({d:stack.length},'')}catch(e){}}
  else{stack.push(st);if(hist)try{history.pushState({d:stack.length},'')}catch(e){hist=false}}
  show(st,1)}
function goBack(){if(stack.length<=1)return;if(hist)history.back();else{stack.pop();show(stack[stack.length-1],-1)}}
function resetTo(st){const n=stack.length-1;if(n>0&&hist){popTo=st;history.go(-n)}else{stack=[st];show(st,-1)}}
addEventListener('popstate',e=>{
  if(popTo){const st=popTo;popTo=null;stack=[st];try{history.replaceState({d:1},'')}catch(_){}show(st,-1);return}
  const d=(e.state&&e.state.d)||1;
  if(d<stack.length){stack.length=Math.max(1,d);show(stack[stack.length-1],-1)}
  else if(d>stack.length){history.go(stack.length-d)}   // 앞으로 가기는 막음
});
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=goBack);
