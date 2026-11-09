(function(){
'use strict';
const q=s=>document.querySelector(s),params=new URLSearchParams(location.search);
if(params.has('sandbox')||params.has('visitor')||params.has('blank'))return;
const art=window.UnderReview,data=window.URStoryContent;
const idleArt=window.URIdleArt(art);
const storyTime=new window.URGamePause();window.URStoryTime=storyTime;
const voice=new window.URDialogueVoice(window.URVoiceManifest);window.URVoice=voice;
const foley=new window.URFoley(()=>voice.context);window.URFoleyAudio=foley;
window.addEventListener('ur:foley',e=>foley.play(e.detail.key,e.detail.delay));
document.addEventListener('visibilitychange',()=>foley.setHidden(document.hidden||storyTime.paused));
window.addEventListener('pagehide',()=>foley.setHidden(true));
const crowd=new window.URCrowdAmbience(()=>voice.context);window.URCrowd=crowd;
document.addEventListener('visibilitychange',()=>crowd.setHidden(document.hidden||storyTime.paused));
window.addEventListener('pagehide',()=>crowd.setHidden(true));
document.addEventListener('pointerdown',()=>voice.unlock());
document.addEventListener('keydown',()=>voice.unlock());
document.addEventListener('visibilitychange',()=>voice.setHidden(document.hidden||storyTime.paused));
window.addEventListener('pagehide',()=>voice.stop());
document.documentElement.lang='en';
const stage=q('#stage'),detail=q('#detail');
const windowView=document.createElement('img');windowView.id='windowView';windowView.alt='';windowView.setAttribute('aria-hidden','true');q('#visitorWindow').prepend(windowView);
let windowPeriod='';
const layer=document.createElement('section');layer.id='storyLayer';layer.innerHTML=`<div id="actionHint" role="status" aria-live="polite" hidden></div><button id="visitorSpeech" hidden aria-label="Continue conversation"></button><button id="clerkSpeech" hidden aria-label="Continue conversation"></button><div id="introChoices" hidden><button id="skipTutorial">A. I’m not.</button><button id="takeTutorial">B. I am.</button></div><div id="inspectionNote" role="status" hidden></div>`;document.body.append(layer);
const shade=document.createElement('div');shade.id='tutorialShade';shade.hidden=true;stage.append(shade);
const blackout=document.createElement('div');blackout.id='lightsOut';blackout.setAttribute('aria-hidden','true');document.body.append(blackout);
const clock=document.createElement('div');clock.id='storyClock';clock.innerHTML=`<img src="assets/02_candidates/props/clock_face_original.png" alt=""><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line id="hourHand" class="hand" x1="50" y1="50" x2="50" y2="29"/><line id="minuteHand" class="hand" x1="50" y1="50" x2="50" y2="18"/><circle cx="50" cy="50" r="3" fill="#4a3626"/></svg><time id="officeTime"></time>`;stage.append(clock);q('.clockIvory').hidden=true;
const progress=document.createElement('div');progress.id='approvalProgress';progress.hidden=true;progress.innerHTML='<i></i>';q('#tray').append(progress);
const drink=document.createElement('div');drink.id='deskDrink';drink.hidden=true;stage.append(drink);
const drinkImages={};const drinkReady=Promise.all(Object.entries({coffee:'coffee_cup_v2_candidate.png',tea:'english_tea_cup_v3_candidate.png'}).map(async([kind,file])=>{const img=new Image();img.alt=kind==='tea'?'English tea cup':'Coffee cup';img.hidden=true;img.src='assets/02_candidates/desk_food/'+file;drinkImages[kind]=img;drink.append(img);await img.decode()}));
const teaSurface=document.createElementNS('http://www.w3.org/2000/svg','svg');teaSurface.id='teaSurface';teaSurface.setAttribute('viewBox','0 0 1536 1024');teaSurface.setAttribute('aria-hidden','true');teaSurface.innerHTML='<defs><clipPath id="teaOpening"><ellipse cx="719" cy="248" rx="494" ry="110"/></clipPath><linearGradient id="cupInside" x2="0" y2="1"><stop stop-color="#e4cda6"/><stop offset="1" stop-color="#b69a70"/></linearGradient><linearGradient id="teaColour" x2="0" y2="1"><stop stop-color="#a94312"/><stop offset="1" stop-color="#793011"/></linearGradient></defs><g clip-path="url(#teaOpening)"><ellipse cx="719" cy="248" rx="494" ry="110" fill="url(#cupInside)"/><ellipse id="teaLiquid" cx="719" cy="285" rx="445" ry="80" fill="url(#teaColour)"/></g>';drink.append(teaSurface);
const food=document.createElement('div');food.id='deskLunch';food.hidden=true;food.innerHTML='<img alt="">';stage.append(food);
const lunchOverlay=document.createElement('div');lunchOverlay.id='lunchOverlay';lunchOverlay.setAttribute('aria-hidden','true');lunchOverlay.innerHTML='<p>Lunch break…</p>';document.body.append(lunchOverlay);
const sip=new Audio('assets/audio/slurp-05.mp3'),chewing=new Audio('assets/audio/chewing-soft-v2.wav');sip.id='sipAudio';chewing.id='chewingAudio';sip.hidden=chewing.hidden=true;document.body.append(sip,chewing);sip.preload=chewing.preload='auto';sip.volume=.22;chewing.volume=.18;
let lastSip=0,lastDialogueId=null,lastLunch=null,lunchTimer=null,drinkAnimation=null;
function playAudio(audio){audio.pause();audio.currentTime=0;audio.play().catch(()=>{document.body.dataset.audioBlocked='true'})}
function stopAudio(audio){audio.pause();audio.currentTime=0}
document.addEventListener('visibilitychange',()=>{if(document.hidden){sip.pause();chewing.pause()}else if(!storyTime.paused&&engine.state.lunch==='blackout')chewing.play().catch(()=>{})});
const boxes=[...q('#checkmarks svg').querySelectorAll('[role=checkbox]')],svg=q('#checkmarks svg'),ns='http://www.w3.org/2000/svg';
const labels=document.createElementNS(ns,'g');labels.id='taskLabels';
const heading=document.createElementNS(ns,'text');heading.setAttribute('x','0');heading.setAttribute('y','0');heading.setAttribute('transform',art.paperTransform(.19,.13));heading.classList.add('paperHeading');heading.textContent='VERIFICATION';svg.append(heading);
const date=document.createElementNS(ns,'text');date.setAttribute('x','0');date.setAttribute('y','0');date.setAttribute('transform',art.paperTransform(.19,.19));date.classList.add('paperDate');date.textContent=data.provisional.gameDate;svg.append(date);
const taskNodes=[];
for(let i=0;i<3;i++){
 const g=document.createElementNS(ns,'g');g.classList.add('taskLabel');g.setAttribute('role','button');g.setAttribute('tabindex','0');const y=0,x=0;g.setAttribute('transform',art.paperTransform(.19,.31+i*.25));
 const rect=document.createElementNS(ns,'rect');rect.setAttribute('x',x-3);rect.setAttribute('y',y-24);rect.setAttribute('width','235');rect.setAttribute('height','55');rect.setAttribute('rx','2');rect.setAttribute('fill','transparent');
 const text=document.createElementNS(ns,'text');text.setAttribute('x',x);text.setAttribute('y',y);text.setAttribute('font-family','Patrick Hand,cursive');text.setAttribute('font-size','24');const strike=document.createElementNS(ns,'line');strike.classList.add('taskStrike');strike.setAttribute('x1','-2');strike.setAttribute('x2','228');strike.setAttribute('y1','-7');strike.setAttribute('y2','-7');g.append(rect,text,strike);g.onclick=()=>engine.task(i);g.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();engine.task(i)}};taskNodes.push({g,text,x,y});labels.append(g);
 boxes[i].setAttribute('aria-label','Verify item '+(i+1));
}
svg.append(labels);
const buttons={return:q('.trayButton.red'),approve:q('.trayButton.green'),pending:q('.trayButton.yellow')};Object.entries(buttons).forEach(([key,b])=>b.setAttribute('aria-label',key==='return'?'Return application':key==='approve'?'Approve application':'Mark pending'));
q('#computer').setAttribute('aria-label','Inspect applicant photograph');q('#canvas').setAttribute('aria-label','Photo inspection. Drag the ruler or magnifier. R places the ruler; M places the magnifier.');q('#canvas').tabIndex=0;
let returnToStartTimer=null;
let lastPhase='',lastPage=-1,lastPerson='',lastPhotoKey='',lastNote='',approvalTimer=null,progressAnimation=null,audioContext=null,bellPlayed=false;
function unlockAudio(){try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume()}catch(_){}}
document.addEventListener('pointerdown',unlockAudio,{once:true});document.addEventListener('keydown',unlockAudio,{once:true});
function ringBell(){unlockAudio();if(!audioContext)return;const t=audioContext.currentTime;for(let strike=0;strike<3;strike++)for(const [freq,volume] of [[880,.12],[1320,.055],[1760,.025]]){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,t+strike*.25);gain.gain.exponentialRampToValueAtTime(volume,t+strike*.25+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+strike*.25+.8);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t+strike*.25);osc.stop(t+strike*.25+.85)}}
function wrapTask(node,label){const words=label.split(' '),lines=[''];for(const word of words){const i=lines.length-1;if((lines[i]+' '+word).trim().length>22&&lines[i])lines.push(word);else lines[i]=(lines[i]+' '+word).trim()}node.text.replaceChildren();lines.forEach((line,i)=>{const span=document.createElementNS(ns,'tspan');span.setAttribute('x',node.x);span.setAttribute('dy',i?'26':'0');span.textContent=line;node.text.append(span)})}
let speechLine=null,speechPages=[],speechPage=0,resumeSpeech=null,wasIdle=false,lastIdleCue=0,lastApprovalSerial=0;
const textMeasure=document.createElement('canvas').getContext('2d');
function showSpeechPage(el){
 el.querySelector('.speechCopy').textContent=speechPages[speechPage]||'';
 el.dataset.page=String(speechPage+1);el.dataset.pages=String(speechPages.length);
 el.setAttribute('aria-label','Continue: '+(speechPages[speechPage]||''));
 voice.sync(engine.state.line,speechPage,speechPages);
}
function layoutSpeech(el,line){
 if(resumeSpeech?.line===line&&resumeSpeech.pages.length){speechLine=line;speechPages=resumeSpeech.pages;speechPage=resumeSpeech.page;el.replaceChildren();const copy=document.createElement('span');copy.className='speechCopy';el.append(copy);showSpeechPage(el);resumeSpeech=null;return}
 if(['boss','clerk','thought'].includes(line.speaker)){el.textContent=line.text;speechLine=line;speechPages=[];speechPage=0;return}
 if(speechLine===line&&el.querySelector('.speechCopy'))return;
 speechLine=line;speechPage=0;el.replaceChildren();
 const copy=document.createElement('span');copy.className='speechCopy';el.append(copy);
 const style=getComputedStyle(el),box=copy.getBoundingClientRect();textMeasure.font=style.font;
 const maxLines=Math.max(1,Math.floor(box.height/parseFloat(style.lineHeight)));
 speechPages=window.URSpeechPages(line.text,box.width-4,maxLines,text=>textMeasure.measureText(text).width);
 showSpeechPage(el);
}
function render(s){
 window.URArchivePanel?.sync(s);
 if(s.idleMode&&!wasIdle)resumeSpeech={line:speechLine,pages:speechPages.slice(),page:speechPage};wasIdle=Boolean(s.idleMode);
 crowd.update(s);foley.sync(s);
 idleArt.present(s);
 if(s.idleCue&&s.idleCue!==lastIdleCue){lastIdleCue=s.idleCue;
  if(['exit','uncle-exit'].includes(s.idleAction)){art.fadeRecord(0);art.exitVisitor(s.idleAction==='uncle-exit'?'right':'left',['uncle','alex'].includes(s.person))}
  if(s.idleAction==='pair-enter'){art.fadeRecord(1);idleArt.enterPair(idle.config.returnMs).catch(e=>engine.fail(String(e)))}
  if(s.idleAction==='pair-exit')idleArt.exitPair(idle.config.exitMs);
 }
 if((s.approvalSerial||0)>lastApprovalSerial){lastApprovalSerial=s.approvalSerial;buttons.approve.classList.add('pressed');foley.play('button');storyTime.setTimeout(()=>buttons.approve.classList.remove('pressed'),700)}
 const period=window.URWindowScene(s.time);if(period!==windowPeriod){windowPeriod=period;windowView.src='assets/window-clean-20261106/window-'+period+'-clean.png';windowView.dataset.period=period;}
 const visit=engine.visit,teaching=s.phase==='tutorial',practicing=s.visitIndex<0&&s.practiceStarted,hasRecord=s.visitIndex>=0||practicing;
 document.body.dataset.storyPhase=s.phase;document.body.dataset.visit=visit?.id||'supervisor';
 stage.classList.toggle('standing',s.camera==='standing');
 if(s.phase==='entering'&&lastPhase!=='entering'){
  idleArt.clear();art.fadeRecord(0,0);lastPerson=s.person;art.enterVisitor(s.person).then(ok=>{if(ok)art.fadeRecord(s.visitIndex>=0?1:0);if(!ok)engine.fail('A character image could not be loaded. Please reload to retry.')});
 }
 if(s.phase==='departing'&&lastPhase!=='departing'){art.fadeRecord(0);art.exitVisitor()}
 if(teaching&&lastPhase!=='tutorial')art.fadeRecord(1);
 lastPhase=s.phase;
 if(s.page!==lastPage){if(lastPage>=0){foley.play('paper');q('#clipboard').classList.remove('pageTurn');void q('#clipboard').offsetWidth;q('#clipboard').classList.add('pageTurn')}lastPage=s.page;}
 const inspectionKey=(visit?.id||'practice')+':'+(engine.inspectionMode||'record');
 const photo=data.provisional.photo;
 art.setInspection({...photo,key:inspectionKey,practice:Boolean(practicing),enabled:engine.inspectionMode!==null&&hasRecord,portrait:practicing||visit?.person==='student',headMm:visit?.id==='student-first'?photo.firstHeadMm:photo.correctedHeadMm,heightMm:photo.heightMm,minHeadMm:photo.minHeadMm,maxHeadMm:photo.maxHeadMm,targetMm:photo.alignmentMm});
 if(practicing)lastPhotoKey='practice';
 if(visit)lastPhotoKey=visit.id;
 const name=visit?data.provisional[visit.name]:(practicing?data.practiceRecord.name:'—');
 art.setRecord({showPhoto:hasRecord,applicantName:name,file:practicing?data.practiceRecord.file:'FILE '+String(Math.max(1,s.visitIndex+1)).padStart(3,'0'),title:practicing?data.practiceRecord.title:'APPLICANT RECORD',status:practicing?data.practiceRecord.status:s.forcedApproval?'APPROVED':'IN REVIEW',footer:s.forcedApproval?'APPLICATION APPROVED':s.checks.every(Boolean)?'RECORD CHECKED':'RECORD INCOMPLETE'});
 for(let i=0;i<3;i++){
  const task=visit?.tasks[i]||(practicing?data.practiceRecord.tasks[i]:null),label=task?.label||(i===0?'Applicant record':'—');
  art.updateField('field_'+(i+1),{text:task?data.text(task.value):(i===0?'Student identity':''),revealed:hasRecord&&s.revealed[i]});
  const next=s.checks.findIndex(x=>!x),enabled=teaching?s.lessonAction==='task'&&i===s.lessonTask:['tasks','review'].includes(s.phase)&&i===next;
  wrapTask(taskNodes[i],label);taskNodes[i].g.setAttribute('aria-label',label);taskNodes[i].g.setAttribute('aria-disabled',String(!enabled));taskNodes[i].g.setAttribute('tabindex',enabled?'0':'-1');taskNodes[i].g.classList.toggle('active',enabled);taskNodes[i].g.classList.toggle('passed',s.results[i]==='pass');
  boxes[i].setAttribute('aria-checked',String(s.checks[i]));boxes[i].querySelector('.checkTick').style.display=s.results[i]==='pass'?'':'none';boxes[i].querySelector('.checkCross').style.display=s.results[i]==='fail'?'':'none';boxes[i].setAttribute('aria-disabled',String(!engine.canCheck(i)));boxes[i].setAttribute('tabindex',engine.canCheck(i)?'0':'-1');boxes[i].classList.toggle('ready',engine.canCheck(i));

 }
 q('#computer').disabled=!engine.canOpenInspection();q('#computer .beacon').hidden=q('#computer').disabled;
 if(s.inspectionOpen&&!detail.open)detail.showModal();if(!s.inspectionOpen&&detail.open)detail.close();
 const parent=s.inspectionOpen?detail:document.body;if(layer.parentNode!==parent)parent.append(layer);layer.classList.toggle('inInspection',s.inspectionOpen);
 const newLineId=s.line?.id||null;if(newLineId!==lastDialogueId){stopAudio(sip);lastDialogueId=newLineId}
 // Both cup images are already decoded; change the visible layers together.
 drink.hidden=!s.drink;drink.dataset.kind=s.drink||'';
 for(const [kind,img] of Object.entries(drinkImages))img.hidden=kind!==s.drink;
 const teaCount=Math.min(5,s.teaSips||0);drink.dataset.teaSips=String(teaCount);teaSurface.toggleAttribute('hidden',s.drink!=='tea');const liquid=teaSurface.querySelector('#teaLiquid');liquid.setAttribute('cy',String(285+teaCount*17));liquid.setAttribute('rx',String(445-teaCount*36));liquid.setAttribute('ry',String(80-teaCount*9));
 if(s.sipSerial!==lastSip){lastSip=s.sipSerial;if(s.drink){drinkAnimation?.cancel();drinkAnimation=drink.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-5px) rotate(-2deg)',offset:.32},{transform:'translateY(-3px) rotate(1deg)',offset:.65},{transform:'translateY(0) rotate(0)'}],{duration:1100,easing:'ease-in-out'});playAudio(sip);document.body.dataset.sipCount=String(lastSip)}}
 if(!s.drink){drinkAnimation?.cancel();stopAudio(sip)}
 const foodName=s.lunch==='sandwich'?'wrapped_sandwich.png':s.lunch==='paper'?'sandwich_wrapper_ball_v3_candidate.png':null;
 food.hidden=!foodName;food.dataset.kind=s.lunch||'';if(foodName){food.firstElementChild.src='assets/02_candidates/desk_food/'+foodName;food.firstElementChild.alt=s.lunch==='paper'?'Crumpled sandwich wrapper':'Wrapped sandwich'}
 const lunchBlack=s.phase==='lunch'&&['blackout','idle-blackout'].includes(s.lunch);lunchOverlay.classList.toggle('on',lunchBlack);lunchOverlay.setAttribute('aria-hidden',String(!lunchBlack));
 if(s.lunch!==lastLunch){if(lunchTimer)storyTime.clearTimeout(lunchTimer);lastLunch=s.lunch;stopAudio(chewing);if(s.phase==='lunch'){const ms={blackout:data.lunchBlackoutMs,paper:data.lunchPaperMs,clear:data.lunchClearMs,'idle-blackout':idle.config.lunchMs}[s.lunch];if(ms)lunchTimer=storyTime.setTimeout(()=>s.lunch==='idle-blackout'?idle.advanceLunch():engine.advanceLunch(),ms);if(s.lunch==='blackout')playAudio(chewing)}}
 const line=s.line,visitor=line&&line.speaker!=='clerk'&&line.speaker!=='thought';
 q('#visitorSpeech').hidden=!visitor;q('#clerkSpeech').hidden=!line||Boolean(visitor);
 if(line){const el=visitor?q('#visitorSpeech'):q('#clerkSpeech');el.dataset.speaker=line.speaker;el.classList.toggle('thought',line.speaker==='thought');el.classList.toggle('lesson',teaching);layoutSpeech(el,line);if(['boss','clerk','thought'].includes(line.speaker))el.setAttribute('aria-label',teaching?'Supervisor instruction: '+line.text:'Continue: '+line.text);el.setAttribute('aria-disabled',String(teaching));}
 if(s.idleMode&&line&&speechPages.length>1&&s.idleSpeechMs){const page=Math.min(speechPages.length-1,Math.floor((s.idleSpeechElapsed||0)/Math.max(1,s.idleSpeechMs-2500)*speechPages.length));if(page>speechPage){speechPage=page;showSpeechPage(visitor?q('#visitorSpeech'):q('#clerkSpeech'))}}
 voice.sync(s.error||s.phase==='ending'?null:s.line,speechPage,speechPages);
 q('#introChoices').hidden=s.phase!=='choice';
 stage.classList.toggle('teaching',teaching&&!s.inspectionOpen);shade.hidden=!teaching||s.inspectionOpen;
 document.querySelectorAll('.tutorialFocus').forEach(el=>el.classList.remove('tutorialFocus'));
 if(teaching&&!s.inspectionOpen){q(data.tutorialSteps[s.tutorialStep].focus).classList.add('tutorialFocus');if(s.lessonAction==='check')q('#computer').classList.add('tutorialFocus')}
 let note='';if(s.inspectionOpen&&!teaching){if(engine.photoMode){if(!s.measured)note='Place the ruler on the dotted outline beside the photo.';else if(engine.photoMode==='corrected'&&!s.aligned)note='Move the magnifier over the two lower lines. Confirm that they overlap.';else note=(engine.photoMode==='first'?'Head size below requirement.':'Measurement and alignment confirmed.')+' Select the dark background to return.';}else note='Compare the uncovered record with the applicant’s answer. Select the dark background to return.';}
 const noteEl=q('#inspectionNote');noteEl.hidden=true;noteEl.textContent=note;lastNote=note;
 const hint=q('#actionHint'),guidance=s.phase==='idle-wait'?'Click to return to the applicant.':s.idleMode?'':window.URGuidance(s,s.inspectionOpen?engine.inspectionMode:engine.photoMode);hint.hidden=!guidance;if(hint.textContent!==guidance)hint.textContent=guidance;
 for(const [key,b] of Object.entries(buttons)){const allowed=teaching?s.lessonAction==='pending'&&key==='pending':s.phase==='decision'&&((s.decision==='return'&&key==='return')||(['pending','close-pending'].includes(s.decision)&&key==='pending')||(['approve-timed','approve-hover'].includes(s.decision)&&key==='approve'));b.disabled=!allowed;b.classList.toggle('available',allowed);}
 if(s.phase==='decision'&&s.decision==='approve-timed'){
  if(!approvalTimer){progress.hidden=false;progressAnimation=progress.firstElementChild.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:data.approvalTimeoutMs,fill:'forwards'});approvalTimer=storyTime.setTimeout(()=>{approvalTimer=null;engine.decide('approve')},data.approvalTimeoutMs)}
 }else{if(approvalTimer)storyTime.clearTimeout(approvalTimer);approvalTimer=null;progressAnimation?.cancel();progressAnimation=null;progress.hidden=true}
 if(s.phase==='decision'&&s.decision==='approve-hover'&&buttons.approve.matches(':hover'))queueMicrotask(()=>{if(engine.hoverApprove())closingCueAt=performance.now()});
 q('#hourHand').style.transform=`rotate(${s.time/2}deg)`;q('#minuteHand').style.transform=`rotate(${(s.time-480)*6}deg)`;q('#officeTime').textContent=String(Math.floor(s.time/60)).padStart(2,'0')+':'+String(Math.floor(s.time%60)).padStart(2,'0');
 if(s.bell&&!bellPlayed){bellPlayed=true;clock.classList.add('bell');ringBell()}
 if(s.phase==='ending'){if(!returnToStartTimer)returnToStartTimer=storyTime.setTimeout(()=>{sessionStorage.setItem('ur:return-to-start','1');location.reload()},2600);stopAudio(sip);stopAudio(chewing);blackout.classList.add('on');stage.inert=true;layer.hidden=true;blackout.setAttribute('aria-label','The office is closed.');blackout.setAttribute('aria-hidden','false')}
 if(s.error){let el=q('#loadError');if(!el){el=document.createElement('div');el.id='loadError';el.setAttribute('role','alert');document.body.append(el)}el.textContent=s.error;}
}
const engine=new window.URStoryEngine(data,render);window.URStory=engine;
const idle=new window.URIdleDirector(engine);window.URIdle=idle;
let closingCueAt=-Infinity;
let suppressClickUntil=0,lastIdleTick=performance.now();
function inputActivity(event){if(event.target.closest?.('#archiveTab,#archiveDialog')||storyTime.paused)return;if(event.type==='keydown'&&(event.repeat||['Shift','Control','Alt','Meta'].includes(event.key)))return;if(idle.activity()){suppressClickUntil=performance.now()+500;event.preventDefault();event.stopImmediatePropagation();return}if(engine.state.phase==='dialogue'&&['clerk','thought'].includes(engine.state.line?.speaker)&&(event.type==='pointerdown'||['Enter',' '].includes(event.key))){event.preventDefault();event.stopImmediatePropagation();suppressClickUntil=performance.now()+250;if(engine.state.line?.id==='return.closed'&&performance.now()-closingCueAt<500)return;continueSpeech()}}
document.addEventListener('pointerdown',inputActivity,true);document.addEventListener('keydown',inputActivity,true);
document.addEventListener('click',event=>{if(event.target.closest?.('#archiveTab,#archiveDialog')||storyTime.paused)return;if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();return}if(engine.state.phase==='dialogue'&&['clerk','thought'].includes(engine.state.line?.speaker)){event.preventDefault();event.stopImmediatePropagation();continueSpeech()}},true);
document.addEventListener('pointermove',event=>{if(event.buttons&&!engine.state.idleMode&&!storyTime.paused&&!event.target.closest?.('#archiveTab,#archiveDialog'))idle.activity()},true);
const idleTimer=setInterval(()=>{const now=performance.now(),dt=now-lastIdleTick;lastIdleTick=now;if(!storyTime.paused){storyTime.tick(dt);idle.tick(dt)}},200);
window.addEventListener('pagehide',()=>{clearInterval(idleTimer);idle.dispose();idleArt.clear()});
function continueSpeech(){if(engine.state.phase==='dialogue'&&speechPage+1<speechPages.length){speechPage++;showSpeechPage(q(engine.state.line.speaker==='clerk'||engine.state.line.speaker==='thought'?'#clerkSpeech':'#visitorSpeech'));return}engine.next()}
q('#visitorSpeech').onclick=q('#clerkSpeech').onclick=continueSpeech;
window.addEventListener('resize',()=>{if(!engine.state.line)return;speechLine=null;render(engine.state)});
q('#skipTutorial').onclick=()=>engine.chooseTutorial(false);q('#takeTutorial').onclick=()=>engine.chooseTutorial(true);
function approachApprove(){if(!storyTime.paused&&!engine.state.idleMode&&engine.hoverApprove())closingCueAt=performance.now()}
buttons.approve.addEventListener('pointerenter',approachApprove);buttons.approve.addEventListener('focus',approachApprove);
window.addEventListener('ur:visitor-phase',e=>{foley.travel(e.detail.phase==='pair-arrived'?'arrived':e.detail.phase==='pair-gone'?'gone':e.detail.phase);if(idle.visitorPhase(e.detail.phase))return;if(e.detail.phase==='arrived'){engine.arrived();if(idle.auto)idle.begin(true)}else if(e.detail.phase==='gone')engine.departed();else if(e.detail.phase==='error')engine.fail('A character image could not be loaded. Please reload to retry.')});
window.addEventListener('ur:asset-error',()=>engine.fail('An office asset could not be loaded. Please reload to retry.'));
window.addEventListener('ur:close-blocked',()=>{const note=q('#actionHint');note.classList.remove('blocked');void note.offsetWidth;note.classList.add('blocked')});
document.addEventListener('keydown',e=>{if(e.repeat||storyTime.paused||e.target.closest?.('#archiveTab,#archiveDialog'))return;if(e.code==='Space'&&e.target===document.body&&engine.state.phase==='dialogue'){e.preventDefault();continueSpeech()}});
windowView.src='assets/window-clean-20261106/window-day-clean.png';windowView.dataset.period='day';windowPeriod='day';
let readingAudio=[];
function setReading(value){
 if(storyTime.paused===value)return;
 storyTime.setPaused(value,document.getAnimations());lastIdleTick=performance.now();
 if(value){readingAudio=[sip,chewing].filter(a=>!a.paused);readingAudio.forEach(a=>a.pause())}
 else{if(!document.hidden)readingAudio.forEach(a=>a.play().catch(()=>{}));readingAudio=[]}
 // Suspending the shared context preserves the precise current dialogue audio cursor.
 if(voice.context){if(value)voice.context.suspend();else if(!document.hidden)voice.context.resume()}
}
window.addEventListener('ur:archive-reading',e=>setReading(Boolean(e.detail)));
function archiveDing(){const c=voice.context;if(!c||c.state!=='running')return;const osc=c.createOscillator(),gain=c.createGain(),t=c.currentTime;osc.type='sine';osc.frequency.setValueAtTime(1046.5,t);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.025,t+.01);gain.gain.exponentialRampToValueAtTime(.0001,t+.38);osc.connect(gain);gain.connect(c.destination);osc.onended=()=>{osc.disconnect();gain.disconnect()};osc.start(t);osc.stop(t+.4)}
window.URArchivePanel=window.URArchive({entries:window.URArchiveData||[],onPause:setReading,ding:archiveDing});
window.URStartScreen({ready:Promise.all([art.ready,idleArt.ready,drinkReady,voice.prepare()]),onBegin:async()=>{await voice.unlock();await foley.ready();foley.play('button');crowd.start();engine.start()}});
})();
