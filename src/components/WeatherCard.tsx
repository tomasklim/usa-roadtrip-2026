import type { Day } from "../types";
import { weatherForDay, degrees, weatherSummary } from "../lib/weather";

export function WeatherCard({ day }: { day: Day }) {
  const weather = weatherForDay(day);
  if (!weather) return null;
  const { daytime, night } = weather;
  return <aside className="weather-card" aria-label="Historical weather estimate">
    <div className="weather-heading"><b>Weather around your dates</b><span>2015–2025 · historical estimate</span></div>
    <div className="weather-values">
      <div><span>DAYTIME HIGH</span><strong>{degrees(daytime.stats.high)}</strong><small>{daytime.name}</small></div>
      {night && <div><span>OVERNIGHT LOW</span><strong>{degrees(night.stats.low)}</strong><small>{night.name} · {day.sleep?.t === "car" ? "car night" : "bed"}</small></div>}
      <div><span>WET DAYS</span><strong>{daytime.stats.wetPct}%</strong><small>Historically · daytime area</small></div>
    </div>
    {night && day.sleep?.t === "car" && night.stats.lowP10 < 0 && <p className="weather-cold">Cold car night: colder historical lows reached {degrees(night.stats.lowP10)} (10th percentile). Recheck the forecast before choosing a camp.</p>}
    <details key={day.id}><summary>Temperature range & sources</summary>
      <p>{weatherSummary(day)}</p>
      {night && <p>At the overnight area, {night.stats.frostPct}% of sampled daily lows fell below 0°C. One in ten was {degrees(night.stats.lowP10)} or colder. Overnight estimates use the following morning’s calendar date.</p>}
      <p>165 local calendar days per estimate: your date ±7 days across 2015–2025. Temperatures are average daily highs/lows; wet means at least 1 mm of precipitation, including snow. These are historical frequencies, not a forecast for 2026.</p>
      <p>Representative areas, not exact campsites. Terrain, altitude and coastal wind can change conditions substantially. Reanalysis estimates: ERA5-Land temperatures (~11 km), ERA5 precipitation (~25 km), with elevation adjustment.</p>
      <p>Data: <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">Open-Meteo</a> · Copernicus ERA5 / ERA5-Land · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Calculated for this itinerary; available in the offline copy.</p>
    </details>
  </aside>;
}
