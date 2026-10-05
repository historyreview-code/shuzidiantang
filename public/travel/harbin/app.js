import {planAdvice} from './season-rules.js';
import city from './city-pack.js';
import {foodIllustration} from './food.js';
import {createAmbience} from './ambience.js';
import {miniature,glyph,mapArtwork} from './icons.js';
import {summarize,optimize,sanitizeState,encodePlan,decodePlan,exportText as exportBase,duration,timeRange} from './planner.js';

function exportText(value){return exportBase(value)+'\n所选季节：'+city.seasons[value.season].name+'\n'+value.days.map((d,i)=>{const notes=planAdvice(city,d.ids,value.season);return notes.length?`第 ${i+1} 天提示：\n${notes.join('\n')}`:'';}).filter(Boolean).join('\n');}

const $=s=>document.querySelector(s);
const {places,routes,kinds,seasons,sources:SOURCES,foods=[],stories={}}=city;
const foodById=Object.fromEntries(foods.map(f=>[f.id,f]));
let foodFilter='all';
const byId=Object.fromEntries(places.map(p=>[p.id,p]));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storyMetrics=story=>{const text=[...(story.paragraphs||[]),story.voice?.text||'',story.planning||''].join('');return {minutes:Math.max(2,Math.ceil(text.length/280)),characters:Math.round(text.length/50)*50};};
const storyTime=story=>`约 ${storyMetrics(story).minutes} 分钟阅读`;
const storageKey=`city-wander:${city.id}:v1`;
const initial={version:1,city:city.id,days:[{ids:routes[0]?.ids.slice()||[],budget:480,pause:60,foodIds:[]}],active:0,saved:[],season:city.defaultSeason};
let state=structuredClone(initial),undoStack=[],filter='all',search='',editing=false,detailId=null,toastTimer;
let storageAvailable=true;
try {const saved=sanitizeState(JSON.parse(localStorage.getItem(storageKey)));if(saved)state=saved;}catch{storageAvailable=false;}
const hash=new URLSearchParams(location.hash.slice(1)).get('plan');
let incoming=hash?decodePlan(hash):null;
let camera={x:0,y:0,scale:.6},drag=null,wasDragged=false;
const viewport=$('#map-viewport'),world=$('#map-world');

document.querySelectorAll('[data-icon]').forEach(node=>node.innerHTML=glyph(node.dataset.icon));
document.title=`${city.brand} · ${city.name}，${city.ui.hero}`;
$('.brand-stamp').textContent=city.ui.stamp;$('.brand strong').textContent=city.brand;
$('.brand small').textContent=`${city.en}, AT YOUR PACE`;
$('.brand').setAttribute('aria-label',`${city.brand}首页`);
$('.intro h1').innerHTML=`${esc(city.name)}，<em>${esc(city.ui.hero)}</em>`;
$('.intro-copy').textContent=city.intro;
$('.picker-label').textContent=`你想遇见的${city.name}`;
$('#city-switch').textContent=city.name+' ⌄';
$('.discovery h2').innerHTML=`发现${esc(city.name)} <span id="place-count"></span>`;
$('#stories-section').hidden=!Object.keys(stories).length;
$('.discovery-foot span:last-child').textContent=Object.keys(stories).length?`${Object.keys(stories).length} 篇体验贴 · 打开景点即可阅读`:city.ui.discovery;
$('#story-cards').innerHTML=places.filter(p=>stories[p.id]).filter(p=>(city.ui.featuredStories||places.slice(0,3).map(p=>p.id)).includes(p.id)).map(p=>`<button class="story-card" data-story="${p.id}">${miniature(p.icon)}<span><small>${esc(p.name)} · ${storyTime(stories[p.id])}</small><strong>${esc(stories[p.id].title)}</strong></span>${glyph('arrow')}</button>`).join('');
$('#all-stories').textContent=`全部 ${Object.keys(stories).length} 篇体验贴 ${'↗'}`;
$('.map-kicker').textContent=`${city.name}漫游图`;
$('.map-subtitle').textContent=`${city.en} WANDER MAP`;
$('.map-section').setAttribute('aria-label',`${city.name}抽象漫游地图`);
$('.wander-footer>span:first-child').textContent=`${city.brand} · ${city.subtitle}`;
$('.wander-footer time').textContent=city.checkedAt.replaceAll('-','.');$('.wander-footer time').dateTime=city.checkedAt;
world.style.width=`${city.map.width}px`;world.style.height=`${city.map.height}px`;
$('#route-layer').setAttribute('viewBox',`0 0 ${city.map.width} ${city.map.height}`);
$('#artwork').innerHTML=mapArtwork(city.map);
$('#map-pins').innerHTML=places.map(p=>`<button class="map-pin" data-place="${p.id}" style="left:${p.x}px;top:${p.y}px" aria-label="${esc(p.name)}，查看介绍">${miniature(p.icon)}<span class="pin-name"><span class="pin-full-name">${esc(p.mapName||p.name)}</span><span class="pin-overview-name">${esc(p.overviewName||p.mapName||p.name)}</span></span><span class="pin-number" hidden></span></button>`).join('')+city.map.anchors.map(a=>`<div class="map-pin map-anchor" style="left:${a.x}px;top:${a.y}px">${miniature(a.icon)}<span class="pin-name">${esc(a.label)}</span></div>`).join('');
function renderRoutes(){const available=routes.filter(r=>!r.seasons||r.seasons.includes(state.season));$('#route-cards').innerHTML=available.map(r=>`<button class="route-card" data-route="${r.id}" aria-label="查看路线：${esc(r.title)}">${miniature(r.icon)}<span><strong>${esc(r.title)}</strong><small>${esc(r.mood)} · ${r.ids.length} 处停留</small></span>${glyph('arrow')}</button>`).join('');$('#season-route-note').textContent=`${seasons[state.season].name} · 推荐 ${available.length} 条路线，切换季节保留已有计划。`;}

