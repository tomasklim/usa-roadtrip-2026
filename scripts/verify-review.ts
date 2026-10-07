import assert from 'node:assert/strict';
import {buildTrip, START, DAY_MS, ROUTES} from '../src/lib/trip';
import {roadLabel} from '../src/lib/roadLabel';
import {offlinePlanHtml} from '../src/lib/offline';
import {poisForDay} from '../src/lib/tripKit';
import {forecastTargets} from '../src/lib/forecast';
import {normalizeJournal, JOURNEY_VARIANTS} from '../src/lib/journal';
const journal = normalizeJournal(Object.fromEntries(Array.from({length:13},(_,i)=>[new Date(START+i*DAY_MS).toISOString().slice(0,10),{variant:'',title:`Day ${i}`,note:'Recorded visit',status:'done',roadKm:100}])));
const trip=buildTrip(new Set(['utahFinale']),'motel',{},undefined,{},journal);
const find=(id:string)=>trip.days.find(d=>d.id===id)!;
assert.match(roadLabel(trip.days[0],'km'),/115 km.*estimated/);
assert.ok(!offlinePlanHtml(trip,'km').includes('No driving'));
assert.match(roadLabel(find('utFly'),'km'),/km/);
assert.match(find('utMoab').sleep!.where,/Price.*Green River/);
assert.equal(forecastTargets(find('utMoab')).night?.id,'greenriver');
assert.equal(forecastTargets(find('utSouth')).night?.id,'flatrock');
assert.equal(JOURNEY_VARIANTS.tetonWest.weather?.car,'flatrock');
assert.ok(poisForDay(find('utReturn')).some(p=>p.name.startsWith('In-N-Out')));
assert.ok(poisForDay(find('utReturn')).some(p=>p.name.startsWith('LongHorn')));
assert.ok(!poisForDay(trip.days[0]).some(p=>p.name.startsWith('In-N-Out')));
for (const [before,after] of [['utSouth','utMoab'],['utMoab','utArches'],['utArches','utCanyon'],['utCanyon','utQuarry'],['utQuarry','utReturn']]){
 const a=ROUTES[before].line.at(-1)!,b=ROUTES[after].line[0];
 assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<0.015,`${before} → ${after}: overnight route gap`);
}
assert.ok(Math.hypot(ROUTES.tetonWest.line.at(-1)![0]-44.5005,ROUTES.tetonWest.line.at(-1)![1]+111.3363)<0.005);
assert.ok(!find('utReturn').hi.some(h=>/Ogden/.test(h)));
assert.match(find('utFly').food![0].nm,/airport/);
console.log('✓ Review regressions: recorded distances, airport transfer, overnight route continuity, weather areas, Utah food and priorities');
