(function(root){
 'use strict';
 function create({fetcher=(...args)=>fetch(...args),onChange=()=>{},timeout=55000}={}){
  let active=null,serial=0;
  function cancel(){serial++;active?.controller.abort();active=null;}
  function ready(key){return active?.key===key&&active.result?active.result:null;}
  function pending(key){return active?.key===key&&!active.result;}
  async function request(key,record,fallback){
   if(active?.key===key)return;
   cancel();const ticket=serial,controller=new AbortController();active={key,controller,result:null};onChange('pending');
   const timer=setTimeout(()=>controller.abort(),timeout);
   let result;
   try{
    const base=root.document?.querySelector('meta[name="guandan-api-base"]')?.content||'/api';
    const clean={format:record.format,start:record.start,events:record.events.map(a=>a.kind==='pass'?{seat:a.seat,kind:a.kind}:{seat:a.seat,kind:a.kind,move:a.move})};
    const response=await fetcher(base+'/battle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({record:clean}),signal:controller.signal});
    const data=await response.json();
    if(!response.ok||!data.action||!['minimax','rules'].includes(data.source))throw Error(data.error||'AI 决策暂不可用。');
    result=data;
   }catch(error){result={action:fallback(),source:'local',model:'本地策略',reason:'AI 接口未完成，本步由本地策略接替。',teamwork:'依据公开出牌、搭档张数和手牌结构选择。',nextPlan:'下一步继续尝试 AI 对战。',failure:error.name==='AbortError'?'AI 思考超时。':String(error.message||'接口异常').slice(0,160)};}
   finally{clearTimeout(timer);}
   if(ticket!==serial)return;
   active.result=result;onChange('ready');
  }
  return {cancel,ready,pending,request};
 }
 const api={create};root.GuandanBattle=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
