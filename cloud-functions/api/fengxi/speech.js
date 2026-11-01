import {handleSpeech} from '../../_fengxi/speech.mjs';
export async function onRequest({request}) {
  try {
    const response = await handleSpeech(request);
    response.headers.set('X-Fengxi-Hosting', 'EdgeOne');
    return response;
  } catch (error) {
    console.error('fengxi_tts_runtime_unavailable', error?.message || String(error));
    return Response.json({error: '语音服务正在准备，请稍后重试。'}, {status: 503});
  }
}
