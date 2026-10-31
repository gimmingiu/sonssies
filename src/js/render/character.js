// ---------- 캐릭터 ----------
let RATIO=2;
function build(M,B){
  const g=new THREE.Group();
  const {head:hm,white,dark,pink,pinkIn,sweatMat}=M, md=B.model;
  const bodyMesh=mesh(B.geo,M.body);bodyMesh.userData.keep=true;g.add(bodyMesh);
  const L=md.L;
  // 머리
  const hb=0.68*P.headH, hwA=1.0*P.headW, hy=L+hb-0.08, e=0.75-0.4*P.headSq, H=P.headH;
  // 머리와 얼굴·귀·뿔은 목 지점을 축으로 함께 움직이는 그룹(HG)에 담음
  const neckY=hy-hb*0.75, HG=new THREE.Group(), HI=new THREE.Group();
  HG.position.y=neckY;HI.position.y=-neckY;HG.add(HI);g.add(HG);
  const hgeo=blob(hwA,hb,0.74*P.headD,e,0.06,72);
  // 볼살: 얼굴 아래 양옆을 바깥(앞·옆)으로 통통하게 부풀림. 입 '냠냠'(ㅡ( 입)은 괄호 쪽 볼을 동그랗게 더 부풀림(음식을 머금은 모습)
  const puff=P.mouthType==='puff';
  if(P.cheek>0||puff){const pa=hgeo.attributes.position,na=hgeo.attributes.normal,amp=0.26*P.cheek,cxk=hwA*0.58,cyk=-hb*0.4;
    const pyk=clamp(P.mouthY*P.headH,-hb*0.8,-hb*0.1)+hb*0.02,pxk=hwA*0.5;
    for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),nz=na.getZ(i),fz=Math.max(0,Math.min(1,(nz+0.45)/0.6));if(fz<=0)continue;   // 뒤쪽으로 갈수록 부드럽게 0(뒤통수에 턱이 지지 않게)
      let w=0;
      if(amp>0){const wy=y<cyk?1:Math.exp(-(((y-cyk)/(hb*0.42))**2)), wx=0.82+0.18*Math.exp(-(((Math.abs(x)-cxk)/(hwA*0.32))**2)), side=Math.exp(-((Math.max(0,Math.abs(x)-hwA*0.82)/(hwA*0.18))**2));
        w=amp*wy*wx*side*fz}   // 볼부터 턱까지 아래쪽 얼굴 전체가 통통하게(턱 가운데도 82%)
      if(puff&&x>0){const r=Math.hypot((x-pxk)/(hwA*0.3),(y-pyk)/(hb*0.3));w+=0.11*Math.exp(-r*r)*fz}   // 'ㅡ(' 쪽 볼만 볼록
      if(w<1e-4)continue;pa.setXYZ(i,x+na.getX(i)*w,y+na.getY(i)*w*(na.getY(i)<0?0.9:0.6),pa.getZ(i)+nz*w)}
    hgeo.computeVertexNormals()}
  const head=mesh(hgeo,hm);head.position.y=hy;head.userData.part='head';HI.add(head);
  RATIO=(2*hb)/(L-0.08);
  g.updateMatrixWorld(true);
  const ray=new THREE.Raycaster();
  let TAG='';   // 지금 붙이는 부위 이름(수정한 부위만 움직이는 모션에서 찾을 때 씀)
  function stick(target,m,x,y,lift=0,rotZ=0){
    if(!m.userData.part)m.userData.part=TAG;
    ray.set(new THREE.Vector3(x,y,6),new THREE.Vector3(0,0,-1));
    const h=ray.intersectObject(target)[0];if(!h)return false;
    const n=h.face.normal.clone().transformDirection(target.matrixWorld);
    m.position.copy(h.point).addScaledVector(n,lift);
    m.lookAt(h.point.clone().addScaledVector(n,3));m.rotateZ(rotZ);HI.add(m);return true;
  }
  // 얼굴 면에 착 붙는 얇은 조각(번짐 볼터치용): 격자 점마다 앞에서 얼굴로 쏘아 맞은 자리에 붙임
  function patch(target,x,y,w,h,mat){
    const geo=new THREE.PlaneGeometry(w,h,12,12),pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){const px=x+pa.getX(i),py=y+pa.getY(i);ray.set(new THREE.Vector3(px,py,6),new THREE.Vector3(0,0,-1));const hit=ray.intersectObject(target)[0];
      if(hit){const n=hit.face.normal.clone().transformDirection(target.matrixWorld);const q=hit.point.clone().addScaledVector(n,0.004);pa.setXYZ(i,q.x,q.y,q.z)}else pa.setXYZ(i,px,py,-1)}
    geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.renderOrder=2;m.userData.part=TAG;HI.add(m);return m}
  // ---- 얼굴 (항상 얼굴 영역 안, 서로 겹치지 않게 제한) ----
  const faceTop=hb*0.78, faceBot=-hb*0.8, faceX=hwA*0.72;
  const ns=P.noseSize, nhw=0.125*ns, nhh=0.083*ns;
  const es=P.eyeSize, er=0.068*es;
  let ey=clamp(P.eyeY*H,faceBot+0.25,faceTop-er-0.12);
  let ex=clamp(P.eyeX*hwA,Math.max(er*1.4,nhw+er+0.03),faceX-er);
  let ny=clamp(P.noseY*H,faceBot+nhh+0.12,ey+0.02);
  const R=Math.min(0.04*P.mouthW,hwA*0.32), tr=0.012, arc=Math.PI*P.mouthCurve;
  let my=clamp(P.mouthY*H,faceBot+0.03,ny-nhh-0.035-R*0.5);
  const ang=P.browAng*Math.PI/180, bl=P.browLen, bth=P.browThick;
  const vext=Math.abs(Math.sin(ang))*bl/2+bth, hext=Math.abs(Math.cos(ang))*bl/2+bth;
  let by=Math.max(P.browY*H,ey+er+0.035+vext);by=Math.min(by,faceTop+0.12-vext);
  let bx=clamp(P.browX*hwA,hext+0.025,faceX-hext+0.04);
  // ---- 표정 파츠 ----
  const tE=0.017*Math.sqrt(es);
  function makeEye(type){
    if(type==='happy'||type==='content')return {m:arcStroke(0.05*es,tE,Math.PI*0.78,dark),lift:0.006};
    if(type==='squint'){const gq=new THREE.Group(),l=0.085*es,a=0.56;
      for(const k of[-1,1]){const c=mesh(capsule(l,tE),dark);c.scale.z=0.7;c.rotation.z=-k*a;c.position.set(-Math.cos(a)*l/2+tE,k*Math.sin(a)*l/2,0);gq.add(c)}
      gq.children.forEach(c=>c.position.x+=l*0.25);return {m:gq,lift:0.006}}
    if(type==='line'){const c=mesh(capsule(0.11*es,tE),dark);c.scale.z=0.7;return {m:c,lift:0.006}}
    if(type==='wide'){const gw=new THREE.Group();gw.add(mesh(blob(0.062*es*1.3,er*1.3,0.03*es,0.9),dark));
      const hl=mesh(blob(0.022*es,0.022*es,0.01,1),white);hl.position.set(-0.025*es,0.03*es,0.03*es);gw.add(hl);return {m:gw,lift:0.008}}
    return {m:mesh(blob(0.062*es,er,0.03*es,0.9),dark),lift:0.008};
  }
  for(const s of[-1,1]){
    const E=makeEye(P.eyeType);
    let rz=0;
    if(P.eyeType==='content')rz=Math.PI;
    if(P.eyeType==='squint'&&s>0)rz=Math.PI;
    TAG='eye';stick(head,E.m,s*ex,hy+ey,E.lift,rz);TAG='brow';
    const brow=mesh(capsule(bl,bth),dark);brow.scale.z=0.7;
    const asy=s>0?(P.browAsym||0):0;stick(head,brow,s*bx,hy+by+0.07*asy/25,0.006,s*ang-asy*Math.PI/180);
    TAG='blush';if(P.blush){const bx0=s*Math.min(faceX,ex+0.22),by0=hy+ey-0.13+P.blushY,bt=P.blushType;
      if(bt==='hatch'){for(let j=-1;j<=1;j++){const c=mesh(capsule(0.1,0.015),pink);c.scale.z=0.7;stick(head,c,bx0+j*0.05,by0,0.005,1.05)}}   // 빗금 세 줄
      else if(bt==='freckle'){}   // 주근깨는 코를 붙인 뒤 한 띠로(아래)
      else if(bt==='blur')patch(head,bx0,by0,0.36,0.27,blurMat(P.blushColor));   // 볼에 번지듯 물든 볼터치
      else stick(head,mesh(blob(0.11,0.075,0.012,0.9),pink),bx0,by0,0.004)}
  }
  const noseM=mesh(blob(nhw,nhh,0.055*ns,0.95-0.6*P.noseSq),white);stick(head,noseM,0,hy+ny,0.025*ns);   // 모양: 0 둥근 ↔ 1 각진
  // 주근깨(그림 참고): 한쪽 볼 → 눈 사이 콧잔등(코 위로 산 모양) → 다른 쪽 볼. 한쪽을 흩뿌린 뒤 반대쪽에 거울처럼 옮기고 살짝만 흔듦(대칭 95% · 비대칭 5%)
  TAG='blush';
  if(P.blush&&P.blushType==='freckle'){
    const dots=freckleDots(ny,nhw,nhh,ey,er,ex,P.blushY),fm=freckleMat(P.color);
    dots.forEach(([x,y,r])=>stick(head,mesh(blob(r,r,0.006,0.9),fm),x,hy+y,0.003))}
  // 입
  TAG='mouth';
  const mW=clamp(P.mouthW,0.6,1.7), mt=P.mouthType;
  if(mt==='open'){
    const oh=0.075*Math.sqrt(mW), ow=0.055*mW, gO=new THREE.Group();
    gO.add(mesh(blob(ow,oh,0.02,0.8,-0.22,40),dark));
    const tg=mesh(blob(ow*0.66,oh*0.5,0.012,0.85,0,32),pinkIn);tg.position.set(0,-oh*0.38,0.012);gO.add(tg);
    stick(head,gO,0,hy+clamp(my-oh*0.55,faceBot+oh,ny-nhh-oh-0.01),0.006);
  }else if(mt==='o'){
    stick(head,mesh(blob(0.03*Math.sqrt(mW),0.038*Math.sqrt(mW),0.018,0.95),dark),0,hy+my-0.01,0.006);
  }else if(mt==='flat'){
    const c=mesh(capsule(0.075*mW,tr),dark);c.scale.z=0.7;stick(head,c,0,hy+my,0.004);
  }else if(mt==='munch'){   // 야옹: 코 밑에서 짧게 내려온 뒤 양옆으로 갈라지는 'ㅅ'(人)자 입
    const L=0.085*Math.sqrt(mW),a=1.03,top=ny-nhh*0.7,ay=ny-nhh-0.04,st=mesh(capsule(top-ay+tr,tr),dark);st.scale.z=0.7;
    stick(head,st,0,hy+(top+ay)/2,0.004,Math.PI/2);
    for(const k of[-1,1]){const c=mesh(capsule(L,tr),dark);c.scale.z=0.7;
      stick(head,c,k*Math.sin(a)*(L/2-tr*0.5),hy+ay-Math.cos(a)*(L/2-tr*0.5),0.004,-k*(Math.PI/2-a))}
  }else if(mt==='puff'){   // 냠냠: 'ㅡ(' 모양(입에 먹을 것을 담고 있는 표현)
    const lw=0.085*mW,c=mesh(capsule(lw,tr),dark);c.scale.z=0.7;stick(head,c,-0.02,hy+my,0.004);
    const R=0.05,arc=Math.PI*0.62,gP=new THREE.Group(),tor=mesh(new THREE.TorusGeometry(R,tr,12,28,arc),dark);tor.rotation.z=Math.PI-arc/2;tor.scale.z=0.75;gP.add(tor);
    for(const an of[Math.PI-arc/2,Math.PI+arc/2]){const cap=mesh(new THREE.SphereGeometry(tr,12,10),dark);cap.scale.z=0.75;cap.position.set(R*Math.cos(an),R*Math.sin(an),0);gP.add(cap)}
    stick(head,gP,-0.02+lw/2+R*1.15,hy+my,0.004);
  }else if(mt==='none'){
  }else{
    const sm=curveMouth(R,tr,P.mouthCurve,dark);
    if(mt==='smirk')stick(head,sm,0.06,hy+my,0.004,0.35);else stick(head,sm,0,hy+my,0.004,0);   // 씩 웃음은 가운데에서 살짝 오른쪽(화면 기준)
  }
  // ---- 귀 (항상 머리 옆면에 붙음) ----
  for(const s of[-1,1]){
    const S=P.earSize, halfH=0.4*S;
    const lim=Math.max(0,hb*0.92-halfH*0.75);
    const eyC=hy+clamp(P.earY*H,-lim,lim), ez=-0.04;
    ray.set(new THREE.Vector3(s*6,eyC,ez),new THREE.Vector3(-s,0,0));
    const hh=ray.intersectObject(head)[0];
    const edgeX=hh?hh.point.x:s*hwA*0.98;
    const spread=clamp(P.earSpread,-0.1,0.12*S-0.03);
    const E=earGeo(s);
    const ear=mesh(E.geo,M.ear[s>0?1:0](E.U));
    ear.scale.setScalar(S);ear.position.set(edgeX+s*spread,eyC,ez);ear.userData.part='ear'+s;HI.add(ear);
  }
  // ---- 뿔 (항상 머리 윗면에 박힘) ----
  if(P.horns){
    // 두께는 밑면 지름만 바꿈. 길이는 '머리 표면(뿔 가운데)~꼭지'로 고정해서, 두꺼워져도 짧아 보이지 않게 함
    const S=P.hornSize, r0=0.2*S*(1+(P.hornRound-0.6)*1.1), Ht=0.34*S*P.hornH, tilt=P.hornTilt*Math.PI/180, rD=0.2*S;
    const spots=[];let drop=0;
    for(const s of[-1,1]){
      let cx=s*clamp(P.hornX*hwA,rD*1.1,hwA*0.9-rD*1.15);   // 위치는 두께와 상관없이 기본 두께 기준으로
      let cy=null,minY=Infinity,ok=true;
      for(let j=0;j<=12;j++){const a=j/12*Math.PI*2,px=cx+(j?Math.cos(a)*r0:0),pz=0.05+(j?Math.sin(a)*r0:0);
        ray.set(new THREE.Vector3(px,8,pz),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(head)[0];if(!h){if(!j){ok=false;break}continue}if(!j)cy=h.point.y;minY=Math.min(minY,h.point.y)}
      if(!ok){cx*=0.8;ray.set(new THREE.Vector3(cx,8,0.05),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(head)[0];if(!h)continue;cy=h.point.y;minY=cy-0.06*S}
      drop=Math.max(drop,cy-minY);spots.push([s,cx,cy]);
    }
    const sink=0.06*S+drop, pts=[];
    // 옆선은 뿌리에서 꼭지까지 곧은 직선(원뿔). 꼭지만 옆선에 '접하는' 작은 원으로 마무리해서 꺾이거나 부푼 곳이 없음
    const H=Ht+sink, al=Math.atan2(r0,H), rc=Math.min(0.06*S,r0*0.45,H*0.25);   // 꼭지 둥글기는 두께와 상관없이 같게
    const yc=H-rc/Math.sin(al), ty=yc+rc*Math.sin(al), tr=rc*Math.cos(al);   // 둥근 끝의 중심과, 옆선이 원에 닿는 점
    pts.push(new THREE.Vector2(r0,-sink));pts.push(new THREE.Vector2(r0+(tr-r0)*0.5,-sink+ty*0.5));pts.push(new THREE.Vector2(tr,-sink+ty));
    for(let i=1;i<=16;i++){const a=al+(Math.PI/2-al)*i/16;pts.push(new THREE.Vector2(Math.max(rc*Math.cos(a),1e-4),-sink+yc+rc*Math.sin(a)))}
    const lathe=new THREE.LatheGeometry(pts,48);
    for(const [s,cx,cy] of spots){const horn=mesh(lathe.clone(),white);horn.position.set(cx,cy,0.05);horn.rotation.z=-s*tilt;horn.userData.part='horn';HI.add(horn)}
    lathe.dispose();
  }
  const D2R=Math.PI/180;const autoRoll=10*(smooth01(40,130,P.armRaiseR)-smooth01(40,130,P.armRaiseL));  // 팔을 들면 머리는 반대쪽으로
  HG.rotation.set(P.headPitch*D2R,P.headYaw*D2R,-autoRoll*D2R,'YXZ');
  // 갸우뚱: 머리를 기울인 쪽 발 바깥 끝을 축으로 몸 전체가 살짝 기울고(반대쪽 발이 들림), 머리는 조금 더 기울어짐
  const tl=P.tilt||0;
  if(tl&&!P.sit){const {PH,y:by}=B.model.bend,dy=HG.position.y-by;
    HG.position.x=-dy*Math.sin(PH);HG.position.y=by+dy*Math.cos(PH);HG.rotation.z+=PH-tl*2*D2R}
  g.userData.HG=HG;
  return g;
}


// 볼터치 재질(종류·색마다 하나씩 만들어 두고 다시 씀)
const BL_MATS={};
const BLUR_TEX=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'#fff');g.addColorStop(0.35,'#ddd');g.addColorStop(0.75,'#444');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv)})();
function blurMat(hex){const k='b'+hex;return BL_MATS[k]||(BL_MATS[k]=new THREE.MeshStandardMaterial({color:lin(hex),roughness:0.9,metalness:0,transparent:true,opacity:0.85,alphaMap:BLUR_TEX,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}))}
// 주근깨 색: 피부와 같은 색 계열에서 조금만 진하게(명도·채도 차이가 크지 않게)
function freckleHex(skin){const c=new THREE.Color(skin),h={};c.getHSL(h);c.setHSL(h.h,Math.min(1,h.s*0.92+0.02),Math.max(0.15,h.l-0.13));return '#'+c.getHexString()}
function freckleMat(skin){const hx=freckleHex(skin),k='f'+hx;return BL_MATS[k]||(BL_MATS[k]=clay(hx,0.85,false,true))}
// 주근깨 점 자리: 산 모양 띠를 따라 한쪽에 흩뿌리고, 반대쪽은 거울 자리에서 아주 조금만 어긋나게(늘 같은 자리가 나오게 정해진 난수)
function freckleDots(ny,nhw,nhh,ey,er,ex,oy){
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
  const A=[0,ny+nhh+0.075+oy],C=[ex+0.1,ny-nhh*0.35+oy],n=13,half=[],out=[];
  for(let i=0;i<n;i++){const t=(i+0.15+rnd()*0.7)/n,sag=-0.035*Math.sin(Math.PI*t),px=A[0]+(C[0]-A[0])*t,py=A[1]+(C[1]-A[1])*t+sag;
    const off=(rnd()-0.5)*0.07;half.push([px+off*0.55,py+off,0.0115+rnd()*0.0035])}
  for(const s of[-1,1])half.forEach(([x,y,r])=>{const j=s>0?0.006:0;   // 오른쪽만 살짝 어긋남
    const X=s*(x+(rnd()-0.5)*j),Y=y+(rnd()-0.5)*j,R=r*(s>0?0.92+rnd()*0.16:1);
    if(Math.abs(X)<nhw*1.05&&Math.abs(Y-ny)<nhh*1.05)return;if(Math.abs(X)<0.012)return;   // 코에 가리거나 가운데에서 겹치는 점은 뺌
    out.push([X,Y,R])});
  return out}
