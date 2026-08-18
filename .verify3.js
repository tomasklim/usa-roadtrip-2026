const fs=require('fs');
const js=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];
function run(stored){
  const store={};
  const el=id=>store[id]||(store[id]={innerHTML:'',textContent:'',style:{},dataset:{},
    classList:{add(){},remove(){}},offsetWidth:0,addEventListener(){},scrollIntoView(){},
    setAttribute(){},getAttribute(){return null}});
  const ls={getItem:k=>k in stored?JSON.stringify(stored[k]):null,setItem(){}};
  try{ new Function('document','localStorage','matchMedia','console',js)
    ({getElementById:el,querySelectorAll:()=>[],documentElement:el('__r')},ls,()=>({matches:false}),{log(){}}); }
  catch(e){ return {err:e.message}; }
  return store;
}
const cases={
  "unlimited mileage cap (400)": {"nwrt26.slide":{cap:400}},
  "minimum cap (75)":            {"nwrt26.slide":{cap:75}},
  "all modules on":              {"nwrt26.mods":["beartooth","dino","craters","bend","bigsur"]},
  "alvord branch":               {"nwrt26.mods":["alvord","beartooth","bigsur"]},
  "stale module id in storage":  {"nwrt26.mods":["beartooth","this-module-was-deleted"]},
  "stale slider id in storage":  {"nwrt26.slide":{gone:99,turoDay:150}},
  "corrupt checks value":        {"nwrt26.checks":"not-an-array"},
  "lens set to unknown value":   {"nwrt26.lens":"bogus"}
};
for(const [name,stored] of Object.entries(cases)){
  const s=run(stored);
  if(s.err){ console.log(("✗ "+name).padEnd(34), "THREW:", s.err); continue; }
  const bill=s.bill.innerHTML, stats=s.stats.innerHTML, warn=s.daywarn.innerHTML, days=s.days.innerHTML;
  const bad=[];
  if(/NaN|Infinity/.test(bill)) bad.push("NaN/Infinity in bill");
  if(/NaN/.test(stats)) bad.push("NaN in stats");
  if(/undefined/.test(bill+stats+warn+days)) bad.push("undefined in markup");
  if(days.length<5000) bad.push("days too short ("+days.length+")");
  const total=(bill.match(/Total for two<\/span><span>([^<]+)/)||[])[1];
  const mi=(stats.match(/<b class="tnum">([\d,]+)<\/b><small>miles/)||[])[1];
  console.log((bad.length?"✗ ":"✓ ")+name.padEnd(32), "miles:"+String(mi).padEnd(7),
    "total:"+String(total).padEnd(9), bad.join("; "));
}
