import { MODULES } from "../data/itinerary";
import { distLabel, fmtShort, metersOf, type Trip } from "../lib/trip";
import type { Units } from "../types";

export function Modules({ on, toggle, trip, units }: {
  on: Set<string>; toggle: (id: string) => void; trip: Trip; units: Units;
}) {
  return (
    <div className="card panel">
      <h3>Modules — what you can add</h3>
      <p className="hint">
        Everything trimmed from a longer first draft, still switchable. The flight home is fixed,
        so extra days come out of San Francisco — and it says so below.
      </p>
      <div className="mods">
        {MODULES.map((m) => {
          const active = on.has(m.id);
          const meters = m.days.reduce((s, d) => s + metersOf(d.id), 0);
          return (
            <label className={`mod${active ? " on" : ""}`} key={m.id}>
              <input type="checkbox" checked={active} onChange={() => toggle(m.id)} />
              <span className="rc">
                <span className="mt">{m.name}</span>
                <span className="md">{m.desc}</span>
              </span>
              <span className="mc">
                {m.cost}<br />+{distLabel(meters, units)}<br />
                <span className={`risk ${m.risk}`}>{m.risk === "hi" ? "risk" : "easy"}</span>
              </span>
            </label>
          );
        })}
      </div>
      <Verdict trip={trip} />
    </div>
  );
}

function Verdict({ trip }: { trip: Trip }) {
  if (trip.overrun > 0) {
    return (
      <div className="warn">
        This is <b>{trip.overrun} day{trip.overrun === 1 ? "" : "s"} too long</b> for the booked window
        even with San Francisco cut to nothing. Switch something off, or move the flight home.
      </div>
    );
  }
  if (trip.droppedSf > 0) {
    return (
      <div className="warn">
        Fits, but it <b>costs {trip.droppedSf} San Francisco day{trip.droppedSf === 1 ? "" : "s"}</b> —
        you would land there on {fmtShort(trip.flyDate)} with {trip.sfNights} night
        {trip.sfNights === 1 ? "" : "s"} before flying home.
      </div>
    );
  }
  return (
    <div className="warn ok">
      Car back in Seattle {fmtShort(trip.carReturn)}, San Francisco from {fmtShort(trip.flyDate)},
      <b> {trip.sfNights} nights</b> there before the flight home.
      {trip.spare > 0 && <> Still <b>{trip.spare} spare day{trip.spare === 1 ? "" : "s"}</b> in the window.</>}
    </div>
  );
}
