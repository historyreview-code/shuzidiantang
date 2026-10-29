import {readBody,sameOrigin} from './review-service.mjs';
const KINDS=new Set(['started','finished','result','error']);
const num=v=>Number.isFinite(+v)?Math.max(0,Math.min(86400,+v)):0;
const txt=(v,n)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').slice(0,n);
export function createMetricsRepository(store,{now=Date.now,ttl=60000}={}){
 let cached=null,pending=null;
 async function count(prefix){let count=0,cursor;for(let page=0;page<100;page++){const result=await store.list({prefix,cursor,limit:1000,paginate:false});count+=result.blobs.length;if(!result.cursor)return {count,partial:false};cursor=result.cursor;}return {count,partial:true};}
 async function put(kind,device,game,extra={}){await store.setJSON(`${kind}/${device}/${game}`,{schema:2,...extra,at:new Date(now()).toISOString()});}
 return {
  async record(x){
   if(x.kind==='started'||x.kind==='finished'){await store.setJSON(`players/${x.device}`,{schema:1});if(x.kind==='finished')await put('started',x.device,x.game);await put(x.kind,x.device,x.game);return;}
   if(x.kind==='result'){
    const ours=!!x.win,dbl=!!x.dbl,undo=Math.round(num(x.undo)),sec=Math.round(num(x.seconds));
    await put('results/all',x.device,x.game,{ours,dbl,undo,sec});
    await put(ours?'results/win':'results/loss',x.device,x.game,{});
    if(ours&&dbl)await put('results/doubleup',x.device,x.game,{});
    if(!ours&&dbl)await put('results/doubledown',x.device,x.game,{});
    if(undo>0)await put(`results/undo/${Math.min(undo,5)}`,x.device,x.game,{undo});
    if(sec>=300)await put('results/long',x.device,x.game,{sec});
    return;
   }
   if(x.kind==='error'){const tag=txt(x.tag,24).replace(/[^a-z0-9_-]/gi,'')||'client';await put('errors/all',x.device,x.game,{tag,message:txt(x.message,200),stack:txt(x.stack,900),url:txt(x.url,200)});await put(`errors/${tag}`,x.device,x.game,{});return;}
  },
  async stats(){
   if(cached&&cached.until>now())return cached.value;
   if(pending)return pending;
   pending=(async()=>{
    const prefixes=['players/','started/','finished/','results/win/','results/loss/','results/doubleup/','results/doubledown/','errors/all/','results/long/'];
    const [players,started,finished,win,loss,doubleup,doubledown,errors,long]=await Promise.all(prefixes.map(count));
    const value={players:players.count,started:started.count,finished:finished.count,win:win.count,loss:loss.count,doubleUp:doubleup.count,doubleDown:doubledown.count,long:long.count,errors:errors.count,partial:[players,started,finished,win,loss,doubleup,doubledown,errors,long].some(x=>x.partial),asOf:new Date(now()).toISOString(),definition:'参与设备数按当前浏览器匿名标识去重；完成局数仅统计新版上线后的完整实战；胜负与双上统计自埋点版上线起，非实名人数，数据可能延迟一分钟。'};
    cached={until:now()+ttl,value};return value;
   })();
   try{return await pending;}finally{pending=null;}
  }
 };
}
export async function handleMetrics(request,{repository,env={}}){const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});try{
 if(request.method==='GET')return json(await repository.stats());
 if(request.method!=='POST')return json({error:'不支持此方法。'},405);
 if(!sameOrigin(request,env))return json({error:'请从本站发起。'},403);
 const x=await readBody(request,4096);
 if(!/^[a-f0-9-]{36}$/i.test(x.device)||!/^[A-Za-z0-9_-]{6,80}$/.test(x.game)||!KINDS.has(x.kind))return json({error:'统计事件无效。'},400);
 await repository.record(x);return json({recorded:true});
 }catch{return json({error:'体验数据暂不可用。'},503);}}
