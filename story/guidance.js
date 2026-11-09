(function(root){
function guidance(s,photoMode){
 if(s.phase==='dialogue')return ['clerk','thought'].includes(s.line?.speaker)?'Click anywhere to continue.':'Click the speech bubble to continue.';
 if(s.phase==='choice')return 'Choose an answer: A to skip the tutorial, B to begin.';
 if(s.phase==='tutorial')return {task:'Select the highlighted checklist task.',check:'Compare the answer with the uncovered record, then mark its box.',open:'Click the computer to inspect the photograph.',measure:'Move the ruler over the portrait to measure the head.',lens:'Use the magnifier to inspect the photograph and size guide.',close:'Click the dark background to return to the desk.',pending:'Click the yellow pending button to finish the practice.'}[s.lessonAction]||'';
 if(s.inspectionOpen){
  if(photoMode&&!s.inspected)return 'Move the magnifier over the portrait to inspect the photograph.';
  if(photoMode&&!s.measured)return 'Drag the ruler over the portrait, or click the ruler to position it.';
  if(photoMode==='corrected'&&!s.aligned)return 'Move the magnifier over the lower red and green lines.';
  return photoMode?'Photograph inspected and measured. Click the dark background to return.':'Click the dark background to return to your desk.';
 }
 if(s.phase==='tasks')return 'Click the next highlighted task on the clipboard.';
 if(s.phase==='review')return photoMode&&(!s.inspected||!s.measured||(photoMode==='corrected'&&!s.aligned))?'Click the computer to check the photograph.':'Tick the matching box on the clipboard to continue.';
 if(s.phase==='decision')return {return:'Click the red return button to continue.',pending:'Click the yellow pending button to continue.','close-pending':'Click the yellow pending button to close the office.','approve-timed':'Click the green approve button, or wait for the countdown.','approve-hover':'Move your pointer to the green approve button.'}[s.decision]||'';
 return '';
}
root.URGuidance=guidance;if(typeof module!=='undefined')module.exports=guidance;
})(typeof window!=='undefined'?window:globalThis);
