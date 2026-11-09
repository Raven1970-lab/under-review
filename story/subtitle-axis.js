// Bottom subtitles are read while looking at the visitor window, so centre them on
// the window's axis rather than the viewport's. Recomputed whenever the stage resizes.
(()=>{const win=document.querySelector('#visitorWindow');if(!win)return;
const root=document.documentElement;
const update=()=>{const b=win.getBoundingClientRect();if(!b.width)return;root.style.setProperty('--dialogue-axis',((b.left+b.right)/2)+'px')};
new ResizeObserver(update).observe(win);addEventListener('resize',update);update()})();
