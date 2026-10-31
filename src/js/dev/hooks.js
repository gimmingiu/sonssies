window.__dkSticker=id=>renderSticker(STICKERS.find(s=>s.id===id)).toDataURL('image/png');
window.__dkApply=o=>apply(o,true);
window.__dkHead=(px=1024,headOnly=true,span=1.6,dy=0,layer='')=>{   // 정면 머리 렌더(아이콘·파비콘·인트로용). layer: ''=전부, 'base'=귀·뿔 뺀 머리, 'ear-1'/'ear1'/'horn'=그 부분만
  const c=chars[0],HG=c.userData.HG;angle=0;c.rotation.y=0;c.updateMatrixWorld(true);
  const vis=c.children.map(o=>o.visible);if(headOnly)c.children.forEach(o=>{o.visible=(o===HG)});
  const tv=[];if(layer)HG.traverse(o=>{if(!o.isMesh)return;tv.push([o,o.visible]);let pt=null,q=o;while(q&&q!==HG){if(q.userData.part){pt=q.userData.part;break}q=q.parent}o.visible=layer==='base'?!pt:pt===layer});
  const hv=new THREE.Vector3();HG.getWorldPosition(hv);hv.y+=0.68*P.headH*0.75+dy;
  const pr=renderer.getPixelRatio(),fov=persp.fov,asp=persp.aspect,pos=persp.position.clone(),q=persp.quaternion.clone();
  renderer.setPixelRatio(1);renderer.setSize(px,px,false);persp.aspect=1;persp.fov=10;
  const d=span/2/Math.tan(5*Math.PI/180);persp.position.set(0,hv.y,hv.z+d);persp.lookAt(0,hv.y,hv.z);persp.updateProjectionMatrix();
  renderer.render(scene,persp);const u=renderer.domElement.toDataURL('image/png');
  tv.forEach(([o,v])=>{o.visible=v});c.children.forEach((o,i)=>{o.visible=vis[i]});persp.fov=fov;persp.aspect=asp;persp.position.copy(pos);persp.quaternion.copy(q);persp.updateProjectionMatrix();
  renderer.setPixelRatio(pr);layout();return u};
window.__dkChar=(q=1)=>{angle=0;return renderChar(q).img.toDataURL('image/png')};
