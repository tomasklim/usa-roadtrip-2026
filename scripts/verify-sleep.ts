import { buildTrip } from "../src/lib/trip";
import type { SleepStyle } from "../src/types";

const styles: SleepStyle[] = ["motel", "balanced", "car"];
console.log("style".padEnd(10), "car".padStart(4), "beds".padStart(5), "  car nights");
for (const st of styles) {
  const t = buildTrip(new Set(), st);
  const car = t.days.filter((d) => d.sleep?.t === "car");
  const beds = t.days.length - 1 - car.length;
  const missing = car.filter((d) => !d.sleep!.where);
  console.log(
    st.padEnd(10), String(car.length).padStart(4), String(beds).padStart(5),
    "  " + car.map((d) => d.id).join(" "),
    missing.length ? `!! ${missing.length} without a location` : ""
  );
}
// A bed-only plan must not leave any day claiming a car night.
const bedsOnly = buildTrip(new Set(), "motel");
const stray = bedsOnly.days.filter((d) => d.sleep?.t === "car");
console.log(`\nbeds-only stray car nights: ${stray.length ? stray.map((d) => d.id).join(", ") : "none"}`);
// Every day that can sleep in a car must still have somewhere to sleep in every style.
for (const st of styles) {
  const t = buildTrip(new Set(["beartooth", "olympic", "alvord"]), st);
  const noSleep = t.days.filter((d) => d.kind !== "depart" && !d.sleep);
  console.log(`${st.padEnd(10)} with modules: ${t.days.length} days, ${t.carNights} car nights, ${noSleep.length} days with no sleep plan`);
}
