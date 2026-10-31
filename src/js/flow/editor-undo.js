// ── 되돌리기·다시하기·처음으로 (미리보기 오른쪽)
const UNDO={list:[],i:-1,base:null,mute:false,t:0};
const snapP=()=>{const o={};Object.keys(P).forEach(k=>{if(!POSE_KEYS.includes(k))o[k]=P[k]});return JSON.stringify(o)};
function undoStart(){UNDO.list=[snapP()];UNDO.i=0;UNDO.base=UNDO.list[0];undoUI()}
function undoRecord(){if(UNDO.mute||scrNow!=='step'||UNDO.i<0)return;clearTimeout(UNDO.t);UNDO.t=setTimeout(()=>{const s=snapP();if(s===UNDO.list[UNDO.i])return;
  UNDO.list=UNDO.list.slice(0,UNDO.i+1);UNDO.list.push(s);if(UNDO.list.length>60)UNDO.list.shift();UNDO.i=UNDO.list.length-1;undoUI()},380)}
function undoApply(s){UNDO.mute=true;Object.assign(P,JSON.parse(s));snapAll();syncUI();rebuild();UNDO.mute=false;bump()}
function undoUI(){$('unUndo').disabled=UNDO.i<=0;$('unRedo').disabled=UNDO.i>=UNDO.list.length-1;$('unReset').disabled=snapP()===UNDO.base}
{const box=document.createElement('div');box.className='undos';
 const ic={unUndo:['되돌리기','<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'],unRedo:['다시하기','<path d="m15 7 4.5 4.5L15 16"/><path d="M19 11.5h-9a5 5 0 0 0 0 10h2"/>'],
   unReset:['처음으로','<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4v4.5h4.5"/>']};
 Object.entries(ic).forEach(([id,[l,d]])=>{const b=document.createElement('button');b.type='button';b.id=id;b.setAttribute('aria-label',l);b.title=l;
   b.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;box.appendChild(b)});
 $('app').querySelector('.stagehold[data-size="step"]').appendChild(box);
 $('unUndo').onclick=()=>{if(UNDO.i>0){UNDO.i--;undoApply(UNDO.list[UNDO.i]);undoUI()}};
 $('unRedo').onclick=()=>{if(UNDO.i<UNDO.list.length-1){UNDO.i++;undoApply(UNDO.list[UNDO.i]);undoUI()}};
 $('unReset').onclick=()=>{if(snapP()===UNDO.base)return;undoApply(UNDO.base);UNDO.list=UNDO.list.slice(0,UNDO.i+1);UNDO.list.push(UNDO.base);UNDO.i=UNDO.list.length-1;undoUI()};}

