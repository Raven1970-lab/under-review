/* Shared story time: reading a dossier suspends countdowns and in-flight movement. */
(function(root){
class GamePause {
 constructor(){this.paused=false;this.jobs=new Map();this.next=1;this.animations=new Set()}
 setTimeout(fn,ms){const id=this.next++;this.jobs.set(id,{fn,left:ms});return id}
 clearTimeout(id){this.jobs.delete(id)}
 tick(ms){if(this.paused)return;for(const [id,job] of [...this.jobs]){if(!this.jobs.has(id))continue;job.left-=ms;if(job.left<=0){this.jobs.delete(id);job.fn()}}}
 track(animation){if(this.paused&&animation){animation.pause();this.animations.add(animation)}return animation}
 setPaused(value,animations=[]){if(this.paused===value)return;this.paused=value;if(value){for(const a of animations)if(a.playState==='running')this.track(a)}else{for(const a of this.animations)if(a.playState==='paused')a.play();this.animations.clear()}}
}
root.URGamePause=GamePause;if(typeof module!=='undefined')module.exports=GamePause;
})(typeof window!=='undefined'?window:globalThis);
