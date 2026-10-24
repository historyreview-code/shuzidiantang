import {setTimeout as delay} from 'node:timers/promises';
const token=process.env.MAKERS_API_TOKEN?.trim(),projectId='makers-czlk3nk8h40q';
if(!token)throw Error('Missing EdgeOne API token');
async function call(Action,fields={}){
 const response=await fetch('https://pages-api.cloud.tencent.com/v1',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({Action,Region:'ap-guangzhou',...fields})});
 const raw=await response.json(),data=raw.Data?.Response||raw.Response||raw.Data||raw;
 if(!response.ok||data.Error||raw.Code&&raw.Code!==0&&raw.Code!=='Success')throw Error(`EdgeOne ${Action} failed: ${data.Error?.Code||raw.Code||response.status}`);
 return data;
}
const projects=await call('DescribePagesProjects',{ProjectIds:[projectId],Offset:0,Limit:10});
const project=projects.Projects?.find(p=>p.ProjectId===projectId);
if(project?.Name!=='shuzidiantang'||project.Provider!=='Github')throw Error('Unexpected formal project identity');
console.log(JSON.stringify({project:project.Name,provider:project.Provider,build:project.BuildCmd,output:project.OutputDir}));
const Env=process.env.GITHUB_REF_NAME==='main'?'Production':'Preview';
const recent=await call('DescribePagesDeployments',{ProjectId:projectId,Limit:30,Offset:0});
console.log(JSON.stringify({recentDeployments:recent.Deployments?.map(d=>({id:d.DeploymentId,status:d.Status,env:d.Env,production:d.UsedInProd,commit:d.RepoCommitHash,created:d.CreatedOn}))}));
// Source-only manual verification reuses the automatic Git deployment; scheduled rebuilds stay fresh.
const existing=process.env.REUSE_COMMIT_DEPLOYMENT==='true'&&recent.Deployments?.find(d=>d.RepoCommitHash===process.env.GITHUB_SHA&&d.Env===Env&&['Success','Pending','Process','Failed'].includes(d.Status));
const created=existing||await call('CreatePagesDeployment',{ProjectId:projectId,ViaMeta:'Api',Provider:'Github',Env,RepoBranch:process.env.GITHUB_REF_NAME,RepoCommitHash:process.env.GITHUB_SHA});
if(existing)console.log('Verifying existing Git deployment instead of creating a duplicate.');
if(!created.DeploymentId)throw Error('No deployment ID returned');
console.log(JSON.stringify({deployment:created.DeploymentId,env:Env,commit:process.env.GITHUB_SHA}));
for(let i=0;i<120;i++){
 let listed;try{listed=await call('DescribePagesDeployments',{ProjectId:projectId,DeploymentIds:[created.DeploymentId],Limit:10,Offset:0});}catch{console.log('Deployment status temporarily unavailable; retrying.');await delay(10000);continue;}
 const d=listed.Deployments?.[0];if(i%6===0)console.log('Deployment status:',d?.Status);
 if(d?.Status==='Success'){console.log(JSON.stringify({deployment:d.DeploymentId,status:d.Status,url:d.PreviewUrl,commit:d.RepoCommitHash}));process.exit(0);}
 if(['Failed','Invalid','Timeout','Cancelled'].includes(d?.Status)){
  const info=await call('DescribePagesDeploymentLog',{ProjectId:projectId,DeploymentId:created.DeploymentId});
  const url=info.LogUrl;if(url){const log=await (await fetch(url)).text();console.log(log.slice(-16000).split(token).join('[redacted]'));}
  throw Error(`Deployment ${d.Status}`);
 }
 await delay(10000);
}
throw Error('Deployment verification timed out');
