import assert from 'node:assert/strict';
import { buildTrip, rentals, ROUTES, toGpx } from '../src/lib/trip';
import { offlinePlanHtml } from '../src/lib/offline';
import { weatherForDay } from '../src/lib/weather';
import { MODULES } from '../src/data/itinerary';
import pois from '../src/data/pois.json';
import chargers from '../src/data/chargers.json';
const base = buildTrip(new Set());
const wet = buildTrip(new Set(['montanaRain']));
assert.equal(base.days.length, wet.days.length);
for (const id of ['s9','s10','sf1','sf3','depart']) assert.equal(base.days.find(d => d.id === id)?.date, wet.days.find(d => d.id === id)?.date);
assert.equal(rentals(base).slc.days, rentals(wet).slc.days);
assert.equal(wet.days.filter(d => d.sleep?.where.startsWith('Bozeman')).length, 2);
assert.ok(!wet.days.some(d => ['s6','s7','s8','cody'].includes(d.id)));
assert.ok(!MODULES.some(m => m.id === 'cody'));
assert.ok(ROUTES.s7.line.some(([lat,lon])=>Math.hypot(lat-45.666243,lon+108.761451)<0.01));
assert.ok(!ROUTES.s7.line.some(([lat,lon])=>Math.hypot(lat-44.969,lon+109.471)<0.1));
assert.ok(chargers.some(c => c.id === 'tesla-laurel-19030' && c.fast));
for (const trip of [base,wet]) {
 const segment = trip.days.filter(d => d.num! >= 11 && d.num! <= 15);
 for (let i=1;i<segment.length;i++) {
  const a=segment[i-1],b=segment[i];
  const end=ROUTES[a.routeId??a.id]?.line.at(-1)??a.at!;
  const start=ROUTES[b.routeId??b.id]?.line[0]??b.at!;
  assert.ok(Math.hypot(end[0]-start[0],end[1]-start[1])<0.015, `${a.id} → ${b.id}`);
 }
 for (const d of segment) assert.ok(weatherForDay(d)?.daytime);
}
for(const id of ['rainLamar','rainTransfer','rainRest']) assert.ok(pois.some(p=>p.day===id));
const html = offlinePlanHtml(wet,'km');
assert.ok(html.includes('A whole day to slow down in Bozeman'));
assert.ok(!html.includes('Back via Laurel'));
assert.ok(toGpx('wet',wet.days).includes('Hot springs, then an early Bozeman arrival'));
assert.equal(wet.days.find(d=>d.id==='rainRest')?.meters,0);
console.log('✓ Montana: Laurel route and charger, continuous routes, two Bozeman nights, stable dates and rentals, weather, POIs, GPX and offline plan');
