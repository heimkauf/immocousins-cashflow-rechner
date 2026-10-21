/**
 * Adresse → Koordinate → Bodenrichtwert.
 * Kein Autocomplete: der Aufruf kommt vom Knopf „Bodenrichtwert anzeigen“.
 */

import { herkunftOk, json, liesJson } from '../../lib/http.js';
import { geocode, providerWahl } from '../../lib/geocode.js';
import { holeBrw } from '../../lib/boris.js';
import { regionAus } from '../../lib/region.js';
import { LIZENZ, LIZENZ_URL } from '../../lib/texte.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!herkunftOk(request)) return json({ ok: false, fehler: 'Ungültige Herkunft.' }, 403);

  const gelesen = await liesJson(request);
  if (!gelesen.ok) return json({ ok: false, fehler: 'Ungültige Anfrage.' }, 400);

  let fund;
  try {
    fund = await geocode(gelesen.daten || {}, env);
  } catch (e) {
    return json({ ok: false, fehler: 'Die Adresse konnten wir gerade nicht zuordnen. Versuch es gleich noch einmal.' }, 502);
  }
  if (!fund.ok) return json({ ok: false, fehler: fund.fehler }, 422);

  let brw;
  try {
    brw = await holeBrw(fund.lat, fund.lon);
  } catch (e) {
    brw = { mehrgeschossig: null, einZweifamilien: null };
  }

  const plz = String((gelesen.daten && gelesen.daten.plz) || '').replace(/\D/g, '').slice(0, 5);
  const ort = (gelesen.daten && gelesen.daten.ort) || '';
  const region = regionAus(plz, ort);
  const sichtbar = brw.mehrgeschossig || brw.einZweifamilien;

  return json({
    ok: true,
    geocoder: providerWahl(env),
    lage: {
      lat: fund.lat,
      lon: fund.lon,
      label: fund.label,
      plz,
      ort,
      region,
    },
    brw: sichtbar,
    mehrgeschossig: brw.mehrgeschossig,
    einZweifamilien: brw.einZweifamilien,
    lizenz: LIZENZ,
    lizenzUrl: LIZENZ_URL,
    hinweis: sichtbar
      ? ''
      : 'An dieser Stelle liegt in den beiden Wohnlagen-Layern kein Bodenrichtwert. Du kannst trotzdem weitermachen.',
  });
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, fehler: 'Methode nicht erlaubt.' }, 405);
}
