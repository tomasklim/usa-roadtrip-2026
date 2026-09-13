export function validField(key, value) {
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
