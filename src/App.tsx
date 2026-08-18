import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { ActBar, TripBar } from "./components/TripBar";
import { Flights } from "./components/Flights";
import { Modules } from "./components/Modules";
import { RouteMap, type Basemap, type Layers } from "./components/RouteMap";
import { DayList } from "./components/DayList";
import { Charging, Glance, LoadChart, RiskSection, SleepSection } from "./components/Panels";
import { FoodGuide } from "./components/FoodGuide";
import { Budget } from "./components/Budget";
import { Checklist } from "./components/Checklist";
import { MODULES } from "./data/itinerary";
import { buildTrip } from "./lib/trip";
import { useStored } from "./lib/useStored";
import type { SleepStyle, Units } from "./types";
import type { Tab } from "./components/DayPanel";

export default function App() {
  const [mods, setMods] = useStored<string[]>("mods", [], normalizeMods);
  const [units, setUnits] = useStored<Units>("units", "mi", NORMALIZE_UNITS);
  const [theme, setTheme] = useStored<string | null>("theme", null, NORMALIZE_THEME);
  const [tab, setTab] = useStored<Tab>("tab", "plan", NORMALIZE_TAB);
  const [basemap, setBasemap] = useStored<Basemap>("basemap", "terrain", NORMALIZE_BASEMAP);
  const [layers, setLayers] = useStored<Layers>("layers2", DEFAULT_LAYERS, normalizeLayers);
  const [mapHeight, setMapHeight] = useStored<number | null>("mapHeight", null, NORMALIZE_MAP_HEIGHT);
  const [wheelZoom, setWheelZoom] = useStored<boolean>("wheelZoom", false, NORMALIZE_FALSE);
  const [panel, setPanel] = useStored<boolean>("panel", true, NORMALIZE_TRUE);
  const [panelWidth, setPanelWidth] = useStored<number>("panelWidth", 400, NORMALIZE_PANEL_WIDTH);
  const [showList, setShowList] = useStored<boolean>("showList", false, NORMALIZE_FALSE);
  const [sleepStyle, setSleepStyle] = useStored<SleepStyle>("sleepStyle", "balanced", NORMALIZE_SLEEP);
  const [selected, setSelected] = useState<string | null>(null);
  const [ghost, setGhost] = useState<string | null>(null);

  const on = useMemo(() => new Set(Array.isArray(mods) ? mods : []), [mods]);
  const trip = useMemo(() => buildTrip(on, sleepStyle), [on, sleepStyle]);

  useEffect(() => {
    if (selected && !trip.days.some((d) => d.id === selected)) setSelected(null);
  }, [selected, trip.days]);

  useEffect(() => {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);
  const dark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;

  const toggle = useCallback((id: string) => {
    setMods((prev) => {
      const next = new Set(Array.isArray(prev) ? prev : []);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        // Conflicts are symmetric even if only one module declares the relation.
        const selected = MODULES.find((m) => m.id === id);
        MODULES.forEach((other) => {
          if (other.id !== id && selected && conflicts(selected.id, other.id)) next.delete(other.id);
        });
      }
      return [...next];
    });
  }, [setMods]);

  // Selecting never scrolls the page — the map is the point, and being yanked
  // down to a card you did not ask for is worse than useless. The popups carry
  // an explicit button instead.
  const select = useCallback((id: string) => setSelected(id), []);

  const scrollToDay = useCallback((id: string) => {
    // Deferred a frame: a day added by switching a module on is not in the DOM yet.
    requestAnimationFrame(() => {
      const el = document.getElementById(`day-${id}`);
      if (!el) return;
      const wide = window.matchMedia("(min-width: 1080px)").matches;
      el.scrollIntoView({ behavior: "smooth", block: wide ? "center" : "start" });
    });
  }, []);

  const selectAndScroll = useCallback((id: string) => {
    setSelected(id);
    scrollToDay(id);
  }, [scrollToDay]);

  /** Move the selection along the itinerary; used by the arrow keys and the map buttons. */
  const step = useCallback((delta: number) => {
    setSelected((cur) => {
      const list = trip.days.map((d) => d.id);
      if (!list.length) return cur;
      if (!cur) return delta > 0 ? list[0] : list[list.length - 1];
      const i = list.indexOf(cur);
      if (i < 0) return list[0];
      return list[(i + delta + list.length) % list.length];
    });
  }, [trip.days]);

  // Left and right arrows walk the itinerary, unless you are typing in a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <>
      <Header units={units} setUnits={setUnits} theme={theme} setTheme={setTheme} />
      <TripBar trip={trip} units={units} />

      <section id="plan" style={{ paddingTop: 18 }}>
        <div className="wrap">
          <ActBar trip={trip} selected={selected} onPick={select} />
          <RouteMap trip={trip} units={units} selected={selected} onSelect={select}
                    layers={layers} setLayers={setLayers} basemap={basemap} setBasemap={setBasemap}
                    dark={dark} wheelZoom={wheelZoom} setWheelZoom={setWheelZoom}
                    panel={panel} setPanel={setPanel}
                    panelWidth={panelWidth} setPanelWidth={setPanelWidth} tab={tab} setTab={setTab}
                    ghost={ghost}
                    onClear={() => setSelected(null)}
                    mapHeight={mapHeight} setMapHeight={setMapHeight}
                    onStep={step} onScrollTo={scrollToDay} />

          <div className="controls">
            <Modules on={on} toggle={toggle} trip={trip} units={units}
                     sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} onSelect={select}
                     onHover={setGhost} />
          </div>

          <button className="listtoggle" onClick={() => setShowList(!showList)} aria-expanded={showList}>
            {showList
              ? "▴  Hide the written itinerary"
              : `▾  Read the whole itinerary as text — all ${trip.days.length} days`}
          </button>
          {showList && (
            <DayList trip={trip} units={units} selected={selected} onSelect={select} />
          )}
        </div>
      </section>

      <Flights />
      <Glance trip={trip} units={units} onSelect={selectAndScroll} />
      <LoadChart trip={trip} units={units} onSelect={selectAndScroll} />
      <Charging />
      <FoodGuide trip={trip} />
      <SleepSection trip={trip} sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} />
      <Budget trip={trip} />
      <Checklist />
      <RiskSection />

      <footer>
        <div className="wrap narrow">
          <p>
            <b>Northwest Roadtrip 2026</b> — distances measured on OSRM road geometry, closure dates and
            entrance fees verified August 2026. Photos from Wikimedia Commons under their stated licences;
            map data © OpenStreetMap contributors.
          </p>
          <p>
            Check conditions the morning of, not the night before: <span style={{ fontFamily: "var(--mono)" }}>nps.gov/yell</span>,{" "}
            <span style={{ fontFamily: "var(--mono)" }}>nps.gov/glac</span>, and text <b>GNPROADS</b> to <b>333111</b>.
          </p>
        </div>
      </footer>
    </>
  );
}

