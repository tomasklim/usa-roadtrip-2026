import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import poisRaw from "../data/pois.json";
import storesRaw from "../data/stores.json";
import photosRaw from "../data/photos.json";
import chargersRaw from "../data/chargers.json";
import { ROUTES, distLabel, downloadGpx, toGpx, difficulty } from "../lib/trip";
import type { Trip } from "../lib/trip";
import type { Charger, Photo, Poi, Units } from "../types";
import { DayPanel, OverviewPanel } from "./DayPanel";
import type { Lens } from "./DayList";

const POIS = poisRaw as unknown as Poi[];
const CHARGERS = chargersRaw as unknown as Charger[];
const STORES = storesRaw as unknown as {
  id: string; name: string; lat: number; lon: number; city: string; street: string; km: number; key: boolean;
}[];
const PHOTOS = photosRaw as unknown as Record<string, Photo>;

/** Which category a marker belongs to — drives its colour, glyph and label. */
type Cat = "sight" | "food" | "oyster" | "ino" | "charge" | "store" | "day";

const GLYPH: Record<Cat, string> = {
  sight: "◎", food: "🍽", oyster: "🦪", ino: "🍔", charge: "⚡", store: "🛒", day: "•"
};
const KIND_LABEL: Record<Cat, string> = {
  sight: "sight", food: "food", oyster: "oysters", ino: "In-N-Out",
  charge: "supercharger", store: "Whole Foods", day: "day"
};

function foodCat(tags: string[]): Cat {
  if (tags.includes("ino")) return "ino";
  if (tags.includes("oy")) return "oyster";
  return "food";
}

const dropIcon = (cat: Cat, small = false, extra = "") =>
  L.divIcon({
    className: "",
    html: `<div class="drop ${cat}${small ? " small" : ""}${extra ? " " + extra : ""}"><span>${GLYPH[cat]}</span></div>`,
    iconSize: small ? [21, 21] : [28, 28],
    iconAnchor: small ? [10, 21] : [14, 28],
    popupAnchor: [0, small ? -20 : -26]
  });

/**
 * MapHub-style card: the photograph is the content, the words sit underneath.
 */
function PopCard({ cat, title, sub, body, photoKey, onJump, jumpLabel }: {
  cat: Cat; title: string; sub?: string; body?: string;
  photoKey?: string; onJump?: () => void; jumpLabel?: string;
}) {
  const ph = photoKey ? PHOTOS[photoKey] : undefined;
  return (
    <div className="pop">
      {ph && <img className="pop-hero" src={ph.url} alt={ph.alt} loading="lazy" decoding="async" />}
      {ph && (
        <div className="pop-credit">
          Photo by <a href={ph.page} target="_blank" rel="noreferrer noopener">{ph.credit}</a>, {ph.license}
        </div>
      )}
      <div className="pop-body">
        <span className={`pop-kind ${cat}`}>{KIND_LABEL[cat]}</span>
        <b style={{ display: "block", fontFamily: "var(--serif)", fontSize: "1rem" }}>{title}</b>
        {sub && <div className="pm">{sub}</div>}
        {body && <div className="pop-why">{body}</div>}
        {onJump && (
          <button className="pop-btn" onClick={onJump}>{jumpLabel ?? "Open this day below ↓"}</button>
        )}
      </div>
    </div>
  );
}

