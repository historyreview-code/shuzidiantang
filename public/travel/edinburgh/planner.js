import city from './city-pack.js';

// All planning functions are bound to a city pack. The engine has no city names,
// landmark IDs, coordinates or city-specific transfer rules.
export function createPlanner(pack) {
const byId=Object.fromEntries(pack.places.map(p=>[p.id,p]));
const foodById=Object.fromEntries((pack.foods||[]).map(f=>[f.id,f]));
const cleanFoodIds=ids=>[...new Set(Array.isArray(ids)?ids.filter(id=>typeof id==='string'&&Object.hasOwn(foodById,id)):[])].slice(0,5);
const {legReserves={},connectedZones=[],sameZone=[20,35],connected=[35,55],crossZone=[50,80]}=pack.planning || {};

function cleanIds(ids) { return [...new Set(Array.isArray(ids) ? ids.filter(id => typeof id==='string' && Object.hasOwn(byId,id)) : [])].slice(0,30); }
function transfer(from,to) {
  if (from===to) return {min:0,max:0,mode:'同一地点'};
  const a=byId[from],b=byId[to];
  if (!a || !b) throw new Error('Unknown place');
  const key=[from,to].sort().join('|');
  const specific=legReserves[key];
  if (specific) return {min:specific[0],max:specific[1],mode:specific[2]};
  if(a.zone===b.zone) return {min:sameZone[0],max:sameZone[1],mode:'步行 / 交通'};
  if (connectedZones.includes([a.zone,b.zone].sort().join('|'))) return {min:connected[0],max:connected[1],mode:'交通'};
  return {min:crossZone[0],max:crossZone[1],mode:'跨区交通'};
}

function summarize(ids,budget=480,pause=60) {
  ids=cleanIds(ids);
  budget=[240,360,480,600].includes(Number(budget)) ? Number(budget) : 480;
  pause=[30,60,90].includes(Number(pause)) ? Number(pause) : 60;
  const visit=ids.reduce((sum,id)=>sum+byId[id].minutes,0);
  const legs=ids.slice(1).map((id,i)=>({from:ids[i],to:id,...transfer(ids[i],id)}));
  const minTransfer=legs.reduce((sum,l)=>sum+l.min,0),maxTransfer=legs.reduce((sum,l)=>sum+l.max,0);
  const free=ids.length ? pause : 0;
  const min=visit+minTransfer+free,max=visit+maxTransfer+free;
  return {ids,visit,legs,minTransfer,maxTransfer,pause:free,min,max,budget,remaining:Math.max(0,budget-max),overflow:Math.max(0,max-budget),effort:ids.reduce((sum,id)=>sum+byId[id].effort,0),cross:legs.filter(l=>l.mode==='跨区交通').length};
}

// Optimal order by conservative transfer reserve. The first stop remains fixed.
// Held–Karp on small daily plans; never drops a selected place.
function optimize(ids) {
  ids=cleanIds(ids);
  if(ids.length<3) return ids;
  if(ids.length>10) {
    let order=ids.slice(),changed=true;
    while(changed) { changed=false; for(let i=1;i<order.length-1;i++) for(let j=i+1;j<order.length;j++) {
      const candidate=[...order.slice(0,i),...order.slice(i,j+1).reverse(),...order.slice(j+1)];
      if(cost(candidate)<cost(order)) {order=candidate;changed=true;}
    }}
    return order;
  }
  const rest=ids.slice(1),n=rest.length,dp=new Map();
  for(let j=0;j<n;j++) dp.set(`${1<<j}:${j}`,{value:transfer(ids[0],rest[j]).max,path:[j]});
  for(let mask=1;mask<(1<<n);mask++) for(let j=0;j<n;j++) {
    const current=dp.get(`${mask}:${j}`); if(!current) continue;
    for(let k=0;k<n;k++) if(!(mask&(1<<k))) {
      const next=mask|(1<<k),key=`${next}:${k}`,value=current.value+transfer(rest[j],rest[k]).max;
      if(!dp.has(key) || value<dp.get(key).value) dp.set(key,{value,path:[...current.path,k]});
    }
  }
  const best=Array.from({length:n},(_,j)=>dp.get(`${(1<<n)-1}:${j}`)).sort((a,b)=>a.value-b.value)[0];
  return [ids[0],...best.path.map(i=>rest[i])];
}
function cost(ids) {return ids.slice(1).reduce((sum,id,i)=>sum+transfer(ids[i],id).max,0);}

function sanitizeState(value) {
  if(!value || typeof value!=='object') return null;
  if(value.version!==undefined&&value.version!==1) return null;
  if(!Array.isArray(value.days) || !value.days.length) return null;
  if(value.city && value.city!==pack.id) return null;
  return { version:1, city:pack.id, days:value.days.slice(0,5).map(d=>({ids:cleanIds(d?.ids),foodIds:cleanFoodIds(d?.foodIds),budget:[240,360,480,600].includes(d?.budget)?d.budget:480,pause:[30,60,90].includes(d?.pause)?d.pause:60})), active:Math.max(0,Math.min(Number.isInteger(value.active)?value.active:0,Math.min(value.days.length,5)-1)), saved:cleanIds(value.saved), season:Object.hasOwn(pack.seasons,value.season)?value.season:Object.keys(pack.seasons)[0] };
}
function encodePlan(state) {return btoa(Array.from(new TextEncoder().encode(JSON.stringify({city:pack.id,days:state.days,active:state.active,season:state.season,version:1})),c=>String.fromCharCode(c)).join(''));}
function decodePlan(hash) {try {if(hash.length>12000) return null;return sanitizeState(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(hash),c=>c.charCodeAt(0)))));}catch{return null;}}

