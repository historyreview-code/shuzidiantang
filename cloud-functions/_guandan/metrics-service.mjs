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
 // 临时诊断：按设备段统计局数分布（只输出聚合计数，不含设备 id）。
 async function deviceCounts(prefixes,deviceIndex){const counts=new Map();for(const prefix of prefixes){let cursor;for(let page=0;page<100;page++){const r=await store.list({prefix,cursor,limit:1000,paginate:false});for(const blob of r.blobs){const device=String(blob.key||'').split('/')[deviceIndex];if(device)counts.set(device,(counts.get(device)||0)+1);}if(!r.cursor)break;cursor=r.cursor;}}return counts;}
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
  async stats(){
   if(cached&&cached.until>now())return cached.value;
   if(pending)return pending;
   pending=(async()=>{
    const {day}=buckets();
    const cumulative=['players/','started/','finished/','results/win/','results/loss/','results/doubleup/','results/doubledown/','errors/all/','results/long/'];
    const dayPrefixes=['started','finished','win','loss','doubleup','error'].map(k=>`day/${day}/${k}/`);
    const hourPrefixes=Array.from({length:24},(_,h)=>`hour/${day}/${String(h).padStart(2,'0')}/finished/`);
    const all=[...cumulative,...dayPrefixes,...hourPrefixes];
    const [results,todayDevices]=await Promise.all([Promise.all(all.map(count)),distinctDevices([`day/${day}/started/`,`day/${day}/finished/`])]);
    const [diagToday,diagAll,diagHours]=await Promise.all([
      deviceCounts([`day/${day}/started/`],3),
      deviceCounts(['started/'],1),
      Promise.all(Array.from({length:24},(_,h)=>deviceCounts([`hour/${day}/${String(h).padStart(2,'0')}/started/`],4).then(m=>m.size))),
    ]);
    const sortedCounts=m=>[...m.values()].sort((a,b)=>b-a);
    const quantile=(list,q)=>list.length?list[Math.min(list.length-1,Math.max(0,Math.round((list.length-1)*q)))]:0;
    const todaySorted=sortedCounts(diagToday),allSorted=sortedCounts(diagAll);
    const pick=i=>results[i];
    const partial=results.some(x=>x.partial)||todayDevices.partial;
    const value={
      players:pick(0).count,started:pick(1).count,finished:pick(2).count,win:pick(3).count,loss:pick(4).count,doubleUp:pick(5).count,doubleDown:pick(6).count,errors:pick(7).count,long:pick(8).count,
      day,
      todayStarted:pick(9).count,todayFinished:pick(10).count,todayWin:pick(11).count,todayLoss:pick(12).count,todayDoubleUp:pick(13).count,todayErrors:pick(14).count,
      todayPlayers:todayDevices.count,
      hourlyFinished:results.slice(15).map(x=>x.count),
      diag:{
        todayDevices:todaySorted.length,
        todayPerDeviceTop:todaySorted.slice(0,10),
        todayHourlyDevices:diagHours,
        allDevices:allSorted.length,
        allPerDeviceTop:allSorted.slice(0,12),
        allMedian:quantile(allSorted,0.5),
        allGe10:allSorted.filter(x=>x>=10).length,
        allEq1:allSorted.filter(x=>x===1).length,
      },
      partial,
      asOf:new Date(now()).toISOString(),
      definition:'参与设备数按当前浏览器匿名标识去重；本日设备数为北京时间当日有开局/完成记录的去重设备数；完成局数仅统计新版上线后的完整实战；胜负与双上统计自埋点版上线起；今日与小时分布按北京时间切分，非实名人数，数据可能延迟一分钟。'
    };
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
