import {readBody,sameOrigin} from './review-service.mjs';
const ADMIN_TOKEN = 'gdfb-2026-8f3a';
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const clean=(v,n)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
export function createFeedbackRepository(store){
  return {
    async add({device,text,contact,ua}){
      const day=new Date().toISOString().slice(0,10);
      let count=0,cursor;
      for(let p=0;p<3;p++){
        const r=await store.list({prefix:`dev/${device}/${day}/`,cursor,limit:100,paginate:false});
        count+=r.blobs.length;if(!r.cursor)break;cursor=r.cursor;
      }
      if(count>=3)return {ok:false,error:'今天已经提交过反馈了，明天再来吧。'};
      const ts=Date.now(),key=`fb/${day}/${ts}-${Math.random().toString(36).slice(2,8)}`;
      await store.setJSON(key,{device,text,contact,ua,day,at:new Date(ts).toISOString()});
      await store.setJSON(`dev/${device}/${day}/${ts}`,{ok:true});
      return {ok:true};
    },
    async latest(limit=50){
      let keys=[],cursor;
      for(let p=0;p<10;p++){
        const r=await store.list({prefix:'fb/',cursor,limit:1000,paginate:false});
        keys.push(...r.blobs.map(b=>b.key||b.path||b.name));
        if(!r.cursor)break;cursor=r.cursor;
      }
      keys=keys.filter(Boolean).sort().slice(-limit);
      const out=[];
      for(const k of keys){try{out.push(await store.get(k,{type:'json'}));}catch{}}
      return out.reverse();
    }
  };
}
export async function handleFeedback(request,{repository,env={}}){
  try{
    if(request.method==='GET'){
      const token=new URL(request.url).searchParams.get('token')||'';
      if(token!==(env.GUANDAN_FEEDBACK_TOKEN||ADMIN_TOKEN))return json({error:'无权限'},403);
      return json({items:await repository.latest(50)});
    }
    if(request.method!=='POST')return json({error:'不支持此方法。'},405);
    if(!sameOrigin(request,env))return json({error:'请从本站发起。'},403);
    const x=await readBody(request,2048);
    if(!/^[a-f0-9-]{36}$/i.test(String(x.device||'')))return json({error:'设备标识无效'},400);
    const text=clean(x.text,300);
    if(text.length<5)return json({error:'请至少写 5 个字，方便我们理解问题。'},400);
    const res=await repository.add({device:String(x.device),text,contact:clean(x.contact,60),ua:clean(request.headers.get('user-agent'),160)});
    if(!res.ok)return json({error:res.error},429);
    return json({ok:true});
  }catch{return json({error:'反馈暂不可用，请稍后再试。'},503);}
}
