/**
 * Grobe Preisspanne. Richtwerte kommen serverseitig von BORIS,
 * die Rechnung selbst ist die reine Funktion in lib/bewerten.js.
 */

import { herkunftOk, json, liesJson } from '../../lib/http.js';
import { holeBrw, holeIrw } from '../../lib/boris.js';
import { bewerten, brwFuerArt } from '../../lib/bewerten.js';
import { regionAus } from '../../lib/region.js';
import { LIZENZ, LIZENZ_URL } from '../../lib/texte.js';

const ARTEN = new Set(['etw', 'efh', 'mfh', 'wgh', 'grundstueck']);

function nummer(wert) {
  const n = Number(wert);
  return Number.isFinite(n) ? n : null;
}

export async function onRequestPost(context) {
  const { request } = context;
  if (!herkunftOk(request)) return json({ ok: false, fehler: 'Ungültige Herkunft.' }, 403);
  const gelesen = await liesJson(request);
  if (!gelesen.ok) return json({ ok: false, fehler: 'Ungültige Anfrage.' }, 400);

  const daten = gelesen.daten || {};
  if (!ARTEN.has(daten.art)) return json({ ok: false, fehler: 'Die Objektart fehlt.' }, 400);

  const lat = nummer(daten.lat);
  const lon = nummer(daten.lon);
  const region = regionAus(daten.plz, daten.ort);

  let lage = { mehrgeschossig: null, einZweifamilien: null };
  let irw = null;
  if (lat != null && lon != null) {
    try {
      const [brw, richtwert] = await Promise.all([
        holeBrw(lat, lon),
        holeIrw(lat, lon, daten.art, daten.bauform),
      ]);
      lage = brw;
      irw = richtwert;
    } catch (e) {
      /* Spanne bleibt leer, der Funnel läuft weiter */
    }
  }

  const brw = brwFuerArt(daten.art, lage);
  const ergebnis = bewerten({ ...daten, region }, { brw, irw });

  return json({
    ok: true,
    region,
    brw,
    irw,
    verfahren: ergebnis.verfahren,
    spanne: ergebnis.spanne,
    qm: ergebnis.qm,
    zeilen: ergebnis.zeilen,
    hinweis: ergebnis.hinweis,
    tendenz: ergebnis.tendenz,
    umrechnung: ergebnis.umrechnung || (irw && irw.umrechnung) || '',
    disclaimer: ergebnis.disclaimer,
    lizenz: LIZENZ,
    lizenzUrl: LIZENZ_URL,
    quelle: ergebnis.quelle,
    variante: ergebnis.variante || 'A',
    ertragswert: ergebnis.ertragswert || null,
    kennzeichen: ergebnis.kennzeichen || null,
    jahresmiete: ergebnis.jahresmiete || null,
  });
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, fehler: 'Methode nicht erlaubt.' }, 405);
}
