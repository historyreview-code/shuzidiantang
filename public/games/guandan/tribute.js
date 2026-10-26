(function (root) {
  'use strict';
  // 进贡/还贡/抗贡规则层（gd-single-v2 的贡还部分）。纯函数，只用公开信息与自己手牌。
  const VERSION = 'tribute-v1';
  // 上局名次 → 贡还关系。finish: [头游, 二游, 三游, 末游] 座位号
  function plan(finish) {
    if (!Array.isArray(finish) || finish.length !== 4) throw Error('需要完整上局名次');
    const [first, second, third, last] = finish;
    const single = finish[0] % 2 !== finish[1] % 2;      // 头游与二游不同队 → 单贡
    // 单贡：末游 → 头游。双贡：对方两人（三游、末游）分别向头游、二游进贡。
    return single
      ? [{ giver: last, receiver: first, kind: 'single' }]
      : [{ giver: third, receiver: first, kind: 'double' }, { giver: last, receiver: second, kind: 'double' }];
  }
  // 抗贡：单贡方 2 张大王；双贡方两家合计 2 张大王
  function antiTribute(hands, planList) {
    const bigJokers = h => h.filter(c => c.r === 17).length;
    const givers = [...new Set(planList.map(p => p.giver))];
    const total = givers.reduce((s, g) => s + bigJokers(hands[g]), 0);
    return total >= 2 ? givers : null;
  }
  // 进贡牌：手中最大的一张，红心级牌（配牌）除外
  function tributeCard(hand, level) {
    const wild = c => c.s === 'H' && c.r === level;
    const pool = hand.filter(c => !wild(c));
    if (!pool.length) return null;
    return pool.slice().sort((a, b) => (b.r >= 16 ? b.r : b.r === level ? 15 : b.r) - (a.r >= 16 ? a.r : a.r === level ? 15 : a.r))[0];
  }
  // 还贡候选：默认不还大王；可选“还散牌惩罚”权重在策略层处理
  function backCandidates(hand, level) {
    return hand.filter(c => c.r < 17);
  }
  // 双贡排序：两贡牌大者归头游
  function pickDouble(giveA, giveB) {
    const pw = c => c.r >= 16 ? c.r : c.r === 15 ? 15 : c.r;
    return pw(giveA) >= pw(giveB) ? { first: giveA, second: giveB } : { first: giveB, second: giveA };
  }
  // 完整执行贡还，返回新发牌状态与可复盘记录。backPick: 由策略层决定还哪张（默认最小牌）
  function resolve(hands, level, prevFinish, backPick) {
    const planList = plan(prevFinish);
    const anti = antiTribute(hands, planList);
    if (anti) return {phase: 'play', anti, records: [], hands, lead: prevFinish[0]};
    const next = hands.map(h => h.slice());
    const gives = planList.map(p => ({...p, card: tributeCard(next[p.giver], level)}));
    let firstGive = null, secondGive = null;
    if (gives.length === 2) {
      const sorted = pickDouble(gives[0].card, gives[1].card);
      firstGive = sorted.first; secondGive = sorted.second;
    } else firstGive = gives[0].card;
    for (const g of gives) {
      next[g.giver] = next[g.giver].filter(c => c.id !== g.card.id);
      next[g.receiver] = [...next[g.receiver], g.card];
    }
    const records = [];
    for (const g of gives) {
      const pick = (backPick || ((h) => backCandidates(h, level).slice().sort((a, b) => a.r - b.r)[0]))(next[g.receiver], level);
      if (!pick) continue;
      next[g.receiver] = next[g.receiver].filter(c => c.id !== pick.id);
      next[g.giver] = [...next[g.giver], pick];
      records.push({kind: 'back', from: g.receiver, to: g.giver, card: pick, forGive: g.card});
    }
    const giverSeats = gives.map(g => g.giver);
    const lead = giverSeats.length === 2
      ? (firstGive === gives[0].card ? gives[0].giver : gives[1].giver)
      : giverSeats[0];
    return {phase: 'play', anti: null, records, hands: next, lead, gives: gives.map(g => ({giver: g.giver, receiver: g.receiver, card: g.card}))};
  }
  const api = {VERSION, plan, antiTribute, tributeCard, backCandidates, pickDouble, resolve};
  root.GuandanTribute = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