const VALID_MODS = new Set(MODULES.map((m) => m.id));
const DEFAULT_LAYERS: Layers = { sights: true, food: true, chargers: false, stores: false };

const normalizeMods = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.reduce<string[]>((out, id) => {
    if (typeof id !== "string" || !VALID_MODS.has(id)) return out;
    const withoutConflicts = out.filter((other) => !conflicts(id, other));
    if (!withoutConflicts.includes(id)) withoutConflicts.push(id);
    return withoutConflicts;
  }, []);
};

const oneOf = <T,>(allowed: readonly T[], fallback: T) =>
  (value: unknown): T => allowed.includes(value as T) ? value as T : fallback;

const bool = (fallback: boolean) => (value: unknown) => typeof value === "boolean" ? value : fallback;

const finite = (min: number, max: number, fallback: number) => (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;

const finiteOrNull = (min: number, max: number) => (value: unknown) =>
  value == null ? null : typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : null;

const normalizeLayers = (value: unknown): Layers => {
  const v = value && typeof value === "object" ? value as Partial<Layers> : {};
  return {
    sights: typeof v.sights === "boolean" ? v.sights : DEFAULT_LAYERS.sights,
    food: typeof v.food === "boolean" ? v.food : DEFAULT_LAYERS.food,
    chargers: typeof v.chargers === "boolean" ? v.chargers : DEFAULT_LAYERS.chargers,
    stores: typeof v.stores === "boolean" ? v.stores : DEFAULT_LAYERS.stores
  };
};

const conflicts = (a: string, b: string) => {
  const am = MODULES.find((m) => m.id === a);
  const bm = MODULES.find((m) => m.id === b);
  return !!am?.conflicts?.includes(b) || !!bm?.conflicts?.includes(a);
};

const NORMALIZE_UNITS = oneOf<Units>(["mi", "km"], "mi");
const NORMALIZE_THEME = oneOf<string | null>(["light", "dark", null], null);
const NORMALIZE_TAB = oneOf<Tab>(["plan", "food", "sleep", "charge"], "plan");
const NORMALIZE_BASEMAP = oneOf<Basemap>(["terrain", "streets", "satellite"], "terrain");
const NORMALIZE_SLEEP = oneOf<SleepStyle>(["motel", "balanced", "car"], "balanced");
const NORMALIZE_FALSE = bool(false);
const NORMALIZE_TRUE = bool(true);
const NORMALIZE_MAP_HEIGHT = finiteOrNull(260, 1800);
const NORMALIZE_PANEL_WIDTH = finite(280, 1200, 400);
