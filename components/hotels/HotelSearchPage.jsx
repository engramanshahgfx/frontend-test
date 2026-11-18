"use client";

// Hotel search → results, on Akbar Travels inventory.
//
// The URL holds the search (see lib/hotels/hotelModel), so a results page can be shared and
// reloaded. The supplier search keeps running after Init: results are polled until Akbar reports
// the search complete, and the list grows while the customer is already browsing it.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaStar, FaMapMarkerAlt, FaCheck, FaCoffee, FaSlidersH, FaTimes, FaHotel, FaBolt, FaRegCalendarCheck, FaEnvelopeOpenText, FaSearch, FaRedo } from "react-icons/fa";
import { Price } from "@/components/flights/FlightCard";
import { formatDate } from "@/lib/flights/offerModel";
import hotelApi from "@/lib/hotels/hotelApi";
import {
  parseSearch, searchQuery, searchUrl, initPayload, applyFilters, sortHotels, activeFilterCount, EMPTY_FILTERS, SORTS,
  storage, searchKey, guestCount, starCount, ratingWord,
} from "@/lib/hotels/hotelModel";
import HotelSearchForm from "./HotelSearchForm";
import { t as dict, friendlyError } from "./i18n";
import fs from "@/components/flights/flights.module.css";
import s from "./hotels.module.css";

const PAGE = 20;
const POLL_MS = 2500;
const MAX_POLLS = 14;
const SEARCH_TTL_MS = 50 * 60 * 1000;

export function Stars({ n }) {
  const count = starCount(n);
  if (!count) return null;
  return (
    <span className={s.stars} aria-label={`${count} stars`}>
      {Array.from({ length: count }, (_, i) => (
        <FaStar key={i} />
      ))}
    </span>
  );
}

export function RatingBadge({ rating, count, lang }) {
  const L = dict(lang);
  if (!rating) return null;
  return (
    <span className={s.ratingRow}>
      <span className={s.ratingBadge}>{Number(rating).toFixed(1)}</span>
      <span className={s.ratingWord}>{ratingWord(rating, L)}</span>
      {count ? <span style={{ color: "var(--muted)" }}>· {L.reviews(count)}</span> : null}
    </span>
  );
}

export function HotelImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={s.imgFallback}>
        <FaHotel />
      </span>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

