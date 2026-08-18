import { buildTrip, blockOf, distLabel } from "../src/lib/trip";
import { MODULES } from "../src/data/itinerary";

const all = new Set(MODULES.map((m) => m.id));
for (const mods of [new Set<string>(), all]) {
  const t = buildTrip(mods);
  const driving = t.days.filter((d) => (d.meters ?? 0) > 0);
  const orphans = driving.filter((d) => blockOf(d.id) === "No car");
  const totals: Record<string, number> = {};
  driving.forEach((d) => { totals[blockOf(d.id)] = (totals[blockOf(d.id)] ?? 0) + (d.meters ?? 0); });
  console.log(`${mods.size ? "all modules" : "base      "} → ` +
    Object.entries(totals).map(([k, v]) => `${k}: ${distLabel(v, "km")}`).join(" · "));
  if (orphans.length) {
    console.log(`   !! ${orphans.length} driving day(s) with no rental block: ${orphans.map((d) => d.id).join(", ")}`);
    process.exit(1);
  }
}
console.log("every driving day belongs to a named car");
