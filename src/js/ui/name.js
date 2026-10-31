// ---------- 이름 ----------
const NAMES=['말랑','토실','포실','뚱실','포동','다다','구레','파루','포아','아차','까루','뽀도','꾸루','휘리','소곰','시꾸','디구','또루','디뚜','깡초','덤버',
 '실구디','오미디','망오디','똥구디','쇳디','올미','우루미','고소미','아가지','도티','마딘','타내','올마대','가리대','터대','샹재','수새','더믈','검불','북쇠','모리쇠','곰쇠','매뇌','쟈가둥','흰둥','검둥'];
let charName='깨두';
// 이름 규칙: 띄어쓰기 없음 · 최소 1자 · 최대 한글 8자 / 영문 12자 (영문·숫자 1칸, 그 밖의 글자 1.5칸, 합 12칸까지)
function cleanName(v){let u=0,out='';for(const ch of (v||'').replace(/\s+/g,'')){const w=/[\x21-\x7e]/.test(ch)?1:1.5;if(u+w>12)break;u+=w;out+=ch}return out}
function bindName(inp,after){const fix=()=>{const c=cleanName(inp.value);if(c!==inp.value)inp.value=c;charName=c;after()};
  inp.addEventListener('input',e=>{if(e.isComposing)return;fix()});inp.addEventListener('compositionend',fix);
  inp.addEventListener('keydown',e=>{if(e.key===' '&&!e.isComposing)e.preventDefault()})}
function setName(n){charName=cleanName(n)||'깨두';$('charName').value=charName;$('resName').value=charName;$('nameTitle').textContent=charName;syncNtag();persistSoon();if(!$('result').hidden)loadTagFonts().then(()=>drawPreview(true))}
// 주사위: 약 1초 동안 이름이 슬롯머신처럼 빠르게 바뀌다가 느려지며 멈춤
let rolling=null;
// 이름표 '통' 착지: 입력칸의 land 애니메이션과 같은 곡선(0.92 → 1.06 → 1)
function tagLand(){const t0=performance.now(),D=380;const f=now=>{const u=Math.min(1,(now-t0)/D);
  tagScale=u<0.6?0.92+(1.06-0.92)*(u/0.6):1.06-(0.06)*((u-0.6)/0.4);drawPreview(true);if(u<1)requestAnimationFrame(f);else{tagScale=1;drawPreview(true)}};requestAnimationFrame(f)}
function rollName(d0,inp0){
  let n;do{n=NAMES[Math.floor(Math.random()*NAMES.length)]}while(n===charName&&NAMES.length>1);
  const d=d0&&d0.nodeType?d0:$('nameDice'),inp=inp0||$('charName');
  d.classList.remove('roll');void d.offsetWidth;d.classList.add('roll');
  if(rolling)clearTimeout(rolling);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setName(n);return}
  inp.classList.remove('landed');inp.classList.add('shuffling');
  const delays=[50,50,55,60,65,75,85,100,120,145,175];let i=0;
  const live=!$('result').hidden;
  const tt=$('nameTitle');tt.classList.remove('landed');tt.classList.add('shuffling');
  const nt=$('nameLive');nt.classList.add('shuffling');
  const tick=()=>{if(i<delays.length){inp.value=NAMES[Math.floor(Math.random()*NAMES.length)];tt.textContent=inp.value;nt.textContent=inp.value;hello(inp.value);if(live){tagNameShow=inp.value;drawPreview(true)}rolling=setTimeout(tick,delays[i++])}
    else{rolling=null;inp.classList.remove('shuffling');tagNameShow=null;setName(n);nt.classList.remove('shuffling');nt.classList.remove('pop');void nt.offsetWidth;nt.classList.add('pop');void inp.offsetWidth;inp.classList.add('landed');tt.classList.remove('shuffling');void tt.offsetWidth;tt.classList.add('landed');if(live)tagLand()}};
  tick();
}
$('nameDice').onclick=()=>rollName();
bindName($('charName'),()=>{$('nameTitle').textContent=charName||'깨두';$('nameLive').textContent=charName||'깨두'});
$('charName').addEventListener('blur',()=>setName($('charName').value));
// 엔터: 키보드를 내리고, 주사위로 이름이 정해질 때와 같은 '통' 애니메이션
$('charName').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;e.preventDefault();const inp=$('charName');
  setName(inp.value);inp.blur();inp.classList.remove('landed');void inp.offsetWidth;inp.classList.add('landed')});
