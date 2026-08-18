import { useEffect, useMemo, useRef, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import poisRaw from "../data/pois.json";
import storesRaw from "../data/stores.json";
import photosRaw from "../data/photos.json";
import chargersRaw from "../data/chargers.json";
import { ROUTES, distLabel, downloadGpx, toGpx, difficulty } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { Charger, Photo, Poi, Units } from "../types";

const POIS = poisRaw as unknown as Poi[];
const CHARGERS = chargersRaw as unknown as Charger[];
const STORES = storesRaw as unknown as {
  id: string; name: string; lat: number; lon: number; city: string; street: string; km: number; key: boolean;
}[];
const PHOTOS = photosRaw as unknown as Record<string, Photo>;

const TAG_LABEL: Record<string, string> = {
  gf: "GF", df: "DF", meat: "unusual meat", oy: "oysters", ino: "In-N-Out"
};

/** Popup thumbnail. Kept small so opening a popup does not pull a 250 kB image. */
function Thumb({ k }: { k?: string }) {
  const ph = k ? PHOTOS[k] : undefined;
  if (!ph) return null;
  return <img className="pop-img" src={ph.url} alt={ph.alt} loading="lazy" decoding="async" />;
}

export type Layers = { sights: boolean; food: boolean; chargers: boolean; stores: boolean };
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

/** Opens the selected day's popup, so stepping with the arrows reads as a slideshow. */
function PopupOpener({ selected, refs }: {
  selected: string | null;
  refs: React.RefObject<Record<string, L.Marker | null>>;
}) {
  useEffect(() => {
    if (!selected) return;
    const m = refs.current?.[selected];
    if (m) setTimeout(() => m.openPopup(), 260);
  }, [selected, refs]);
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

export function RouteMap({ trip, units, selected, onSelect, layers, setLayers, basemap, setBasemap,
                          dark, mapHeight, setMapHeight, onStep }: {
  trip: Trip; units: Units; selected: string | null;
  onSelect: (id: string) => void;
  layers: Layers; setLayers: (l: Layers) => void;
  basemap: Basemap; setBasemap: (b: Basemap) => void;
  dark: boolean;
  mapHeight: number | null; setMapHeight: (h: number | null) => void;
  onStep: (delta: number) => void;
}) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const activeIds = new Set(trip.days.map((d) => d.id));
  const idx = selected ? trip.days.findIndex((d) => d.id === selected) : -1;
  const cur = idx >= 0 ? trip.days[idx] : null;
  const visiblePois = POIS.filter((p) => activeIds.has(p.day));
  const bm = BASEMAPS[basemap];

  // Height is dragged locally and only committed to storage on release, so a
  // drag does not write to localStorage on every pointer move.
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ y: number; h: number } | null>(null);
  const [liveH, setLiveH] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const height = liveH ?? mapHeight;

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const h = wrapRef.current?.getBoundingClientRect().height ?? 520;
    dragRef.current = { y: e.clientY, h };
    setLiveH(Math.round(h));
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const next = dragRef.current.h + (e.clientY - dragRef.current.y);
    setLiveH(Math.round(Math.max(260, Math.min(1800, next))));
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (liveH != null) setMapHeight(liveH);
    setLiveH(null);
  };

  const fillScreen = () => {
    if (height != null) { setMapHeight(null); setLiveH(null); }
    else setMapHeight(Math.round(window.innerHeight - 150));
  };

  const dl = () =>
    downloadGpx(
      "northwest-roadtrip-2026.gpx",
      toGpx("Northwest Roadtrip 2026", trip.days.map((d) => ({ id: d.id, title: `Day ${d.num} — ${d.title}` })))
    );

  return (
    <div className="card mapcard">
      <div className="mapwrap" ref={wrapRef} style={height != null ? { height } : undefined}>
        <MapContainer center={[45.5, -114]} zoom={5} scrollWheelZoom={false} className="leaflet-container">
          <TileLayer key={`${basemap}-${dark}`} url={bm.url(dark)} attribution={bm.attr} maxZoom={bm.max} />
          <Resizer />
          <Framer trip={trip} selected={selected} />
          <PopupOpener selected={selected} refs={markerRefs} />

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
                ref={(m) => { markerRefs.current[d.id] = m; }}
              >
                <Popup maxWidth={280} minWidth={240}>
                  <Thumb k={d.photos?.[0]} />
                  <b>Day {d.num} — {d.title}</b>
                  <div className="pm">{d.leg}</div>
                  <div className="pm">
                    {distLabel(d.meters ?? 0, units)} · {d.hours} h · {difficulty(d.meters ?? 0)}
                    {d.sleep && <> · {d.sleep.t === "car" ? "car night" : "bed"}</>}
                  </div>
                  <div className="pop-why">{d.why}</div>
                </Popup>
              </Marker>
            );
          })}

          {layers.sights && visiblePois.filter((p) => p.kind === "sight").map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={poiIcon("◎")}
                    eventHandlers={{ click: () => onSelect(p.day) }}>
              <Popup maxWidth={280} minWidth={240}>
                <Thumb k={p.photo} />
                <b>{p.name}</b>
                <div className="pm">{p.city}{p.approx ? " · approximate" : ""}</div>
                {p.desc && <div className="pop-why">{p.desc}</div>}
              </Popup>
            </Marker>
          ))}

          {layers.food && visiblePois.filter((p) => p.kind === "food").map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={poiIcon("🍽")}
                    eventHandlers={{ click: () => onSelect(p.day) }}>
              <Popup maxWidth={280} minWidth={240}>
                <b>{p.name}</b>
                <div className="pm">
                  {p.city}
                  {p.tags.map((t) => <span className={`tag ${t}`} key={t}>{TAG_LABEL[t]}</span>)}
                </div>
                {p.desc && <div className="pop-why">{p.desc}</div>}
              </Popup>
            </Marker>
          ))}

          {layers.stores && STORES.map((st) => (
            <CircleMarker key={st.id} center={[st.lat, st.lon]} radius={st.key ? 6 : 4}
                          pathOptions={{ className: st.key ? "wf-key" : "wf", weight: 1.5 }}>
              <Popup maxWidth={260}>
                <b>Whole Foods{st.city ? ` · ${st.city}` : ""}</b>
                <div className="pm">{st.street}</div>
                <div className="pm">{st.km} km off the route</div>
                <div className="pop-why">
                  {st.key
                    ? "The only one for 40 km in any direction — this is a restock stop worth planning around: gluten-free bread, dairy-free everything, and a hot bar you can eat from safely."
                    : "One of several nearby. Reliable for gluten-free and dairy-free restocking."}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {layers.chargers && CHARGERS.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lon]}
              radius={c.fast ? 5 : 3.5}
              pathOptions={{ className: c.fast ? "ch-fast" : "ch-slow", weight: 1.5 }}
            >
              <Popup>
                <b>{c.name}</b>
                <div className="pm">{c.city}{c.stalls ? ` · ${c.stalls} stalls` : ""}</div>
                <div className="pm">{c.fast ? "Supercharger" : "Destination / slow charger"}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div
        className={`grip${dragging ? " dragging" : ""}`}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => { setMapHeight(null); setLiveH(null); }}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Drag to resize the map, double-click to reset"
        title="Drag to resize · double-click to reset"
      />

      <div className="mapbar">
        <button className="pill" onClick={() => onStep(-1)} title="Previous day (←)">←</button>
        <span className="stepnow">
          {cur ? `Day ${cur.num} · ${cur.title}` : "Use ← → to walk the trip"}
        </span>
        <button className="pill" onClick={() => onStep(1)} title="Next day (→)">→</button>
        <span className="spacer" />
        <button className={`pill${layers.sights ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, sights: !layers.sights })}>◎ Sights</button>
        <button className={`pill${layers.food ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, food: !layers.food })}>🍽 Food</button>
        <button className={`pill${layers.chargers ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, chargers: !layers.chargers })}>
          ⚡ Superchargers{CHARGERS.length ? ` (${CHARGERS.filter((c) => c.fast).length})` : ""}
        </button>
        <button className={`pill${layers.stores ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, stores: !layers.stores })}
                title="Whole Foods — gluten-free and dairy-free restocking">
          🛒 Whole Foods ({STORES.length})
        </button>
        <div className="baseline" role="group" aria-label="Base map">
          {(["terrain", "streets", "satellite"] as Basemap[]).map((b) => (
            <button key={b} className={basemap === b ? "on" : ""} onClick={() => setBasemap(b)}>
              {b === "terrain" ? "Terrain" : b === "streets" ? "Streets" : "Satellite"}
            </button>
          ))}
        </div>
        <button className="pill" onClick={fillScreen}
                title={height != null ? "Back to the automatic height" : "Fill the screen height"}>
          {height != null ? "⤡ Auto" : "⤢ Taller"}
        </button>
        <button className="pill" onClick={dl} title="Download the whole route as GPX">↓ GPX</button>
      </div>
    </div>
  );
}
