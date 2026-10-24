import {Makers} from '@edgeone/makers-sdk';
const token=process.env.MAKERS_API_TOKEN?.trim();
if(!token)throw Error('Existing EdgeOne deployment token is unavailable');
const makers=new Makers({token});
await makers.projects.list({pageSize:20});
const region=makers.region;
const response=await fetch(region==='china'?'https://pages-api.cloud.tencent.com/v1':'https://pages-api.edgeone.ai/v1',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({Action:'DescribePagesProjects',PageNumber:1,PageSize:100,Region:region==='china'?'ap-guangzhou':'ap-singapore'})});
const data=await response.json();const result=data.Data?.Response||data.Response||data;
console.log('PROJECT_DOMAIN_BINDINGS',JSON.stringify(result.Projects?.map(p=>({id:p.ProjectId,name:p.Name,area:p.Area,provider:p.Provider,domains:p.CustomDomains,presetDomain:p.PresetDomain}))));
