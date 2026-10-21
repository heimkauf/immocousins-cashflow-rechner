/** Gemeinsame Antworten der Pages Functions. */

export const ERLAUBTE_HERKUNFT = ['https://immocousins.de', 'https://www.immocousins.de'];

export function herkunftOk(request) {
  const herkunft = request.headers.get('origin') || '';
  if (!herkunft) return true;
  if (ERLAUBTE_HERKUNFT.includes(herkunft)) return true;
  if (herkunft.endsWith('.immocousins-rechner.pages.dev')) return true;
  if (/^https:\/\/[a-z0-9-]+\.pages\.dev$/.test(herkunft) && herkunft.includes('immocousins')) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(herkunft)) return true;
  return false;
}

export function json(daten, status) {
  return new Response(JSON.stringify(daten), {
    status: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });
}

export async function liesJson(request) {
  try {
    return { ok: true, daten: await request.json() };
  } catch (e) {
    return { ok: false };
  }
}
