"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaRegCalendarAlt, FaUserFriends, FaExchangeAlt, FaSearch, FaMinus, FaPlus, FaTimes, FaMapMarkerAlt, FaPlane } from "react-icons/fa";
import akbarApi from "@/lib/akbarApi";
import { airportInfo, addDays, formatDate, todayISO, CABINS, MAX_PASSENGERS, POPULAR_AIRPORTS } from "@/lib/flights/offerModel";
import { t as dict } from "./i18n";
import DatePicker from "./DatePicker";
import s from "./flights.module.css";

const toAirport = (ap) => ({
  code: ap.Code,
  cityCode: ap.CityCode || ap.Code,
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
    // A popup rendered into <body> (the phone calendar sheet) is outside ref but still part of the field.
    const handler = (e) => ref.current && !ref.current.contains(e.target) && !e.target.closest?.("[data-popup-portal]") && onClose();
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

const countryLabel = (ap, lang) => (lang === "ar" && ap.countryAr ? ap.countryAr : ap.country);

/** Airports matching the typed text (popular airports while it is empty), debounced. */
function useAirportSearch(q) {
  const [list, setList] = useState(POPULAR);
  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setList(POPULAR);
      return undefined;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      const res = await akbarApi.request(`/airports?q=${encodeURIComponent(query)}`, "GET", null, {}, ctrl.signal);
      if (res.ok && Array.isArray(res.data?.data)) setList(res.data.data.slice(0, 30).map(toAirport));
    }, 200);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);
  return list;
}

/**
 * One row per city, its airports indented beneath it. Grouped by the catalog's CityCode, since an
 * airport's CityName can differ from its city's ("London Heathrow" is in LON).
 *
 * The city row picks the catalog entry whose code is the city code itself when there is one (LON
 * "All Airports, London", DMM King Fahad), otherwise the city's first airport.
 */
