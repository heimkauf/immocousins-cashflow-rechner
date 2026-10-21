/** Köln und Rhein-Erft. Lieber eine konkrete Liste als ein zu weites Nummernband. */

const KOELN = new Set([
  '50667', '50668', '50670', '50672', '50674', '50676', '50677', '50678', '50679',
  '50733', '50735', '50737', '50739',
  '50823', '50825', '50827', '50829',
  '50931', '50933', '50935', '50937', '50939',
  '50968', '50969',
  '50996', '50997', '50999',
  '51061', '51063', '51065', '51067', '51069',
  '51103', '51105', '51107', '51109',
  '51143', '51145', '51147', '51149',
]);

const RHEIN_ERFT = new Set([
  '50126', '50127', '50129',
  '50169', '50170', '50171',
  '50181', '50189',
  '50226', '50259',
  '50321', '50354', '50374', '50389',
]);

const ORT_REK = new Set([
  'bedburg', 'bergheim', 'brühl', 'bruehl', 'elsdorf', 'erftstadt',
  'frechen', 'hürth', 'hurth', 'kerpen', 'pulheim', 'wesseling',
]);

function normOrt(ort) {
  return String(ort || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ä')
    .normalize('NFC');
}

export function regionAus(plz, ort) {
  const p = String(plz || '').trim();
  const o = normOrt(ort);
  if (KOELN.has(p) || o === 'köln' || o === 'koeln' || o === 'cologne') return 'koeln';
  if (RHEIN_ERFT.has(p) || ORT_REK.has(o)) return 'rhein-erft';
  return 'andere';
}

export function regionName(region) {
  if (region === 'koeln') return 'Köln';
  if (region === 'rhein-erft') return 'Rhein-Erft-Kreis';
  return 'außerhalb von Köln und dem Rhein-Erft-Kreis';
}
