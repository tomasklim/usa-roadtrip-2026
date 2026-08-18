# Northwest Roadtrip 2026

Interactive plan for a 21-day trip through the Pacific Northwest and the northern Rockies,
Sept 23 – Oct 13, 2026, built around one deliberate decision: **two short driving blocks with a
flight between them, instead of one long loop.**

Seattle to Yellowstone is 1,300 km each way and the car has to come back, so a Seattle-based loop
costs about 5,000 km of driving. Flying over the transit brings it down to **3,890 km** — and, more
importantly, turns half the driving days into short park days.

**Seattle + Mount Rainier + Hood Canal oysters** → fly to Salt Lake City →
**Bonneville Salt Flats → Bear Lake → Grand Teton → Yellowstone → Beartooth Highway → Bozeman →
Lava Hot Springs → Salt Lake City** → fly to **San Francisco**.

## What the page does

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

Vite + React + TypeScript + react-leaflet. No backend. `npm run routes` regenerates the road
geometry from `src/data/waypoints.json` via OSRM; the result is committed.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build
npm run routes     # only when waypoints change
```

## Deployment

GitHub Actions builds and publishes to GitHub Pages on every push to `main`.
`vercel.json` carries the security headers for a parallel Vercel deployment.
