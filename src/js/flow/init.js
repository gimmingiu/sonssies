// 시작 화면 정하기
(function initFlow(){
  setName('깨두');
  let st=[];
  if(ST.done&&ST.doll){loadDoll(ST.doll);st=[{scr:'main'}]}
  else if(ST.hatched){
    const d=ST.draft;if(d)loadDoll(d);
    eggDone=true;st=[{scr:'egg'}];
    if(d&&(d.scr==='step'||d.scr==='name')){const k=d.scr==='name'?4:Math.min(4,d.step||0);for(let i=0;i<=k;i++)st.push({scr:'step',step:i});if(d.scr==='name')st.push({scr:'name'})}
  }else{
    const iOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    let top=true;try{top=window.top===window}catch(_){top=false}
    st=[{scr:iOS&&!isStandalone&&top?'safari':'egg'}];
  }
  stack=[st[0]];try{history.replaceState({d:1},'')}catch(e){hist=false}
  for(let i=1;i<st.length;i++){stack.push(st[i]);if(hist)try{history.pushState({d:stack.length},'')}catch(e){hist=false}}
  show(stack[stack.length-1],1);
})();
window.__dkFlow={go,goBack,get stack(){return stack},get scr(){return scrNow},reset(){Save.clear()}};
rebuild();frame();
