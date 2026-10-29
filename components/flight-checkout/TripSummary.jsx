"use client";

import { FaCheckCircle, FaInfoCircle, FaSuitcaseRolling } from "react-icons/fa";
import { AirlineLogo, Price } from "@/components/flights/FlightCard";
import { formatDate } from "@/lib/flights/offerModel";
import { t as dict } from "./i18n";
import c from "./checkout.module.css";

const legLabel = (L, selection, i) => {
  if (selection.tripType === "roundtrip") return i === 0 ? L.departure : L.return;
  return (selection.legs || []).length > 1 ? L.flight(i + 1) : L.departure;
};

/**
 * @param confirmedTotal the order total after the airline confirmed the fare, or null before that.
 */
export default function TripSummary({ lang, selection, confirmedTotal }) {
  const L = dict(lang);
  const pax = selection.passengerCount || 1;
  const total = confirmedTotal ?? selection.price;

  return (
    <div className={c.card} style={{ marginBottom: 0 }}>
      <div className={c.cardHead} style={{ paddingBottom: 14 }}>
        <h2>{L.summary}</h2>
      </div>

      {(selection.legs || []).map((leg, i) => (
        <div key={i} className={c.sumLeg}>
          <div className={c.sumLegHead}>
            <span>{legLabel(L, selection, i)}</span>
            <span>{formatDate(leg.date, lang, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className={c.sumAirline}>
            <AirlineLogo code={leg.airlineCode} name={leg.airline} />
            <span>
              <strong>{leg.airline}</strong> · {leg.flightNo}
            </span>
          </div>
          <div className={c.sumTimes}>
            <div>
              <div className={c.sumTime}>{leg.dep}</div>
              <div className={c.sumCode}>{leg.from}</div>
            </div>
            <div className={c.sumMid}>
              {leg.duration}
              <hr />
              {leg.isDirect ? L.direct : L.stops(leg.stops || 1)}
            </div>
            <div style={{ textAlign: "end" }}>
              <div className={c.sumTime}>{leg.arr}</div>
              <div className={c.sumCode}>{leg.to}</div>
            </div>
          </div>
          <div className={c.sumMeta}>
            {leg.fareType && (
              <span>
                {L.fare}: <strong>{leg.fareType}</strong>
              </span>
            )}
            {leg.checkedBaggage && (
              <span>
                <FaSuitcaseRolling size={11} /> {leg.checkedBaggage}
              </span>
            )}
          </div>
        </div>
      ))}

      <div className={c.priceRows}>
        <div className={c.priceRow}>
          <span>{L.travellersN(pax)}</span>
          <span>
            {[selection.adults && `${selection.adults} ${dict(lang).types.ADT}`, selection.children && `${selection.children} ${dict(lang).types.CHD}`, selection.infants && `${selection.infants} ${dict(lang).types.INF}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        <div className={`${c.priceRow} ${c.priceTotal}`}>
          <span>{L.total}</span>
          <Price value={total} />
        </div>
        <div className={c.priceNote}>{L.inclTaxes}</div>
        <div className={c.priceNote} style={{ color: confirmedTotal != null ? "var(--ok)" : undefined }}>
          {confirmedTotal != null ? <FaCheckCircle /> : <FaInfoCircle />}
          {confirmedTotal != null ? L.confirmed : L.estimate}
        </div>
      </div>
    </div>
  );
}
