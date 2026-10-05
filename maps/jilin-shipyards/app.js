(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const nodes = window.HISTORY_NODES;
  const periods = {
    ming:{years:'永乐至宣德',title:'驶向奴儿干',description:'由吉林附近接入松花江，经黑龙江下行至特林附近。1411年与1432年的大型船队见于永宁寺碑文；两次记载不等于固定的年度航程。',key:'明代远航通道',chapter:2,place:'jilin'},
    qing:{years:'康熙二十二年至二十五年',title:'转向黑龙江上游',description:'船舶沿松花江下行，进入黑龙江后上溯瑷珲、雅克萨方向，服务于驻防和战争。盛京粮源另经水陆转输、伊通河接入松花江，不都先到吉林城。',key:'清初军运通道',chapter:4,place:'albazin'},
    tribute:{years:'清代下游贡赏',title:'三姓与下游诸部',description:'以三姓为重要节点，联系德楞、普禄等下游贡赏地点。虚线只示沿江往来方向，未确定的站点不落精确坐标；库页岛标示参与者居住地区。',key:'贡赏联系（概略）',chapter:5,place:'yilan'}
  };
  let period='ming',selected='jilin',view={x:0,y:0,w:1000,h:780};
  const svg=$('basin-map');
  function selectPlace(id){
    const n=nodes.find(n=>n.id===id);if(!n)return;selected=id;
    $('place-select').value=id;$('place-title').textContent=n.name;$('place-sub').textContent=n.sub;$('place-description').textContent=n.text;
    $('place-sources').replaceChildren(document.createTextNode('依据：'));
    n.refs.forEach(ref=>{const a=document.createElement('a');a.href=`#ref-${ref}`;a.textContent=`[${ref}] `;$('place-sources').append(a)});
    document.querySelectorAll('[data-node]').forEach(el=>el.classList.toggle('selected',el.dataset.node===id));
  }
  function switchPeriod(name){
    period=name;const p=periods[name];$('atlas-panel').dataset.period=name;$('atlas-panel').setAttribute('aria-labelledby',`tab-${name}`);
    document.querySelectorAll('[data-period][role=tab]').forEach(b=>{const yes=b.dataset.period===name;b.setAttribute('aria-selected',yes);b.tabIndex=yes?0:-1});
    document.querySelectorAll('[data-route]').forEach(g=>g.toggleAttribute('hidden',g.dataset.route!==name));
    $('period-years').textContent=p.years;$('period-title').textContent=p.title;$('period-description').textContent=p.description;$('route-key').textContent=p.key;$('period-source').href=`#section-${p.chapter}`;
    document.querySelectorAll('[data-node]').forEach(g=>g.classList.toggle('active',nodes.find(n=>n.id===g.dataset.node).periods.includes(name)));
    selectPlace(p.place);reset();
  }
  document.querySelectorAll('[role=tab]').forEach((b,i,all)=>{
    b.addEventListener('click',()=>switchPeriod(b.dataset.period));
    b.addEventListener('keydown',e=>{let next=null;if(e.key==='ArrowRight')next=(i+1)%all.length;if(e.key==='ArrowLeft')next=(i+all.length-1)%all.length;if(e.key==='Home')next=0;if(e.key==='End')next=all.length-1;if(next!==null){e.preventDefault();all[next].focus();switchPeriod(all[next].dataset.period)}});
  });
  $('place-select').addEventListener('change',e=>selectPlace(e.target.value));
  document.querySelectorAll('[data-node]').forEach(g=>{g.addEventListener('click',()=>selectPlace(g.dataset.node));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPlace(g.dataset.node)}})});
  function drawView(){
    view.x=Math.min(1000-view.w*.35,Math.max(-view.w*.65,view.x));view.y=Math.min(780-view.h*.35,Math.max(-view.h*.65,view.y));
    svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);$('zoom-out').disabled=view.w>=999;$('zoom-in').disabled=view.w<=260;
    const small=matchMedia('(max-width:760px)').matches;
    // Keep labels readable at each zoom level without scaling hit targets to tiny sizes.
    const factor=view.w/1000;svg.querySelectorAll('.map-node text').forEach(t=>t.style.fontSize=`${(small?34:16)*factor}px`);
    svg.querySelectorAll('.map-node .hit-area').forEach(c=>c.setAttribute('r',(small?28:18)*factor));
  }
  function reset(){view={x:0,y:0,w:1000,h:780};drawView()}
  function zoom(factor){const w=Math.min(1000,Math.max(250,view.w*factor)),h=w*.78;view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};drawView()}
  $('zoom-in').addEventListener('click',()=>zoom(.7));$('zoom-out').addEventListener('click',()=>zoom(1/.7));$('zoom-reset').addEventListener('click',reset);
  const points=new Map();let pinch=null,drag=null;
  svg.addEventListener('pointerdown',e=>{
    points.set(e.pointerId,[e.clientX,e.clientY]);
    if(points.size===2){const [a,b]=[...points.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),view:{...view}};svg.style.touchAction='none'}
    if(e.target.closest('[data-node]'))return;
    if(e.pointerType==='mouse'||view.w<999){svg.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...view}};svg.classList.add('dragging');svg.style.touchAction='none'}
  });
  svg.addEventListener('pointermove',e=>{
    if(!points.has(e.pointerId))return;points.set(e.pointerId,[e.clientX,e.clientY]);
    if(pinch&&points.size===2){const [a,b]=[...points.values()],dist=Math.hypot(a[0]-b[0],a[1]-b[1]);const w=Math.max(250,Math.min(1000,pinch.view.w*pinch.distance/dist));view={x:pinch.view.x+(pinch.view.w-w)/2,y:pinch.view.y+(pinch.view.h-w*.78)/2,w,h:w*.78};drawView();return}
    if(drag&&drag.id===e.pointerId){const box=svg.getBoundingClientRect(),k=Math.max(view.w/box.width,view.h/box.height);view.x=drag.view.x-(e.clientX-drag.x)*k;view.y=drag.view.y-(e.clientY-drag.y)*k;drawView()}
  });
  function end(e){points.delete(e.pointerId);if(points.size<2)pinch=null;if(drag?.id===e.pointerId)drag=null;svg.classList.remove('dragging');svg.style.touchAction=view.w<999?'none':'pan-y'}
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>svg.addEventListener(type,end));
  window.addEventListener('resize',drawView);
  $('print-report').addEventListener('click',()=>window.print());
  if(matchMedia('(max-width:760px)').matches)document.querySelector('.contents details').open=false;
  const obs=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('.contents a.current').forEach(a=>a.classList.remove('current'));document.querySelector(`.contents a[href="#${e.target.id}"]`)?.classList.add('current')}},{rootMargin:'-10% 0px -65% 0px'});
  document.querySelectorAll('.prose h2').forEach(h=>obs.observe(h));
  switchPeriod('ming');
})();
