/**
 * Nimmt Kontaktanfragen entgegen, legt sie in der D1-Datenbank ab und
 * benachrichtigt per E-Mail, sobald ein Versandzugang hinterlegt ist.
 *
 * Bewusst minimal: keine IP-Adresse, kein User-Agent, keine Cookies,
 * kein Tracking - nur die Felder, die der Nutzer selbst eingegeben hat.
 *
 * Optionale Umgebungsvariablen im Pages-Projekt:
 *   RESEND_API_KEY      Schluessel von resend.com (verschluesselt hinterlegen)
 *   MAIL_VON            Absender, z. B. "immo.cousins <lead@immocousins.de>"
 *   MAIL_AN             Empfaenger der Investoren-Leads, Standard verwaltung@heimkauf.de
 *   MAIL_VERKAUF        Empfaenger der Verkaeufer-Leads, Standard chenari.immo@gmail.com
 *   ASANA_TOKEN         Asana-Zugriff, nur fuer Verkaeufer-Leads
 *   ASANA_PROJECT_GID   Standard 1217792767875702
 *   ASANA_SECTION_GID   Standard 1217792888034081
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

const MAX = { name: 100, email: 254, telefon: 40, nachricht: 4000 };

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

/* Benachrichtigung verschicken. Schlaegt das fehl, ist der Lead trotzdem
   gespeichert - der Nutzer darf davon nichts merken. */
async function benachrichtigen(env, lead) {
  if (!env.RESEND_API_KEY) return { versandt: false, grund: 'kein Schluessel' };

  const von = env.MAIL_VON || 'immo.cousins <lead@immocousins.de>';
  const an = env.MAIL_AN || 'verwaltung@heimkauf.de';
  const quelle = lead.quelle === 'rechner' ? 'Cashflow-Rechner' : 'Kontaktformular';

  const zeilen = [
    'Neuer Lead ueber immocousins.de',
    '',
    'Quelle:   ' + quelle,
    'Name:     ' + lead.vorname + ' ' + lead.nachname,
    'E-Mail:   ' + lead.email,
    'Telefon:  ' + (lead.telefon || '-'),
    'Zeit:     ' + lead.erstellt,
  ];
  if (lead.nachricht) zeilen.push('', 'Nachricht:', lead.nachricht);

  try {
    const antwort = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + env.RESEND_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: von,
        to: [an],
        reply_to: lead.email,
        subject: 'Neuer Lead: ' + lead.vorname + ' ' + lead.nachname + ' (' + quelle + ')',
        text: zeilen.join('\n'),
      }),
    });
    return { versandt: antwort.ok, grund: antwort.ok ? '' : 'HTTP ' + antwort.status };
  } catch (e) {
    return { versandt: false, grund: 'Netzwerkfehler' };
  }
}

async function benachrichtigenVerkauf(env, lead) {
  if (!env.RESEND_API_KEY) return { versandt: false, grund: 'kein Schluessel' };
  const von = env.MAIL_VON || 'immo.cousins <lead@immocousins.de>';
  const an = env.MAIL_VERKAUF || 'chenari.immo@gmail.com';
  const ort = [lead.plz, lead.ort].filter(Boolean).join(' ');
  const zeilen = [
    'Neuer Verkaeufer-Lead ueber immocousins.de',
    '',
    'Score:    ' + lead.score + (lead.gruende && lead.gruende.length ? ' (' + lead.gruende.join(', ') + ')' : ''),
    'Weg:      ' + (lead.weg || '-'),
    'Name:     ' + lead.vorname,
    'E-Mail:   ' + lead.email,
    'Telefon:  ' + (lead.telefon || '-'),
    'Adresse:  ' + [lead.strasse, lead.hausnummer, ort].filter(Boolean).join(' '),
    'Art:      ' + (lead.art || '-'),
    'Zeit:     ' + lead.erstellt,
    '',
    lead.kurz || '',
  ];
  try {
    const antwort = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + env.RESEND_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: von,
        to: [an],
        reply_to: lead.email,
        subject: '[' + lead.score + '] Verkaufslead: ' + lead.vorname + (ort ? ', ' + ort : ''),
        text: zeilen.join('\n'),
      }),
    });
    return { versandt: antwort.ok, grund: antwort.ok ? '' : 'HTTP ' + antwort.status };
  } catch (e) {
    return { versandt: false, grund: 'Netzwerkfehler' };
  }
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
  };

  const nebenher = Promise.all([
    legeAsanaAn(env, fuerDraussen).catch(() => ({ angelegt: false })),
    benachrichtigenVerkauf(env, fuerDraussen).catch(() => ({ versandt: false })),
  ]);
  if (typeof waitUntil === 'function') waitUntil(nebenher);
  else await nebenher;

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
  if (typeof waitUntil === 'function') {
    waitUntil(benachrichtigen(env, lead));
  } else {
    await benachrichtigen(env, lead);
  }

  return json({ ok: true }, 200);
}

/* Alles ausser POST abweisen */
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, fehler: 'Methode nicht erlaubt.' }, 405);
}
