import type { Units } from "../types";

const LINKS = [
  ["#flights", "Flights"], ["#plan", "Map & plan"], ["#glance", "At a glance"],
  ["#load", "Driving load"], ["#charging", "Charging"], ["#food", "Food"],
  ["#sleep", "Sleeping"], ["#budget", "Budget"], ["#checklist", "Checklist"],
  ["#risks", "Risks"]
];

export function Header({ units, setUnits, theme, setTheme }: {
  units: Units; setUnits: (u: Units) => void;
  theme: string | null; setTheme: (t: string) => void;
}) {
  const isDark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  return (
    <header className="top">
      <div className="wrap">
        <div className="brand">Northwest Roadtrip <span>’26</span></div>
        <nav className="links">
          {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="unitsw" role="group" aria-label="Distance units">
          {(["mi", "km"] as Units[]).map((u) => (
            <button key={u} className={units === u ? "on" : ""} onClick={() => setUnits(u)}
                    aria-pressed={units === u}>{u}</button>
          ))}
        </div>
        <button className="hbtn" onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle colour theme">{isDark ? "☀" : "☾"}</button>
      </div>
    </header>
  );
}
