/**
 * Verkaufsleads zusätzlich zur bestehenden Tabelle `leads`.
 * Die Funktion legt die Tabelle bei der ersten Anfrage selbst an,
 * damit ein Deploy ohne separates Migrationskommando auskommt.
 * Für den Überblick liegt dasselbe Statement in schema-verkauf.sql.
 */

export const TABELLE_SQL = `CREATE TABLE IF NOT EXISTS leads_verkauf (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  erstellt TEXT NOT NULL,
  vorname TEXT,
  nachname TEXT,
  email TEXT NOT NULL,
  telefon TEXT,
  telefon_einwilligung INTEGER NOT NULL DEFAULT 0,
  einwilligung INTEGER NOT NULL,
  weg TEXT,
  score TEXT,
  plz TEXT,
  ort TEXT,
  art TEXT,
  payload TEXT NOT NULL
)`;

export const INDEX_SQL = 'CREATE INDEX IF NOT EXISTS idx_leads_verkauf_erstellt ON leads_verkauf(erstellt)';

const ART = new Set(['etw', 'efh', 'mfh', 'wgh', 'grundstueck', '']);
const WEG = new Set(['ankauf', 'makler', 'tipp', 'auswertung']);
const NUTZUNG = new Set(['selbst', 'vermietet', 'leer', '']);
const ZUSTAND = new Set(['gepflegt', 'normal', 'renovierung', 'sanierung', 'unbebaut', 'bebaut', 'abriss', '']);
const ANLASS = new Set(['verkauf', 'erbe', 'trennung', 'wert', '']);
const ZEIT = new Set(['jetzt', 'monate12', 'spaeter', '']);
const GEWERBE = new Set(['0', 'bis50', 'ueber50', '']);
const RUECKRUF = new Set(['vormittag', 'mittag', 'nachmittag', 'abend', 'egal', '']);
const MOD = new Set(['dach', 'fenster', 'heizung', 'leitungen', 'baeder']);

function sauber(wert, grenze) {
  if (typeof wert !== 'string') return '';
  let raus = '';
  for (const zeichen of wert) {
    const code = zeichen.codePointAt(0);
    if (code < 32 && zeichen !== '\n' && zeichen !== '\t') continue;
    if (code === 127) continue;
    raus += zeichen;
  }
  return raus.trim().slice(0, grenze);
}

function mailPlausibel(wert) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert);
}

function satz(wert, erlaubt) {
  const s = sauber(typeof wert === 'string' ? wert : '', 40);
  return erlaubt.has(s) ? s : '';
}

function nummer(wert) {
  if (wert == null || wert === '') return null;
  const n = Number(String(wert).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function istVerkauf(daten) {
  if (!daten || typeof daten !== 'object') return false;
  return daten.quelle === 'verkauf' || daten.quelle === 'tippgeber' || daten.typ === 'verkaeufer' || daten.typ === 'tippgeber';
}

export function validiereVerkauf(daten) {
  const tipp = daten.quelle === 'tippgeber' || daten.typ === 'tippgeber';
  const objekt = daten.objekt && typeof daten.objekt === 'object' ? daten.objekt : {};
  const lead = {
    erstellt: new Date().toISOString(),
    typ: tipp ? 'tippgeber' : 'verkaeufer',
    quelle: tipp ? 'tippgeber' : 'verkauf',
    vorname: sauber(daten.vorname, 100),
    nachname: sauber(daten.nachname, 100),
    email: sauber(daten.email, 254),
    telefon: sauber(daten.telefon, 40),
    telefonEinwilligung: daten.telefonEinwilligung === true,
    einwilligung: daten.einwilligung === true,
    rueckruf: satz(daten.rueckruf, RUECKRUF),
    weg: tipp ? 'tipp' : satz(daten.weg, WEG),
    nachricht: sauber(daten.nachricht, 2000),
    dritteEinwilligung: daten.dritteEinwilligung === true,
    objekt: {
      strasse: sauber(objekt.strasse, 80),
      hausnummer: sauber(objekt.hausnummer, 12),
      plz: sauber(objekt.plz, 5).replace(/\D/g, ''),
      ort: sauber(objekt.ort, 60),
      lat: nummer(objekt.lat),
      lon: nummer(objekt.lon),
      art: satz(objekt.art || daten.art, ART),
      wohnflaeche: nummer(objekt.wohnflaeche),
      grundstueck: nummer(objekt.grundstueck),
      baujahr: nummer(objekt.baujahr),
      geschoss: nummer(objekt.geschoss),
      nutzung: satz(objekt.nutzung, NUTZUNG),
      we: nummer(objekt.we),
      leerstand: nummer(objekt.leerstand),
      mieteMonat: nummer(objekt.mieteMonat),
      jahresmiete: nummer(objekt.jahresmiete),
      mieteUnbekannt: objekt.mieteUnbekannt === true,
      gewerbeanteil: satz(objekt.gewerbeanteil, GEWERBE),
      zustand: satz(objekt.zustand, ZUSTAND),
      modernisierung: Array.isArray(objekt.modernisierung)
        ? objekt.modernisierung.map((e) => sauber(String(e), 20)).filter((e) => MOD.has(e))
        : [],
      anlass: satz(objekt.anlass, ANLASS),
      zeitpunkt: satz(objekt.zeitpunkt, ZEIT),
      bauform: satz(objekt.bauform, new Set(['frei', 'reihe', 'doppel', ''])),
      variante: objekt.variante === 'B' || daten.variante === 'B' ? 'B' : 'A',
    },
    eigentuemerKontakt: sauber(daten.eigentuemerKontakt, 300),
    einwilligungText: sauber(daten.einwilligungText, 500),
    telefonEinwilligungText: sauber(daten.telefonEinwilligungText, 500),
    unterlagen: Array.isArray(daten.unterlagen)
      ? daten.unterlagen.slice(0, 8).map((datei) => ({
          id: sauber(datei && datei.id, 40),
          name: sauber(datei && datei.name, 80),
          groesse: nummer(datei && datei.groesse),
          loeschenAm: sauber(datei && datei.loeschenAm, 40),
        })).filter((datei) => datei.id)
      : [],
  };

  const fehlt = [];
  if (!lead.vorname) fehlt.push('Vorname');
  if (!mailPlausibel(lead.email)) fehlt.push('E-Mail');
  if (!lead.einwilligung) fehlt.push('Datenschutzhinweis');
  if (lead.telefon && !lead.telefonEinwilligung) fehlt.push('Einwilligung zum Anruf');
  if (!lead.telefon) lead.telefonEinwilligung = false;
  if (!tipp && !lead.weg) fehlt.push('Kauf oder Makler');
  if (tipp && !lead.nachname) fehlt.push('Nachname');
  if (tipp && !(lead.objekt.strasse || lead.objekt.ort)) fehlt.push('Lage');
  if (tipp && lead.eigentuemerKontakt && !lead.dritteEinwilligung) fehlt.push('Einverständnis des Eigentümers');
  if (fehlt.length) return { ok: false, fehler: 'Bitte prüfen: ' + fehlt.join(', ') + '.' };
  return { ok: true, lead };
}
