import { FLIGHTS } from "../data/itinerary";
import type { Trip } from "../lib/trip";

const dateFor = (t: number) => new Intl.DateTimeFormat("en-GB", {
  weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
}).format(t).replace(",", "");

export function Flights({ trip }: { trip: Trip }) {
  const flights = FLIGHTS.map((f) => {
    const dayId = f.dir === "hop1" ? "s1" : f.dir === "hop2" ? "sf1" : null;
    const date = dayId ? trip.days.find((d) => d.id === dayId)?.date : null;
    return date ? { ...f, date: dateFor(date) } : f;
  });
  return (
    <section id="flights">
      <div className="wrap narrow">
        <div className="shead"><span className="num">01</span><h2>Flights — two booked, two to book</h2></div>
        <p className="sub">
          Condor via Frankfurt both ways, and the return out of San Francisco rather than Seattle —
          which is what makes the whole loop work. Landing at 15:40 means day one is a hotel, a simple
          dinner and nothing more.
        </p>
        <div className="flights">
          {flights.map((f) => (
            <div className="card flight" key={f.dir}>
              <div className="fd">
                <span className="tick" style={f.booked ? undefined : { background: "var(--gold)" }}>
                  {f.booked ? "✓" : "!"}
                </span>
                <b>{f.date}</b>
                {!f.booked && <span className="chip" style={{ marginLeft: "auto" }}>to book</span>}
              </div>
              <div className="fends">
                <div className="side1">
                  <div className="ap">{f.from}</div>
                  <div className="tm tnum">{f.dep}</div>
                </div>
                <div className="fline">
                  {f.dur}
                  <div className="bar" />
                  {f.stops}
                </div>
                <div className="side2">
                  <div className="ap">{f.to}</div>
                  <div className="tm tnum">{f.arr}</div>
                </div>
              </div>
              <div className="flegs">
                {f.legs.map(([no, cls]) => (
                  <div className="fleg" key={no}><span>✈ {no}</span><span>{cls}</span></div>
                ))}
              </div>
              <div className="fco2">{f.co2}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
