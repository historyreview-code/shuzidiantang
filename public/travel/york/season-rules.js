// Advice is a data-pack field; it does not claim live opening or mutate plans.
export function planAdvice(pack,ids,season){
 const selected=new Set(ids), notes=[];
 for(const rule of pack.planning.advice||[]){
  if(rule.ids.some(id=>selected.has(id))&&(!rule.seasons||rule.seasons.includes(season)))notes.push(rule.message);
 }
 if(season==='winter'&&pack.places.some(p=>selected.has(p.id)&&p.exposure==='outdoor'))notes.push('冬季户外优先排在白天；日落、风雨和当天开放情况出发前确认，保留室内休息与返程时间。');
 return notes;
}
