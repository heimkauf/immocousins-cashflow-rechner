import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function seite(pfad) {
  return readFile(new URL('../' + pfad, import.meta.url), 'utf8');
}

test('finale Texte stehen auf Hub, Funnel, Tippgeber und Unterseiten', async () => {
  const hub = await seite('immobilie-verkaufen-koeln/index.html');
  assert.match(hub, /erst den Wert sehen, dann entscheiden/);
  assert.doesNotMatch(hub, /Immobilie verkaufen in Köln\. Kaufangebot in 48 Stunden\./);
  assert.match(hub, /0157 85568680/);
  assert.match(hub, /anfrage@immocousins\.de/);
  assert.match(hub, /3 % zzgl\. MwSt\./);

  const tool = await seite('hausbewertung-koeln/index.html');
  assert.match(tool, /persönliche Einschätzung zu schicken/);
  assert.match(tool, /Unser Angebot ist verbindlich, sofern deine Angaben stimmen/);
  assert.match(tool, /3 % zzgl\. MwSt\./);
  const funnel = await seite('verkaufen/funnel.js');
  assert.match(funnel, /du bekommst die Einschätzung in 48 h/);

  const tipp = await seite('tippgeber/index.html');
  assert.match(tipp, /bis zu 5\.000 €, abhängig vom Objekt/);
  assert.match(tipp, /Notarvertrag/);
  assert.match(tipp, /\[WEITERE TIPPGEBER-REGELN offen\]/);

  const danke = await seite('danke-verkauf/index.html');
  assert.match(danke, /\[VIDEO-URL\]/);
  const ueber = await seite('ueber-uns/index.html');
  assert.match(ueber, /\[FOTO-NAVID-NIKAN\]/);

  const impressum = await seite('impressum/index.html');
  assert.match(impressum, /Heimkauf CGN GmbH/);
  assert.match(impressum, /HRB 122712/);
  assert.match(impressum, /DE454564838/);
  assert.match(impressum, /§ 34c/);
  assert.match(impressum, /Aktenzeichen stehen auf heimkauf\.de\/impressum nicht/);

  for (const pfad of [
    'wohnung-verkaufen-koeln/index.html',
    'geerbte-immobilie-verkaufen-koeln/index.html',
    'immobilie-mit-sanierungsstau-verkaufen/index.html',
    'vermietete-immobilie-verkaufen-koeln/index.html',
    'mehrfamilienhaus-bewerten-koeln/index.html',
    'mehrfamilienhaus-verkaufen-koeln/index.html',
    'bodenrichtwert-koeln/index.html',
    'immobilie-verkaufen-koeln-ehrenfeld/index.html',
    'immobilie-verkaufen-koeln-nippes/index.html',
    'immobilie-verkaufen-koeln-suelz/index.html',
    'immobilie-verkaufen-koeln-kalk/index.html',
    'immobilie-verkaufen-koeln-porz/index.html',
    'immobilie-verkaufen-koeln-muelheim/index.html',
    'immobilie-verkaufen-huerth/index.html',
    'immobilie-verkaufen-frechen/index.html',
    'immobilie-verkaufen-bruehl/index.html',
    'immobilie-verkaufen-pulheim/index.html',
    'immobilie-verkaufen-kerpen/index.html',
  ]) {
    const html = await seite(pfad);
    assert.match(html, /<h1>/, pfad);
    assert.match(html, /Heimkauf CGN GmbH/, pfad);
  }
});
