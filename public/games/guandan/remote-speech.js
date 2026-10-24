(function(root){
 'use strict';
 const cache=new Map();
 const SILENCE='data:audio/wav;base64,UklGRiUAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQEAAACA';
 function createRemote(options={}){
  const env=options.env||root,later=options.setTimeout||setTimeout,clear=options.clearTimeout||clearTimeout;
  const supported=!!(env.Audio&&env.fetch),player=supported?new env.Audio():null;
  let enabled=false,busy=false,text='',status=supported?'MiniMax 稳重男声已就绪。':'当前浏览器不支持音频播放。',rate=1,serial=0,request=null,watchdog=null,unlocked=false,paused=false;
  const snapshot=()=>({supported,enabled,busy,text,status,rate});
  const emit=()=>options.onChange?.(snapshot());
  if(player){player.preload='auto';player.playsInline=true;}
  function unlock(){if(!supported||unlocked||busy)return;unlocked=true;player.src=SILENCE;player.play().catch(()=>{unlocked=false;});}
  function cancel(quiet=false){serial++;request?.abort();request=null;clear(watchdog);watchdog=null;busy=false;paused=false;if(player){player.onplaying=null;player.onended=null;player.onerror=null;player.pause();player.removeAttribute('src');player.load();}if(!quiet){status=enabled?'播报已停止。':'语音已关闭。';emit();}}
  function enable(value){enabled=!!value&&supported;if(!enabled)cancel(true);status=enabled?'MiniMax 稳重男声已就绪。':supported?'语音已关闭。':'当前浏览器不支持音频播放。';emit();return enabled;}
  function setRate(value){rate=[0.85,1,1.2,1.4].includes(+value)?+value:1;if(player)player.playbackRate=rate;emit();}
  function say(value,context={}){
   cancel(true);text=String(value||'');if(!enabled||!text){emit();return false;}
   const ticket=serial;busy=true;status='正在准备 MiniMax 配音…';emit();request=new AbortController();
   const payload=context.kind==='review'?{kind:'review',reference:context.reference}:{kind:'table',text};
   const key=JSON.stringify(payload);
   function finish(error){if(ticket!==serial)return;serial++;clear(watchdog);watchdog=null;busy=false;paused=false;player.onplaying=null;player.onended=null;player.onerror=null;if(error){player.pause();enabled=false;status=error;}else status='播报完成。';emit();options.onIdle?.();}
   watchdog=later(()=>{request?.abort();finish('语音准备超时，下次点击会自动重试。');},65000);
   (async()=>{
    try{
     let blob=cache.get(key);
     if(!blob){const response=await env.fetch((env.document?.querySelector?.('meta[name=guandan-api-base]')?.content||'/api')+'/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:request.signal});if(!response.ok){const error=await response.json();throw Error(error.error||'语音暂不可用。');}blob=await response.blob();if(!blob.type.startsWith('audio/'))throw Error('语音数据无法播放。');cache.set(key,blob);while(cache.size>80)cache.delete(cache.keys().next().value);}
     if(ticket!==serial)return;
     clear(watchdog);const url=env.URL.createObjectURL(blob);player.src=url;player.playbackRate=rate;
     let released=false;const release=()=>{if(!released){released=true;env.URL.revokeObjectURL(url);}};
     player.onplaying=()=>{if(ticket!==serial)return;status='正在播报…';emit();clear(watchdog);watchdog=later(()=>{release();finish('播放暂时中断，下次点击会重试。');},300000);};
     player.onended=()=>{release();finish();};player.onerror=()=>{release();finish('音频播放失败，可重播本次解读。');};
     try{await player.play();}catch(e){release();throw e;}
     // Loaded audio remains valid after its object URL is revoked.
     release();
    }catch(e){if(ticket!==serial)return;finish(e.name==='NotAllowedError'?'浏览器等待一次点击，点击页面后自动恢复声音。':e.message||'MiniMax 语音暂不可用，请重试。');}
   })();return true;
  }
  function pause(){if(!busy)return;paused=true;player.pause();clear(watchdog);status='解读已暂停。';emit();}
  function resume(){if(!busy||!paused)return false;paused=false;player.play().catch(()=>{enabled=false;busy=false;status='请重新解读。';emit();options.onIdle?.();});return true;}
  return {snapshot,cancel,enable,setRate,say,unlock,pause,resume};
 }
 root.GuandanSpeech.createRemote=createRemote;
})(globalThis);
