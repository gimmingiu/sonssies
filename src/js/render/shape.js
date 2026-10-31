// ---------- 형태 도구 ----------
function blob(a,b,c,e=0.6,taper=0,seg=48){
  const g=new THREE.SphereGeometry(1,seg,Math.round(seg*0.75));const p=g.attributes.position;
  const f=v=>Math.sign(v)*Math.pow(Math.abs(v),e);
  for(let i=0;i<p.count;i++){const x=f(p.getX(i)),y=f(p.getY(i)),z=f(p.getZ(i));const t=1+taper*(-y);p.setXYZ(i,x*a*t,y*b,z*c*(1+taper*.5*(-y)))}
  g.computeVertexNormals();return g}
function capsule(len,r){
  const h=Math.max(0,len/2-r),pts=[];
  for(let i=0;i<=10;i++){const t=-Math.PI/2+i/10*Math.PI/2;pts.push(new THREE.Vector2(r*Math.cos(t)+1e-4,-h+r*Math.sin(t)))}
  for(let i=0;i<=10;i++){const t=i/10*Math.PI/2;pts.push(new THREE.Vector2(r*Math.cos(t)+1e-4,h+r*Math.sin(t)))}
  const g=new THREE.LatheGeometry(pts,24);g.rotateZ(Math.PI/2);return g}
function arcStroke(R,tr,arc,mat){
  const mg=new THREE.Group();
  const tor=mesh(new THREE.TorusGeometry(R,tr,12,28,arc),mat);tor.rotation.z=(Math.PI-arc)/2;tor.scale.z=0.75;mg.add(tor);
  for(const a of[(Math.PI-arc)/2,(Math.PI+arc)/2]){const cap=mesh(new THREE.SphereGeometry(tr,12,10),mat);cap.scale.z=0.75;cap.position.set(R*Math.cos(a),R*Math.sin(a),0);mg.add(cap)}
  const o=new THREE.Group();o.add(mg);mg.position.y=-(R+R*Math.sin((Math.PI-arc)/2))/2;return o}
// 입 곡률: c=0 일자(직선) → c=1 미소(반원) → c=2 동그란 'o'. 양 끝 폭은 유지하다가 반원 이후엔 고리처럼 닫힘
function curveMouth(R,tr,c,mat){
  c=Math.max(0,Math.min(2,c));const g=new THREE.Group();
  let pts=[];
  if(c<0.02){for(let i=0;i<=8;i++)pts.push(new THREE.Vector3(-R+2*R*i/8,0,0))}
  else{
    const th=Math.PI*c, r=c<=1?R/Math.sin(th/2):R;
    for(let i=0;i<=48;i++){const a=-Math.PI/2-th/2+th*i/48;pts.push(new THREE.Vector3(r*Math.cos(a),r*Math.sin(a),0))}
    const ys=pts.map(p=>p.y),mid=(Math.min(...ys)+Math.max(...ys))/2;pts.forEach(p=>p.y-=mid);
  }
  const closed=c>1.97;
  const curve=new THREE.CatmullRomCurve3(closed?pts.slice(0,-1):pts,closed);
  const tube=mesh(new THREE.TubeGeometry(curve,closed?64:48,tr,10,closed),mat);tube.scale.z=0.75;g.add(tube);
  if(!closed)for(const p of[pts[0],pts[pts.length-1]]){const cap=mesh(new THREE.SphereGeometry(tr,12,10),mat);cap.scale.z=0.75;cap.position.copy(p);g.add(cap)}
  return g}
function mesh(geo,mat){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth01=(a,b,v)=>{let t=(v-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t)};

