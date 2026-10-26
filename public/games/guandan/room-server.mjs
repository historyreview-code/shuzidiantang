// 好友联机 MVP：房间服务（HTTP + 长轮询，无第三方依赖）
// 房间状态在内存中；服务端权威判定，手牌按座位过滤下发。AI 可补位。
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import require from 'node:module';
const G = require.createRequire(import.meta.url)('./engine.cjs');
const {GuandanTribute} = require.createRequire(import.meta.url)('./tribute.cjs');

const PORT = Number(process.env.ROOM_PORT || 8890);
const rooms = new Map();   // code -> room
const TTL = 1000 * 60 * 30;
const AI_DELAY = Number(process.env.AI_DELAY || 1000);

const code6 = () => Array.from({length: 6}, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');
const now = () => Date.now();

function newRoom(hostName = '房主') {
  let code = code6();
  while (rooms.has(code)) code = code6();
  const room = {
    code, created: now(), touched: now(), version: 0, started: false,
    seats: [hostName, null, null, null].map((name, i) => name ? {name, token: randomUUID(), ai: false, ready: true} : {name: `电脑${i}`, token: null, ai: true, ready: true}),
    level: 2, finish: null, over: false, result: null,
    state: null, events: [], tribute: null,
  };
  rooms.set(code, room);
  return room;
}

function startRoom(room, seed) {
  const s0 = G.initial(G.deal(seed || String(Date.now()), room.level, 0));
  room.state = s0; room.events = []; room.over = false; room.started = true;
  room.touched = now();
}

function publicView(room, seat) {
  const s = room.state;
  if (!s) return {code: room.code, version: room.version, started: false, seats: room.seats.map(x => ({name: x.name, ai: x.ai})), over: false};
  const o = G.observe(s, seat);
  return {
    code: room.code, version: room.version, started: true, level: s.level, turn: s.turn,
    hand: o.hand.map(c => c.id), counts: o.counts, trick: s.trick ? {seat: s.trick.seat, ids: s.trick.move.ids} : null,
    passed: s.passed, finish: s.finish, over: s.over, result: s.over ? s.result : null,
    last: Object.fromEntries([0, 1, 2, 3].map(p => [p, s.lastActions[p] ? (s.lastActions[p].kind === 'pass' ? 'pass' : G.describe(s.lastActions[p].move)) : null])),
    seats: room.seats.map(x => ({name: x.name, ai: x.ai})), aiPlay: room.state && room.state.hands ? null : null,
  };
}

function applyAction(room, seat, action) {
  const s = room.state;
  if (s.turn !== seat) throw Error('还没轮到你');
  let next;
  try { next = G.apply(s, action); } catch (e) { throw Error('出牌不合法：' + e.message.slice(0, 40)); }
  room.events.push({seat, kind: action.kind, move: action.kind === 'play' ? next.lastActions[seat].move : null});
  room.state = next; room.version++; room.touched = now();
  if (next.over) { room.over = true; room.result = next.result; room.finish = next.finish; }
}
function aiStep(room) {
  const s = room.state;
  if (!s || s.over) return;
  const seat = s.turn;
  if (!room.seats[seat] || !room.seats[seat].ai) return;
  const action = G.choose(s, seat);
  applyAction(room, seat, action);
}

const servers = [];
const json = (res, code, body) => { const b = JSON.stringify(body); res.writeHead(code, {'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store'}); res.end(b); };
const readBody = req => new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => { try { r(JSON.parse(d || '{}')); } catch { r({}); } }); });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') { res.writeHead(204, {'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type'}); return res.end(); }
  try {
    if (url.pathname === '/api/room/create' && req.method === 'POST') {
      const b = await readBody(req); const room = newRoom(b.name || '房主');
      room.seats[0] = {name: b.name || '房主', token: randomUUID(), ai: false, ready: true};
      return json(res, 200, {code: room.code, seat: 0, token: room.seats[0].token});
    }
    if (url.pathname === '/api/room/join' && req.method === 'POST') {
      const b = await readBody(req); const room = rooms.get(String(b.code || '').toUpperCase());
      if (!room) return json(res, 404, {error: '房间不存在或已过期'});
      const seat = room.seats.findIndex(x => x.ai);
      if (seat < 0) return json(res, 409, {error: '房间已满'});
      const token = randomUUID(); room.seats[seat] = {name: b.name || `玩家${seat + 1}`, token, ai: false, ready: true};
      room.touched = now(); room.version++;
      return json(res, 200, {code: room.code, seat, token});
    }
    if (url.pathname === '/api/room/start' && req.method === 'POST') {
      const b = await readBody(req); const room = rooms.get(String(b.code || '').toUpperCase());
      if (!room) return json(res, 404, {error: '房间不存在'});
      if (!room.seats.some(x => x.token === b.token && !x.ai)) return json(res, 403, {error: '无权限'});
      if (room.started) return json(res, 409, {error: '已开始'});
      startRoom(room, b.seed); room.version++;
      return json(res, 200, {ok: true});
    }
    if (url.pathname === '/api/room/state' && req.method === 'GET') {
      const room = rooms.get(String(url.searchParams.get('code') || '').toUpperCase());
      if (!room) return json(res, 404, {error: '房间不存在'});
      const token = url.searchParams.get('token');
      const seat = room.seats.findIndex(x => x.token && x.token === token);
      if (seat < 0) return json(res, 403, {error: '座位无效'});
      const sinceV = Number(url.searchParams.get('v') || -1);
      const t0 = now();
      const tick = () => {
        room.touched = now();
        if (room.state && !room.state.over) aiStep(room);
        if (room.version !== sinceV || now() - t0 > 15000) return json(res, 200, publicView(room, seat));
        setTimeout(tick, 250);
      };
      return tick();
    }
    if (url.pathname === '/api/room/action' && req.method === 'POST') {
      const b = await readBody(req); const room = rooms.get(String(b.code || '').toUpperCase());
      if (!room) return json(res, 404, {error: '房间不存在'});
      const seat = room.seats.findIndex(x => x.token && x.token === b.token);
      if (seat < 0) return json(res, 403, {error: '座位无效'});
      if (!room.started) return json(res, 409, {error: '还没开始'});
      if (Number(b.version) !== room.version) return json(res, 409, {error: '状态已更新，请重试'});
      const a = b.action || {};
      const action = a.kind === 'pass' ? {seat, kind: 'pass'} : {seat, kind: 'play', move: G.classify((a.ids || []).map(id => G.INDEX[id]), room.state.level)[0]};
      if (a.kind === 'play' && !action.move) return json(res, 400, {error: '牌型不合法'});
      try { applyAction(room, seat, action); } catch (e) { return json(res, 400, {error: e.message}); }
      return json(res, 200, {ok: true, version: room.version});
    }
    return json(res, 404, {error: 'not found'});
  } catch (e) { return json(res, 500, {error: String(e.message || e)}); }
});

setInterval(() => { for (const [code, room] of rooms) if (now() - room.touched > TTL) rooms.delete(code); }, 60000).unref();
server.listen(PORT, () => console.log(`room server on http://127.0.0.1:${PORT}`));
