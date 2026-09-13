import { FLIGHTS } from '../data/itinerary';
import type { Trip } from './trip';
const dateFor = (t: number) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(t).replace(',', '');
export function flightsForTrip(trip: Trip) {
  return FLIGHTS.map(f => {
    if (f.dir === 'hop1') {
      const early = trip.seattle.flight !== 'tue-am';
      const day = trip.days.find(d => d.id === (early ? 'seaReturn' : 's1'));
      if (!day?.date) return f;
      const evening = trip.seattle.flight === 'mon-pm';
      return { ...f, date: dateFor(day.date!), dep: evening ? 'evening' : 'morning',
        arr: 'time to confirm', legs: [['Delta or Alaska', `${evening ? 'Evening' : 'Morning'} departure proposed; exact flight not selected`]],
        note: `Not booked. Flight takes about 1 h 50 m; Salt Lake City is one hour ahead of Seattle. ${early ? 'Sleep in SLC before the Bonneville day; keep Utah car pickup on that day.' : 'Collect the Utah car after the morning flight.'} Confirm fare, hotels and rental terms before changing reservations.` };
    }
    if (f.dir === 'hop2') {
      const day = trip.days.find(d => d.id === 'sf1');
      return day?.date ? { ...f, date: dateFor(day.date) } : f;
    }
    return f;
  });
}
