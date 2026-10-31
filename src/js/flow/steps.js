// == 꾸미기 단계 조립(STEPS) + 깨어난 뒤 기본형 고르기 버튼
// 꾸미기 7단계(둘씩 묶음): 원래 항목 묶음을 단계별로 모음. 처음 만들 때는 앞의 5단계(얼굴)만, [수정]에서는 7단계 모두
const GRP={};document.querySelectorAll('#holder details').forEach(d=>{GRP[d.querySelector('summary').textContent.trim()]=d.querySelector('.grp')});
$('bgRowHold').replaceWith($('bgs').closest('.row'));   // 배경색은 이름 짓기 화면에서
$('posesRow').appendChild($('poses'));                   // 포즈는 카드 만들기 화면에서
const STEPS=[['피부 · 머리',[['피부','피부'],['머리','머리']]],['뿔 · 귀',[['뿔','뿔'],['귀','귀']]],['눈 · 눈썹',[['눈','눈'],['눈썹','눈썹']]],
  ['코 · 입',[['코','코'],['입','입']]],['볼터치 · 볼살',[['볼터치','볼터치'],['볼살','볼살']]],['몸 · 꼬리',[['몸','몸'],['꼬리','꼬리']]],['팔 · 다리',[['팔','팔'],['다리','다리']]]];
const FACE_STEPS=5;
const stepEls=STEPS.map(([,parts])=>{const box=document.createElement('div');box.className='stepbox';
  parts.forEach(([sub,g])=>{if(sub){const h=document.createElement('h3');h.className='sub';h.textContent=sub;box.appendChild(h)}if(GRP[g])box.appendChild(GRP[g])});return box});
stepEls.forEach(e=>{e.hidden=true;$('stepBody').appendChild(e)});   // 모두 문서 안에 두고 지금 단계만 보임(슬라이더 표시가 계속 맞도록)

// 시작 고르기: 프리셋 3개 + 랜덤
let startPick='깨두';
Object.keys(PRESETS).forEach(n=>{const b=document.createElement('button');b.type='button';b.dataset.preset=n;b.style.setProperty('--c',PRESETS[n].color||DEF.color);
  b.innerHTML='<i></i>'+n;b.onclick=()=>{startPick=n;apply(PRESETS[n],true);$('rndBtn').setAttribute('aria-pressed','false');bump(true)};$('starts').appendChild(b)});
// 돌려 본 상태에서 기본형을 다시 고르면: 돌며 등장한 뒤 정면을 보게 (등장 시작 때 아주 작아서 방향을 바로 바꿔도 티 나지 않음)
function toFront(){faceFront();angle=target}
function bump(spin){if(spin){toFront();bounceT0=0;popT0=spinT0=performance.now()}else{popT0=0;bounceT0=performance.now()}}   // spin: 랜덤처럼 돌며 등장
{const b=document.createElement('button');b.type='button';b.className='dice';b.id='rndBtn';b.innerHTML='<i></i>랜덤';
 b.onclick=()=>{startPick='랜덤';dice.onclick();setTimeout(()=>b.setAttribute('aria-pressed','true'),0);bump(true)};$('starts').appendChild(b)}
