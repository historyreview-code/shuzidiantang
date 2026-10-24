(function(root){
 'use strict';
 const KEY='alpha-guandan-experience-v1',VERSION='experience-v1';
 const principles={
  bombs:{title:'炸弹是夺权资源',advice:'比较组炸与拆炸之后的余牌手数；能立即收尾或阻止对手走完时，不机械保炸。'},
  defense:{title:'按威胁安排防守',advice:'对手接近走完时，比较出牌顺序、当前牌型和可用拦截牌；剩余张数不能证明具体牌型。'},
  teamwork:{title:'为搭档保留接手机会',advice:'搭档控牌时比较让牌与必要接管；报单可试低单交棒，已走完则比较借风路线。'},
  control:{title:'把牌权接到收尾路线',advice:'比较控制牌加余牌一手出完的路线，并检查对手能否压过；余牌能出完不等于一定有牌权。'},
  structure:{title:'先算整手再选一手',advice:'比较出牌后还剩几手、弱牌是否增加、配牌是否重复占用；不能只追求这一手出得多。'}
 };
 const risk=n=>n<=1?'one':n===2?'two':n<=5?'few':'many';
 function scenario(o){const partner=(o.seat+2)%4,enemy=o.counts.filter((n,p)=>p%2!==o.seat%2&&n>0);return {phase:Math.min(...enemy)<=5||o.hand.length<=8||o.counts[partner]<=5?'end':'middle',risk:risk(Math.min(...enemy)),lead:!o.trick?'free':o.trick.seat===partner?'partner':o.trick.seat===o.seat?'self':'opponent'};}
 const validScenario=s=>s&&['middle','end'].includes(s.phase)&&['one','two','few','many'].includes(s.risk)&&['free','self','partner','opponent'].includes(s.lead);
 const groupKey=x=>[x.principle,x.scenario.phase,x.scenario.risk,x.scenario.lead].join(':');
 function extract(context,decisions){return decisions.flatMap(d=>{
  const fact=context.decisions.find(x=>x.step===d.step);if(!fact||!d.candidate)return [];
  const s=d.candidate.strategy||fact.strategy;if(!s)return [];
  const tags=[];if(s.controlExit)tags.push('control');if(s.bombsBefore||s.breakBomb||s.breakFlush)tags.push('bombs');if(s.opponentThreat?.length)tags.push('defense');if(fact.table?.seat===fact.partner||fact.counts[fact.partnerIndex]<=5)tags.push('teamwork');tags.push('structure');
  return tags.slice(0,2).map(principle=>({version:VERSION,principle,scenario:fact.experienceScenario,seat:fact.seatIndex,step:d.step,observation:d.comment,comparison:d.alternative,candidate:d.candidate.type,cards:d.candidate.cards}));
 });}
 function sanitize(packet){return (Array.isArray(packet)?packet:[]).slice(0,100).filter(x=>Object.hasOwn(principles,x?.principle)&&validScenario(x.scenario)).map(x=>({principle:x.principle,scenario:{phase:x.scenario.phase,risk:x.scenario.risk,lead:x.scenario.lead},games:Math.min(200,Math.max(1,Math.floor(Number(x.games)||1))),observations:Math.min(200,Math.max(1,Math.floor(Number(x.observations)||1)))}));}
 function retrieve(packet,o){const s=scenario(o);return sanitize(packet).filter(x=>JSON.stringify(x.scenario)===JSON.stringify(s)).sort((a,b)=>b.games-a.games||b.observations-a.observations).slice(0,4).map(x=>({...x,...principles[x.principle],status:'本机复盘中的条件性比较，未独立验证，不是胜率证据'}));}
 function createStore(storage){let data={enabled:true,entries:[],backup:[]};try{const d=JSON.parse(storage.getItem(KEY));if(d&&Array.isArray(d.entries))data={enabled:d.enabled!==false,entries:d.entries.filter(x=>Object.hasOwn(principles,x?.principle)&&validScenario(x.scenario)).slice(-200),backup:[]};}catch{}
  const save=()=>{try{storage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}};
  function ingest(result,source){if(result.version!=='guandan-review-v7'||!source.gameId)return 0;let added=0;
   for(const x of result.experiences||[]){if(!Object.hasOwn(principles,x?.principle)||!validScenario(x.scenario)||!Number.isInteger(x.step)||x.step<1||![0,1,2,3].includes(x.seat))continue;
    const sourceSeat=(x.seat+([0,1,2,3].includes(source.seatOffset)?source.seatOffset:0))%4;
    const id=[source.gameId,sourceSeat,x.step,x.principle].join(':');if(data.entries.some(e=>e.id===id))continue;
    data.entries.push({...x,id,gameId:source.gameId,recordId:source.recordId,reference:result.reference,createdAt:result.createdAt});added++;
   }data.entries=data.entries.slice(-200);save();return added;
  }
  function packet(){if(!data.enabled)return [];const groups=new Map();for(const e of data.entries){const key=groupKey(e),g=groups.get(key)||{principle:e.principle,scenario:e.scenario,gameIds:new Set(),observations:0};g.gameIds.add(e.gameId);g.observations++;groups.set(key,g);}return [...groups.values()].map(x=>({principle:x.principle,scenario:x.scenario,games:x.gameIds.size,observations:x.observations}));}
  return {ingest,packet,snapshot:()=>({enabled:data.enabled,entries:[...data.entries],canRestore:!!data.backup.length}),enable:value=>{data.enabled=!!value;save();},clear:()=>{data.backup=data.entries;data.entries=[];save();},restore:()=>{data.entries=data.backup;data.backup=[];save();}};
 }
 root.GuandanExperience={VERSION,principles,scenario,extract,sanitize,retrieve,createStore};
})(globalThis);
