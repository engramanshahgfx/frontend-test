"use client";

// Flight search → results → fare choice, on Akbar Travels inventory.
//
// The URL is the source of truth for a one-way or round-trip search, so every results page can be
// shared and reloaded. A round trip is chosen one flight at a time (departure, then return) and the
// pair is handed to checkout with the search_id and selected_offer_ids the backend needs to book it.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSlidersH, FaShieldAlt, FaBolt, FaHeadset, FaReceipt, FaEnvelopeOpenText, FaPlane, FaChevronLeft, FaChevronRight, FaInfoCircle, FaRedo } from "react-icons/fa";
import akbarApi from "@/lib/akbarApi";
import {
  normalizeOffer, groupByJourney, applyFilters, sortFlights, buildSearchUrl, EMPTY_FILTERS,
  addDays, todayISO, formatDate, clock, datePart, airportInfo,
} from "@/lib/flights/offerModel";
import SearchForm from "./SearchForm";
import FlightCard, { AirlineLogo, Price } from "./FlightCard";
import FiltersPanel from "./FiltersPanel";
import FareDrawer from "./FareDrawer";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

// Cheapest price seen per date, kept across the page remounts that each date change causes.
const datePriceCache = new Map();

function Services({ lang, router }) {
  const L = dict(lang);
  const items = [
    ["/SVG/eSim.svg", L.services.esim, "/international/internet-packages"],
    ["/SVG/Haramain.svg", L.services.haramain, "/services"],
    ["/SVG/Aquarabia.svg", L.services.aquarabia, "/tousimoffers"],
    ["/SVG/Umrah.svg", L.services.umrah, "/tousimoffers"],
    ["/SVG/International packages.svg", L.services.intl, "/tousimoffers"],
    ["/SVG/more services.svg", L.services.more, "/visa"],
  ];
  return (
    <div className={s.services}>
      <div className={`${s.container} ${s.servicesRow}`}>
        {items.map(([icon, label, href]) => (
          <button type="button" key={label} className={s.service} onClick={() => router.push(`/${lang}${href}`)}>
            <span className={s.serviceIcon}>
              <img src={icon} alt="" />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Landing({ lang, onSearch, router }) {
  const L = dict(lang);
  const why = [
    [<FaBolt key="a" />, L.whyTitle1, L.whyText1],
    [<FaReceipt key="b" />, L.whyTitle2, L.whyText2],
    [<FaEnvelopeOpenText key="c" />, L.whyTitle3, L.whyText3],
  ];
  return (
    <>
      <section className={s.hero}>
        <div className={s.container}>
          <h1 className={s.heroTitle}>{L.heroTitle}</h1>
          <p className={s.heroSub}>{L.heroSub}</p>
          <SearchForm lang={lang} onSubmit={onSearch} />
          <div className={s.trustRow}>
            <span>
              <FaBolt /> {L.trustLive}
            </span>
            <span>
              <FaShieldAlt /> {L.trustSecure}
            </span>
            <span>
              <FaHeadset /> {L.trustSupport}
            </span>
          </div>
        </div>
      </section>
      <Services lang={lang} router={router} />
      <div className={`${s.container} ${s.valueProps}`}>
        {why.map(([icon, title, text]) => (
          <div key={title} className={s.valueProp}>
            <span className={s.valueIcon}>{icon}</span>
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

function DateStrip({ lang, center, minDate, prices, onPick }) {
  const L = dict(lang);
  const [offset, setOffset] = useState(0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(center, i - 3 + offset));
  return (
    <div className={`${s.panel} ${s.dateStrip}`}>
      <button type="button" className={s.dateArrow} onClick={() => setOffset(offset - 7)} disabled={days[0] <= minDate} aria-label={L.prevDays}>
        <FaChevronLeft size={12} style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }} />
      </button>
      {days.map((d, i) => (
        <button
          type="button"
          key={d}
          disabled={d < minDate}
          className={`${s.dateCell} ${d === center ? s.dateCellActive : ""} ${i === 0 || i === 6 ? s.dateHideSm : ""}`}
          onClick={() => d !== center && onPick(d)}
        >
          <strong>{formatDate(d, lang)}</strong>
          <small>{prices[d] ? <Price value={prices[d]} /> : "—"}</small>
        </button>
      ))}
      <button type="button" className={s.dateArrow} onClick={() => setOffset(offset + 7)} aria-label={L.nextDays}>
        <FaChevronRight size={12} style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }} />
      </button>
    </div>
  );
}

function ChosenLeg({ lang, label, flight, fare, onChange }) {
  const L = dict(lang);
  return (
    <div className={`${s.panel} ${s.chosen}`}>
      <AirlineLogo code={flight.airlineCode} name={flight.airline} />
      <div className={s.chosenMain}>
        <div className={s.chosenLabel}>{label}</div>
        <strong>
          {flight.from} {clock(flight.departure)} → {flight.to} {clock(flight.arrival)}
        </strong>{" "}
        · {formatDate(datePart(flight.departure), lang)} · {flight.airline} · {fare.name || fare.fareClass || ""}
      </div>
      <button type="button" className={s.linkBtn} onClick={onChange}>
        {L.change}
      </button>
    </div>
  );
}

function Skeletons({ lang }) {
  const L = dict(lang);
  return (
    <>
      <div className={`${s.panel} ${s.loadingHead}`} role="status">
        <FaPlane style={{ color: "var(--teal)" }} />
        <span>{L.searching}</span>
        <span className={s.progress} />
      </div>
      <div className={s.flightList}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={s.skeleton} />
        ))}
      </div>
    </>
  );
}

function EmptyState({ icon, title, text, children }) {
  return (
    <div className={`${s.panel} ${s.empty}`}>
      <div className={s.emptyIcon}>{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className={s.emptyActions}>{children}</div>
    </div>
  );
}

// Plain text for checkout, without the direction isolates used on screen.
const plain = (text) => String(text).replace(/[⁦-⁩]/g, "");

const describeFare = (fare, lang) => {
  const L = dict(lang);
  return {
    checked: fare.checkedBag ? `${plain(fare.checkedBag)} ${lang === "ar" ? "أمتعة مسجلة" : "checked baggage"}` : L.notStated,
    cabin: fare.cabinBag ? `${plain(fare.cabinBag)} ${lang === "ar" ? "أمتعة مقصورة" : "cabin baggage"}` : null,
  };
};

export default function FlightSearchPage({ initialParams }) {
  const router = useRouter();
  const lang = initialParams?.lang === "ar" ? "ar" : "en";
  const L = dict(lang);
  const isRTL = lang === "ar";

  const [search, setSearch] = useState(() =>
    initialParams?.origin && initialParams?.destination
      ? { ...initialParams, tripType: initialParams.returnDate ? "roundtrip" : "oneway" }
      : null
  );
  const [status, setStatus] = useState(search ? "loading" : "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [offers, setOffers] = useState([]);
  const [searchId, setSearchId] = useState(null);
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState([]); // [{ flight, fare }] per leg already picked
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState("best");
  const [drawer, setDrawer] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const abortRef = useRef(null);

  const legCount = search ? (search.tripType === "multicity" ? search.legs.length : search.tripType === "roundtrip" ? 2 : 1) : 1;
  const cacheKey = search ? [search.origin, search.destination, search.tripType, search.returnDate && "rt", search.cabin, search.adults, search.children, search.infants].join("|") : "";

  const runSearch = useCallback(async (q) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");
    setOffers([]);
    setStep(0);
    setChosen([]);
    setFilters(q.directOnly ? { ...EMPTY_FILTERS, stops: ["0"] } : EMPTY_FILTERS);

    const pax = { adults: q.adults, children: q.children, infants: q.infants, cabin_class: q.cabin };
    const payload =
      q.tripType === "multicity"
        ? { ...pax, legs: q.legs.map((l) => ({ origin: l.origin, destination: l.destination, departure_date: l.date })) }
        : { ...pax, origin: q.origin, destination: q.destination, departure_date: q.departDate, return_date: q.tripType === "roundtrip" ? q.returnDate : null };

    const res = await akbarApi.search(payload, ctrl.signal);
    if (res.aborted || ctrl.signal.aborted) return;

    const list = res.ok ? res.data?.data?.offers || [] : [];
    if (!res.ok) {
      const err = res.data?.error || {};
      // The supplier answering "no inventory" is an empty result, not a failure.
      if (/no flight inventory|no journeys/i.test(err.message || "")) {
        setStatus("done");
        return;
      }
      setErrorMsg(err.code === "INVALID_PASSENGERS" || err.code === "PAST_DEPARTURE_DATE" ? err.message : "");
      setStatus("error");
      return;
    }
    setSearchId(res.data.data.search_id);
    setOffers(list.map(normalizeOffer).filter((o) => o.id && o.price > 0));
    setStatus("done");
  }, []);

  useEffect(() => {
    if (!search) return;
    // ?direct=1 is carried in the URL from the landing form.
    const q = { ...search, directOnly: new URLSearchParams(window.location.search).get("direct") === "1" };
    setSearch(q);
    runSearch(q);
    return () => abortRef.current?.abort();
    // The page remounts per URL, so this runs once per search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (q) => {
    if (q.tripType === "multicity") {
      setSearch(q);
      runSearch(q);
      return;
    }
    const url = buildSearchUrl(lang, q);
    if (typeof window !== "undefined" && window.location.pathname + window.location.search === url) {
      setSearch(q);
      runSearch(q);
    } else {
      router.push(url);
    }
  };

  // Flights per leg, one card per journey.
  const legs = useMemo(() => {
    const out = Array.from({ length: legCount }, () => []);
    for (const o of offers) if (out[o.legIndex]) out[o.legIndex].push(o);
    return out.map(groupByJourney);
  }, [offers, legCount]);

  const cheapestOf = (k) => (legs[k]?.length ? Math.min(...legs[k].map((f) => f.price)) : 0);

  // Every price on screen is the trip total: legs already chosen at their chosen fare, legs still
  // to choose at their cheapest, so the number does not jump when the customer moves on.
  const otherLegs = useMemo(() => {
    let sum = 0;
    for (let k = 0; k < legCount; k++) {
      if (k === step) continue;
      sum += k < step ? chosen[k]?.fare.price || 0 : cheapestOf(k);
    }
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legs, chosen, step, legCount]);

  const current = useMemo(() => (legs[step] || []).map((f) => ({ ...f, legPrice: f.price, price: f.price + otherLegs })), [legs, step, otherLegs]);
  const visible = useMemo(() => sortFlights(applyFilters(current, filters), sortBy), [current, filters, sortBy]);

  // Highlights only consider fares whose price already includes taxes.
  const tops = useMemo(() => {
    const full = visible.filter((f) => f.taxesIncluded);
    if (!full.length) return {};
    return { cheapest: sortFlights(full, "cheapest")[0], fastest: sortFlights(full, "fastest")[0], best: sortFlights(full, "best")[0] };
  }, [visible]);

  // Remember the cheapest total for this date so the date strip can show it.
  const centerDate = step === 1 && search?.tripType === "roundtrip" ? search.returnDate : search?.departDate;
  useEffect(() => {
    if (status !== "done" || !current.length || step > 1) return;
    const prices = datePriceCache.get(`${cacheKey}|${step}`) || {};
    prices[centerDate] = Math.min(...current.map((f) => f.price));
    datePriceCache.set(`${cacheKey}|${step}`, prices);
  }, [status, current, step, cacheKey, centerDate]);

  const goToDate = (d) => {
    const next = { ...search };
    if (step === 1) next.returnDate = d;
    else {
      next.departDate = d;
      if (next.returnDate && next.returnDate < d) next.returnDate = addDays(d, 1);
    }
    router.push(buildSearchUrl(lang, next));
  };

  const finish = (picks) => {
    const first = picks[0];
    const lastFlight = picks[picks.length - 1].flight;
    const total = picks.reduce((sum, p) => sum + p.fare.price, 0);
    const rt = search.tripType === "roundtrip";
    const bags = describeFare(first.fare, lang);
    const passengerCount = search.adults + search.children + search.infants;

    const stored = {
      offerId: first.fare.id,
      searchId,
      selectedOfferIds: picks.map((p) => p.fare.id),
      tripType: search.tripType,
      airline: first.flight.airline,
      airlineCode: first.flight.airlineCode,
      flightNo: first.flight.flightNumbers.join(" / "),
      origin: first.flight.from,
      destination: first.flight.to,
      departureDate: datePart(first.flight.departure),
      returnDate: rt ? datePart(lastFlight.departure) : null,
      isRoundTrip: rt,
      depTime: clock(first.flight.departure),
      arrTime: clock(first.flight.arrival),
      duration: first.flight.durationText,
      // CustomerTotalSAR already covers every traveller and our service fee. The server recomputes
      // the amount from the selected offers before charging; this is for display only.
      price: Math.round(total * 100) / 100,
      priceIsTotal: true,
      currency: "SAR",
      cabin: search.cabin,
      checkedBaggage: bags.checked,
      cabinBaggage: bags.cabin,
      fareType: first.fare.name || first.fare.fareClass || L.cabins[search.cabin],
      cancellationRule: first.fare.cancellation?.text || null,
      changeRule: first.fare.change?.text || null,
      adults: search.adults,
      children: search.children,
      infants: search.infants,
      passengerCount,
      legs: picks.map(({ flight, fare }) => {
        const b = describeFare(fare, lang);
        return {
          offerId: fare.id,
          from: flight.from,
          to: flight.to,
          airline: flight.airline,
          airlineCode: flight.airlineCode,
          flightNo: flight.flightNumbers.join(" / "),
          date: datePart(flight.departure),
          dep: clock(flight.departure),
          arr: clock(flight.arrival),
          arrivalDate: datePart(flight.arrival),
          duration: flight.durationText,
          stops: flight.stops,
          isDirect: flight.stops === 0,
          segments: flight.segments,
          checkedBaggage: b.checked,
          cabinBaggage: b.cabin,
          fareType: fare.name || fare.fareClass,
          price: fare.price,
        };
      }),
    };

    try {
      localStorage.setItem("selectedFlight", JSON.stringify(stored));
      localStorage.setItem("selectedBundle", JSON.stringify({ name: stored.fareType, price: stored.price, cabin: search.cabin.toLowerCase() }));
    } catch {
      /* storage blocked: checkout will ask the customer to search again */
    }
    router.push(`/${lang}/flights/booking`);
  };

  const onChooseFare = (fare) => {
    const picks = [...chosen.slice(0, step), { flight: drawer, fare }];
    setDrawer(null);
    if (step + 1 < legCount) {
      setChosen(picks);
      setStep(step + 1);
      setFilters(search.directOnly ? { ...EMPTY_FILTERS, stops: ["0"] } : EMPTY_FILTERS);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      finish(picks);
    }
  };

  const backToLeg = (k) => {
    setChosen(chosen.slice(0, k));
    setStep(k);
    setFilters(EMPTY_FILTERS);
  };

  if (!search) {
    return (
      <div className={s.page} dir={isRTL ? "rtl" : "ltr"}>
        <Landing lang={lang} onSearch={onSearch} router={router} />
      </div>
    );
  }

  const isRT = search.tripType === "roundtrip";
  const legTitle = search.tripType === "multicity" ? L.selectLegN(step + 1) : L.selectLeg[step] || L.selectLegN(step + 1);
  const stepLeg = search.tripType === "multicity" ? search.legs[step] : step === 0 ? { origin: search.origin, destination: search.destination } : { origin: search.destination, destination: search.origin };
  const routeTitle = `${airportInfo(stepLeg.origin).city || stepLeg.origin} ${isRTL ? "←" : "→"} ${airportInfo(stepLeg.destination).city || stepLeg.destination}`;
  const hasNearby = current.some((f) => f.nearbyAirport);
  const nextLabel = step + 1 < legCount ? (isRT ? L.continueReturn : L.continueNext) : L.continue;
  const priceLabel = legCount > 1 ? L.totalPrice : L.fromPrice;

  let body;
  if (status === "loading") {
    body = <Skeletons lang={lang} />;
  } else if (status === "error") {
    body = (
      <EmptyState icon={<FaInfoCircle />} title={L.error} text={errorMsg || L.errorHint}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => runSearch(search)}>
          <FaRedo size={12} /> {L.retry}
        </button>
      </EmptyState>
    );
  } else if (!current.length) {
    body = (
      <EmptyState icon={<FaPlane />} title={L.noResults} text={step > 0 && isRT ? L.noReturn : L.noResultsHint}>
        <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => goToDate(addDays(centerDate, 1))}>
          {formatDate(addDays(centerDate, 1), lang)}
        </button>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          {L.editSearch}
        </button>
      </EmptyState>
    );
  } else {
    body = (
      <>
        <div className={`${s.panel} ${s.sortTabs}`} role="tablist">
          {[
            ["best", L.best],
            ["cheapest", L.cheapest],
            ["fastest", L.fastest],
          ].map(([k, label]) => (
            <button type="button" role="tab" aria-selected={sortBy === k} key={k} className={`${s.sortTab} ${sortBy === k ? s.sortTabActive : ""}`} onClick={() => setSortBy(k)}>
              <strong>{label}</strong>
              {tops[k] && (
                <small>
                  <Price value={tops[k].price} /> · {tops[k].durationText}
                </small>
              )}
            </button>
          ))}
        </div>
        {hasNearby && !filters.exactAirports && (
          <div className={s.notice}>
            <FaInfoCircle style={{ marginTop: 3, flexShrink: 0 }} /> {L.nearbyNotice}
          </div>
        )}
        {visible.length ? (
          <div className={s.flightList}>
            {visible.map((f) => {
              const tags = [];
              if (f.journeyKey === tops.cheapest?.journeyKey) tags.push({ label: L.cheapest, tone: "green" });
              if (f.journeyKey === tops.fastest?.journeyKey && f.journeyKey !== tops.cheapest?.journeyKey) tags.push({ label: L.fastest });
              return <FlightCard key={f.journeyKey} flight={f} lang={lang} price={f.price} priceLabel={priceLabel} tags={tags} onSelect={setDrawer} />;
            })}
          </div>
        ) : (
          <EmptyState icon={<FaSlidersH />} title={L.noMatch} text={L.noMatchHint}>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setFilters(EMPTY_FILTERS)}>
              {L.resetAll}
            </button>
          </EmptyState>
        )}
      </>
    );
  }

  return (
    <div className={s.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className={s.searchBand}>
        <div className={s.container}>
          <SearchForm key={JSON.stringify(search)} lang={lang} initial={search} compact busy={status === "loading"} onSubmit={onSearch} />
        </div>
      </div>

      <div className={`${s.container} ${s.results}`}>
        {status === "done" && current.length > 0 ? (
          <FiltersPanel lang={lang} flights={current} filters={filters} onChange={setFilters} shown={visible.length} open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        ) : (
          <div />
        )}

        <main style={{ minWidth: 0 }}>
          <div className={s.stepHead}>
            <div className={s.stepTitle}>
              {legCount > 1 && <span className={s.stepNum}>{step + 1}</span>}
              <div>
                <h1>{legTitle}</h1>
                <p>
                  {routeTitle} · {L.totalNote(isRT)}
                </p>
              </div>
            </div>
            {status === "done" && current.length > 0 && (
              <button type="button" className={`${s.btn} ${s.btnGhost} ${s.mobileFilterBtn}`} onClick={() => setFiltersOpen(true)}>
                <FaSlidersH /> {L.filters}
              </button>
            )}
          </div>

          {chosen.slice(0, step).map((c, k) => (
            <ChosenLeg key={k} lang={lang} label={search.tripType === "multicity" ? L.flightN(k + 1) : L.chosen[k]} flight={c.flight} fare={c.fare} onChange={() => backToLeg(k)} />
          ))}

          {search.tripType !== "multicity" && step < 2 && (
            <DateStrip
              key={`${centerDate}-${step}`}
              lang={lang}
              center={centerDate}
              minDate={step === 1 ? search.departDate : todayISO()}
              prices={{ ...datePriceCache.get(`${cacheKey}|${step}`), ...(current.length ? { [centerDate]: Math.min(...current.map((f) => f.price)) } : {}) }}
              onPick={goToDate}
            />
          )}

          {body}
        </main>
      </div>

      {drawer && (
        <FareDrawer
          lang={lang}
          flight={drawer}
          searchId={searchId}
          extra={otherLegs}
          isRoundTripTotal={isRT}
          nextLabel={nextLabel}
          onClose={() => setDrawer(null)}
          onChoose={onChooseFare}
        />
      )}
    </div>
  );
}
