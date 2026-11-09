(function(root){
'use strict';
const order=['boss','student','young','uncle','alex'],storageKey='ur:dossiers:v1';
class ArchiveUnlocks {
 constructor(saved=[]){this.unlocked=new Set(saved.filter(x=>order.includes(x)));this.previous=null}
 update(s){const additions=[];const unlock=key=>{if(order.includes(key)&&!this.unlocked.has(key)){this.unlocked.add(key);additions.push(key)}};
  if(this.previous&&s.visitIndex>this.previous.visitIndex)unlock(this.previous.person);
  if(s.visitIndex===2&&s.phase==='lunch')unlock('uncle');
  if(s.phase==='ending')unlock(s.person);
  this.previous={visitIndex:s.visitIndex,person:s.person};return additions;
 }
}
root.URArchiveUnlocks=ArchiveUnlocks;
if(typeof module!=='undefined'){module.exports=ArchiveUnlocks;return}
root.URArchive=function({entries,onPause,ding}){
 const t=value=>root.URI18n?.t(value)||value;
 function localized(entry){return root.URI18n?.language==='zh'?{...entry,...root.URArchiveChinese?.[entry.id]}:entry}
 let saved=[];try{saved=JSON.parse(localStorage.getItem(storageKey)||'[]')}catch(_){}
 const progress=new ArchiveUnlocks(Array.isArray(saved)?saved:[]),available=entries.length===5&&order.every(k=>entries.some(e=>e.id===k&&e.body&&e.image));
 const tab=document.createElement('button');tab.id='archiveTab';tab.hidden=!available;tab.setAttribute('aria-label','Open dossiers');tab.setAttribute('aria-haspopup','dialog');tab.innerHTML='<svg viewBox="0 0 54 112" preserveAspectRatio="none" aria-hidden="true"><path class="tabBody" d="M1 -2H53V88L27 110L1 88Z"/><path class="tabStitch" d="M6 -2V84L27 103L48 84V-2"/><circle class="tabEyelet" cx="27" cy="18" r="4.2"/></svg><span>DOSSIERS</span>';
 const dialog=document.createElement('dialog');dialog.id='archiveDialog';dialog.setAttribute('aria-labelledby','archiveTitle');dialog.innerHTML='<section class="archiveFolder"><header><span>UNDER REVIEW / RECORDS</span><button class="archiveClose" aria-label="Close dossiers">×</button></header><div class="archiveLayout"><nav aria-label="Applicant dossiers"></nav><article><div class="archivePaper"><p class="archiveNumber"></p><h1 id="archiveTitle"></h1><div class="archiveBody"></div><footer class="archiveSources"></footer></div></article><div class="archiveRail"><div class="archiveThumb" role="scrollbar" tabindex="0" aria-label="Scroll dossier" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100"></div></div></div></section>';
 document.body.append(tab,dialog);
 const article=dialog.querySelector('article'),thumb=dialog.querySelector('.archiveThumb'),rail=thumb.parentElement,nav=dialog.querySelector('nav');let selected=null,returnFocus=null,flashTimer=null;
 function inline(parent,text,id){for(const token of text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g)){if(!token)continue;if(token.startsWith('**')){const strong=document.createElement('strong');strong.textContent=token.slice(2,-2);parent.append(strong)}else if(token.startsWith('*')){const em=document.createElement('em');em.textContent=token.slice(1,-1);parent.append(em)}else if(/^\[\d+\]$/.test(token)){const a=document.createElement('a');a.className='archiveCitation';a.href='#archive-source-'+id+'-'+token.slice(1,-1);a.textContent=token;a.onclick=e=>{e.preventDefault();dialog.querySelector(a.getAttribute('href'))?.scrollIntoView({block:'nearest'})};parent.append(a)}else parent.append(document.createTextNode(token))}}
 function updateScroll(){const max=article.scrollHeight-article.clientHeight;rail.hidden=max<=1;const ratio=article.clientHeight/Math.max(1,article.scrollHeight),height=Math.max(32,rail.clientHeight*Math.min(1,ratio));thumb.style.height=height+'px';thumb.style.transform=`translateY(${max>0?article.scrollTop/max*(rail.clientHeight-height):0}px)`;thumb.setAttribute('aria-valuenow',String(max>0?Math.round(article.scrollTop/max*100):0));thumb.setAttribute('aria-controls','archiveText');rail.hidden=max<=1}
 article.id='archiveText';article.addEventListener('scroll',updateScroll,{passive:true});new ResizeObserver(updateScroll).observe(article);
 function select(id){const original=entries.find(e=>e.id===id);if(!original||!progress.unlocked.has(id))return;const entry=localized(original);selected=id;
  for(const b of nav.children)b.setAttribute('aria-pressed',String(b.dataset.id===id));
  const number=dialog.querySelector('.archiveNumber');number.replaceChildren();for(const value of [t('FILE / ')+String(order.indexOf(id)+1).padStart(2,'0'),entry.role||entry.label]){const span=document.createElement('span');span.textContent=value;number.append(span)}const title=dialog.querySelector('h1');title.replaceChildren();for(const value of entry.titleLines||[entry.title]){const span=document.createElement('span');span.className='archiveTitleLine';span.textContent=value;title.append(span)}
  const body=dialog.querySelector('.archiveBody');body.replaceChildren();
  if(entry.subject){const meta=document.createElement('dl');meta.className='archiveMeta';for(const [label,value] of [['Subject',entry.subject],['Evidence',entry.evidence]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=t(label);dd.textContent=value;meta.append(dt,dd)}body.append(meta)}
  for(const section of entry.sections||[{paragraphs:entry.body.split(/\n\s*\n/)}]){const group=document.createElement('section');group.className='archiveSection';if(section.title){const h=document.createElement('h2');h.textContent=section.title;group.append(h)}for(const paragraph of section.paragraphs){const p=document.createElement('p');inline(p,paragraph.trim(),id);group.append(p)}body.append(group)}
  if(entry.finding){const finding=document.createElement('section');finding.className='archiveFinding';const h=document.createElement('h2');h.textContent=t('Finding');const p=document.createElement('p');inline(p,entry.finding,id);finding.append(h,p);body.append(finding)}
  const footer=dialog.querySelector('.archiveSources');footer.replaceChildren();const seen=new Set();if(entry.sources?.length){const label=document.createElement('h2');label.textContent=t('Sources');footer.append(label);for(const source of entry.sources){if(!/^https?:\/\//.test(source.url))continue;const a=document.createElement('a');a.href=source.url;a.textContent='['+source.number+'] '+source.title.replace(/\*/g,'');a.target='_blank';a.rel='noopener noreferrer';if(!seen.has(source.number)){a.id='archive-source-'+id+'-'+source.number;seen.add(source.number)}footer.append(a)}}
  article.scrollTop=0;requestAnimationFrame(updateScroll);
 }
 function refresh(){for(const b of nav.children){const unlocked=progress.unlocked.has(b.dataset.id);b.disabled=!unlocked;b.classList.toggle('locked',!unlocked);b.setAttribute('aria-label',unlocked?b.dataset.title:b.dataset.title+t(' — locked'))}tab.disabled=!progress.unlocked.size}
 for(const id of order){const original=entries.find(e=>e.id===id);if(!original)continue;const e=localized(original);const b=document.createElement('button');b.dataset.id=id;b.dataset.title=e.label||e.title;b.setAttribute('aria-pressed','false');const img=document.createElement('img');img.src=e.image;img.alt='';const caption=document.createElement('span');caption.textContent=e.label||e.title;b.append(img,caption);b.onclick=()=>select(id);nav.append(b)}
 function close(){if(dialog.open)dialog.close()}
 dialog.addEventListener('close',()=>{tab.setAttribute('aria-expanded','false');onPause(false);returnFocus?.focus({preventScroll:true})});dialog.querySelector('.archiveClose').onclick=close;
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 tab.onclick=()=>{if(!available||!progress.unlocked.size)return;returnFocus=document.activeElement;onPause(true);dialog.showModal();tab.setAttribute('aria-expanded','true');select(selected||order.find(k=>progress.unlocked.has(k)));dialog.querySelector('.archiveClose').focus();requestAnimationFrame(updateScroll)};
 let drag=null;
 thumb.onpointerdown=e=>{drag={y:e.clientY,top:article.scrollTop};thumb.setPointerCapture(e.pointerId);e.preventDefault()};
 thumb.onpointermove=e=>{if(!drag)return;const travel=rail.clientHeight-thumb.offsetHeight;article.scrollTop=drag.top+(e.clientY-drag.y)/Math.max(1,travel)*(article.scrollHeight-article.clientHeight)};
 thumb.onpointerup=thumb.onpointercancel=()=>{drag=null};
 thumb.onkeydown=e=>{const movement={ArrowDown:40,ArrowUp:-40,PageDown:article.clientHeight*.85,PageUp:-article.clientHeight*.85,Home:-article.scrollHeight,End:article.scrollHeight}[e.key];if(movement!==undefined){e.preventDefault();article.scrollTop+=movement}};
 function translate(){
 tab.querySelector('span').textContent=t('DOSSIERS');tab.setAttribute('aria-label',t('Open dossiers'));
 dialog.querySelector('header>span').textContent=t('UNDER REVIEW / RECORDS');dialog.querySelector('.archiveClose').setAttribute('aria-label',t('Close dossiers'));nav.setAttribute('aria-label',t('Applicant dossiers'));thumb.setAttribute('aria-label',t('Scroll dossier'));
 for(const b of nav.children){const e=localized(entries.find(e=>e.id===b.dataset.id));b.dataset.title=e.label||e.title;b.querySelector('span').textContent=b.dataset.title}refresh();if(dialog.open&&selected){const fraction=article.scrollTop/Math.max(1,article.scrollHeight-article.clientHeight);select(selected);requestAnimationFrame(()=>{article.scrollTop=fraction*(article.scrollHeight-article.clientHeight)})}
 }
 const languageControl=root.URI18n?.button(dialog.querySelector('header'));if(languageControl)dialog.querySelector('header').insertBefore(languageControl,dialog.querySelector('.archiveClose'));root.addEventListener('ur:language',translate);translate();
 return {get isOpen(){return dialog.open},ready:available,progress,
  sync(s){const additions=progress.update(s);if(additions.length){try{localStorage.setItem(storageKey,JSON.stringify([...progress.unlocked]))}catch(_){}refresh();if(available){ding();tab.classList.remove('newFile');void tab.offsetWidth;tab.classList.add('newFile');clearTimeout(flashTimer);flashTimer=setTimeout(()=>tab.classList.remove('newFile'),3100)}}tab.hidden=!available||s.phase==='ending'||Boolean(s.inspectionOpen)},close};
};
})(typeof window!=='undefined'?window:globalThis);
