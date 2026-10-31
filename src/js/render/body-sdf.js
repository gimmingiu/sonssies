// ---------- SDF 몸 (상체·하체·팔·손·발·꼬리를 한 덩어리로) ----------
const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*0.25};
const smax=(a,b,k)=>-smin(-a,-b,k);
function ell(x,y,z,rx,ry,rz){const k0=Math.sqrt((x/rx)**2+(y/ry)**2+(z/rz)**2),k1=Math.sqrt((x/(rx*rx))**2+(y/(ry*ry))**2+(z/(rz*rz))**2);return k0*(k0-1)/(k1||1e-6)}
function bodyModel(){
  // 통통한 피규어형 몸: 아랫배·엉덩이가 둥글게 차오르고, 짧고 굵은 다리가 몸에서 그대로 흘러내림.
  const L=0.78*P.bodyLen, top=L+0.1, waist=L*P.lowerRatio;
  const Wu=0.44*P.upperW, Wl=0.5*P.lowerW, D=0.4*P.bodyD;
  const gap=P.legGap, crotch=Math.max(0.06,waist*P.legSplit);
  // 앉기에서는 몸 높이를 기본 다리 길이 기준으로 고정하고, 다리 길이는 앞으로 뻗는 길이로 바꿈
  const sit=!!P.sit, crotch0=Math.max(0.06,waist*DEF.legSplit), cr=sit?crotch0:crotch, ext=sit?(crotch-crotch0)*1.1:0;
  const R2D=Math.PI/180;
  // 다리 뻗기(앞뒤): 골반 아래 다리를 앞뒤로 기울임. 기울일수록 아랫배 덩어리가 살짝 올라가 다리가 드러남
  const aL=clamp(P.legSwingL,-35,35)*R2D, aR=clamp(P.legSwingR,-35,35)*R2D;
  const swing=Math.max(Math.abs(aL),Math.abs(aR))/(35*R2D);
  // 하체 덩어리(아랫배+골반) · 상체 덩어리 · 엉덩이
  const lRy=Math.max(0.18,(waist-cr)*1.2+0.06)*(1-0.18*swing), lCy=cr+Math.max(0.18,(waist-cr)*1.2+0.06)*0.55+0.07*swing;
  const uRy=(top-waist)*0.8+0.06, uCy=waist+(top-waist)*0.35;
  const bRy=Math.max(0.12,(waist-cr)*0.75+0.06), bCy=cr+bRy*0.95+0.04*swing;
  const rl0=Math.max(0.08,(Wl*0.9-gap/2)/2)*P.legThick, rlT=Math.max(0.09,(Wl*1.0-gap/2)/2)*P.legThick, rz0=D*0.8, rzT=D*0.97, legTop=crotch+0.1, legCy=legTop*0.4, legHy=legTop*0.85+0.05;
  const pivY=legTop, pivZ=0.02;
  // 앉기: 몸을 내리고, 앞으로 뻗은 다리 덩어리를 또렷하게
  const drop=sit?crotch0+0.02:0;
  const sRl=rl0*1.12, sFx=gap/2+rl0+0.05, sFront=D+0.24+ext, sHz=Math.max(0.1,D*0.55+0.14+ext*0.5), sZc=sFront-sHz;   // 뒤끝은 그대로, 앞끝만 늘고 줄어듦
  function fb(x,y,z,sd=1){
    if(sit){
      const yb=y+drop;
      let d=ell(x,yb-lCy,z-0.02,Wl,lRy,D*1.02);
      d=smin(d,ell(x,yb-uCy,z,Wu,uRy,D*0.9),0.2);
      d=smin(d,ell(x,yb-bCy,z+D*0.3,Wl*0.72,bRy,D*0.72),0.12);
      const qn=Math.hypot((x-sFx)/sRl,(y-sRl)/sRl), vn=Math.abs(z-sZc)/sHz;
      d=smin(d,(Math.cbrt(qn*qn*qn+vn*vn*vn)-1)*sRl*0.92,0.07);
      return smax(d,-y,0.035);
    }
    let d=ell(x,y-lCy,z-0.02,Wl,lRy,D*1.02);
    d=smin(d,ell(x,y-uCy,z,Wu,uRy,D*0.9),0.2);
    d=smin(d,ell(x,y-bCy,z+D*0.3,Wl*0.72,bRy,D*0.72),0.12);
    // 다리: 골반 지점을 축으로 앞뒤 회전
    const a=sd>0?aL:aR, ca=Math.cos(a), sa=Math.sin(a), ry=y-pivY, rz=z-pivZ;
    const yl=pivY+ry*ca-rz*sa, zl=pivZ+ry*sa+rz*ca;
    let tt=yl/legTop;tt=tt<0?0:tt>1?1:tt;tt=tt*tt*(3-2*tt);const rl=rl0+(rlT-rl0)*tt, rzL=rz0+(rzT-rz0)*tt, fx=gap/2+rl;
    const qn=Math.hypot((x-fx)/rl,(zl-0.02)/rzL), vn=Math.abs(yl-legCy)/legHy;
    d=smin(d,(Math.cbrt(qn*qn*qn+vn*vn*vn)-1)*Math.min(rl,rzL)*0.9,0.22-0.08*swing);
    const s=y<crotch?x-gap/2:Math.hypot(x,y-crotch)-gap/2;
    d=smax(d,-s,0.04);
    return smax(d,-y,0.035);
  }
  // 몸 옆선 x: 다리 사이 홈 높이에서는 가운데가 비어 있으므로 다리 안쪽에서부터 찾음
  const surfX=y=>{let lo=fb(0,y,0)<0?0:gap/2+rl0,hi=1.6;if(fb(lo,y,0)>0)return 0;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(fb(m,y,0)<0)lo=m;else hi=m}return lo};
  const surfZb=y=>{let lo=0,hi=1.5;if(fb(0,y,0)>0)return 0;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(fb(0,y,-m)<0)lo=m;else hi=m}return lo};
  const surfZf=y=>{let lo=0,hi=1.5;if(fb(0,y,0)>0)return 0;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(fb(0,y,m)<0)lo=m;else hi=m}return lo};
  // 팔 · 손 (끝부분이 흰 손) — 좌우 따로. 좌표는 각 팔 쪽으로 x를 접은(|x|) 공간.
  // 팔: 굴곡 없는 통통한 소시지 한 덩어리. 손은 끝부분(흰색)이고 손 크기만큼 끝이 살짝 굵어짐
  const ra=0.1*P.armThick, rh=ra*(0.98+0.14*P.handSize);
  const syB=L-0.13, sy=syB-drop, sx=surfX(sy)+ra*0.3;
  const hbH=0.68*P.headH, hwH=P.headW, hdH=0.74*P.headD, hyH=L+hbH-0.08-drop, eH=0.75-0.4*P.headSq;
  const headF=(x,y,z,mg=0)=>{const Yn=(y-hyH)/(hbH+mg);const at=hwH*(1+0.06*Math.max(-1,Math.min(1,-Yn)))+mg,ct=hdH*(1+0.03*Math.max(-1,Math.min(1,-Yn)))+mg;
    return Math.pow(Math.abs(x/at),2/eH)+Math.pow(Math.abs(Yn),2/eH)+Math.pow(Math.abs(z/ct),2/eH)};
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], len=v=>Math.hypot(v[0],v[1],v[2]), nrm=v=>{const l=len(v)||1;return v.map(c=>c/l)};
  // 기본(내린 팔): 몸통 옆에 반쯤 파묻혀 붙음.
  // 팔 들기: 어깨 뿌리가 가슴 앞쪽으로 옮겨가고, 손은 머리 앞쪽 볼 옆에 옴 (피규어식 만화적 허용).
  // 갸우뚱: 허리 위 윗몸만 머리와 같은 각도로 옆으로 기울고, 허리 아래(골반·다리)는 바닥에 그대로
  const TILT_B=12*R2D, tl=sit?0:(P.tilt||0), PH=-tl*TILT_B, bendY=waist;
  const bw=y=>smooth01(bendY-0.08,bendY+0.22,y);
  const rotR=(x,y,a)=>{const dy=y-bendY,c=Math.cos(a),s=Math.sin(a);return [x*c-dy*s,bendY+x*s+dy*c]};
  const unwY=(x,y)=>tl?rotR(x,y,-PH*bw(y)):[x,y];   // 몸통: 높이에 따라 부드럽게 굽힘
  const unwF=(x,y)=>tl?rotR(x,y,-PH):[x,y];          // 팔: 윗몸에 붙어 통째로 따라감
  const fbBent=(xr,y,z)=>{const u=unwY(xr,y);return fb(Math.abs(u[0]),u[1],z,u[0]>=0?1:-1)};
  function freeArm(raiseDeg,fwdDeg,sd,push=false){
    // 손 모으기(이모티콘용): 어깨 뿌리가 가슴 앞쪽으로 옮겨가고, 두 손이 배 앞 가운데에서 만남
    if(P.handPose==='front'&&!sit){const y0=sy-0.03,Sp0=[surfX(y0)-ra*0.7,y0,surfZf(y0)*0.5];
      const hy=Math.max(rh+0.12,sy-0.34),H0=[rh*0.92,hy,surfZf(hy)+rh*0.5];return {S:Sp0,H:H0}}
    let r=raiseDeg,fw=Math.max(-45,fwdDeg),H,Sp;
    for(let it=0;it<220;it++){
      const k=smooth01(40,140,r), kf=smooth01(25,85,fw)*(1-smooth01(100,150,fw)*0.5), kk=Math.max(k,kf);
      const rest=r<25&&fw<25;
      Sp=rest?(P.tuck?[surfX(sy)+ra*0.05,sy,0.01]:[surfX(sy)+ra*0.45,sy,0.01]):[sx-kk*0.06,sy-k*0.03,kk*surfZf(sy)*0.95];
      const rr=r*R2D,ff=fw*R2D;
      const Dv=[Math.sin(rr)*Math.cos(ff),-Math.cos(rr)*Math.cos(ff),Math.sin(ff)];
      // 각도는 '기본 길이 이상'의 팔로 정하고, 실제 손은 그 방향 그대로 실제 길이에 둠 → 짧은 팔도 같은 자세 유지
      let al=0.3*P.armLen, aRef=Math.max(al,0.3*DEF.armLen);
      if(Dv[1]<-0.05){const lim=(Sp[1]-rh-0.03)/(-Dv[1]);al=Math.min(al,lim);aRef=Math.min(aRef,lim)}
      al=Math.max(0.08,al);aRef=Math.max(0.08,aRef);
      H=[Sp[0]+Dv[0]*aRef,Sp[1]+Dv[1]*aRef,Sp[2]+Dv[2]*aRef];
      const Hreal=[Sp[0]+Dv[0]*al,Sp[1]+Dv[1]*al,Sp[2]+Dv[2]*al];
      if(rest){H=Hreal;H[0]=P.tuck?Math.max(H[0],surfX(H[1])+ra*0.3):surfX(H[1])+rh+0.045;
        // 갸우뚱: 몸이 기울어도 팔은 땅 쪽으로 늘어지게 → 몸 기준으로 반대로 돌림. 몸 안쪽으로 들어가면 옆구리에 붙임
        if(tl&&!P.tuck){
          // 갸우뚱: 기울어지는 쪽 팔(손시의 오른팔)은 몸통에 살짝 붙이고, 반대쪽 팔(왼팔)은 몸통에서 약간 띄움
          const stick=true;   // 양팔 모두 몸통에 살짝 붙임
          if(stick)H[0]=surfX(H[1])+ra*0.35;
          let hb=rotR(sd*H[0],H[1],PH);hb[1]=Math.max(hb[1],rh+0.02);
          const want=stick?ra*0.25:rh+0.05;   // 굽힌 뒤 모습 기준으로 몸통 표면에서 떨어진 거리
          for(let k=0;k<60&&fbBent(hb[0],hb[1],H[2])<want;k++)hb[0]+=sd*0.008;
          if(stick)for(let k=0;k<60&&fbBent(hb[0]-sd*0.008,hb[1],H[2])>want;k++)hb[0]-=sd*0.008;
          const hr=rotR(hb[0],hb[1],-PH);H=[sd*hr[0],hr[1],H[2]]}
        break}   // 차렷: 몸에 반쯤 파묻힘 / 기본: 몸에서 살짝 떨어짐
      if(H[0]<rh+0.02){r+=2;continue}
      if(fb(H[0],H[1],H[2])<ra*0.9){
        // (다시 풀기) 앉기에서 몸이 좁아 손이 배·다리에 묻히면: 팔을 치켜들지 않고 손만 바깥으로 살짝 벌려 같은 자세 유지
        if(push){let hx=H[0];for(let k=0;k<45&&fb(hx,H[1],H[2])<ra*0.9;k++)hx+=0.01;
          if(fb(hx,H[1],H[2])>=ra*0.9){const v=[hx-Sp[0],H[1]-Sp[1],H[2]-Sp[2]],l=Math.hypot(...v),d2=v.map(c=>c/l);
            H=[Sp[0]+d2[0]*al,Sp[1]+d2[1]*al,Sp[2]+d2[2]*al];break}}
        if(r<175)r+=2;else fw+=2;continue}
      if(headF(H[0],H[1],H[2],rh*0.45)<1){if(fw<58)fw+=2;else r-=2;continue}   // 손이 볼 앞에 닿을 만큼만
      H=Hreal;break;
    }
    // 앉기에서 팔이 옆·위로 치켜 올라가 버리면(몸이 좁을 때) 손을 바깥으로 벌리는 방식으로 다시 풂
    if(P.sit&&!push){const v=[H[0]-Sp[0],H[1]-Sp[1],H[2]-Sp[2]];if(v[1]/Math.hypot(...v)>-0.3)return freeArm(raiseDeg,fwdDeg,sd,true)}
    return {S:Sp,H};
  }
  function finish(A){
    const base=A.K||A.S;
    const Dv=nrm(sub(A.H,base));
    const Fv=nrm([-Dv[0]*Dv[2],-Dv[1]*Dv[2],1-Dv[2]*Dv[2]+1e-6]);
    const O=[Fv[1]*Dv[2]-Fv[2]*Dv[1],Fv[2]*Dv[0]-Fv[0]*Dv[2],Fv[0]*Dv[1]-Fv[1]*Dv[0]];
    A.D=Dv;A.thr=0;
    A.T=[0,1,2].map(i=>A.H[i]-Dv[i]*rh*0.35+Fv[i]*rh*0.62-O[i]*rh*0.25);
    A.base=base;A.seg=len(sub(A.H,base));
    if(A.K){const b=nrm([...nrm(sub(A.S,A.K))].map((v,i)=>v+nrm(sub(A.H,A.K))[i]));A.C=[0,1,2].map(i=>A.K[i]+b[i]*ra*0.85)}
    return A;
  }
  const AR={'1':finish(freeArm(P.armRaiseL,P.armFwdL,1)),'-1':finish(freeArm(P.armRaiseR,P.armFwdR,-1))};
  // 꼬리: 엉덩이 뒤에
  // 꼬리: 엉덩이 뒤에 붙는 별도 파츠(흰색). 모양·크기·길이·높이·기울기 조절, 몸과는 매끈하게 섞임
  const tR=P.tail?0.095*P.tailSize:0, tY=clamp(Math.max(cr+0.08,bCy)+P.tailY,0.1,top-0.15)-drop;
  const tZ=-surfZb(Math.max(0.05,tY))+0.02;
  const tA=P.tailTilt*R2D, tDir=[0,Math.sin(tA),-Math.cos(tA)], tUp=[0,Math.cos(tA),Math.sin(tA)];
  const tLen=P.tailLen, tKb=0.015+0.07*P.tailBlend;
  const tC=[0,tY+tDir[1]*tR*tLen*0.55,tZ+tDir[2]*tR*tLen*0.55];
  function tailD(x,y,z){
    const wx=x-tC[0],wy=y-tC[1],wz=z-tC[2];
    const a=wy*tDir[1]+wz*tDir[2], v=wy*tUp[1]+wz*tUp[2];
    const rx=tR*P.tailW,ry=tR,rz=tR*tLen;
    if(P.tailSq<0.01)return ell(x,v,a,rx,ry,rz);   // 동글
    // 모양: 값이 클수록 모서리가 각진 둥근 상자(초타원체)
    const n=2+6*P.tailSq,kk=Math.pow(Math.pow(Math.abs(x)/rx,n)+Math.pow(Math.abs(v)/ry,n)+Math.pow(Math.abs(a)/rz,n),1/n);
    return (kk-1)*Math.min(rx,ry,rz);
  }
  const capD=(x,y,z,A,B,r)=>{const bx=B[0]-A[0],by=B[1]-A[1],bz=B[2]-A[2],l2=bx*bx+by*by+bz*bz||1e-9;
    let t=((x-A[0])*bx+(y-A[1])*by+(z-A[2])*bz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-A[0]-bx*t,y-A[1]-by*t,z-A[2]-bz*t)-r};
  function armD(x,y,z,A){
    const S0=A.S,H0=A.H,bx=H0[0]-S0[0],by=H0[1]-S0[1],bz=H0[2]-S0[2],l2=bx*bx+by*by+bz*bz||1e-9;
    let t=((x-S0[0])*bx+(y-S0[1])*by+(z-S0[2])*bz)/l2;t=t<0?0:t>1?1:t;
    let a=Math.hypot(x-S0[0]-bx*t,y-S0[1]-by*t,z-S0[2]-bz*t)-(ra+(rh-ra)*t*t);
    return a;
  }
  function bodyOnly(x,y,z){const sd=x>=0?1:-1;x=Math.abs(x);let d=fb(x,y,z,sd);if(tR>0)d=smin(d,tailD(x,y,z),tKb);return d}
  const isTail=(x0,y0,z)=>{if(tR<=0)return 0;const [x,y]=unwY(x0,y0);const sd=x>=0?1:-1,ax=Math.abs(x);const v=0.5+(fb(ax,y,z,sd)-tailD(ax,y,z))/0.05;return v<0?0:v>1?1:v};
  function f(x,y,z){
    const [bx,by]=unwY(x,y),[ax,ay]=unwF(x,y);
    const A=ax>=0?AR['1']:AR['-1'];
    let d=bodyOnly(bx,by,z);
    d=smin(d,armD(Math.abs(ax),ay,z,A),0.07);
    return Math.max(d,-y);
  }
  // 정점마다 '팔·손 쪽인지' 표시 → 손의 흰색이 몸통으로 번지지 않게
  // 팔/몸 경계를 0~1 연속값으로 저장 → 정점 사이에서 부드럽게 보간되어 경계선이 계단·노이즈 없이 매끈함
  const isArm=(x,y,z)=>{const [bx,by]=unwY(x,y),[ax,ay]=unwF(x,y);const v=0.5+(bodyOnly(bx,by,z)-armD(Math.abs(ax),ay,z,ax>=0?AR['1']:AR['-1']))/0.06;return v<0?0:v>1?1:v};
  const As=[AR['1'],AR['-1']];
  const pts=A=>[A.S,A.H,A.T].concat(A.K?[A.K]:[]);
  const xm=Math.max(Wl,Wu,gap/2+2*rlT,sFx+sRl,...As.flatMap(A=>pts(A).map(p=>p[0]+rh)),sx+ra)+0.14+(tl?(top-bendY)*Math.sin(TILT_B)+0.06:0), zm=D*1.15+0.35;
  const yTop=Math.max(top-drop,...As.flatMap(A=>pts(A).map(p=>p[1]+rh)),sy+ra)+0.1;
  const zMax=Math.max(zm,sit?sFront+0.1:0,...As.flatMap(A=>pts(A).map(p=>p[2]+rh+0.1)));
  const zMin=Math.min(-zm,tZ-tR*(1+1.6*tLen)-0.1,...As.flatMap(A=>pts(A).map(p=>p[2]-rh-0.1)));
  const V3=(a,b,c)=>new THREE.Vector3(a,b,c);
  const mk=A=>({S:V3(...A.base),D:V3(...A.D),HS:A.seg-rh*0.55,E:V3(...A.H)});
  const L1=mk(AR['1']),R1=mk(AR['-1']);
  return {bend:{PH,y:bendY},footOut:gap/2+2*rl0,f,isArm,isTail,upper:{cy:uCy-drop,rx:Wu,ry:uRy,rz:D*0.9},L:L-drop,Lstand:L,waist,D,bounds:[[-xm,-0.03,zMin],[xm,yTop,zMax]],
    mask:{uSL:L1.S,uDL:L1.D,uHSL:L1.HS,uEL:L1.E,uSR:R1.S,uDR:R1.D,uHSR:R1.HS,uER:R1.E,uHR:rh*1.7,
      uSole:0.05*P.footSize,uSit:sit?1:0,uFootZ:sFront-0.07*P.footSize,uFootY:2*sRl+0.03,
      uBend:PH,uWaist:bendY,uLegY:pivY,uLegZ:pivZ,uLegAL:aL,uLegAR:aR,uHC:V3(0,hyH,0),uHRad:V3(hwH,hbH,hdH),uHE:eH}};
}
// Surface Nets로 SDF를 매끈한 메시로 변환
function surfaceNets(f,b0,b1,h,cls){
  const nx=Math.ceil((b1[0]-b0[0])/h)+1,ny=Math.ceil((b1[1]-b0[1])/h)+1,nz=Math.ceil((b1[2]-b0[2])/h)+1;
  const V=new Float32Array(nx*ny*nz);let n=0;
  for(let k=0;k<nz;k++){const z=b0[2]+k*h;for(let j=0;j<ny;j++){const y=b0[1]+j*h;for(let i=0;i<nx;i++)V[n++]=f(b0[0]+i*h,y,z)}}
  const id=(i,j,k)=>i+nx*(j+ny*k);
  const C=new Int32Array(nx*ny*nz).fill(-1),pos=[];
  const cr=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const ed=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  const cv=new Float32Array(8);
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
    let neg=0;for(let c=0;c<8;c++){const v=V[id(i+cr[c][0],j+cr[c][1],k+cr[c][2])];cv[c]=v;if(v<0)neg++}
    if(neg===0||neg===8)continue;
    let sx=0,sy=0,sz=0,cnt=0;
    for(const[a,b]of ed){if((cv[a]<0)!==(cv[b]<0)){const t=cv[a]/(cv[a]-cv[b]);
      sx+=cr[a][0]+t*(cr[b][0]-cr[a][0]);sy+=cr[a][1]+t*(cr[b][1]-cr[a][1]);sz+=cr[a][2]+t*(cr[b][2]-cr[a][2]);cnt++}}
    C[id(i,j,k)]=pos.length/3;pos.push(b0[0]+(i+sx/cnt)*h,b0[1]+(j+sy/cnt)*h,b0[2]+(k+sz/cnt)*h);
  }
  const idx=[];
  const quad=(a,b,c,d)=>{if(a<0||b<0||c<0||d<0)return;idx.push(a,b,c,a,c,d)};
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const v0=V[id(i,j,k)]<0;
    if(i<nx-1&&j>0&&k>0&&v0!==(V[id(i+1,j,k)]<0))quad(C[id(i,j-1,k-1)],C[id(i,j,k-1)],C[id(i,j,k)],C[id(i,j-1,k)]);
    if(j<ny-1&&i>0&&k>0&&v0!==(V[id(i,j+1,k)]<0))quad(C[id(i-1,j,k-1)],C[id(i,j,k-1)],C[id(i,j,k)],C[id(i-1,j,k)]);
    if(k<nz-1&&i>0&&j>0&&v0!==(V[id(i,j,k+1)]<0))quad(C[id(i-1,j-1,k)],C[id(i,j-1,k)],C[id(i,j,k)],C[id(i-1,j,k)]);
  }
  // 표면으로 끌어당기고 SDF 기울기로 법선 계산 → 아주 매끈한 면
  const e=h*0.5,nrm=new Float32Array(pos.length);
  const grad=(x,y,z)=>[f(x+e,y,z)-f(x-e,y,z),f(x,y+e,z)-f(x,y-e,z),f(x,y,z+e)-f(x,y,z-e)];
  for(let v=0;v<pos.length;v+=3){
    let x=pos[v],y=pos[v+1],z=pos[v+2];
    for(let it=0;it<2;it++){const d=f(x,y,z),g=grad(x,y,z),l2=g[0]*g[0]+g[1]*g[1]+g[2]*g[2]||1;const s=d*(2*e)/l2*(2*e);
      x-=g[0]/(2*e)*s/(2*e)*(2*e);y-=g[1]/(2*e)*s/(2*e)*(2*e);z-=g[2]/(2*e)*s/(2*e)*(2*e)}
    pos[v]=x;pos[v+1]=y;pos[v+2]=z;
    const g=grad(x,y,z),l=Math.hypot(g[0],g[1],g[2])||1;nrm[v]=g[0]/l;nrm[v+1]=g[1]/l;nrm[v+2]=g[2]/l;
  }
  for(let t=0;t<idx.length;t+=3){
    const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;
    const ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],wx=pos[c]-pos[a],wy=pos[c+1]-pos[a+1],wz=pos[c+2]-pos[a+2];
    const cx=uy*wz-uz*wy,cy=uz*wx-ux*wz,cz=ux*wy-uy*wx;
    if(cx*(nrm[a]+nrm[b]+nrm[c])+cy*(nrm[a+1]+nrm[b+1]+nrm[c+1])+cz*(nrm[a+2]+nrm[b+2]+nrm[c+2])<0){const s=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=s}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
  if(cls)for(const name in cls){const ar=new Float32Array(pos.length/3);for(let v=0;v<pos.length;v+=3)ar[v/3]=cls[name](pos[v],pos[v+1],pos[v+2]);g.setAttribute(name,new THREE.BufferAttribute(ar,1))}
  g.setIndex(idx);return g;
}
let bodyCache={key:'',geo:null,model:null};
function getBody(h){
  const keys=['bodyLen','lowerRatio','upperW','lowerW','bodyD','legSplit','legGap','footSize','armLen','armThick','handSize','tail','tailSize','tailLen','tailY','tailTilt','tailBlend','tailShape','tailW','tailSq','armRaiseR','armFwdR','armRaiseL','armFwdL','sit','tuck','headW','headH','headD','headSq','legSwingR','legSwingL','tilt','legThick','handPose'];
  const k=keys.map(x=>P[x]).join('|')+'|'+h;
  if(bodyCache.key===k)return bodyCache;
  const model=bodyModel();
  const geo=surfaceNets(model.f,model.bounds[0],model.bounds[1],h,{aArm:model.isArm,aTail:model.isTail});
  if(bodyCache.geo)bodyCache.geo.dispose();
  bodyCache={key:k,geo,model};return bodyCache;
}

