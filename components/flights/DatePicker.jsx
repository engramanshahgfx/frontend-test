"use client";

// Calendar for the departure / return fields. A card under the field on desktop and a bottom sheet on
// phones, replacing the browser's own date input, whose popup could open off-screen on a phone and
// did not follow the site's look. Weeks start on Sunday, as in Saudi Arabia.

import { useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { parseISODate, toISODate, todayISO, dateLocale } from "@/lib/flights/offerModel";
import s from "./flights.module.css";

const monthStart = (iso) => {
  const d = parseISODate(iso);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export default function DatePicker({ lang, title, value, min, rangeFrom, onPick, onClose }) {
  const rtl = lang === "ar";
  const loc = dateLocale(lang);
  const [view, setView] = useState(() => monthStart(value || min || todayISO()));
  const minMonth = monthStart(min || todayISO());
  const today = todayISO();

  const first = view.getDay();
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => toISODate(new Date(view.getFullYear(), view.getMonth(), i + 1))),
  ];
  // 1 Feb 2026 is a Sunday: seven days from it give the weekday names in the page's language.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 1, 1 + i).toLocaleDateString(loc, { weekday: "short" }));
  const shift = (n) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  const canPrev = view > minMonth;
  // Phones: the sheet is rendered straight into <body>, so no part of the page can be drawn over it.
  const [asSheet] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches);

  const content = (
    // data-popup-portal: clicks in here are not "outside" for the field that opened it.
    <div data-popup-portal="" className={asSheet ? s.dpPortal : undefined}>
      <div
        className={s.dpBackdrop}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div className={s.dp} role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className={s.dpSheetHead}>
          <strong>{title}</strong>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Close">
            <FaTimes size={12} />
          </button>
        </div>
        <div className={s.dpHead}>
          <button type="button" className={s.dpNav} onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
            {rtl ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
          <strong>{view.toLocaleDateString(loc, { month: "long", year: "numeric" })}</strong>
          <button type="button" className={s.dpNav} onClick={() => shift(1)} aria-label="Next month">
            {rtl ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
          </button>
        </div>
        <div className={s.dpGrid}>
          {weekdays.map((w) => (
            <span key={w} className={s.dpWeekday}>
              {w}
            </span>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <span key={`blank-${i}`} />;
            const disabled = Boolean(min && iso < min);
            const selected = iso === value;
            const isFrom = Boolean(rangeFrom) && iso === rangeFrom;
            const inRange = Boolean(rangeFrom && value) && iso > rangeFrom && iso < value;
            return (
              <button
                type="button"
                key={iso}
                disabled={disabled}
                aria-pressed={selected}
                className={[s.dpDay, selected && s.dpSelected, isFrom && s.dpFrom, inRange && s.dpInRange, iso === today && s.dpToday].filter(Boolean).join(" ")}
                onClick={() => onPick(iso)}
              >
                {Number(iso.slice(8, 10))}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return asSheet ? createPortal(content, document.body) : content;
}
