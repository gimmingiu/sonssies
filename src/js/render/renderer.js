// ---------- 렌더러 ----------
const canvas=document.getElementById('c'),stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff,0xb9c9cf,0.8));
const key=new THREE.DirectionalLight(0xffffff,1.05);key.position.set(3,7,6);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-10,right:10,top:9,bottom:-4,near:0.5,far:30});key.shadow.bias=-0.0006;
scene.add(key);
const rim=new THREE.DirectionalLight(0xdff6ff,0.35);rim.position.set(-4,3,-4);scene.add(rim);

const noiseTex=(()=>{const s=256,cv=document.createElement('canvas');cv.width=cv.height=s;const x=cv.getContext('2d');const d=x.createImageData(s,s);
  for(let i=0;i<s*s;i++){const v=118+Math.random()*20;d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255}
  x.putImageData(d,0,0);x.filter='blur(1.2px)';x.drawImage(cv,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return t})();
const lin=hex=>new THREE.Color(hex).convertSRGBToLinear();
// ---------- 질감 ----------
// 고운 털 결(플러시)·섬유 결(펠트)용 요철 텍스처
const fineTex=(()=>{const n=512,cv=document.createElement('canvas');cv.width=cv.height=n;const x=cv.getContext('2d');const d=x.createImageData(n,n);
  for(let i=0;i<n*n;i++){const v=100+Math.random()*56;d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255}
  x.putImageData(d,0,0);const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,10);return t})();
