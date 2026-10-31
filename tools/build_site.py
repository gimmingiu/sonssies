# 아티팩트 파일(dokkaebi-turnaround.html) → 독립 웹사이트 index.html
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(ROOT,'src','dokkaebi-artifact.html'),encoding='utf8').read()
s=src
def rep(a,b):
  global s
  assert s.count(a)==1,a[:60];s=s.replace(a,b)
i=s.index('<link rel="preconnect"');s=s[i:]
rep("  try{dl=await window.claude?.use?.('downloads')}catch(e){}",
"""  try{dl=await window.claude?.use?.('downloads')}catch(e){}
  // 독립 웹사이트: 휴대폰은 공유 창(사진에 저장), 컴퓨터는 바로 다운로드
  if(!dl)dl={save:async({filename,data})=>{
    const file=new File([data],filename,{type:'image/png'});
    const touch=matchMedia('(pointer:coarse)').matches;
    if(touch&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:charName||'깨두'});return {status:'saved'}}
      catch(e){if(e&&e.name==='AbortError')throw {code:'declined'};}
    }
    const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);return {status:'saved'}}};""")
# 글꼴 CSS가 첫 화면(인트로)을 막지 않도록 비동기로
rep('<link href="https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic+Coding&family=Noto+Sans+KR:wght@500;700&display=swap" rel="stylesheet">',
    '<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic+Coding&family=Noto+Sans+KR:wght@500;700&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link href="https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic+Coding&family=Noto+Sans+KR:wght@500;700&display=swap" rel="stylesheet"></noscript>')
rep("html,body{background:var(--bg);color:var(--fg)}","html,body{margin:0}\nhtml,body{background:var(--bg);color:var(--fg)}")
head='''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Sonssies</title>
<meta name="description" content="나만의 손시를 깨우고, 삶의 여정을 함께 나아가 보세요.">
<meta name="theme-color" content="#e4ebeb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141a1c" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon.ico?v=2" sizes="any"><link rel="icon" href="favicon.png?v=2" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=4">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Sonssies">
<meta property="og:type" content="website">
<meta property="og:url" content="https://sonssies.com/">
<meta property="og:title" content="Sonssies - 영혼의 단짝, 손시 만들기">
<meta property="og:description" content="나만의 손시를 깨우고, 삶의 여정을 함께 나아가 보세요.">
<meta property="og:image" content="https://sonssies.com/og.png?v=3">
<meta name="twitter:card" content="summary_large_image">
'''+open(os.path.join(ROOT,'splash','links.html'),encoding='utf8').read()
i=s.index('<!-- 인트로') if '<!-- 인트로' in s else s.index('<div class="wrap">')   # 인트로부터 body에 넣어야 화면이 바로 그려짐
out=head+s[:i]+'</head>\n<body>\n'+s[i:].rstrip()+'''
<script>
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
</script>
</body>
</html>
'''
open(sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'index.html'),'w',encoding='utf8').write(out)
