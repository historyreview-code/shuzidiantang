(function (root) {
  'use strict';
  // Browser mirror of lab-js/product/difficulty-tiers.json + resolve-tier. Keep in sync.
  const CONFIG = {
    version: 'product-tiers-v1',
    freezePolicy: 'deepseek-v8',
    defaultTier: 'expert',
    tiers: [
      {id: 'beginner', name: '入门', alias: ['初学', '弱', 'easy'], policyId: 'quick-legacy-v4', strengthRank: 1},
      {id: 'intermediate', name: '进阶', alias: ['中', 'medium'], policyId: 'style-no-teamwork', strengthRank: 2},
      {id: 'expert', name: '高手', alias: ['强', 'hard', 'default'], policyId: 'deepseek-v8', strengthRank: 3},
    ],
  };

  function norm(s) { return String(s ?? '').trim().toLowerCase(); }

  function resolveTier(query) {
    const cfg = CONFIG;
    const q = norm(query);
    if (!q) {
      const def = cfg.tiers.find(t => t.id === cfg.defaultTier) || cfg.tiers[cfg.tiers.length - 1];
      return {...def, freezePolicy: cfg.freezePolicy, configVersion: cfg.version};
    }
    for (const t of cfg.tiers) {
      const keys = [t.id, t.name, t.policyId, ...(t.alias || [])].map(norm);
      if (keys.includes(q)) return {...t, freezePolicy: cfg.freezePolicy, configVersion: cfg.version};
    }
    throw new Error('unknown difficulty tier "' + query + '"');
  }

  function listTiers() {
    return CONFIG.tiers.map(({id, name, policyId, strengthRank}) => ({id, name, policyId, strengthRank}));
  }

  function weightsForPolicy(G, policyId) {
    switch (policyId) {
      case 'quick-legacy-v4': return G.LEGACY_WEIGHTS_V4;
      case 'style-no-teamwork': return {...G.WEIGHTS, teamLead: 0, feed: 0, passTeamLead: 0};
      case 'deepseek-v8': return {...G.WEIGHTS, bombRiskK: 30};
      default: return {...G.WEIGHTS, bombRiskK: 30};
    }
  }

  function analyseTop(G, state, query, seat) {
    const tier = resolveTier(query);
    const W = weightsForPolicy(G, tier.policyId);
    const rows = G.analyse(G.observe(state, seat == null ? state.turn : seat), W);
    return {top: rows[0], rows, tier, W};
  }

  function choose(G, state, query) {
    const tier = resolveTier(query);
    const W = weightsForPolicy(G, tier.policyId);
    return {action: G.choose(state, state.turn, W), tier, policyId: tier.policyId, tierId: tier.id};
  }

  // Local-only product telemetry ring (no network). Schema matches lab-js/product/telemetry.mjs.
  const TKEY = 'guandan-product-telemetry-v1';
  function loadRing() {
    try {
      const raw = JSON.parse(localStorage.getItem(TKEY) || 'null');
      if (raw && Array.isArray(raw.events)) return raw;
    } catch {}
    return {events: []};
  }
  function emitLocal(row) {
    const data = loadRing();
    data.events.push(row);
    data.events = data.events.slice(-500);
    try { localStorage.setItem(TKEY, JSON.stringify(data)); } catch {}
    return row;
  }
  function emitHandEnd({result, score, policyId, tierId, strategyVersion, source, gameId, seat, detail}) {
    return emitLocal({
      ts: new Date().toISOString(),
      event: 'hand_end',
      result: result ?? null,
      score: score ?? null,
      policyId, tierId, strategyVersion,
      source: source || 'online',
      gameId: gameId ?? null,
      seat: seat ?? null,
      detail: detail ?? null,
    });
  }

  const api = {
    CONFIG, resolveTier, listTiers, weightsForPolicy, analyseTop, choose,
    emitHandEnd, loadRing,
    TELEMETRY_FIELDS: 'ts,event,result,score,policyId,tierId,strategyVersion,source,gameId?,seat?,detail?',
  };
  root.GuandanDifficulty = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
