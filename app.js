document.documentElement.dataset.grade=new URLSearchParams(location.search).get('grade')==='original'?'original':'muted';
const record=window.RECORD_CONTENT;const blankMode=new URLSearchParams(location.search).has('blank');
const $=s=>document.querySelector(s);
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
const assets={};
let inspectionConfig={enabled:false,headMm:32,heightMm:45,minHeadMm:32,maxHeadMm:45,targetMm:32};
let toolStart=null;
function foley(key,delay=0){window.dispatchEvent(new CustomEvent('ur:foley',{detail:{key,delay}}))}
let recordOpacity=1,recordFade=null;
function fadeRecord(target,duration=850){
 const now=performance.now();recordFade={from:recordOpacity,to:target,start:now,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:duration};
 if(!recordFade.duration){recordOpacity=target;recordFade=null}draw();
}
const manualScene=new URLSearchParams(location.search).has('sandbox')||new URLSearchParams(location.search).has('visitor')||blankMode;
const files={practice:'02_candidates/tutorial/anonymous-retro-avatar-v2.png',monitor:'01_confirmed/props/computer_front_closeup.png',photo:'02_candidates/characters/student_idle.png',lens:'02_candidates/original_cutouts/magnifier_original_cutout.png',ruler:'02_candidates/props/ruler.png'};
const photoRect={x:438,y:282,w:153,h:202};
const home={lens:{x:1270,y:430},ruler:{x:120,y:430}};
const state={lens:{...home.lens},ruler:{...home.ruler},measured:false,drag:null,offset:{x:0,y:0},moved:false};
function image(key){return assets[key]}
const baseAssetsReady=Promise.all(Object.entries(files).map(([key,path])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{assets[key]=img;resolve()};img.onerror=()=>{console.error('Asset unavailable: '+path);window.dispatchEvent(new CustomEvent('ur:asset-error',{detail:path}));resolve()};img.src='assets/'+path}))).then(draw);
function photoGeometry(){const top=photoRect.y+photoRect.h*.05;return{top,chin:top+photoRect.h*inspectionConfig.headMm/inspectionConfig.heightMm,target:top+photoRect.h*inspectionConfig.targetMm/inspectionConfig.heightMm}}
function paintPhoto(){
 const p=photoRect,img=image('photo');ctx.fillStyle='#30423f';ctx.fillRect(p.x,p.y,p.w,p.h);
 if(inspectionConfig.practice){
  const avatar=image('practice'),g=photoGeometry();
  // Generated portrait anchors: crown 98, chin 925, centre 572 (1145 × 1374).
  // Use the same physical head span as the measurement guides, without stretching.
  const scale=(g.chin-g.top)/(925-98);
  ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,p.h);ctx.clip();
  ctx.fillStyle='#1009f4';ctx.fillRect(p.x,p.y,p.w,p.h);
  if(avatar)ctx.drawImage(avatar,p.x+p.w/2-572*scale,g.top-98*scale,avatar.naturalWidth*scale,avatar.naturalHeight*scale);
  ctx.restore();return;
 }
 if(inspectionConfig.portrait){
  // One source crown/chin pair defines both the rendered face and all measurement lines.
  const crown=inspectionConfig.sourceCrownY??34,chin=inspectionConfig.sourceChinY??688,bodyEnd=inspectionConfig.sourceBodyEndY??1000,scale=(photoGeometry().chin-photoGeometry().top)/(chin-crown);
  const dx=p.x+p.w/2-(inspectionConfig.sourceCenterX??680)*scale,dy=photoGeometry().top-crown*scale,dw=img.naturalWidth*scale;
  ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,p.h);ctx.clip();
  ctx.drawImage(img,0,0,img.naturalWidth,bodyEnd,dx,dy,dw,bodyEnd*scale);
  const edge=dy+bodyEnd*scale;if(edge<p.y+p.h)ctx.drawImage(img,0,bodyEnd-2,img.naturalWidth,2,dx,edge,dw,p.y+p.h-edge);
  ctx.restore();return;
 }
 const crops={student:[220,24,1080,1000],young:[390,25,1146,830],uncle:[210,0,1326,865],alex:[225,65,1085,1010],boss:[90,5,1220,1025]};
 const [left,top,right,bottom]=crops[currentKey||'student'];const sh=bottom-top,sw=Math.min(right-left,sh*p.w/p.h),sx=(left+right-sw)/2;
 ctx.drawImage(img,sx,top,sw,sh,p.x,p.y,p.w,p.h);
}
function measurementOverlay(){
 if(!inspectionConfig.enabled)return;
 const g=photoGeometry(),p=photoRect,correct=inspectionConfig.headMm>=inspectionConfig.targetMm;
 ctx.save();ctx.lineWidth=1.5;
 function guide(y,color,dashed=false){ctx.strokeStyle=color;ctx.setLineDash(dashed?[4,3]:[]);ctx.beginPath();ctx.moveTo(p.x-5,y);ctx.lineTo(p.x+p.w,y);ctx.stroke()}
 function number(y,value,color){const x=p.x+p.w+5;ctx.setLineDash([]);ctx.fillStyle='#f1e7d8e8';ctx.fillRect(x-2,y+2,46,13);ctx.font='11px '+record.fontFamily;ctx.fillStyle=color;ctx.fillText(value+' mm',x,y+12)}
 if(correct){guide(g.top,'#376b46');guide(g.chin,'#376b46');number(g.chin,inspectionConfig.headMm,'#376b46')}
 else{guide(g.top,'#a94131');guide(g.chin,'#a94131');number(g.chin,inspectionConfig.headMm,'#a94131');guide(g.target,'#376b46',true);number(g.target,inspectionConfig.targetMm,'#376b46')}
 ctx.restore();
}
function tutorialToolGuide(){
 const story=window.URStory?.state;
 if(story?.phase!=='tutorial'||!story.inspectionOpen||!['measure','lens'].includes(story.lessonAction))return;
 const ruler=story.lessonAction==='measure',from=state[ruler?'ruler':'lens'];
 const target=ruler?{x:422,y:388}:{x:photoRect.x+photoRect.w/2,y:photoGeometry().chin};
 ctx.save();ctx.globalAlpha=.35+.15*Math.sin(performance.now()/450);
 if(ruler){ctx.translate(target.x,target.y);ctx.rotate(Math.PI/2);ctx.drawImage(image('ruler'),-190,-63.33,380,126.67)}
 else{ctx.beginPath();ctx.arc(target.x,target.y,62,0,Math.PI*2);ctx.strokeStyle='#344b40';ctx.lineWidth=4;ctx.setLineDash([9,7]);ctx.stroke()}
 ctx.restore();ctx.save();ctx.strokeStyle='#344b40';ctx.lineWidth=3;ctx.setLineDash([8,9]);
 ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.setLineDash([]);
 const angle=Math.atan2(target.y-from.y,target.x-from.x);
 ctx.beginPath();ctx.moveTo(target.x-18*Math.cos(angle-.5),target.y-18*Math.sin(angle-.5));ctx.lineTo(target.x,target.y);ctx.lineTo(target.x-18*Math.cos(angle+.5),target.y-18*Math.sin(angle+.5));ctx.stroke();ctx.restore();
}
function recordText(text,x,y,maxWidth){if(blankMode)return;ctx.fillText(String(text??''),x,y,maxWidth??(x>800?100:520))}
// Independent text and replaceable cover renderers. Hidden text cannot leak around a shorter cover.
function drawFieldText(row,x,y){if(blankMode||!row.revealed)return;ctx.save();ctx.fillStyle=row.textStyle.color;ctx.font=row.textStyle.size+'px '+record.fontFamily;recordText(row.text,x,y,294);ctx.restore()}
function drawFieldMask(row,x,y){if(blankMode||row.revealed)return;const m=row.mask;ctx.save();ctx.font=row.textStyle.size+'px '+record.fontFamily;const hasText=String(row.text??'').length>0;const width=m.autoWidth&&hasText?Math.min(m.maxWidth??294,Math.max(m.minWidth??24,ctx.measureText(String(row.text)).width+2*(m.paddingX??8))):m.width;ctx.fillStyle=m.color;ctx.beginPath();ctx.roundRect(x,y,width,m.height,m.radius);ctx.fill();ctx.restore()}
function updateField(id,patch){const row=record.rows.find(r=>r.id===id);if(!row)throw new Error('Unknown field: '+id);const {mask,textStyle,...values}=patch;Object.assign(row,values);if(mask)Object.assign(row.mask,mask);if(textStyle)Object.assign(row.textStyle,textStyle);draw()}
function scene(){
ctx.drawImage(image('monitor'),240,40,920,841);ctx.save();ctx.beginPath();ctx.roundRect(405,151,590,423,40);ctx.clip();ctx.fillStyle='#263b37';ctx.fillRect(405,151,590,423);
ctx.fillStyle='#f1e5c6';ctx.font='bold 19px '+record.fontFamily;recordText(record.brand,434,185);ctx.font='bold 16px '+record.fontFamily;recordText(record.file,877,184);
ctx.globalAlpha=recordOpacity;ctx.beginPath();ctx.roundRect(419,202,562,348,12);ctx.fillStyle='#f0dfbe';ctx.fill();
ctx.save();ctx.beginPath();ctx.roundRect(419,202,562,348,12);ctx.clip();for(let i=0;i<1800;i++){const x=419+((i*137.53)%562),y=202+((i*63.19)%348);ctx.fillStyle=i%2?'#fff9e712':'#68492208';ctx.fillRect(x,y,1.2,.7)}ctx.restore();
ctx.fillStyle='#292c25';ctx.strokeStyle='#292c25';ctx.lineWidth=1.3;ctx.font='bold 27px '+record.fontFamily;recordText(record.title,434,239,395);ctx.beginPath();ctx.roundRect(844,219,121,28,4);ctx.stroke();ctx.font='bold 17px '+record.fontFamily;recordText(record.status,854,238);
function line(x,y,x2,y2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
line(433,259,966,259);ctx.strokeRect(433,277,163,212);if(!blankMode&&record.showPhoto!==false)paintPhoto();line(604,276,604,491);
ctx.font='bold 17px '+record.fontFamily;recordText(record.nameLabel,616,292);ctx.font='bold 23px '+record.fontFamily;recordText(record.applicantName,616,321,350);line(613,336,966,336);
for(let i=0;i<3;i++){const y=365+i*51,row=record.rows[i];ctx.font='19px '+record.fontFamily;ctx.fillStyle='#292c25';recordText(row.label,621,y+6,30);drawFieldText(row,663,y+6);drawFieldMask(row,663,y-12);if(i<2)line(613,y+26,966,y+26)}
line(433,501,966,501);ctx.fillStyle='#292c25';ctx.font='bold 17px '+record.fontFamily;recordText(record.footer,435,527);for(let i=0;i<3;i++)ctx.strokeRect(905+i*22,514,12,12);ctx.restore()}
// The desk monitor is too small to read: replace its header text with CRT ornament.
function decorateMiniScreen(m){m.save();m.fillStyle='#263b37';m.fillRect(0,0,590,50);m.fillStyle='#c9d8b8';m.globalAlpha=.55;m.fillRect(30,22,74,9);m.fillRect(114,22,30,9);m.globalAlpha=.35;m.fillRect(470,22,22,9);m.fillRect(500,22,22,9);m.fillRect(530,22,22,9);m.globalAlpha=.9;m.fillStyle='#d9e8c4';m.fillRect(154,18,10,15);m.globalAlpha=1;m.fillStyle='#0d1a1626';for(let y=0;y<423;y+=5)m.fillRect(0,y,590,2);const g=m.createRadialGradient(295,211,120,295,211,380);g.addColorStop(0,'#0000');g.addColorStop(1,'#0b141270');m.fillStyle=g;m.fillRect(0,0,590,423);m.restore()}
function draw(){if(!['monitor','photo','lens','ruler'].every(k=>assets[k]))return;ctx.clearRect(0,0,1400,1000);scene();const mini=$('#smallScreen').getContext('2d');mini.clearRect(0,0,590,423);mini.drawImage(canvas,405,151,590,423,0,0,590,423);decorateMiniScreen(mini);if(blankMode)return;const r=state.ruler;if(!window.URStory||inspectionConfig.enabled){ctx.save();ctx.globalAlpha=state.measured?1:.75+.2*Math.sin(performance.now()/450);ctx.setLineDash([9,7]);ctx.strokeStyle='#344b40';ctx.lineWidth=3;ctx.shadowColor='#30271a';ctx.shadowBlur=3;ctx.strokeRect(392,205,60,365);ctx.restore()}measurementOverlay();ctx.save();ctx.shadowColor='#0008';ctx.shadowBlur=12;ctx.shadowOffsetY=8;ctx.translate(r.x,r.y);ctx.rotate(Math.PI/2);ctx.drawImage(image('ruler'),-190,-63.33,380,126.67);ctx.restore();
const l=state.lens;ctx.save();ctx.shadowColor='#0008';ctx.shadowBlur=12;ctx.shadowOffsetY=8;ctx.drawImage(image('lens'),l.x-176,l.y-96,268.8,224);ctx.restore();if(l.x>405&&l.x<995&&l.y>151&&l.y<574){ctx.save();ctx.beginPath();ctx.arc(l.x,l.y,62,0,Math.PI*2);ctx.clip();ctx.translate(l.x,l.y);ctx.scale(2.2,2.2);ctx.translate(-l.x,-l.y);scene();measurementOverlay();ctx.restore()}tutorialToolGuide()}
function open(){if(window.URStory&&!window.URStory.openInspection())return;if(!$('#detail').open)$('#detail').showModal();draw()}$('#computer').onclick=open;
function requestClose(){if(window.URStory&&!window.URStory.closeInspection()){window.dispatchEvent(new Event('ur:close-blocked'));return false;}$('#detail').close();return true;}
$('#detail').addEventListener('cancel',e=>{e.preventDefault();requestClose()});
function updateHints(){
const cr=canvas.getBoundingClientRect();
for(const selector of ['#photoHotspot','#textHotspot']){const hint=$(selector),r=hint.getBoundingClientRect();if(!r.width)continue;const x=(r.left+r.width/2-cr.left)*1400/cr.width,y=(r.top+r.height/2-cr.top)*1000/cr.height;
// The lens aperture is radius 62 in canvas coordinates; include the visible beacon radius.
const beaconRadius=9*1400/cr.width;if(Math.hypot(state.lens.x-x,state.lens.y-y)<=62+beaconRadius)hint.classList.add('used')}
// Accept the ruler over the portrait as well as beside it, while requiring
// its visible length to cover both the crown and chin.
const geometry=photoGeometry();
state.measured=state.ruler.x>=photoRect.x-40&&state.ruler.x<=photoRect.x+photoRect.w+30&&state.ruler.y-175<=geometry.top&&state.ruler.y+175>=geometry.chin;
if(window.URStory){
 if(state.measured)window.URStory.measure();
 const g=photoGeometry(),lensOverPhoto=state.lens.x>=photoRect.x-20&&state.lens.x<=photoRect.x+photoRect.w+20&&state.lens.y>=g.top-20&&state.lens.y<=g.chin+30;
 if(state.drag==='lens'&&lensOverPhoto)window.URStory.inspect();
 if(state.measured&&state.drag==='lens'&&Math.hypot(state.lens.x-(photoRect.x+photoRect.w/2),state.lens.y-g.chin)<48)window.URStory.align();
}
}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1400/r.width,y:(e.clientY-r.top)*1000/r.height}}
function hit(p){const l=state.lens,r=state.ruler;if(Math.hypot(p.x-l.x,p.y-l.y)<95||(p.x>l.x-170&&p.x<l.x&&p.y>l.y&&p.y<l.y+125))return 'lens';if(Math.abs(p.x-r.x)<40&&Math.abs(p.y-r.y)<195)return 'ruler';return null}
let backgroundPress=null;
function onObject(p){return Boolean(hit(p))||(p.x>=334&&p.x<=1062&&p.y>=73&&p.y<=847)}
canvas.onpointerdown=e=>{const p=point(e),tool=hit(p);backgroundPress=null;if(!tool){if(!onObject(p))backgroundPress={x:e.clientX,y:e.clientY};return;}state.drag=tool;foley('pickup');toolStart={x:e.clientX,y:e.clientY};state.moved=false;state.offset={x:p.x-state[tool].x,y:p.y-state[tool].y};canvas.setPointerCapture(e.pointerId)};
canvas.onpointermove=e=>{const p=point(e);canvas.style.cursor=state.drag?'grabbing':hit(p)?'grab':'default';if(!state.drag)return;if(toolStart&&Math.hypot(e.clientX-toolStart.x,e.clientY-toolStart.y)>5)state.moved=true;state[state.drag]={x:Math.max(state.drag==='lens'?180:55,Math.min(state.drag==='lens'?1310:1340,p.x-state.offset.x)),y:Math.max(195,Math.min(805,p.y-state.offset.y))};updateHints();draw()};
canvas.onpointerup=e=>{const wasDragging=Boolean(state.drag),tool=state.drag;if(wasDragging&&!state.moved){state[tool]=tool==='ruler'?{x:422,y:388}:{x:photoRect.x+photoRect.w/2,y:photoGeometry().chin}}updateHints();if(wasDragging)foley(tool==='ruler'?'ruler-down':'lens-down');state.drag=null;toolStart=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!wasDragging&&backgroundPress&&Math.hypot(e.clientX-backgroundPress.x,e.clientY-backgroundPress.y)<6&&!onObject(point(e)))requestClose();backgroundPress=null;draw()};
canvas.onpointercancel=()=>{backgroundPress=null;state.drag=null;toolStart=null;draw()};
canvas.onkeydown=e=>{const tool=e.key.toLowerCase()==='r'?'ruler':e.key.toLowerCase()==='m'?'lens':null;if(!tool||e.repeat)return;e.preventDefault();foley('pickup');foley(tool==='ruler'?'ruler-down':'lens-down',.1);state[tool]=tool==='ruler'?{x:422,y:388}:{x:photoRect.x+photoRect.w/2,y:photoGeometry().chin};state.drag=tool;updateHints();state.drag=null;draw()};
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail'))requestClose()});
function loop(){const fading=Boolean(recordFade);if(recordFade){const t=Math.min(1,(performance.now()-recordFade.start)/recordFade.duration);recordOpacity=recordFade.from+(recordFade.to-recordFade.from)*(t*t*(3-2*t));if(t===1)recordFade=null}if(fading||$('#detail').open)draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
const svgNS='http://www.w3.org/2000/svg',checks=document.createElementNS(svgNS,'svg');checks.setAttribute('viewBox','0 0 450 380');
function paperPoint(u,v){return[(1-v)*(80+306*u)+v*(38+369*u),(1-v)*(54+2*u)+v*(340+4*u)]}
function paperTransform(u,v){const p=paperPoint(u,v),x=paperPoint(u+1/306,v),y=paperPoint(u,v+1/286);return `matrix(${x[0]-p[0]} ${x[1]-p[1]} ${y[0]-p[0]} ${y[1]-p[1]} ${p[0]} ${p[1]})`}
for(let i=0;i<3;i++){const g=document.createElementNS(svgNS,'g'),box=document.createElementNS(svgNS,'polygon'),tick=document.createElementNS(svgNS,'path'),u=.075,v=.26+i*.25;const corners=[[u,v],[u+.06,v],[u+.06,v+.065],[u,v+.065]].map(([x,y])=>paperPoint(x,y));box.setAttribute('points',corners.map(p=>p.join(',')).join(' '));box.setAttribute('fill','transparent');box.setAttribute('stroke','#675a41');box.setAttribute('stroke-width','1.5');const ps=[[u+.008,v+.03],[u+.025,v+.055],[u+.055,v+.008]].map(([x,y])=>paperPoint(x,y));tick.setAttribute('d',`M${ps[0]} L${ps[1]} L${ps[2]}`);tick.setAttribute('fill','none');tick.classList.add('checkTick');tick.setAttribute('stroke','#367c45');tick.setAttribute('stroke-width','2');tick.style.display='none';g.setAttribute('role','checkbox');g.setAttribute('aria-label',`核对第${i+1}项`);g.setAttribute('aria-checked','false');g.setAttribute('tabindex','0');function toggle(){if(window.URStory){if(window.URStory.check(i))foley('tick');return;}const on=g.getAttribute('aria-checked')!=='true';g.setAttribute('aria-checked',on);tick.style.display=on?'':'none'}g.onclick=toggle;g.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}};const target=document.createElementNS(svgNS,'polygon');target.setAttribute('points',[[u-.025,v-.02],[u+.095,v-.02],[u+.095,v+.09],[u-.025,v+.09]].map(([x,y])=>paperPoint(x,y).join(',')).join(' '));target.setAttribute('fill','transparent');target.setAttribute('class','checkTarget');const cross=document.createElementNS(svgNS,'path');cross.classList.add('checkCross');const pts=[[u+.008,v+.008],[u+.052,v+.057],[u+.052,v+.008],[u+.008,v+.057]].map(([x,y])=>paperPoint(x,y));cross.setAttribute('d',`M${pts[0]} L${pts[1]} M${pts[2]} L${pts[3]}`);cross.setAttribute('fill','none');cross.setAttribute('stroke','#aa3e31');cross.setAttribute('stroke-width','2.4');cross.style.display='none';g.append(target,box,tick,cross);checks.append(g)}$('#checkmarks').replaceChildren(checks);
for(const b of document.querySelectorAll('.trayButton'))b.onclick=()=>{b.classList.add('pressed');if(window.URStory){if(window.URStory.decide(b.classList.contains('green')?'approve':b.classList.contains('red')?'return':'pending'))foley('button')}else exitVisitor();setTimeout(()=>b.classList.remove('pressed'),180)};
const walker=$('#walker'),person=$('#person');
const visitors={student:{side:'02_candidates/characters/student_side_facing_left.png',front:'02_candidates/characters/student_idle.png'},young:{side:'02_candidates/characters/young_side_facing_left.png',front:'02_candidates/characters/young_idle.png'},uncle:{side:'02_candidates/characters/uncle_side_facing_left.png',front:'02_candidates/characters/uncle_idle.png'},alex:{side:'02_candidates/characters/alex_side_v2_facing_left.png',front:'01_confirmed/characters/alex_idle_v2.png'},boss:{side:'02_candidates/characters/boss_side_facing_left.png',front:'02_candidates/characters/boss_idle.png'}};
// Crown/chin and body-center anchors in source pixels, independent of transparent padding.
const poseAnchors={
 student:{front:[652,36,730],side:[670,63,760]},
 young:{front:[768,45,630],side:[660,67,735]},
 uncle:{front:[768,11,650],side:[815,14,610]},
 alex:{front:[656,81,820],side:[730,85,760]},
 boss:{front:[656,24,680],side:[700,19,750]}
};
let currentKey=null,entryToken=0,motion=null,phase='gone',pose='side';
const loadedVisitors=new Map(),decodedVisitors=new Map();
function setPhase(value){phase=value;walker.dataset.phase=value;walker.className=value;window.dispatchEvent(new CustomEvent('ur:visitor-phase',{detail:{phase:value,key:currentKey}}))}
function preloadVisitor(key){
 if(!loadedVisitors.has(key))loadedVisitors.set(key,Promise.all(['side','front'].map(pose=>new Promise((resolve,reject)=>{
  const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Cannot load '+visitors[key][pose]));img.src='assets/'+visitors[key][pose];
 }))).then(images=>{decodedVisitors.set(key,images);return images}).catch(error=>{loadedVisitors.delete(key);throw error}));
 return loadedVisitors.get(key);
}
function applyPose(nextPose){
 pose=nextPose;const [anchor,top,chin]=poseAnchors[currentKey][pose];
 const height=$('#visitorWindow').clientHeight,scale=height*.65/(chin-top);
 person.src='assets/'+visitors[currentKey][pose];
 const img=decodedVisitors.get(currentKey)[pose==='side'?0:1];
 person.style.width=img.naturalWidth*scale+'px';person.style.height=img.naturalHeight*scale+'px';
 person.style.left=-anchor*scale+'px';const y=height*.08-top*scale;person.style.top=(currentKey==='alex'?Math.max(y,height*1.12-(pose==='front'?1166:1175)*scale):y)+'px';
}
function resetChecks(){for(const g of checks.querySelectorAll('[role=checkbox]')){g.setAttribute('aria-checked','false');g.querySelectorAll('path').forEach(p=>p.style.display='none')}}
function animateTravel(from,to,duration,token,onFinish){
 motion?.cancel();walker.style.transform=`translateX(${from}%)`;
 motion=walker.animate([{transform:`translateX(${from}%)`},{transform:`translateX(${to}%)`}],{duration,easing:'linear',fill:'forwards'});
 window.URStoryTime?.track(motion);
 motion.onfinish=()=>{if(token!==entryToken)return;walker.style.transform=`translateX(${to}%)`;motion.cancel();motion=null;onFinish()};
}
async function enterVisitor(key){
 if(!visitors[key])return false;
 const token=++entryToken;motion?.cancel();motion=null;setPhase('loading');
 try{
  const [images]=await Promise.all([preloadVisitor(key),baseAssetsReady]);if(token!==entryToken)return false;
  currentKey=key;walker.dataset.visitor=key;assets.photo=images[1];applyPose('side');resetChecks();
  state.measured=false;state.lens={...home.lens};state.ruler={...home.ruler};state.drag=null;
  document.querySelectorAll('.hotspot').forEach(e=>e.classList.toggle('used',blankMode));draw();
  setPhase('walking');animateTravel(110,50,2400,token,()=>{applyPose('front');setPhase('arrived')});return true;
 }catch(error){if(token===entryToken){setPhase('error');console.error(error)}return false}
}
function exitVisitor(direction='left',keepPose=false){
 if(phase!=='arrived')return false;
 const token=++entryToken;if(!keepPose)applyPose('side');setPhase('leaving');animateTravel(50,direction==='right'?160:-60,3100,token,()=>setPhase('gone'));return true;
}
new ResizeObserver(()=>{if(currentKey)applyPose(pose)}).observe($('#visitorWindow'));
window.UnderReview={enterVisitor,exitVisitor,updateField,paperPoint,paperTransform,getVisitorState:()=>({key:currentKey,phase,pose}),visitors:Object.keys(visitors),
 resetPose(){if(currentKey&&decodedVisitors.has(currentKey))applyPose(pose)},
 ready:baseAssetsReady,draw,photoGeometry,fadeRecord,getRecordPresentation:()=>({opacity:recordOpacity,fading:Boolean(recordFade)}),
 setRecord(patch){Object.assign(record,patch);draw()},
 setInspection(config){const changed=inspectionConfig.key!==config.key;inspectionConfig={...inspectionConfig,...config};if(changed){state.measured=false;state.lens={...home.lens};state.ruler={...home.ruler};document.querySelectorAll('.hotspot').forEach(e=>e.classList.toggle('used',!config.enabled))}draw()},
 async setPhoto(key){const images=await preloadVisitor(key);assets.photo=images[1];draw()},
 getTools:()=>({measured:state.measured,lens:{...state.lens},ruler:{...state.ruler}})
};
const requestedVisitor=new URLSearchParams(location.search).get('visitor');
if(manualScene)enterVisitor(visitors[requestedVisitor]?requestedVisitor:'student');else setPhase('gone');

