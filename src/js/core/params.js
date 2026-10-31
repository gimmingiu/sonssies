// ---------- 파라미터 정의 ----------
const GROUPS=[
 ['뿔',[['hornH','길이',0.6,2,0.75],['hornRound','두께',0,1,0.6],['hornX','간격',0.54,0.8,0.6]]],
 ['머리',[['headW','너비',0.8,1.25,1],['headH','높이',0.8,1.25,1],['headD','두께',0.75,1.25,1],['headSq','모양',0,1,0.5]]],
 ['눈썹',[['browLen','길이',0.08,0.34,0.19],['browAng','각도',-40,60,0,1],['browThick','두께',0.012,0.05,0.022],['browY','높이',0.05,0.5,0.24]]],
 ['눈',[['eyeSize','크기',0.5,1.9,1],['eyeX','간격',0.18,0.55,0.33],['eyeY','높이',-0.3,0.25,-0.03]]],
 ['귀',[['earSize','크기',0.6,1.45,1],['earY','높이',-0.176,0.084,-0.06]]],
 ['코',[['noseSize','크기',0.5,1.7,1],['noseSq','모양',0,1,0.5],['noseY','위치',-0.3,0.1,-0.09]]],
 ['입',[['mouthW','너비',0.5,2.2,1],['mouthCurve','곡률',0,2,1],['mouthY','높이',-0.5,-0.14,-0.324]]],
 ['몸',[['bodyLen','길이',0.6,1.5,1],['upperW','너비',0.75,1.4,1],['bodyD','두께',0.75,1.3,1],['lowerRatio','허리',0.3,0.7,0.5]]],
 ['팔',[['armLen','길이',0.6,1.6,0.76],['armThick','두께',0.7,1.6,1.4]]],
 ['볼',[['blushY','위치',-0.1,0.1,0],['cheek','볼살',0,1,0]]],
 ['다리',[['legSplit','길이',0.15,0.95,0.42],['legThick','두께',0.7,1.4,1]]],
 ['꼬리',[['tailSize','크기',0.5,1,1],['tailW','너비',1,1.8,1]]],
 ['포즈',[]],
];
const DEF={browAsym:0,handPose:'',tailSq:0,hornSize:1,hornTilt:8,browX:0.25,earSpread:0,lowerW:1,blushColor:'#f6b3a9',horns:true,blush:false,tail:true,tex:'smooth',color:'#a9e4f0',eyeType:'dot',mouthType:'smile',sit:false,tuck:false,footSize:2,legGap:0.05,handSize:1,earInnerH:0.6,earInnerW:0.85,tailShape:'round',tailLen:1,tailY:0,tailTilt:15,tailBlend:0.35,armRaiseR:6,armFwdR:0,armRaiseL:6,armFwdL:0,legSwingR:0,legSwingL:0,headPitch:0,headYaw:0,tilt:0};
const EXPR_KEYS=['eyeType','mouthType','blush'];   // 랜덤에서만 표정 조합으로 씀
const POSE_KEYS=['tilt','tuck','legSwingR','legSwingL','armRaiseR','armFwdR','armRaiseL','armFwdL','headPitch','headYaw','sit'];
const POSES={
 '기본':{},
 '차렷':{tuck:true},
 '앉기':{sit:true,armRaiseR:22,armFwdR:35,armRaiseL:22,armFwdL:35},
 '갸우뚱':{tilt:-1},
};
const EXPRS={
 '기본':{eyeType:'dot',mouthType:'smile',blush:false},
 '웃음':{eyeType:'happy',mouthType:'open',blush:true},
 '뿌듯':{eyeType:'content',mouthType:'smirk',blush:true},
 '신남':{eyeType:'squint',mouthType:'open',blush:true},
 '냠냠':{eyeType:'squint',mouthType:'munch',blush:true},
 '당황':{eyeType:'dot',mouthType:'flat',blush:true},
 '놀람':{eyeType:'wide',mouthType:'o',blush:false},
 '졸림':{eyeType:'line',mouthType:'flat',blush:false},
};
const META={};
GROUPS.forEach(([,rows])=>rows.forEach(([k,l,mn,mx,d,st])=>{DEF[k]=d;META[k]={mn,mx,st:st||(mx-mn)/200}}));
const P={...DEF};

const PRESETS={
 '깨두':{color:'#37c3dc',browAng:48,eyeSize:0.6,eyeX:0.27,eyeY:0.026,browLen:0.124,browThick:0.016},   // 눈 크기 -4 · 간격 -2 · 높이 +1, 눈썹 길이 -3 · 두께 -3, 각도 48°
 '꼬마':{color:'#1ec850',blush:true,browAng:48,headW:0.96,headH:0.92,bodyLen:0.6,upperW:0.92,lowerW:0.95,armLen:0.6,legSplit:0.258,eyeSize:0.9,eyeX:0.36,hornSize:0.8,hornRound:1,earSize:1.1,browLen:0.15},
 '꼼디':{color:'#c8e628',headW:1.2,headD:1.15,headSq:0.25,upperW:1.3,lowerW:1.42,bodyD:1.22,armThick:1.35,handSize:1.2,earSize:1.0,hornSize:1.15,mouthW:1.5,eyeX:0.4,legSplit:0.3,eyeType:'line',mouthType:'flat',eyeSize:1.9,browLen:0.2,browAng:24},
};

