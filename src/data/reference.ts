export const CHARGE_ROWS: [string, string, string, string, "" | "gap" | "crit"][] = [
  ["Seattle → Rainier traverse → Ashford", "WA-410 / WA-123 / WA-706", "Nothing useful inside the park; Enumclaw and Ashford have L2", "Start with enough fuel or charge for the full mountain traverse.", "gap"],
  ["SeaTac → Hama Hama → Bremerton", "I-5 / US-101 / WA-3", "Olympia and Bremerton charging if needed", "Seattle rental starts after arrival on Sept 24. Return Sunday evening for a Monday morning flight, otherwise Monday; exact billing depends on pickup/return times.", ""],
  ["SLC → Bonneville → SLC", "I-80", "SLC everywhere, West Wendover SC", "Easy. Wendover has car washes for the salt.", ""],
  ["SLC → Logan Canyon → Bear Lake → Jackson", "US-89", "Logan, Montpelier, Jackson", "Comfortable, even at 485 km.", ""],
  ["Grand Teton day", "Teton Park Road", "Jackson SC", "Non-issue — 160 km on one charge.", ""],
  ["Jackson → Old Faithful → West Yellowstone", "US-89 / park roads", "Jackson SC, West Yellowstone SC", "Nothing in between, but only 220 km.", ""],
  ["West Yellowstone → Canyon → Gardiner", "park roads", "West Yellowstone SC; Gardiner connectors must be checked", "Charge before entering the park. No adapter carried: unconfirmed L2, J1772 and CCS are not planned charging stops.", "crit"],
  ["Gardiner → Beartooth → Red Lodge → Laurel", "US-212", "Optional Red Lodge Tesla destination charging; Laurel SC: 8 stalls, up to 250 kW, 24/7", "Plan energy through to Laurel even if Red Lodge charging fails. Cross the pass once; return via I-90 and Livingston.", "gap"],
  ["Laurel → Livingston → Gardiner → Chico → Bozeman", "I-90 / US-89", "Laurel SC and Bozeman SC", "In Laurel, charge for the full onward route through the Gardiner night to Bozeman, with overnight use and weather reserve.", "gap"],
  ["Bad-weather alternative", "Gardiner / Lamar / US-89", "Confirmed native Tesla charging only; Bozeman SC", "Check the Lamar round trip plus the onward drive to Bozeman. If energy or weather is poor, skip Lamar and head to Bozeman early.", "gap"],
  ["Gardiner → Chico → Bozeman", "US-89", "Bozeman SC, Belgrade SC (8 stalls)", "Short and easy — 143 km.", ""],
  ["Bozeman → West Yellowstone → Idaho Falls", "US-191 / US-20", "West Yellowstone SC, Idaho Falls SC", "Comfortable.", ""],
  ["Craters of the Moon module", "US-20 / US-26", "Arco has L2 only", "Plan West Yellowstone to Idaho Falls as one charge — the lava field detour is 610 km total.", "gap"],
  ["Idaho Falls → Lava Hot Springs → SLC", "I-15", "Pocatello, Brigham City, Ogden, SLC", "Dense the whole way.", ""],
  ["Dinosaur NM module", "US-40 / US-191", "Heber City SC, Vernal SC (8 stalls), Rock Springs SC", "Fine — Vernal turned out to have a Supercharger after all.", ""]
];

export const FOOD_RULES = [
  "<b>In-N-Out:</b> order it <b>protein style</b> — lettuce instead of the bun. The spread is egg-based, so it is dairy-free; skip the cheese. Fries are nothing but potato and sunflower oil in their own dedicated fryer, so they are safe.",
  "<b>Shake Shack:</b> they carry a <b>gluten-free bun</b>, but the regular buns are buttered on the same surface — say &ldquo;gluten-free bun, no cheese, clean prep&rdquo;. Shakes and custard are out.",
  "<b>Oysters</b> are naturally gluten-free and dairy-free. Raw with mignonette, yes. Rockefeller (butter) and anything fried, no.",
  "<b>Steak, game and Basque cooking</b> are the safest great meals on this route. Say <b>&ldquo;no butter&rdquo; explicitly</b> — American kitchens finish steaks with it by default and will not think to mention it.",
  "<b>Landmines:</b> beer (all of Oregon), Idaho &ldquo;finger steaks&rdquo; (breaded), Butte pasties (pastry), Rocky Mountain oysters (breaded), and anything a diner describes as &ldquo;creamy&rdquo;."
];

