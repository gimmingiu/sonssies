// == 이름 로마자 바꾸기(저장 파일 이름용)
// 국어의 로마자 표기법(문화체육관광부 고시)에 따라 이름을 로마자로: 받침 연음, ㄹㄹ→ll, 받침 대표음 규칙 적용
function romanize(str){
  const I=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const V=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  const F=['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
  // 받침이 다음 음절 첫소리로 넘어갈 때(연음)의 초성 인덱스
  const FI=[-1,0,1,-2,2,-2,-2,3,5,-2,-2,-2,-2,-2,-2,-2,6,7,-2,9,10,-1,12,14,15,16,17,18];
  const syl=[];let out='';
  for(const ch of str){const c=ch.charCodeAt(0);
    if(c>=0xAC00&&c<=0xD7A3){const k=c-0xAC00;syl.push({i:Math.floor(k/588),v:Math.floor((k%588)/28),f:k%28})}
    else syl.push({raw:/[A-Za-z0-9]/.test(ch)?ch.toLowerCase():''});}
  for(let n=0;n<syl.length;n++){const a=syl[n],b=syl[n+1];
    if(a.raw!==undefined){out+=a.raw;continue}
    let f=a.f,init=I[a.i];
    if(n>0&&syl[n-1].moved!==undefined)init=I[syl[n-1].moved];
    out+=init+V[a.v];
    if(f&&b&&b.raw===undefined&&b.i===11&&FI[f]>=0){a.moved=FI[f];continue}          // 연음: 받침이 다음 'ㅇ' 자리로
    if(f===8&&b&&b.raw===undefined&&b.i===5){out+='l';continue}                        // ㄹ+ㄹ → ll
    out+=F[f];
  }
  out=out.replace(/lr/g,'ll');
  return out?out[0].toUpperCase()+out.slice(1):'';
}
