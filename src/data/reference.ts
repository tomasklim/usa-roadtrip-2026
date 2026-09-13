export const CHARGE_ROWS: [string, string, string, string, "" | "gap" | "crit"][] = [
  ["Seattle → Rainier traverse → Ashford", "WA-410 / WA-123 / WA-706", "Nothing useful inside the park; Enumclaw and Ashford have L2", "Start with enough fuel or charge for the full mountain traverse.", "gap"],
  ["SeaTac → Hama Hama → Bremerton", "I-5 / US-101 / WA-3", "Olympia and Bremerton charging if needed", "Four-day Seattle rental, Sept 25–28 in the base plan; an ordinary car is fine.", ""],
  ["SLC → Bonneville → SLC", "I-80", "SLC everywhere, West Wendover SC", "Easy. Wendover has car washes for the salt.", ""],
  ["SLC → Logan Canyon → Bear Lake → Jackson", "US-89", "Logan, Montpelier, Jackson", "Comfortable, even at 485 km.", ""],
  ["Grand Teton day", "Teton Park Road", "Jackson SC", "Non-issue — 160 km on one charge.", ""],
  ["Jackson → Old Faithful → West Yellowstone", "US-89 / park roads", "Jackson SC, West Yellowstone SC", "Nothing in between, but only 220 km.", ""],
  ["West Yellowstone → Canyon → Gardiner", "park roads", "Nothing in the park; Gardiner has L2 + CCS L3 only", "Arrive near 100% and charge overnight on the motel L2. No Supercharger in Gardiner.", "crit"],
  ["Beartooth: Gardiner → Red Lodge → Gardiner", "US-212", "City of Red Lodge: 2 public Tesla destination chargers, up to 16 kW", "Slow charging must work overnight. Confirm availability in the Tesla app before leaving Gardiner.", "crit"],
  ["Cody module", "WY-296 / US-14", "CCS L3 at the Buffalo Bill Center, Cody", "317 km, two passes, no Supercharger. Needs the CCS adapter.", "crit"],
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
  { h: "Beartooth Highway & Dunraven Pass", body: "Both are projected to stay open through <b>Oct 12, 2026</b>, weather permitting. You cross Beartooth on Oct 5 and 6 in the base plan, so the calendar works, but an early storm can still close it without warning.", dl: "projected through Oct 12" },
  { h: "Mount Rainier", body: "Rainier will <b>not require timed entry in 2026</b>. Sunrise Road is still weather-dependent and is commonly gated at night late in the season; check its status before the traverse and use Paradise as the fallback.", dl: "check Sunrise Road that morning" },
  { h: "Yellowstone", body: "Most park roads are projected to stay open until <b>Oct 31</b>, weather permitting. Your base Yellowstone days are Oct 2–6. Construction at the Gardner River bridge can add delays, so check alerts as well as closures.", dl: "weather and roadworks can change daily" },
  { h: "Bonneville Salt Flats", body: "The base plan visits on <b>Sept 29</b>; check BLM event closures before going. Access and driving still depend on seasonal closures and dry salt. Never drive on wet salt, and get the rental host's written permission.", dl: "dry and signed open only" },
  { h: "Snow, generally", body: "Early-October snow in Yellowstone, the Beartooth and high Rainier roads is normal, not exceptional. Check the tyres with each rental host, do not rely on driver assistance in snow, and carry warm layers and water.", dl: "check tyres with the host" },
  { h: "Wildlife on the road", body: "Elk and bison on the road are the most likely way to end the trip early. Lamar remains a stop on the Beartooth drives; allow stopping time and drive slowly around wildlife.", dl: "Lamar on the Beartooth drives" },
  { h: "Road status, live", body: "Check the official Yellowstone and Mount Rainier road-status pages plus each state's 511 service on the morning you drive. Mountain closures can change within hours during a storm.", dl: "check again each morning" },
  { h: "Hog Island on Monday", body: "The Boat at the farm is a <b>full-service café Friday–Monday</b>; shuck-your-own is Thursday only. Your base date is Monday Oct 12, so reserve the café rather than a shucking table.", dl: "reserve The Boat" }
];

