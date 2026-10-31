// ---------- 이모티콘 세트 (카톡에 이미지로 보내는 512×512 PNG, 흰 바탕) ----------
// 지금 꾸민 손시에 장면별 표정·자세·소품만 잠시 덮어써서 렌더 → 원래대로 되돌림
const D2Rs=Math.PI/180;
const PROP_COL={spark:'#ffd36b',heart:'#ff7d8f',sweat:'#f7fafa',thumb:'#ffd36b',quest:'#ffd36b',cloud:'#eef2f3',line:'#d3dde1',bowl:'#9cc3d1',rice:'#fbfcfc',spoon:'#e9c98f',dot:'#a9b8bd',tear:'#f7fafa'};
// 매끈한 덩어리 소품(엄지척·물음표)은 SDF로 빚어 surface nets로 메시화 (이음새 없음)
const _propCache={};
function sdfProp(f,b0,b1,h){const g=surfaceNets(f,b0,b1,h,{});g.computeBoundingSphere();return g}
function propGeo(type){
  if(_propCache[type])return _propCache[type].clone();
  const sm=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*0.25};
  const rbox=(x,y,z,bx,by,bz,r)=>{const qx=Math.abs(x)-bx+r,qy=Math.abs(y)-by+r,qz=Math.abs(z)-bz+r;return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-r};
  const cap=(x,y,z,a,b,r)=>{const bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],l2=bx*bx+by*by+bz*bz;let t=((x-a[0])*bx+(y-a[1])*by+(z-a[2])*bz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-a[0]-bx*t,y-a[1]-by*t,z-a[2]-bz*t)-r};
  if(type==='cloud'){   // 먼지 구름: 둥근 공 4개가 매끈하게 뭉친 덩어리
    const B=[[0,0,0,0.42],[0.42,-0.08,0,0.32],[-0.4,-0.1,0,0.3],[0.12,0.28,0,0.3]];
    const g=sdfProp((x,y,z)=>B.reduce((d,b)=>sm(d,Math.hypot(x-b[0],y-b[1],(z-b[2])*1.3)-b[3],0.18),9),[-0.85,-0.55,-0.45],[0.85,0.7,0.45],0.03);_propCache[type]=g;return g.clone()}
  if(type==='line'){const g=sdfProp((x,y,z)=>cap(x,y,z,[-0.5,0,0],[0.5,0,0],0.08),[-0.65,-0.15,-0.15],[0.65,0.15,0.15],0.02);_propCache[type]=g;return g.clone()}
  if(type==='bowl'){   // 밥그릇: 아래가 둥근 그릇(굽 포함)
    const g=sdfProp((x,y,z)=>{const r=Math.hypot(x,z);let d=Math.max(Math.hypot(r,y-0.2)-0.62,y-0.18);d=sm(d,Math.max(Math.abs(y+0.42)-0.06,r-0.26)-0.02,0.08);return d-0.02},[-0.75,-0.6,-0.75],[0.75,0.3,0.75],0.03);_propCache[type]=g;return g.clone()}
  if(type==='rice'){const g=sdfProp((x,y,z)=>Math.hypot(x,(y-0.12)*1.7,z)-0.56,[-0.65,0,-0.65],[0.65,0.5,0.65],0.03);_propCache[type]=g;return g.clone()}
  if(type==='spoon'){const g=sdfProp((x,y,z)=>sm(Math.hypot(x,(y-0.55)*0.8,z*2.2)-0.17,cap(x,y,z,[0,-0.55,0],[0,0.4,0],0.06),0.06),[-0.3,-0.7,-0.2],[0.3,0.85,0.2],0.02);_propCache[type]=g;return g.clone()}
  if(type==='dot'){const g=new THREE.SphereGeometry(1,24,18);return g}
  if(type==='tear'){return propGeo('sweat')}
  if(type==='thumb'){   // 엄지척: 가로로 누운 주먹(앞쪽에 접힌 손가락 4개의 둥근 마디) + 주먹 왼쪽 위에서 짧게 선 엄지
    const g=sdfProp((x,y,z)=>{let d=rbox(x+0.05,y,z,0.5,0.42,0.34,0.3);
      for(let i=0;i<4;i++)d=sm(d,Math.hypot(x-0.42,y-(0.27-i*0.2),z-0.1)-0.15,0.1);   // 접힌 손가락 마디(오른쪽 면)
      d=sm(d,cap(x,y,z,[-0.26,0.25,0.02],[-0.3,0.78,0.02],0.17),0.16);return d},[-0.8,-0.75,-0.55],[0.85,1.05,0.55],0.03);
    _propCache[type]=g;return g.clone()}
  if(type==='quest'){   // 물음표: 둥근 고리 + 짧은 기둥 + 점
    const c=[0,0.42],R=0.36,a0=-Math.PI*0.32,a1=Math.PI*1.12;
    const arc=(x,y)=>{let a=Math.atan2(y-c[1],x-c[0]);if(a<-Math.PI/2)a+=Math.PI*2;
      if(a>=a0&&a<=a1)return Math.abs(Math.hypot(x-c[0],y-c[1])-R);
      const e=[[c[0]+R*Math.cos(a0),c[1]+R*Math.sin(a0)],[c[0]+R*Math.cos(a1),c[1]+R*Math.sin(a1)]];return Math.min(...e.map(q=>Math.hypot(x-q[0],y-q[1])))};
    const ex=c[0]+R*Math.cos(a0),ey=c[1]+R*Math.sin(a0);
    const g=sdfProp((x,y,z)=>{const tube=Math.hypot(arc(x,y),z)-0.13,stem=cap(x,y,z,[ex,ey,0],[0,-0.12,0],0.13),dot=Math.hypot(x,y+0.52,z)-0.15;return Math.min(sm(tube,stem,0.08),dot)},[-0.65,-0.8,-0.25],[0.65,0.98,0.25],0.025);
    _propCache[type]=g;return g.clone()}
  if(type==='heart'){const s=new THREE.Shape();s.moveTo(0,-0.9);s.bezierCurveTo(-0.15,-0.62,-1.05,-0.25,-1.05,0.28);s.bezierCurveTo(-1.05,0.82,-0.38,1.02,0,0.55);
    s.bezierCurveTo(0.38,1.02,1.05,0.82,1.05,0.28);s.bezierCurveTo(1.05,-0.25,0.15,-0.62,0,-0.9);
    const g=new THREE.ExtrudeGeometry(s,{depth:0.32,bevelEnabled:true,bevelThickness:0.22,bevelSize:0.2,bevelSegments:8,curveSegments:28});g.center();return g}
  if(type==='spark'){const s=new THREE.Shape(),c=0.16;s.moveTo(0,1);s.quadraticCurveTo(c,c,1,0);s.quadraticCurveTo(c,-c,0,-1);s.quadraticCurveTo(-c,-c,-1,0);s.quadraticCurveTo(-c,c,0,1);
    const g=new THREE.ExtrudeGeometry(s,{depth:0.14,bevelEnabled:true,bevelThickness:0.14,bevelSize:0.1,bevelSegments:6,curveSegments:20});g.center();return g}
  if(type==='sweat'){
    // 물방울: 아래는 반지름 1인 공, 위는 반지름 rt인 작은 공, 둘을 잇는 옆선은 두 원에 모두 접하는 직선 → 꺾임 없음
    const R=1,rt=0.24,Hh=1.75,dd=Hh,al=Math.asin((R-rt)/dd),pts=[];
    for(let i=0;i<=20;i++){const a=-Math.PI/2+i/20*(Math.PI/2+al);pts.push(new THREE.Vector2(Math.max(1e-4,R*Math.cos(a)),R*Math.sin(a)))}
    for(let i=1;i<=20;i++){const a=al+i/20*(Math.PI/2-al);pts.push(new THREE.Vector2(Math.max(1e-4,rt*Math.cos(a)),Hh+rt*Math.sin(a)))}
    const g=new THREE.LatheGeometry(pts,48);g.translate(0,-0.5,0);return g}
}
// 장면: set=표정 덮어쓰기, head/body=고개·몸 숙임(°, +가 앞으로), props=[종류, 머리 가운데 기준 [x,y,z], 크기, 기울기°]
const STICKERS=[
 {id:'hello',name:'안녕하세요',set:{eyeType:'happy',mouthType:'smile',blush:true,browAng:-6,handPose:'front'},head:12,body:4,
   props:[['spark',[1.25,0.75,0.4],0.2,10],['spark',[1.55,0.25,0.3],0.12,-15],['spark',[-1.3,0.6,0.3],0.1,20]]},
 {id:'thanks',name:'감사합니다',set:{eyeType:'content',mouthType:'smile',blush:true,browAng:-12},head:26,body:12,
   props:[['heart',[1.2,0.85,0.4],0.2,-14],['heart',[1.5,0.35,0.2],0.13,12],['heart',[-1.3,0.8,0.3],0.11,16]]},
 {id:'sorry',name:'죄송합니다',set:{eyeType:'dot',mouthType:'flat',blush:false,browAng:-30,tuck:true},head:16,body:6,
   props:[['sweat',[0.62,0.3,0.82],0.13,0]]},
 {id:'good',name:'좋아요',set:{eyeType:'happy',mouthType:'open',blush:true,browAng:-6},head:-4,body:0,
   props:[['thumb',[1.5,0.2,0.35],0.42,0],['spark',[1.15,0.95,0.3],0.1,10],['spark',[1.9,0.75,0.2],0.08,-12]]},
 {id:'heart',name:'하트',set:{eyeType:'content',mouthType:'smile',blush:true,browAng:-12,handPose:'front'},head:6,body:2,
   props:[['heart',[0,-1.02,1.05],0.42,0],['heart',[1.25,0.75,0.3],0.12,-14],['heart',[-1.3,0.55,0.3],0.09,14]]},
 {id:'what',name:'물음표',set:{eyeType:'dot',mouthType:'o',blush:false,browAng:-10,tilt:-1},head:0,body:0,
   props:[['quest',[1.6,0.95,0.2],0.46,10]]},
 {id:'going',name:'가는 중',set:{eyeType:'squint',mouthType:'open',blush:true,browAng:20,legSwingL:28,legSwingR:-24},head:-4,body:8,yaw:-38,
   props:[['cloud',[-1.15,-1.95,-0.6],0.36,0],['cloud',[-1.75,-1.75,-0.9],0.24,0],['line',[-1.55,-0.55,-0.4],0.5,0],['line',[-1.75,-0.95,-0.4],0.36,0],['sweat',[0.75,0.4,0.6],0.1,0]]},
 {id:'eating',name:'밥 먹는 중',set:{eyeType:'content',mouthType:'munch',blush:true,browAng:-10,sit:true,armRaiseR:22,armFwdR:35,armRaiseL:22,armFwdL:35},head:6,body:0,
   props:[['bowl',[0,-1.05,1.05],0.42,0],['rice',[0,-1.0,1.05],0.42,0],['spoon',[0.62,-0.75,1.15],0.42,-25]]},
 {id:'kkk',name:'킥킥',set:{eyeType:'content',mouthType:'smirk',blush:true,browAng:-14,tilt:-1},head:0,body:0,
   props:[['spark',[1.3,0.75,0.3],0.1,8],['spark',[1.55,0.35,0.3],0.07,-12],['spark',[-1.35,0.9,0.2],0.07,15]]},
 {id:'haha',name:'하하',set:{eyeType:'happy',mouthType:'open',mouthW:1.6,blush:true,browAng:-8},head:-16,body:-6,
   props:[['tear',[0.5,0.02,0.92],0.07,0],['tear',[-0.5,0.02,0.92],0.07,0],['spark',[1.3,0.8,0.2],0.1,10],['spark',[-1.3,0.85,0.2],0.09,-10]]},
 {id:'doubt',name:'의심',set:{eyeType:'line',mouthType:'flat',blush:false,browAng:18,browAsym:30,headYaw:14},head:0,body:0,yaw:-8,
   props:[['dot',[1.05,0.95,0.3],0.07,0],['dot',[1.3,0.95,0.3],0.07,0],['dot',[1.55,0.95,0.3],0.07,0]]},
 {id:'proud',name:'우쭐',set:{eyeType:'content',mouthType:'smirk',blush:true,browAng:-4},head:-14,body:-5,
   props:[['spark',[1.25,0.95,0.3],0.16,10],['spark',[1.6,0.45,0.3],0.09,-12],['spark',[-1.3,0.9,0.3],0.12,14]]},
];
function renderSticker(def,S=512){
  const keep={...P},pr=renderer.getPixelRatio();
  Object.assign(P,def.set||{});rebuild(true);
  const c=chars[0],HG=c.userData.HG;
  c.rotation.set((def.body||0)*D2Rs,(def.yaw||0)*D2Rs,0,'YXZ');if(HG)HG.rotation.x+=(def.head||0)*D2Rs;
  c.updateMatrixWorld(true);
  const hc=HG?HG.localToWorld(new THREE.Vector3(0,0.68*P.headH*0.75,0)):new THREE.Vector3(0,charH*0.65,0);
  const G=new THREE.Group(),made=[];
  (def.props||[]).forEach(([t,o,sc,rz])=>{const g=propGeo(t),mt=clay(PROP_COL[t]);made.push(g,mt);const m=new THREE.Mesh(g,mt);
    const yw=(def.yaw||0)*D2Rs,ox=o[0]*Math.cos(yw)+o[2]*Math.sin(yw),oz=-o[0]*Math.sin(yw)+o[2]*Math.cos(yw);
    m.scale.setScalar(sc);m.position.set(hc.x+ox,hc.y+o[1],hc.z+oz);m.rotation.z=(rz||0)*D2Rs;G.add(m)});
  scene.add(G);
  // 캐릭터+소품이 정사각형 안에 꽉 차되 여백 8%
  const bb=new THREE.Box3().setFromObject(c).union(new THREE.Box3().setFromObject(G)),sp=bb.getBoundingSphere(new THREE.Sphere());
  const cam=new THREE.PerspectiveCamera(26,1,0.1,80),dist=sp.radius/Math.sin(13*D2Rs)*0.94;
  cam.position.set(sp.center.x,sp.center.y+dist*0.12,sp.center.z+dist);cam.lookAt(sp.center);
  renderer.setPixelRatio(1);renderer.setSize(S*2,S*2,false);renderer.render(scene,cam);
  const out=document.createElement('canvas');out.width=out.height=S;const x=out.getContext('2d');
  x.fillStyle='#ffffff';x.fillRect(0,0,S,S);x.drawImage(renderer.domElement,0,0,S,S);   // 카톡은 투명 바탕을 흰색으로 보여 주므로 처음부터 흰 바탕
  scene.remove(G);made.forEach(o=>o.dispose());
  Object.keys(P).forEach(k=>delete P[k]);Object.assign(P,keep);rebuild(true);renderer.setPixelRatio(pr);layout();
  return out;
}
