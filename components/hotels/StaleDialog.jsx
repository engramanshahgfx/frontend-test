"use client";

// "Still looking?" prompt once hotel prices on screen are old, as in the flight search.
// Room rates and availability move, and Akbar's search session behind them ends after an hour.

import { useEffect, useState } from "react";
import { FaHourglassHalf } from "react-icons/fa";
import { t as dict } from "./i18n";
import fs from "@/components/flights/flights.module.css";

/** No mouse, keyboard, scroll or touch for this long (or the tab left for it) and prices are refreshed. */
export const IDLE_MS = 2 * 60 * 1000;
/** Even while browsing, a search this old is refreshed: Akbar's search session ends after an hour. */
export const MAX_AGE_MS = 30 * 60 * 1000;

const ACTIVITY = ["mousemove", "mousedown", "keydown", "wheel", "touchstart", "scroll"];

/**
 * True once the customer has been idle for IDLE_MS, or the search behind the prices (loadedAt)
 * is MAX_AGE_MS old. Checked again when the tab is shown, since background tabs throttle timers.
 */
export function useStaleResults(loadedAt) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    setStale(false);
    if (!loadedAt) return undefined;
    let lastActive = Date.now();
    let timer = null;
    let done = false;

    const stop = () => {
      done = true;
      clearTimeout(timer);
      ACTIVITY.forEach((e) => document.removeEventListener(e, onActivity, true));
      document.removeEventListener("visibilitychange", onVisible);
    };
    const check = () => {
      if (done) return;
      const now = Date.now();
      if (now - lastActive >= IDLE_MS || now - loadedAt >= MAX_AGE_MS) {
        stop();
        setStale(true);
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(check, Math.min(IDLE_MS - (now - lastActive), MAX_AGE_MS - (now - loadedAt)) + 50);
    };
    // Activity only moves the clock on; the scheduled check notices it.
    function onActivity() {
      if (document.visibilityState === "visible") lastActive = Date.now();
    }
    function onVisible() {
      if (document.visibilityState === "visible") check();
    }

    ACTIVITY.forEach((e) => document.addEventListener(e, onActivity, { capture: true, passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    check();
    return stop;
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
