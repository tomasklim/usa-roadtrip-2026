import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { ActBar, Chapters, QuickLinks, TripBar } from "./components/TripBar";
import { Flights } from "./components/Flights";
import { Modules } from "./components/Modules";
import type { Basemap, Layers } from "./components/RouteMap";
import { DayList } from "./components/DayList";
import { Charging, Glance, LoadChart, RiskSection, SleepSection } from "./components/Panels";
import { FoodGuide } from "./components/FoodGuide";
import { Budget } from "./components/Budget";
import { Checklist } from "./components/Checklist";
import { CAR_NIGHTS, MODULES } from "./data/itinerary";
import { buildTrip } from "./lib/trip";
import { useStored } from "./lib/useStored";
import { DailyPlan, DayPicker } from "./components/DailyPlan";
import { navigate, TOPICS, todayInTrip, useNavigation } from "./lib/navigation";
import { downloadOfflinePlan } from "./lib/offline";
import type { SleepOverrides, SleepStyle, Units } from "./types";
import type { Tab } from "./components/DayPanel";

const RouteMap = lazy(() => import("./components/RouteMap").then(module => ({ default: module.RouteMap })));

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
  const [sleepOverrides, setSleepOverrides] = useStored<SleepOverrides>("sleepOverrides", {}, normalizeSleepOverrides);
  const [selected, setSelected] = useStored<string | null>("selectedDay", null, normalizeDay);
  const route = useNavigation();
  const { view, topic } = route;
  const [ghost, setGhost] = useState<string | null>(null);

  const on = useMemo(() => new Set(Array.isArray(mods) ? mods : []), [mods]);
  const trip = useMemo(() => buildTrip(on, sleepStyle, sleepOverrides), [on, sleepStyle, sleepOverrides]);
  const routeDay = trip.days.find(d => d.id === route.day);
  const activeSelection = routeDay?.id ?? (view === "map" ? null : selected);
  const day = routeDay ?? trip.days.find(d => d.id === selected) ?? todayInTrip(trip) ?? trip.days[0];

  useEffect(() => {
    if (route.day && trip.days.some(d => d.id === route.day)) setSelected(route.day);
  }, [route.day, trip.days, setSelected]);

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

  const openDaily = useCallback((id: string) => {
    setSelected(id);
    navigate("itinerary", id);
  }, [setSelected]);
  const selectOnMap = useCallback((id: string) => {
    setSelected(id);
    navigate("map", id);
  }, [setSelected]);
  const select = selectOnMap;
  const clearMap = useCallback(() => { setSelected(null); navigate("map"); }, [setSelected]);
  const scrollToDay = openDaily;

  /** Keep keyboard navigation, saved selection and the shareable URL together. */
  const step = useCallback((delta: number) => {
    const index = trip.days.findIndex(d => d.id === day.id);
    const next = trip.days[Math.max(0, Math.min(trip.days.length - 1, index + delta))];
    if (view === "map") selectOnMap(next.id);
    else openDaily(next.id);
  }, [trip.days, day.id, view, selectOnMap, openDaily]);

  // Left and right arrows walk the itinerary, unless you are typing in a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !["itinerary", "map"].includes(view)) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Escape" && view === "map") clearMap();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, view, clearMap]);

  return (
    <>
      <Header units={units} setUnits={setUnits} theme={theme} setTheme={setTheme} view={view} />
      <main id="main" tabIndex={-1}>
        {view === "overview" && <>
          <TripBar trip={trip} units={units} onContinue={() => openDaily(day.id)} dayTitle={`Day ${day.num} · ${day.title}`} />
          <div className="wrap overview-body">
            <QuickLinks />
            <div className="section-heading"><div><span className="eyebrow">THREE CHAPTERS, ONE GOOD TRIP</span><h2>From the mountains to the Pacific.</h2></div><a className="text-action" href="#itinerary">All {trip.days.length} days ↗</a></div>
            <Chapters trip={trip} onPick={openDaily} />
            <div className="travel-note">
              <div><span className="eyebrow">KEEP IT WITH YOU</span><h2>A plan for the road.</h2>
                <p>Download the daily itinerary and flights before heading out of signal.</p>
                <p className="hint">Maps, photos and live conditions still need a connection.</p></div>
              <button className="action primary" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button>
            </div>
          </div>
        </>}

        {view === "itinerary" && <div className="wrap view-content">
          <div className="section-heading"><div><span className="eyebrow">ONE DAY AT A TIME</span><h1>Your daily field notes.</h1></div>
            <button className="action" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button></div>
          {trip.overrun > 0 && <p className="warn" role="alert">The selected route is {trip.overrun} days too long for the booked flights. <a href="#guide/options">Adjust route options</a>.</p>}
          <DailyPlan trip={trip} day={day} units={units} tab={tab} setTab={setTab} onSelect={openDaily} onMap={selectOnMap} />
          <details className="full-itinerary" open={showList} onToggle={e => setShowList(e.currentTarget.open)}>
            <summary>Read the complete itinerary <span>{trip.days.length} days</span></summary>
            <DayList trip={trip} units={units} selected={activeSelection} onSelect={selectOnMap} />
          </details>
          <details className="full-itinerary"><summary>Distances & driving overview</summary>
            <Glance trip={trip} units={units} onSelect={selectOnMap} />
            <LoadChart trip={trip} units={units} onSelect={selectOnMap} />
          </details>
        </div>}

        {view === "map" && <div className="wrap view-content map-view">
          <div className="section-heading"><div><span className="eyebrow">FOLLOW THE ROAD</span><h1>The route, in context.</h1></div><button className="action" onClick={clearMap}>Show whole trip</button></div>
          <DayPicker trip={trip} day={day} onSelect={select} />
          <ActBar trip={trip} selected={activeSelection} onPick={select} />
          <Suspense fallback={<div className="map-loading" role="status">Loading the route map…</div>}><RouteMap trip={trip} units={units} selected={activeSelection} onSelect={select}
                    layers={layers} setLayers={setLayers} basemap={basemap} setBasemap={setBasemap}
                    dark={dark} wheelZoom={wheelZoom} setWheelZoom={setWheelZoom}
                    panel={panel} setPanel={setPanel}
                    panelWidth={panelWidth} setPanelWidth={setPanelWidth} tab={tab} setTab={setTab}
                    ghost={ghost} onClear={clearMap}
                    mapHeight={mapHeight} setMapHeight={setMapHeight}
                    onStep={step} onScrollTo={scrollToDay} /></Suspense>
          {activeSelection && <div className="map-day-link"><div><span className="eyebrow">DAY {day.num} · {day.date ? new Date(day.date).toLocaleDateString("en-GB", {day:"numeric",month:"short",timeZone:"UTC"}) : ""}</span><h2>{day.title}</h2><p>{day.sleep?.where ?? "Flight home"}</p></div><button className="action primary" onClick={() => openDaily(day.id)}>Read this day ↗</button></div>}
          <p className="hint">Tap a numbered pin to select a day. Pinch to zoom. Open a place pin for details.</p>
        </div>}

        {view === "flights" && <div className="view-content flights-view"><Flights trip={trip} /></div>}

        {view === "guide" && <div className="wrap view-content guide-view">
          <div className="section-heading"><div><span className="eyebrow">THE PRACTICAL SIDE</span><h1>The trip kit.</h1></div><button className="action" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button></div>
          <nav className="topic-nav" aria-label="Trip kit sections">{TOPICS.map(([id,label]) => <a key={id} href={`#guide/${id}`} className={topic === id ? "active" : ""} aria-current={topic === id ? "page" : undefined}>{label}</a>)}</nav>
          <label className="topic-select">Open section<select value={topic} onChange={e => navigate("guide", e.target.value)}>{TOPICS.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          {topic === "checklist" && <Checklist />}
          {topic === "food" && <FoodGuide trip={trip} />}
          {topic === "sleep" && <SleepSection trip={trip} sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} overrides={sleepOverrides} setOverrides={setSleepOverrides} />}
          {topic === "charging" && <Charging />}
          {topic === "risks" && <RiskSection />}
          {topic === "budget" && <Budget trip={trip} />}
          {topic === "options" && <Modules on={on} toggle={toggle} trip={trip} units={units} sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} onSelect={selectOnMap} onHover={setGhost} />}
        </div>}
      </main>
      <footer><div className="wrap"><span className="footer-brand">NW / 2026</span><p>Seattle → the Rockies → San Francisco<br /><span>Road distances from OSRM · Photos credited to their authors · Conditions checked August 2026</span></p><a href="#guide/risks">Check road conditions ↗</a></div></footer>
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

const normalizeDay = (value: unknown) => typeof value === "string" ? value : null;

function normalizeSleepOverrides(value: unknown): SleepOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, choice]) =>
    Object.hasOwn(CAR_NIGHTS, id) && (choice === "bed" || choice === "price")));
}
