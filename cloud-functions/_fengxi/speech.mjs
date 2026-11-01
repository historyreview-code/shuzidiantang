import {BLOCKS} from './data.mjs';
import {getStore} from '@edgeone/pages-blob';

export const MODEL = 'speech-2.8-hd';
export const VOICE = 'Chinese (Mandarin)_Reliable_Executive';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
}

async function synthesize(text, env) {
  const key = env.FENGXI_MINIMAX_API_KEY || env.GUANDAN_MINIMAX_API_KEY;
  if (!key) throw new Error('missing MiniMax key');
  const response = await fetch('https://api.minimax.cn/v1/t2a_v2', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${key}`},
    body: JSON.stringify({
      model: MODEL, text, stream: false, language_boost: 'Chinese',
      voice_setting: {voice_id: VOICE, speed: 0.96, vol: 1, pitch: 0},
      audio_setting: {sample_rate: 32000, bitrate: 64000, format: 'mp3', channel: 1},
      output_format: 'hex'
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) throw new Error('MiniMax HTTP ' + response.status);
  const data = await response.json();
  const hex = data?.data?.audio;
  if (data?.base_resp?.status_code !== 0 || typeof hex !== 'string' || !hex) throw new Error('MiniMax no audio');
  return Uint8Array.from(hex.match(/../g), x => parseInt(x, 16));
}

export async function handleSpeech(request) {
  const url = new URL(request.url);
  const block = url.searchParams.get('block') || '';
  if (!/^[a-z0-9-]{2,24}$/.test(block) || !BLOCKS[block]) {
    return Response.json({error: '没有这一段。'}, {status: 404, headers: {'Cache-Control': 'no-store'}});
  }
  const text = BLOCKS[block];
  const cacheKey = 'fengxi/voice/' + await sha256(`${MODEL}|${VOICE}|${text}`) + '.mp3';
  let store = null;
  try { store = getStore({name: 'guandan-audio', consistency: 'strong'}); } catch (_) {}
  if (store) {
    try {
      const cached = await store.get(cacheKey, {type: 'arrayBuffer'});
      if (cached && cached.byteLength) {
        return new Response(cached, {headers: {'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=604800', 'X-TTS-Cache': 'hit'}});
      }
    } catch (_) {}
  }
  let mp3;
  try { mp3 = await synthesize(text, process.env); }
  catch (error) {
    console.error('fengxi_tts_failed', error?.message || String(error));
    return Response.json({error: '语音暂时生成失败，请稍后再试。'}, {status: 502, headers: {'Cache-Control': 'no-store'}});
  }
  if (store) {
    try {
      const ab = mp3.buffer.slice(mp3.byteOffset, mp3.byteOffset + mp3.byteLength);
      await store.set(cacheKey, ab);
    } catch (_) {}
  }
  return new Response(mp3, {headers: {'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=604800', 'X-TTS-Cache': 'miss'}});
}
