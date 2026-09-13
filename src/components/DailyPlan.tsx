import { WeatherCard } from "./WeatherCard";
import { useLayoutEffect, useRef } from "react";
import { AlertBox, ChargeRow, FoodRow, HiRow, IdeasRow, PhotoStrip, SleepRow, WhyRow } from "./DayParts";
import { distLabel, downloadGpx, fmtDate, fmtShort, toGpx, type Trip } from "../lib/trip";
import type { Tab } from "./DayPanel";
import type { Day, Poi, Units } from "../types";
import { todayInTrip } from "../lib/navigation";
import poisRaw from "../data/pois.json";

const POIS = poisRaw as Poi[];

export function DayPicker({ trip, day, onSelect }: { trip: Trip; day: Day; onSelect: (id: string) => void }) {
  const index = trip.days.findIndex(d => d.id === day.id);
  const today = todayInTrip(trip);
  return <div className="day-picker">
    <button className="icon-button" aria-label="Previous day" disabled={index <= 0} onClick={() => onSelect(trip.days[index - 1].id)}>←</button>
    <label className="day-select"><span>CHOOSE A DAY</span>
      <select aria-label="Choose itinerary day" value={day.id} onChange={e => onSelect(e.target.value)}>
        {trip.days.map(d => <option key={d.id} value={d.id}>Day {d.num} · {fmtShort(d.date!)} — {d.title}</option>)}
      </select>
    </label>
    <button className="icon-button" aria-label="Next day" disabled={index === trip.days.length - 1} onClick={() => onSelect(trip.days[index + 1].id)}>→</button>
    {today && <button className="action today-button" onClick={() => onSelect(today.id)}>Today</button>}
  </div>;
}

export function DailyPlan({ trip, day, units, tab, setTab, onSelect, onMap }: {
  trip: Trip; day: Day; units: Units; tab: Tab; setTab: (tab: Tab) => void; onSelect: (id: string) => void; onMap: (id: string) => void;
}) {
  const railRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>("[aria-current]");
    if (rail && active && (active.offsetTop < rail.scrollTop || active.offsetTop + active.offsetHeight > rail.scrollTop + rail.clientHeight)) {
      rail.scrollTop = active.offsetTop - rail.clientHeight / 3;
    }
  }, [day.id]);
  const stops = POIS.filter(p => p.day === day.id).sort((a, b) => Number(b.id === "node-palo-alto") - Number(a.id === "node-palo-alto"));
  return <>
    <DayPicker trip={trip} day={day} onSelect={onSelect} />
    <div className="daily-layout">
      <nav ref={railRef} className="day-rail" aria-label="All itinerary days">
        {trip.days.map(d => <button key={d.id} onClick={() => onSelect(d.id)} className={day.id === d.id ? "active" : ""}
          aria-current={day.id === d.id ? "date" : undefined}>
          <span className="rail-number">{String(d.num).padStart(2, "0")}</span><span><small>{fmtShort(d.date!)}</small><b>{d.title}</b></span>
        </button>)}
      </nav>
      <article className="daily-card" aria-label={`Day ${day.num} plan`}>
        <PhotoStrip day={day} single />
        <div className="daily-content">
          <div className="eyebrow">DAY {String(day.num).padStart(2, "0")} / {trip.days.length} <span>· {fmtDate(day.date!)}</span></div>
          <h2>{day.title}</h2>
          <p className="daily-route">{day.leg}</p>
          <div className="day-facts">
            <div><span>ON THE ROAD</span><b>{day.hours ? `${day.hours} h · ${distLabel(day.meters ?? 0, units)}` : "No driving today"}</b></div>
            <div><span>TONIGHT</span><b>{day.sleep ? (day.sleep.t === "car" ? "A night in the car" : "A bed & a shower") : "Overnight flight"}</b></div>
          </div>
          <div className="daily-actions">
            <button className="action primary" onClick={() => onMap(day.id)}>⌖ Show on map</button>
            {!!day.meters && <button className="action" onClick={() => downloadGpx(`day-${day.num}.gpx`, toGpx(day.title, [{id:day.id,title:day.title}]))}>↓ Day GPX</button>}
          </div>
          <WeatherCard day={day} />
          {day.alert && <AlertBox day={day} />}
          <div className="daily-tabs" role="group" aria-label="Day information">
            {([["plan", "The plan"], ["food", "Food"], ["sleep", "Sleep"], ["charge", "Charging"]] as const).map(([id, label]) =>
              <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={tab === id ? "active" : ""}>{label}</button>)}
          </div>
          <div className="daily-tab-content" key={`${day.id}-${tab}`}>
            {tab === "plan" && <><HiRow day={day} /><WhyRow day={day} />
              {!!day.ideas?.length && <details className="extra-ideas"><summary>More ideas if there is time <span>{day.ideas.length}</span></summary><IdeasRow day={day} /></details>}
            </>}
            {tab === "food" && (day.food?.length ? <FoodRow day={day} /> : <p>No food stops planned for this travel day.</p>)}
            {tab === "sleep" && (day.sleep ? <SleepRow day={day} /> : <p>The flight home is tonight. Arrive in Prague on October 14.</p>)}
            {tab === "charge" && (day.charge?.length ? <ChargeRow day={day} /> : <p>No charging stop planned for this day.</p>)}
          </div>
          {!!stops.length && <details className="day-places"><summary>Places & directions <span>{stops.length}</span></summary>
            <p className="hint">Saved places for this day. Open a place in Google Maps for directions.</p>
            {stops.map(p => <a key={p.id} className="place-link" href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`} target="_blank" rel="noreferrer noopener">
              <span><b>{p.name}</b><small>{p.city}{p.id === "node-palo-alto" ? " · MUST VISIT" : ""}</small></span><span aria-hidden="true">↗</span>
            </a>)}
          </details>}
        </div>
      </article>
    </div>
  </>;
}
