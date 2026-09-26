'use client';

import { MONTHS, DAYS } from './styles';

export default function DateDropdowns({ value, onChange, yearList, placeholder = ['DD','Month','YYYY'] }) {
  const parts = (value || '--').split('-');
  const [y, m, d] = parts;
  const set = (idx, val) => {
    const p = [y||'', m||'', d||''];
    p[idx] = val;
    onChange(p.join('-'));
  };
  return (
    <div style={{display:'grid',gridTemplateColumns:'70px 1fr 90px',gap:8}}>
      <select className="fi" value={d||''} onChange={e=>set(2,e.target.value)}>
        <option value="">{placeholder[0]}</option>
        {DAYS.map(n=><option key={n} value={String(n).padStart(2,'0')}>{n}</option>)}
      </select>
      <select className="fi" value={m||''} onChange={e=>set(1,e.target.value)}>
        <option value="">{placeholder[1]}</option>
        {MONTHS.map((mn,i)=><option key={i} value={String(i+1).padStart(2,'0')}>{i+1} - {mn}</option>)}
      </select>
      <select className="fi" value={y||''} onChange={e=>set(0,e.target.value)}>
        <option value="">{placeholder[2]}</option>
        {yearList.map(yr=><option key={yr} value={yr}>{yr}</option>)}
      </select>
    </div>
  );
}
