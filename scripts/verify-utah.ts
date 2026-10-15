import assert from 'node:assert/strict';
import {buildTrip, START, DAY_MS, rentals} from '../src/lib/trip';
import {normalizeJournal} from '../src/lib/journal';
import {flightsForTrip} from '../src/lib/flights';
import {checksForTrip} from '../src/data/checklist';
import {forecastTargets} from '../src/lib/forecast';
import {mapLines} from '../src/lib/mapRoutes';
import photos from '../src/data/photos.json';
const history=normalizeJournal(Object.fromEntries(Array.from({length:13},(_,i)=>[new Date(START+i*DAY_MS).toISOString().slice(0,10),{variant:'',title:`Recorded ${i}`,note:'Actual visit',status:'done'}])));
const trip=buildTrip(new Set(['utahFinale','oysters','craters']),'motel',{},undefined,{},history);
assert.equal(trip.days.length,20);
assert.equal(trip.utahFinale,true);
assert.equal(trip.overrun,0);
assert.equal(trip.sfNights,0);
assert.ok(trip.days.slice(0,13).every(d=>d.completed));
assert.equal(trip.days[17].id,'utQuarry');
assert.equal(new Date(trip.days[17].date!).toISOString().slice(0,10),'2026-10-11');
assert.equal(trip.days.at(-2)?.id,'utReturn');
assert.equal(trip.days.at(-1)?.id,'utFly');
assert.equal(trip.carReturn,Date.UTC(2026,9,13));
assert.equal(rentals(trip).slc.days,15);
assert.equal(rentals(trip).sf.days,0);
assert.ok(!trip.days.some(d=>d.kind==='sf'));
for(const d of trip.days.slice(13)){
  assert.ok(mapLines(d).length,`Missing road ${d.id}`);
  assert.ok(d.meters!>0,`Missing distance ${d.id}`);
  assert.ok(forecastTargets(d).daytime,`Missing weather ${d.id}`);
  for(const p of d.photos??[])assert.ok(p in photos,`Missing photo ${p}`);
}
const flights=flightsForTrip(trip);
assert.ok(!flights.some(f=>f.dir==='hop2'));
const back=flights.find(f=>f.dir==='back')!;
assert.equal(back.from,'Salt Lake City');assert.equal(back.dep,'15:02');assert.equal(back.dur,'16 h 58 m');assert.equal(back.legs.length,3);
const checks=checksForTrip(trip);
assert.ok(checks.find(c=>c.id==='flight-slc-sfo')?.retired);
assert.ok(checks.find(c=>c.id==='california-car')?.retired);
assert.ok(!checks.filter(c=>!c.retired).some(c=>/SFO|California|San Francisco/.test(c.t+' '+c.d)));
const afterToday=buildTrip(new Set(['utahFinale']),'motel',{},undefined,{}, {...history,'2026-10-07':{variant:'',title:'Completed transfer',note:'',status:'done'}});
assert.equal(afterToday.utahFinale,true,'Do not remove the finale as its first day becomes history');
assert.equal(afterToday.days[17].id,'utQuarry');
console.log('✓ Utah dates, preserved history, route geometry, weather, photos, rental extension, flights and checklist');
const finished = buildTrip(new Set(['utahFinale']), 'motel', {}, undefined, {}, {
  ...history,
  '2026-10-07': {variant:'bozemanFlatRock',title:'Farm day',note:'Visited the farm.',status:'done',roadKm:195.4},
  '2026-10-10': {variant:'grandJunctionQuarry',title:'Quarry',note:'Visited Quarry.',status:'done'},
  '2026-10-11': {variant:'dinoDry',title:'Dinosaur',note:'Visited the park.',status:'done',roadKm:352.8},
  '2026-10-12': {variant:'slcShopping',title:'Shopping',note:'Visited the Capitol.',status:'done',roadKm:40},
  '2026-10-13': {variant:'slcDeparture',title:'Fly home',note:'Returned the car.',status:'done',roadKm:25},
});
assert.ok([13,17,18,19].every(i=>finished.days[i].completed));
assert.equal(finished.days[19].sleep,undefined,'A completed departure must not create a fictitious hotel night');
assert.equal(finished.days[19].date,Date.UTC(2026,9,13));
assert.ok([13,17,18,19].every(i=>mapLines(finished.days[i]).length>0));
assert.ok(!finished.days[13].photos?.includes('gallatincanyon'));
assert.ok(!finished.days[18].hi.some(s=>/Garden|Museum/.test(s)));
console.log('✓ Completed finale retains map lines and flight date without inventing an extra hotel night');
