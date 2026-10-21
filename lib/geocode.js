/**
 * Geocoding, austauschbar über Umgebungsvariablen.
 *
 * Produktion: GEOCODER_URL auf eine eigene Photon-Instanz (oder einen
 * Geocoder mit Auftragsverarbeitung) setzen. Abfrage nur auf Knopfdruck,
 * ein Treffer, danach Cache.
 *
 * GEOCODER_PROVIDER=nominatim ist die Zwischenlösung ohne Autocomplete.
 * Die öffentliche Nominatim-Instanz verbietet Autovervollständigung und
 * Massenabfragen. Wir schicken genau eine Suche pro Adresse, mit
 * User-Agent und Cache, und nur wenn kein eigener Geocoder gesetzt ist.
 *
 * GEOCODER_PROVIDER=none schaltet die Abfrage ab.
 */

import { text } from './zahl.js';

const UA = 'immo.cousins-bewertung/1.0 (+https://immocousins.de/hausbewertung-koeln/; einzelne Adressaufloesung)';

export function providerWahl(env) {
  const envSicher = env || {};
  const explizit = String(envSicher.GEOCODER_PROVIDER || '').toLowerCase();
  if (explizit === 'photon' || explizit === 'nominatim' || explizit === 'none') return explizit;
  if (envSicher.GEOCODER_URL) return 'photon';
  return 'nominatim';
}

export function normalisiereAdresse(teile) {
  const strasse = text(teile.strasse, 80);
  const hausnummer = text(teile.hausnummer, 12);
  const plz = text(teile.plz, 5).replace(/\D/g, '');
  const ort = text(teile.ort, 60) || 'Köln';
  return { strasse, hausnummer, plz, ort };
}

export function suchtext(adresse) {
  return [adresse.strasse, adresse.hausnummer, adresse.plz, adresse.ort, 'Deutschland']
    .filter(Boolean)
    .join(' ');
}

function inNrw(lat, lon) {
  return lat >= 50.3 && lat <= 52.6 && lon >= 5.8 && lon <= 9.5;
}

function treffer(lat, lon, label, provider) {
  if (!inNrw(lat, lon)) {
    return { ok: false, fehler: 'Die Adresse liegt außerhalb von Nordrhein-Westfalen. Wir bewerten Köln und den Rhein-Erft-Kreis.' };
  }
  return { ok: true, lat, lon, label, provider };
}

async function photon(adresse, env, fetcher) {
  const basis = String(env.GEOCODER_URL || '').replace(/\/$/, '');
  if (!basis) return { ok: false, fehler: 'GEOCODER_URL fehlt.' };
  const url =
    basis +
    '/api/?limit=1&lang=de&lat=50.94&lon=6.96&q=' +
    encodeURIComponent(suchtext(adresse));
  const antwort = await fetcher(url, {
    headers: { accept: 'application/json', 'user-agent': UA },
    signal: AbortSignal.timeout(8000),
  });
  if (!antwort.ok) return { ok: false, fehler: 'Der Geocoder antwortet gerade nicht.' };
  const daten = await antwort.json();
  const feature = daten && daten.features && daten.features[0];
  if (!feature || !feature.geometry) return { ok: false, fehler: 'Zu dieser Adresse haben wir keinen Treffer.' };
  const [lon, lat] = feature.geometry.coordinates;
  const p = feature.properties || {};
  const label = [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(' ');
  return treffer(lat, lon, label || suchtext(adresse), 'photon');
}

async function nominatim(adresse, fetcher) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=de&q=' +
    encodeURIComponent(suchtext(adresse));
  const antwort = await fetcher(url, {
    headers: { accept: 'application/json', 'user-agent': UA },
    signal: AbortSignal.timeout(8000),
  });
  if (!antwort.ok) return { ok: false, fehler: 'Die Adresssuche antwortet gerade nicht.' };
  const liste = await antwort.json();
  const erster = Array.isArray(liste) ? liste[0] : null;
  if (!erster) return { ok: false, fehler: 'Zu dieser Adresse haben wir keinen Treffer. Bitte Straße und Hausnummer prüfen.' };
  const adr = erster.address || {};
  if (!adr.house_number && !String(erster.display_name || '').includes(adresse.hausnummer)) {
    return { ok: false, fehler: 'Die Hausnummer konnten wir nicht zuordnen. Bitte prüfe die Schreibweise.' };
  }
  return treffer(Number(erster.lat), Number(erster.lon), erster.display_name || suchtext(adresse), 'nominatim');
}

const speicher = new Map();

export async function geocode(teile, env, fetcher = fetch) {
  const adresse = normalisiereAdresse(teile);
  if (!adresse.strasse || !adresse.hausnummer || !/^\d{5}$/.test(adresse.plz)) {
    return { ok: false, fehler: 'Bitte Straße, Hausnummer und eine fünfstellige Postleitzahl angeben.' };
  }
  const provider = providerWahl(env);
  if (provider === 'none') {
    return { ok: false, fehler: 'Die Adresssuche ist nicht konfiguriert.' };
  }
  const key = provider + '|' + suchtext(adresse).toLowerCase();
  if (speicher.has(key)) return speicher.get(key);

  const ergebnis = provider === 'photon' ? await photon(adresse, env, fetcher) : await nominatim(adresse, fetcher);
  if (ergebnis.ok) speicher.set(key, ergebnis);
  return ergebnis;
}
