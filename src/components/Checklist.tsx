import { useState } from 'react';
import { CHECK_CATEGORIES, checksForTrip, normalizeChecks, type CheckCategory } from '../data/checklist';
import { useSharedStored } from '../lib/sharedTrip';
import type { Trip } from '../lib/trip';
import { SharedTripPanel } from './SharedTripPanel';

export function Checklist({ trip }: { trip: Trip }) {
  const [doneRaw, setDone] = useSharedStored<string[]>('checks', [], normalizeChecks);
  const [category, setCategory] = useState<CheckCategory | 'all'>('all');
  const [pendingOnly, setPendingOnly] = useState(false);
  const checks = checksForTrip(trip);
  const done = new Set(doneRaw);
  const pct = Math.round(done.size / checks.length * 100);
  const blockers = checks.filter(c => c.block && !done.has(c.id)).length;
  return <section id="checklist"><div className="wrap narrow">
    <div className="shead"><h2>Before you fly</h2></div>
    <p className="sub">Bookings, practical details and the things to pack. Start with the items marked Priority; rental dates follow your selected route.</p>
    <SharedTripPanel />
    <div className="kit-progress"><b>{done.size} / {checks.length} ready</b><span>{blockers ? `${blockers} priority items remaining` : 'All priority items ready'}</span></div>
    <div className="progress" role="progressbar" aria-label="Checklist completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{width:`${pct}%`}} /></div>
    <div className="kit-filters"><label>Category<select value={category} onChange={e => setCategory(e.target.value as typeof category)}><option value="all">All categories</option>{CHECK_CATEGORIES.map(c => <option value={c.id} key={c.id}>{c.title}</option>)}</select></label><label className="kit-pending"><input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} />Only unfinished</label></div>
    {CHECK_CATEGORIES.filter(c => category === 'all' || c.id === category).map(group => {
      const items = checks.filter(c => c.category === group.id);
      const visible = items.filter(c => !pendingOnly || !done.has(c.id));
      return <section className="kit-group" key={group.id} aria-labelledby={`kit-${group.id}`}>
        <div className="kit-group-heading"><div><h3 id={`kit-${group.id}`}>{group.title}</h3><p>{group.description}</p></div><span>{items.filter(c => done.has(c.id)).length} / {items.length}</span></div>
        {visible.length ? <div className="checks">{visible.map(c => <div className={`kit-item${done.has(c.id) ? ' is-done' : ''}`} key={c.id}>
          <label className={`chk${done.has(c.id) ? ' done' : ''}${c.block ? ' block' : ''}`}>
            <input type="checkbox" checked={done.has(c.id)} onChange={e => { const checked = e.target.checked; setDone(prev => checked ? [...new Set([...prev, c.id])] : prev.filter(id => id !== c.id)); }} />
            <span className="rc"><span className="ct">{c.t}</span>{c.block && <span className="kit-priority">Priority</span>}{c.when && <span className="kit-dates">{c.when}</span>}<span className="cd">{c.d}</span></span>
          </label>
          {c.url && <a className="kit-source" href={c.url} target="_blank" rel="noreferrer">{c.category === 'cars' && c.t.startsWith('Book') ? 'Open Turo' : 'Official website'} ↗</a>}
        </div>)}</div> : <p className="hint">Everything in this category is ready.</p>}
      </section>;
    })}
  </div></section>;
}
