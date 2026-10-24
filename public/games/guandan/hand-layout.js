(function (root) {
  'use strict';
  // Presentation only: no card in the game state or recorded action is reordered.
  const modes=['rank','suit','groups'];
  function normalise(groups,hand) {
    const available=new Set(hand.map(c=>c.id)),seen=new Set(),keys=new Set();
    return (Array.isArray(groups)?groups:[]).slice(0,27).flatMap((group,i)=>{
      if(!group||!Array.isArray(group.ids))return [];
      const ids=group.ids.filter(id=>available.has(id)&&!seen.has(id)&&(seen.add(id),true));
      if(!ids.length)return [];
      let key=typeof group.key==='string'?group.key.slice(0,100):`group-${i}`;
      while(keys.has(key))key+='-';keys.add(key);
      return [{key,ids}];
    });
  }
  function collect(groups,ids,hand,key) {
    const chosen=[...new Set(ids)].filter(id=>hand.some(c=>c.id===id));
    if(!chosen.length)return normalise(groups,hand);
    const rest=normalise(groups,hand).map(g=>({...g,ids:g.ids.filter(id=>!chosen.includes(id))})).filter(g=>g.ids.length);
    return normalise([...rest,{key,ids:chosen}],hand);
  }
  function move(groups,key,direction,hand) {
    const result=normalise(groups,hand),i=result.findIndex(g=>g.key===key),j=i+Math.sign(direction);
    if(i>=0&&j>=0&&j<result.length)[result[i],result[j]]=[result[j],result[i]];
    return result;
  }
  function sections(hand,level,mode,groups) {
    const G=root.Guandan,ordered=G.sort(hand,level),result=[];
    const add=(key,label,cards,extra={})=>{if(cards.length)result.push({key,label,cards,...extra});};
    let remaining=ordered;
    if(mode==='groups') {
      const clean=normalise(groups,hand),used=new Set(clean.flatMap(g=>g.ids));
      clean.forEach((g,i)=>{
        const cards=g.ids.map(id=>hand.find(c=>c.id===id)),types=G.classify(cards,level);
        const original=(Array.isArray(groups)?groups:[]).find(x=>x?.key===g.key);
        const partial=original?.ids.length>g.ids.length;
        const labels=[...new Set(types.map(m=>G.TYPES[m.type]))];
        add(g.key,`第 ${i+1} 组`,cards,{manual:true,partial,description:labels.join(' / ')||'自定组合'});
      });
      remaining=ordered.filter(c=>!used.has(c.id));
    }
    const wilds=remaining.filter(c=>G.wild(c,level));
    add('wild','配牌',wilds,{special:true});
    remaining=remaining.filter(c=>!G.wild(c,level));
    if(mode==='suit') {
      add('jokers','大小王',remaining.filter(c=>c.s==='J'));
      for(const suit of G.SUITS)add(suit,`${G.SYMBOLS[suit]} ${{S:'黑桃',H:'红桃',C:'梅花',D:'方块'}[suit]}`,remaining.filter(c=>c.s===suit).sort((a,b)=>b.r-a.r||a.id.localeCompare(b.id)));
    } else {
      for(const rank of [...new Set(remaining.map(c=>c.r))])add(`rank-${rank}`,`${G.rankName(rank)}${rank===level?' · 级牌':''}`,remaining.filter(c=>c.r===rank));
    }
    return result;
  }
  function materialise(hand,level,mode,groups){return normalise(sections(hand,level,mode,groups).map(s=>({key:s.key,ids:s.cards.map(c=>c.id)})),hand);}
  function transfer(groups,ids,targetKey,beforeId,hand){
    const result=normalise(groups,hand),moving=[...new Set(ids)].filter(id=>hand.some(c=>c.id===id));
    if(!moving.length)return result;
    if(moving.includes(beforeId))return result;
    let target=result.find(g=>g.key===targetKey);
    if(!target){target={key:targetKey,ids:[]};result.push(target);}
    for(const group of result)group.ids=group.ids.filter(id=>!moving.includes(id));
    let index=beforeId?target.ids.indexOf(beforeId):-1;if(index<0)index=target.ids.length;
    target.ids.splice(index,0,...moving);return normalise(result,hand);
  }
  function reorder(groups,key,targetKey,hand){
    const result=normalise(groups,hand),from=result.findIndex(g=>g.key===key);
    if(from<0||key===targetKey)return result;
    const [item]=result.splice(from,1),to=result.findIndex(g=>g.key===targetKey);
    result.splice(to<0?result.length:to,0,item);return result;
  }
  function split(groups,key,hand){return normalise(groups,hand).flatMap(g=>g.key===key?g.ids.map(id=>({key:g.key+'-'+id,ids:[id]})):g);}
  function normaliseOrder(order,hand){
    const available=new Set(hand.map(c=>c.id)),seen=new Set();
    return [...(Array.isArray(order)?order:[]),...hand.map(c=>c.id)].filter(id=>available.has(id)&&!seen.has(id)&&(seen.add(id),true));
  }
  function orderedCards(hand,level,mode,order,legacyGroups){
    const G=root.Guandan,sorted=G.sort(hand,level);
    if(mode==='groups'){
      const saved=Array.isArray(order)?order:materialise(hand,level,'groups',legacyGroups).flatMap(g=>g.ids);
      return normaliseOrder(saved,sorted).map(id=>hand.find(c=>c.id===id));
    }
    return sections(hand,level,mode,[]).flatMap(s=>s.cards);
  }
  function insertCard(order,id,targetId,after,hand){
    return insertCards(order,[id],targetId,after,hand);
  }
  function insertCards(order,ids,targetId,after,hand){
    const current=normaliseOrder(order,hand),selected=new Set(ids),moving=current.filter(id=>selected.has(id));
    if(!moving.length||selected.has(targetId)||!current.includes(targetId))return current;
    const result=current.filter(id=>!selected.has(id));
    result.splice(result.indexOf(targetId)+(after?1:0),0,...moving);return result;
  }
  root.GuandanLayout={modes,normalise,collect,move,sections,materialise,transfer,reorder,split,normaliseOrder,orderedCards,insertCard,insertCards};
})(typeof globalThis!=='undefined'?globalThis:this);