function persist() {try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{if(storageAvailable)toast('浏览器无法保存，本次行程仍可导出或分享。');storageAvailable=false;}}
function mutate(fn,message) {undoStack.push(structuredClone(state));if(undoStack.length>25)undoStack.shift();fn();persist();render();if(message)toast(message);}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function activeDay(){return state.days[state.active];}
function matches(p){return (filter==='all'||(filter==='saved'?state.saved.includes(p.id):p.kind===filter))&&(!search||[p.name,p.localName,p.en,p.area,...p.tags].join(' ').toLowerCase().includes(search.toLowerCase()));}

function render(){
  document.documentElement.style.setProperty('--leaf',seasons[state.season].color);
  document.body.dataset.season=state.season;
  $('#seasons').innerHTML=Object.entries(seasons).map(([key,s])=>`<button data-season="${key}" aria-pressed="${key===state.season}">${s.name}</button>`).join('');
  $('#season-caption').textContent=seasons[state.season].caption;
  $('#map-tag-text').textContent=seasons[state.season].line;
  $('#filters').innerHTML=Object.entries(kinds).filter(([id])=>id!=='saved').map(([id,name])=>`<button data-filter="${id}" aria-pressed="${filter===id}">${glyph(id==='temple'?'map':id==='street'?'list':id==='nature'?'leaf':'spark')}${name}</button>`).join('');
  const found=places.filter(matches);
  $('#place-count').textContent=found.length;
  $('#saved-count').textContent=state.saved.length;
  $('#saved-filter').setAttribute('aria-pressed',String(filter==='saved'));
  $('#results-caption').textContent=filter==='saved'?'想再遇见的地方':search?`找到 ${found.length} 处风景`:'所有值得停留的地方';
  $('#place-list').innerHTML=found.map(p=>`<button class="place-row" data-place="${p.id}" aria-label="${esc(p.name)}，${esc(p.tags.join('、'))}">${miniature(p.icon)}<span class="place-info"><strong>${esc(p.name)}</strong><small>${esc(p.tags.join(' · '))}${p.seasonRestriction&&!p.seasons.includes(state.season)?' · 季节待核对':''}</small></span>${activeDay().ids.includes(p.id)?'<span class="place-added" aria-label="已在当天行程">✓</span>':''}</button>`).join('')||`<div class="empty-results">${filter==='saved'?'还没有收藏的风景。<br>打开景点，点一下爱心。':'这里暂时没有匹配的风景。<br>试试“江岸”或清除搜索。'}</div>`;
  renderPlan();renderMap();renderFoods();renderRoutes();
  $('#undo').disabled=!undoStack.length;
  $('#add-day').disabled=state.days.length>=5;
  if(detailId&&$('#detail-dialog').open)renderDetail(detailId);
}

function renderPlan(){
  const day=activeDay(),s=summarize(day.ids,day.budget,day.pause);
  const advice=planAdvice(city,day.ids,state.season);
  $('#season-advice').hidden=!advice.length;
  $('#season-advice').innerHTML=advice.map(note=>`<p>${esc(note)}</p>`).join('');
  $('#plan-stops').classList.toggle('is-editing',editing);
  const route=routes.find(r=>JSON.stringify(r.ids)===JSON.stringify(day.ids));
  $('#day-tabs').innerHTML=state.days.map((d,i)=>`<button data-day="${i}" aria-pressed="${i===state.active}" aria-label="第 ${i+1} 天，${d.ids.length} 处停留">Day ${i+1}</button>`).join('');
  $('#budget').value=day.budget;$('#pause').value=day.pause;
  $('#plan-name').textContent=route?route.title:day.ids.length?city.ui.defaultPlan:city.ui.emptyPlan;
  renderDayFoods();
  $('#plan-caption').textContent=day.ids.length?`${day.ids.length} 处停留 · 一段属于你的${city.name}`:'从一处喜欢的风景开始吧';
  $('#mobile-count').textContent=state.days.reduce((sum,d)=>sum+d.ids.length,0);
  $('#plan-stops').innerHTML=day.ids.map((id,i)=>{const p=byId[id],leg=s.legs[i];return `<div class="plan-stop"><span class="stop-index">${i+1}</span><button class="stop-open" data-place="${id}" aria-label="查看${esc(p.name)}">${miniature(p.icon)}<span><strong>${esc(p.name)}</strong><small>游览预留 ${p.minutes} 分钟</small></span></button><div class="stop-actions">${stories[id]?`<button data-story="${id}" aria-label="读${esc(p.name)}体验贴">${glyph('book')}</button>`:''}${editing?`<button data-move="${id}" data-direction="-1" aria-label="上移${esc(p.name)}" ${i===0?'disabled':''}>${glyph('up')}</button><button data-move="${id}" data-direction="1" aria-label="下移${esc(p.name)}" ${i===day.ids.length-1?'disabled':''}>${glyph('down')}</button>`:''}<button data-remove="${id}" aria-label="从当天移除${esc(p.name)}">${glyph('close')}</button></div></div>${leg?`<div class="transfer-note">${leg.mode}预留 ${leg.min}–${leg.max} 分钟</div>`:''}`;}).join('')||`<div class="empty-plan">${miniature('path')}选几处风景，把这一天串起来。<br>也可以从下方的主题路线开始。</div>`;
  $('#edit-order').textContent=editing?'完成编辑':'编辑顺序';
  $('#edit-order').disabled=!day.ids.length;$('#optimize').disabled=day.ids.length<3;$('#clear-day').disabled=!day.ids.length;
  $('#pause-copy').textContent=`${day.pause} 分钟，留给用餐、喝茶和临时发现。`;
  $('#plan-duration').innerHTML=day.ids.length?`${(s.min/60).toFixed(1)}–${(s.max/60).toFixed(1)} <small>小时</small>`:'等你出发';
  const denominator=Math.max(s.budget,s.max,1);
  $('#time-bar').innerHTML=day.ids.length?`<i class="visit" style="width:${s.visit/denominator*100}%"></i><i class="travel" style="width:${s.maxTransfer/denominator*100}%"></i><i class="pause" style="width:${s.pause/denominator*100}%"></i>`:'';
  const assessment=$('#plan-assessment');assessment.classList.toggle('over',s.overflow>0);
  assessment.textContent=!day.ids.length?'把喜欢的地方加进来，再看时间是否刚刚好。':s.overflow?`超出预算约 ${s.overflow} 分钟。可以移到另一天，或增加当天时长。`:s.cross?`有 ${s.cross} 段较远的跨区移动，交通请另行确认。`:`按较宽的预留，仍有 ${s.remaining} 分钟余量。${s.effort>=9?'含较多坡道或步行。':''}`;
}


