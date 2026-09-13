import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { MontanaChoices } from "./components/MontanaChoices";
import { SeattleChoices } from "./components/SeattleChoices";
import { DEFAULT_SEATTLE, normalizeSeattle, type SeattleOptions } from "./data/seattle";
import { Header } from "./components/Header";
import { Chapters, QuickLinks, TripBar } from "./components/TripBar";
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
import { useSharedStored, useSharedStatus } from "./lib/sharedTrip";
import { useStored } from "./lib/useStored";
import { PhotoCredits } from "./components/PhotoCredits";
import { DailyPlan } from "./components/DailyPlan";
import { navigate, TOPICS, todayInTrip, useNavigation } from "./lib/navigation";
import { downloadOfflinePlan } from "./lib/offline";
import type { SleepOverrides, SleepStyle, Units } from "./types";
import type { Tab } from "./components/DayPanel";

const RouteMap = lazy(() => import("./components/RouteMap").then(module => ({ default: module.RouteMap })));

export default function App() {
  const shared = useSharedStatus();
  const [seattle, setSeattle] = useSharedStored<SeattleOptions>("seattlePlan", DEFAULT_SEATTLE, normalizeSeattle);
  const [mods, setMods] = useSharedStored<string[]>("mods", [], normalizeMods);
  const [units, setUnits] = useStored<Units>("units", "mi", NORMALIZE_UNITS);
  const [theme, setTheme] = useStored<string | null>("theme", null, NORMALIZE_THEME);
  const [tab, setTab] = useStored<Tab>("tab", "plan", NORMALIZE_TAB);
  const [basemap, setBasemap] = useStored<Basemap>("basemap", "terrain", NORMALIZE_BASEMAP);
  const [layers, setLayers] = useStored<Layers>("layers2", DEFAULT_LAYERS, normalizeLayers);
  const [wheelZoom, setWheelZoom] = useStored<boolean>("wheelZoom", false, NORMALIZE_FALSE);
  const [sleepStyle, setSleepStyle] = useSharedStored<SleepStyle>("sleepStyle", "balanced", NORMALIZE_SLEEP);
  const [sleepOverrides, setSleepOverrides] = useSharedStored<SleepOverrides>("sleepOverrides", {}, normalizeSleepOverrides);
  const [selected, setSelected] = useStored<string | null>("selectedDay", null, normalizeDay);
  const route = useNavigation();
  const { view, topic } = route;
  const [ghost, setGhost] = useState<string | null>(null);

  const on = useMemo(() => new Set(Array.isArray(mods) ? mods : []), [mods]);
  const trip = useMemo(() => buildTrip(on, sleepStyle, sleepOverrides, seattle), [on, sleepStyle, sleepOverrides, seattle]);
  const routeDay = trip.days.find(d => d.id === route.day);
  const day = routeDay ?? trip.days.find(d => d.id === selected) ?? todayInTrip(trip) ?? trip.days[0];

  const [bringDayIntoView, setBringDayIntoView] = useState(false);
  useLayoutEffect(() => {
    if (!bringDayIntoView || view !== "itinerary") return;
    document.querySelector(".day-picker")?.scrollIntoView({ block: "start", behavior: "instant" });
    setBringDayIntoView(false);
  }, [bringDayIntoView, view, day.id]);

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
    openDaily(id);
    setBringDayIntoView(true);
  }, [openDaily]);

  /** Keep keyboard navigation, saved selection and the shareable URL together. */
  const step = useCallback((delta: number) => {
    const index = trip.days.findIndex(d => d.id === day.id);
    const next = trip.days[Math.max(0, Math.min(trip.days.length - 1, index + delta))];
    openDaily(next.id);
  }, [trip.days, day.id, openDaily]);

  // Links and buttons keep focus after a click; they must not disable day shortcuts.
  // Leave arrow keys to text fields and widgets that use them for their own value.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || view !== "itinerary") return;
      const t = e.target instanceof Element ? e.target : null;
      if ((t instanceof HTMLElement && t.isContentEditable) || t?.closest(
        'input, textarea, select, [role="textbox"], [role="combobox"], [role="listbox"], [role="slider"], [role="spinbutton"], [role="menu"], [role="menubar"], [role="tree"], [role="grid"], [role="radiogroup"], [role="tablist"], .leaflet-container'
      )) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, view]);

  const renderMap = (selection: string | null) => <Suspense fallback={<div className="card mapcard embedded-map"><div className="mapwrap map-loading" role="status">Loading the route map…</div><div className="map-loading-tools">Map layers & tools</div></div>}>
    <RouteMap embedded trip={trip} units={units} selected={selection} onSelect={openDaily}
      layers={layers} setLayers={setLayers} basemap={basemap} setBasemap={setBasemap}
      dark={dark} wheelZoom={wheelZoom} setWheelZoom={setWheelZoom}
      panel={false} setPanel={NOOP} panelWidth={400} setPanelWidth={NOOP} tab={tab} setTab={setTab}
      ghost={ghost} onClear={NOOP} mapHeight={null} setMapHeight={NOOP}
      onStep={step} onScrollTo={selectOnMap} />
  </Suspense>;

  const seattleChoices = <SeattleChoices trip={trip} onChange={setSeattle} extended={on.has("olympic")} />;
  const changeMontana = (rainy: boolean) => {
    if (rainy === on.has("montanaRain")) return;
    toggle("montanaRain");
    const pairs = [["s6", "rainLamar"], ["s7", "rainTransfer"], ["s8", "rainRest"]];
    const pair = pairs.find(p => p.includes(day.id));
    if (pair && view === "itinerary") openDaily(pair[rainy ? 1 : 0]);
  };
  const montanaChoices = <MontanaChoices trip={trip} rainy={on.has("montanaRain")} onChange={changeMontana} />;

  return (
    <>
      <Header units={units} setUnits={setUnits} theme={theme} setTheme={setTheme} view={view} />
      <main id="main" tabIndex={-1}>
        {shared.connected && <div className="wrap shared-indicator"><a href="#guide/checklist">Shared trip · {shared.pending ? `${shared.pending} changes waiting to sync` : shared.status}</a></div>}
        {view === "overview" && <>
          <TripBar trip={trip} units={units} onContinue={() => openDaily(day.id)} dayTitle={`Day ${day.num} · ${day.title}`} />
          <div className="wrap overview-body">
            <QuickLinks />
            {seattleChoices}{montanaChoices}
            <section id="trip-map" className="overview-map" aria-label="Whole trip map">
              <div className="section-heading"><div><span className="eyebrow">SEATTLE → THE ROCKIES → SAN FRANCISCO</span><h2>The whole trip.</h2></div><a className="text-action" href="#plan">Itinerary & distances ↗</a></div>
              {renderMap(null)}
              <p className="hint map-reading-hint">Tap a numbered pin to open that day’s plan.</p>
            </section>
            <div className="section-heading"><div><span className="eyebrow">THREE CHAPTERS, ONE GOOD TRIP</span><h2>From the mountains to the Pacific.</h2></div><a className="text-action" href="#plan">All {trip.days.length} days ↗</a></div>
            <Chapters trip={trip} onPick={openDaily} />
            <div className="travel-note">
              <div><span className="eyebrow">KEEP IT WITH YOU</span><h2>A plan for the road.</h2>
                <p>Download the daily itinerary and flights before heading out of signal.</p>
                <p className="hint">Maps, photos and live conditions still need a connection.</p></div>
              <button className="action primary" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button>
            </div>
          </div>
        </>}

        {view === "itinerary" && <div className="wrap view-content itinerary-view">
          <div className="section-heading"><div><span className="eyebrow">THE ROUTE & YOUR DAILY PLAN</span><h1>Your daily field notes.</h1></div>
            <button className="action" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button></div>
          {trip.overrun > 0 && <p className="warn" role="alert">The selected route is {trip.overrun} days too long for the booked flights. <a href="#guide/options">Adjust route options</a>.</p>}
          <DailyPlan trip={trip} day={day} units={units} tab={tab} setTab={setTab} onSelect={openDaily}
            choices={<>
              {(day.act === "I" || day.id === "seaReturn") && seattleChoices}
              {["s6", "s7", "s8", "rainLamar", "rainTransfer", "rainRest"].includes(day.id) && montanaChoices}
            </>}
            map={renderMap(day.id)} />
        </div>}

        {view === "plan" && <div className="wrap view-content trip-plan-view">
          <div className="section-heading"><div><span className="eyebrow">ALL {trip.days.length} DAYS, TOGETHER</span><h1>The complete trip.</h1></div>
            <button className="action" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button></div>
          {seattleChoices}{montanaChoices}
          <nav className="topic-nav" aria-label="Trip plan sections">
            <a href="#plan" className={route.planSection === "itinerary" ? "active" : ""} aria-current={route.planSection === "itinerary" ? "page" : undefined}>Complete itinerary</a>
            <a href="#plan/distances" className={route.planSection === "distances" ? "active" : ""} aria-current={route.planSection === "distances" ? "page" : undefined}>Distances & driving</a>
          </nav>
          {trip.overrun > 0 && <p className="warn" role="alert">The selected route is {trip.overrun} days too long for the booked flights. <a href="#guide/options">Adjust route options</a>.</p>}
          {route.planSection === "itinerary"
            ? <DayList trip={trip} units={units} selected={day.id} onSelect={selectOnMap} />
            : <><Glance trip={trip} units={units} onSelect={selectOnMap} /><LoadChart trip={trip} units={units} onSelect={selectOnMap} /></>}
        </div>}

        {view === "flights" && <div className="view-content flights-view"><Flights trip={trip} /></div>}

        {view === "guide" && <div className="wrap view-content guide-view">
          <div className="section-heading"><div><span className="eyebrow">THE PRACTICAL SIDE</span><h1>The trip kit.</h1></div><button className="action" onClick={() => downloadOfflinePlan(trip, units)}>↓ Save offline copy</button></div>
          <nav className="topic-nav" aria-label="Trip kit sections">{TOPICS.map(([id,label]) => <a key={id} href={`#guide/${id}`} className={topic === id ? "active" : ""} aria-current={topic === id ? "page" : undefined}>{label}</a>)}</nav>
          <label className="topic-select">Open section<select value={topic} onChange={e => navigate("guide", e.target.value)}>{TOPICS.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          {topic === "checklist" && <Checklist trip={trip} />}
          {topic === "food" && <FoodGuide trip={trip} />}
          {topic === "sleep" && <SleepSection trip={trip} sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} overrides={sleepOverrides} setOverrides={setSleepOverrides} />}
          {topic === "charging" && <Charging />}
          {topic === "risks" && <RiskSection />}
          {topic === "budget" && <Budget trip={trip} />}
          {topic === "options" && <>{seattleChoices}{montanaChoices}<Modules seattle={seattle} on={on} toggle={toggle} trip={trip} units={units} sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} onSelect={selectOnMap} onHover={setGhost} /></>}
        </div>}
        {view === "credits" && <PhotoCredits />}
      </main>
      <footer><div className="wrap"><span className="footer-brand">NW / 2026</span><p>Seattle → the Rockies → San Francisco<br /><span>Road distances from OSRM · Conditions checked August 2026</span></p><nav className="footer-links" aria-label="Site information"><a href="#credits">Photo credits</a><a href="#guide/risks">Check road conditions ↗</a></nav></div></footer>
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
const NOOP = () => {};

const normalizeDay = (value: unknown) => typeof value === "string" ? value : null;

function normalizeSleepOverrides(value: unknown): SleepOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, choice]) =>
    Object.hasOwn(CAR_NIGHTS, id) && (choice === "bed" || choice === "price")));
}
