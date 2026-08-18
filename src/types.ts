export type Tag = "gf" | "df" | "meat" | "oy" | "ino";
export type Units = "mi" | "km";
export type DayKind = "arrive" | "city" | "drive" | "sf" | "depart";

export interface FoodPick {
  nm: string;
  note: string;
  tags: Tag[];
}

export interface Day {
  /** Stable id. Doubles as the key into routes.json for driving days. */
  id: string;
  kind: DayKind;
  title: string;
  leg: string;
  /** Hand-estimated wheel time. OSRM's demo profile is far too pessimistic to show. */
  hours: number;
  act: string;
  photos?: string[];
  hi: string[];
  ideas?: string[];
  sleep?: { t: "car" | "motel"; where: string };
  food?: FoodPick[];
  charge?: string[];
  alert?: string;
  why: string;
  /** Set when the day comes from a module rather than the base plan. */
  isMod?: boolean;
  modId?: string;
  /** Filled in by buildItinerary. */
  date?: number;
  num?: number | null;
  meters?: number;
}

export interface Module {
  id: string;
  name: string;
  desc: string;
  cost: string;
  risk: "hi" | "lo";
  /** Insert after this base day id, or swap out an inclusive span of base days. */
  after?: string;
  replaces?: [string, string];
  conflicts?: string[];
  days: Day[];
}

export interface Poi {
  id: string;
  name: string;
  kind: "food" | "sight";
  lat: number;
  lon: number;
  day: string;
  tags: Tag[];
  city: string;
  approx?: boolean;
}

export interface Charger {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  fast: boolean;
  stalls: number | null;
}

export interface Photo {
  url: string;
  page: string;
  credit: string;
  license: string;
  alt: string;
}

export interface Leg {
  line: [number, number][];
  meters: number;
  seconds: number;
}
