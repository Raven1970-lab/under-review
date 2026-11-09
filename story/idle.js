/* Idle time belongs to each reception, never to a global clock multiplier. */
(function(root){
'use strict';
const defaults={thresholdMs:180000,bossMs:90000,normalMs:180000,mildMs:60000,strongMs:30000,limitMs:15000,wakeMs:4000,exitMs:3100,returnMs:2400,gapMs:1200,orderMs:6500,stampMs:1400,lunchMs:1600};
class IdleDirector{
 constructor(engine,config={}){this.e=engine;this.config={...defaults,...config};this.auto=false;this.silence=0;this.steps=null;this.index=0;this.elapsed=0;this.completed=0;this.saved=null;this.cue=0;this.recovering=false;this.approved=new Set();this.disposed=false}
 eligible(){return ['dialogue','choice','tutorial','tasks','review','decision'].includes(this.e.state.phase)}
 line(id){const [speaker,text]=this.e.content.lines[id];return {id,speaker,text:this.e.content.lineText?this.e.content.lineText(id,this.e.state.visitIndex):this.e.content.text(text)}}
 activity(){
  if(this.disposed||['ending','error','boot'].includes(this.e.state.phase))return false;
  if(this.recovering)return false;
  if(this.steps){if(this.steps[this.index].recoverable){this.resume();return true}return true}
  if(this.recovering)return false;
  if(['entering','departing','lunch'].includes(this.e.state.phase))return true;
  this.silence=0;return false;
 }
 begin(automatic=false){
  if(!this.eligible()||this.recovering)return;
  const e=this.e,s=e.state,c=this.config;this.auto=true;this.silence=0;
  this.saved={phase:s.phase,line:s.line,queue:e.queue.slice(),after:e.after,inspectionOpen:s.inspectionOpen,camera:s.camera};
  const person=s.person,step=(pose,ms,extra={})=>({pose,ms,recoverable:true,...extra});
  const stages=[];if(automatic&&person!=='boss')stages.push(step('front',c.normalMs));
  if(person==='boss')stages.push(step('front',1,{recoverable:false}));
  else if(person==='uncle')stages.push(step('impatient',c.mildMs),step('offended',c.strongMs),step('phone',c.limitMs,{line:'idle.uncle.phone'}));
  else if(person==='alex')stages.push(step('waiting',c.mildMs),step('angry',c.strongMs),step('angry',c.limitMs));
  else stages.push(step(person==='student'?'look':'glance',c.mildMs),step(person==='student'?'pout':'tired',c.strongMs),step('asleep',c.limitMs),step('wake',c.wakeMs));
  stages.push(step(person==='alex'?'leaving':person==='uncle'?'departing':'side',c.exitMs,{recoverable:false,action:person==='uncle'?'uncle-exit':'exit'}));
  if(person==='uncle')stages.push(step(null,c.gapMs,{recoverable:false,action:'gap'}),step(null,c.returnMs,{recoverable:false,action:'pair-enter'}),step('offended',c.orderMs,{recoverable:false,action:'order',line:'idle.boss.order'}),step('offended',c.stampMs,{recoverable:false,action:'approve'}),step(null,c.exitMs,{recoverable:false,action:'pair-exit'}));
  this.steps=stages;this.index=0;this.elapsed=0;this.completed=0;this.total=stages.reduce((n,x)=>n+x.ms,0);this.startTime=s.time;this.endTime=e.visit?.endTime??480;
  s.inspectionOpen=false;s.camera='seated';s.decision=null;s.idleMode=true;this.enterStep();
 }
 clearNotice(){if(this.recovering){this.e.queue=[];this.e.after=null;this.recovering=false}this.e.state.line=null;this.e.state.idleSpeechElapsed=0;this.e.state.idleSpeechMs=0}
 showNotice(line){const s=this.e.state;s.line=line;s.idleSpeechElapsed=0;s.idleSpeechMs=line?Math.max(5000,line.text.length*65+2500):0}
 enterStep(){this.clearNotice();const s=this.e.state,step=this.steps[this.index];s.phase=step.recoverable?'idle-wait':step.action==='order'?'idle-order':'idle-performance';s.waitPose=step.pose;s.idleAction=step.action||'wait';s.idleCue=++this.cue;this.showNotice(step.line?this.line(step.line):null);
  if(step.action==='approve'&&!this.approved.has(s.visitIndex)){this.approved.add(s.visitIndex);s.forcedApproval=true;s.approvalSerial=(s.approvalSerial||0)+1;s.idleOutcome='approved-by-supervisor'}
  this.e.emit();
 }
 updateTime(){this.e.state.time=this.startTime+(this.endTime-this.startTime)*Math.min(1,(this.completed+this.elapsed)/this.total)}
 tick(ms){
  if(this.disposed||!Number.isFinite(ms)||ms<0)return;
  if(['ending','error'].includes(this.e.state.phase)){this.dispose();return}
  if(!this.steps){if(this.auto&&this.eligible()){this.begin(true);return}if(!this.eligible()){this.silence=0;return}this.silence+=ms;if(this.silence>=(this.e.state.person==='boss'?this.config.bossMs:this.config.thresholdMs))this.begin();return}
  const s=this.e.state;if(s.line&&s.idleSpeechMs){s.idleSpeechElapsed+=ms;if(s.idleSpeechElapsed>=s.idleSpeechMs){this.clearNotice();s.phase=this.steps[this.index].recoverable?'idle-wait':this.steps[this.index].action==='order'?'idle-order':'idle-performance'}}
  const step=this.steps[this.index];this.elapsed=Math.min(step.ms,this.elapsed+ms);this.updateTime();
  if(this.elapsed>=step.ms&&!s.line&&!['exit','uncle-exit','pair-enter','pair-exit'].includes(step.action))this.advance();else this.e.emit();
 }
 advance(){if(!this.steps)return;this.completed+=this.steps[this.index].ms;this.elapsed=0;this.index++;if(this.index===this.steps.length){this.finish();return}this.enterStep()}
 visitorPhase(phase){
  if(this.disposed)return false;
  if(!this.steps)return false;
  const action=this.steps[this.index].action;
  if((phase==='gone'&&['exit','uncle-exit'].includes(action))||(phase==='pair-arrived'&&action==='pair-enter')||(phase==='pair-gone'&&action==='pair-exit')){this.elapsed=this.steps[this.index].ms;this.updateTime();this.advance();return true}
  return true;
 }
 resume(){
  const e=this.e,s=e.state,saved=this.saved;this.recovering=true;
  // Keep the waiting timeline alive until the player actually continues.
  e.say(['idle.'+s.person+'.resume'],()=>{this.steps=null;this.saved=null;this.auto=false;this.recovering=false;this.silence=0;Object.assign(s,{idleMode:false,idleAction:null,waitPose:'front',idleSpeechMs:0,idleSpeechElapsed:0,phase:saved.phase,line:saved.line,inspectionOpen:saved.inspectionOpen,camera:saved.camera});e.queue=saved.queue;e.after=saved.after});this.showNotice(s.line);e.emit();
 }
 finish(){
  this.clearNotice();const e=this.e,s=e.state;s.time=this.endTime;s.line=null;s.waitPose=null;s.idleAction=null;s.inspectionOpen=false;s.idleMode=false;this.steps=null;this.saved=null;e.queue=[];e.after=null;
  if(s.visitIndex===4){s.time=1020;s.bell=true;s.phase='ending';this.dispose();e.emit();return}
  if(s.visitIndex===2){s.phase='lunch';s.lunch='idle-blackout';s.drink=null;e.emit();return}
  s.phase='departing';e.departed();
 }
 advanceLunch(){if(this.e.state.lunch!=='idle-blackout')return false;Object.assign(this.e.state,{time:840,lunch:'done',phase:'departing'});return this.e.departed()}
 dispose(){this.disposed=true;this.auto=false;this.steps=null;this.saved=null;this.recovering=false}
 status(){return {auto:this.auto,silence:this.silence,stage:this.steps?.[this.index]?.pose,action:this.steps?.[this.index]?.action,index:this.index,recovering:this.recovering,approved:[...this.approved]}}
}
IdleDirector.defaults=defaults;root.URIdleDirector=IdleDirector;if(typeof module!=='undefined')module.exports=IdleDirector;
})(typeof window!=='undefined'?window:globalThis);
