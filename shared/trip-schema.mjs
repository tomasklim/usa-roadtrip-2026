export function validField(key, value) {
  if (/^journal:2026-\d{2}-\d{2}$/.test(key)) return value === null || (value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(k => ['variant', 'title', 'note', 'status', 'roadKm', 'roadNote', 'flight'].includes(k))
    && typeof value.variant === 'string' && /^[a-zA-Z0-9-]{0,80}$/.test(value.variant)
    && typeof value.title === 'string' && value.title.length <= 200
    && typeof value.note === 'string' && value.note.length <= 4000
    && (value.roadKm == null || (typeof value.roadKm === 'number' && Number.isFinite(value.roadKm) && value.roadKm >= 0 && value.roadKm <= 5000))
    && (value.roadNote === undefined || (typeof value.roadNote === 'string' && value.roadNote.length <= 2000))
    && (value.flight === undefined || (value.flight && typeof value.flight === 'object' && !Array.isArray(value.flight)
      && Object.keys(value.flight).length === 4 && Object.keys(value.flight).every(k => ['from','to','dep','arr'].includes(k))
      && value.flight.from === 'SEA' && value.flight.to === 'SLC'
      && typeof value.flight.dep === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$|^$/.test(value.flight.dep)
      && typeof value.flight.arr === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$|^$/.test(value.flight.arr)))
    && ['done', 'planned'].includes(value.status)
    && Number.isFinite(Date.parse(key.slice(8))) && new Date(key.slice(8)).toISOString().slice(0,10) === key.slice(8));
  if (/^stay:[a-zA-Z0-9-]{1,80}$/.test(key)) return value === null || (value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(k => ['place', 'note', 'type'].includes(k))
    && typeof value.place === 'string' && value.place.length <= 300
    && typeof value.note === 'string' && value.note.length <= 4000
    && ['undecided', 'bed', 'car'].includes(value.type));
  if (/^expense:[a-zA-Z0-9-]{1,80}$/.test(key)) return value === null || (value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(k => ['amount', 'currency', 'status', 'note'].includes(k))
    && (value.amount === null || (typeof value.amount === 'number' && Number.isFinite(value.amount) && value.amount >= 0 && value.amount <= 1000000))
    && ['EUR', 'USD', 'CZK'].includes(value.currency) && ['estimate', 'paid'].includes(value.status)
    && typeof value.note === 'string' && value.note.length <= 2000);

  if (/^check:[a-z0-9-]{1,80}$/.test(key)) return typeof value === 'boolean';
  if (/^sleep:[a-zA-Z0-9-]{1,80}$/.test(key)) return value === null || value === 'bed' || value === 'price';
  if (key === 'plan:sleepStyle') return ['motel', 'balanced', 'car'].includes(value);
  if (key === 'plan:mods') return Array.isArray(value) && value.length <= 10 && value.every(v => typeof v === 'string' && /^[a-zA-Z0-9-]{1,40}$/.test(v));
  if (key === 'plan:seattlePlan') return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === 4 && ['good', 'rain'].includes(value.weather)
    && typeof value.portland === 'boolean' && ['sat', 'sun', 'mon'].includes(value.rainier)
    && ['mon-am', 'mon-pm', 'tue-am'].includes(value.flight);
  return false;
}
export function validPatch(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length > 0 && Object.keys(value).length <= 150
    && JSON.stringify(value).length <= 128000
    && Object.entries(value).every(([key, entry]) => validField(key, entry));
}
