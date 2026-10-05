(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const C={water:'#77aaa5',deep:'#3a7777',land:'#c6c8a4',sand:'#c3a56f',ink:'#294a3d'};
const line=(d,color,width=3)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const txt=(s,x,y)=>`<text x="${x}" y="${y}" fill="${C.ink}" font-size="17" font-family="system-ui,sans-serif">${s}</text>`;
const base=()=>`<rect width="800" height="380" rx="12" fill="#e8ebdc"/><path d="M0 95 Q75 55 150 95 T350 80 T550 75 T800 80 L800 380 H0Z" fill="${C.land}"/>`;
function map(stage,t){let water='';const lakes=[[350,200,135,72],[525,150,125,64],[585,265,145,67],[245,290,88,45]];
for(let i=0;i<lakes.length;i++){let[x,y,rx,ry]=lakes[i],k=1-stage*.17;water+=`<ellipse cx="${x}" cy="${y}" rx="${rx*k}" ry="${ry*k}" fill="${C.water}"/>`;}
let s=base()+line('M-10 155 Q100 125 190 175 T365 190 T540 238 T820 290',C.deep,20-stage*2)+water;
for(let i=0;i<stage*9;i++){let x=195+i*16,y=168+Math.sin(i*.8)*35;s+=`<ellipse cx="${x}" cy="${y}" rx="24" ry="14" fill="${C.sand}"/>`;}
if(stage>=2)s+=line('M420 95 Q450 170 505 210 T680 275','#997d4e',6);
if(stage===3)for(let i=0;i<8;i++)s+=`<path d="M${270+i*37} 250l28 6v40l-28 -6Z" fill="#a3b17b" stroke="#e8ebdc"/>`;
for(let i=0;i<9;i++){let x=(t*15+i*95)%770;s+=line(`M${x} ${310+i%3*13}h18`,'#ffffff80',1);}
return s+txt('入水通道',35,118)+txt('湖泊与季节湿地',480,345)+txt('洲地 / 农田',50,345);
}
function season(q,t){const y=278-q*110;let s=`<rect width="800" height="380" rx="12" fill="#e9ede1"/><defs><clipPath id="valley"><path d="M0 0H800V160L650 210L560 300L430 265L300 310L180 185L0 145Z"/></clipPath></defs><path d="M0 145L180 185L300 310L430 265L560 300L650 210L800 160V380H0Z" fill="${C.land}"/><g clip-path="url(#valley)"><rect x="0" y="${y}" width="800" height="380" fill="${C.water}"/>`;
for(let i=0;i<16;i++)s+=line(`M${(i*67+t*12)%800} ${y+15+i%4*19}h22`,'#eaf2e8',2);s+='</g>';
s+=line(`M40 ${y}H760`,C.deep,2)+txt('聚落高地',55,115)+txt('低洼湿地',305,352)+txt('另一片洼地',540,352);
s+=`<path d="M90 144v-24h25v30M84 120l18 -17l20 17" fill="#806e4d"/>`;
return s+txt(q>.55?'涨水：浅洼之间逐渐连通':'退水：水面分开，低地仍可能泥泞',225,55);}
function dike(on,t){let s=base()+`<path d="M0 190Q200 150 380 180T800 190V320Q500 280 0 325Z" fill="${C.water}"/>`;
if(!on)s+=`<path d="M280 190Q440 70 700 100L735 180Q520 205 300 245Z" fill="#77aaa585"/>`;
else{for(let i=0;i<8;i++)s+=`<rect x="${400+i%4*74}" y="${75+Math.floor(i/4)*48}" width="65" height="38" fill="#a4b478" stroke="#e5e9d7"/>`;s+=line('M355 200Q520 160 755 200','#9a784b',13);s+=line('M355 194Q520 154 755 194','#e6d5ae',3);}
for(let i=0;i<9;i++){let x=(t*27+i*100)%800;s+=line(`M${x} ${235+i%3*15}h30`,'#dbe9dd',2);}
return s+txt('来水 →',40,240)+txt(on?'堤内耕作与维护':'洪泛低地',430,52)+txt(on?'堤线限制漫流，水仍须有去路':'涨水时，河道与低地相通',215,350);}
const specs=[{id:'evolution',title:'一片大泽，怎样变成湖群与田地',intro:'依次观察水面、洲地、通道和田地。四幅画表示变化过程，不对应四条已测定的古岸线。',captions:['水面扩展：河流为低地补水','泥沙落淤：洲地在水中生长','通道调整：水面逐渐分割','围垦开发：部分低地转为田地'],draw:map,controls:'<div class="stages">'+['积水','淤浅','分割','围垦'].map((x,i)=>`<button data-stage="${i}" aria-pressed="${i===0}">${x}</button>`).join('')+'</div>'},{id:'season',title:'同一片低地的枯水与涨水',intro:'拖动滑块，看水面如何越过地形门槛。湖水退去以后，道路未必立即变得干燥。',draw:season,controls:'<label class="water-control">较低水位 <input aria-label="示意水位" type="range" min="0" max="100" value="30"> 较高水位</label>'},{id:'dike',title:'一道堤，改变两侧的生活',intro:'比较筑堤前后。示意只展示漫流通道与土地利用的变化，不计算工程减灾效果。',draw:dike,controls:'<button class="dike-toggle" aria-pressed="false">筑堤后的情景</button>'}];
for(const cfg of specs){const root=document.querySelector(`[data-diagram="${cfg.id}"]`);if(!root)continue;root.innerHTML=`<div class="figure-head"><span>动态示意 · ${cfg.id==='evolution'?'01':cfg.id==='season'?'02':'03'}</span><button class="motion">${reduced?'播放动图':'暂停动图'}</button></div><h3>${cfg.title}</h3><p>${cfg.intro}</p><svg viewBox="0 0 800 380" role="img" aria-label="${cfg.title}，机制示意，非地理复原"></svg><div class="diagram-controls">${cfg.controls}</div><p class="diagram-caption" aria-live="polite"></p><small>机制示意 · 无比例尺 · 无古代实测水位 · 可暂停阅读</small>`;
let running=!reduced,stage=0,q=.3,on=false,t=0,last=0,auto=0;const svg=root.querySelector('svg'),cap=root.querySelector('.diagram-caption'),motion=root.querySelector('.motion');
function render(){svg.innerHTML=cfg.draw(cfg.id==='evolution'?stage:cfg.id==='season'?q:on,t);if(cfg.id==='evolution')cap.textContent=cfg.captions[stage];else if(cfg.id==='season')cap.textContent=q>.55?'洼地相通时，水路可能增加，陆路受到限制。':'露滩不等于可立即耕作，支汊也可能断航。';else cap.textContent=on?'田地受堤线保护，也依赖排水和持续维护。':'洪水可以进入低地；实际淹没还取决于地形与来水。';}
motion.onclick=()=>{running=!running;motion.textContent=running?'暂停动图':'播放动图';};
root.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{stage=Number(b.dataset.stage);auto=0;sync();render();});
function sync(){root.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===stage)));}
const slider=root.querySelector('input');if(slider)slider.oninput=()=>{q=Number(slider.value)/100;render();};
const toggle=root.querySelector('.dike-toggle');if(toggle)toggle.onclick=()=>{on=!on;toggle.textContent=on?'回到筑堤前':'筑堤后的情景';toggle.setAttribute('aria-pressed',String(on));render();};
let visible=true;new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(root);
function tick(now){let dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(running&&visible&&!document.hidden){t+=dt;if(cfg.id==='evolution'){auto+=dt;if(auto>5){stage=(stage+1)%4;auto=0;sync();}}render();}requestAnimationFrame(tick);}render();requestAnimationFrame(tick);
}
})();