const feltTex=(()=>{const n=512,cv=document.createElement('canvas');cv.width=cv.height=n;const x=cv.getContext('2d');
  x.fillStyle='#808080';x.fillRect(0,0,n,n);x.lineCap='round';
  for(let i=0;i<5200;i++){const g=Math.random()<0.5?40:215;x.strokeStyle=`rgba(${g},${g},${g},${0.12+Math.random()*0.18})`;x.lineWidth=0.6+Math.random()*1.4;
    const px=Math.random()*n,py=Math.random()*n,a=Math.random()*Math.PI*2,l=6+Math.random()*22;
    x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a+0.6)*l*0.5,py+Math.sin(a+0.6)*l*0.5,px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
  x.filter='blur(0.6px)';x.drawImage(cv,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return t})();
// 질감별 설정: 거칠기, 요철, 반사광 세기, 가장자리 효과
const TEX={
 smooth:{name:'매트',rough:0.9,spec:0.25},
 sofubi:{name:'글로시',rough:0.36,spec:1.0,
         glsl:'outgoingLight+=diffuseColor.rgb*pow(rimF,3.0)*0.08;'},
};
const curTex=()=>TEX[P.tex]||TEX.smooth;
function texFix(sh,t){
  sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directSpecular*='+t.spec.toFixed(3)+';reflectedLight.indirectSpecular*='+t.spec.toFixed(3)+';');
  if(t.glsl)sh.fragmentShader=sh.fragmentShader.replace('#include <output_fragment>','float rimF=1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0);\n'+t.glsl+'\n#include <output_fragment>');
}
// fixed=true: 눈·눈썹·입처럼 질감과 상관없이 고정된 재질 / bump=false: 귓바퀴처럼 요철만 빼는 경우
function clay(hex,rough,bump=true,fixed=false){
  const t=fixed?{rough:rough||0.75,spec:0.35}:curTex(), useB=bump&&t.bump;
  const o={color:lin(hex),roughness:t.rough,metalness:t.metal||0};
  if(useB){o.bumpMap=t.bump==='fine'?fineTex:t.bump==='felt'?feltTex:noiseTex;o.bumpScale=t.bs}
  const m=new THREE.MeshStandardMaterial(o);m.userData.tex=t;
  m.onBeforeCompile=sh=>texFix(sh,t);
  const key=(fixed?'fx':P.tex)+(useB?'b':'s');m.customProgramCacheKey=()=>'clay'+key;m.userData.key=key;
  return m}

// 같은 덩어리 위에 색 면을 칠하는 재질 (경계는 셰이더에서 매끈한 곡선으로 계산)
const MASK_GLSL={
 1:`vec3 q=vec3(abs(vLocal.x),vLocal.y,vLocal.z);float m=0.0;
  bool rs=vLocal.x>=0.0;
  float av=vArm-0.5; float armM=clamp(av/max(fwidth(av),1e-4)+0.5,0.,1.);
  float la=rs?uLegAL:uLegAR; float yl=uLegY+(q.y-uLegY)*cos(la)-(q.z-uLegZ)*sin(la);
  float a1=uSit>0.5?(q.z-uFootZ):(uSole-yl); float fm=clamp(a1/max(fwidth(a1),1e-4)+0.5,0.,1.)*(1.0-armM);
  if(uSit>0.5)fm*=step(q.y,uFootY); m=max(m,fm);
  vec2 bd0=vec2(vLocal.x,vLocal.y-uWaist); float bc=cos(uBend),bs=sin(uBend);
  vec3 va=vec3(bd0.x*bc+bd0.y*bs,uWaist-bd0.x*bs+bd0.y*bc,vLocal.z);   // 윗몸 굽힘을 되돌린 좌표(팔은 통째로 따라감)
  bool ra2=va.x>=0.0; vec3 qa=vec3(abs(va.x),va.y,va.z);
  vec3 uS=ra2?uSL:uSR; vec3 uD=ra2?uDL:uDR; vec3 uE=ra2?uEL:uER; float uHS=ra2?uHSL:uHSR;
  vec3 pp=qa-uS; float pr=dot(pp,uD);
  float a2=pr-uHS; m=max(m,clamp(a2/max(fwidth(a2),1e-4)+0.5,0.,1.)*step(length(qa-uE),uHR)*armM);
  float tv=vTail-0.5; m=max(m,clamp(tv/max(fwidth(tv),1e-4)+0.5,0.,1.));
  float ao=1.0;`,
 2:`float u=uSide*vLocal.x; float e=(u*u)/(uRu*uRu)+(vLocal.y*vLocal.y)/(uRv*uRv);
  float a1=uLim-e; float m=clamp(a1/max(fwidth(a1),1e-4)+0.5,0.,1.)*step(0.0,vLocal.z)*step(0.001,uRu);float ao=1.0;`,
 3:`float m=0.0; vec3 bq=(vLocal-uBC)/uBR; float bd=(length(bq)-1.)*min(uBR.x,min(uBR.y,uBR.z)); float ao=mix(0.66,1.,smoothstep(0.,0.14,bd));`
};
const MASK_DECL={
 1:'uniform vec3 uSL;uniform vec3 uDL;uniform float uHSL;uniform vec3 uEL;uniform vec3 uSR;uniform vec3 uDR;uniform float uHSR;uniform vec3 uER;uniform float uHR;uniform float uSole;uniform float uSit;uniform float uFootZ;uniform float uFootY;uniform float uLegY;uniform float uLegZ;uniform float uLegAL;uniform float uLegAR;uniform float uBend;uniform float uWaist;varying float vArm;varying float vTail;uniform vec3 uHC;uniform vec3 uHRad;uniform float uHE;',
 2:'uniform float uSide;uniform float uRu;uniform float uRv;uniform float uLim;',
 3:'uniform vec3 uBC;uniform vec3 uBR;'
};
function maskMat(hex,mode,U,bump){
  const m=clay(hex,undefined,bump);
  m.extensions={derivatives:true};
  const uni={uColB:{value:lin('#f5f9f8')}};for(const k in U)uni[k]={value:U[k]};
  m.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,uni);
    const va=mode===1?'attribute float aArm;varying float vArm;attribute float aTail;varying float vTail;':'';
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLocal;'+va).replace('#include <begin_vertex>','#include <begin_vertex>\nvLocal=position;'+(mode===1?'vArm=aArm;vTail=aTail;':''));
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLocal;uniform vec3 uColB;'+MASK_DECL[mode])
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',MASK_GLSL[mode]+'\nvec4 diffuseColor = vec4( mix(diffuse,uColB,m), opacity );diffuseColor.rgb*=ao;');
  };
  const _ob=m.onBeforeCompile,t=m.userData.tex,key=m.userData.key;m.onBeforeCompile=sh=>{_ob(sh);texFix(sh,t)};
  m.customProgramCacheKey=()=>'mask'+mode+key;
  return m;
}

