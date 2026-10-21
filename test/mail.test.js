import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entferneTransport, registriereTransport } from '../lib/smtp.js';
import {
  istVarianteB,
  mailAnVerkaeufer,
  mailIntern,
  sendeBrief,
  sendeVerkauf,
} from '../lib/mail.js';
import { versandArt } from '../lib/smtp.js';
import { EMAIL_INTERN } from '../lib/texte.js';

function dialog() {
  const geschrieben = [];
  const antworten = ['220 ready', '250 ehlo', '334 user', '334 pass', '235 ok', '250 from', '250 rcpt', '354 go', '250 queued'];
  return {
    geschrieben,
    async leseZeile() {
      return antworten.shift() || '250 ok';
    },
    async schreibe(text) {
      geschrieben.push(text);
    },
    async schliesse() {},
  };
}

test('Versandart: ohne Passwort aus, Passwort smtp, Resend nur auf Schalter', () => {
  assert.equal(versandArt({}), 'aus');
  assert.equal(versandArt({ RESEND_API_KEY: 're_test' }), 'aus');
  assert.equal(versandArt({ SMTP_PASS: 'geheim' }), 'smtp');
  assert.equal(versandArt({ MAIL_VERSAND: 'resend', RESEND_API_KEY: 're_test' }), 'resend');
  assert.equal(versandArt({ MAIL_VERSAND: 'aus', SMTP_PASS: 'geheim' }), 'aus');
});

test('Variante B hat kein PDF, intern geht an chenari', () => {
  const b = mailAnVerkaeufer({
    variante: 'B',
    vorname: 'Mia',
    email: 'mia@example.com',
    strasse: 'Pilgrimstraße',
    hausnummer: '6',
    plz: '50674',
    ort: 'Köln',
  });
  assert.equal(istVarianteB({ variante: 'B' }), true);
  assert.equal(b.anhang, null);
  assert.match(b.subject, /^Deine Anfrage für /);
  assert.match(b.text, /bewerten wir persönlich/);

  const a = mailAnVerkaeufer({
    variante: 'A',
    vorname: 'Mia',
    email: 'mia@example.com',
    strasse: 'Pilgrimstraße',
    hausnummer: '6',
    spanne: { niedrig: 100000, hoch: 120000 },
  });
  assert.equal(a.anhang.name, 'auswertung.pdf');
  assert.ok(a.anhang.bytes.length > 100);
  assert.match(a.subject, /^Deine Wertspanne für /);

  const intern = mailIntern({ quelle: 'tippgeber', score: 'A', vorname: 'Tim', email: 't@example.com', plz: '50674', ort: 'Köln' });
  assert.equal(intern.an, EMAIL_INTERN);
  assert.match(intern.subject, /Tipp/);
});

test('SMTP-Dialog schickt das Passwort nicht im Klartext', async () => {
  const id = 'mail-test';
  const runden = [];
  registriereTransport(id, () => {
    const runde = dialog();
    runden.push(runde);
    return runde;
  });
  try {
    const env = { SMTP_PASS: 'geheim-nicht-loggen', SMTP_TRANSPORT_ID: id, SMTP_USER: 'anfrage@immocousins.de' };
    const ergebnis = await sendeVerkauf(env, {
      quelle: 'verkauf',
      score: 'A',
      vorname: 'Maria',
      email: 'maria@example.com',
      variante: 'A',
      strasse: 'Pilgrimstraße',
      hausnummer: '6',
      plz: '50674',
      ort: 'Köln',
      spanne: { niedrig: 900000, hoch: 1100000 },
    });
    assert.equal(ergebnis.intern.versandt, true);
    assert.equal(ergebnis.intern.weg, 'smtp');
    assert.equal(ergebnis.bestaetigung.versandt, true);
    assert.equal(runden.length, 2);
    const roh = runden.map((runde) => runde.geschrieben.join('\n')).join('\n');
    assert.equal(roh.includes('geheim-nicht-loggen'), false);
    assert.match(roh, /chenari\.immo@gmail\.com/);
    assert.match(roh, /maria@example\.com/);
    assert.match(roh, /application\/pdf/);
  } finally {
    entferneTransport(id);
  }
});

test('Tippgeber bekommt keine Verkäufer-Mail', async () => {
  const id = 'tipp-mail';
  let runden = 0;
  registriereTransport(id, () => {
    runden += 1;
    return dialog();
  });
  try {
    const ergebnis = await sendeVerkauf(
      { SMTP_PASS: 'x', SMTP_TRANSPORT_ID: id },
      { quelle: 'tippgeber', score: 'B', vorname: 'Tim', email: 'tim@example.com', plz: '50354', ort: 'Hürth' }
    );
    assert.equal(runden, 1);
    assert.equal(ergebnis.bestaetigung.versandt, false);
  } finally {
    entferneTransport(id);
  }
});

test('ohne Versandzugang bleibt sendeBrief still', async () => {
  const still = await sendeBrief({}, { an: 'a@example.com', subject: 'x', text: 'y' });
  assert.equal(still.versandt, false);
  assert.equal(still.weg, 'aus');
});
