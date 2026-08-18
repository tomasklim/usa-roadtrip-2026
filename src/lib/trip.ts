import { BASE, CAR_NIGHTS, MODULES } from "../data/itinerary";
import routesRaw from "../data/routes.json";
import type { Day, Leg, SleepStyle, Units } from "../types";

export const ROUTES = routesRaw as unknown as Record<string, Leg>;

export const DAY_MS = 864e5;
export const START = Date.UTC(2026, 8, 23);   // Sept 23, landing in Seattle
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

const SEATTLE_CAR = ["seaA", "seaB", "olyA", "olyB"];
const SLC_CAR = ["s1", "antelope", "s2", "dinoA", "dinoB", "s3", "s4", "s4b", "s5", "s5b",
                 "s6", "s7", "cody", "s8", "s9", "craters2", "s10"];

function blockDays(t: Trip, ids: string[]) {
  const idx = t.days.map((d, i) => (ids.includes(d.id) ? i : -1)).filter((i) => i >= 0);
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

export function buildTrip(on: Set<string>, sleepStyle: SleepStyle = "balanced"): Trip {
  let days: Day[] = BASE.map((d) => ({ ...d }));
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
    for (let i = days.length - 1; i >= 0; i--) if (days[i].kind === "sf") { idx = i; break; }
    if (idx < 0) break;
    days.splice(idx, 1);
    droppedSf++;
  }
  const overrun = Math.max(0, days.length - CAP_DAYS);

  days.forEach((d, i) => {
    d.num = i;
    d.date = START + i * DAY_MS;
    d.meters = metersOf(d.id);
    // Sleeping style is applied here so every downstream count — the hero, the
    // budget's lodging line, the day cards — reads from one decision.
    const car = CAR_NIGHTS[d.id];
    const wantCar = car && (sleepStyle === "car" || (sleepStyle === "balanced" && car.tier === 1));
    if (wantCar) d.sleep = { t: "car", where: car.where, note: car.note };
  });

  const meters = days.reduce((s, d) => s + (d.meters ?? 0), 0);
  const driveDays = days.filter((d) => (d.meters ?? 0) > 0 && d.kind !== "sf").length;
  const carNights = days.filter((d) => d.sleep?.t === "car").length;
  const sfNights = days.filter((d) => d.kind === "sf").length;
  // The car goes back on the last day of the Salt Lake rental block.
  const lastCarDay = [...days].reverse().find((d) => SLC_CAR.includes(d.id));
  const firstSf = days.find((d) => d.kind === "sf");

  return {
    days, meters, driveDays, carNights, droppedSf, overrun, sfNights,
    carReturn: lastCarDay?.date ?? START,
    flyDate: firstSf?.date ?? START,
    spare: Math.max(0, CAP_DAYS - days.length)
  };
}

/**
 * The trip now has two separate rentals — two days in Seattle for Rainier and
 * Hood Canal, and the Salt Lake block for the parks. The budget and the mileage
 * cap both need them counted apart.
 */
/** Which rental a day belongs to — used to band the driving-load chart. */
export function blockOf(id: string): string {
  if (SEATTLE_CAR.includes(id)) return "Seattle car";
  if (SLC_CAR.includes(id)) return "Salt Lake car";
  return "No car";
}

export const rentals = (t: Trip) => ({
  seattle: blockDays(t, SEATTLE_CAR),
  slc: blockDays(t, SLC_CAR)
});

/** The Salt Lake rental is the long one, so it carries the mileage-cap risk. */
export const turoDays = (t: Trip) => rentals(t).slc.days || t.driveDays;

/* ---------- GPX export ---------- */
export function toGpx(name: string, legs: { id: string; title: string }[]): string {
  const trks = legs
    .filter((l) => ROUTES[l.id]?.line?.length > 1)
    .map((l) => {
      const pts = ROUTES[l.id].line
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
