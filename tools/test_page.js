// 화면 확인용 스크립트 (Playwright). 작업 환경에서 cdnjs·Google Fonts에 직접 접속할 수 없을 때,
// 같은 파일을 로컬 npm 패키지로 대신 내려줘서 실제와 같은 모습으로 렌더링한다.
//
// 준비:  npm i three@0.128.0 @fontsource/dongle @fontsource/noto-sans-kr @fontsource/nanum-gothic-coding playwright
// 실행:  node tools/test_page.js            → out_main.png(꾸미기 화면), out_card.png(저장 이미지 1080×1920)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..'),NM=path.join(process.cwd(),'node_modules');
const FONTS=[['Dongle',400,'dongle/files/dongle-korean-400-normal.woff2'],['Dongle',400,'dongle/files/dongle-latin-400-normal.woff2'],
 ['Noto Sans KR',500,'noto-sans-kr/files/noto-sans-kr-korean-500-normal.woff2'],['Noto Sans KR',500,'noto-sans-kr/files/noto-sans-kr-latin-500-normal.woff2'],
 ['Noto Sans KR',700,'noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2'],['Noto Sans KR',700,'noto-sans-kr/files/noto-sans-kr-latin-700-normal.woff2'],
 ['Nanum Gothic Coding',400,'nanum-gothic-coding/files/nanum-gothic-coding-korean-400-normal.woff2'],['Nanum Gothic Coding',400,'nanum-gothic-coding/files/nanum-gothic-coding-latin-400-normal.woff2']];
const CSS=FONTS.map(([n,w,p])=>`@font-face{font-family:'${n}';font-weight:${w};src:url(https://fonts.gstatic.com/l/${p}) format('woff2')}`).join('\n');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:1300,height:900}});
  p.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await p.route(/cdnjs/,r=>r.fulfill({path:path.join(NM,'three/build/three.min.js'),contentType:'application/javascript'}));
  await p.route(/fonts\.googleapis/,r=>r.fulfill({body:CSS,contentType:'text/css'}));
  await p.route(/fonts\.gstatic\.com\/l\//,r=>r.fulfill({path:path.join(NM,'@fontsource',r.request().url().split('/l/')[1]),contentType:'font/woff2'}));
  // 저장 기능 흉내: 저장 버튼을 누르면 이미지 데이터를 window.__img에 담음
  await p.addInitScript(()=>{window.claude={use:async n=>n==='downloads'?{save:async({data})=>{const fr=new FileReader();await new Promise(r=>{fr.onload=r;fr.readAsDataURL(data)});window.__img=fr.result;return{status:'saved'}}}:null}});
  await p.goto('file://'+path.join(ROOT,'src','dokkaebi-artifact.html'));await p.waitForTimeout(3500);
  await (await p.$('#stage')).screenshot({path:'out_main.png'});
  await p.evaluate(()=>document.getElementById('doneBtn').click());await p.waitForTimeout(2500);
  await p.evaluate(()=>{window.__img=null;document.getElementById('saveImg').click()});
  await p.waitForFunction(()=>window.__img,null,{timeout:60000});
  fs.writeFileSync('out_card.png',Buffer.from((await p.evaluate(()=>window.__img)).split(',')[1],'base64'));
  console.log('saved out_main.png, out_card.png');await b.close();
})();
