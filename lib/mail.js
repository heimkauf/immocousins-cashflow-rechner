/**
 * Versand über das Strato-Postfach anfrage@immocousins.de.
 * MAIL_VERSAND=smtp | resend | aus. Ohne Angabe: smtp, sobald SMTP_PASS gesetzt ist,
 * sonst kein Versand. Resend bleibt nur als Schalter, nicht als Standard.
 */

import { textPdf } from './pdf.js';
import { baueNachricht, oeffneTransport, smtpSenden, versandArt } from './smtp.js';
import {
  ANGEBOT_VERBINDLICH,
  DISCLAIMER,
  EMAIL_INTERN,
  EMAIL_OEFFENTLICH,
  STUNDEN_48,
  TELEFON_ANZEIGE,
  VARIANTE_B,
  WHATSAPP,
} from './texte.js';

export function absender(env) {
  const von = (env && env.MAIL_VON) || '';
  if (von.includes('@')) return von;
  return 'immo.cousins <' + EMAIL_OEFFENTLICH + '>';
}

export function absenderAdresse(env) {
  const von = absender(env);
  const treffer = von.match(/<([^>]+)>/);
  return treffer ? treffer[1] : von.trim();
}

function euro(n) {
  if (!Number.isFinite(Number(n))) return '';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(n)));
}

export function adresseKurz(lead) {
  const strasse = [lead.strasse, lead.hausnummer].filter(Boolean).join(' ');
  const ort = [lead.plz, lead.ort].filter(Boolean).join(' ');
  return strasse || ort || 'deine Immobilie';
}

export function istVarianteB(lead) {
  return lead.variante === 'B' || (lead.modell && lead.modell.verfahren === 'persoenlich');
}

export function mailAnVerkaeufer(lead) {
  const kurz = adresseKurz(lead);
  const b = istVarianteB(lead);
  const spanne = !b && lead.spanne
    ? 'Die Spanne aus der Modellrechnung: ' + euro(lead.spanne.niedrig) + ' bis ' + euro(lead.spanne.hoch) + '.'
    : '';
  const text = [
    'Hallo ' + (lead.vorname || '') + ',',
    '',
    b
      ? VARIANTE_B + '.'
      : 'Anbei deine ausführliche Auswertung als PDF. ' + (spanne || ''),
    'Navid oder Nikan meldet sich bei dir. Bis dahin erreichst du uns unter ' + TELEFON_ANZEIGE + ' oder per WhatsApp (' + WHATSAPP + ').',
    b ? '' : ANGEBOT_VERBINDLICH + ' ' + STUNDEN_48,
    '',
    'Viele Grüße',
    'Navid & Nikan, immo.cousins (Heimkauf CGN GmbH)',
    '',
    DISCLAIMER,
    'Impressum: https://immocousins.de/impressum/ · Datenschutz: https://immocousins.de/datenschutz/',
  ].filter((zeile) => zeile !== '').join('\n');

  let anhang = null;
  if (!b) {
    anhang = {
      name: 'auswertung.pdf',
      bytes: textPdf([
        'Auswertung für ' + kurz,
        'Hallo ' + (lead.vorname || '') + ',',
        spanne || 'Die ausführliche Einordnung steht in dieser Mail.',
        DISCLAIMER,
        'immo.cousins · Heimkauf CGN GmbH',
      ]),
    };
  }
  return {
    an: lead.email,
    replyTo: EMAIL_OEFFENTLICH,
    subject: b ? 'Deine Anfrage für ' + kurz : 'Deine Wertspanne für ' + kurz,
    text,
    anhang,
  };
}

