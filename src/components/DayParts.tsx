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
export function PhotoStrip({ day, single }: { day: Day; single?: boolean }) {
  const pics = (day.photos ?? []).map((k) => PHOTOS[k]).filter(Boolean) as Photo[];
  if (!pics.length) return null;
  const shown = single ? pics.slice(0, 1) : pics;
  return (
    <div className={`photos${shown.length > 1 ? " two" : ""}`}>
      {shown.map((p, i) => (
        <figure className="photo" key={i} style={{ margin: 0 }}>
          <img src={p.url} alt={p.alt} loading="lazy" decoding="async" />
          <figcaption className="cr">
            <a href={p.page} target="_blank" rel="noreferrer noopener">{p.credit} · {p.license}</a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
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
        {day.sleep.note && (
          <><br /><span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{day.sleep.note}</span></>
        )}
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
