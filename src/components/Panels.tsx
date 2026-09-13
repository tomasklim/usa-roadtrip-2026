import { CHARGE_ROWS, FOOD_RULES } from "../data/reference";
import { blockOf, difficulty, distLabel, fmtShort } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { Units } from "../types";

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
                  <tr key={d.id} className="clickable" onClick={() => onSelect(d.id)} tabIndex={0}
                      aria-label={`Show day ${d.num} on map: ${d.title}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(d.id); }
                      }}>
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
  const easyLimit = units === "mi" ? 130 : 210;
  const transferLimit = units === "mi" ? 350 : 565;
  const data = trip.days.filter((d) => (d.meters ?? 0) > 0);
  const w = 900, h = 290, pad = { l: 38, r: 8, t: 34, b: 28 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const vals = data.map((d) => (units === "mi" ? (d.meters ?? 0) / 1609.344 : (d.meters ?? 0) / 1000));
  const step = units === "mi" ? 100 : 200;
  const max = Math.max(step * 2, Math.ceil(Math.max(...vals, 1) / step) * step);
  const bw = iw / Math.max(1, data.length);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const grid: number[] = [];
  for (let g = 0; g <= max; g += step) grid.push(g);

  // Contiguous runs of days belonging to the same car, so it is obvious which
  // bars are the Seattle rental and which are the Salt Lake one.
  const bands: { label: string; from: number; to: number; meters: number }[] = [];
  data.forEach((d, i) => {
    const b = blockOf(d);
    const last = bands[bands.length - 1];
    if (last && last.label === b) { last.to = i; last.meters += d.meters ?? 0; }
    else bands.push({ label: b, from: i, to: i, meters: d.meters ?? 0 });
  });

  return (
    <section id="load">
      <div className="wrap narrow">
        <div className="shead"><span className="num">04</span><h2>Where it hurts</h2></div>
        <p className="sub">
          Distance per driving day, split by which car you are in. Under {easyLimit} {units} is an easy day,
          over {transferLimit} {units} is a transfer. Click a bar to jump to that day. Bay Area day trips are
          included and grouped under their own rental block.
        </p>
        <div className="card chart">
          <svg className="bars" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Distance per day in ${units}`}>
            {bands.map((b, i) => {
              const x1 = pad.l + b.from * bw, x2 = pad.l + (b.to + 1) * bw;
              return (
                <g key={i}>
                  <rect className="band" x={x1} y={pad.t - 22} width={x2 - x1} height={ih + 22} rx={4} />
                  <text className="bandlbl" x={(x1 + x2) / 2} y={pad.t - 10}>
                    {b.label} · {distLabel(b.meters, units)}
                  </text>
                  {i > 0 && <line className="banddiv" x1={x1} y1={pad.t - 22} x2={x1} y2={pad.t + ih} />}
                </g>
              );
            })}
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
                        height={pad.t + ih - y(v)} rx={3} onClick={() => onSelect(d.id)}
                        role="button" tabIndex={0} aria-label={`Show day ${d.num} on map: ${d.title}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(d.id); }
                        }}>
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
          Salt Lake City rental: <b>Tesla Model S, 2021</b>. Your reported range after degradation is <b>320 miles (about 515 km) at a full charge</b>.
          Seattle and California cars are still undecided; their fuel or charging plans will depend on the cars you book.
        </p>
        <div className="card panel" style={{marginBottom:16}}><h3>Use the car’s arrival estimate</h3><p>320 miles is a reference, not a guaranteed mountain range. Driving from 90% down to a 20% reserve gives 224 rated miles before allowing for cold, climbs, wind or overnight heating. Enter the next confirmed charger in the Tesla navigation and watch the predicted arrival percentage.</p><p>For remote legs, aim to arrive with at least 20% as a planning buffer, and keep extra energy for the night. Navigate to Superchargers so the car can prepare the battery. Confirm charging billing and app access with the host.</p><a href="https://www.tesla.com/support/range" target="_blank" rel="noreferrer">Tesla range guidance ↗</a></div>
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
          <h3 style={{ fontSize: ".98rem" }}>Northern Yellowstone · plan through to the next reliable charger</h3>
          <p style={{ margin: "6px 0 0", fontSize: ".89rem", color: "var(--muted)" }}>
            The US Tesla connects directly at Laurel and Bozeman Superchargers. No charging adapter is
            carried, so CCS and J1772 chargers are not counted as backups. Gardiner still needs an energy
            plan before you arrive; a hotel advertising “L2” does not confirm a compatible plug.
          </p>
          <ul style={{ fontSize: ".89rem" }}>
            <li>Confirm a native <b>Tesla/NACS connector</b>, access and availability before relying on a Gardiner hotel charger.</li>
            <li>Before Beartooth, plan all the way to <b>Laurel Supercharger</b>, about 71 km beyond Red Lodge, including overnight use. Red Lodge destination charging is an optional top-up.</li>
            <li>Charge in Laurel for the onward Gardiner night and next day’s drive to Bozeman. The bad-weather plan skips Beartooth and adds a Bozeman day; the Lamar outing still needs enough reserve to reach Bozeman afterwards.</li>
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

export function FoodRules() {
  return (
    <div className="card rules">
      <h3 style={{ fontSize: ".98rem" }}>Rules that always work</h3>
      <ul>{FOOD_RULES.map((r, i) => <li key={i} dangerouslySetInnerHTML={{ __html: r }} />)}</ul>
    </div>
  );
}
