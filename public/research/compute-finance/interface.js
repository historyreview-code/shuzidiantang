"use strict";
const el=id=>document.getElementById(id);
const groups=[
 ["上架进度与电价",[["first","首月上架率 %",0,100],["stable","稳定上架率 %",0,100],["ramp","达稳运营月",1,276,1],["price","电价 元/kWh",0,100]]],
 ["保险融资",[["rate","固定年利率 %",0,100],["term","还款期限（月）",1,240,1],["request","申请额（万元）",0,1e10],["wait","投运后置换（月）",0,36,1]]],
 ["建设与资本金",[["start","开工年月"],["construction","建设期（月）",1,36,1],["capex","建设投资（万元）",0,1e10],["equity","资本金（万元）",0,1e10],["bank","建设贷（万元）",0,1e10],["bankRate","建设贷年利率 %",0,100]]],
 ["托管经营",[["kw","IT 容量（kW）",1,1e8],["fee","月费（元/kW）",0,1e7],["load","平均负载率 %",0,100],["pue","PUE",1,10],["annualCosts","其他年支出（万元）",0,1e10]]],
 ["授信与压力假设",[["baseFloor","基准覆盖要求（倍）",1,20],["stressFloor","压力覆盖要求（倍）",1,20],["haircut","上架率下调（百分点）",0,100],["premium","电价加价（元/kWh）",0,100]]]
];
const labels={};
for(const [index,[name,fields]] of groups.entries()){
 const block=document.createElement('details');block.open=index<2&&window.innerWidth>760;
 block.innerHTML='<summary>'+name+'</summary><div class="body fields"></div>';
 for(const [key,label,min,max,step] of fields){
   labels[key]=label;
   const wrap=document.createElement('label');wrap.textContent=label;
   const input=document.createElement('input');input.id=key;input.required=true;
   if(key==='start'){input.type='month';input.min='1900-01';input.max='9700-12';}
   else{input.type='number';input.min=min;input.max=max;input.step=step??'any';}
   input.value=defaultInputs[key];wrap.append(input);block.lastChild.append(wrap);
 }
 el('controls').append(block);
}
const format=(n,d=1)=>n==null?'—':(Math.abs(n)<0.5*10**-d?0:n).toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
let model,anchor;
function addOverride(){
 const used=new Set([...el('overrides').querySelectorAll('.month')].map(e=>Number(e.value)));
 let month=1;while(used.has(month))month++;
 if(month>276)return;
 const row=document.createElement('div');row.className='ov';
 row.innerHTML='<label>运营月<input required class="month" type="number" min="1" max="276" step="1" value="'+month+'"></label><label>上架率 %<input class="occ" type="number" min="0" max="100" step="any"></label><label>元/kWh<input class="price" type="number" min="0" max="100" step="any"></label><button type="button">移除</button>';
 row.querySelector('button').onclick=()=>{row.remove();refresh();};el('overrides').append(row);row.querySelector('input').focus();refresh();
}
function readInputs(){
 const p={},ov={};
 for(const k of Object.keys(defaultInputs)){const input=el(k);if(!input.checkValidity())throw Error('请检查「'+labels[k]+'」的取值。');p[k]=k==='start'?input.value:input.valueAsNumber;}
 if(p.bank>p.capex)throw Error('建设贷款本金超过建设投资，请调整。');
 for(const row of el('overrides').children){
   const [m,o,e]=row.querySelectorAll('input');if(![m,o,e].every(x=>x.checkValidity()))throw Error('请检查逐月覆盖的月份、上架率或电价。');
   if(ov[m.valueAsNumber])throw Error('运营月重复，请将同月的两个覆盖值填在同一行。');
   ov[m.valueAsNumber]={occupancy:o.value===''?null:o.valueAsNumber,price:e.value===''?null:e.valueAsNumber};
 }
 return [p,ov];
}
const set=(id,t)=>el(id).textContent=t;
function refresh(){
 let args;try{args=readInputs();}catch(e){set('invalid',e.message);el('results').hidden=true;set('period','请检查输入');return;}
 set('invalid','');el('results').hidden=false;model=calculate(...args);
 const m=model;
 for(const k of ['limit','gap','limitedGap'])set(k,format(m[k]));
 set('minDSCR',format(m.minDSCR,2));set('stressMetric','压力情景 '+format(m.minStress,2)+(m.minStress===null?'':' 倍'));
 set('bound',m.limit===m.stressLimit?'受压力现金流约束':m.limit===m.baseLimit?'受基准现金流约束':'受可置换本金约束');
 for(const k of ['gapDate','limitedDate'])set(k,m[k]?'首次出现于 '+m[k]:'全期资金充足');
 set('limits','基准可贷 '+format(m.baseLimit)+' 万元，压力可贷 '+format(m.stressLimit)+' 万元，可置换建设贷 '+format(args[0].bank)+' 万元。');
 set('period',m.rows[0].period+' 至 '+m.rows.at(-1).period);set('months','共 '+m.rows.length+' 个月，金额单位为万元。');
 const slider=el('cursor');slider.max=m.rows.length-1;
 slider.value=Math.min(anchor??(args[0].construction+args[0].wait-1),m.rows.length-1);
 draw();table();
}
const tables={
 cash:[['equity','资本金'],['buildSpend','工程支出'],['cf','偿债现金流'],['net','申请方案净现金'],['cash','申请方案余额'],['limitNet','限额方案净现金'],['limitCash','限额方案余额']],
 op:[['occupancy','上架率 %',100],['price','电价 元/kWh',1,3],['kwh','全站电量 kWh',1,0],['revenue','托管回款'],['power','电量电费'],['cost','其他支出'],['cf','基准偿债现金流'],['stressCF','压力偿债现金流']],
 loan:[['bankDraw','建设贷提款'],['bankInterest','建设贷利息'],['bankRepay','建设贷归还'],['bridge','建设贷余额'],['draw','险资提款'],['interest','险资利息'],['principal','险资还本'],['balance','险资余额'],['dscr','基准覆盖（倍）',1,2],['stressDSCR','压力覆盖（倍）',1,2],['limitDraw','限额提款'],['limitService','限额本息']]
};
function table(){
 const cols=tables[el('tableMode').value];
 el('thead').innerHTML='<tr>'+['月份','阶段',...cols.map(x=>x[1])].map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr>';
 el('tbody').innerHTML=model.rows.map(r=>'<tr><td>'+r.period+'</td><td>'+r.phase+'</td>'+cols.map(([key,,scale=1,d=1])=>'<td class="'+(r[key]<-1e-8?'neg':'')+'">'+format(r[key]===null?null:r[key]*scale,d)+'</td>').join('')+'</tr>').join('');
}
const palette=['#84e3bf','#f4ba77','#a5c1ff'];
function draw(){
 if(!model||el('results').hidden)return;
 const canvas=el('chart'),w=canvas.clientWidth,h=canvas.clientHeight;if(w<5)return;
 const px=window.devicePixelRatio||1;canvas.width=Math.round(w*px);canvas.height=Math.round(h*px);
 const ctx=canvas.getContext('2d');ctx.scale(px,px);
 const series=el('chartMode').value==='cash'?[['cash','申请方案'],['limitCash','限额方案']]:[['cf','基准偿债现金流'],['stressCF','压力偿债现金流'],['service','申请方案本息']];
 set('chartTitle',el('chartMode').value==='cash'?'累计现金余额':'可用于偿债的现金流');
 el('legend').innerHTML=series.map((s,i)=>'<span style="--swatch:'+palette[i]+'">'+s[1]+'</span>').join('');
 const rs=model.rows, values=rs.flatMap(r=>series.map(([k])=>r[k]));
 let hi=Math.max(0,...values),lo=Math.min(0,...values);if(hi===lo)hi=lo+1;
 const left=w<430?46:62,right=w-12,top=15,bottom=h-29;
 const x=i=>left+(right-left)*i/(rs.length-1),y=n=>bottom-(bottom-top)*(n-lo)/(hi-lo);
 ctx.font='12px sans-serif';ctx.fillStyle='#bcd3d0';ctx.textAlign='right';
 for(let i=0;i<=4;i++){const n=lo+(hi-lo)*i/4;ctx.strokeStyle='#35585f';ctx.beginPath();ctx.moveTo(left,y(n));ctx.lineTo(right,y(n));ctx.stroke();ctx.fillText(format(n,0),left-6,y(n)+4);}
 if(lo<0&&hi>0){ctx.setLineDash([3,4]);ctx.strokeStyle='#89a5a6';ctx.beginPath();ctx.moveTo(left,y(0));ctx.lineTo(right,y(0));ctx.stroke();ctx.setLineDash([]);}
 const ticks=Math.min(rs.length,w<450?3:5);for(let i=0;i<ticks;i++){const j=Math.round(i*(rs.length-1)/(ticks-1));ctx.textAlign=i===0?'left':i===ticks-1?'right':'center';ctx.fillText(rs[j].period,x(j),h-7);}
 series.forEach(([k],idx)=>{ctx.beginPath();rs.forEach((r,i)=>{if(!i)ctx.moveTo(x(i),y(r[k]));else ctx.lineTo(x(i),y(r[k]));});ctx.strokeStyle=palette[idx];ctx.lineWidth=2.2;ctx.stroke();});
 const j=Number(el('cursor').value),r=rs[j];ctx.beginPath();ctx.strokeStyle='#9bb5b6';ctx.lineWidth=1;ctx.moveTo(x(j),top);ctx.lineTo(x(j),bottom);ctx.stroke();
 series.forEach(([k],i)=>{ctx.fillStyle=palette[i];ctx.beginPath();ctx.arc(x(j),y(r[k]),3.3,0,2*Math.PI);ctx.fill();});
 set('chartRead',r.period+' · '+r.phase+'　'+series.map(([k,l])=>l+' '+format(r[k])).join('　'));
}
el('chart').onpointermove=e=>{if(!model||e.pointerType==='touch')return;const b=e.currentTarget.getBoundingClientRect(),left=b.width<430?46:62;anchor=Math.max(0,Math.min(model.rows.length-1,Math.round((e.clientX-b.left-left)/(b.width-left-12)*(model.rows.length-1))));el('cursor').value=anchor;draw();};
el('cursor').oninput=()=>{anchor=Number(el('cursor').value);draw();};
el('chartMode').onchange=draw;el('tableMode').onchange=table;
el('controls').oninput=refresh;el('overrides').oninput=refresh;el('addOverride').onclick=addOverride;
el('reset').onclick=()=>{for(const [k,v] of Object.entries(defaultInputs))el(k).value=v;el('overrides').replaceChildren();anchor=undefined;refresh();};
new ResizeObserver(draw).observe(el('chart'));refresh();