export function mailIntern(lead) {
  const ort = [lead.plz, lead.ort].filter(Boolean).join(' ');
  const zeilen = [
    lead.quelle === 'tippgeber' ? 'Neuer Tippgeber über immocousins.de' : 'Neuer Verkäufer-Lead über immocousins.de',
    '',
    'Score:    ' + (lead.score || '-'),
    'Weg:      ' + (lead.weg || '-'),
    'Name:     ' + [lead.vorname, lead.nachname].filter(Boolean).join(' '),
    'E-Mail:   ' + lead.email,
    'Telefon:  ' + (lead.telefon || '-'),
    'Adresse:  ' + [lead.strasse, lead.hausnummer, ort].filter(Boolean).join(' '),
    'Art:      ' + (lead.art || '-'),
    'Zeit:     ' + (lead.erstellt || ''),
    lead.einwilligungText ? 'Einwilligung: ' + lead.einwilligungText : '',
    '',
    lead.kurz || '',
  ];
  return {
    an: (lead.internAn) || EMAIL_INTERN,
    replyTo: lead.email,
    subject: '[' + (lead.score || '?') + '] ' + (lead.quelle === 'tippgeber' ? 'Tipp' : 'Verkaufslead') + ': ' + (lead.vorname || '') + (ort ? ', ' + ort : ''),
    text: zeilen.filter((zeile) => zeile !== '').join('\n'),
    anhang: null,
  };
}

export function mailInvestor(lead) {
  const quelle = lead.quelle === 'rechner' ? 'Cashflow-Rechner' : 'Kontaktformular';
  return {
    an: lead.internAn,
    replyTo: lead.email,
    subject: 'Neuer Lead: ' + lead.vorname + ' ' + (lead.nachname || '') + ' (' + quelle + ')',
    text: [
      'Neuer Lead über immocousins.de',
      '',
      'Quelle:   ' + quelle,
      'Name:     ' + lead.vorname + ' ' + (lead.nachname || ''),
      'E-Mail:   ' + lead.email,
      'Telefon:  ' + (lead.telefon || '-'),
      'Zeit:     ' + lead.erstellt,
      lead.nachricht ? '\nNachricht:\n' + lead.nachricht : '',
    ].filter(Boolean).join('\n'),
    anhang: null,
  };
}

async function sendeResend(env, brief) {
  const antwort = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + env.RESEND_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: absender(env),
      to: [brief.an],
      reply_to: brief.replyTo,
      subject: brief.subject,
      text: brief.text,
    }),
  });
  return { versandt: antwort.ok, weg: 'resend', grund: antwort.ok ? '' : 'HTTP ' + antwort.status };
}

async function sendeSmtp(env, brief) {
  const transport = await oeffneTransport(env);
  const nachricht = baueNachricht({
    von: absender(env),
    an: brief.an,
    replyTo: brief.replyTo,
    subject: brief.subject,
    text: brief.text,
    anhang: brief.anhang,
  });
  await smtpSenden(transport, {
    user: env.SMTP_USER || EMAIL_OEFFENTLICH,
    pass: env.SMTP_PASS,
    absender: absenderAdresse(env),
    an: brief.an,
    nachricht,
  });
  return { versandt: true, weg: 'smtp', grund: '' };
}

export async function sendeBrief(env, brief) {
  const art = versandArt(env);
  if (art === 'aus') return { versandt: false, weg: 'aus', grund: 'kein Versand konfiguriert' };
  try {
    if (art === 'resend') {
      if (!env.RESEND_API_KEY) return { versandt: false, weg: 'resend', grund: 'kein Schluessel' };
      return await sendeResend(env, brief);
    }
    if (!env.SMTP_PASS) return { versandt: false, weg: 'smtp', grund: 'kein Passwort' };
    return await sendeSmtp(env, brief);
  } catch (e) {
    return { versandt: false, weg: art, grund: 'Versand fehlgeschlagen' };
  }
}

export async function sendeVerkauf(env, lead) {
  const intern = await sendeBrief(env, mailIntern({ ...lead, internAn: (env && env.MAIL_VERKAUF) || EMAIL_INTERN }));
  let bestaetigung = { versandt: false, weg: intern.weg, grund: 'kein Verkäufer' };
  if (lead.quelle !== 'tippgeber' && lead.email) {
    bestaetigung = await sendeBrief(env, mailAnVerkaeufer(lead));
  }
  return { intern, bestaetigung };
}

export async function sendeInvestor(env, lead) {
  return sendeBrief(env, mailInvestor({ ...lead, internAn: (env && env.MAIL_AN) || 'verwaltung@heimkauf.de' }));
}
