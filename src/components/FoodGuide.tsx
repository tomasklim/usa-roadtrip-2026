import poisRaw from "../data/pois.json";
import type { Poi } from "../types";
import { ACTS } from "../data/itinerary";
import type { Trip } from "../lib/trip";
import { FoodRules } from "./Panels";

const TAG_LABEL: Record<string, string> = {
  gf: "GF", df: "DF", meat: "unusual meat", oy: "oysters", ino: "In-N-Out"
};

/** Built from the live itinerary, so switching a module on changes the food guide too. */
export function FoodGuide({ trip }: { trip: Trip }) {
  const byAct = ACTS.map((act) => ({
    act,
    picks: trip.days
      .filter((d) => d.act === act.id)
      .flatMap((d) => (d.food ?? []).map((f) => ({ ...f, day: d.num, leg: d.title })))
  })).filter((g) => g.picks.length > 0);

  const counts = trip.days
    .flatMap((d) => d.food ?? [])
    .flatMap((f) => f.tags)
    .reduce<Record<string, number>>((a, t) => ({ ...a, [t]: (a[t] ?? 0) + 1 }), {});

  return (
    <section id="food">
      <div className="wrap narrow">
        <div className="shead"><span className="num">06</span><h2>Eating gluten-free and dairy-free</h2></div>
        <p className="sub">
          Food stops for the current route, plus saved alternatives from the map. Gluten-free and dairy-free ordering ideas always need confirmation with the restaurant.
          The plan includes <b>{counts.oy ?? 0} oyster stops</b> and <b>{counts.ino ?? 0} In-N-Out options</b>.
        </p>
        <FoodRules />
        <details className="card panel food-alternatives"><summary>More saved restaurants & grocery stops</summary>
          <p className="hint">Alternatives, not extra meals to fit into the day. Choose the branch closest to where you actually are.</p>
          {ACTS.map(act => {
            const dayIds = new Set(trip.days.filter(d => d.act === act.id).map(d => d.poiDay ?? d.id));
            const picks = (poisRaw as Poi[]).filter(p => p.kind === 'food' && dayIds.has(p.day));
            if (!picks.length) return null;
            return <div key={act.id}><h3>{act.name}</h3>{picks.map(p => <a className="place-link" key={p.id} href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`} target="_blank" rel="noreferrer"><span><b>{p.name}</b><small>{p.city}{p.address ? ` · ${p.address}` : ''}</small></span><span>↗</span></a>)}</div>;
          })}
        </details>

        <div className="food">
          {byAct.map(({ act, picks }) => (
            <div className="card fcard" key={act.id}>
              <h3>Act {act.id}</h3>
              <div className="place">{act.name}</div>
              <ul>
                {picks.map((p, i) => (
                  <li key={i}>
                    <b>{p.nm}</b>
                    {p.tags.map((t) => <span className={`tag ${t}`} key={t}>{TAG_LABEL[t]}</span>)}
                    <br /><span style={{ color: "var(--muted)" }}>{p.note}</span>
                    <br /><span style={{ color: "var(--faint)", fontSize: ".76rem" }}>day {p.day} · {p.leg}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
