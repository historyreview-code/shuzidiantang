import {ReviewError} from './review-context.mjs';
// Per-instance admission control, not an account-wide or distributed rate limiter.
export function createModelGate({battle=4,review=1,now=Date.now}={}){
 const active={battle:0,review:0},limits={battle,review};let coolUntil=0;
 return {limited:()=>{coolUntil=now()+15000;},async run(kind,work){
  if(now()<coolUntil||active[kind]>=limits[kind])throw new ReviewError('AI 服务繁忙，本次对战可由本地策略接替；点评请稍后再试。',503);
  active[kind]++;try{return await work();}finally{active[kind]--;}
 }};
}
export const modelGate=createModelGate();
