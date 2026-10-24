import {handleBattle} from '../../_guandan/battle-service.mjs';
import {runtime} from '../../_guandan/runtime.mjs';
export async function onRequest({request}){
 try{const {env,repository}=runtime();const response=await handleBattle(request,env,{repository});response.headers.set('X-Guandan-Hosting','EdgeOne');return response;}
 catch{return Response.json({error:'AI 对战后端正在准备，请稍后再试。'},{status:503});}
}
