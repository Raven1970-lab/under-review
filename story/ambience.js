(function(root){
'use strict';
class CrowdAmbience{
 constructor(getContext,options={}){
  this.getContext=getContext;this.fetch=options.fetch||((url)=>root.fetch(url));this.random=options.random||Math.random;
  this.context=null;this.buffer=null;this.source=null;this.gain=null;this.started=false;this.hidden=false;this.muted=false;
  this.state={phase:'boot',time:480,line:null};this.swell=.4;this.timer=null;this.target=0;this.error=null;this.offset=0;
 }
 async start(){
  if(this.started)return;this.started=true;
  try{this.context=this.getContext();if(!this.context)throw Error('Audio is not unlocked');
   const r=await this.fetch('assets/audio/hall-ambience-v2.ogg');if(!r.ok)throw Error('Crowd audio '+r.status);
   this.buffer=await this.context.decodeAudioData(await r.arrayBuffer());this.gain=this.context.createGain();this.gain.gain.value=0;this.gain.connect(this.context.destination);
   if(!this.hidden&&this.state.phase!=='ending')this.resume();
  }catch(e){this.error=String(e)}
 }
 level(){
  const s=this.state;
  if(this.hidden||this.muted||['boot','ending','error'].includes(s.phase)||(s.phase==='lunch'&&['blackout','idle-blackout'].includes(s.lunch)))return 0;
  return .5*this.swell*(s.time>=900?.1:s.time>=720?.4:1)*(s.line?.speaker&&s.line.speaker!=='thought'?.28:1)*(s.inspectionOpen?.65:1);
 }
 apply(){this.target=this.level();if(this.gain){const t=this.context.currentTime;this.gain.gain.cancelScheduledValues(t);this.gain.gain.setTargetAtTime(this.target,t,this.target===0?.35:1.2)}}
 update(s){const previousPeriod=this.state.time>=900?2:this.state.time>=720?1:0;this.state={phase:s.phase,time:s.time,line:s.line,lunch:s.lunch,inspectionOpen:s.inspectionOpen};const period=s.time>=900?2:s.time>=720?1:0;if(period!==previousPeriod&&this.source)this.nextSwell();if(['ending','error'].includes(s.phase)){this.pause();this.apply();return}this.apply()}
 nextSwell(){
  clearTimeout(this.timer);this.timer=null;
  if(this.hidden||!this.source)return;
  this.swell=.62+this.random()*.16;this.apply();
  this.timer=setTimeout(()=>this.nextSwell(),8000+this.random()*7000);
 }
 resume(){
  if(!this.buffer||this.source||this.hidden||['ending','error'].includes(this.state.phase))return;
  const source=this.context.createBufferSource();source.buffer=this.buffer;source.loop=true;source.connect(this.gain);source.start(0,this.offset%this.buffer.duration);
  this.source=source;this.startedAt=this.context.currentTime;this.nextSwell();
 }
 pause(){
  clearTimeout(this.timer);this.timer=null;
  if(this.source){this.offset+=(this.context.currentTime-this.startedAt);this.source.stop();this.source.disconnect();this.source=null}
 }
 setHidden(value){this.hidden=Boolean(value);if(this.hidden)this.pause();else this.resume();this.apply()}
 setMuted(value){this.muted=Boolean(value);this.apply()}
 status(){return {playing:Boolean(this.source),target:this.target,swell:this.swell,hidden:this.hidden,muted:this.muted,error:this.error}}
}
root.URCrowdAmbience=CrowdAmbience;if(typeof module!=='undefined')module.exports=CrowdAmbience;
})(typeof window!=='undefined'?window:globalThis);
