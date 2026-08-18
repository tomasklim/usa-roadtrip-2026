export const CHARGE_ROWS: [string, string, string, string, "" | "gap" | "crit"][] = [
  ["Seattle → Rainier traverse → Ashford", "WA-410 / WA-123 / WA-706", "Nothing useful inside the park; Enumclaw and Ashford have L2", "Go in full from Seattle — 285 km and no fast charging on the mountain.", "gap"],
  ["Ashford → Hood Canal → Kingston ferry → Seattle", "US-101 / WA-104", "Olympia SC, Poulsbo L2", "Fine. Not a Tesla anyway — this block is a cheap two-day rental.", ""],
  ["SLC → Bonneville → SLC", "I-80", "SLC everywhere, West Wendover SC", "Easy. Wendover has car washes for the salt.", ""],
  ["SLC → Logan Canyon → Bear Lake → Jackson", "US-89", "Logan, Montpelier, Jackson", "Comfortable, even at 485 km.", ""],
  ["Grand Teton day", "Teton Park Road", "Jackson SC", "Non-issue — 160 km on one charge.", ""],
  ["Jackson → Old Faithful → West Yellowstone", "US-89 / park roads", "Jackson SC, West Yellowstone SC", "Nothing in between, but only 220 km.", ""],
  ["West Yellowstone → Canyon → Gardiner", "park roads", "Nothing in the park; Gardiner has L2 + CCS L3 only", "Arrive near 100% and charge overnight on the motel L2. No Supercharger in Gardiner.", "crit"],
  ["Lamar Valley day, based in Gardiner", "US-212", "Gardiner L2 only", "195 km out and back on the Gardiner charge. Two nights there means two charges.", "gap"],
  ["Beartooth: Gardiner → Red Lodge → Gardiner", "US-212", "Red Lodge L2 (unconfirmed), nothing else within 18 mi", "Rests entirely on the Red Lodge overnight charge, which OSM does not list. Verify it.", "crit"],
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
  { h: "Camp Mode and the battery", body: "Camp Mode holds cabin temperature and draws roughly <b>10–15% over eight hours</b> in mild weather. In a Yellowstone or Glacier frost, budget <b>20–25% a night</b>. Only plan car nights where you can charge the next morning." },
  { h: "Where it is legal", body: "Rest areas: <b>Washington 8 h, Montana 12 h, Idaho 10 h</b> on interstates or 16 h on other state highways. Walmart lots usually fine. Best of all, <b>free dispersed camping in national forests</b> — Bridger-Teton, Gallatin, Caribou-Targhee." },
  { h: "Not inside the parks", body: "Sleeping in a vehicle is <b>prohibited in national parks</b> outside designated campgrounds. Mammoth Campground in Yellowstone is open year-round and reservable, which makes it the practical base for a dawn run into Lamar Valley." },
  { h: "Showers, which become the real problem", body: "Past three or four car nights, washing is the constraint, not sleep. <b>Pilot and Flying J truck stops</b> sell a proper private shower for $15–18 and there is one in Idaho Falls, Pocatello, Ogden and Salt Lake City. Campground showers at Colter Bay in Grand Teton and Mammoth in Yellowstone are coin-operated. Planet Fitness's $25 black-card month gets you showers nationwide, which is the trick long-haul travellers actually use." },
  { h: "Staying warm at 2,000 m", body: "The cold nights on this route are Hyalite above Bozeman, West Yellowstone and Shadow Mountain — all around 2,000 m, all capable of −5 °C in early October. You want <b>bags rated to −7 °C, not −0 °C</b>, a wool hat each, and a plan for condensation: crack two windows a centimetre, and keep a microfibre cloth by the bed for the morning." },
  { h: "Two people, one narrow bed", body: "104 cm is narrower than a UK double. Sleep <b>head-to-toe</b> if either of you moves a lot, and put the wider shoulders on the boot side where the wheel arches do not intrude. Do a test night at home before you commit to twelve of them." },
  { h: "What a bed still buys you", body: "Shoulder-season motels in Gardiner, West Yellowstone and Whitefish run $90–140, so this is not really about money. A bed buys a <b>shower, laundry, a charge and a table to plan on</b> — which is why the balanced option keeps one in Gardiner, Red Lodge and Bozeman." }
];

export const RISKS = [
  { h: "Beartooth Highway & Dunraven Pass", body: "Both scheduled to close for winter on <b>Oct 12, 2026</b>, and an early storm can shut them sooner. The plan clears Yellowstone by Oct 2, so you are inside the window with days to spare.", dl: "closes Oct 12" },
  { h: "Going-to-the-Sun Road", body: "Normally fully open until the third Monday in October (~Oct 19), but the alpine section closes on any serious storm. This is exactly why Glacier sits on days 3–4 rather than at the end.", dl: "alpine section: weather-dependent" },
  { h: "Yellowstone", body: "Most park roads stay open until <b>Oct 31</b>. From Nov 1 only the North Entrance to Cooke City via Lamar Valley stays open. No timed-entry reservations needed.", dl: "roads close Nov 1" },
  { h: "Bonneville Salt Flats", body: "The SCTA World Finals runs <b>Sept 23–29</b> and closes the flats to general access. You arrive Oct 5, so it is empty and open. Never drive on wet salt — it is illegal and it destroys cars.", dl: "racing ends Sept 29" },
  { h: "Snow, generally", body: "Late-September snow in Yellowstone and Glacier is normal, not exceptional. Check the tyres with the Turo host, do not trust FSD on snow, and keep your hands on the wheel above 6,000 ft.", dl: "check tyres with the host" },
  { h: "Wildlife on the road", body: "Avoid driving at dawn, dusk and night in Montana and Wyoming. Elk and bison on the road are the single most likely way to end this trip early.", dl: "no night driving in MT/WY" },
  { h: "Road status, live", body: "Text <b>GNPROADS</b> to <b>333111</b> for Glacier. Yellowstone posts closures on nps.gov/yell. Both change within hours during a storm, so check the morning of, not the night before.", dl: "text GNPROADS to 333111" },
  { h: "Many Glacier", body: "Flooded and evacuated in June 2026. Confirm the road and the Swiftcurrent area have reopened before you build day 4 around it.", dl: "verify before departure" }
];

