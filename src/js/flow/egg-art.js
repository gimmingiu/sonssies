// 꿈알 12단계 그림 파일 목록 (tools/egg_assets.py가 만듦 — 직접 고치지 말 것). 그림은 egg/ 폴더(페이지 옆)에 따로 있음
// EGG_ART = 껍데기(금은 빛 없는 틈), EGG_LIGHT = 같은 구도의 빛만(틈에서 새는 빛 + 속빛). 앱에서 겹쳐 놓고 빛만 숨 쉬듯 움직임
const EGG_V='accbdfcc',EGG_ART=[],EGG_LIGHT=[];
for(let k=1;k<=12;k++){const n=String(k).padStart(2,'0');EGG_ART.push(`egg/shell-${n}.webp?v=${EGG_V}`);EGG_LIGHT.push(`egg/light-${n}.webp?v=${EGG_V}`)}
[EGG_ART[0],EGG_LIGHT[0]].forEach(u=>{const i=new Image();i.src=u});   // 첫 장은 페이지가 열리자마자 미리 받아 둠(알이 늦게 뜨지 않게)
