// 이모티콘 시안 렌더 (Playwright). 기본 깨두로 STICKERS 장면을 512×512 PNG로 저장.
// 준비는 tools/test_page.js와 같음.  실행: node tools/render_stickers.js [hello,thanks,...]  → stk_<id>.png
// 장면 id: hello thanks sorry good heart what going eating kkk haha doubt proud
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..'),NM=path.join(process.cwd(),'node_modules');
const FONTS=[['Jua',400,'jua/files/jua-korean-400-normal.woff2'],['Noto Sans KR',500,'noto-sans-kr/files/noto-sans-kr-korean-500-normal.woff2'],['Nanum Gothic Coding',400,'nanum-gothic-coding/files/nanum-gothic-coding-latin-400-normal.woff2']];
const CSS=FONTS.map(([n,w,p])=>`@font-face{font-family:'${n}';font-weight:${w};src:url(https://fonts.gstatic.com/l/${p}) format('woff2')}`).join('\n');
const ALL='hello,thanks,sorry,good,heart,what,going,eating,kkk,haha,doubt,proud';
(async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await p.route(/cdnjs/,r=>r.fulfill({path:path.join(NM,'three/build/three.min.js'),contentType:'application/javascript'}));
  await p.route(/fonts\.googleapis/,r=>r.fulfill({body:CSS,contentType:'text/css'}));
  await p.route(/fonts\.gstatic\.com\/l\//,r=>r.fulfill({path:path.join(NM,'@fontsource',r.request().url().split('/l/')[1]),contentType:'font/woff2'}));
  await p.goto('file://'+path.join(ROOT,'build','sonssies.html'));await p.waitForTimeout(3500);
  for(const id of (process.argv[2]||ALL).split(',')){
    const d=await p.evaluate(id=>window.__dkSticker(id),id);fs.writeFileSync(`stk_${id}.png`,Buffer.from(d.split(',')[1],'base64'));console.log('saved',`stk_${id}.png`);
  }
  await b.close();
})();
