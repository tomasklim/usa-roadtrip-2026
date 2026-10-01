import { useState } from 'react';
import { JOURNEY_VARIANTS, type Journal, type JournalEntry } from '../lib/journal';
import { useSharedStatus } from '../lib/sharedTrip';
import type { Day } from '../types';

export function TripJournal({ day, journal, setJournal }: { day: Day; journal: Journal; setJournal: (f: (p: Journal) => Journal) => void }) {
  const date = new Date(day.date!).toISOString().slice(0,10);
  const saved = journal[date];
  const [draft, setDraft] = useState<JournalEntry>(saved ?? {variant:'',title:day.title,note:'',status:'done'});
  const [message, setMessage] = useState('');
  const shared = useSharedStatus();
  return <details className="card panel trip-journal"><summary>{saved?.status === 'done' ? '✓ Recorded day · edit our notes' : 'Update this day'}</summary>
    <p className="hint">{date} · Saved privately with the shared trip. Completed days keep their calendar date.</p>
    <fieldset className="planning-fields" disabled={!shared.connected && !import.meta.env.DEV}>
      <label>Day status<select aria-label="Journal status" value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as JournalEntry['status']})}><option value="done">Already visited</option><option value="planned">Updated plan</option></select></label>
      <label>Place / route<select aria-label="Journal route" value={draft.variant} onChange={e=>setDraft({...draft,variant:e.target.value})}><option value="">Keep this day's route</option>{Object.entries(JOURNEY_VARIANTS).map(([id,v])=><option key={id} value={id}>{v.title}</option>)}</select></label>
      <label>Day title<input aria-label="Journal title" value={draft.title} maxLength={200} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
      <label>What we did / updated plan<textarea aria-label="Journal notes" rows={5} maxLength={4000} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/></label>
      {(draft.variant === 'redmond' || draft.flight) && <>
        <label>SEA → SLC departure (Seattle local time)<input aria-label="Flight departure local time" type="time" value={draft.flight?.dep ?? ''} onChange={e=>setDraft({...draft,flight:{from:'SEA',to:'SLC',arr:draft.flight?.arr ?? '',dep:e.target.value}})}/></label>
        <label>SEA → SLC arrival (Salt Lake City local time)<input aria-label="Flight arrival local time" type="time" value={draft.flight?.arr ?? ''} onChange={e=>setDraft({...draft,flight:{from:'SEA',to:'SLC',dep:draft.flight?.dep ?? '',arr:e.target.value}})}/></label>
      </>}
      <label>Road distance before the 15% allowance (km)<input aria-label="Journal road distance km" type="number" min="0" max="5000" step="0.1" value={draft.roadKm ?? ''} onChange={e=>setDraft({...draft,roadKm:e.target.value === '' ? null : Number(e.target.value)})}/></label>
      <label>Distance assumptions<textarea aria-label="Journal distance assumptions" rows={3} maxLength={2000} value={draft.roadNote ?? ''} onChange={e=>setDraft({...draft,roadNote:e.target.value})}/></label>
      <p className="hint">For completed days, we add 15% for local detours. Flights and walks are excluded. Leave blank if unknown.</p>
      <button className="action" onClick={()=>{setJournal(p=>({...p,[date]:draft}));setMessage('Saved on this device; shared sync status is shown above.');}}>Save day update</button>
    </fieldset>
    <p role="status" className="hint">{message}</p><p className="hint">Accommodation and overnight notes: <a href="#guide/sleep">Sleep</a>.</p>
  </details>;
}
