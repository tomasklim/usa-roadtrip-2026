import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import poisRaw from "../data/pois.json";
import chargersRaw from "../data/chargers.json";
import { ROUTES, distLabel, downloadGpx, toGpx, difficulty } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { Charger, Poi, Units } from "../types";

const POIS = poisRaw as unknown as Poi[];
const CHARGERS = chargersRaw as unknown as Charger[];

export type Layers = { sights: boolean; food: boolean; chargers: boolean };
export type Basemap = "terrain" | "streets" | "satellite";

const BASEMAPS: Record<Basemap, { url: (dark: boolean) => string; attr: string; max: number }> = {
  terrain: {
    url: () => "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: '© <a href="https://openstreetmap.org">OSM</a>, SRTM | © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    max: 16
  },
  streets: {
    url: (dark) => `https://{s}.basemaps.cartocdn.com/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`,
    attr: '© <a href="https://openstreetmap.org">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
    max: 19
  },
  satellite: {
    url: () => "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Imagery © Esri, Maxar, Earthstar Geographics",
    max: 18
  }
};

/** Keeps Leaflet in step with a container that changes size (sticky column, theme swap). */
function Resizer() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

function Framer({ trip, selected }: { trip: Trip; selected: string | null }) {
  const map = useMap();
  const didInit = useRef(false);

  const allBounds = useMemo(() => {
    const pts: [number, number][] = [];
    trip.days.forEach((d) => ROUTES[d.id]?.line?.forEach((p) => pts.push(p)));
    return pts.length ? L.latLngBounds(pts) : null;
  }, [trip.days]);

  useEffect(() => {
    if (didInit.current || !allBounds) return;
    didInit.current = true;
    map.fitBounds(allBounds, { padding: [24, 24] });
  }, [map, allBounds]);

  useEffect(() => {
    if (!selected) return;
    const line = ROUTES[selected]?.line;
    if (line && line.length > 1) {
      map.flyToBounds(L.latLngBounds(line), { padding: [40, 40], duration: 0.7 });
    } else {
      // Non-driving day: centre on the previous leg's end point if there is one.
      const idx = trip.days.findIndex((d) => d.id === selected);
      for (let i = idx; i >= 0; i--) {
        const prev = ROUTES[trip.days[i].id]?.line;
        if (prev?.length) { map.flyTo(prev[prev.length - 1], 9, { duration: 0.7 }); return; }
      }
    }
  }, [map, selected, trip.days]);

  return null;
}

const dayIcon = (label: string, isMod: boolean, sel: boolean) =>
  L.divIcon({
    className: "",
    html: `<div class="daypin${isMod ? " mod" : ""}${sel ? " sel" : ""}" style="width:26px;height:26px;font-size:11px">${label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

const poiIcon = (glyph: string) =>
  L.divIcon({
    className: "",
    html: `<div class="poipin" style="width:20px;height:20px">${glyph}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

export function RouteMap({ trip, units, selected, onSelect, layers, setLayers, basemap, setBasemap, dark }: {
  trip: Trip; units: Units; selected: string | null;
  onSelect: (id: string) => void;
  layers: Layers; setLayers: (l: Layers) => void;
  basemap: Basemap; setBasemap: (b: Basemap) => void;
  dark: boolean;
}) {
  const activeIds = new Set(trip.days.map((d) => d.id));
  const visiblePois = POIS.filter((p) => activeIds.has(p.day));
  const bm = BASEMAPS[basemap];

  const dl = () =>
    downloadGpx(
      "northwest-roadtrip-2026.gpx",
      toGpx("Northwest Roadtrip 2026", trip.days.map((d) => ({ id: d.id, title: `Day ${d.num} — ${d.title}` })))
    );

  return (
    <div className="card mapcard">
      <div className="mapwrap">
        <MapContainer center={[45.5, -114]} zoom={5} scrollWheelZoom={false} className="leaflet-container">
          <TileLayer key={`${basemap}-${dark}`} url={bm.url(dark)} attribution={bm.attr} maxZoom={bm.max} />
          <Resizer />
          <Framer trip={trip} selected={selected} />

          {trip.days.map((d) => {
            const line = ROUTES[d.id]?.line;
            if (!line || line.length < 2) return null;
            const isSel = selected === d.id;
            return (
              <Polyline
                key={d.id}
                positions={line}
                pathOptions={{
                  // Colour comes from CSS, not the stroke attribute: SVG
                  // presentation attributes do not accept var().
                  className: d.isMod ? "rt-mod" : "rt-base",
                  weight: isSel ? 6 : 3.2,
                  opacity: selected && !isSel ? 0.42 : 0.95,
                  dashArray: d.isMod ? "9 5" : undefined
                }}
                eventHandlers={{ click: () => onSelect(d.id) }}
              />
            );
          })}

          {trip.days.map((d) => {
            const line = ROUTES[d.id]?.line;
            if (!line?.length) return null;
            const at = line[line.length - 1];
            return (
              <Marker
                key={`pin-${d.id}`}
                position={at}
                icon={dayIcon(String(d.num), !!d.isMod, selected === d.id)}
                zIndexOffset={selected === d.id ? 1000 : 0}
                eventHandlers={{ click: () => onSelect(d.id) }}
              >
                <Popup>
                  <b>Day {d.num} — {d.title}</b>
                  <div className="pm">{d.leg}</div>
                  <div className="pm">
                    {distLabel(d.meters ?? 0, units)} · {d.hours} h · {difficulty(d.meters ?? 0)}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {layers.sights && visiblePois.filter((p) => p.kind === "sight").map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={poiIcon("◎")}>
              <Popup><b>{p.name}</b><div className="pm">{p.city}</div></Popup>
            </Marker>
          ))}

          {layers.food && visiblePois.filter((p) => p.kind === "food").map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={poiIcon("🍽")}>
              <Popup><b>{p.name}</b><div className="pm">{p.city}</div></Popup>
            </Marker>
          ))}

          {layers.chargers && CHARGERS.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lon]} icon={poiIcon(c.fast ? "⚡" : "🔌")}>
              <Popup>
                <b>{c.name}</b>
                <div className="pm">{c.city}{c.stalls ? ` · ${c.stalls} stalls` : ""}</div>
                <div className="pm">{c.fast ? "Supercharger" : "Slow / destination charger"}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mapbar">
        <button className={`pill${layers.sights ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, sights: !layers.sights })}>◎ Sights</button>
        <button className={`pill${layers.food ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, food: !layers.food })}>🍽 Food</button>
        <button className={`pill${layers.chargers ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, chargers: !layers.chargers })}>
          ⚡ Chargers{CHARGERS.length ? ` (${CHARGERS.length})` : ""}
        </button>
        <span className="spacer" />
        <div className="baseline" role="group" aria-label="Base map">
          {(["terrain", "streets", "satellite"] as Basemap[]).map((b) => (
            <button key={b} className={basemap === b ? "on" : ""} onClick={() => setBasemap(b)}>
              {b === "terrain" ? "Terrain" : b === "streets" ? "Streets" : "Satellite"}
            </button>
          ))}
        </div>
        <button className="pill" onClick={dl} title="Download the whole route as GPX">↓ GPX</button>
      </div>
    </div>
  );
}
