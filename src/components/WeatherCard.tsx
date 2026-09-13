import { useForecast } from "../lib/useForecast";
import { weatherCondition } from "../lib/forecast";
import type { Day } from "../types";
import { weatherForDay, degrees, weatherSummary } from "../lib/weather";

export function WeatherCard({ day }: { day: Day }) {
  const forecast = useForecast(day);
  const weather = weatherForDay(day);
  if (!weather) return null;
  const { daytime, night } = weather;
  const live = forecast.daytime?.data;
  const nightForecast = forecast.night?.data;
  const checked = forecast.daytime?.fetchedAt;
  const status = forecast.loading ? 'Checking the forecast…'
    : forecast.daytime?.state === 'outside' ? 'The forecast will appear here automatically when this date is within reach (up to 16 days ahead).'
    : forecast.daytime?.state === 'past' ? 'This date has passed. Showing the historical climate estimate, not observed weather.'
    : forecast.daytime?.state === 'error' ? 'Forecast could not be loaded. Showing historical estimates; we will retry when you reconnect.'
    : 'The provider has no forecast for this date yet. Showing historical estimates for now.';
  return <aside className="weather-card" aria-label={live ? "Weather forecast" : "Historical weather estimate"}>
    <div className="weather-heading"><b>{live ? 'Forecast for your visit' : 'Weather around your dates'}</b><span>{live ? `${forecast.targets.daytime?.date} · ${forecast.daytime?.stale ? 'saved forecast' : 'Open-Meteo'}` : '2015–2025 · historical estimate'}</span></div>
    {!live && <p className="forecast-status" role="status">{status}</p>}
    {live && <p className="forecast-condition">{weatherCondition(live.code)}{live.rain != null && <> · Precipitation {live.rain.toFixed(1)} mm</>}{live.wind != null && <> · Wind up to {Math.round(live.wind)} km/h</>}{live.snow != null && live.snow > 0 && <> · Snow {live.snow.toFixed(1)} cm</>}</p>}
    <div className="weather-values">
      <div><span>DAYTIME HIGH</span><strong>{degrees(live?.high ?? daytime.stats.high)}</strong><small>{daytime.name}</small></div>
      {night && <div><span>OVERNIGHT LOW</span><strong>{degrees(nightForecast?.low ?? night.stats.low)}</strong><small>{night.name} · {day.sleep?.t === "car" ? "car night" : "bed"}{live && !nightForecast ? ' · historical estimate' : ''}{!live && nightForecast ? ' · forecast' : ''}{forecast.night?.stale ? ' · saved forecast' : ''}</small></div>}
      <div><span>{live ? 'PRECIPITATION CHANCE' : 'WET DAYS'}</span><strong>{live ? live.wet == null ? '—' : `${Math.round(live.wet)}%` : `${daytime.stats.wetPct}%`}</strong><small>{live ? 'Forecast · daytime area' : 'Historically · daytime area'}</small></div>
    </div>
    {live && <p className="forecast-status">{forecast.daytime?.stale ? 'Unable to refresh. This saved forecast may have changed. ' : ''}{checked && <>Checked {new Date(checked).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} (your device time). </>}Updates hourly while you use the site. {forecast.targets.daytime && new Date(forecast.targets.daytime.date + 'T00:00:00Z').getTime() - Date.now() > 7 * 864e5 ? 'More than a week ahead: treat this as an early outlook.' : ''}</p>}
    {night && day.sleep?.t === "car" && (nightForecast ? nightForecast.low < 0 : night.stats.lowP10 < 0) && <p className="weather-cold">{nightForecast ? `Freezing car night: forecast low ${degrees(nightForecast.low)}${forecast.night?.stale ? ' in the saved forecast' : ''}. Check conditions before choosing a camp.` : `Cold car night: colder historical lows reached ${degrees(night.stats.lowP10)} (10th percentile). Recheck the forecast before choosing a camp.`}</p>}
    <details key={day.id}><summary>{live ? 'Historical comparison & weather sources' : 'Temperature range & sources'}</summary>
      <p>Live forecasts: <a href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">Open-Meteo Forecast API</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Daily values follow each place’s local timezone. The overnight low uses the next calendar day at the selected sleeping area, as an approximation of the following morning. Forecasts are checked on opening, reconnecting and while this page remains open; cached for one hour.</p>
      <p>{weatherSummary(day)}</p>
      {night && <p>At the overnight area, {night.stats.frostPct}% of sampled daily lows fell below 0°C. One in ten was {degrees(night.stats.lowP10)} or colder. Overnight estimates use the following morning’s calendar date.</p>}
      <p>165 local calendar days per estimate: your date ±7 days across 2015–2025. Temperatures are average daily highs/lows; wet means at least 1 mm of precipitation, including snow. These are historical frequencies, not a forecast for 2026.</p>
      <p>Representative areas, not exact campsites. Terrain, altitude and coastal wind can change conditions substantially. Reanalysis estimates: ERA5-Land temperatures (~11 km), ERA5 precipitation (~25 km), with elevation adjustment.</p>
      <p>Data: <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">Open-Meteo</a> · Copernicus ERA5 / ERA5-Land · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Calculated for this itinerary; available in the offline copy.</p>
    </details>
  </aside>;
}
