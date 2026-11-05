import {readBody,sameOrigin} from './review-service.mjs';
const ADMIN_TOKEN='gdr-2026-4c7e';
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const clean=v=>String(v??'').replace(/[\u0000-\u001f]/g,'').slice(0,40);
function validRecord(r){
  if(!r||typeof r!=='object')return false;
  const s=r.start; if(!s||!Array.isArray(s.hands)||s.hands.length!==4)return false;
  if(!Number.isInteger(s.level)||s.level<2||s.level>14)return false;
  if(!Array.isArray(r.events)||r.events.length>400)return false;
  for(const h of s.hands){if(!Array.isArray(h)||h.length<1||h.length>27)return false;for(const c of h){if(!c||typeof c.id!=='string'||c.id.length>8)return false;}}
  for(const e of r.events){
    if(!e||![0,1,2,3].includes(e.seat))return false;
    if(e.kind==='pass')continue;
    if(e.kind!=='play'||!e.move||!Array.isArray(e.move.ids)||e.move.ids.length<1||e.move.ids.length>12)return false;
    for(const id of e.move.ids)if(typeof id!=='string'||id.length>8)return false;
  }
  return true;
}
export function createRecordsRepository(store){
  return {
    async add({device,record}){
      const day=new Date().toISOString().slice(0,10);
      let cursor,total=0;
      for(let p=0;p<4;p++){const r=await store.list({prefix:`dev/${device}/${day}/`,cursor,limit:100,paginate:false});total+=r.blobs.length;if(!r.cursor)break;cursor=r.cursor;}
      if(total>=60)return {ok:false,error:'今日上传数量已达上限'};
      const key=`rec/${Date.now()}-${clean(record.id)||'anon'}-${Math.random().toString(36).slice(2,6)}`;
      await store.setJSON(key,{device,at:new Date().toISOString(),start:record.start,events:record.events});
      await store.setJSON(`dev/${device}/${day}/${Date.now()}`,{ok:true});
      return {ok:true};
    },
    async latest(limit=50){
      let keys=[],cursor;
      for(let p=0;p<10;p++){const r=await store.list({prefix:'rec/',cursor,limit:1000,paginate:false});keys.push(...r.blobs.map(b=>b.key||b.path||b.name));if(!r.cursor)break;cursor=r.cursor;}
      keys=keys.filter(Boolean).sort().slice(-limit);
      const out=[];for(const k of keys){try{out.push(await store.get(k,{type:'json'}));}catch{}}
      return out;
    }
  };
}
export async function handleRecords(request,{repository,env={}}){
  try{
    if(request.method==='GET'){
      const u=new URL(request.url);
      if((u.searchParams.get('token')||'')!==(env.GUANDAN_RECORDS_TOKEN||ADMIN_TOKEN))return json({error:'无权限'},403);
      const limit=Math.min(100,Math.max(1,parseInt(u.searchParams.get('limit')||'30',10)||30));
      return json({items:await repository.latest(limit)});
    }
    if(request.method!=='POST')return json({error:'不支持此方法。'},405);
    if(!sameOrigin(request,env))return json({error:'请从本站发起。'},403);
    const body=await readBody(request,60000);
    if(!/^[a-f0-9-]{36}$/i.test(String(body.device||'')))return json({error:'设备标识无效'},400);
    if(!validRecord(body.record))return json({error:'牌谱格式无效'},400);
    const res=await repository.add({device:String(body.device),record:body.record});
    if(!res.ok)return json({error:res.error},429);
    return json({ok:true});
  }catch(e){return json({error:'牌谱上传暂不可用'},503);}
}
