import { useCallback, useState } from "react";

const KEY = (k: string) => `nwrt26.${k}`;

/** localStorage-backed state that tolerates corrupt or missing values. */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(KEY(key));
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(KEY(key), JSON.stringify(v));
        } catch {
          /* private browsing, quota — not worth surfacing */
        }
        return v;
      });
    },
    [key]
  );

  return [value, set] as const;
}
