"use client";

import { useEffect, useRef, useState } from "react";
import { FaLock, FaRegClock, FaInfoCircle } from "react-icons/fa";
import { getMoyasarPublishableKey } from "@/lib/moyasarClientKey";
import { Price } from "@/components/flights/FlightCard";
import { t as dict } from "./i18n";
import c from "./checkout.module.css";

const MOYASAR_VERSION = "1.14.0";

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
    if (!until) return;
    const end = new Date(until).getTime();
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);
  return left;
}

/**
 * @param amount the order total the backend confirmed after the hold. Moyasar is asked for exactly
 *   this, in halalas; the backend refuses a payment of any other amount.
 */
export default function PaymentPanel({ lang, orderRef, amount, searchPrice, holdExpiresAt, onPaid, onExpired }) {
  const L = dict(lang);
  const formRef = useRef(null);
  const [state, setState] = useState("loading"); // loading | ready | missing-key | failed
  const left = useCountdown(holdExpiresAt);
  const expired = left === 0;

  useEffect(() => {
    if (expired) onExpired?.();
  }, [expired, onExpired]);

  useEffect(() => {
    const key = getMoyasarPublishableKey();
    if (!key) {
      setState("missing-key");
      return;
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
          description: `Flight booking ${orderRef}`,
          publishable_api_key: key,
          // The backend checks this so a payment can only settle the booking it was made for.
          metadata: { order_reference: orderRef },
          // Moyasar appends id/status/message. The outcome is decided by the server, never the URL.
          // The reference stays raw: the redirect percent-encodes its spaces once, and pre-encoding
          // here double-encodes them ("%2520") so the reference matches no booking.
          callback_url: `${window.location.origin}/${lang}/flights/booking?order_ref=${orderRef}`,
          methods: ["creditcard", "stcpay", "applepay"],
          apple_pay: { country: "SA", label: "Tilal Rimal", validate_merchant_url: "https://api.moyasar.com/v1/applepay/initiate" },
          language: lang === "ar" ? "ar" : "en",
          on_completed: (payment) => {
            const status = String(payment?.status || "").toLowerCase();
            // A card that needs 3-D Secure returns here as "initiated" and continues via callback_url.
            if (payment?.id && (status === "paid" || status === "captured")) onPaid(payment.id);
          },
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("failed"));
    return () => {
      cancelled = true;
    };
  }, [amount, orderRef, lang, onPaid]);

  const changed = searchPrice && Math.abs(searchPrice - amount) >= 0.01;
  const mm = left != null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : null;

  return (
    <section className={c.card}>
      <div className={c.cardHead}>
        <div className={c.payHead}>
          <div>
            <h2>
              <FaLock size={14} /> {L.payTitle}
            </h2>
            <p>{L.payHint}</p>
          </div>
          {mm && !expired && (
            <span className={c.timer} role="timer">
              <FaRegClock /> {L.holdLeft(mm)}
            </span>
          )}
        </div>
      </div>
      <div className={c.cardBody}>
        {changed && (
          <div className={`${c.alert} ${c.info}`}>
            <FaInfoCircle style={{ marginTop: 3, flexShrink: 0 }} /> {L.priceChanged(searchPrice.toFixed(2), amount.toFixed(2))}
          </div>
        )}
        <div className={c.amountBox}>
          <span>
            {L.amountDue}
            <br />
            <small style={{ color: "var(--muted)" }}>
              {L.bookingRef}: <strong dir="ltr">{orderRef}</strong>
            </small>
          </span>
          <strong>
            <Price value={amount} />
          </strong>
        </div>

        {expired ? (
          <div className={c.alert}>{L.holdExpired}</div>
        ) : state === "missing-key" ? (
          <div className={c.alert}>{L.gatewayMissing}</div>
        ) : state === "failed" ? (
          <div className={c.alert}>{L.gatewayMissing}</div>
        ) : (
          <>
            {state === "loading" && (
              <div className={c.working}>
                <span className={c.spinner} /> {L.payLoading}
              </div>
            )}
            <div ref={formRef} className={`mysr-form ${c.mysr}`} />
          </>
        )}
      </div>
    </section>
  );
}
