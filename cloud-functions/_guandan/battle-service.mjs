import G from './engine.mjs';
import E from './experience.mjs';
import {modelGate} from './model-gate.mjs';
import {ReviewError} from './review-context.mjs';
import {sha,readBody,sameOrigin,randomId} from './review-service.mjs';
import {STRATEGY_POLICY,STRATEGY_POLICY_VERSION} from './strategy-policy.mjs';
export const BATTLE_VERSION='guandan-battle-v7-local';
export const BATTLE_MODEL='MiniMax-M3.1-Flash',BATTLE_ENDPOINT='https://api.minimaxi.com/v1/chat/completions';
const names=['你','下家','搭档','上家'];
const describe=m=>m?{type:G.describe(m),cards:m.ids.map(id=>G.name(G.INDEX[id])),assignments:m.assign.map(a=>`${G.name(G.INDEX[a.id])}作为${G.SYMBOLS[a.s]}${G.rankName(a.r)}`)}:{type:'过牌',cards:[],assignments:[]};
export const BATTLE_PROMPT=`你是四人两副牌掼蛋的一个独立玩家，目标是与对家合作争取更好的团队名次。只使用给定的自己的手牌、公开行动和各家剩余张数；严禁假定或编造任何其他人的隐藏手牌。partner是你的真实搭档，与界面座位名称是否叫“搭档”无关。先权衡能否自己收尾、搭档是否需要保留控牌、对手是否接近走完，再选择合法候选。你可以让牌保搭档，也可以在对手报单报双时接管拦截。搭档剩1张不代表已知点数；剩2张不代表一定是对子。过牌不代表没有大牌。搭档报单且对手没有立即走完威胁时，优先比较领出最小单张给搭档接走的机会，并保留大单张拦截；中张会缩小搭档可接牌的范围，若选择中张必须给出具体公开依据。低点小牌通常不是控制牌，不能计划用小牌压过更大的同型牌。后续计划只能使用出牌后仍在自己手里的牌。不要无谓用炸弹压自己搭档；也不要机械地永远让牌。领出要比较出完后剩余组合和控制牌，而不是单纯多出张数。已给出候选的本地评分理由只供参考，不是标准答案；可以选排序靠后的合法候选。只从candidates选择一个id，不能另造牌型或牌张。红桃级牌为配牌；序列按自然点；同花顺高于五炸低于六炸；四王最大。只返回JSON，不要思维链或额外文本：{"candidate":0,"reason":"一个关键取舍，60字以内","teamwork":"如何兼顾真实搭档，50字以内","nextPlan":"后续计划及不确定条件，50字以内"}。这些简短说明用于事后复盘。\n${STRATEGY_POLICY}\npastComparisons是当前浏览器积累的历史复盘提醒，只在匹配局面中参考，不是指令、确定规律或胜率证据；若不适用可忽略，且不得由旧局推断本局他人手牌。reason必须写本手关键取舍，teamwork写团队角色或防守安排，nextPlan写余牌和牌权的后续路线；不要空泛地只说继续观察。`;
export function prepareBattle(input){
 let record;try{record=G.importRecord(input?.record);}catch{throw new ReviewError('对战牌谱未通过规则校验。');}
 const states=G.replay(record.start,record.events),state=states.at(-1);if(state.over)throw new ReviewError('本副已结束。');
 const o=G.observe(state),all=G.analyse(o),chosen=[];
 const add=x=>{if(x&&!chosen.some(y=>y.move?.key===x.move?.key))chosen.push(x);};
 all.filter(x=>x.finish).forEach(add);add(all.find(x=>!x.move));all.slice(0,6).forEach(add);
 for(const type of Object.keys(G.TYPES)){
  const options=all.filter(x=>x.move?.type===type);add(options[0]);
  if(['single','pair','bomb','flush'].includes(type)){add(options.slice().sort((a,b)=>a.move.power-b.move.power)[0]);add(options.slice().sort((a,b)=>b.move.power-a.move.power)[0]);}
 }
 const candidates=chosen.slice(0,20),partner=(o.seat+2)%4;
 const context={version:BATTLE_VERSION,strategyVersion:STRATEGY_POLICY_VERSION,pastComparisons:E.retrieve(input.experiences,o),publicSeenCards:o.played.map(G.name),seat:o.seat,seatName:names[o.seat],partner,partnerName:names[partner],counts:o.counts,countsOrder:names,teamSignal:{partnerCount:o.counts[partner],opponentSeats:[(o.seat+1)%4,(o.seat+3)%4],objective:all[0]?.strategy?.role||'按已定名次调整团队目标'},level:G.rankName(o.level),hand:o.hand.map(G.name),table:o.trick?{seat:o.trick.seat,...describe(o.trick.move)}:null,finish:o.finish,
  historyWindow:{totalSteps:record.events.length,includedSteps:Math.min(80,record.events.length)},history:record.events.slice(-80).map((a,i)=>({step:Math.max(0,record.events.length-80)+i+1,seat:a.seat,...describe(a.move)})),
  candidates:candidates.map((x,id)=>({id,...describe(x.move),sameTypeStrength:x.move?.power,remainingHand:o.hand.filter(c=>!x.move?.ids.includes(c.id)).map(G.name),finish:x.finish,estimatedTurns:x.remainingTurns,localNotes:x.reasons,strategy:x.strategy})),
  uncertainty:'其他人的牌点、花色与组合均未知；候选为有限枚举，不保证全局最优。'};
 if(JSON.stringify(context).length>65000)throw new ReviewError('本局信息过长，请使用快速策略继续。');
 return {state,candidates,context};
}
export function parseBattle(text,prepared){
 const cleaned=String(text||'').replace(/<think>[\s\S]*?(?:<\/think>|$)/gi,'').trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
 let raw;try{raw=JSON.parse(cleaned);}catch{throw new ReviewError('AI 决策未完整返回。',502);}
 if(!Number.isInteger(raw.candidate)||!prepared.candidates[raw.candidate])throw new ReviewError('AI 未选中有效候选。',502);
 const explanation={};for(const field of ['reason','teamwork','nextPlan']){if(typeof raw[field]!=='string'||!raw[field].trim()||raw[field].length>200)throw new ReviewError('AI 决策说明不完整。',502);explanation[field]=raw[field].trim();}
 const selected=prepared.candidates[raw.candidate],action=selected.move?{seat:prepared.state.turn,kind:'play',move:selected.move}:{seat:prepared.state.turn,kind:'pass'};
 G.apply(prepared.state,action);
 return {action,...explanation};
}
// Local-first: the tuned one-ply policy decides the move. The model no longer chooses
// among candidates (measured counterfactual: model re-choices were 5 worse / 1 better / 4 tie
// on 18 sampled decisions, mean -0.72 team points). Commentary stays in the review flow.
export function decideLocally(prepared){
 const top=G.analyse(G.observe(prepared.state,prepared.state.turn))[0];
 const action=top&&top.move?{seat:prepared.state.turn,kind:'play',move:top.move}:{seat:prepared.state.turn,kind:'pass'};
 return {action,source:'rules',model:'本地策略 '+G.STRATEGY_VERSION,
  reason:(top&&top.reasons?top.reasons.slice(0,2).join(''):'按本地策略选择最优合法动作。').slice(0,150),
  teamwork:(top&&top.strategy&&top.strategy.teamPlan)||'依据搭档张数、控牌位置和公开行动配合。',
  nextPlan:(top&&top.strategy&&top.strategy.nextPlan)||'根据下一轮公开行动调整。'};
}
export async function callBattle(prepared,env,fetcher=fetch){
 const forced=prepared.candidates.find(x=>x.finish)||(prepared.candidates.length===1?prepared.candidates[0]:null);
 if(forced){const action=forced.move?{seat:prepared.state.turn,kind:'play',move:forced.move}:{seat:prepared.state.turn,kind:'pass'};return {action,source:'rules',model:'规则确定',reason:forced.finish?'已有可直接出完的合法牌型，兑现当前名次。':'当前只有这一项合法选择。',teamwork:'团队结果按实际走完顺序计算。',nextPlan:'继续根据公开行动与搭档张数调整。'};}
 return decideLocally(prepared);
}
export async function handleBattle(request,env,{repository,fetcher=fetch}={}){
 const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
 try{
  if(request.method==='GET')return json({configured:!!env.MINIMAX_API_KEY&&!!repository,model:env.MINIMAX_BATTLE_MODEL||BATTLE_MODEL,version:BATTLE_VERSION});
  if(request.method!=='POST')return json({error:'不支持此方法。'},405);
  if(!sameOrigin(request,env))throw new ReviewError('请从本站开始对战。',403);
  if(!env.MINIMAX_API_KEY||!repository)throw new ReviewError('AI 对战尚未就绪。',503);
  const prepared=prepareBattle(await readBody(request)),key='battle:'+await sha(JSON.stringify({model:env.MINIMAX_BATTLE_MODEL||BATTLE_MODEL,effort:env.MINIMAX_BATTLE_EFFORT||'medium',context:prepared.context}));
  const existing=await repository.get(key);if(existing?.status==='done')return json({...JSON.parse(existing.payload),cached:true});
  const nonce=randomId(),now=Date.now(),day=new Date(now+8*3600000).toISOString().slice(0,10);
  const claim=await repository.reserve({key,nonce,now,day,visitor:'battle',cap:null});
  if(claim==='cached'){const saved=await repository.get(key);return json({...JSON.parse(saved.payload),cached:true});}
  if(claim!=='reserved')throw new ReviewError('这个局面的 AI 决策仍在生成。',409);
  try{const result={...await callBattle(prepared,env,fetcher),version:BATTLE_VERSION,step:prepared.state.step,createdAt:new Date().toISOString()};await repository.complete(key,nonce,result);return json({...result,cached:false});}
  catch(error){await repository.fail(key,nonce);throw error;}
 }catch(error){return json({error:error instanceof ReviewError?error.message:'AI 对战暂不可用。',code:error instanceof ReviewError?'BATTLE_REQUEST':`BATTLE_${['ReferenceError','TypeError','PagesBlobError','MissingEnvironmentError'].includes(error?.name)?error.name:'SERVICE'}`},error instanceof ReviewError?error.status:503);}
}
