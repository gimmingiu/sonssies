// 손시 전체 흐름 확인 (Playwright, 휴대폰 크기 390×844)
// 꿈알 깨기 → 기본형 고르기 → 꾸미기(탭·하위 탭·그림 카드·되돌리기·맨 아래 저장 버튼) → 이름(빈칸·주사위) → 저장 → 다시 열기 → 메인(말풍선·포즈) → 수정(몸·꼬리 단계) → 수정 저장(말풍선) → 배경화면
// 각 단계에서 화면 이름·눈에 보이는 요소를 검사하고, 페이지 오류가 하나라도 나면 실패로 끝남. 화면은 out_flow/에 저장.
//
// 준비(한 번):  npm i three@0.128.0 @fontsource/jua @fontsource/noto-sans-kr @fontsource/nanum-gothic-coding playwright
// 실행:        python3 tools/assemble.py && node tools/test_flow.js            (node_modules가 있는 폴더에서)
//              node tools/test_flow.js index.html                              (사이트용 파일로 확인)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..'),NM=path.join(process.cwd(),'node_modules');
const PAGE=path.join(ROOT,process.argv[2]||'build/sonssies.html'),OUT=path.join(process.cwd(),'out_flow');
const FONTS=[['Jua',400,'jua/files/jua-korean-400-normal.woff2'],['Jua',400,'jua/files/jua-latin-400-normal.woff2'],
 ['Noto Sans KR',500,'noto-sans-kr/files/noto-sans-kr-korean-500-normal.woff2'],['Noto Sans KR',700,'noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2'],
 ['Nanum Gothic Coding',400,'nanum-gothic-coding/files/nanum-gothic-coding-korean-400-normal.woff2']];
