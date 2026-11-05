import {handleRecords} from '../../_guandan/records-service.mjs';
import {runtime} from '../../_guandan/runtime.mjs';
export async function onRequest({request}){try{const {env,records}=runtime();return handleRecords(request,{repository:records,env});}catch{return Response.json({error:'牌谱上传暂不可用。'},{status:503});}}
