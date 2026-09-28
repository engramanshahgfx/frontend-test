'use client';

import { useEffect, useState, useId, useRef } from 'react';
import { useParams } from 'next/navigation';
import { fetchCountryOptions } from '@/lib/countries';

const requests = new Map();

function loadCountries(locale) {
  if (!requests.has(locale)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const request = fetchCountryOptions(locale, controller.signal)
      .catch(error => { requests.delete(locale); throw error; })
      .finally(() => clearTimeout(timeout));
    requests.set(locale, request);
  }
  return requests.get(locale);
}

// Keep name-valued form contracts; flight forms use their own code-valued selectors.
export default function CountryField({ value, defaultValue = '', onChange, placeholder, type, valueMode = 'name', ...props }) {
  const params = useParams();
  const locale = params?.lang || 'en';
  const [options, setOptions] = useState([]);
  const [state, setState] = useState('loading');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, listId]);
  useEffect(() => {
    let active = true;
    setState('loading');
    loadCountries(locale).then(countries => {
      if (active) { setOptions(countries); setState('ready'); }
    }).catch(() => { if (active) setState('manual'); });
    return () => { active = false; };
  }, [locale]);
  const emit = next => {
    setInternalValue(next);
    onChange?.({ target: { name: props.name, value: next, type: 'text' }, currentTarget: { name: props.name, value: next } });
  };
  const label = placeholder || (locale === 'ar' ? 'اختر الدولة' : locale === 'zh' ? '选择国家或地区' : 'Select country');
  const other = locale === 'ar' ? 'أخرى — أدخل يدوياً' : locale === 'zh' ? '其他 — 手动输入' : 'Other — enter manually';
  const filtered = options.filter(country => `${country.name} ${country.code}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const display = valueMode === 'code' ? options.find(country => country.code === selected)?.name || selected : selected;
  const choose = index => {
    if (index === filtered.length) {
      setManual(true); emit(query);
    } else {
      const country = filtered[index];
      if (!country) return;
      emit(valueMode === 'code' ? country.code : country.name);
    }
    setOpen(false); setQuery(''); inputRef.current?.focus();
  };
  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(''); }
    }}>
      <input {...props} ref={inputRef} type="text" autoComplete="off"
        style={{ ...props.style, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
        value={open ? query : manual || state !== 'ready' ? selected : display} placeholder={label}
        role="combobox" aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-autocomplete="list" aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => { if (!manual && state === 'ready') { setOpen(true); setQuery(''); setActiveIndex(0); } }}
        onChange={event => { emit(event.target.value); setQuery(event.target.value); setActiveIndex(0); if (!manual && state === 'ready') setOpen(true); }}
        onKeyDown={event => {
          if (event.key === 'Escape') { setOpen(false); setQuery(''); }
          if (!manual && state === 'ready' && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault(); setOpen(true);
            setActiveIndex(index => Math.max(0, Math.min(filtered.length, index + (event.key === 'ArrowDown' ? 1 : -1))));
          }
          if (open && event.key === 'Enter') { event.preventDefault(); choose(activeIndex); }
        }} />
      {open && <div id={listId} role="listbox" style={{ position: 'absolute', insetInline: 0, top: '100%', zIndex: 1000, maxHeight: 'min(260px, 40vh)', overflowY: 'auto', background: '#fff', color: '#172033', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 8px 24px #0002', boxSizing: 'border-box' }}>
        {[...filtered.map(country => country.name), other].map((name, index) => <button
          key={index} id={`${listId}-${index}`} type="button" role="option" aria-selected={index === activeIndex}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}
          style={{ display: 'block', width: '100%', minHeight: 44, padding: '10px 12px', border: 0, textAlign: 'start', whiteSpace: 'normal', overflowWrap: 'anywhere', color: '#172033', background: index === activeIndex ? '#edf2f7' : '#fff', cursor: 'pointer' }}>{name}</button>)}
      </div>}
      {manual && state === 'ready' && <button type="button" onClick={() => { setManual(false); setOpen(true); setQuery(''); setActiveIndex(0); }} style={{ background: 'none', border: 0, padding: '6px 0', cursor: 'pointer', color: '#334155' }}>{locale === 'ar' ? 'اختر من القائمة' : locale === 'zh' ? '从列表选择' : 'Choose from list'}</button>}
    </div>
  );
}
