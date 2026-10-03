(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('lake'), ctx = canvas.getContext('2d');
  if (!ctx) { $('instruction').textContent = '画卷暂时无法展开，请换一个浏览器再试。'; return; }
  const chapters = [
    { season:'spring', name:'春水初生', short:'水暖', time:'仲春', number:'一', label:'第一卷 · 仲春', lines:['竹外桃花三两枝','春江水暖鸭先知'], author:'宋 · 苏轼《惠崇春江晚景二首·其一》', end:'一池春水，万物慢慢醒来。', note:'这是一首题画诗。苏轼从画中的鸭子想到了水的温暖，让看得见的景，生出看不见的春意。', source:'https://www.guwendao.net/mingju/juv_1f8e289cc923.aspx', color:'#aa6c60' },
    { season:'summer', name:'荷风入画', short:'荷风', time:'初夏', number:'二', label:'第二卷 · 初夏', lines:['泉眼无声惜细流','树阴照水爱晴柔'], author:'宋 · 杨万里《小池》', end:'心有荷香，便是清凉。', note:'诗人把小小的泉眼与树阴写得有情。留心一池微光，也能在寻常里遇见温柔。', source:'https://www.guwendao.net/mingju/juv_710e46b2e6d7.aspx', color:'#ac7864' },
    { season:'autumn', name:'空山听雨', short:'山静', time:'初秋', number:'三', label:'第三卷 · 初秋', lines:['空山新雨后','天气晚来秋'], author:'唐 · 王维《山居秋暝》', end:'山色洗净，心也澄明。', note:'雨后的空山、松间的明月、石上的清泉，共同铺开清新的秋夜。王维的诗，让宁静也有声音。', source:'https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/resources/secondary-edu/lang/CDI020211148_note.pdf', color:'#ad7843' },
    { season:'winter', name:'寒江一灯', short:'江雪', time:'隆冬', number:'四', label:'第四卷 · 隆冬', lines:['孤舟蓑笠翁','独钓寒江雪'], author:'唐 · 柳宗元《江雪》', end:'天地留白，一点灯火。', note:'千山万径的寂静，衬出江上一叶孤舟。这里借它的留白邀你静坐片刻；诗中的孤独与坚守，还有更深的意味。', source:'https://zh.wikisource.org/zh-hans/%E6%B1%9F%E9%9B%AA', color:'#927e71' }
  ];
  let chapter=1, free=false, width=1, height=1, time=0, previous=0, lamps=[], ripples=[], sparkles=[], trail=[];
  let grabbed=null, pointerId=null, selected=null, cursor={x:.44,y:.62}, focus=false, interaction=false;
  let complete=false, completeTimer=null, audio=null, sound=false, lastTone=-100, destroyed=false;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const target={x:.71,y:.60};
  const size=()=>clamp(width/48,16,24);
  const zone=()=>({rx:Math.max(width*.083,43),ry:Math.max(height*.065,29)});
  const positions=[[.22,.48],[.38,.68],[.51,.46],[.28,.80],[.48,.82]];

  function announce(text) { $('announcer').textContent=text; }
  function resize() {
    const r=canvas.getBoundingClientRect(); width=r.width; height=r.height;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  new ResizeObserver(resize).observe(canvas);

  function refreshProgress() {
    const n=lamps.filter(l=>l.home).length;
    $('progress-count').textContent=`${n} / 5`;
    [...$('progress-dots').children].forEach((el,i)=>el.classList.toggle('filled',i<n));
    if (!free && n===5 && !complete) {
      complete=true;
      completeTimer=setTimeout(()=>{ if(complete&&!free) { $('completion').hidden=false; $('next').focus({preventScroll:true}); announce('五盏荷灯已经入画。可以读诗，或展开下一卷。'); } },900);
    }
  }

  function reset(quiet=false) {
    clearTimeout(completeTimer); completeTimer=null; complete=false;
    grabbed=null; selected=null;
    if(pointerId!==null && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    pointerId=null; ripples=[]; sparkles=[]; trail=[];
    $('completion').hidden=true;
    lamps=positions.map(([x,y],id)=>({id,x,y,vx:0,vy:0,home:false,phase:id*1.7,glow:0}));
    refreshProgress();
    if(!quiet) announce(free?'新的荷灯已放出，自在拨水。':'五盏新的荷灯已放出。');
  }

  function setChapter(index,moveFocus=false) {
    chapter=index; const c=chapters[index];
    document.body.dataset.season=c.season;
    $('game-title').textContent=c.name;
    $('vertical-title').textContent=c.name; $('vertical-season').textContent=c.time;
    $('chapter-label').textContent=c.label; $('bottom-index').textContent=`卷 ${c.number} / 四`;
    $('poem-line-1').textContent=c.lines[0]; $('poem-line-2').textContent=c.lines[1];
    $('completion-title').textContent=c.end; $('completion-poem').textContent=`${c.lines[0]}，${c.lines[1]}。`;
    $('poem-credit').textContent=c.author; $('culture-note').textContent=c.note; $('poem-source').href=c.source;
    document.querySelectorAll('[data-chapter]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.chapter)===chapter)));
    reset(true);
    announce(`${c.label}，${c.name}。${free?'自在拨水。':'送五盏荷灯入塘。'}`);
    if(moveFocus) canvas.focus({preventScroll:true});
  }

  function startInteraction() {
    if(interaction)return; interaction=true; $('first-hint').classList.add('hidden');
  }
  function ripple(x,y,strong=false) {
    startInteraction();
    const v={x,y,age:0,r:0,oldR:0,pushed:new Set(),power:strong?1.3:1};
    ripples.push(v); if(ripples.length>18)ripples.shift();
    playTone(x,0); return v;
  }
  function within(lamp) {
    const z=zone(); return Math.hypot((lamp.x-target.x)*width/z.rx,(lamp.y-target.y)*height/z.ry)<.88;
  }
  function dock(lamp) {
    if(lamp.home||free)return;
    lamp.home=true; lamp.vx=lamp.vy=0; lamp.glow=1;
    if(selected===lamp.id)selected=null;
    const angle=lamp.id*Math.PI*2/5-Math.PI/2,z=zone();
    lamp.dest={x:target.x+Math.cos(angle)*z.rx*.53/width,y:target.y+Math.sin(angle)*z.ry*.47/height};
    for(let i=0;i<16;i++)sparkles.push({x:lamp.x*width,y:lamp.y*height,vx:Math.cos(i*2.4)*12,vy:Math.sin(i*2.4)*9-5,age:0});
    playTone(lamp.id/5,1); refreshProgress();
  }

  function point(e) { const r=canvas.getBoundingClientRect(); return{x:(e.clientX-r.left)/width,y:(e.clientY-r.top)/height}; }
  function bounded(p) { return{x:clamp(p.x,.07,.92),y:clamp(p.y,.34,.89)}; }
  canvas.addEventListener('pointerdown',e=>{
    if(! $('completion').hidden||pointerId!==null)return;
    e.preventDefault(); canvas.focus({preventScroll:true}); startInteraction();
    const p=point(e); cursor=p; selected=null; pointerId=e.pointerId;
    const nearest=lamps.filter(l=>!l.home).map(l=>({l,d:Math.hypot((l.x-p.x)*width,(l.y-p.y)*height)})).sort((a,b)=>a.d-b.d)[0];
    if(nearest&&nearest.d<Math.max(size()*1.5,28)) {
      grabbed=nearest.l; grabbed.vx=grabbed.vy=0; canvas.style.cursor='grabbing'; playTone(grabbed.id/5,0);
    } else { ripple(p.x,p.y); }
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(e.pointerId!==pointerId)return;
    const p=point(e); cursor=p;
    if(grabbed){ const b=bounded(p); grabbed.x=b.x;grabbed.y=b.y; trail.push({x:b.x,y:b.y,age:0}); if(trail.length>25)trail.shift(); }
  });
  function release(e,cancel=false) {
    if(e.pointerId!==pointerId)return;
    if(grabbed) {if(!cancel&&within(grabbed))dock(grabbed);if(!cancel)ripple(grabbed.x,grabbed.y);grabbed=null;}
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    pointerId=null;canvas.style.cursor='crosshair';
  }
  canvas.addEventListener('pointerup',e=>release(e));
  canvas.addEventListener('pointercancel',e=>release(e,true));
  canvas.addEventListener('lostpointercapture',()=>{ grabbed=null;pointerId=null;canvas.style.cursor='crosshair'; });
  canvas.addEventListener('focus',()=>{focus=true;});
  canvas.addEventListener('blur',()=>{focus=false;selected=null;});
  canvas.addEventListener('keydown',e=>{
    if(! $('completion').hidden)return;
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter','Escape','1','2','3','4','5'].includes(e.key))return;
    e.preventDefault(); startInteraction();
    if(/^[1-5]$/.test(e.key)) {
      const id=Number(e.key)-1; if(!lamps[id].home){selected=id;cursor={x:lamps[id].x,y:lamps[id].y};announce(`选中第 ${id+1} 盏灯。方向键移动，回车入塘。`);}return;
    }
    if(e.key==='Escape'){selected=null;return;}
    if(e.key==='Enter'&&selected!==null){const l=lamps[selected];l.x=target.x;l.y=target.y;if(!free)dock(l);else ripple(l.x,l.y);return;}
    if(e.key===' '||e.key==='Enter'){ripple(cursor.x,cursor.y,true);return;}
    const step=e.shiftKey?28:14,dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
    cursor=bounded({x:cursor.x+dx/width,y:cursor.y+dy/height});
    if(selected!==null){const l=lamps[selected];l.x=cursor.x;l.y=cursor.y;l.vx=l.vy=0;if(within(l))dock(l);}
  });

  function update(dt) {
    time+=dt;
    for(const r of ripples){r.oldR=r.r;r.age+=dt;r.r=r.age*Math.min(width,height)*.55;}
    ripples=ripples.filter(r=>r.age<3.4);
    for(const l of lamps){
      l.glow=Math.max(0,l.glow-dt*.35);
      if(l.home){l.x+=(l.dest.x-l.x)*Math.min(1,dt*3);l.y+=(l.dest.y-l.y)*Math.min(1,dt*3);continue;}
      if(l===grabbed||l.id===selected)continue;
      for(const r of ripples){
        const dx=(l.x-r.x)*width,dy=(l.y-r.y)*height,d=Math.hypot(dx,dy/.39),direction=Math.hypot(dx,dy);
        if(!r.pushed.has(l.id)&&d<r.r+size()&&d>=r.oldR-size()){
          r.pushed.add(l.id);const force=70*r.power*Math.max(.25,1-d/Math.max(width,height));
          l.vx+=(direction>1?dx/direction:1)*force/width; l.vy+=(direction>1?dy/direction:0)*force/height;
        }
      }
      const damping=Math.exp(-1.35*dt);l.vx*=damping;l.vy*=damping;
      if(!reduceMotion){l.vx+=Math.sin(time*.25+l.phase)*.00022*dt;l.vy+=Math.cos(time*.22+l.phase)*.0002*dt;}
      l.x+=l.vx*dt;l.y+=l.vy*dt;
      if(l.x<.075||l.x>.915){l.x=clamp(l.x,.075,.915);l.vx*=-.35;}
      if(l.y<.34||l.y>.89){l.y=clamp(l.y,.34,.89);l.vy*=-.35;}
      if(!free&&within(l))dock(l);
    }
    for(const s of sparkles){s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;}sparkles=sparkles.filter(s=>s.age<2);
    for(const s of trail)s.age+=dt;trail=trail.filter(s=>s.age<.8);
  }

  function drawTarget() {
    if(free)return;
    const x=target.x*width,y=target.y*height,z=zone();
    ctx.save();
    const glow=ctx.createRadialGradient(x,y,0,x,y,z.rx*1.7);glow.addColorStop(0,'rgba(118,147,120,.08)');glow.addColorStop(1,'rgba(118,147,120,0)');
    ctx.fillStyle=glow;ctx.fillRect(x-z.rx*1.7,y-z.rx*1.7,z.rx*3.4,z.rx*3.4);
    ctx.beginPath();ctx.ellipse(x,y,z.rx,z.ry,0,0,Math.PI*2);ctx.strokeStyle='#63846a72';ctx.lineWidth=.85;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.ellipse(x,y,z.rx*.85,z.ry*.83,0,0,Math.PI*2);ctx.strokeStyle='#63846a20';ctx.stroke();
    ctx.fillStyle='#4f725c';ctx.font=`${clamp(width/58,19,24)}px "Kaiti SC", "STKaiti", serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('归',x,y);ctx.restore();
  }
  function drawLamp(l) {
    const x=l.x*width,y=l.y*height+(reduceMotion?0:Math.sin(time*.9+l.phase)*1.6),r=size();
    ctx.save();ctx.translate(x,y);ctx.scale(l.home ? .9 : 1,l.home ? .9 : 1);
    ctx.beginPath();ctx.ellipse(0,r*.65,r*1.35,r*.28,0,0,Math.PI*2);ctx.fillStyle='#46654c0c';ctx.fill();ctx.strokeStyle='#6d87732e';ctx.lineWidth=.7;ctx.stroke();
    const glow=ctx.createRadialGradient(0,-3,0,0,-3,r*2.7);glow.addColorStop(0,`rgba(231,180,94,${.2+l.glow*.15})`);glow.addColorStop(1,'rgba(231,180,94,0)');ctx.fillStyle=glow;ctx.fillRect(-r*3,-r*3,r*6,r*6);
    for(let i=0;i<5;i++){
      const a=(i-2)*.48;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,r*.43);ctx.bezierCurveTo(-r*.65,-r*.06,-r*.42,-r*.70,0,-r*(i===2?1.05:.78));ctx.bezierCurveTo(r*.42,-r*.70,r*.65,-r*.06,0,r*.43);
      const g=ctx.createLinearGradient(0,-r,0,r*.6);g.addColorStop(0,'#c88b76');g.addColorStop(.54,'#e9c5a0');g.addColorStop(1,'#cfaa7d');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=chapters[chapter].color;ctx.lineWidth=.75;ctx.stroke();ctx.restore();
    }
    ctx.beginPath();ctx.ellipse(0,r*.15,r*.30,r*.17,0,0,Math.PI*2);ctx.fillStyle='#aa7950';ctx.fill();
    ctx.beginPath();ctx.moveTo(-r*.11,r*.05);ctx.quadraticCurveTo(-r*.25,-r*.12,0,-r*.41);ctx.quadraticCurveTo(r*.23,-r*.12,r*.10,r*.05);ctx.fillStyle='#fff0b5';ctx.fill();
    if(selected===l.id){ctx.beginPath();ctx.ellipse(0,0,r*1.5,r*1.3,0,0,Math.PI*2);ctx.setLineDash([3,3]);ctx.strokeStyle='#a94334';ctx.stroke();ctx.fillStyle='#a94334';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(String(l.id+1),0,-r*1.55);}
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    drawTarget();
    for(const s of trail){ctx.beginPath();ctx.ellipse(s.x*width,s.y*height,3,1.1,0,0,Math.PI*2);ctx.fillStyle=`rgba(97,130,109,${Math.max(0,.2-s.age*.25)})`;ctx.fill();}
    for(const r of ripples){
      const a=Math.max(0,1-r.age/3.4);
      for(let i=0;i<3;i++) {const radius=r.r-i*11;if(radius<1)continue;ctx.beginPath();ctx.ellipse(r.x*width,r.y*height,radius,radius*.39,0,0,Math.PI*2);ctx.strokeStyle=`rgba(80,114,94,${a*(.24-i*.04)})`;ctx.lineWidth=.9-i*.17;ctx.stroke();}
    }
    lamps.slice().sort((a,b)=>a.y-b.y).forEach(drawLamp);
    for(const s of sparkles){ctx.beginPath();ctx.arc(s.x,s.y,1.2,0,Math.PI*2);ctx.fillStyle=`rgba(170,115,60,${Math.max(0,.65-s.age*.35)})`;ctx.fill();}
    if(!reduceMotion){
      const c=chapters[chapter];
      if(c.season==='spring'||c.season==='autumn'||c.season==='winter')for(let i=0;i<13;i++){
        const speed=c.season==='winter'?.007:.004,x=((i*.137+Math.sin(time*.09+i)*.022)%1)*width,y=((i*.173+time*speed)%1)*height;
        ctx.save();ctx.translate(x,y);ctx.rotate(time*.18+i);ctx.beginPath();ctx.ellipse(0,0,c.season==='winter'?1.4:2.8,c.season==='winter'?1.4:1.2,0,0,Math.PI*2);ctx.fillStyle=c.season==='winter'?'#fffdf9a8':c.season==='spring'?'#b580693b':'#a17f4040';ctx.fill();ctx.restore();
      }
    }
    if(focus&&pointerId===null&&selected===null){ctx.save();ctx.beginPath();ctx.ellipse(cursor.x*width,cursor.y*height,9,4,0,0,Math.PI*2);ctx.strokeStyle='#627c6299';ctx.lineWidth=1;ctx.stroke();ctx.restore();}
  }
  function frame(ms) {
    if(destroyed)return;
    const dt=previous?Math.min((ms-previous)/1000,.05):.016;previous=ms;
    if(!document.hidden&&!$('help-dialog').open){update(dt);draw();}
    requestAnimationFrame(frame);
  }

  function initAudio() {
    if(audio)return audio;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;
    try {
      const a=new Audio(),master=a.createGain();master.gain.value=.40;master.connect(a.destination);
      const buffer=a.createBuffer(1,a.sampleRate*3,a.sampleRate),data=buffer.getChannelData(0);
      let v=0;for(let i=0;i<data.length;i++){v=v*.94+(Math.random()*2-1)*.06;data[i]=v;}
      const stream=a.createBufferSource();stream.buffer=buffer;stream.loop=true;
      const filter=a.createBiquadFilter();filter.type='lowpass';filter.frequency.value=550;
      const gain=a.createGain();gain.gain.value=.055;stream.connect(filter);filter.connect(gain);gain.connect(master);stream.start();
      audio={a,master};return audio;
    }catch{return null;}
  }
  function playTone(x,kind) {
    if(!sound||!audio||time-lastTone<.13)return;
    lastTone=time; const {a,master}=audio;if(a.state!=='running')return;
    const notes=[261.63,293.66,329.63,392,440],at=a.currentTime,freq=notes[clamp(Math.floor(x*5),0,4)]*(kind?1:.5);
    const osc=a.createOscillator(),gain=a.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(freq*.93,at+.6);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(kind?.14:.09,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+1.3);
    osc.connect(gain);gain.connect(master);osc.start(at);osc.stop(at+1.4);osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  $('sound').addEventListener('click',async()=>{
    const engine=initAudio();if(!engine){announce('这个浏览器暂时不能播放水声。');return;}
    try {if(sound){await engine.a.suspend();sound=false;}else{await engine.a.resume();sound=true;playTone(.5,0);}}
    catch{announce('声音暂未开启，可以再轻点一次。');return;}
    $('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'关闭声音':'开启声音');$('sound').querySelector('span').textContent=sound?'水声已开':'听水';
    announce(sound?'水声已开启。':'水声已关闭。');
  });
  $('help').addEventListener('click',()=>{$('help-dialog').showModal();});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{$('help-dialog').close();}));
  $('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('restart').addEventListener('click',()=>reset());
  $('next').addEventListener('click',()=>setChapter((chapter+1)%chapters.length,true));
  $('stay').addEventListener('click',()=>{$('completion').hidden=true;canvas.focus({preventScroll:true});announce('留在这一池灯火里。可以重新放灯，或选择另一卷。');});
  $('mode').addEventListener('click',()=>{
    free=!free;$('mode').setAttribute('aria-pressed',String(free));$('mode-label').textContent=free?'回到引灯':'自在模式';
    $('progress').hidden=free;$('progress').style.display=free?'none':'';$('painting').querySelector('.water-label').hidden=free;
    $('chapter-note').textContent=free?'随手拨水，静静看灯。':'把五盏荷灯，轻轻送入荷塘。';
    $('instruction').textContent=free?'随手拨水，让心情留白。':'轻点拨水，也可拖动荷灯。';
    reset();announce(free?'自在模式。随手拨水，不用完成目标。':'回到引灯。把五盏灯送入荷塘。');
  });
  document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>setChapter(Number(b.dataset.chapter))));
  document.addEventListener('visibilitychange',()=>{previous=0;if(audio){if(document.hidden)audio.a.suspend();else if(sound)audio.a.resume().catch(()=>{});}});
  window.addEventListener('pagehide',()=>{destroyed=true;clearTimeout(completeTimer);if(audio)audio.a.close();});
  window.addEventListener('pageshow',e=>{if(e.persisted){destroyed=false;previous=0;audio=null;sound=false;$('sound').setAttribute('aria-pressed','false');$('sound').setAttribute('aria-label','开启声音');$('sound').querySelector('span').textContent='听水';requestAnimationFrame(frame);}});
  resize();reset(true);requestAnimationFrame(frame);
})();
