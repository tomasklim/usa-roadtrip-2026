import { DayCard, type Lens } from "./DayList";
import { distLabel, fmtShort, rentals, type Trip } from "../lib/trip";
import type { Day, Units } from "../types";

/**
 * The selected day, shown over the right-hand side of the map rather than making
 * you scroll away from it. Reuses DayCard so the two views cannot drift apart.
 */
export function DayPanel({ day, units, lens, count, width, onClose, onStep, onScrollTo }: {
  day: Day; units: Units; lens: Lens; count: number; width: number;
  onClose: () => void;
  onStep: (delta: number) => void;
  onScrollTo: (id: string) => void;
}) {
  return (
    <aside className="detail" style={{ width }} aria-label={`Day ${day.num} detail`}>
      <div className="detail-head">
        <button className="mini" onClick={() => onStep(-1)} title="Previous day (←)">←</button>
        <span className="detail-count">{(day.num ?? 0) + 1} / {count}</span>
        <button className="mini" onClick={() => onStep(1)} title="Next day (→)">→</button>
        <span style={{ flex: 1 }} />
        <button className="mini" onClick={() => onScrollTo(day.id)} title="Show this day in the list below">
          list ↓
        </button>
        <button className="mini" onClick={onClose} title="Close (Esc)">✕</button>
      </div>
      <div className="detail-body">
        <DayCard day={day} units={units} lens={lens} selected onSelect={() => {}} compact />
      </div>
    </aside>
  );
}

/**
 * What the panel shows before anything is selected: what this trip is, and how
 * to drive the map. Better than an empty rectangle on first load.
 */
export function OverviewPanel({ trip, units, width, onStart, onClose }: {
  trip: Trip; units: Units; width: number; onStart: () => void; onClose: () => void;
}) {
  const r = rentals(trip);
  const stats: [string, string][] = [
    [distLabel(trip.meters, units), "driving, measured on real roads"],
    [`${trip.days.length} days`, "Sept 23 – Oct 13, 2026"],
    [`${trip.driveDays}`, "days behind the wheel"],
    [distLabel(trip.meters / Math.max(1, trip.driveDays), units), "per driving day"],
    [`${trip.carNights}`, "nights in the car"],
    [`${trip.sfNights}`, "nights in San Francisco"]
  ];
  return (
    <aside className="detail" style={{ width }} aria-label="Trip overview">
      <div className="detail-head">
        <span className="detail-title">The trip</span>
        <span style={{ flex: 1 }} />
        <button className="mini" onClick={onStart} title="Open the first day (→)">start →</button>
        <button className="mini" onClick={onClose} title="Hide this panel">✕</button>
      </div>
      <div className="detail-body ov">
        <h3>Two short driving blocks, with a flight between them</h3>
        <p>
          Seattle to Yellowstone is 1,300 km each way and the car has to come back, so a single loop
          out of Seattle costs about 5,000 km of driving. Flying over the transit instead brings it
          down to <b>{distLabel(trip.meters, units)}</b> — and turns half the driving days into short
          park days.
        </p>
        <div className="ovstats">
          {stats.map(([big, small], i) => (
            <div key={i}><b>{big}</b><span>{small}</span></div>
          ))}
        </div>
        <h4>The shape of it</h4>
        <ol className="ovsteps">
          <li><b>Seattle</b> — two days on foot, then a {r.seattle.days}-day car for a loop across
            Mount Rainier and up Hood Canal for the trip's best oysters ({distLabel(r.seattle.meters, units)}).</li>
          <li><b>Fly to Salt Lake City</b> — pick up the Tesla and drive straight onto the Bonneville
            Salt Flats the same afternoon.</li>
          <li><b>North through the parks</b> — Bear Lake, Grand Teton, Yellowstone, the Beartooth
            Highway and Bozeman's dinosaurs, {r.slc.days} days and {distLabel(r.slc.meters, units)}.</li>
          <li><b>Back to Salt Lake</b> via Idaho Falls and Lava Hot Springs, car back {fmtShort(trip.carReturn)}.</li>
          <li><b>Fly to San Francisco</b> — {trip.sfNights} nights, Point Reyes, and the second of the
            trip's two oyster stops. Home Oct 13.</li>
        </ol>
        <h4>Driving the map</h4>
        <ul className="ovhelp">
          <li><b>← and →</b> walk the trip day by day; this panel follows. <b>Esc</b> closes it.</li>
          <li>Click any pin or route line to open it. Nothing scrolls unless you press <b>list ↓</b>.</li>
          <li>Pins are colour-coded: <span className="k sight">sights</span>{" "}
            <span className="k food">food</span> <span className="k oyster">oysters</span>{" "}
            <span className="k ino">In-N-Out</span> <span className="k charge">Superchargers</span>{" "}
            <span className="k store">Whole Foods</span>. Hover for a name; zoom in and the names stay on.</li>
          <li><b>Pinch</b> to zoom. A plain two-finger scroll still scrolls the page.</li>
          <li>Switch layers, basemaps and modules in the bar under the map. Every day exports as GPX.</li>
        </ul>
        <button className="ovgo" onClick={onStart}>Start at day 0 →</button>
      </div>
    </aside>
  );
}
