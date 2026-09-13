import type { Trip } from '../lib/trip';

export function MontanaChoices({ trip, rainy, onChange }: { trip: Trip; rainy: boolean; onChange: (rainy: boolean) => void }) {
  const days = trip.days.filter(d => ['s6', 's7', 's8', 'rainLamar', 'rainTransfer', 'rainRest'].includes(d.id));
  return <details className="seattle-choices">
    <summary><span><b>Beartooth & Bozeman</b><small>{rainy ? 'Bad weather · two nights in Bozeman' : 'Over Beartooth · back via Laurel Supercharger'}</small></span></summary>
    <div className="seattle-choice-body">
      <div className="weather-switch" role="group" aria-label="Montana weather plan">
        <button aria-pressed={!rainy} onClick={() => onChange(false)}>☀ Beartooth + Laurel</button>
        <button aria-pressed={rainy} onClick={() => onChange(true)}>☂ Extra day in Bozeman</button>
      </div>
      <p>{rainy ? 'Skip Beartooth and Red Lodge. Keep a Lamar outing only if roads and battery allow, then head via Chico to Bozeman a day earlier. Two nights in the same room and a full day for the museum, coffee and laundry.' : 'Cross Beartooth once, sleep in Red Lodge, then return via the Laurel Supercharger, Livingston and Gardiner. Keep enough battery to reach Laurel even if Red Lodge charging is unavailable.'}</p>
      <p className="hint">Manual weather choice; later trip dates stay the same. No charging adapter carried: use native Tesla plugs. Gardiner hotel charging still needs its connector and access confirmed; CCS or J1772 are not assumed backups.</p>
      <ol className="seattle-preview">{days.map(d => <li key={d.id}><span>Day {d.num}</span><a href={`#itinerary/${d.id}`}>{d.title}</a></li>)}</ol>
      <div className="seattle-sources"><a href="https://www.tesla.com/findus/location/supercharger/19030" target="_blank" rel="noreferrer">Laurel Supercharger ↗</a><a href="https://www.nps.gov/yell/planyourvisit/parkroads.htm" target="_blank" rel="noreferrer">Park & pass conditions ↗</a></div>
    </div>
  </details>;
}
