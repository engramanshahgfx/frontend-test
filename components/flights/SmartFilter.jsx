"use client";

// "Describe your flight" box: turns a plain-language request into the same filters the panel sets.
// Matching is done in the browser against the flights on screen, so it never sends the text anywhere
// and can only pick values that actually exist in the results.

import { useState } from "react";
import { FaMagic, FaArrowRight } from "react-icons/fa";
import { EMPTY_FILTERS } from "@/lib/flights/offerModel";
import { t as dict } from "./i18n";
import s from "./flights.module.css";

const has = (text, words) => words.some((w) => text.includes(w));

export function parseRequest(raw, flights) {
  const text = ` ${String(raw).toLowerCase().replace(/[،,.!?]/g, " ")} `;
  const patch = {};
  let sort = null;

  if (has(text, ["direct", "non-stop", "nonstop", "non stop", "no stop", "مباشر", "بدون توقف"])) patch.maxStops = 0;
  else if (has(text, ["1 stop", "one stop", "توقف واحد", "توقف"])) patch.maxStops = 1;

  if (has(text, ["bag", "luggage", "suitcase", "checked", "حقيب", "أمتعة", "امتعة", "شنط"])) patch.baggageOnly = true;

  const times = [];
  if (has(text, ["early", "dawn", "فجر", "مبكر"])) times.push("early");
  if (has(text, ["morning", "صباح"])) times.push("morning");
  if (has(text, ["afternoon", "noon", "ظهر", "عصر"])) times.push("afternoon");
  if (has(text, ["evening", "night", "late", "مساء", "ليل"])) times.push("evening");
  if (times.length) patch.depTimes = times;

  const price = text.match(/(?:under|below|less than|max|up to|within|budget|أقل من|حتى|بحدود)\s*(\d{2,6})/) || text.match(/(\d{2,6})\s*(?:sar|riyal|sr|ريال)/);
  if (price) patch.maxPrice = Number(price[1]);

  const airlines = new Map(flights.map((f) => [f.airlineCode, f.airline]));
  const picked = [...airlines].filter(([code, name]) => {
    const n = String(name || "").toLowerCase();
    return text.includes(` ${code.toLowerCase()} `) || (n.length > 2 && text.includes(n));
  });
  if (picked.length) patch.airlines = picked.map(([code]) => code);

  if (has(text, ["fastest", "shortest", "quick", "أسرع", "أقصر"])) sort = "fastest";
  else if (has(text, ["cheap", "lowest", "budget", "أرخص", "رخيص"])) sort = "cheapest";
  else if (has(text, ["best", "أفضل"])) sort = "best";

  return { patch, sort, airlineNames: picked.map(([, name]) => name) };
}

export default function SmartFilter({ lang, flights, onApply }) {
  const L = dict(lang);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const run = (value) => {
    const q = value.trim();
    if (!q) return;
    const parsed = parseRequest(q, flights);
    const understood = Object.keys(parsed.patch).length > 0 || parsed.sort;
    setResult({ ...parsed, understood });
    if (understood) onApply({ ...EMPTY_FILTERS, ...parsed.patch }, parsed.sort);
  };

  const chips = result?.understood
    ? [
        result.patch.maxStops === 0 && L.ai.direct,
        result.patch.maxStops === 1 && L.stopsOpts[1],
        result.patch.baggageOnly && L.baggageOnly,
        ...(result.patch.depTimes || []).map((id) => L.timesShort[id]),
        ...result.airlineNames,
        result.patch.maxPrice && L.ai.upTo(result.patch.maxPrice),
        result.sort && L.ai.sorted[result.sort],
      ].filter(Boolean)
    : [];

  return (
    <div className={s.aiBox}>
      <div className={s.aiHead}>
        <FaMagic /> {L.ai.title}
      </div>
      <p className={s.aiHint}>{L.ai.hint}</p>
      <form
        className={s.aiInputRow}
        onSubmit={(e) => {
          e.preventDefault();
          run(text);
        }}
      >
        <input className={s.aiInput} value={text} onChange={(e) => setText(e.target.value)} placeholder={L.ai.placeholder} aria-label={L.ai.title} />
        <button type="submit" className={s.aiGo} aria-label={L.ai.apply} disabled={!text.trim()}>
          <FaArrowRight size={12} style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }} />
        </button>
      </form>
      <div className={s.aiTry}>{L.ai.try}</div>
      {L.ai.examples.map((ex) => (
        <button
          type="button"
          key={ex}
          className={s.aiExample}
          onClick={() => {
            setText(ex);
            run(ex);
          }}
        >
          → {ex}
        </button>
      ))}
      {result && (
        <div className={s.aiResult}>
          {result.understood ? (
            <>
              <span>{L.ai.applied}</span>
              <div className={s.aiChips}>
                {chips.map((c) => (
                  <span key={c} className={s.aiChip}>
                    {c}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span>{L.ai.notUnderstood}</span>
          )}
        </div>
      )}
    </div>
  );
}
