import type { Day } from '../types';
import type { Journal } from '../lib/journal';
import { DINOSAUR_PLANS } from '../data/dinosaur';
import { useSharedStatus } from '../lib/sharedTrip';

export function DinosaurChoices({day,setJournal}:{day:Day;setJournal:(f:(p:Journal)=>Journal)=>void}) {
  const shared = useSharedStatus();
  if (day.id !== 'utQuarry' || day.completed || !day.routeId || !DINOSAUR_PLANS[day.routeId]) return null;
  const date = new Date(day.date!).toISOString().slice(0,10);
  const choose = (variant:string) => setJournal(p=>({...p,[date]:{...p[date],variant,status:'planned',title:p[date]?.title ?? '',note:p[date]?.note ?? ''}}));
  return <details className="seattle-choices" open>
    <summary><span><b>Dinosaur or a rainy-day detour?</b><small>Every option ends in Salt Lake City tonight</small></span></summary>
    <div className="seattle-choice-body">
      <div className="weather-switch" role="group" aria-label="Dinosaur weather plan">
        {[['dinoDry','☀ Cub Creek & river'],['dinoHarpers','☀ Harpers Corner · longer'],['dinoRain','☂ Midway & warm water']].map(([id,label])=><button key={id} disabled={!shared.connected && !import.meta.env.DEV} aria-pressed={day.routeId===id} onClick={()=>choose(id)}>{label}</button>)}
      </div>
      <p className="hint">Choose after checking the morning forecast. The map, driving estimate and overnight weather follow your choice. Harpers Corner replaces the Utah-side loop; it is a longer day.</p>
      <div className="seattle-sources">
        <a href="https://www.nps.gov/dino/planyourvisit/conditions.htm" target="_blank" rel="noreferrer">NPS road & trail conditions ↗</a>
        <a href="https://homesteadmidwayutah.com/adventures/crater/" target="_blank" rel="noreferrer">Crater hours & reservations ↗</a>
        <a href="https://parkcityhistory.org/visit/" target="_blank" rel="noreferrer">Park City Museum ↗</a>
      </div>
    </div>
  </details>;
}
