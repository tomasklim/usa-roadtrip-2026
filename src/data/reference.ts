export const CHARGE_ROWS: [string, string, string, string, "" | "gap" | "crit"][] = [
  ["Seattle → Spokane", "I-90 / US-2", "Ellensburg, Moses Lake, Ritzville, Spokane", "Dense. Non-issue.", ""],
  ["Spokane → Kalispell", "US-2 / US-93", "Coeur d'Alene, Sandpoint (L2), Kalispell", "Fine, but top up in Kalispell.", ""],
  ["Glacier National Park", "Going-to-the-Sun", "Nothing inside the park", "Go in full. The loop is only ~140 mi.", "gap"],
  ["Kalispell → Missoula → Bozeman", "US-93 / I-90", "Missoula, Butte, Bozeman", "Dense. Non-issue.", ""],
  ["Bozeman → Gardiner → park loop → West Yellowstone", "US-89 / park roads", "Bozeman SC, then Gardiner L2 + CCS L3 only", "300+ mi on one charge unless you charge in Gardiner. Book a motel with an L2 AND carry a CCS adapter.", "crit"],
  ["Beartooth module", "US-212 / WY-296", "Red Lodge L2 (unconfirmed), Cody CCS. No Tesla fast charging within 18 mi of the whole loop", "Rests entirely on the Red Lodge overnight charge, which OSM does not list — verify it, or start from Billings at 100%.", "crit"],
  ["West Yellowstone → Jackson", "US-191 / US-89", "West Yellowstone SC, Jackson SC", "Comfortable.", ""],
  ["Jackson → Salt Lake City", "US-89", "Montpelier, Logan, SLC", "Comfortable.", ""],
  ["SLC → Bonneville → Wells NV", "I-80", "SLC, West Wendover, Wells", "Fine. Wendover has car washes for the salt.", ""],
  ["Wells NV → Twin Falls", "US-93", "Nothing in Jackpot — 130 mi Wells to Twin Falls", "Leave Wells above 60%.", "gap"],
  ["Twin Falls → Boise", "I-84", "Twin Falls, Mountain Home, Boise", "Dense.", ""],
  ["Boise → Hood River", "I-84", "Ontario, Baker City, La Grande, Pendleton, Hood River", "Dense, but it is a 400 mi day.", ""],
  ["Alvord module", "US-95 / OR-205", "Winnemucca SC, then nothing until Hines/Burns SC", "~190 mi with zero charging, partly gravel. Highest risk on the map.", "crit"],
  ["Hood River → Seattle", "I-84 / I-5", "Hood River, Portland, Centralia, Seattle", "Dense.", ""],
  ["Olympic module", "US-101", "Aberdeen, Forks (L2 only), Port Angeles SC", "Forks is thin. Arrive with margin.", "gap"],
  ["Mount Rainier module", "WA-706 / WA-410", "Nothing useful in the park", "Go in full from Seattle; it is a 260 mi loop.", "gap"]
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
  { h: "Where it is legal", body: "Rest areas: <b>Washington 8 h, Montana 12 h, Idaho 10 h</b> on interstates or 16 h on other state highways. Walmart lots usually fine. Best of all, <b>free dispersed camping in national forests</b> — Lolo, Bridger-Teton, Gallatin." },
  { h: "Not inside the parks", body: "Sleeping in a vehicle is <b>prohibited in national parks</b> outside designated campgrounds. Mammoth Campground in Yellowstone is open year-round and reservable, which makes it the practical base for a dawn run into Lamar Valley." },
  { h: "Showers, which become the real problem", body: "Past three or four car nights, washing is the constraint, not sleep. <b>Pilot and Flying J truck stops</b> sell a proper private shower for $15–18 and there is one in Spokane, Missoula, Twin Falls, Boise and Portland. Campground showers at Apgar and Colter Bay are coin-operated. Planet Fitness's $25 black-card month gets you showers nationwide, which is the trick long-haul travellers actually use." },
  { h: "Staying warm at 2,000 m", body: "The cold nights on this route are Hyalite, West Yellowstone and Shadow Mountain — all around 2,000 m, all capable of −5 °C in early October. You want <b>bags rated to −7 °C, not −0 °C</b>, a wool hat each, and a plan for condensation: crack two windows a centimetre, and keep a microfibre cloth by the bed for the morning." },
  { h: "Two people, one narrow bed", body: "104 cm is narrower than a UK double. Sleep <b>head-to-toe</b> if either of you moves a lot, and put the wider shoulders on the boot side where the wheel arches do not intrude. Do a test night at home before you commit to twelve of them." },
  { h: "What a bed still buys you", body: "Shoulder-season motels in Gardiner, West Yellowstone and Whitefish run $90–140, so this is not really about money. A bed buys a <b>shower, laundry, a charge and a table to plan on</b> — which is why the balanced option keeps one in Salt Lake City and Boise, roughly every fourth night." }
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
  { id: "miles", block: true, t: "Turo mileage cap — check the listing", d: "The route is about 3,100 mi. At 200 mi/day you get 2,800 included and owe roughly $150. At 100 mi/day, the minimum allowed for the Deluxe class a Model Y LR sits in, you owe about $850. Message the host for a flat rate, or find an unlimited-distance listing." },
  { id: "driver", block: true, t: "Add your girlfriend as an additional driver", d: "Done in the Turo app, and it has to clear their approval before pickup. Not optional if you both want to drive." },
  { id: "glacier", block: true, t: "Check Glacier vehicle reservations", d: "Going-to-the-Sun Road has used timed-entry reservations in recent summers. Late September is usually clear of it, but the dates change every year — verify, and book on recreation.gov if needed." },
  { id: "esta", block: true, t: "ESTA for both of you + international driving permit", d: "ESTA takes minutes but can be held for days. The IDP is a formality alongside a Czech licence, and Turo hosts sometimes ask for it." },
  { id: "host", block: true, t: "Written OK from the host: Bonneville, out-of-state, CCS adapter", d: "Salt is corrosive and many listings ban off-road driving. Get it in writing in the Turo thread, ask about winter tyres, and ask them to include the CCS Combo 1 adapter — Gardiner and Cody both need it." },
  { id: "pass", t: "Buy the $250 non-resident annual park pass", d: "From Jan 1, 2026 non-residents pay $250 for the annual pass, or a $100 per-person surcharge at the 11 busiest parks. Yellowstone alone would be $35 + 2 × $100 = $235 without it, so the pass pays for itself immediately." },
  { id: "gardiner", t: "Book a Gardiner motel with an L2 charger", d: "This is the fix for the trip's one real charging problem. Filter for it, and confirm by message that the charger works and is available to guests." },
  { id: "tomales", t: "Book the Tomales Bay oyster farm", d: "Hog Island's shuck-your-own picnic tables sell out weeks ahead, and it is the best two hours of the San Francisco leg." },
  { id: "mattress", t: "Buy and cut the mattress", d: "IKEA foam 140 × 200, cut to 105 cm wide with a bread knife. Test-fit in a Model Y before you fly if you possibly can." },
  { id: "lodging", t: "Book Glacier, Gardiner, West Yellowstone and Jackson", d: "Shoulder season is cheap but the gateway towns are small. These four fill first; the rest can be same-day." },
  { id: "bear", t: "Plan on buying bear spray in Kalispell", d: "You cannot fly with it in either direction. Buy it there ($40–50) and leave it behind. Grizzly country in both Glacier and Yellowstone." },
  { id: "offline", t: "Download offline maps for the whole route", d: "Cell coverage dies in eastern Oregon, northern Nevada and most of Yellowstone. Download Google Maps offline areas, and save the GPX files from this page." },
  { id: "warm", t: "Pack for a hard frost", d: "Nights at 6,000–8,000 ft in October go below freezing. Sleeping bags rated to -5 °C, hats, and a plan for window condensation." }
];

