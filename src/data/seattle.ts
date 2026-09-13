import type { Day } from '../types';

export type SeattleOptions = { weather: 'good' | 'rain'; portland: boolean; rainier: 'sat' | 'sun' | 'mon'; flight: 'mon-am' | 'mon-pm' | 'tue-am' };
export const DEFAULT_SEATTLE: SeattleOptions = { weather: 'good', portland: true, rainier: 'sun', flight: 'mon-pm' };
export function normalizeSeattle(value: unknown): SeattleOptions {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<SeattleOptions>;
  const weather = v.weather === 'rain' ? 'rain' : 'good';
  const rainier = v.rainier === 'sat' || v.rainier === 'mon' ? v.rainier : 'sun';
  let flight = ['mon-am', 'mon-pm', 'tue-am'].includes(v.flight ?? '') ? v.flight! : weather === 'rain' ? 'mon-am' : 'mon-pm';
  if (weather === 'good' && rainier === 'mon') flight = 'tue-am';
  else if (weather === 'good' && flight === 'mon-am') flight = 'mon-pm';
  return { weather, rainier, flight, portland: v.portland !== false };
}
const bed = (where: string) => ({ t: 'motel' as const, where, note: 'Hotel candidate, not booked. Compare the room rate and cancellation terms.' });
const makeDay = (id: string, values: Omit<Day, 'id' | 'act'> & { act?: string }): Day => ({ act: 'I', ...values, id, carEligible: false });

function portland(id: string, origin: 'Bremerton' | 'Ashford'): Day {
  return makeDay(id, { kind: 'drive', title: 'Portland: burgers, shops & the river',
    leg: `${origin} → In-N-Out Ridgefield → Portland → Kelso`, routeId: `waPortland${origin}`, hours: origin === 'Bremerton' ? 4.6 : 4.8,
    photos: ['portlandriver', 'innoutburger', 'portlandwalk'], poiDay: 'waPortland', weather: { day: 'portland', bed: 'kelso' },
    hi: ['Leave early and keep the shopping list short enough to enjoy the city too.',
      'In-N-Out in Ridgefield opens at 10:30. Stop on the way south, or on the return if you arrive too early.',
      'Shop in central Portland, then walk beside the Willamette: Waterfront Park → Steel Bridge → Eastbank Esplanade → Hawthorne Bridge. Allow 1½–2 hours with pauses, or shorten the loop.',
      'Sleep in Kelso on the way north; do not drive all the way back to Oyster Bay. Allow extra time for traffic and burger queues.'],
    ideas: ['Topaz Farm on Sauvie Island: allow 60–90 minutes for a farm visit if the calendar for your Portland date confirms opening. It is not Wednesday-only: the current schedule includes weekends, with Monday/Tuesday closed. Picking depends on the crop. Replace some shopping or shorten the river walk; this detour is not included in the main driving route.', 'Hillsboro has another In-N-Out if your chosen shops take you west. That detour is not included in this route.', 'Spend longer by the river when it is sunny; shorten the walk if it rains.'],
    food: [{ nm: 'In-N-Out · Ridgefield', tags: ['ino'], note: '5801 N. Pioneer Canyon Dr. · opens 10:30. Confirm dietary preparation when ordering.' }],
    sleep: bed('Kelso / Longview inn — northbound after Portland'),
    why: 'A proper city day with a burger and a walk, as well as the shopping.' });
}
function rainier(id: string, origin: 'Bremerton' | 'Kelso' | 'Ashford' | 'SeaTac', returnToAirport = false): Day {
  return makeDay(id, { kind: 'drive', title: 'The clearest day at Mount Rainier',
    leg: `${origin} → Nisqually Entrance → Narada Falls → Paradise → ${returnToAirport ? 'SeaTac' : 'Ashford'}`,
    routeId: `waRainier${origin}`, hours: origin === 'Ashford' ? 2 : origin === 'Bremerton' ? 4.7 : origin === 'Kelso' ? 4 : 5,
    photos: ['rainierfall', 'rainier', 'narada'], poiDay: 'waRainier', weather: { day: 'rainier', bed: returnToAirport ? 'seatac' : 'ashford' },
    hi: ['Use the forecast for Paradise and the park webcams to choose this day; weather in Seattle is not a substitute.',
      'Enter from the southwest through Nisqually. Stop at Narada Falls, then enjoy Paradise and its autumn meadows.',
      'Choose a short viewpoint walk or a longer trail according to visibility, trail conditions and energy.',
      returnToAirport ? 'Return to a SeaTac hotel tonight. The SLC flight is tomorrow morning, with no airport deadline after the mountain.' : 'Sleep in Ashford below the park; tomorrow starts from here.'],
    ideas: ['Reflection Lakes if the road and visibility allow; this extra detour is not included in the map.', 'A short Longmire walk is a lower-elevation fallback.'],
    food: [{ nm: 'Packed breakfast & lunch', tags: ['gf', 'df'], note: 'Buy supplies before reaching the park and carry water.' }],
    sleep: bed(returnToAirport ? 'SeaTac airport hotel' : 'Ashford inn, near the park entrance'),
    charge: ['Start with enough fuel or charge for the park and the return; do not depend on charging at Paradise.'],
    alert: 'Check NPS road and trail conditions before departure. No Sunrise Road detour is assumed.',
    why: 'The mountain gets the clearest day, with enough time to stop and walk.' });
}
function hood(id: string, toAshford: boolean): Day {
  return makeDay(id, { kind: 'drive', title: 'A slower day on Hood Canal', leg: `Bremerton → Lake Cushman → ${toAshford ? 'Ashford' : 'SeaTac'}`,
    routeId: toAshford ? 'waHoodAshford' : 'waHoodSeaTac', hours: toAshford ? 4.1 : 3.7,
    photos: ['hoodcanalbridge', 'oysters', 'rainierfall'], poiDay: 'waHood', weather: { day: 'hood', bed: toAshford ? 'ashford' : 'seatac' },
    hi: ['Take your time over breakfast, then explore the Lake Cushman shoreline.', 'Keep the day light: one walk, a waterside lunch and time to stop.', `Finish near ${toAshford ? 'Ashford, ready for Rainier tomorrow' : 'SeaTac, ready for Seattle'}.`],
    ideas: ['Staircase is an optional extension if access and conditions are good. It adds driving beyond the mapped Lake Cushman stop.'],
    sleep: bed(toAshford ? 'Ashford inn' : 'SeaTac hotel'), why: 'A relaxed alternative when you would rather stay around Hood Canal than go shopping.' });
}
function seattle(id: string, origin: 'Ashford' | 'Kelso' | 'SeaTac', eveningFlight: boolean, base: Day): Day {
  return makeDay(id, { ...base, kind: 'city', title: 'Seattle on foot',
    leg: `${origin} → SeaTac; transit into Seattle${eveningFlight ? ' → evening flight to SLC' : ''}`,
    routeId: `waSeattle${origin}`, hours: origin === 'Ashford' ? 1.9 : origin === 'Kelso' ? 2.2 : 0,
    at: [47.6097, -122.3422], atZoom: 12, poiDay: 'sea1', weather: { day: 'seattle', bed: eveningFlight ? 'saltlake' : 'seatac' },
    hi: ['Move to SeaTac first and keep the car out of central Seattle. Use transit for the city.',
      'Pike Place Market, the waterfront and a good lunch. Add Kerry Park if visibility is good.',
      'For rain, choose the Museum of Flight or an indoor city stop instead of filling the day with outdoor viewpoints.',
      eveningFlight ? 'Keep the city visit short. Return the rental and allow time for its shuttle, bag drop and security before the evening flight.' : 'Stay near SeaTac tonight; keep tomorrow’s weather and flight plan in mind.'],
    sleep: bed(eveningFlight ? 'Salt Lake City hotel — after the evening flight' : 'SeaTac airport hotel'),
    alert: eveningFlight ? 'Evening SEA–SLC is a proposed flight, not booked. Set the city cut-off once the actual flight time is known.' : undefined,
    why: 'An easy city day that works in sunshine or rain.' } as Omit<Day, 'id' | 'act'>);
}

