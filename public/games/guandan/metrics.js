(function(root){
 const KEY='alpha-guandan-metrics-v1',base=document.querySelector('meta[name=guandan-api-base]')?.content||'/api';
 let data;try{data=JSON.parse(localStorage.getItem(KEY));}catch{}if(!data?.device)data={device:crypto.randomUUID(),events:{}};
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}};
 const validGame=g=>/^[A-Za-z0-9_-]{6,80}$/.test(String(g||''));
 async function send(key,event){if(location.protocol==='file:')return;try{const r=await fetch(base+'/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),signal:AbortSignal.timeout(5000)});if(r.ok){data.events[key]={...event,sent:true};data.events=Object.fromEntries(Object.entries(data.events).slice(-200));save();}}catch{}}
 function track(kind,record){if(record.start.kind!=='full'||record.branchOf)return;const key=kind+':'+record.id;if(data.events[key]?.sent)return;const event={device:data.device,game:record.id,kind};data.events[key]=event;save();send(key,event);}
 function result(record,info={}){
   const game=validGame(record?.id)?record.id:'sess-'+data.device.slice(0,8);
   const key='result:'+game;if(data.events[key]?.sent)return;
   let seconds=0;try{seconds=Math.max(0,Math.round((Date.now()-new Date(record.created).getTime())/1000));}catch{}
   const event={device:data.device,game,kind:'result',win:!!info.win,dbl:!!info.dbl,undo:Math.max(0,Math.min(999,Math.round(+info.undo||0))),seconds};
   data.events[key]=event;save();send(key,event);
 }
 let errorCount=0;const lastErrorAt={};
 function error(tag,message,extra={}){
   try{
     if(errorCount>=5)return;
     const t=String(tag||'client').replace(/[^a-z0-9_-]/gi,'').slice(0,24)||'client';
     const now=Date.now();if(lastErrorAt[t]&&now-lastErrorAt[t]<30000)return;lastErrorAt[t]=now;errorCount++;
     const key='error:'+now;const event={device:data.device,game:'sess-'+data.device.slice(0,8),kind:'error',tag:t,message:String(message||'').slice(0,200),stack:String(extra.stack||'').slice(0,900),url:String(extra.url||location.pathname).slice(0,200)};
     save();send(key,event);
   }catch{}
 }
 function installErrorHooks(){
   if(installErrorHooks.done)return;installErrorHooks.done=true;
   window.addEventListener('error',e=>error('js',e.message||'script error',{stack:e.error&&e.error.stack,url:e.filename}));
   window.addEventListener('unhandledrejection',e=>{const r=e.reason;error('promise',(r&&r.message)||String(r||'unhandled rejection'),{stack:r&&r.stack});});
 }
 async function refresh(){for(const [key,event]of Object.entries(data.events).filter(([,x])=>!x.sent).slice(-3))send(key,event);const el=document.querySelector('[data-usage-stats]');if(!el)return;try{const r=await fetch(base+'/metrics',{signal:AbortSignal.timeout(5000)});const x=await r.json();if(!r.ok)throw Error();if(!el.isConnected)return;const extra=(x.win||x.loss)?` · 胜 ${x.win} / 负 ${x.loss}${x.doubleUp?` · 双上 ${x.doubleUp}`:''}`:'';el.textContent=`${x.partial?'至少 ':''}${x.players} 个参与设备 · 开始 ${x.started} 局 · 完成 ${x.finished} 局${extra}。自新版上线起统计，约一分钟更新；设备数不等于真人数。`;}catch{if(el.isConnected)el.textContent='暂时无法读取体验数据，打牌不受影响。';}}
 installErrorHooks();
 root.GuandanMetrics={track,result,error,refresh};
})(globalThis);
