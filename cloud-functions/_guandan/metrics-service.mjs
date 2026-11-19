import {readBody,sameOrigin} from './review-service.mjs';
const KINDS=new Set(['started','finished','result','error']);
const num=v=>Number.isFinite(+v)?Math.max(0,Math.min(86400,+v)):0;
const txt=(v,n)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').slice(0,n);
const SITE_OFFSET_MS=8*3600*1000; // 统计按北京时间切天/切小时
export function createMetricsRepository(store,{now=Date.now,ttl=60000}={}){
 let cached=null,pending=null;
 async function count(prefix){let c=0,cursor;for(let page=0;page<100;page++){const r=await store.list({prefix,cursor,limit:1000,paginate:false});c+=r.blobs.length;if(!r.cursor)return {count:c,partial:false};cursor=r.cursor;}return {count:c,partial:true};}
 // 本日设备：直接按当日 start/finish 的键去重取设备段，今天之前的记录也能回填，不依赖额外写入。
 async function distinctDevices(prefixes){const seen=new Set();let partial=false;for(const prefix of prefixes){let cursor;for(let page=0;page<100;page++){const r=await store.list({prefix,cursor,limit:1000,paginate:false});for(const blob of r.blobs){const device=String(blob.key||'').split('/')[3];if(device)seen.add(device);}if(!r.cursor)break;cursor=r.cursor;if(page===99)partial=true;}}return {count:seen.size,partial};}
 function dayOf(ms){return new Date(ms+SITE_OFFSET_MS).toISOString().slice(0,10);}
 function srcOf(v){const s=String(v||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24);return s||'none';}
 async function deviceCounts(prefixes,deviceIndex){const counts=new Map();for(const prefix of prefixes){let cursor;for(let page=0;page<100;page++){const r=await store.list({prefix,cursor,limit:1000,paginate:false});for(const blob of r.blobs){const device=String(blob.key||'').split('/')[deviceIndex];if(device)counts.set(device,(counts.get(device)||0)+1);}if(!r.cursor)break;cursor=r.cursor;}}return counts;}
 // 今日来源：ev/<day>/<src>/<kind>/<device>/<game>，按来源统计去重设备与开局数。
 async function sourceStats(day){const bySrc=new Map();let cursor;for(let page=0;page<100;page++){const r=await store.list({prefix:`ev/${day}/`,cursor,limit:1000,paginate:false});for(const blob of r.blobs){const parts=String(blob.key||'').split('/');const src=parts[2],kind=parts[3],device=parts[4];if(!src||!device)continue;let row=bySrc.get(src);if(!row){row={devices:new Set(),started:0};bySrc.set(src,row);}row.devices.add(device);if(kind==='started')row.started+=1;}if(!r.cursor)break;cursor=r.cursor;}return [...bySrc.entries()].map(([src,row])=>({src,devices:row.devices.size,started:row.started})).sort((a,b)=>b.devices-a.devices||b.started-a.started).slice(0,8);}
 // 每台设备的首次出现日（newdev/<day>/<device>），用于新增与次日/7 日回访。
 async function newDeviceDays(){const map=new Map();let cursor;for(let page=0;page<100;page++){const r=await store.list({prefix:'newdev/',cursor,limit:1000,paginate:false});for(const blob of r.blobs){const parts=String(blob.key||'').split('/');const d=parts[1],device=parts[2];if(d&&device&&!map.has(device))map.set(device,d);}if(!r.cursor)break;cursor=r.cursor;}return map;}
 async function put(kind,device,game,extra={}){await store.setJSON(`${kind}/${device}/${game}`,{schema:2,...extra,at:new Date(now()).toISOString()});}
 function buckets(){
   const t=new Date(now()+SITE_OFFSET_MS);
   return {day:t.toISOString().slice(0,10),hour:String(t.getUTCHours()).padStart(2,'0')};
 }
 async function dayPut(day,kind,x){await store.setJSON(`day/${day}/${kind}/${x.device}/${x.game}`,{});}
 async function hourPut(day,hour,kind,x){await store.setJSON(`hour/${day}/${hour}/${kind}/${x.device}/${x.game}`,{});}
 return {
  async record(x){
   const {day,hour}=buckets();
   const src=srcOf(x.src);
   try{
     let isNew=false;
     try{await store.setJSON(`first/${x.device}`,{at:new Date(now()).toISOString(),src},{onlyIfNew:true});isNew=true;}catch{}
     if(isNew)await store.setJSON(`newdev/${day}/${x.device}`,{src});
     await store.setJSON(`ev/${day}/${src}/${x.kind}/${x.device}/${x.game}`,{});
   }catch{}

   if(x.kind==='started'||x.kind==='finished'){
     await store.setJSON(`players/${x.device}`,{schema:1});
     if(x.kind==='finished')await put('started',x.device,x.game);
     await put(x.kind,x.device,x.game);
     await dayPut(day,x.kind,x);await hourPut(day,hour,x.kind,x);
     return;
   }
   if(x.kind==='result'){
     const ours=!!x.win,dbl=!!x.dbl,undo=Math.round(num(x.undo)),sec=Math.round(num(x.seconds));
     await put('results/all',x.device,x.game,{ours,dbl,undo,sec});
     await put(ours?'results/win':'results/loss',x.device,x.game,{});
     if(ours&&dbl)await put('results/doubleup',x.device,x.game,{});
     if(!ours&&dbl)await put('results/doubledown',x.device,x.game,{});
     if(undo>0)await put(`results/undo/${Math.min(undo,5)}`,x.device,x.game,{undo});
     if(sec>=300)await put('results/long',x.device,x.game,{sec});
     await dayPut(day,ours?'win':'loss',x);
     if(ours&&dbl)await dayPut(day,'doubleup',x);
     return;
   }
   if(x.kind==='error'){
     const tag=txt(x.tag,24).replace(/[^a-z0-9_-]/gi,'')||'client';
     await put('errors/all',x.device,x.game,{tag,message:txt(x.message,200),stack:txt(x.stack,900),url:txt(x.url,200)});
     await put(`errors/${tag}`,x.device,x.game,{});
     await dayPut(day,'error',x);
     return;
   }
  },
  // 一次性回填：从既有 day/ 键推算每台设备最早的活跃日，补写 first/ 与 newdev/ 标记（幂等）。
  async backfillFirstSeen(){
   const firstDay=new Map();let cursor;
   for(let page=0;page<100;page++){const r=await store.list({prefix:'day/',cursor,limit:1000,paginate:false});for(const blob of r.blobs){const parts=String(blob.key||'').split('/');const d=parts[1],device=parts[3];if(d&&device){const cur=firstDay.get(device);if(!cur||d<cur)firstDay.set(device,d);}}if(!r.cursor)break;cursor=r.cursor;}
   let written=0,skipped=0;
   for(const [device,d] of firstDay){
    let isNew=false;
    try{await store.setJSON(`first/${device}`,{at:`${d}T00:00:00+08:00`,backfill:true},{onlyIfNew:true});isNew=true;}catch{}
    if(isNew){await store.setJSON(`newdev/${d}/${device}`,{backfill:true});written++;}else skipped++;
   }
   return {devices:firstDay.size,written,skipped};
  },
  async stats(){
   if(cached&&cached.until>now())return cached.value;
   if(pending)return pending;
   pending=(async()=>{
    const {day}=buckets();
    const cumulative=['players/','started/','finished/','results/win/','results/loss/','results/doubleup/','results/doubledown/','errors/all/','results/long/'];
    const dayPrefixes=['started','finished','win','loss','doubleup','error'].map(k=>`day/${day}/${k}/`);
    const hourPrefixes=Array.from({length:24},(_,h)=>`hour/${day}/${String(h).padStart(2,'0')}/finished/`);
    const all=[...cumulative,...dayPrefixes,...hourPrefixes];
    const yesterday=dayOf(now()-86400000);
    const dayDevices=await deviceCounts([`day/${day}/started/`,`day/${day}/finished/`],3);
    const [results,newDevices,srcToday,newDeviceMap]=await Promise.all([
      Promise.all(all.map(count)),
      count(`newdev/${day}/`),
      sourceStats(day),
      newDeviceDays(),
    ]);
    const todayPlayersCount=dayDevices.size;
    const yesterdayCohort=[...newDeviceMap.values()].filter(d=>d===yesterday).length;
    const d1Retained=[...newDeviceMap.entries()].filter(([device,d])=>d===yesterday&&dayDevices.has(device)).length;
    const recentFrom=dayOf(now()-7*86400000);
    const d7Returning=[...newDeviceMap.entries()].filter(([device,d])=>d>=recentFrom&&d<day&&dayDevices.has(device)).length;
    const pick=i=>results[i];
    const partial=results.some(x=>x.partial);
    const value={
      players:pick(0).count,started:pick(1).count,finished:pick(2).count,win:pick(3).count,loss:pick(4).count,doubleUp:pick(5).count,doubleDown:pick(6).count,errors:pick(7).count,long:pick(8).count,
      day,
      todayStarted:pick(9).count,todayFinished:pick(10).count,todayWin:pick(11).count,todayLoss:pick(12).count,todayDoubleUp:pick(13).count,todayErrors:pick(14).count,
      todayPlayers:todayPlayersCount,
      newDevicesToday:newDevices.count,
      returningToday:Math.max(0,todayPlayersCount-newDevices.count),
      todayPerDeviceAvg:todayPlayersCount>0?Math.round((pick(9).count/todayPlayersCount)*10)/10:0,
      bySourceToday:srcToday,
      d1Retention:yesterdayCohort>0?Math.round((d1Retained/yesterdayCohort)*100):null,
      d7Returning,
      hourlyFinished:results.slice(15).map(x=>x.count),
      partial,
      asOf:new Date(now()).toISOString(),
      definition:'参与设备数按当前浏览器匿名标识去重；本日设备数为北京时间当日有开局/完成记录的去重设备数；今日新增=当日首次出现的设备，今日回访=当日活跃且此前已出现过；d1Retention=昨日新增设备中今日仍活跃的百分比；bySourceToday 按事件携带的 from 渠道标签统计；完成局数仅统计新版上线后的完整实战；胜负与双上统计自埋点版上线起；今日与小时分布按北京时间切分，非实名人数，数据可能延迟一分钟。'
    };
    cached={until:now()+ttl,value};return value;
   })();
   try{return await pending;}finally{pending=null;}
  }
 };
}
export async function handleMetrics(request,{repository,env={}}){const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});try{
 const reqUrl=new URL(request.url);
 if(request.method==='GET'&&reqUrl.searchParams.get('backfill')==='first-seen'){
  if(reqUrl.searchParams.get('token')!=='bf-7f3c9a2e')return json({error:'forbidden'},403);
  return json(await repository.backfillFirstSeen());
 }
 if(request.method==='GET')return json(await repository.stats());
 if(request.method!=='POST')return json({error:'不支持此方法。'},405);
 if(!sameOrigin(request,env))return json({error:'请从本站发起。'},403);
 const x=await readBody(request,4096);
 if(!/^[a-f0-9-]{36}$/i.test(x.device)||!/^[A-Za-z0-9_-]{6,80}$/.test(x.game)||!KINDS.has(x.kind))return json({error:'统计事件无效。'},400);
 await repository.record(x);return json({recorded:true});
 }catch{return json({error:'体验数据暂不可用。'},503);}}
