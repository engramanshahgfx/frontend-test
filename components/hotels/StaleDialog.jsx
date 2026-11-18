"use client";

// "Still looking?" prompt once hotel prices on screen are old, as in the flight search.
// Room rates and availability move, and Akbar's search session behind them ends after an hour.

import { useEffect, useState } from "react";
import { FaHourglassHalf } from "react-icons/fa";
import { t as dict } from "./i18n";
import fs from "@/components/flights/flights.module.css";

export const STALE_AFTER_MS = 15 * 60 * 1000;

/** True once results have been on screen for STALE_AFTER_MS; also checked when the tab is shown again. */
export function useStaleResults(loadedAt) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    setStale(false);
    if (!loadedAt) return undefined;
    const check = () => Date.now() - loadedAt >= STALE_AFTER_MS && setStale(true);
    const timer = setTimeout(check, Math.max(0, STALE_AFTER_MS - (Date.now() - loadedAt)));
    // Background tabs throttle timers, so a returning visitor is checked straight away.
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadedAt]);
  return stale;
}

export default function StaleDialog({ lang, onRefresh, onNewSearch }) {
  const L = dict(lang);
  return (
    <div className={fs.staleOverlay} role="dialog" aria-modal="true" aria-labelledby="hotel-stale-title">
      <div className={fs.staleCard}>
        <div className={fs.staleIcon}>
          <FaHourglassHalf />
        </div>
        <h2 id="hotel-stale-title">{L.staleTitle}</h2>
        <p>{L.staleText}</p>
        <button type="button" className={fs.staleRefresh} onClick={onRefresh} autoFocus>
          {L.staleRefresh}
        </button>
        <button type="button" className={fs.staleNew} onClick={onNewSearch}>
          {L.staleNew}
        </button>
      </div>
    </div>
  );
}
