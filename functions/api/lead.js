/**
 * Nimmt Kontaktanfragen entgegen, legt sie in der D1-Datenbank ab und
 * benachrichtigt per E-Mail, sobald ein Versandzugang hinterlegt ist.
 *
 * Bewusst minimal: keine IP-Adresse, kein User-Agent, keine Cookies,
 * kein Tracking - nur die Felder, die der Nutzer selbst eingegeben hat.
 *
 * Optionale Umgebungsvariablen im Pages-Projekt:
 *   RESEND_API_KEY   Schluessel von resend.com (verschluesselt hinterlegen)
 *   MAIL_VON         Absender, z. B. "immo.cousins <lead@immocousins.de>"
 *   MAIL_AN          Empfaenger, Standard verwaltung@heimkauf.de
 * Fehlt der Schluessel, wird der Lead trotzdem gespeichert - nur eben
 * ohne Benachrichtigung.
 */

const MAX = { name: 100, email: 254, telefon: 40, nachricht: 4000 };

const ERLAUBTE_HERKUNFT = [
  'https://immocousins.de',
  'https://www.immocousins.de',
];

function json(daten, status) {
  return new Response(JSON.stringify(daten), {
    status: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/* Steuerzeichen entfernen und auf eine sinnvolle Laenge kuerzen */
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

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;

  /* Nur von den eigenen Domains annehmen - verhindert fremde Einreichungen */
  const herkunft = request.headers.get('origin') || '';
  const okHerkunft =
    !herkunft ||
    ERLAUBTE_HERKUNFT.includes(herkunft) ||
    herkunft.endsWith('.immocousins-rechner.pages.dev');
  if (!okHerkunft) {
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
