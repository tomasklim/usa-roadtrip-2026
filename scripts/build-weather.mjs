import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
const config = JSON.parse(await fs.readFile(new URL('../src/data/weather-places.json', import.meta.url)));
const requested = new Set(process.argv.slice(2));
const entries = Object.entries(config.places).filter(([id]) => !requested.size || requested.has(id));
if (!entries.length) throw Error("No matching weather locations");
const previous = requested.size ? JSON.parse(await fs.readFile(new URL("../src/data/weather-history.json", import.meta.url))) : null;
const years = Array.from({length:11}, (_,i) => 2015+i);
const variables = ['temperature_2m_max','temperature_2m_min','precipitation_sum','snowfall_sum'];
const cache = path.join(os.tmpdir(), 'nw-roadtrip-weather-v1');
await fs.mkdir(cache,{recursive:true});
const samples = Object.fromEntries(entries.map(([id])=>[id,[]]));
const grids = {};
const requests = previous?.meta.requests ?? [];
for(const year of years){
  const query = new URLSearchParams({latitude:entries.map(([,p])=>p.latitude).join(','),longitude:entries.map(([,p])=>p.longitude).join(','),timezone:entries.map(([,p])=>p.timezone).join(','),start_date:`${year}-09-15`,end_date:`${year}-10-25`,daily:variables.join(','),models:'era5_seamless',temperature_unit:'celsius',precipitation_unit:'mm'});
  const url = `https://archive-api.open-meteo.com/v1/archive?${query}`;
  const file = path.join(cache, `${year}-${createHash('sha256').update(url).digest('hex').slice(0,12)}.json`);
  let raw;
  try{raw=await fs.readFile(file,'utf8')}catch{
    const response = await fetch(url, {signal:AbortSignal.timeout(120000)});
    if(!response.ok) throw Error(`${response.status}: ${await response.text()}`);
    raw=await response.text();
    await fs.writeFile(file,raw);
    // Multi-location requests count separately against the provider's rate limit.
    await new Promise(r=>setTimeout(r,9000));
  }
  const parsed=JSON.parse(raw);
  const data=Array.isArray(parsed) ? parsed : [parsed];
  if(!Array.isArray(data)||data.length!==entries.length) throw Error('Unexpected location count');
  entries.forEach(([id],n)=>{
    const result=data[n], d=result.daily;
    if(!d||d.time.length!==41) throw Error(`Incomplete dates for ${id}/${year}`);
    grids[id]={latitude:result.latitude,longitude:result.longitude,elevation:result.elevation,timezone:result.timezone};
    d.time.forEach((date,i)=>{
      const values=variables.map(v=>d[v]?.[i]);
      if(values.some(v=>typeof v!=='number'||!Number.isFinite(v))) throw Error(`Missing value ${id}/${date}`);
      samples[id].push([date,...values]);
    });
  });
  requests.push({year,places:entries.map(([id])=>id),url,sha256:createHash('sha256').update(raw).digest('hex')});
  console.log(`Loaded ${year}: ${data.length} locations × 41 days`);
}
const quantile=(values,q)=>{const a=[...values].sort((a,b)=>a-b),i=(a.length-1)*q,f=Math.floor(i);return a[f]+(a[Math.ceil(i)]-a[f])*(i-f)};
const mean=a=>a.reduce((a,b)=>a+b,0)/a.length;
const round=n=>Math.round(n*10)/10;
const dayNumber=md=>Date.parse(`2000-${md}T00:00:00Z`)/86400000;
const places=previous?.places ?? {};
for(const [id,p] of entries){
  const dates={};
  for(let d=Date.UTC(2000,8,22);d<=Date.UTC(2000,9,18);d+=86400000){
    const md=new Date(d).toISOString().slice(5,10);
    const rows=samples[id].filter(row=>Math.abs(dayNumber(row[0].slice(5,10))-d/86400000)<=7);
    if(rows.length!==165) throw Error(`Bad sample count ${id}/${md}: ${rows.length}`);
    const highs=rows.map(r=>r[1]),lows=rows.map(r=>r[2]);
    dates[md]={n:rows.length,high:round(mean(highs)),low:round(mean(lows)),highP25:round(quantile(highs,.25)),highP75:round(quantile(highs,.75)),lowP10:round(quantile(lows,.1)),wetPct:Math.round(rows.filter(r=>r[3]>=1).length/rows.length*100),frostPct:Math.round(rows.filter(r=>r[2]<0).length/rows.length*100),snowPct:Math.round(rows.filter(r=>r[4]>=.1).length/rows.length*100)};
  }
  places[id]={...p,grid:grids[id],dates};
}
const out={meta:{source:'Open-Meteo Historical Weather API',sourceUrl:'https://open-meteo.com/en/docs/historical-weather-api',model:'ERA5-Seamless (ERA5-Land temperatures, ERA5 precipitation)',period:'2015–2025',years,windowDays:7,wetThresholdMm:1,snowThresholdCm:.1,fetchedAt:new Date().toISOString(),method:'165 local calendar days per estimate: the target month/day ±7 days in each of 11 years. Mean daily high/low; percentile ranges and observed modelled wet/frost/snow fractions. Reanalysis, not a forecast or a 30-year climate normal.',requests},places};
await fs.writeFile(new URL('../src/data/weather-history.json',import.meta.url),JSON.stringify(out)+'\n');
console.log(`Saved ${entries.length} places, 27 calendar dates each.`);
