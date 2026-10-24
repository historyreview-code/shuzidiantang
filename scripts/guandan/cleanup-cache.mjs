// Optional maintenance invoked by the existing daily deployment workflow.
import {getStore} from '@edgeone/pages-blob';
const token=process.env.MAKERS_API_TOKEN?.trim();if(!token)throw Error('Deployment token missing');
const cutoff=new Date(Date.now()-8*86400000).toISOString().slice(0,10);
for(const name of ['guandan-reviews','guandan-audio']){
 const store=getStore({name,projectId:'makers-czlk3nk8h40q',token,consistency:'strong'});
 const {blobs}=await store.list({prefix:'data/',limit:2000});
 const expired=blobs.filter(x=>/^data\/\d{4}-\d{2}-\d{2}\//.test(x.key)&&x.key.slice(5,15)<cutoff);
 for(let i=0;i<expired.length;i+=8)await Promise.all(expired.slice(i,i+8).map(x=>store.delete(x.key)));
 console.log(`${name}: removed ${expired.length} expired cache objects`);
}
