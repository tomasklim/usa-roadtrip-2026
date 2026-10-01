import { validField } from '../../shared/trip-schema.mjs';
import { BASE } from '../data/itinerary';
import type { Day } from '../types';

export interface JournalEntry { variant: string; title: string; note: string; status: 'done' | 'planned' }
export type Journal = Record<string, JournalEntry>;
export const normalizeJournal = (v: unknown): Journal => Object.fromEntries(Object.entries(v && typeof v === 'object' ? v : {}).filter(([date, entry]) => entry !== null && validField(`journal:${date}`, entry)));
const base = (id: string) => BASE.find(d => d.id === id)!;
export const JOURNEY_VARIANTS: Record<string, Partial<Day> & { title: string }> = {
  arrival: { ...base('arrive'), photos: ['model3','wholefoods','tacoma'], weather: {day:'seatac'}, routeId: 'recorded', poiDay: 'recorded', at: [47.2529,-122.4443] },
  hood: { ...base('seaB'), title: 'Hama Hama & State Capitol', photos: ['oysters','olympiacapitol','rhododendrons'], routeId: 'recorded', poiDay: 'seaB', at: [47.539,-123.038], weather: {day:'hood'} },
  rainier: { ...base('seaA'), routeId: 'recorded', poiDay: 'waRainier', at: [46.786,-121.735], weather: {day:'rainier'} },
  seattle: { ...base('sea1'), photos: ['pikeplace','kerrypark','shakeshack'], routeId: 'recorded', poiDay: 'sea1', at: [47.6097,-122.3422], weather: {day:'seattle'} },
  redmond: { title: 'Redmond · tech companies', leg: 'Redmond, Washington', routeId: 'recorded', poiDay: 'recorded', at: [47.674,-122.1215], photos: ['microsoftRedmond','nintendoRedmond','targetSign'], weather: {day:'seattle'} },
  salt: { ...base('s1'), photos: ['bonneville','innoutburger','nevadaBorder'], routeId: 'recorded', poiDay: 's1', at: [40.76,-111.89], weather: {day:'bonneville'} },
  antelopeMontpelier: { title: 'Antelope Island, Logan Canyon & Bear Lake', leg: 'Antelope Island → Logan Canyon → Bear Lake → Montpelier', routeId: 'recorded', poiDay: 'recorded', at: [42.322,-111.298], photos: ['antelopeSunset','bearlake','logancanyon'], weather: {day:'bearlake'} },
  montpelierTetons: {
    title: 'Montpelier to Jackson & the Tetons', leg: 'Montpelier → Afton → Alpine → Jackson → Mormon Row → Schwabacher Landing → Jenny Lake → Jackson',
    routeId: 'montpelierTetons', poiDay: 's3', hours: 4.5, at: [43.48,-110.76], photos: ['schwabacher','mormonrow','jennylake'], weather: {day:'teton',bed:'jackson',car:'jackson'},
    hi: ['Leave Montpelier around 08:00 with enough charge. Allow roughly 2½–3 hours to Jackson via Afton, Alpine and Snake River Canyon, before stops.',
      'Around 11:00–12:30: Jackson, lunch, groceries and a Supercharger stop. Follow the Tesla navigation estimate for the park loop and return reserve.',
      'Afternoon: Mormon Row (30–45 min), Schwabacher Landing (30–45 min), then Jenny Lake shoreline (60–90 min). Keep time for construction and wildlife stops.',
      'Return to Jackson for dinner and the night. This keeps the next Yellowstone day on its existing date.'],
    ideas: ['Periodic Spring near Afton is an alternative: allow about 1½–2 hours including the gravel-road detour and walk. If you choose it, shorten the Teton afternoon; do not add a long Jenny Lake hike as well.',
      'For Hidden Falls on foot, allow roughly 3 hours for the 8 km return walk; replace other afternoon stops. The shuttle boat season ends September 30.',
      'Skip Signal Mountain and Oxbow Bend today; the northbound Yellowstone drive offers another opportunity for Oxbow Bend.'],
    sleep: {t:'motel',where:'Jackson — choose a hotel or a permitted campsite'},
    charge: ['Montpelier Supercharger before departure if needed.', 'Jackson Supercharger before the park loop; check live availability and arrival charge in the car. No adapter is assumed.'],
    alert: 'Jenny Lake boats stop after September 30, 2026. Moose–Wilson Road is closed between the Rockefeller Preserve and Moose; use US-89/191 via Moose Junction. Allow about 20 minutes for work at Moose. Sources: jennylakeboating.com and NPS road construction, checked September 30.',
    why: 'A transfer morning and a manageable first afternoon in Grand Teton, without shifting Yellowstone or the flights.'
  }
};

export function applyJournal(day: Day, entry: JournalEntry): Day {
  const variant = JOURNEY_VARIANTS[entry.variant];
  const result = { ...day, ...variant, id: day.id, act: day.act, completed: entry.status === 'done' };
  if (entry.title.trim()) result.title = entry.title.trim();
  if (entry.note.trim()) result.hi = entry.note.split('\n').filter(Boolean);
  if (result.completed) {
    result.leg = entry.note.split('\n')[0] || result.title;
    result.ideas = []; result.alert = undefined; result.charge = []; result.food = [];
    result.hours = 0; result.routeId = 'recorded';
    result.poiDay = 'recorded';
    result.sleep = {t:'motel',where:'Overnight location not recorded'};
    result.why = 'Recorded from your trip. Distances and exact driving tracks were not logged.';
  }
  return result;
}
