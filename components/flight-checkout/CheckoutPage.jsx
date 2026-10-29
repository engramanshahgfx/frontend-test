"use client";

// Flight checkout: travellers → payment → confirmation.
//
// The airline confirms the fare at the hold, before the payment step opens. From then on the order's
// server total is the only price shown or charged; the search price is an estimate until then.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaLock, FaExclamationCircle } from "react-icons/fa";
import {
  startBooking, addPassengers, holdBooking, retrieveBooking, payBooking,
  bookingTotal, isTicketed, friendlyError, isExpiredSelection,
} from "@/lib/flights/checkoutFlow";
import { buildSearchUrl } from "@/lib/flights/offerModel";
import TravellerForm, { emptyContact, emptyTraveller, validateCheckout } from "./TravellerForm";
import TripSummary from "./TripSummary";
import PaymentPanel from "./PaymentPanel";
import Confirmation from "./Confirmation";
import { t as dict } from "./i18n";
import s from "@/components/flights/flights.module.css";
import c from "./checkout.module.css";

const SESSION_KEY = "flightCheckout";
const selectionKey = (sel) => (sel ? (sel.selectedOfferIds || [sel.offerId]).join("|") + "@" + (sel.searchId || "") : "");

const readJSON = (store, key) => {
  try {
    return JSON.parse(store.getItem(key) || "null");
  } catch {
    return null;
  }
};

