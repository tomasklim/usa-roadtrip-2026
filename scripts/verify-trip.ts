import { buildTrip, CAP_DAYS, DEPART, START, distLabel, fmtShort, rentals, ROUTES, turoDays } from "../src/lib/trip";
import { MODULES, FLIGHTS } from "../src/data/itinerary";
import assert from "node:assert/strict";
import pois from "../src/data/pois.json";
import { weatherForDay } from "../src/lib/weather";

// Every possible module ordering/state, so splice arithmetic and dates are not
// only exercised in a few hand-picked combinations.
const combos: string[][] = Array.from({ length: 2 ** MODULES.length }, (_, mask) =>
  MODULES.filter((_, i) => (mask & (1 << i)) !== 0).map((m) => m.id)
);

console.log(`window ${CAP_DAYS} days (Sept 24 – Oct 13)\n`);
console.log("modules".padEnd(44), "days".padStart(5), "total".padStart(9), "SLC car".padStart(9),
            "SEA car".padStart(9), "SF".padStart(3), "cut".padStart(4), "over".padStart(5));
let fails = 0;
for (const c of combos) {
  const t = buildTrip(new Set(c));
  const r = rentals(t);
  const problems: string[] = [];
  const dates = t.days.map((d) => d.date!);
  if (dates[0] !== START) problems.push("wrong arrival date");
  if (t.overrun === 0 && dates.at(-1) !== DEPART) problems.push("departure moved outside booked date");
  if (dates.some((d) => d === undefined)) problems.push("undated day");
  if (new Set(dates).size !== dates.length) problems.push("duplicate dates");
  for (let i = 1; i < dates.length; i++) if (dates[i] - dates[i - 1] !== 864e5) problems.push("date gap");
  const ids = t.days.map((d) => d.id);
  if (!ids.includes("sf3") || !ids.includes("sf1")) problems.push("missing required NODE day or SFO arrival");
  if (new Set(ids).size !== ids.length) problems.push("duplicate ids: " + ids.filter((x, i) => ids.indexOf(x) !== i));
  const staleHours = t.days.filter((d) => ROUTES[d.routeId ?? d.id]?.seconds && Math.abs(d.hours - ROUTES[d.routeId ?? d.id].seconds / 3600) > 0.11);
  if (staleHours.length) problems.push("stale wheel hours: " + staleHours.map((d) => d.id));
  if (t.days.length > CAP_DAYS && t.overrun === 0) problems.push("over cap but overrun=0");
  if (r.slc.days === 0) problems.push("no SLC rental block");
  if (t.meters <= 0) problems.push("zero distance");
  console.log(
    (problems.length ? "✗ " : "✓ ") + (c.join("+") || "(base)").padEnd(42),
    String(t.days.length).padStart(5), distLabel(t.meters, "km").padStart(9),
    `${r.slc.days}d/${Math.round(r.slc.meters / 1000)}km`.padStart(9),
    `${r.seattle.days}d/${Math.round(r.seattle.meters / 1000)}km`.padStart(9),
    String(t.sfNights).padStart(3), String(t.droppedSf).padStart(4), String(t.overrun).padStart(5),
    problems.join("; ")
  );
  if (problems.length) fails++;
}
const base = buildTrip(new Set());
// Extending Washington replaces the wolf day; the booked ending must stay put.
const dateOf = (id: string) => new Date(base.days.find(d => d.id === id)!.date!).toISOString().slice(0, 10);
for (const [id, date] of Object.entries({ seaB: "2026-09-25", seaA: "2026-09-27", seaReturn: "2026-09-28", s1: "2026-09-29", s6: "2026-10-05", sf1: "2026-10-10", sf3: "2026-10-11", depart: "2026-10-13" })) assert.equal(dateOf(id), date);
assert.ok(!base.days.some(d => d.id === "s5b"));
assert.equal(rentals(base).seattle.days, 5);
assert.equal(rentals(base).slc.days, 11);
assert.equal(FLIGHTS.find(f => f.dir === "hop1")?.booked, false);
assert.equal(pois.find(p => p.name === "Hama Hama Oyster Saloon")?.day, "seaB");
assert.equal(pois.find(p => p.name === "Lamar Valley")?.day, "s6");
for (const [id, name] of [["seaB", "Bremerton / Oyster Bay"], ["seaReturn", "Salt Lake City"]]) assert.equal(weatherForDay(base.days.find(d => d.id === id)!)?.night?.name, name);
// Adjacent driving days meet at the same overnight/airport, allowing road snapping.
for (const [before, after] of [["seaB", "sea1"], ["sea1", "seaA"], ["seaA", "seaReturn"]]) {
  const end = ROUTES[base.days.find(d=>d.id===before)!.routeId ?? before].line.at(-1)!;
  const start = ROUTES[base.days.find(d=>d.id===after)!.routeId ?? after].line[0];
  assert.ok(Math.hypot(end[0] - start[0], end[1] - start[1]) < 0.01, `${before} → ${after}: route gap`);
}
console.log(`\nbase: ${distLabel(base.meters, "mi")} / ${distLabel(base.meters, "km")}, ${base.driveDays} driving days`);
console.log(`longest day: ${distLabel(Math.max(...base.days.map((d) => d.meters ?? 0)), "km")}`);
console.log(`days over 400 km: ${base.days.filter((d) => (d.meters ?? 0) > 400000).length}`);
console.log(`turoDays (SLC block): ${turoDays(base)}, car back ${fmtShort(base.carReturn)}`);
console.log(`\n${MODULES.length} modules, ${fails} failing combos`);
if (fails) process.exit(1);
