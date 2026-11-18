"use client";

// Destination (Akbar autosuggest), check-in / check-out (the flights calendar), rooms and guests.
// Field look and behaviour match the flight search so both feel like one product.

import { useEffect, useMemo, useRef, useState } from "react";
import { FaMapMarkerAlt, FaRegCalendarAlt, FaUserFriends, FaSearch, FaMinus, FaPlus, FaHotel, FaPlane, FaCity, FaLandmark } from "react-icons/fa";
import DatePicker from "@/components/flights/DatePicker";
import { addDays, formatDate, todayISO } from "@/lib/flights/offerModel";
import { getCountryOptions } from "@/lib/countries";
import hotelApi from "@/lib/hotels/hotelApi";
import { defaultDates, defaultRooms, guestCount, nightsBetween, MAX_ADULTS, MAX_CHILDREN, MAX_ROOMS } from "@/lib/hotels/hotelModel";
import { t as dict } from "./i18n";
import fs from "@/components/flights/flights.module.css";
import s from "./hotels.module.css";

function useOutsideClose(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
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

const placeIcon = (type) => {
  if (type === "hotel") return <FaHotel />;
  if (type === "airport") return <FaPlane />;
  if (type === "poi") return <FaLandmark />;
  return <FaCity />;
};

const toPlace = (loc) => ({
  id: loc.id ? String(loc.id) : null,
  name: loc.name,
  fullName: loc.fullName || loc.name,
  type: loc.type,
  country: loc.country || "",
  lat: loc.coordinates?.lat,
  lng: loc.coordinates?.long,
});

function DestinationField({ lang, value, onPick }) {
  const L = dict(lang);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | done
  const [active, setActive] = useState(0);
  const ref = useOutsideClose(open, () => setOpen(false));
  const inputRef = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setList([]);
      setState("idle");
      return undefined;
    }
    const ctrl = new AbortController();
    setState("loading");
    const timer = setTimeout(async () => {
      try {
        const res = await hotelApi.autosuggest(term, ctrl.signal);
        const places = (res.locations || []).map(toPlace).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
        setList(places.slice(0, 12));
        setActive(0);
        setState("done");
      } catch (e) {
        if (e?.name !== "AbortError") {
          setList([]);
          setState("done");
        }
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const popular = L.popular.map((p) => ({ id: null, name: p.q || p.name, label: p.name, fullName: p.sub, type: "city", country: p.cc, lat: p.lat, lng: p.lng }));
  const shown = q.trim().length >= 2 ? list : popular;

  const choose = (p) => {
    onPick({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, country: p.country, label: p.label || p.name });
    setOpen(false);
    setQ("");
  };

  return (
    <div className={fs.fieldGroup} ref={ref}>
      <div
        className={`${fs.field} ${open ? fs.fieldEditing : ""}`}
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        role="button"
        tabIndex={-1}
      >
        <span className={fs.fieldIcon}>
          <FaMapMarkerAlt />
        </span>
        <span className={fs.fieldBody}>
          <span className={fs.fieldLabel}>{L.destination}</span>
          {open ? (
            <input
              ref={inputRef}
              className={fs.fieldInput}
              value={q}
              placeholder={value?.label || value?.name || L.destinationPh}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, shown.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter" && shown[active]) {
                  e.preventDefault();
                  choose(shown[active]);
                }
              }}
              aria-label={L.destination}
              autoComplete="off"
            />
          ) : (
            <span className={fs.fieldValue}>
              {value ? value.label || value.name : <span className={fs.placeholder}>{L.destinationPh}</span>}
            </span>
          )}
        </span>
      </div>
      {open && (
        <div className={fs.popover} role="listbox">
          {q.trim().length < 2 && <div className={fs.popHeading}>{L.popularTitle}</div>}
          <div className={s.placeList}>
            {state === "loading" && q.trim().length >= 2 && !list.length && <div className={fs.popEmpty}>{L.searching}</div>}
            {state === "done" && !list.length && <div className={fs.popEmpty}>{L.noPlaces(q.trim())}</div>}
            {shown.map((p, i) => (
              <button
                type="button"
                key={`${p.id || p.name}-${i}`}
                className={`${s.placeOption} ${i === active ? s.placeActive : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(p)}
                role="option"
                aria-selected={i === active}
              >
                <span className={s.placeIcon}>{placeIcon(p.type)}</span>
                <span className={s.placeText}>
                  <strong>{p.label || p.name}</strong>
                  <small>{p.fullName}</small>
                </span>
                {p.type && L.placeTypes[p.type] && <span className={s.placeType}>{L.placeTypes[p.type]}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DateField({ lang, label, value, min, rangeFrom, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div
      ref={ref}
      className={`${fs.field} ${open ? fs.fieldEditing : ""}`}
      onClick={() => setOpen((o) => !o)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-haspopup="dialog"
      onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
    >
      <span className={fs.fieldIcon}>
        <FaRegCalendarAlt />
      </span>
      <span className={fs.fieldBody}>
        <span className={fs.fieldLabel}>{label}</span>
        <span className={fs.fieldValue}>{formatDate(value, lang)}</span>
      </span>
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

function Stepper({ label, hint, value, min, max, onChange }) {
  return (
    <div className={fs.paxRow}>
      <div>
        <div className={fs.paxLabel}>{label}</div>
        <div className={fs.paxHint}>{hint}</div>
      </div>
      <div className={fs.stepper}>
        <button type="button" className={fs.iconBtn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`- ${label}`}>
          <FaMinus size={10} />
        </button>
        <span aria-live="polite">{value}</span>
        <button type="button" className={fs.iconBtn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`+ ${label}`}>
          <FaPlus size={10} />
        </button>
      </div>
    </div>
  );
}

function GuestsField({ lang, rooms, nationality, onChange }) {
  const L = dict(lang);
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const countries = useMemo(() => getCountryOptions(lang), [lang]);

  const setRoom = (i, patch) => onChange(rooms.map((r, j) => (j === i ? { ...r, ...patch } : r)), nationality);
  const setChildren = (i, n) => {
    const ages = [...rooms[i].childAges];
    while (ages.length < n) ages.push(8);
    setRoom(i, { childAges: ages.slice(0, n) });
  };

  return (
    <div className={fs.fieldGroup} ref={ref}>
      <button type="button" className={fs.field} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={fs.fieldIcon}>
          <FaUserFriends />
        </span>
        <span className={fs.fieldBody}>
          <span className={fs.fieldLabel}>{L.guests}</span>
          <span className={fs.fieldValue}>
            {L.rooms(rooms.length)}, {L.guestsN(guestCount(rooms))}
          </span>
        </span>
      </button>
      {open && (
        <div className={`${fs.popover} ${fs.popoverEnd}`}>
          <div className={s.guestPanel}>
            {rooms.map((room, i) => (
              <div key={i} className={s.roomBlock}>
                <div className={s.roomBlockHead}>
                  <span>
                    {L.room} {i + 1}
                  </span>
                  {rooms.length > 1 && (
                    <button type="button" className={fs.linkBtn} onClick={() => onChange(rooms.filter((_, j) => j !== i), nationality)}>
                      {L.removeRoom}
                    </button>
                  )}
                </div>
                <Stepper label={L.adults} hint={L.adultsHint} value={room.adults} min={1} max={MAX_ADULTS} onChange={(v) => setRoom(i, { adults: v })} />
                <Stepper label={L.children} hint={L.childrenHint} value={room.childAges.length} min={0} max={MAX_CHILDREN} onChange={(v) => setChildren(i, v)} />
                {room.childAges.length > 0 && (
                  <div className={s.ageGrid}>
                    {room.childAges.map((age, k) => (
                      <div key={k}>
                        <label htmlFor={`age-${i}-${k}`}>{L.childAge(k + 1)}</label>
                        <select
                          id={`age-${i}-${k}`}
                          className={s.select}
                          value={age}
                          onChange={(e) => setRoom(i, { childAges: room.childAges.map((a, m) => (m === k ? Number(e.target.value) : a)) })}
                        >
                          {Array.from({ length: 18 }, (_, n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {rooms.length < MAX_ROOMS && (
              <button type="button" className={fs.addLegLink} onClick={() => onChange([...rooms, { adults: 1, childAges: [] }], nationality)}>
                {L.addRoom}
              </button>
            )}
            <div className={s.natRow}>
              <label htmlFor="hotel-nat">{L.nationality}</label>
              <select id="hotel-nat" className={s.select} value={nationality} onChange={(e) => onChange(rooms, e.target.value)}>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <small>{L.nationalityHint}</small>
            </div>
            <div className={s.guestFoot}>
              <span />
              <button type="button" className={`${fs.btn} ${fs.btnPrimary}`} onClick={() => setOpen(false)}>
                {L.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @param initial search state (see lib/hotels/hotelModel parseSearch) or null
 * @param onSubmit receives the complete search state
 */
export default function HotelSearchForm({ lang, initial, onSubmit, compact = false }) {
  const L = dict(lang);
  const dates = defaultDates();
  const [destination, setDestination] = useState(initial?.destination ? { ...initial.destination, label: initial.destination.name } : null);
  const [checkIn, setCheckIn] = useState(initial?.checkIn || dates.checkIn);
  const [checkOut, setCheckOut] = useState(initial?.checkOut || dates.checkOut);
  const [rooms, setRooms] = useState(initial?.rooms || defaultRooms());
  const [nationality, setNationality] = useState(initial?.nationality || "SA");
  const [error, setError] = useState("");

  const nights = nightsBetween(checkIn, checkOut);

  const submit = (e) => {
    e.preventDefault();
    if (!destination) {
      setError(L.pickDestination);
      return;
    }
    setError("");
    onSubmit({
      destination: { id: destination.id, name: destination.name, lat: destination.lat, lng: destination.lng, country: destination.country },
      checkIn,
      checkOut,
      rooms,
      nationality,
    });
  };

  return (
    <form className={fs.searchCard} onSubmit={submit} noValidate>
      <div className={fs.searchRow}>
        <DestinationField
          lang={lang}
          value={destination}
          onPick={(p) => {
            setDestination(p);
            setError("");
          }}
        />
        <div className={fs.fieldGroup} style={{ position: "relative" }}>
          {nights > 0 && <span className={s.nightsBadge}>{L.nightsN(nights)}</span>}
          <DateField
            lang={lang}
            label={L.checkIn}
            value={checkIn}
            min={todayISO()}
            onChange={(d) => {
              setCheckIn(d);
              if (checkOut <= d) setCheckOut(addDays(d, 1));
            }}
          />
          <DateField lang={lang} label={L.checkOut} value={checkOut} min={addDays(checkIn, 1)} rangeFrom={checkIn} onChange={setCheckOut} />
        </div>
        <GuestsField
          lang={lang}
          rooms={rooms}
          nationality={nationality}
          onChange={(r, n) => {
            setRooms(r);
            setNationality(n);
          }}
        />
        <button type="submit" className={`${fs.btn} ${fs.btnCta} ${fs.btnSearch}`}>
          <FaSearch /> {compact ? L.search : L.searchHotels}
        </button>
      </div>
      {error && <div className={fs.formError}>{error}</div>}
    </form>
  );
}
