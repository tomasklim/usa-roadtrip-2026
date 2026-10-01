import assert from 'node:assert/strict';
import { buildTrip, ROUTES } from '../src/lib/trip';
import { DEFAULT_SEATTLE } from '../src/data/seattle';
import { normalizeJournal } from '../src/lib/journal';
import { validField } from '../shared/trip-schema.mjs';
const record = {variant:'seattle', title:'A completed city visit',note:'Confirmed places only',status:'done'};
assert.equal(validField('journal:2026-02-30',record),false);
assert.equal(validField('journal:2026-09-30',{...record,unexpected:'secret'}),false);
const journal = normalizeJournal({'2026-09-30':record,'2026-10-01':{...record,variant:'montpelierTetons',title:'Next leg',note:'',status:'planned'}});
const trip=buildTrip(new Set(['antelope','olympic']),'motel',{},DEFAULT_SEATTLE,{s2:{type:'bed',place:'Chosen hotel',note:'Private note'}},journal);
assert.equal(trip.days.length,20);
assert.equal(trip.days[6].id,'s2');
assert.equal(trip.days[6].completed,true);
assert.equal(trip.days[6].sleep?.where,'Chosen hotel');
assert.equal(trip.days[6].sleep?.note,'Private note');
assert.equal(trip.days[6].meters,0);
assert.equal(trip.days[6].routeId,'recorded');
assert.deepEqual(trip.days[6].hi,['Confirmed places only']);
assert.equal(trip.days[7].id,'s3');
assert.equal(trip.days[7].routeId,'montpelierTetons');
assert.equal(trip.days[7].completed,false);
assert.match(trip.days[7].alert!,/September 30/);
assert.ok(ROUTES.montpelierTetons.line[0][0]>42.3);
assert.equal(new Date(trip.days.at(-1)!.date!).toISOString().slice(0,10),'2026-10-13');
assert.equal(buildTrip(new Set()).days[6].completed,undefined);
console.log('✓ Private dated records, validation, past-module protection, preserved stays, connected onward route and fixed return');
const withRoad = normalizeJournal({'2026-09-30': {...record, roadKm: 200, roadNote: 'Assumed return to the city.'}});
const estimated = buildTrip(new Set(),'motel',{},DEFAULT_SEATTLE,{},withRoad);
assert.equal(estimated.days[6].meters,230000);
assert.equal(estimated.days[6].roadEstimate?.baseKm,200);
assert.equal(estimated.days[6].roadEstimate?.note,'Assumed return to the city.');
assert.equal(estimated.days[6].routeId,'recorded');
assert.equal(estimated.days[6].hours,0);
assert.equal(estimated.meters - buildTrip(new Set(),'motel',{},DEFAULT_SEATTLE,{},normalizeJournal({'2026-09-30':record})).meters,230000);
for (const roadKm of [-1,NaN,Infinity,5001,'200']) assert.equal(validField('journal:2026-09-30',{...record,roadKm}),false);
assert.equal(validField('journal:2026-09-30',{...record,roadKm:null}),true);
assert.equal(validField('journal:2026-09-30',{...record,roadNote:42}),false);
console.log('✓ Private road estimates add 15% exactly once, flow into totals, and do not fabricate recorded tracks or driving time');

const { mapLines, mapPin } = await import('../src/lib/mapRoutes');
const variants = ['arrival','hood','rainier','seattle','redmond','salt','antelopeMontpelier'];
const mapJournal = normalizeJournal(Object.fromEntries(variants.map((variant,i) => [`2026-09-${24+i}`,{...record,variant,roadKm:100}])));
const mappedTrip = buildTrip(new Set(),'motel',{},DEFAULT_SEATTLE,{},mapJournal);
for (const day of mappedTrip.days.slice(0,7)) {
  assert.ok(mapLines(day).length > 0,`Missing map line for day ${day.num}`);
  assert.equal(day.meters,115000,'Illustrative geometry must not replace the private distance estimate');
  for (const line of mapLines(day)) for (let i=1;i<line.length;i++) {
    assert.ok(Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]) < 5,'Do not connect a flight with a road segment');
  }
}
assert.equal(mapLines(mappedTrip.days[4]).length,2,'Separate roads either side of the flight');
assert.ok(mapPin(mappedTrip.days[5])![1] < -113,'Day 6 belongs at Bonneville, not underneath the SLC pin');
assert.deepEqual(mapLines(mappedTrip.days[7])[0],ROUTES.s3.line);
console.log('✓ Recorded map routes, distinct Bonneville pin, separate flight-day segments and unchanged future routes');
