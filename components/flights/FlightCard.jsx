"use client";

import { useState } from "react";
import { FaSuitcaseRolling, FaSuitcase, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaPlane } from "react-icons/fa";
import { airportInfo, clockAs, formatDate, formatDuration, datePart } from "@/lib/flights/offerModel";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

export function AirlineLogo({ code, name, small = false }) {
  const [failed, setFailed] = useState(false);
  const cls = `${s.logo} ${small ? s.logoSm : ""}`;
  if (!code || failed) {
    return <span className={`${cls} ${s.logoFallback}`}>{code || "✈"}</span>;
  }
  return <img className={cls} src={`https://pics.avs.io/100/100/${code}.png`} alt={name || code} loading="lazy" onError={() => setFailed(true)} />;
}

export function Price({ value, className }) {
  return (
    <span className={className}>
      {Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      <img src="/saudi_riyal.png" alt="SAR" className={s.sar} />
    </span>
  );
}

/** Times and route on one line; used by the fare drawer too. */
export function RouteLine({ flight, lang, ampm = false }) {
  const L = dict(lang);
  const stopsText = flight.stops === 0 ? L.direct : `${L.nStops(flight.stops)} · ${flight.layovers.map((l) => l.airport).join(", ")}`;
  return (
    <div className={s.times}>
      <div className={s.timeBlock}>
        <div className={s.time}>{clockAs(flight.departure, ampm, lang)}</div>
        <div className={s.airport}>{flight.from}</div>
      </div>
      <div className={s.path}>
        <div className={s.pathDur}>{formatDuration(flight.duration, lang) || flight.durationText}</div>
        <div className={s.pathLine}>
          {flight.layovers.map((_, i) => (
            <span key={i} className={s.stopDot} style={{ insetInlineStart: `${((i + 1) / (flight.layovers.length + 1)) * 100}%` }} />
          ))}
        </div>
        <div className={`${s.pathStops} ${flight.stops === 0 ? s.direct : s.withStops}`}>{stopsText}</div>
      </div>
      <div className={s.timeBlock}>
        <div className={s.time}>
          {clockAs(flight.arrival, ampm, lang)}
          {flight.dayOffset > 0 && <span className={s.dayPlus}>+{flight.dayOffset}</span>}
        </div>
        <div className={s.airport}>{flight.to}</div>
      </div>
    </div>
  );
}

function Segments({ flight, lang, ampm }) {
  const L = dict(lang);
  return (
    <div className={s.details}>
      {flight.segments.map((seg, i) => {
        const a = airportInfo(seg.from);
        const b = airportInfo(seg.to);
        const lay = flight.layovers[i];
        return (
          <div key={i}>
            <div className={s.segment}>
              <div className={s.segTimes}>
                <span>
                  {clockAs(seg.departure, ampm, lang)}
                  <small>{formatDate(datePart(seg.departure), lang)}</small>
                </span>
                <span>
                  {clockAs(seg.arrival, ampm, lang)}
                  <small>{formatDate(datePart(seg.arrival), lang)}</small>
                </span>
              </div>
              <div className={s.segRail}>
                <i />
                <i />
              </div>
              <div className={s.segBody}>
                <div>
                  <strong>
                    {a.city} ({seg.from})
                  </strong>
                  <br />
                  <small>{a.name}</small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AirlineLogo code={seg.carrier} small />
                  <small>
                    {flight.airline} · {seg.carrier} {seg.flightNo}
                    {flight.operatedBy ? ` · ${flight.operatedBy}` : ""}
                  </small>
                </div>
                <div>
                  <strong>
                    {b.city} ({seg.to})
                  </strong>
                  <br />
                  <small>{b.name}</small>
                </div>
              </div>
            </div>
            {lay && i < flight.segments.length - 1 && (
              <div className={s.layover}>{L.layover(formatDuration(lay.minutes, lang) || "—", airportInfo(lay.airport).city || lay.airport)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const codeChip = (code, warn) => <span className={`${s.codeChip} ${warn ? s.codeChipWarn : ""}`}>{code}</span>;

export default function FlightCard({ flight, lang, price, priceLabel, tags = [], onSelect, ampm = false }) {
  const L = dict(lang);
  const [open, setOpen] = useState(false);
  const withBag = flight.fares.find((f) => f.checkedBag);
  const fromWarn = flight.nearbyAirport && flight.requestedFrom && flight.from !== flight.requestedFrom;
  const toWarn = flight.nearbyAirport && flight.requestedTo && flight.to !== flight.requestedTo;
  const via = flight.layovers.map((l) => `${formatDuration(l.minutes, lang)} ${l.airport}`).join(", ");

  return (
    <article className={s.flight}>
      <div className={s.flightMain}>
        <div className={s.flightInfo}>
          {(tags.length > 0 || fromWarn || toWarn) && (
            <div className={s.tagRow}>
              {tags.map((tg) => (
                <span key={tg.label} className={`${s.tag} ${tg.tone === "green" ? s.tagGreen : ""}`}>
                  {tg.label}
                </span>
              ))}
              {(fromWarn || toWarn) && (
                <span className={`${s.tag} ${s.tagWarn}`}>
                  <FaExclamationTriangle size={9} /> {L.nearby([fromWarn && flight.from, toWarn && flight.to].filter(Boolean).join(", "))}
                </span>
              )}
            </div>
          )}

          <div className={s.rowGrid}>
            <div className={s.rowAirline}>
              <AirlineLogo code={flight.airlineCode} name={flight.airline} />
              <div className={s.rowAirlineText}>
                <div className={s.airlineName}>{flight.airline}</div>
                <div className={s.flightNo}>{flight.flightNumbers.join(" · ")}</div>
              </div>
            </div>

            <div className={s.rowTimes}>
              <div>
                <div className={s.time}>{clockAs(flight.departure, ampm, lang)}</div>
                <div className={s.chipLine}>
                  {codeChip(flight.from, fromWarn)} <FaPlane size={9} className={s.chipPlane} /> {codeChip(flight.to, toWarn)}
                </div>
              </div>
              <span className={s.rowDash} aria-hidden="true" />
              <div>
                <div className={s.time}>
                  {clockAs(flight.arrival, ampm, lang)}
                  {flight.dayOffset > 0 && <span className={s.dayPlus}>+{flight.dayOffset}</span>}
                </div>
                <div className={s.flightNo}>{formatDate(datePart(flight.arrival), lang, { day: "numeric", month: "short" })}</div>
              </div>
            </div>

            <div className={s.rowStops}>
              <div className={flight.stops === 0 ? s.direct : s.withStops}>{flight.stops === 0 ? L.direct : L.nStops(flight.stops)}</div>
              <div className={s.flightNo}>{formatDuration(flight.duration, lang) || flight.durationText}</div>
              {via && <div className={s.flightNo}>{via}</div>}
            </div>

            <div className={s.rowBags}>
              {withBag ? (
                <span>
                  <FaSuitcaseRolling /> {L.checked(withBag.checkedBag)}
                </span>
              ) : (
                <span className={s.metaMuted}>
                  <FaSuitcase /> {flight.cabinBag ? L.cabinBag(flight.cabinBag) : L.cabinBagOnly}
                </span>
              )}
              {flight.seatsLeft !== null && flight.seatsLeft <= 4 && <span className={s.scarce}>{L.seatsLeft(flight.seatsLeft)}</span>}
            </div>
          </div>
        </div>

        <div className={s.priceCol}>
          <div>
            <div className={s.priceFrom}>{flight.taxesIncluded ? priceLabel : L.fromPrice}</div>
            <Price value={price} className={s.price} />
            {!flight.taxesIncluded && <div className={s.priceFrom}>{L.plusTaxes}</div>}
          </div>
          <div className={s.priceActions}>
            <button type="button" className={s.linkBtn} onClick={() => setOpen(!open)} aria-expanded={open}>
              {L.viewDetails} {open ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
            </button>
            <button type="button" className={`${s.btn} ${s.btnPrimary} ${s.btnSelect}`} onClick={() => onSelect(flight)}>
              {L.select}
            </button>
          </div>
        </div>
      </div>
      {open && <Segments flight={flight} lang={lang} ampm={ampm} />}
    </article>
  );
}