export const CHECKS = [
  { id: "dates", block: true, t: "Extend the Turo booking from 9 days to 12", d: "The quote runs Sept 27 → Oct 6. The route needs Sept 27 → Oct 8, and the extra days pay for themselves: three more days add about $186 of rental but include 450 more miles, which saves about $122 of overage. Net cost of three extra days with the car: roughly $68." },
  { id: "turo", block: true, t: "Get written permission for Bonneville and the other states", d: "Salt is corrosive and many listings ban leaving pavement, so get it in the Turo message thread before you go anywhere near the flats. Same message: out-of-state travel (WY, MT, ID), and ask the host to include the CCS Combo 1 adapter — Gardiner has no Supercharger and Cody is CCS-only." },
  { id: "airport", t: "Consider a non-airport pickup", d: "The quote includes a $52 airport permit fee, which scales with the rental length — about $69 over twelve days. If the host will hand the car over somewhere in the city instead, that fee usually disappears. Weigh it against arriving with luggage on a flight." },
  { id: "sea-car", block: true, t: "Book the second car in Seattle, Sept 25–26", d: "Two days for Mount Rainier and Hood Canal. FSD is pointless over two days, so this can be an ordinary airport rental — pick on price. Same pickup and drop-off point." },
  { id: "hops", block: true, t: "Book SEA → SLC and SLC → SFO", d: "Take the MORNING Seattle flight: it is 1 h 50 m, so a morning departure puts you on the salt flats that afternoon. Both routes are frequent (Delta hub at SLC), so book after the car is confirmed, not before." },
  { id: "driver", block: true, t: "Add your girlfriend as an additional driver", d: "In the Turo app, and it has to clear approval before pickup. Do it for the Seattle rental too." },
  { id: "esta", block: true, t: "ESTA for both of you + international driving permit", d: "ESTA takes minutes but can be held for days. The IDP is a formality alongside a Czech licence, and hosts sometimes ask." },
  { id: "gardiner", t: "Book a Gardiner motel with an L2 charger — two nights", d: "This is the fix for the trip's one real charging problem, and you are there two nights, so it charges twice. Confirm by message that the charger works and is available to guests." },
  { id: "redlodge", t: "Verify the Red Lodge Tesla destination chargers", d: "The Beartooth day depends on them and OpenStreetMap does not list them. Phone the motel. If they are gone, plan the pass as an out-and-back on the battery you arrive with." },
  { id: "pass", t: "Buy the $250 non-resident annual park pass", d: "Covers Yellowstone, Grand Teton, Rainier, Craters and Dinosaur NM. Non-residents otherwise pay $100 per person on top at the 11 busiest parks — Yellowstone alone would be $235 for the two of you." },
  { id: "tomales", t: "Book the Tomales Bay oyster farm", d: "Hog Island's shuck-your-own tables sell out weeks ahead, and it is peak oyster number two of exactly two." },
  { id: "hama", t: "Check Hama Hama's opening days", d: "Peak oyster number one, and the Hood Canal day is built around it. The saloon is seasonal and not open every weekday in autumn." },
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
  { id: "cap", label: "Miles included per day", min: 75, max: 400, step: 25, val: 150, fmt: (v: number) => (v >= 400 ? "unlimited" : v + " mi") },
  { id: "overMi", label: "Cost per extra mile", min: 0, max: 1, step: 0.01, val: 0.27, fmt: (v: number) => "$" + v.toFixed(2) },
  { id: "motelNights", label: "Motel and hotel nights", min: 0, max: 22, step: 1, val: 16, fmt: (v: number) => v + " nights" },
  { id: "motel", label: "Motel, per night", min: 70, max: 300, step: 10, val: 130, fmt: (v: number) => "$" + v },
  { id: "kwh", label: "Charging, per kWh", min: 0.2, max: 0.6, step: 0.02, val: 0.4, fmt: (v: number) => "$" + v.toFixed(2) },
  { id: "foodDay", label: "Food, per person per day", min: 20, max: 150, step: 5, val: 65, fmt: (v: number) => "$" + v },
  { id: "sfNight", label: "San Francisco hotel, per night", min: 120, max: 500, step: 20, val: 260, fmt: (v: number) => "$" + v },
  { id: "fx", label: "USD → CZK", min: 18, max: 28, step: 0.5, val: 22.5, fmt: (v: number) => v.toFixed(1) + " Kč" }
];