// Project the same rounded screen into the four observed corners of the side shell.
function fitSmallScreen(){const scale=$('#computer').clientWidth/525;const target=[[142,87],[441,58],[478,305],[161,337]].map(p=>p.map(v=>v*scale));const source=[[0,0],[590,0],[590,423],[0,423]],A=[];
source.forEach(([x,y],i)=>{const [u,v]=target[i];A.push([x,y,1,0,0,0,-u*x,-u*y,u]);A.push([0,0,0,x,y,1,-v*x,-v*y,v])});
for(let i=0;i<8;i++){let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;[A[i],A[pivot]]=[A[pivot],A[i]];const d=A[i][i];for(let k=i;k<9;k++)A[i][k]/=d;for(let j=0;j<8;j++)if(j!==i){const f=A[j][i];for(let k=i;k<9;k++)A[j][k]-=f*A[i][k]}}
const h=A.map(row=>row[8]);$('#smallScreen').style.transform=`matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`}
new ResizeObserver(fitSmallScreen).observe($('#computer'));fitSmallScreen();

Promise.all([document.fonts.load('700 20px "Courier Prime"'),document.fonts.load('400 20px "Courier Prime"')]).then(draw);
if(blankMode){document.querySelectorAll('.hotspot').forEach(e=>e.classList.add('used'));open()}
