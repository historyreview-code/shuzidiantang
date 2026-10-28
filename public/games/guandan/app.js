(function(){
  'use strict';
  const G=window.Guandan,S=window.GuandanSpeech,H=window.GuandanLayout,KEY='guandan-lab-v1';
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  (function injectFx(){
    if(document.getElementById('gd-fx-style'))return;
    const st=document.createElement('style'); st.id='gd-fx-style';
    st.textContent=`.flat-hand{perspective:900px}.flat-hand .hand-card-unit{transform-style:preserve-3d;transition:transform .12s ease,filter .12s ease}.flat-hand .hand-card-unit:hover{transform:translateY(-6px) rotateX(7deg) scale(1.04);filter:brightness(1.08)}.table-status{flex-wrap:wrap;gap:8px}.topbar{flex-wrap:wrap;gap:10px;height:auto;padding:10px 0}.seat .action-label{min-height:16px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gd-win{position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden}.gd-win i{position:absolute;top:-10vh;width:10px;height:16px;animation:gdFall linear forwards}.gd-win .banner{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font:800 42px/1.2 Georgia,serif;color:#ffe38a;text-shadow:0 6px 24px #000a;animation:gdPop .8s ease-out both}@keyframes gdFall{to{transform:translateY(120vh) rotate(540deg)}}@keyframes gdPop{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}`;
    document.head.appendChild(st);
  })();
  function celebrateWin(){ if(document.querySelector('.gd-win'))return; const wrap=document.createElement('div');wrap.className='gd-win';const banner=document.createElement('div');banner.className='banner';banner.textContent='胜利';wrap.appendChild(banner);const colors=['#e6c979','#7fd1a5','#71b7ff','#ff9f7a','#f4f0c8'];for(let i=0;i<80;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'vw';p.style.background=colors[i%colors.length];p.style.animationDuration=(1.6+Math.random()*1.6)+'s';p.style.animationDelay=(Math.random()*0.5)+'s';wrap.appendChild(p);}document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),4200); }
  (function welcome(){ if(localStorage.getItem('gdWelcomed')==='1')return; const play=()=>{try{const a=new Audio('/games/guandan/voice/welcome.m4a');a.volume=.9;a.play().then(()=>{localStorage.setItem('gdWelcomed','1');}).catch(()=>{});}catch(e){}}; const once=()=>{play();document.removeEventListener('pointerdown',once);document.removeEventListener('keydown',once);}; document.addEventListener('pointerdown',once,{once:true}); document.addEventListener('keydown',once,{once:true}); })();
  const seats=['你','下家','搭档','上家'];
  let db={current:null,records:[],attempts:[],reviewed:[]},storageOK=true;
  try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&typeof data==='object')db={...db,...data,records:Array.isArray(data.records)?data.records:[],attempts:Array.isArray(data.attempts)?data.attempts:[],reviewed:Array.isArray(data.reviewed)?data.reviewed:[]};}catch{storageOK=false;}
  let toolsOpen=false,hintSeen=false,speechUnlocked=false,arrangeMode=false,arrangeSelected=[],dealWaiting=false,layoutUndo=[],dragState=null,suppressLayoutClick=0;
  let botMode='local'; // 智能出牌已下线，始终本地策略
