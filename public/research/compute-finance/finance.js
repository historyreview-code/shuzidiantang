"use strict";
const defaultInputs = {
  start:"2027-01", construction:12, capex:20000, equity:7000, bank:13000, bankRate:4,
  wait:12, request:13000, rate:3.5, term:120, baseFloor:1.3, stressFloor:1.1,
  kw:10000, fee:850, load:80, pue:1.3, price:.65, first:55, stable:90, ramp:12,
  annualCosts:1600, haircut:15, premium:.1
};
function calculate(p, overrides = {}) {
  const rows = [];
  const monthlyRate=p.rate/1200;
  const factor=monthlyRate ? monthlyRate/-Math.expm1(-p.term*Math.log1p(monthlyRate)) : 1/p.term;
  const takeout=p.construction+p.wait, end=takeout+p.term;
  const request=Math.min(p.request,p.bank);
  const [year,month]=p.start.split("-").map(Number);
  let bridge=0, baseLimit=Infinity, stressLimit=Infinity;
  for(let t=1;t<=end;t++){
    const date=new Date(Date.UTC(year,month+t-2,1));
    const period=date.toISOString().slice(0,7);
    const days=new Date(Date.UTC(year,month+t-1,0)).getUTCDate();
    const operating=Math.max(0,t-p.construction);
    const override=overrides[operating]??{};
    const fraction=p.ramp===1?1:Math.min(1,(operating-1)/(p.ramp-1));
    const occupancy=operating ? (override.occupancy??(p.first+(p.stable-p.first)*fraction))/100 : 0;
    const price=operating ? (override.price??p.price) : 0;
    const kwhPerKw=p.load/100*p.pue*24*days;
    const kwh=occupancy*p.kw*kwhPerKw;
    const revenue=occupancy*p.kw*p.fee/10000, power=kwh*price/10000;
    const cost=operating?p.annualCosts/12:0, cf=revenue-power-cost;
    const stressOcc=Math.max(0,occupancy-p.haircut/100);
    const stressCF=stressOcc*p.kw*(p.fee-kwhPerKw*(price+p.premium))/10000-cost;
    if(t>takeout){
      baseLimit=Math.min(baseLimit,Math.max(0,cf)/p.baseFloor/factor);
      stressLimit=Math.min(stressLimit,Math.max(0,stressCF)/p.stressFloor/factor);
    }
    const buildSpend=operating?0:p.capex/p.construction;
    const bankDraw=operating?0:p.bank/p.construction;
    const bankInterest=(bridge+bankDraw/2)*p.bankRate/1200;
    const bankRepay=t===takeout?bridge+bankDraw:0;
    bridge+=bankDraw-bankRepay;
    const equity=t===1?p.equity:0;
    rows.push({t,period,operating,occupancy,price,kwh,revenue,power,cost,cf,stressCF,buildSpend,
      bankDraw,bankInterest,bankRepay,bridge,equity,phase:t===takeout?"置换":operating?(t>takeout?"还款":"过渡"):"建设"});
  }
  const limit=Math.min(baseLimit,stressLimit,p.bank);
  let balance=0, cash=0, limitedCash=0, gap=0, limitedGap=0;
  let minDSCR=null, minStress=null, gapDate="",limitedDate="",dscrDate="",stressDate="";
  for(const r of rows){
    r.draw=r.t===takeout?request:0;
    r.limitDraw=r.t===takeout?limit:0;
    r.interest=r.t>takeout?balance*monthlyRate:0;
    r.principal=r.t>takeout?(r.t===end?balance:Math.min(balance,Math.max(0,request*factor-r.interest))):0;
    r.service=r.interest+r.principal;
    balance+=r.draw-r.principal;r.balance=balance;
    r.limitService=r.t>takeout?limit*factor:0;
    const beforeInsurance=r.cf-r.buildSpend+r.equity+r.bankDraw-r.bankInterest-r.bankRepay;
    r.net=beforeInsurance+r.draw-r.service;r.cash=(cash+=r.net);
    r.limitNet=beforeInsurance+r.limitDraw-r.limitService;r.limitCash=(limitedCash+=r.limitNet);
    r.dscr=r.service>0?Number((r.cf/r.service).toFixed(10)):null;
    r.stressDSCR=r.service>0?Number((r.stressCF/r.service).toFixed(10)):null;
    if(r.dscr!==null&&(minDSCR===null||r.dscr<minDSCR)){minDSCR=r.dscr;dscrDate=r.period;}
    if(r.stressDSCR!==null&&(minStress===null||r.stressDSCR<minStress)){minStress=r.stressDSCR;stressDate=r.period;}
    if(-cash>gap+1e-9){gap=-cash;gapDate=r.period;}
    if(-limitedCash>limitedGap+1e-9){limitedGap=-limitedCash;limitedDate=r.period;}
  }
  return {rows,baseLimit,stressLimit,limit,request,gap,gapDate,limitedGap,limitedDate,minDSCR,minStress,dscrDate,stressDate};
}
