(function(root){
  const G=root.Guandan;
  const LESSONS=[
    {id:'wild',title:'让配牌完成一个组合',category:'规则基础',kind:'rule',level:7,lead:0,minutes:2,
      intro:'打 7，♥7 是配牌。选出两张 9 和 ♥7，声明为三张 9。留意配牌实际代表的牌点。',
      goal:'打出三张 9，使用一张配牌。',focus:'红心级牌与牌型声明',
      hands:[['H7','S9','C9','D3'],['S4','H4','C8','D10'],['S5','H5','C11','D12'],['S6','H6','C13','D14']],
      check:a=>a.kind==='play'&&a.move.type==='triple'&&a.move.main===9,
      explanation:'配牌可以补普通点数，但不能替大小王。单出 ♥7 时，它仍是级牌。这里练的是合法组牌，不代表所有局面都应立即用掉配牌。'},
    {id:'finish',title:'出牌前，先检查能否走完',category:'残局思考',kind:'rule',level:2,lead:0,minutes:2,
      intro:'你领出，只剩五张牌。先检查整手牌是否构成合法牌型，再考虑逐张处理。',goal:'一次打完全部五张牌。',focus:'整手检查',
      hands:[['S3','H4','C5','D6','S7'],['H8','C8','D10','S12'],['S9','H9','C11','D13'],['S10','H10','C12','D14']],
      check:(a,s)=>a.kind==='play'&&a.move.ids.length===s.hands[0].length,
      explanation:'3、4、5、6、7 可以构成五张顺子。领出时可以一手走完，不必先出小单张。自己先走并不保证搭档也能取得好名次。'},
    {id:'partner',title:'搭档控牌，先想是否需要接管',category:'搭档配合',kind:'strategy',level:2,lead:2,minutes:3,
      intro:'搭档出了对 5，上家已经过牌。两名对手都有多张牌，你不能一手走完。这一题练习保留控制牌，让搭档继续争取出牌。',goal:'本轮选择过牌，随后观察控制权如何变化。',focus:'避免无目的抢搭档',
      hands:[['S8','H8','C3','D4','S10'],['S6','H6','C10','D11','S12','C14'],['C5','D5','C9','D9'],['C6','D6','S11','H12','C13','D14']],
      prefix:[{seat:2,cards:['C5','D5'],type:'pair'},{seat:3,pass:true}],check:a=>a.kind==='pass',
      explanation:'过牌可以保留自己的对 8，并让搭档继续争取控制。这个建议依赖当前局面；对手仍可能压住。若能一手走完或需要主动接管，判断会不同。'},
    {id:'enemy-one',title:'对手只剩一张，换一种牌型',category:'观察对手',kind:'strategy',level:7,lead:0,minutes:3,
      intro:'下家只剩一张牌。你领出，可以出对 3，也可以出单张。这一题练习利用公开的剩余张数。',goal:'选择对子领出，让报单对手本轮无法用单张跟牌。',focus:'用剩余张数选择牌型',
      hands:[['S3','H3','C4','D9'],['S14'],['S6','H6','C8','D11'],['S5','H5','C10','D12']],
      check:a=>a.kind==='play'&&a.move.type==='pair',
      explanation:'对子不能被普通单张跟上，因此报单对手无法用最后一张单牌接这手。它不保证最终胜利，还要看搭档与另一名对手的动作。'},
    {id:'bomb-order',title:'六张炸弹，能压同花顺吗',category:'规则基础',kind:'rule',level:2,lead:3,minutes:2,
      intro:'上家刚出了最大的同花顺。你有六张 3，选中它们，验证炸弹的层级关系。',goal:'用六张 3 炸弹压过同花顺。',focus:'炸弹层级',
      hands:[['S3','H3','C3','D3','S3','H3','D8'],['S4','H4','C9','D11'],['S5','H5','C10','D12'],['S10','S11','S12','S13','S14','C6','D6']],
      prefix:[{seat:3,cards:['S10','S11','S12','S13','S14'],type:'flush'}],check:a=>a.kind==='play'&&a.move.type==='bomb'&&a.move.ids.length===6,
      explanation:'本规则中：四王炸 > 六张及以上同点炸弹 > 同花顺 > 五炸 > 四炸。这个题目检查大小关系；实战是否值得炸，还要看控制权与剩余手牌。'},
    {id:'low-ace',title:'A 也可以接在 2 前面',category:'规则基础',kind:'rule',level:7,lead:0,minutes:2,
      intro:'你的六张牌是 AA、22、33。尝试将整手声明为三连对。序列按自然点数，不按级牌的单牌大小排序。',goal:'一次打出 AA2233 三连对。',focus:'低 A 序列',
      hands:[['S14','H14','C2','D2','S3','H3'],['S4','H4','C8','D10'],['S5','H5','C11','D12'],['S6','H6','C13','D14']],
      check:a=>a.kind==='play'&&a.move.type==='pairs'&&a.move.power===3,
      explanation:'AA2233 是本练习规则中的最小三连对。A 只能在序列两端使用；KKAA22 不能绕接。类似地，A2345 与 AAA222 也属于低 A 序列。'},
    {id:'declaration',title:'同一组牌，可以有两种三带二',category:'规则基础',kind:'rule',level:9,lead:0,minutes:3,
      intro:'选择两张 6、两张 7 和 ♥9。在“牌型声明”中观察两种解释，再选择三张 7 带对 6。',goal:'声明为三带二，三张部分为 7。',focus:'多义组合与回放',
      hands:[['S6','H6','C7','D7','H9','C10'],['S3','H3','C8','D11'],['S4','H4','C12','D12'],['S5','H5','C13','D14']],
      check:a=>a.kind==='play'&&a.move.type==='full'&&a.move.main===7,
      explanation:'♥9 可以补成第三张 6，也可以补成第三张 7。三带二比较三张部分。程序保存你声明的牌型，复盘时不会把它偷偷换成另一种解释。'},
    {id:'borrow',title:'搭档走完以后，何时轮到你借风',category:'搭档配合',kind:'rule',level:2,lead:2,minutes:3,
      intro:'搭档以对 5 走完，上家已过牌。你也过牌，继续观察下家；其余玩家都不再压，才会由你借风领出。',goal:'过牌并观察完整的借风过程。',focus:'借风触发条件',
      hands:[['S3','H3','C8','D9'],['S4','H6','C11','D13'],['C5','D5'],['S7','H10','C12','D14']],
      prefix:[{seat:2,cards:['C5','D5'],type:'pair'},{seat:3,pass:true}],check:a=>a.kind==='pass',
      explanation:'搭档刚出完时，其他玩家仍有机会压牌。只有最后一手保持最大、其余在场玩家全部过牌，才由未出完的搭档借风领出。'}
  ];
  function create(lesson) {
    const pool=G.deck();
    const hands=lesson.hands.map(h=>h.map(token=>{
      const s=token[0],r=+token.slice(1),i=pool.findIndex(c=>c.s===s&&c.r===r);
      if(i<0)throw Error('训练题牌张重复或超出牌库');return pool.splice(i,1)[0];
    }));
    const start=G.makeStart(hands,lesson.level,lesson.lead,lesson.id,'scenario');
    const events=[];let state=G.initial(start);
    for(const item of lesson.prefix||[]) {
      let a;
      if(item.pass)a={seat:item.seat,kind:'pass'};
      else {
        const available=[...state.hands[item.seat]],cards=item.cards.map(t=>{const i=available.findIndex(c=>c.s===t[0]&&c.r===+t.slice(1));if(i<0)throw Error('题目前序动作不匹配');return available.splice(i,1)[0];});
        const m=G.classify(cards,lesson.level).find(x=>x.type===item.type);
        a={seat:item.seat,kind:'play',move:m};
      }
      state=G.apply(state,a);events.push(a);
    }
    return {start,events};
  }
  root.GuandanLessons={items:LESSONS,create};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GuandanLessons;
})(typeof globalThis!=='undefined'?globalThis:this);
