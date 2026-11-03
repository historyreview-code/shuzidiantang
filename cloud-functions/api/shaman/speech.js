import {handleSpeech} from '../../_shaman/speech.mjs';
export async function onRequest({request}) {
  try {
    return await handleSpeech(request);
  } catch (error) {
    console.error('shaman_tts_runtime_unavailable', error?.message || String(error));
    return Response.json({error: '语音服务正在准备，请稍后重试。'}, {status: 503});
  }
}
