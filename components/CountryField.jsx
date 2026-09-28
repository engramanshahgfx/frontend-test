'use client';

import { useEffect, useState } from 'react';
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
export default function CountryField({ value, defaultValue = '', onChange, placeholder, type, ...props }) {
  const params = useParams();
  const locale = params?.lang || 'en';
  const [options, setOptions] = useState([]);
  const [state, setState] = useState('loading');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  useEffect(() => {
    let active = true;
    setState('loading');
    loadCountries(locale).then(countries => {
      if (active) { setOptions(countries); setState('ready'); }
    }).catch(() => { if (active) setState('manual'); });
    return () => { active = false; };
  }, [locale]);
  const change = event => { setInternalValue(event.target.value); onChange?.(event); };
  const label = placeholder || (locale === 'ar' ? 'اختر الدولة' : locale === 'zh' ? '选择国家或地区' : 'Select country');
  if (state === 'manual') {
    return <input {...props} type="text" value={selected} onChange={change} placeholder={label} />;
  }
  return (
    <select {...props} value={selected} onChange={change} disabled={props.disabled || state === 'loading'} aria-busy={state === 'loading'}>
      <option value="">{label}</option>
      {selected && !options.some(country => country.name === selected) && <option value={selected}>{selected}</option>}
      {options.map(country => <option key={country.code} value={country.name}>{country.name}</option>)}
    </select>
  );
}
