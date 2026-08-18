import { buildTrip, rentals, turoDays } from "../src/lib/trip";
import { BUDGET_CFG } from "../src/data/reference";

const S = Object.fromEntries(BUDGET_CFG.map((c) => [c.id, c.val])) as Record<string, number>;
const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const t = buildTrip(new Set());
const r = rentals(t);
const td = turoDays(t);
const slcMiles = r.slc.meters / 1609.344;
const over = Math.max(0, slcMiles - S.cap * td);
const lodging = Math.max(0, t.days.length - 1 - t.carNights - t.sfNights);
const lines: [string, number][] = [
  [`transatlantic 2 × €${S.flightEur}`, 2 * S.flightEur * S.eurusd],
  [`SLC Turo ${td}d`, td * S.turoDay],
  [`Seattle car ${r.seattle.days}d`, r.seattle.days * S.seaDay],
  ["over-miles", over * S.overMi],
  ["charging", (t.meters / 1609.344 / 4) * S.kwh],
  [`lodging ${lodging}n`, lodging * S.motel],
  [`food ${t.days.length}d ×2`, 2 * t.days.length * S.foodDay],
  ["park pass", 250], ["gear", 170], ["domestic flights", 520],
  [`SF hotel ${t.sfNights}n`, t.sfNights * S.sfNight],
  ["SF activities", 200 * Math.max(1, t.sfNights)],
  ["Point Reyes car", 140]
];
const total = lines.reduce((a, [, v]) => a + v, 0);
lines.forEach(([l, v]) => console.log(`   ${l.padEnd(26)} ${usd(v).padStart(8)}`));
console.log(`   ${"TOTAL for two".padEnd(26)} ${usd(total).padStart(8)}   ≈ ${Math.round(total * S.fx / 1000)}k Kč`);
console.log(`\n   flights are ${Math.round((2 * S.flightEur * S.eurusd / total) * 100)}% of the trip`);
if (!Number.isFinite(total)) process.exit(1);
