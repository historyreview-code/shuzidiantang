import {createMetricsRepository} from './metrics-service.mjs';
import {getStore} from '@edgeone/pages-blob';
import {createTimedCache,createBlobRepository,createBlobBucket} from './edge-cache.mjs';
let resources;
export function runtime(){
  if(!resources){const reviewCache=createTimedCache(getStore({name:'guandan-reviews',consistency:'strong'}));const audioCache=createTimedCache(getStore({name:'guandan-audio',consistency:'strong'}));resources={metrics:createMetricsRepository(getStore({name:'guandan-metrics',consistency:'strong'})),repository:createBlobRepository(reviewCache),bucket:createBlobBucket(audioCache)};}
  return {env:{MINIMAX_API_KEY:process.env.GUANDAN_MINIMAX_API_KEY,MINIMAX_MODEL:'MiniMax-M2.5',AI_UNLIMITED:'true',PUBLIC_ORIGINS:'https://shuzidiantang.com,https://www.shuzidiantang.com'},...resources};
}
