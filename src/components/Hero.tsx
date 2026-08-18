import type { Trip } from "../lib/trip";
import { distLabel } from "../lib/trip";
import type { Units } from "../types";

export function Hero({ trip, units }: { trip: Trip; units: Units }) {
  const stats: [string, string, string][] = [
    ["accent", distLabel(trip.meters, units), "driving"],
    ["", String(trip.days.length), "days, Sept 23 – Oct 13"],
    ["", String(trip.driveDays), "days behind the wheel"],
    ["", distLabel(trip.meters / Math.max(1, trip.driveDays), units), "per driving day"],
    ["", String(trip.carNights), "nights in the car"],
    ["", String(trip.sfNights), "nights in San Francisco"]
  ];
  return (
    <div className="hero">
      <div className="wrap">
        <div className="kicker">Sept 23 – Oct 13, 2026 · Tesla Model Y · FSD · two people</div>
        <h1>Seattle → Glacier → Yellowstone → Bonneville → back → San Francisco</h1>
        <p className="lede">
          A northern loop through the Rockies for two, sleeping alternately in the car and in motels,
          with a food line built on oysters, In-N-Out and unusual meat — all gluten-free and dairy-free.
          Every mile below is measured on real road geometry, not estimated.
        </p>
        <div className="stats">
          {stats.map(([cls, big, small], i) => (
            <div className={`stat ${cls}`} key={i}>
              <b className="tnum">{big}</b><small>{small}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
