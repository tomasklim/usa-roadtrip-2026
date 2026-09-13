import type { Units } from "../types";
import type { View } from "../lib/navigation";

const LINKS: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "itinerary", label: "Day by day", icon: "☷" },
  { id: "map", label: "Map", icon: "⌖" },
  { id: "flights", label: "Flights", icon: "✈" },
  { id: "guide", label: "Trip kit", icon: "▤" }
];

export function Header({ units, setUnits, theme, setTheme, view }: {
  units: Units; setUnits: (u: Units) => void;
  theme: string | null; setTheme: (t: string) => void; view: View;
}) {
  const isDark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const links = LINKS.map(({ id, label, icon }) => (
    <a key={id} href={`#${id}`} className={view === id ? "active" : undefined}
       aria-current={view === id ? "page" : undefined}>
      <span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span>
    </a>
  ));
  return <>
    <a href="#main" className="skip-link" onClick={event => {
      event.preventDefault();
      const main = document.getElementById("main");
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: "start", behavior: "instant" });
    }}>Skip to content</a>
    <header className="top">
      <div className="wrap">
        <a className="brand" href="#overview"><span className="brand-mark" aria-hidden="true">NW</span>
          <span className="brand-name">Northwest<span>FIELD NOTES / 2026</span></span></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links}</nav>
        <div className="header-tools">
          <div className="unitsw" role="group" aria-label="Distance units">
            {(["mi", "km"] as Units[]).map((u) => <button key={u} className={units === u ? "on" : ""}
              onClick={() => setUnits(u)} aria-pressed={units === u}>{u}</button>)}
          </div>
          <button className="hbtn" onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label={isDark ? "Use light theme" : "Use dark theme"}>{isDark ? "☀" : "☾"}</button>
        </div>
      </div>
    </header>
    <nav className="mobile-nav" aria-label="Mobile navigation">{links}</nav>
  </>;
}