export const CHECKS = [
  { id: "dates-20260929", block: true, t: "Update the Turo booking to Sept 29 – Oct 9", d: "The quote runs Sept 27 → Oct 6. The updated base route needs Sept 29 → Oct 9 (11 calendar days). Move pickup and return to match, confirm the new price and mileage allowance, and use the active itinerary dates if adding modules." },
  { id: "turo", block: true, t: "Get written permission for Bonneville and the other states", d: "Salt is corrosive and many listings ban leaving pavement, so get it in the Turo message thread before you go anywhere near the flats. Same message: out-of-state travel (WY, MT, ID), and ask the host to include the CCS Combo 1 adapter — Gardiner has no Supercharger and Cody is CCS-only." },
  { id: "airport", t: "Consider a non-airport pickup", d: "Compare the total for airport and city pickup using the revised dates, including fees and the transfer with luggage. Do not assume the old quote applies to the new booking." },
  { id: "sea-car-20260925", block: true, t: "Book the Seattle car, Sept 25–28", d: "Pick up Friday morning before Hama Hama; return Monday afternoon after Rainier. Four calendar days, including Saturday’s transfer from Bremerton. Compare exact pickup/return times and total fees; use the same location." },
  { id: "hops-20260929", block: true, t: "Book SEA → SLC and SLC → SFO", d: "Base plan: SEA–SLC Tuesday Sept 29 in the morning, then SLC–SFO October 10. Compare Monday Sept 28 evening as an alternative: move the airport hotel to SLC and keep Utah car pickup on Sept 29. Exact flights are not selected; recheck dates if adding modules." },
  { id: "node-palo-alto", t: "Confirm NODE's October programme and admission", d: "Must visit at 180 University Ave, Palo Alto. The base plan is Sunday Oct 11, 12:00–13:30, within the published Sunday hours of 12:00–20:00. Check nodefoundation.com for the exhibition, any closure between shows, and whether a ticket or reservation is needed. Recheck the day if adding modules." },
  { id: "driver", block: true, t: "Add your girlfriend as an additional driver", d: "In the Turo app, and it has to clear approval before pickup. Do it for the Seattle rental too." },
  { id: "esta", block: true, t: "ESTA for both of you + international driving permit", d: "ESTA takes minutes but can be held for days. The IDP is a formality alongside a Czech licence, and hosts sometimes ask." },
  { id: "gardiner-20261004", t: "Book Gardiner charging nights — Oct 4 and Oct 6", d: "These are two separate stays around the Red Lodge night, not consecutive nights. The dedicated wolf day is removed; confirm charging on arrival Oct 4 before the Oct 5 Beartooth crossing, and again on return Oct 6." },
  { id: "redlodge", t: "Confirm the Red Lodge destination chargers are available", d: "Tesla lists two public chargers at up to 16 kW, open 24/7. The Beartooth day still depends on a long overnight charge, so confirm them in the Tesla app and keep a backup before leaving Gardiner." },
  { id: "pass", t: "Buy the $250 non-resident annual park pass", d: "Covers Yellowstone, Grand Teton, Rainier, Craters and Dinosaur NM. Non-residents otherwise pay $100 per person on top at the 11 busiest parks — Yellowstone alone would be $235 for the two of you." },
  { id: "tomales-20260924", t: "Book The Boat at Hog Island", d: "Your base itinerary lands on Monday Oct 12, when the farm runs its full-service café. Shuck-your-own is Thursday only; reserve the correct service." },
  { id: "hama-20260925", t: "Reserve Hama Hama for Friday Sept 25", d: "The Oyster Saloon is open Friday–Sunday, 11:00–17:00. Reservations for that weekend open Monday Sept 21 at 09:00 Pacific; the table price includes two dozen oysters. Allow for Friday car pickup and the drive before lunch." },
  { id: "oyster-bay-20260925", t: "Check Oyster Bay Inn for Friday Sept 25", d: "Preferred hotel candidate in Bremerton, not booked. Compare the final room price and parking. Saturday’s plan drives via Tacoma to the airport-area hotel before visiting Seattle by transit." },
  { id: "chico", t: "Book dinner at Chico Hot Springs", d: "The best meal in rural Montana, and the dining room fills. Mention the gluten and dairy when you book." },
  { id: "mattress", t: "Buy and cut the mattress", d: "IKEA foam 140 × 200, cut to 105 cm wide with a bread knife. Test-fit in a Model Y before you fly if you possibly can." },
  { id: "bear", t: "Buy bear spray in Jackson or Bozeman", d: "You cannot fly with it in either direction. Buy it there ($40–50) and leave it behind. Grizzly country throughout Yellowstone and the Tetons." },
  { id: "sunrise", t: "Check the Sunrise Road status at Rainier", d: "It closes earlier than Paradise, usually in early October, and it is the better of the two viewpoints. If it is shut, Paradise plus the Skyline Trail is the day." },
  { id: "offline", t: "Download offline maps and the GPX files", d: "Cell coverage dies in Yellowstone, the Gallatin canyon and most of eastern Idaho. Download Google Maps offline areas and save the GPX from this page." },
  { id: "warm", t: "Pack for a hard frost", d: "Nights at 1,800–2,100 m in October go below freezing. Sleeping bags rated to −7 °C, hats, and a plan for window condensation." }
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