const travellersFor = (sel) => [
  ...Array.from({ length: sel?.adults || 1 }, () => emptyTraveller("ADT")),
  ...Array.from({ length: sel?.children || 0 }, () => emptyTraveller("CHD")),
  ...Array.from({ length: sel?.infants || 0 }, () => emptyTraveller("INF")),
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function Stepper({ lang, step }) {
  const L = dict(lang);
  const index = { travellers: 0, payment: 1, done: 2 }[step];
  return (
    <ol className={c.stepper}>
      {L.steps.map((label, i) => (
        <li key={label} className={`${c.step} ${i === index ? c.stepActive : ""} ${i < index ? c.stepDone : ""}`}>
          <span className={c.dot}>{i < index ? "✓" : i + 1}</span>
          <span className={c.stepLabel}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function CheckoutPage({ lang: langProp }) {
  const router = useRouter();
  const lang = langProp === "ar" ? "ar" : "en";
  const L = dict(lang);

  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState(null);
  const [step, setStep] = useState("travellers");
  const [contact, setContact] = useState(emptyContact);
  const [travellers, setTravellers] = useState([]);
  const [errors, setErrors] = useState({});
  const [orderRef, setOrderRef] = useState(null);
  const [booking, setBooking] = useState(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [working, setWorking] = useState(null);
  const [error, setError] = useState(null);
  const [expiredSel, setExpiredSel] = useState(false);
  const busy = useRef(false);

  const persist = (patch) => {
    try {
      const prev = readJSON(sessionStorage, SESSION_KEY) || {};
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, ...patch }));
    } catch {
      /* resume after refresh is a convenience only */
    }
  };

  // Waits for the airline's ticket. Moyasar's webhook tickets the same order on the server, so a
  // paid booking can be mid-ticketing while this page's own call is refused.
  const awaitTicket = async (ref, first = null) => {
    let b = first?.order_reference ? first : await retrieveBooking(ref);
    for (let i = 0; i < 30 && !isTicketed(b) && String(b.ticket_status).toUpperCase() !== "TICKETING_FAILED"; i++) {
      await wait(3000);
      b = await retrieveBooking(ref);
    }
    return b;
  };

  const settled = useRef(null);

  // Payment handed back by Moyasar (redirect after 3-D Secure) or by the inline form.
  const settlePayment = useCallback(async (ref, paymentId) => {
    if (settled.current === paymentId) return;
    settled.current = paymentId;
    setStep("done");
    setWorking("verify");
    setError(null);
    let payError = null;
    try {
      await payBooking(ref, paymentId);
    } catch (err) {
      payError = err;
    }
    try {
      const current = await retrieveBooking(ref);
      const paid = String(current.payment_status).toUpperCase() === "PAID";
      if (payError && !paid) {
        // The gateway did not settle it: the customer can pay again while the hold lasts.
        setBooking(current);
        setStep("payment");
        setError(friendlyError(payError, lang));
        return;
      }
      setWorking("ticket");
      // The pay response carries only the status; the booking record has the itinerary and travellers.
      const b = await awaitTicket(ref, current);
      setBooking(b);
      if (String(b.ticket_status).toUpperCase() === "TICKETING_FAILED") setError(friendlyError(payError || { code: "TICKETING_FAILED" }, lang));
      try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem("selectedFlight");
      } catch {
        /* nothing to clean */
      }
    } catch (err) {
      setError(friendlyError(payError || err, lang));
    } finally {
      setWorking(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Runs once: the payment parameters are consumed on the first pass, and a second pass (React's
  // development double-invoke) would otherwise resume the booking over the confirmation.
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const params = new URLSearchParams(window.location.search);
    const returnRef = params.get("order_ref") || params.get("order_reference");
    const paymentId = params.get("id");
    const payStatus = (params.get("status") || "").toLowerCase();
    const sel = readJSON(localStorage, "selectedFlight");
    const saved = readJSON(sessionStorage, SESSION_KEY);

    setSelection(sel);
    setTravellers(travellersFor(sel));
    if (saved?.contact) setContact(saved.contact);

    if (returnRef) {
      // One-shot parameters: a reload must not replay the payment.
      window.history.replaceState(null, "", window.location.pathname);
      setOrderRef(returnRef);
      if (paymentId && !["failed", "voided", "refunded"].includes(payStatus)) {
        settlePayment(returnRef, paymentId);
      } else {
        setError(params.get("message") || (lang === "ar" ? "لم تكتمل عملية الدفع. يمكنك المحاولة مرة أخرى." : "The payment was not completed. You can try again."));
        retrieveBooking(returnRef)
          .then((b) => {
            setBooking(b);
            setHoldExpiresAt(saved?.holdExpiresAt || null);
            setStep("payment");
          })
          .catch(() => setStep("travellers"));
      }
      setReady(true);
      return;
    }

    // Resume a booking that already reached payment for this same selection.
    if (sel && saved?.orderRef && saved.key === selectionKey(sel) && saved.holdExpiresAt && new Date(saved.holdExpiresAt) > new Date()) {
      setOrderRef(saved.orderRef);
      setHoldExpiresAt(saved.holdExpiresAt);
      retrieveBooking(saved.orderRef)
        .then((b) => {
          setBooking(b);
          if (String(b.booking_status).toUpperCase() === "ON_HOLD") setStep("payment");
        })
        .catch(() => sessionStorage.removeItem(SESSION_KEY))
        .finally(() => setReady(true));
      return;
    }
    setReady(true);
  }, [lang, settlePayment]);

  const legDates = selection?.legs?.length
    ? { firstDate: selection.legs[0].date, lastDate: selection.legs[selection.legs.length - 1].date }
    : { firstDate: selection?.departureDate, lastDate: selection?.returnDate || selection?.departureDate };

  const searchAgainUrl = selection
    ? buildSearchUrl(lang, {
        origin: selection.origin,
        destination: selection.destination,
        departDate: selection.departureDate,
        returnDate: selection.isRoundTrip ? selection.returnDate : "",
        cabin: selection.cabin || "Economy",
        adults: selection.adults || 1,
        children: selection.children || 0,
        infants: selection.infants || 0,
      })
    : `/${lang}/flights`;

  const submitTravellers = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    const found = validateCheckout(contact, travellers, legDates, lang);
    setErrors(found);
    if (Object.keys(found).length) {
      setError(L.fixErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    busy.current = true;
    setError(null);
    const phone = `${contact.dialCode}${contact.phone.replace(/\D/g, "")}`;
    const lead = travellers[0];
    try {
      let ref = orderRef;
      if (!ref) {
        setWorking("start");
        const started = await startBooking(selection, { email: contact.email.trim(), firstName: lead.firstName.trim(), lastName: lead.lastName.trim(), phone });
        ref = started.order_reference;
        setOrderRef(ref);
      }
      setWorking("passengers");
      try {
        await addPassengers(ref, travellers, { email: contact.email.trim(), phone });
      } catch (err) {
        // Already held from an earlier attempt: the travellers are saved, continue to payment.
        if (err.code !== "BOOKING_LOCKED") throw err;
      }
      setWorking("hold");
      const held = await holdBooking(ref).catch((err) => {
        if (err.code === "BOOKING_LOCKED") return {};
        throw err;
      });
      const b = await retrieveBooking(ref);
      const expires = held.hold_expires_at || b.hold_expires_at || new Date(Date.now() + 30 * 60000).toISOString();
      setBooking(b);
      setHoldExpiresAt(expires);
      persist({ key: selectionKey(selection), orderRef: ref, holdExpiresAt: expires, contact });
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (isExpiredSelection(err)) setExpiredSel(true);
      // "The airline requires the visa type of passenger 2 ..." marks that traveller's field.
      const visaFor = /visa type of passenger (\d+)/i.exec(err?.message || "");
      if (visaFor) setErrors({ [`${Number(visaFor[1]) - 1}.visaType`]: L.visaRequired });
      setError(friendlyError(err, lang));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      busy.current = false;
      setWorking(null);
    }
  };

  const onPaid = useCallback((paymentId) => settlePayment(orderRef, paymentId), [orderRef, settlePayment]);
  const onExpired = useCallback(() => {
    setExpiredSel(true);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* nothing to clean */
    }
  }, []);

  const shell = (children) => (
    <div className={s.page} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className={`${s.container} ${c.shell}`}>{children}</div>
    </div>
  );

  if (!ready) {
    return shell(<div className={s.skeleton} style={{ height: 420 }} />);
  }

  if (!selection && !orderRef) {
    return shell(
      <div className={`${s.panel} ${s.empty}`}>
        <h2>{L.noFlight}</h2>
        <p>{L.noFlightSub}</p>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => router.push(`/${lang}/flights`)}>
          {L.searchFlights}
        </button>
      </div>
    );
  }

  const workingBanner = working && (
    <div className={c.working} role="status">
      <span className={c.spinner} /> {L.working[working]}
    </div>
  );

  const errorBanner = error && (
    <div className={c.alert} role="alert">
      <FaExclamationCircle style={{ marginTop: 3, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        {error}
        {expiredSel && (
          <div style={{ marginTop: 10 }}>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => router.push(searchAgainUrl)}>
              {L.newSearch}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (step === "done") {
    return shell(
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className={`${c.topRow} ${c.noPrint}`}>
          <span />
          <Stepper lang={lang} step="done" />
        </div>
        {workingBanner}
        {errorBanner}
        {booking ? (
          <Confirmation
            lang={lang}
            booking={booking}
            email={booking.passengers?.[0]?.email || contact.email}
            onNewSearch={() => router.push(`/${lang}/flights`)}
            onMyBookings={() => router.push(`/${lang}/bookings`)}
          />
        ) : (
          <div className={s.skeleton} style={{ height: 320 }} />
        )}
      </div>
    );
  }

  const confirmedTotal = step === "payment" && booking ? bookingTotal(booking) : null;

  return shell(
    <>
      <div className={c.topRow}>
        <button type="button" className={s.linkBtn} onClick={() => (step === "payment" ? router.push(searchAgainUrl) : router.back())}>
          <FaArrowLeft size={11} style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }} /> {L.back}
        </button>
        <Stepper lang={lang} step={step} />
      </div>

      <div className={c.layout}>
        <main style={{ minWidth: 0 }}>
          {workingBanner}
          {errorBanner}

          {step === "travellers" && (
            <form onSubmit={submitTravellers} noValidate>
              <TravellerForm
                lang={lang}
                contact={contact}
                travellers={travellers}
                errors={errors}
                disabled={Boolean(working)}
                onContact={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
                onTraveller={(i, patch) => setTravellers((prev) => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)))}
                {...legDates}
              />
              <div className={c.formFoot}>
                <span className={c.secureNote}>
                  <FaLock size={12} /> {L.secure}
                </span>
                <button type="submit" className={`${s.btn} ${s.btnCta}`} disabled={Boolean(working)} style={{ minWidth: 220 }}>
                  {working ? L.working[working] : L.continuePay}
                </button>
              </div>
            </form>
          )}

          {step === "payment" && booking && !expiredSel && (
            <PaymentPanel
              lang={lang}
              orderRef={orderRef}
              amount={bookingTotal(booking)}
              searchPrice={selection?.price}
              holdExpiresAt={holdExpiresAt}
              onPaid={onPaid}
              onExpired={onExpired}
            />
          )}
          {step === "payment" && expiredSel && (
            <div className={c.alert}>
              <div style={{ flex: 1 }}>
                {L.holdExpired}
                <div style={{ marginTop: 10 }}>
                  <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => router.push(searchAgainUrl)}>
                    {L.newSearch}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {selection && (
          <aside className={c.aside}>
            <TripSummary lang={lang} selection={selection} confirmedTotal={confirmedTotal} />
          </aside>
        )}
      </div>
    </>
  );
}
