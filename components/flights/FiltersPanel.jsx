"use client";

import { useMemo, useState } from "react";
import { FaSlidersH, FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { EMPTY_FILTERS, TIME_BUCKETS, airportInfo } from "@/lib/flights/offerModel";
import { AirlineLogo, Price } from "./FlightCard";
import SmartFilter from "./SmartFilter";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

const minPriceBy = (list, key) => {
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
function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={s.filterBlock}>
      <button type="button" className={s.filterHead} onClick={() => setOpen(!open)} aria-expanded={open}>
        <h3>{title}</h3>
        {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
      </button>
      {open && <div className={s.filterContent}>{children}</div>}
    </div>
  );
}

function TimeChips({ lang, selected, onToggle }) {
  const L = dict(lang);
  return (
    <div className={s.timeGrid}>
      {TIME_BUCKETS.map((b) => (
        <button
          type="button"
          key={b.id}
          className={`${s.timeChip} ${selected.includes(b.id) ? s.timeChipActive : ""}`}
          onClick={() => onToggle(b.id)}
          aria-pressed={selected.includes(b.id)}
        >
          {L.timesShort[b.id]}
        </button>
      ))}
    </div>
  );
}

function AirportList({ lang, flights, requested, field, selected, onToggle }) {
  const L = dict(lang);
  const prices = useMemo(() => minPriceBy(flights, (f) => f[field]), [flights, field]);
  const codes = [...prices.keys()];
  const main = codes.filter((c) => c === requested);
  const nearby = codes.filter((c) => c !== requested);
  const row = (code) => {
    const ap = airportInfo(code);
    return (
      <label key={code} className={s.filterOpt}>
        <input type="checkbox" checked={selected.includes(code)} onChange={() => onToggle(code)} />
        <span className={s.grow} title={ap.name}>
          {ap.name || ap.city || code}
        </span>
        <span className={s.filterCode}>{code}</span>
      </label>
    );
  };
  return (
    <>
      {main.map(row)}
      {nearby.length > 0 && (
        <>
          <div className={s.filterSub}>↳ {L.nearbyAirports}</div>
          <div style={{ paddingInlineStart: 14 }}>{nearby.map(row)}</div>
        </>
      )}
    </>
  );
}

export default function FiltersPanel({ lang, flights, filters, onChange, shown, open, onClose, ampm, onAmpm, legFrom, legTo, onSort }) {
  const L = dict(lang);
  const airlines = useMemo(() => [...minPriceBy(flights, (f) => f.airlineCode)].sort((a, b) => a[1].min - b[1].min), [flights]);
  const maxStopsPresent = Math.max(...flights.map((f) => f.stops));
  const prices = flights.map((f) => f.price);
  const lo = Math.floor(Math.min(...prices));
  const hi = Math.ceil(Math.max(...prices));
  const hasBaggage = flights.some((f) => f.fares.some((x) => x.checkedBag));
  const multiFrom = new Set(flights.map((f) => f.from)).size > 1;
  const multiTo = new Set(flights.map((f) => f.to)).size > 1;
  const set = (patch) => onChange({ ...filters, ...patch });
  const fromCity = airportInfo(legFrom).city || legFrom;
  const toCity = airportInfo(legTo).city || legTo;

  return (
    <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.panel}>
        <SmartFilter
          lang={lang}
          flights={flights}
          onApply={(next, sort) => {
            onChange(next);
            if (sort) onSort(sort);
          }}
        />
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
        <div className={s.filtersCount}>{L.flightsFound(shown, flights.length)}</div>

        <Section title={L.stops}>
          {[null, 0, 1, 2].filter((n) => n === null || n < maxStopsPresent || n === 0).map((n) => (
            <label key={String(n)} className={s.filterOpt}>
              <input type="radio" name="maxStops" checked={filters.maxStops === n} onChange={() => set({ maxStops: n })} />
              <span className={s.grow}>{L.stopsOpts[n === null ? "any" : n]}</span>
            </label>
          ))}
        </Section>

        {hasBaggage && (
          <Section title={L.baggageTitle}>
            <button type="button" className={`${s.chip} ${filters.baggageOnly ? s.chipActive : ""}`} aria-pressed={filters.baggageOnly} onClick={() => set({ baggageOnly: !filters.baggageOnly })}>
              {L.baggageOnly}
            </button>
          </Section>
        )}

        {airlines.length > 0 && (
          <Section title={L.airlines}>
            {airlines.map(([code, { min, label }]) => (
              <label key={code} className={s.filterOpt}>
                <input type="checkbox" checked={filters.airlines.includes(code)} onChange={() => set({ airlines: toggle(filters.airlines, code) })} />
                <AirlineLogo code={code} name={label} small />
                <span className={s.grow}>{label}</span>
                <Price value={min} className={s.filterPrice} />
              </label>
            ))}
          </Section>
        )}

        <Section title={L.timeTitle}>
          <div className={s.filterSub}>{L.flyFrom(fromCity)}</div>
          <TimeChips lang={lang} selected={filters.depTimes} onToggle={(id) => set({ depTimes: toggle(filters.depTimes, id) })} />
          <div className={s.filterSub} style={{ marginTop: 12 }}>{L.arriveIn(toCity)}</div>
          <TimeChips lang={lang} selected={filters.arrTimes} onToggle={(id) => set({ arrTimes: toggle(filters.arrTimes, id) })} />
        </Section>

        {(multiFrom || multiTo) && (
          <Section title={L.airportsTitle}>
            <div className={s.filterSub}>{L.flyFrom(fromCity)}</div>
            <AirportList lang={lang} flights={flights} requested={legFrom} field="from" selected={filters.fromAirports} onToggle={(c) => set({ fromAirports: toggle(filters.fromAirports, c) })} />
            <div className={s.filterSub} style={{ marginTop: 12 }}>{L.arriveIn(toCity)}</div>
            <AirportList lang={lang} flights={flights} requested={legTo} field="to" selected={filters.toAirports} onToggle={(c) => set({ toAirports: toggle(filters.toAirports, c) })} />
          </Section>
        )}

        {hi > lo && (
          <Section title={L.priceTitle}>
            <div className={s.rangeLabels} style={{ marginBottom: 6 }}>
              <Price value={lo} />
              <Price value={filters.maxPrice ?? hi} />
            </div>
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
          </Section>
        )}

        <div className={s.filterBlock}>
          <label className={s.switchRow}>
            <span>{L.ampm}</span>
            <input type="checkbox" role="switch" className={s.switch} checked={ampm} onChange={(e) => onAmpm(e.target.checked)} />
          </label>
        </div>

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