function exportText(state) {
  return [`${pack.brand} · ${pack.name}漫游计划`,'示意地图 / 编辑性时间预留；实际交通、开放及预约请另行确认。','不含住处往返；留白包含用餐、休息和临时停留。','',...state.days.flatMap((day,i)=>{
    const s=summarize(day.ids,day.budget,day.pause);
    return [`第 ${i+1} 天 · ${s.ids.length ? timeRange(s.min,s.max) : '尚未安排'} · 预算 ${duration(s.budget)}`,
      ...s.ids.flatMap((id,n)=>{const p=byId[id],leg=s.legs[n];return [`${n+1}. ${p.name}（${p.localName}）· 游览预留 ${duration(p.minutes)}`,`   ${p.tip}`,`   官方介绍：${p.source}`,...(leg?[`   → ${byId[leg.to].name}：${leg.mode}预留 ${leg.min}–${leg.max} 分钟`]:[])]}),
      ...((day.foodIds||[]).length?['餐食备选（用餐可安排在留白内；排队与绕行另留时间）：',...cleanFoodIds(day.foodIds).map(id=>`  ${foodById[id].name} · ${foodById[id].dish} · 用餐预留 ${foodById[id].reserve} 分钟\n  官方：${foodById[id].source}`)]:[]),
      `留白 ${s.pause} 分钟${s.overflow?`；超出预算 ${s.overflow} 分钟`:`；预算内剩余 ${s.remaining} 分钟`}`,''];
  }),`资料核验日期：${pack.checkedAt}`].join('\n');
}
return {cleanIds,transfer,summarize,optimize,cost,sanitizeState,encodePlan,decodePlan,exportText};
}
export const {cleanIds,transfer,summarize,optimize,cost,sanitizeState,encodePlan,decodePlan,exportText}=createPlanner(city);
export function duration(mins) {if(mins<60) return `${mins} 分钟`;return `${Math.floor(mins/60)} 小时${mins%60 ? ` ${mins%60} 分` : ''}`;}
export function timeRange(min,max) {return `${(min/60).toFixed(1)}–${(max/60).toFixed(1)} 小时`;}
