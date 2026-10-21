/**
 * Nimmt Kontaktanfragen entgegen, legt sie in der D1-Datenbank ab und
 * benachrichtigt per E-Mail, sobald ein Versandzugang hinterlegt ist.
 *
 * Bewusst minimal: keine IP-Adresse, kein User-Agent, keine Cookies,
 * kein Tracking - nur die Felder, die der Nutzer selbst eingegeben hat.
 *
 * Optionale Umgebungsvariablen im Pages-Projekt:
 *   SMTP_HOST           Standard smtp.strato.de
 *   SMTP_PORT           Standard 465
 *   SMTP_USER           Standard anfrage@immocousins.de
 *   SMTP_PASS           Passwort des Strato-Postfachs, nur als Secret
 *   SMTP_TLS            on (465) oder starttls (587)
 *   MAIL_VERSAND        smtp | resend | aus. Ohne Angabe: smtp sobald SMTP_PASS da ist
 *   MAIL_VON            Absender, Standard immo.cousins <anfrage@immocousins.de>
 *   MAIL_AN             Empfaenger der Investoren-Leads, Standard verwaltung@heimkauf.de
 *   MAIL_VERKAUF        Empfaenger der Verkaeufer- und Tippgeber-Leads, Standard chenari.immo@gmail.com
 *   RESEND_API_KEY      nur wenn MAIL_VERSAND=resend
 *   ASANA_TOKEN         Asana-Zugriff, nur fuer Verkaeufer- und Tippgeber-Leads
 *   ASANA_PROJECT_GID   Standard 1217792767875702 (Ankauf Projekte)
 *   ASANA_SECTION_GID   Standard 1217792888034081 (Eingang)
 *   UPLOAD_AKTIV        1 schaltet den Unterlagen-Upload ein
 *   UPLOAD_LOESCH_TAGE  Standard 90
 * Fehlt ein Schluessel, wird der Lead trotzdem gespeichert.
 */

import { herkunftOk, json } from '../../lib/http.js';
import { istVerkauf, validiereVerkauf, TABELLE_SQL, INDEX_SQL } from '../../lib/verkauf.js';
import { scoreLead } from '../../lib/scoring.js';
import { regionAus } from '../../lib/region.js';
import { bewerten, brwFuerArt } from '../../lib/bewerten.js';
import { legeAsanaAn } from '../../lib/asana.js';
import { euro } from '../../lib/zahl.js';
import { DISCLAIMER } from '../../lib/texte.js';
import { sendeInvestor, sendeVerkauf } from '../../lib/mail.js';
import { raeumeAbgelaufene } from '../../lib/unterlagen.js';

const MAX = { name: 100, email: 254, telefon: 40, nachricht: 4000 };

/**
 * Cloudflare waitUntil gibt nichts zurück, die Antwort wartet dann nicht auf die Mail.
 * Liefert waitUntil ein Thenable (lokale Vorschau, Tests), wird es abgewartet.
 */
async function nebenherLassen(waitUntil, arbeit) {
  if (typeof waitUntil === 'function') {
    const warte = waitUntil(arbeit);
    if (warte && typeof warte.then === 'function') await warte;
    return;
  }
  await arbeit;
}

