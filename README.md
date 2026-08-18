# Northwest Roadtrip 2026

Interactive plan for a 14-day, ~3,000-mile Tesla Model Y roadtrip through the Pacific Northwest
and the northern Rockies, Sept 23 – Oct 11, 2026.

**Seattle → Spokane → Glacier NP → Missoula → Bozeman → Yellowstone → Grand Teton →
Salt Lake City → Bonneville Salt Flats → Twin Falls → Boise → Columbia Gorge → Seattle**,
finishing with three nights in San Francisco.

## What the page does

- **Route map** — hand-built inline SVG (no tile server, no API key). Click a numbered pin to jump
  to that day.
- **Day-by-day itinerary** — mileage, driving hours, highlights, where to sleep, what to eat, and
  where to charge.
- **Modules** — everything that got cut from a longer first draft is still switchable: Beartooth
  Highway, Dinosaur National Monument, Craters of the Moon, Bend and the Oregon high desert, the
  Alvord Desert branch, and a Big Sur day. Switching one on recalculates the map, mileage, dates
  and budget, and tells you how many San Francisco nights it costs.
- **Driving load chart** — miles per day, so the heavy transfers are obvious.
- **Charging table** — Supercharger coverage leg by leg, with the gaps flagged. Northern
  Yellowstone is the one genuinely critical stretch.
- **Food guide** — gluten-free and dairy-free ordering rules plus picks by city.
- **Budget calculator** — sliders for the Turo day rate, mileage cap, overage rate, lodging,
  energy and food; totals in USD and CZK.
- **Pre-trip checklist** — five blocking items first, saved in `localStorage`.

## Stack

One `index.html`. Vanilla JS, no dependencies, no build step, no external requests — it works
offline once loaded, which matters in eastern Oregon and most of Yellowstone.

## Local development

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deployment

Pushed to GitHub Pages and Vercel; both serve the repo root as a static site.
