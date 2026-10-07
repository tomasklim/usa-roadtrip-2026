import type { Day, Units } from '../types';
import { distLabel } from './trip';
export function roadLabel(day: Day, units: Units) {
  if (day.roadEstimate) return `≈ ${distLabel(day.meters ?? 0, units)} · estimated`;
  if (day.completed) return 'Distance not estimated';
  if ((day.meters ?? 0) > 0) return `${day.hours ? `${day.hours} h · ` : ''}${distLabel(day.meters!, units)}`;
  return 'No driving today';
}
