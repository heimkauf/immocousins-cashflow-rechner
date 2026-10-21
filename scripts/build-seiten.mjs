/**
 * Baut die Verkäufer-Seiten als statisches HTML.
 * Aufruf: node scripts/build-seiten.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inhaltsSeiten } from './inhalte.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASIS = 'https://immocousins.de';

const NAV = [
  ['/immobilie-verkaufen-koeln/', 'Hub'],
  ['/mehrfamilienhaus-verkaufen-koeln/', 'MFH verkaufen'],
  ['/mehrfamilienhaus-bewerten-koeln/', 'MFH bewerten'],
  ['/wohnung-verkaufen-koeln/', 'Wohnung'],
  ['/geerbte-immobilie-verkaufen-koeln/', 'Erbe'],
  ['/immobilie-mit-sanierungsstau-verkaufen/', 'Sanierungsstau'],
  ['/vermietete-immobilie-verkaufen-koeln/', 'Vermietet'],
  ['/bodenrichtwert-koeln/', 'Bodenrichtwert'],
  ['/hausbewertung-koeln/', 'Wert berechnen'],
  ['/tippgeber/', 'Tippgeber'],
  ['/ueber-uns/', 'Über uns'],
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kopf(pfad) {
  const links = NAV.map(([href, name]) => {
    const aktuell = href === pfad ? ' aria-current="page"' : '';
    return `<a href="${href}"${aktuell}>${name}</a>`;
  }).join('');
  const cta = pfad === '/hausbewertung-koeln/'
    ? ''
    : '<a class="btn btn-primary" href="/hausbewertung-koeln/" data-track="cta_click" data-cta="wert_berechnen">Wert berechnen</a>';
  return `<header class="top"><div class="top-innen">
    <a class="logo" href="/immobilie-verkaufen-koeln/">immo<i>.</i>cousins</a>
    <nav aria-label="Immobilie verkaufen"><details class="nav-mehr"><summary>Immobilie verkaufen</summary><div class="nav-liste">${links}</div></details></nav>
    ${cta}
  </div></header>`;
}

function fuss() {
  return `<footer class="site"><div class="wrap">
    <a href="/impressum/">Impressum</a> ·
    <a href="/datenschutz/">Datenschutz</a> ·
    <a href="/tippgeber/">Tippgeber</a> ·
    <a href="/ueber-uns/">Über uns</a> ·
    <a href="/">Für Investoren</a>
    <p class="firma">immo.cousins · Navid &amp; Nikan · Heimkauf CGN GmbH</p>
  </div></footer>`;
}

function leiste(seite) {
  if (!seite.leiste) return '';
  return `<div class="leiste"><a class="btn btn-primary" href="${seite.leiste.href}" data-track="cta_click" data-cta="${esc(seite.leiste.cta || 'wert_berechnen')}">${seite.leiste.label}</a></div>`;
}

const BUSINESS = {
  '@type': ['RealEstateAgent', 'LocalBusiness'],
  name: 'immo.cousins',
  legalName: 'Heimkauf CGN GmbH',
  url: BASIS + '/immobilie-verkaufen-koeln/',
  image: BASIS + '/immo-cousins-hero.png',
  telephone: '+4915785568680',
  email: 'anfrage@immocousins.de',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Pilgrimstr. 6',
    postalCode: '50674',
    addressLocality: 'Köln',
    addressCountry: 'DE',
  },
  areaServed: ['Köln', 'Rhein-Erft-Kreis'],
  sameAs: ['https://instagram.com/immo.cousins'],
  description: 'Navid und Nikan kaufen mit der Heimkauf CGN GmbH Immobilien in Köln und im Rhein-Erft-Kreis und vermitteln als Makler.',
};

function jsonLd(graph) {
  const daten = { '@context': 'https://schema.org', '@graph': graph };
  return '<script type="application/ld+json">' + JSON.stringify(daten).replace(/</g, '\\u003c') + '</script>';
}

function ohneTags(text) {
  return String(text).replace(/<[^>]+>/g, '');
}

function faqLd(eintraege) {
  return {
    '@type': 'FAQPage',
    mainEntity: eintraege.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text: ohneTags(text) },
    })),
  };
}

function dokument(seite) {
  const pfad = seite.pfad;
  const graph = [BUSINESS];
  if (seite.faq) graph.push(faqLd(seite.faq));
  const robots = seite.robots || 'index,follow';
  const klasse = seite.tool ? 'seite-tool' : (seite.leiste ? 'mit-leiste' : '');
  const scripts = ['<script src="/verkaufen/track.js"></script>'];
  if (seite.script) scripts.push(seite.script);
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#0F5C55">
<meta name="description" content="${esc(seite.description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${BASIS}${pfad}">
<meta property="og:title" content="${esc(seite.titel)}">
<meta property="og:description" content="${esc(seite.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${BASIS}${pfad}">
<meta property="og:locale" content="de_DE">
<meta property="og:image" content="${BASIS}/immo-cousins-hero.png">
<title>${esc(seite.titel)}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%230F5C55'/><text x='16' y='23' text-anchor='middle' font-family='system-ui,sans-serif' font-size='19' font-weight='700' fill='%23E8B84B'>&#8364;</text></svg>">
<link rel="stylesheet" href="/verkaufen/basis.css">
<meta name="ic-whatsapp" content="4915785568680">
${jsonLd(graph)}
</head>
<body class="${klasse}" data-page="${esc(seite.track || '')}" data-einstieg="${esc(seite.track || '')}">
${kopf(pfad)}
<main class="wrap">
${seite.main}
</main>
${leiste(seite)}
${fuss()}
${scripts.join('\n')}
</body>
</html>
`;
}

const tool = {
  pfad: '/hausbewertung-koeln/',
  titel: 'Immobilie bewerten Köln: Wertspanne in wenigen Klicks | immo.cousins',
  description: 'Adresse eingeben, Bodenrichtwert sehen, Wertspanne mit amtlichen Daten. Danach Direktankauf ohne Provision oder Maklerverkauf. Kostenlos, ohne Anmeldung.',
  track: 'funnel',
  main: readFileSync(join(wurzel, 'verkaufen/tool-inhalt.html'), 'utf8'),
  tool: true,
  script: '<script src="/verkaufen/funnel.js"></script>',
  faq: [
    ['Kostet die Bewertung etwas?', 'Nein. Die Wertspanne ist kostenlos und du musst dich dafür nicht anmelden.'],
    ['Wie genau ist das Ergebnis?', 'Es ist eine Modellrechnung auf Basis amtlicher Durchschnittswerte. Sie ersetzt kein Gutachten und keine Wertermittlung nach § 194 BauGB.'],
    ['Wie verbindlich ist das Angebot nach 48 Stunden?', 'Unser Angebot ist verbindlich, sofern deine Angaben stimmen und die Unterlagen keine widersprüchlichen oder neuen Erkenntnisse zeigen, die das Angebot unmöglich machen.'],
  ],
};

const seiten = [...inhaltsSeiten(), tool];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASIS}/</loc></url>
  <url><loc>${BASIS}/cashflowrechner/</loc></url>
${seiten.filter((s) => s.robots !== 'noindex,follow').map((s) => `  <url><loc>${BASIS}${s.pfad}</loc></url>`).join('\n')}
</urlset>
`;

const pfade = [];
for (const seite of seiten) {
  const ordner = join(wurzel, seite.pfad.replace(/^\//, '').replace(/\/$/, ''));
  mkdirSync(ordner, { recursive: true });
  writeFileSync(join(ordner, 'index.html'), dokument(seite));
  pfade.push(seite.pfad);
}
writeFileSync(join(wurzel, 'sitemap.xml'), sitemap);
writeFileSync(join(wurzel, 'verkaufen-seiten.txt'), pfade.join('\n') + '\n');
console.log('Seiten geschrieben: ' + pfade.join(', '));
