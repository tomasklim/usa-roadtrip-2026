import { difficulty, distLabel, downloadGpx, fmtDate, fmtShort, rentals, toGpx, type Trip } from "../lib/trip";
import type { Day, Units } from "../types";
import { AlertBox, ChargeRow, FoodRow, HiRow, IdeasRow, PhotoStrip, SleepRow, WhyRow } from "./DayParts";

export interface Sheet {
  frac: number;
  onStart: (e: React.PointerEvent<HTMLDivElement>) => void;
  onMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onEnd: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const Grab = ({ sheet }: { sheet?: Sheet }) =>
  sheet ? (
    <div className="sheetgrab" onPointerDown={sheet.onStart} onPointerMove={sheet.onMove}
         onPointerUp={sheet.onEnd} onPointerCancel={sheet.onEnd}
         role="separator" aria-orientation="horizontal" aria-label="Drag to resize">
      <span />
    </div>
  ) : null;

type Tab = "plan" | "food" | "sleep" | "charge";

const TABS: { id: Tab; label: string }[] = [
  { id: "plan", label: "Plan" }, { id: "food", label: "Food" },
  { id: "sleep", label: "Sleep" }, { id: "charge", label: "Charge" }
];

/**
 * The selected day over the right of the map, split into tabs so the panel never
 * scrolls past the thing you opened it for. Badges mean you can see there is a
 * charging warning without opening that tab.
 */
export function DayPanel({ day, units, count, width, tab, setTab, sheet, onClose, onStep, onScrollTo }: {
  day: Day; units: Units; count: number; width: number; sheet?: Sheet;
  tab: Tab; setTab: (t: Tab) => void;
  onClose: () => void;
  onStep: (delta: number) => void;
  onScrollTo: (id: string) => void;
}) {
  const meters = day.meters ?? 0;
  const badge = (t: Tab) => {
    if (t === "food") return day.food?.length ? String(day.food.length) : "";
    if (t === "sleep") return day.sleep ? (day.sleep.t === "car" ? "car" : "bed") : "";
    if (t === "charge") return day.alert ? "!" : day.charge?.length ? String(day.charge.length) : "";
    return day.ideas?.length ? String(day.hi.length + day.ideas.length) : String(day.hi.length);
  };

  return (
    <aside className="detail" style={sheet ? { height: `${sheet.frac * 100}%` } : { width }}
           aria-label={`Day ${day.num} detail`}>
      <Grab sheet={sheet} />
      <div className="detail-head">
        <button className="mini" onClick={() => onStep(-1)} title="Previous day (←)">←</button>
        <span className="detail-count tnum">{(day.num ?? 0) + 1} / {count}</span>
        <button className="mini" onClick={() => onStep(1)} title="Next day (→)">→</button>
        <span style={{ flex: 1 }} />
        <button className="mini" onClick={() => onScrollTo(day.id)} title="Show this day in the list below">list ↓</button>
        <button className="mini" onClick={onClose} title="Close (Esc)">✕</button>
      </div>

      <div className="detail-fixed">
        <PhotoStrip day={day} single />
        <div className="dpt">
          <span className="dpnum">{day.num}</span>
          <span className="dpwhen">{day.date ? fmtDate(day.date) : ""}</span>
        </div>
        <h3 className="dphead">{day.title}</h3>
        <div className="dpleg">{day.leg}</div>
        <div className="dmeta" style={{ marginTop: 8 }}>
          {meters > 0 && <span className="chip mi">{distLabel(meters, units)}</span>}
          {day.hours > 0 && <span className="chip">{day.hours} h</span>}
          {meters > 0 && <span className={`chip ${difficulty(meters)}`}>{difficulty(meters)}</span>}
          {day.isMod && <span className="chip" style={{ color: "var(--plum)" }}>module</span>}
        </div>
        <div className="dptabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id}
                    className={`dptab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
              {badge(t.id) && (
                <span className={`dpbadge${t.id === "charge" && day.alert ? " warn" : ""}`}>{badge(t.id)}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-body tabbed">
        {tab === "plan" && <><WhyRow day={day} /><HiRow day={day} /><IdeasRow day={day} /></>}
        {tab === "food" && (day.food?.length
          ? <FoodRow day={day} />
          : <p className="empty">Nothing planned to eat on this day — it is a travel or rest day.</p>)}
        {tab === "sleep" && (day.sleep
          ? <SleepRow day={day} />
          : <p className="empty">No overnight on this day.</p>)}
        {tab === "charge" && (<>
          <AlertBox day={day} />
          {day.charge?.length
            ? <ChargeRow day={day} />
            : <p className="empty">No charging to think about — either no driving, or the next stop handles it.</p>}
        </>)}
        {(ROUTE_HAS(day) && (
          <div className="dfoot" style={{ borderTop: "1px dashed var(--line)", background: "transparent" }}>
            <button className="mini"
                    onClick={() => downloadGpx(`day-${day.num}-${day.id}.gpx`,
                      toGpx(`Day ${day.num} — ${day.title}`, [{ id: day.id, title: day.title }]))}>
              ↓ GPX for this day
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}

const ROUTE_HAS = (d: Day) => (d.meters ?? 0) > 0;

/**
 * What the panel shows before anything is selected: what this trip is, and how
 * to drive the map. Better than an empty rectangle on first load.
 */
export function OverviewPanel({ trip, units, width, sheet, onStart, onClose }: {
  trip: Trip; units: Units; width: number; sheet?: Sheet; onStart: () => void; onClose: () => void;
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
    <aside className="detail" style={sheet ? { height: `${sheet.frac * 100}%` } : { width }}
           aria-label="Trip overview">
      <Grab sheet={sheet} />
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
            <div key={i}><b className="tnum">{big}</b><span>{small}</span></div>
          ))}
        </div>
        <h4>The shape of it</h4>
        <ol className="ovsteps">
          <li><b>Seattle</b> — two days on foot, then a {r.seattle.days}-day car across Mount Rainier
            and up Hood Canal for the trip's best oysters ({distLabel(r.seattle.meters, units)}).</li>
          <li><b>Fly to Salt Lake City</b> — collect the Tesla and drive onto the Bonneville Salt Flats
            the same afternoon.</li>
          <li><b>North through the parks</b> — Bear Lake, Grand Teton, Yellowstone, the Beartooth
            Highway and Bozeman's dinosaurs: {r.slc.days} days, {distLabel(r.slc.meters, units)}.</li>
          <li><b>Back to Salt Lake</b> via Idaho Falls and Lava Hot Springs, car back {fmtShort(trip.carReturn)}.</li>
          <li><b>Fly to San Francisco</b> — {trip.sfNights} nights, Point Reyes, and the second of the
            trip's two oyster stops. Home Oct 13.</li>
        </ol>
        <h4>Driving the map</h4>
        <ul className="ovhelp">
          <li><b>← and →</b> walk the trip day by day; this panel becomes that day. <b>Esc</b> closes it.</li>
          <li>Click any pin or route line to open it. Nothing scrolls unless you press <b>list ↓</b>.</li>
          <li>Pins are colour-coded: <span className="k sight">sights</span>{" "}
            <span className="k food">food</span> <span className="k oyster">oysters</span>{" "}
            <span className="k ino">In-N-Out</span> <span className="k charge">Superchargers</span>{" "}
            <span className="k store">Whole Foods</span>. Hover for a name; zoom in and the names stay on.</li>
          <li><b>Pinch</b> to zoom. A plain two-finger scroll still scrolls the page.</li>
          <li>The bar above the map is the five acts — click one to jump to it.</li>
        </ul>
        <button className="ovgo" onClick={onStart}>Start at day 0 →</button>
      </div>
    </aside>
  );
}

export type { Tab };
