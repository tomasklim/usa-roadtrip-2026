import { CAR_NIGHTS } from '../data/itinerary';
import { fmtShort, type Trip } from '../lib/trip';
import { EMPTY_STAY, type Stays, type Stay } from '../lib/planning';
import { useSharedStatus } from '../lib/sharedTrip';
import { degrees, weatherForDay } from '../lib/weather';

export function SleepSection({trip, stays, setStays}: {trip: Trip; stays: Stays; setStays: (next: Stays | ((previous: Stays) => Stays)) => void}) {
  const shared = useSharedStatus();
  const nights = trip.days.filter(d => d.sleep);
  const decided = nights.filter(d => stays[d.id]?.place.trim()).length;
  return <section id="sleep" className="personal-planning">
    <div className="shead"><h2>Where we’ll sleep</h2></div>
    <p className="sub">A suggested base for each night. Choose your own place and add notes below; your choices appear in the daily plan. Aim for no more than two consecutive car nights, unless hotel prices make an exception worthwhile.</p>
    <p className="hint" role="status">{decided} of {nights.length} nights have a place entered · {shared.status}{shared.pending ? ' · changes waiting to sync' : ''}</p>
    <fieldset className="planning-fields night-list" disabled={!shared.connected && !import.meta.env.DEV}>{nights.map(d => {
      const stay = stays[d.id] ?? EMPTY_STAY;
      const update = (patch: Partial<Stay>) => setStays(previous => ({...previous, [d.id]: {...(previous[d.id] ?? EMPTY_STAY), ...patch}}));
      const weather = weatherForDay(d)?.night;
      const suggestion = d.sleep!.suggestedWhere ?? d.sleep!.where;
      const camp = d.carEligible !== false ? CAR_NIGHTS[d.id] : undefined;
      return <article className="card panel stay-card" key={d.id}>
        <div className="stay-heading"><a href={`#itinerary/${d.id}`}>Day {d.num} · {fmtShort(d.date!)}</a><span>{d.title}</span></div>
        <p><b>Suggested base:</b> {suggestion}</p>
        {camp && <p className="hint">Car-night alternative: {camp.where}. Confirm seasonal access and permission to stay.</p>}
        {weather && <p className="hint">Historical overnight low around {degrees(weather.stats.low)} · {weather.name}. Check the daily forecast before choosing a car night.</p>}
        <div className="stay-fields"><label>Your accommodation<input aria-label={`Accommodation for ${d.id}`} maxLength={300} value={stay.place} placeholder="Hotel, inn or campsite you choose" onChange={e => update({place:e.target.value})} /></label>
        <label>Sleep choice<select aria-label={`Sleep choice for ${d.id}`} value={stay.type} onChange={e => update({type:e.target.value as Stay['type']})}><option value="undecided">Not decided yet</option><option value="bed">Bed / room</option><option value="car">In the car</option></select></label></div>
        <label className="planning-note">Your notes<textarea aria-label={`Sleep notes for ${d.id}`} value={stay.note} maxLength={4000} rows={3} placeholder="Booking link, price, check-in, cancellation, charging…" onChange={e => update({note:e.target.value})} /></label>
        {d.sleep?.streak && d.sleep.streak > 2 ? <p className="warn">This is car night {d.sleep.streak} in a row. Your choice is kept; consider a bed unless the price makes it worthwhile.</p> : null}
      </article>;
    })}</fieldset>
    <p className="hint">Suggestions are areas to compare, not reservations or checked room prices. For the 2021 Model S, ask the host about the actual sleeping space and overnight climate use before choosing a mattress.</p>
  </section>;
}
