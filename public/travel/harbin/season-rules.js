// Optional city-pack advice: never changes a user's plan or infers live opening.
export function planAdvice(pack,ids,season){
 const byId=Object.fromEntries(pack.places.map(p=>[p.id,p]));
 const chosen=[...new Set(ids)].map(id=>byId[id]).filter(Boolean),notes=[];
 for(const p of chosen){
  if(p.seasonRestriction&&!p.seasons.includes(season))notes.push(`${p.name}：${p.seasonRestriction}与所选季节不匹配，请换景点或调整季节。`);
  if(p.sameSiteAs&&ids.includes(p.sameSiteAs))notes.push(`${p.name}与${byId[p.sameSiteAs].name}在同一园区；概览已包含时可删去专题点，避免重复计时。`);
 }
 if(season==='winter'&&chosen.some(p=>p.exposure!=='indoor')){
  let run=0,max=0;
  for(const p of chosen){run=p.exposure==='indoor'?0:run+p.minutes;max=Math.max(run,max);}
  notes.push(max>=90?'冬季安排中有较长的连续户外游览。请拆成短段，在中间插入室内取暖或热餐；总时长不是连续耐寒时长。':'冬季江边与街巷体感不同；保留取暖停留，并提前确认返程。');
 }
 if(chosen.some(p=>['remote','south'].includes(p.zone)))notes.push('含近郊或平房远距目的地。合计不含住处往返，请另计首末段交通；图中距离已压缩。');
 return notes;
}
