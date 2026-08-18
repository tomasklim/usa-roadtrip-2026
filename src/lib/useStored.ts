import { useCallback, useState } from "react";

const KEY = (k: string) => `nwrt26.${k}`;

/** localStorage-backed state that tolerates corrupt, stale or missing values. */
export function useStored<T>(key: string, initial: T, normalize?: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(KEY(key));
      if (raw == null) return initial;
      const parsed: unknown = JSON.parse(raw);
      return normalize ? normalize(parsed) : (parsed as T);
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const candidate = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        const v = normalize ? normalize(candidate) : candidate;
        try {
          localStorage.setItem(KEY(key), JSON.stringify(v));
        } catch {
          /* private browsing, quota — not worth surfacing */
        }
        return v;
      });
    },
    [key, normalize]
  );

  return [value, set] as const;
}
