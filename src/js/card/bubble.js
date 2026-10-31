// ---------- 말풍선 ----------
// 늘 동그라미 또는 타원. 글이 짧으면 동그라미, 길수록 줄을 나눠 너무 납작하지 않은 타원이 되게 고름
const BUB_MAX=30;let bubOn=true,bubText='반가워!',bubTail='talk',bubbleRect=null,bubOff={x:0,y:0};
const BUB_FONT=fs=>`${Math.round(fs*1.05)}px Jua, "Noto Sans KR", sans-serif`;   // 이름과 같은 Jua
function wrapText(x,t,maxW){
  if(t.includes('\n'))return t.split('\n').flatMap(par=>par.trim()?wrapText(x,par,maxW):[]);   // 직접 넣은 줄바꿈은 그대로
  const out=[];let line='';
  for(const w of t.split(/(\s+)/)){
    if(!w)continue;
    if(x.measureText(line+w).width<=maxW){line+=w;continue}
    if(line.trim()){out.push(line.trim());line=''}
    if(/^\s+$/.test(w))continue;
    for(const ch of w){if(x.measureText(line+ch).width>maxW&&line){out.push(line);line=''}line+=ch}
  }
  if(line.trim())out.push(line.trim());return out;
}
// 같은 줄 수가 유지되는 가장 좁은 폭으로 다시 나눠서 줄 길이를 고르게 (마지막 줄만 짧아지는 것 방지)
function balanceWrap(x,t,mw){const n=wrapText(x,t,mw).length;if(n<2||t.includes('\n'))return wrapText(x,t,mw);
  let lo=mw*0.4,hi=mw;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(wrapText(x,t,m).length<=n)hi=m;else lo=m}return wrapText(x,t,hi)}
