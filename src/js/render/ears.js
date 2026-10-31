// ---------- 귀 지오메트리 ----------
// 원점 = 머리와 귀가 만나는 선. 안쪽(머리 쪽)은 지금 각도 유지, 바깥 윤곽은 원에 가깝게.
function earGeo(s){
  const ea=0.3,eaOut=0.335,eb=0.4,ec=0.17,off=0.18;
  const inner=Math.min(P.earInnerW,P.earInnerH), ru=0.06+0.27*P.earInnerW, rv=0.12+0.24*P.earInnerH, dent=0.065*Math.min(1,inner*1.5);
  const g=new THREE.SphereGeometry(1,96,72),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x0=p.getX(i),y0=p.getY(i),z0=p.getZ(i);
    let t=(s*x0+0.25)/0.85;t=t<0?0:t>1?1:t;t=t*t*(3-2*t);
    const e=0.75+0.25*t, a=ea+(eaOut-ea)*t;
    const f=v=>Math.sign(v)*Math.pow(Math.abs(v),e);
    let x=f(x0)*a+s*off, y=f(y0)*eb, z=f(z0)*ec;
    const u=s*x, d2=(u/ru)**2+(y/rv)**2;
    if(z>0&&d2<1&&inner>0.01){const w=1-d2;z-=dent*(w*w*(3-2*w))*Math.min(1,z/(ec*0.5))}
    p.setXYZ(i,x,y,z);
  }
  g.computeVertexNormals();
  return {geo:g,U:{uSide:s,uRu:inner>0.01?ru:0,uRv:rv,uLim:0.86}};
}

