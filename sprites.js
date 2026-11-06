window.coupleSprites = (() => {
const SIZE=46,SPR=[null,null]; // SIZE = character height in the game (smaller number = smaller characters)
function mip(c,h){
 let cur=c;
 while(cur.height>h*2){const t=document.createElement('canvas');t.width=Math.round(cur.width/2);t.height=Math.round(cur.height/2);const tx=t.getContext('2d');tx.imageSmoothingQuality='high';tx.drawImage(cur,0,0,t.width,t.height);cur=t}
 const o=document.createElement('canvas');o.height=h;o.width=Math.round(c.width*h/c.height);
 const x=o.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(cur,0,0,o.width,o.height);return o;
}
function buildSprites(img){
 const sw=800,sh=Math.round(800*img.naturalHeight/img.naturalWidth);
 const c=document.createElement('canvas');c.width=sw;c.height=sh;
 const x=c.getContext('2d');x.drawImage(img,0,0,sw,sh);
 let d;try{d=x.getImageData(0,0,sw,sh)}catch(e){return false}
 const px=d.data,N=sw*sh,bg=[px[0],px[1],px[2]],isBg=new Uint8Array(N),st=[];
 const near=i=>{const o=i*4,a=px[o]-bg[0],b=px[o+1]-bg[1],e=px[o+2]-bg[2];return a*a+b*b+e*e<4900};
 for(let i=0;i<sw;i++)st.push(i,N-sw+i);
 for(let j=0;j<sh;j++)st.push(j*sw,j*sw+sw-1);
 while(st.length){
  const i=st.pop();if(i<0||i>=N||isBg[i]||!near(i))continue;
  isBg[i]=1;const xx=i%sw;if(xx>0)st.push(i-1);if(xx<sw-1)st.push(i+1);st.push(i-sw,i+sw);
 }
 const lab=new Int32Array(N),comps=[];
 for(let s=0;s<N;s++){
  if(isBg[s]||lab[s])continue;
  const id=comps.length+1,q=[s];lab[s]=id;
  let n=0,x0=sw,x1=0,y0=sh,y1=0,sx=0;
  while(q.length){
   const i=q.pop(),xx=i%sw,yy=(i-xx)/sw;n++;sx+=xx;
   if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy;
   if(xx>0&&!isBg[i-1]&&!lab[i-1]){lab[i-1]=id;q.push(i-1)}
   if(xx<sw-1&&!isBg[i+1]&&!lab[i+1]){lab[i+1]=id;q.push(i+1)}
   if(yy>0&&!isBg[i-sw]&&!lab[i-sw]){lab[i-sw]=id;q.push(i-sw)}
   if(yy<sh-1&&!isBg[i+sw]&&!lab[i+sw]){lab[i+sw]=id;q.push(i+sw)}
  }
  comps.push({id,n,x0,x1,y0,y1,cx:sx/n});
 }
 comps.sort((a,b)=>b.n-a.n);
 const two=comps.slice(0,2);if(two.length<2)return false;
 two.sort((a,b)=>a.cx-b.cx);
 two.forEach((k,j)=>{
  const w=k.x1-k.x0+1,h=k.y1-k.y0+1,o=document.createElement('canvas');o.width=w;o.height=h;
  const ox=o.getContext('2d'),od=ox.createImageData(w,h);
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const i=(yy+k.y0)*sw+xx+k.x0;
   if(lab[i]===k.id){const a=i*4,b=(yy*w+xx)*4;od.data[b]=px[a];od.data[b+1]=px[a+1];od.data[b+2]=px[a+2];od.data[b+3]=255}
  }
  ox.putImageData(od,0,0);SPR[j]=[mip(o,64),mip(o,150)];
 });
 return true;
}
function tryImg(src,ok,fail){const im=new Image();im.onload=()=>buildSprites(im)?ok():fail();im.onerror=fail;im.src=src}

let saved;
try { saved = localStorage.getItem('ak_chars'); } catch {}
const ready = new Promise(resolve => {
  const finish = () => resolve(SPR);
  tryImg('characters.png', finish, () => saved ? tryImg(saved, finish, finish) : finish());
});
return { SPR, ready };
})();
