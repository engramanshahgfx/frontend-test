"use client";

import { useEffect, useRef, useState } from "react";
import { FaUser, FaEnvelope, FaChevronDown } from "react-icons/fa";
import CountryField from "@/components/CountryField";
import { t as dict } from "./i18n";
import c from "./checkout.module.css";

const TITLES = { ADT: ["Mr", "Mrs", "Ms"], CHD: ["Mstr", "Miss"], INF: ["Mstr", "Miss"] };
const FEMALE = ["Mrs", "Ms", "Miss"];
const LATIN = /^[A-Za-z][A-Za-z' -]*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emptyTraveller = (type) => ({
  type, title: TITLES[type][0], gender: "M", firstName: "", lastName: "", dateOfBirth: "",
  nationality: "SA", passportNumber: "", passportExpiry: "", passportIssueDate: "", issuingCountry: "SA", visaType: "",
});

// Akbar's VisaType is free text (its own sandbox booking sends "Visiting Visa"). Asked by some
// airlines for international travel, e.g. IndiGo into Saudi Arabia; empty when not needed.
export const VISA_TYPES = ["Visiting Visa", "Tourist Visa", "Business Visa", "Employment Visa", "Residence Visa", "Umrah Visa", "Hajj Visa", "Student Visa", "Transit Visa"];

export const emptyContact = () => ({ email: "", dialCode: "+966", phone: "" });

const today = () => new Date().toISOString().slice(0, 10);

const yearsOn = (dob, onDate) => {
  const a = new Date(dob);
  const b = new Date(onDate);
  let y = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) y--;
  return y;
};

/** Field errors keyed "contact.email" / "0.firstName". Matches the backend's passenger rules. */
export function validateCheckout(contact, travellers, { firstDate, lastDate }, lang) {
  const L = dict(lang);
  const e = {};
  if (!EMAIL.test(contact.email.trim())) e["contact.email"] = L.badEmail;
  if (contact.phone.replace(/\D/g, "").length < 7) e["contact.phone"] = L.badPhone;

  const passports = new Set();
  travellers.forEach((p, i) => {
    const k = (f) => `${i}.${f}`;
    for (const f of ["firstName", "lastName"]) {
      if (!p[f].trim()) e[k(f)] = L.required;
      else if (!LATIN.test(p[f].trim())) e[k(f)] = L.latinOnly;
    }
    if (!p.dateOfBirth) e[k("dateOfBirth")] = L.required;
    else {
      const age = yearsOn(p.dateOfBirth, firstDate);
      const ok = p.type === "ADT" ? age >= 12 : p.type === "CHD" ? age >= 2 && age <= 11 : age < 2 && new Date(p.dateOfBirth) <= new Date();
      if (!ok) e[k("dateOfBirth")] = L.ageRange(p.type);
    }
    if (!p.nationality) e[k("nationality")] = L.required;
    if (!p.issuingCountry) e[k("issuingCountry")] = L.required;
    const passport = p.passportNumber.trim().toUpperCase();
    if (!passport) e[k("passportNumber")] = L.required;
    else if (!/^[A-Z0-9]{5,20}$/.test(passport)) e[k("passportNumber")] = L.badPassport;
    else if (passports.has(passport)) e[k("passportNumber")] = L.duplicatePassport;
    passports.add(passport);
    if (!p.passportExpiry) e[k("passportExpiry")] = L.required;
    else if (p.passportExpiry <= lastDate) e[k("passportExpiry")] = L.expiryAfterTrip;
    if (p.passportIssueDate && (p.passportIssueDate > today() || (p.passportExpiry && p.passportIssueDate >= p.passportExpiry))) e[k("passportIssueDate")] = L.badIssueDate;
  });
  return e;
}

// A country picker has its own buttons, so it sits in a div rather than a forwarding <label>.
function Field({ label, error, hint, children, className = "", as: Tag = "label" }) {
  return (
    <Tag className={`${c.field} ${error ? c.invalid : ""} ${className}`}>
      <span className={c.label}>{label}</span>
      {children}
      {error ? <span className={c.err}>{error}</span> : hint ? <span className={c.hint}>{hint}</span> : null}
    </Tag>
  );
}

