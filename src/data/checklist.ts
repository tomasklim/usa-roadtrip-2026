import { blockOf, fmtShort, type Trip } from '../lib/trip';

export const CHECK_CATEGORIES = [
  { id: 'cars', title: 'Cars', description: 'Three separate rentals, with dates from your active itinerary.' },
  { id: 'flights', title: 'Flights & documents', description: 'Get the essentials ready before departure.' },
  { id: 'stays', title: 'Places to sleep', description: 'Book the anchors; keep weather-dependent nights flexible.' },
  { id: 'experiences', title: 'Food & experiences', description: 'The stops worth reserving in advance.' },
  { id: 'road', title: 'Parks & charging', description: 'Access, weather alternatives and energy for the full route.' },
  { id: 'packing', title: 'Packing & offline', description: 'A small kit that works in the city and in the mountains.' }
] as const;
export type CheckCategory = typeof CHECK_CATEGORIES[number]['id'];
export interface CheckItem { id: string; category: CheckCategory; t: string; d: string; block?: boolean; url?: string; when?: string }
export const CHECKS: CheckItem[] = [
  { id: 'sea-car-20260924', category: 'cars', block: true, t: 'Book Turo · Seattle', d: 'Pickup after the 16:00 arrival on Sept 24, with time for immigration and bags. Match return to the selected SLC flight. Compare the all-in total, pickup location, mileage and cancellation terms.', url: 'https://turo.com/' },
  { id: 'dates-20260929', category: 'cars', block: true, t: 'Book / update Turo · Salt Lake City', d: 'Use the dates below, not the old quote. Check the full mileage allowance, extra-mile price, pickup and return times, tyres and the exact Tesla model. Confirm how Supercharging is billed.', url: 'https://turo.com/' },
  { id: 'california-car', category: 'cars', block: true, t: 'Book Turo · California', d: 'A separate Bay Area rental for Palo Alto and Point Reyes. Match the active driving dates below; compare returning after the last drive with keeping it until the SFO flight, including hotel parking and airport fees.', url: 'https://turo.com/' },
  { id: 'driver', category: 'cars', block: true, t: 'Approve both drivers on all three rentals', d: 'Each additional driver needs their own approved Turo account and approval for that booking before driving. Check Seattle, Salt Lake City and California separately.', url: 'https://help.turo.com/additional-drivers-on-a-trip-rJHorVxVq' },
  { id: 'airport', category: 'cars', t: 'Compare airport pickup with a city pickup', d: 'Include the transfer with luggage, parking, delivery fees and the time lost. Save the pickup instructions and host contact for each rental.' },
  { id: 'turo', category: 'cars', block: true, t: 'Check Bonneville access against Turo rules', d: 'Turo prohibits off-roading on undeveloped or unimproved roads. Host permission does not override that policy. Keep the rental on permitted developed roads and parking areas; plan the salt-flat visit on foot unless the provider explicitly permits the intended use.', url: 'https://help.turo.com/prohibited-uses-Hyi0E4l49' },
  { id: 'rental-handover', category: 'cars', t: 'Save the pickup and return checklist', d: 'At each handover: photos, existing damage, tyres, charge or fuel level, mileage, keys and return location. Confirm charging access and the required return charge before leaving.' },
  { id: 'hops-20260929', category: 'flights', block: true, t: 'Book SEA → SLC and SLC → SFO', d: 'Match the selected Seattle weather plan and the active itinerary. Compare the complete price including checked bags. International flights are already fixed; leave time to return each car.' },
  { id: 'esta', category: 'flights', block: true, t: 'Check passports, ESTA and driving documents', d: 'Verify travel authorisation for both travellers and save confirmations. Check the driving-document requirements for each rental; carry the original Czech licence alongside any required international permit.', url: 'https://esta.cbp.dhs.gov/' },
  { id: 'travel-cover', category: 'flights', t: 'Review travel and rental protection', d: 'Save policy numbers and assistance contacts offline. Check the actual terms for your planned activities, rental platform, exclusions and excess before choosing cover.' },
  { id: 'flight-copies', category: 'flights', t: 'Save flight details and baggage allowances', d: 'Keep each booking in the airline app and an offline copy. Check cabin and checked baggage separately for the two US flights; do not assume the Condor allowance carries over.' },
  { id: 'arrival-inn', category: 'stays', block: true, t: 'Book the first night · Olympia / Lacey', d: 'Choose a simple inn with parking and late check-in. Tell them arrival is after an international flight. Keep the first evening easy: food, groceries, bed.' },
  { id: 'oyster-bay-20260925', category: 'stays', t: 'Book Oyster Bay Inn or a Bremerton alternative', d: 'Preferred stop after Hama Hama. Compare final price, parking and cancellation deadline; keep confirmation and late-arrival instructions.' },
  { id: 'mountain-stays', category: 'stays', block: true, t: 'Reserve the Yellowstone & Teton bed nights', d: 'Use the Sleep section for the actual nights and locations. Compare refundable options in Jackson, West Yellowstone, Gardiner, Red Lodge and Bozeman as applicable. Check cancellation dates before switching the weather plan.' },
  { id: 'sf-hotel', category: 'stays', t: 'Book the San Francisco hotel', d: 'Use the Bay Area dates in the itinerary. Include parking costs for the rental days, luggage storage and the journey to SFO.' },
  { id: 'camp-stays', category: 'stays', t: 'Check each car night and the next bed', d: 'Use a permitted campsite with confirmed access. Aim for at most two consecutive car nights; use the price exception only deliberately. Save a nearby indoor fallback for cold or wet weather.' },
  { id: 'hama-20260925', category: 'experiences', t: 'Reserve Hama Hama · Friday Sept 25', d: 'Check the current reservation release and Oyster Saloon hours. Visit Olympia first and aim for lunch; save the booking and cancellation terms.', url: 'https://hamahamaoysters.com/pages/oyster-saloon' },
  { id: 'node-palo-alto', category: 'experiences', t: 'Check NODE’s programme in Palo Alto', d: 'A must-visit at 180 University Ave. Confirm the exhibition, opening hours and admission for the date shown in your active itinerary, including any closure between shows.', url: 'https://nodefoundation.com/' },
  { id: 'tomales-20260924', category: 'experiences', t: 'Book The Boat at Hog Island', d: 'Choose the service that actually runs on your visit date. The base route visits on Monday Oct 12; confirm the current schedule and reservation availability.', url: 'https://hogislandoysters.com/' },
  { id: 'chico', category: 'experiences', t: 'Reserve Chico dinner and check soaking access', d: 'Match the selected Montana plan. Mention dietary requirements and confirm pool access, dinner time and any cancellation deadline.', url: 'https://www.chicohotsprings.com/' },
  { id: 'diet-card', category: 'experiences', t: 'Save a short dietary-requirements note', d: 'Write the exact gluten and dairy requirements for both of you, including whether cross-contact matters. Show it when ordering and confirm preparation with the restaurant.' },
  { id: 'gardiner-native-plug', category: 'road', block: true, t: 'Confirm Gardiner charging without an adapter', d: 'Ask for a native Tesla / NACS connector and confirm access, availability and power. “L2” alone is not enough. Check the whole route between confirmed chargers before committing to the stay.' },
  { id: 'laurel-return', category: 'road', t: 'Save Laurel Supercharger and the energy plan', d: 'Good weather: Gardiner → Beartooth → Red Lodge → Laurel, with enough reserve even if Red Lodge charging fails. Recharge for the onward Gardiner night and Bozeman. In bad weather, use the extra Bozeman day.', url: 'https://www.tesla.com/findus' },
  { id: 'pass', category: 'road', t: 'Arrange the non-resident national parks pass', d: 'The 2026 non-resident annual pass is $250. Check the official coverage and purchase options; campsite fees and reservations are separate. Save a usable copy and carry the required ID.', url: 'https://www.nps.gov/planyourvisit/passes.htm' },
  { id: 'sunrise', category: 'road', t: 'Check Rainier roads for the selected route', d: 'The current plan uses Nisqually / Paradise. Check access and webcams before departure; only add Sunrise if its road is open and there is time.', url: 'https://www.nps.gov/mora/planyourvisit/road-status.htm' },
  { id: 'mountain-roads', category: 'road', t: 'Save Yellowstone and Beartooth road status', d: 'Recheck the morning you drive and after a weather change. Use the Bozeman alternative if the pass closes or visibility is poor.', url: 'https://www.nps.gov/yell/planyourvisit/parkroads.htm' },
  { id: 'offline', category: 'packing', t: 'Download maps, GPX and the offline itinerary', d: 'Save the website’s offline copy plus Google Maps areas and walking maps. Open each with airplane mode on before leaving; the live website map still needs a connection.' },
  { id: 'phone-data', category: 'packing', t: 'Set up mobile data for both phones', d: 'Check device compatibility and activation timing for your roaming plan or eSIM. Save installation instructions offline and test hotspot sharing.' },
  { id: 'power', category: 'packing', t: 'Pack charging cables, US plugs and a power bank', d: 'Bring car charging cables for both phones. Check voltage support on your chargers and your airline’s current power-bank rules.' },
  { id: 'mattress', category: 'packing', t: 'Confirm the mattress and sleeping setup', d: 'Check dimensions for the actual rental model before buying. Decide where to collect and leave bulky gear, and test the setup before the first planned car night.' },
  { id: 'warm', category: 'packing', t: 'Pack for freezing mountain nights', d: 'Warm sleep gear, layers, waterproofs, hats, headlamps and a way to handle condensation. Recheck overnight forecasts and choose a bed when the setup is unsuitable.' },
  { id: 'bear', category: 'packing', t: 'Arrange bear spray locally before the Tetons', d: 'Buy or rent locally, learn how to use it and arrange its return or disposal before the SLC → SFO flight. Check the park’s current guidance.', url: 'https://www.nps.gov/grte/planyourvisit/bearsafety.htm' },
  { id: 'supplies', category: 'packing', t: 'Make the first grocery list', d: 'Water, easy breakfasts, road snacks, a small cooler, rubbish bags and basic toiletries. Keep a separate Salt Lake list for the longer road segment.' }
];

export const VALID_CHECKS = new Set(CHECKS.map(c => c.id));
export const normalizeChecks = (value: unknown) => Array.isArray(value)
  ? [...new Set(value.filter((id): id is string => typeof id === 'string' && VALID_CHECKS.has(id)))] : [];

export function checksForTrip(trip: Trip): CheckItem[] {
  const dateRange = (block: string) => {
    const days = trip.days.filter(d => blockOf(d) === block);
    return days.length ? `${fmtShort(days[0].date!)} – ${fmtShort(days[days.length - 1].date!)} · planned driving days` : 'No driving days in this version';
  };
  const dates: Record<string, string> = {
    'sea-car-20260924': dateRange('Seattle car'), 'dates-20260929': dateRange('Salt Lake car'), 'california-car': dateRange('San Francisco car')
  };
  return CHECKS.map(c => ({ ...c, when: dates[c.id] }));
}
