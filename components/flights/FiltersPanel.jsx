"use client";

import { useMemo } from "react";
import { FaSlidersH, FaTimes } from "react-icons/fa";
import { EMPTY_FILTERS, TIME_BUCKETS, stopsBucket } from "@/lib/flights/offerModel";
import { Price } from "./FlightCard";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

const minBy = (list, key) => {
  const out = new Map();
  for (const f of list) {
    const k = key(f);
    const entry = out.get(k) || { min: Infinity, label: f.airline };
    entry.min = Math.min(entry.min, f.price);
    out.set(k, entry);
  }
  return out;
};

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function FiltersPanel({ lang, flights, filters, onChange, shown, open, onClose }) {
  const L = dict(lang);
  const stops = useMemo(() => minBy(flights, (f) => stopsBucket(f.stops)), [flights]);
  const airlines = useMemo(() => [...minBy(flights, (f) => f.airlineCode)].sort((a, b) => a[1].min - b[1].min), [flights]);
  const prices = flights.map((f) => f.price);
  const lo = Math.floor(Math.min(...prices));
  const hi = Math.ceil(Math.max(...prices));
  const hasNearby = flights.some((f) => f.nearbyAirport);
  const hasBaggage = flights.some((f) => f.fares.some((x) => x.checkedBag));
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.panel}>
        <div className={s.filtersHead}>
          <h2>
            <FaSlidersH size={14} /> {L.filters}
          </h2>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button type="button" className={s.linkBtn} onClick={() => onChange(EMPTY_FILTERS)}>
              {L.resetAll}
            </button>
            {open && (
              <button type="button" className={s.iconBtn} onClick={onClose} aria-label={L.close}>
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </div>
        <div className={s.filtersCount}>{L.shownOf(shown, flights.length)}</div>

        <div className={s.filterBlock}>
          <h3>{L.stops}</h3>
          {["0", "1", "2+"].filter((k) => stops.has(k)).map((k) => (
            <label key={k} className={s.filterOpt}>
              <input type="checkbox" checked={filters.stops.includes(k)} onChange={() => set({ stops: toggle(filters.stops, k) })} />
              <span className={s.grow}>{L.stopLabels[k]}</span>
              <Price value={stops.get(k).min} className={s.filterPrice} />
            </label>
          ))}
        </div>

        {(hasBaggage || hasNearby) && (
          <div className={s.filterBlock}>
            {hasBaggage && (
              <label className={s.filterOpt}>
                <input type="checkbox" checked={filters.baggageOnly} onChange={(e) => set({ baggageOnly: e.target.checked })} />
                <span className={s.grow}>{L.baggageOnly}</span>
              </label>
            )}
            {hasNearby && (
              <label className={s.filterOpt}>
                <input type="checkbox" checked={filters.exactAirports} onChange={(e) => set({ exactAirports: e.target.checked })} />
                <span className={s.grow}>{L.exactAirports}</span>
              </label>
            )}
          </div>
        )}

        <div className={s.filterBlock}>
          <h3>{L.depTime}</h3>
          <div className={s.timeGrid}>
            {TIME_BUCKETS.map((b) => (
              <button
                type="button"
                key={b.id}
                className={`${s.timeChip} ${filters.depTimes.includes(b.id) ? s.timeChipActive : ""}`}
                onClick={() => set({ depTimes: toggle(filters.depTimes, b.id) })}
                aria-pressed={filters.depTimes.includes(b.id)}
              >
                <strong>{L.times[b.id][0]}</strong>
                <small dir="ltr">{L.times[b.id][1]}</small>
              </button>
            ))}
          </div>
        </div>

        {hi > lo && (
          <div className={s.filterBlock}>
            <h3>{L.priceUpTo}</h3>
            <input
              type="range"
              className={s.range}
              min={lo}
              max={hi}
              step={1}
              value={filters.maxPrice ?? hi}
              onChange={(e) => set({ maxPrice: Number(e.target.value) >= hi ? null : Number(e.target.value) })}
              aria-label={L.priceUpTo}
            />
            <div className={s.rangeLabels}>
              <Price value={lo} />
              <Price value={filters.maxPrice ?? hi} />
            </div>
          </div>
        )}

        {airlines.length > 0 && (
          <div className={s.filterBlock}>
            <h3>{L.airlines}</h3>
            {airlines.map(([code, { min, label }]) => (
              <label key={code} className={s.filterOpt}>
                <input type="checkbox" checked={filters.airlines.includes(code)} onChange={() => set({ airlines: toggle(filters.airlines, code) })} />
                <span className={s.grow}>{label}</span>
                <Price value={min} className={s.filterPrice} />
              </label>
            ))}
          </div>
        )}

        {open && (
          <div className={s.filterBlock}>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} style={{ width: "100%" }} onClick={onClose}>
              {L.showResults(shown)}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
