// EdgeOne Blob is a cache, not a transactional quota database.
// Daily quotas were explicitly removed. In-flight suppression is per instance.
const DAY=86400000;
export function createTimedCache(store,{ttl=7*DAY,now=Date.now}={}){
  return {
    async get(key){
      const index=await store.get('index/'+key,{type:'json'});
      if(!index||index.expires<=now())return null;
      return store.get(index.path,{type:'arrayBuffer'});
    },
    async put(key,value){
      const time=now(),day=new Date(time).toISOString().slice(0,10),path=`data/${day}/${key}`;
      await store.set(path,ArrayBuffer.isView(value)?value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength):value);
      await store.setJSON('index/'+key,{path,expires:time+ttl});
    }
  };
}
export function createBlobRepository(cache,{now=Date.now}={}){
  const pending=new Map(),encoder=new TextEncoder(),decoder=new TextDecoder();
  const clean=()=>{for(const [key,value]of pending)if(value.until<=now())pending.delete(key);};
  return {
    async get(key){const raw=await cache.get('review/'+key);if(!raw)return null;return {status:'done',payload:decoder.decode(raw)};},
    async reserve({key,nonce}){
      clean();if(pending.has(key))return 'pending';
      pending.set(key,{nonce,until:now()+120000});
      try{if(await this.get(key)){pending.delete(key);return 'cached';}return 'reserved';}
      catch(error){pending.delete(key);throw error;}
    },
    async complete(key,nonce,result){try{await cache.put('review/'+key,encoder.encode(JSON.stringify(result)));}finally{if(pending.get(key)?.nonce===nonce)pending.delete(key);}},
    async fail(key,nonce){if(pending.get(key)?.nonce===nonce)pending.delete(key);}
  };
}
export function createBlobBucket(cache){return {async get(key){const data=await cache.get(key);return data?{body:data}:null;},put:(key,value)=>cache.put(key,value)};}
