/** Zahlen aus Formularen und BORIS-Textfeldern. */

export function zahl(wert) {
  if (typeof wert === 'number') return Number.isFinite(wert) ? wert : null;
  if (typeof wert !== 'string') return null;
  let s = wert.trim();
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function text(wert, max = 200) {
  if (typeof wert !== 'string') return '';
  let raus = '';
  for (const zeichen of wert) {
    const code = zeichen.codePointAt(0);
    if (code < 32 || code === 127) continue;
    raus += zeichen;
  }
  return raus.trim().slice(0, max);
}

export function euro(n) {
  if (!Number.isFinite(n)) return '–';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function euroQm(n) {
  if (!Number.isFinite(n)) return '–';
  return (
    new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €/m²'
  );
}

export function inGrenzen(n, min, max) {
  return typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
}
