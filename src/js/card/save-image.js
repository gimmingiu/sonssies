let dl=null;
(async()=>{
  try{dl=await window.claude?.use?.('downloads')}catch(e){}
  const btn=$('saveImg');btn.hidden=!dl;
  btn.onclick=async()=>{
    if(!dl)return;btn.disabled=true;$('saveMsg').textContent='';
    try{
      await loadTagFonts();const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;compose(cv,2);   // 2배로 그린 뒤 줄여서 가장자리를 매끈하게
      const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
      const d=new Date(),pad=n=>String(n).padStart(2,'0');
      const name=`${romanize(charName||'깨두')||'kkaedu'}_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`;
      await dl.save({filename:name,data:blob});
      $('saveMsg').textContent='저장했소.';
    }catch(e){
      const c=e&&e.code;
      $('saveMsg').textContent=c==='declined'?'저장을 취소했소.':c==='rate_limited'?'잠시 뒤 다시 눌러 주시오.':(c==='unavailable'||c==='not_granted')?'이 화면에서는 저장할 수 없소. 화면을 캡처해서 저장해 주시오.':'저장하지 못했소. 다시 해 보시오.';
      if(c==='unavailable'||c==='not_granted'){btn.hidden=true;dl=null}
    }finally{btn.disabled=false;setTimeout(()=>{if(dl)$('saveMsg').textContent=''},3500)}
  };
})();
