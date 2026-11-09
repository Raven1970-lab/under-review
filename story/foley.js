(function(root){
'use strict';
const levels={paper:.28,tick:.22,button:.24,pickup:.17,'ruler-down':.23,'lens-down':.21,'step-left':.13,'step-right':.13,wrapper:.17,'light-switch':.16};
class Foley{
 constructor(getContext,options={}){this.getContext=getContext;this.fetch=options.fetch||((url)=>root.fetch(url));this.buffers=new Map();this.active=new Set();this.hidden=false;this.muted=false;this.speaking=false;this.closed=false;this.starts={};this.errors=[];this.last=new Map();this.walking=false;this.stepTimer=null;this.stepIndex=0;this.lunch=null}
 async ready(){this.context=this.getContext();if(!this.context)return;this.bus=this.context.createGain();this.bus.gain.value=this.speaking?.35:1;this.bus.connect(this.context.destination);await Promise.all(Object.keys(levels).map(async key=>{try{const r=await this.fetch('assets/audio/foley/'+key+'.wav');if(!r.ok)throw Error(key+' '+r.status);this.buffers.set(key,await this.context.decodeAudioData(await r.arrayBuffer()))}catch(e){this.errors.push(String(e))}}))}
 sync(s){const wasClosed=this.closed;this.closed=['ending','error'].includes(s.phase);this.speaking=Boolean(s.line&&s.line.speaker!=='thought');if(this.bus)this.bus.gain.setTargetAtTime(this.speaking?.35:1,this.context.currentTime,.025);if(this.closed&&!wasClosed){this.travel('gone');this.stop();if(s.phase==='ending')this.play('light-switch',.07)}if(s.lunch!==this.lunch){this.lunch=s.lunch;if(s.phase==='lunch'&&s.lunch==='paper')this.play('wrapper')}}
 travel(phase){const walking=['walking','leaving'].includes(phase);if(walking===this.walking)return;this.walking=walking;clearTimeout(this.stepTimer);this.stepTimer=null;if(walking)this.step()}
 step(){clearTimeout(this.stepTimer);this.stepTimer=null;if(!this.walking||this.hidden||this.muted||this.closed)return;this.play(this.stepIndex++%2?'step-right':'step-left');this.stepTimer=setTimeout(()=>this.step(),520)}
 play(key,delay=0){if(!this.buffers.has(key)||this.hidden||this.muted||(this.closed&&!['button','light-switch'].includes(key))||this.context.state!=='running')return false;const now=this.context.currentTime,previous=this.last.get(key);if(previous!==undefined&&now-previous<.055)return false;this.last.set(key,now);const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.buffers.get(key);gain.gain.value=levels[key];source.connect(gain);gain.connect(this.bus);this.active.add(source);source.onended=()=>{this.active.delete(source);source.disconnect();gain.disconnect()};source.start(now+delay);this.starts[key]=(this.starts[key]||0)+1;return true}
 stop(){for(const s of this.active)s.stop();this.active.clear()}
 setHidden(v){this.hidden=Boolean(v);if(this.hidden){clearTimeout(this.stepTimer);this.stepTimer=null;this.stop()}else if(this.walking)this.step()}
 setMuted(v){this.muted=Boolean(v);if(this.muted){clearTimeout(this.stepTimer);this.stepTimer=null;this.stop()}else if(this.walking)this.step()}
 status(){return {loaded:this.buffers.size,starts:{...this.starts},active:this.active.size,duck:this.speaking?.35:1,errors:[...this.errors]}}
}
root.URFoley=Foley;if(typeof module!=='undefined')module.exports=Foley;
})(typeof window!=='undefined'?window:globalThis);
