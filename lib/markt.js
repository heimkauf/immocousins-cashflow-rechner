/**
 * Amtliche Orientierungswerte für die Modellrechnung.
 * Stand der Auswertung: 20.10.2026.
 *
 * Köln MFH und WGH: Grundstücksmarktbericht Köln 2026 (S. 105) und lzs.csv,
 * Berichtsjahr 2025. Faktoren sind die ausgewiesene Spanne.
 *
 * Rhein-Erft MFH: LZS, Ø-Kaufpreis, Ø-Miete und BWK aus denselben Quellen.
 * Eine Faktor-Spanne weist der ausgewertete Auszug dort nicht aus. Die
 * Faktoren 18 / 23 / 28 sind abgeleitet (Ø-Kaufpreis ÷ Ø-Jahresmiete ≈ 23)
 * und in der Oberfläche als Ableitung gekennzeichnet, nicht als GMB-Spanne.
 *
 * ETW/EFH: der Immobilienrichtwert ist die Basis. Die Zu- und Abschläge
 * darunter sind ein eigenes, grobes Modell — nicht die Umrechnungskoeffizienten
 * des Gutachterausschusses.
 */

export const STICHTAG = '2026-01-01';

export const MARKT = {
  koeln: {
    mfh: {
      lzs: 0.029,
      mieteQm: 11.7,
      bwk: 0.174,
      rnd: 36,
      gnd: 80,
      preisQm: 2978,
      preisQmStreuung: 852,
      faktor: { niedrig: 15, mitte: 21, hoch: 29, herkunft: 'gmb' },
    },
    wgh: {
      lzs: 0.031,
      faktor: { niedrig: 15, mitte: 21, hoch: 26, herkunft: 'gmb' },
    },
  },
  rheinErft: {
    mfh: {
      lzs: 0.023,
      mieteQm: 7.2,
      bwk: 0.25,
      preisQm: 2007,
      preisQmStreuung: null,
      faktor: { niedrig: 18, mitte: 23, hoch: 28, herkunft: 'abgeleitet' },
    },
  },
};

/** Grobe Einordnung am Richtwert, bewusst gedeckelt. */
export const ZUSTAND_FAKTOR = {
  gepflegt: 1.04,
  normal: 1,
  renovierung: 0.9,
  sanierung: 0.78,
};

export const MODERNISIERUNG_PLUS = 0.012;
export const MODERNISIERUNG_DECKEL = 1.06;
