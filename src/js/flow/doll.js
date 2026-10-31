// ---------- 손시 저장·불러오기 (ST = 저장 묶음, 화면 흐름은 steps → nav → actions → motion 순서로 이어짐) ----------
let ST=Save.data();   // 저장 묶음 (src/js/save/save.js)
const snapDoll=()=>{const o={};Object.keys(P).forEach(k=>{if(!POSE_KEYS.includes(k))o[k]=P[k]});return {p:o,name:charName,bg:bgColor}};
function loadDoll(d){if(!d)return;Object.assign(P,DEF,d.p||{});P.tex='smooth';POSE_KEYS.forEach(k=>P[k]=DEF[k]);snapAll();setName(d.name||'');setBg(d.bg||'');syncUI();rebuild()}
let psT=0;
function persistSoon(){clearTimeout(psT);psT=setTimeout(()=>{   // 처음 꾸미는 중이면 지금까지를 저장해 두고, 앱을 닫았다 열어도 이어서
  if(ST.done||!ST.hatched)return;const cur=stack[stack.length-1]||{};if(!['egg','step','name'].includes(cur.scr)||(cur.scr==='egg'&&!eggDone))return;
  ST.draft={...snapDoll(),scr:cur.scr,step:cur.step||0};Save.commit()},300)}
function syncNtag(){const t=$('nameLive');if(!rolling)t.textContent=charName;t.style.color=bgColor?(isDark(bgColor)?'#eef4f5':'#1f2a2e'):''}
function afterRebuild(){applyHeadOnly();markCards();syncNtag();persistSoon();undoRecord();if(!$('result').hidden)drawPreview()}
