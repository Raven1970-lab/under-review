(function(root){
'use strict';
class DialogueVoice {
 constructor(manifest, options={}) {
  this.manifest=manifest;this.bounds=options.bounds||root.URVoiceBounds||{};this.context=null;this.cache=new Map();this.current=null;
  this.line=null;this.serial=0;this.muted=false;this.hidden=false;this.pending=null;
  this.volume=.65;this.starts=0;this.lastStarted=null;this.error=null;
  this.createContext=options.createContext||(()=>new(root.AudioContext||root.webkitAudioContext)());
  this.fetch=options.fetch||((url)=>root.fetch(url));
 }
 async unlock(){
  try {
   if(!this.context)this.context=this.createContext();
   if(this.context.state==='suspended')await this.context.resume();
   const pending=this.pending;this.pending=null;
   if(pending&&pending.serial===this.serial)this.play(pending.line,pending.serial);
  }catch(error){this.error=String(error)}
 }
 buffer(id){
  if(!this.cache.has(id))this.cache.set(id,this.fetch(this.manifest[id]).then(r=>{
   if(!r.ok)throw Error('Voice asset '+r.status);return r.arrayBuffer();
  }).then(bytes=>this.context.decodeAudioData(bytes)).catch(error=>{this.cache.delete(id);throw error}));
  return this.cache.get(id);
 }
 stop(){
  this.serial++;this.pending=null;
  if(!this.current)return;
  const {source,gain}=this.current,t=this.context.currentTime;
  gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);
  gain.gain.linearRampToValueAtTime(0,t+.02);source.stop(t+.02);this.current=null;
 }
 sync(line,page=0,pages=null){
  const key=pages?.length?pages.join('|')+':'+page:'whole';
  if(line===this.line&&this.pageKey===key)return;
  this.pageKey=key;const total=pages?.reduce((n,t)=>n+t.length,0)||0;this.segment=total?{start:pages.slice(0,page).reduce((n,t)=>n+t.length,0)/total,end:pages.slice(0,page+1).reduce((n,t)=>n+t.length,0)/total}:null;
  this.line=line;this.stop();
  if(!line||line.speaker==='thought'||!this.manifest[line.id]||this.muted||this.hidden)return;
  const serial=this.serial;
  if(!this.context||this.context.state!=='running'){this.pending={line,serial};return}
  this.play(line,serial);
 }
 async play(line,serial){
  try {
   const buffer=await this.buffer(line.id);
   if(serial!==this.serial||this.muted||this.hidden||this.line!==line)return;
   const source=this.context.createBufferSource(),gain=this.context.createGain();
   source.buffer=buffer;source.connect(gain);gain.connect(this.context.destination);
   const t=this.context.currentTime+.025;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(this.volume,t+.012);
   this.current={source,gain};this.starts++;this.lastStarted=line.id;
   source.onended=()=>{source.disconnect();gain.disconnect();if(this.current?.source===source)this.current=null};
   const segment=this.segment;if(segment&&Number.isFinite(buffer.duration)){const bounds=this.bounds[line.id]||[0,buffer.duration],start=Math.max(0,bounds[0]),end=Math.min(buffer.duration,bounds[1]),span=end-start;const offset=start+span*segment.start,duration=span*(segment.end-segment.start);gain.gain.setValueAtTime(this.volume,t+Math.max(.012,duration-.02));gain.gain.linearRampToValueAtTime(0,t+duration);source.start(t,offset,duration)}else source.start(t);
  }catch(error){if(serial===this.serial)this.error=String(error)}
 }
 setMuted(value){this.muted=Boolean(value);if(this.muted)this.stop()}
 setHidden(value){this.hidden=Boolean(value);if(this.hidden)this.stop()}
 status(){return {starts:this.starts,lastStarted:this.lastStarted,active:Boolean(this.current),pending:Boolean(this.pending),muted:this.muted,error:this.error}}
}
root.URDialogueVoice=DialogueVoice;
if(typeof module!=='undefined')module.exports=DialogueVoice;
})(typeof window!=='undefined'?window:globalThis);
