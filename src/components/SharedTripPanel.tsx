import { useEffect, useState } from 'react';
import { importPersonalPlan, joinSharedTrip, leaveSharedTrip, sharedLink, sync, useSharedStatus } from '../lib/sharedTrip';

export function SharedTripPanel() {
  const shared = useSharedStatus();
  const [invite, setInvite] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetch('/api/trip?status=1', {cache:'no-store'}).then(r => r.json()).then(data => { if (active) setConfigured(data.configured === true); }).catch(() => { if (active) setConfigured(false); });
    return () => { active = false; };
  }, []);
  const join = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await joinSharedTrip(invite); setInvite(''); } catch (e) { setError(e instanceof Error ? e.message : 'Could not connect.'); }
    finally { setBusy(false); }
  };
  return <details className="shared-panel">
    <summary><span><b>{shared.connected ? 'Our shared trip' : 'Share the trip'}</b><small role="status">{shared.status}{shared.pending ? ` · ${shared.pending} pending` : ''}</small></span></summary>
    <div className="shared-content">
      <p>Share checklist progress, route variants and sleeping choices. Your current day, map and display preferences stay personal.</p>
      {!shared.storageOK && <p role="alert">This browser cannot save changes for later. Keep this tab open until syncing finishes.</p>}
      {shared.connected ? <>
        <div className="shared-actions"><button className="action" onClick={async () => { try { await navigator.clipboard.writeText(sharedLink()); setCopied(true); } catch { setError('Copy the invite link from the field below.'); } }}>{copied ? 'Link copied' : 'Copy private invite link'}</button><button className="action" onClick={() => { void sync(); }}>Sync now</button></div>
        <label className="shared-link">Private invite link<input type="text" readOnly value={sharedLink()} onFocus={e => e.target.select()} /></label>
        <p className="hint">Anyone with this link can edit the shared trip. Changes sync while the page is open and retry after reconnecting. If both change the same setting, the last change received wins.</p>
        {Object.keys(shared.fields).length === 0 && <button className="action" onClick={importPersonalPlan}>Start with this device’s saved plan</button>}
        <button className="text-action" onClick={leaveSharedTrip}>Return to my personal plan</button>
        {shared.pending > 0 && <p className="hint">Pending changes stay on this device; reopen the same invite link to finish syncing.</p>}
      </> : <>
        <p className="hint">{configured === false ? 'Shared storage is not connected yet. Your checklist still saves on this device.' : 'Open your private invite link on both phones, or paste it here. Joining keeps your personal copy separate.'}</p>
        <form onSubmit={join} className="shared-join"><label>Private invite link<input type="text" value={invite} onChange={e => setInvite(e.target.value)} placeholder="Paste your invite link" autoComplete="off" spellCheck={false} /></label><button className="action" disabled={busy || !invite.trim()}>{busy ? 'Connecting…' : 'Join shared trip'}</button></form>
      </>}
      {error && <p role="alert">{error}</p>}
    </div>
  </details>;
}
