"use client";

import { useEffect, useState } from "react";
import { FaTimes, FaCheck, FaBan, FaInfoCircle, FaSuitcaseRolling, FaSuitcase, FaUndo, FaExchangeAlt, FaChair } from "react-icons/fa";
import akbarApi from "@/lib/akbarApi";
import { formatDate, datePart, ltr } from "@/lib/flights/offerModel";
import { AirlineLogo, Price, RouteLine } from "./FlightCard";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

const titleCase = (str) => String(str || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// "0 Pc" / "0 Kg" is the airline saying no checked bag; that is shown as "Not included".
const noBag = (b) => b?.check_in_kg === 0 || b?.check_in_pieces === 0 || /^\s*0\s*(pc|pcs|piece|kg)/i.test(String(b?.check_in || ""));

function bagLabel(b) {
  if (!b || noBag(b)) return null;
  if (b.check_in_kg) return ltr(`${b.check_in_kg} kg`);
  if (b.check_in_pieces) return ltr(`${b.check_in_pieces} pc`);
  return ltr(b.check_in) || null;
}

// A bundle from /bundles, reduced to what the fare card compares.
function fromBundle(b, lang) {
  const ar = lang === "ar";
  return {
    id: b.offer_id,
    price: Number(b.price?.total) || 0,
    name: b.group ? titleCase(b.group) : null,
    fareClass: b.name,
    checkedBag: bagLabel(b.baggage),
    checkedKnown: Boolean(b.baggage?.check_in || b.baggage?.check_in_kg || b.baggage?.check_in_pieces) || noBag(b.baggage),
    cabinBag: ltr(b.baggage?.cabin || (b.inclusions?.cabin_kg ? `${b.inclusions.cabin_kg} kg` : null)),
    cancellation: b.cancellation ? { status: b.cancellation.status, text: (ar && b.cancellation.label_ar) || b.cancellation.label } : null,
    change: b.change ? { status: b.change.status, text: (ar && b.change.label_ar) || b.change.label } : null,
    seatsLeft: Number(b.seats_left) > 0 && Number(b.seats_left) <= 9 ? Number(b.seats_left) : null,
  };
}

// The same flight's fares as the search returned them, used when /bundles is unavailable.
const fromSearch = (o) => ({
  id: o.id,
  price: o.price,
  name: o.fareGroup ? titleCase(o.fareGroup) : null,
  fareClass: o.fareClass,
  checkedBag: o.checkedBag,
  checkedKnown: Boolean(o.checkedBag),
  cabinBag: o.cabinBag,
  cancellation: null,
  change: null,
  seatsLeft: o.seatsLeft,
});

function Row({ icon, label, value, tone }) {
  return (
    <li>
      <span className={s[tone] || s.unknown}>{icon}</span>
      <span>
        <strong style={{ fontWeight: 600 }}>{label}:</strong> <span className={tone === "unknown" ? s.unknown : undefined}>{value}</span>
      </span>
    </li>
  );
}

export default function FareDrawer({ lang, flight, searchId, extra, isRoundTripTotal, nextLabel, onClose, onChoose }) {
  const L = dict(lang);
  const [fares, setFares] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [picked, setPicked] = useState(flight.id);

  useEffect(() => {
    let alive = true;
    akbarApi.getBundles(flight.id, searchId).then((res) => {
      if (!alive) return;
      const list = res.ok && Array.isArray(res.data?.data?.bundles) ? res.data.data.bundles.filter((b) => Number(b.price?.total) > 0) : [];
      if (list.length) {
        setFares(list.map((b) => fromBundle(b, lang)));
      } else {
        setFallback(true);
        setFares([...flight.fares].sort((a, b) => a.price - b.price).map(fromSearch));
      }
    });
    return () => {
      alive = false;
    };
  }, [flight, searchId, lang]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const current = fares?.find((f) => f.id === picked) || fares?.[0];
  const cheapest = fares ? Math.min(...fares.map((f) => f.price)) : 0;

  const termRow = (term, label, icon) => {
    if (!term) return <Row icon={icon} label={label} value={L.notStated} tone="unknown" />;
    const tone = term.status === "allowed" ? "yes" : term.status === "not_allowed" ? "no" : "unknown";
    return <Row icon={tone === "no" ? <FaBan size={12} /> : icon} label={label} value={term.text} tone={tone} />;
  };

  return (
    <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-labelledby="fare-title">
      <div className={s.drawer}>
        <div className={s.drawerHead}>
          <div>
            <h2 id="fare-title">{L.fareTitle}</h2>
            <p>{L.fareSub}</p>
          </div>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label={L.close}>
            <FaTimes size={12} />
          </button>
        </div>

        <div className={s.drawerBody}>
          <div className={`${s.panel} ${s.drawerSummary}`}>
            <AirlineLogo code={flight.airlineCode} name={flight.airline} />
            <div style={{ minWidth: 120 }}>
              <div className={s.airlineName}>{flight.airline}</div>
              <div className={s.flightNo}>{formatDate(datePart(flight.departure), lang, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <RouteLine flight={flight} lang={lang} />
            </div>
          </div>

          {!fares && (
            <>
              <div className={`${s.panel} ${s.loadingHead}`}>
                <span>{L.fareLoading}</span>
                <span className={s.progress} />
              </div>
              <div className={s.fareGrid}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className={s.skeleton} style={{ height: 260 }} />
                ))}
              </div>
            </>
          )}

          {fallback && (
            <div className={s.notice}>
              <FaInfoCircle style={{ marginTop: 3, flexShrink: 0 }} /> {L.fareFallback}
            </div>
          )}

          {fares && (
            <div className={s.fareGrid} role="radiogroup" aria-label={L.fareTitle}>
              {fares.map((f, i) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={f.id === current?.id}
                  key={f.id}
                  className={`${s.fare} ${f.id === current?.id ? s.fareActive : ""}`}
                  onClick={() => setPicked(f.id)}
                >
                  <div className={s.fareTop}>
                    <div>
                      <div className={s.fareName}>{f.name || `${L.fare} ${i + 1}`}</div>
                      {f.fareClass && <div className={s.fareClass}>{L.bookingClass(f.fareClass)}</div>}
                    </div>
                    <span className={s.radio} />
                  </div>
                  <div>
                    <Price value={f.price + extra} className={s.farePrice} />
                    <div className={s.fareDiff}>
                      {f.price > cheapest ? <>+{(f.price - cheapest).toLocaleString("en-US", { maximumFractionDigits: 2 })} SAR</> : L.cheapest}
                    </div>
                  </div>
                  <ul className={s.fareRows}>
                    <Row icon={<FaSuitcaseRolling size={12} />} label={L.checkedBag} value={f.checkedBag || (f.checkedKnown ? L.noChecked : L.notStated)} tone={f.checkedBag ? "yes" : f.checkedKnown ? "no" : "unknown"} />
                    <Row icon={<FaSuitcase size={12} />} label={L.cabinBagT} value={f.cabinBag || L.notStated} tone={f.cabinBag ? "yes" : "unknown"} />
                    {termRow(f.cancellation, L.cancellation, <FaUndo size={11} />)}
                    {termRow(f.change, L.dateChange, <FaExchangeAlt size={11} />)}
                    {f.seatsLeft !== null && f.seatsLeft <= 4 && <Row icon={<FaChair size={12} />} label={L.seats} value={L.seatsLeft(f.seatsLeft)} tone="no" />}
                  </ul>
                </button>
              ))}
            </div>
          )}

          <p className={s.fineprint}>
            <FaCheck size={10} style={{ color: "var(--ok)" }} /> {L.fareFine}
          </p>
        </div>

        <div className={s.drawerFoot}>
          <div className={s.footTotal}>
            <small>{L.totalNote(isRoundTripTotal)}</small>
            {current ? <Price value={current.price + extra} className={s.price} /> : <strong>—</strong>}
          </div>
          <button type="button" className={`${s.btn} ${s.btnCta}`} disabled={!current} onClick={() => onChoose(current)}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
