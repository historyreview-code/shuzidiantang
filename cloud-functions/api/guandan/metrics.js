import {handleMetrics} from '../../_guandan/metrics-service.mjs';
import {runtime} from '../../_guandan/runtime.mjs';
export async function onRequest({request}){try{const {env,metrics}=runtime();return handleMetrics(request,{repository:metrics,env});}catch{return Response.json({error:'体验数据暂不可用。'},{status:503});}}
