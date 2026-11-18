"use client";

// Hotel checkout: guest details → hold (price confirmed by the hotel) → Moyasar payment → booked.
//
// The amount is never computed here. The hold returns the total the backend will accept, Moyasar is
// asked for exactly that, and the backend verifies the payment against the hold before it books.
// The hold's token lives in sessionStorage so the 3-D Secure redirect can come back and finish.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaLock, FaRegClock, FaCheck, FaCheckCircle, FaExclamationTriangle, FaHourglassHalf, FaInfoCircle, FaUser, FaEnvelope, FaPrint,
  FaShieldAlt, FaBed, FaCoffee, FaTimesCircle,
} from "react-icons/fa";
import { Price } from "@/components/flights/FlightCard";
import { formatDate } from "@/lib/flights/offerModel";
import { getCountryOptions } from "@/lib/countries";
import { getMoyasarPublishableKey } from "@/lib/moyasarClientKey";
import hotelApi from "@/lib/hotels/hotelApi";
import { storage, SELECTION_KEY, bookingKey, searchUrl, parseSearch } from "@/lib/hotels/hotelModel";
import { Stars } from "./HotelSearchPage";
import { formatDeadline, titleCase } from "./HotelDetailsPage";
import { t as dict, friendlyError } from "./i18n";
import fs from "@/components/flights/flights.module.css";
import s from "./hotels.module.css";

