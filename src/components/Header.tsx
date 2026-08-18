import { useEffect, useRef, useState } from "react";
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
  const [active, setActive] = useState("");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const marker = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--head")) + 28;
      const sections = LINKS
        .map(([href]) => document.getElementById(href.slice(1)))
        .filter((el): el is HTMLElement => !!el)
        .sort((a, b) => a.offsetTop - b.offsetTop);
      let next = "";
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) next = section.id;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        next = sections.at(-1)?.id ?? next;
      }
      setActive((current) => current === next ? current : next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    navRef.current?.querySelector<HTMLElement>(`a[href="#${active}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <header className="top">
      <div className="wrap">
        <div className="brand">Northwest Roadtrip <span>’26</span></div>
        <nav className="links" ref={navRef} aria-label="Page sections">
          {LINKS.map(([href, label]) => {
            const on = active === href.slice(1);
            return <a key={href} href={href} className={on ? "active" : undefined}
                      aria-current={on ? "location" : undefined}>{label}</a>;
          })}
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
