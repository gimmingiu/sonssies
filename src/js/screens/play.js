// == 스테이지 화면(낱말퍼즐 자리)과 결과 시트: [다 풀었어요] → 별·보상·손시 한마디 → [다시 하기]·[계속]
// 낱말퍼즐은 아직 빈 판(8×8, 검은 칸 무늬만). 지금은 다 풀면 별 3개
let playI=0,playAgain=false;
const XW_BLOCK=[3,6,12,17,22,28,33,37,41,46,51,57,60];   // 검은 칸 자리(모양만)
function playEnter(i){playI=i||0;$('playTitle').textContent='스테이지 '+(playI+1);
  $('playGrid').innerHTML=[...Array(64)].map((_,j)=>XW_BLOCK.includes(j)?'<i class="blk"></i>':'<i></i>').join('')}
$('playDone').onclick=()=>{const s=advSt(),n=3,first=playI>=s.stars.length;
  s.stars[playI]=Math.max(s.stars[playI]||0,n);Save.commit();
  $('resTitle').textContent=first?'다 풀었어요!':'또 풀었어요!';
  $('resStars').innerHTML=STAR3(n);
  $('resLine').textContent='“'+pickLine('advDone')+'”';
  $('resGain').textContent='꿈빛 +'+n+' · 꿈빛 모으기는 아직 준비 중이에요.';
  $('resNext').textContent=playI+1<ADV.n?'계속':'지도로';
  openSheet('shResult')};
// 결과 시트를 닫으면(계속·바깥 누르기) 지도로 돌아가 손시가 다음 발판으로 뜀. [다시 하기]는 이 판 그대로
$('shResult').onclose=()=>{if(playAgain){playAgain=false;return}
  if(scrNow==='play'){advHop=Math.min(playI+1,ADV.n-1);goBack()}};
$('resNext').onclick=closeSheet;
$('resAgain').onclick=()=>{playAgain=true;closeSheet();playEnter(playI)};