function groupByCity(list) {
  const groups = new Map();
  for (const ap of list) {
    const key = `${ap.cityCode}|${ap.country}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ap);
  }
  const rows = [];
  for (const airports of groups.values()) {
    const cityEntry = airports.find((a) => a.code === a.cityCode) || airports[0];
    rows.push({ kind: "city", ap: cityEntry });
    // "All Airports, London" is what the city row already offers; real airports are all listed.
    const children = airports.filter((a) => !/^all airports/i.test(a.name || ""));
    for (const ap of children.length ? children : airports) rows.push({ kind: "airport", ap });
  }
  return rows;
}

/** The typed text, highlighted wherever it appears in a label. */
function Highlight({ text, q }) {
  const query = q.trim();
  const i = query ? String(text).toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className={s.apMatch}>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function AirportResults({ lang, q, rows, active, setActive, onPick }) {
  const L = dict(lang);
  return (
    <div className={`${s.popover} ${s.apPopover}`} role="listbox">
      {!q.trim() && <div className={s.popHeading}>{L.popular}</div>}
      {rows.length === 0 && <div className={s.popEmpty}>{L.noAirport(q)}</div>}
      <div className={s.popList}>
        {rows.map(({ kind, ap }, i) => (
          <button
            type="button"
            key={`${kind}-${ap.code}-${i}`}
            role="option"
            aria-selected={i === active}
            className={`${s.apOption} ${kind === "airport" ? s.apChild : ""} ${i === active ? s.apActive : ""}`}
            onMouseEnter={() => setActive(i)}
            // mousedown, not click: the field's input would otherwise lose focus and close the list first.
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(ap);
            }}
          >
            <span className={s.apIcon}>{kind === "city" ? <FaMapMarkerAlt /> : <FaPlane />}</span>
            <span className={s.apText}>
              <span className={s.apCity}>
                <Highlight text={`${cityLabel(ap, lang)}, ${countryLabel(ap, lang)}`} q={q} />
              </span>
              <span className={s.apName}>
                <Highlight text={kind === "city" ? cityLabel(ap, lang) : ap.name} q={q} />
              </span>
            </span>
            <span className={s.code}>{ap.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** From / To box: shows the chosen airport, and becomes a text input while it is open. */
function AirportField({ lang, open, ap, icon, label, placeholder, onOpen, onClose, onPick }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const found = useAirportSearch(q);
  // Popular airports are one per city already, so they are listed flat.
  const rows = q.trim() ? groupByCity(found) : found.map((a) => ({ kind: "popular", ap: a }));

  useEffect(() => {
    setActive(0);
  }, [q]);
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rows[active]) onPick(rows[active].ap);
    } else if (e.key === "Escape" || e.key === "Tab") {
      onClose();
    }
  };

  if (!open) {
    return (
      <button type="button" className={s.field} onClick={onOpen} aria-haspopup="listbox">
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
  }

  return (
    <div className={`${s.field} ${s.fieldEditing}`}>
      <span className={s.fieldIcon}>{icon}</span>
      <span className={s.fieldBody}>
        <span className={s.fieldLabel}>{label}</span>
        <input
          autoFocus
          className={s.fieldInput}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder={ap ? `${ap.code} · ${cityLabel(ap, lang)}` : dict(lang).searchAirport}
          aria-label={label}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
        />
      </span>
      <AirportResults lang={lang} q={q} rows={rows} active={active} setActive={setActive} onPick={onPick} />
    </div>
  );
}

function RouteFields({ lang, from, to, onFrom, onTo, onSwap }) {
  const L = dict(lang);
  const [open, setOpen] = useState(null);
  const ref = useOutsideClose(Boolean(open), () => setOpen(null));

  const pick = (key) => (ap) => {
    (key === "from" ? onFrom : onTo)(ap);
    // Choosing the origin moves straight on to the destination.
    setOpen(key === "from" && !to ? "to" : null);
  };

  return (
    <div className={s.fieldGroup} ref={ref}>
      <AirportField
        lang={lang}
        open={open === "from"}
        ap={from}
        icon={<FaPlaneDeparture />}
        label={L.from}
        placeholder={L.origin}
        onOpen={() => setOpen("from")}
        onClose={() => setOpen(null)}
        onPick={pick("from")}
      />
      <button type="button" className={s.swap} onClick={onSwap} aria-label="Swap">
        <FaExchangeAlt size={11} />
      </button>
      <AirportField
        lang={lang}
        open={open === "to"}
        ap={to}
        icon={<FaPlaneArrival />}
        label={L.to}
        placeholder={L.destination}
        onOpen={() => setOpen("to")}
        onClose={() => setOpen(null)}
        onPick={pick("to")}
      />
    </div>
  );
}

function DateField({ lang, label, value, min, onChange, children, accent, rangeFrom }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div
      ref={ref}
      className={`${s.field} ${open ? s.fieldEditing : ""}`}
      onClick={() => setOpen((o) => !o)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-haspopup="dialog"
      onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
    >
      <span className={s.fieldIcon} style={accent ? { color: "var(--teal)" } : undefined}>
        <FaRegCalendarAlt />
      </span>
      <span className={s.fieldBody}>
        <span className={s.fieldLabel}>{label}</span>
        <span className={s.fieldValue}>{formatDate(value, lang)}</span>
      </span>
      {children}
      {open && (
        <DatePicker
          lang={lang}
          title={label}
          value={value}
          min={min}
          rangeFrom={rangeFrom}
          onPick={(d) => {
            onChange(d);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
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
  const [bagsOnly, setBagsOnly] = useState(Boolean(initial?.bagsOnly));
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
    const base = { cabin, ...pax, directOnly, bagsOnly };

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
            <label className={s.check}>
              <input type="checkbox" checked={bagsOnly} onChange={(e) => setBagsOnly(e.target.checked)} />
              {L.includedBaggage}
            </label>
          </div>
        </div>
      )}

      {tripType === "multicity" ? (
        // Same columns as the one-way row: the first flight carries travellers and Search, the
        // others line up underneath it.
        <>
          <div className={`${s.searchRow} ${s.multiGrid}`}>
            {legs.map((leg, i) => (
              <Fragment key={i}>
                <RouteFields
                  lang={lang}
                  from={leg.from}
                  to={leg.to}
                  onFrom={(ap) => updateLeg(i, { from: ap })}
                  onTo={(ap) => updateLeg(i, { to: ap })}
                  onSwap={() => updateLeg(i, { from: leg.to, to: leg.from })}
                />
                <div className={s.fieldGroup}>
                  <DateField lang={lang} label={L.flightN(i + 1)} value={leg.date} min={i ? legs[i - 1].date : todayISO()} onChange={(d) => updateLeg(i, { date: d })} />
                </div>
                {i === 0 ? (
                  <>
                    <TravellersField
                      lang={lang}
                      pax={pax}
                      cabin={cabin}
                      onChange={(p, c) => {
                        setPax(p);
                        setCabin(c);
                      }}
                    />
                    <button type="submit" className={`${s.btn} ${s.btnCta} ${s.btnSearch}`} disabled={busy}>
                      <FaSearch /> {L.search}
                    </button>
                  </>
                ) : (
                  <div className={s.legRemoveCell}>
                    {legs.length > 2 && (
                      <button type="button" className={s.legRemove} onClick={() => setLegs(legs.filter((_, j) => j !== i))}>
                        <FaTimes size={11} /> {L.removeFlight}
                      </button>
                    )}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {legs.length < 5 && (
            <button
              type="button"
              className={s.addLegLink}
              onClick={() => setLegs([...legs, { from: legs[legs.length - 1].to, to: null, date: addDays(legs[legs.length - 1].date, 2) }])}
            >
              <FaPlus size={11} /> {L.addFlight}
            </button>
          )}
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
              <DateField lang={lang} label={L.return} value={ret} min={depart} onChange={setRet} accent rangeFrom={depart}>
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