function bubbleLayout(x){
  const t=bubText.trim();if(!t||!bubOn)return null;
  const n=[...t.replace(/\n/g,'')].length,fs=n<=6?64:n<=14?56:50;x.font=BUB_FONT(fs);
  const D=Math.round(fs*1.05),lh=Math.round(D*1.32);   // 줄 간격: 받침(ㄹ 등)이 아랫줄과 겹치지 않게 넉넉히
  let best=null;
  for(const mw of [640,540,460,390,330,280,230]){
    const lines=balanceWrap(x,t,mw);if(lines.length>6)continue;
    const ms=lines.map(l=>x.measureText(l)),tw=Math.max(...ms.map(m=>m.width));
    const asc=ms[0].actualBoundingBoxAscent,desc=ms[ms.length-1].actualBoundingBoxDescent,th=(lines.length-1)*lh+asc+desc;
    // 글 상자의 네 모서리가 타원 안에 들어오도록 √2배
    let a=(tw/2+26)*Math.SQRT2,b=(th/2+20)*Math.SQRT2;
    if(a/b<1.18){a=b=Math.max(a,b)}
    a=Math.max(a,105);b=Math.max(b,105);
    if(a>500)continue;
    const sc=Math.abs(a/b-1.55)+0.2*(lines.length-1);
    if(!best||sc<best.sc)best={lines,a,b,sc,asc,desc};
  }
  if(!best){const lines=balanceWrap(x,t,230),ms=lines.map(l=>x.measureText(l)),tw=Math.max(...ms.map(m=>m.width)),asc=ms[0].actualBoundingBoxAscent,desc=ms[ms.length-1].actualBoundingBoxDescent;
    best={lines,a:Math.min(500,(tw/2+26)*Math.SQRT2),b:(((lines.length-1)*lh+asc+desc)/2+20)*Math.SQRT2,asc,desc}}
  const r1=Math.max(26,Math.min(36,best.b*0.24));
  const gapB=118;   // 기본·생각 꼬리 모두 같은 자리
  return {lines:best.lines,fs,lh,a:best.a,b:best.b,asc:best.asc,desc:best.desc,r1,gapB};
}
// 말풍선도 손시처럼 3D로 빚어서 그림: 둥근 베개 모양 몸통 + 꼬리를 하나의 덩어리(SDF)로 매끈하게 잇고,
// 캐릭터의 흰 부분과 같은 재질(매트/글로시 따라감)과 조명으로 렌더 → 각진 곳·선·이음새 없음. 바닥 그림자 없음
const bubOrtho=new THREE.OrthographicCamera(0,1,0,-1,-50,50);bubOrtho.position.set(0,0,10);
let bubCache={key:'',img:null,box:null};
function bubble3D(x,G){
  const {cx,cy,a,b,P,dx,dy,nx,ny,think,r1}=G,q=x.canvas.width/1080;
  const TH=22,RR=20;   // 반두께, 가장자리 둥글기(px)
  const sm=(d1,d2,k)=>{const h=Math.max(k-Math.abs(d1-d2),0)/k;return Math.min(d1,d2)-h*h*k*0.25};
  const slab=(e2,z)=>{const qx=e2+RR,qy=Math.abs(z)-TH+RR;return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-RR};
  const ell2=(X,Y,A,Bb)=>{const k0=Math.hypot(X/A,Y/Bb),k1=Math.hypot(X/(A*A),Y/(Bb*Bb))||1e-6;return k0*(k0-1)/k1};
  // 꼬리(기본): 굵은 뿌리에서 가는 끝으로 이어지는 둥근 원뿔
  const rcone=(px,py,pz,A,Bp,ra,rb)=>{const bx=Bp[0]-A[0],by=Bp[1]-A[1],l2=bx*bx+by*by,rr=ra-rb,a2=l2-rr*rr,il2=1/l2;
    const pax=px-A[0],pay=py-A[1],paz=pz,y=pax*bx+pay*by,z=y-l2;
    const vx=pax*l2-bx*y,vy=pay*l2-by*y,vz=paz*l2,x2=vx*vx+vy*vy+vz*vz,y2=y*y*l2,z2=z*z*l2,k=Math.sign(rr)*rr*rr*x2;
    if(Math.sign(z)*a2*z2>k)return Math.sqrt(x2+z2)*il2-rb;if(Math.sign(y)*a2*y2<k)return Math.sqrt(x2+y2)*il2-ra;return (Math.sqrt(x2*a2*il2)+y*rr)*il2-ra};
  const parts=[];
  if(think){const r2=r1*0.6,r3=r1*0.36,g1=r1*0.5,g2=r1*0.42;
    const c1=[P[0]-dx*r1*0.06,P[1]-dy*r1*0.06],c2=[c1[0]+dx*(r1+g1+r2),c1[1]+dy*(r1+g1+r2)],c3=[c2[0]+dx*(r2+g2+r3),c2[1]+dy*(r2+g2+r3)];
    parts.push([c1,r1],[c2,r2],[c3,r3]);}
  const S0=[P[0]-dx*34,P[1]-dy*34],T=[P[0]+dx*74+nx*20,P[1]+dy*74+ny*20];
  const f=(X,Y,Z)=>{
    let d=slab(ell2(X-cx,Y-cy,a,b),Z);
    if(think){const [c1,q1]=parts[0];d=sm(d,slab(Math.hypot(X-c1[0],Y-c1[1])-q1,Z*1.15),7);
      for(let i=1;i<3;i++){const [c,r]=parts[i];d=Math.min(d,slab(Math.hypot(X-c[0],Y-c[1])-r,Z*(1.3+0.25*i)))}}
    else d=sm(d,rcone(X,Y,Z*1.7,S0,T,30,8)/1.0,22);
    return d};
  // 그릴 범위
  let x0=cx-a,x1=cx+a,y0=cy-b,y1=cy+b;
  const pts=think?parts.map(([c,r])=>[c[0]-r,c[1]-r,c[0]+r,c[1]+r]):[[T[0]-10,T[1]-10,T[0]+10,T[1]+10]];
  pts.forEach(([a0,b0,a1,b1])=>{x0=Math.min(x0,a0);y0=Math.min(y0,b0);x1=Math.max(x1,a1);y1=Math.max(y1,b1)});
  x0=Math.floor(x0-16);y0=Math.floor(y0-16);x1=Math.ceil(x1+16);y1=Math.ceil(y1+16);
  const key=[Math.round(cx),Math.round(cy),Math.round(a),Math.round(b),Math.round(T[0]),Math.round(T[1]),think,q,P_tex(),r1].join(',');
  if(bubCache.key!==key){
    const geo=surfaceNets(f,[x0,y0,-TH-4],[x1,y1,TH+4],Math.max(4,Math.min(7,(x1-x0)/90)),{});
    // 화면 좌표(아래로 +y) → 3D(위로 +y): y 뒤집기, 크기는 캐릭터와 비슷한 단위로(1/100)
    geo.scale(0.01,-0.01,0.01);geo.computeBoundingSphere();
    const idx=geo.index;if(idx){const ar=idx.array;for(let t=0;t<ar.length;t+=3){const tmp=ar[t+1];ar[t+1]=ar[t+2];ar[t+2]=tmp}idx.needsUpdate=true}   // 뒤집으면서 앞뒤가 바뀐 면 방향 되돌림
    const m=new THREE.Mesh(geo,mats.white);
    const pr=renderer.getPixelRatio(),bw=x1-x0,bh=y1-y0;
    renderer.setPixelRatio(q);renderer.setSize(bw,bh,false);
    Object.assign(bubOrtho,{left:x0*0.01,right:x1*0.01,top:-y0*0.01,bottom:-y1*0.01});bubOrtho.updateProjectionMatrix();
    const vis=chars.map(c=>c.visible);chars.forEach(c=>c.visible=false);scene.add(m);
    renderer.render(scene,bubOrtho);
    scene.remove(m);geo.dispose();chars.forEach((c,i)=>c.visible=vis[i]);
    const img=document.createElement('canvas');img.width=renderer.domElement.width;img.height=renderer.domElement.height;img.getContext('2d').drawImage(renderer.domElement,0,0);
    renderer.setPixelRatio(pr);layout();
    bubCache={key,img,box:[x0,y0,x1-x0,y1-y0]};
  }
  const [bx,by,bw,bh]=bubCache.box;x.drawImage(bubCache.img,bx,by,bw,bh);
}
const P_tex=()=>P.tex+P.color;
function drawBubble(x,B,headY,headX=540,headCY=headY+200){
  const OW=1080,{a,b}=B;
  // 기본 자리(머리 위 살짝 오른쪽) + 끌어서 옮긴 만큼. 카드 밖으로는 못 나감
  const cx=Math.min(OW-36-a,Math.max(36+a,headX+60+bubOff.x)),cy=Math.min(1920-60-b,Math.max(36+b,headY-B.gapB+12-b+bubOff.y));
  // 꼬리 방향: 말풍선이 어디에 있든 늘 캐릭터 머리 가운데를 향함
  let dx=headX-cx,dy=headCY-cy;const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
  const k=1/Math.sqrt((dx/a)**2+(dy/b)**2),P=[cx+dx*k,cy+dy*k],nx=-dy,ny=dx;   // 타원 가장자리 점, 수직 방향
  const shapes=[p=>p.ellipse(cx,cy,a,b,0,0,Math.PI*2)];
  if(bubTail==='think'){
    // 가장 큰 동그라미는 가운데가 타원 테두리 위(면적 절반쯤 겹침) → 나머지 둘은 간격을 두고 작아짐
    const r1=B.r1,r2=r1*0.6,r3=r1*0.36,g1=r1*0.5,g2=r1*0.42;
    const c1=[P[0]-dx*r1*0.06,P[1]-dy*r1*0.06],c2=[c1[0]+dx*(r1+g1+r2),c1[1]+dy*(r1+g1+r2)],c3=[c2[0]+dx*(r2+g2+r3),c2[1]+dy*(r2+g2+r3)];
    [[c1,r1],[c2,r2],[c3,r3]].forEach(([c,r])=>shapes.push(p=>{p.moveTo(c[0]+r,c[1]);p.arc(c[0],c[1],r,0,Math.PI*2)}));
  }else{
    // 기본 꼬리: 타원 안쪽에서 시작해 한쪽으로 살짝 휘어진 둥근 꼬리
    const w=34,L=78,b1=[P[0]-dx*30+nx*w,P[1]-dy*30+ny*w],b2=[P[0]-dx*30-nx*w,P[1]-dy*30-ny*w],tip=[P[0]+dx*L+nx*22,P[1]+dy*L+ny*22];
    shapes.push(p=>{p.moveTo(b1[0],b1[1]);p.quadraticCurveTo(P[0]+dx*34+nx*14,P[1]+dy*34+ny*14,tip[0],tip[1]);
      p.quadraticCurveTo(P[0]+dx*30-nx*8,P[1]+dy*30-ny*8,b2[0],b2[1]);p.closePath()});
  }
  bubble3D(x,{cx,cy,a,b,P,dx,dy,nx,ny,think:bubTail==='think',r1:B.r1});
  x.save();
  // 글: 실제 글자 윗끝~아랫끝 묶음의 가운데를 타원 가운데에 맞춤
  x.fillStyle='#1f2a2e';x.font=BUB_FONT(B.fs);x.textAlign='center';x.textBaseline='alphabetic';
  const n=B.lines.length,b0=cy-((n-1)*B.lh+B.desc-B.asc)/2;
  B.lines.forEach((l,i)=>x.fillText(l,cx,b0+i*B.lh));
  x.restore();
  return {x:cx-a,y:cy-b,w:2*a,h:2*b,bottom:cy+b+B.gapB*0.6};
}
