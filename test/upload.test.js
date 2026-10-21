import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loeschZeitpunkt, raeumeAbgelaufene, speichereUnterlagen, uploadAn } from '../lib/unterlagen.js';
import { onRequestPost } from '../functions/api/unterlagen.js';
import { onRequest as konfig } from '../functions/api/konfig.js';

function speicher() {
  const objekte = new Map();
  return {
    objekte,
    UNTERLAGEN: {
      async put(key, body, opts) { objekte.set(key, { body, opts }); },
      async delete(key) { objekte.delete(key); },
      async list() {
        return {
          objects: [...objekte.entries()].map(([key, wert]) => ({
            key,
            customMetadata: (wert.opts && wert.opts.customMetadata) || {},
          })),
        };
      },
    },
  };
}

function datei(name, typ, bytes) {
  const inhalt = new Uint8Array(bytes);
  return {
    name,
    type: typ,
    size: inhalt.byteLength,
    async arrayBuffer() { return inhalt.buffer; },
  };
}

test('Upload ist aus, solange Schalter oder Bucket fehlen', () => {
  assert.equal(uploadAn({}), false);
  assert.equal(uploadAn({ UPLOAD_AKTIV: '1' }), false);
  assert.equal(uploadAn({ UPLOAD_AKTIV: '1', UNTERLAGEN: {} }), true);
});

test('abgeschalteter Upload antwortet 404 und die Konfig sagt upload false', async () => {
  const res = await onRequestPost({
    request: new Request('https://immocousins.de/api/unterlagen', { method: 'POST', headers: { origin: 'https://immocousins.de' } }),
    env: {},
  });
  assert.equal(res.status, 404);
  const status = await konfig({ request: new Request('https://immocousins.de/api/konfig'), env: {} });
  const daten = await status.json();
  assert.equal(daten.upload, false);
  assert.equal(daten.loeschTage, 90);
});

test('Datei bekommt einen Löschzeitpunkt und abgelaufene Objekte verschwinden', async () => {
  const env = { UPLOAD_AKTIV: '1', UPLOAD_LOESCH_TAGE: '90', ...speicher() };
  const bis = loeschZeitpunkt(env, Date.parse('2026-01-01T00:00:00Z'));
  assert.match(bis, /^2026-04-01/);
  const alt = {
    name: 'grundbuch.pdf',
    type: 'application/pdf',
    size: 12,
    async arrayBuffer() { return new Uint8Array([1, 2, 3]).buffer; },
  };
  const gespeichert = await speichereUnterlagen(env, [alt, datei('foto.jpg', 'image/jpeg', [4])]);
  assert.equal(gespeichert.ok, true);
  assert.equal(gespeichert.dateien.length, 2);
  assert.ok(gespeichert.dateien[0].loeschenAm);
  const erster = [...env.objekte.values()][0];
  erster.opts.customMetadata.loeschenAm = '2020-01-01T00:00:00.000Z';
  const aufraeumen = await raeumeAbgelaufene(env, Date.parse('2026-10-21T00:00:00Z'));
  assert.equal(aufraeumen.geloescht, 1);
  assert.equal(env.objekte.size, 1);
});
