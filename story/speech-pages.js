(function(root){
function paginate(text,width,maxLines,measure){
 const words=text.trim().split(/\s+/),rows=[];let row=[];
 for(const word of words){if(row.length&&measure([...row,word].join(' '))>width){rows.push(row);row=[]}row.push(word)}if(row.length)rows.push(row);
 // Move a few words back onto an orphan final row when space allows.
 if(rows.length>1){const last=rows.at(-1),prev=rows.at(-2);while(last.length<3&&prev.length>3&&measure([prev.at(-1),...last].join(' '))<=width)last.unshift(prev.pop())}
 const capacity=Math.max(1,maxLines),count=Math.ceil(rows.length/capacity),pages=[];let cursor=0;
 for(let i=0;i<count;i++){const size=Math.ceil((rows.length-cursor)/(count-i));pages.push(rows.slice(cursor,cursor+size).map(x=>x.join(' ')).join(' '));cursor+=size}
 return pages;
}
root.URSpeechPages=paginate;if(typeof module!=='undefined')module.exports=paginate;
})(typeof window!=='undefined'?window:globalThis);
