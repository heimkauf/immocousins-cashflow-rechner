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

const routen = { '/api/lage': lage, '/api/bewertung': bewertung, '/api/lead': lead };

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
    const request = new Request('http://127.0.0.1:' + port + url.pathname, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
    });
    const antwort = await handler({ request, env: { DB: db }, waitUntil(p) { return p; } });
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