const CSS=FONTS.map(([n,w,p])=>`@font-face{font-family:'${n}';font-weight:${w};src:url(https://fonts.gstatic.com/l/${p}) format('woff2')}`).join('\n');
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[],fails=[];let n=0;
  p.on('pageerror',e=>errs.push(e.message));
  await p.route(/cdnjs/,r=>r.fulfill({path:path.join(NM,'three/build/three.min.js'),contentType:'application/javascript'}));
  await p.route(/fonts\.googleapis/,r=>r.fulfill({body:CSS,contentType:'text/css'}));
  await p.route(/fonts\.gstatic\.com\/l\//,r=>{const f=path.join(NM,'@fontsource',r.request().url().split('/l/')[1]);fs.existsSync(f)?r.fulfill({path:f,contentType:'font/woff2'}):r.abort()});
  const scr=()=>p.evaluate(()=>window.__dkFlow&&__dkFlow.scr);
  const shot=async name=>{await p.waitForTimeout(600);await p.screenshot({path:path.join(OUT,String(++n).padStart(2,'0')+'_'+name+'.png'),timeout:120000})};
  const expect=async(name,want,extra)=>{const s=await scr();const ok=s===want&&(!extra||await p.evaluate(extra));console.log((ok?'✓':'✗')+' '+name+' ('+s+')');if(!ok)fails.push(name);await shot(name)};
  await p.goto('file://'+PAGE);await p.waitForTimeout(3000);
  await p.evaluate(()=>__dkFlow.reset());await p.reload();await p.waitForTimeout(3000);
  await expect('꿈알','egg',()=>!!document.getElementById('eggArt'));
  const box=await (await p.$('#eggArt')).boundingBox();
  for(let i=0;i<11;i++){await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(250)}
  await p.waitForTimeout(3500);
  await expect('깨어남·기본형','egg',()=>!document.getElementById('pickBox').hidden);
  await p.click('#starts [data-preset="꼬마"]');await p.waitForTimeout(1200);
  await p.click('#eggGo');await p.waitForTimeout(1200);
  await expect('꾸미기 1단계(머리만)','step',()=>!document.getElementById('stabs').hidden);
  await p.click('#stabs [data-j="2"]');await p.waitForTimeout(6000);
  await expect('눈 그림 카드','step',()=>[...document.querySelectorAll('#eyeTypes img')].filter(i=>i.src).length===6);
  await p.click('#eyeTypes [data-v="happy"]');await p.waitForTimeout(1200);
  await p.click('#unUndo');await p.waitForTimeout(1200);
  await expect('되돌리기','step',()=>document.querySelector('#eyeTypes [data-v="dot"]').getAttribute('aria-pressed')==='true');
  await p.click('.stepbox:not([hidden]) .subtabs button:nth-child(2)');await p.waitForTimeout(1000);
  await expect('하위 탭(눈썹)','step');
  await p.click('#stabs [data-j="4"]');await p.waitForTimeout(800);
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(800);
  await expect('맨 아래 → 저장 버튼','step',()=>document.getElementById('saveBar').classList.contains('show'));
  await p.click('#stepSave');await p.waitForTimeout(1000);
  await expect('이름 짓기(빈칸)','name',()=>document.getElementById('charName').value===''&&document.getElementById('nameLive').textContent==='');
  await p.click('#saveDoll');await p.waitForTimeout(600);
  await expect('빈 이름은 저장 안 됨','name');
  await p.click('#nameDice');await p.waitForTimeout(1500);await p.click('#bgs [data-bg="rainbow"]');await p.waitForTimeout(600);
  await p.reload();await p.waitForTimeout(3000);
  await expect('이어하기(이름·무지개 배경)','name',()=>document.querySelector('#bgs [data-bg="rainbow"]').getAttribute('aria-pressed')==='true');
  await p.click('#saveDoll');await p.waitForTimeout(1500);
  await expect('메인(첫 인사)','main',()=>['반가워!','안녕!'].includes(document.getElementById('mbub').textContent));
  await p.click('#mainPoses [data-pose="앉기"]');await p.waitForTimeout(1500);
  await expect('포즈: 앉기','main',()=>document.querySelector('#mainPoses [data-pose="앉기"]').getAttribute('aria-pressed')==='true');
  await p.reload();await p.waitForTimeout(3000);
  await expect('다시 열기→메인(포즈 유지)','main',()=>document.querySelector('#mainPoses [data-pose="앉기"]').getAttribute('aria-pressed')==='true');
  await p.click('#goEdit');await p.waitForTimeout(800);await p.click('#stabs [data-j="5"]');await p.waitForTimeout(4000);
  await expect('수정: 몸·꼬리(전체 모습)','step',()=>document.querySelectorAll('#stabs button:not([hidden])').length===7);
  await p.goBack();await p.waitForTimeout(600);await p.goBack();await p.waitForTimeout(1200);
  await expect('수정 취소→메인','main');
  await p.click('#goEdit');await p.waitForTimeout(800);await p.click('#stabs [data-j="5"]');await p.waitForTimeout(4000);
  await p.click('.pcards[data-part="몸"] .tcard:nth-child(3)');await p.waitForTimeout(1500);
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(800);
  await p.click('#stepSave');await p.waitForTimeout(1000);
  await expect('수정 → 이름(이름 그대로)','name',()=>document.getElementById('charName').value!=='');
  await p.click('#saveDoll');await p.waitForTimeout(1500);
  await expect('수정 후 메인(새 모습 멘트)','main',()=>['나 어때?','새로운 기분이야!','어울려?','짠! 달라졌지?'].includes(document.getElementById('mbub').textContent));
  await p.click('#goWall');await p.waitForTimeout(800);
  await expect('배경화면','wall');
  await b.close();
  if(errs.length)console.log('페이지 오류:\n  '+errs.join('\n  '));
  console.log(fails.length||errs.length?`실패 ${fails.length}개, 오류 ${errs.length}개`:'모두 통과','→ 화면: '+OUT);
  process.exit(fails.length||errs.length?1:0);
})();
