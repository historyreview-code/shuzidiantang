(function(root){
  'use strict';
  const CACHE='guandan-ai-reviews-v1';
  const API=root.document?.querySelector?.('meta[name=guandan-api-base]')?.content||'/api';
  const SITE='https://shuzidiantang.com/games/guandan/';
  function speechChunks(text,limit=55){
    const clauses=String(text||'').trim().match(/[^。！？；，,!?;\n]+[。！？；，,!?;\n]*|[。！？；，,!?;\n]+/gu)||[];
    const chunks=[];let current='';
    for(const clause of clauses){for(let i=0;i<clause.length;i+=limit){const part=clause.slice(i,i+limit);if(current.length+part.length>limit){if(current.trim())chunks.push(current.trim());current='';}current+=part;}}
    if(current.trim())chunks.push(current.trim());return chunks;
  }
  function createReader({speech=root.GuandanSpeech,preferences=()=>({enabled:true,rate:1}),beforeStart=()=>{},onChange=()=>{}}={}){
    let chunks=[],index=0,state='idle',reader,reference=null;
    const remote=!!speech.createRemote;
    const snapshot=()=>({state,index,total:chunks.length,text:chunks[index]||'',remote,status:reader?.snapshot().status||''});
    const emit=()=>onChange(snapshot());
    reader=(speech.createRemote||speech.create)({onChange(v){if(state==='reading'){if(!v.enabled)state='error';emit();}},onIdle(){if(state!=='reading')return;if(!reader.snapshot().enabled){state='error';emit();return;}index++;play();}});
    function play(){if(state!=='reading')return;if(index>=chunks.length){state='done';emit();return;}emit();if(!reader.say(chunks[index],{kind:'review',reference})){state='error';emit();}}
    function start(text,ref){stop();reference=ref;chunks=remote?[text]:speechChunks(text);index=0;const p=preferences();if(!p.enabled){state='muted';emit();return;}beforeStart();reader.setRate(p.rate||1);if(!reader.enable(true)){state='error';emit();return;}state='reading';play();}
    function stop(){const active=state==='reading'||state==='paused';state='idle';if(active)reader.cancel();emit();}
    function toggle(){if(state==='reading'){state='paused';if(reader.pause)reader.pause();else reader.cancel();emit();}else if(state==='paused'){const p=preferences();if(!p.enabled){state='muted';emit();return;}beforeStart();reader.setRate(p.rate||1);if(!reader.enable(true)){state='error';emit();return;}state='reading';if(reader.resume){if(!reader.resume()){state='error';emit();}else emit();}else play();}}
    return {start,stop,toggle,snapshot,unlock:()=>reader.unlock?.()};
  }
  function create({getRecord,getCursor,getStates,isReview,openModal,closeModal,toast,goto,esc,speechPreferences,beforeReading}){
    let cache={},pending=null,busy=false,lastResult=null;
    const reader=createReader({preferences:speechPreferences,beforeStart:beforeReading,onChange:updateReader});
    function updateReader(v){
      const status=document.querySelector('.ai-reader-status'),caption=document.querySelector('.ai-reader-caption'),button=document.querySelector('[data-ai-action="voice-pause"]');
      if(status)status.textContent=({reading:`${v.status==='正在播报…'?'正在解读':'准备播放'} · ${v.remote?'MiniMax 沉稳高管':`${v.index+1} / ${v.total} 段`}`,paused:v.remote?'已暂停，继续时从这里接着听。':'已暂停，继续时从当前句重读。',done:'解读完毕，可回到具体步骤重练。',muted:'已按桌面设置静音。',error:v.status||'MiniMax 配音暂不可用，可点“重新解读”重试。',idle:'解读已停止。'})[v.state];
      if(caption)caption.textContent=v.text;
      if(button){button.textContent=v.state==='paused'?'继续解读':'暂停解读';button.disabled=!['reading','paused'].includes(v.state);}
    }
    function present(result,key){openModal(resultHTML(result,key));reader.start(result.spokenSummary,result.reference);}

    try{const saved=JSON.parse(localStorage.getItem(CACHE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))cache=saved;}catch{}
    function persist(key,value){cache[key]=value;cache=Object.fromEntries(Object.entries(cache).slice(-30));try{localStorage.setItem(CACHE,JSON.stringify(cache));}catch{toast('点评已生成，但本机空间不足；请导出点评。');}}
    async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');}
    function html(){const cursor=getCursor(),end=getStates().at(-1).over;return `<section class="ai-panel"><div class="ai-heading"><span>✦ MiniMax AI 点评</span><span class="tag">按需生成</span></div><p>结合真实牌谱，解释取舍，给出可重练的目标。</p><div class="actions"><button class="button small primary" data-ai-action="step" ${!isReview()||cursor<1?'disabled':''}>点评这一步${isReview()&&cursor>0?` · ${cursor}`:''}</button><button class="button small" data-ai-action="game" ${!end?'disabled':''}>整局点评</button></div><small>${!isReview()?'在时间线选中一步可生成单步点评。':'单步只使用该玩家当时可知的信息。'}${!end?' 完成这一副后可做整局点评。':''}</small></section>`;}
    function resultHTML(result,key){
      lastResult={result,key,recordId:getRecord().id};
      const date=new Date(result.createdAt).toLocaleString('zh-CN');
      return `<div class="ai-result" data-ai-request="${key}"><div class="eyebrow">AI REVIEW / 可追溯点评</div><h2>${result.mode==='step'?`第 ${result.decisions[0].step} 步点评`:'本副整局点评'}</h2><p class="subtle">${esc(result.model)} · ${esc(date)} · ${result.cached?'已保存的点评':'本次生成'}</p><p class="ai-summary">${esc(result.summary)}</p><section class="ai-reader" aria-label="AI 语音解读"><div class="ai-reader-head"><strong>✦ 稳重男声 · 讲这一${result.mode==='step'?'手':'局'}</strong><div class="actions"><button class="button small" data-ai-action="voice-pause">暂停解读</button><button class="button small ghost" data-ai-action="voice-replay">重新解读</button></div></div><div class="ai-reader-status" role="status"></div><p class="ai-reader-caption"></p><details><summary>查看口语解读稿</summary><p>${esc(result.spokenSummary)}</p></details></section><div class="notice">${result.compactRetry?'已自动使用精简版。 ':''}${esc(result.scope)}${result.mode==='game'?` 共 ${result.totalSteps} 步，提供给模型重点分析的步骤：${result.reviewedSteps.join('、')}。`:''}</div>${result.decisions.map(d=>`<article class="ai-decision"><div class="ai-heading"><h3>第 ${d.step} 步 · ${esc(d.seat)}</h3><button class="button small ghost" data-ai-action="goto" data-ai-step="${d.step}">回到这一步 ↗</button></div><p><b>实际选择：</b>${esc(d.chosen.type)} ${esc(d.chosen.cards.join(' '))}<br><span class="subtle">${esc(d.chosen.origin)}</span></p><div class="ai-facts"><b>规则引擎事实</b>${d.facts.map(f=>`<p>${esc(f)}</p>`).join('')}</div><p><b>AI 分析：</b>${esc(d.comment)}</p>${d.candidate?`<p><b>合法候选：</b>${esc(d.candidate.type)} ${esc(d.candidate.cards.join(' '))}</p>`:''}<p>${esc(d.alternative)}</p><p class="ai-practice"><b>重练目标：</b>${esc(d.practice)}</p></article>`).join('')}<h3>下一次练什么</h3><ol>${result.training.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="notice"><b>分析边界：</b>${esc(result.uncertainty)} AI 解读可能出错；候选合法性经过校验，策略优劣未被求解器证明。</div><p class="subtle">核对编号 ${esc(result.reference.slice(0,12))} · ${esc(result.version)}<br>原始牌谱保持不变；点评可单独导出。</p><div class="actions"><button class="button" data-ai-action="export">导出点评</button><button class="button primary" data-action="closeModal">回到牌桌</button></div></div>`;
    }
    async function show(mode){
      if(location.protocol==='file:'){toast('离线文件保留本地复盘；MiniMax 点评请打开在线版。');return;}
      if(busy){toast('已有点评正在生成，请稍候。');return;}
      const record=getRecord(),step=getCursor();
      if(mode==='step'&&(!isReview()||step<1))return;
      if(mode==='game'&&!getStates().at(-1).over)return;
      // Send only game data. Notes, titles, IDs and archive history stay on device.
      const body={mode,step:mode==='step'?step:undefined,record:{format:record.format,start:record.start,events:mode==='step'?record.events.slice(0,step):record.events}};
      const encoded=JSON.stringify(body),key=await digest(encoded);
      pending={key,encoded,recordId:record.id};
      if(cache[key]?.version==='guandan-review-v4'){present({...cache[key],cached:true},key);return;}
      openModal(`<div data-ai-request="${key}"><div class="eyebrow">MINIMAX / 牌局分析</div><h2>${mode==='step'?`点评第 ${step} 步`:'生成整局点评'}</h2><p>讲清本次选择的取舍、可比较的合法候选，以及一个能亲自验证的练习目标。</p><div class="notice">${mode==='step'?'只分析所选玩家自己的手牌、此前公开行动和本次选择；不把后续结果交给模型。':'整局包含结果和完整公开行动，重点抽取你的位置最多 3 个关键决策；不会逐手穷尽求解。'}</div><p>点击生成后，牌谱会发送到本网站服务端校验，整理出的事实会交给 MiniMax。个人笔记不发送。服务端保留点评缓存约 7 天，本机保留最近 30 条。</p><p class="subtle" id="ai-limit-status">正在读取体验次数设置…</p><div class="actions"><button class="button" data-action="closeModal">暂不生成</button><button class="button primary" data-ai-action="generate">生成 AI 点评</button></div><div id="ai-error" role="status"></div></div>`);
      try{const res=await fetch(API+'/review',{cache:'no-store'});const info=await res.json();const el=document.querySelector('#ai-limit-status');if(el&&pending?.key===key){el.textContent=info.configured?info.unlimited?'已取消每日与同网络次数上限；相同点评优先读取缓存。':`每日全站最多 ${info.limits.daily} 次新生成，同一网络最多 ${info.limits.visitor} 次；北京时间零点恢复。读取已有点评不扣次数。`:'AI 尚未配置完成；当前仍可使用本地规则复盘。';if(!info.configured)document.querySelector('[data-ai-action="generate"]')?.setAttribute('disabled','');}}
      catch{const el=document.querySelector('#ai-limit-status');if(el)el.textContent='暂时无法连接点评服务，请稍后再试。';}
    }
    async function generate(){
      if(busy||!pending)return;const snapshot=pending;busy=true;
      const button=document.querySelector('[data-ai-action="generate"]');if(button){button.disabled=true;button.textContent='正在分析牌谱…';}
      const error=document.querySelector('#ai-error');if(error)error.textContent='通常需要 10–60 秒；若输出截断会自动精简重试一次，最长约 110 秒，无需重复点击。';
      try{
        const response=await fetch(API+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:snapshot.encoded,signal:AbortSignal.timeout(115000)});
        const data=await response.json();if(!response.ok)throw Error(data.error||'点评生成失败，请稍后再试。');
        persist(snapshot.key,data);
        if(document.querySelector(`[data-ai-request="${snapshot.key}"]`)&&getRecord().id===snapshot.recordId)present(data,snapshot.key);
        else toast('AI 点评已保存；回到原步骤可查看。');
      }catch(e){if(document.querySelector(`[data-ai-request="${snapshot.key}"]`)){const el=document.querySelector('#ai-error');if(el)el.textContent=e.name==='TimeoutError'?'等待超时；服务端可能仍在生成，稍后点击将尝试读取已有结果。':e.message;const b=document.querySelector('[data-ai-action="generate"]');if(b){b.disabled=false;b.textContent='重试生成';}}}
      finally{busy=false;}
    }
    async function share(){try{await navigator.clipboard.writeText(SITE);toast('公开体验链接已复制，可以发给朋友。');}catch{openModal(`<h2>分享给朋友</h2><p>复制下面的公开链接。每位访客的练习进度各自保存在本机。</p><input aria-label="公开体验链接" readonly value="${SITE}"><button class="button primary" data-action="closeModal">完成</button>`);}}
    document.addEventListener('click',e=>{const b=e.target.closest('[data-ai-action]');if(!b||b.disabled)return;e.preventDefault();switch(b.dataset.aiAction){
      case 'step':show('step').catch(()=>toast('无法打开点评，请稍后重试。'));break;
      case 'game':show('game').catch(()=>toast('无法打开点评，请稍后重试。'));break;
      case 'generate':generate();break;
      case 'share':share();break;
      case 'voice-pause':reader.toggle();break;
      case 'voice-replay':if(lastResult)reader.start(lastResult.result.spokenSummary,lastResult.result.reference);break;
      case 'goto':if(lastResult?.recordId===getRecord().id){closeModal();goto(+b.dataset.aiStep);}break;
      case 'export':if(lastResult){const blob=new Blob([JSON.stringify({format:'guandan-ai-review-v1',...lastResult.result},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='掼蛋-AI点评-'+lastResult.result.reference.slice(0,12)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}break;
    }});
    return {html,stopReading:reader.stop,unlockSpeech:reader.unlock};
  }
  root.GuandanAI={create,speechChunks,createReader};
})(globalThis);
