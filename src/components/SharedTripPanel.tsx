import { useState } from 'react';
import { sync, useSharedStatus } from '../lib/sharedTrip';
export function SharedTripPanel() {
  const shared = useSharedStatus();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  return <details className="card panel shared-trip"><summary>Our private shared trip</summary>
    <p>Route choices, checklist, overnight notes and budget sync between your devices. Open this website and enter the same access code on each device.</p>
    <p role="status">{shared.status}{shared.pending ? ` · ${shared.pending} changes waiting to sync` : ''}</p>
    <div className="shared-actions"><button className="action" onClick={() => void sync()}>Sync now</button><button className="action" onClick={async () => {
      try {const response=await fetch('/api/auth',{cache:'no-store'});if(!response.ok)throw Error('Reload the page and sign in first.');const result=await response.json();setCode(result.code);}catch(error){setMessage(error instanceof Error ? error.message : 'Could not read the code.');}
    }}>Show access code</button></div>
    {code && <label className="shared-link">Share this code privately<input aria-label="Shared access code" readOnly value={code} onFocus={e => e.target.select()} /></label>}
    <p className="hint">The code stays on the server until you reveal it here. Each device stays signed in for 30 days.</p>
    <button className="text-action" disabled={shared.pending > 0} onClick={async () => {
      try {const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(!response.ok)throw Error('Could not sign out.');
        for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key?.startsWith('nwrt26.'))localStorage.removeItem(key);}
        window.location.assign('/');
      }catch(error){setMessage(error instanceof Error ? error.message : 'Please retry.');}
    }}>Sign out & clear this device</button>
    <p className="hint">Downloaded offline copies remain on the device where you saved them.</p>
    {message && <p role="alert">{message}</p>}
  </details>;
}
