import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { validField } from '../../shared/trip-schema.mjs';
import { DEFAULT_SEATTLE } from '../data/seattle';

type Fields = Record<string, unknown>;
type Pending = Record<string, { value: unknown; revision: number }>;
const cleanFields = (value: unknown): Fields => Object.fromEntries(Object.entries(value && typeof value === 'object' && !Array.isArray(value) ? value : {}).filter(([k,v]) => validField(k,v)));
const cleanPending = (value: unknown): Pending => Object.fromEntries(Object.entries(value && typeof value === 'object' && !Array.isArray(value) ? value : {}).filter(([k,v]) => v && typeof v === 'object' && Number.isSafeInteger(v.revision) && v.revision >= 0 && validField(k,v.value)));

const defaults: Record<string, unknown> = { checks: [], mods: [], seattlePlan: DEFAULT_SEATTLE, sleepStyle: 'balanced', sleepOverrides: {} };
const read = (key: string): unknown => { try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; } };
let storageOK = true;
const save = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { storageOK = false; } };
const validToken = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{43}$/.test(v);
export function fieldsFor(key: string, value: unknown): Fields {
  if (key === 'checks') return Object.fromEntries((Array.isArray(value) ? value : []).filter(v => typeof v === 'string').map(id => [`check:${id}`, true]));
  if (key === 'sleepOverrides') return Object.fromEntries(Object.entries(value && typeof value === 'object' ? value : {}).map(([id, v]) => [`sleep:${id}`, v]));
  return { [`plan:${key}`]: value };
}
function personalFields() {
  return Object.assign({}, ...Object.entries(defaults).map(([k, fallback]) => fieldsFor(k, read(`nwrt26.${k}`) ?? fallback))) as Fields;
}
const cacheKey = (token: string) => `nwrt26.shared.cache.${token}`;
const savedToken = read('nwrt26.shared.token');
let token: string | null = validToken(savedToken) ? savedToken : null;
const saved = token ? read(cacheKey(token)) as {fields?: Fields; pending?: Pending} | null : null;
let fields: Fields = saved?.fields ? cleanFields(saved.fields) : personalFields();
let pending: Pending = cleanPending(saved?.pending);
let revision = Math.max(0, ...Object.values(pending).map(p => Number(p?.revision) || 0));
let connected = !!(token && saved?.fields);
let busy = false;
let generation = 0;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
interface SharedState { fields: Fields; connected: boolean; status: string; pending: number; lastSync: number | null; storageOK: boolean }
let state: SharedState = { fields, connected, status: connected ? 'Connecting…' : 'Saved on this device', pending: Object.keys(pending).length, lastSync: null, storageOK };
const emit = (status = state.status, lastSync = state.lastSync) => {
  state = { fields, connected, status, pending: Object.keys(pending).length, lastSync, storageOK };
  listeners.forEach(fn => fn());
};
const persist = () => { if (token && connected) save(cacheKey(token), {fields, pending}); };
function valueFor(key: string, source: Fields): unknown {
  if (key === 'checks') return Object.entries(source).filter(([k, v]) => k.startsWith('check:') && v === true).map(([k]) => k.slice(6));
  if (key === 'sleepOverrides') return Object.fromEntries(Object.entries(source).filter(([k, v]) => k.startsWith('sleep:') && (v === 'bed' || v === 'price')).map(([k, v]) => [k.slice(6), v]));
  return source[`plan:${key}`] ?? defaults[key];
}
function update(key: string, value: unknown) {
  const before = fieldsFor(key, valueFor(key, fields));
  const after = fieldsFor(key, value);
  const patch: Fields = {};
  for (const field of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const v = after[field] ?? (field.startsWith('check:') ? false : null);
    if (JSON.stringify(before[field]) !== JSON.stringify(v)) patch[field] = v;
  }
  fields = { ...fields, ...patch };
  if (connected) {
    for (const [k, v] of Object.entries(patch)) pending[k] = {value: v, revision: ++revision};
    persist();
    emit('Saving changes…');
    void sync();
  } else {
    save(`nwrt26.${key}`, value);
    emit(storageOK ? 'Saved on this device' : 'Changes are only in this open tab');
  }
}
export function useSharedStored<T>(key: string, initial: T, normalize: (value: unknown) => T) {
  const current = useSyncExternalStore(subscribe, () => state);
  const serialized = JSON.stringify(valueFor(key, current.fields) ?? initial);
  const value = useMemo(() => normalize(JSON.parse(serialized)), [serialized, normalize]);
  const set = useCallback((next: T | ((previous: T) => T)) => {
    const previous = normalize(valueFor(key, fields) ?? initial);
    update(key, normalize(typeof next === 'function' ? (next as (p: T) => T)(previous) : next));
  }, [key, normalize]);
  return [value, set] as const;
}
export const useSharedStatus = () => useSyncExternalStore(subscribe, () => state);
async function request(invite: string, patch?: Fields) {
  const response = await fetch('/api/trip', {
    method: patch ? 'PATCH' : 'GET', cache: 'no-store', credentials: 'omit',
    headers: { Authorization: `Bearer ${invite}`, ...(patch ? {'Content-Type':'application/json'} : {}) },
    body: patch ? JSON.stringify(patch) : undefined, signal: AbortSignal.timeout(12000)
  });
  if (response.status === 401) throw Error('This invite link is not valid. Ask for the current link.');
  if (response.status === 503) throw Error('Shared storage has not been connected yet.');
  if (!response.ok) throw Error('Could not sync. Changes remain on this device and will retry.');
  const result = await response.json();
  if (!result.fields || typeof result.fields !== 'object' || Array.isArray(result.fields)) throw Error('Invalid sync response. Please retry.');
  return cleanFields(result.fields);
}
export async function sync() {
  if (!token || !connected || busy || document.visibilityState === 'hidden') return;
  busy = true;
  const version = generation;
  const sent = { ...pending };
  let succeeded = false;
  try {
    const patch = Object.keys(sent).length ? Object.fromEntries(Object.entries(sent).map(([k, p]) => [k, p.value])) : undefined;
    const remote = await request(token, patch);
    if (version !== generation) return;
    succeeded = true;
    for (const [key, p] of Object.entries(sent)) if (pending[key]?.revision === p.revision) delete pending[key];
    fields = { ...remote, ...Object.fromEntries(Object.entries(pending).map(([k, p]) => [k, p.value])) };
    persist();
    emit(Object.keys(pending).length ? 'Saving changes…' : 'Shared trip is up to date', Date.now());
  } catch (error) {
    if (version === generation) emit(error instanceof Error ? error.message : 'Could not sync. Please retry.');
  } finally {
    busy = false;
  }
  // Changes made while a request was in flight are sent separately, never dropped.
  if (succeeded && version === generation && Object.keys(pending).length) void sync();
}
export function inviteFrom(value: string): string | null {
  if (validToken(value.trim())) return value.trim();
  try {
    const url = new URL(value);
    const candidate = url.hash.match(/^#join\/([A-Za-z0-9_-]{43})$/)?.[1];
    return url.origin === window.location.origin && candidate ? candidate : null;
  } catch { return null; }
}
export async function joinSharedTrip(value: string) {
  const invite = inviteFrom(value);
  if (!invite) throw Error('Paste the full invite link from this website.');
  const remote = await request(invite);
  generation++;
  token = invite;
  connected = true;
  const cache = read(cacheKey(invite)) as {pending?: Pending} | null;
  pending = cleanPending(cache?.pending);
  revision = Math.max(revision, ...Object.values(pending).map(p => p.revision));
  fields = { ...remote, ...Object.fromEntries(Object.entries(pending).map(([k, p]) => [k, p.value])) };
  save('nwrt26.shared.token', token);
  persist();
  emit('Shared trip is up to date', Date.now());
  void sync();
}
export function leaveSharedTrip() {
  generation++;
  persist();
  token = null; connected = false; pending = {}; fields = personalFields();
  save('nwrt26.shared.token', null);
  emit('Saved on this device', null);
}
export function sharedLink() { return token && connected ? `${window.location.origin}/#join/${token}` : ''; }
export function importPersonalPlan() {
  if (!connected) return;
  const local = personalFields();
  // Explicit initial import only; joining never overwrites the shared plan.
  for (const [key, value] of Object.entries(local)) pending[key] = {value, revision: ++revision};
  fields = { ...fields, ...local };
  persist(); emit('Saving changes…'); void sync();
}
export function startSharedSync() {
  const invite = window.location.hash.match(/^#join\/([A-Za-z0-9_-]{43})$/)?.[1];
  if (invite) {
    window.history.replaceState(window.history.state, '', '#guide/checklist');
    void joinSharedTrip(invite).catch(error => emit(error.message));
  } else if (connected) void sync();
  else if (token) void joinSharedTrip(token).catch(error => emit(error.message));
  const wake = () => { void sync(); };
  const interval = setInterval(wake, 30000);
  window.addEventListener('online', wake);
  document.addEventListener('visibilitychange', wake);
  return () => { clearInterval(interval); window.removeEventListener('online', wake); document.removeEventListener('visibilitychange', wake); };
}
