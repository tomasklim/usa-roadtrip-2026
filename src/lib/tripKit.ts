import type { Day } from '../types';
import type { Trip } from './trip';

export const remainingDays = (trip: Trip) => trip.days.filter(d => !d.completed);
/** Show only meals and grocery stops explicitly mentioned in the private journal. */
export const recordedFood = (day: Day) => day.completed
  ? day.hi.filter(line => /oysters|in-n-out|shake shack|longhorn|whole foods|starbucks|mcdonald|mexican food/i.test(line) && !/^(rain|weather)/i.test(line)) : [];