export const SLEEP_CARDS = [
  { h: "The mattress", body: "The platform is <b>75 × 41 in (190 × 104 cm)</b>, up to 83 in long with the front seats slid forward. Buy a 140 × 200 cm foam mattress from IKEA and <b>cut it down to 105 cm wide with a bread knife</b> — 8–10 cm of foam is the sweet spot between comfort and headroom." },
  { h: "Levelling the floor", body: "The floor is not flat: there is a step where the folded seats meet the boot floor. Fill it with the sub-boot lid plus folded blankets or a duffel. Do it properly once at home and you will never think about it again." },
  { h: "Camp Mode and the battery", body: "Camp Mode holds cabin temperature and draws roughly <b>10–15% over eight hours</b> in mild weather. In a Yellowstone frost, budget <b>20–25% a night</b>. Only plan car nights where you can charge the next morning." },
  { h: "Where it is legal", body: "Rest-area limits vary: <b>Washington 8 h, Montana 12 h, Idaho 10 h</b> on interstates or 16 h on other state highways, but these are rest limits rather than permission to camp. Use Walmart only with that store's explicit permission. Best of all, use a booked campground or <b>legal dispersed camping in national forests</b> — Bridger-Teton, Gallatin, Caribou-Targhee." },
  { h: "Not inside the parks", body: "Sleeping in a vehicle is <b>prohibited in national parks</b> outside designated campgrounds. Mammoth Campground in Yellowstone is open year-round and reservable, which makes it the practical base for a dawn run into Lamar Valley." },
  { h: "Showers, which become the real problem", body: "Past three or four car nights, washing is the constraint, not sleep. <b>Pilot and Flying J truck stops</b> sell private showers in Idaho Falls, Pocatello, Ogden and Salt Lake City. Colter Bay has paid showers; <b>Mammoth Campground has none</b>, so use public showers in Gardiner. Check current gym membership terms instead of relying on an old nationwide-shower price." },
  { h: "Staying warm at 2,000 m", body: "The cold nights on this route are Hyalite above Bozeman, West Yellowstone and Shadow Mountain — all around 2,000 m, all capable of −5 °C in early October. You want <b>bags rated to −7 °C, not −0 °C</b>, a wool hat each, and a plan for condensation: crack two windows a centimetre, and keep a microfibre cloth by the bed for the morning." },
  { h: "Two people, one narrow bed", body: "104 cm is narrower than a UK double. Sleep <b>head-to-toe</b> if either of you moves a lot, and put the wider shoulders on the boot side where the wheel arches do not intrude. Do a test night at home before you commit to twelve of them." },
  { h: "The Bay Area caveat", body: "Do not plan to sleep in the car in San Francisco. Marin alternatives include <b>Samuel P. Taylor SP</b>, <b>China Camp SP</b> and <b>Kirby Cove</b>, but each changes the next day's start and adds driving. The mapped itinerary therefore returns to a San Francisco hotel every night; treat Marin camping as a manual route change, not a switchable saving." },
  { h: "What a bed still buys you", body: "Shoulder-season motels in Gardiner, West Yellowstone and Jackson can still be expensive, so compare real refundable rates before locking the budget. A bed buys a <b>shower, laundry, a charge and a table to plan on</b> — which is why the balanced option keeps one in Gardiner, Red Lodge and Bozeman." }
];

