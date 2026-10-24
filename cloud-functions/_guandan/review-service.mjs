import {prepareReview,parseReview,SYSTEM_PROMPT,ReviewError,REVIEW_VERSION} from './review-context.mjs';
export const ENDPOINT='https://api.minimax.cn/v1/chat/completions';
export const MODEL='MiniMax-M2.5';
export const MAX_BODY=350000,MAX_COMPLETION_TOKENS=8192;
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
export function limits(env){if(env.AI_UNLIMITED==='true')return null;const n=(v,d,max)=>Math.min(max,Math.max(1,Math.floor(Number(v)||d)));return {daily:n(env.AI_DAILY_LIMIT,50,100),visitor:n(env.AI_VISITOR_DAILY_LIMIT,15,20)};}
async function readBody(request){
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new ReviewError('需要 JSON 格式的牌谱。',415);
  if(Number(request.headers.get('content-length'))>MAX_BODY)throw new ReviewError('牌谱超过请求上限。',413);
  const reader=request.body?.getReader();if(!reader)throw new ReviewError('缺少牌谱。');
  const chunks=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX_BODY){await reader.cancel();throw new ReviewError('牌谱超过请求上限。',413);}chunks.push(value);}
  const all=new Uint8Array(length);let pos=0;for(const b of chunks){all.set(b,pos);pos+=b.length;}
  try{return JSON.parse(new TextDecoder().decode(all));}catch{throw new ReviewError('牌谱 JSON 无法解析。');}
}
export async function callMiniMax(context,env,fetcher=fetch){
  const usage={inputTokens:0,outputTokens:0};
  // One bounded repair attempt; never send the provider's partial answer back.
  for(let attempt=0;attempt<2;attempt++){
    const active=attempt?{...context,decisions:context.decisions.slice(0,context.mode==='game'?2:1)}:context;
    const prompt=SYSTEM_PROMPT+(attempt?' 本次采用精简版：每个字段仅一句话；口语稿80字左右，只分析给定步骤。':'');
    let response;
    try{response=await fetcher(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.MINIMAX_API_KEY}`},body:JSON.stringify({model:env.MINIMAX_MODEL||MODEL,messages:[{role:'system',content:prompt},{role:'user',content:JSON.stringify(active)}],max_completion_tokens:MAX_COMPLETION_TOKENS,reasoning_split:true,temperature:0.6,stream:false}),signal:AbortSignal.timeout(50000)});}
    catch{throw new ReviewError('MiniMax 连接超时或暂不可用，请稍后再试。',502);}
    if(!response.ok)throw new ReviewError(response.status===429?'MiniMax 当前限流，请稍后再试。':'MiniMax 暂时无法完成点评，请联系网站维护者检查配置。',502);
    let data;try{data=await response.json();}catch{throw new ReviewError('MiniMax 返回了无法解析的数据。',502);}
    if((data.base_resp&&data.base_resp.status_code!==0)||data.error)throw new ReviewError('MiniMax 当前无法完成请求，请联系维护者检查接口状态。',502);
    const choice=data.choices?.[0];
    usage.inputTokens+=Number(data.usage?.prompt_tokens)||0;usage.outputTokens+=Number(data.usage?.completion_tokens)||0;
    try{
      if(choice?.finish_reason==='length')throw new ReviewError('模型生成被截断。',502);
      const parsed=parseReview(choice?.message?.content,active);
      return {...parsed,model:env.MINIMAX_MODEL||MODEL,createdAt:new Date().toISOString(),version:REVIEW_VERSION,mode:context.mode,scope:active.scope,totalSteps:context.timeline.length,reviewedSteps:active.decisions.map(x=>x.step),compactRetry:attempt>0,usage};
    }catch(error){
      console.warn(JSON.stringify({event:'review_output_retry',mode:context.mode,attempt:attempt+1,finishReason:choice?.finish_reason||'missing',contentCharacters:choice?.message?.content?.length||0,reasoningCharacters:choice?.message?.reasoning_content?.length||0,outputTokens:Number(data.usage?.completion_tokens)||0}));
      if(attempt)throw new ReviewError('精简点评仍未完整生成，请稍后重试，或在时间线选择单步点评。',502);
    }
  }
}
export async function handleReview(request,env,{repository,fetcher=fetch}={}){
  try{
    const cap=limits(env);
    if(request.method==='GET')return json({configured:!!env.MINIMAX_API_KEY&&!!repository,model:env.MINIMAX_MODEL||MODEL,limits:cap,unlimited:cap===null});
    if(request.method!=='POST')return json({error:'不支持此方法。'},405);
    const origin=request.headers.get('origin'),url=new URL(request.url);
    if((origin&&origin!==url.origin)||request.headers.get('sec-fetch-site')==='cross-site')throw new ReviewError('请从本站发起点评。',403);
    if(!env.MINIMAX_API_KEY||!repository)throw new ReviewError('AI 点评尚未配置完成，当前仍可使用本地规则复盘。',503);
    const input=await readBody(request),context=prepareReview(input),model=env.MINIMAX_MODEL||MODEL;
    const key=await sha(JSON.stringify({model,context}));
    const existing=await repository.get(key);
    if(existing?.status==='done')return json({...JSON.parse(existing.payload),cached:true});
    const now=Date.now(),day=new Date(now+8*3600000).toISOString().slice(0,10);
    const visitor=await sha(`${env.MINIMAX_API_KEY}:${day}:${request.headers.get('cf-connecting-ip')||'unknown'}`);
    const nonce=crypto.randomUUID();
    const reservation=await repository.reserve({key,day,visitor,nonce,now,cap});
    if(reservation==='cached'){const done=await repository.get(key);return json({...JSON.parse(done.payload),cached:true});}
    if(reservation==='pending')throw new ReviewError('这份点评正在生成，请稍后再点击；重复请求不会再次调用模型。',409);
    if(reservation!=='reserved')throw new ReviewError('今日 AI 体验次数已用完（全站或当前网络）。北京时间零点恢复；本地练习与复盘仍可使用。',429);
    try{
      const result={...await callMiniMax(context,env,fetcher),reference:key};
      await repository.complete(key,nonce,result);
      return json({...result,cached:false});
    }catch(error){await repository.fail(key,nonce);throw error;}
  }catch(error){return json({error:error instanceof ReviewError?error.message:'点评服务暂不可用，请稍后再试。'},error instanceof ReviewError?error.status:503);}
}
