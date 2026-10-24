import {handleReview} from '../../_guandan/review-service.mjs';
import {runtime} from '../../_guandan/runtime.mjs';
export async function onRequest({request}){try{const {env,repository}=runtime();const response=await handleReview(request,env,{repository});response.headers.set('X-Guandan-Hosting','EdgeOne');return response;}catch{console.error('guandan_review_runtime_unavailable');return Response.json({error:'点评服务正在准备，请稍后重试。'},{status:503});}}
