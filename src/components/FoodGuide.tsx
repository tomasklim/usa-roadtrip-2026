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
          Two allergies and a love of meat fit this route better than you would expect — oysters, steak
          and Basque cooking are naturally gluten-free. Across the current plan that is{" "}
          <b>{counts.oy ?? 0} oyster stops</b>, <b>{counts.ino ?? 0} In-N-Out visits</b> and{" "}
          <b>{counts.meat ?? 0} unusual-meat meals</b>.
        </p>
        <FoodRules />
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
