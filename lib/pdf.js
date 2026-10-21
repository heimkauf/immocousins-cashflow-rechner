/** Einseitiges Text-PDF ohne Bibliothek. Schrift: WinAnsi (Helvetica). */

const WIN = {
  '€': 'EUR',
  ä: '\u00E4',
  ö: '\u00F6',
  ü: '\u00FC',
  Ä: '\u00C4',
  Ö: '\u00D6',
  Ü: '\u00DC',
  ß: '\u00DF',
  '–': '-',
  '—': '-',
  '„': '"',
  '“': '"',
  '‚': "'",
  '‘': "'",
  '’': "'",
  '§': '\u00A7',
  '·': '-',
};

function pdfString(text) {
  let roh = '';
  for (const zeichen of String(text)) {
    roh += Object.prototype.hasOwnProperty.call(WIN, zeichen) ? WIN[zeichen] : zeichen.codePointAt(0) > 255 ? '?' : zeichen;
  }
  let raus = '';
  for (const zeichen of roh) {
    const code = zeichen.charCodeAt(0);
    if (zeichen === '(' || zeichen === ')' || zeichen === '\\') raus += '\\' + zeichen;
    else if (code >= 32 && code < 127) raus += zeichen;
    else raus += '\\' + code.toString(8).padStart(3, '0');
  }
  return raus;
}

function zeilenUmbrechen(text, breite) {
  const woerter = String(text).split(/\s+/);
  const zeilen = [];
  let aktuell = '';
  for (const wort of woerter) {
    const naechstes = aktuell ? aktuell + ' ' + wort : wort;
    if (naechstes.length > breite && aktuell) {
      zeilen.push(aktuell);
      aktuell = wort;
    } else {
      aktuell = naechstes;
    }
  }
  if (aktuell) zeilen.push(aktuell);
  return zeilen;
}

/** @param {string[]} absatz */
export function textPdf(absatz) {
  const zeilen = [];
  for (const block of absatz) {
    zeilen.push(...zeilenUmbrechen(block, 90));
    zeilen.push('');
  }
  const inhalt = ['BT', '/F1 11 Tf', '50 800 Td', '14 TL'];
  zeilen.slice(0, 52).forEach((zeile, i) => {
    if (i === 0) inhalt.push('(' + pdfString(zeile) + ') Tj');
    else inhalt.push('T* (' + pdfString(zeile) + ') Tj');
  });
  inhalt.push('ET');
  const stream = inhalt.join('\n');
  const objekte = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const xref = [0];
  objekte.forEach((obj, i) => {
    xref.push(pdf.length);
    pdf += i + 1 + ' 0 obj\n' + obj + '\nendobj\n';
  });
  const start = pdf.length;
  pdf += 'xref\n0 ' + (objekte.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < xref.length; i++) {
    pdf += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer << /Size ' + (objekte.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + start + '\n%%EOF';
  return new TextEncoder().encode(pdf);
}
