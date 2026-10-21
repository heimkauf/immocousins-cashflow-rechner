import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bewerten, ertragswertModell, istPersoenlicheEinschaetzung } from '../lib/bewerten.js';
import { scoreLead } from '../lib/scoring.js';
import { regionAus } from '../lib/region.js';
import { providerWahl, normalisiereAdresse } from '../lib/geocode.js';
import { featureInfoUrl, parseBrw, parseIrw } from '../lib/boris.js';
import { validiereVerkauf } from '../lib/verkauf.js';
import { asanaTitel, legeAsanaAn } from '../lib/asana.js';
import { DISCLAIMER } from '../lib/texte.js';

const BRW = { wert: 1500, zone: '1', stichtag: '2026-01-01' };
const IRW = {
  wert: 5010,
  name: 'Rathenau-Viertel',
  baujahr: 1955,
  wohnflaeche: 60,
  geschoss: 2,
  layer: 'irw_eigentumswohnungen',
};

test('MFH Köln: Miete mal Faktor wie im Konzeptbeispiel', () => {
  const r = bewerten(
    {
      art: 'mfh',
      region: 'koeln',
      wohnflaeche: 650,
      grundstueck: 450,
      mieteMonat: 11.7 * 650,
      we: 10,
      zustand: 'normal',
    },
    { brw: BRW }
  );
  assert.equal(r.verfahren, 'faktor');
  assert.ok(Math.abs(r.spanne.niedrig - 1368900) < 1);
  assert.ok(Math.abs(r.spanne.mitte - 1916460) < 1);
  assert.ok(Math.abs(r.spanne.hoch - 2646540) < 1);
  assert.ok(Math.abs(r.gegenrechnung.wert - 1911749.74) < 1);
  assert.match(r.disclaimer, /§ 194 BauGB/);
  assert.equal(r.disclaimer, DISCLAIMER);
});

test('Reihenhaus und Doppelhaushälfte in Köln: keine Spanne', () => {
  const koeln = bewerten(
    { art: 'efh', region: 'koeln', bauform: 'reihe', wohnflaeche: 120, baujahr: 1975 },
    { irw: { wert: 7000, wohnflaeche: 140, baujahr: 1955, layer: 'irw_ein_zweifamilienhaeuser' }, brw: BRW }
  );
  assert.equal(istPersoenlicheEinschaetzung({ art: 'efh', region: 'koeln', bauform: 'doppel' }), true);
  assert.equal(koeln.variante, 'B');
  assert.equal(koeln.spanne, null);
  assert.equal(koeln.verfahren, 'persoenlich');
  assert.match(koeln.hinweis, /persönlich/);
  const rek = bewerten(
    { art: 'efh', region: 'rhein-erft', bauform: 'doppel', wohnflaeche: 120, baujahr: 1974, zustand: 'normal' },
    { irw: { wert: 3400, wohnflaeche: 120, baujahr: 1974, layer: 'irw_reihen_doppelhaeuser' } }
  );
  assert.notEqual(rek.variante, 'B');
  assert.ok(rek.spanne.mitte > 0);
});

test('Ertragswert ohne Grundstück bleibt leer, die Faktor-Spanne bleibt', () => {
  const r = bewerten(
    { art: 'mfh', region: 'koeln', wohnflaeche: 650, mieteMonat: 7605, zustand: 'normal' },
    { brw: BRW }
  );
  assert.equal(r.gegenrechnung, null);
  assert.ok(r.spanne.mitte > 0);
});

test('ETW am Normobjekt liegt auf dem Immobilienrichtwert', () => {
  const r = bewerten(
    { art: 'etw', wohnflaeche: 60, baujahr: 1955, geschoss: 2, zustand: 'normal', modernisierung: [] },
    { irw: IRW }
  );
  assert.equal(r.verfahren, 'irw');
  assert.ok(Math.abs(r.spanne.mitte - 5010 * 60) < 1);
  assert.ok(Math.abs(r.spanne.niedrig - r.spanne.mitte * 0.9) < 1);
});

test('ohne Immobilienrichtwert keine erfundene Wohnungsspanne', () => {
  const r = bewerten({ art: 'etw', wohnflaeche: 70, baujahr: 1970, geschoss: 1 }, {});
  assert.equal(r.spanne, null);
  assert.equal(r.verfahren, 'kein-irw');
});

test('Grundstück ist Bodenrichtwert mal Fläche', () => {
  const r = bewerten({ art: 'grundstueck', grundstueck: 400 }, { brw: { wert: 2670 } });
  assert.equal(r.spanne.mitte, 2670 * 400);
});

test('Ertragswert-Funktion trifft das Konzeptbeispiel', () => {
  const wert = ertragswertModell({
    jahresmiete: 11.7 * 650 * 12,
    grundstueck: 450,
    brw: 1500,
    region: 'koeln',
  });
  assert.ok(Math.abs(wert.wert - 1911749.74) < 1);
});

