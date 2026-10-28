"use client";

import { useState } from "react";
import { FaSuitcaseRolling, FaSuitcase, FaChevronDown, FaChevronUp, FaExclamationTriangle } from "react-icons/fa";
import { airportInfo, clock, formatDate, formatDuration, datePart } from "@/lib/flights/offerModel";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

export function AirlineLogo({ code, name }) {
  const [failed, setFailed] = useState(false);
  if (!code || failed) {
    return <span className={`${s.logo} ${s.logoFallback}`}>{code || "✈"}</span>;
  }
  return <img className={s.logo} src={`https://pics.avs.io/100/100/${code}.png`} alt={name || code} loading="lazy" onError={() => setFailed(true)} />;
}

export function Price({ value, className }) {
  return (
    <span className={className}>
      {Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      <img src="/saudi_riyal.png" alt="SAR" className={s.sar} />
    </span>
  );
}

export function RouteLine({ flight, lang }) {
  const L = dict(lang);
  const cityOf = (code) => airportInfo(code).city || code;
  const stopsText = flight.stops === 0 ? L.direct : `${L.nStops(flight.stops)} · ${flight.layovers.map((l) => l.airport).join(", ")}`;
  const fromWarn = flight.nearbyAirport && flight.requestedFrom && flight.from !== flight.requestedFrom;
  const toWarn = flight.nearbyAirport && flight.requestedTo && flight.to !== flight.requestedTo;

  return (
    <div className={s.times}>
      <div className={s.timeBlock}>
        <div className={s.time}>{clock(flight.departure)}</div>
        <div className={`${s.airport} ${fromWarn ? s.airportWarn : ""}`} title={cityOf(flight.from)}>
          {flight.from}
        </div>
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
          {clock(flight.arrival)}
          {flight.dayOffset > 0 && <span className={s.dayPlus}>+{flight.dayOffset}</span>}
        </div>
        <div className={`${s.airport} ${toWarn ? s.airportWarn : ""}`} title={cityOf(flight.to)}>
          {flight.to}
        </div>
      </div>
    </div>
  );
}

function Segments({ flight, lang }) {
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
                  {clock(seg.departure)}
                  <small>{formatDate(datePart(seg.departure), lang)}</small>
                </span>
                <span>
                  {clock(seg.arrival)}
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
                  <AirlineLogo code={seg.carrier} />
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

export default function FlightCard({ flight, lang, price, priceLabel, tags = [], onSelect }) {
  const L = dict(lang);
  const [open, setOpen] = useState(false);
  const withBag = flight.fares.find((f) => f.checkedBag);
  const nearbyCode = flight.nearbyAirport ? [flight.from !== flight.requestedFrom && flight.from, flight.to !== flight.requestedTo && flight.to].filter(Boolean).join(", ") : "";

  return (
    <article className={s.flight}>
      <div className={s.flightMain}>
        <div className={s.flightInfo}>
          {(tags.length > 0 || nearbyCode) && (
            <div className={s.tagRow}>
              {tags.map((tg) => (
                <span key={tg.label} className={`${s.tag} ${tg.tone === "green" ? s.tagGreen : ""}`}>
                  {tg.label}
                </span>
              ))}
              {nearbyCode && (
                <span className={`${s.tag} ${s.tagWarn}`}>
                  <FaExclamationTriangle size={9} /> {L.nearby(nearbyCode)}
                </span>
              )}
            </div>
          )}
          <div className={s.route}>
            <div className={s.airline}>
              <AirlineLogo code={flight.airlineCode} name={flight.airline} />
              <div style={{ minWidth: 0 }}>
                <div className={s.airlineName}>{flight.airline}</div>
                <div className={s.flightNo}>{flight.flightNumbers.join(" · ")}</div>
              </div>
            </div>
            <RouteLine flight={flight} lang={lang} />
          </div>
          <div className={s.flightMeta}>
            {withBag ? (
              <span>
                <FaSuitcaseRolling /> {L.checked(withBag.checkedBag)}
              </span>
            ) : (
              <span className={s.metaMuted}>
                <FaSuitcaseRolling /> {L.bagAtFare}
              </span>
            )}
            {flight.cabinBag && (
              <span>
                <FaSuitcase /> {L.cabinBag(flight.cabinBag)}
              </span>
            )}
            {flight.seatsLeft !== null && flight.seatsLeft <= 4 && <span className={s.scarce}>{L.seatsLeft(flight.seatsLeft)}</span>}
            {flight.operatedBy && <span className={s.metaMuted}>{flight.operatedBy}</span>}
          </div>
        </div>
        <div className={s.priceCol}>
          <div>
            <div className={s.priceFrom}>{flight.taxesIncluded ? priceLabel : L.fromPrice}</div>
            <Price value={price} className={s.price} />
            {!flight.taxesIncluded && <div className={s.priceFrom}>{L.plusTaxes}</div>}
            <div className={s.priceNote}>{flight.taxesIncluded ? L.fareOptions(flight.fares.length) : L.taxesExcluded}</div>
          </div>
          <button type="button" className={`${s.btn} ${s.btnCta}`} onClick={() => onSelect(flight)}>
            {L.select}
          </button>
        </div>
      </div>
      <button type="button" className={s.detailsToggle} onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? L.hideDetails : L.details} {open ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </button>
      {open && <Segments flight={flight} lang={lang} />}
    </article>
  );
}
