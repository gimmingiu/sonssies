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
rep("html,body{background:var(--bg);color:var(--fg)}","html,body{margin:0}\nhtml,body{background:var(--bg);color:var(--fg)}")
head='''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Sonssies</title>
<meta name="description" content="나만의 수호 도깨비를 꾸미고 이미지로 저장해 보세요.">
<meta name="theme-color" content="#e4ebeb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141a1c" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon.ico?v=1" sizes="any"><link rel="icon" href="favicon.png?v=1" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=3">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Sonssies">
<meta property="og:type" content="website">
<meta property="og:url" content="https://sonssies.com/">
<meta property="og:title" content="Sonssies - 나의 수호 도깨비 만들기">
<meta property="og:description" content="나만의 수호 도깨비를 꾸미고 이미지로 저장해 보세요.">
<meta property="og:image" content="https://sonssies.com/og.png?v=2">
<meta name="twitter:card" content="summary_large_image">
'''
i=s.index('<div class="wrap">')
out=head+s[:i]+'</head>\n<body>\n'+s[i:].rstrip()+'''
<script>
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
</script>
</body>
</html>
'''
open(sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'index.html'),'w',encoding='utf8').write(out)
