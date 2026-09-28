// ISO 3166-1 alpha-2 countries and territories; labels come from the browser's locale data.
const COUNTRY_CODES = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');

export function getCountryOptions(locale = 'en') {
  const language = ['en', 'ar', 'zh'].includes(locale) ? locale : 'en';
  const names = new Intl.DisplayNames([language], { type: 'region' });
  return COUNTRY_CODES.map(code => ({ code, name: names.of(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, language));
}

export async function fetchCountryOptions(locale = 'en', signal) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
  const response = await fetch(`${apiBase}/countries`, { signal });
  if (!response.ok) throw new Error('Country list unavailable');
  const payload = await response.json();
  const entries = Object.entries(payload.data || {});
  if (payload.status !== 'OK' || !entries.length || entries.length < payload.total ||
      entries.some(([code, value]) => !/^[A-Z]{2}$/.test(code) || typeof value?.country !== 'string')) {
    throw new Error('Invalid country list');
  }
  const names = new Intl.DisplayNames([['en', 'ar', 'zh'].includes(locale) ? locale : 'en'], { type: 'region' });
  return entries.map(([code, value]) => ({ code, name: locale === 'en' ? value.country : names.of(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

// Manual entry still needs a valid supplier country code, never a default nationality.
export function resolveCountryCode(value) {
  const text = String(value || '').trim();
  if (COUNTRY_CODES.includes(text.toUpperCase())) return text.toUpperCase();
  for (const locale of ['en', 'ar', 'zh']) {
    const match = getCountryOptions(locale).find(country => country.name.toLocaleLowerCase() === text.toLocaleLowerCase());
    if (match) return match.code;
  }
  return '';
}
