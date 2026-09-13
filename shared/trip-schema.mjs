export function validField(key, value) {
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
    && JSON.stringify(value).length <= 16000
    && Object.entries(value).every(([key, entry]) => validField(key, entry));
}
