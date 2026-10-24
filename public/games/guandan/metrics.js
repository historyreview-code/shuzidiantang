(function(root){
 const KEY='alpha-guandan-metrics-v1',base=document.querySelector('meta[name=guandan-api-base]')?.content||'/api';
 let data;try{data=JSON.parse(localStorage.getItem(KEY));}catch{}if(!data?.device)data={device:crypto.randomUUID(),events:{}};
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}};
 async function send(key,event){if(location.protocol==='file:')return;try{const r=await fetch(base+'/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),signal:AbortSignal.timeout(5000)});if(r.ok){data.events[key]={...event,sent:true};save();}}catch{}}
 function track(kind,record){if(record.start.kind!=='full'||record.branchOf)return;const key=kind+':'+record.id;if(data.events[key]?.sent)return;const event={device:data.device,game:record.id,kind};data.events[key]=event;data.events=Object.fromEntries(Object.entries(data.events).slice(-200));save();send(key,event);}
 async function refresh(){for(const [key,event]of Object.entries(data.events).filter(([,x])=>!x.sent).slice(-3))send(key,event);const el=document.querySelector('[data-usage-stats]');if(!el)return;try{const r=await fetch(base+'/metrics',{signal:AbortSignal.timeout(5000)});const x=await r.json();if(!r.ok)throw Error();if(!el.isConnected)return;el.textContent=`${x.partial?'至少 ':''}${x.players} 个参与设备 · 开始 ${x.started} 局 · 完成 ${x.finished} 局。自新版上线起统计，约一分钟更新；设备数不等于真人数。`;}catch{if(el.isConnected)el.textContent='暂时无法读取体验数据，打牌不受影响。';}}
 root.GuandanMetrics={track,refresh};
})(globalThis);
