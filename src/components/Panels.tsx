import { CHARGE_ROWS, FOOD_RULES, RISKS, SLEEP_CARDS } from "../data/reference";
import { SLEEP_STYLES } from "../data/itinerary";
import { difficulty, distLabel, fmtShort } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { SleepStyle, Units } from "../types";
import type { Lens } from "./DayList";

const LENSES: [Lens, string][] = [
  ["all", "Everything"], ["hi", "Highlights"], ["food", "Food"],
  ["charge", "Charging"], ["sleep", "Sleeping"]
];

export function LensBar({ lens, setLens }: { lens: Lens; setLens: (l: Lens) => void }) {
  return (
    <div className="card panel">
      <h3>Focus</h3>
      <p className="hint">Trim the day cards down to whatever you are solving right now.</p>
      <div className="mapbar" style={{ padding: 0, border: 0 }}>
        {LENSES.map(([k, label]) => (
          <button key={k} className={`pill${lens === k ? " on" : ""}`} onClick={() => setLens(k)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

export function Glance({ trip, units, onSelect }: {
  trip: Trip; units: Units; onSelect: (id: string) => void;
}) {
  return (
    <section id="glance">
      <div className="wrap narrow">
        <div className="shead"><span className="num">03</span><h2>At a glance</h2></div>
        <p className="sub">
          Every day, its distance measured on real road geometry, and how hard it actually is.
          Click a row to pull it up on the map.
        </p>
        <div className="card" style={{ padding: "2px 0" }}>
          <div className="tscroll">
            <table>
              <thead>
                <tr><th>Day</th><th>Date</th><th>Leg</th><th>Distance</th><th>Wheel</th><th>Load</th><th>Night</th></tr>
              </thead>
              <tbody>
                {trip.days.map((d) => (
                  <tr key={d.id} className="clickable" onClick={() => onSelect(d.id)}>
                    <td className="n">{d.num}</td>
                    <td className="n">{d.date ? fmtShort(d.date) : ""}</td>
                    <td>{d.title}{d.isMod && <span className="tag" style={{ background: "var(--plum-soft)", color: "var(--plum)" }}>module</span>}</td>
                    <td className="n">{(d.meters ?? 0) > 0 ? distLabel(d.meters ?? 0, units) : "—"}</td>
                    <td className="n">{d.hours > 0 ? `${d.hours} h` : "—"}</td>
                    <td className="n">{(d.meters ?? 0) > 0 ? difficulty(d.meters ?? 0) : "—"}</td>
                    <td>{d.sleep ? (d.sleep.t === "car" ? "car" : "motel") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LoadChart({ trip, units, onSelect }: {
  trip: Trip; units: Units; onSelect: (id: string) => void;
}) {
  const data = trip.days.filter((d) => (d.meters ?? 0) > 0);
  const w = 900, h = 250, pad = { l: 38, r: 8, t: 12, b: 28 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const vals = data.map((d) => (units === "mi" ? (d.meters ?? 0) / 1609.344 : (d.meters ?? 0) / 1000));
  const step = units === "mi" ? 100 : 200;
  const max = Math.max(step * 2, Math.ceil(Math.max(...vals, 1) / step) * step);
  const bw = iw / Math.max(1, data.length);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const grid: number[] = [];
  for (let g = 0; g <= max; g += step) grid.push(g);

  return (
    <section id="load">
      <div className="wrap narrow">
        <div className="shead"><span className="num">04</span><h2>Where it hurts</h2></div>
        <p className="sub">
          Distance per driving day. Under 130 {units} is easy, over 350 {units} is a transfer where
          FSD and a podcast earn their keep. Click a bar to jump to the day.
        </p>
        <div className="card chart">
          <svg className="bars" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Distance per day in ${units}`}>
            {grid.map((g) => (
              <g key={g}>
                <line className="gl" x1={pad.l} y1={y(g)} x2={w - pad.r} y2={y(g)} />
                <text className="gt" x={2} y={y(g) + 3}>{g}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const v = vals[i], x = pad.l + i * bw, bwid = Math.max(5, bw - 5);
              const cls = d.isMod ? "modbar" : difficulty(d.meters ?? 0);
              return (
                <g key={d.id}>
                  <rect className={`bar ${cls}`} x={x + 2.5} y={y(v)} width={bwid}
                        height={pad.t + ih - y(v)} rx={3} onClick={() => onSelect(d.id)}>
                    <title>{`Day ${d.num}: ${d.leg} — ${distLabel(d.meters ?? 0, units)}`}</title>
                  </rect>
                  <text className="bv" x={x + 2.5 + bwid / 2} y={y(v) - 4}>{Math.round(v)}</text>
                  <text className="bx" x={x + 2.5 + bwid / 2} y={h - 9}>{d.num}</text>
                </g>
              );
            })}
            <line className="gl" x1={pad.l} y1={pad.t + ih} x2={w - pad.r} y2={pad.t + ih} />
          </svg>
          <div className="legend">
            <span><i style={{ background: "var(--pine)" }} />easy</span>
            <span><i style={{ background: "var(--sky)" }} />moderate</span>
            <span><i style={{ background: "var(--gold)" }} />long / crux</span>
            <span><i style={{ background: "var(--plum)" }} />module day</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Charging() {
  return (
    <section id="charging">
      <div className="wrap narrow">
        <div className="shead"><span className="num">05</span><h2>Charging</h2></div>
        <p className="sub">
          A Model Y Long Range realistically does 250–280 miles at highway speed, less in the mountains
          and in the cold. Highlighted rows need managing — and one is genuinely critical. Switch on the
          charger layer on the map to see every Supercharger along the route.
        </p>
        <div className="card" style={{ padding: "2px 0" }}>
          <div className="tscroll">
            <table>
              <thead><tr><th>Leg</th><th>Road</th><th>Chargers</th><th>Verdict</th></tr></thead>
              <tbody>
                {CHARGE_ROWS.map(([leg, road, ch, verdict, cls]) => (
                  <tr key={leg} className={cls}>
                    <td><b>{leg}</b></td><td className="n">{road}</td><td>{ch}</td><td>{verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card rules" style={{ marginTop: 14, borderLeftColor: "var(--rust)" }}>
          <h3 style={{ fontSize: ".98rem" }}>Northern Yellowstone — the one real risk</h3>
          <p style={{ margin: "6px 0 0", fontSize: ".89rem", color: "var(--muted)" }}>
            Gardiner has no Supercharger — only an L2 at Yellowstone Forever (2 ports) and a CCS L3 at
            the Sinclair. Without charging there, Bozeman SC → Gardiner → Lamar → the whole park loop →
            West Yellowstone SC is over 300 miles on one battery, and that does not work. Two fixes,
            and you want both:
          </p>
          <ul style={{ fontSize: ".89rem" }}>
            <li>book a Gardiner motel <b>with an L2 charger</b> — eight hours overnight adds roughly 240 miles;</li>
            <li>ask the Turo host for the <b>CCS Combo 1 adapter</b>, which also unlocks Cody on the Beartooth module.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Cards({ id, num, title, sub, cards }: {
  id: string; num: string; title: string; sub: string;
  cards: { h: string; body: string; dl?: string }[];
}) {
  return (
    <section id={id}>
      <div className="wrap narrow">
        <div className="shead"><span className="num">{num}</span><h2>{title}</h2></div>
        <p className="sub">{sub}</p>
        <div className="grid2">
          {cards.map((c) => (
            <div className="card rcard" key={c.h}>
              <h3>{c.h}</h3>
              <p dangerouslySetInnerHTML={{ __html: c.body }} />
              {c.dl && <span className="dl">{c.dl}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SleepSection({ trip, sleepStyle, setSleepStyle }: {
  trip: Trip; sleepStyle: SleepStyle; setSleepStyle: (s: SleepStyle) => void;
}) {
  const carNights = trip.days.filter((d) => d.sleep?.t === "car");
  const nights = Math.max(0, trip.days.length - 1);
  return (
    <section id="sleep">
      <div className="wrap narrow">
        <div className="shead"><span className="num">07</span><h2>Sleeping: a mattress in the Model Y</h2></div>
        <p className="sub">
          With the rear seats folded there is a <b>75 × 41 in (190 × 104 cm)</b> platform, up to 83 in
          long with the front seats pushed forward. Tight for two, but it works — and the real
          constraint is not space, it is temperature and showers.
        </p>

        <div className="card panel" style={{ marginBottom: 14 }}>
          <h3>How much do you want to sleep in the car?</h3>
          <p className="hint">
            Currently <b>{carNights.length} of {nights} nights</b> in the car.
            Every option here is a real, legal spot — the difference is how cold it gets.
          </p>
          <div className="mapbar" style={{ padding: 0, border: 0 }}>
            {SLEEP_STYLES.map((st) => (
              <button key={st.id} className={`pill${sleepStyle === st.id ? " on" : ""}`}
                      onClick={() => setSleepStyle(st.id)}>{st.label}</button>
            ))}
          </div>
          {carNights.length > 0 && (
            <div className="tscroll" style={{ marginTop: 14 }}>
              <table>
                <thead><tr><th>Night</th><th>Where</th><th>Why it works, or does not</th></tr></thead>
                <tbody>
                  {carNights.map((d) => (
                    <tr key={d.id}>
                      <td className="n">{d.date ? fmtShort(d.date) : ""}</td>
                      <td>{d.sleep!.where}</td>
                      <td style={{ color: "var(--muted)" }}>{d.sleep!.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid2">
          {SLEEP_CARDS.map((c) => (
            <div className="card rcard" key={c.h}>
              <h3>{c.h}</h3>
              <p dangerouslySetInnerHTML={{ __html: c.body }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const RiskSection = () => (
  <Cards id="risks" num="10" title="Risks and plan B"
         sub="Late September and early October is the edge of the season in the Rockies. These are the dates the roads close on, and what to do when the weather turns."
         cards={RISKS} />
);

export function FoodRules() {
  return (
    <div className="card rules">
      <h3 style={{ fontSize: ".98rem" }}>Rules that always work</h3>
      <ul>{FOOD_RULES.map((r, i) => <li key={i} dangerouslySetInnerHTML={{ __html: r }} />)}</ul>
    </div>
  );
}
