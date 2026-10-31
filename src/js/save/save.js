// ---------- 저장 창구 (손시 데이터는 모두 여기를 거쳐 읽고 씀) ----------
// 지금은 이 기기(브라우저)에만 저장. 나중에 로그인·서버 저장을 붙일 때는 이 파일만 바꾸면 됨.
// 저장 묶음(사용자당 하나, 서버 테이블의 '한 줄'과 같은 모양):
//   v        저장 형식 버전 (형식이 바뀌면 migrate에서 옮겨 줌)
//   rev      저장할 때마다 1씩 늘어남 (나중에 서버와 기기 중 어느 쪽이 최신인지 비교용)
//   at       마지막 저장 시각(ms)
//   hatched  꿈알을 깨웠는지
//   done     손시를 다 만들고 저장했는지
//   doll     저장된 손시 {p: 모양 값, name, bg}
//   draft    처음 만드는 중일 때 이어하기용 {p, name, bg, scr, step}
const Save=(()=>{
  const KEY='sonssies.v1',VER=1;
  // 테스트 모드: 주소에 ?egg 를 붙이면 꿈알부터 다시 보여 주고, 이 기기 저장은 읽기만 함(아무것도 덮어쓰지 않음)
  let dry=false;try{dry=/[?&#]egg\b/.test(location.search+location.hash)}catch(e){}
  const migrate=d=>{if(!d||typeof d!=='object')d={};if(!d.v)d.v=VER;if(!d.rev)d.rev=0;return d};
  let data;try{data=migrate(JSON.parse(localStorage.getItem(KEY)))}catch(e){data=migrate({})}
  return {
    data:()=>data,                                   // 지금 저장 묶음(바로 고쳐 쓰고 commit)
    dry,                                             // 테스트 모드인지
    commit(){if(dry)return;data.rev=(data.rev||0)+1;data.at=Date.now();try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}},
    clear(){data=migrate({});if(dry)return;try{localStorage.removeItem(KEY)}catch(e){}},
  };
})();
