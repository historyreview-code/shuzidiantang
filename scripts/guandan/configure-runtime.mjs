import {Makers} from '@edgeone/makers-sdk';
const token=process.env.MAKERS_API_TOKEN?.trim(),key=process.env.GUANDAN_MINIMAX_API_KEY?.trim();
if(!token||!key)throw Error('Guandan runtime deployment secrets are missing');
const makers=new Makers({token}),projectId='makers-czlk3nk8h40q';
const project=await makers.projects.get({projectId});
if(project.name!=='shuzidiantang')throw Error('Formal Digital Hall project identity does not match');
await makers.projects.setEnvs({projectId,envVars:[{key:'GUANDAN_MINIMAX_API_KEY',value:key,comment:'掼蛋研习室点评与语音，仅后端使用'}]});
console.log('Guandan runtime secret configured on formal Digital Hall project.');
