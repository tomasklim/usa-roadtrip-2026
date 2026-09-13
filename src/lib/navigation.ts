import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Day } from "../types";
import type { Trip } from "./trip";

export type View = "overview" | "itinerary" | "plan" | "flights" | "guide";
export const TOPICS = [
  ["checklist", "Before you go"], ["food", "Food"], ["sleep", "Sleep"],
  ["charging", "Charging"], ["risks", "Road conditions"], ["budget", "Budget"], ["options", "Route options"]
] as const;
export type Topic = typeof TOPICS[number][0];
const topicIds = new Set<string>(TOPICS.map(([id]) => id));

export function readRoute() {
  const [id, detail] = window.location.hash.slice(1).split("/");
  let view: View = "overview";
  let topic: Topic = "checklist";
  if (["overview", "itinerary", "plan", "flights", "guide"].includes(id)) view = id as View;
  // Old whole-map links now open the introduction; day links still open that day.
  if (id === "map") view = detail && detail !== "all" ? "itinerary" : "overview";
  if (id === "itinerary" && detail === "all") view = "overview";
  if (id === "glance" || id === "load") view = "plan";
  if (topicIds.has(id)) { view = "guide"; topic = id as Topic; }
  if (id === "guide" && topicIds.has(detail)) topic = detail as Topic;
  return { view, topic,
    day: view === "itinerary" ? detail : undefined,
    planSection: detail === "distances" || id === "glance" || id === "load" ? "distances" : "itinerary"
  };
}

type Route = ReturnType<typeof readRoute>;
type Position = { x: number; y: number };
const ROUTE_EVENT = "nwrt26:navigate";
const position = (): Position => ({ x: window.scrollX, y: window.scrollY });
const pageRoutes = new Set(["overview", "itinerary", "map", "flights", "guide", "plan", "glance", "load", ...topicIds]);

export function keepScroll(from: Route, to: Route) {
  return from.view === to.view && (to.view !== "guide" || from.topic === to.topic) && (to.view !== "plan" || from.planSection === to.planSection);
}

function entryKey() {
  if (!window.history.state?.roadtripEntry) {
    window.history.replaceState({ ...window.history.state, roadtripEntry: crypto.randomUUID() }, "");
  }
  return window.history.state.roadtripEntry as string;
}

function go(hash: string) {
  if (window.location.hash === hash) return;
  window.history.replaceState({ ...window.history.state, roadtripScroll: position() }, "");
  window.history.pushState({ roadtripEntry: crypto.randomUUID() }, "", hash);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

/** Route changes own scrolling; hash anchors and browser restoration must not compete. */
export function useNavigation() {
  const [state, setState] = useState(() => ({ route: readRoute(), key: entryKey(), scroll: position() }));
  const current = useRef({ route: state.route, key: state.key, hash: window.location.hash });
  const positions = useRef(new Map<string, Position>());

  useLayoutEffect(() => {
    window.scrollTo({ left: state.scroll.x, top: state.scroll.y, behavior: "instant" });
    positions.current.set(state.key, position());
  }, [state]);

  useEffect(() => {
    const restoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const remember = () => positions.current.set(current.current.key, position());
    const update = (event: Event) => {
      const hash = window.location.hash;
      if (hash === "#main") return;
      let key = entryKey();
      const prev = current.current;
      if (hash === prev.hash && key === prev.key) return; // popstate also emits hashchange
      const before = positions.current.get(prev.key) ?? position();
      if (key === prev.key) { // A pasted hash creates a new history entry too.
        key = crypto.randomUUID();
        window.history.replaceState({ ...window.history.state, roadtripEntry: key }, "");
      }
      const route = readRoute();
      const scroll = event.type === "popstate"
        ? positions.current.get(key) ?? window.history.state?.roadtripScroll ?? { x: 0, y: 0 }
        : keepScroll(prev.route, route) ? before : { x: 0, y: 0 };
      current.current = { route, key, hash };
      setState({ route, key, scroll });
    };
    const onLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      const hash = link?.getAttribute("href");
      if (!hash?.startsWith("#") || !pageRoutes.has(hash.slice(1).split("/")[0]) || link?.target || link?.hasAttribute("download")) return;
      event.preventDefault();
      go(hash);
    };
    window.addEventListener("scroll", remember, { passive: true });
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    window.addEventListener(ROUTE_EVENT, update);
    document.addEventListener("click", onLink);
    return () => {
      window.history.scrollRestoration = restoration;
      window.removeEventListener("scroll", remember);
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
      window.removeEventListener(ROUTE_EVENT, update);
      document.removeEventListener("click", onLink);
    };
  }, []);
  return state.route;
}

export function navigate(view: View, detail?: string) {
  go(detail ? `#${view}/${detail}` : `#${view}`);
}

/** Compare each day's calendar date in the time zone of that part of the trip. */
export function todayInTrip(trip: Trip, now = new Date()): Day | undefined {
  return trip.days.find(day => {
    const zone = ["II", "III", "IV"].includes(day.act) ? "America/Denver" : "America/Los_Angeles";
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
    const get = (key: string) => Number(parts.find(p => p.type === key)?.value);
    return day.date === Date.UTC(get("year"), get("month") - 1, get("day"));
  });
}

