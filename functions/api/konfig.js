/** Öffentliche Schalter für den Funnel. Keine Geheimnisse. */

import { json } from '../../lib/http.js';
import { loeschTage, uploadAn } from '../../lib/unterlagen.js';

export async function onRequest(context) {
  if (context.request.method !== 'GET') return json({ ok: false, fehler: 'Methode nicht erlaubt.' }, 405);
  return json({
    ok: true,
    upload: uploadAn(context.env),
    loeschTage: loeschTage(context.env),
  }, 200);
}