/** Tracks the breakpoint reactively — a stale value leaves the panel the wrong width. */
function useIsWide(min = 860) {
  const [wide, setWide] = useState(() => typeof window === "undefined" || window.innerWidth > min);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min + 1}px)`);
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [min]);
  return wide;
}

/** Labels only make sense once the map is zoomed in enough not to be a mess. */
function useZoom(initial = 5) {
  const [z, setZ] = useState(initial);
  useMapEvent("zoomend", (e) => setZ(e.target.getZoom()));
  return z;
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

/**
 * Trackpad pinch arrives as a wheel event with ctrlKey set, which Leaflet does
 * not distinguish from a plain two-finger scroll. Handling it ourselves means
 * pinch zooms the map while ordinary scrolling still scrolls the page.
 */
function PinchZoom() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const pt = map.mouseEventToContainerPoint(e as unknown as MouseEvent);
      const at = map.containerPointToLatLng(pt);
      const next = map.getZoom() - e.deltaY * 0.012;
      const clamped = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), next));
      map.setZoomAround(at, clamped, { animate: false });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [map]);
  return null;
}

/** Lets the scroll-wheel-zoom preference be flipped without remounting the map. */
function WheelZoom({ on }: { on: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (on) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [map, on]);
  return null;
}

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

function Framer({ trip, selected, padRight }: {
  trip: Trip; selected: string | null; padRight: number;
}) {
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
    map.fitBounds(allBounds, { paddingTopLeft: [24, 24], paddingBottomRight: [padRight + 24, 24] });
  }, [map, allBounds, padRight]);

  useEffect(() => {
    if (!selected) return;
    const line = ROUTES[selected]?.line;
    if (line && line.length > 1) {
      map.flyToBounds(L.latLngBounds(line), {
        paddingTopLeft: [40, 40], paddingBottomRight: [padRight + 40, 40], duration: 0.7
      });
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

/** Sights and restaurants, with a name label once the map is zoomed in. */
function PoiLayer({ layers, pois, onOpenDay, dayLabel }: {
  layers: Layers; pois: Poi[];
  onOpenDay: (dayId: string) => void;
  dayLabel: (dayId: string) => string;
}) {
  const zoom = useZoom();
  const showLabels = zoom >= 8;
  return (
    <>
      {pois.map((p) => {
        const cat: Cat = p.kind === "sight" ? "sight" : foodCat(p.tags);
        if (cat === "sight" ? !layers.sights : !layers.food) return null;
        return (
          <Marker key={p.id} position={[p.lat, p.lon]} icon={dropIcon(cat)}>
            {showLabels
              ? <Tooltip permanent direction="right" offset={[10, -10]} className="maplbl">{p.name}</Tooltip>
              : <Tooltip direction="top" offset={[0, -24]} className="hovlbl">{p.name}</Tooltip>}
            <Popup maxWidth={280} minWidth={270}>
              <PopCard cat={cat} title={p.name}
                       sub={`${p.city}${p.approx ? " · approximate" : ""}`}
                       body={p.desc}
                       photoKey={p.photo}
                       onJump={() => onOpenDay(p.day)}
                       jumpLabel={`Open ${dayLabel(p.day)} →`} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function RouteMap({ trip, units, selected, onSelect, layers, setLayers, basemap, setBasemap,
                          dark, wheelZoom, setWheelZoom, panel, setPanel, panelWidth, setPanelWidth,
                          lens, onClear,
                          mapHeight, setMapHeight, onStep, onScrollTo }: {
  trip: Trip; units: Units; selected: string | null;
  onSelect: (id: string) => void;
  layers: Layers; setLayers: (l: Layers) => void;
  basemap: Basemap; setBasemap: (b: Basemap) => void;
  dark: boolean;
  wheelZoom: boolean; setWheelZoom: (v: boolean) => void;
  panel: boolean; setPanel: (v: boolean) => void;
  panelWidth: number; setPanelWidth: (w: number) => void;
  lens: Lens;
  onClear: () => void;
  mapHeight: number | null; setMapHeight: (h: number | null) => void;
  onStep: (delta: number) => void;
  onScrollTo: (dayId: string) => void;
}) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const wide = useIsWide();
  // The panel covers the right edge, so framing has to account for it.
  const panelPad = panel && wide ? panelWidth : 0;

  /** Opens a day: in the panel if it is on, otherwise by scrolling to its card. */
  const openDay = (dayId: string) => {
    onSelect(dayId);
    if (!panel) onScrollTo(dayId);
  };
  const dayLabel = (dayId: string) => {
    const d = trip.days.find((x) => x.id === dayId);
    return d ? `day ${d.num}` : "that day";
  };
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

  // Panel width drag, committed to storage only on release.
  const wdrag = useRef<{ x: number; w: number } | null>(null);
  const [wgrab, setWgrab] = useState(false);
  const startWidth = (e: React.PointerEvent<HTMLDivElement>) => {
    wdrag.current = { x: e.clientX, w: panelWidth };
    setWgrab(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onWidth = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wdrag.current) return;
    const next = wdrag.current.w - (e.clientX - wdrag.current.x);
    setPanelWidth(Math.round(Math.max(280, Math.min(window.innerWidth * 0.72, next))));
  };
  const endWidth = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wdrag.current) return;
    wdrag.current = null;
    setWgrab(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
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
      <div className={`mapwrap${panel ? " haspanel" : ""}`} ref={wrapRef}
           style={height != null ? { height } : undefined}>
        <MapContainer center={[45.5, -114]} zoom={5} scrollWheelZoom={false} zoomSnap={0.25}
                      zoomDelta={0.5} wheelPxPerZoomLevel={90} keyboard={false}
                      className="leaflet-container">
          <TileLayer key={`${basemap}-${dark}`} url={bm.url(dark)} attribution={bm.attr} maxZoom={bm.max} />
          <Resizer />
          <PinchZoom />
          <WheelZoom on={wheelZoom} />
          <Framer trip={trip} selected={selected} padRight={panelPad} />
          {!panel && <PopupOpener selected={selected} refs={markerRefs} />}

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
                zIndexOffset={selected === d.id ? 1000 : 500}
                eventHandlers={{ click: () => onSelect(d.id) }}
                ref={(m) => { markerRefs.current[d.id] = m; }}
              >
                <Tooltip direction="top" offset={[0, -14]} className="hovlbl">
                  Day {d.num} · {d.title}
                </Tooltip>
                {!panel && (
                  <Popup maxWidth={280} minWidth={270} autoPan>
                    <PopCard
                      cat="day"
                      title={`Day ${d.num} — ${d.title}`}
                      sub={`${d.leg} · ${distLabel(d.meters ?? 0, units)} · ${d.hours} h · ${difficulty(d.meters ?? 0)}`}
                      body={d.why}
                      photoKey={d.photos?.[0]}
                      onJump={() => onScrollTo(d.id)}
                      jumpLabel={`Open day ${d.num} below ↓`}
                    />
                  </Popup>
                )}
              </Marker>
            );
          })}

          <PoiLayer layers={layers} pois={visiblePois} onOpenDay={openDay} dayLabel={dayLabel} />

          {layers.chargers && CHARGERS.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lon]}
                    icon={dropIcon("charge", true, c.fast ? "" : "slow")}>
              <Tooltip direction="top" offset={[0, -18]} className="hovlbl">
                {c.name}{c.stalls ? ` · ${c.stalls} stalls` : ""}
              </Tooltip>
              <Popup maxWidth={280} minWidth={270}>
                <PopCard cat="charge" title={c.name}
                         sub={`${c.city || "Supercharger"}${c.stalls ? ` · ${c.stalls} stalls` : ""}`}
                         body={c.fast ? "Tesla Supercharger — a full stop of 20-30 minutes gets you most of a battery."
                                      : "Destination or slow charger. Useful overnight, not for a top-up on the move."} />
              </Popup>
            </Marker>
          ))}

          {layers.stores && STORES.map((st) => (
            <Marker key={st.id} position={[st.lat, st.lon]} icon={dropIcon("store", !st.key)}>
              <Tooltip direction="top" offset={[0, -18]} className="hovlbl">
                Whole Foods{st.city ? ` · ${st.city}` : ""}
              </Tooltip>
              <Popup maxWidth={280} minWidth={270}>
                <PopCard cat="store" title={`Whole Foods${st.city ? ` · ${st.city}` : ""}`}
                         sub={`${st.street} · ${st.km} km off the route`}
                         body={st.key
                           ? "The only one for 40 km in any direction — a restock stop worth planning around: gluten-free bread, dairy-free everything, and a hot bar you can eat from safely."
                           : "One of several nearby. Reliable for gluten-free and dairy-free restocking."} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {panel && (cur
          ? <DayPanel day={cur} units={units} lens={lens} count={trip.days.length}
                      width={wide ? panelWidth : undefined as unknown as number}
                      onClose={onClear} onStep={onStep} onScrollTo={onScrollTo} />
          : <OverviewPanel trip={trip} units={units}
                           width={wide ? panelWidth : undefined as unknown as number}
                           onStart={() => onSelect(trip.days[0].id)}
                           onClose={() => setPanel(false)} />)}
        {panel && wide && (
          <div
            className={`detail-grip${wgrab ? " dragging" : ""}`}
            style={{ right: panelWidth }}
            onPointerDown={startWidth}
            onPointerMove={onWidth}
            onPointerUp={endWidth}
            onPointerCancel={endWidth}
            onDoubleClick={() => setPanelWidth(400)}
            role="separator"
            aria-orientation="vertical"
            aria-label="Drag to resize the day panel, double-click to reset"
            title="Drag to resize · double-click to reset"
          />
        )}
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
                onClick={() => setLayers({ ...layers, sights: !layers.sights })}>
          <i style={{ background: "var(--sky)" }} />Sights
        </button>
        <button className={`pill${layers.food ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, food: !layers.food })}>
          <i style={{ background: "var(--rust)" }} />Food 🦪 🍔
        </button>
        <button className={`pill${layers.chargers ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, chargers: !layers.chargers })}>
          <i style={{ background: "var(--pine)" }} />
          Superchargers{CHARGERS.length ? ` (${CHARGERS.filter((c) => c.fast).length})` : ""}
        </button>
        <button className={`pill${layers.stores ? " on" : ""}`}
                onClick={() => setLayers({ ...layers, stores: !layers.stores })}
                title="Whole Foods — gluten-free and dairy-free restocking">
          <i style={{ background: "var(--teal)" }} />Whole Foods ({STORES.length})
        </button>
        <div className="baseline" role="group" aria-label="Base map">
          {(["terrain", "streets", "satellite"] as Basemap[]).map((b) => (
            <button key={b} className={basemap === b ? "on" : ""} onClick={() => setBasemap(b)}>
              {b === "terrain" ? "Terrain" : b === "streets" ? "Streets" : "Satellite"}
            </button>
          ))}
        </div>
        <button className={`pill${panel ? " on" : ""}`} onClick={() => setPanel(!panel)}
                title="Show the selected day in a panel over the map instead of scrolling to it">
          ▤ Day panel
        </button>
        <button className={`pill${wheelZoom ? " on" : ""}`} onClick={() => setWheelZoom(!wheelZoom)}
                title={wheelZoom
                  ? "Scroll wheel zooms the map — click to give scrolling back to the page"
                  : "Pinch already zooms; click to let a plain scroll zoom too"}>
          {wheelZoom ? "⊙ scroll zooms map" : "⊙ scroll zoom off"}
        </button>
        <button className="pill" onClick={fillScreen}
                title={height != null ? "Back to the automatic height" : "Fill the screen height"}>
          {height != null ? "⤡ Auto" : "⤢ Taller"}
        </button>
        <button className="pill" onClick={dl} title="Download the whole route as GPX">↓ GPX</button>
      </div>
    </div>
  );
}
