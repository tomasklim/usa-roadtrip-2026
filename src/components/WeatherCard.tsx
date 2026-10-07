import { useForecast } from "../lib/useForecast";
import { weatherCondition } from "../lib/forecast";
import type { Day } from "../types";
import { weatherForDay, degrees, weatherSummary } from "../lib/weather";

export function WeatherCard({ day }: { day: Day }) {
  const forecast = useForecast(day);
  const history = weatherForDay(day);
  const live = forecast.daytime?.data;
  const nightLive = forecast.night?.data;
  const historicalNight = history?.night;
  const high = live?.high ?? history?.daytime.stats.high;
  const low = nightLive?.low ?? historicalNight?.stats.low;
  if (!forecast.targets.daytime && !history) return null;
  const status = day.completed || forecast.daytime?.state === 'past'
    ? `This date has passed. ${history ? 'Showing a historical climate estimate, not observed weather.' : 'Observed weather is not recorded here.'}`
    : forecast.loading ? 'Checking the forecast…'
    : forecast.daytime?.state === 'outside' ? 'The forecast will appear automatically when this date is within reach (up to 16 days ahead).'
    : `Forecast unavailable for this date. ${history ? 'Showing historical estimates; recheck before travelling.' : 'Recheck before travelling.'}`;
  const cold = !day.completed && day.sleep?.t === 'car' && (nightLive ? nightLive.low < 0 : historicalNight && historicalNight.stats.lowP10 < 0);
  return <aside className="weather-card" aria-label={live || nightLive ? 'Weather forecast' : 'Weather estimates'}>
    <div className="weather-heading"><b>{live || nightLive ? 'Forecast for your visit' : 'Weather around your dates'}</b><span>{live || nightLive ? `${forecast.targets.daytime?.date} · Open-Meteo` : history ? '2015–2025 · historical estimate' : forecast.targets.daytime?.date}</span></div>
    {!live && <p className="forecast-status" role="status">{status}</p>}
    {live && <p className="forecast-condition">{weatherCondition(live.code)}{live.rain != null && <> · Precipitation {live.rain.toFixed(1)} mm</>}{live.wind != null && <> · Wind up to {Math.round(live.wind)} km/h</>}{live.snow != null && live.snow > 0 && <> · Snow {live.snow.toFixed(1)} cm</>}</p>}
    <div className="weather-values">
      <div><span>DAYTIME HIGH</span><strong>{high == null ? '—' : degrees(high)}</strong><small>{forecast.targets.daytime?.name ?? history?.daytime.name}{!live && history ? ' · historical estimate' : ''}</small></div>
      {day.sleep && <div><span>OVERNIGHT LOW</span><strong>{low == null ? '—' : degrees(low)}</strong><small>{forecast.targets.night?.name ?? historicalNight?.name ?? 'Overnight area'} · {day.sleep.t === 'car' ? 'car night' : 'bed'}{nightLive ? forecast.night?.stale ? ' · saved forecast' : ' · forecast' : historicalNight ? ' · historical estimate' : ' · unavailable'}</small></div>}
      {(live || history) && <div><span>{live ? 'PRECIPITATION CHANCE' : 'WET DAYS'}</span><strong>{live ? live.wet == null ? '—' : `${Math.round(live.wet)}%` : `${history!.daytime.stats.wetPct}%`}</strong><small>{live ? 'Forecast · daytime area' : 'Historically · daytime area'}</small></div>}
    </div>
    {(live || nightLive) && <p className="forecast-status">{forecast.daytime?.stale || forecast.night?.stale ? 'Saved forecast; refresh unavailable. ' : ''}{(forecast.daytime?.fetchedAt ?? forecast.night?.fetchedAt) && <>Checked {new Date((forecast.daytime?.fetchedAt ?? forecast.night?.fetchedAt)!).toLocaleString('en-GB', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} (your device time). </>}Updates hourly while you use the site. {forecast.targets.daytime && new Date(forecast.targets.daytime.date + 'T00:00:00Z').getTime() - Date.now() > 7 * 864e5 ? 'More than a week ahead: treat this as an early outlook.' : ''}</p>}
    {cold && <p className="weather-cold">{nightLive ? `Freezing car night: forecast low ${degrees(nightLive.low)}${forecast.night?.stale ? ' in the saved forecast' : ''}. Check conditions before choosing a camp.` : `Cold car night: colder historical lows reached ${degrees(historicalNight!.stats.lowP10)} (10th percentile). Recheck the forecast before choosing a camp.`}</p>}
    <details key={day.id}><summary>{live || nightLive ? 'Historical comparison & weather sources' : 'Temperature range & sources'}</summary>
      <p>Live forecasts: <a href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">Open-Meteo Forecast API</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Daily values follow each place’s local timezone. The overnight low uses the next calendar day at the selected sleeping area, as an approximation of the following morning. Forecasts are checked on opening, reconnecting and while this page remains open; cached for one hour.</p>
      <p>{weatherSummary(day)}</p>
      {day.sleep && !historicalNight && <p>No historical overnight estimate is available for this area. A live forecast appears when available.</p>}
      {historicalNight && <p>At the overnight area, {historicalNight.stats.frostPct}% of sampled daily lows fell below 0°C. One in ten was {degrees(historicalNight.stats.lowP10)} or colder.</p>}
      {history && <><p>165 local calendar days per estimate: your date ±7 days across 2015–2025. Temperatures are average daily highs/lows; wet means at least 1 mm of precipitation, including snow. These are historical frequencies, not a forecast for 2026.</p><p>Representative areas, not exact campsites. Terrain, altitude and coastal wind can change conditions substantially. Reanalysis estimates: ERA5-Land temperatures (~11 km), ERA5 precipitation (~25 km), with elevation adjustment.</p><p>Historical data: <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">Open-Meteo</a> · Copernicus ERA5 / ERA5-Land · CC BY 4.0. Available in the offline copy.</p></>}
    </details>
  </aside>;
}
