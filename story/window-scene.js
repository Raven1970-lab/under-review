(function(root){
function windowScene(minutes){return minutes<12*60?'day':minutes<15*60?'golden':'dusk'}
root.URWindowScene=windowScene;
if(typeof module!=='undefined')module.exports=windowScene;
})(typeof window!=='undefined'?window:globalThis);
