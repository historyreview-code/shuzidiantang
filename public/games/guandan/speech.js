(function(root){
  'use strict';
  const seats=['你','下家','搭档','上家'];
  const numbers=['零','一','二','三','四','五','六','七','八','九','十'];
  const rank=r=>numbers[r]||({11:'J',12:'Q',13:'K',14:'A',16:'小王',17:'大王'}[r])||String(r);
  function moveText(move){
    const r=rank(move.main);
    switch(move.type){
      case 'single':return `单张${r}`;
      case 'pair':return `一对${r}`;
      case 'triple':return `三张${r}`;
      case 'full':return `三带二，三张${r}`;
      case 'straight':return `顺子，${r}收尾`;
      case 'pairs':return `三连对，${r}收尾`;
      case 'triples':return `钢板，${r}收尾`;
      case 'flush':return `同花顺，${r}收尾`;
      case 'bomb':return `${rank(move.ids.length)}张${r}炸弹`;
      case 'kings':return '四王炸';
      default:return '一组牌';
    }
  }
  function turnText(state){
    if(state.over){
      const ours=state.result.team===0;
      const dbl=state.result.doubleDown?(ours?'，双上':'，双下'):'';
      return `本副结束，${ours?'你和搭档获胜':'对方获胜'}${dbl}。`;
    }
    if(!state.trick&&state.leadReason.includes('借风'))return `${seats[state.turn]}借风，重新领出。`;
    return `轮到${seats[state.turn]}${state.trick?'出牌':'领出'}。`;
  }
  // Only the selected public action, remaining count and public turn/result are voiced.
  function actionText(action,state,replay=false){
    const actor=action.seat===0&&action.origin==='bot'?'电脑代你':seats[action.seat];
    let text=(replay?`回放第${state.step}步。`:'')+actor+(action.kind==='pass'?'过牌。':`出${moveText(action.move)}。`);
    const count=state.hands[action.seat].length;
    if(action.kind==='play'&&count===0)text+=`${seats[action.seat]}出完了，第${rank(state.finish.indexOf(action.seat)+1)}名。`;
    else if(action.kind==='play'&&count<=5)text+=`还剩${rank(count)}张。`;
    return text+turnText(state);
  }
  function create(options={}){
    const env=options.env||root,synth=env.speechSynthesis,Utterance=env.SpeechSynthesisUtterance;
    const supported=!!(synth&&Utterance),later=options.setTimeout||setTimeout,clear=options.clearTimeout||clearTimeout;
    let enabled=false,busy=false,text='',status=supported?'点击开启后，按座位播报出牌。':'当前浏览器不支持语音播报。',rate=1,utterance=null,watchdog=null,serial=0;
    const snapshot=()=>({supported,enabled,busy,text,status,rate});
    const emit=()=>options.onChange?.(snapshot());
    function cancel(quiet=false){
      serial++;clear(watchdog);watchdog=null;
      if(utterance){utterance.onstart=null;utterance.onend=null;utterance.onerror=null;}
      utterance=null;busy=false;
      if(supported){try{synth.cancel();}catch{}}
      if(!quiet){status=enabled?'播报已停止。':'语音已关闭。';emit();}
    }
    function enable(value){enabled=!!value&&supported;if(!enabled)cancel(true);status=enabled?'语音已开启。':supported?'语音已关闭。':'当前浏览器不支持语音播报。';emit();return enabled;}
    function setRate(value){rate=[0.85,1,1.2,1.4].includes(+value)?+value:1;emit();}
    function say(value){
      cancel(true);text=String(value||'');
      if(!enabled||!text){emit();return false;}
      const ticket=serial;busy=true;status='准备播报…';emit();
      function finish(error){
        if(ticket!==serial)return;
        serial++;
        clear(watchdog);watchdog=null;busy=false;
        if(utterance){utterance.onstart=null;utterance.onend=null;utterance.onerror=null;}utterance=null;
        if(error){enabled=false;status='语音暂不可用，可在桌面设置中重新打开自动播报。';env.console?.warn?.('Guandan speech:',error);try{synth.cancel();}catch{}}
        else status='播报完成。';
        emit();options.onIdle?.();
      }
      try{
        utterance=new Utterance(text);utterance.lang='zh-CN';utterance.rate=rate;utterance.volume=1;
        const voices=synth.getVoices().filter(v=>/^zh(?:-|_|$)/i.test(v.lang));
        const priority=v=>(/^zh[-_]CN$/i.test(v.lang)?4:0)+(v.localService?2:0)+(v.default?1:0);
        voices.sort((a,b)=>priority(b)-priority(a));if(voices[0]){utterance.voice=voices[0];utterance.lang=voices[0].lang;}
        utterance.onstart=()=>{if(ticket!==serial)return;clear(watchdog);status='正在播报…';emit();watchdog=later(()=>finish('playback-timeout'),Math.max(10000,Math.min(45000,text.length*600/rate+5000)));};
        utterance.onend=()=>finish(false);utterance.onerror=e=>finish(e?.error||'speech-error');
        watchdog=later(()=>finish('start-timeout'),5000);
        synth.resume();synth.speak(utterance);
      }catch{finish('speech-exception');}
      return true;
    }
    return {snapshot,cancel,enable,setRate,say};
  }
  const api={rank,moveText,turnText,actionText,create};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.GuandanSpeech=api;
})(typeof globalThis!=='undefined'?globalThis:this);
