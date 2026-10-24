import './speech-runtime.js';
import {sha,limits} from './review-service.mjs';
import {ReviewError} from './review-context.mjs';
const S=globalThis.GuandanSpeech;
export const VOICE='Chinese (Mandarin)_Reliable_Executive',VOICE_NAME='沉稳高管',SPEECH_MODEL='speech-2.8-hd';
const sentences=new Set(['进入复盘','初始局面','语音播报已开启']);
for(let level=2;level<=14;level++)sentences.add('开始练习，打'+S.rank(level));
for(const seat of ['你','下家','搭档','上家','电脑代你']){
 sentences.add(seat+'过牌');
 for(const type of ['single','pair','triple','full','straight','pairs','triples','flush','bomb','kings'])for(let main=2;main<=17;main++)for(const count of type==='bomb'?[4,5,6,7,8,9,10]:[5])sentences.add(seat+'出'+S.moveText({type,main,ids:Array(count)}));
 for(let place=1;place<=4;place++)sentences.add(`${seat}出完了，第${S.rank(place)}名`);
}
for(let n=1;n<=5;n++)sentences.add(`还剩${S.rank(n)}张`);
for(let turn=0;turn<4;turn++)for(const trick of [null,{}])for(const leadReason of ['','借风'])sentences.add(S.turnText({turn,trick,leadReason}).slice(0,-1));
for(const team of [0,1])for(const doubleDown of [true,false])sentences.add(S.turnText({over:true,result:{team,doubleDown}}).slice(0,-1));
export function tableText(value){
 if(typeof value!=='string'||value.length>180)throw new ReviewError('播报内容无效。');
 let text=value.replace(/^回放第(?:[1-9]\d{0,2})步。/,'');
 const parts=text.split('。').filter(Boolean);
 if(!parts.length||parts.length>5||!parts.every(x=>sentences.has(x)))throw new ReviewError('仅支持本程序的牌局播报。');
 return value;
}
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const audio=(body,cached)=>new Response(body,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400','X-Voice-Name':'Reliable-Executive','X-Audio-Cache':cached?'hit':'miss','X-Content-Type-Options':'nosniff'}});
export async function synthesize(text,env,fetcher=fetch){
 let response;
 try{response=await fetcher('https://api.minimax.cn/v1/t2a_v2',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${env.MINIMAX_API_KEY}`},body:JSON.stringify({model:SPEECH_MODEL,text,stream:false,language_boost:'Chinese',voice_setting:{voice_id:VOICE,speed:0.96,vol:1,pitch:0},audio_setting:{sample_rate:32000,bitrate:128000,format:'mp3',channel:1},output_format:'hex'}),signal:AbortSignal.timeout(60000)});}catch{throw new ReviewError('MiniMax 语音连接超时，请稍后再试。',502);}
 if(!response.ok)throw new ReviewError('MiniMax 语音暂不可用，请稍后再试。',502);
 let data;try{data=await response.json();}catch{throw new ReviewError('语音服务返回异常。',502);}
 const hex=data.data?.audio;
 if(data.base_resp?.status_code!==0||typeof hex!=='string'||!hex.length||hex.length>12000000||hex.length%2||!/^[a-f0-9]+$/i.test(hex))throw new ReviewError('语音未能生成，请稍后重试。',502);
 return Uint8Array.from(hex.match(/../g),x=>parseInt(x,16));
}
export async function handleSpeech(request,env,{repository,bucket=env.BUCKET,fetcher=fetch}={}){
 try{
  if(request.method==='GET')return json({configured:!!env.MINIMAX_API_KEY&&!!bucket&&!!repository,voice:VOICE_NAME,model:SPEECH_MODEL});
  if(request.method!=='POST')return json({error:'不支持此方法。'},405);
  if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new ReviewError('请从本站播放语音。',403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new ReviewError('需要 JSON 请求。',415);
  if(!env.MINIMAX_API_KEY||!bucket||!repository)throw new ReviewError('MiniMax 语音尚未就绪。',503);
  if(Number(request.headers.get('content-length'))>4096)throw new ReviewError('播报请求过长。',413);
  const reader=request.body?.getReader();if(!reader)throw new ReviewError('缺少播报内容。');let size=0;const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw new ReviewError('播报请求过长。',413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let input;try{input=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ReviewError('播报请求格式不正确。');}
  let text;
  if(input.kind==='review'){
   if(!/^[a-f0-9]{64}$/.test(input.reference||''))throw new ReviewError('点评编号无效。');
   const saved=await repository.get(input.reference);if(saved?.status!=='done')throw new ReviewError('请先生成点评，再播放解读。',404);
   text=JSON.parse(saved.payload).spokenSummary;if(typeof text!=='string'||!text.length||text.length>600)throw new ReviewError('这份点评没有语音稿，请重新生成。',404);
  }else if(input.kind==='table')text=tableText(input.text);else throw new ReviewError('未知播报类型。');
  const key=await sha(`voice-v1:${SPEECH_MODEL}:${VOICE}:${text}`),objectKey='voice/'+key+'.mp3';
  const cached=await bucket.get(objectKey);if(cached)return audio(cached.body,true);
  const now=Date.now(),day=new Date(now+8*3600000).toISOString().slice(0,10),nonce=crypto.randomUUID();
  const visitor=await sha(`${env.MINIMAX_API_KEY}:speech:${day}:${request.headers.get('cf-connecting-ip')||'unknown'}`);
  const isReview=input.kind==='review',cost=isReview?1:text.length,cap=env.AI_UNLIMITED==='true'?null:isReview?limits(env):{daily:20000,visitor:5000};
  const claim=await repository.reserve({key:'voice:'+key,day,visitor,nonce,now,cap,cost,scope:isReview?'voice-review':'voice-table'});
  if(claim==='cached'){const done=await bucket.get(objectKey);if(done)return audio(done.body,true);throw new ReviewError('语音缓存暂不可用。',503);}
  if(claim==='pending')throw new ReviewError('这段语音正在准备，稍后重播即可。',409);
  if(claim!=='reserved')throw new ReviewError('今日新语音体验量已用完，已有语音仍可播放。',429);
  try{const mp3=await synthesize(text,env,fetcher);await bucket.put(objectKey,mp3,{httpMetadata:{contentType:'audio/mpeg'}});await repository.complete('voice:'+key,nonce,{audioKey:objectKey});return audio(mp3,false);}
  catch(error){await repository.fail('voice:'+key,nonce);throw error;}
 }catch(error){return json({error:error instanceof ReviewError?error.message:'语音服务暂不可用。'},error instanceof ReviewError?error.status:503);}
}
