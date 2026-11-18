"use client";

// One hotel: photos, description, amenities, policies and every bookable room offer, priced for
// the customer. Choosing an offer stores the selection and opens the checkout.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaCheck, FaCoffee, FaTimes, FaChevronLeft, FaChevronRight, FaImages, FaBed, FaUser,
  FaRegClock, FaInfoCircle, FaExclamationTriangle, FaHotel, FaRedo,
} from "react-icons/fa";
import { Price } from "@/components/flights/FlightCard";
import { formatDate } from "@/lib/flights/offerModel";
import hotelApi from "@/lib/hotels/hotelApi";
import { parseSearch, searchQuery, searchKey, storage, SELECTION_KEY, guestCount } from "@/lib/hotels/hotelModel";
import { Stars, RatingBadge } from "./HotelSearchPage";
import { t as dict, friendlyError } from "./i18n";
import fs from "@/components/flights/flights.module.css";
import s from "./hotels.module.css";

const OFFERS_SHOWN = 3;

export function formatDeadline(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Lightbox({ images, index, onIndex, onClose, lang }) {
  const L = dict(lang);
  const rtl = lang === "ar";
  const count = images.length;
  const go = useCallback((n) => onIndex((index + n + count) % count), [index, count, onIndex]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [go, onClose, rtl]);

  return (
    <div className={s.lightbox} role="dialog" aria-modal="true">
      <div className={s.lbHead}>
        <span>
          {index + 1} / {count}
          {images[index]?.caption ? ` · ${images[index].caption}` : ""}
        </span>
        <button type="button" className={s.lbClose} onClick={onClose} aria-label={L.close}>
          <FaTimes />
        </button>
      </div>
      <div className={s.lbBody}>
        <button type="button" className={s.lbNav} onClick={() => go(-1)} aria-label="Previous">
          {rtl ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <img src={images[index]?.url} alt={images[index]?.caption || ""} />
        <button type="button" className={s.lbNav} onClick={() => go(1)} aria-label="Next">
          {rtl ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
      <div className={s.lbStrip}>
        {images.map((img, i) => (
          <button type="button" key={img.url + i} className={`${s.lbThumb} ${i === index ? s.lbThumbOn : ""}`} onClick={() => onIndex(i)}>
            <img src={img.url} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Gallery({ images, name, lang, onOpen }) {
  const L = dict(lang);
  if (!images.length) {
    return (
      <div className={s.gallery}>
        <div className={s.galleryEmpty}>
          <FaHotel />
        </div>
      </div>
    );
  }
  const tiles = images.slice(0, 5);
  return (
    <div className={s.gallery}>
      {tiles.map((img, i) => (
        <button
          type="button"
          key={img.url + i}
          className={`${s.galleryItem} ${i === 0 ? s.galleryMain : ""} ${i >= 3 ? s.galleryHideSm : ""}`}
          onClick={() => onOpen(i)}
          aria-label={img.caption || name}
        >
          <img src={img.url} alt={img.caption || name} loading={i === 0 ? "eager" : "lazy"} />
          {i === tiles.length - 1 && images.length > 1 && (
            <span className={s.galleryMore}>
              <FaImages /> {L.photos(images.length)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function Offer({ offer, nights, lang, onReserve }) {
  const L = dict(lang);
  const breakfast = /breakfast|bed\s*and\s*breakfast|half|full|all\s*incl/i.test(`${offer.board || ""} ${offer.board_type || ""}`);
  return (
    <div className={s.offer}>
      <div className={s.offerTerms}>
        <span className={`${s.term} ${breakfast ? s.termOk : ""}`}>
          {breakfast ? <FaCoffee size={12} /> : <FaBed size={12} />} {offer.board ? titleCase(offer.board) : L.roomOnly}
        </span>
        {offer.free_cancellation_until ? (
          <span className={`${s.term} ${s.termOk}`}>
            <FaCheck size={11} /> {L.freeCancelUntil(formatDeadline(offer.free_cancellation_until, lang))}
          </span>
        ) : offer.refundable ? (
          <span className={s.term}>
            <FaInfoCircle size={11} /> {L.refundable}
          </span>
        ) : (
          <span className={`${s.term} ${s.termWarn}`}>
            <FaExclamationTriangle size={11} /> {L.nonRefundable}
          </span>
        )}
        {offer.rooms.length > 1 && (
          <span className={s.term}>
            <FaBed size={12} /> {offer.rooms.map((r) => titleCase(r.name)).join(" + ")}
          </span>
        )}
        {offer.availability > 0 && offer.availability <= 3 && <span className={s.scarce}>{L.onlyLeft(offer.availability)}</span>}
      </div>
      <div className={s.offerBuy}>
        <div className={s.offerPrice}>
          <strong>
            <Price value={offer.price_sar} />
          </strong>
          <small>
            <Price value={Math.round(offer.price_per_night_sar)} /> {L.perNight} · {L.nightsN(nights)}
          </small>
          <small>{L.inclTaxes}</small>
        </div>
        <button type="button" className={`${fs.btn} ${fs.btnCta}`} onClick={() => onReserve(offer)}>
          {L.reserve}
        </button>
      </div>
    </div>
  );
}

function titleCase(text) {
  const t = String(text || "").trim();
  if (!t || t !== t.toUpperCase()) return t;
  return t.toLowerCase().replace(/(^|[\s,(/-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
}

function RoomGroup({ name, offers, nights, lang, image, onReserve }) {
  const L = dict(lang);
  const [all, setAll] = useState(false);
  const shown = all ? offers : offers.slice(0, OFFERS_SHOWN);
  const first = offers[0].rooms[0] || {};
  return (
    <div className={s.roomGroup}>
      <div className={s.roomGroupHead}>
        {image ? <img className={s.roomThumb} src={image} alt="" loading="lazy" /> : null}
        <div>
          <h3>{titleCase(name)}</h3>
          <p>
            <FaUser size={10} /> {L.sleeps(first.adults || 0, first.children || 0)}
            {first.beds?.length ? ` · ${first.beds.join(", ")}` : ""}
          </p>
        </div>
      </div>
      {shown.map((o) => (
        <Offer key={o.recommendation_id} offer={o} nights={nights} lang={lang} onReserve={onReserve} />
      ))}
      {offers.length > OFFERS_SHOWN && (
        <button type="button" className={s.moreBtn} onClick={() => setAll(!all)}>
          {all ? L.fewerOptions : L.moreOptions(offers.length - OFFERS_SHOWN)}
        </button>
      )}
    </div>
  );
}

function Expandable({ items, limit, render, lang }) {
  const L = dict(lang);
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, limit);
  return (
    <>
      {render(shown)}
      {items.length > limit && (
        <button type="button" className={fs.linkBtn} style={{ marginTop: 10 }} onClick={() => setAll(!all)}>
          {all ? L.showLess : `${L.showAll} (${items.length})`}
        </button>
      )}
    </>
  );
}

export default function HotelDetailsPage({ lang = "en", hotelId }) {
  const L = dict(lang);
  const router = useRouter();
  const params = useSearchParams();
  const search = useMemo(() => parseSearch(params), [params]);
  const query = search ? searchQuery(search) : "";
  const searchId = params.get("sid") || "";
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [tab, setTab] = useState("rooms");
  const card = useMemo(() => (typeof window !== "undefined" ? storage.get(`hotel_card:${hotelId}`) : null), [hotelId]);
  const refs = { rooms: useRef(null), overview: useRef(null), amenities: useRef(null), policies: useRef(null) };

  useEffect(() => {
    if (!searchId) {
      setState({ status: "error", data: null, error: { code: "SEARCH_NOT_FOUND" } });
      return undefined;
    }
    const ctrl = new AbortController();
    setState({ status: "loading", data: null, error: null });
    const tracing = storage.get(searchKey(query))?.tracingKey;
    hotelApi
      .details(searchId, hotelId, tracing, ctrl.signal)
      .then((data) => setState({ status: "ready", data, error: null }))
      .catch((error) => error?.name !== "AbortError" && setState({ status: "error", data: null, error }));
    return () => ctrl.abort();
  }, [searchId, hotelId, query, attempt]);

  const data = state.data;
  const hotel = data?.hotel;
  const images = useMemo(() => {
    const list = hotel?.images?.length ? hotel.images : hotel?.hero_image ? [{ url: hotel.hero_image }] : card?.image ? [{ url: card.image }] : [];
    return list;
  }, [hotel, card]);
  const groups = useMemo(() => {
    const m = new Map();
    (data?.offers || []).forEach((o) => {
      const key = o.rooms.map((r) => r.name).join(" + ");
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(o);
    });
    return [...m.entries()];
  }, [data]);
  const cheapest = data?.offers?.[0];
  const nights = data?.nights || 1;
  const backUrl = `/${lang}/hotels?${query}`;

  const scrollTo = (key) => {
    setTab(key);
    refs[key].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reserve = (offer) => {
    storage.set(SELECTION_KEY, {
      at: Date.now(),
      lang,
      query,
      searchId,
      tracingKey: storage.get(searchKey(query))?.tracingKey || null,
      hotel: {
        id: hotel.id || hotelId,
        name: hotel.name || card?.name,
        image: images[0]?.url || null,
        stars: hotel.star_rating,
        address: hotel.address || card?.address,
        checkInTime: hotel.check_in_time,
        checkOutTime: hotel.check_out_time,
      },
      offer,
      checkIn: data.check_in || search?.checkIn,
      checkOut: data.check_out || search?.checkOut,
      nights,
      rooms: search?.rooms || [],
      nationality: search?.nationality || "SA",
    });
    router.push(`/${lang}/hotels/booking`);
  };

  const Arrow = lang === "ar" ? FaArrowRight : FaArrowLeft;

  return (
    <div className={`${fs.page} ${s.page}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className={`${fs.container} ${s.detailWrap}`}>
        <button type="button" className={s.crumb} onClick={() => router.push(search ? backUrl : `/${lang}/hotels`)}>
          <Arrow size={12} /> {L.backToResults}
        </button>

        {state.status === "loading" && (
          <>
            <div className={fs.skeleton} style={{ height: 40, width: "50%", marginBottom: 16 }} />
            <div className={fs.skeleton} style={{ height: 388, marginBottom: 18 }} />
            <div className={`${fs.panel} ${fs.loadingHead}`}>
              {L.loadingHotel}
              <div className={fs.progress} />
            </div>
          </>
        )}

        {state.status === "error" && (
          <div className={`${fs.panel} ${fs.empty}`}>
            <div className={fs.emptyIcon}>
              <FaHotel />
            </div>
            <h2>{state.error?.code === "SEARCH_NOT_FOUND" ? L.searchExpired : friendlyError(state.error, lang)}</h2>
            <div className={fs.emptyActions} style={{ marginTop: 16 }}>
              {state.error?.code !== "SEARCH_NOT_FOUND" && (
                <button type="button" className={`${fs.btn} ${fs.btnGhost}`} onClick={() => setAttempt((a) => a + 1)}>
                  <FaRedo /> {L.retry}
                </button>
              )}
              <button
                type="button"
                className={`${fs.btn} ${fs.btnPrimary}`}
                onClick={() => {
                  if (query) storage.remove(searchKey(query));
                  router.push(search ? backUrl : `/${lang}/hotels`);
                }}
              >
                {L.searchAgain}
              </button>
            </div>
          </div>
        )}

        {state.status === "ready" && hotel && (
          <>
            <div className={s.detailHead}>
              <div>
                <Stars n={hotel.star_rating} />
                <h1>{hotel.name || card?.name}</h1>
                {(hotel.address || card?.address) && (
                  <div className={s.address}>
                    <FaMapMarkerAlt size={12} />
                    <span>{hotel.address || card?.address}</span>
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <RatingBadge rating={hotel.rating ?? card?.rating} count={hotel.review_count ?? card?.review_count} lang={lang} />
                </div>
              </div>
              {cheapest && (
                <div className={s.headPrice}>
                  <span className={s.priceLabel}>
                    {L.priceFrom} · {L.perNight}
                  </span>
                  <span className={s.priceBig}>
                    <Price value={Math.round(cheapest.price_per_night_sar)} />
                  </span>
                  <button type="button" className={`${fs.btn} ${fs.btnCta}`} onClick={() => scrollTo("rooms")}>
                    {L.chooseRoom}
                  </button>
                </div>
              )}
            </div>

            <Gallery images={images} name={hotel.name} lang={lang} onOpen={(i) => setLightbox(i)} />

            <nav className={s.tabs} aria-label={hotel.name}>
              {[
                ["rooms", L.roomsTab],
                ["overview", L.overview],
                ["amenities", L.amenities],
                ["policies", L.policies],
              ].map(([key, label]) => (
                <button type="button" key={key} className={`${s.tab} ${tab === key ? s.tabActive : ""}`} onClick={() => scrollTo(key)}>
                  {label}
                </button>
              ))}
            </nav>

            <div className={s.detailGrid}>
              <div>
                <section ref={refs.rooms} className={s.block}>
                  <h2>{L.chooseRoom}</h2>
                  <p style={{ fontSize: "0.86rem", color: "var(--muted)", marginTop: -6 }}>
                    {L.roomsFor(nights, guestCount(search?.rooms || []))} · {L.inclTaxes}
                  </p>
                  {groups.length === 0 ? (
                    <div className={`${s.alert} ${s.alertWarn}`}>
                      <FaExclamationTriangle /> {L.noRooms}
                    </div>
                  ) : (
                    groups.map(([name, offers]) => (
                      <RoomGroup
                        key={name}
                        name={name}
                        offers={offers}
                        nights={nights}
                        lang={lang}
                        image={offers[0].rooms[0]?.images?.[0]}
                        onReserve={reserve}
                      />
                    ))
                  )}
                </section>

                <section ref={refs.overview} className={s.block}>
                  <h2>{L.overview}</h2>
                  {hotel.descriptions?.length ? (
                    <Expandable
                      lang={lang}
                      items={hotel.descriptions}
                      limit={3}
                      render={(list) =>
                        list.map((d, i) => (
                          <p key={i}>
                            {d.type && d.type !== "general" && <span className={s.descType}>{d.type.replace(/_/g, " ")}: </span>}
                            {d.text}
                          </p>
                        ))
                      }
                    />
                  ) : null}
                  <div className={s.keyFacts}>
                    {hotel.check_in_time && (
                      <div className={s.keyFact}>
                        <FaRegClock /> {L.checkInFrom}
                        <strong>{hotel.check_in_time}</strong>
                      </div>
                    )}
                    {hotel.check_out_time && (
                      <div className={s.keyFact}>
                        <FaRegClock /> {L.checkOutUntil}
                        <strong>{hotel.check_out_time}</strong>
                      </div>
                    )}
                    {hotel.min_check_in_age && (
                      <div className={s.keyFact}>
                        <FaUser /> {L.minAge(hotel.min_check_in_age)}
                      </div>
                    )}
                  </div>
                  {hotel.attractions?.length > 0 && (
                    <>
                      <h2 style={{ marginTop: 20 }}>{L.nearby}</h2>
                      <ul className={s.nearList}>
                        {hotel.attractions.map((a) => (
                          <li key={a.name}>
                            <span>{a.name}</span>
                            <span>{a.distance ? `${a.distance} ${a.unit || ""}` : ""}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>

                <section ref={refs.amenities} className={s.block}>
                  <h2>{L.amenities}</h2>
                  {hotel.facilities?.length ? (
                    <Expandable
                      lang={lang}
                      items={hotel.facilities}
                      limit={18}
                      render={(list) => (
                        <div className={s.facGrid}>
                          {list.map((f) => (
                            <span key={f} className={s.fac}>
                              <FaCheck size={11} /> {f}
                            </span>
                          ))}
                        </div>
                      )}
                    />
                  ) : (
                    <p>—</p>
                  )}
                </section>

                <section ref={refs.policies} className={s.block}>
                  <h2>{L.policies}</h2>
                  {[...(hotel.policies || [])].map((p, i) => (
                    <p key={`p${i}`} className={s.policyText}>
                      {p}
                    </p>
                  ))}
                  {hotel.fees?.length > 0 && (
                    <>
                      <h3 style={{ fontSize: "0.95rem", margin: "14px 0 6px" }}>{L.fees}</h3>
                      {hotel.fees.map((p, i) => (
                        <p key={`f${i}`} className={s.policyText}>
                          {p}
                        </p>
                      ))}
                    </>
                  )}
                  {!hotel.policies?.length && !hotel.fees?.length && <p>—</p>}
                </section>
              </div>

              <aside className={s.aside}>
                <div className={s.asideCard}>
                  <div className={s.asideRow}>
                    <span>{L.checkIn}</span>
                    <strong>{formatDate(data.check_in || search?.checkIn, lang)}</strong>
                  </div>
                  <div className={s.asideRow}>
                    <span>{L.checkOut}</span>
                    <strong>{formatDate(data.check_out || search?.checkOut, lang)}</strong>
                  </div>
                  <div className={s.asideRow}>
                    <span>{L.guests}</span>
                    <strong>
                      {L.rooms(search?.rooms?.length || 1)}, {L.guestsN(guestCount(search?.rooms || []))}
                    </strong>
                  </div>
                  {cheapest && (
                    <div className={s.asideRow} style={{ alignItems: "center" }}>
                      <span>
                        {L.priceFrom}
                        <br />
                        <small style={{ color: "var(--muted)" }}>{L.nightsN(nights)}</small>
                      </span>
                      <strong className={s.priceBig} style={{ fontSize: "1.3rem" }}>
                        <Price value={cheapest.price_sar} />
                      </strong>
                    </div>
                  )}
                  {cheapest && (
                    <button type="button" className={`${fs.btn} ${fs.btnCta}`} style={{ width: "100%", marginTop: 10 }} onClick={() => scrollTo("rooms")}>
                      {L.chooseRoom}
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
      {lightbox != null && images.length > 0 && <Lightbox images={images} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} lang={lang} />}
    </div>
  );
}
