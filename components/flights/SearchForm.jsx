"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaRegCalendarAlt, FaUserFriends, FaExchangeAlt, FaSearch, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import akbarApi from "@/lib/akbarApi";
import { airportInfo, addDays, formatDate, todayISO, CABINS, MAX_PASSENGERS, POPULAR_AIRPORTS } from "@/lib/flights/offerModel";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

const toAirport = (ap) => ({
  code: ap.Code,
  city: ap.CityName,
  cityAr: ap.city_ar || ap.CityNameAr || "",
  name: ap.Name,
  country: ap.Country,
  countryAr: ap.country_ar || ap.CountryAr || "",
});

const POPULAR = POPULAR_AIRPORTS.map((code) => {
  const a = airportInfo(code);
  return { code, city: a.city, name: a.name, country: a.country };
});

const cityLabel = (ap, lang) => (lang === "ar" && ap.cityAr ? ap.cityAr : ap.city);

function useOutsideClose(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);
  return ref;
}

function AirportPopover({ lang, onPick, onClose }) {
  const L = dict(lang);
  const [q, setQ] = useState("");
  const [list, setList] = useState(POPULAR);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setList(POPULAR);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      const res = await akbarApi.request(`/airports?q=${encodeURIComponent(query)}`, "GET", null, {}, ctrl.signal);
      if (res.ok && Array.isArray(res.data?.data)) {
        setList(res.data.data.slice(0, 30).map(toAirport));
        setActive(0);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && list[active]) {
      e.preventDefault();
      onPick(list[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className={s.popover} role="dialog">
      <div className={s.popSearch}>
        <FaSearch />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={L.searchAirport} aria-label={L.searchAirport} />
      </div>
      <div className={s.popHeading}>{q.trim() ? L.results : L.popular}</div>
      <div className={s.popList} role="listbox">
        {list.length === 0 && <div className={s.popEmpty}>{L.noAirport(q)}</div>}
        {list.map((ap, i) => (
          <button
            type="button"
            key={`${ap.code}-${i}`}
            role="option"
            aria-selected={i === active}
            className={`${s.apOption} ${i === active ? s.apActive : ""}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => onPick(ap)}
          >
            <span className={s.apText}>
              <span className={s.apCity}>
                {cityLabel(ap, lang)}, {lang === "ar" && ap.countryAr ? ap.countryAr : ap.country}
              </span>
              <span className={s.apName} style={{ display: "block" }}>{ap.name}</span>
            </span>
            <span className={s.code}>{ap.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RouteFields({ lang, from, to, onFrom, onTo, onSwap }) {
  const L = dict(lang);
  const [open, setOpen] = useState(null);
  const ref = useOutsideClose(Boolean(open), () => setOpen(null));

  const pick = (ap) => {
    (open === "from" ? onFrom : onTo)(ap);
    setOpen(open === "from" && !to ? "to" : null);
  };

  const field = (key, ap, icon, label, placeholder) => (
    <button type="button" className={s.field} onClick={() => setOpen(open === key ? null : key)} aria-expanded={open === key}>
      <span className={s.fieldIcon}>{icon}</span>
      <span className={s.fieldBody}>
        <span className={s.fieldLabel}>{label}</span>
        <span className={s.fieldValue}>
          {ap ? (
            <>
              <span className={s.code}>{ap.code}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{cityLabel(ap, lang)}</span>
            </>
          ) : (
            <span className={s.placeholder}>{placeholder}</span>
          )}
        </span>
      </span>
    </button>
  );

  return (
    <div className={s.fieldGroup} ref={ref}>
      {field("from", from, <FaPlaneDeparture />, L.from, L.origin)}
      <button type="button" className={s.swap} onClick={onSwap} aria-label="Swap">
        <FaExchangeAlt size={11} />
      </button>
      {field("to", to, <FaPlaneArrival />, L.to, L.destination)}
      {open && <AirportPopover lang={lang} onPick={pick} onClose={() => setOpen(null)} />}
    </div>
  );
}

function DateField({ lang, label, value, min, onChange, children, accent }) {
  const inputRef = useRef(null);
  const openPicker = () => {
    try {
      inputRef.current?.showPicker?.();
    } catch {
      /* browsers without showPicker fall back to the native click on the input */
    }
  };
  return (
    <div className={s.field} onClick={openPicker} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openPicker()}>
      <span className={s.fieldIcon} style={accent ? { color: "var(--teal)" } : undefined}>
        <FaRegCalendarAlt />
      </span>
      <span className={s.fieldBody}>
        <span className={s.fieldLabel}>{label}</span>
        <span className={s.fieldValue}>{formatDate(value, lang)}</span>
      </span>
      <input ref={inputRef} type="date" className={s.dateInput} value={value} min={min} onChange={(e) => e.target.value && onChange(e.target.value)} tabIndex={-1} aria-label={label} />
      {children}
    </div>
  );
}

function TravellersField({ lang, pax, cabin, onChange }) {
  const L = dict(lang);
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const total = pax.adults + pax.children + pax.infants;
  const full = total >= MAX_PASSENGERS;

  const set = (k, v) => {
    const next = { ...pax, [k]: v };
    if (next.infants > next.adults) next.infants = next.adults;
    onChange(next, cabin);
  };

  const row = (k, label, hint, min, canAdd) => (
    <div className={s.paxRow}>
      <div>
        <div className={s.paxLabel}>{label}</div>
        <div className={s.paxHint}>{hint}</div>
      </div>
      <div className={s.stepper}>
        <button type="button" className={s.iconBtn} disabled={pax[k] <= min} onClick={() => set(k, pax[k] - 1)} aria-label={`- ${label}`}>
          <FaMinus size={10} />
        </button>
        <span aria-live="polite">{pax[k]}</span>
        <button type="button" className={s.iconBtn} disabled={!canAdd} onClick={() => set(k, pax[k] + 1)} aria-label={`+ ${label}`}>
          <FaPlus size={10} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={s.fieldGroup} ref={ref}>
      <button type="button" className={s.field} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={s.fieldIcon}>
          <FaUserFriends />
        </span>
        <span className={s.fieldBody}>
          <span className={s.fieldLabel}>{L.travellers}</span>
          <span className={s.fieldValue}>
            {L.travellerCount(total)}, {L.cabins[cabin]}
          </span>
        </span>
      </button>
      {open && (
        <div className={`${s.popover} ${s.popoverEnd}`} style={{ minWidth: 320 }}>
          <div className={s.paxPanel}>
            {row("adults", L.adults, L.adultsHint, 1, !full)}
            {row("children", L.children, L.childrenHint, 0, !full)}
            {row("infants", L.infants, L.infantsHint, 0, !full && pax.infants < pax.adults)}
            <div className={s.paxLabel} style={{ marginTop: 12 }}>{L.cabin}</div>
            <div className={s.cabinGrid}>
              {CABINS.map((c) => (
                <button type="button" key={c} className={`${s.pill} ${cabin === c ? s.pillActive : ""}`} onClick={() => onChange(pax, c)}>
                  {L.cabins[c]}
                </button>
              ))}
            </div>
            <p className={s.paxNote}>{L.paxNote}</p>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} style={{ width: "100%" }} onClick={() => setOpen(false)}>
              {L.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const fromCode = (code) => (code ? { ...airportInfo(code), code } : null);

export default function SearchForm({ lang, initial, compact = false, busy = false, onSubmit }) {
  const L = dict(lang);
  const tomorrow = addDays(todayISO(), 1);

  const [tripType, setTripType] = useState(initial?.tripType || (initial?.returnDate ? "roundtrip" : "oneway"));
  const [from, setFrom] = useState(fromCode(initial?.origin));
  const [to, setTo] = useState(fromCode(initial?.destination));
  const [depart, setDepart] = useState(initial?.departDate || tomorrow);
  const [ret, setRet] = useState(initial?.returnDate || addDays(initial?.departDate || tomorrow, 3));
  const [pax, setPax] = useState({ adults: initial?.adults || 1, children: initial?.children || 0, infants: initial?.infants || 0 });
  const [cabin, setCabin] = useState(initial?.cabin || "Economy");
  const [directOnly, setDirectOnly] = useState(Boolean(initial?.directOnly));
  const [legs, setLegs] = useState(() => initial?.legs?.length
    ? initial.legs.map((l) => ({ from: fromCode(l.origin), to: fromCode(l.destination), date: l.date }))
    : [
    { from: fromCode(initial?.origin), to: fromCode(initial?.destination), date: initial?.departDate || tomorrow },
    { from: fromCode(initial?.destination), to: null, date: addDays(initial?.departDate || tomorrow, 3) },
  ]);
  const [error, setError] = useState("");

  const setDepartDate = (d) => {
    setDepart(d);
    if (ret < d) setRet(addDays(d, 1));
  };

  const updateLeg = (i, patch) =>
    setLegs((prev) => {
      const next = prev.map((l, j) => (j === i ? { ...l, ...patch } : l));
      // The next flight usually leaves from where this one lands.
      if (patch.to && next[i + 1] && !next[i + 1].from) next[i + 1] = { ...next[i + 1], from: patch.to };
      for (let j = 1; j < next.length; j++) if (next[j].date < next[j - 1].date) next[j] = { ...next[j], date: next[j - 1].date };
      return next;
    });

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const base = { cabin, ...pax, directOnly };

    if (tripType === "multicity") {
      const bad = legs.findIndex((l) => !l.from || !l.to || l.from.code === l.to.code);
      if (bad >= 0) return setError(L.errLeg(bad + 1));
      return onSubmit({
        ...base,
        tripType,
        origin: legs[0].from.code,
        destination: legs[0].to.code,
        departDate: legs[0].date,
        legs: legs.map((l) => ({ origin: l.from.code, destination: l.to.code, date: l.date })),
      });
    }
    if (!from || !to) return setError(L.errRoute);
    if (from.code === to.code) return setError(L.errSame);
    onSubmit({ ...base, tripType, origin: from.code, destination: to.code, departDate: depart, returnDate: tripType === "roundtrip" ? ret : "" });
  };

  return (
    <form className={s.searchCard} onSubmit={submit} noValidate>
      {!compact && (
        <div className={s.searchTop}>
          <div className={s.pills} role="radiogroup">
            {[
              ["oneway", L.oneWay],
              ["roundtrip", L.roundTrip],
              ["multicity", L.multiCity],
            ].map(([k, label]) => (
              <button type="button" role="radio" aria-checked={tripType === k} key={k} className={`${s.pill} ${tripType === k ? s.pillActive : ""}`} onClick={() => setTripType(k)}>
                {label}
              </button>
            ))}
          </div>
          <div className={s.checks}>
            <label className={s.check}>
              <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} />
              {L.directOnly}
            </label>
          </div>
        </div>
      )}

      {tripType === "multicity" ? (
        <>
          {legs.map((leg, i) => (
            <div className={s.legRow} key={i}>
              <span className={s.legTag}>{L.flightN(i + 1)}</span>
              <RouteFields
                lang={lang}
                from={leg.from}
                to={leg.to}
                onFrom={(ap) => updateLeg(i, { from: ap })}
                onTo={(ap) => updateLeg(i, { to: ap })}
                onSwap={() => updateLeg(i, { from: leg.to, to: leg.from })}
              />
              <div className={s.fieldGroup}>
                <DateField lang={lang} label={L.departure} value={leg.date} min={i ? legs[i - 1].date : todayISO()} onChange={(d) => updateLeg(i, { date: d })} />
              </div>
              {legs.length > 2 ? (
                <button type="button" className={s.iconBtn} onClick={() => setLegs(legs.filter((_, j) => j !== i))} aria-label="Remove">
                  <FaTimes size={12} />
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
          <div className={s.multiActions}>
            {legs.length < 5 ? (
              <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => setLegs([...legs, { from: legs[legs.length - 1].to, to: null, date: addDays(legs[legs.length - 1].date, 2) }])}>
                {L.addFlight}
              </button>
            ) : (
              <span />
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <TravellersField
                lang={lang}
                pax={pax}
                cabin={cabin}
                onChange={(p, c) => {
                  setPax(p);
                  setCabin(c);
                }}
              />
              <button type="submit" className={`${s.btn} ${s.btnCta}`} disabled={busy}>
                <FaSearch /> {L.searchFlights}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={s.searchRow}>
          <RouteFields
            lang={lang}
            from={from}
            to={to}
            onFrom={(ap) => (ap.code === to?.code ? (setTo(from), setFrom(ap)) : setFrom(ap))}
            onTo={(ap) => (ap.code === from?.code ? (setFrom(to), setTo(ap)) : setTo(ap))}
            onSwap={() => {
              setFrom(to);
              setTo(from);
            }}
          />
          <div className={s.fieldGroup}>
            <DateField lang={lang} label={L.departure} value={depart} min={todayISO()} onChange={setDepartDate} />
            {tripType === "roundtrip" ? (
              <DateField lang={lang} label={L.return} value={ret} min={depart} onChange={setRet} accent>
                <button
                  type="button"
                  className={s.clearBtn}
                  aria-label={L.oneWay}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTripType("oneway");
                  }}
                >
                  <FaTimes size={12} />
                </button>
              </DateField>
            ) : (
              <button type="button" className={s.field} onClick={() => setTripType("roundtrip")}>
                <span className={s.addReturn}>{L.addReturn}</span>
              </button>
            )}
          </div>
          <TravellersField
            lang={lang}
            pax={pax}
            cabin={cabin}
            onChange={(p, c) => {
              setPax(p);
              setCabin(c);
            }}
          />
          <button type="submit" className={`${s.btn} ${compact ? s.btnPrimary : s.btnCta} ${s.btnSearch}`} disabled={busy}>
            <FaSearch /> {L.search}
          </button>
        </div>
      )}
      {error && (
        <div className={s.formError} role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
