import { CHECKS } from "../data/reference";
import { useStored } from "../lib/useStored";

const VALID_CHECKS = new Set(CHECKS.map((c) => c.id));
const normalizeChecks = (value: unknown) => Array.isArray(value)
  ? [...new Set(value.filter((id): id is string => typeof id === "string" && VALID_CHECKS.has(id)))]
  : [];

export function Checklist() {
  const [doneRaw, setDone] = useStored<string[]>("checks", [], normalizeChecks);
  const done = new Set(Array.isArray(doneRaw) ? doneRaw : []);
  const pct = Math.round((done.size / CHECKS.length) * 100);

  return (
    <section id="checklist">
      <div className="wrap narrow">
        <div className="shead"><span className="num">09</span><h2>Before you fly</h2></div>
        <p className="sub">
          The first five are blocking — skip them and the trip either breaks or gets a lot more
          expensive. Ticks are saved in this browser.
        </p>
        <div className="progress" role="progressbar" aria-label="Checklist completion"
             aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="checks">
          {CHECKS.map((c) => {
            const on = done.has(c.id);
            return (
              <label className={`chk${on ? " done" : ""}${c.block ? " block" : ""}`} key={c.id}>
                <input type="checkbox" checked={on}
                       onChange={() => setDone(on ? [...done].filter((x) => x !== c.id) : [...done, c.id])} />
                <span className="rc">
                  <span className="ct">{c.t}</span>
                  <span className="cd">{c.d}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
