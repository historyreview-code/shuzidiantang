import {readBody,sameOrigin} from './review-service.mjs';
export function createMetricsRepository(store,{now=Date.now,ttl=60000}={}){
 let cached=null,pending=null;
 async function count(prefix){let count=0,cursor;for(let page=0;page<100;page++){const result=await store.list({prefix,cursor,limit:1000,paginate:false});count+=result.blobs.length;if(!result.cursor)return {count,partial:false};cursor=result.cursor;}return {count,partial:true};}
 return {
  async record({device,game,kind}){const event={schema:1};await store.setJSON(`players/${device}`,event);if(kind==='finished')await store.setJSON(`started/${device}/${game}`,event);await store.setJSON(`${kind}/${device}/${game}`,event);},
  async stats(){if(cached&&cached.until>now())return cached.value;if(pending)return pending;pending=(async()=>{const [players,started,finished]=await Promise.all(['players/','started/','finished/'].map(count));const value={players:players.count,started:started.count,finished:finished.count,partial:players.partial||started.partial||finished.partial,asOf:new Date(now()).toISOString(),definition:'参与设备数按当前浏览器匿名标识去重；完成局数仅统计新版上线后的完整实战，非实名人数，数据可能延迟一分钟。'};cached={until:now()+ttl,value};return value;})();try{return await pending;}finally{pending=null;}}
 };
}
export async function handleMetrics(request,{repository,env={}}){const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});try{
 if(request.method==='GET')return json(await repository.stats());
 if(request.method!=='POST')return json({error:'不支持此方法。'},405);
 if(!sameOrigin(request,env))return json({error:'请从本站发起。'},403);
 const x=await readBody(request,2048);if(!/^[a-f0-9-]{36}$/i.test(x.device)||!/^[A-Za-z0-9_-]{6,80}$/.test(x.game)||!['started','finished'].includes(x.kind))return json({error:'统计事件无效。'},400);
 await repository.record({device:x.device,game:x.game,kind:x.kind});return json({recorded:true});
 }catch{return json({error:'体验数据暂不可用。'},503);}}