function nearby(f){return f.near.filter(id=>activeDay().ids.includes(id));}
function renderFoods(){
  $('#food-section').hidden=!foods.length;
  const list=foods.filter(f=>foodFilter!=='near'||nearby(f).length).sort((a,b)=>Number(!!nearby(b).length)-Number(!!nearby(a).length));
  $('#food-caption').textContent=`Day ${state.active+1} · ${foods.filter(f=>nearby(f).length).length} 种滋味可结合当天景点考虑`;
  document.querySelectorAll('[data-food-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.foodFilter===foodFilter)));
  $('#food-cards').innerHTML=list.map(f=>{const near=nearby(f),added=(activeDay().foodIds||[]).includes(f.id);return `<article class="food-card"><button class="food-open" data-food="${f.id}" aria-label="了解${esc(f.name)}"><div class="food-picture">${foodIllustration(f.icon)}<span>${near.length?'当天可搭配':esc(f.kind)}</span></div><div class="food-card-body"><small>${esc(f.area)}</small><h3>${esc(f.dish)}</h3><p>${esc(f.name)}</p><span class="food-near">${near.length?`结合${esc(byId[near[0]].mapName||byId[near[0]].name)}片区选店 ↗`:'查看餐食与用餐建议 ↗'}</span></div></button><button class="food-save" data-food-toggle="${f.id}" aria-pressed="${added}" aria-label="${added?'移除':'收进'}${esc(f.name)}餐食备选">${glyph(added?'check':'plus')}${added?`已在 Day ${state.active+1} 餐单`:`收进 Day ${state.active+1} 餐单`}</button></article>`;}).join('')||'<p class="food-empty">当天景点附近暂没有收录餐食方向。切换“全部滋味”看看，或先把景点加入行程。</p>';
}
function renderDayFoods(){const selected=(activeDay().foodIds||[]).map(id=>foodById[id]).filter(Boolean);const total=selected.reduce((sum,f)=>sum+f.reserve,0);$('#day-foods').innerHTML=`<div class="day-food-heading"><strong>${glyph('tea')}当天餐食备选</strong><a href="#food-section">去寻味 ↗</a></div>${selected.length?selected.map(f=>`<div class="day-food-row"><button data-food="${f.id}">${esc(f.dish)}<small>${esc(f.name)}</small></button><button data-food-toggle="${f.id}" aria-label="移除${esc(f.name)}餐食备选">${glyph('close')}</button></div>`).join(''):'<p>留一餐，给路上的好滋味。</p>'}${selected.length?`<p class="food-reserve-note">全部选吃约 ${total} 分钟，${total>activeDay().pause?`比留白多 ${total-activeDay().pause} 分钟，可增加留白或择一。`:'可放入当天留白。'}排队与绕行另留；备选未自动排入景点时间。</p>`:''}`;}
function showFood(id){const f=foodById[id],added=(activeDay().foodIds||[]).includes(id);showUtility(f.dish,`<div class="food-detail-art">${foodIllustration(f.icon)}<p>${esc(f.area)} / ${esc(f.kind)}</p></div><div class="utility-body"><h3>${esc(f.name)}</h3><p class="food-local">${esc(f.localName)}</p><p>${esc(f.description)}</p><div class="observation"><small>顺路安排的小建议</small><p>${esc(f.tip)}</p></div><p>编辑建议：用餐预留 ${f.reserve} 分钟，不含排队与绕行。营业、价格和预约请在出发前确认；过敏或饮食限制请向店铺说明。</p><p><a href="${f.source}" target="_blank" rel="noopener noreferrer">${esc(f.sourceLabel)} ↗</a> · 核验 ${f.checkedAt}</p><div class="detail-actions"><button class="button primary" data-food-toggle="${id}" aria-pressed="${added}">${glyph(added?'check':'plus')}${added?'移出当天餐单':`收进 Day ${state.active+1} 餐单`}</button><a class="button" href="https://uri.amap.com/search?keyword=${encodeURIComponent(f.searchQuery||f.dish)}&city=${encodeURIComponent(city.name)}" target="_blank" rel="noopener noreferrer">实际地图 ↗</a></div></div>`);}

const music=createAmbience(({enabled,state:audioState,level})=>{const b=$('#music-toggle');b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',enabled?'关闭配乐':'开启配乐');b.dataset.audioState=audioState;b.dataset.level=level.toFixed(5);b.style.setProperty('--sound-level',String(Math.min(1,level*40)));$('#music-label').textContent=enabled?(audioState==='running'?'江上暖灯 · 正在播放':'配乐已暂停 · 点按关闭'):'听一段漫游配乐';$('.volume-control').hidden=!enabled;});
$('#music-toggle').onclick=async()=>{try{await music.toggle();}catch{toast('这个浏览器暂时无法播放配乐，可以继续安静漫游。');}};
$('#music-volume').oninput=e=>music.setVolume(Number(e.target.value)/100);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motion=!reducedMotion.matches;
try{if(localStorage.getItem(`${city.id}:motion`)==='off')motion=false;}catch{}
function updateMotion(){const active=motion&&!reducedMotion.matches;document.body.classList.toggle('motion-off',!active);$('#motion-toggle').textContent=active?'动效开启':'静态漫游';$('#motion-toggle').setAttribute('aria-pressed',String(active));}
$('#motion-toggle').onclick=()=>{if(reducedMotion.matches){toast('已跟随系统的“减少动态效果”设置。');return;}motion=!motion;try{localStorage.setItem(`${city.id}:motion`,motion?'on':'off');}catch{}updateMotion();};
reducedMotion.addEventListener('change',updateMotion);updateMotion();
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-hidden',document.hidden));

function renderMap(){
  const ids=activeDay().ids;
  document.querySelectorAll('.map-pin[data-place]').forEach(pin=>{const id=pin.dataset.place,i=ids.indexOf(id);pin.hidden=!matches(byId[id]);pin.classList.toggle('selected',i>=0);pin.classList.toggle('saved',state.saved.includes(id));const n=pin.querySelector('.pin-number');n.hidden=i<0;n.textContent=i+1;});
  const points=ids.map(id=>byId[id]);
  $('#route-layer').innerHTML=points.length>1&&points.every(matches)?`<path class="route-path" d="${points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y-6}`).join(' ')}"/>`:'';
}

function renderDetail(id){
  const p=byId[id],added=activeDay().ids.includes(id),saved=state.saved.includes(id),inOther=state.days.flatMap((d,i)=>i!==state.active&&d.ids.includes(id)?[i+1]:[]);
  $('#detail-content').innerHTML=`<div class="dialog-head"><p class="eyebrow" style="margin:0">A PLACE TO PAUSE</p><button class="dialog-close" data-close="detail" aria-label="关闭景点介绍">${glyph('close')}</button></div><div class="detail-hero"><span class="detail-area">${esc(p.area)}</span>${miniature(p.icon)}<button class="detail-heart" data-save="${id}" aria-pressed="${saved}" aria-label="${saved?'取消收藏':'收藏'}${esc(p.name)}">${glyph('heart')}</button></div><div class="detail-body"><div class="detail-title-row"><div><h2 id="detail-title">${esc(p.name)}</h2><span class="jp">${esc(p.en)}</span></div><div class="detail-tags">${p.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><h3 class="detail-subtitle">${esc(p.subtitle)}</h3><p class="detail-description">${esc(p.description)}</p>${stories[id]?`<button class="story-invite" data-story="${id}">${glyph('book')}<span><small>景物细读 · 有来源的漫游手记 · ${storyTime(stories[id])}</small><strong>${esc(stories[id].title)}</strong></span>${glyph('arrow')}</button>`:''}<div class="observation"><small>带着这个小问题，去看看</small><p>${esc(p.prompt)}</p></div><div class="detail-facts"><div><small>游览预留 · 编辑建议</small><strong>${duration(p.minutes)}</strong></div><div><small>步行与地形</small><strong>${p.effort===3?'有上坡 / 山路 / 台阶':p.effort===2?'含较多步行或台阶':'较轻松，具体路况另查'}</strong></div></div><p class="detail-tip">${esc(p.tip)}</p>${p.seasonRestriction?`<p class="detail-season-note">${esc(p.seasonRestriction)}当前选择：${esc(seasons[state.season].name)}。</p>`:''}<p class="detail-source">${esc(p.access)}<br><a href="${p.source}" target="_blank" rel="noopener noreferrer">${esc(p.sourceLabel)} ↗</a>${p.manners?` · <a href="${p.manners}" target="_blank" rel="noopener noreferrer">当地礼仪 ↗</a>`:''} · 核验 ${city.checkedAt}${inOther.length?`<br>也在第 ${inOther.join('、')} 天；加入当前天会保留其他天安排。`:''}</p><div class="detail-actions"><button class="button primary" data-add="${id}" ${added?'disabled':''}>${glyph(added?'check':'plus')}${added?`已在 Day ${state.active+1}`:`加入 Day ${state.active+1}`}</button><a class="button" href="https://uri.amap.com/search?keyword=${encodeURIComponent(p.navigationName||p.localName)}&city=${encodeURIComponent(city.name)}" target="_blank" rel="noopener noreferrer">${glyph('map')}实际地图 ↗</a></div></div>`;
}
function showDetail(id){detailId=id;renderDetail(id);$('#detail-dialog').showModal();}
function showUtility(title,body){$('#utility-content').innerHTML=`<div class="dialog-head"><h2 id="utility-title">${esc(title)}</h2><button class="dialog-close" data-close="utility" aria-label="关闭窗口">${glyph('close')}</button></div>${body}`;$('#utility-dialog').showModal();}

function showStory(id){
  const p=byId[id],story=stories[id];if(!p||!story)return;
  const added=activeDay().ids.includes(id),references=story.references||[];
  const referenceLink=n=>{const ref=references[n-1];return ref?`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer" aria-label="参考 ${n}：${esc(ref.title)}">[${n}] ↗</a>`:'';};
  const sections=story.sections||[{paragraphs:story.paragraphs}];
  const voiceSource=references[(story.voice?.source||0)-1];
  const prose=sections.map((section,i)=>`<section class="story-chapter" id="story-chapter-${i}">${section.title?`<h3><span>${String(i+1).padStart(2,'0')}</span>${esc(section.title)}</h3>`:''}${section.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}${section.refs?.length?`<div class="story-cites">本节资料 ${section.refs.map(referenceLink).join(' ')}</div>`:''}</section>`).join('');
  const voice=story.voice&&voiceSource?`<aside class="story-voice" id="story-voices"><p class="eyebrow">FROM A TRAVELER / 具名游记转述</p><h3>游记里的真实感受</h3><p>${esc(story.voice.text)}</p><a class="story-byline" href="${esc(voiceSource.url)}" target="_blank" rel="noopener noreferrer">${esc(voiceSource.author)} · 阅读原文 ↗</a><small>${esc(voiceSource.published)} · 上述为中文概述，非逐字引语</small></aside>`:'';
  const referenceList=references.length?`<details class="story-references"><summary>研读来源 · ${references.length} 份资料</summary><p>官方资料核对景物与背景；游记只代表作者当次体验。整理于 ${esc(references[0].checkedAt)}。</p><ol>${references.map((ref,i)=>`<li><span class="story-source-kind">${ref.kind==='official'?'官方资料':'亲历游记'}</span><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">[${i+1}] ${esc(ref.title)} ↗</a><small>${esc(ref.author)} · ${esc(ref.published)}</small><p>${esc(ref.support)}</p></li>`).join('')}</ol></details>`:`<p class="story-source">事实参考：<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">${esc(p.sourceLabel)} ↗</a></p>`;
  showUtility(story.title,`<article class="story-article"><button class="story-back" data-story-library="true">← 全部手记</button><div class="story-masthead">${miniature(p.icon)}<div><p class="eyebrow">${esc(city.brand)} · 漫游手记</p><strong>${esc(p.name)}</strong><small>${esc(p.area)} / ${storyTime(story)} · 约 ${storyMetrics(story).characters} 字</small></div></div>${story.deck?`<p class="story-deck">${esc(story.deck)}</p>`:''}<p class="story-disclosure">正文为第一人称情境创作；“游记里的真实感受”转述公开游记并标明作者。均不冒充本产品作者亲历。</p><nav class="story-nav" aria-label="文章快速跳转"><button data-story-jump="story-chapter-0">走进景点</button>${voice?'<button data-story-jump="story-voices">游客感受</button>':''}<button data-story-jump="story-planning">怎么安排</button></nav><div class="story-prose">${prose}</div>${voice}<aside class="story-planning" id="story-planning"><h3>${glyph('clock')}如果把这里排进一天</h3><p>${esc(story.planning)}</p><small>以上为编辑建议，不会自动修改计划中的预留。交通、排队与临时开放另查。</small></aside>${referenceList}<div class="story-actions"><button class="button" data-close="utility">收起手记</button><button class="button primary" data-add="${id}" ${added?'disabled':''}>${glyph(added?'check':'plus')}${added?`已在 Day ${state.active+1}`:`加入 Day ${state.active+1}`}</button></div></article>`);
  $('#utility-dialog').scrollTop=0;
}
function showStoryLibrary(){showUtility('在出发之前，先走一遍',`<div class="utility-body"><p class="story-library-intro">${Object.keys(stories).length} 篇漫游手记，细看建筑、街巷与地形；部分篇目附具名游客的观察。每篇约 2–4 分钟，读完即可加入计划。</p><p class="story-disclosure">第一人称正文是情境创作；具名游记的感受另列，附原文与官方资料。</p><div class="story-library">${places.filter(p=>stories[p.id]).map(p=>`<button class="story-card" data-story="${p.id}">${miniature(p.icon)}<span><small>${esc(p.name)} · ${storyTime(stories[p.id])}</small><strong>${esc(stories[p.id].title)}</strong>${stories[p.id].deck?`<span class="story-card-deck">${esc(stories[p.id].deck)}</span>`:''}</span>${glyph('arrow')}</button>`).join('')}</div></div>`);$('#utility-dialog').scrollTop=0;}
$('#all-stories').onclick=showStoryLibrary;

function showGuide(){showUtility(city.ui.guideTitle,`<div class="utility-body"><h3>先看方位，再选一段路</h3><p>河流、山地与主干道路帮助你记住城市。“全屏”展开到浏览器可用画面，“总览”显示全城；道路可切换显示。地图保留主要分区与大致方向，景点位置为排版示意，图上的连线表达行程顺序；出行请在景点卡片中打开实际地图。</p><h3>把一天拆成三种时间</h3><p>游览、转场、留白。游览时长与转场范围是编辑性规划预留，未接入实时公交、步行路网或客流。留白包含用餐、休息和临时发现，住处到首站及末站返程需要另外安排。</p><h3>让计划保留一点弹性</h3><p>可建立最多五天的行程，在卡片中加入景点，用“编辑顺序”调整，或用“减少折返”比较转场预留。排序保留首站与全部已选景点；长途跨区并不会因此消失。</p><h3>好好旅行，也好好相处</h3><p>${esc(city.ui.etiquette)}</p><p><a href="${SOURCES.manners}" target="_blank" rel="noopener noreferrer">${esc(city.name)}官方旅游指南 ↗</a>　<a href="${SOURCES.crowd}" target="_blank" rel="noopener noreferrer">查看冰雪大世界当季信息 ↗</a></p><h3>收好计划，再出发</h3><p>行程自动保存在本浏览器。分享链接携带行程与季节选择，收藏不会被分享；导出文本可离线查看。开放、门票、预约及季节状态请出发前通过景点官方链接再确认。</p></div>`);}
function showSources(){showUtility('来源与规划说明',`<div class="utility-body"><p>${esc(city.sourceNote)}资料核验日期：${city.checkedAt}。观察问题、季节灵感、游览时长和转场范围为本产品的编辑建议。</p><p>地图是一张方位示意插画。没有按图距计算真实公里数，没有把季节选择解释为实时花况，主题推荐也不等于实时客流保证。</p><p>漫游手记的第一人称正文为情境创作；“游记里的真实感受”是公开游记的具名转述，每篇附原文、日期与用途，不能视为当天花况、客流或展单。道路保留大致方位与街序，不能用于转弯导航。<a href="${SOURCES.roads}" target="_blank" rel="noopener noreferrer">黑龙江文旅 · 城市交通与景点 ↗</a></p><div class="source-list">${[...places,...foods].map(p=>`<a href="${p.source}" target="_blank" rel="noopener noreferrer">${esc(p.name)} · ${esc(p.sourceLabel)} ↗</a>`).join('')}</div><h3>通用城市漫游方法</h3><p>空间骨架 → 游览片区 → 城市体验 → 缩微标识 → 时间预算 → 可解释路线。城市资料与地图坐标独立于规划引擎，下一座城市可以替换数据包、地图骨架与地标插画。</p></div>`);}

function showRoute(id){
  const r=routes.find(r=>r.id===id),s=summarize(r.ids,activeDay().budget,activeDay().pause);
  showUtility(r.title,`<div class="route-dialog-icon">${miniature(r.icon)}</div><div class="utility-body"><p class="eyebrow">${esc(r.mood)} / ${r.ids.length} PLACES</p><h3>${esc(r.subtitle)}</h3><p>${esc(r.reason)}</p><div class="route-preview-line">${r.ids.map((id,i)=>`${i?'<i>→</i>':''}<span>${esc(byId[id].name)}</span>`).join('')}</div><p>${esc(r.pause)}</p><p>包含 ${s.pause} 分钟留白，合计预留约 ${timeRange(s.min,s.max)}。${s.overflow?`超出当前时长 ${s.overflow} 分钟，采用后请调整预算或景点。`:''}</p><button class="button primary full" data-apply-route="${r.id}">${glyph('check')}用作 Day ${state.active+1} 的行程</button><p class="estimate-note">替换当前天的安排 · 可以撤销 · 其他天保留</p></div>`);
}

function showShare(){
  const link=`${location.origin}${location.pathname}#plan=${encodeURIComponent(encodePlan(state))}`;
  showUtility(`收好一段${city.name}时光`,`<div class="utility-body"><div class="share-preview"><p class="eyebrow">${city.en} / YOUR WANDER NOTES</p><h3>${city.name} · ${state.days.length} 天漫游计划</h3>${state.days.map((d,i)=>{const s=summarize(d.ids,d.budget,d.pause);return `<div class="share-day"><strong>Day ${i+1} · ${s.ids.length?timeRange(s.min,s.max):'尚未安排'}</strong>${d.ids.map(id=>esc(byId[id].name)).join(' → ')||'给这一天留一个起点'}${d.foodIds?.length?`<p>餐食备选：${d.foodIds.map(id=>esc(foodById[id].name)).join(' / ')}</p>`:''}<br><small>留白 ${d.pause} 分钟 / 预算 ${duration(d.budget)}${s.overflow?` / 超出 ${s.overflow} 分钟`:''}</small></div>`;}).join('')}</div><p>链接包含景点、餐食备选和季节选择，不包含你的收藏。在同一可访问地址打开链接即可导入；${['127.0.0.1','localhost'].includes(location.hostname)?'当前为本机预览，跨设备分享请使用线上地址。':'也可以复制到手机浏览器，继续规划。'}</p><textarea id="share-link" class="link-field" rows="2" aria-label="行程分享链接" readonly>${esc(link)}</textarea><div class="share-buttons"><button class="button primary" id="copy-link">${glyph('share')}复制链接</button><button class="button" id="export-text">${glyph('download')}导出文本</button><button class="button" id="print-button">${glyph('list')}打印计划</button></div><p class="estimate-note">出发前确认交通、开放和预约 · 计划不是导航</p></div>`);
}

function clampCamera(){const w=viewport.clientWidth,h=viewport.clientHeight,ww=city.map.width*camera.scale,hh=city.map.height*camera.scale;camera.x=ww<w?(w-ww)/2:Math.max(w-ww,Math.min(0,camera.x));camera.y=hh<h?(h-hh)/2:Math.max(h-hh,Math.min(0,camera.y));}
function paintCamera(){clampCamera();world.style.setProperty('--map-scale',camera.scale);world.classList.toggle('map-overview',camera.scale<.5);world.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;}
function fitMap(overview=false){const fit=Math.min(viewport.clientWidth/city.map.width,viewport.clientHeight/city.map.height);camera.scale=overview?fit:Math.max(fit,matchMedia('(max-width:760px)').matches?.68:fit);camera.x=(viewport.clientWidth-city.map.width*camera.scale)/2;camera.y=(viewport.clientHeight-city.map.height*camera.scale)/2;if(!overview&&matchMedia('(max-width:760px)').matches&&city.map.focus){camera.x=viewport.clientWidth/2-city.map.focus.x*camera.scale;camera.y=viewport.clientHeight/2-city.map.focus.y*camera.scale;}paintCamera();}
function zoom(factor){const w=viewport.clientWidth/2,h=viewport.clientHeight/2,old=camera.scale;camera.scale=Math.min(1.8,Math.max(.28,old*factor));camera.x=w-(w-camera.x)*(camera.scale/old);camera.y=h-(h-camera.y)*(camera.scale/old);paintCamera();}
viewport.addEventListener('pointerdown',event=>{if(event.target.closest('.zoom-controls'))return;if(!event.isPrimary)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:camera.x,startY:camera.y,moved:false};wasDragged=false;});
viewport.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>7){drag.moved=true;wasDragged=true;viewport.classList.add('dragging');viewport.setPointerCapture(event.pointerId);}if(drag.moved){camera.x=drag.startX+dx;camera.y=drag.startY+dy;paintCamera();}});
function endDrag(){drag=null;viewport.classList.remove('dragging');setTimeout(()=>wasDragged=false,40);}
viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
viewport.addEventListener('keydown',event=>{if(event.target!==viewport)return;const arrows={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]};if(arrows[event.key]){event.preventDefault();camera.x+=arrows[event.key][0];camera.y+=arrows[event.key][1];paintCamera();}else if(event.key==='+'||event.key==='='){event.preventDefault();zoom(1.2);}else if(event.key==='-'){event.preventDefault();zoom(1/1.2);}});
$('#zoom-in').onclick=()=>zoom(1.2);$('#zoom-out').onclick=()=>zoom(1/1.2);$('#zoom-fit').onclick=()=>fitMap(true);
const mapSection=$('#map-section'),mapDialog=$('#map-dialog'),mapHome=document.createComment('map home');
mapSection.before(mapHome);
let compactCamera=null,compactScroll=0;
function setMapExpanded(expanded){
  const b=$('#map-fullscreen');b.setAttribute('aria-expanded',String(expanded));
  b.innerHTML=glyph(expanded?'close':'fit')+`<span>${expanded?'退出全屏':'全屏'}</span>`;
}
$('#map-fullscreen').onclick=()=>{
  if(mapDialog.open){mapDialog.close();return;}
  compactCamera={...camera};compactScroll=window.scrollY;
  mapDialog.append(mapSection);document.body.classList.add('map-expanded');setMapExpanded(true);
  mapDialog.showModal();fitMap();$('#map-fullscreen').focus({preventScroll:true});
};
mapDialog.addEventListener('close',()=>{
  mapHome.after(mapSection);document.body.classList.remove('map-expanded');setMapExpanded(false);
  if(compactCamera){camera={...compactCamera};compactCamera=null;}paintCamera();
  window.scrollTo({top:compactScroll,behavior:'instant'});$('#map-fullscreen').focus({preventScroll:true});
});
$('#road-toggle').onclick=()=>{const b=$('#road-toggle'),visible=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(visible));world.classList.toggle('roads-hidden',!visible);};
let lastWidth=viewport.clientWidth;
window.addEventListener('resize',()=>{if(viewport.clientWidth!==lastWidth){lastWidth=viewport.clientWidth;fitMap();}else paintCamera();});

