import assert from "node:assert/strict";
import { buildTrip } from "../src/lib/trip";
import { BASE, CAR_NIGHTS, MODULES } from "../src/data/itinerary";
import { weatherForDay } from "../src/lib/weather";
import history from "../src/data/weather-history.json";
import locations from "../src/data/weather-places.json";
import { offlinePlanHtml } from "../src/lib/offline";
import type { SleepStyle } from "../src/types";

const original = JSON.stringify(BASE);
for (let mask = 0; mask < 1 << MODULES.length; mask++) {
  const mods = new Set(MODULES.filter((_, i) => mask & (1 << i)).map(m => m.id));
  for (const style of ["motel", "balanced", "car"] as SleepStyle[]) {
    const trip = buildTrip(mods, style);
    let streak = 0;
    for (const day of trip.days) {
      streak = day.sleep?.t === "car" ? streak + 1 : 0;
      assert.ok(streak <= 2, `${mask}/${style}/${day.id}: car streak ${streak}`);
      const weather = weatherForDay(day);
      assert.ok(weather, `Missing weather: ${day.id}/${day.date}`);
      assert.equal(weather.daytime.stats.n, 165);
      assert.equal(!!weather.night, !!day.sleep, `Missing overnight weather: ${day.id}`);
      if (["s5", "s6", "s7", "cody", "s10"].includes(day.id)) assert.equal(day.sleep?.t, "motel");
    }
  }
}
const automatic = buildTrip(new Set(), "car");
assert.equal(automatic.days.find(d => d.id === "s4")?.sleep?.t, "motel");
const exception = buildTrip(new Set(), "car", { s4: "price" });
assert.equal(exception.days.find(d => d.id === "s4")?.sleep?.streak, 3);
assert.equal(exception.days.find(d => d.id === "s4")?.sleep?.priceException, true);
assert.equal(exception.days.find(d => d.id === "s4b")?.sleep?.t, "motel");
const overriddenBed = buildTrip(new Set(), "car", { s3: "bed" });
assert.equal(overriddenBed.days.find(d => d.id === "s3")?.sleep?.t, "motel");
assert.equal(overriddenBed.days.find(d => d.id === "s4")?.sleep?.streak, 1);
const isolated = buildTrip(new Set(), "motel", { s4: "price" });
assert.equal(isolated.carNights, 1);
const balanced = buildTrip(new Set());
assert.equal(balanced.carNights, 3);
for (const id of Object.keys(CAR_NIGHTS)) {
  const day = [...BASE, ...MODULES.flatMap(m => m.days)].find(d => d.id === id)!;
  assert.ok(day, id);
  const w = weatherForDay({ ...day, date: Date.UTC(2026, 9, 1), sleep: { t: "car", where: CAR_NIGHTS[id].where } });
  assert.ok(w?.night, `Car weather missing: ${id}`);
}
// A night's estimate follows its overnight area and the following calendar date.
const teton = balanced.days.find(d => d.id === "s3")!;
assert.equal(weatherForDay(teton)?.night?.name, locations.places.shadow.name);
assert.deepEqual(weatherForDay(teton)?.night?.stats, history.places.shadow.dates["10-02"]);
const bedTeton = buildTrip(new Set(), "motel").days.find(d => d.id === "s3")!;
assert.equal(weatherForDay(bedTeton)?.night?.name, locations.places.jackson.name);
assert.equal(weatherForDay({ ...teton, id: "unknown" }), null);
assert.equal(weatherForDay({ ...teton, date: Date.UTC(2026, 11, 1) }), null);
assert.equal(JSON.stringify(BASE), original, "Assembly must not mutate base nights");
for (const p of Object.values(history.places)) for (const s of Object.values(p.dates)) {
  assert.equal(s.n, 165);
  assert.ok(s.high >= s.low && s.highP25 <= s.highP75);
  assert.ok(s.lowP10 <= s.low);
  for (const key of ["wetPct", "frostPct", "snowPct"] as const) assert.ok(s[key] >= 0 && s[key] <= 100);
}
const html = offlinePlanHtml(exception, "km");
for (const str of ["Historical weather", "2015–2025", "price exception", "car night 3", "Open-Meteo", "165 local days"]) assert.ok(html.includes(str), str);
console.log("✓ All 32 route combinations × 3 sleep styles: weather coverage, two-night limit, overrides, charging/return beds, dates, data ranges, offline export, immutable base");
