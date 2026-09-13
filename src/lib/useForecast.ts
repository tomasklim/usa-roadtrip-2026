import { useEffect, useState } from 'react';
import { forecastTargets, loadForecast, type ForecastResult } from './forecast';
import type { Day } from '../types';

interface State { key: string; daytime: ForecastResult | null; night: ForecastResult | null; loading: boolean }
export function useForecast(day: Day) {
  const targets = forecastTargets(day);
  const key = JSON.stringify(targets);
  const [state, setState] = useState<State>({ key: '', daytime: null, night: null, loading: true });
  useEffect(() => {
    let active = true;
    let loading = false;
    const current: ReturnType<typeof forecastTargets> = JSON.parse(key);
    const refresh = async () => {
      if (loading || document.visibilityState === 'hidden') return;
      loading = true;
      const [daytime, night] = await Promise.all([
        current.daytime ? loadForecast(current.daytime) : null,
        current.night ? loadForecast(current.night) : null
      ]);
      if (active) setState({ key, daytime, night, loading: false });
      loading = false;
    };
    void refresh();
    const wake = () => { void refresh(); };
    const timer = setInterval(wake, 10 * 60e3);
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', wake);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('online', wake);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [key]);
  // A response for the previous place must never flash under the newly selected day.
  return { ...(state.key === key ? state : { key, daytime: null, night: null, loading: true }), targets };
}
