import type { Stays } from "./planning";
import { BASE, CAR_NIGHTS, MODULES, VALLEY_LOOP } from "../data/itinerary";
import { DEFAULT_SEATTLE, normalizeSeattle, seattleDays, type SeattleOptions } from "../data/seattle";
import routesRaw from "../data/routes.json";
import type { Day, Leg, SleepOverrides, SleepStyle, Units } from "../types";

export const ROUTES = routesRaw as unknown as Record<string, Leg>;

export const DAY_MS = 864e5;
export const START = Date.UTC(2026, 8, 24);   // Sept 24, landing in Seattle
export const DEPART = Date.UTC(2026, 9, 13);  // Oct 13, SFO 16:30 to Prague
/** The booked window is fixed, so the itinerary has a hard length. */
export const CAP_DAYS = Math.round((DEPART - START) / DAY_MS) + 1;

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (t: number) => {
  const d = new Date(t);
  return `${DOW[d.getUTCDay()]} · ${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
export const fmtShort = (t: number) => {
  const d = new Date(t);
  return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

export const metersOf = (id: string) => ROUTES[id]?.meters ?? 0;

/* ---------- units ---------- */
export const dist = (meters: number, u: Units) =>
  u === "mi" ? meters / 1609.344 : meters / 1000;
export const distLabel = (meters: number, u: Units) => {
  const v = dist(meters, u);
  const rounded = v >= 100 ? Math.round(v / 5) * 5 : Math.round(v);
  return `${rounded.toLocaleString("en-US")} ${u}`;
};
export const distNum = (meters: number, u: Units) => Math.round(dist(meters, u));

export type Difficulty = "easy" | "moderate" | "long" | "crux";
export function difficulty(meters: number): Difficulty {
  const mi = meters / 1609.344;
  if (mi < 130) return "easy";
  if (mi < 260) return "moderate";
  if (mi < 350) return "long";
  return "crux";
}

const SEATTLE_CAR = ["arrive", "seaB", "sea1", "seaA", "seaReturn", "olyA", "olyB"];
const SLC_CAR = ["s1", "antelope", "s2", "dinoA", "dinoB", "s3", "s4", "s4b", "s5",
                 "s5b", "s6", "s7", "rainLamar", "rainTransfer", "rainRest", "s8", "s9", "craters2", "s10"];
const SF_CAR = ["sf2", "sf3", "sf4"];

function blockDays(t: Trip, ids: string[]) {
  const idx = t.days.map((d, i) => (ids.includes(d.id) && d.rental !== "No car" ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return { days: 0, meters: 0 };
  const first = Math.min(...idx), last = Math.max(...idx);
  return {
    days: last - first + 1,
    meters: t.days.slice(first, last + 1).reduce((s, d) => s + (d.meters ?? 0), 0)
  };
}

/* ---------- assembly ---------- */
export interface Trip {
  days: Day[];
  seattle: SeattleOptions;
  meters: number;
  driveDays: number;
  carNights: number;
  /** San Francisco days that had to be dropped to make the modules fit. */
  droppedSf: number;
  /** Days beyond the booked window that could not be absorbed. */
  overrun: number;
  sfNights: number;
  carReturn: number;
  flyDate: number;
  spare: number;
}

export function buildTrip(on: Set<string>, sleepStyle: SleepStyle = "balanced", overrides: SleepOverrides = {}, seattle: SeattleOptions = DEFAULT_SEATTLE, stays: Stays = {}): Trip {
  const options = normalizeSeattle(on.has("olympic") ? { ...seattle, weather: "good", rainier: "sun", flight: "tue-am" } : seattle);
  let days: Day[] = [...seattleDays(BASE, options), ...BASE.slice(5).map(d => ({ ...d }))];
  const bonneville = days.find(d => d.id === "s1")!;
  bonneville.hi = ["Morning flight to Salt Lake City; allow for the one-hour time-zone change before collecting the car.", ...bonneville.hi.slice(1)];
  if (options.flight !== "tue-am") {
    const salt = days.find(d => d.id === "s1")!;
    salt.title = "A whole afternoon on salt";
    salt.leg = "Salt Lake City → Bonneville Salt Flats → Salt Lake City";
    salt.hi = ["Wake up in Salt Lake City. Collect the Utah car today; no flight to catch first.", ...salt.hi.slice(1)];
    salt.why = "A rested start and a full afternoon for Bonneville, with the rest of the trip on its original dates.";
  }
  const active = MODULES.filter((m) => on.has(m.id));

  // Branch swaps first, from the back, so earlier indices stay valid.
  active
    .filter((m) => m.replaces)
    .sort((a, b) => days.findIndex((d) => d.id === b.replaces![0]) - days.findIndex((d) => d.id === a.replaces![0]))
    .forEach((m) => {
      const i = days.findIndex((d) => d.id === m.replaces![0]);
      const j = days.findIndex((d) => d.id === m.replaces![1]);
      if (i < 0 || j < 0) return;
      days.splice(i, j - i + 1, ...m.days.map((d) => ({ ...d, isMod: true, modId: m.id })));
    });

  // Then insertions, also from the back.
  active
    .filter((m) => !m.replaces)
    .sort((a, b) => days.findIndex((d) => d.id === b.after!) - days.findIndex((d) => d.id === a.after!))
    .forEach((m) => {
      const i = days.findIndex((d) => d.id === m.after!);
      const at = i < 0 ? days.length : i + 1;
      days.splice(at, 0, ...m.days.map((d) => ({ ...d, isMod: true, modId: m.id })));
    });

  // The flight home does not move, so extra days come out of San Francisco.
  let droppedSf = 0;
  while (days.length > CAP_DAYS) {
    let idx = -1;
    for (let i = days.length - 1; i >= 0; i--) if (days[i].kind === "sf" && !days[i].required) { idx = i; break; }
    if (idx < 0) break;
    days.splice(idx, 1);
    droppedSf++;
  }
  // Never strand the itinerary in Santa Cruz when extra modules consume Monterey's day.
  if (!days.some(d => d.id === 'sf2')) {
    const valley = days.findIndex(d => d.id === 'sf3');
    if (valley >= 0) days[valley] = {...VALLEY_LOOP};
  }
  const overrun = Math.max(0, days.length - CAP_DAYS);

  let carStreak = 0;
  days.forEach((d, i) => {
    d.num = i + 1;
    d.date = START + i * DAY_MS;
    d.meters = metersOf(d.routeId ?? d.id);
    if (d.routeId && ROUTES[d.routeId]) d.hours = Math.round(ROUTES[d.routeId].seconds / 360) / 10;
    // Sleeping style is applied here so every downstream count — the hero, the
    // budget's lodging line, the day cards — reads from one decision.
    const car = d.carEligible === false ? undefined : CAR_NIGHTS[d.id];
    if (d.sleep) d.sleep = { ...d.sleep };
    const choice = overrides[d.id];
    const priceException = !!car && choice === "price";
    const wantCar = !!car && choice !== "bed" && (priceException || sleepStyle === "car" || (sleepStyle === "balanced" && car.tier === 1));
    if (wantCar && (carStreak < 2 || priceException)) {
      carStreak++;
      d.sleep = { t: "car", where: car.where, note: car.note, streak: carStreak, priceException,
        decision: `${carStreak > 2 ? "Beyond the two-night limit · " : ""}${priceException ? "Your price exception · " : ""}car night ${carStreak} in a row.` };
    } else {
      if (d.sleep && wantCar && carStreak >= 2) d.sleep.decision = `A bed after ${carStreak} car nights — shower, rest and reset.`;
      else if (d.sleep && choice === "bed") d.sleep.decision = "Your choice: a bed tonight.";
      carStreak = 0;
    }
  });

  // Per-night decisions override recommendations without silently rewriting the user's choice.
  let chosenCarStreak = 0;
  days.forEach(d => {
    if (!d.sleep) return;
    const saved = stays[d.id];
    d.sleep.suggestedWhere = d.sleep.where;
    if (saved) {
      if (saved.place.trim()) { d.sleep.where = saved.place.trim(); d.sleep.chosen = true; }
      if (saved.type !== 'undecided') d.sleep.t = saved.type === 'car' ? 'car' : 'motel';
      if (saved.note) d.sleep.note = saved.note;
      if (saved.type !== 'undecided') d.sleep.decision = 'Your overnight choice';
    }
    chosenCarStreak = d.sleep.t === 'car' ? chosenCarStreak + 1 : 0;
    d.sleep.streak = chosenCarStreak || undefined;
  });

  const meters = days.reduce((s, d) => s + (d.meters ?? 0), 0);
  const driveDays = days.filter((d) => (d.meters ?? 0) > 0).length;
  const carNights = days.filter((d) => d.sleep?.t === "car").length;
  const sfNights = days.filter((d) => d.kind === "sf").length;
  // The car goes back on the last day of the Salt Lake rental block.
  const lastCarDay = [...days].reverse().find((d) => SLC_CAR.includes(d.id));
  const firstSf = days.find((d) => d.kind === "sf");

  return {
    days, seattle: options, meters, driveDays, carNights, droppedSf, overrun, sfNights,
    carReturn: lastCarDay?.date ?? START,
    flyDate: firstSf?.date ?? START,
    spare: Math.max(0, CAP_DAYS - days.length)
  };
}

/**
 * Separate Seattle, Salt Lake and Bay Area rentals. Count the Seattle car from
 * arrival-night pickup through the selected return, including intervening city days.
 */
/** Which rental a day belongs to — used to band the driving-load chart. */
export function blockOf(value: string | Day): string {
  if (typeof value !== "string" && value.rental) return value.rental;
  const id = typeof value === "string" ? value : value.id;
  if (SEATTLE_CAR.includes(id)) return "Seattle car";
  if (SLC_CAR.includes(id)) return "Salt Lake car";
  if (SF_CAR.includes(id)) return "San Francisco car";
  return "No car";
}

export const rentals = (t: Trip) => ({
  seattle: blockDays(t, SEATTLE_CAR),
  slc: blockDays(t, SLC_CAR),
  sf: blockDays(t, SF_CAR)
});

/** The Salt Lake rental is the long one, so it carries the mileage-cap risk. */
export const turoDays = (t: Trip) => rentals(t).slc.days || t.driveDays;

/* ---------- GPX export ---------- */
export function toGpx(name: string, legs: { id: string; routeId?: string; title: string }[]): string {
  const trks = legs
    .filter((l) => ROUTES[l.routeId ?? l.id]?.line?.length > 1)
    .map((l) => {
      const pts = ROUTES[l.routeId ?? l.id].line
        .map(([lat, lon]) => `<trkpt lat="${lat}" lon="${lon}"/>`)
        .join("");
      return `<trk><name>${esc(l.title)}</name><trkseg>${pts}</trkseg></trk>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Northwest Roadtrip 2026" xmlns="http://www.topografix.com/GPX/1/1">
<metadata><name>${esc(name)}</name></metadata>
${trks}
</gpx>`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function downloadGpx(filename: string, gpx: string) {
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
