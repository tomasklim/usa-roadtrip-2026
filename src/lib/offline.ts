import { weatherSummary } from "./weather";
import { FLIGHTS } from "../data/itinerary";
import { fmtDate, distLabel, type Trip } from "./trip";
import type { Units } from "../types";
const esc = (value: string) => value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const list = (items?: string[]) => items?.length ? `<ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";

/** A self-contained file: the daily text remains readable without a connection. */
export function offlinePlanHtml(trip: Trip, units: Units, savedAt = new Date()) {
  const days = trip.days.map(d => `<article id="${esc(d.id)}"><small>DAY ${d.num} · ${esc(fmtDate(d.date!))}</small><h2>${esc(d.title)}</h2>
    <p>${esc(d.leg)}</p><p>${d.hours ? `${d.hours} h driving · ${distLabel(d.meters ?? 0, units)}` : "No driving"}</p>
    ${d.alert ? `<p class="alert">${esc(d.alert)}</p>` : ""}<h3>Historical weather</h3><p>${esc(weatherSummary(d))}</p><h3>The plan</h3>${list(d.hi)}
    ${d.sleep ? `<h3>Tonight</h3><p>${d.sleep.t === "car" ? "In the car" : "A bed"} — ${esc(d.sleep.where)}${d.sleep.decision ? ` — ${esc(d.sleep.decision)}` : ""}${d.sleep.note ? ` — ${esc(d.sleep.note)}` : ""}</p>` : ""}
    ${d.food?.length ? `<h3>Food</h3>${list(d.food.map(f => `${f.nm}: ${f.note}`))}` : ""}
    ${d.charge?.length ? `<h3>Charging</h3>${list(d.charge)}` : ""}
    ${d.ideas?.length ? `<details><summary>More ideas</summary>${list(d.ideas)}</details>` : ""}<a href="#top">Back to days ↑</a></article>`).join("");
  const flights = FLIGHTS.map(f => {
    const day = trip.days.find(d => d.id === (f.dir === "hop1" ? "s1" : f.dir === "hop2" ? "sf1" : ""));
    return `<section><p><b>${esc(day ? fmtDate(day.date!) : f.date)} · ${esc(f.from)} → ${esc(f.to)}</b><br>${esc(f.dep)} → ${esc(f.arr)} · ${f.booked ? "Booked" : "To book"}<br>${esc(f.stops)}</p>${list(f.legs.map(l => l.filter(Boolean).join(" · ")))}${f.note ? `<p>${esc(f.note)}</p>` : ""}</section>`;
  }).join("");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Northwest Roadtrip — offline plan</title>
  <style>body{max-width:760px;margin:auto;padding:24px;background:#f7f5ee;color:#24362e;font:17px/1.65 system-ui}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:40px}article{border-top:1px solid #ccc;padding:32px 0}li{margin:10px 0}a{color:#315d46}nav{display:grid;gap:8px}nav a,summary{padding:8px 0}small{letter-spacing:.08em}.alert{background:#f1dfcc;padding:16px}details{margin:24px 0} @media print{nav,details{display:none}article{break-inside:avoid}}</style>
  <header id="top"><small>FIELD NOTES / 2026</small><h1>Northwest Roadtrip</h1><p>Saved ${esc(savedAt.toLocaleDateString("en-GB"))}. This copy contains the selected itinerary and flight details. Map tiles, photos, live conditions and later changes need a connection.</p>
  ${trip.overrun ? `<p class="alert">This selection is ${trip.overrun} day(s) too long for the booked flights. Remove a route option before following this plan.</p>` : ""}
  <p>Sleep preference: at most two car nights in a row, except your selected price exceptions. Historical weather: 2015–2025, your date ±7 days, 165 local days per estimate; overnight lows use the following morning. Reanalysis of representative areas, not a forecast. Wet days include rain and snow. Data: <a href="https://open-meteo.com/en/docs/historical-weather-api">Open-Meteo</a>, Copernicus ERA5 / ERA5-Land, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Terrain and exact campsite conditions vary.</p><nav>${trip.days.map(d => `<a href="#${esc(d.id)}">${d.num}. ${esc(fmtDate(d.date!))} — ${esc(d.title)}</a>`).join("")}</nav></header><article><h2>Flights</h2><p>All times local. Return to Prague October 14.</p>${flights}</article>${days}</html>`;
}

export function downloadOfflinePlan(trip: Trip, units: Units) {
  const url = URL.createObjectURL(new Blob([offlinePlanHtml(trip, units)], { type: "text/html;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "northwest-roadtrip-offline.html"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
