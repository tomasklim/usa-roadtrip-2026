const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const store={};
function el(id){ return store[id] || (store[id]={id,innerHTML:'',textContent:'',style:{},
  dataset:{},classList:{add(){},remove(){}},offsetWidth:0,addEventListener(){},scrollIntoView(){},
  setAttribute(){},getAttribute(){return null}}); }
const doc={getElementById:el,querySelectorAll:()=>[],documentElement:el('__root')};
const ls={getItem:()=>null,setItem(){}};
let threw=null;
try{
  new Function('document','localStorage','matchMedia','console',js)
    (doc,ls,()=>({matches:false}),{log(){}});
}catch(e){ threw=e; }
console.log(threw? 'RUNTIME ERROR: '+threw.stack.split('\n').slice(0,3).join(' | ') : 'init() ran clean');
const want=['stats','mapbox','mods','daywarn','days','chart','chargetbl','foodrules','foodgrid',
  'sleepgrid','riskgrid','sfgrid','checks','sliders','bill','lenses'];
let empty=[];
want.forEach(id=>{ const n=(store[id]&&store[id].innerHTML||'').length; if(n<40) empty.push(id+'('+n+')'); });
console.log('sections rendered:', want.map(id=>id+':'+((store[id]&&store[id].innerHTML||'').length)).join(' '));
console.log('SUSPICIOUSLY EMPTY:', empty.length?empty:'none');
// sanity on generated markup
const days=store.days.innerHTML;
console.log('day cards:', (days.match(/class="day/g)||[]).length,
            '| ids:', (days.match(/id="day-\d+"/g)||[]).length,
            '| pins in svg:', (store.mapbox.innerHTML.match(/class="pin/g)||[]).length,
            '| bars:', (store.chart.innerHTML.match(/class="bar /g)||[]).length);
console.log('bill has NaN/Infinity:', /NaN|Infinity/.test(store.bill.innerHTML));
console.log('any "undefined" leaked into markup:',
  want.filter(id=>/undefined/.test(store[id]&&store[id].innerHTML||'')));
