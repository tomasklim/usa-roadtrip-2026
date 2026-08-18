import { ACTS } from "../data/itinerary";
import { distLabel, fmtShort, rentals, type Trip } from "../lib/trip";
import type { Day, Units } from "../types";

/**
 * One line instead of six stat tiles: what this trip is, and its single most
 * useful number. Everything else lives in the map panel or the glance table.
 */
export function TripBar({ trip, units }: { trip: Trip; units: Units }) {
  const r = rentals(trip);
  return (
    <div className="tripbar">
      <div className="wrap">
        <div className="kicker">
          21 days · Sept 23 – Oct 13, 2026 · two people · gluten-free and dairy-free
        </div>
        <h1>Yellowstone, the Tetons and the Bonneville salt — in two short drives instead of one long one</h1>
        <div className="routeline">
          Seattle <b>→</b> Mount Rainier <b>→</b> Hood Canal <b>✈</b> Salt Lake City <b>→</b> Bonneville
          Salt Flats <b>→</b> Bear Lake <b>→</b> Grand Teton <b>→</b> Yellowstone <b>→</b> Beartooth
          Highway <b>→</b> Bozeman <b>→</b> Lava Hot Springs <b>✈</b> San Francisco
        </div>
        <p>
          <b>{distLabel(trip.meters, units)}</b> of driving over <b>{trip.driveDays} days</b> behind the
          wheel, half of them under 200 km — because the 1,300 km run out to Yellowstone gets flown
          rather than driven. Two rental cars ({r.seattle.days} days in Washington,{" "}
          {r.slc.days} in the Rockies), <b>{trip.carNights} nights sleeping in the car</b>, two oyster
          stops worth building a day around, and one Supercharger problem in Gardiner that has to be
          solved before you leave.
        </p>
      </div>
    </div>
  );
}

/**
 * Where you are in twenty-one days. Segments are proportional to each act's
 * length, so the bar is also a rough sense of pace.
 */
export function ActBar({ trip, selected, onPick }: {
  trip: Trip; selected: string | null; onPick: (dayId: string) => void;
}) {
  const groups = ACTS.map((act) => {
    const days = trip.days.filter((d) => d.act === act.id);
    const dates = days.length
      ? `${fmtShort(days[0].date ?? 0)} – ${fmtShort(days[days.length - 1].date ?? 0)}`
      : act.days;
    return { act, days, dates, meters: days.reduce((s, d) => s + (d.meters ?? 0), 0) };
  }).filter((g) => g.days.length > 0);

  const cur = selected ? trip.days.find((d) => d.id === selected) : null;
  const idx = cur ? (cur.num ?? 0) : -1;

  return (
    <div className="actbar" role="group" aria-label="Trip progress by act">
      {groups.map(({ act, days, dates }) => {
        const first = days[0].num ?? 0;
        const last = days[days.length - 1].num ?? 0;
        const active = idx >= first && idx <= last;
        const done = idx > last;
        const within = active ? ((idx - first + 1) / days.length) * 100 : done ? 100 : 0;
        return (
          <button
            key={act.id}
            className={`actseg${active ? " on" : ""}${done ? " done" : ""}`}
            style={{ flexGrow: days.length }}
            onClick={() => onPick(days[0].id)}
            title={`${act.name} — ${days.length} days, ${dates}`}
          >
            <span className="fill" style={{ width: `${within}%` }} />
            <span className="actlbl">
              <b>Act {act.id}</b>
              <span>{shorten(act.name)}</span>
            </span>
            <span className="actdays">{days.length}d</span>
          </button>
        );
      })}
      <span className="actwhere">
        {cur ? `Day ${cur.num} · ${fmtShort(cur.date ?? 0)}` : `${trip.days.length} days total`}
      </span>
    </div>
  );
}

const shorten = (name: string) =>
  name.replace("Seattle, Rainier and oysters off the tideland", "Seattle & Rainier")
      .replace("Salt, Bear Lake and the Tetons", "Salt & the Tetons")
      .replace("Yellowstone and the Beartooth", "Yellowstone")
      .replace("Dinosaurs, hot springs and back to the salt", "Dinosaurs & hot springs")
      .replace("San Francisco", "San Francisco");

export type { Day };
