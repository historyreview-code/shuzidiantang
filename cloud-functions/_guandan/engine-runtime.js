(function (root) {
  'use strict';
  const VERSION = 'guandan-single-v1';
  const SUITS = ['S', 'H', 'C', 'D'];
  const SYMBOLS = {S:'♠',H:'♥',C:'♣',D:'♦',J:'★'};
  const RANKS = {11:'J',12:'Q',13:'K',14:'A',16:'小王',17:'大王'};
  const TYPES = {single:'单张',pair:'对子',triple:'三张',full:'三带二',straight:'顺子',pairs:'三连对',triples:'钢板',bomb:'炸弹',flush:'同花顺',kings:'四王炸'};
  const clone = x => JSON.parse(JSON.stringify(x));
  const rankName = r => RANKS[r] || String(r);
  const name = c => c.r >= 16 ? rankName(c.r) : SYMBOLS[c.s]+rankName(c.r);
  const wild = (c,l) => c.s==='H' && c.r===l;
  const power = (r,l) => r>=16?r:r===l?15:r;
  function deck() {
    const d=[];
    for(let copy=0;copy<2;copy++) {
      for(const s of SUITS) for(let r=2;r<=14;r++) d.push({id:`${copy}${s}${r}`,r,s});
      for(const r of [16,17]) d.push({id:`${copy}J${r}`,r,s:'J'});
    }
    return d;
  }
  const DECK = deck(), INDEX = Object.fromEntries(DECK.map(c=>[c.id,c]));
  const sort = (cards,l) => [...cards].sort((a,b)=>power(b.r,l)-power(a.r,l)||SUITS.indexOf(a.s)-SUITS.indexOf(b.s)||a.id.localeCompare(b.id));
  function random(seed) {
    let x=2166136261;
    for(const c of String(seed)) x=Math.imul(x^c.charCodeAt(0),16777619);
    return () => {x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  }
  function deal(seed,level=2,lead=0) {
    const d=deck(),rng=random(seed);
    for(let i=d.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
    return makeStart(Array.from({length:4},(_,p)=>sort(d.slice(p*27,p*27+27),level)),level,lead,seed,'full');
  }
  function makeStart(hands,level=2,lead=0,seed='scenario',kind='scenario') {
    if(!['full','scenario'].includes(kind)) throw Error('未知牌局类型');
    if(!Number.isInteger(level)||level<2||level>14) throw Error('级牌必须在 2 到 A 之间');
    if(!Number.isInteger(lead)||lead<0||lead>3) throw Error('首发座位无效');
    if(!Array.isArray(hands)||hands.length!==4||hands.some(h=>!Array.isArray(h)||h.length<1||h.length>27)) throw Error('四家起手牌需要各有 1～27 张');
    const all=hands.flat();
    if(new Set(all.map(c=>c.id)).size!==all.length) throw Error('存在重复牌张');
    if(all.some(c=>!INDEX[c.id]||INDEX[c.id].r!==c.r||INDEX[c.id].s!==c.s)) throw Error('牌张编号或属性不合法');
    if(kind==='full'&&(all.length!==108||hands.some(h=>h.length!==27))) throw Error('完整牌局必须每家 27 张');
    return {rules:VERSION,kind,seed:String(seed).slice(0,80),level,lead,hands:clone(hands)};
  }
  function initial(start) {
    const valid=makeStart(start.hands,start.level,start.lead,start.seed,start.kind);
    return {level:valid.level,hands:valid.hands,turn:valid.lead,trick:null,passed:[],finish:[],over:false,result:null,step:0,played:[],lastActions:[null,null,null,null],history:[],leadReason:'练习首发'};
  }
  // 可选：带进贡/还贡的开局。旧口径 initial(start) 保持不变。
  // prevFinish 为上局名次 [头游,二游,三游,末游]；backPick 可注入还贡策略。
  function initialWithTribute(start, prevFinish, backPick) {
    const T = root.GuandanTribute;
    if (!T) throw Error('缺少贡还模块');
    const base = initial(start);
    const res = T.resolve(base.hands.map(h => h.map(c => ({...c}))), base.level, prevFinish, backPick);
    base.hands = res.hands.map(h => h.map(c => G_copy(c)));
    base.turn = res.lead;
    base.tribute = res.anti ? [{kind: 'anti', seats: res.anti}] : [...(res.gives || []), ...res.records];
    base.leadReason = res.anti ? '抗贡成功，头游先出' : '进贡还贡完成';
    return base;
  }
  function G_copy(c) { return {id: c.id, r: c.r, s: c.s}; }
  function sequences(length) {
    const out=[[14,...Array.from({length:length-1},(_,i)=>i+2)]];
    for(let r=2;r<=15-length;r++) out.push(Array.from({length},(_,i)=>r+i));
    return out;
  }
  function move(type,cards,p,assign=[],main=null) {
    const ids=cards.map(c=>c.id).sort();
    return {type,ids,power:p,main,assign,key:`${type}:${p}:${ids.join(',')}`};
  }
  // Pattern matching uses card identities, not all 2^27 subsets. AI enumeration
  // keeps one suit selection per pattern; classify() still accepts every valid selection.
  function enumerate(hand,level,exact=false) {
    const out=[],seen=new Set(),ws=hand.filter(c=>wild(c,level)),naturals=hand.filter(c=>!wild(c,level));
    const add=m=>{if(exact&&(m.ids.length!==hand.length||m.ids.some(id=>!hand.some(c=>c.id===id))))return;if(!seen.has(m.key)){seen.add(m.key);out.push(m);}};
    if(!exact||hand.length===1) for(const c of hand)add(move('single',[c],power(c.r,level),[],c.r));
    function pattern(type,requirements,p,main) {
      const total=requirements.reduce((s,g)=>s+g.n,0);
      if(total>hand.length||(exact&&total!==hand.length))return;
      function fill(i,chosen,usedWild,assign) {
        if(i===requirements.length){add(move(type,chosen,p,assign,main));return;}
        const g=requirements[i],pool=naturals.filter(c=>c.r===g.r&&(!g.s||c.s===g.s));
        const min=Math.max(0,g.n-pool.length),max=g.r>=16?0:Math.min(g.n,ws.length-usedWild);
        for(let use=min;use<=max;use++) {
          const take=g.n-use;
          if(pool.length<take)continue;
          const chosenWild=ws.slice(usedWild,usedWild+use);
          // Two wilds alone form the level pair in this practice ruleset.
          if(type==='pair'&&take===0&&g.r!==level)continue;
          fill(i+1,[...chosen,...pool.slice(0,take),...chosenWild],usedWild+use,[...assign,...chosenWild.map(c=>({id:c.id,r:g.r,s:g.s||c.s}))]);
        }
      }
      fill(0,[],0,[]);
    }
    for(let r=2;r<=17;r++) {
      if(r===15)continue;
      pattern('pair',[{r,n:2}],power(r,level),r);
      if(r<=14) {
        pattern('triple',[{r,n:3}],power(r,level),r);
        for(let n=4;n<=10;n++)pattern('bomb',[{r,n}],power(r,level),r);
        if(!exact||hand.length===5)for(let q=2;q<=17;q++)if(q!==15&&q!==r)pattern('full',[{r,n:3},{r:q,n:2}],power(r,level),r);
      }
    }
    for(const seq of sequences(5)) {
      const p=seq[seq.length-1];
      pattern('straight',seq.map(r=>({r,n:1})),p,p);
      for(const s of SUITS)pattern('flush',seq.map(r=>({r,n:1,s})),p,p);
    }
    for(const seq of sequences(3))pattern('pairs',seq.map(r=>({r,n:2})),seq[2],seq[2]);
    for(const seq of sequences(2))pattern('triples',seq.map(r=>({r,n:3})),seq[1],seq[1]);
    const kings=hand.filter(c=>c.r>=16);
    if(kings.length===4)add(move('kings',kings,99,[],17));
    return out;
  }
  // One minimum-substitution selection per suit and five-rank window.
  function findStraightFlushes(hand,level,table=null){
    const result=[],ws=hand.filter(c=>wild(c,level)).sort((a,b)=>a.id.localeCompare(b.id));
    for(const suit of SUITS)for(const ranks of sequences(5)){
      const chosen=[],missing=[];
      for(const r of ranks){const card=hand.filter(c=>c.s===suit&&c.r===r).sort((a,b)=>a.id.localeCompare(b.id))[0];if(card)chosen.push(card);else missing.push(r);}
      const available=ws.filter(c=>!chosen.some(n=>n.id===c.id));
      if(missing.length>available.length)continue;
      chosen.push(...available.slice(0,missing.length));
      const candidate=enumerate(chosen,level,true).find(m=>m.type==='flush'&&m.main===ranks.at(-1));
      if(!candidate)continue;
      const replacements=candidate.assign.filter(a=>a.r!==INDEX[a.id].r||a.s!==INDEX[a.id].s);
      result.push({suit,ranks,move:candidate,replacements,natural:replacements.length===0,playable:beats(candidate,table)});
    }
    return result.sort((a,b)=>a.replacements.length-b.replacements.length||b.move.power-a.move.power||SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit));
  }
  const classify=(cards,level)=>enumerate(cards,level,true);
  const bombTier=m=>m.type==='kings'?10000:m.type==='flush'?550:m.type==='bomb'?(m.ids.length>=6?600+m.ids.length*30:m.ids.length===5?500:400)+m.power:0;
  function beats(a,b) {
    if(!b)return true;
    const ta=bombTier(a),tb=bombTier(b);
    if(ta||tb)return ta>tb||(ta===tb&&a.type==='flush'&&b.type==='flush'&&a.power>b.power);
    return a.type===b.type&&a.ids.length===b.ids.length&&a.power>b.power;
  }
  function describe(m) {
    if(!m)return '过牌';
    const label=TYPES[m.type];
    if(m.type==='kings')return label;
    if(m.type==='bomb')return `${m.ids.length} 张 ${rankName(m.main)} 炸弹`;
    if(['straight','flush','pairs','triples'].includes(m.type))return `${label} · ${rankName(m.main)} 收尾`;
    return `${label} · ${rankName(m.main)}`;
  }
  function nextActive(s,from) {for(let d=1;d<=4;d++){const p=(from+d)%4;if(s.hands[p].length)return p;}return -1;}
  function apply(state,action) {
    if(state.over)throw Error('本副已经结束');
    const s=clone(state),p=s.turn;
    if(action.seat!==undefined&&action.seat!==p)throw Error('行动顺序不正确');
    s.step++;
    if(action.kind==='pass') {
      if(!s.trick)throw Error('领出时不能过牌');
      s.passed.push(p);s.lastActions[p]={kind:'pass',step:s.step};(s.history=s.history||[]).push({seat:p,kind:'pass'});
      const pending=s.hands.map((h,i)=>h.length&&i!==s.trick.seat&&!s.passed.includes(i)).some(Boolean);
      if(!pending) {
        const owner=s.trick.seat,partner=(owner+2)%4;
        s.turn=s.hands[owner].length?owner:s.hands[partner].length?partner:nextActive(s,owner);
        s.leadReason=s.turn===owner?'上轮最大者领出':s.turn===partner?'搭档出完，本轮无人再压，借风领出':'转交仍在场玩家';
        s.trick=null;s.passed=[];
      } else s.turn=nextActive(s,p);
      return s;
    }
    if(action.kind!=='play'||!action.move||!Array.isArray(action.move.ids))throw Error('无效动作');
    const ids=action.move.ids;
    if(new Set(ids).size!==ids.length)throw Error('同一张牌不能重复使用');
    const cards=ids.map(id=>s.hands[p].find(c=>c.id===id));
    if(cards.some(c=>!c))throw Error('所选牌不在当前手中');
    const legal=classify(cards,s.level).find(m=>m.type===action.move.type&&m.power===action.move.power&&beats(m,s.trick?.move));
    if(!legal)throw Error('牌型不合法，或不能压过桌面的牌');
    s.hands[p]=s.hands[p].filter(c=>!ids.includes(c.id));
    s.played.push(...cards);s.trick={seat:p,move:legal};s.passed=[];
    s.lastActions[p]={kind:'play',move:legal,step:s.step};(s.history=s.history||[]).push({seat:p,kind:'play',type:legal.type,size:legal.ids.length});
    if(!s.hands[p].length)s.finish.push(p);
    if(s.finish.length>=2&&s.finish[0]%2===s.finish[1]%2) {
      s.over=true;s.result={team:s.finish[0]%2,upgrade:3,doubleDown:true};
    } else if(s.finish.length===3) {
      s.finish.push(s.hands.findIndex(h=>h.length));s.over=true;
      s.result={team:s.finish[0]%2,upgrade:s.finish.indexOf((s.finish[0]+2)%4)===2?2:1,doubleDown:false};
    }
    if(!s.over)s.turn=nextActive(s,p);
    return s;
  }
  function observe(s,seat=s.turn) {
    return {level:s.level,seat,hand:clone(s.hands[seat]),counts:s.hands.map(h=>h.length),trick:clone(s.trick),finish:[...s.finish],played:clone(s.played),history:(s.history||[]).slice(-120),step:s.step};
  }
  function structure(hand,level) {
    const counts={};for(const c of hand)if(!wild(c,level))counts[c.r]=(counts[c.r]||0)+1;
    return {singles:Object.entries(counts).filter(([,n])=>n===1).map(([r])=>+r),pairs:Object.values(counts).filter(n=>n===2).length,triples:Object.values(counts).filter(n=>n===3).length,bombs:Object.values(counts).filter(n=>n>=4).length,wilds:hand.filter(c=>wild(c,level)).length,counts};
  }
  const STRATEGY_VERSION='team-plan-v8';
  // Hand-set weights, exposed so tuning can be measured instead of guessed.
  // Every value equals the pre-tuning constant; `analyse()` without arguments is unchanged.
  // team-plan-v7: adds 牌权/顺牌经济学 (takeLead=50, shedLead=50): following a trick to shed and
  // leading weak/mid cards early are goals; verified dev validation +0.375, heldout swap +0.163,
  // confirm swap +0.175 (CI [+0.004,+0.331]), duel +0.254.
  // team-plan-v6: adds 大牌经济学 (control singles are currency, not ordinary cards) and keeps
  // the v5 weights. Evidence: dev search +0.275, dev[20,40) +0.275, heldout 120 swap +0.079 /
  // duel +0.163, confirm 120 swap +0.046 / duel +0.133 - positive in six independent holds,
  // but confirm CIs cross zero, so this is "no worse + fixes a visible flaw", not a proven gain.
  // team-plan-v5 weights. Eight values were tuned with lab-js/search-weights.mjs on
  // gb-bench-v3 dev[0,20) and accepted only after reproducing on dev[20,40), heldout 120
  // and confirm 120 (swap +0.28, duel +0.40 team points per deal, both CIs above zero).
  const WEIGHTS=Object.freeze({turns:36,cards:1.5,power:.35,wild:3,breakBomb:10.5,breakGroup:4,bombUse:9.5,breakFlush:16,
    lostReserve:14,strongestDrop:14,controlExit:75,bombSupport:18,bombQuiet:8,bombSupportDanger:24,
    leadSingleDanger:19,leadPairDanger:22,follow:5,teamLead:90,saveControl:8,oneTurn:38,followDanger:14,
    singleDangerPower:4,leadSingleDangerBonus:28,pairDangerPower:2,vulnerableBomb:95,vulnerablePlay:145,
    vulnerablePower:4,feed:100,feedPower:2,partnerDoneSteal:40,finish:10000,passTeamLead:75,passDanger:-35,
    plannerBudget:1100,
    // team-plan-v6 candidate: 口诀-inspired, opponent-remaining-count preferences (defaults off).
    threatPair5:0,threatTriple6:0,threatBomb567:0,threatNoBomb48:0,threatSingle9:0,threatPair10:0,
    // team-plan-v6 candidate: control-card (大牌) economics, defaults off.
    ctrlLeadPenalty:160,ctrlFollowPenalty:20,ctrlRedundantFactor:.4,ctrlShortHand:8,ctrlShortFactor:.5,
    takeLead:50,interceptBonus:0,shedLead:50,partnerTakeover:0,handoffToMe:0,probeNext:0,shedAlong:0,
    // team-plan-v8 candidates: per-objective multipliers (neutral defaults)
    objHeadTurns:1,objHeadFeed:0,objHeadSteal:0,objLossTurns:1,objLossBomb:1,
    // v8 role action items (default 0 = off)
    objHeadEscortBomb:0,objHeadYield:0,objLossRush:0,objLossBlock:0,duBlock:0,duBreak:0,duHold:0,duEscort:0,duTarget:0,markAvoidType:0,markBaitType:0,cardsEarlyMul:1,powerEarlyMul:1,controlRiskK:0,structureBlend:0,partnerHold:1,antiRunout:1,jokerHold:1,carryCost:6,escortLead:22,
    // v9 candidates: opponent bomb/joker risk from the public unseen pool (default off)
    bombRiskPenalty:0,bombProvenBonus:0,kingLeadRisk:0,bombRiskK:30});
  // The pre-tuning table, kept so old runs stay reproducible and new work has a control.
  const LEGACY_WEIGHTS_V4=Object.freeze({turns:18,cards:1.5,power:.35,wild:3,breakBomb:15,breakGroup:4,bombUse:19,breakFlush:16,
    lostReserve:20,strongestDrop:14,controlExit:75,bombSupport:18,bombQuiet:8,bombSupportDanger:24,
    leadSingleDanger:38,leadPairDanger:22,follow:5,teamLead:90,saveControl:8,oneTurn:38,followDanger:28,
    singleDangerPower:4,leadSingleDangerBonus:28,pairDangerPower:2,vulnerableBomb:95,vulnerablePlay:145,
    vulnerablePower:4,feed:50,feedPower:2,partnerDoneSteal:40,finish:10000,passTeamLead:75,passDanger:-35,
    plannerBudget:550,threatPair5:0,threatTriple6:0,threatBomb567:0,threatNoBomb48:0,threatSingle9:0,threatPair10:0,
    ctrlLeadPenalty:0,ctrlFollowPenalty:0,ctrlRedundantFactor:.4,ctrlShortHand:8,ctrlShortFactor:.5,
    takeLead:0,interceptBonus:0,shedLead:0,partnerTakeover:0,handoffToMe:0,probeNext:0,shedAlong:0,
    objHeadTurns:1,objHeadFeed:0,objHeadSteal:0,objLossTurns:1,objLossBomb:1,
    // v8 role action items (default 0 = off)
    objHeadEscortBomb:0,objHeadYield:0,objLossRush:0,objLossBlock:0,duBlock:0,duBreak:0,duHold:0,duEscort:0,duTarget:0,markAvoidType:0,markBaitType:0,cardsEarlyMul:1,powerEarlyMul:1,controlRiskK:0,structureBlend:0,partnerHold:1,antiRunout:1,jokerHold:1,
    // v9 candidates: opponent bomb/joker risk from the public unseen pool (default off)
    bombRiskPenalty:0,bombProvenBonus:0,kingLeadRisk:0,bombRiskK:30});
  function planner(hand,moves,budget=WEIGHTS.plannerBudget) {
    const index=new Map(hand.map((c,i)=>[c.id,i])),full=(1<<hand.length)-1;
    const masks=[...new Set(moves.map(m=>m.ids.reduce((bits,id)=>bits|(1<<index.get(id)),0)))].sort((a,b)=>pop(b)-pop(a)||a-b);
    const byCard=hand.map((_,i)=>masks.filter(m=>m&(1<<i))),memo=new Map([[0,0]]);let left=budget;
    function pop(n){let count=0;while(n){n&=n-1;count++;}return count;}
    function greedy(mask){let count=0;for(const m of masks)if((mask&m)===m){mask^=m;count++;if(!mask)return count;}return count+pop(mask);}
    function turns(mask){if(memo.has(mask))return memo.get(mask);let best=greedy(mask);if(best<=1||left--<=0)return best;
      const bit=31-Math.clz32(mask&-mask),options=byCard[bit].filter(m=>(mask&m)===m);
      for(const m of options){if(pop(m)===pop(mask)){best=1;break;}best=Math.min(best,1+turns(mask^m));if(best===2)break;}
      memo.set(mask,best);return best;
    }
    return {full,mask:m=>m.ids.reduce((bits,id)=>bits|(1<<index.get(id)),0),turns};
  }
  function analyse(o,W=WEIGHTS) {
    // Two deterministic physical selections per pattern preserve more suit structures.
    const pool=[...new Map([...enumerate(o.hand,o.level),...enumerate([...o.hand].reverse(),o.level)].map(m=>[m.key,m])).values()];
    const moves=pool.filter(m=>beats(m,o.trick?.move));
    const before=structure(o.hand,o.level),partner=(o.seat+2)%4,teamLead=!!o.trick&&o.trick.seat%2===o.seat%2;
    const opponents=o.counts.map((count,seat)=>({count,seat})).filter(x=>x.seat%2!==o.seat%2&&x.count>0);
    const lowestOpp=opponents.length?Math.min(...opponents.map(x=>x.count)):27;
    const oppBoth=opponents.length?Math.max(...opponents.map(x=>x.count)):27;
    // 防双上风险（公开信息）：对手两家都接近走完时风险陡升
    const duRisk=1-Math.exp(-Math.max(0,12-oppBoth)/6);
    const ourSomeoneOut=o.finish.some(s=>s%2===o.seat%2);
    // 双上危机时的“放强阻弱”：允许最接近走完的对手先走，把资源压在最难挡的那一家身上，
    // 目标是不让对方包揽前二（我方争二游）。仅公开信息，默认关闭。
    let allowedSeat=-1, blockSeat=-1;
    if(opponents.length===2&&W.duTarget){
      const sorted=[...opponents].sort((a,b)=>a.count-b.count);
      allowedSeat=sorted[0].seat; blockSeat=sorted[1].seat;
    }
    // 读人（公开历史）：每个对手出过哪些牌型、我方领出某型后他压过/放过多少
    const profile={0:{types:{},beat:0,pass:0},1:{types:{},beat:0,pass:0},2:{types:{},beat:0,pass:0},3:{types:{},beat:0,pass:0}};
    for(let i=0;i<o.history.length;i++){
      const ev=o.history[i];
      if(ev.kind!=='play')continue;
      profile[ev.seat].types[ev.type]=(profile[ev.seat].types[ev.type]||0)+1;
      const prev=o.history[i-1];
      if(prev&&prev.seat%2!==ev.seat%2&&prev.kind==='play')profile[ev.seat].beat++;
    }
    for(const ev of o.history)if(ev.kind==='pass'&&ev.seat%2!==o.seat%2)profile[ev.seat].pass++;
    // 能压概率的粗估：未见池里该型原料占比 × 对手余牌容量
    const beatProb=m=>{
      if(!m||!o.trick)return 0;
      const need=m.ids.length,cap=Math.max(...opponents.map(x=>x.count),0);
      const raw=(unseenCounts.counts[m.main]||0)+wildCount;
      return Math.min(1,Math.max(0,raw/6)*Math.min(1,cap/need));
    };
    const objNow=objectiveOf(o);
    const singleDanger=opponents.some(x=>x.count===1),pairDanger=opponents.some(x=>x.count===2),danger=singleDanger||pairDanger;
    const known=new Set([...o.hand,...o.played].map(c=>c.id)),unseen=DECK.filter(c=>!known.has(c.id));
    const unseenCounts=structure(unseen,o.level),wildCount=unseenCounts.wilds;
    const higherCount=m=>unseen.filter(c=>power(c.r,o.level)>m.power).length;
    const sameTypeSafe=m=>m.type==='single'?higherCount(m)===0:m.type==='pair'?!Object.entries(unseenCounts.counts).some(([r,n])=>power(+r,o.level)>m.power&&n+(+r<16?wildCount:0)>=2):false;
    const canAssemble=req=>req.reduce((missing,[r,n,suit])=>missing+Math.max(0,n-(suit?unseen.filter(c=>!wild(c,o.level)&&c.r===r&&c.s===suit).length:(unseenCounts.counts[r]||0))),0)<=wildCount&&req.every(([r,n])=>r<16||(unseenCounts.counts[r]||0)>=n);
    const ordinarySafe=m=>{
      if(['single','pair'].includes(m.type))return sameTypeSafe(m);
      if(['triple','full'].includes(m.type))return !Array.from({length:13},(_,i)=>i+2).some(r=>power(r,o.level)>m.power&&(m.type==='triple'?canAssemble([[r,3]]):Array.from({length:16},(_,i)=>i+2).filter(q=>q!==15&&q!==r).some(q=>canAssemble([[r,3],[q,2]]))));
      const seq=m.type==='straight'?[5,1]:m.type==='pairs'?[3,2]:m.type==='triples'?[2,3]:null;
      return seq?!sequences(seq[0]).some(rs=>rs.at(-1)>m.power&&canAssemble(rs.map(r=>[r,seq[1]]))):false;
    };
    const enemyCapacity=Math.max(0,...opponents.map(x=>x.count));let unseenBombTier=0,unseenFlushPower=0;
    if(enemyCapacity>=4){
      for(let r=2;r<=14;r++){const n=Math.min(enemyCapacity,(unseenCounts.counts[r]||0)+wildCount);if(n>=4)unseenBombTier=Math.max(unseenBombTier,bombTier({type:'bomb',ids:Array(n),power:power(r,o.level)}));}
      if(enemyCapacity>=5)for(const suit of SUITS)for(const rs of sequences(5))if(canAssemble(rs.map(r=>[r,1,suit]))){unseenBombTier=Math.max(unseenBombTier,550);unseenFlushPower=Math.max(unseenFlushPower,rs.at(-1));}
      if(unseen.filter(c=>c.r>=16).length===4)unseenBombTier=10000;
    }
    // 对手炸弹/大王威胁估计（只用公开未见牌池，不做手牌推断）：
    //   bombRanks = 未见牌里能凑成 4 张以上炸弹的点数个数
    //   unseenJokers = 未见的大小王张数；unseenBig = 未见大王张数
    let bombRanks=0;
    for(let r=2;r<=14;r++){if((unseenCounts.counts[r]||0)+wildCount>=4)bombRanks++;}
    const unseenJokers=(unseenCounts.counts[16]||0)+(unseenCounts.counts[17]||0),unseenBig=(unseenCounts.counts[17]||0);
    // 概率化炸弹风险：未见池里能拼成 4 张以上的同点牌越多，对手有炸弹的可能性越高。
    // 指数映射到 [0,1)，仅用公开信息；不是严格超几何概率，但单调可比。
    let bombMaterial=0;
    for(let r=2;r<=14;r++){const n=(unseenCounts.counts[r]||0)+wildCount;if(n>=4)bombMaterial+=n-3;}
    const bombRisk=1-Math.exp(-bombMaterial/30);
    const phase=opponents.some(x=>x.count<=5)||o.hand.length<=8||o.counts[partner]<=5?'残局':'中前盘';
    const teamObjective=!o.finish.length?'争取头游并兼顾搭档':o.finish[0]%2===o.seat%2?'己方已获头游，争双下或三游':'对方已获头游，争二三游，避免被双下';
    const support=o.counts[partner]>0&&o.counts[partner]<=5&&o.hand.length>o.counts[partner]+3;
    const tableVulnerable=teamLead&&((o.trick.move.type==='single'&&singleDanger)||(o.trick.move.type==='pair'&&pairDanger))&&!sameTypeSafe(o.trick.move);
    const plan=planner(o.hand,pool,W.plannerBudget),beforeTurns=plan.turns(plan.full),flushes=pool.filter(m=>m.type==='flush');
    // Top-K 战略结构：快速出完型 vs 保控型（不作炸弹/同花顺拆用）的余手数差
    const poolKeep=pool.filter(m=>bombTier(m)===0);
    const planKeep=planner(o.hand,poolKeep,W.plannerBudget);
    const bombOptions=pool.filter(m=>bombTier(m)>0).map(m=>({move:m,mask:plan.mask(m),wilds:m.ids.filter(id=>wild(INDEX[id],o.level)).length})).sort((a,b)=>a.wilds-b.wilds||bombTier(b.move)-bombTier(a.move));
    const reserves=new Map();
    const reserve=mask=>{if(reserves.has(mask))return reserves.get(mask);let left=mask;const chosen=[];let strongest=0;
      for(const x of bombOptions)if((mask&x.mask)===x.mask)strongest=Math.max(strongest,bombTier(x.move));
      for(const x of bombOptions)if((left&x.mask)===x.mask){chosen.push(x.move);left^=x.mask;}
      const result={count:chosen.length,strongest,combinations:chosen.slice(0,3).map(describe)};reserves.set(mask,result);return result;
    };
    const beforeReserve=reserve(plan.full);
    // Control singles (大牌) are currency for regaining the lead, not ordinary cards.
    const ctrlSingles=o.hand.filter(c=>!wild(c,o.level)&&power(c.r,o.level)>=14);
    const ctrlCount=ctrlSingles.length;
    const ctrlIsControl=m=>{
      if(!m||m.type!=='single')return false;
      const c=INDEX[m.ids[0]];
      return !wild(c,o.level)&&power(c.r,o.level)>=14;
    };
    const scored=moves.map(m=>{
      const remaining=o.hand.filter(c=>!m.ids.includes(c.id)),after=structure(remaining,o.level),finish=!remaining.length;
      const isBomb=bombTier(m)>0,usedWild=m.ids.filter(id=>wild(INDEX[id],o.level)).length;
      let breakBomb=0,breakGroup=0;
      for(const [r,n]of Object.entries(before.counts)){const left=after.counts[r]||0;if(n>=4&&left>0&&left<n)breakBomb++;if(n>=2&&left===1)breakGroup++;}
      const remainingMask=plan.full^plan.mask(m),remainingTurns=plan.turns(remainingMask),safe=ordinarySafe(m),afterReserve=reserve(remainingMask);
      const threat=opponents.length?Math.min(...opponents.map(x=>x.count)):27;
      const provenControl=isBomb?bombTier(m)>=unseenBombTier&&(m.type!=='flush'||m.power>=unseenFlushPower):safe&&unseenBombTier===0;
      const lostReserve=Math.max(0,beforeReserve.count-afterReserve.count-(isBomb?1:0)),controlExit=remainingTurns===1&&provenControl;
      const breakFlush=flushes.some(f=>f.ids.some(id=>m.ids.includes(id)))&&!isBomb&&!flushes.some(f=>f.ids.every(id=>!m.ids.includes(id)));
      const effBombUse=W.bombUse*(1+W.bombRiskK*(provenControl?0:bombRisk));
      // 三带二：带的“二”应尽量小；带王/大牌额外扣分（保留战力）
      let carryPen = 0;
      if(m.type === 'full'){
        const ranks = m.ids.map(id => INDEX[id].r);
        const cnt = {}; for(const r of ranks) cnt[r] = (cnt[r] || 0) + 1;
        let pairIds = m.ids.filter(id => cnt[INDEX[id].r] === 2);
        if(!pairIds.length) pairIds = m.ids.filter(id => INDEX[id].r !== m.main);
        for(const id of pairIds){
          const r = INDEX[id].r;
          carryPen += Math.max(0, (r >= 16 ? r + 4 : power(r, o.level)) - 8);
        }
        carryPen *= W.carryCost;
      }
      const early = phase === '中前盘';
      const cardsW = W.cards * (early ? W.cardsEarlyMul : 1);
      // 概率化控制牌风险（v8 同款机制）：单张牌力成本随“外面有更大单张”的可能性上浮
      const biggerUnseen = m.type === 'single' ? unseen.filter(c => power(c.r, o.level) > m.power).length : 0;
      const controlRisk = m.type === 'single' ? Math.min(1, biggerUnseen / Math.max(1, unseen.length) * 6) : 0;
      const powerW = W.power * (early ? W.powerEarlyMul : 1) * (1 + W.controlRiskK * controlRisk);
      let score=W.turns*(beforeTurns-remainingTurns)+m.ids.length*cardsW-m.power*powerW-carryPen-usedWild*W.wild-breakBomb*W.breakBomb-breakGroup*W.breakGroup-(isBomb?effBombUse:0)-(breakFlush?W.breakFlush:0);
      score-=lostReserve*W.lostReserve;
      if(!isBomb&&beforeReserve.strongest>=600&&afterReserve.strongest<600)score-=W.strongestDrop;
      if(controlExit)score+=W.controlExit;
      if(!finish&&isBomb&&!danger&&!controlExit)score-=support?W.bombSupport:W.bombQuiet;
      if(support&&!teamLead&&o.trick&&isBomb&&danger)score+=W.bombSupportDanger;
      if(!o.trick&&singleDanger&&m.type==='single'&&!controlExit&&!finish)score-=W.leadSingleDanger;
      if(!o.trick&&pairDanger&&m.type==='pair'&&!controlExit&&!finish)score-=W.leadPairDanger;
      if(o.trick)score+=W.follow;
      if(teamLead){
        // 搭档控牌时的四种情形（默认全部 0＝维持“让牌”，不改变上线行为）：
        // ① 交给队友：搭档出的牌很小（像是有意放小牌）且我打完能立刻收尾/只剩一手
        //    → 用大牌上位拿回领出权，好让我领自己的优势牌型；
        // ② 考验下家：我手里是顶级单张（power>=14），接过来逼下家（唯一的对手）用大牌，
        //    等于把对方的控制牌“钓”出来；
        // ③ 顺牌跑牌：用廉价中档牌顺一手跑掉，交给下家去顶；
        // ④ 其余情况继续让牌（原 −90）。
        let take=0;
        if(W.partnerTakeover){
          if(provenControl&&(remainingTurns<=2||o.hand.length<=W.ctrlShortHand))take=W.partnerTakeover;
          else if(threat<=2&&provenControl)take=W.partnerTakeover*.5;
        }
        const partnerCardLow=o.trick&&o.trick.move&&o.trick.move.power<=10;
        if(W.handoffToMe&&partnerCardLow&&(remainingTurns<=2||finish))take+=W.handoffToMe;
        if(W.probeNext&&ctrlIsControl(m)&&o.counts[(o.seat+1)%4]>0)take+=W.probeNext;
        if(W.shedAlong&&!isBomb&&m.power<=10)take+=W.shedAlong;
        score-=Math.max(0,W.teamLead-take);
      }
      if(!o.trick&&safe)score-=W.saveControl; // Save a control card until it can release a weak remainder.
      if(remainingTurns===1&&safe)score+=W.oneTurn;
      if(danger&&!teamLead&&o.trick)score+=W.followDanger;
      if(singleDanger){if(m.type==='single')score+=m.power*W.singleDangerPower;else if(!o.trick)score+=W.leadSingleDangerBonus;}
      if(pairDanger&&m.type==='pair')score+=m.power*W.pairDangerPower;
      if(tableVulnerable){score+=isBomb?W.vulnerableBomb:W.vulnerablePlay;if(m.type==='single'||m.type==='pair')score+=m.power*W.vulnerablePower;}
      const feed=!o.trick&&!danger&&o.counts[partner]===m.ids.length&&['single','pair'].includes(m.type)&&m.power<=10;
      if(feed)score+=W.feed-m.power*W.feedPower;
      if(teamLead&&o.counts[partner]===0&&!finish)score-=W.partnerDoneSteal;
      if(finish)score+=W.finish;
      // 大牌经济学：领出用单张大牌是"付款"。只有收尾、护栏（对手报单报双）、
      // 手牌已短、或手里还有冗余大牌时才允许；跟牌时只在拦截/收尾时才该用。
      if(ctrlIsControl(m)&&!finish&&W.ctrlLeadPenalty){
        let f=1;
        if(ctrlCount>=2)f*=W.ctrlRedundantFactor;
        if(threat<=2)f=0;
        if(remainingTurns<=1)f=0;
        if(o.hand.length<=W.ctrlShortHand)f*=W.ctrlShortFactor;
        if(!o.trick)score-=W.ctrlLeadPenalty*f;
        else if(W.ctrlFollowPenalty){
          let g=1;
          if(threat<=2)g=0;
          if(teamLead)g*=0.5;
          score-=W.ctrlFollowPenalty*g;
        }
      }
      // 牌权与顺牌经济学（v7）：跟牌把牌顺走本身有价值；用大牌抢回牌权是策略；
      // 没有出过牌时，先把弱牌/中档牌走掉也是目标。全部默认 0，可关。
      if(o.trick&&o.trick.seat%2!==o.seat%2){
        score+=W.takeLead;
        if(ctrlIsControl(m))score+=W.interceptBonus;
      }
      if(!o.trick&&!isBomb&&m.power<=10){
        score+=W.shedLead*(m.ids.length>=2?1.5:1);
      }
      // 炸弹时机 × 对手威胁（v9）：对手可能还有更大的炸弹时，非绝对大的炸弹更贵；
      // 自己握着"外面压不过"的炸弹时，开炸更安全。单张小王领出而大王未见时更危险。
      if(isBomb){
        if(W.bombRiskPenalty&&!provenControl&&(bombRanks>0||unseenJokers>0))score-=W.bombRiskPenalty;
        if(W.bombProvenBonus&&provenControl)score+=W.bombProvenBonus;
      }
      if(W.kingLeadRisk&&!o.trick&&m.type==='single'&&INDEX[m.ids[0]].r===16&&unseenBig>0)score-=W.kingLeadRisk;
      // 读人动作项（默认 0）：①避开对手历史少压的牌型；②主动送对手爱压的牌型消耗其大牌。
      if(!o.trick&&W.markAvoidType&&opponents.length){
        const worst=opponents.reduce((a,b)=>((profile[b.seat].beat||0)>(profile[a.seat].beat||0)?b:a));
        if(m.type==='single'||m.type==='pair')score+=W.markAvoidType*((profile[worst.seat].beat||0)<=2?1:-.5);
      }
      if(o.trick&&W.markBaitType&&o.trick.seat%2!==o.seat%2){
        const owner=profile[o.trick.seat];
        if((owner.beat||0)>=4)score+=W.markBaitType*.5;
      }
      // 放强阻弱：桌面被“目标对手”控制时重罚不够、要抢；被“允许先走”的一家控制时不浪费资源。
      if(W.duTarget&&o.trick&&o.trick.seat%2!==o.seat%2&&oppBoth<=5){
        if(o.trick.seat===blockSeat)score+=W.duTarget*duRisk*(isBomb?1.6:1);
        else if(o.trick.seat===allowedSeat)score-=W.duTarget*.6;
      }
      // 防双上次目标（v9）：威胁加权抢权/炸开/护送搭档/按住不抢。
      if(W.duBlock&&o.trick&&o.trick.seat%2!==o.seat%2&&lowestOpp<=5&&!isBomb)score+=W.duBlock*duRisk;
      if(W.duBreak&&o.trick&&o.trick.seat%2!==o.seat%2&&lowestOpp<=5&&isBomb)score+=W.duBreak*duRisk;
      if(W.duEscort&&ourSomeoneOut&&o.counts[partner]>0&&o.counts[partner]<=3&&!o.trick&&['single','pair'].includes(m.type))score+=W.duEscort;
      // 角色动作项（v8）：争双上=护送搭档先走；免双下=抢先走/必须拦。默认 0。
      if(objNow==='afterHead'){
        if(W.objHeadEscortBomb&&isBomb&&o.counts[partner]>0&&o.counts[partner]<=2)score+=W.objHeadEscortBomb;
        if(W.objHeadYield&&!o.trick&&o.counts[partner]>0&&o.counts[partner]<o.hand.length-remaining.length)score-=W.objHeadYield*.5;
      }else if(objNow==='afterTheirHead'){
        if(W.objLossRush&&remainingTurns<=1)score+=W.objLossRush;
        if(W.objLossBlock&&lowestOpp<=5&&o.trick)score+=W.objLossBlock;
      }
      // Opponent-remaining-count preferences. These encode folk mnemonics (五要炸/六必治/
      // 七炸八不炸/九张出单/十张出对/枪不打四) as learnable weights; all default to 0,
      // so the shipped policy is unchanged until the benchmark proves a value.
      if(!o.trick){
        if(threat===5){score+=m.type==='pair'?W.threatPair5:(m.type==='single'?-W.threatPair5*.5:0);}
        else if(threat===6){score+=['triple','full'].includes(m.type)?W.threatTriple6:(['single','pair'].includes(m.type)?-W.threatTriple6*.5:0);}
        else if(threat===9&&m.type==='single')score+=W.threatSingle9;
        else if(threat===10){score+=m.type==='pair'?W.threatPair10:(m.type==='full'?-W.threatPair10:0);}
      }
      if(isBomb){
        if(threat===5||threat===6||threat===7)score+=W.threatBomb567;
        if(threat===4||threat===8)score-=W.threatNoBomb48;
      }
      const facts=[`打出 ${m.ids.length} 张，剩 ${remaining.length} 张。`],reasons=[];
      if(finish)reasons.push('这手可以立即出完自己的牌，优先兑现名次。');
      if(tableVulnerable&&!finish)reasons.push('搭档虽暂时最大，但对手报单或报双，当前牌型可能被接走；接管大牌是在保护队伍。');
      else if(teamLead&&!finish)reasons.push(o.counts[partner]===0?'搭档已走完，若全员过牌可借风给你；避免无谓接管。':'搭档正在控牌，通常让其继续领出，除非你能直接走完或有明确拦截需要。');
      if(feed)reasons.push(`搭档只剩 ${o.counts[partner]} 张，低${m.type==='single'?'单张':'对子'}可试着交棒；其具体牌点${m.type==='pair'?'和是否成对':''}仍未知。`);
      if(singleDanger&&m.type==='single'&&!finish)reasons.push('对手报单，单张跟牌优先提高拦截强度，避免继续放出小单。');
      if(safe)reasons.push('按已见牌，未见牌中没有更大的同型组合；仍可能被炸弹压制。');
      if(!finish)reasons.push(`按当前候选组合估算，余牌约可分 ${remainingTurns} 手；这是有限结构搜索，不保证最少手数，也不保证能连续出完。`);
      if(breakBomb||breakFlush)reasons.push(`会拆开${breakBomb?'同点炸弹':''}${breakBomb&&breakFlush?'或':''}${breakFlush?'同花顺':''}结构，需要用控牌或收尾收益补偿。`);
      if(lostReserve&&!breakBomb&&!breakFlush)reasons.push('这手会占用组炸弹所需的配牌或牌张，降低后续控牌储备。');
      if(controlExit)reasons.push('按已知牌保守检查，对手无法压过本手，且余牌有一手出完的组合；优先比较这条收尾路线。');
      if(!finish&&isBomb&&!danger&&!controlExit)reasons.push('当前没有紧急拦截或明确收尾收益，交出炸弹会损失一次跨牌型夺权机会。');
      if(usedWild)reasons.push(`使用 ${usedWild} 张配牌，减少后续调整余地。`);
      const lastMove=remainingTurns===1?pool.find(x=>plan.mask(x)===remainingMask):null;
      const strategy={phase,role:teamObjective+(support?'；优先护送搭档':''),turnsBefore:beforeTurns,turnsAfter:remainingTurns,turnsSaved:beforeTurns-remainingTurns,bombsBefore:beforeReserve.count,bombsAfter:afterReserve.count,bombPlan:afterReserve.combinations,strongestBombBefore:beforeReserve.strongest,strongestBombAfter:afterReserve.strongest,lostBombReserve:lostReserve,breakBomb,breakFlush,usedWild,provenControl,controlExit,finishMove:lastMove?describe(lastMove):null,
        opponentThreat:opponents.filter(x=>x.count<=5),opponentBombRanks:bombRanks,unseenJokers,unseenBig,teamPlan:teamLead?'搭档控牌时让牌；只有收尾或明确拦截风险才接管。':feed?'先以低点同型牌试着交棒，搭档的具体牌型和点数仍未知。':support?'自己保留拦截牌，优先保护搭档先走。':'比较自己收尾路线与队友接手机会，不只看本手出牌张数。',
        nextPlan:lastMove?`余牌可出${describe(lastMove)}；${provenControl?'本手对对手有保守控牌依据。':'须先重新取得出牌权，不能假定连续领出。'}`:`余牌约 ${remainingTurns} 手，保留 ${afterReserve.count} 组互不占牌的炸弹类组合，按公开行动重新评估。`};
      return {move:m,score,facts,reasons,remaining:remaining.length,finish,breakBomb,breakFlush,usedWild,remainingTurns,turnsKeep:(typeof turnsKeep!=='undefined'?turnsKeep:remainingTurns),strategy};
    });
    if(o.trick)scored.push({move:null,score:teamLead?(tableVulnerable?0:W.passTeamLead):danger?W.passDanger:0,facts:['本次不出牌，保留全部手牌。'],reasons:[tableVulnerable?'搭档当前最大，但对手报单或报双，过牌可能让其接走；比较你是否有合适的拦截牌。':teamLead?(o.counts[partner]===0?'搭档已走完，让本轮自然结束可争取借风领出。':'搭档控牌时优先让牌，保留自己的高牌与组合。'):danger?'对手接近走完，放行可能失去最后的拦截机会。':'没有迫切拦截需要时，可保留控制牌；同时承担对手继续领出的风险。'],remaining:o.hand.length,finish:false,breakBomb:0,usedWild:0,remainingTurns:beforeTurns});
    const pass=scored.find(x=>!x.move);
    if(pass){
      if(W.duHold&&ourSomeoneOut&&o.counts[partner]>0)pass.score+=W.duHold;
      if(objNow==='afterHead'&&W.objHeadYield&&o.counts[partner]>0&&o.counts[partner]<=o.hand.length)pass.score+=W.objHeadYield;
      if(objNow==='afterTheirHead'&&W.objLossBlock&&lowestOpp<=5)pass.score-=W.objLossBlock;
    }
    if(pass)pass.strategy={phase,role:teamObjective+(support?'；优先护送搭档':''),turnsBefore:beforeTurns,turnsAfter:beforeTurns,turnsSaved:0,bombsBefore:beforeReserve.count,bombsAfter:beforeReserve.count,bombPlan:beforeReserve.combinations,lostBombReserve:0,opponentThreat:opponents.filter(x=>x.count<=5),teamPlan:teamLead?'保留组合，等待搭档继续领出或借风。':'保留控制牌，但承担对手继续领出的风险。',nextPlan:'过牌不保证之后拿回牌权；继续根据公开行动和对手张数调整。'};
    return scored.sort((a,b)=>b.score-a.score||(a.move?.key||'').localeCompare(b.move?.key||''));
  }
  // 局面目标（只用公开信息）：
  //   head             无人走完      → 争头游
  //   afterHead        己方已头游    → 争双上（把搭档送到二游，自己甘当三游）
  //   afterTheirHead   对方已头游    → 免双下（争二游，其次三游）
  function objectiveOf(o){
    if(!o.finish.length)return 'head';
    return o.finish[0]%2===o.seat%2?'afterHead':'afterTheirHead';
  }
  function weightsFor(o,W=WEIGHTS){
    const obj=objectiveOf(o);
    if(obj==='afterHead'&&W.objHeadTurns===1&&W.objHeadFeed===0&&W.objHeadSteal===0)return W;
    if(obj==='afterTheirHead'&&W.objLossTurns===1&&W.objLossBomb===1)return W;
    if(obj==='afterHead')return {...W,turns:W.turns*W.objHeadTurns,feed:W.feed+W.objHeadFeed,partnerDoneSteal:W.partnerDoneSteal+W.objHeadSteal};
    if(obj==='afterTheirHead')return {...W,turns:W.turns*W.objLossTurns,bombUse:W.bombUse*W.objLossBomb};
    return W;
  }
  function choose(s,seat=s.turn,W=WEIGHTS) {
    const o=observe(s,seat);
    let rows=analyse(o,weightsFor(o,W));
    // 硬规则：整局第一手（空桌面）不允许单出王。除非手里只有王这一种合法出牌。
    if(o.step===0&&!o.trick&&rows.length){
      const isJoker=m=>m&&m.type==='single'&&INDEX[m.ids[0]].r>=16;
      const filtered=rows.filter(r=>!isJoker(r.move));
      if(filtered.length) rows=filtered;
    }
    // 合作规则：桌面由搭档控制时，通常不压搭档的牌；但对手快走完（≤1 张）时必须抢回牌权拦截。
    if(W.partnerHold&&o.trick&&o.trick.seat%2===o.seat%2){
      const oppMin=Math.min(...o.counts.filter((c,i)=>i%2!==o.seat%2));
      if(oppMin>1){
        const keep=rows.filter(r=>!r.move||r.finish);
        if(keep.length)rows=keep;
      }
    }
    // 防跑牌：领出时若对手只剩 1 张，避免送出单张（除非只剩单张可选）。
    if(W.antiRunout&&!o.trick&&rows.length){
      const oppCounts=o.counts.filter((c,i)=>i%2!==o.seat%2);
      const minOpp=Math.min(...oppCounts);
      if(minOpp<=1){
        const nonSingle=rows.filter(r=>r.move&&r.move.type!=='single');
        if(nonSingle.length)rows=nonSingle;
      }
    }
    // 尾牌阻击二：下家对手只剩 1 张时，跟单张要尽量出大牌盖住桌面，
    // 让下家无法用他最后一张单牌抢走牌权（必要时压搭档的单张也算合理）。
    if(W.antiRunout&&o.trick&&o.trick.move.type==='single'){
      const nextOpp=o.counts[(o.seat+1)%4];
      if(nextOpp===1){
        const singles=rows.filter(r=>r.move&&r.move.type==='single');
        if(singles.length){
          singles.sort((a,b)=>b.move.power-a.move.power);
          rows=[singles[0]];
        }
      }
    }
    // 大牌经济：开局/中盘不为了赢一手小牌甩王（能走完或对手快走完时除外）。
    if(W.jokerHold&&rows.length>1&&o.counts.filter((c,i)=>i%2!==o.seat%2).every(c=>c>2)&&o.hand.length>6){
      const isBigJoker=r=>r.move&&r.move.type==='single'&&INDEX[r.move.ids[0]].r>=16;
      const keep=rows.filter(r=>!isBigJoker(r)||r.finish);
      if(keep.length)rows=keep;
    }
    // 三带二带王：有替代解释时不出（除非能直接走完）
    if(rows.length>1){
      const carryJoker=r=>{
        if(!r.move||r.move.type!=='full'||r.finish)return false;
        const cnt={}; for(const id of r.move.ids){const k=INDEX[id].r;cnt[k]=(cnt[k]||0)+1;}
        return r.move.ids.some(id=>{const rk=INDEX[id].r;return rk>=16 && cnt[rk]===2;});
      };
      const keep=rows.filter(r=>!carryJoker(r));
      if(keep.length)rows=keep;
    }
    // 3) 搭档快走完时：领出优先小单张/小对子喂牌
    if(W.escortLead && !o.trick && rows.length>1){
      const partner=o.counts[(o.seat+2)%4];
      // 搭档剩几张就喂什么型：1 张喂单张、2 张喂对子、3 张喂三张/三带二
      const want=partner===1?['single']:partner===2?['pair']:partner===3?['triple','full']:[];
      if(want.length){
        const feedRows=rows.filter(r=>r.move&&want.includes(r.move.type)&&r.move.power<=8);
        if(feedRows.length)rows=feedRows.concat(rows.filter(r=>!feedRows.includes(r)));
      }
    }
    const best=rows[0];
    if(!best)throw Error('没有可用动作');
    return best.move?{seat,kind:'play',move:best.move}:{seat,kind:'pass'};
  }
  function explainChoice(before,action) {
    const o=observe(before,action.seat??before.turn),all=analyse(o);
    const chosen=action.kind==='pass'?all.find(x=>!x.move):all.find(x=>x.move?.key===action.move.key);
    let detail=chosen;
    if(!detail&&action.kind==='play') {
      const cs=action.move.ids.map(id=>o.hand.find(c=>c.id===id));
      detail={facts:[`打出 ${cs.length} 张，剩 ${o.hand.length-cs.length} 张。`],reasons:['这是合法选择。当前教练仅枚举部分同点牌的花色组合，不将未枚举方案判为错误。']};
    }
    const missedFinish=all.some(x=>x.finish)&&!(action.kind==='play'&&action.move.ids.length===o.hand.length);
    return {facts:detail?.facts||[],reasons:detail?.reasons||[],alternatives:all.slice(0,5),strategy:detail?.strategy||null,missedFinish,tag:missedFinish?'留意出完机会':before.trick?.seat%2===o.seat%2?'搭档配合':all.some(x=>x.breakBomb)?'结构与控制':'出牌结构'};
  }
  function replay(start,events) {
    const states=[initial(start)];for(const action of events)states.push(apply(states[states.length-1],action));return states;
  }
  function decisionTrace(raw){
    if(!raw||!['minimax','local','rules'].includes(raw.source))return null;
    const trace={source:raw.source,cached:raw.cached===true};
    for(const key of ['model','reason','teamwork','nextPlan','failure','version'])if(typeof raw[key]==='string')trace[key]=raw[key].slice(0,key==='model'||key==='version'?80:200);
    return trace;
  }
  function importRecord(raw) {
    if(!raw||raw.format!=='guandan-lab-record-v1'||raw.start?.rules!==VERSION)throw Error('不是本程序支持的牌谱版本');
    if(!Array.isArray(raw.events)||raw.events.length>800)throw Error('动作记录不合法或过长');
    const start=makeStart(raw.start.hands,raw.start.level,raw.start.lead,raw.start.seed,raw.start.kind);
    const events=raw.events.map(a=>{
      if(!a||!['play','pass'].includes(a.kind))throw Error('记录含未知动作');
      if(!Number.isInteger(a.seat)||a.seat<0||a.seat>3)throw Error('记录缺少合法行动座位');
      const action=a.kind==='pass'?{kind:'pass',seat:a.seat}:{kind:'play',seat:a.seat,move:{ids:a.move?.ids,type:a.move?.type,power:a.move?.power,key:a.move?.key}};
      if(['human','bot','lesson'].includes(a.origin))action.origin=a.origin;
      if(a.assisted===true&&a.origin==='human')action.assisted=true;
      if(a.origin==='bot'&&decisionTrace(a.decision))action.decision=decisionTrace(a.decision);
      return action;
    });
    const states=replay(start,events);
    // Rebuild declared move details from the rules engine; never trust imported prose.
    for(let i=0;i<events.length;i++)if(events[i].kind==='play')events[i].move=states[i+1].lastActions[events[i].seat].move;
    const notes={};
    if(raw.notes&&typeof raw.notes==='object')for(const [key,value] of Object.entries(raw.notes)){
      if(/^\d+$/.test(key)&&+key<events.length&&typeof value==='string')notes[key]=value.slice(0,1000);
    }
    const record={id:typeof raw.id==='string'?raw.id.slice(0,100):`import-${Date.now()}`,created:typeof raw.created==='string'?raw.created.slice(0,50):new Date().toISOString(),format:'guandan-lab-record-v1',start,events,title:typeof raw.title==='string'?raw.title.slice(0,80):'导入牌局',branchOf:typeof raw.branchOf==='string'?raw.branchOf.slice(0,100):null,lessonId:typeof raw.lessonId==='string'?raw.lessonId.slice(0,60):null,notes};
    if(raw.perspective!==undefined){
      const p=raw.perspective;
      if(!p||!record.branchOf||typeof p.rootId!=='string'||!p.rootId||![0,1,2,3].includes(p.offset)||!Number.isInteger(p.atStep)||p.atStep<0||p.atStep>events.length)throw Error('换座记录的来源或接手步骤不合法');
      record.perspective={rootId:p.rootId.slice(0,100),offset:p.offset,atStep:p.atStep};
    }
    return record;
  }
  // Rotate coordinates, never swap individual cards or change action order.
  function rotateStart(start,seat){return makeStart([0,1,2,3].map(p=>start.hands[(p+seat)%4]),start.level,(start.lead-seat+4)%4,start.seed,start.kind);}
  function sourceStart(record){return rotateStart(record.start,(4-(record.perspective?.offset||0))%4);}
  function rotateRecord(raw,seat,step,id){
    const parent=importRecord(raw);
    if(![0,1,2,3].includes(seat)||!Number.isInteger(step)||step<0||step>parent.events.length||typeof id!=='string'||!id||id===parent.id)throw Error('请选择有效座位和复盘步骤');
    const state=replay(parent.start,parent.events.slice(0,step)).at(-1);
    if(state.over||!state.hands[seat].length)throw Error('这个位置已结束，请改为从头重打');
    const events=clone(parent.events.slice(0,step));
    for(const action of events){
      action.seat=(action.seat-seat+4)%4;
      // Old model prose uses the old coordinates; the original remains in its archive.
      if(seat&&action.decision){delete action.decision.teamwork;delete action.decision.nextPlan;action.decision.reason='沿用原局动作；原方位的说明请返回原局查看。';}
    }
    return importRecord({...parent,id,created:new Date().toISOString(),start:rotateStart(parent.start,seat),events,notes:{},branchOf:parent.id,
      perspective:{rootId:parent.perspective?.rootId||parent.id,offset:((parent.perspective?.offset||0)+seat)%4,atStep:step}});
  }
  const API={VERSION,STRATEGY_VERSION,WEIGHTS,LEGACY_WEIGHTS_V4,objectiveOf,weightsFor,initialWithTribute,SUITS,SYMBOLS,RANKS,TYPES,INDEX,deck,random,deal,makeStart,initial,sort,wild,power,name,rankName,enumerate,findStraightFlushes,classify,beats,bombTier,describe,apply,observe,structure,analyse,choose,explainChoice,replay,importRecord,decisionTrace,clone,rotateRecord,sourceStart};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  root.Guandan=API;
})(typeof globalThis!=='undefined'?globalThis:this);
