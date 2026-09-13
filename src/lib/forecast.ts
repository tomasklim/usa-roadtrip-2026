import locations from '../data/weather-places.json';
import { weatherLocationForDay } from './weather';
import type { Day } from '../types';

const DAY = 864e5;
export const FORECAST_TTL = 3600e3;
const MAX_SAVED_AGE = 24 * FORECAST_TTL;
interface Place { name: string; latitude: number; longitude: number; timezone: string }
const places = locations.places as Record<string, Place>;
export interface ForecastTarget extends Place { id: string; date: string }
export interface ForecastDay {
  high: number; low: number; wet: number | null; code: number | null;
  rain: number | null; snow: number | null; wind: number | null;
}
interface CachedForecast { fetchedAt: number; dates: Record<string, ForecastDay> }
export interface ForecastResult {
  state: 'ready' | 'outside' | 'past' | 'unavailable' | 'error';
  data?: ForecastDay; fetchedAt?: number; stale?: boolean;
}
const memory = new Map<string, CachedForecast>();
const pending = new Map<string, Promise<CachedForecast>>();
const failures = new Map<string, number>();
const numeric = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const optional = (v: unknown, min = 0, max = Infinity) => numeric(v) && v >= min && v <= max ? v : null;
const dateStamp = (s: string) => Date.parse(`${s}T00:00:00Z`);

export function forecastTargets(day: Day) {
  const location = weatherLocationForDay(day);
  const target = (id: string | undefined, date: number): ForecastTarget | null => id && places[id] && Number.isFinite(date)
    ? { ...places[id], id, date: new Date(date).toISOString().slice(0, 10) } : null;
  return {
    daytime: target(location?.day, day.date ?? NaN),
    night: day.sleep ? target(day.sleep.t === 'car' ? location?.car : location?.bed, (day.date ?? NaN) + DAY) : null
  };
}

/** Trip dates are calendar dates; today must be calculated in the destination timezone. */
export function forecastRange(target: ForecastTarget, now = Date.now()): 'inside' | 'outside' | 'past' {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: target.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)!.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const offset = (dateStamp(target.date) - dateStamp(today)) / DAY;
  return offset < 0 ? 'past' : offset <= 15 ? 'inside' : 'outside';
}

export function forecastUrl(target: ForecastTarget): string {
  const query = new URLSearchParams({
    latitude: String(target.latitude), longitude: String(target.longitude), timezone: target.timezone,
    forecast_days: '16', temperature_unit: 'celsius', wind_speed_unit: 'kmh', precipitation_unit: 'mm',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,precipitation_sum,snowfall_sum,wind_speed_10m_max'
  });
  return `https://api.open-meteo.com/v1/forecast?${query}`;
}

export function parseForecast(raw: unknown): Record<string, ForecastDay> {
  if (!raw || typeof raw !== 'object' || !('daily' in raw) || !raw.daily || typeof raw.daily !== 'object') throw Error('Missing daily forecast');
  const daily = raw.daily as Record<string, unknown>;
  if (!Array.isArray(daily.time)) throw Error('Missing forecast dates');
  const value = (key: string, i: number) => Array.isArray(daily[key]) ? daily[key][i] : null;
  const out: Record<string, ForecastDay> = {};
  daily.time.forEach((date, i) => {
    const high = value('temperature_2m_max', i), low = value('temperature_2m_min', i);
    // Missing far-horizon values are unavailable, never zero degrees or yesterday's forecast.
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !numeric(high) || !numeric(low) || low > high || low < -100 || high > 65) return;
    out[date] = { high, low, wet: optional(value('precipitation_probability_max', i), 0, 100),
      code: optional(value('weather_code', i), 0, 99), rain: optional(value('precipitation_sum', i)),
      snow: optional(value('snowfall_sum', i)), wind: optional(value('wind_speed_10m_max', i)) };
  });
  return out;
}

function readCache(key: string, now: number): CachedForecast | undefined {
  let cached = memory.get(key);
  if (!cached) {
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (value && numeric(value.fetchedAt) && value.dates && typeof value.dates === 'object') {
        const dates: Record<string, ForecastDay> = {};
        for (const [date, raw] of Object.entries(value.dates)) {
          const d = raw as ForecastDay | null;
          if (/^\d{4}-\d{2}-\d{2}$/.test(date) && d && numeric(d.high) && numeric(d.low) && d.low <= d.high && d.low >= -100 && d.high <= 65) dates[date] = {
            high: d.high, low: d.low, wet: optional(d.wet, 0, 100), code: optional(d.code, 0, 99),
            rain: optional(d.rain), snow: optional(d.snow), wind: optional(d.wind)
          };
        }
        cached = { fetchedAt: value.fetchedAt, dates };
      }
    } catch { /* Storage may be unavailable while travelling. */ }
  }
  return cached && now >= cached.fetchedAt && now - cached.fetchedAt <= MAX_SAVED_AGE ? cached : undefined;
}

export async function loadForecast(target: ForecastTarget, now = Date.now()): Promise<ForecastResult> {
  const range = forecastRange(target, now);
  if (range !== 'inside') return { state: range };
  const url = forecastUrl(target);
  const key = `nwrt26.forecast.v1.${target.id}.${target.latitude}.${target.longitude}.${target.timezone}`;
  const cached = readCache(key, now);
  const result = (entry: CachedForecast, stale = false): ForecastResult => entry.dates[target.date]
    ? { state: 'ready', data: entry.dates[target.date], fetchedAt: entry.fetchedAt, stale }
    : { state: 'unavailable' };
  if (cached && now - cached.fetchedAt < FORECAST_TTL) return result(cached);
  const fallback = (): ForecastResult => cached?.dates[target.date] ? result(cached, true) : { state: 'error' };
  if (now - (failures.get(key) ?? -Infinity) < 300e3) return fallback();
  try {
    let request = pending.get(key);
    if (!request) {
      request = (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
          const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
          if (!response.ok) throw Error(`Weather service ${response.status}`);
          const entry = { fetchedAt: now, dates: parseForecast(await response.json()) };
          memory.set(key, entry);
          try { localStorage.setItem(key, JSON.stringify(entry)); } catch { /* Memory cache still works. */ }
          failures.delete(key);
          return entry;
        } finally { clearTimeout(timeout); }
      })();
      pending.set(key, request);
      // Both branches clean up without creating an unhandled rejected promise.
      void request.then(() => pending.delete(key), () => pending.delete(key));
    }
    return result(await request);
  } catch {
    failures.set(key, now);
    return fallback();
  }
}

export function weatherCondition(code: number | null): string {
  if (code === 0) return '☀ Clear sky';
  if (code === 1) return '☀ Mainly clear';
  if (code === 2) return '⛅ Partly cloudy';
  if (code === 3) return '☁ Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code != null && [51, 53, 55].includes(code)) return 'Drizzle';
  if (code != null && [56, 57, 66, 67].includes(code)) return 'Freezing rain / drizzle';
  if (code != null && [61, 63, 65, 80, 81, 82].includes(code)) return 'Rain / showers';
  if (code != null && [71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if (code != null && [95, 96, 99].includes(code)) return 'Thunderstorms';
  return 'Conditions unavailable';
}