export const BUDGET_CFG = [
  { id: "turoDay", label: "Turo, per day", min: 60, max: 200, step: 5, val: 110, fmt: (v: number) => "$" + v },
  { id: "cap", label: "Miles included per day", min: 75, max: 400, step: 25, val: 200, fmt: (v: number) => (v >= 400 ? "unlimited" : v + " mi") },
  { id: "overMi", label: "Cost per extra mile", min: 0, max: 1, step: 0.05, val: 0.5, fmt: (v: number) => "$" + v.toFixed(2) },
  { id: "motelNights", label: "Motel and hotel nights", min: 0, max: 22, step: 1, val: 16, fmt: (v: number) => v + " nights" },
  { id: "motel", label: "Motel, per night", min: 70, max: 300, step: 10, val: 130, fmt: (v: number) => "$" + v },
  { id: "kwh", label: "Charging, per kWh", min: 0.2, max: 0.6, step: 0.02, val: 0.4, fmt: (v: number) => "$" + v.toFixed(2) },
  { id: "foodDay", label: "Food, per person per day", min: 20, max: 150, step: 5, val: 65, fmt: (v: number) => "$" + v },
  { id: "sfNight", label: "San Francisco hotel, per night", min: 120, max: 500, step: 20, val: 260, fmt: (v: number) => "$" + v },
  { id: "fx", label: "USD → CZK", min: 18, max: 28, step: 0.5, val: 22.5, fmt: (v: number) => v.toFixed(1) + " Kč" }
];
