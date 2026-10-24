(function(root){
  'use strict';
  const CACHE='guandan-ai-reviews-v1';
  const API=root.document?.querySelector?.('meta[name=guandan-api-base]')?.content||'/api';
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
  function create({memory,getRecord,getCursor,getStates,isReview,openModal,closeModal,toast,goto,esc,speechPreferences,beforeReading}){
    let cache={},pending=null,busy=false,lastResult=null,lastTable=null;
    const reader=createReader({preferences:speechPreferences,beforeStart:beforeReading,onChange:updateReader});
    function updateReader(v){
      const status=document.querySelector('.ai-reader-status'),caption=document.querySelector('.ai-reader-caption'),button=document.querySelector('[data-ai-action="voice-pause"]');
      if(status)status.textContent=({reading:`${v.status==='正在播报…'?'正在解读':'准备播放'} · ${v.remote?'沉稳男声':`${v.index+1} / ${v.total} 段`}`,paused:v.remote?'已暂停，继续时从这里接着听。':'已暂停，继续时从当前句重读。',done:'解读完毕，可回到具体步骤重练。',muted:'已按桌面设置静音。',error:v.status||'语音解读暂不可用，可点“重新解读”重试。',idle:'解读已停止。'})[v.state];
      if(caption)caption.textContent=v.text;
      if(button){button.textContent=v.state==='paused'?'继续解读':'暂停解读';button.disabled=!['reading','paused'].includes(v.state);}
    }
    function present(result,key){openModal(resultHTML(result,key).replace(/minimax(?:[-\s]+M\d+(?:\.\d+)*(?:[-\s]+Flash)?)?/gi,'AI分析'));reader.start(result.spokenSummary,result.reference);}

    try{const saved=JSON.parse(localStorage.getItem(CACHE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))cache=saved;}catch{}
    function persist(key,value){cache[key]=value;cache=Object.fromEntries(Object.entries(cache).slice(-30));try{localStorage.setItem(CACHE,JSON.stringify(cache));}catch{toast('点评已生成，但本机空间不足；请导出点评。');}}
    async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');}
    function html(){const cursor=getCursor(),end=getStates().at(-1).over;return `<section class="ai-panel"><div class="ai-heading"><span>✦ AI分析</span><span class="tag">按需生成</span></div><p>结合真实牌谱，解释取舍，给出可重练的目标。</p><div class="actions"><button class="button small primary" data-ai-action="step" ${!isReview()||cursor<1?'disabled':''}>点评这一步${isReview()&&cursor>0?` · ${cursor}`:''}</button><button class="button small" data-ai-action="game" ${!end?'disabled':''}>整局点评</button></div>${end?`<label class="review-seat-label" for="review-seat">复盘位置 <select id="review-seat">${['你','下家','搭档','上家'].map((x,i)=>`<option value="${i}">${x}</option>`).join('')}</select></label><button class="button small" data-ai-action="table">四方复盘并积累经验</button>`:''}<small>${!isReview()?'在时间线选中一步可生成单步点评。':'单步只使用该玩家当时可知的信息。'}${!end?' 完成这一副后可做整局点评。':''}</small></section>`;}
    function resultHTML(result,key){
      lastResult={result,key,recordId:getRecord().id};
      const date=new Date(result.createdAt).toLocaleString('zh-CN');
      return `<div class="ai-result" data-ai-request="${key}"><div class="eyebrow">AI REVIEW / 可追溯点评</div><h2>${result.mode==='step'?`第 ${result.decisions[0].step} 步点评`:['你','下家','搭档','上家'][result.reviewSeat??0]+' · 整局点评'}</h2><p class="subtle">AI分析 · ${esc(date)} · ${result.cached?'已保存的点评':'本次生成'}</p><p class="ai-summary">${esc(result.summary)}</p><p class="subtle">本次提炼 ${result.experiences?.length||0} 条条件性经验，已保存在本机；四个座位的智能对战可共同参考。</p>${result.strategy?`<section class="strategy-review"><h3>整手策略计划</h3>${[['priority','阶段目标'],['bombs','炸弹与配牌'],['defense','防守对手'],['teamwork','搭档协作'],['route','后续路线']].map(([k,label])=>`<p><b>${label}：</b>${esc(result.strategy[k])}</p>`).join('')}</section>`:''}<section class="ai-reader" aria-label="AI 语音解读"><div class="ai-reader-head"><strong>✦ 稳重男声 · 讲这一${result.mode==='step'?'手':'局'}</strong><div class="actions"><button class="button small" data-ai-action="voice-pause">暂停解读</button><button class="button small ghost" data-ai-action="voice-replay">重新解读</button></div></div><div class="ai-reader-status" role="status"></div><p class="ai-reader-caption"></p><details><summary>查看口语解读稿</summary><p>${esc(result.spokenSummary)}</p></details></section><div class="notice">${result.compactRetry?'已自动使用精简版。 ':''}${esc(result.scope)}${result.mode==='game'?` 共 ${result.totalSteps} 步，提供给模型重点分析的步骤：${result.reviewedSteps.join('、')}。`:''}</div>${result.decisions.map(d=>`<article class="ai-decision"><div class="ai-heading"><h3>第 ${d.step} 步 · ${esc(d.seat)}</h3><button class="button small ghost" data-ai-action="goto" data-ai-step="${d.step}">回到这一步 ↗</button></div><p><b>实际选择：</b>${esc(d.chosen.type)} ${esc(d.chosen.cards.join(' '))}<br><span class="subtle">${esc(d.chosen.origin)}</span></p><div class="ai-facts"><b>规则引擎事实</b>${d.facts.map(f=>`<p>${esc(f)}</p>`).join('')}</div><p><b>AI 分析：</b>${esc(d.comment)}</p>${d.candidate?`<p><b>合法候选：</b>${esc(d.candidate.type)} ${esc(d.candidate.cards.join(' '))}</p>`:''}<p>${esc(d.alternative)}</p><p class="ai-practice"><b>重练目标：</b>${esc(d.practice)}</p></article>`).join('')}<h3>下一次练什么</h3><ol>${result.training.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="notice"><b>分析边界：</b>${esc(result.uncertainty)} AI 解读可能出错；候选合法性经过校验，策略优劣未被求解器证明。</div><p class="subtle">核对编号 ${esc(result.reference.slice(0,12))} · ${esc(result.version)}<br>原始牌谱保持不变。</p><div class="actions">${lastTable?.recordId===getRecord().id?'<button class="button" data-ai-action="tableResults">四方点评</button>':''}<button class="button primary" data-action="closeModal">回到牌桌</button></div></div>`;
    }
    async function show(mode){
      const table=mode==='table';if(table)mode='game';
      if(location.protocol==='file:'){toast('离线文件保留本地复盘；AI分析请打开在线版。');return;}
      if(busy){toast('已有点评正在生成，请稍候。');return;}
      const record=getRecord(),step=getCursor();
      if(mode==='step'&&(!isReview()||step<1))return;
      if(mode==='game'&&!getStates().at(-1).over)return;
      // Send only game data. Notes, titles, IDs and archive history stay on device.
      const seat=mode==='game'?Number(document.querySelector('#review-seat')?.value||0):undefined;
      const body={mode,seat,step:mode==='step'?step:undefined,record:{format:record.format,start:record.start,events:mode==='step'?record.events.slice(0,step):record.events}};
      const encoded=JSON.stringify(body),key=await digest(encoded);
      pending={key,encoded,body,table,recordId:record.id,gameId:await digest(JSON.stringify(root.Guandan.sourceStart(record))),seatOffset:record.perspective?.offset||0};
      if(!table&&cache[key]?.version==='guandan-review-v7'){memory.ingest(cache[key],pending);present({...cache[key],cached:true},key);return;}
      openModal(`<div data-ai-request="${key}"><div class="eyebrow">AI分析 / 牌局复盘</div><h2>${mode==='step'?`点评第 ${step} 步`:table?'生成四方复盘':'生成'+['你','下家','搭档','上家'][seat]+'的整局点评'}</h2><p>讲清本次选择的取舍、可比较的合法候选，以及一个能亲自验证的练习目标。</p><div class="notice">${mode==='step'?'只分析所选玩家自己的手牌、此前公开行动和本次选择；不把后续结果交给模型。':table?'依次为四个位置生成点评，每人最多 3 个关键决策，最多调用 4 次 AI；完成后把条件性经验汇入本机。':'整局包含结果和公开行动，重点抽取所选位置最多 3 个关键决策；不会逐手穷尽求解。'}</div><p>点击生成后，牌谱会发送到本网站服务端校验，整理出的事实会交给 AI分析服务。个人笔记不发送。服务端保留点评缓存约 7 天，本机保留最近 30 条。</p><p class="subtle" id="ai-limit-status">正在读取体验次数设置…</p><div class="actions"><button class="button" data-action="closeModal">暂不生成</button><button class="button primary" data-ai-action="generate">生成 AI分析</button></div><div id="ai-error" role="status"></div></div>`);
      try{const res=await fetch(API+'/review',{cache:'no-store'});const info=await res.json();const el=document.querySelector('#ai-limit-status');if(el&&pending?.key===key){el.textContent=info.configured?info.unlimited?'已取消每日与同网络次数上限；相同点评优先读取缓存。':`每日全站最多 ${info.limits.daily} 次新生成，同一网络最多 ${info.limits.visitor} 次；北京时间零点恢复。读取已有点评不扣次数。`:'AI 尚未配置完成；当前仍可使用本地规则复盘。';if(!info.configured)document.querySelector('[data-ai-action="generate"]')?.setAttribute('disabled','');}}
      catch{const el=document.querySelector('#ai-limit-status');if(el)el.textContent='暂时无法连接点评服务，请稍后再试。';}
    }
    async function generate(){
      if(busy||!pending)return;const snapshot=pending;busy=true;
      const button=document.querySelector('[data-ai-action="generate"]');if(button){button.disabled=true;button.textContent='正在分析牌谱…';}
      const error=document.querySelector('#ai-error');if(error)error.textContent='通常需要 10–60 秒；若输出截断会自动精简重试一次，最长约 110 秒，无需重复点击。';
      try{
        const seats=snapshot.table?[0,1,2,3]:[snapshot.body.seat],results=[];
        for(const seat of seats){
          const encoded=JSON.stringify({...snapshot.body,seat}),key=await digest(encoded);
          const progress=document.querySelector('#ai-error');if(progress&&snapshot.table)progress.textContent=`正在分析${['你','下家','搭档','上家'][seat]}（${results.length+1}/4），已完成的结果会保留。`;
          let data=cache[key]?.version==='guandan-review-v7'?{...cache[key],cached:true}:null;
          if(!data){const response=await fetch(API+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:encoded,signal:AbortSignal.timeout(115000)});data=await response.json();if(!response.ok)throw Error(data.error||'点评生成失败，请稍后再试。');persist(key,data);}
          memory.ingest(data,snapshot);results.push({result:data,key});
          if(snapshot.table)lastTable={results:[...results],recordId:snapshot.recordId};
        }
        if(document.querySelector(`[data-ai-request="${snapshot.key}"]`)&&getRecord().id===snapshot.recordId){if(snapshot.table)showTableResults();else present(results[0].result,results[0].key);}
        else toast('AI分析与条件性经验已保存在本机。');
      }catch(e){if(document.querySelector(`[data-ai-request="${snapshot.key}"]`)){const el=document.querySelector('#ai-error');if(el)el.textContent=e.name==='TimeoutError'?'等待超时；服务端可能仍在生成，稍后点击将尝试读取已有结果。':String(e.message).replace(/minimax(?:[-\s]+M\d+(?:\.\d+)*(?:[-\s]+Flash)?)?/gi,'AI分析');const b=document.querySelector('[data-ai-action="generate"]');if(b){b.disabled=false;b.textContent='重试生成';}}}
      finally{busy=false;}
    }
    function showTableResults(){if(!lastTable)return;reader.stop();openModal(`<h2>四方复盘</h2><p>已完成 ${lastTable.results.length}/4 个位置。经验已汇入同一个本机库；重复查看不会重复累计。</p>${lastTable.results.map(({result},i)=>`<article class="ai-decision"><h3>${['你','下家','搭档','上家'][result.reviewSeat??i]}</h3><p>${esc(result.summary)}</p><button class="button small" data-ai-action="seatResult" data-result-index="${i}">查看点评与语音</button></article>`).join('')}<button class="button primary" data-action="closeModal">返回牌桌</button>`);}
    function showMemory(){const data=memory.snapshot(),P=root.GuandanExperience.principles;openModal(`<h2>策略经验</h2><p>当前浏览器积累 ${data.entries.length} 条条件性比较。智能对战在相似局面中参考，快速模式继续使用确定的本地评分。</p><label class="setting-row"><span>智能对战参考本机经验</span><input type="checkbox" id="experience-enabled" ${data.enabled?'checked':''}></label><details class="secondary-details"><summary>基础打法方法</summary>${Object.values(P).map(p=>`<p><b>${p.title}</b><br>${p.advice}</p>`).join('')}</details><p class="subtle">经验是复盘建议，不是胜率证明或模型权重训练；四名玩家共享原则，不共享本局隐藏手牌。</p>${data.entries.slice().reverse().slice(0,30).map(x=>`<details class="secondary-details"><summary>${esc(P[x.principle].title)} · ${['你','下家','搭档','上家'][x.seat]}第 ${x.step} 步</summary><p>${esc(x.observation)}</p><p>比较 ${esc(x.candidate)} ${esc((x.cards||[]).join(' '))}：${esc(x.comparison)}</p><small>来源 ${esc(x.recordId)} · ${esc(String(x.reference||'').slice(0,12))} · 待独立验证</small></details>`).join('')}<details class="secondary-details"><summary>管理经验</summary><button class="button small" data-ai-action="clearMemory">清空本机经验</button>${data.canRestore?'<button class="button small" data-ai-action="restoreMemory">撤销清空</button>':''}</details><button class="button primary menu-done" data-action="closeModal">返回牌桌</button>`);}
    document.addEventListener('change',e=>{if(e.target.id==='experience-enabled')memory.enable(e.target.checked);});
    document.addEventListener('click',e=>{const b=e.target.closest('[data-ai-action]');if(!b||b.disabled)return;e.preventDefault();switch(b.dataset.aiAction){
      case 'step':show('step').catch(()=>toast('无法打开点评，请稍后重试。'));break;
      case 'game':show('game').catch(()=>toast('无法打开点评，请稍后重试。'));break;
      case 'generate':generate();break;
      case 'table':show('table').catch(()=>toast('无法打开四方复盘。'));break;
      case 'tableResults':showTableResults();break;
      case 'seatResult':{const x=lastTable?.results[+b.dataset.resultIndex];if(x)present(x.result,x.key);}break;
      case 'memory':showMemory();break;
      case 'clearMemory':memory.clear();showMemory();break;
      case 'restoreMemory':memory.restore();showMemory();break;
      case 'voice-pause':reader.toggle();break;
      case 'voice-replay':if(lastResult)reader.start(lastResult.result.spokenSummary,lastResult.result.reference);break;
      case 'goto':if(lastResult?.recordId===getRecord().id){closeModal();goto(+b.dataset.aiStep);}break;
      case 'export':if(lastResult){const blob=new Blob([JSON.stringify({format:'guandan-ai-review-v1',...lastResult.result},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='掼蛋-AI点评-'+lastResult.result.reference.slice(0,12)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}break;
    }});
    return {html,stopReading:reader.stop,unlockSpeech:reader.unlock};
  }
  root.GuandanAI={create,speechChunks,createReader};
})(globalThis);
