/**
 * Preisspanne. Reine Funktion: keine Netzaufrufe.
 * Die öffentlichen Zahlen für Mehrfamilienhäuser sind Jahresnettokaltmiete × Faktor.
 * Der vereinfachte Ertragswert bleibt eine Gegenrechnung für die interne Notiz.
 */

import { MARKT, ZUSTAND_FAKTOR, MODERNISIERUNG_PLUS, MODERNISIERUNG_DECKEL } from './markt.js';
import { DISCLAIMER, LIZENZ, QUELLE_KURZ } from './texte.js';
import { zahl, inGrenzen } from './zahl.js';

const ARTEN = new Set(['etw', 'efh', 'mfh', 'grundstueck']);

function deckel(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function kennzahlen(region, gewerbeanteil) {
  if (region === 'koeln') {
    if (gewerbeanteil === 'bis50' || gewerbeanteil === 'ueber50') return { ...MARKT.koeln.wgh, mieteQm: MARKT.koeln.mfh.mieteQm, preisQm: MARKT.koeln.mfh.preisQm, preisQmStreuung: MARKT.koeln.mfh.preisQmStreuung, bwk: MARKT.koeln.mfh.bwk, rnd: MARKT.koeln.mfh.rnd };
    return MARKT.koeln.mfh;
  }
  if (region === 'rhein-erft') return MARKT.rheinErft.mfh;
  return null;
}

function geschossFaktor(geschoss, norm) {
  if (geschoss == null || norm == null) return 1;
  const abstand = Math.abs(geschoss - norm);
  if (geschoss <= 0) return 0.97;
  if (abstand === 0) return 1;
  if (abstand === 1) return 0.99;
  return 0.97;
}

function zustandFaktor(zustand) {
  return ZUSTAND_FAKTOR[zustand] || 1;
}

function modernisierungFaktor(liste) {
  const n = Array.isArray(liste) ? liste.filter(Boolean).length : 0;
  return Math.min(MODERNISIERUNG_DECKEL, 1 + n * MODERNISIERUNG_PLUS);
}

function spanneAus(mitte, breite = 0.1) {
  return {
    niedrig: mitte * (1 - breite),
    mitte,
    hoch: mitte * (1 + breite),
  };
}

function basis(verfahren, extra) {
  return {
    ok: true,
    verfahren,
    spanne: null,
    qm: null,
    hinweis: '',
    zeilen: [],
    tendenz: 'mitte',
    disclaimer: DISCLAIMER,
    lizenz: LIZENZ,
    quelle: QUELLE_KURZ,
    ...extra,
  };
}

function tendenz(zustand) {
  if (zustand === 'sanierung' || zustand === 'abriss') return 'unten';
  if (zustand === 'renovierung') return 'unten';
  if (zustand === 'gepflegt') return 'oben';
  return 'mitte';
}

/**
 * Vereinfachtes Ertragswertverfahren, nur als interne Gegenrechnung.
 * (Reinertrag − Bodenwert × LZS) × Barwertfaktor + Bodenwert.
 */
export function ertragswertModell({ jahresmiete, wohnflaeche, grundstueck, brw, region }) {
  const k = region === 'rhein-erft' ? MARKT.rheinErft.mfh : MARKT.koeln.mfh;
  if (!k || !inGrenzen(jahresmiete, 1, 5e7) || !inGrenzen(grundstueck, 20, 1e6) || !brw) return null;
  const boden = brw * grundstueck;
  const bewirt = jahresmiete * k.bwk;
  const reinertrag = jahresmiete - bewirt;
  const bodenverzinsung = boden * k.lzs;
  const gebaeude = reinertrag - bodenverzinsung;
  const bwf = k.lzs === 0 ? k.rnd : (1 - Math.pow(1 + k.lzs, -k.rnd)) / k.lzs;
  const wert = gebaeude > 0 ? gebaeude * bwf + boden : boden;
  if (!Number.isFinite(wert) || wert <= 0) return null;
  return { wert, bodenwert: boden, liegenschaftszins: k.lzs, rnd: k.rnd, bwk: k.bwk };
}

function richtwertWohnen(input, irw) {
  const flaeche = zahl(input.wohnflaeche);
  if (!irw || !irw.wert || !inGrenzen(flaeche, 10, 2000)) {
    return basis('kein-irw', {
      hinweis:
        'Für diese Stelle liegt kein passender Immobilienrichtwert vor. Den Bodenrichtwert können wir zeigen; einen Gebäudepreis ohne Beleg setzen wir nicht an.',
    });
  }

  const baujahr = zahl(input.baujahr);
  const geschoss = zahl(input.geschoss);
  const normFl = irw.wohnflaeche || (input.art === 'efh' ? 140 : 60);
  const normBj = irw.baujahr || 1955;
  const normOg = irw.geschoss == null ? 2 : irw.geschoss;

  let faktor = 1;
  if (inGrenzen(flaeche, 10, 2000)) faktor *= deckel(Math.pow(normFl / flaeche, 0.1), 0.92, 1.08);
  if (inGrenzen(baujahr, 1800, 2035)) faktor *= deckel(1 + (baujahr - normBj) * 0.0012, 0.88, 1.15);
  if (input.art === 'etw') faktor *= geschossFaktor(geschoss, normOg);
  faktor *= zustandFaktor(input.zustand);
  faktor *= modernisierungFaktor(input.modernisierung);

  const qm = irw.wert * faktor;
  const mitte = qm * flaeche;
  const artName = input.art === 'efh' ? 'Ein- und Zweifamilienhäuser' : 'Eigentumswohnungen';
  const layerHinweis =
    irw.layer === 'irw_reihen_doppelhaeuser'
      ? 'Verwendet ist der Richtwert für Reihen- und Doppelhäuser, weil für freistehende Häuser an dieser Stelle keiner vorliegt.'
      : '';

  return basis('irw', {
    spanne: spanneAus(mitte, 0.1),
    qm,
    tendenz: tendenz(input.zustand),
    hinweis: layerHinweis,
    zeilen: [
      `Immobilienrichtwert ${artName}${irw.name ? ' · ' + irw.name : ''}: ${Math.round(irw.wert)} €/m²`,
      `Normobjekt des Gutachterausschusses: Baujahr ${normBj}, ${normFl} m²${input.art === 'etw' ? ', ' + normOg + '. Obergeschoss' : ''}.`,
      'Abweichungen von diesem Normobjekt sind hier nur grob eingeordnet, nicht mit der Umrechnungstabelle des Gutachterausschusses.',
    ],
    umrechnung: irw.umrechnung || '',
  });
}

function mehrfamilienhaus(input, brw) {
  const region = input.region;
  const k = kennzahlen(region, input.gewerbeanteil);
  if (!k) {
    return basis('ausserhalb', {
      hinweis:
        'Die Faktor-Spanne rechnen wir für Köln und den Rhein-Erft-Kreis. Außerhalb zeigen wir den Bodenrichtwert und melden uns mit einer Einordnung.',
    });
  }

  const flaeche = zahl(input.wohnflaeche);
  const mieteMonat = zahl(input.mieteMonat);
  let jahresmiete = null;
  let mieteHinweis = '';
  if (!input.mieteUnbekannt && inGrenzen(mieteMonat, 50, 500000)) {
    jahresmiete = mieteMonat * 12;
    mieteHinweis = 'gerechnet mit deiner monatlichen Nettokaltmiete';
  } else if (inGrenzen(flaeche, 30, 20000)) {
    jahresmiete = k.mieteQm * flaeche * 12;
    mieteHinweis = `Miete nicht angegeben, deshalb Marktansatz ${k.mieteQm.toLocaleString('de-DE')} €/m²`;
  } else {
    return basis('unvollstaendig', {
      hinweis: 'Für die Spanne brauchen wir entweder die Nettokaltmiete oder die Wohn- und Nutzfläche.',
    });
  }

  const f = k.faktor;
  const spanne = {
    niedrig: jahresmiete * f.niedrig,
    mitte: jahresmiete * f.mitte,
    hoch: jahresmiete * f.hoch,
  };
  const qm = inGrenzen(flaeche, 30, 20000) ? spanne.mitte / flaeche : null;
  const faktorText =
    f.herkunft === 'abgeleitet'
      ? `Faktor ${f.niedrig} / ${f.mitte} / ${f.hoch}, abgeleitet aus Ø-Kaufpreis und Ø-Miete. Keine vom Gutachterausschuss ausgewiesene Spanne.`
      : `Rohertragsfaktor ${f.niedrig} / ${f.mitte} / ${f.hoch} aus dem Grundstücksmarktbericht.`;

  const zeilen = [
    faktorText,
    mieteHinweis.charAt(0).toUpperCase() + mieteHinweis.slice(1) + '.',
  ];
  if (k.preisQm && qm) {
    const streu = k.preisQmStreuung ? ` ± ${k.preisQmStreuung}` : '';
    zeilen.push(`Zum Abgleich: Ø-Kaufpreis in der Statistik ${k.preisQm} €/m²${streu}.`);
  }
  if (input.gewerbeanteil === 'ueber50') {
    zeilen.push('Der Gewerbeanteil liegt über 50 %. Die Spanne ist dann nur noch eine grobe Hausnummer.');
  }
  if (input.zustand === 'sanierung' || input.zustand === 'renovierung') {
    zeilen.push('Bei Sanierungsbedarf liegt ein Verkauf eher am unteren Ende der Spanne. Die Faktor-Spanne selbst ist amtlich und wird dafür nicht noch einmal gekürzt.');
  }

  const gegen = ertragswertModell({
    jahresmiete,
    wohnflaeche: flaeche,
    grundstueck: zahl(input.grundstueck),
    brw: brw && brw.wert,
    region: region === 'rhein-erft' ? 'rhein-erft' : 'koeln',
  });

  return basis('faktor', {
    spanne,
    qm,
    tendenz: tendenz(input.zustand),
    zeilen,
    gegenrechnung: gegen,
    jahresmiete,
  });
}

function grundstueck(input, brw) {
  const flaeche = zahl(input.grundstueck) || zahl(input.wohnflaeche);
  if (!brw || !brw.wert || !inGrenzen(flaeche, 20, 1e6)) {
    return basis('unvollstaendig', {
      hinweis: 'Für ein Grundstück brauchen wir den Bodenrichtwert und die Fläche.',
    });
  }
  const mitte = brw.wert * flaeche;
  return basis('bodenrichtwert', {
    spanne: spanneAus(mitte, 0.1),
    qm: brw.wert,
    zeilen: [
      `Bodenrichtwert ${Math.round(brw.wert)} €/m² × ${flaeche.toLocaleString('de-DE')} m².`,
      'Der Richtwert gilt für ein typisches Grundstück der Zone. Zuschnitt, Erschließung und Baurecht können den Preis verschieben.',
    ],
  });
}

export function bewerten(input, amtlich = {}) {
  const art = input && input.art;
  if (!ARTEN.has(art)) {
    return basis('unvollstaendig', { ok: false, hinweis: 'Die Objektart fehlt.' });
  }
  const brw = amtlich.brw || null;
  if (art === 'mfh') return mehrfamilienhaus({ ...input, region: input.region }, brw);
  if (art === 'grundstueck') return grundstueck(input, brw);
  return richtwertWohnen(input, amtlich.irw || null);
}

export function brwFuerArt(art, lage) {
  if (!lage) return null;
  if (art === 'efh' || art === 'grundstueck') return lage.einZweifamilien || lage.mehrgeschossig || null;
  return lage.mehrgeschossig || lage.einZweifamilien || null;
}
