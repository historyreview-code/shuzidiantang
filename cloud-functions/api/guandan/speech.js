import {handleSpeech} from '../../_guandan/speech-service.mjs';
import {runtime} from '../../_guandan/runtime.mjs';
export async function onRequest({request}){try{const {env,repository,bucket}=runtime();const response=await handleSpeech(request,env,{repository,bucket});response.headers.set('X-Guandan-Hosting','EdgeOne');return response;}catch{console.error('guandan_speech_runtime_unavailable');return Response.json({error:'语音服务正在准备，请稍后重试。'},{status:503});}}