let difficulty='expert'; // 难度固定为最高（专家/高手），不提供切换
  let handMode=H.modes.includes(db.handMode)?db.handMode:'rank';
  db.handOrders=db.handOrders&&typeof db.handOrders==='object'&&!Array.isArray(db.handOrders)?db.handOrders:{};
  db.handLayouts=db.handLayouts&&typeof db.handLayouts==='object'&&!Array.isArray(db.handLayouts)?db.handLayouts:{};
  let record,states,view='practice',cursor=0,review=false,selected=[],declarationKey='',showHint=false,showAll=false,paused=false,autoHero=false,delay=180,playDelay=1000,timer=null,lastToastTimer;
  const freshSeed=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0].toString(36).toUpperCase();};
  const newId=()=>`g-${Date.now().toString(36)}-${freshSeed()}`;
  function createRecord(start,events=[],lessonId=null){return {format:'guandan-lab-record-v1',id:newId(),created:new Date().toISOString(),title:`实战 · 打 ${G.rankName(start.level)}`,start,events:events.map(a=>a.origin?a:{...a,origin:'lesson'}),lessonId,branchOf:null,notes:{}};}
  try{record=db.current?G.importRecord(db.current):createRecord(G.deal(freshSeed(),2));}catch{record=createRecord(G.deal(freshSeed(),2));}
  states=G.replay(record.start,record.events);cursor=record.events.length;
  dealWaiting=!states.at(-1).over&&(db.waitingRecord===record.id||(record.start.kind==='full'&&!record.events.length&&db.readyRecord!==record.id));
  arrangeMode=!states.at(-1).over&&(db.arranging===record.id||dealWaiting);
  const narrator=(location.protocol==='file:'?S.create:S.createRemote)({onChange:updateSpeechUI,onIdle:schedule});
  narrator.setRate(db.speechRate||1);
  narrator.enable(db.speechEnabled!==false);
  function toast(t){$('#toast').textContent=String(t).replace(/minimax(?:[-\s]+M\d+(?:\.\d+)*(?:[-\s]+Flash)?)?/gi,'AI分析');$('#toast').classList.add('visible');clearTimeout(lastToastTimer);lastToastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
  function save(){db.botMode=botMode;db.playModeVersion=2;db.current=record;db.waitingRecord=dealWaiting?record.id:null;if(!dealWaiting)db.readyRecord=record.id;db.arranging=arrangeMode?record.id:null;db.handMode=handMode;db.handOrders=Object.fromEntries(Object.entries(db.handOrders).filter(([id])=>id===record.id||db.records.some(r=>r.id===id)));db.handLayouts=Object.fromEntries(Object.entries(db.handLayouts).filter(([id])=>id===record.id||db.records.some(r=>r.id===id)));try{localStorage.setItem(KEY,JSON.stringify(db));storageOK=true;}catch{storageOK=false;toast('浏览器存储不可用或空间不足，请导出牌谱保存。');}}
  function archive(r=record,force=false){if(!r.events.length&&!force)return;const copy=G.clone(r),i=db.records.findIndex(x=>x.id===r.id);if(i>=0)db.records[i]=copy;else db.records.unshift(copy);db.records=db.records.slice(0,20);save();}
  const current=()=>states[cursor];
  const atLive=()=>!review&&cursor===record.events.length;
  const myTurn=()=>!arrangeMode&&!dealWaiting&&atLive()&&!current().over&&current().turn===0&&!autoHero;
  function stop(){clearTimeout(timer);timer=null;}
  function setRecord(r,isReview=false,waitForStart=false){stop();battle.cancel();ai.stopReading();narrator.cancel();record=r;states=G.replay(r.start,r.events);cursor=isReview?0:r.events.length;review=isReview;dealWaiting=!isReview&&!states.at(-1).over&&(waitForStart||(r.start.kind==='full'&&!r.events.length));arrangeMode=dealWaiting;layoutUndo=[];arrangeSelected=[];selected=[];declarationKey='';showHint=false;hintSeen=false;showAll=false;paused=false;autoHero=false;view='practice';toolsOpen=isReview;save();announce(isReview?'进入复盘。'+S.turnText(current()):'开始练习，打'+S.rank(current().level)+'。'+S.turnText(current()));render();}
  function cardHTML(c,opts={}){
    const l=current()?.level||2,w=G.wild(c,l),sel=(arrangeMode?arrangeSelected:selected).includes(c.id),red=c.s==='H'||c.s==='D'||c.r===17;
    const cls=['card',red?'red':'',w?'wild':'',c.r>=16?'joker':'',opts.mini?'mini':'',opts.selectable?'selectable':'',opts.selectable&&sel?'selected':''].filter(Boolean).join(' ');
    const body=`<span class="rank">${esc(G.rankName(c.r))}</span><span class="suit">${G.SYMBOLS[c.s]}</span>${w?'<span class="wild-mark">配</span>':''}`;
    return opts.selectable?`<button class="${cls}" data-action="card" data-id="${c.id}" aria-label="${esc(G.name(c))}${w?'，配牌':''}" aria-pressed="${sel}" ${opts.draggable?'data-drag-card="true" title="拖动调整位置；点按选择"':''} ${!opts.draggable&&!myTurn()&&!arrangeMode?'disabled':''}>${body}</button>`:`<span class="${cls}" title="${esc(G.name(c))}">${body}</span>`;
  }
  function selectedMoves(){const s=current(),cards=selected.map(id=>s.hands[0].find(c=>c.id===id)).filter(Boolean);return cards.length?G.classify(cards,s.level).filter(m=>G.beats(m,s.trick?.move)):[];}
  function titleHTML(){const titles={archive:['历史牌局','选择一副牌，回看真实的每一步。'],tools:['分析与辅助','按需查看，不打断牌桌。']};if(view==='practice')return '';const t=titles[view];return `<section class="intro"><div><h1>${t[0]}</h1><p>${t[1]}</p></div></section>`;}
  function seatHTML(p,place,s){const finished=s.finish.indexOf(p);let label='';const last=s.lastActions[p];if(last)label=last.kind==='pass'?'过牌':G.describe(last.move);return `<div class="seat ${p%2===0?'ally':'opponent'} ${place} ${!s.over&&s.turn===p?'active':''}" data-action="seatHistory" data-seat="${p}" role="button" tabindex="0" title="查看${p===0?'我':seats[p]}的出牌记录"><div class="avatar">${p===0?'我':p===2?'友':'对'}</div><div class="seat-name">${p===2?'搭档':seats[p]}<span>${!s.over&&s.turn===p?'轮到出牌':p%2===0?'我方':'对手'}</span></div><div class="count">${finished>=0?`<strong class="finish-place">${['头游','二游','三游','末游'][finished]}</strong>${s.hands[p].length?`<small>余 ${s.hands[p].length} 张</small>`:''}`:`剩 <b>${s.hands[p].length}</b> 张`}</div>${!s.hands[p].length?'':`<div class="cardback-stack" aria-hidden="true">${'<i></i>'.repeat(5)}</div>`}<div class="action-label">${esc(label)}</div></div>`;}
  function trickHTML(s){if(s.over)return `<div class="table-empty"><div class="big-suit">${s.result.team===0?'♠':'♣'}</div><b>${s.result.team===0?'你和搭档获胜':'对方组合获胜'}</b><p>${s.result.doubleDown?(s.result.team===0?'你和搭档包揽头游、二游 · 双上':'对方包揽头游、二游 · 双下'):`名次：${s.finish.map(p=>seats[p]).join(' → ')}`}</p><button class="button gold small" data-action="summary">查看本副复盘</button></div>`;if(!s.trick)return `<div class="table-empty"><div class="big-suit">♠</div><b>${s.turn===0?'轮到你领出':`${seats[s.turn]}领出`}</b><p>${esc(s.leadReason)}</p></div>`;return `<div class="trick-caption">${seats[s.trick.seat]} 的出牌</div><div class="table-cards">${G.displayIds(s.trick.move,s.level).map(id=>cardHTML(G.INDEX[id],{mini:true})).join('')}</div><div class="table-note">${G.describe(s.trick.move)}</div>${s.trick.move.assign.some(a=>a.r!==s.level||a.s!=='H')?`<div class="disclosure">${s.trick.move.assign.map(a=>`${G.name(G.INDEX[a.id])} → ${G.SYMBOLS[a.s]}${G.rankName(a.r)}`).join('，')}</div>`:''}`;}
  const canArrangeHand=()=>atLive()&&!current().over&&current().hands[0].length>0;
  const displayedHand=()=>H.orderedCards(current().hands[0],current().level,review&&handMode==='groups'?'rank':handMode,db.handOrders[record.id],db.handLayouts[record.id]);
  const displayedOrder=()=>displayedHand().map(c=>c.id);
  function commitOrder(order){
    layoutUndo.push({mode:handMode,order:displayedOrder()});layoutUndo=layoutUndo.slice(-20);
    db.handOrders[record.id]=H.normaliseOrder(order,current().hands[0]);handMode='groups';save();render();
  }
  function tapCard(id){
    if(arrangeMode){arrangeSelected=arrangeSelected.includes(id)?arrangeSelected.filter(x=>x!==id):[...arrangeSelected,id];render();return;}
    if(!myTurn())return;selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];render();
  }
  function finishArranging(){if(dealWaiting)window.GuandanMetrics.track('started',record);arrangeMode=false;dealWaiting=false;arrangeSelected=[];selected=[];declarationKey='';save();announce(S.turnText(current()));render();}
  function handHTML(){const s=current(),canArrange=canArrangeHand(),mode=review&&handMode==='groups'?'rank':handMode;
    return `<div class="hand-order-toolbar"><strong>我的手牌 <b>${s.hands[0].length}</b> 张</strong>${arrangeMode?`<label class="sr-only" for="hand-sort">手牌顺序</label><select id="hand-sort">${[['rank','点数'],['suit','花色'],['groups','自由']].map(([key,label])=>`<option value="${key}" ${mode===key?'selected':''}>${label}</option>`).join('')}</select>`:''}${canArrange?`${layoutUndo.length?'<button class="text-control" data-action="undoLayout">撤销</button>':''}${!arrangeMode?'<button class="text-control" data-action="arrangeStart">理牌</button>':''}`:''}</div><div class="flat-hand" aria-label="连续手牌，可拖动调整相邻次序">${displayedHand().map(c=>`<div class="hand-card-unit" data-layout-card="${c.id}">${cardHTML(c,{selectable:!review&&!s.over,draggable:canArrange})}</div>`).join('')||'<p class="subtle">你已走完，继续观察搭档。</p>'}</div>${arrangeMode?'<p class="flat-hand-tip">点选多张，拖动任一选中牌一起换位。</p>':''}`;
  }
  function actionDockHTML(s,moves){
    if(review)return `<div class="play-dock replay-dock">${progActive()?'<button class="button primary" data-action="nextRound">继续升级赛</button>':''}<button class="button" data-action="rotateSeat">换座重打</button><button class="button" data-action="branch" ${branchStep()<0?'disabled':''}>原位重试</button><button class="button" data-action="reveal">${showAll?'收起全牌':'查看全牌'}</button></div>`;
    if(s.over)return '<div class="play-dock">'+(progActive()?'<button class="button primary" data-action="nextRoundGo">继续升级</button>':'')+'<button class="button" data-action="freeDeal">自由打牌</button><button class="button" data-action="reviewStart">复盘本局</button><button class="button" data-action="rotateSeat">换座</button><button class="button ghost" data-action="home">退出</button></div>';
    if(arrangeMode||dealWaiting){const order=displayedOrder(),picked=order.filter(id=>arrangeSelected.includes(id)),first=order.indexOf(picked[0]),last=order.indexOf(picked.at(-1));return `<div class="play-dock arranging" aria-label="理牌与出牌切换"><button class="button primary finish-arranging" data-action="arrangeDone">${dealWaiting?(record.perspective?'开始接手':'开始出牌'):'完成理牌'}</button><div class="arrange-selection"><span>${picked.length?'已选 '+picked.length+' 张 · 拖动任一选中牌一起移动':'点选多张一起移动，也可直接拖动单张'}</span>${picked.length?'<button class="text-control" data-action="clearArrange">取消选择</button>':''}</div>${picked.length?`<div class="nudge-controls"><button class="button small" data-action="nudgeCard" data-dir="-1" ${first<=0?'disabled':''}>整组前移</button><button class="button small" data-action="nudgeCard" data-dir="1" ${last===order.length-1?'disabled':''}>整组后移</button></div>`:''}</div>`;}
    if(!myTurn())return `<div class="play-dock waiting" aria-label="等待对手"><span>${current().turn===0?'电脑正在替你出牌':seats[current().turn]+'的回合'}</span><button class="button primary" data-action="hurry" ${!canHurry()?'disabled':''}>催促出牌</button><button class="button" data-action="undoStep" ${!record.events.some(a=>a.seat===0)?'disabled':''}>撤销上一手</button><small>本步由本地策略接手</small></div>`;
    const chosen=moves.find(m=>m.key===declarationKey),assignment=chosen?.assign?.filter(a=>a.r!==s.level||a.s!=='H').map(a=>`${G.name(G.INDEX[a.id])}作${G.SYMBOLS[a.s]}${G.rankName(a.r)}`).join('，');
    return `<div class="play-dock" aria-label="出牌操作"><div class="play-buttons"><button class="button primary" data-action="play" ${!myTurn()||!moves.length?'disabled':''}>${selected.length?'出牌 · '+selected.length+' 张':'出牌'}</button><button class="button" data-action="pass" ${!myTurn()||!s.trick?'disabled':''}>过牌</button><button class="button ghost" data-action="clear" ${!selected.length?'disabled':''}>清空</button><button class="button ghost" data-action="undoStep" ${!record.events.some(a=>a.seat===0)?'disabled':''} title="撤销你上一手出牌">撤销上一手</button></div><div class="declaration">${selected.length?moves.length?`${moves.length>1?`<label for="declaration">配牌方式</label><select id="declaration" aria-label="配牌方式">${moves.map(m=>`<option value="${esc(m.key)}" ${m.key===declarationKey?'selected':''}>${G.describe(m)}</option>`).join('')}</select>`:`<span>${esc(G.describe(chosen))}</span>`}${assignment?`<span class="assignment-note">${esc(assignment)}</span>`:''}`:'<span>所选牌不能出，请重新选择。</span>':`<span>${myTurn()?'轮到你 · 点选手牌':'等待其他玩家 · 仍可拖动理牌'}</span>`}</div></div>`;
  }
  function gameHTML(){const s=current(),moves=selectedMoves();if(!moves.some(m=>m.key===declarationKey))declarationKey=moves[0]?.key||'';return `<div class="panel game-panel">${perspectiveHTML()}${review?`<div class="replay-badge"><span>回放 ${cursor} / ${record.events.length} 步</span><button class="button small" data-action="live">返回牌桌</button></div>`:''}<div class="table-status"><b>打 ${G.rankName(s.level)}</b>${progHUD()}${review?`<span class="mode-label">复盘</span>`:``}<span data-battle-status>${esc(battleStatus())}</span></div><div class="felt">${seatHTML(2,'north',s)}${seatHTML(3,'west',s)}${seatHTML(1,'east',s)}<div class="table-center">${trickHTML(s)}</div>${seatHTML(0,'south',s)}</div><div class="sr-only">${speechHTML()}</div><div class="hand-area">${handHTML()}</div>${actionDockHTML(s,moves)}${showAll&&review?`<div class="reveal-hands"><div class="subtle">明牌仅用于事后复盘。</div>${[1,2,3].map(p=>`<div class="row"><span>${seats[p]}</span><div class="cards">${G.sort(s.hands[p],s.level).map(c=>cardHTML(c,{mini:true})).join('')||'已走完'}</div></div>`).join('')}</div>`:''}</div>`;}
  function timelineHTML(){return `<section class="panel timeline"><div class="panel-header"><h2>行动时间线 <span class="subtle">${record.events.length} 步已记录</span></h2><button class="button small ghost" data-action="reviewStart">进入复盘</button></div><div class="timeline-controls"><button class="button small" data-action="prev" ${cursor===0?'disabled':''}>← 上一步</button><input aria-label="回放进度" id="timeline-range" type="range" min="0" max="${Math.max(1,record.events.length)}" value="${cursor}" ${!record.events.length?'disabled':''}><span class="position">${cursor} / ${record.events.length}</span><button class="button small" data-action="next" ${cursor===record.events.length?'disabled':''}>下一步 →</button></div><div class="event-list">${record.events.length?record.events.map((a,i)=>`<button class="event-row ${cursor===i+1?'active':''} ${a.seat===0?'hero':''}" data-action="goto" data-step="${i+1}"><span class="event-no">${String(i+1).padStart(2,'0')}</span><b>${seats[a.seat]}</b><span class="event-text">${a.kind==='pass'?'过牌':G.describe(a.move)}</span><span class="event-cards">${a.kind==='play'?G.displayIds(a.move,current().level).map(id=>G.name(G.INDEX[id])).join(' '):''}</span>${a.seat===0?`<span class="tag">${originLabel(a,i)}</span>`:''}</button>`).join(''):'<div class="empty">出第一手牌，时间线就从这里开始。</div>'}</div></section>`;}
  function speechHTML(){const v=narrator.snapshot();return `<section class="speech-panel" aria-label="自动语音播报"><span class="signal-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="speech-caption">${esc(!v.enabled?v.status:(v.text||'语音已就绪 · 首次点击后自动播报'))}</span><span class="speech-status">${v.busy?(v.status==='正在播报…'?'LIVE':'WAIT'):v.enabled?'AUTO':'MUTE'}</span></section>`;}
  function updateSpeechUI(){const v=narrator.snapshot();if($('.speech-status'))$('.speech-status').textContent=v.busy?(v.status==='正在播报…'?'LIVE':'WAIT'):v.enabled?'AUTO':'MUTE';if($('.speech-caption'))$('.speech-caption').textContent=!v.enabled?v.status:(v.text||'语音已就绪 · 首次点击后自动播报');const checkbox=$('#speech-enabled');if(checkbox)checkbox.checked=v.enabled;}
  function announcement(){return cursor>0?S.actionText(record.events[cursor-1],current(),review):(review?'初始局面。':'')+S.turnText(current());}
  function announce(text){stop();if(speechUnlocked)narrator.say(text);}
  function originLabel(a,index=-1){if(record.perspective&&index>=0&&index<record.perspective.atStep)return '原局记录';return a.origin==='bot'?(a.decision?.source==='minimax'?'AI分析':a.decision?.failure?'本地接替':a.decision?.source==='rules'?'确定性收尾':'本地电脑'):a.origin==='human'?(a.assisted?'参考过提示':'自主选择'):a.origin==='lesson'?'题目预设':'来源未记录';}
  function decisionAt(){if(review&&cursor>0)return cursor-1;for(let i=record.events.length-1;i>=0;i--)if(record.events[i].seat===0)return i;return -1;}
  function coachHTML(){const s=current(),o=G.observe(s,0),d=decisionAt();let body='';
    if(review&&cursor>0){const a=record.events[d],feedback=G.explainChoice(states[d],a);body=`<div class="coach-label">DECISION REVIEW / 决策拆解</div><h3>第 ${d+1} 步，${seats[a.seat]}${a.kind==='pass'?'选择过牌':`打出${G.describe(a.move)}`}</h3><span class="tag">当时信息视角 · ${originLabel(a,d)}</span>${feedback.facts.map(x=>`<p><b>可验证事实：</b>${esc(x)}</p>`).join('')}${feedback.reasons.map(x=>`<p>${esc(x)}</p>`).join('')}<div class="notice">${feedback.missedFinish?'当时存在一手出完的合法选择，可回到该节点比较。':'这一解释依据公开行动、剩余张数和该玩家自己的手牌，不使用其他玩家的隐藏牌。'}</div><h3 style="font-size:14px">当时的可讨论方案</h3>${feedback.alternatives.slice(0,3).map((x,i)=>hintHTML(x,i,false)).join('')}<button class="button primary" data-action="branch" ${branchStep()<0?'disabled':''}>另开分支，亲自试一遍</button>`;}
    else if(s.over){const own=record.events.map((a,i)=>({a,i})).filter(x=>x.a.seat===0),flags=own.map(x=>G.explainChoice(states[x.i],x.a));body=`<div class="coach-label">SESSION REVIEW / 本副小结</div><h3>结果之外，回看你的选择。</h3><p>你的位置共 ${own.length} 次行动，其中 ${own.filter(x=>x.a.origin==='human'&&x.i>=(record.perspective?.atStep||0)).length} 次由你操作。${s.result.team===0?'本副你和搭档获胜。':'本副对方组合获胜。'}胜负同时受到牌序和其他玩家策略影响。</p><div class="checklist"><div class="check-row"><em>01</em><div>搭档配合<small>找一手搭档控牌时的选择</small></div></div><div class="check-row"><em>02</em><div>出完机会<small>${flags.filter(f=>f.missedFinish).length} 次有可直接走完的方案未采用</small></div></div><div class="check-row"><em>03</em><div>换条路线<small>从同一节点分支，不覆盖原局</small></div></div></div><button class="button primary" data-action="reviewStart">开始逐步复盘</button><div class="notice">电脑可使用 AI分析进行协作决策；每步来源和简短理由写入牌谱。战胜它不能直接证明达到真实牌桌的某个水平。</div>`;}
    else if(showHint&&myTurn()){const candidates=G.analyse(o).slice(0,3);body=`<div class="coach-label">THINKING / 当前思路</div><h3>先看结构，再决定控制权。</h3><p>这几种方案来自本地结构评分。排序用于启发思考，不代表胜率或最优解。</p>${candidates.map((x,i)=>hintHTML(x,i,true)).join('')}<button class="button small ghost" data-action="hideHint">收起提示，自己想一想</button><div class="notice">只使用你的手牌、公开出牌和各家剩余张数。配牌组合与部分花色选择并未穷尽。</div>`;}

    if(review&&d>=0&&record.events[d].decision){const trace=record.events[d].decision;body+=`<details class="secondary-details ai-decision" open><summary>${esc(originLabel(record.events[d],d))} · 当时的决策说明</summary><p>${esc(trace.reason)}</p>${trace.teamwork?`<p><b>搭档配合：</b>${esc(trace.teamwork)}</p>`:''}${trace.nextPlan?`<p><b>后续计划：</b>${esc(trace.nextPlan)}</p>`:''}${trace.failure?`<p>${esc(String(trace.failure).replace(/minimax(?:[-\s]+M\d+(?:\.\d+)*(?:[-\s]+Flash)?)?/gi,'AI分析'))}</p>`:''}<small>${esc(originLabel(record.events[d],d))}${trace.cached?' · 读取同局面缓存':''} · 随牌谱保留的简短说明，不代表完整思考过程；导入记录中的说明未经独立核实。</small></details>`;}
    if(review&&d>=0)body+=`<div class="reflection"><label for="decision-note">第 ${d+1} 步 · 我的复盘笔记</label><textarea id="decision-note" maxlength="1000" rows="4" data-step="${d}" placeholder="当时想保留什么？另一种选择适合什么条件？">${esc(record.notes?.[d]||'')}</textarea><small>输入即保存，随牌谱一起导出。这里记录的是事后反思。</small></div>`;
    return `<details class="panel practice-tools" ${toolsOpen?'open':''}><summary>复盘与辅助工具 <span>AI分析 · 同花顺助手 · 决策拆解</span></summary><div class="coach"><div class="coach-body">${ai.html()}${flushHTML()}${!review&&!s.over&&!showHint?`<button class="button" data-action="hint" ${!myTurn()?'disabled':''}>查看候选思路</button>`:''}${body}</div></div></details>`;
  }
  function flushHTML(){
    const s=current(),found=G.findStraightFlushes(s.hands[0],s.level,s.trick?.move);
    return `<details class="flush-helper secondary-details" data-tool="flush"><summary>♠ 同花顺发现助手 <span>展开检查你的手牌</span></summary><p>只看你在当前时刻的手牌。同花色五张相连，A 可接 2 或作最高牌；不能首尾绕接。</p>${found.length?`<p><b>发现 ${found.length} 种组合</b> · ${found.filter(x=>x.natural).length} 种天然 · ${found.filter(x=>x.playable).length} 种可领出或压过桌面</p>${found.map((x,i)=>`<div class="flush-option"><div class="head"><strong>${G.SYMBOLS[x.suit]} ${x.ranks.map(G.rankName).join(' · ')}</strong><span class="tag ${x.natural?'':'gold'}">${x.natural?'天然同花顺':`配牌补 ${x.replacements.length} 张`}</span></div><div class="flush-cards">${x.move.ids.map(id=>cardHTML(G.INDEX[id],{mini:true})).join('')}</div><p>${x.replacements.length?x.replacements.map(a=>`${G.name(G.INDEX[a.id])} 当作 ${G.SYMBOLS[a.s]}${G.rankName(a.r)}`).join('；'):'五张原牌即可组成，无需替代点数或花色。'}</p><button class="button small" data-action="pickFlush" data-index="${i}" ${(!arrangeMode&&!myTurn())||(!arrangeMode&&!x.playable)?'disabled':''}>${arrangeMode?'将这几张排在一起':!x.playable?'本轮无法压过':review?'复盘中仅查看':myTurn()?'选中这组同花顺':'等待轮到你'}</button></div>`).join('')}`:'<div class="flush-empty">当前没有可组成的同花顺，已把红桃级牌的补位方式一起检查。</div>'}<p class="subtle">同花顺大于五张炸弹、小于六张炸弹。同花色与点数相同的两副牌只展示一组；选中后仍需确认出牌。</p></details>`;
  }
  function hintHTML(x,i,interactive){return `<div class="hint-card"><div class="head"><strong>${x.move?G.describe(x.move):'过牌，保留手牌'}</strong><span class="index">0${i+1}</span></div><p>${esc(x.facts[0])}</p><p>${esc(x.reasons[0])}</p>${interactive?`<button class="button small" data-action="pickHint" data-index="${i}">${x.move?'选中这组牌':'选择过牌'}</button>`:''}</div>`;}
  function archivePage(){return `<div class="inline-note">最近 20 副记录保存在当前浏览器。跨设备使用前请导出 JSON 牌谱；导入会重新检查每一步是否合法。分支保留父局编号，不能把不同分支的胜负当成稳定胜率。</div><div class="archive-grid">${db.records.map(r=>{let end;try{end=G.replay(r.start,r.events).at(-1);}catch{return '';}return `<article class="panel archive-card"><div class="archive-icon">${r.lessonId?'◈':'♠'}</div><div class="archive-info"><h2>${esc(r.title)} ${r.branchOf?'<span class="tag gold">分支</span>':''}</h2><p>${esc(new Date(r.created).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}))} · ${r.events.length} 步 · ${end.over?(end.result.team===0?'你方胜':'对方胜'):'尚未结束'}<br>发牌编号 ${esc(r.start.seed)} · ${r.start.kind==='full'?'完整 108 张发牌':'精选教学局面'}</p></div><div class="archive-actions"><button class="button primary small" data-action="openRecord" data-id="${esc(r.id)}">逐步复盘</button><details class="archive-more"><summary>更多</summary><button class="button small" data-action="exportRecord" data-id="${esc(r.id)}">导出牌谱</button></details></div></article>`;}).join('')||'<div class="panel empty"><div class="suit-watermark">♧</div>完成一副或另开分支后，记录会出现在这里。<br>当前进度会自动保存。</div>'}</div>`;}
  function render(){const scrollEvent=$('.event-list')?.scrollTop||0;$('#app').innerHTML=`<div class="shell ${view==='practice'?'practice-view':''}"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brandmark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M6 14 4 5l10 6h8l10-6-2 9v9l-6 8H12l-6-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m11 18 4 1m10-1-4 1m-6 5 3 3 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span><b>阿尔法掼蛋狗</b></span></a><div class="header-actions">${view!=='practice'||review?'<button class="button small" data-action="home">回牌桌</button>':''}<button class="button small" data-action="flushHelper" title="组同花顺建议">同花顺</button><button class="button small menu-button" data-action="settings" aria-label="游戏菜单">菜单</button></div></header>${titleHTML()}<main>${view==='practice'?`<div class="workspace"><div>${gameHTML()}</div>${review?timelineHTML()+coachHTML():''}</div>`:view==='tools'?coachHTML():archivePage()}</main>${view==='practice'&&!review?'':`<footer class="footer">阿尔法掼蛋狗 · v2.0 · 每一步可复盘</footer>`}</div>`;if($('.event-list'))$('.event-list').scrollTop=scrollEvent;schedule();}
  const battleKey=()=>`${record.id}:${record.events.length}:${current().turn}:${botMode}`;
  function battleStatus(){if(dealWaiting)return record.perspective?'接手准备中 · 先熟悉手牌':'发牌整理中 · 尚未开打';if(review)return '复盘模式';if(current().over)return '本副完成';if(paused)return '可催促重试';if(current().turn===0&&!autoHero)return '由你决定';return botMode==='minimax'?`${seats[current().turn]}${battle.pending(battleKey())?'思考 · '+(turnClock.remaining()??30)+'秒':'准备出牌'}`:`${seats[current().turn]}出牌中`;}
  function updateBattleStatus(){const el=$('[data-battle-status]');if(el)el.textContent=battleStatus();}
  function canAdvance(){return view==='practice'&&!review&&!paused&&!dealWaiting&&!dragState&&!document.hidden&&!$('#modal-root').children.length&&!narrator.snapshot().busy&&!current().over&&cursor===record.events.length&&(current().turn!==0||autoHero);}
  function canHurry(){return view==='practice'&&!review&&!dealWaiting&&!current().over&&atLive()&&(current().turn!==0||autoHero);}
  function localDecision(manual=false){const D=window.GuandanDifficulty;const pack=D&&D.analyseTop?D.analyseTop(G,current(),difficulty):{top:G.analyse(G.observe(current()))[0],tier:{name:'高手'}};
  // 与联机版一致：用 choose（含搭档保护/防跑牌/留王等硬规则）出决策，再用 analyse 结果做解释
  let chosenAction=null;
  try{chosenAction=G.choose(current(),current().turn,pack.W);}catch(e){chosenAction=null;}
  const x=(chosenAction&&chosenAction.move?(pack.rows||[]).find(r=>r.move&&r.move.key===chosenAction.move.key):null)||pack.top;return {action:(chosenAction&&chosenAction.move)?{seat:current().turn,kind:'play',move:chosenAction.move}:{seat:current().turn,kind:'pass'},source:'local',model:'本地策略·'+pack.tier.name,version:G.STRATEGY_VERSION,reason:(manual==='timeout'?'等待达到30秒，自动本地接替。':manual?'手动催促。':'')+x.reasons.slice(0,2).join('').slice(0,150),teamwork:x.strategy?.teamPlan||'依据搭档张数、控牌位置和公开行动配合。',nextPlan:x.strategy?.nextPlan||'根据下一轮公开行动调整。'};}
  function hurry(reason=true){if(!canHurry())return;stop();battle.cancel();narrator.cancel();paused=false;const result=localDecision(reason);takeAction(result.action,false,result);}
  function syncTurnClock(){turnClock.sync(battleKey(),canHurry()&&!document.hidden&&!$('#modal-root').children.length);turnClock.tick(()=>{hurry('timeout');toast('等待已满30秒，本步已由本地策略出牌。');});}
  // 出牌节奏：每张出牌至少停留 2 秒方便看清牌面；过牌即时确认。
  const heroFinished=()=>{try{return current().finish.includes(0)&&!current().over;}catch(e){return false;}};
  function paceAction(a,run){const fast=heroFinished();const wait=a.kind==='play'?(fast?90:Math.max(0,playDelay-delay)):0;if(wait>0){timer=setTimeout(run,wait);}else run();}
  function schedule(){stop();syncTurnClock();if(!canAdvance())return;const key=battleKey();if(botMode==='minimax'&&battle.pending(key))return;timer=setTimeout(()=>{
    if(!canAdvance()||key!==battleKey())return;
    try{
      if(botMode==='local'){const result=localDecision();paceAction(result.action,()=>takeAction(result.action,false,result));return;}
      const result=battle.ready(key);
      if(result){let action=result.action;try{G.apply(current(),action);}catch{action=G.choose(current());Object.assign(result,{source:'local',model:'本地策略',reason:'AI 返回动作未通过规则校验，本步由本地策略接替。',teamwork:'按本地队友配合规则选择。',nextPlan:'下一步继续尝试 AI 对战。',failure:'AI 动作已被规则引擎拦截。'});}if(result.failure)toast(result.failure+' 本步由本地策略接替。');paceAction(action,()=>takeAction(action,false,result));}
      else {const snapshot=G.clone(current());battle.request(key,record,()=>G.choose(snapshot));}
    }catch(e){paused=true;toast(e.message);render();}
  },heroFinished()?60:delay);}
  function takeAction(a,human=true,decision=null){if(human)window.GuandanMetrics.track('started',record);const before=states.at(-1),next=G.apply(before,a);const stored=a.kind==='play'?{seat:before.turn,kind:'play',move:next.lastActions[before.turn].move}:{seat:before.turn,kind:'pass'};stored.origin=human?'human':'bot';if(!human&&decision)stored.decision=G.decisionTrace(decision);battle.cancel();if(human&&hintSeen)stored.assisted=true;hintSeen=false;record.events.push(stored);states.push(next);cursor=record.events.length;selected=[];declarationKey='';showHint=false;try{if(next.over&&next.result&&next.result.team===0)celebrateWin();}catch(e){}
    if(next.over){autoHero=false;archive();window.GuandanMetrics.track('finished',record);}save();announce(S.actionText(stored,next));render();if(window.GuandanEffects.shouldCelebrate(before,next,!review))window.GuandanEffects.celebrate();}
  function doPlay(){if(!myTurn())return;const m=selectedMoves().find(x=>x.key===declarationKey);if(!m){toast('请选择合法牌型后再出牌。');return;}
  // 红心级牌不能单出（手里还有其它牌时）
  if(m.type==='single'&&current().hands[0].length>1){const c=G.INDEX[m.ids[0]];if(c.s==='H'&&c.r===current().level){toast('红心级牌不能单出：它可以当任意牌配成对子/顺子/炸弹');return;}}
  takeAction({seat:0,kind:'play',move:m});}
  function goto(step){view='practice';toolsOpen=true;stop();battle.cancel();arrangeMode=false;arrangeSelected=[];review=true;cursor=Math.max(0,Math.min(record.events.length,step));selected=[];showHint=false;autoHero=false;if(record.events.length&&!db.reviewed.includes(record.id)){db.reviewed.push(record.id);save();}announce(announcement());render();}
  function perspectiveHTML(){
    const p=record.perspective;if(!p)return '';
    const rootNames=['自己','下家','搭档','上家'],parent=db.records.some(r=>r.id===record.branchOf);
    return `<div class="perspective-bar"><span>换座练习 · 接手原局${rootNames[p.offset]}<small>${p.atStep?'第 '+p.atStep+' 步后接手；此前为原局记录':'同一副初始牌，从头重打'}</small></span>${parent?'<button class="text-control" data-action="returnParent">返回来源局</button>':''}</div>`;
  }
  function rotateModal(){
    openModal(`<div class="eyebrow">SAME DEAL / 换位思考</div><h2>换座重打</h2><p>接手另一家的手牌，体验他的取舍。四家牌张、搭档关系和原来的行动顺序不变；你始终显示在下方。</p><fieldset class="seat-picker"><legend>接手当前牌桌的哪个位置？</legend>${[2,1,3,0].map(p=>`<label><input type="radio" name="rotate-seat" value="${p}" ${p===2?'checked':''}><span><b>${p===0?'自己':seats[p]}</b><small>${p%2===0?'原来的我方':'原来的对方'}</small></span></label>`).join('')}</fieldset><p id="rotate-context" aria-live="polite"></p><div class="rotate-actions"><button class="button primary" data-action="confirmRotate" data-from="start">从头重打</button><button class="button" data-action="confirmRotate" data-from="cursor">从第 ${cursor} 步后接手</button></div><p class="subtle">先理牌，再点“开始接手”。接手后的其他三家重新决策，结果可能改变。原局保留在本机历史牌局中；这是已知牌局的练习，不计为新的实战局数。</p><button class="button ghost" data-action="closeModal">返回复盘</button>`);
    updateRotateChoice();
  }
  function updateRotateChoice(){
    const seat=Number($('[name="rotate-seat"]:checked')?.value??2),s=current(),can=!s.over&&s.hands[seat].length>0;
    const rootNames=['自己','下家','搭档','上家'],offset=record.perspective?.offset||0;
    $('#rotate-context').textContent=`接手原局${rootNames[(seat+offset)%4]}，新的搭档是原局${rootNames[(seat+offset+2)%4]}。`+(can?`当前剩 ${s.hands[seat].length} 张牌。`:s.over?'这一副已结束，请从头重打。':'这个位置已经走完，请从头重打。');
    $('[data-from="cursor"]').disabled=!can||cursor===0;
  }
  function startRotated(from){
    const seat=Number($('[name="rotate-seat"]:checked')?.value),step=from==='start'?0:cursor;
    const next=G.rotateRecord(record,seat,step,newId());
    next.title=`换座 · 原局${['自己','下家','搭档','上家'][next.perspective.offset]} · 打 ${G.rankName(next.start.level)}`;
    archive(record,true);closeModal();setRecord(next,false,true);window.scrollTo({top:0});
    toast('原局已保留。先熟悉这手牌，再点“开始接手”。');
  }
  function branchStep(){if(current().turn===0&&!current().over)return cursor;for(let i=cursor-1;i>=0;i--)if(states[i].turn===0&&!states[i].over)return i;return -1;}
  function branch(step){if(step<0)return;const parent=record.id;archive();const r=createRecord(G.clone(record.start),G.clone(record.events.slice(0,step)),record.lessonId);r.notes=Object.fromEntries(Object.entries(record.notes||{}).filter(([k])=>+k<step));r.branchOf=parent;if(record.perspective)r.perspective={...record.perspective,atStep:Math.min(step,record.perspective.atStep)};r.title=record.title+' · 分支';setRecord(r);toast(`已从第 ${step} 步后另开分支，原局保留在档案中。`);}
  function copyRecord(r){
    const text=JSON.stringify(r);
    const done=ok=>{openModal(`<h2>牌谱数据</h2><p>${ok?'已复制到剪贴板，可直接粘贴发送。':'自动复制受限，请长按下面文本框全选复制。'}</p><textarea readonly style="width:100%;height:180px;font:12px/1.4 monospace;background:#0b1626;color:#e9eefb;border:1px solid #35516d;border-radius:10px;padding:8px">${esc(text)}</textarea><div class="actions"><button class="button primary" data-action="closeModal">关闭</button></div>`);};
    const fallback=()=>{try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();const ok=document.execCommand('copy');ta.remove();done(ok);}catch(e){done(false);}};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>done(true)).catch(fallback);}else fallback();
  }
  function exportRecord(r){const blob=new Blob([JSON.stringify(r,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`掼蛋牌谱-${r.start.seed}-${r.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('牌谱已导出，可在此程序中重新导入。');}
  function openModal(content){stop();ai.stopReading();narrator.cancel();$('#modal-root').innerHTML=`<div class="modal-shade"><div class="modal" role="dialog" aria-modal="true">${content}</div></div>`;$('#modal-root button, #modal-root input')?.focus();}
  function closeModal(){ai.stopReading();narrator.cancel();$('#modal-root').innerHTML='';if(view==='practice'&&!paused)announce(announcement());schedule();}
  function settingsModal(){const v=narrator.snapshot();openModal(`<h2>游戏菜单</h2><label class="setting-row"><span>语音播报</span><input id="speech-enabled" type="checkbox" aria-label="语音播报" ${v.enabled?'checked':''}></label><div class="menu-actions"><button class="button" data-action="new">新开一局</button><button class="button" data-action="reviewStart">本局复盘</button><button class="button" data-action="tools">分析与辅助</button><button class="button gold" data-action="multiplayer">好友联机</button></div><details class="secondary-details menu-more"><summary>更多</summary><p data-usage-stats>正在读取体验数据…</p><p data-app-version>版本 ${G.STRATEGY_VERSION} · 规则 ${G.VERSION} · 本地决策 ≤10 秒</p><button class="button small" data-ai-action="memory">策略经验</button><label for="speech-rate">播报语速</label><select id="speech-rate">${[[0.85,'稍慢'],[1,'正常'],[1.2,'稍快'],[1.4,'快速']].map(([n,t])=>`<option value="${n}" ${v.rate===n?'selected':''}>${t}</option>`).join('')}</select><div class="menu-actions"><button class="button small" data-action="speechRepeat">重播当前行动</button><button class="button small" data-action="autoplay" ${current().over||review?'disabled':''}>${autoHero?'结束观摩':'电脑代打观摩'}</button></div><details class="secondary-details"><summary>记录管理</summary><button class="button small" data-action="nav" data-view="archive">历史牌局</button><p>练习保存在当前浏览器，跨设备可导出、导入牌谱。</p><div class="menu-actions"><button class="button small" data-action="export">导出当前牌谱</button><button class="button small" data-action="copyRecord">复制牌谱到剪贴板</button><button class="button small" data-action="import">导入牌谱</button><button class="button small" data-action="undo" ${!record.events.some(a=>a.seat===0)?'disabled':''}>撤回并另开分支</button></div></details></details><button class="button" data-action="flushHelper">同花顺助手（组牌建议）</button><button class="button primary menu-done" data-action="closeModal">返回牌桌</button>`);window.GuandanMetrics.refresh();}
  function newModal(){openModal(`<div class="eyebrow">NEW SESSION</div><h2>开始新一副</h2><p>与三位电脑玩家练一副牌。对战方式可在首页随时切换，当前进度会自动保存。</p><div class="field-row" style="margin-bottom:8px"><div><label for="prog-tribute">进贡还贡</label><select id="prog-tribute"><option value="1" ${db.progress?.tribute!==false?'selected':''}>开启（真实规则）</option><option value="0" ${db.progress?.tribute===false?'selected':''}>关闭（练习净牌局）</option></select></div></div><div class="actions" style="margin-bottom:10px"><button class="button gold" data-action="startProgression">开始升级赛（→ A）</button></div><div class="field-row"><div><label for="new-level">本副打几</label><select id="new-level">${Array.from({length:13},(_,i)=>i+2).map(r=>`<option value="${r}" ${r===current().level?'selected':''}>打 ${G.rankName(r)}</option>`).join('')}</select></div><div><label for="new-lead">练习首发</label><select id="new-lead"><option value="0">由你先领出</option><option value="2">搭档先领出</option><option value="1">下家先领出</option><option value="3">上家先领出</option></select></div></div><p>本版固定级牌练单副，不模拟跨副进贡还贡。</p><div class="actions"><button class="button" data-action="closeModal">取消</button><button class="button primary" data-action="confirmNew">发牌，开始练习</button></div>`);}
    // ==== 升级赛（简单规则：头游 +2，双上 +3，输不升；打到 A 并赢下即通关）====
  const A_LEVEL=14;
  const progActive=()=>!!(db.progress&&db.progress.active&&!db.progress.finished);
  const progLevel=()=>db.progress?db.progress.level:2;
  function progDelta(){const st2=states.at(-1);if(!st2.over||!st2.result)return 0;const f=st2.finish;if(f[0]%2!==0)return 0;return f[1]%2===0?3:2;}
  function progHUD(){return progActive()?`<span class="mode-label">升级赛 · 打 ${G.rankName(progLevel())}</span>`:'';}
  function startProgression(){const lvSel=$('#new-level'),trSel=$('#prog-tribute');const startLevel=lvSel?Math.max(2,Math.min(A_LEVEL-1,+lvSel.value)):2;const useTribute=trSel?trSel.value!=='0':true;
    archive();closeModal();db.progress={active:true,level:startLevel,played:0,wins:0,badges:[],finished:false,tribute:useTribute};save();
    setRecord(createRecord(G.deal(freshSeed(),startLevel,0)));toast(`升级赛开始：从 ${G.rankName(startLevel)} 打到 A，头游 +2、双上 +3${useTribute?'，每局之间进贡还贡':'，不进贡'}。`);}
  function nextProgressionRound(){const st2=states.at(-1);const delta=progDelta();const f=st2.finish;const from=progLevel();let level=Math.min(A_LEVEL,from+delta);
    let finished=!!(st2.over&&st2.result&&st2.result.team===0&&from>=A_LEVEL);
    if(delta>0){db.progress.wins=(db.progress.wins||0)+1;
      const marks=[[3,'初出茅庐'],[6,'牌桌熟手'],[9,'掼蛋老练'],[A_LEVEL,'登顶 A 级']];
      for(const [lv,name] of marks){if(from<lv&&level>=lv&&!(db.progress.badges||[]).includes(name))db.progress.badges=[...(db.progress.badges||[]),name];}}
    db.progress.level=level;db.progress.played=(db.progress.played||0)+1;db.progress.finished=finished;save();closeModal();archive();
    if(finished){battle.cancel();stop();openModal(`<div class="result-hero"><div class="medal">🏆</div><h3>通关！</h3><p>从 2 一路打到 A，并赢下最后一局。</p></div><div class="summary-box">共 ${db.progress.played} 局，胜 ${db.progress.wins} 局。<br>徽章：${(db.progress.badges||[]).join(' · ')||'—'}</div><p class="subtle">截图保存这张通关记录，分享你的牌技进度。</p><div class="actions"><button class="button primary" data-action="closeModal">收下徽章</button><button class="button" data-action="startProgression">再来一轮</button></div>`);render();return;}
    let start;const seed=freshSeed();
    try{const base=G.deal(seed,level,0);const T=window.GuandanTribute;const use=T&&db.progress.tribute!==false&&st2.over;
      const res=use?T.resolve(base.hands.map(h=>h.map(c=>({...c}))),level,f):null;
      const lead=res?res.lead:f[0];
      start=res?G.makeStart(res.hands,level,lead,seed,'full'):G.deal(seed,level,lead);
      if(res)start.tribute=res.records;}catch(e){start=G.deal(seed,level,0);}
    setRecord(createRecord(start));toast((delta?'升级到打 '+G.rankName(level):'本局未升级，仍在打 '+G.rankName(level))+(db.progress.tribute!==false?'；已按上局名次进贡还贡。':'。'));}
  function nextRoundChooser(){const st2=states.at(-1);const delta=progDelta();const f=st2.finish;const from=progLevel();const to=Math.min(A_LEVEL,from+delta);
    openModal(`<div class="eyebrow">NEXT ROUND</div><h2>下一局怎么开始？</h2><p class="subtle">本局 ${delta?'升 '+delta+' 级':'未升级'}：打 ${G.rankName(from)} → 打 ${G.rankName(to)}</p><div class="actions" style="display:grid;gap:8px"><button class="button primary" data-action="nextRoundGo">继续本轮升级赛（打 ${G.rankName(to)}）</button><button class="button" data-action="nextRoundRestart">重开新一轮（重新选起始关）</button><button class="button ghost" data-action="closeModal">先复盘本局</button></div>`);}
  function summaryModal(){const s=states.at(-1),own=record.events.map((a,i)=>({a,i})).filter(x=>x.a.seat===0);openModal(`<div class="result-hero"><div class="medal">♠</div><h3>${s.result?.team===0?'你和搭档赢下这一副':'这一副，对方组合获胜'}</h3><p>${s.result?.doubleDown?(s.result.team===0?'你和搭档包揽头游、二游，双上结束。':'对方包揽头游、二游，双下结束。'):s.finish.map((p,i)=>`${i+1} 游：${seats[p]}`).join(' · ')}</p></div><div class="summary-box">本副 ${record.events.length} 次行动，你的位置行动 ${own.length} 次，其中自主操作 ${own.filter(x=>x.a.origin==='human'&&x.i>=(record.perspective?.atStep||0)).length} 次。<br>先挑一手搭档配合，再挑一手拆组取舍。用当时的信息解释自己的判断，然后另开分支试一次。</div><p>单副胜负不代表长期水平；复盘中可查看每一步实际由 AI分析、本地策略或确定性规则决定。</p>${progActive()?`<div class="summary-box">升级赛 · 当前打 ${G.rankName(progLevel())} · 本局${progDelta()?'可升 '+progDelta()+' 级':'不升级'}</div>`:''}<div class="actions"><button class="button primary" data-action="nextRoundGo" ${progActive()?'':'hidden'}>继续升级（贡还）</button><button class="button" data-action="freeDeal">自由打牌</button><button class="button" data-action="summaryReview">复盘本局</button><button class="button" data-action="rotateSeat">换座</button><button class="button ghost" data-action="home">退出</button></div>`);}
  function clearDrag(){document.querySelectorAll('.insert-before,.insert-after,.layout-drag-source').forEach(el=>el.classList.remove('insert-before','insert-after','layout-drag-source'));$('#layout-drag-ghost')?.remove();dragState=null;schedule();}
  function insertionAt(x,y){
    const hand=$('.flat-hand');if(!hand||!dragState)return null;const area=hand.getBoundingClientRect();
    if(x<area.left-14||x>area.right+14||y<area.top-18||y>area.bottom+24)return null;
    const cards=[...hand.querySelectorAll('[data-layout-card]')].filter(el=>!dragState.ids.includes(el.dataset.layoutCard));
    let target=null,distance=Infinity;
    for(const el of cards){const r=el.getBoundingClientRect(),dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom),d=dx*dx+dy*dy+(Math.abs(x-(r.left+r.right)/2)+Math.abs(y-(r.top+r.bottom)/2))*.01;if(d<distance){distance=d;target=el;}}
    if(!target)return null;const r=target.getBoundingClientRect();return {element:target,id:target.dataset.layoutCard,after:y>r.bottom?true:y<r.top?false:x>(r.left+r.right)/2};
  }
  document.addEventListener('pointerdown',e=>{
    const card=e.target.closest('[data-drag-card]');if(!card||!canArrangeHand()||e.button!==0||dragState)return;
    e.preventDefault();stop();const id=card.dataset.id,ids=arrangeMode&&arrangeSelected.includes(id)?displayedOrder().filter(x=>arrangeSelected.includes(x)):[id];dragState={id,ids,recordId:record.id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,moved:false,element:card};card.setPointerCapture?.(e.pointerId);
  });
  document.addEventListener('pointermove',e=>{
    if(!dragState||e.pointerId!==dragState.pointerId)return;if(!dragState.moved&&Math.hypot(e.clientX-dragState.x,e.clientY-dragState.y)<7)return;
    e.preventDefault();dragState.moved=true;document.querySelectorAll('[data-drag-card]').forEach(card=>card.classList.toggle('layout-drag-source',dragState.ids.includes(card.dataset.id)));
    let ghost=$('#layout-drag-ghost');if(!ghost){ghost=document.createElement('div');ghost.id='layout-drag-ghost';ghost.textContent=dragState.ids.length>1?dragState.ids.length+' 张牌一起移动':G.name(G.INDEX[dragState.id]);document.body.append(ghost);}ghost.style.left=(e.clientX+12)+'px';ghost.style.top=(e.clientY-45)+'px';
    document.querySelectorAll('.insert-before,.insert-after').forEach(el=>el.classList.remove('insert-before','insert-after'));const target=insertionAt(e.clientX,e.clientY);target?.element.classList.add(target.after?'insert-after':'insert-before');
    if(e.clientY<70)window.scrollBy(0,-12);else if(e.clientY>innerHeight-55)window.scrollBy(0,12);
  },{passive:false});
  document.addEventListener('pointerup',e=>{
    if(!dragState||e.pointerId!==dragState.pointerId)return;const drag=dragState,target=insertionAt(e.clientX,e.clientY);suppressLayoutClick=Date.now()+400;clearDrag();
    if(drag.recordId!==record.id||!canArrangeHand())return;
    if(!drag.moved){tapCard(drag.id);return;}
    if(target)commitOrder(H.insertCards(displayedOrder(),drag.ids,target.id,target.after,current().hands[0]));
  });
  document.addEventListener('pointercancel',()=>{if(dragState)clearDrag();});
  window.addEventListener('blur',()=>{if(dragState)clearDrag();});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;e.preventDefault();const action=b.dataset.action;if(action==='card'&&Date.now()<suppressLayoutClick)return;try{switch(action){
    case 'nav':closeModal();stop();ai.stopReading();narrator.cancel();view=b.dataset.view;arrangeMode=false;arrangeSelected=[];selected=[];save();render();window.scrollTo({top:0});break;
    case 'card':tapCard(b.dataset.id);break;
    case 'arrangeStart':if(canArrangeHand()){stop();arrangeMode=true;arrangeSelected=[];selected=[];showHint=false;save();render();}break;
    case 'arrangeDone':finishArranging();break;
    case 'undoLayout':if(canArrangeHand()&&layoutUndo.length){const previous=layoutUndo.pop();db.handOrders[record.id]=H.normaliseOrder(previous.order,current().hands[0]);handMode=previous.mode;save();render();}break;
    case 'nudgeCard':if(canArrangeHand()&&arrangeSelected.length){const order=displayedOrder(),picked=order.filter(id=>arrangeSelected.includes(id)),after=Number(b.dataset.dir)>0,target=order[order.indexOf(after?picked.at(-1):picked[0])+(after?1:-1)];if(target)commitOrder(H.insertCards(order,picked,target,after,current().hands[0]));}break;
    case 'clearArrange':arrangeSelected=[];render();break;
    case 'clear':selected=[];declarationKey='';render();break;
    case 'play':doPlay();break;
    case 'pass':if(myTurn())takeAction({seat:0,kind:'pass'});break;
    case 'seatHistory':{const p=+b.dataset.seat;const s2=current();const evs=record.events.map((a,i)=>({a,i})).filter(x=>x.a.seat===p);openModal(`<div class="eyebrow">SEAT HISTORY</div><h2>${esc(p===0?'我':seats[p])} 的出牌记录</h2><p class="subtle">共 ${evs.length} 手 · 当前余 ${s2.hands[p].length} 张</p><div class="event-list seat-history">${evs.map(({a,i})=>`<div class="event-row"><span class="event-no">${String(i+1).padStart(2,'0')}</span><b>${a.kind==='pass'?'过牌':esc(G.describe(a.move))}</b>${a.kind==='play'?`<span class="event-cards seat-cards">${a.move.ids.map(id=>cardHTML(G.INDEX[id],{mini:true})).join('')}</span>`:''}</div>`).join('')||'<div class="empty">该坐席还没有出过牌。</div>'}</div><button class="button primary" data-action="closeModal">关闭</button>`);break;}
    case 'undoStep':{if(review||!atLive()){toast('当前状态不能撤销。');break;}let i=record.events.length-1;while(i>=0&&record.events[i].seat!==0)i--;if(i<0){toast('还没有你的出牌可以撤销。');break;}record.events.splice(i);states=G.replay(record.start,record.events);cursor=record.events.length;selected=[];declarationKey='';showHint=false;arrangeMode=false;battle.cancel();stop();save();toast('已撤销你上一手出牌，可重新选择。');render();break;}
    case 'flushHelper':{closeModal();const s3=current();const found=G.findStraightFlushes(s3.hands[0],s3.level,s3.trick?.move);openModal(`<div class="eyebrow">STRAIGHT FLUSH</div><h2>同花顺组牌建议</h2><p class="subtle">共 ${found.length} 组 · 仅供参考，可接受或放弃</p><div class="flush-list">${found.map((x,i)=>`<article class="flush-card"><strong>${x.move.ids.map(id=>esc(G.name(G.INDEX[id]))).join(' ')}</strong><p class="subtle">${esc(G.describe(x.move))}</p><div class="flush-actions"><button class="button small primary" data-action="acceptFlush" data-index="${i}">接受并排在一起</button></div></article>`).join('')||'<div class="empty">当前手牌组不出同花顺。</div>'}</div><button class="button" data-action="closeModal">放弃</button>`);break;}
    case 'acceptFlush':{const found2=G.findStraightFlushes(current().hands[0],current().level,current().trick?.move);const x=found2[+b.dataset.index];closeModal();if(!x)break;const ids=x.move.ids;commitOrder([...ids,[...displayedOrder()].filter(id=>!ids.includes(id))]);toast('已按建议把同花顺排在前面。');break;}
    case 'hint':if(myTurn()){view='tools';toolsOpen=true;hintSeen=true;showHint=true;render();$('.coach')?.scrollIntoView({behavior:'smooth',block:'nearest'});}break;
    case 'hideHint':showHint=false;render();break;
    case 'pickFlush':{const x=G.findStraightFlushes(current().hands[0],current().level,current().trick?.move)[+b.dataset.index];if(!x)break;if(arrangeMode){hintSeen=true;const ids=x.move.ids;commitOrder([...ids,...displayedOrder().filter(id=>!ids.includes(id))]);toast('这几张已排在一起，仍可拖动调整。');break;}if(!myTurn()||!x.playable)break;view='practice';hintSeen=true;selected=[...x.move.ids];declarationKey=x.move.key;render();toast('已选中同花顺，请核对牌型后确认出牌。');}break;
    case 'pickHint':{const x=G.analyse(G.observe(current(),0))[+b.dataset.index];if(!x||!myTurn())break;view='practice';if(!x.move)takeAction({seat:0,kind:'pass'});else{selected=[...x.move.ids];declarationKey=x.move.key;render();}}break;

    case 'autoplay':dealWaiting=false;arrangeMode=false;arrangeSelected=[];save();closeModal();autoHero=!autoHero;paused=false;selected=[];render();toast(autoHero?'电脑现在代打你的位置，可再次点击停止观摩。':'已停止观摩，下次轮到你时自行出牌。');break;
    case 'settings':settingsModal();break;
    case 'mode':{const nextMode=b.dataset.mode==='minimax'&&location.protocol!=='file:'?'minimax':'local';if(nextMode===botMode)break;botMode=nextMode;stop();battle.cancel();paused=false;save();render();}break;
    case 'hurry':hurry();break;
    case 'home':closeModal();view='practice';review=false;cursor=record.events.length;showAll=false;showHint=false;render();window.scrollTo({top:0});break;
    case 'tools':closeModal();view='tools';toolsOpen=true;render();window.scrollTo({top:0});break;
    case 'speechToggle':if(narrator.snapshot().enabled)narrator.enable(false);else{narrator.enable(true);announce('语音播报已开启。'+announcement());}render();break;
    case 'speechTest':narrator.enable(true);announce('语音试听。你在下方，搭档在对面，下家在右侧，上家在左侧。'+S.turnText(current()));render();break;
    case 'speechRepeat':announce(announcement());render();break;
    case 'new':newModal();break;
    case 'confirmNew':{const level=+$('#new-level').value,lead=+$('#new-lead').value,seed=(($('#new-seed')&&$('#new-seed').value.trim())||freshSeed());archive();closeModal();setRecord(createRecord(G.deal(seed,level,lead)));}break;
    case 'closeModal':closeModal();break;
    case 'export':exportRecord(record);break;
    case 'copyRecord':copyRecord(record);break;
    case 'exportRecord':{const r=db.records.find(x=>x.id===b.dataset.id);if(r)exportRecord(r);}break;
    case 'import':$('#import-file').click();break;
    case 'goto':goto(+b.dataset.step);break;
    case 'prev':goto(cursor-1);break;
    case 'next':goto(cursor+1);break;
    case 'reviewStart':closeModal();view='practice';goto(0);break;
    case 'live':toolsOpen=false;review=false;cursor=record.events.length;showAll=false;selected=[];announce(announcement());render();break;
    case 'reveal':showAll=!showAll;render();break;
    case 'branch':branch(branchStep());break;
    case 'rotateSeat':rotateModal();break;
    case 'confirmRotate':startRotated(b.dataset.from);break;
    case 'returnParent':{const parent=db.records.find(r=>r.id===record.branchOf);if(parent){const step=record.perspective?.atStep||0;archive();setRecord(G.importRecord(G.clone(parent)),true);goto(Math.min(step,parent.events.length));}}break;
    case 'undo':{closeModal();let i=record.events.length-1;while(i>=0&&record.events[i].seat!==0)i--;if(i>=0)branch(i);}break;
    case 'openRecord':{const r=db.records.find(x=>x.id===b.dataset.id);if(r){archive();setRecord(G.importRecord(G.clone(r)),true);if(!db.reviewed.includes(r.id)){db.reviewed.push(r.id);save();}render();window.scrollTo({top:0});}}break;
    case 'summary':summaryModal();break;
    case 'startProgression':startProgression();break;
    case 'multiplayer':window.open('https://room.shuzidiantang.com/room.html','_blank','noopener');break;
    case 'freeDeal':closeModal();archive();setRecord(createRecord(G.deal(freshSeed(),current().level,0)));toast('开始自由打牌');break;
    case 'nextRound':nextRoundChooser();break;
    case 'nextRoundGo':nextProgressionRound();break;
    case 'nextRoundRestart':startProgression();break;
    case 'summaryReview':closeModal();goto(0);break;
  }}catch(err){toast(err.message||'操作未完成，请检查选择。');}});
  document.addEventListener('change',e=>{if(e.target.name==='rotate-seat')updateRotateChoice();if(e.target.id==='hand-sort'&&H.modes.includes(e.target.value)){handMode=e.target.value;save();render();}if(e.target.id==='bot-mode'){botMode='local';battle.cancel();save();render();}if(e.target.id==='speech-enabled'){db.speechEnabled=e.target.checked;narrator.enable(e.target.checked);save();render();settingsModal();}if(e.target.id==='speech-rate'){narrator.setRate(+e.target.value);db.speechRate=narrator.snapshot().rate;save();render();settingsModal();}if(e.target.id==='declaration'){declarationKey=e.target.value;render();}if(e.target.id==='speed'){delay=+e.target.value;render();}if(e.target.id==='timeline-range')goto(+e.target.value);});
  document.addEventListener('toggle',e=>{if(e.target.matches?.('.practice-tools')&&e.target.isConnected)toolsOpen=e.target.open;if(e.target.matches?.('[data-tool=flush]')&&e.target.open&&myTurn())hintSeen=true;},true);
  document.addEventListener('input',e=>{if(e.target.id==='decision-note'){record.notes=record.notes||{};record.notes[e.target.dataset.step]=e.target.value.slice(0,1000);const saved=db.records.find(r=>r.id===record.id);if(saved)saved.notes=G.clone(record.notes);save();}});
  $('#import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('牌谱文件上限为 2 MB');const r=G.importRecord(JSON.parse(await file.text()));archive();closeModal();setRecord(r,true);archive();toast('牌谱校验通过，已进入逐步回放。');}catch(err){toast(`导入失败：${err.message}`);}finally{e.target.value='';}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#modal-root').children.length)closeModal();else{selected=[];arrangeSelected=[];render();}}if($('#modal-root').children.length)return;if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName))return;if(view==='practice'&&review&&e.key==='ArrowLeft'){e.preventDefault();goto(cursor-1);}if(view==='practice'&&review&&e.key==='ArrowRight'){e.preventDefault();goto(cursor+1);}if(view==='practice'&&myTurn()&&e.key==='Enter'){e.preventDefault();doPlay();}});
  setInterval(()=>{syncTurnClock();updateBattleStatus();},250);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();ai.stopReading();narrator.cancel();}else schedule();});
  function unlockSpeech(){if(speechUnlocked)return;speechUnlocked=true;narrator.unlock?.();ai.unlockSpeech();if(narrator.snapshot().enabled)announce(S.turnText(current()));document.removeEventListener('pointerdown',unlockSpeech,true);document.removeEventListener('click',unlockSpeech,true);document.removeEventListener('keydown',unlockSpeech,true);}
  document.addEventListener('pointerdown',unlockSpeech,true);
  document.addEventListener('click',unlockSpeech,true);
  document.addEventListener('keydown',unlockSpeech,true);
  // A transient browser error must not turn the user's saved sound preference off.
  function recoverSpeech(){if(speechUnlocked&&db.speechEnabled!==false&&!narrator.snapshot().enabled&&narrator.snapshot().supported&&!$('#modal-root').children.length){narrator.enable(true);narrator.unlock?.();announce(announcement());}}
  document.addEventListener('pointerdown',recoverSpeech,true);
  document.addEventListener('keydown',recoverSpeech,true);
  window.addEventListener('pagehide',()=>{stop();ai.stopReading();narrator.cancel();});
  const memory=window.GuandanExperience.createStore(localStorage);
  const turnClock=window.GuandanBattle.createTurnClock();
  const battle=window.GuandanBattle.create({experiences:()=>memory.packet(),onChange:status=>{updateBattleStatus();if(status==='ready')schedule();}});
  const ai=window.GuandanAI.create({memory,getRecord:()=>record,getCursor:()=>cursor,getStates:()=>states,isReview:()=>review,openModal,closeModal,toast,goto,esc,speechPreferences:()=>({enabled:db.speechEnabled!==false,rate:db.speechRate||1}),beforeReading:()=>{stop();narrator.cancel();}});
  save();render();
})();
