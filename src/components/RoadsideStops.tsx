import { fmtDate, type Trip } from "../lib/trip";

interface RoadsideStop {
  day: string;
  name: string;
  time: string;
  fit: string;
  body: string;
  url: string;
  openDays?: readonly number[];
}

const STOPS: readonly RoadsideStop[] = [
  {
    day: "s9",
    name: "Upper Mesa Falls",
    time: "+1–1½ h",
    fit: "scenic detour",
    body: "A 29-mile byway to a 114-foot waterfall. Take it only if the road is dry; the outdoor viewpoints matter more than the seasonal visitor center.",
    url: "https://www.fs.usda.gov/media/248399"
  },
  {
    day: "s10",
    name: "Idaho Potato Museum",
    time: "45–60 min",
    fit: "on the route",
    body: "A 1913 depot, the largest potato crisp and exactly the right amount of roadside absurdity. Open Mon–Sat, 10–4 in October.",
    url: "https://www.idahopotatomuseum.com/plan-a-visit/",
    openDays: [1, 2, 3, 4, 5, 6]
  },
  {
    day: "s10",
    name: "Hill Aerospace Museum",
    time: "≈90 min",
    fit: "just off I-15",
    body: "Free, with 70+ aircraft including an SR-71 and F-117. Pick this or the potato museum—the rental-return day cannot comfortably carry both.",
    url: "https://www.aerospaceutah.org/",
    openDays: [2, 3, 4, 5, 6]
  },
  {
    day: "sf3",
    name: "Filoli",
    time: "≈2 h",
    fit: "swap, not add",
    body: "The Woodside wealth stop you can actually enter: a 1917 country house and formal gardens. Replace a few corporate drive-bys and book the timed entry.",
    url: "https://filoli.org/visit/"
  },
  {
    day: "sf4",
    name: "The Marine Mammal Center",
    time: "60–90 min",
    fit: "on the Marin loop",
    body: "A working rescue hospital in the Headlands, not an aquarium. The baseline Monday fits its Fri–Mon public hours; reserve a free ticket.",
    url: "https://www.marinemammalcenter.org/visit",
    openDays: [0, 1, 5, 6]
  }
];

export function RoadsideStops({ trip, onSelect }: {
  trip: Trip;
  onSelect: (dayId: string) => void;
}) {
  const days = new Map(trip.days.map((day) => [day.id, day]));
  const visible = STOPS.flatMap((stop) => {
    const day = days.get(stop.day);
    return day ? [{ stop, day }] : [];
  });

  return (
    <div className="panel card stop-panel" aria-labelledby="stop-panel-title">
      <h3 id="stop-panel-title">Worth the stop</h3>
      <p className="hint">Five additions that fit the baseline route. They are choices, not five more promises.</p>
      <div className="stoplist">
        {visible.map(({ stop, day }) => {
          const date = day.date == null ? null : new Date(day.date);
          const isOpen = !date || !stop.openDays || stop.openDays.includes(date.getUTCDay());
          return (
            <article key={stop.name} className={`stoprow${isOpen ? "" : " closed"}`}>
              <div className="stoptop">
                <span>Day {day.num} · {stop.fit}</span>
                <span className={isOpen ? "" : "shut"}>{isOpen ? stop.time : "closed that day"}</span>
              </div>
              <button className="stopname" onClick={() => onSelect(day.id)}
                      aria-label={`Open day ${day.num} on the map for ${stop.name}`}>
                {stop.name}<span aria-hidden="true"> ↑</span>
              </button>
              <p>{stop.body}</p>
              <div className="stopmeta">
                <span>{day.date ? fmtDate(day.date) : ""}</span>
                <a href={stop.url} target="_blank" rel="noreferrer noopener">official info ↗</a>
              </div>
            </article>
          );
        })}
      </div>
      <p className="stopnote">If a module shifts the calendar, the opening-day check above shifts with it.</p>
    </div>
  );
}
