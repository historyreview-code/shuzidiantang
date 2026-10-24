import {Makers} from '@edgeone/makers-sdk';
import {getStore} from '@edgeone/pages-blob';
const token=process.env.MAKERS_API_TOKEN?.trim();
if(!token)throw Error('Existing EdgeOne deployment token is unavailable');
const makers=new Makers({token});
const projects=[];
for await(const p of makers.projects.listAll())projects.push(p);
console.log('PROJECTS',JSON.stringify(projects.map(p=>({id:p.projectId,name:p.name,area:p.area,status:p.status}))));
const project=projects.find(p=>p.name==='makers-czlk3nk8h40q')||projects.find(p=>p.name==='shuzidiantang');
if(!project)throw Error('Cannot identify existing Digital Hall project');
console.log('PROJECT',JSON.stringify(await makers.projects.get({projectId:project.projectId})));
console.log('ENV_KEYS',JSON.stringify((await makers.projects.listEnvs({projectId:project.projectId})).map(e=>e.key)));
const store=getStore({name:'guandan-migration-check',projectId:project.projectId,token,consistency:'strong'});
const key='probe/'+Date.now();
try{
 const {url}=await store.createUploadUrl(key,{expireSeconds:120,contentType:'application/json'});
 const results=await Promise.all(Array.from({length:5},(_,i)=>fetch(url,{method:'PUT',headers:{'Content-Type':'application/json','x-cos-forbid-overwrite':'true'},body:JSON.stringify({test:i})}).then(async r=>({status:r.status,ok:r.ok,code:r.ok?'ok':(await r.text()).match(/<Code>([^<]+)/)?.[1]}))));
 console.log('ATOMIC_CREATE_PROBE',JSON.stringify(results));
 console.log('STRONG_READ_PRESENT',!!await store.get(key));
}finally{await store.delete(key);}
