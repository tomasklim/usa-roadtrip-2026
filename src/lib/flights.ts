import { FLIGHTS } from '../data/itinerary';
import type { Trip } from './trip';
const dateFor = (t: number) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(t).replace(',', '');
export function flightsForTrip(trip: Trip) {
  return FLIGHTS.filter(f => !trip.utahFinale || f.dir !== 'hop2').map(f => {
    if (trip.utahFinale && f.dir === 'back') return {...f, from:'Salt Lake City', dep:'15:02',arr:'16:00 +1',dur:'16 h 58 m',stops:'Seattle · 1 h 48 m / Frankfurt · 1 h 50 m',booked:true,co2:'',
      legs:[['Alaska AS734','Economy','Salt Lake City 15:02 → Seattle 16:17 · Oct 13'],['Condor DE2033','Economy','Seattle 18:05 → Frankfurt 13:10 · Oct 14'],['Condor DE4407','Economy','Frankfurt 15:00 → Prague 16:00 · Oct 14']],
      note:'All times local. Arrive in Prague October 14. Itinerary lists 1 checked bag per person; confirm through-checking at SLC. Seats and meals not selected.'};
    if (f.dir === 'hop1') {
      const recorded = trip.days.find(d => d.completed && d.flight?.from === 'SEA' && d.flight.to === 'SLC' && d.flight.dep && d.flight.arr);
      if (recorded?.flight && recorded.date) {
        const { dep, arr } = recorded.flight;
        const minutes = (time: string) => Number(time.slice(0,2)) * 60 + Number(time.slice(3));
        // SLC is one hour ahead of Seattle throughout this autumn trip.
        const elapsed = (minutes(arr) - minutes(dep) - 60 + 1440) % 1440;
        const dur = `${Math.floor(elapsed / 60)} h${elapsed % 60 ? ` ${elapsed % 60} m` : ''}`;
        return {...f, booked:true, date:dateFor(recorded.date), dep, arr, dur, co2:'',
          legs:[['SEA → SLC','Completed', `Seattle ${dep} → Salt Lake City ${arr} · local times`]],
          note:'Completed. Salt Lake City is one hour ahead of Seattle. Times recorded from your trip.'};
      }
      if (trip.days.find(d => d.id === 's1')?.completed) return {...f, booked:true, date:'Completed · Seattle → Salt Lake City',dep:'Completed',arr:'Completed',legs:[['Flight details','Exact flight date and times were not recorded in the trip log.']],note:'This journey is already behind you; no booking action is needed.'};
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
