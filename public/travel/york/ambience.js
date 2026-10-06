// Original slow waltz sketch: 城墙上的午后. No external audio or tracking.
// Audio is created only by a user gesture; hidden pages suspend the entire graph.
export function createAmbience(onChange) {
  let ctx,master,analyser,timer,enabled=false,volume=.32,step=0,next=0;
  const voices=new Set(),beat=60/70;
  const melody=[67, 69, 72, 76, 74, null, 72, 69, 67, 64, 67, null, 69, 72, 74, 79, 76, null, 74, 72, 69, 67, null, null];
  const bass=[48,45,41,43];
  function report(){let level=0;if(analyser&&enabled&&ctx.state==='running'){const a=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(a);level=Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length);}onChange({enabled,state:ctx?.state||'off',volume,level});}
  function note(midi,time,length,amplitude,soft=false){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.value=440*2**((midi-69)/12);
    gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(amplitude,time+(soft?.5:.035));gain.gain.exponentialRampToValueAtTime(.0001,time+length);
    osc.connect(gain).connect(master);osc.start(time);osc.stop(time+length+.05);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};
    if(!soft){const overtone=ctx.createOscillator(),g=ctx.createGain();overtone.frequency.value=osc.frequency.value*2;g.gain.setValueAtTime(amplitude*.12,time);g.gain.exponentialRampToValueAtTime(.0001,time+length*.35);overtone.connect(g).connect(master);overtone.start(time);overtone.stop(time+length*.35+.05);voices.add(overtone);overtone.onended=()=>{voices.delete(overtone);overtone.disconnect();g.disconnect();};}
  }
  function tick(){if(!enabled||ctx.state!=='running')return;while(next<ctx.currentTime+.3){const n=melody[step%melody.length];if(n!==null)note(n,next,2.6,.18);if(step%6===0){const root=bass[Math.floor(step/6)%4];note(root,next,6,.12,true);note(root+7,next+.12,5.8,.06,true);}step++;next+=beat;}report();}
  function silence(){clearInterval(timer);timer=null;for(const o of voices){try{o.stop();}catch{}}voices.clear();}
  async function setEnabled(value){
    enabled=value;
    try{if(enabled){if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');ctx=new Audio();master=ctx.createGain();master.gain.value=volume;analyser=ctx.createAnalyser();analyser.fftSize=256;master.connect(analyser).connect(ctx.destination);ctx.onstatechange=report;}await ctx.resume();if(!enabled){await ctx.suspend();return;}next=ctx.currentTime+.08;step=0;clearInterval(timer);timer=setInterval(tick,120);tick();}else{silence();if(ctx)await ctx.suspend();}report();}catch(error){enabled=false;silence();report();throw error;}
  }
  document.addEventListener('visibilitychange',async()=>{if(!ctx||!enabled)return;if(document.hidden){clearInterval(timer);await ctx.suspend();}else{try{await ctx.resume();next=ctx.currentTime+.08;clearInterval(timer);timer=setInterval(tick,120);tick();}catch{enabled=false;silence();report();}}});
  window.addEventListener('pagehide',()=>{silence();ctx?.suspend();});
  return {toggle:()=>setEnabled(!enabled),setVolume(value){volume=Math.max(0,Math.min(.65,Number(value)||0));if(master)master.gain.setTargetAtTime(volume,ctx.currentTime,.08);report();}};
}
