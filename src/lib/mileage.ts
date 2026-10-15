import { validField } from '../../shared/trip-schema.mjs';
import { rentals, type Trip } from './trip';
export const RENTAL_NAMES = { seattle: 'Tesla Model 3 · Seattle', slc: 'Tesla Model S · Salt Lake City', sf: 'California rental' };
export type RentalId = keyof typeof RENTAL_NAMES;
export type RentalMileage = Partial<Record<RentalId, number>>;
export const normalizeMileage = (value: unknown): RentalMileage => Object.fromEntries(Object.entries(value && typeof value === 'object' ? value : {}).filter(([id, km]) => km !== null && validField(`mileage:${id}`, km)));
export function mileageSummary(trip: Trip, mileage: RentalMileage) {
  const blocks = rentals(trip);
  const active = (Object.keys(RENTAL_NAMES) as RentalId[]).filter(id => blocks[id].days > 0);
  const complete = active.length > 0 && active.every(id => mileage[id] !== undefined);
  const recordedKm = active.reduce((sum, id) => sum + (mileage[id] ?? 0), 0);
  return { active, complete, recordedKm };
}
