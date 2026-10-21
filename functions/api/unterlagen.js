/** Optionales Hochladen von Unterlagen nach R2. Ohne UPLOAD_AKTIV antwortet die Route mit 404. */

import { herkunftOk, json } from '../../lib/http.js';
import { raeumeAbgelaufene, speichereUnterlagen, uploadAn } from '../../lib/unterlagen.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!herkunftOk(request)) return json({ ok: false, fehler: 'Ungültige Herkunft.' }, 403);
  if (!uploadAn(env)) return json({ ok: false, fehler: 'Upload ist abgeschaltet.' }, 404);

  let formular;
  try {
    formular = await request.formData();
  } catch (e) {
    return json({ ok: false, fehler: 'Die Dateien konnten nicht gelesen werden.' }, 400);
  }
  if (String(formular.get('website') || '').trim()) return json({ ok: true, dateien: [] }, 200);

  const dateien = formular.getAll('dateien').filter((eintrag) => eintrag && typeof eintrag.arrayBuffer === 'function' && eintrag.size > 0);
  const ergebnis = await speichereUnterlagen(env, dateien);
  if (context.waitUntil) context.waitUntil(raeumeAbgelaufene(env).catch(() => {}));
  if (!ergebnis.ok) return json({ ok: false, fehler: ergebnis.fehler }, 400);
  return json({ ok: true, dateien: ergebnis.dateien.map(({ id, name, groesse, loeschenAm }) => ({ id, name, groesse, loeschenAm })) }, 200);
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, fehler: 'Methode nicht erlaubt.' }, 405);
}
