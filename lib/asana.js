/** Asana-Task. Ohne Token passiert nichts, der Lead bleibt trotzdem gespeichert. */

import { euro } from './zahl.js';

export function asanaKonfiguration(env) {
  const quelle = env || {};
  return {
    token: quelle.ASANA_TOKEN || '',
    projekt: quelle.ASANA_PROJECT_GID || '1217792767875702',
    bereich: quelle.ASANA_SECTION_GID || '1217792888034081',
  };
}

function artName(art) {
  if (art === 'etw') return 'Eigentumswohnung';
  if (art === 'efh') return 'Ein-/Zweifamilienhaus';
  if (art === 'mfh') return 'Mehrfamilienhaus';
  if (art === 'wgh') return 'Wohn- und Geschäftshaus';
  if (art === 'grundstueck') return 'Grundstück';
  return art || 'Objekt';
}

export function asanaTitel(lead) {
  const ort = [lead.plz, lead.ort].filter(Boolean).join(' ');
  const weg = lead.weg === 'makler' ? 'Makler' : lead.weg === 'tipp' ? 'Tipp' : lead.weg === 'auswertung' ? 'Auswertung' : 'Ankauf';
  return ('[' + lead.score + '] ' + weg + ' · ' + artName(lead.art) + ' · ' + (lead.vorname || 'Ohne Namen') + (ort ? ' · ' + ort : '')).slice(0, 200);
}

export function asanaNotizen(lead) {
  const zeilen = [
    'Lead über immocousins.de / Verkäufer-Funnel',
    '',
    'Score:     ' + lead.score + (lead.gruende ? ' (' + lead.gruende.join(', ') + ')' : ''),
  ];
  if (lead.qualifizierung) {
    zeilen.push('Ohne Makler-Wahl wäre das: ' + lead.qualifizierung + ' (' + (lead.qualGruende || []).join(', ') + ')');
  }
  zeilen.push(
    'Weg:       ' + (lead.weg || '-'),
    'Name:      ' + (lead.vorname || '') + (lead.nachname ? ' ' + lead.nachname : ''),
    'E-Mail:    ' + lead.email,
    'Telefon:   ' + (lead.telefon || '–') + (lead.telefon ? ' (Einwilligung liegt vor)' : ''),
    'Rückruf:   ' + (lead.rueckruf || '–'),
    '',
    'Adresse:   ' + [lead.strasse, lead.hausnummer, lead.plz, lead.ort].filter(Boolean).join(' '),
    'Art:       ' + artName(lead.art),
  );
  const o = lead.objekt || {};
  const paar = [
    ['Wohn-/Nutzfläche', o.wohnflaeche && o.wohnflaeche + ' m²'],
    ['Grundstück', o.grundstueck && o.grundstueck + ' m²'],
    ['Baujahr', o.baujahr],
    ['Geschoss', o.geschoss],
    ['Nutzung', o.nutzung],
    ['Einheiten', o.we],
    ['Leerstand', o.leerstand],
    ['Miete/Monat', o.mieteMonat && euro(Number(o.mieteMonat))],
    ['Gewerbeanteil', o.gewerbeanteil],
    ['Zustand', o.zustand],
    ['Modernisierung', Array.isArray(o.modernisierung) ? o.modernisierung.join(', ') : ''],
    ['Anlass', o.anlass],
    ['Zeitpunkt', o.zeitpunkt],
  ];
  for (const [name, wert] of paar) {
    if (wert) zeilen.push(name + ': ' + wert);
  }
  if (lead.spanne) {
    zeilen.push('', 'Spanne:    ' + euro(lead.spanne.niedrig) + ' – ' + euro(lead.spanne.hoch), 'Mitte:     ' + euro(lead.spanne.mitte));
  }
  if (lead.gegenrechnung && lead.gegenrechnung.wert) {
    zeilen.push(
      '',
      'Interne Gegenrechnung (vereinfachter Ertragswert, nicht an den Verkäufer): ' + euro(lead.gegenrechnung.wert),
      'Das ist keine Ankaufsspanne und kein Angebot.'
    );
  }
  if (lead.variante === 'B') zeilen.push('Variante:  B, persönliche Einschätzung ohne Preisspanne');
  if (Array.isArray(lead.unterlagen) && lead.unterlagen.length) {
    zeilen.push('Unterlagen: ' + lead.unterlagen.map((datei) => datei.name + ' (löschen bis ' + datei.loeschenAm + ')').join(', '));
  }
  if (lead.einwilligungText) zeilen.push('Einwilligung: ' + lead.einwilligungText);
  if (lead.nachricht) zeilen.push('', 'Nachricht:', lead.nachricht);
  zeilen.push('', lead.disclaimer || '');
  return zeilen.join('\n').slice(0, 60000);
}

export async function legeAsanaAn(env, lead, fetcher = fetch) {
  const konfig = asanaKonfiguration(env);
  if (!konfig.token) return { angelegt: false, grund: 'kein Token' };
  try {
    const antwort = await fetcher('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + konfig.token,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        data: {
          name: asanaTitel(lead),
          notes: asanaNotizen(lead),
          projects: [konfig.projekt],
          memberships: [{ project: konfig.projekt, section: konfig.bereich }],
        },
      }),
    });
    return { angelegt: antwort.ok, grund: antwort.ok ? '' : 'HTTP ' + antwort.status };
  } catch (e) {
    return { angelegt: false, grund: 'Netzwerkfehler' };
  }
}
