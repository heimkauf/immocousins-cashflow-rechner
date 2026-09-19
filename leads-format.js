/* Formatiert die JSON-Ausgabe von "wrangler d1 execute --json".
   Aufruf:  node leads-format.js [tabelle|csv]   (JSON kommt ueber stdin) */
'use strict';

const modus = process.argv[2] === 'csv' ? 'csv' : 'tabelle';
let roh = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (roh += d));
process.stdin.on('end', () => {
  let zeilen;
  try {
    const start = roh.indexOf('[');
    zeilen = JSON.parse(roh.slice(start))[0].results;
  } catch (e) {
    console.error('Antwort konnte nicht gelesen werden.');
    process.exit(1);
  }

  if (!zeilen || !zeilen.length) {
    console.log('Noch keine Leads.');
    return;
  }

  if (modus === 'csv') {
    const spalten = Object.keys(zeilen[0]);
    const feld = (v) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[";\n,]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const csv = [spalten.join(';')]
      .concat(zeilen.map((z) => spalten.map((s) => feld(z[s])).join(';')))
      .join('\r\n');
    /* BOM davor, damit Excel die Umlaute richtig liest */
    require('fs').writeFileSync('leads.csv', '﻿' + csv);
    console.log(zeilen.length + ' Leads nach leads.csv geschrieben.');
    return;
  }

  console.table(zeilen);
  console.log('\n' + zeilen.length + ' Eintraege angezeigt.');
});
