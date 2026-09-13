import photosRaw from "../data/photos.json";
import type { Day, Photo, Tag } from "../types";

export const PHOTOS = photosRaw as unknown as Record<string, Photo>;
export const TAG_LABEL: Record<Tag, string> = {
  gf: "GF", df: "DF", meat: "unusual meat", oy: "oysters", ino: "In-N-Out"
};

/**
 * The pieces of a day, so the list card and the tabbed map panel render the
 * same content from the same code rather than drifting apart.
 */
export function PhotoStrip({ day, single, priority = false }: { day: Day; single?: boolean; priority?: boolean }) {
  const pics = [...new Set(day.photos ?? [])].map(k => PHOTOS[k]).filter(Boolean).slice(0, single ? 1 : 3);
  if (!pics.length) return null;
  return <figure className={`day-collage collage-${pics.length}`} aria-label={`Photos for ${day.title}`}>
    <div className="collage-images">
      {pics.map((p, i) => <div className={`collage-piece piece-${i + 1}`} key={p.url}>
        <img src={p.url} alt={p.alt} loading={priority ? "eager" : "lazy"} decoding="async"
          srcSet={/\/960px-/.test(p.url) ? `${p.url.replace(/\/960px-/, "/330px-")} 330w, ${p.url} 960w` : undefined}
          sizes={i === 0 ? "(max-width: 900px) 60vw, 40vw" : "(max-width: 900px) 44vw, 24vw"}
          style={{ objectPosition: p.position ?? "50% 50%" }} />
        <span className="collage-label"><i>{String(i + 1).padStart(2, "0")}</i>{p.label}</span>
      </div>)}
    </div>
  </figure>;
}

export const WhyRow = ({ day }: { day: Day }) => (
  <div className="row">
    <div className="ico">✦</div>
    <div className="rc"><div className="rl">Why this day</div><div className="why">{day.why}</div></div>
  </div>
);

export const HiRow = ({ day }: { day: Day }) => (
  <div className="row">
    <div className="ico">◎</div>
    <div className="rc">
      <div className="rl">Highlights</div>
      <ul>{day.hi.map((h, i) => <li key={i}>{h}</li>)}</ul>
    </div>
  </div>
);

export const IdeasRow = ({ day }: { day: Day }) =>
  day.ideas?.length ? (
    <div className="row">
      <div className="ico">＋</div>
      <div className="rc">
        <div className="rl">Ideas, if you have time</div>
        <ul>{day.ideas.map((h, i) => <li key={i}>{h}</li>)}</ul>
      </div>
    </div>
  ) : null;

export const SleepRow = ({ day }: { day: Day }) =>
  day.sleep ? (
    <div className="row">
      <div className="ico">{day.sleep.t === "car" ? "🚗" : "🛏"}</div>
      <div className="rc">
        <div className="rl">Sleeping</div>
        <span className={`sleep-${day.sleep.t}`}>{day.sleep.t === "car" ? "In the car" : "A bed"}</span>
        {" — "}{day.sleep.where}
        {day.sleep.decision && <p className={`sleep-decision${day.sleep.priceException ? " exception" : ""}`}>{day.sleep.decision}</p>}
        {day.sleep.note && (
          <><br /><span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{day.sleep.note}</span></>
        )}
        <p className="hint"><a href="#guide/sleep">Adjust this night ↗</a></p>
      </div>
    </div>
  ) : null;

export const FoodRow = ({ day }: { day: Day }) =>
  day.food?.length ? (
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
  ) : null;

export const ChargeRow = ({ day }: { day: Day }) =>
  day.charge?.length ? (
    <div className="row">
      <div className="ico">⚡</div>
      <div className="rc">
        <div className="rl">Charging</div>
        <ul>{day.charge.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>
    </div>
  ) : null;

export const AlertBox = ({ day }: { day: Day }) =>
  day.alert ? <div className="alert"><b>Watch out:</b> {day.alert}</div> : null;
