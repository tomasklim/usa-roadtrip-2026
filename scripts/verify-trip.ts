import { buildTrip, CAP_DAYS, distLabel, fmtShort, rentals, turoDays } from "../src/lib/trip";
import { MODULES } from "../src/data/itinerary";

const combos: string[][] = [
  [], ["cody"], ["craters"], ["dino"], ["olympic"], ["antelope"],
  ["cody", "craters"], ["dino", "olympic"], ["craters", "antelope"],
  ["cody", "craters", "dino", "olympic", "antelope"]
];

console.log(`window ${CAP_DAYS} days (Sept 23 – Oct 13)\n`);
console.log("modules".padEnd(44), "days".padStart(5), "total".padStart(9), "SLC car".padStart(9),
            "SEA car".padStart(9), "SF".padStart(3), "cut".padStart(4), "over".padStart(5));
let fails = 0;
for (const c of combos) {
  const t = buildTrip(new Set(c));
  const r = rentals(t);
  const problems: string[] = [];
  const dates = t.days.map((d) => d.date!);
  if (dates.some((d) => d === undefined)) problems.push("undated day");
  if (new Set(dates).size !== dates.length) problems.push("duplicate dates");
  for (let i = 1; i < dates.length; i++) if (dates[i] - dates[i - 1] !== 864e5) problems.push("date gap");
  const ids = t.days.map((d) => d.id);
  if (new Set(ids).size !== ids.length) problems.push("duplicate ids: " + ids.filter((x, i) => ids.indexOf(x) !== i));
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
console.log(`\nbase: ${distLabel(base.meters, "mi")} / ${distLabel(base.meters, "km")}, ${base.driveDays} driving days`);
console.log(`longest day: ${distLabel(Math.max(...base.days.map((d) => d.meters ?? 0)), "km")}`);
console.log(`days over 400 km: ${base.days.filter((d) => (d.meters ?? 0) > 400000).length}`);
console.log(`turoDays (SLC block): ${turoDays(base)}, car back ${fmtShort(base.carReturn)}`);
console.log(`\n${MODULES.length} modules, ${fails} failing combos`);
if (fails) process.exit(1);
