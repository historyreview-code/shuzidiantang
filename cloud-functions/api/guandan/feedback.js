import {handleFeedback} from '../../_guandan/feedback-service.mjs';
import {runtime} from '../../_guandan/runtime.mjs';
export async function onRequest({request}){try{const {env,feedback}=runtime();return handleFeedback(request,{repository:feedback,env});}catch{return Response.json({error:'反馈暂不可用。'},{status:503});}}
