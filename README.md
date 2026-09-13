# Northwest Roadtrip 2026

Interactive plan for a 20-day trip through the Pacific Northwest and the northern Rockies,
Sept 24 – Oct 13, 2026 (arriving home in Prague on Oct 14), built around one deliberate decision: **fly over the dead miles and use
three focused rental blocks instead of one long loop.**

Seattle to Yellowstone is 1,300 km each way and the car has to come back, so a Seattle-based loop
costs about 5,000 km of driving. Flying over the transit brings the base plan down to **about 4,110 km** — and, more
importantly, turns half the driving days into short park days.

**Seattle + Mount Rainier + Hood Canal oysters** → fly to Salt Lake City →
**Bonneville Salt Flats → Bear Lake → Grand Teton → Yellowstone → Beartooth Highway → Bozeman →
Lava Hot Springs → Salt Lake City** → fly to **San Francisco → Silicon Valley + NODE in Palo Alto → Point Reyes**.

**Live site: https://usa-roadtrip-2026-ten.vercel.app/**

## What the page does

- **Five focused views** — overview, daily plan, map, flights and trip kit. A fixed bottom
  navigation on phones keeps the essentials within reach. Day links are shareable; the last
  selected day and checklist stay saved on the device.
- **Offline text copy** — download a self-contained HTML itinerary with daily plans, food, sleep,
  charging and flights. It opens without a connection; the live website and map tiles require one.
- **Real interactive map** — Leaflet with terrain, street and satellite basemaps. Every route line
  is genuine road geometry from OSRM, baked into the repo, so distances are measured rather than
  estimated and there is no runtime dependency on a routing service.
- **Toggleable layers** — sights, restaurants, 305 Tesla Superchargers from OpenStreetMap, and
  Whole Foods locations (useful when you are gluten-free and dairy-free on the road).
- **Day-by-day itinerary** with photos from Wikimedia Commons, highlights, an "ideas if you have
  time" list, where to sleep, what to eat and where to charge.
- **Modules** — Chief Joseph Byway and Cody, Craters of the Moon, Dinosaur National Monument, the
  full Olympic Peninsula, Antelope Island, and a Big Sur day. Switching one on re-splices the
  itinerary, shifts every date, redraws the map and re-prices the trip. The flight home is fixed,
  so the panel tells you how many San Francisco days each module costs.
- **Sleep-style switch** — beds, balanced, or car-first (4 to 9 nights in the car), with every spot
  named and the cold ones flagged.
- **km / mi toggle**, per-day difficulty ratings, a driving-load chart, a leg-by-leg charging table,
  a budget calculator in USD and CZK, a pre-trip checklist, and **GPX export** per day or for the
  whole trip.

## Stack

Vite + React + TypeScript + react-leaflet. A Vercel Function and a private Upstash Redis hash sync the shared trip. `npm run routes` regenerates the road
geometry from `src/data/waypoints.json` via OSRM; the result is committed.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build
npm run routes     # only when waypoints change
```

## Deployment

The primary site is hosted on **Vercel** at https://usa-roadtrip-2026-ten.vercel.app/.
Pushing to `main` triggers the connected Vercel production deployment. Verify the Vercel
commit status and the live site after publishing. `vercel.json` carries the security headers.
The existing GitHub Pages workflow also runs, but Vercel is the user-facing site.


## Shared trip and checklist

Trip kit groups tasks into cars, flights/documents, stays, experiences, parks/charging and packing/offline.
Car dates are derived from the active route. Original checklist IDs and personal browser data are preserved.

`api/trip.js` reads/writes one private trip in Upstash Redis. Production uses the Vercel marketplace
integration with `KV_REST_API_URL` and `KV_REST_API_TOKEN` (the corresponding `UPSTASH_REDIS_REST_*`
names also work). Set `TRIP_SHARE_TOKEN` to 32 cryptographically random bytes encoded as base64url
(43 characters), as a production-only secret. Never put it in a Vite variable or commit it.
Vercel routing middleware protects the app and assets with a server-signed, HttpOnly session cookie.
The shared access code is derived server-side from the secret and can be revealed in Trip kit after
signing in. Existing invite links still authenticate and upgrade automatically on the same device.
Rotating the secret and redeploying revokes sessions and old invites without deleting trip data.

Checklist state, route choices, per-night accommodation/notes and budget entries sync. Each checklist
item, stay and expense category is stored separately; independent edits merge, while the last server
write wins for the same item. Amounts and user notes belong only in the authenticated database, never
in source code. Pending edits persist on the device and retry after reconnecting. Display preferences
and the selected day remain local. Signing out clears the site's local cache on that device.

The site sends noindex headers and metadata. A public repository or GitHub Pages copy can still expose
the base itinerary, but cannot access private database fields without authorization. Downloaded offline
copies and data cached on a signed-in device are not encrypted by the access code.
The website must already be loaded to use it without a connection; this is not a service-worker
app install. Download the standalone offline itinerary for a cold start without internet.

The database integration is connected to Production only. Preview deployments deliberately have no
shared storage unless separately configured. Do not connect a test environment to production data.

Checks:

```sh
node scripts/verify-shared-trip.mjs
npm run build
```

The shared-trip checks cover authorization, payload validation, independent concurrent edits,
offline/reload recovery, edits during an in-flight request, and separation from the personal plan.
