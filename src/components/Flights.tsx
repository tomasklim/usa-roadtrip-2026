import { FLIGHTS } from "../data/itinerary";

export function Flights() {
  return (
    <section id="flights">
      <div className="wrap narrow">
        <div className="shead"><span className="num">01</span><h2>The flights, booked</h2></div>
        <p className="sub">
          Condor via Frankfurt both ways, and the return out of San Francisco rather than Seattle —
          which is what makes the whole loop work. Landing at 15:40 means day one is a hotel and oysters,
          nothing more.
        </p>
        <div className="flights">
          {FLIGHTS.map((f) => (
            <div className="card flight" key={f.dir}>
              <div className="fd"><span className="tick">✓</span><b>{f.date}</b></div>
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
        <div className="tip">
          <b>Worth knowing:</b> the booking screenshot showed <b>1 passenger</b>. Everything else on this
          page — budget, lodging, food — is costed for two, so if the second ticket is not booked yet,
          that is the one gap.
        </div>
      </div>
    </section>
  );
}