/** Opens inside the page at the field's width, like the country picker; a native <select> list does not. */
function Select({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);
  const selected = Math.max(options.findIndex((o) => o.value === value), 0);

  useEffect(() => {
    if (!open) return undefined;
    setActive(selected);
    listRef.current?.scrollIntoView({ block: "nearest" });
    const outside = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open, selected]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "Escape" || e.key === "Tab") setOpen(false);
    if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) return;
    e.preventDefault();
    if (!open) setOpen(true);
    else if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, options.length - 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
    else pick(options[active].value);
  };

  return (
    <div className={c.select} ref={ref}>
      <button type="button" className={`${c.input} ${c.selectBtn}`} aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={onKey}>
        <span>{options[selected]?.label}</span>
        <FaChevronDown size={11} />
      </button>
      {open && (
        <ul className={c.selectList} role="listbox" aria-label={label} ref={listRef}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`${c.selectOption} ${i === active ? c.selectActive : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o.value)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TravellerForm({ lang, contact, travellers, errors, disabled, onContact, onTraveller, firstDate, lastDate }) {
  const L = dict(lang);
  const sixMonthsAfter = (() => {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <fieldset disabled={disabled} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <section className={c.card}>
        <div className={c.cardHead}>
          <h2>
            <FaEnvelope size={15} /> {L.contactTitle}
          </h2>
          <p>{L.contactHint}</p>
        </div>
        <div className={`${c.cardBody} ${c.grid}`}>
          <Field label={L.email} error={errors["contact.email"]}>
            <input className={c.input} type="email" autoComplete="email" inputMode="email" dir="ltr" value={contact.email} onChange={(e) => onContact({ email: e.target.value })} />
          </Field>
          <Field label={L.phone} error={errors["contact.phone"]}>
            <div className={c.phoneRow} dir="ltr">
              {/* Without a country-code hint, browser autofill writes the whole number into this box. */}
              <input className={c.input} type="tel" autoComplete="tel-country-code" inputMode="tel" maxLength={5} value={contact.dialCode} onChange={(e) => onContact({ dialCode: e.target.value.replace(/[^\d+]/g, "") })} aria-label="Country code" />
              <input className={c.input} type="tel" autoComplete="tel-national" inputMode="tel" value={contact.phone} onChange={(e) => onContact({ phone: e.target.value.replace(/[^\d ]/g, "") })} />
            </div>
          </Field>
        </div>
      </section>

      {travellers.map((p, i) => {
        const err = (f) => errors[`${i}.${f}`];
        const set = (patch) => onTraveller(i, patch);
        return (
          <section className={c.card} key={i}>
            <div className={c.cardHead}>
              <h2>
                <FaUser size={14} /> {L.traveller(i + 1, L.types[p.type])} <span className={c.badge}>{L.typeHints[p.type]}</span>
              </h2>
              {i === 0 && <p>{L.travellersHint}</p>}
            </div>
            <div className={c.cardBody}>
              <div className={`${c.grid} ${c.gridTitle}`}>
                <Field as="div" label={L.title}>
                  <Select
                    label={L.title}
                    value={p.title}
                    options={TITLES[p.type].map((tt) => ({ value: tt, label: L.titles[tt] }))}
                    onChange={(title) => set({ title, gender: FEMALE.includes(title) ? "F" : "M" })}
                  />
                </Field>
                <Field label={L.firstName} error={err("firstName")}>
                  <input className={c.input} dir="ltr" autoComplete={i === 0 ? "given-name" : "off"} value={p.firstName} onChange={(e) => set({ firstName: e.target.value })} />
                </Field>
                <Field label={L.lastName} error={err("lastName")}>
                  <input className={c.input} dir="ltr" autoComplete={i === 0 ? "family-name" : "off"} value={p.lastName} onChange={(e) => set({ lastName: e.target.value })} />
                </Field>
              </div>

              <div className={c.grid} style={{ marginTop: 14 }}>
                <Field label={L.dob} error={err("dateOfBirth")}>
                  <input className={c.input} type="date" max={today()} value={p.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} />
                </Field>
                <Field as="div" label={L.nationality} error={err("nationality")} className={c.countryWrap}>
                  <CountryField valueMode="code" value={p.nationality} placeholder={L.selectCountry} onChange={(e) => set({ nationality: e.target.value })} />
                </Field>
                <Field label={L.passport} error={err("passportNumber")}>
                  <input className={c.input} dir="ltr" autoComplete="off" value={p.passportNumber} onChange={(e) => set({ passportNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} />
                </Field>
                <Field
                  label={L.passportExpiry}
                  error={err("passportExpiry")}
                  hint={p.passportExpiry && p.passportExpiry < sixMonthsAfter ? L.sixMonths : null}
                >
                  <input className={c.input} type="date" min={lastDate} value={p.passportExpiry} onChange={(e) => set({ passportExpiry: e.target.value })} />
                </Field>
                <Field label={L.passportIssueDate} error={err("passportIssueDate")} hint={L.issueDateHint}>
                  <input className={c.input} type="date" max={today()} value={p.passportIssueDate} onChange={(e) => set({ passportIssueDate: e.target.value })} />
                </Field>
                <Field as="div" label={L.issuingCountry} error={err("issuingCountry")} className={c.countryWrap}>
                  <CountryField valueMode="code" value={p.issuingCountry} placeholder={L.selectCountry} onChange={(e) => set({ issuingCountry: e.target.value })} />
                </Field>
                <Field as="div" label={L.visaType} error={err("visaType")} hint={L.visaHint}>
                  <Select
                    label={L.visaType}
                    value={p.visaType}
                    options={[{ value: "", label: L.visaNone }, ...VISA_TYPES.map((v) => ({ value: v, label: L.visaTypes[v] || v }))]}
                    onChange={(visaType) => set({ visaType })}
                  />
                </Field>
              </div>
            </div>
          </section>
        );
      })}
    </fieldset>
  );
}
