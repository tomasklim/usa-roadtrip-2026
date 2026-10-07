import { flightsForTrip } from "../lib/flights";
import type { Trip } from "../lib/trip";

export function Flights({ trip }: { trip: Trip }) {
  const flights = flightsForTrip(trip);
  return (
    <section id="flights">
      <div className="wrap narrow">
        <div className="shead"><span className="num">01</span><h2>Flights & connections</h2></div>
        <p className="sub">
          {trip.utahFinale ? 'Return from Salt Lake City on October 13 via Seattle and Frankfurt. Allow time for the Tesla return before reaching SLC airport around noon. All times are local; arrival in Prague is October 14 at 16:00.' : 'Condor via Frankfurt, with US flights between the rental regions. All times are local; arrival in Prague is October 14.'}
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
                {f.legs.map(([no, cls, schedule]) => (
                  <div key={no}>
                    <div className="fleg"><span>✈ {no}</span><span>{cls}</span></div>
                    {schedule && <div className="fschedule">{schedule}</div>}
                  </div>
                ))}
              </div>
              {f.note && <div className="fco2">{f.note}</div>}
              {f.co2 && <div className="fco2">{f.co2}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
