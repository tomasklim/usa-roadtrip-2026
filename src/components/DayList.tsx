import { ACTS } from "../data/itinerary";
import photosRaw from "../data/photos.json";
import { difficulty, distLabel, downloadGpx, fmtDate, toGpx, ROUTES } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { Day, Photo, Units } from "../types";

const PHOTOS = photosRaw as unknown as Record<string, Photo>;
const TAG_LABEL: Record<string, string> = {
  gf: "GF", df: "DF", meat: "unusual meat", oy: "oysters", ino: "In-N-Out"
};

export type Lens = "all" | "hi" | "food" | "charge" | "sleep";

export function DayList({ trip, units, selected, onSelect, lens }: {
  trip: Trip; units: Units; selected: string | null;
  onSelect: (id: string) => void; lens: Lens;
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
                <span className="ad">{head.days}</span>
              </div>
            )}
            <DayCard day={d} units={units} lens={lens}
                     selected={selected === d.id} onSelect={() => onSelect(d.id)} />
          </div>
        );
      })}
    </div>
  );
}

export function DayCard({ day, units, lens, selected, onSelect, compact }: {
  day: Day; units: Units; lens: Lens; selected: boolean; onSelect: () => void; compact?: boolean;
}) {
  const show = (k: Lens) => lens === "all" || lens === k;
  const meters = day.meters ?? 0;
  const diff = difficulty(meters);
  const pics = (day.photos ?? []).map((k) => PHOTOS[k]).filter(Boolean) as Photo[];
  const hasRoute = (ROUTES[day.id]?.line?.length ?? 0) > 1;

  return (
    <article className={`day${day.isMod ? " ismod" : ""}${selected && !compact ? " sel" : ""}${compact ? " incard" : ""}`}
             id={compact ? undefined : `day-${day.id}`}>
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
        {pics.length > 0 && show("hi") && (
          <div className={`photos${pics.length > 1 ? " two" : ""}`}>
            {pics.map((p, i) => (
              <figure className="photo" key={i} style={{ margin: 0 }}>
                <img src={p.url} alt={p.alt} loading="lazy" decoding="async" />
                <figcaption className="cr">
                  <a href={p.page} target="_blank" rel="noreferrer noopener">{p.credit} · {p.license}</a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {show("hi") && (
          <>
            <div className="row">
              <div className="ico">✦</div>
              <div className="rc"><div className="rl">Why this day</div><div className="why">{day.why}</div></div>
            </div>
            <div className="row">
              <div className="ico">◎</div>
              <div className="rc">
                <div className="rl">Highlights</div>
                <ul>{day.hi.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </div>
            </div>
            {day.ideas && day.ideas.length > 0 && (
              <div className="row">
                <div className="ico">＋</div>
                <div className="rc">
                  <div className="rl">Ideas, if you have time</div>
                  <ul>{day.ideas.map((h, i) => <li key={i}>{h}</li>)}</ul>
                </div>
              </div>
            )}
          </>
        )}

        {show("sleep") && day.sleep && (
          <div className="row">
            <div className="ico">{day.sleep.t === "car" ? "🚗" : "🛏"}</div>
            <div className="rc">
              <div className="rl">Sleeping</div>
              <span className={`sleep-${day.sleep.t}`}>{day.sleep.t === "car" ? "In the car" : "Motel"}</span>
              {" — "}{day.sleep.where}
              {day.sleep.note && <><br /><span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{day.sleep.note}</span></>}
            </div>
          </div>
        )}

        {show("food") && day.food && day.food.length > 0 && (
          <div className="row">
            <div className="ico">🍽</div>
            <div className="rc">
              <div className="rl">Food</div>
              <ul>
                {day.food.map((f, i) => (
                  <li key={i}>
                    <b>{f.nm}</b>
                    {f.tags.map((t) => <span className={`tag ${t}`} key={t}>{TAG_LABEL[t]}</span>)}
                    <br /><span style={{ color: "var(--muted)" }}>{f.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {show("charge") && day.charge && day.charge.length > 0 && (
          <div className="row">
            <div className="ico">⚡</div>
            <div className="rc">
              <div className="rl">Charging</div>
              <ul>{day.charge.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          </div>
        )}

        {day.alert && (show("charge") || show("hi")) && (
          <div className="alert"><b>Watch out:</b> {day.alert}</div>
        )}
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
