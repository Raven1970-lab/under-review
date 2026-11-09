/* Narrative values synced from the 2026-11-06 handoff. Student given-name ordering and preferred name use Yue Lin / Maya Lin.
   Remaining nationality is working copy. The field name provisional is retained for compatibility.
   English first. Line IDs and {tokens} are stable localization hooks. */
(function(root){
const provisional={
 gameDate:'2026-10-01',practiceStudentNumber:'ST-001',practicePassport:'P-001',studentName:'Yue Lin',preferredName:'Maya Lin',studentNumber:'ST-260318',passport:'P-260418',nationality:'Asterian',island:'Bythebook Island',
 youngName:'Xu Zhuo',youngHealth:'H-260521',youngUniversity:'University of Certified Excellence',youngBirth:'2001-10-01',
 uncleName:'Zhou Wei',uncleHealth:'H-260734',uncleUniversity:'Riverside Metropolitan University',uncleBirth:'1991-07-01',uncleClaimedBirth:'1991-12-01',
 alexName:'Alex',housingOffice:'Housing Waiting List Office',mentalOffice:'Mental Health Support Coordination Office',
 homelessSince:'2026-04-01',housingSince:'2026-07-01',mentalSince:'2026-05-01',returnTime:16*60,
 photo:{sourceCrownY:34,sourceChinY:688,sourceCenterX:680,sourceBodyEndY:1000,heightMm:45,minHeadMm:32,maxHeadMm:45,firstHeadMm:29,correctedHeadMm:32,alignmentMm:32}
};
const lines={
 'idle.student.resume':['student','Excuse me… I’m still waiting. Could we finish this, please?'],
 'idle.young.resume':['young','Sorry… have you forgotten about my application?'],
 'idle.uncle.resume':['uncle','Do you know how long you’ve kept me waiting?'],
 'idle.alex.resume':['alex','I’m still here. I need help, and you’re making me wait.'],
 'idle.boss.resume':['boss','Let’s continue. There are applicants waiting.'],
 'idle.uncle.phone':['uncle','Your clerk has kept me waiting. Come down here and sort this out.'],
 'idle.boss.order':['boss','He’s fine. I’ve checked everything. Approve his application.'],
 'clerk.new':['clerk',"I’m new here."],
 'clerk.notNew':['clerk',"I’m not new here."],
 "return.confirmed":["clerk", "Miss, your photograph is fine now."],
 "alex.departments":["clerk", "To check the queue for mental health assistance, you should go to the {mentalOffice}. For housing, you should check with the {housingOffice}. I’m unable to help you any further here. I’m sorry."],
 "uncle.embarrassed":["clerk", "Oh, really? Oh, Uncle, I couldn’t possibly trouble you…"],
 'lunch.thought':['thought','(Time for lunch.)'],
 "boss.hello":["boss", "You're the new clerk starting today, aren't you?"],
 'boss.skip':['boss','All right. You know the routine. We open at eight.'],
 "tutorial.board":["boss", "Work down the checklist. Select the first glowing task to uncover the matching identity information on the computer."],
 "tutorial.compareStudent":["boss", "The applicant answers: {practiceStudentNumber}. Compare that answer with the uncovered number on the screen. They match. Mark the first box."],
 "tutorial.passport":["boss", "Now select the passport task. Ask for that number next; leave the remaining task until this one is checked."],
 "tutorial.comparePassport":["boss", "The applicant answers: {practicePassport}. Check it against the newly uncovered record. It matches too. Mark the second box."],
 "tutorial.identity":["boss", "Sometimes you need to verify the applicant’s identity. Select the identity task. This is when you need to examine their photograph."],
 "tutorial.computer":["boss", "Select the computer to inspect the photograph. The uncovered information is evidence to compare with the applicant’s answers."],
 "tutorial.ruler":["boss", "Measure the head with the ruler. The two green guides show an acceptable photograph here. A photograph that is too small has red head guides and a green minimum-size guide below."],
 "tutorial.lens":["boss", "Use the magnifier to inspect the face and the lower size guide. Check that the face and the size guide match."],
 "tutorial.close":["boss", "The photograph has been inspected and measured. Click the dark area outside the computer to return to the desk."],
 "tutorial.confirm":["boss", "The photograph meets the requirement. Confirm the third item on your checklist."],
 "tutorial.buttons":["boss", "Only after checking all three items do you process the application. Red returns it, green approves it, yellow leaves it pending. Select yellow. When you speak, click anywhere to continue."],
 "tutorial.done":["boss", "That’s the procedure. The first applicant is waiting for you. Good luck."],
 "student.intro1":["student", "Hello. My name is {studentName}, but my preferred name is {preferredName}."],
 "student.intro2":["student", "I’m an international student, and I’m planning a holiday on {island}. I registered my details online a while ago. Today I received a notice asking me to come in to see whether my application has been approved, or if there are any problems."],
 "student.q1":["clerk", "Could you tell me your student ID number, please?"],
 "student.a1":["student", "My student ID number is {studentNumber}."],
 "student.q2":["clerk", "What is your passport number?"],
 "student.a2":["student", "My passport number is {passport}."],
 "student.reject1":["clerk", "I’m sorry, but we cannot confirm that you are the person in this photograph."],
 "student.reject2":["student", "Why? That is my own photograph! Can’t you see that I look exactly like the person in it?"],
 "student.reject3":["clerk", "The head in the photograph you submitted does not meet the size requirement. It is 3 mm shorter than required. Please correct the photograph and submit it again."],
 'common.health.q':['clerk','First, please confirm your health certificate number.'],
 "young.health.a":["young", "My health certificate number is {youngHealth}."],
 "common.degree.q":["clerk", "What is your highest qualification?"],
 'young.degree.a':['young','I have a doctorate from {youngUniversity}.'],
 "common.age.q":["clerk", "What is your date of birth?"],
 'young.age.a':['young','{youngBirth}. I’m twenty-five.'],
 "young.hesitate":["clerk", "Well… this is a difficult one. Is there anything else about your circumstances you’d like to tell me?"],
 "young.none":["young", "No, nothing else."],
 "young.pending":["clerk", "We’ll get back to you. Please go home and wait to hear from us."],
 "uncle.health.a":["uncle", "{uncleHealth}. I drink quite often, but I’m still in fairly good health."],
 "uncle.degree.a":["uncle", "I graduated with a master’s from {uncleUniversity} over ten years ago."],
 "uncle.age.a":["uncle", "{uncleClaimedBirth}."],
 "uncle.discrepancy":["clerk", "About this date of birth of yours…"],
 "uncle.interrupt":["uncle", "You know your supervisor, don’t you? He mentioned you to me. Said you were a very conscientious young lady."],
 "uncle.praise":["uncle", "No trouble, no trouble. That’s why I came to you. Seeing is believing—you really are a conscientious young lady. Keep up the good work. You’ll certainly be able to serve the people."],
 "uncle.stand":["clerk", "Thank you, thank you for the leadership’s concern! I’ll keep working diligently and live up to my superiors’ expectations!"],
 "uncle.ask":["uncle", "Young lady, what were you about to say? Has my application been approved?"],
 "uncle.approve":["clerk", "Approved, approved!"],
 "uncle.bye":["uncle", "Goodbye. Next time I come to see your supervisor, I’ll be sure to sing your praises."],
 "alex.intro":["alex", "I’ve been living on the streets for six months. I registered my details ages ago. Why hasn’t my turn come yet?"],
 "alex.q1":["clerk", "What caused you to become homeless, and when did that happen?"],
 "alex.a1":["alex", "I lost my money trading stocks and went bankrupt. I became homeless six months ago."],
 'alex.q2':['clerk','When did you register for the housing waiting list?'],
 "alex.a2":["alex", "Three months ago."],
 "alex.q3":["clerk", "What mental health condition were you diagnosed with at a public hospital, and when did you register for free assistance?"],
 "alex.a3":["alex", "I developed depression after going bankrupt. I registered five months ago."],
 "alex.referral":["clerk", "You are indeed on the waiting lists. But all I can see here is that you’ve registered. I can’t see when your turn will come, or whether it has already come."],
 "alex.angry":["alex", "But I have nowhere to stay tonight! Those places are a long way from here, and I don’t even have the money for the metro. How am I supposed to get there? I have nowhere to stay. I just need somewhere I can stay right now!"],
 "alex.clerk":["clerk", "I’m sorry, but I don’t work for the {housingOffice}, so I don’t have any accommodation I can offer you. I’m very sympathetic to your situation, but we’ve already done everything we can."],
 "alex.system":["clerk", "I hope you’ll soon be able to benefit from our comprehensive support system for people experiencing homelessness."],
 "return.intro":["student", "Hello. I’ve corrected my photograph. Could you please check it again? Thank you."],
 "return.thought":["thought", "(Ugh, we’re about to close. Why is someone else coming in now? This is so annoying. I wanted to have dinner with my best friend tonight.)"],
 'return.q1':['clerk','Your student number, please.'],
 'return.protest':['student','Haven’t you already asked me that?'],
 "return.form":["clerk", "Sorry, miss. We need to fill out the registration form again."],
 'return.a1':['student','{studentNumber}.'],
 'return.q2':['clerk','And your passport number?'],
 "return.a2":["student", "{passport}."],
 "return.closed":["clerk", "Sorry, miss. We’ve finished work for the day. Please come back tomorrow."],
};
const practiceRecord={name:'APPLICANT 001',file:'001',title:'APPLICANT RECORD',status:'PENDING',tasks:[
 {label:'Verify student number',value:'{practiceStudentNumber}'},
 {label:'Verify passport number',value:'{practicePassport}'},
 {label:'Confirm applicant identity',value:'Identity photograph'}
]};
const tutorialSteps=[
 {id:'tutorial.board',action:'task',task:0,focus:'#clipboard'},
 {id:'tutorial.compareStudent',action:'check',task:0,focus:'#clipboard'},
 {id:'tutorial.passport',action:'task',task:1,focus:'#clipboard'},
 {id:'tutorial.comparePassport',action:'check',task:1,focus:'#clipboard'},
 {id:'tutorial.identity',action:'task',task:2,focus:'#clipboard'},
 {id:'tutorial.computer',action:'open',task:2,focus:'#computer'},
 {id:'tutorial.ruler',action:'measure',task:2,focus:'#computer'},
 {id:'tutorial.lens',action:'lens',task:2,focus:'#computer'},
 {id:'tutorial.close',action:'close',task:2,focus:'#computer'},
 {id:'tutorial.confirm',action:'check',task:2,focus:'#clipboard'},
 {id:'tutorial.buttons',action:'pending',task:2,focus:'#tray'}
];
const visits=[
 {id:'student-first',person:'student',time:8*60,endTime:10*60,name:'studentName',intro:['student.intro1','student.intro2'],tasks:[
  {label:'Verify student number',value:'{studentNumber}',dialogue:['student.q1','student.a1']},
  {label:'Verify passport number',value:'{passport}',dialogue:['student.q2','student.a2']},
  {label:'Confirm applicant identity',value:'Identity photograph on file',dialogue:[],photo:'first'}]},
 {id:'young',person:'young',time:10*60,endTime:11*60,name:'youngName',intro:[],tasks:[
  {label:'Verify health clearance',value:'{youngHealth} · CLEAR',dialogue:['common.health.q','young.health.a']},
  {label:'Master’s degree or higher',value:'PhD · {youngUniversity}',dialogue:['common.degree.q','young.degree.a']},
  {label:'Age under 35',value:'DOB {youngBirth}',dialogue:['common.age.q','young.age.a']}]},
 {id:'uncle',person:'uncle',time:11*60,endTime:12*60,name:'uncleName',intro:[],tasks:[
  {label:'Verify health clearance',value:'{uncleHealth} · CLEAR',dialogue:['common.health.q','uncle.health.a']},
  {label:'Master’s degree or higher',value:'MA · {uncleUniversity}',dialogue:['common.degree.q','uncle.degree.a']},
  {label:'Age under 35',value:'DOB {uncleBirth}',dialogue:['common.age.q','uncle.age.a']}]},
 {id:'alex',person:'alex',time:14*60,endTime:16*60,name:'alexName',intro:['alex.intro'],tasks:[
  {label:'Confirm circumstances',value:'Bankruptcy · {homelessSince}',dialogue:['alex.q1','alex.a1']},
  {label:'Check housing application',value:'Registered {housingSince}',dialogue:['alex.q2','alex.a2']},
  {label:'Check support application',value:'Depression · {mentalSince}',dialogue:['alex.q3','alex.a3']}]},
 {id:'student-return',person:'student',time:provisional.returnTime,endTime:17*60,name:'studentName',intro:['return.intro','return.thought'],tasks:[
  {label:'Verify student number',value:'{studentNumber}',dialogue:['return.q1','return.protest','return.form','return.a1']},
  {label:'Verify passport number',value:'{passport}',dialogue:['return.q2','return.a2']},
  {label:'Confirm applicant identity',value:'Updated identity photograph',dialogue:[],photo:'corrected'}]}
];
function text(value){return String(value).replace(/\{(\w+)\}/g,(_,key)=>String(provisional[key]??provisional.photo[key]??'{'+key+'}'))}
function lineText(id,visitIndex){return root.URI18n?root.URI18n.line(id,visitIndex):text(lines[id][1])}
const data={lineText,practiceRecord,tutorialSteps,locale:'en',provisional,lines,visits,text,approvalTimeoutMs:4200,lunchBlackoutMs:4400,lunchPaperMs:1600,lunchClearMs:450,endingText:''};
if(typeof module!=='undefined')module.exports=data;else root.URStoryContent=data;
})(typeof window!=='undefined'?window:globalThis);
