(function(root){
'use strict';
const base='assets/03_waiting_states_handoff/under_review_waiting/';
const files={student:{look:'student_young/student_waiting_look_around.png',pout:'student_young/student_waiting_pout.png',asleep:'student_young/student_waiting_asleep.png',wake:'student_young/student_waiting_look_around.png'},young:{glance:'student_young/young_man_waiting_glance.png',tired:'student_young/young_man_waiting_exhausted.png',asleep:'student_young/young_man_waiting_asleep.png',wake:'student_young/young_man_waiting_exhausted.png'},uncle:{impatient:'uncle/uncle_impatient.png',offended:'uncle/uncle_offended.png',departing:'uncle/uncle_departing.png',phone0:'uncle/uncle_phone_closed_with_effects.png',phone1:'uncle/uncle_phone_speaking_with_effects.png'},alex:{waiting:'alex/alex_waiting.png',angry:'alex/alex_angry.png',leaving:'alex/alex_leaving.png'}};
const cache=new Map();
function load(src){if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Waiting artwork unavailable: '+src));img.src=src}));return cache.get(src)}
root.URIdleArt=function(art){
 const aperture=document.querySelector('#visitorWindow'),walker=document.querySelector('#walker'),person=document.querySelector('#person');let last='',pair=null,pairMotion=null,token=0;
 const ready=Promise.all(Object.values(files).flatMap(x=>Object.values(x)).map(x=>load(base+x))).then(images=>{for(const img of images)cache.set(img.getAttribute('src'),img)});
 function place(el,img,pose,x=.5){const h=aperture.clientHeight;const crown=8,chin=img.naturalHeight*(pose==='asleep'?.62:pose?.startsWith('phone')?.48:.59),scale=h*.62/(chin-crown);el.src=img.src;el.style.width=img.naturalWidth*scale+'px';el.style.height=img.naturalHeight*scale+'px';el.style.left=(aperture.clientWidth*x-img.naturalWidth*scale/2)+'px';el.style.top=(h*(pose==='asleep'?.33:.08)-crown*scale)+'px'}
 function present(s){const p=s.expression==='unhappy'?'pout':s.waitPose;const pose=p==='phone'?'phone'+(Math.floor(performance.now()/360)%2):p;const key=s.person+':'+pose+':'+s.idleMode+':'+s.expression;if(key===last)return;last=key;person.classList.toggle('idleWaking',p==='wake');
  if((!s.idleMode&&!s.expression)||!pose||pose==='front'||pose==='side'){if(!pair)art.resetPose();return}
  const path=files[s.person]?.[pose],img=path&&cache.get(base+path);if(img instanceof HTMLImageElement){place(person,img,pose,0);walker.dataset.waitPose=p}
 }
 function clear(){token++;pairMotion?.cancel();pairMotion=null;pair?.remove();pair=null;aperture.classList.remove('authorityPresent');last='';person.classList.remove('idleWaking');delete walker.dataset.waitPose}
 async function enterPair(duration){const stamp=++token;const boss=await load('assets/02_candidates/characters/boss_idle.png');const uncle=cache.get(base+files.uncle.offended);if(stamp!==token)return;
  pair=document.createElement('div');pair.id='authorityPair';pair.setAttribute('aria-label','Supervisor and applicant');const b=new Image(),u=new Image();pair.append(b,u);aperture.append(pair);aperture.classList.add('authorityPresent');
  // Supervisor leads on the left, applicant remains visibly angry on the right.
  const h=aperture.clientHeight,w=aperture.clientWidth,scale=Math.min(h*.52/(680-24),w*.44/600);b.src=boss.src;b.style.cssText=`width:${boss.naturalWidth*scale}px;height:${boss.naturalHeight*scale}px;left:${w*.26-656*scale}px;top:${Math.max(h*.08,h-boss.naturalHeight*scale+18)}px`;
  const us=Math.min(h*.52/(uncle.naturalHeight*.59-8),w*.44/350);u.src=uncle.src;u.style.cssText=`width:${uncle.naturalWidth*us}px;height:${uncle.naturalHeight*us}px;left:${w*.74-uncle.naturalWidth*us/2}px;top:${Math.max(h*.08,h-uncle.naturalHeight*us+18)}px`;
  window.dispatchEvent(new CustomEvent('ur:visitor-phase',{detail:{phase:'walking',key:'authority'}}));
  pairMotion=pair.animate([{transform:'translateX(110%)'},{transform:'translateX(0)'}],{duration,fill:'forwards',easing:'linear'});root.URStoryTime?.track(pairMotion);pairMotion.onfinish=()=>{if(stamp!==token)return;window.dispatchEvent(new CustomEvent('ur:visitor-phase',{detail:{phase:'pair-arrived',key:'authority'}}))};
 }
 function exitPair(duration){if(!pair)return;const stamp=token;pairMotion?.cancel();window.dispatchEvent(new CustomEvent('ur:visitor-phase',{detail:{phase:'leaving',key:'authority'}}));pairMotion=pair.animate([{transform:'translateX(0)'},{transform:'translateX(-120%)'}],{duration,fill:'forwards',easing:'linear'});root.URStoryTime?.track(pairMotion);pairMotion.onfinish=()=>{if(stamp!==token)return;clear();window.dispatchEvent(new CustomEvent('ur:visitor-phase',{detail:{phase:'pair-gone',key:'authority'}}))}}
 new ResizeObserver(()=>{last='';if(root.URStory)present(root.URStory.state)}).observe(aperture);
 return {ready,present,clear,enterPair,exitPair};
};
})(window);
