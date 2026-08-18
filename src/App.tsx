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
import type { Units } from "./types";

export default function App() {
  const [mods, setMods] = useStored<string[]>("mods", []);
  const [units, setUnits] = useStored<Units>("units", "mi");
  const [theme, setTheme] = useStored<string | null>("theme", null);
  const [lens, setLens] = useStored<Lens>("lens", "all");
  const [basemap, setBasemap] = useStored<Basemap>("basemap", "terrain");
  const [layers, setLayers] = useStored<Layers>("layers", { sights: true, food: false, chargers: false });
  const [mapHeight, setMapHeight] = useStored<number | null>("mapHeight", null);
  const [selected, setSelected] = useState<string | null>(null);

  const on = useMemo(() => new Set(Array.isArray(mods) ? mods : []), [mods]);
  const trip = useMemo(() => buildTrip(on), [on]);

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

  const select = useCallback((id: string) => {
    setSelected(id);
    const el = document.getElementById(`day-${id}`);
    if (el && window.matchMedia("(min-width: 1080px)").matches) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <Header units={units} setUnits={setUnits} theme={theme} setTheme={setTheme} />
      <Hero trip={trip} units={units} />
      <Flights />

      <section id="plan">
        <div className="wrap">
          <div className="shead"><span className="num">02</span><h2>The route, day by day</h2></div>
          <p className="sub">
            The map is live: pan it, switch the base layer, turn on sights, food and Superchargers, and
            click any numbered pin or route line to pull up that day. Every line is real road geometry,
            so the distances are measured rather than guessed — and each day exports as GPX for the car.
          </p>
          <div className="planner">
            <div className="side">
              <RouteMap trip={trip} units={units} selected={selected} onSelect={select}
                        layers={layers} setLayers={setLayers} basemap={basemap} setBasemap={setBasemap}
                        dark={dark} mapHeight={mapHeight} setMapHeight={setMapHeight} />
              <Modules on={on} toggle={toggle} trip={trip} units={units} />
              <LensBar lens={lens} setLens={setLens} />
            </div>
            <DayList trip={trip} units={units} selected={selected} onSelect={select} lens={lens} />
          </div>
        </div>
      </section>

      <Glance trip={trip} units={units} onSelect={select} />
      <LoadChart trip={trip} units={units} onSelect={select} />
      <Charging />
      <FoodGuide trip={trip} />
      <SleepSection />
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
