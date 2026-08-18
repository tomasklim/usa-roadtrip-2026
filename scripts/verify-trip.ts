import { buildTrip, CAP_DAYS, distLabel, fmtShort, turoDays } from "../src/lib/trip";
import { MODULES } from "../src/data/itinerary";

const combos: string[][] = [
  [], ["beartooth"], ["dino"], ["craters"], ["bend"], ["alvord"], ["rainier"], ["olympic"], ["bigsur"],
  ["beartooth", "dino"], ["craters", "bigsur"], ["beartooth", "rainier", "bigsur"],
  ["alvord", "beartooth"], ["alvord", "craters", "bend"],
  ["beartooth", "dino", "craters", "bend", "rainier", "olympic", "bigsur"]
];

console.log(`window is ${CAP_DAYS} days (Sept 23 – Oct 13)\n`);
console.log("modules".padEnd(46), "days".padStart(5), "mi".padStart(7), "drive".padStart(6),
            "SF".padStart(3), "cut".padStart(4), "over".padStart(5), "  car back");
let fails = 0;
for (const c of combos) {
  const t = buildTrip(new Set(c));
  const label = c.join("+") || "(base)";
  const problems: string[] = [];
  if (t.days.length > CAP_DAYS && t.overrun === 0) problems.push("length exceeds cap but overrun=0");
  if (t.days.some((d) => d.date === undefined)) problems.push("day without a date");
  const dates = t.days.map((d) => d.date!);
  if (new Set(dates).size !== dates.length) problems.push("duplicate dates");
  for (let i = 1; i < dates.length; i++) if (dates[i] - dates[i - 1] !== 864e5) problems.push("date gap");
  const ids = t.days.map((d) => d.id);
  if (new Set(ids).size !== ids.length) problems.push("duplicate day ids");
  if (t.meters <= 0) problems.push("zero distance");
  console.log(
    (problems.length ? "✗ " : "✓ ") + label.padEnd(44),
    String(t.days.length).padStart(5), distLabel(t.meters, "mi").padStart(7),
    String(t.driveDays).padStart(6), String(t.sfNights).padStart(3),
    String(t.droppedSf).padStart(4), String(t.overrun).padStart(5),
    " " + fmtShort(t.carReturn), problems.join("; ")
  );
  if (problems.length) fails++;
}
// Conflicting branches must not both apply.
const both = buildTrip(new Set(["alvord", "bend"]));
const hasAlvord = both.days.some((d) => d.modId === "alvord");
const hasBend = both.days.some((d) => d.modId === "bend");
console.log(`\nalvord+bend forced together → alvord:${hasAlvord} bend:${hasBend} (UI prevents this; data must not corrupt)`);
console.log(`turoDays(base) = ${turoDays(buildTrip(new Set()))}`);
console.log(`\n${MODULES.length} modules, ${fails} failing combos`);
if (fails) process.exit(1);
