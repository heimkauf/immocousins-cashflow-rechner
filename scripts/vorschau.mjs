/**
 * Lokale Vorschau ohne Deploy.
 * Statische Dateien aus dist/, die API-Funktionen direkt daneben.
 * Leads landen nur im Speicher dieses Prozesses.
 *
 *   ./deploy.sh && node scripts/vorschau.mjs
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { onRequest as lage } from '../functions/api/lage.js';
import { onRequest as bewertung } from '../functions/api/bewertung.js';
import { onRequest as lead } from '../functions/api/lead.js';
import { onRequest as konfig } from '../functions/api/konfig.js';
import { onRequest as unterlagen } from '../functions/api/unterlagen.js';
import { bewerten } from '../lib/bewerten.js';
import { regionAus } from '../lib/region.js';

const wurzel = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 8788);

const typen = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};

const zeilen = [];
const db = {
  prepare(sql) {
    return {
      bind(...args) {
        return { async run() { zeilen.push({ sql, args }); return { success: true }; } };
      },
      async run() { zeilen.push({ sql }); return { success: true }; },
    };
  },
};

const objekte = new Map();
const unterlagenSpeicher = {
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
};

const routen = {
  '/api/lage': lage,
  '/api/bewertung': bewertung,
  '/api/lead': lead,
  '/api/konfig': konfig,
  '/api/unterlagen': unterlagen,
};

function fixtureAntwort(pathname, roh) {
  if (process.env.VORSCHAU_FIXTURE !== '1') return null;
  let daten = {};
  try { daten = JSON.parse(roh.toString() || '{}'); } catch (e) { daten = {}; }
  if (pathname === '/api/lage') {
    const region = regionAus(daten.plz, daten.ort || 'Köln');
    const brw = {
      wert: region === 'rhein-erft' ? 890 : 2670,
      stichtag: '2026-01-01',
      gutachterausschuss: region === 'rhein-erft'
        ? 'Gutachterausschuss für Grundstückswerte im Rhein-Erft-Kreis'
        : 'Gutachterausschuss für Grundstückswerte in der Stadt Köln',
      zone: '103010',
    };
    return {
      ok: true,
      lage: { lat: 50.935, lon: 6.94, region, plz: daten.plz || '', ort: daten.ort || 'Köln' },
      brw,
      mehrgeschossig: brw,
      einZweifamilien: brw,
      hinweis: region === 'andere' ? 'Wir sind nur in Köln und im Rhein-Erft-Kreis aktiv. Schreib uns trotzdem, wenn du Fragen hast.' : '',
    };
  }
  if (pathname === '/api/bewertung') {
    const region = regionAus(daten.plz, daten.ort || 'Köln');
    const brw = { wert: 2670, stichtag: '2026-01-01', gutachterausschuss: 'Gutachterausschuss für Grundstückswerte in der Stadt Köln' };
    const irw = daten.art === 'etw' || (daten.art === 'efh' && daten.bauform === 'frei') || (daten.art === 'efh' && region !== 'koeln')
      ? { wert: 4500, name: 'Beispielzone', baujahr: 1955, wohnflaeche: 60, geschoss: 2, layer: daten.bauform === 'reihe' || daten.bauform === 'doppel' ? 'irw_reihen_doppelhaeuser' : 'irw_eigentumswohnungen' }
      : null;
    const ergebnis = bewerten({ ...daten, region }, { brw, irw: daten.art === 'efh' && (daten.bauform === 'reihe' || daten.bauform === 'doppel') && region === 'koeln' ? null : irw });
    return {
      ok: true,
      region,
      brw,
      irw: ergebnis.variante === 'B' ? null : irw,
      verfahren: ergebnis.verfahren,
      spanne: ergebnis.spanne,
      qm: ergebnis.qm,
      zeilen: ergebnis.zeilen,
      hinweis: ergebnis.hinweis,
      tendenz: ergebnis.tendenz,
      disclaimer: ergebnis.disclaimer,
      lizenz: ergebnis.lizenz,
      quelle: ergebnis.quelle,
      variante: ergebnis.variante || 'A',
      ertragswert: ergebnis.ertragswert || null,
      kennzeichen: ergebnis.kennzeichen || null,
    };
  }
  return null;
}

function dateiZu(urlPfad) {
  let pfad = decodeURIComponent(urlPfad.split('?')[0]);
  if (pfad.endsWith('/')) pfad += 'index.html';
  const sauber = normalize(pfad).replace(/^([/\\])+/, '').replace(/^(\.\.(\/|\\|$))+/, '');
  return join(wurzel, sauber);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const handler = routen[url.pathname];
  if (handler) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const roh = Buffer.concat(chunks);
    const fixture = fixtureAntwort(url.pathname, roh);
    if (fixture) {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(fixture));
      return;
    }
    const kopf = new Headers();
    if (req.headers['content-type']) kopf.set('content-type', req.headers['content-type']);
    kopf.set('origin', 'http://127.0.0.1:' + port);
    const request = new Request('http://127.0.0.1:' + port + url.pathname, {
      method: req.method,
      headers: kopf,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : roh,
    });
    const antwort = await handler({
      request,
      env: {
        DB: db,
        UPLOAD_AKTIV: process.env.UPLOAD_AKTIV || '',
        UNTERLAGEN: process.env.UPLOAD_AKTIV === '1' ? unterlagenSpeicher : undefined,
        SMTP_PASS: process.env.SMTP_PASS || '',
        MAIL_VERSAND: process.env.MAIL_VERSAND || 'aus',
      },
      waitUntil(p) { return p; },
    });
    res.writeHead(antwort.status, Object.fromEntries(antwort.headers));
    res.end(Buffer.from(await antwort.arrayBuffer()));
    return;
  }

  try {
    const inhalt = await readFile(dateiZu(url.pathname));
    const endung = url.pathname.endsWith('/') ? '.html' : extname(url.pathname);
    const typ = typen[endung] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': typ });
    res.end(inhalt);
  } catch (e) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('nicht gefunden');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('Vorschau auf http://127.0.0.1:' + port + '/immobilie-verkaufen-koeln/');
});
