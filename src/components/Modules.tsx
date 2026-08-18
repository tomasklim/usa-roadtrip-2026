import { useMemo } from "react";
import { MODULES, SLEEP_STYLES } from "../data/itinerary";
import { buildTrip, distLabel, fmtShort, metersOf, type Trip } from "../lib/trip";
import { PHOTOS } from "./DayParts";
import type { SleepStyle, Units } from "../types";

/**
 * Each module as a cost card: its three real numbers, a before/after of the days
 * it rewrites, and a hover that ghosts its route onto the map. The point is that
 * the trade is visible before you make it rather than explained afterwards.
 */
export function Modules({ on, toggle, trip, units, sleepStyle, setSleepStyle, onSelect, onHover }: {
  on: Set<string>; toggle: (id: string) => void; trip: Trip; units: Units;
  sleepStyle: SleepStyle; setSleepStyle: (s: SleepStyle) => void;
  onSelect: (dayId: string) => void;
  onHover: (moduleId: string | null) => void;
}) {
  // Real deltas: build the trip with the module flipped and diff the result.
  const deltas = useMemo(() => {
    const out: Record<string, { days: number; meters: number; sf: number }> = {};
    for (const m of MODULES) {
      const next = new Set(on);
      if (next.has(m.id)) next.delete(m.id); else next.add(m.id);
      (m.conflicts ?? []).forEach((c) => { if (!on.has(m.id)) next.delete(c); });
      const other = buildTrip(next, sleepStyle);
      const sign = on.has(m.id) ? -1 : 1;
      out[m.id] = {
        days: (other.driveDays - trip.driveDays) * sign,
        meters: (other.meters - trip.meters) * sign,
        sf: (other.sfNights - trip.sfNights) * sign
      };
    }
    return out;
  }, [on, sleepStyle, trip]);

  return (
    <div className="card panel">
      <h3>Modules — the decisions still open</h3>
      <p className="hint">
        The flight home is fixed, so anything you add comes out of San Francisco. Hover a card to see
        its route on the map before you commit.
      </p>

      <div className="modgrid">
        {MODULES.map((m) => {
          const active = on.has(m.id);
          const d = deltas[m.id] ?? { days: 0, meters: 0, sf: 0 };
          const photo = m.days.map((x) => x.photos?.[0]).find(Boolean);
          const ph = photo ? PHOTOS[photo] : undefined;
          const before = m.replaces
            ? trip.days.filter((x) => !x.isMod && x.id >= m.replaces![0] && x.id <= m.replaces![1])
            : [];
          const after = m.days;
          const maxM = Math.max(1, ...before.map((x) => x.meters ?? 0), ...after.map((x) => metersOf(x.id)));
          return (
            <div key={m.id} className={`modcard${active ? " on" : ""}`}
                 onMouseEnter={() => onHover(m.id)} onMouseLeave={() => onHover(null)}>
              {ph && <img className="modimg" src={ph.url} alt={ph.alt} loading="lazy" decoding="async" />}
              <div className="modbody">
                <div className="modtop">
                  <span className="modname">{m.name}</span>
                  <span className={`risk ${m.risk}`}>{m.risk === "hi" ? "risk" : "easy"}</span>
                </div>
                <p className="moddesc">{m.desc}</p>

                <div className="modnums">
                  <span className={`num ${d.days > 0 ? "up" : d.days < 0 ? "down" : ""}`}>
                    {fmt(d.days)} {Math.abs(d.days) === 1 ? "day" : "days"}
                  </span>
                  <span className={`num ${d.meters > 0 ? "up" : d.meters < 0 ? "down" : ""}`}>
                    {d.meters >= 0 ? "+" : "−"}{distLabel(Math.abs(d.meters), units)}
                  </span>
                  <span className={`num ${d.sf < 0 ? "warn" : d.sf > 0 ? "down" : ""}`}>
                    {fmt(d.sf)} SF {Math.abs(d.sf) === 1 ? "night" : "nights"}
                  </span>
                </div>

                {before.length > 0 && (
                  <div className="modba">
                    <div className="ba">
                      <span className="balbl">now</span>
                      <div className="bars">
                        {before.map((x) => (
                          <i key={x.id} style={{ height: `${((x.meters ?? 0) / maxM) * 100}%` }}
                             title={`${x.title} — ${distLabel(x.meters ?? 0, units)}`} />
                        ))}
                      </div>
                    </div>
                    <span className="baarrow">→</span>
                    <div className="ba">
                      <span className="balbl">with it</span>
                      <div className="bars alt">
                        {after.map((x) => (
                          <i key={x.id} style={{ height: `${(metersOf(x.id) / maxM) * 100}%` }}
                             title={`${x.title} — ${distLabel(metersOf(x.id), units)}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="modacts">
                  <button className={`modbtn${active ? " off" : ""}`} onClick={() => toggle(m.id)}>
                    {active ? "Remove" : "Add"}
                  </button>
                  {active && (
                    <button className="mini" onClick={() => onSelect(m.days[0].id)}>◎ map</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Verdict trip={trip} />

      <h3 style={{ marginTop: 18 }}>Where you sleep</h3>
      <p className="hint">
        {trip.carNights} night{trip.carNights === 1 ? "" : "s"} in the car,{" "}
        {Math.max(0, trip.days.length - 1 - trip.carNights)} in a bed.
      </p>
      <div className="mapbar" style={{ padding: 0, border: 0 }}>
        {SLEEP_STYLES.map((st) => (
          <button key={st.id} className={`pill${sleepStyle === st.id ? " on" : ""}`}
                  title={st.desc} onClick={() => setSleepStyle(st.id)}>{st.label}</button>
        ))}
      </div>
      <p className="hint" style={{ margin: "9px 0 0" }}>
        {SLEEP_STYLES.find((s) => s.id === sleepStyle)?.desc}
      </p>
    </div>
  );
}

const fmt = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "±0");

function Verdict({ trip }: { trip: Trip }) {
  if (trip.overrun > 0) {
    return (
      <div className="warn">
        This is <b>{trip.overrun} day{trip.overrun === 1 ? "" : "s"} too long</b> for the booked window
        even with San Francisco cut to nothing. Remove something, or move the flight home.
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
      Car back in Salt Lake {fmtShort(trip.carReturn)}, San Francisco from {fmtShort(trip.flyDate)},
      <b> {trip.sfNights} nights</b> there before the flight home.
      {trip.spare > 0 && <> Still <b>{trip.spare} spare day{trip.spare === 1 ? "" : "s"}</b> in the window.</>}
    </div>
  );
}
