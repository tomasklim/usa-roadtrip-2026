import assert from "node:assert/strict";
import { buildTrip } from "../src/lib/trip";
import { keepScroll, readRoute, todayInTrip } from "../src/lib/navigation";
import { offlinePlanHtml } from "../src/lib/offline";

const trip = buildTrip(new Set());
// Calendar days should follow the destination, even if the phone is on Prague time.
assert.equal(todayInTrip(trip, new Date("2026-09-25T05:00:00Z"))?.id, "arrive");
assert.equal(todayInTrip(trip, new Date("2026-10-11T19:00:00Z"))?.id, "sf3");
assert.equal(todayInTrip(trip, new Date("2026-09-13T12:00:00Z")), undefined);
assert.equal(todayInTrip(trip, new Date("2026-10-15T12:00:00Z")), undefined);

const win = { location: { hash: "" } };
Object.defineProperty(globalThis, "window", { value: win, configurable: true });
for (const [hash, view, topic] of [
  ["#plan", "map", "checklist"], ["#food", "guide", "food"],
  ["#guide/sleep", "guide", "sleep"], ["#guide/unknown", "guide", "checklist"],
  ["#glance", "itinerary", "checklist"], ["#unknown", "overview", "checklist"]
]) {
  win.location.hash = hash;
  assert.equal(readRoute().view, view);
  assert.equal(readRoute().topic, topic);
}
win.location.hash = "#itinerary/sf3";
assert.equal(readRoute().day, "sf3");

// A changed day preserves reading position; a different page starts at the top.
const routeFor = (hash: string) => { win.location.hash = hash; return readRoute(); };
assert.ok(keepScroll(routeFor("#itinerary/sf3"), routeFor("#itinerary/sf2")));
assert.ok(keepScroll(routeFor("#map/sf3"), routeFor("#map/sf2")));
assert.ok(!keepScroll(routeFor("#itinerary/sf3"), routeFor("#map/sf3")));
assert.ok(!keepScroll(routeFor("#guide/food"), routeFor("#guide/sleep")));
assert.ok(keepScroll(routeFor("#guide/food"), routeFor("#guide/food")));

const html = offlinePlanHtml(trip, "km", new Date("2026-09-13T12:00:00Z"));
assert.equal((html.match(/<article id=/g) ?? []).length, 20);
for (const text of ["NODE", "DE4410", "DE2032", "DE2097", "DE4407", "12:00", "16:30", "October 14", "km"]) assert.ok(html.includes(text), text);
assert.ok(!/<script|<link|<img|src=/.test(html), "offline file must have no external assets");
const escaped = offlinePlanHtml({ ...trip, days: [{ ...trip.days[0], title: '<script>alert("x")</script>' }] }, "mi");
assert.ok(escaped.includes("&lt;script&gt;"));
assert.ok(!escaped.includes("<script>"));
const overrun = offlinePlanHtml(buildTrip(new Set(["dino", "olympic"])), "km");
assert.ok(overrun.includes("too long for the booked flights"));
console.log("✓ scroll policy, destination dates, legacy/day links, offline flights and all 20 days, escaping and overrun warning");
