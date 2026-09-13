import assert from 'node:assert/strict';
import { buildTrip, rentals, ROUTES, toGpx } from '../src/lib/trip';
import { normalizeSeattle, type SeattleOptions } from '../src/data/seattle';
import { flightsForTrip } from '../src/lib/flights';
import { offlinePlanHtml } from '../src/lib/offline';
import { weatherForDay } from '../src/lib/weather';
import photos from '../src/data/photos.json';
import pois from '../src/data/pois.json';
let count = 0;
for (const weather of ['good', 'rain'] as const) for (const portland of [true, false]) for (const rainier of ['sat', 'sun', 'mon'] as const) for (const flight of ['mon-am', 'mon-pm', 'tue-am'] as const) {
  const options: SeattleOptions = normalizeSeattle({weather, portland, rainier, flight});
  const t = buildTrip(new Set(), 'balanced', {}, options);
  assert.equal(t.days.length, 20);
  assert.equal(new Date(t.days.find(d=>d.id==='sf3')!.date!).toISOString().slice(0,10), '2026-10-11');
  assert.equal(new Date(t.days.find(d=>d.id==='s1')!.date!).toISOString().slice(0,10), '2026-09-29');
  const early = options.flight === 'mon-am';
  assert.equal(rentals(t).seattle.days, early ? 4 : 5);
  assert.equal(rentals(t).slc.days, 11);
  const first = t.days.slice(0,5);
  assert.equal(first.filter(d=>d.poiDay==='waPortland').length, portland ? 1 : 0);
  assert.equal(first.filter(d=>d.poiDay==='waRainier').length, weather === 'good' ? 1 : 0);
  if (weather === 'good') assert.equal(first[['sat','sun','mon'].indexOf(rainier)+2].poiDay, 'waRainier');
  for (const [i,d] of first.entries()) {
    assert.ok(d.id && d.act && d.routeId, d.title);
    assert.ok(ROUTES[d.routeId!], d.routeId);
    assert.equal(d.sleep?.t, 'motel');
    assert.ok(weatherForDay(d)?.daytime && weatherForDay(d)?.night, `${d.title}: weather`);
    assert.equal(d.photos?.length,3);
    for (const id of d.photos!) assert.ok(id in photos, id);
    assert.ok(pois.some(p=>p.day===(d.poiDay ?? d.id)), `${d.title}: places`);
    if (d.meters) assert.ok(toGpx('test',[d]).includes('<trkpt'));
    if (i > 0 && !(early && i === 4)) {
      const prev = ROUTES[first[i-1].routeId!].line.at(-1)!;
      const next = ROUTES[d.routeId!].line[0];
      assert.ok(Math.hypot(prev[0]-next[0], prev[1]-next[1]) < .01, `${options.weather}/${options.rainier}/${options.portland}: ${first[i-1].title} → ${d.title}`);
    }
  }
  const f = flightsForTrip(t).find(f=>f.dir==='hop1')!;
  assert.ok(f.date.includes(options.flight==='tue-am' ? '29' : '28'));
  assert.equal(f.dep,options.flight==='mon-pm' ? 'evening' : 'morning');
  const html=offlinePlanHtml(t,'km');
  assert.ok(html.includes(f.date));
  assert.ok(html.includes('Portland: burgers')===portland);
  if(early) assert.equal(first[4].rental,'No car');
  count++;
}
console.log(`✓ ${count} Seattle combinations: dates, coherent road endpoints, photos, POIs, weather, rentals, flights, GPX and offline export`);
