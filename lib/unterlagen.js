/** Optionale Unterlagen in R2. Abschaltbar über UPLOAD_AKTIV. Löschfrist in den Metadaten. */

import { UPLOAD_LOESCH_TAGE_STANDARD } from './texte.js';

const TYPEN = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const ENDUNG = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export function uploadAn(env) {
  return String((env && env.UPLOAD_AKTIV) || '') === '1' && !!(env && env.UNTERLAGEN);
}

export function loeschTage(env) {
  const n = Number((env && env.UPLOAD_LOESCH_TAGE) || UPLOAD_LOESCH_TAGE_STANDARD);
  if (!Number.isFinite(n) || n < 1 || n > 3650) return UPLOAD_LOESCH_TAGE_STANDARD;
  return Math.round(n);
}

export function loeschZeitpunkt(env, ab = Date.now()) {
  const bis = new Date(ab + loeschTage(env) * 24 * 60 * 60 * 1000);
  return bis.toISOString();
}

function dateiName(name) {
  const basis = String(name || 'datei').split(/[/\\]/).pop().replace(/[^\w.\-äöüÄÖÜß ]+/g, '').slice(0, 80);
  return basis || 'datei';
}

function neueId() {
  const zeit = Date.now().toString(36);
  const zufall = Math.random().toString(36).slice(2, 10);
  return zeit + '-' + zufall;
}

export async function speichereUnterlagen(env, dateien) {
  if (!uploadAn(env)) return { ok: false, fehler: 'Upload ist abgeschaltet.', dateien: [] };
  const liste = Array.isArray(dateien) ? dateien.slice(0, 8) : [];
  const gespeichert = [];
  const bis = loeschZeitpunkt(env);
  for (const datei of liste) {
    if (!datei || typeof datei.arrayBuffer !== 'function') continue;
    const typ = datei.type || '';
    if (!TYPEN.has(typ)) return { ok: false, fehler: 'Erlaubt sind PDF, JPG, PNG und WebP.', dateien: gespeichert };
    if (datei.size > 10 * 1024 * 1024) return { ok: false, fehler: 'Eine Datei darf höchstens 10 MB haben.', dateien: gespeichert };
    const id = neueId();
    const key = 'unterlagen/' + id + '.' + ENDUNG[typ];
    const bytes = await datei.arrayBuffer();
    await env.UNTERLAGEN.put(key, bytes, {
      httpMetadata: { contentType: typ },
      customMetadata: {
        loeschenAm: bis,
        name: dateiName(datei.name),
      },
    });
    gespeichert.push({ id, key, name: dateiName(datei.name), groesse: datei.size, loeschenAm: bis });
  }
  return { ok: true, dateien: gespeichert };
}

export async function raeumeAbgelaufene(env, jetzt = Date.now()) {
  if (!env || !env.UNTERLAGEN || typeof env.UNTERLAGEN.list !== 'function') return { geloescht: 0 };
  let geloescht = 0;
  let cursor;
  do {
    const seite = await env.UNTERLAGEN.list({ cursor, include: ['customMetadata'] });
    const objekte = (seite && seite.objects) || [];
    for (const objekt of objekte) {
      const bis = objekt.customMetadata && objekt.customMetadata.loeschenAm;
      if (bis && Date.parse(bis) <= jetzt) {
        await env.UNTERLAGEN.delete(objekt.key);
        geloescht += 1;
      }
    }
    cursor = seite && seite.truncated ? seite.cursor : undefined;
  } while (cursor);
  return { geloescht };
}