test('Scoring: MFH, Erbe, Jetzt, leere ETW, Makler', () => {
  assert.equal(scoreLead({ weg: 'ankauf', art: 'mfh', region: 'koeln', we: 8 }).score, 'A');
  assert.equal(scoreLead({ weg: 'ankauf', art: 'efh', region: 'koeln', anlass: 'erbe' }).score, 'A');
  assert.equal(scoreLead({ weg: 'ankauf', art: 'efh', zeitpunkt: 'jetzt' }).score, 'A');
  assert.equal(scoreLead({ weg: 'ankauf', art: 'mfh', region: 'koeln', we: 8, leerstand: 2 }).gruende.includes('Leerstand'), true);
  assert.equal(
    scoreLead({ weg: 'ankauf', art: 'etw', nutzung: 'leer', zeitpunkt: 'spaeter', anlass: 'wert' }).score,
    'B'
  );
  assert.equal(scoreLead({ weg: 'ankauf', art: 'etw', nutzung: 'vermietet', zeitpunkt: 'monate12' }).score, 'C');
  const makler = scoreLead({ weg: 'makler', art: 'mfh', region: 'koeln', we: 8 });
  assert.equal(makler.score, 'C');
  assert.equal(makler.qualifizierung, 'A');
  assert.equal(scoreLead({ typ: 'tippgeber', art: 'etw' }).score, 'B');
  assert.equal(scoreLead({ typ: 'tippgeber', art: 'mfh' }).score, 'A');
});

test('Region über PLZ und Ortsnamen', () => {
  assert.equal(regionAus('50674', 'Köln'), 'koeln');
  assert.equal(regionAus('50354', ''), 'rhein-erft');
  assert.equal(regionAus('10115', 'Berlin'), 'andere');
  assert.equal(regionAus('', 'Hürth'), 'rhein-erft');
});

test('Geocoder: Photon sobald eine URL da ist, nie als Autocomplete gebaut', () => {
  assert.equal(providerWahl({}), 'nominatim');
  assert.equal(providerWahl({ GEOCODER_URL: 'https://photon.example' }), 'photon');
  assert.equal(providerWahl({ GEOCODER_PROVIDER: 'none', GEOCODER_URL: 'https://photon.example' }), 'none');
  const adresse = normalisiereAdresse({ strasse: 'Pilgrimstraße', hausnummer: '6', plz: '50674', ort: 'Köln' });
  assert.equal(adresse.plz, '50674');
  const url = featureInfoUrl('https://www.wms.nrw.de/boris/wms-t_nw_brw', 'brw_mehrgeschossige_bauweise', 50.9356, 6.9396);
  assert.match(url, /REQUEST=GetFeatureInfo/);
  assert.match(url, /INFO_FORMAT=application%2Fgeo%2Bjson/);
  assert.doesNotMatch(url, /autocomplete/i);
});

test('BORIS-Antwort der Pilgrimstraße wird zum Bodenrichtwert 2670', () => {
  const geo = {
    features: [
      {
        properties: {
          Bodenrichtwert: '2670',
          Bodenrichtwertnummer: '103010',
          'Stichtag des Bodenrichtwertes': '2026-01-01',
          Gemeinde: 'Köln',
          'Bezeichnung des Gutachterausschusses': 'Der Gutachterausschuss für Grundstückswerte in der Stadt Köln',
          Nutzungsart: 'MK',
        },
      },
    ],
  };
  const brw = parseBrw(geo, 'brw_mehrgeschossige_bauweise');
  assert.equal(brw.wert, 2670);
  assert.equal(brw.gemeinde, 'Köln');
  assert.equal(parseIrw({ features: [] }, 'irw_eigentumswohnungen'), null);
});

test('Verkaufslead: Telefon nur mit eigener Einwilligung', () => {
  const basis = {
    quelle: 'verkauf',
    vorname: 'Maria',
    email: 'maria@example.com',
    einwilligung: true,
    weg: 'ankauf',
    objekt: { art: 'etw', plz: '50674', ort: 'Köln' },
  };
  assert.equal(validiereVerkauf(basis).ok, true);
  assert.equal(validiereVerkauf({ ...basis, telefon: '0221 123', telefonEinwilligung: false }).ok, false);
  assert.equal(validiereVerkauf({ ...basis, telefon: '0221 123', telefonEinwilligung: true }).ok, true);
  assert.equal(validiereVerkauf({ ...basis, einwilligung: false }).ok, false);
  const tipp = validiereVerkauf({
    quelle: 'tippgeber',
    vorname: 'Ali',
    email: 'ali@example.com',
    einwilligung: true,
    dritteEinwilligung: false,
  });
  assert.equal(tipp.ok, false);
});

test('Asana bleibt stumm ohne Token', async () => {
  let gerufen = false;
  const ergebnis = await legeAsanaAn({}, { score: 'A', vorname: 'Mia' }, () => {
    gerufen = true;
    return Promise.resolve(new Response('{}', { status: 200 }));
  });
  assert.equal(ergebnis.angelegt, false);
  assert.equal(gerufen, false);
  assert.match(asanaTitel({ score: 'B', weg: 'ankauf', art: 'etw', vorname: 'Mia', plz: '50674', ort: 'Köln' }), /^\[B\]/);
});
