import { useSharedStored, useSharedStatus } from '../lib/sharedTrip';
import { EMPTY_EXPENSE, normalizeExpenses, type Expenses } from '../lib/planning';
import type { Trip } from '../lib/trip';
const CATEGORIES = [
  ['flights', 'USA return flights'], ['domestic', 'Flights · Seattle → SLC → SFO'],
  ['seattle-car', 'Car · Seattle'], ['slc-car', 'Tesla Model S · Salt Lake City'], ['california-car', 'Car · California'],
  ['hotels', 'Hotels & inns'], ['camping', 'Campgrounds'], ['food', 'Food & groceries'],
  ['charging', 'Tesla charging'], ['fuel', 'Other cars · fuel / charging'], ['activities', 'Parks, tickets & activities'],
  ['parking', 'Parking & tolls'], ['insurance', 'Insurance'], ['equipment', 'Equipment & supplies'], ['other', 'Other spending']
];
const money = (n: number, currency: string) => new Intl.NumberFormat('en', {style: 'currency', currency, maximumFractionDigits: 2}).format(n);
export function Budget({ trip }: { trip: Trip }) {
  const [saved, setSaved] = useSharedStored<Expenses>('expenses', {}, normalizeExpenses);
  const shared = useSharedStatus();
  const entries: Expenses = saved;
  const totals = ['EUR', 'USD', 'CZK'].map(currency => {
    const rows = Object.values(entries).filter(x => x.currency === currency && x.amount !== null);
    return {currency, paid: rows.filter(x => x.status === 'paid').reduce((n,x) => n + x.amount!, 0), estimate: rows.filter(x => x.status === 'estimate').reduce((n,x) => n + x.amount!, 0)};
  });
  return <section id="budget" className="personal-planning">
    <div className="shead"><h2>Your trip budget</h2></div>
    <p className="sub">Amounts for both of you, for the full {trip.days.length}-day trip. Enter a total for each category and mark it as paid or estimated. Empty fields mean not entered yet.</p>
    <p className="hint" role="status">{shared.status}{shared.pending ? ` · ${shared.pending} changes waiting to sync` : ''}</p>
    <div className="budget-totals">{totals.filter(t => t.paid || t.estimate).map(t => <div className="card panel" key={t.currency}><b>{money(t.paid, t.currency)} paid</b><p>{money(t.estimate, t.currency)} estimated</p></div>)}</div>
    <p className="hint">Currencies stay separate; no hidden exchange-rate conversion. Totals include only the amounts entered below.</p>
    <fieldset className="planning-fields expense-list" disabled={!shared.connected && !import.meta.env.DEV}>{CATEGORIES.map(([id, label]) => {
      const entry = entries[id] ?? EMPTY_EXPENSE;
      const update = (patch: Partial<typeof entry>) => setSaved(previous => ({...previous, [id]: {...(previous[id] ?? EMPTY_EXPENSE), ...patch}}));
      return <div className="card panel expense-card" key={id}><h3>{label}</h3><div className="expense-fields">
        <label>Amount<input aria-label={`${label} amount`} type="number" inputMode="decimal" min="0" max="1000000" step="0.01" value={entry.amount ?? ''} onChange={e => update({amount: e.target.value === '' ? null : Math.min(1000000, Math.max(0, Number(e.target.value)))})} /></label>
        <label>Currency<select aria-label={`${label} currency`} value={entry.currency} onChange={e => update({currency: e.target.value as typeof entry.currency})}>{['USD','EUR','CZK'].map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Status<select aria-label={`${label} status`} value={entry.status} onChange={e => update({status: e.target.value as typeof entry.status})}><option value="estimate">Estimate</option><option value="paid">Paid</option></select></label>
      </div><label className="planning-note">Notes<textarea aria-label={`${label} notes`} maxLength={2000} rows={2} value={entry.note} onChange={e => update({note: e.target.value})} placeholder="What this includes, booking reference, remaining payment…" /></label></div>;
    })}</fieldset>
  </section>;
}
