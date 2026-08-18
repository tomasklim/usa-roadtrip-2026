import { DayCard, type Lens } from "./DayList";
import type { Day, Units } from "../types";

/**
 * The selected day, shown over the right-hand side of the map rather than making
 * you scroll away from it. Reuses DayCard so the two views cannot drift apart.
 */
export function DayPanel({ day, units, lens, count, onClose, onStep, onScrollTo }: {
  day: Day; units: Units; lens: Lens; count: number;
  onClose: () => void;
  onStep: (delta: number) => void;
  onScrollTo: (id: string) => void;
}) {
  return (
    <aside className="detail" aria-label={`Day ${day.num} detail`}>
      <div className="detail-head">
        <button className="mini" onClick={() => onStep(-1)} title="Previous day (←)">←</button>
        <span className="detail-count">{(day.num ?? 0) + 1} / {count}</span>
        <button className="mini" onClick={() => onStep(1)} title="Next day (→)">→</button>
        <span style={{ flex: 1 }} />
        <button className="mini" onClick={() => onScrollTo(day.id)} title="Show this day in the list below">
          list ↓
        </button>
        <button className="mini" onClick={onClose} title="Close (Esc)">✕</button>
      </div>
      <div className="detail-body">
        <DayCard day={day} units={units} lens={lens} selected onSelect={() => {}} compact />
      </div>
    </aside>
  );
}
