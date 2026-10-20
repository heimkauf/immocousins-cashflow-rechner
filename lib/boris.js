/**
 * BORIS.NRW per WMS GetFeatureInfo.
 * Lizenz der Daten: Datenlizenz Deutschland – Zero – Version 2.0.
 * Es gibt keine WFS-Schnittstelle; GetFeatureInfo ist der dokumentierte Weg.
 * Antworten werden über die Cache API gehalten, der Stichtag steht fest.
 */

import { STICHTAG } from './markt.js';
import { zahl, text } from './zahl.js';

export const BRW_DIENST = 'https://www.wms.nrw.de/boris/wms-t_nw_brw';
export const IRW_DIENST = 'https://www.wms.nrw.de/boris/wms-t_nw_irw';

const UA = 'immo.cousins-bewertung/1.0 (+https://immocousins.de/hausbewertung-koeln/; serverseitige Richtwertabfrage)';

export function featureInfoUrl(dienst, layer, lat, lon) {
  const d = 0.0005;
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetFeatureInfo',
    LAYERS: layer,
    QUERY_LAYERS: layer,
    CRS: 'EPSG:4326',
    BBOX: [lat - d, lon - d, lat + d, lon + d].join(','),
    WIDTH: '101',
    HEIGHT: '101',
    I: '50',
    J: '50',
    INFO_FORMAT: 'application/geo+json',
    TIME: STICHTAG,
    STYLES: '',
  });
  return dienst + '?' + params.toString();
}

export function parseGeoJson(roh) {
  if (!roh || typeof roh !== 'string') return null;
  const start = roh.indexOf('{');
  if (start < 0) return null;
  try {
    return JSON.parse(roh.slice(start));
  } catch (e) {
    return null;
  }
}

function prop(p, name) {
  return text(p[name] == null ? '' : String(p[name]), 240);
}

export function parseBrw(geo, layer) {
  const features = (geo && geo.features) || [];
  for (const feature of features) {
    const p = feature.properties || {};
    const wert = zahl(p['Bodenrichtwert'] == null ? '' : String(p['Bodenrichtwert']));
    if (!wert || wert <= 0) continue;
    return {
      wert,
      zone: prop(p, 'Bodenrichtwertnummer'),
      stichtag: prop(p, 'Stichtag des Bodenrichtwertes') || STICHTAG,
      gemeinde: prop(p, 'Gemeinde'),
      gutachterausschuss: prop(p, 'Bezeichnung des Gutachterausschusses'),
      nutzung: prop(p, 'Nutzungsart'),
      geschosszahl: prop(p, 'Geschosszahl'),
      gfz: prop(p, 'Geschossflächenzahl'),
      ortsteil: prop(p, 'Ortsteil'),
      layer,
      umrechnung: prop(p, 'Link zur Umrechnungsvorschrift'),
    };
  }
  return null;
}

export function parseIrw(geo, layer) {
  const features = (geo && geo.features) || [];
  for (const feature of features) {
    const p = feature.properties || {};
    const wert = zahl(p['Immobilienrichtwert'] == null ? '' : String(p['Immobilienrichtwert']));
    if (!wert || wert <= 0) continue;
    return {
      wert,
      name: prop(p, 'Name'),
      zone: prop(p, 'Immobilienrichtwertnummer'),
      stichtag: prop(p, 'Stichtag des Immobilienrichtwertes') || STICHTAG,
      baujahr: zahl(p['Baujahr'] == null ? '' : String(p['Baujahr'])),
      wohnflaeche: zahl(p['Wohnfläche'] == null ? '' : String(p['Wohnfläche'])),
      geschoss: zahl(p['Geschosslage'] == null ? '' : String(p['Geschosslage'])),
      einheiten: prop(p, 'Anzahl der Einheiten in der Wohnanlage'),
      gemeinde: prop(p, 'Gemeinde'),
      gutachterausschuss: prop(p, 'Bezeichnung des Gutachterausschusses'),
      layer,
      umrechnung: prop(p, 'Link zur Umrechnungsvorschrift'),
    };
  }
  return null;
}

async function ausCache(schluessel) {
  try {
    const cache = globalThis.caches && globalThis.caches.default;
    if (!cache) return null;
    const treffer = await cache.match(new Request('https://immocousins.de/api/_cache/' + schluessel));
    if (!treffer) return null;
    return await treffer.json();
  } catch (e) {
    return null;
  }
}

async function inCache(schluessel, wert, sekunden) {
  try {
    const cache = globalThis.caches && globalThis.caches.default;
    if (!cache || wert == null) return;
    await cache.put(
      new Request('https://immocousins.de/api/_cache/' + schluessel),
      new Response(JSON.stringify(wert), {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=' + sekunden,
        },
      })
    );
  } catch (e) {
    /* Cache ist Komfort, kein Pflichtweg */
  }
}

async function hole(dienst, layer, lat, lon, parser, fetcher) {
  const key =
    layer + ':' + STICHTAG + ':' + lat.toFixed(5) + ':' + lon.toFixed(5);
  const gepuffert = await ausCache(key);
  if (gepuffert) return gepuffert.leer ? null : gepuffert;

  const url = featureInfoUrl(dienst, layer, lat, lon);
  const antwort = await fetcher(url, {
    headers: { accept: 'application/json, application/geo+json, */*', 'user-agent': UA },
    signal: AbortSignal.timeout(18000),
  });
  if (!antwort.ok) return null;
  const geo = parseGeoJson(await antwort.text());
  const wert = parser(geo, layer);
  await inCache(key, wert || { leer: true }, 60 * 60 * 24 * 7);
  return wert;
}

export function holeBrw(lat, lon, fetcher = fetch) {
  return Promise.all([
    hole(BRW_DIENST, 'brw_mehrgeschossige_bauweise', lat, lon, parseBrw, fetcher),
    hole(BRW_DIENST, 'brw_ein_zweigeschossig', lat, lon, parseBrw, fetcher),
  ]).then(([mehrgeschossig, einZweifamilien]) => ({ mehrgeschossig, einZweifamilien }));
}

export function holeIrw(lat, lon, art, bauform, fetcher = fetch) {
  if (art === 'etw') return hole(IRW_DIENST, 'irw_eigentumswohnungen', lat, lon, parseIrw, fetcher);
  if (art !== 'efh') return Promise.resolve(null);
  const zuerst = bauform === 'reihe' ? 'irw_reihen_doppelhaeuser' : 'irw_ein_zweifamilienhaeuser';
  const danach = zuerst === 'irw_reihen_doppelhaeuser' ? 'irw_ein_zweifamilienhaeuser' : 'irw_reihen_doppelhaeuser';
  return hole(IRW_DIENST, zuerst, lat, lon, parseIrw, fetcher).then((wert) => {
    if (wert) return wert;
    return hole(IRW_DIENST, danach, lat, lon, parseIrw, fetcher);
  });
}