/** Five fixed calendar slots keep all later bookings on their existing dates. */
export function seattleDays(base: Day[], options: SeattleOptions): Day[] {
  const o = normalizeSeattle(options);
  const arrival = makeDay('arrive', { kind: 'arrive', title: 'Land, burgers & a bed',
    leg: 'Prague 12:00 → Frankfurt → Seattle 16:00; rental → Tacoma → Olympia / Lacey',
    routeId: 'waArrival', hours: 1.5, photos: ['seattle', 'shakeshack', 'olympiacapitol'], poiDay: 'waArrival', weather: { day: 'seatac', bed: 'olympia' },
    hi: ['Land at 16:00. Collect bags, clear immigration and take the rental-car shuttle. Aim to leave around 17:30–18:30; 17:00 is optimistic.',
      'Shake Shack at Tacoma Mall, then Whole Foods Chambers Bay for breakfast, water and simple road supplies. Whole Foods closes at 21:00.',
      'Head south to an inn around Olympia / Lacey and sleep. If you are too tired or delayed, stop in Tacoma and drive to Olympia in the morning.'],
    ideas: ['Only if arrival is smooth and you still feel fresh: a short evening look at the Washington State Fair in Puyallup. On Thursday Sept 24 it closes at 21:30; buildings close at 20:30. Allow 60–90 minutes inside plus parking and the detour. Skip it if tired; a Tacoma inn is the simpler overnight if you go. The fair ends Sept 27 and this optional detour is not in the driving total.'],
    sleep: bed('Olympia / Lacey inn — Tacoma is the tired-arrival fallback'),
    food: [{ nm: 'Shake Shack · Tacoma Mall', tags: [], note: '4502 S Steele St. Confirm dietary preparation when ordering.' }, { nm: 'Whole Foods · Chambers Bay', tags: [], note: '3515 Bridgeport Way W, University Place · 08:00–21:00. A short detour for supplies.' }],
    why: 'Getting the car tonight makes Friday morning about Olympia and oysters.' });
  const friday = makeDay('seaB', { kind: 'drive', title: 'Capitol at dawn, oysters at lunch',
    leg: 'Olympia / Lacey → Washington State Capitol → Hama Hama → Oyster Bay Inn, Bremerton', routeId: 'waFriday', hours: 2.8,
    photos: ['olympiacapitol', 'oysters', 'hoodcanalbridge'], poiDay: 'waFriday', weather: { day: 'hood', bed: 'bremerton' },
    hi: ['Use the early jet-lag start for Olympia. Capitol grounds open at dawn; the Legislative Building opens Friday at 07:30.',
      'Leave enough time for a relaxed drive north and Hama Hama around 11:30–12:00. The Oyster Saloon opens Friday 11:00–17:00.',
      'After lunch, continue to Oyster Bay Inn & Suites in Bremerton. The longer walks can wait for another day.'],
    food: [{ nm: 'Hama Hama Oyster Saloon', tags: ['oy'], note: 'Reserve via the official site. Reservations for this weekend open Monday September 21 at 09:00 Pacific / 18:00 Prague. Confirm dietary options.' }],
    sleep: bed('Oyster Bay Inn & Suites, Bremerton'),
    alert: 'Hama Hama is outdoor dining. Check opening and reserve a table; hotel and lunch are not booked.',
    why: 'An early Capitol visit and an unhurried Friday oyster lunch fit naturally together.' });
  const city = base.find(d => d.id === 'sea1')!;
  let saturday: Day, sunday: Day, monday: Day;
  if (o.weather === 'good' && o.rainier === 'sat') {
    saturday = rainier('sea1', 'Bremerton');
    sunday = o.portland ? portland('seaA', 'Ashford') : seattle('seaA', 'Ashford', false, city);
  } else {
    saturday = o.portland ? portland('sea1', 'Bremerton') : hood('sea1', o.weather === 'good' && o.rainier === 'sun');
    sunday = o.weather === 'good' && o.rainier === 'sun'
      ? rainier('seaA', o.portland ? 'Kelso' : 'Ashford')
      : seattle('seaA', o.portland ? 'Kelso' : 'SeaTac', false, city);
  }
  if (o.weather === 'rain' && o.flight === 'mon-am') {
    sunday.hi = [...sunday.hi, 'Return the Seattle rental this evening; tomorrow’s early departure starts from the airport hotel.'];
    monday = makeDay('seaReturn', { kind: 'city', act: 'II', title: 'Fly south, take a breath', leg: 'SeaTac → Salt Lake City (morning flight)', routeId: 'waSlcChill', rental: 'No car', hours: 0,
      at: [40.76, -111.89], atZoom: 12, photos: ['saltlakecity', 'greatsaltlake', 'antelopeSunset'], poiDay: 'waSlcChill', weather: { day: 'saltlake', bed: 'saltlake' },
      hi: ['Fly to Salt Lake City in the morning; the exact flight is not booked.', 'Drop the bags, have lunch, then visit Red Butte Garden for 1½–2 hours if the flight arrives early enough. Take a rideshare; the Tesla pickup stays tomorrow. September hours are 09:00–19:30, or 17:00 on concert dates. If you do the garden today, free up the final Salt Lake afternoon.', 'Keep the Utah car pickup for tomorrow. Bonneville, the Tetons and Yellowstone retain their planned dates.'],
      ideas: ['Liberty Park if you want a longer walk. The lake photographs preview the region; no lake excursion is scheduled today.'],
      sleep: bed('Salt Lake City hotel'), alert: 'This is a weather alternative, not a forecast. Confirm the flight, extra hotel night and Seattle rental return terms before booking.',
      why: 'A recovery day in Utah instead of another wet day waiting for the mountain.' } as Omit<Day, 'id' | 'act'>);
  } else if (o.weather === 'good' && o.rainier === 'mon') monday = rainier('seaReturn', 'SeaTac', true);
  else {
    const origin = o.weather === 'good' && o.rainier === 'sun' ? 'Ashford' : o.weather === 'good' && o.rainier === 'sat' && o.portland ? 'Kelso' : 'SeaTac';
    monday = seattle('seaReturn', origin, o.flight === 'mon-pm', city);
    if (origin === 'SeaTac') { monday.title = 'One more slow morning'; monday.hi = ['A slow breakfast, a little more Seattle if you want it, and time to pack.', ...monday.hi.slice(3)]; }
  }
  return [arrival, friday, saturday, sunday, monday];
}