document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  const d=button.dataset;
  if(d.storyJump){const target=$('#'+d.storyJump);const dialog=$('#utility-dialog');if(target){dialog.scrollTo({top:Math.max(0,dialog.scrollTop+target.getBoundingClientRect().top-dialog.getBoundingClientRect().top-(dialog.querySelector('.dialog-head')?.offsetHeight||100)-16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}return;}
  if(d.storyLibrary){showStoryLibrary();}
  else if(d.story){showStory(d.story);}
  else if(d.food){showFood(d.food);}
  else if(d.foodFilter){foodFilter=d.foodFilter;renderFoods();}
  else if(d.foodToggle){const id=d.foodToggle;mutate(()=>{const ids=activeDay().foodIds||[];activeDay().foodIds=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];},'已更新当天餐食备选。');if($('#utility-dialog').open&&$('#utility-content [data-food-toggle]'))showFood(id);}
  else if(d.place){if(button.classList.contains('map-pin')&&wasDragged)return;showDetail(d.place);}
  else if(d.filter){filter=d.filter;render();}
  else if(d.season){state.season=d.season;persist();render();}
  else if(d.day){state.active=Number(d.day);editing=false;persist();render();}
  else if(d.close){$('#'+d.close+'-dialog').close();if(d.close==='detail')detailId=null;}
  else if(d.save){const id=d.save;mutate(()=>{state.saved=state.saved.includes(id)?state.saved.filter(p=>p!==id):[...state.saved,id];},state.saved.includes(id)?'已取消收藏':'已收藏这处风景');}
  else if(d.add){mutate(()=>{if(!activeDay().ids.includes(d.add))activeDay().ids.push(d.add);},`已加入 Day ${state.active+1}`);if(button.closest('.story-article')){button.disabled=true;button.innerHTML=glyph('check')+`已在 Day ${state.active+1}`;}}
  else if(d.remove){mutate(()=>activeDay().ids=activeDay().ids.filter(id=>id!==d.remove),'已从当天移除，随时可以撤销。');}
  else if(d.move){mutate(()=>{const ids=activeDay().ids,i=ids.indexOf(d.move),j=i+Number(d.direction);if(j>=0&&j<ids.length)[ids[i],ids[j]]=[ids[j],ids[i]];});}
  else if(d.route){showRoute(d.route);}
  else if(d.applyRoute){mutate(()=>activeDay().ids=routes.find(r=>r.id===d.applyRoute).ids.slice(),'已采用主题路线，可继续调整。');$('#utility-dialog').close();}
  else if(button.id==='copy-link'){
    const link=$('#share-link');try{await navigator.clipboard.writeText(link.value);toast('计划链接已复制。');}catch{link.focus();link.select();toast('已选中链接，请复制后分享。');}
  }else if(button.id==='export-text'){
    const content=exportText(state),blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${city.brand}·${city.name}漫游计划.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    showUtility('行程文本',`<div class="utility-body"><p>已发起文本文件下载。浏览器不支持下载时，也可以选中并复制下面的计划。</p><textarea id="export-content" class="link-field" rows="16" aria-label="完整行程文本" readonly>${esc(content)}</textarea><div class="share-buttons"><button class="button primary" id="copy-text">${glyph('list')}复制全文</button></div></div>`);
  }else if(button.id==='copy-text'){
    const field=$('#export-content');try{await navigator.clipboard.writeText(field.value);toast('行程全文已复制。');}catch{field.focus();field.select();toast('已选中全文，请复制保存。');}
  }else if(button.id==='print-button'){$('#print-plan').textContent=exportText(state);window.print();}
  else if(button.id==='import-plan'){mutate(()=>{const saved=state.saved;state=incoming;state.saved=saved;},'分享的行程已导入。');incoming=null;window.history.replaceState(null,'',location.pathname);$('#utility-dialog').close();}
});
$('#search').addEventListener('input',event=>{search=event.target.value.trim();render();});
$('#saved-filter').onclick=()=>{filter=filter==='saved'?'all':'saved';render();};
$('#budget').onchange=event=>mutate(()=>activeDay().budget=Number(event.target.value));
$('#pause').onchange=event=>mutate(()=>activeDay().pause=Number(event.target.value));
$('#add-day').onclick=()=>{if(state.days.length>=5)return;mutate(()=>{state.days.push({ids:[],budget:480,pause:60,foodIds:[]});state.active=state.days.length-1;editing=false;},`现在开始规划 Day ${state.days.length+1}。`);};
$('#undo').onclick=()=>{if(undoStack.length){state=undoStack.pop();persist();render();toast('已撤销上一次修改。');}};
$('#clear-day').onclick=()=>mutate(()=>activeDay().ids=[],'已清空当天，可以撤销。');
$('#edit-order').onclick=()=>{editing=!editing;renderPlan();};
$('#optimize').onclick=()=>{const before=summarize(activeDay().ids,activeDay().budget,activeDay().pause),ids=optimize(activeDay().ids),after=summarize(ids,activeDay().budget,activeDay().pause);if(JSON.stringify(ids)===JSON.stringify(activeDay().ids)){toast('按当前转场预留，这个顺序已合适。');return;}mutate(()=>activeDay().ids=ids,`保留首站与全部景点，转场预留减少 ${before.maxTransfer-after.maxTransfer} 分钟。`);};
$('#share-top').onclick=showShare;$('#share-plan').onclick=showShare;
$('#city-switch').onclick=()=>showUtility('悠游 · 换一座城',`<div class="utility-body city-options"><p>同一种慢游方法，三种城市性格。每座城市单独保存行程。</p><a class="button" href="https://shuzidiantang.com/travel/kyoto/">01 京都 · 庭园、街巷与水声</a><a class="button" href="https://shuzidiantang.com/travel/edinburgh/">02 爱丁堡 · 山脊、石城与海风</a><a class="button primary" href="./" aria-current="page">03 哈尔滨 · 冰雪、老街与江风</a></div>`);$('#help-nav').onclick=showGuide;$('#map-help').onclick=showGuide;$('#sources-button').onclick=showSources;
for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});dialog.addEventListener('close',()=>{if(dialog.id==='detail-dialog')detailId=null;});}

render();requestAnimationFrame(()=>fitMap());
if(incoming)showUtility('打开一份漫游计划',`<div class="utility-body"><p>这份${esc(city.name)}计划包含 ${incoming.days.length} 天、${incoming.days.reduce((sum,d)=>sum+d.ids.length,0)} 处停留。导入会替换本浏览器的行程，并保留你的收藏；可用撤销恢复。</p><button class="button primary full" id="import-plan">导入分享的行程</button></div>`);
else if(hash)toast('分享链接无法读取，已保留本地行程。');
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='CACHE_READY'){document.body.dataset.offlineCache=event.data.version;$('#offline-status').textContent='离线资料已缓存 ·';}});
  const queryCache=()=>navigator.serviceWorker.controller?.postMessage({type:'CACHE_INFO'});
  navigator.serviceWorker.addEventListener('controllerchange',queryCache);
  navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(queryCache).catch(()=>{});
}
