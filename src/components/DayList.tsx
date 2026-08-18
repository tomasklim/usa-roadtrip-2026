import { ACTS } from "../data/itinerary";
import { difficulty, distLabel, downloadGpx, fmtDate, fmtShort, toGpx, ROUTES } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { Day, Units } from "../types";
import { AlertBox, ChargeRow, FoodRow, HiRow, IdeasRow, PhotoStrip, SleepRow, WhyRow } from "./DayParts";

export function DayList({ trip, units, selected, onSelect }: {
  trip: Trip; units: Units; selected: string | null; onSelect: (id: string) => void;
}) {
  const seenActs = new Set<string>();
  return (
    <div className="days">
      {trip.days.map((d) => {
        const head = !seenActs.has(d.act) ? (seenActs.add(d.act), ACTS.find((a) => a.id === d.act)) : null;
        return (
          <div key={d.id}>
            {head && (
              <div className="actrow">
                <span className="an">ACT {head.id}</span>
                <h3>{head.name}</h3>
                <span className="rule" />
                <span className="ad">
                  {fmtShort(d.date ?? 0)} – {fmtShort(trip.days.filter((x) => x.act === d.act).at(-1)?.date ?? 0)}
                </span>
              </div>
            )}
            <DayCard day={d} units={units} selected={selected === d.id} onSelect={() => onSelect(d.id)} />
          </div>
        );
      })}
    </div>
  );
}

export function DayCard({ day, units, selected, onSelect }: {
  day: Day; units: Units; selected: boolean; onSelect: () => void;
}) {
  const meters = day.meters ?? 0;
  const diff = difficulty(meters);
  const hasRoute = (ROUTES[day.id]?.line?.length ?? 0) > 1;
  return (
    <article className={`day${day.isMod ? " ismod" : ""}${selected ? " sel" : ""}`} id={`day-${day.id}`}>
      <div className="dh" onClick={onSelect} role="button" tabIndex={0}
           onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}>
        <span className="dnum">{day.num}</span>
        <span className="dwhen">{day.date ? fmtDate(day.date) : ""}</span>
        <span className="dtitle">{day.title}<span className="dleg">{day.leg}</span></span>
        <span className="dmeta">
          {meters > 0 && <span className="chip mi">{distLabel(meters, units)}</span>}
          {day.hours > 0 && <span className="chip">{day.hours} h</span>}
          {meters > 0 && <span className={`chip ${diff}`}>{diff}</span>}
          {day.isMod && <span className="chip" style={{ color: "var(--plum)" }}>module</span>}
        </span>
      </div>
      <div className="dbody">
        <PhotoStrip day={day} />
        <WhyRow day={day} />
        <HiRow day={day} />
        <IdeasRow day={day} />
        <SleepRow day={day} />
        <FoodRow day={day} />
        <ChargeRow day={day} />
        <AlertBox day={day} />
      </div>
      {hasRoute && (
        <div className="dfoot">
          <button className="mini" onClick={onSelect}>Show on map</button>
          <button className="mini"
                  onClick={() => downloadGpx(`day-${day.num}-${day.id}.gpx`,
                    toGpx(`Day ${day.num} — ${day.title}`, [{ id: day.id, title: day.title }]))}>
            ↓ GPX for this day
          </button>
        </div>
      )}
    </article>
  );
}
