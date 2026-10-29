"use client";

import { FaCheck, FaPrint, FaPlane, FaHourglassHalf } from "react-icons/fa";
import { AirlineLogo, Price } from "@/components/flights/FlightCard";
import { airportInfo, clock, datePart, formatDate } from "@/lib/flights/offerModel";
import { bookingTotal, isTicketed } from "@/lib/flights/checkoutFlow";
import { t as dict } from "./i18n";
import c from "./checkout.module.css";
import s from "@/components/flights/flights.module.css";

const ticketFor = (booking, p, i) =>
  p.ticket_number || booking.tickets?.find((tk) => tk.passenger_id === p.id)?.ticket_number || booking.tickets?.[i]?.ticket_number || booking.tickets?.[i]?.number || null;

export default function Confirmation({ lang, booking, email, onNewSearch, onMyBookings }) {
  const L = dict(lang);
  const ticketed = isTicketed(booking);
  const paid = String(booking.payment_status || "").toUpperCase() === "PAID" || ticketed;
  const segments = booking.segments || [];

  return (
    <>
      <section className={c.card}>
        <div className={c.hero}>
          <div className={`${c.heroIcon} ${ticketed ? "" : c.heroPending}`}>{ticketed ? <FaCheck /> : <FaHourglassHalf />}</div>
          <h1>{ticketed ? L.doneTicketed : paid ? L.donePending : L.doneHeld}</h1>
          <p>{ticketed ? L.doneTicketedSub(email) : paid ? L.donePendingSub : ""}</p>
        </div>
        <div className={c.refGrid}>
          <div className={c.refCell}>
            <small>{L.bookingRef}</small>
            <strong dir="ltr">{booking.order_reference}</strong>
          </div>
          <div className={c.refCell}>
            <small>{L.pnr}</small>
            <strong dir="ltr">{booking.airline_pnr || booking.gds_pnr || L.pending}</strong>
          </div>
          <div className={c.refCell}>
            <small>{L.paid}</small>
            <strong>
              <Price value={bookingTotal(booking)} />
            </strong>
          </div>
        </div>
      </section>

      <section className={c.card}>
        <div className={c.cardHead}>
          <h2>
            <FaPlane size={14} /> {L.summary}
          </h2>
        </div>
        <div className={c.cardBody}>
          {segments.map((s, i) => (
            <div key={s.id || i} className={c.sumTimes} style={{ padding: "10px 0", borderBottom: i < segments.length - 1 ? "1px solid var(--line)" : 0 }}>
              <div>
                <div className={c.sumTime}>{clock(s.departure_datetime)}</div>
                <div className={c.sumCode}>
                  {airportInfo(s.departure_airport).city} ({s.departure_airport})
                </div>
                <div className={c.sumCode}>{formatDate(datePart(s.departure_datetime), lang)}</div>
              </div>
              <div className={c.sumMid}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <AirlineLogo code={s.marketing_carrier} /> {s.marketing_carrier} {s.flight_number}
                </div>
                <hr />
                {s.booking_class}
              </div>
              <div style={{ textAlign: "end" }}>
                <div className={c.sumTime}>{clock(s.arrival_datetime)}</div>
                <div className={c.sumCode}>
                  {airportInfo(s.arrival_airport).city} ({s.arrival_airport})
                </div>
                <div className={c.sumCode}>{formatDate(datePart(s.arrival_datetime), lang)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={c.card}>
        <div className={c.cardHead}>
          <h2>{L.passengers}</h2>
        </div>
        <div className={c.cardBody}>
          <table className={c.table}>
            <thead>
              <tr>
                <th>{L.passengers}</th>
                <th>{L.passport}</th>
                <th>{L.ticketNo}</th>
              </tr>
            </thead>
            <tbody>
              {(booking.passengers || []).map((p, i) => (
                <tr key={p.id || i}>
                  <td>
                    <strong>
                      {p.title} {p.first_name} {p.last_name}
                    </strong>
                    <br />
                    <small style={{ color: "var(--muted)" }}>{L.types[p.passenger_type] || p.passenger_type}</small>
                  </td>
                  <td dir="ltr">{p.passport_number ? `•••${String(p.passport_number).slice(-3)}` : "—"}</td>
                  <td dir="ltr">{ticketFor(booking, p, i) || <span style={{ color: "var(--muted)" }}>{L.pending}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={`${c.actions} ${c.noPrint}`}>
        {ticketed && (
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => window.print()}>
            <FaPrint /> {L.print}
          </button>
        )}
        <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={onMyBookings}>
          {L.myBookings}
        </button>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onNewSearch}>
          {L.bookAnother}
        </button>
      </div>
    </>
  );
}
