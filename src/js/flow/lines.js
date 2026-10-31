// ---------- 말풍선 멘트 ----------
// 상황별로 묶어 둠. 새 멘트는 여기 목록에만 더하면 됨(새 상황을 만들면 pickLine에서 언제 쓸지 정함).
//   first   처음 만들고 메인에 왔을 때 (반드시 이 중 하나)
//   edited  [수정]에서 모양을 바꾸고 저장한 뒤 메인에 왔을 때 (반드시 이 중 하나)
//   morning·noon·evening·night  시간대 멘트 (그 시간에만 섞여 나옴)
//   any     언제든 나오는 멘트
const LINES={
  first:['반가워!','안녕!'],
  edited:['나 어때?','새로운 기분이야!','어울려?','짠! 달라졌지?'],
  morning:['잘 잤어?','좋은 아침!','오늘도 힘내!'],
  noon:['밥 먹었어?','점심 맛있게 먹어!','배고파…'],
  evening:['오늘 어땠어?','수고했어!','저녁 먹었어?'],
  night:['졸려…','잘 자!','꿈에서 만나!'],
  any:['안녕!','반가워!','보고 싶었어!','나랑 놀자!','헤헤','오늘도 고마워!'],
};
const lineTime=h=>h>=5&&h<11?'morning':h>=11&&h<14?'noon':h>=17&&h<22?'evening':h>=22||h<5?'night':'';
let lastLine='';
// mood가 있으면(처음 만든 뒤·수정한 뒤) 그 묶음에서만, 없으면 지금 시간대 + 언제든 멘트에서. 바로 앞과 같은 말은 피함
function pickLine(mood){
  const pool=mood&&LINES[mood]?LINES[mood]:(LINES[lineTime(new Date().getHours())]||[]).concat(LINES.any);
  let x;do{x=pool[Math.floor(Math.random()*pool.length)]}while(x===lastLine&&pool.length>1);return lastLine=x}
