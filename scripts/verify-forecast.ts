import assert from 'node:assert/strict';
import { buildTrip } from '../src/lib/trip';
import { forecastTargets, forecastRange, forecastUrl, parseForecast, loadForecast, FORECAST_TTL } from '../src/lib/forecast';

async function main() {
  const trip = buildTrip(new Set());
  const first = forecastTargets(trip.days[0]);
  assert.equal(first.daytime?.date, '2026-09-24');
  assert.equal(first.night?.date, '2026-09-25');
  const teton = trip.days.find(d => d.id === 's3')!;
  assert.equal(forecastTargets(teton).night?.id, 'shadow');
  assert.equal(forecastTargets(buildTrip(new Set(), 'motel').days.find(d => d.id === 's3')!).night?.id, 'jackson');
  assert.equal(forecastTargets({ ...teton, weather: { day: 'portland', bed: 'olympia', car: 'rainier' } }).daytime?.id, 'portland');
  const target = { ...first.daytime!, date: '2026-09-28' };
  const now = Date.parse('2026-09-14T01:00:00Z'); // Still September 13 in Washington.
  assert.equal(forecastRange(target, now), 'inside');
  assert.equal(forecastRange({ ...target, date: '2026-09-29' }, now), 'outside');
  assert.equal(forecastRange({ ...target, date: '2026-09-29' }, Date.parse('2026-09-14T07:00:00Z')), 'inside');
  assert.equal(forecastRange({ ...target, date: '2026-09-12' }, now), 'past');
  const url = new URL(forecastUrl(target));
  assert.equal(url.origin, 'https://api.open-meteo.com');
  assert.equal(url.searchParams.get('timezone'), target.timezone);
  assert.equal(url.searchParams.get('forecast_days'), '16');
  const payload = { daily: { time: ['2026-09-24', '2026-09-25', '2026-09-28'], temperature_2m_max: [20, 0, null], temperature_2m_min: [10, -2, null], precipitation_probability_max: [40, 0, null] } };
  const parsed = parseForecast(payload);
  assert.equal(parsed['2026-09-25'].high, 0);
  assert.equal(parsed['2026-09-25'].wet, 0);
  assert.equal(parsed['2026-09-28'], undefined);
  assert.throws(() => parseForecast({}));
  let calls = 0;
  let fail = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    calls++;
    if (fail) throw Error('offline');
    return { ok: true, json: async () => payload };
  }) as typeof fetch;
  try {
    assert.equal((await loadForecast({ ...target, date: '2026-10-01' }, now)).state, 'outside');
    assert.equal(calls, 0);
    const a = { ...target, date: '2026-09-24' };
    const b = { ...target, date: '2026-09-25' };
    const [day, night] = await Promise.all([loadForecast(a, now), loadForecast(b, now)]);
    assert.equal(calls, 1, 'Concurrent requests for a location must be shared');
    assert.equal(day.data?.high, 20);
    assert.equal(night.data?.low, -2, 'Select the exact requested date');
    await loadForecast(a, now + 1000);
    assert.equal(calls, 1, 'Use the hourly cache');
    assert.equal((await loadForecast(target, now)).state, 'unavailable');
    fail = true;
    const stale = await loadForecast(a, now + FORECAST_TTL);
    assert.equal(stale.stale, true);
    assert.equal(stale.data?.high, 20);
    await loadForecast(a, now + FORECAST_TTL + 1000);
    assert.equal(calls, 2, 'Back off after a failed request');
    assert.equal((await loadForecast(a, now + 25 * FORECAST_TTL)).state, 'error', 'Do not show forecasts older than 24 hours');
    assert.equal((await loadForecast({ ...a, id: 'uncached' }, now)).state, 'error');
  } finally { globalThis.fetch = originalFetch; }
  console.log('✓ Forecast dates, local-time horizon, day/night and route selection, missing data, deduplication, cache expiry and offline fallback');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
