import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Flights } from "./components/Flights";
import { Modules } from "./components/Modules";
import { RouteMap, type Basemap, type Layers } from "./components/RouteMap";
import { DayList, type Lens } from "./components/DayList";
import { Charging, Glance, LensBar, LoadChart, RiskSection, SleepSection } from "./components/Panels";
import { FoodGuide } from "./components/FoodGuide";
import { Budget } from "./components/Budget";
import { Checklist } from "./components/Checklist";
import { buildTrip } from "./lib/trip";
import { useStored } from "./lib/useStored";
import type { SleepStyle, Units } from "./types";

export default function App() {
  const [mods, setMods] = useStored<string[]>("mods", []);
  const [units, setUnits] = useStored<Units>("units", "mi");
  const [theme, setTheme] = useStored<string | null>("theme", null);
  const [lens, setLens] = useStored<Lens>("lens", "all");
  const [basemap, setBasemap] = useStored<Basemap>("basemap", "terrain");
  const [layers, setLayers] = useStored<Layers>("layers2", { sights: true, food: true, chargers: false, stores: false });
  const [mapHeight, setMapHeight] = useStored<number | null>("mapHeight", null);
  const [wheelZoom, setWheelZoom] = useStored<boolean>("wheelZoom", false);
  const [panel, setPanel] = useStored<boolean>("panel", true);
  const [panelWidth, setPanelWidth] = useStored<number>("panelWidth", 400);
  const [showList, setShowList] = useStored<boolean>("showList", false);
  const [sleepStyle, setSleepStyle] = useStored<SleepStyle>("sleepStyle", "balanced");
  const [selected, setSelected] = useState<string | null>(null);

  const on = useMemo(() => new Set(Array.isArray(mods) ? mods : []), [mods]);
  const trip = useMemo(() => buildTrip(on, sleepStyle), [on, sleepStyle]);

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
        // Modules that rewrite the same base days cannot both be on.
        const mod = MODULE_CONFLICTS[id];
        mod?.forEach((c) => next.delete(c));
        Object.entries(MODULE_CONFLICTS).forEach(([k, v]) => { if (v.includes(id)) next.delete(k); });
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
      <Hero trip={trip} units={units} />
      <Flights />

      <section id="plan">
        <div className="wrap">
          <div className="shead"><span className="num">02</span><h2>The route, day by day</h2></div>
          <p className="sub">
            Everything is on the map: the panel on the right explains the trip and then becomes the
            day you have selected. Distances are measured on real road geometry, not estimated.
          </p>

          <RouteMap trip={trip} units={units} selected={selected} onSelect={select}
                    layers={layers} setLayers={setLayers} basemap={basemap} setBasemap={setBasemap}
                    dark={dark} wheelZoom={wheelZoom} setWheelZoom={setWheelZoom}
                    panel={panel} setPanel={setPanel}
                    panelWidth={panelWidth} setPanelWidth={setPanelWidth} lens={lens}
                    onClear={() => setSelected(null)}
                    mapHeight={mapHeight} setMapHeight={setMapHeight}
                    onStep={step} onScrollTo={scrollToDay} />

          <div className="controls">
            <Modules on={on} toggle={toggle} trip={trip} units={units}
                     sleepStyle={sleepStyle} setSleepStyle={setSleepStyle} onSelect={select} />
            <LensBar lens={lens} setLens={setLens} />
          </div>

          <button className="listtoggle" onClick={() => setShowList(!showList)}>
            {showList
              ? "▴  Hide the written itinerary"
              : `▾  Read the whole itinerary as text — all ${trip.days.length} days`}
          </button>
          {showList && (
            <DayList trip={trip} units={units} selected={selected} onSelect={select} lens={lens} />
          )}
        </div>
      </section>

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

const MODULE_CONFLICTS: Record<string, string[]> = {
  alvord: ["craters", "bend"]
};
