"use client";

// Slider of Tilal Rimal's own services, shown between flight results. Order = slide order.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

const PROMOS = [
  { id: "trips", image: "/international/dubai.webp", href: "/international" },
  { id: "hotels", image: "/international/Maldives.jpg", href: "/akbar-hotel" },
  { id: "visa", image: "/international/paris.jpg", href: "/visa" },
  { id: "internet", image: "/SVG/eSim.svg", href: "/international/internet-packages", icon: true },
  { id: "saudi", image: "/cities/alula.jpg", href: "/tousimoffers" },
];

const AUTO_MS = 5000;

export default function PromoCarousel({ lang, start = 0 }) {
  const router = useRouter();
  const L = dict(lang);
  const rtl = lang === "ar";
  const count = PROMOS.length;
  const [index, setIndex] = useState(start % count);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = (i) => setIndex(((i % count) + count) % count);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <div
      className={s.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        // Swiping towards the reading direction's start shows the next slide.
        if (Math.abs(dx) > 40) go(index + ((dx < 0) !== rtl ? 1 : -1));
        touchX.current = null;
        setPaused(false);
      }}
      aria-roledescription="carousel"
    >
      <div className={s.carouselTrack} style={{ transform: `translateX(${(rtl ? 1 : -1) * index * 100}%)` }}>
        {PROMOS.map((promo, i) => {
          const copy = L.promos[promo.id];
          return (
            <button
              type="button"
              key={promo.id}
              className={s.promo}
              tabIndex={i === index ? 0 : -1}
              aria-hidden={i !== index}
              onClick={() => router.push(`/${lang}${promo.href}`)}
            >
              <img src={promo.image} alt="" className={`${s.promoImg} ${promo.icon ? s.promoIcon : ""}`} loading="lazy" />
              <span className={s.promoText}>
                <strong>{copy.title}</strong>
                <span>{copy.text}</span>
              </span>
              <span className={s.promoCta}>{copy.cta}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className={`${s.carouselArrow} ${s.carouselPrev}`} onClick={() => go(index - 1)} aria-label={L.prevDays}>
        {rtl ? <FaChevronRight size={11} /> : <FaChevronLeft size={11} />}
      </button>
      <button type="button" className={`${s.carouselArrow} ${s.carouselNext}`} onClick={() => go(index + 1)} aria-label={L.nextDays}>
        {rtl ? <FaChevronLeft size={11} /> : <FaChevronRight size={11} />}
      </button>

      <div className={s.carouselDots}>
        {PROMOS.map((promo, i) => (
          <button type="button" key={promo.id} className={`${s.carouselDot} ${i === index ? s.carouselDotOn : ""}`} onClick={() => go(i)} aria-label={L.promos[promo.id].title} />
        ))}
      </div>
    </div>
  );
}
