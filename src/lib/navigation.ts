import { useEffect, useRef, useState } from "react";
import type { Day } from "../types";
import type { Trip } from "./trip";

export type View = "overview" | "itinerary" | "map" | "flights" | "guide";
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
  if (["overview", "itinerary", "map", "flights", "guide"].includes(id)) view = id as View;
  // Keep old shared links useful after splitting the long page into views.
  if (id === "plan") view = "map";
  if (id === "glance" || id === "load") view = "itinerary";
  if (topicIds.has(id)) { view = "guide"; topic = id as Topic; }
  if (id === "guide" && topicIds.has(detail)) topic = detail as Topic;
  return { view, topic, day: id === "itinerary" || id === "map" ? detail : undefined };
}

export function useNavigation() {
  const [route, setRoute] = useState(readRoute);
  const previousView = useRef(route.view);
  useEffect(() => {
    const update = () => {
      if (window.location.hash === "#main") return;
      const next = readRoute();
      if (next.view !== "map" || previousView.current !== "map") window.scrollTo({ top: 0, behavior: "instant" });
      previousView.current = next.view;
      setRoute(next);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return route;
}

export function navigate(view: View, detail?: string) {
  window.location.hash = detail ? `${view}/${detail}` : view;
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

