import history from "../data/weather-history.json";
import locations from "../data/weather-places.json";
import type { Day } from "../types";

export interface WeatherStats {
  n: number; high: number; low: number; highP25: number; highP75: number;
  lowP10: number; wetPct: number; frostPct: number; snowPct: number;
}
interface WeatherPlace { name: string; dates: Record<string, WeatherStats> }
const places = history.places as Record<string, WeatherPlace>;
const days = locations.days as Record<string, { day: string; bed?: string; car?: string }>;
const at = (id: string | undefined, date: number) => {
  const place = id ? places[id] : undefined;
  const stats = place?.dates[new Date(date).toISOString().slice(5, 10)];
  return place && stats ? { name: place.name, stats } : null;
};
export function weatherForDay(day: Day) {
  if (day.date == null || !Number.isFinite(day.date)) return null;
  const location = day.weather ?? days[day.id];
  if (!location) return null;
  const daytime = at(location.day, day.date);
  if (!daytime) return null;
  const night = day.sleep ? at(day.sleep.t === "car" ? location.car : location.bed, day.date + 864e5) : null;
  return { daytime, night };
}
export const degrees = (value: number) => `${Math.round(value)}°C`;
export function weatherSummary(day: Day): string {
  const w = weatherForDay(day);
  if (!w) return "Historical weather unavailable for this date.";
  const s = w.daytime.stats;
  return `${w.daytime.name}: average high ${degrees(s.high)}; the middle half of daily highs was ${degrees(s.highP25)} to ${degrees(s.highP75)}. ${s.wetPct}% wet days (≥1 mm).${w.night ? ` Overnight area ${w.night.name}: average low ${degrees(w.night.stats.low)}, colder lows ${degrees(w.night.stats.lowP10)} (10th percentile).` : ""}`;
}
