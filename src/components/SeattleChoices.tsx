import { normalizeSeattle, type SeattleOptions } from '../data/seattle';
import type { Trip } from '../lib/trip';
export function SeattleChoices({ trip, onChange, extended }: { trip: Trip; onChange: (value: SeattleOptions) => void; extended: boolean }) {
  const o = trip.seattle;
  const change = (value: Partial<SeattleOptions>) => onChange(normalizeSeattle({ ...o, ...value }));
  return <details className="seattle-choices">
    <summary><span><b>The first five days</b><small>{o.weather === 'good' ? 'Clear-weather plan' : 'Rainy-weather plan'} · {o.portland ? 'Portland included' : 'Without Portland'} · SLC {o.flight === 'mon-am' ? 'Monday morning' : o.flight === 'mon-pm' ? 'Monday evening' : extended ? 'after Olympic' : 'Tuesday morning'}</small></span></summary>
    <div className="seattle-choice-body">
      <p>Two fixed days: land, collect the car and sleep near Olympia; then the Capitol, Hama Hama and Oyster Bay Inn. Choose what follows.</p>
      {extended && <p className="warn">The extended Olympic loop needs Sunday at Rainier and a later flight. Remove it in <a href="#guide/options">Route options</a> to use the weather alternatives.</p>}
      <div className="weather-switch" role="group" aria-label="Washington weather plan">
        <button disabled={extended} aria-pressed={o.weather === 'good'} onClick={() => change({ weather: 'good', flight: 'mon-pm' })}>☀ Clear weather</button>
        <button disabled={extended} aria-pressed={o.weather === 'rain'} onClick={() => change({ weather: 'rain', flight: 'mon-am' })}>☂ Rainy weather</button>
      </div>
      <div className="seattle-settings">
        <label className="portland-choice"><input type="checkbox" checked={o.portland} onChange={e => change({ portland: e.target.checked })}/><span>Include Portland<small>In-N-Out, shopping and a river walk</small></span></label>
        {o.weather === 'good' && <label>Clearest day for Rainier<select disabled={extended} value={o.rainier} onChange={e => change({ rainier: e.target.value as SeattleOptions['rainier'] })}>
          <option value="sat">Saturday · Sep 26</option><option value="sun">Sunday · Sep 27</option><option value="mon">Monday · Sep 28</option>
        </select></label>}
        <label>Proposed flight to Salt Lake City<select disabled={extended || (o.weather === 'good' && o.rainier === 'mon')} value={o.flight} onChange={e => change({ flight: e.target.value as SeattleOptions['flight'] })}>
          {o.weather === 'rain' && <option value="mon-am">Monday morning · rest day in SLC</option>}
          <option value="mon-pm">Monday evening</option><option value="tue-am">Tuesday morning</option>
        </select></label>
      </div>
      <p className="hint">{o.weather === 'good' && o.rainier === 'mon' ? 'Monday Rainier means a Tuesday flight, with an airport hotel in between. ' : ''}These are manual planning alternatives, not a forecast. Flight and hotels are not booked; check prices and cancellation terms. The Utah car still starts on the Bonneville day.</p>
      <ol className="seattle-preview">{trip.days.slice(0, 5).map(d => <li key={d.id}><span>Day {d.num}</span><a href={`#itinerary/${d.id}`}>{d.title}</a></li>)}</ol>
      <div className="seattle-sources"><a href="https://www.portland.gov/transportation/walking-biking-transit-safety/suggested-walks" target="_blank" rel="noreferrer">Portland walks ↗</a><a href="https://www.nps.gov/mora/learn/photosmultimedia/webcams.htm" target="_blank" rel="noreferrer">Rainier webcams ↗</a><a href="https://hamahamaoysters.com/pages/oyster-saloon" target="_blank" rel="noreferrer">Hama Hama reservations ↗</a></div>
    </div>
  </details>;
}
