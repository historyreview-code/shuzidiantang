(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GuandanEffects=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const shouldCelebrate=(before,after,live)=>Boolean(live&&before&&after&&before.finish.length===0&&after.finish[0]===0);
  function celebrate(){
    document.querySelector('.head-out-celebration')?.remove();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layer=document.createElement('div');layer.className='head-out-celebration';
    layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');
    const colors=['#ffe6a0','#68f2dc','#b4bbff'];
    const sparks=reduced?'':Array.from({length:3},(_,burst)=>`<div class="firework-burst burst-${burst}" aria-hidden="true">${Array.from({length:16},(_,i)=>{const a=i*Math.PI/8,r=55+(i%3)*14;return `<i style="--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px;--spark:${colors[i%3]};--delay:${burst*.15}s"></i>`;}).join('')}</div>`).join('');
    layer.innerHTML=`${sparks}<div class="head-out-award"><span aria-hidden="true">✦</span><strong>漂亮，拿下头游！</strong><small>你已率先出完 · 继续为搭档加油</small></div>`;
    document.body.append(layer);setTimeout(()=>layer.remove(),reduced?2300:2800);
  }
  return {shouldCelebrate,celebrate};
});
