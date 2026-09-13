import { ACTS } from "../data/itinerary";
import { CAP_DAYS, DEPART, START, distLabel, fmtShort, rentals, type Trip } from "../lib/trip";
import { navigate } from "../lib/navigation";
import { PHOTOS } from "./DayParts";
import type { Units } from "../types";

export function TripBar({ trip, units, onContinue, dayTitle }: {
  trip: Trip; units: Units; onContinue: () => void; dayTitle: string;
}) {
  const photo = trip.seattle.weather === "rain" ? (trip.seattle.portland ? PHOTOS.portlandriver : PHOTOS.seattle) : PHOTOS.rainier;
  const r = rentals(trip);
  return <div className="tripbar">
    <div className="wrap">
      <div className="trip-hero">
        <div className="hero-copy">
          <div className="eyebrow">THE AMERICAN NORTHWEST · AUTUMN 2026</div>
          <h1>A little further<br />out west.</h1>
          <p className="hero-intro">Mountain mornings, wide-open roads.<br />Seattle to the Rockies, then the California coast.</p>
          <div className="hero-dates">{fmtShort(START)} — {fmtShort(DEPART)} <span>/ {CAP_DAYS} days / two people</span></div>
          <div className="hero-actions">
            <button className="action primary" onClick={onContinue}>Open the daily plan <span aria-hidden="true">↗</span></button>
            <button className="action" onClick={() => document.getElementById("trip-map")?.scrollIntoView({ block: "start", behavior: "instant" })}>Whole trip map</button>
          </div>
          <span className="hero-resume">Ready to open: {dayTitle}</span>
        </div>
        <figure className="hero-photo">
          {photo && <img src={photo.url} alt={photo.alt} fetchPriority="high" />}
          <div className="photo-stamp"><span>{trip.seattle.weather === "rain" ? (trip.seattle.portland ? "PORTLAND / OREGON" : "SEATTLE / WASHINGTON") : "MOUNT RAINIER / WASHINGTON"}</span><b>Take the scenic way.</b></div>
          {photo && <figcaption><a href={photo.page} target="_blank" rel="noreferrer">{photo.credit} · {photo.license}</a></figcaption>}
        </figure>
      </div>
      <div className="trip-facts" aria-label="Trip at a glance">
        <div><b>{distLabel(trip.meters, units)}</b><span>on the road</span></div>
        <div><b>{r.seattle.days + r.slc.days + r.sf.days} rental days</b><span>across three car blocks</span></div>
        <div><b>{trip.sfNights} Bay Area nights</b><span>home in Prague Oct 14</span></div>
        <div><b>Made for two</b><span>gluten-free & dairy-free</span></div>
      </div>
    </div>
  </div>;
}

const CHAPTERS = [
  { id: "I", title: "Evergreens & oyster beds", place: "PACIFIC NORTHWEST", photo: "rainier", text: "Seattle, Mount Rainier & Hood Canal" },
  { id: "II", title: "Salt flats to wild country", place: "THE ROCKIES", photo: "grandprismatic", text: "Bonneville, the Tetons & Yellowstone" },
  { id: "V", title: "One last turn to the coast", place: "CALIFORNIA", photo: "goldengate", text: "San Francisco, Palo Alto & Point Reyes" }
];

export function Chapters({ trip, onPick }: { trip: Trip; onPick: (id: string) => void }) {
  return <div className="chapters">
    {CHAPTERS.map((chapter, i) => {
      const days = trip.days.filter(d => chapter.id === "II" ? ["II", "III", "IV"].includes(d.act) : d.act === chapter.id);
      const photo = PHOTOS[chapter.photo] ?? PHOTOS.seattle;
      return <article className="chapter" key={chapter.id}>
        <div className="chapter-image"><img src={photo.url} alt={photo.alt} loading="lazy" />
          <a className="chapter-credit" href={photo.page} target="_blank" rel="noreferrer">{photo.credit} · {photo.license}</a>
          <span className="chapter-index">0{i + 1}</span>
        </div>
        <div className="chapter-copy"><span className="eyebrow">{chapter.place} · {days.length ? `${fmtShort(days[0].date!)} – ${fmtShort(days.at(-1)!.date!)}` : "not in this plan"}</span>
          <h3>{chapter.title}</h3><p>{chapter.id === "I" ? `Seattle, Hood Canal${trip.seattle.portland ? ", Portland" : ""}${trip.seattle.weather === "good" ? " & Rainier" : ""}` : chapter.text}</p>
          <button className="text-action" disabled={!days.length} onClick={() => onPick(days[0].id)}>Open this chapter <span aria-hidden="true">↗</span></button>
        </div>
      </article>;
    })}
  </div>;
}

export function ActBar({ trip, selected, onPick }: {
  trip: Trip; selected: string | null; onPick: (dayId: string) => void;
}) {
  return <div className="actbar" role="group" aria-label="Trip regions">
    {ACTS.map(act => {
      const days = trip.days.filter(d => d.act === act.id);
      if (!days.length) return null;
      const active = days.some(d => d.id === selected);
      const titles: Record<string, string> = { I: "Seattle & Rainier", II: "Salt & Tetons", III: "Yellowstone", IV: "Back to Salt Lake", V: "Bay Area" };
      return <button key={act.id} className={`actseg${active ? " on" : ""}`} onClick={() => onPick(days[0].id)} aria-pressed={active}>
        <span className="actlbl"><b>{act.id}</b><span>{titles[act.id]}</span></span>
        <span className="actdays">{fmtShort(days[0].date!)} – {fmtShort(days.at(-1)!.date!)}</span>
      </button>;
    })}
  </div>;
}

export function QuickLinks() {
  return <div className="quick-links">
    <button onClick={() => navigate("flights")}><span aria-hidden="true">✈</span><div><b>Flights & connections</b><small>All four journeys, in one place</small></div><span>↗</span></button>
    <button onClick={() => navigate("guide", "checklist")}><span aria-hidden="true">✓</span><div><b>Before we go</b><small>Bookings, packing & the last few things</small></div><span>↗</span></button>
    <button onClick={() => navigate("guide", "risks")}><span aria-hidden="true">⌁</span><div><b>On the road</b><small>Mountain roads & things to check</small></div><span>↗</span></button>
  </div>;
}
