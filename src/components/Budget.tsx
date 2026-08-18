import { useEffect } from "react";
import { BUDGET_CFG } from "../data/reference";
import { rentals, turoDays, type Trip } from "../lib/trip";
import { useStored } from "../lib/useStored";

type Slide = Record<string, number>;
const DEFAULTS: Slide = Object.fromEntries(BUDGET_CFG.map((c) => [c.id, c.val]));
const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const num = (n: number) => Math.round(n).toLocaleString("en-US");

export function Budget({ trip }: { trip: Trip }) {
  const [raw, setRaw] = useStored<Slide>("slide", DEFAULTS);
  const [touched, setTouched] = useStored<Record<string, boolean>>("touched", {});
  const s: Slide = { ...DEFAULTS, ...raw };

  // Lodging follows the itinerary until it is dragged by hand.
  const lodgingNights = Math.max(0, trip.days.length - 1 - trip.carNights - trip.sfNights);
  useEffect(() => {
    if (!touched.motelNights && s.motelNights !== lodgingNights) {
      setRaw({ ...s, motelNights: lodgingNights });
    }
  }, [lodgingNights, touched.motelNights, s.motelNights]);

  const td = turoDays(trip);
  const r = rentals(trip);
  const miles = trip.meters / 1609.344;
  const slcMiles = r.slc.meters / 1609.344;
  const included = s.cap >= 400 ? Infinity : s.cap * td;
  const over = Math.max(0, slcMiles - included);
  const kwh = miles / 4;

  const flightUsd = s.flightEur * s.eurusd;
  const lines: [string, number][] = [
    [`Transatlantic flights, 2 × €${num(s.flightEur)} at ${s.eurusd.toFixed(3)}`, 2 * flightUsd],
    [`Salt Lake Turo, ${td} days × ${usd(s.turoDay)}`, td * s.turoDay],
    [`Seattle car, ${r.seattle.days} days × ${usd(s.seaDay)}`, r.seattle.days * s.seaDay],
    [Number.isFinite(included)
      ? (over > 0
          ? `Extra miles (${num(over)} over ${num(included as number)})`
          : `Extra miles — none: ${num(slcMiles)} mi driven, ${num(included as number)} included`)
      : "Extra miles (unlimited distance)", over * s.overMi],
    [`Charging (~${num(kwh)} kWh at 4 mi/kWh)`, kwh * s.kwh],
    [`Motels and hotels, ${s.motelNights} nights × ${usd(s.motel)}`, s.motelNights * s.motel],
    [`Food, 2 people × ${trip.days.length} days × ${usd(s.foodDay)}`, 2 * trip.days.length * s.foodDay],
    ["Non-resident annual park pass", 250],
    ["Bear spray, mattress, bedding", 170],
    ["Domestic flights SEA → SLC and SLC → SFO, 2 people", 520],
    [`San Francisco hotel, ${trip.sfNights} nights × ${usd(s.sfNight)}`, trip.sfNights * s.sfNight],
    ["San Francisco food and activities", 200 * Math.max(1, trip.sfNights)]
  ];
  if (trip.days.some((d) => d.id === "sf2")) lines.push(["Car for the Point Reyes day", 140]);

  const total = lines.reduce((a, [, v]) => a + v, 0);
  // Defaults come from the real quote on listing 3758006: US$566.50 for 9 days,
  // 1,350 miles included, $0.27 a mile over.
  const capNote = s.cap >= 400
    ? "The slider is on unlimited distance."
    : over > 0
      ? `${num(slcMiles)} mi driven against ${num(included as number)} included, so ${num(over)} mi over at ${usd(s.overMi * 100)}/100 mi — ${usd(over * s.overMi)}. Booking more days is the cheap fix: each extra day adds about $62 of rental but ${s.cap} more included miles.`
      : `${num(slcMiles)} mi driven against ${num(included as number)} included — inside the cap. At 12 days the quoted 150 mi/day allotment covers the whole Salt Lake block.`;

  return (
    <section id="budget">
      <div className="wrap narrow">
        <div className="shead"><span className="num">08</span><h2>Budget</h2></div>
        <p className="sub">
          Everything for two people, transatlantic flights included. It reads from whichever modules are
          switched on, so the total moves when the plan does. The car defaults come from the real quote on
          listing 3758006 — <b>US$566.50 all-in for 9 days</b>, 1,350 miles included, $0.27 a mile over —
          scaled to the twelve days the route actually needs.
        </p>
        <div className="budget">
          <div className="card sliders">
            {BUDGET_CFG.map((c) => (
              <div className="sl" key={c.id}>
                <label htmlFor={`s-${c.id}`}>{c.label}<b>{c.fmt(s[c.id])}</b></label>
                <input id={`s-${c.id}`} type="range" min={c.min} max={c.max} step={c.step}
                       value={s[c.id]}
                       onChange={(e) => {
                         setRaw({ ...s, [c.id]: parseFloat(e.target.value) });
                         if (!touched[c.id]) setTouched({ ...touched, [c.id]: true });
                       }} />
              </div>
            ))}
          </div>
          <div className="card bill">
            {lines.map(([label, v]) => (
              <div className="bline" key={label}><span>{label}</span><span>{usd(v)}</span></div>
            ))}
            <div className="bline sum"><span>Total for two</span><span>{usd(total)}</span></div>
            <p className="bnote">
              ≈ {num(total * s.fx / 1000)}k Kč at {s.fx.toFixed(1)} Kč/$ — both exchange rates are live
              as of 18 Aug 2026 (€1 = ${s.eurusd.toFixed(3)}, $1 = {s.fx.toFixed(1)} Kč) and are sliders,
              so move them if they drift. {capNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
