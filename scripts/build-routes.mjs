/**
 * Bakes real road geometry for every leg into src/data/routes.json.
 *
 * Run once (npm run routes) and commit the result: the app and the production
 * build then have no runtime or build-time dependency on a routing service.
 * Waypoints live in src/data/waypoints.json, keyed by leg id.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const wpPath = resolve(here, "../src/data/waypoints.json");
const outPath = resolve(here, "../src/data/routes.json");

const OSRM = "https://router.project-osrm.org/route/v1/driving/";
const allWaypoints = JSON.parse(readFileSync(wpPath, "utf8"));

/**
 * Only bake legs the itinerary actually uses. Waypoints for retired routes stay
 * in waypoints.json so a change of mind is one edit away, but their geometry is
 * not shipped to the browser — it was ~40% of the bundle.
 */
const itinerary = readFileSync(resolve(here, "../src/data/itinerary.ts"), "utf8");
const live = new Set([...itinerary.matchAll(/id: "([a-zA-Z0-9]+)", kind:/g)].map((m) => m[1]));
const waypoints = Object.fromEntries(Object.entries(allWaypoints).filter(([id]) => live.has(id)));
const skipped = Object.keys(allWaypoints).filter((id) => !live.has(id));
if (skipped.length) console.log(`skipping ${skipped.length} retired legs: ${skipped.join(", ")}\n`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round5 = (n) => Math.round(n * 1e5) / 1e5;

/**
 * Ramer-Douglas-Peucker. OSRM returns a point every few metres, which is far
 * more than a map at zoom 5-10 can show; epsilon 0.0012 deg is roughly 130 m
 * and cuts the payload by ~10x while keeping every visible bend.
 */
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let worst = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay;
  const norm = Math.hypot(dx, dy);
  for (let i = 1; i < pts.length - 1; i++) {
    // Loops (out-and-back, park circuits) have identical endpoints, which makes
    // the perpendicular distance meaningless — measure from the endpoint instead.
    const d = norm < 1e-9
      ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
      : Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / norm;
    if (d > worst) { worst = d; idx = i; }
  }
  if (worst <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

function thin(coords) {
  return rdp(coords, 0.0012).map(([lat, lon]) => [round5(lat), round5(lon)]);
}

async function fetchLeg(id, pts) {
  const q = pts.map(([lon, lat]) => `${lon},${lat}`).join(";");
  const url = `${OSRM}${q}?overview=full&geometries=geojson&continue_straight=false`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      // curl rather than fetch: the sandbox this was generated in permits the
      // former but blocks Node's raw socket connect.
      const body = execFileSync("curl", ["-sS", "--max-time", "45", url], {
        encoding: "utf8", maxBuffer: 64 * 1024 * 1024
      });
      const json = JSON.parse(body);
      if (json.code !== "Ok" || !json.routes?.length) throw new Error(json.code || "no route");
      const route = json.routes[0];
      // OSRM returns [lon, lat]; Leaflet wants [lat, lon].
      const line = thin(route.geometry.coordinates.map(([lon, lat]) => [lat, lon]));
      return { line, meters: route.distance, seconds: route.duration };
    } catch (err) {
      if (attempt === 4) throw err;
      await sleep(attempt * 1200);
    }
  }
}

const out = {};
for (const [id, pts] of Object.entries(waypoints)) {
  if (pts.length < 2) {
    out[id] = { line: pts.map(([lon, lat]) => [round5(lat), round5(lon)]), meters: 0, seconds: 0 };
    console.log(`${id.padEnd(11)} single point`);
    continue;
  }
  const leg = await fetchLeg(id, pts);
  out[id] = leg;
  const mi = Math.round(leg.meters / 1609.34);
  const hrs = (leg.seconds / 3600).toFixed(1);
  console.log(`${id.padEnd(11)} ${String(mi).padStart(4)} mi  ${hrs.padStart(4)} h  ${String(leg.line.length).padStart(5)} pts`);
  await sleep(400);
}

writeFileSync(outPath, JSON.stringify(out) + "\n");
const bytes = readFileSync(outPath).length;
console.log(`\nwrote ${outPath} (${(bytes / 1024).toFixed(0)} kB)`);
