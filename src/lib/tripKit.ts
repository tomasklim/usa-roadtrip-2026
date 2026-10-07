import poisRaw from '../data/pois.json';
import type { Day, Poi } from '../types';
import type { Trip } from './trip';

export const remainingDays = (trip: Trip) => trip.days.filter(d => !d.completed);
/** Show only meals and grocery stops explicitly mentioned in the private journal. */
export const recordedFood = (day: Day) => day.completed
  ? day.hi.filter(line => /oysters|in-n-out|shake shack|longhorn|whole foods|starbucks|mcdonald|mexican food/i.test(line) && !/^(rain|weather)/i.test(line)) : [];

/** Saved alternatives relevant to this day, including SLC restaurants reused by the Utah return. */
export function poisForDay(day: Day): Poi[] {
  const keys = new Set([day.poiDay ?? day.id]);
  if (!day.completed && ['utMoab', 'utReturn'].includes(day.id)) keys.add('s1');
  if (!day.completed && day.id === 'utCanyon') keys.add('s10');
  return (poisRaw as Poi[]).filter(p => p.day === (day.poiDay ?? day.id) || (p.kind === 'food' && keys.has(p.day)));
}
