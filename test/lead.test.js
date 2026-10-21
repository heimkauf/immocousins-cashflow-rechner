import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/lead.js';

function datenbank() {
  const sqls = [];
  return {
    sqls,
    DB: {
      prepare(sql) {
        return {
          bind(...args) {
            return {
              async run() {
                sqls.push({ sql, args });
                return { success: true };
              },
            };
          },
          async run() {
            sqls.push({ sql, args: [] });
            return { success: true };
          },
        };
      },
    },
  };
}

function anfrage(body, origin = 'https://immocousins.de') {
  return new Request('https://immocousins.de/api/lead', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('Investoren-Lead bleibt unverändert: Nachname Pflicht, Quelle kontakt', async () => {
  const db = datenbank();
  const res = await onRequestPost({
    request: anfrage({
      quelle: 'kontakt',
      vorname: 'Navid',
      nachname: 'Test',
      email: 'n@example.com',
      telefon: '',
      nachricht: 'Hallo',
      einwilligung: true,
    }),
    env: { DB: db.DB },
    waitUntil() {},
  });
  assert.equal(res.status, 200);
  const insert = db.sqls.find((e) => e.sql.startsWith('INSERT INTO leads'));
  assert.equal(insert.args[1], 'kontakt');
  assert.equal(db.sqls.some((e) => String(e.sql).includes('leads_verkauf')), false);
});

test('Investoren-Lead ohne Nachname wird abgelehnt', async () => {
  const db = datenbank();
  const res = await onRequestPost({
    request: anfrage({
      quelle: 'rechner',
      vorname: 'Navid',
      email: 'n@example.com',
      einwilligung: true,
    }),
    env: { DB: db.DB },
    waitUntil() {},
  });
  assert.equal(res.status, 400);
  assert.equal(db.sqls.length, 0);
});

test('Verkäufer-Lead speichert Score und ruft Asana nur mit Token', async () => {
  const db = datenbank();
  let asana = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('asana.com')) asana += 1;
    return new Response('{}', { status: 200 });
  };
  try {
    const res = await onRequestPost({
      request: anfrage({
        quelle: 'verkauf',
        typ: 'verkaeufer',
        vorname: 'Maria',
        email: 'maria@example.com',
        einwilligung: true,
        weg: 'ankauf',
        objekt: {
          art: 'mfh',
          plz: '50674',
          ort: 'Köln',
          we: 8,
          wohnflaeche: 650,
          mieteMonat: 7605,
          grundstueck: 450,
          anlass: 'erbe',
          zeitpunkt: 'jetzt',
          strasse: 'Pilgrimstraße',
          hausnummer: '6',
        },
        mehrgeschossig: { wert: 1500 },
      }),
      env: { DB: db.DB, ASANA_TOKEN: 'test-token' },
      async waitUntil(p) {
        await p;
      },
    });
    assert.equal(res.status, 200);
    const kurz = db.sqls.find((e) => e.sql.startsWith('INSERT INTO leads '));
    assert.equal(kurz.args[1], 'verkauf');
    assert.match(kurz.args[6], /Score: A/);
    assert.equal(db.sqls.some((e) => e.sql.includes('INSERT INTO leads_verkauf')), true);
    assert.equal(asana, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test('ohne Asana-Token bleibt der Verkäufer-Lead gültig', async () => {
  const db = datenbank();
  const res = await onRequestPost({
    request: anfrage({
      quelle: 'verkauf',
      vorname: 'Maria',
      email: 'maria@example.com',
      einwilligung: true,
      weg: 'makler',
      objekt: { art: 'etw', plz: '50674', ort: 'Köln', nutzung: 'leer' },
    }),
    env: { DB: db.DB },
    waitUntil() {},
  });
  assert.equal(res.status, 200);
  const verkauf = db.sqls.find((e) => e.sql.includes('INSERT INTO leads_verkauf'));
  assert.equal(verkauf.args[7], 'C');
});
