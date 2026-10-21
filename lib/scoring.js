/**
 * A = Ankauf, der sich lohnt sofort anzusehen
 *     MFH mit 5–20 WE in Köln/Rhein-Erft, oder Leerstand im Haus,
 *     oder Erbe, oder Verkauf jetzt.
 * B = leere Eigentumswohnung, die nicht schon als A gilt; Tippgeber.
 * C = Rest, und jede Makler-Schiene.
 * Die Makler-Wahl setzt C, die eigentliche Dringlichkeit bleibt als Hinweis erhalten.
 */

function num(wert) {
  const n = Number(wert);
  return Number.isFinite(n) ? n : 0;
}

function ankauf(d) {
  const gruende = [];
  const region = d.region === 'koeln' || d.region === 'rhein-erft';
  const mfh = d.art === 'mfh';
  const we = num(d.we);
  if (mfh && we >= 5 && we <= 20 && region) gruende.push('MFH ' + we + ' WE, ' + (d.region === 'koeln' ? 'Köln' : 'Rhein-Erft'));
  if (mfh && num(d.leerstand) > 0) gruende.push('Leerstand');
  if (d.anlass === 'erbe') gruende.push('Erbe');
  if (d.zeitpunkt === 'jetzt') gruende.push('Verkauf jetzt');
  if (gruende.length) return { score: 'A', gruende };
  if (d.art === 'etw' && d.nutzung === 'leer') return { score: 'B', gruende: ['ETW leer'] };
  return { score: 'C', gruende: ['Rest'] };
}

export function scoreLead(d) {
  const daten = d || {};
  if (daten.typ === 'tippgeber' || daten.weg === 'tipp') {
    const haus = daten.art === 'mfh';
    return {
      score: haus ? 'A' : 'B',
      gruende: [haus ? 'Tipp Mehrfamilienhaus' : 'Tippgeber'],
    };
  }
  const basis = ankauf(daten);
  if (daten.weg === 'makler') {
    return { score: 'C', gruende: ['Makler-Schiene'], qualifizierung: basis.score, qualGruende: basis.gruende };
  }
  return basis;
}