export const RISKS = [
  { h: "Beartooth Highway & Dunraven Pass", body: "Both are projected to stay open through <b>Oct 12, 2026</b>, weather permitting. You cross Beartooth once on Oct 5 in the base plan; return via Laurel on Oct 6, or select the extra Bozeman day to skip it, so the calendar works, but an early storm can still close it without warning.", dl: "projected through Oct 12" },
  { h: "Mount Rainier", body: "Rainier will <b>not require timed entry in 2026</b>. Sunrise Road is still weather-dependent and is commonly gated at night late in the season; check its status before the traverse and use Paradise as the fallback.", dl: "check Sunrise Road that morning" },
  { h: "Yellowstone", body: "Most park roads are projected to stay open until <b>Oct 31</b>, weather permitting. Your base Yellowstone days are Oct 2–6. Construction at the Gardner River bridge can add delays, so check alerts as well as closures.", dl: "weather and roadworks can change daily" },
  { h: "Bonneville Salt Flats", body: "The base plan visits on <b>Sept 29</b>; check BLM event closures before going. Access and driving still depend on seasonal closures and dry salt. Never drive on wet salt, and get the rental host's written permission.", dl: "dry and signed open only" },
  { h: "Snow, generally", body: "Early-October snow in Yellowstone, the Beartooth and high Rainier roads is normal, not exceptional. Check the tyres with each rental host, do not rely on driver assistance in snow, and carry warm layers and water.", dl: "check tyres with the host" },
  { h: "Wildlife on the road", body: "Elk and bison on the road are the most likely way to end the trip early. Lamar remains a stop on the Beartooth drives; allow stopping time and drive slowly around wildlife.", dl: "Lamar on the Beartooth drives" },
  { h: "Road status, live", body: "Check the official Yellowstone and Mount Rainier road-status pages plus each state's 511 service on the morning you drive. Mountain closures can change within hours during a storm.", dl: "check again each morning" },
  { h: "Hog Island on Monday", body: "The Boat at the farm is a <b>full-service café Friday–Monday</b>; shuck-your-own is Thursday only. Your base date is Monday Oct 12, so reserve the café rather than a shucking table.", dl: "reserve The Boat" }
];


export const BUDGET_CFG = [
  { id: "turoDay", label: "Salt Lake Turo, all-in per day", min: 30, max: 200, step: 1, val: 64, fmt: (v: number) => "$" + v },
  { id: "seaDay", label: "Seattle car, per day", min: 40, max: 200, step: 5, val: 95, fmt: (v: number) => "$" + v },
  { id: "bayDay", label: "Bay Area car, per day", min: 40, max: 250, step: 5, val: 140, fmt: (v: number) => "$" + v },
  { id: "cap", label: "Miles included per day", min: 75, max: 400, step: 25, val: 150, fmt: (v: number) => (v >= 400 ? "unlimited" : v + " mi") },
  { id: "overMi", label: "Cost per extra mile", min: 0, max: 1, step: 0.01, val: 0.27, fmt: (v: number) => "$" + v.toFixed(2) },
  { id: "motelNights", label: "Motel and hotel nights", min: 0, max: 22, step: 1, val: 16, fmt: (v: number) => v + " nights" },
  { id: "campNight", label: "Campsite allowance per car night", min: 0, max: 100, step: 5, val: 30, fmt: (v: number) => "$" + v },
  { id: "motel", label: "Motel, per night", min: 70, max: 300, step: 10, val: 130, fmt: (v: number) => "$" + v },
  { id: "kwh", label: "Charging, per kWh", min: 0.2, max: 0.6, step: 0.02, val: 0.4, fmt: (v: number) => "$" + v.toFixed(2) },
  { id: "gas", label: "Gas, per gallon", min: 2, max: 7, step: 0.1, val: 4.5, fmt: (v: number) => "$" + v.toFixed(1) },
  { id: "foodDay", label: "Food, per person per day", min: 20, max: 150, step: 5, val: 65, fmt: (v: number) => "$" + v },
  { id: "sfNight", label: "San Francisco hotel, per night", min: 120, max: 500, step: 20, val: 260, fmt: (v: number) => "$" + v },
  { id: "flightEur", label: "Transatlantic flight, per person", min: 400, max: 1600, step: 10, val: 740, fmt: (v: number) => "€" + v },
  { id: "eurusd", label: "EUR → USD", min: 1, max: 1.35, step: 0.005, val: 1.159, fmt: (v: number) => v.toFixed(3) },
  { id: "fx", label: "USD → CZK", min: 17, max: 28, step: 0.1, val: 20.9, fmt: (v: number) => v.toFixed(1) + " Kč" }
];