function Landing({ lang, onSearch }) {
  const L = dict(lang);
  const why = [
    [<FaBolt key="a" />, L.whyTitle1, L.whyText1],
    [<FaRegCalendarCheck key="b" />, L.whyTitle2, L.whyText2],
    [<FaEnvelopeOpenText key="c" />, L.whyTitle3, L.whyText3],
  ];
  return (
    <>
      <section className={s.hero}>
        <div className={fs.container}>
          <h1 className={s.heroTitle}>{L.heroTitle}</h1>
          <p className={s.heroSub}>{L.heroSub}</p>
          <HotelSearchForm lang={lang} onSubmit={onSearch} />
        </div>
      </section>
      <section className={`${fs.container} ${s.section}`}>
        <h2 className={s.sectionTitle}>{L.popularTitle}</h2>
        <div className={s.destGrid}>
          {L.popular.map((p) => (
            <button
              type="button"
              key={p.name}
              className={s.destCard}
              onClick={() => {
                const dates = { checkIn: undefined, checkOut: undefined };
                onSearch({
                  destination: { id: null, name: p.q || p.name, lat: p.lat, lng: p.lng, country: p.cc },
                  ...dates,
                });
              }}
            >
              <span className={s.destIcon}>
                <FaMapMarkerAlt />
              </span>
              <strong>{p.name}</strong>
              <small>{p.sub}</small>
            </button>
          ))}
        </div>
      </section>
      <div className={`${fs.container} ${fs.valueProps}`}>
        {why.map(([icon, title, text]) => (
          <div key={title} className={fs.valueProp}>
            <span className={fs.valueIcon}>{icon}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Filters({ lang, hotels, filters, setFilters, total, onClose }) {
  const L = dict(lang);
  const prices = hotels.map((h) => h.price_per_night_sar).filter(Number.isFinite);
  const lo = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const hi = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  const types = useMemo(() => {
    const m = new Map();
    hotels.forEach((h) => {
      const t = h.property_type || "Other";
      m.set(t, (m.get(t) || 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [hotels]);
  const starCounts = useMemo(() => {
    const m = {};
    hotels.forEach((h) => {
      const n = starCount(h.star_rating);
      m[n] = (m[n] || 0) + 1;
    });
    return m;
  }, [hotels]);

  const set = (patch) => setFilters({ ...filters, ...patch });
  const toggle = (key, v) => set({ [key]: filters[key].includes(v) ? filters[key].filter((x) => x !== v) : [...filters[key], v] });

  return (
    <div className={fs.panel}>
      <div className={fs.filtersHead}>
        <h2>
          <FaSlidersH size={14} /> {L.filters}
        </h2>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {activeFilterCount(filters) > 0 && (
            <button type="button" className={fs.linkBtn} onClick={() => setFilters(EMPTY_FILTERS)}>
              {L.clearAll}
            </button>
          )}
          {onClose && (
            <button type="button" className={fs.iconBtn} onClick={onClose} aria-label={L.close}>
              <FaTimes size={12} />
            </button>
          )}
        </div>
      </div>
      <div className={fs.filtersCount}>{L.propertiesFound(total)}</div>

      <div className={fs.filterBlock}>
        <h3>{L.hotelName}</h3>
        <div className={fs.filterContent}>
          <input className={s.textInput} value={filters.name} placeholder={L.hotelNamePh} onChange={(e) => set({ name: e.target.value })} />
        </div>
      </div>

      <div className={fs.filterBlock}>
        <h3>{L.popularFilters}</h3>
        <div className={fs.filterContent} style={{ display: "grid", gap: 12 }}>
          <label className={fs.switchRow}>
            {L.freeCancellation}
            <input type="checkbox" className={fs.switch} checked={filters.freeCancellation} onChange={(e) => set({ freeCancellation: e.target.checked })} />
          </label>
          <label className={fs.switchRow}>
            {L.breakfastIncluded}
            <input type="checkbox" className={fs.switch} checked={filters.breakfast} onChange={(e) => set({ breakfast: e.target.checked })} />
          </label>
        </div>
      </div>

      {hi > lo && (
        <div className={fs.filterBlock}>
          <h3>{L.maxPerNight}</h3>
          <div className={fs.filterContent}>
            <input
              type="range"
              className={s.rangeInput}
              min={lo}
              max={hi}
              step={Math.max(1, Math.round((hi - lo) / 100))}
              value={filters.maxPrice ?? hi}
              onChange={(e) => {
                const v = Number(e.target.value);
                set({ maxPrice: v >= hi ? null : v });
              }}
            />
            <div className={s.rangeRow}>
              <span>
                <Price value={lo} />
              </span>
              <strong style={{ color: "var(--ink)" }}>
                {filters.maxPrice == null ? L.anyPrice : <>{L.upTo} <Price value={filters.maxPrice} /></>}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className={fs.filterBlock}>
        <h3>{L.starRating}</h3>
        <div className={`${fs.filterContent} ${s.starChips}`}>
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              type="button"
              key={n}
              className={`${fs.chip} ${filters.stars.includes(n) ? fs.chipActive : ""}`}
              onClick={() => toggle("stars", n)}
              disabled={!starCounts[n] && !filters.stars.includes(n)}
              style={!starCounts[n] && !filters.stars.includes(n) ? { opacity: 0.45 } : undefined}
            >
              {n} <FaStar size={10} color="var(--gold)" />
            </button>
          ))}
        </div>
      </div>

      <div className={fs.filterBlock}>
        <h3>{L.guestRating}</h3>
        <div className={`${fs.filterContent} ${s.starChips}`}>
          {[0, 3, 3.5, 4, 4.5].map((n) => (
            <button type="button" key={n} className={`${fs.chip} ${filters.minRating === n ? fs.chipActive : ""}`} onClick={() => set({ minRating: n })}>
              {n ? L.ratingPlus(n) : L.anyRating}
            </button>
          ))}
        </div>
      </div>

      {types.length > 1 && (
        <div className={fs.filterBlock}>
          <h3>{L.propertyType}</h3>
          <div className={fs.filterContent}>
            {types.map(([type, count]) => (
              <label key={type} className={fs.filterOpt}>
                <input type="checkbox" checked={filters.types.includes(type)} onChange={() => toggle("types", type)} />
                <span className={fs.grow}>{type}</span>
                <span className={fs.filterPrice}>{count}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {onClose && (
        <div style={{ padding: 16, position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid var(--line)" }}>
          <button type="button" className={`${fs.btn} ${fs.btnCta}`} style={{ width: "100%" }} onClick={onClose}>
            {L.showResults(total)}
          </button>
        </div>
      )}
    </div>
  );
}

function HotelCard({ hotel, nights, lang, onOpen }) {
  const L = dict(lang);
  return (
    <article className={s.hotelCard}>
      <button type="button" className={s.hotelImgWrap} onClick={onOpen} aria-label={hotel.name}>
        <HotelImage src={hotel.image} alt={hotel.name} className={s.hotelImg} />
        {hotel.deal && <span className={s.dealBadge}>{L.deal}</span>}
      </button>
      <div className={s.hotelInfo}>
        <button type="button" className={s.hotelNameBtn} onClick={onOpen}>
          <h3 className={s.hotelName}>{hotel.name}</h3>
        </button>
        <div className={s.metaLine}>
          <Stars n={hotel.star_rating} />
          {hotel.property_type && <span>{hotel.property_type}</span>}
          {Number.isFinite(hotel.distance_km) && hotel.distance_km > 0 && <span>· {L.kmFromCentre(hotel.distance_km)}</span>}
        </div>
        {hotel.address && (
          <div className={s.address}>
            <FaMapMarkerAlt size={11} />
            <span>{hotel.address}</span>
          </div>
        )}
        <RatingBadge rating={hotel.rating} count={hotel.review_count} lang={lang} />
        {hotel.facilities?.length > 0 && (
          <div className={s.amenityRow}>
            {hotel.facilities.slice(0, 4).map((f) => (
              <span key={f} className={s.amenity}>
                {f}
              </span>
            ))}
          </div>
        )}
        <div className={s.perkRow}>
          {hotel.free_cancellation && (
            <span className={s.perk}>
              <FaCheck size={11} /> {L.freeCancellation}
            </span>
          )}
          {hotel.free_breakfast && (
            <span className={s.perk}>
              <FaCoffee size={11} /> {L.breakfastIncluded}
            </span>
          )}
          {!hotel.refundable && !hotel.free_cancellation && <span className={`${s.perk} ${s.perkMuted}`}>{L.nonRefundable}</span>}
        </div>
      </div>
      <div className={s.hotelPrice}>
        <div>
          <div className={s.priceLabel}>{L.priceFrom}</div>
          <div className={s.priceBig}>
            <Price value={Math.round(hotel.price_per_night_sar)} />
          </div>
          <div className={s.priceLabel}>{L.perNight}</div>
          <div className={s.priceTotal}>
            <Price value={hotel.price_sar} /> {L.totalFor(nights)}
          </div>
          <div className={s.priceSmall}>{L.feeAtCheckout}</div>
        </div>
        <button type="button" className={`${fs.btn} ${fs.btnCta} ${s.priceBtn}`} onClick={onOpen}>
          {L.viewRooms}
        </button>
      </div>
    </article>
  );
}

/** Starts (or reuses) the supplier search for this query, then polls priced results until complete. */
function useHotelResults(search, query) {
  const [state, setState] = useState({ status: "idle", hotels: [], completed: false, nights: 1, searchId: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!search) return undefined;
    let cancelled = false;
    const ctrl = new AbortController();
    let timer = null;

    const run = async () => {
      setState((st) => ({ ...st, status: "loading", hotels: [], completed: false, error: null }));
      try {
        const key = searchKey(query);
        let cached = storage.get(key);
        if (!cached || Date.now() - cached.at > SEARCH_TTL_MS) {
          const init = await hotelApi.initSearch(initPayload(search));
          cached = { searchId: init.searchId, tracingKey: init.searchTracingKey, at: Date.now() };
          storage.set(key, cached);
        }
        let polls = 0;
        const poll = async () => {
          if (cancelled) return;
          polls += 1;
          try {
            const res = await hotelApi.results(cached.searchId, cached.tracingKey, ctrl.signal);
            if (cancelled) return;
            const done = res.completed || polls >= MAX_POLLS;
            setState({ status: "ready", hotels: res.hotels || [], completed: done, nights: res.nights || 1, searchId: cached.searchId, error: null });
            if (!done) timer = setTimeout(poll, POLL_MS);
          } catch (err) {
            if (cancelled || err?.name === "AbortError") return;
            if (err.code === "SEARCH_NOT_FOUND" || err.status === 404) storage.remove(key);
            // A failed poll after results arrived keeps what is shown; a failed first poll is an error.
            setState((st) => (st.hotels.length ? { ...st, completed: true } : { ...st, status: "error", error: err }));
          }
        };
        await poll();
      } catch (err) {
        if (!cancelled && err?.name !== "AbortError") setState((st) => ({ ...st, status: "error", error: err }));
      }
    };
    run();
    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, attempt]);

  const retry = () => {
    storage.remove(searchKey(query));
    setAttempt((a) => a + 1);
  };
  return { ...state, retry };
}

function Results({ lang, search, query, router }) {
  const L = dict(lang);
  const { status, hotels, completed, nights, searchId, error, retry } = useHotelResults(search, query);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setFilters(EMPTY_FILTERS);
    setShown(PAGE);
  }, [query]);
  useEffect(() => setShown(PAGE), [filters, sort]);

  const list = useMemo(() => sortHotels(applyFilters(hotels, filters), sort), [hotels, filters, sort]);
  const visible = list.slice(0, shown);
  const filterCount = activeFilterCount(filters);
  const guests = guestCount(search.rooms);

  const open = (hotel) => {
    storage.set(`hotel_card:${hotel.id}`, hotel);
    router.push(`/${lang}/hotels/${encodeURIComponent(hotel.id)}?${query}&sid=${encodeURIComponent(searchId)}`);
  };

  return (
    <>
      <div className={fs.searchBand}>
        <div className={fs.container}>
          <button type="button" className={fs.searchSummary} onClick={() => setFormOpen((o) => !o)}>
            <span className={fs.summaryText}>
              <strong>{search.destination.name}</strong>
              <small>
                {formatDate(search.checkIn, lang)} – {formatDate(search.checkOut, lang)} · {L.rooms(search.rooms.length)}, {L.guestsN(guests)}
              </small>
            </span>
            <FaSearch />
          </button>
          <div className={formOpen ? "" : s.formHideSm} style={formOpen ? { marginTop: 10 } : undefined}>
            <HotelSearchForm
              key={query}
              lang={lang}
              initial={search}
              compact
              onSubmit={(next) => {
                setFormOpen(false);
                router.push(searchUrl(lang, next));
              }}
            />
          </div>
        </div>
      </div>

      <div className={`${fs.container} ${fs.results}`}>
        <aside className={`${fs.sidebar} ${filtersOpen ? fs.sidebarOpen : ""}`} onClick={(e) => e.target === e.currentTarget && setFiltersOpen(false)}>
          {status === "ready" && hotels.length > 0 ? (
            <Filters lang={lang} hotels={hotels} filters={filters} setFilters={setFilters} total={list.length} onClose={filtersOpen ? () => setFiltersOpen(false) : null} />
          ) : (
            <div className={`${fs.skeleton}`} style={{ height: 420 }} />
          )}
        </aside>

        <main>
          <div className={s.resultsHead}>
            <div>
              <h1>{L.resultsTitle(search.destination.name)}</h1>
              <p>
                {formatDate(search.checkIn, lang)} – {formatDate(search.checkOut, lang)} · {L.nightsN(nights || 1)} · {L.guestsN(guests)}
                {status === "ready" && <> · {L.propertiesFound(list.length)}</>}
              </p>
            </div>
            {status === "ready" && hotels.length > 0 && (
              <div className={s.sortBox}>
                <button type="button" className={`${fs.btn} ${fs.btnGhost} ${s.mobileOnly}`} onClick={() => setFiltersOpen(true)}>
                  <FaSlidersH /> {L.filters}
                  {filterCount ? ` (${filterCount})` : ""}
                </button>
                <label htmlFor="hotel-sort">{L.sortBy}</label>
                <select id="hotel-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((k) => (
                    <option key={k} value={k}>
                      {L.sorts[k]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {status === "ready" && !completed && (
            <div className={`${fs.panel} ${fs.loadingHead}`}>
              <span className={s.refreshNote}>
                <span className={s.dotPulse} /> {L.stillSearching}
              </span>
              <div className={fs.progress} />
            </div>
          )}

          {(status === "loading" || status === "idle") && (
            <>
              <div className={`${fs.panel} ${fs.loadingHead}`}>
                <div>
                  <strong style={{ color: "var(--ink)" }}>{L.loadingTitle}</strong>
                  <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>{L.loadingSub}</div>
                </div>
                <div className={fs.progress} />
              </div>
              <div className={s.hotelList}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className={`${fs.skeleton} ${s.skelCard}`} />
                ))}
              </div>
            </>
          )}

          {status === "error" && (
            <div className={`${fs.panel} ${fs.empty}`}>
              <div className={fs.emptyIcon}>
                <FaHotel />
              </div>
              <h2>{error?.code === "1214" || error?.status === 404 ? L.noHotels : friendlyError(error, lang)}</h2>
              <p>{error?.code === "1214" || error?.status === 404 ? L.noHotelsHint : ""}</p>
              <div className={fs.emptyActions}>
                <button type="button" className={`${fs.btn} ${fs.btnPrimary}`} onClick={retry}>
                  <FaRedo /> {L.retry}
                </button>
              </div>
            </div>
          )}

          {status === "ready" && completed && hotels.length === 0 && (
            <div className={`${fs.panel} ${fs.empty}`}>
              <div className={fs.emptyIcon}>
                <FaHotel />
              </div>
              <h2>{L.noHotels}</h2>
              <p>{L.noHotelsHint}</p>
            </div>
          )}

          {status === "ready" && hotels.length > 0 && list.length === 0 && (
            <div className={`${fs.panel} ${fs.empty}`}>
              <div className={fs.emptyIcon}>
                <FaSlidersH />
              </div>
              <h2>{L.noResults}</h2>
              <p>{L.noResultsHint}</p>
              <div className={fs.emptyActions}>
                <button type="button" className={`${fs.btn} ${fs.btnGhost}`} onClick={() => setFilters(EMPTY_FILTERS)}>
                  {L.clearAll}
                </button>
              </div>
            </div>
          )}

          {status === "ready" && visible.length > 0 && (
            <div className={s.hotelList}>
              {visible.map((h) => (
                <HotelCard key={h.id} hotel={h} nights={nights} lang={lang} onOpen={() => open(h)} />
              ))}
            </div>
          )}

          {status === "ready" && list.length > shown && (
            <div className={s.listFoot}>
              <button type="button" className={`${fs.btn} ${fs.btnGhost}`} onClick={() => setShown((n) => n + PAGE)}>
                {L.showMore} ({list.length - shown})
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default function HotelSearchPage({ lang = "en" }) {
  const router = useRouter();
  const params = useSearchParams();
  const search = useMemo(() => parseSearch(params), [params]);
  const query = search ? searchQuery(search) : "";

  const onSearch = (next) => {
    const fallback = parseSearch({ q: next.destination.name, lat: next.destination.lat, lng: next.destination.lng });
    router.push(
      searchUrl(lang, {
        ...fallback,
        ...Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined)),
      })
    );
  };

  return (
    <div className={`${fs.page} ${s.page}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {search ? <Results lang={lang} search={search} query={query} router={router} /> : <Landing lang={lang} onSearch={onSearch} />}
    </div>
  );
}