function saubern(wert, grenze) {
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

function fasseZusammen(lead, bewertung, gegen) {
  const o = lead.objekt;
  const teile = [
    'Weg: ' + lead.weg,
    'Score: ' + lead.score,
    o.art && 'Art: ' + o.art,
    (o.strasse || o.plz) && 'Adresse: ' + [o.strasse, o.hausnummer, o.plz, o.ort].filter(Boolean).join(' '),
    o.wohnflaeche && 'Flaeche: ' + o.wohnflaeche + ' m²',
    o.we && 'WE: ' + o.we,
    o.anlass && 'Anlass: ' + o.anlass,
    o.zeitpunkt && 'Zeitpunkt: ' + o.zeitpunkt,
    bewertung && bewertung.spanne && 'Spanne: ' + euro(bewertung.spanne.niedrig) + ' – ' + euro(bewertung.spanne.hoch),
    gegen && gegen.wert && 'Ertragswert intern: ' + euro(gegen.wert),
    lead.nachricht && 'Notiz: ' + lead.nachricht,
  ];
  return teile.filter(Boolean).join('\n').slice(0, 4000);
}

async function verkaufsLead(context, daten) {
  const { env, waitUntil } = context;
  const geprueft = validiereVerkauf(daten);
  if (!geprueft.ok) return json({ ok: false, fehler: geprueft.fehler }, 400);
  if (!env.DB) return json({ ok: false, fehler: 'Speicher nicht verfuegbar.' }, 500);

  const lead = geprueft.lead;
  const objekt = lead.objekt;
  const region = regionAus(objekt.plz, objekt.ort);
  const wertung = scoreLead({
    typ: lead.typ,
    weg: lead.weg,
    art: objekt.art,
    region,
    we: objekt.we,
    leerstand: objekt.leerstand,
    anlass: objekt.anlass,
    zeitpunkt: objekt.zeitpunkt,
    nutzung: objekt.nutzung,
  });

  const brw = brwFuerArt(objekt.art, {
    mehrgeschossig: daten.mehrgeschossig || null,
    einZweifamilien: daten.einZweifamilien || null,
  });
  const irw = daten.irw || null;
  const modell = bewerten({ ...objekt, region }, { brw, irw });
  const gegen = modell.gegenrechnung || null;

  const zusammen = fasseZusammen({ ...lead, score: wertung.score }, modell, gegen);
  const telefon = lead.telefonEinwilligung ? lead.telefon : '';

  try {
    await env.DB.prepare(
      'INSERT INTO leads (erstellt, quelle, vorname, nachname, email, telefon, nachricht, einwilligung)' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
    )
      .bind(lead.erstellt, lead.quelle, lead.vorname, lead.nachname, lead.email, telefon, zusammen)
      .run();
  } catch (e) {
    return json({ ok: false, fehler: 'Speichern fehlgeschlagen. Bitte spaeter erneut versuchen.' }, 500);
  }

  const payload = {
    ...lead,
    telefon,
    region,
    score: wertung.score,
    gruende: wertung.gruende,
    qualifizierung: wertung.qualifizierung || '',
    qualGruende: wertung.qualGruende || [],
    modell: {
      verfahren: modell.verfahren,
      spanne: modell.spanne,
      hinweis: modell.hinweis,
    },
    gegenrechnung: gegen,
  };

  try {
    await env.DB.prepare(TABELLE_SQL).run();
    await env.DB.prepare(INDEX_SQL).run();
    await env.DB.prepare(
      'INSERT INTO leads_verkauf (erstellt, vorname, nachname, email, telefon, telefon_einwilligung, einwilligung, weg, score, plz, ort, art, payload)' +
        ' VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        lead.erstellt,
        lead.vorname,
        lead.nachname,
        lead.email,
        telefon,
        lead.telefonEinwilligung ? 1 : 0,
        lead.weg,
        wertung.score,
        objekt.plz,
        objekt.ort,
        objekt.art,
        JSON.stringify(payload)
      )
      .run();
  } catch (e) {
    /* Die Kurzfassung liegt bereits in leads.nachricht. */
  }

  const fuerDraussen = {
    quelle: lead.quelle,
    score: wertung.score,
    gruende: wertung.gruende,
    qualifizierung: wertung.qualifizierung,
    qualGruende: wertung.qualGruende,
    vorname: lead.vorname,
    nachname: lead.nachname,
    email: lead.email,
    telefon,
    rueckruf: lead.rueckruf,
    weg: lead.weg,
    art: objekt.art,
    plz: objekt.plz,
    ort: objekt.ort,
    strasse: objekt.strasse,
    hausnummer: objekt.hausnummer,
    objekt,
    spanne: modell.spanne,
    gegenrechnung: gegen,
    nachricht: lead.nachricht,
    disclaimer: DISCLAIMER,
    erstellt: lead.erstellt,
    kurz: zusammen,
    variante: objekt.variante,
    einwilligungText: lead.einwilligungText,
    telefonEinwilligungText: lead.telefonEinwilligungText,
    unterlagen: lead.unterlagen,
    modell: {
      verfahren: modell.verfahren,
      spanne: modell.spanne,
      hinweis: modell.hinweis,
    },
  };

  const nebenher = Promise.all([
    legeAsanaAn(env, fuerDraussen).catch(() => ({ angelegt: false })),
    sendeVerkauf(env, fuerDraussen).catch(() => ({ intern: { versandt: false } })),
    raeumeAbgelaufene(env).catch(() => ({ geloescht: 0 })),
  ]);
  await nebenherLassen(waitUntil, nebenher);

  return json({ ok: true }, 200);
}

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;

  /* Nur von den eigenen Domains annehmen - verhindert fremde Einreichungen */
  if (!herkunftOk(request)) {
    return json({ ok: false, fehler: 'Ungueltige Herkunft.' }, 403);
  }

  let daten;
  try {
    daten = await request.json();
  } catch (e) {
    return json({ ok: false, fehler: 'Ungueltige Anfrage.' }, 400);
  }

  /* Honeypot: Bots fuellen unsichtbare Felder aus. Wir antworten freundlich,
     speichern aber nichts. */
  if (saubern(daten.website, 100)) return json({ ok: true }, 200);

  if (istVerkauf(daten)) return verkaufsLead(context, daten);

  const lead = {
    erstellt: new Date().toISOString(),
    quelle: daten.quelle === 'rechner' ? 'rechner' : 'kontakt',
    vorname: saubern(daten.vorname, MAX.name),
    nachname: saubern(daten.nachname, MAX.name),
    email: saubern(daten.email, MAX.email),
    telefon: saubern(daten.telefon, MAX.telefon),
    nachricht: saubern(daten.nachricht, MAX.nachricht),
  };

  const fehlt = [];
  if (!lead.vorname) fehlt.push('Vorname');
  if (!lead.nachname) fehlt.push('Nachname');
  if (!mailPlausibel(lead.email)) fehlt.push('E-Mail');
  if (daten.einwilligung !== true) fehlt.push('Datenschutzhinweis');
  if (fehlt.length) {
    return json({ ok: false, fehler: 'Bitte pruefen: ' + fehlt.join(', ') + '.' }, 400);
  }

  if (!env.DB) {
    return json({ ok: false, fehler: 'Speicher nicht verfuegbar.' }, 500);
  }

  try {
    await env.DB.prepare(
      'INSERT INTO leads (erstellt, quelle, vorname, nachname, email, telefon, nachricht, einwilligung)' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
    )
      .bind(
        lead.erstellt,
        lead.quelle,
        lead.vorname,
        lead.nachname,
        lead.email,
        lead.telefon,
        lead.nachricht
      )
      .run();
  } catch (e) {
    return json({ ok: false, fehler: 'Speichern fehlgeschlagen. Bitte spaeter erneut versuchen.' }, 500);
  }

  /* Der Lead ist sicher. Die Benachrichtigung laeuft nebenher weiter,
     damit der Nutzer nicht auf den Mailversand warten muss. */
  await nebenherLassen(waitUntil, sendeInvestor(env, lead));

  return json({ ok: true }, 200);
}

/* Alles ausser POST abweisen */
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, fehler: 'Methode nicht erlaubt.' }, 405);
}
