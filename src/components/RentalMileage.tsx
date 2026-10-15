import { useSharedStatus } from '../lib/sharedTrip';
import { mileageSummary, RENTAL_NAMES, type RentalMileage as Mileage } from '../lib/mileage';
import type { Trip } from '../lib/trip';

export function RentalMileage({ trip, mileage, onChange }: { trip: Trip; mileage: Mileage; onChange: (next: Mileage) => void }) {
  const shared = useSharedStatus();
  const { active, complete, recordedKm } = mileageSummary(trip, mileage);
  const km = (value: number) => `${value.toLocaleString('en-US')} km`;
  return <section className="personal-planning" aria-label="Actual rental distances">
    <div className="shead"><h2>What we actually drove</h2></div>
    <p className="sub">Recorded totals for each rental. Daily routes below remain estimates.</p>
    <div className="budget-totals">{active.map(id => <div className="card panel" key={id}><h3>{RENTAL_NAMES[id]}</h3><b>{mileage[id] === undefined ? 'Not recorded yet' : km(mileage[id]!)}</b></div>)}
      {complete && <div className="card panel"><h3>Whole trip</h3><b>{km(recordedKm)}</b></div>}
    </div>
    <details className="card panel"><summary>Edit recorded mileage</summary>
      <fieldset className="planning-fields expense-list" disabled={!shared.connected && !import.meta.env.DEV}>
        {active.map(id => <label className="planning-note" key={id}>{RENTAL_NAMES[id]} · km
          <input aria-label={`${RENTAL_NAMES[id]} actual km`} type="number" inputMode="decimal" min="0" max="100000" step="any" value={mileage[id] ?? ''} onChange={e => {
            const next = {...mileage};
            if (e.target.value === '') delete next[id];
            else { const value = Number(e.target.value); if (!Number.isFinite(value) || value < 0 || value > 100000) return; next[id] = value; }
            onChange(next);
          }} />
        </label>)}
      </fieldset>
      <p className="hint" role="status">{shared.status}</p>
    </details>
  </section>;
}
