// 꾸미기 화면에 들어올 때·단계가 바뀔 때 (flow의 show에서 부름)
function editorEnter(i,fresh){
  setHeadOnly(i<5);
  if(fresh)undoStart();else undoUI();
  const N=nSteps();document.querySelectorAll('#stabs button').forEach((b,j)=>{b.hidden=j>=N;b.setAttribute('aria-selected',j===i);b.classList.toggle('done',j<i)});
  const parts=STEPS[i][1];if(parts.length>1)showSub(i,subOf[i]);else partCards(parts[0][1]);
  lookAtPart(parts.length>1?subOf[i]:parts[0][1]);
}
