(function(root){
'use strict';
const strips=[
 ['bottom','networking',[17,143,2156,620]],
 ['top','deference',[12,127,2161,623]],
 ['left','favors',[17,128,2156,653]],
 ['right','procedure',[19,173,2156,651]]
];
root.URStartScreen=function({ready,onBegin}){
 const overlay=document.createElement('section');overlay.id='startOverlay';overlay.setAttribute('aria-label','Under Review');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
 const frame=document.createElement('div');frame.className='startFrame';frame.setAttribute('aria-hidden','true');overlay.append(frame);
 const images=[];
 const edgeRows=[];
 for(const [edge,name,box] of strips){
  const strip=document.createElement('div');strip.className='startStrip '+edge;strip.setAttribute('aria-hidden','true');
  const src='assets/loading-border-v1/'+name+'.png';overlay.append(strip);edgeRows.push({strip,src,box});images.push(src);
 }
 function fitRows(){
  for(const {strip,src,box} of edgeRows){
   const [x,y,right,bottom]=box,w=right-x,h=bottom-y,ratio=w/h;
   const length=strip.clientWidth,depth=strip.clientHeight;
   const count=Math.max(1,Math.round(length/(depth*ratio)));
   const tileWidth=Math.min(length/count,depth*ratio),tileHeight=tileWidth/ratio;
   strip.replaceChildren();
   for(let i=0;i<count;i++){
    const tile=document.createElement('span');tile.className='startStripTile';tile.style.width=tileWidth+'px';tile.style.height=tileHeight+'px';
    const img=new Image();img.alt='';img.src=src;img.style.width=2172/w*100+'%';img.style.height=724/h*100+'%';img.style.left=-x/w*100+'%';img.style.top=-y/h*100+'%';tile.append(img);strip.append(tile);
   }
  }
 }
 const resize=new ResizeObserver(fitRows);resize.observe(overlay);fitRows();
 const centre=document.createElement('div');centre.className='startCentre';
 const title=document.createElement('h1');title.textContent='UNDER REVIEW';
 const button=document.createElement('button');button.id='startGame';button.textContent='Click to begin';button.disabled=true;
 const status=document.createElement('p');status.id='startStatus';status.setAttribute('role','status');status.textContent='Preparing the office…';
 centre.append(title,button,status);overlay.append(centre);document.body.append(overlay);
 const stage=document.querySelector('#stage');stage.inert=true;
 function load(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>reject(Error(src));img.src=src})}
 let prepared=false,loading=false;
 async function prepare(){
  if(loading)return;loading=true;button.disabled=true;
  try{await Promise.all([ready,document.fonts.ready,...images.map(load)]);prepared=true;status.textContent='';overlay.dataset.ready='true';button.disabled=false;if(document.documentElement.classList.contains('returningToStart')){overlay.addEventListener('animationend',()=>document.documentElement.classList.remove('returningToStart'),{once:true})}}
  catch{document.documentElement.classList.remove('returningToStart');status.textContent='Unable to load the artwork. Click to retry.';button.disabled=false;}
  finally{loading=false}
 }
 button.onclick=async()=>{if(button.disabled)return;if(!prepared){prepare();return}button.disabled=true;stage.inert=false;try{await onBegin();resize.disconnect();overlay.remove()}catch{stage.inert=true;button.disabled=false;status.textContent='Unable to start. Click to retry.'}};
 prepare();return overlay;
};
})(window);