const MOYASAR_VERSION = "1.14.0";
const SELECTION_TTL_MS = 45 * 60 * 1000;
const DIAL_CODES = ["+966", "+971", "+965", "+973", "+974", "+968", "+962", "+20", "+212", "+90", "+92", "+91", "+880", "+62", "+60", "+44", "+1"];
const NAME_RE = /^[\p{L}][\p{L}' .-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function loadMoyasar() {
  if (window.Moyasar) return Promise.resolve();
  if (!document.querySelector('link[href*="moyasar.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.css`;
    document.head.appendChild(link);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.js`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function useCountdown(until) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!until) return undefined;
    const end = new Date(until).getTime();
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);
  return left;
}

// ── Pieces ─────────────────────────────────────────────────────────

function Steps({ step, lang }) {
  const L = dict(lang);
  return (
    <div className={s.stepper}>
      {L.steps.map((label, i) => (
        <span key={label} style={{ display: "contents" }}>
          {i > 0 && <span className={s.stepLine} />}
          <span className={`${s.step} ${i === step ? s.stepOn : ""} ${i < step ? s.stepDone : ""}`}>
            <span className={s.stepNum}>{i < step ? <FaCheck size={11} /> : i + 1}</span>
            <span>{label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

function Field({ label, error, children, className }) {
  return (
    <div className={`${s.inputWrap} ${className || ""}`}>
      <label>{label}</label>
      {children}
      {error && <span className={s.fieldErr}>{error}</span>}
    </div>
  );
}

function Summary({ sel, booking, lang }) {
  const L = dict(lang);
  const offer = sel?.offer;
  const hotel = sel?.hotel || {};
  // After the hold the server's own pricing; before it, the offer's room price, fee and total.
  const held = booking?.pricing;
  const roomPrice = held ? held.room_price_sar ?? (held.supplier_subtotal_sar || 0) + (held.admin_markup_sar || 0) : offer?.price_sar;
  const fee = held ? held.service_fee_sar ?? held.progressive_service_fee_sar : offer?.service_fee_sar;
  const feePct = held?.service_fee_percent ?? offer?.service_fee_percent;
  const total = booking?.amount_sar ?? offer?.total_sar ?? offer?.price_sar;
  const roomsCount = booking?.rooms || sel?.rooms?.length || 1;
  const nights = booking?.nights || sel?.nights || 1;
  const checkIn = booking?.check_in || sel?.checkIn;
  const checkOut = booking?.check_out || sel?.checkOut;
  const breakfast = /breakfast|half|full|all\s*incl/i.test(`${offer?.board || ""} ${offer?.board_type || ""}`);

  return (
    <aside className={s.summary}>
      <div className={s.sumCard}>
        {hotel.image && <img className={s.sumImg} src={hotel.image} alt={hotel.name || ""} />}
        <div className={s.sumBody}>
          <Stars n={hotel.stars} />
          <h3>{booking?.hotel_name || hotel.name}</h3>
          {hotel.address && <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{hotel.address}</div>}
          <div className={s.sumDates}>
            <div>
              <small>{L.checkIn}</small>
              <strong>{formatDate(checkIn, lang)}</strong>
              {hotel.checkInTime && <small>{hotel.checkInTime}</small>}
            </div>
            <div>
              <small>{L.checkOut}</small>
              <strong>{formatDate(checkOut, lang)}</strong>
              {hotel.checkOutTime && <small>{hotel.checkOutTime}</small>}
            </div>
          </div>
          <div style={{ fontSize: "0.86rem", color: "var(--ink-2)", display: "grid", gap: 6 }}>
            <span>{L.stay(nights, roomsCount)}</span>
            {offer?.rooms?.length > 0 && (
              <span>
                <FaBed size={12} /> {offer.rooms.map((r) => titleCase(r.name)).join(" + ")}
              </span>
            )}
            {offer && (
              <span>
                {breakfast ? <FaCoffee size={12} /> : <FaBed size={12} />} {offer.board ? titleCase(offer.board) : L.roomOnly}
              </span>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{L.priceSummary}</div>
            {roomPrice != null && (
              <div className={s.sumLine}>
                <span>{L.roomPrice}</span>
                <span>
                  <Price value={roomPrice} />
                </span>
              </div>
            )}
            {fee != null && (
              <div className={s.sumLine}>
                <span>{feePct ? L.serviceFeePct(feePct) : L.serviceFee}</span>
                <span>
                  <Price value={fee} />
                </span>
              </div>
            )}
            {total != null && (
              <div className={`${s.sumLine} ${s.sumTotal}`}>
                <span>{L.total}</span>
                <span>
                  <Price value={total} />
                </span>
              </div>
            )}
            <div style={{ fontSize: "0.74rem", color: "var(--muted)" }}>{L.inclTaxes}</div>
          </div>

          {offer && (
            <div className={s.sumNote} style={offer.free_cancellation_until ? { color: "var(--ok)" } : undefined}>
              {offer.free_cancellation_until ? <FaCheck /> : <FaInfoCircle />}
              {offer.free_cancellation_until
                ? L.freeCancelNote(formatDeadline(offer.free_cancellation_until, lang))
                : offer.refundable
                ? L.refundable
                : L.nonRefundableNote}
            </div>
          )}
          <div className={s.sumNote}>
            <FaShieldAlt /> {L.secureNote}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Step 1: guests ────────────────────────────────────────────────

function emptyGuest(type, age) {
  return { title: type === "child" ? "Mstr" : "Mr", first_name: "", last_name: "", type, ...(type === "child" ? { age } : {}) };
}

function GuestForm({ sel, lang, onHeld }) {
  const L = dict(lang);
  const countries = useMemo(() => getCountryOptions(lang), [lang]);
  const [contact, setContact] = useState({
    title: "Mr", first_name: "", last_name: "", email: "", mobile_country_code: "+966", mobile: "",
    country_code: sel.nationality || "SA", city: "", address: "", postal_code: "",
  });
  const [rooms, setRooms] = useState(() =>
    (sel.rooms?.length ? sel.rooms : [{ adults: 1, childAges: [] }]).map((r) => ({
      guests: [...Array.from({ length: r.adults }, () => emptyGuest("adult")), ...r.childAges.map((a) => emptyGuest("child", a))],
    }))
  );
  const [sameAsContact, setSameAsContact] = useState(true);
  const [special, setSpecial] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const setC = (k, v) => setContact((c) => ({ ...c, [k]: v }));
  const setG = (ri, gi, k, v) =>
    setRooms((rs) => rs.map((r, i) => (i !== ri ? r : { guests: r.guests.map((g, j) => (j === gi ? { ...g, [k]: v } : g)) })));

  // Room 1's lead guest follows the contact while the box is ticked.
  const effectiveRooms = useMemo(
    () =>
      rooms.map((r, i) =>
        i === 0 && sameAsContact
          ? { guests: r.guests.map((g, j) => (j === 0 ? { ...g, title: contact.title, first_name: contact.first_name, last_name: contact.last_name } : g)) }
          : r
      ),
    [rooms, sameAsContact, contact.title, contact.first_name, contact.last_name]
  );

  const validate = () => {
    const e = {};
    const name = (k, v) => {
      if (!v.trim()) e[k] = L.required;
      else if (!NAME_RE.test(v.trim())) e[k] = L.latinOnly;
    };
    name("first_name", contact.first_name);
    name("last_name", contact.last_name);
    if (!EMAIL_RE.test(contact.email.trim())) e.email = L.invalidEmail;
    if (!/^[0-9 ]{6,15}$/.test(contact.mobile.trim())) e.mobile = L.invalidMobile;
    if (!contact.city.trim()) e.city = L.required;
    if (!contact.address.trim()) e.address = L.required;
    effectiveRooms.forEach((r, ri) =>
      r.guests.forEach((g, gi) => {
        if (ri === 0 && gi === 0 && sameAsContact) return;
        name(`g${ri}_${gi}_first`, g.first_name);
        name(`g${ri}_${gi}_last`, g.last_name);
      })
    );
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError(null);
    if (!validate()) {
      setTimeout(() => document.querySelector(`.${s.inputError}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }
    setBusy(true);
    try {
      const res = await hotelApi.hold({
        search_id: sel.searchId,
        tracing_key: sel.tracingKey || undefined,
        hotel_id: sel.hotel.id,
        hotel_name: sel.hotel.name,
        // Shown on the emailed voucher and in admin; display only.
        hotel_address: sel.hotel.address || undefined,
        hotel_image: /^https:\/\//i.test(sel.hotel.image || "") ? sel.hotel.image : undefined,
        star_rating: sel.hotel.stars || undefined,
        check_in_time: sel.hotel.checkInTime || undefined,
        check_out_time: sel.hotel.checkOutTime || undefined,
        lang: lang === "ar" ? "ar" : "en",
        provider_id: sel.offer.provider_id,
        recommendation_id: sel.offer.recommendation_id,
        special_request: special.trim() || undefined,
        contact: {
          ...contact,
          first_name: contact.first_name.trim(),
          last_name: contact.last_name.trim(),
          email: contact.email.trim(),
          mobile: contact.mobile.replace(/\s+/g, ""),
          city: contact.city.trim(),
          address: contact.address.trim(),
          postal_code: contact.postal_code.trim() || undefined,
          nationality: sel.nationality,
        },
        rooms: effectiveRooms.map((r) => ({
          guests: r.guests.map((g) => ({ ...g, first_name: g.first_name.trim(), last_name: g.last_name.trim() })),
        })),
      });
      onHeld(res);
    } catch (err) {
      setError(err);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const err = (k) => errors[k];
  const cls = (k) => `${s.input} ${errors[k] ? s.inputError : ""}`;
  const soldOut = ["HOTEL_SOLD_OUT", "RATE_EXPIRED", "SEARCH_NOT_FOUND"].includes(error?.code);

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <div className={s.alert}>
          <FaExclamationTriangle />
          <div>
            {friendlyError(error, lang)}
            {soldOut && sel.query && (
              <div style={{ marginTop: 8 }}>
                <a className={fs.linkBtn} href={`/${lang}/hotels?${sel.query}`}>
                  {L.searchAgain}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <section className={s.formCard}>
        <div className={s.formHead}>
          <h2>
            <FaEnvelope size={14} /> {L.contactTitle}
          </h2>
          <p>{L.contactHint}</p>
        </div>
        <div className={s.formBody}>
          <div className={s.formGrid}>
            <Field label={L.title}>
              <select className={s.input} value={contact.title} onChange={(e) => setC("title", e.target.value)}>
                {["Mr", "Mrs", "Ms", "Miss"].map((t) => (
                  <option key={t} value={t}>
                    {L.titles[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={L.firstName} error={err("first_name")}>
              <input className={cls("first_name")} value={contact.first_name} onChange={(e) => setC("first_name", e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label={L.lastName} error={err("last_name")}>
              <input className={cls("last_name")} value={contact.last_name} onChange={(e) => setC("last_name", e.target.value)} autoComplete="family-name" />
            </Field>
          </div>
          <div className={s.formGrid2}>
            <Field label={L.email} error={err("email")}>
              <input className={cls("email")} type="email" dir="ltr" value={contact.email} onChange={(e) => setC("email", e.target.value)} autoComplete="email" />
            </Field>
            <Field label={L.mobile} error={err("mobile")}>
              <div className={s.phoneRow} dir="ltr">
                <select className={s.input} value={contact.mobile_country_code} onChange={(e) => setC("mobile_country_code", e.target.value)} aria-label={L.countryCode}>
                  {DIAL_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input className={cls("mobile")} inputMode="tel" value={contact.mobile} onChange={(e) => setC("mobile", e.target.value.replace(/[^\d ]/g, ""))} autoComplete="tel-national" />
              </div>
            </Field>
            <Field label={L.country}>
              <select className={s.input} value={contact.country_code} onChange={(e) => setC("country_code", e.target.value)}>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={L.city} error={err("city")}>
              <input className={cls("city")} value={contact.city} onChange={(e) => setC("city", e.target.value)} autoComplete="address-level2" />
            </Field>
            <Field label={L.address} error={err("address")}>
              <input className={cls("address")} value={contact.address} onChange={(e) => setC("address", e.target.value)} autoComplete="street-address" />
            </Field>
            <Field label={L.postalCode}>
              <input className={s.input} value={contact.postal_code} onChange={(e) => setC("postal_code", e.target.value)} autoComplete="postal-code" />
            </Field>
          </div>
        </div>
      </section>

      <section className={s.formCard}>
        <div className={s.formHead}>
          <h2>
            <FaUser size={14} /> {L.guestsTitle}
          </h2>
          <p>{L.guestsHint}</p>
        </div>
        <div className={s.formBody}>
          <label className={s.checkRow}>
            <input type="checkbox" checked={sameAsContact} onChange={(e) => setSameAsContact(e.target.checked)} />
            {L.sameAsContact}
          </label>
          {effectiveRooms.map((room, ri) => {
            let adultNo = 0;
            let childNo = 0;
            return (
              <div key={ri} className={s.guestRoom}>
                {effectiveRooms.length > 1 && <div className={s.guestRoomTitle}>{L.roomN(ri + 1)}</div>}
                {room.guests.map((g, gi) => {
                  const isChild = g.type === "child";
                  const label = isChild ? L.childN(++childNo, g.age) : L.adultN(++adultNo);
                  const locked = ri === 0 && gi === 0 && sameAsContact;
                  return (
                    <div key={gi}>
                      <div className={s.guestLabel}>
                        {label}
                        {gi === 0 && <span className={s.leadTag}>{L.leadGuest}</span>}
                      </div>
                      <div className={s.formGrid}>
                        <Field label={L.title}>
                          <select className={s.input} value={g.title} disabled={locked} onChange={(e) => setG(ri, gi, "title", e.target.value)}>
                            {(isChild ? ["Mstr", "Miss"] : ["Mr", "Mrs", "Ms", "Miss"]).map((t) => (
                              <option key={t} value={t}>
                                {L.titles[t]}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label={L.firstName} error={err(`g${ri}_${gi}_first`)}>
                          <input className={cls(`g${ri}_${gi}_first`)} value={g.first_name} disabled={locked} onChange={(e) => setG(ri, gi, "first_name", e.target.value)} />
                        </Field>
                        <Field label={L.lastName} error={err(`g${ri}_${gi}_last`)}>
                          <input className={cls(`g${ri}_${gi}_last`)} value={g.last_name} disabled={locked} onChange={(e) => setG(ri, gi, "last_name", e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{ marginTop: 18 }}>
            <Field label={L.specialRequest}>
              <textarea className={s.input} value={special} maxLength={500} placeholder={L.specialRequestPh} onChange={(e) => setSpecial(e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      <div className={s.submitBar}>
        <p>{L.agree}</p>
        <button type="submit" className={`${fs.btn} ${fs.btnCta}`} disabled={busy} style={{ minWidth: 220 }}>
          {busy ? (
            <>
              <span className={s.spinner} style={{ borderColor: "rgba(255,255,255,.4)", borderTopColor: "#fff" }} /> {L.holding}
            </>
          ) : (
            <>
              <FaLock size={13} /> {L.continuePay}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Step 2: payment ───────────────────────────────────────────────

function PaymentStep({ booking, searchPrice, lang, onPaid, onExpired }) {
  const L = dict(lang);
  const formRef = useRef(null);
  const [state, setState] = useState("loading");
  const left = useCountdown(booking.hold_expires_at);
  const expired = left === 0;
  const txn = booking.transaction_id;
  const amount = booking.amount_sar;

  useEffect(() => {
    if (expired) onExpired?.();
  }, [expired, onExpired]);

  useEffect(() => {
    const key = getMoyasarPublishableKey();
    if (!key) {
      setState("missing-key");
      return undefined;
    }
    let cancelled = false;
    loadMoyasar()
      .then(() => {
        if (cancelled || !formRef.current) return;
        formRef.current.innerHTML = "";
        window.Moyasar.init({
          element: formRef.current,
          amount: Math.round(amount * 100),
          currency: "SAR",
          description: `Hotel booking ${txn}`,
          publishable_api_key: key,
          // The backend refuses a payment whose metadata names another booking.
          metadata: { transaction_id: String(txn) },
          // Moyasar appends id/status/message; the outcome is decided by the server, never the URL.
          callback_url: `${window.location.origin}/${lang}/hotels/booking?txn=${encodeURIComponent(txn)}`,
          methods: ["creditcard", "stcpay", "applepay"],
          apple_pay: { country: "SA", label: "Tilal Rimal", validate_merchant_url: "https://api.moyasar.com/v1/applepay/initiate" },
          language: lang === "ar" ? "ar" : "en",
          on_completed: (payment) => {
            const status = String(payment?.status || "").toLowerCase();
            if (payment?.id && (status === "paid" || status === "captured")) onPaid(payment.id);
          },
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("failed"));
    return () => {
      cancelled = true;
    };
  }, [amount, txn, lang, onPaid]);

  const changed = searchPrice && Math.abs(searchPrice - amount) >= 0.01;
  const mm = left != null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : null;

  return (
    <section className={s.formCard}>
      <div className={s.formHead}>
        <div className={s.payHead}>
          <div>
            <h2>
              <FaLock size={14} /> {L.payTitle}
            </h2>
            <p>{L.payHint}</p>
          </div>
          {mm && !expired && (
            <span className={s.timer} role="timer">
              <FaRegClock /> {L.holdLeft(mm)}
            </span>
          )}
        </div>
      </div>
      <div className={s.formBody}>
        {changed && (
          <div className={`${s.alert} ${s.alertInfo}`}>
            <FaInfoCircle /> {L.priceChanged(Number(searchPrice).toFixed(2), Number(amount).toFixed(2))}
          </div>
        )}
        <div className={s.amountBox}>
          <span>
            {L.amountDue}
            <br />
            <small style={{ color: "var(--muted)" }}>
              {L.bookingNo}: <strong dir="ltr">{txn}</strong>
            </small>
          </span>
          <strong>
            <Price value={amount} />
          </strong>
        </div>
        {expired ? (
          <div className={s.alert}>
            <FaExclamationTriangle /> {L.holdExpired}
          </div>
        ) : state === "missing-key" || state === "failed" ? (
          <div className={s.alert}>
            <FaExclamationTriangle /> {L.gatewayMissing}
          </div>
        ) : (
          <>
            {state === "loading" && (
              <div className={s.working}>
                <span className={s.spinner} /> {L.payLoading}
              </div>
            )}
            <div ref={formRef} className={`mysr-form ${s.mysr}`} />
          </>
        )}
      </div>
    </section>
  );
}

// ── Step 3: result ────────────────────────────────────────────────

function Result({ booking, outcome, error, lang, sel }) {
  const L = dict(lang);
  const ok = booking?.booking_state === "CONFIRMED";
  const pending = !ok && (outcome === "pending" || booking?.booking_state === "PAYMENT_UNKNOWN" || booking?.booking_state === "PAYMENT_PENDING");
  const icon = ok ? <FaCheckCircle /> : pending ? <FaHourglassHalf /> : <FaTimesCircle />;
  const guests = booking?.guests || [];
  const search = sel?.query ? parseSearch(new URLSearchParams(sel.query)) : null;

  return (
    <div className={s.confirm}>
      <section className={s.formCard}>
        <div className={s.confirmHero}>
          <div className={`${s.confirmIcon} ${ok ? "" : pending ? s.confirmIconWarn : s.confirmIconFail}`}>{icon}</div>
          <h1>{ok ? L.confirmedTitle : pending ? L.pendingTitle : L.failedTitle}</h1>
          <p>{ok ? L.confirmedSub(booking.contact_email || "") : error ? friendlyError(error, lang) : ""}</p>
          {booking?.transaction_id && (
            <div className={s.refBox}>
              <small>{L.bookingNo}</small>
              <strong dir="ltr">{booking.transaction_id}</strong>
            </div>
          )}
        </div>
      </section>

      {booking && (
        <section className={s.formCard}>
          <div className={s.formHead}>
            <h2>{L.bookingDetails}</h2>
          </div>
          <div className={s.formBody}>
            <div className={s.confirmGrid}>
              <div>
                <small>{L.yourStay}</small>
                <strong>{booking.hotel_name}</strong>
              </div>
              <div>
                <small>{L.stay(booking.nights, booking.rooms)}</small>
                <strong>
                  {formatDate(booking.check_in, lang)} – {formatDate(booking.check_out, lang)}
                </strong>
              </div>
              <div>
                <small>{L.guestsLabel}</small>
                <strong>{guests.map((g) => `${g.first_name} ${g.last_name}`).join(", ") || "—"}</strong>
              </div>
              <div>
                <small>{ok ? L.paid : L.total}</small>
                <strong style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Price value={booking.amount_sar} />
                </strong>
              </div>
            </div>
            {!ok && <p style={{ marginTop: 16, fontSize: "0.86rem", color: "var(--muted)" }}>{L.supportNote}</p>}
          </div>
        </section>
      )}

      <div className={s.confirmActions}>
        {ok && (
          <button type="button" className={`${fs.btn} ${fs.btnGhost}`} onClick={() => window.print()}>
            <FaPrint /> {L.printPage}
          </button>
        )}
        <a className={`${fs.btn} ${fs.btnPrimary}`} href={search ? searchUrl(lang, search) : `/${lang}/hotels`}>
          {L.searchMore}
        </a>
        <a className={`${fs.btn} ${fs.btnGhost}`} href={`/${lang}`}>
          {L.backHome}
        </a>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function HotelCheckoutPage({ lang = "en" }) {
  const L = dict(lang);
  const router = useRouter();
  const params = useSearchParams();
  const txnParam = params.get("txn");
  const paymentParam = params.get("id");

  const [sel, setSel] = useState(null);
  const [booking, setBooking] = useState(null);
  const [phase, setPhase] = useState("init"); // init | missing | guests | pay | confirming | done
  const [outcome, setOutcome] = useState(null);
  const [error, setError] = useState(null);
  const paying = useRef(false);
  // The hold we just placed: the URL then gains ?txn=, which must not reload what we already have.
  const heldTxn = useRef(null);

  const tokenFor = (txn) => storage.get(bookingKey(txn))?.token;

  const settle = useCallback(
    async (txn, paymentId) => {
      if (paying.current) return;
      paying.current = true;
      setPhase("confirming");
      setError(null);
      try {
        const res = await hotelApi.pay(txn, tokenFor(txn), paymentId);
        setBooking(res);
        setOutcome(res.booking_state === "CONFIRMED" ? "confirmed" : "pending");
      } catch (err) {
        setError(err);
        setOutcome(err.code === "BOOKING_PENDING" ? "pending" : "failed");
        // Show what we know about the booking alongside the error.
        try {
          setBooking(await hotelApi.booking(txn, tokenFor(txn)));
        } catch {
          /* keep the error */
        }
        // A payment the bank has not finished can be retried from the payment step.
        if (["PAYMENT_NOT_COMPLETED", "PAYMENT_VERIFICATION_UNAVAILABLE"].includes(err.code)) {
          paying.current = false;
          setPhase("pay");
          return;
        }
      }
      setPhase("done");
    },
    []
  );

  useEffect(() => {
    const stored = storage.get(SELECTION_KEY);
    if (stored) setSel(stored);

    if (txnParam && txnParam === heldTxn.current && !paymentParam) return;

    if (txnParam) {
      const token = tokenFor(txnParam);
      if (!token) {
        setPhase("missing");
        return;
      }
      if (paymentParam) {
        settle(txnParam, paymentParam);
        return;
      }
      hotelApi
        .booking(txnParam, token)
        .then((b) => {
          setBooking(b);
          if (b.booking_state === "HOLD_BO0") setPhase("pay");
          else {
            setOutcome(b.booking_state === "CONFIRMED" ? "confirmed" : "failed");
            setPhase("done");
          }
        })
        .catch((err) => {
          setError(err);
          setPhase("missing");
        });
      return;
    }

    if (!stored || Date.now() - (stored.at || 0) > SELECTION_TTL_MS || !stored.offer) {
      setPhase("missing");
      return;
    }
    setPhase("guests");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txnParam, paymentParam]);

  const onHeld = (res) => {
    storage.set(bookingKey(res.transaction_id), { token: res.token, at: Date.now() });
    heldTxn.current = String(res.transaction_id);
    setBooking(res);
    setPhase("pay");
    router.replace(`/${lang}/hotels/booking?txn=${encodeURIComponent(res.transaction_id)}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPaid = useCallback((paymentId) => booking && settle(booking.transaction_id, paymentId), [booking, settle]);

  const step = phase === "guests" ? 0 : phase === "pay" || phase === "confirming" ? 1 : 2;
  // A selection left over from another hotel must not describe this booking.
  const shownSel = !booking || String(sel?.hotel?.id) === String(booking.hotel_id) ? sel : null;

  return (
    <div className={`${fs.page} ${s.page}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className={`${fs.container} ${s.checkoutWrap}`}>
        {phase !== "missing" && phase !== "init" && <Steps step={step} lang={lang} />}

        {phase === "init" && <div className={fs.skeleton} style={{ height: 320 }} />}

        {phase === "missing" && (
          <div className={`${fs.panel} ${fs.empty}`}>
            <div className={fs.emptyIcon}>
              <FaBed />
            </div>
            <h2>{error ? friendlyError(error, lang) : L.selectionMissing}</h2>
            <div className={fs.emptyActions} style={{ marginTop: 16 }}>
              <a className={`${fs.btn} ${fs.btnPrimary}`} href={sel?.query ? `/${lang}/hotels?${sel.query}` : `/${lang}/hotels`}>
                {L.chooseAgain}
              </a>
            </div>
          </div>
        )}

        {(phase === "guests" || phase === "pay" || phase === "confirming") && (
          <div className={s.checkoutGrid}>
            <div>
              {phase === "guests" && sel && <GuestForm sel={sel} lang={lang} onHeld={onHeld} />}
              {phase === "pay" && booking && (
                <>
                  {error && (
                    <div className={s.alert}>
                      <FaExclamationTriangle /> {friendlyError(error, lang)}
                    </div>
                  )}
                  <PaymentStep
                    booking={booking}
                    searchPrice={shownSel?.offer?.total_sar ?? shownSel?.offer?.price_sar}
                    lang={lang}
                    onPaid={onPaid}
                    onExpired={() => storage.remove(bookingKey(booking.transaction_id))}
                  />
                </>
              )}
              {phase === "confirming" && (
                <section className={s.formCard}>
                  <div className={s.formBody}>
                    <div className={s.working}>
                      <span className={s.spinner} /> {L.confirming}
                    </div>
                  </div>
                </section>
              )}
            </div>
            <Summary sel={shownSel} booking={booking} lang={lang} />
          </div>
        )}

        {phase === "done" && <Result booking={booking} outcome={outcome} error={error} lang={lang} sel={sel} />}
      </div>
    </div>
  );
}
