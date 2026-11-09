(function(root){
'use strict';
const strips=[
 ['bottom','networking',[17,143,2156,620]],
 ['top','deference',[12,127,2161,623]],
 ['left','favors',[17,128,2156,653]],
 ['right','procedure',[19,173,2156,651]]
];
root.URStartScreen=function({ready,onBegin}){
 const t=value=>root.URI18n?.t(value)||value;
 const overlay=document.querySelector('#startOverlay');overlay.setAttribute('aria-label','Under Review');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
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
 const button=overlay.querySelector('#startGame'),status=overlay.querySelector('#startStatus');
 const stage=document.querySelector('#stage');stage.inert=true;
 const cache=new Map();let complete=0;
 const visuals=[...new Set([...(root.URVisualPreload||[]),...images])];
 function load(src){if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=async()=>{try{await img.decode();complete++;status.textContent=t('Preparing the office…')+' '+Math.round(complete/visuals.length*100)+'%';resolve()}catch(error){reject(error)}};img.onerror=()=>reject(Error(src));img.src=src}).catch(error=>{cache.delete(src);throw error}));return cache.get(src)}
 let prepared=false,loading=false,failed=false;
 async function prepare(){
  if(loading)return;loading=true;button.disabled=true;
  try{
   const frameReady=Promise.all([...images.map(load),document.fonts.ready,document.fonts.load('24px "UR Checklist Han"','核对清单'),document.fonts.load('24px "Patrick Hand"') ]).then(async()=>{fitRows();await Promise.all([...overlay.querySelectorAll('.startStrip img')].map(img=>img.decode()));overlay.dataset.frameReady='true'});
   await Promise.all([ready,frameReady,...visuals.map(load)]);
   prepared=true;status.textContent='';button.textContent=t('Click to begin');overlay.dataset.ready='true';overlay.setAttribute('aria-busy','false');button.disabled=false;
   if(document.documentElement.classList.contains('returningToStart'))overlay.addEventListener('animationend',()=>document.documentElement.classList.remove('returningToStart'),{once:true});
  }catch{failed=true;document.documentElement.classList.remove('returningToStart');overlay.style.opacity='1';status.textContent=t('Unable to load the artwork. Click to retry.');button.textContent=t('Retry');button.disabled=false}
  finally{loading=false}
 }
 button.onclick=async()=>{if(button.disabled)return;if(failed){location.reload();return}if(!prepared)return;button.disabled=true;try{await onBegin();resize.disconnect();stage.inert=false;document.documentElement.classList.remove('booting');overlay.remove()}catch{stage.inert=true;button.disabled=false;status.textContent=t('Unable to start. Click to retry.')}};
 function translate(){button.textContent=t(failed?'Retry':prepared?'Click to begin':'Loading…');status.textContent=failed?t('Unable to load the artwork. Click to retry.'):prepared?'':t('Preparing the office…')+(complete?' '+Math.round(complete/visuals.length*100)+'%':'')}
 translate();root.addEventListener('ur:language',translate);prepare();return overlay;
};
})(window);
