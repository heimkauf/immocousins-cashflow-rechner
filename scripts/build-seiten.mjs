/**
 * Baut die Verkäufer-Seiten als statisches HTML.
 * Aufruf: node scripts/build-seiten.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASIS = 'https://immocousins.de';

const NAV = [
  ['/immobilie-verkaufen-koeln/', 'Verkaufen'],
  ['/hausbewertung-koeln/', 'Bewertung'],
  ['/mehrfamilienhaus-verkaufen-koeln/', 'Mehrfamilienhaus'],
  ['/erbimmobilie-verkaufen-koeln/', 'Erbe'],
  ['/tippgeber/', 'Tippgeber'],
];

const HERO = `<div class="buehne-media">
    <img src="/verkaufen/bilder/hero-800.webp" srcset="/verkaufen/bilder/hero-800.webp 800w, /verkaufen/bilder/hero-1600.webp 1600w" sizes="(min-width: 900px) 48vw, 100vw" width="1600" height="1067" alt="Begrünte Wohnstraße mit Altbauten" fetchpriority="high" decoding="async">
    <p class="credit">Foto: <a href="https://unsplash.com/license" rel="noopener">Unsplash-Lizenz</a></p>
  </div>`;

function ico(inner) {
  return `<span class="ico" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${inner}</svg></span>`;
}
const SVG = {
  pin: '<path d="M16 28s8-7.5 8-14a8 8 0 1 0-16 0c0 6.5 8 14 8 14Z"/><circle cx="16" cy="14" r="2.2"/>',
  chart: '<path d="M6 26h20"/><path d="M10 26V16M16 26V8M22 26v-9"/>',
  clock: '<circle cx="16" cy="16" r="9"/><path d="M16 11v6l4 2"/>',
  home: '<path d="M6 14.5 16 6l10 8.5V26H6V14.5Z"/>',
  blocks: '<path d="M7 27V8h11v19M18 13h7v14"/><path d="M11 13h3M11 18h3M11 23h3"/>',
  key: '<circle cx="12" cy="16" r="4"/><path d="M16 16h11l-2.2 2.2L27 20.5h-3"/>',
};

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
  const ziel = pfad === '/hausbewertung-koeln/' ? '/' : '/hausbewertung-koeln/';
  const ctaText = pfad === '/hausbewertung-koeln/' ? 'Für Anleger' : 'Bewerten';
  const ctaKlasse = pfad === '/hausbewertung-koeln/' ? 'btn btn-ghost nav-cta' : 'btn btn-gold nav-cta';
  return `<a class="skip" href="#inhalt">Zum Inhalt</a>
<header class="top"><div class="top-innen">
    <a class="logo" href="/immobilie-verkaufen-koeln/">immo<i>.</i>cousins</a>
    <nav class="nav-desk" aria-label="Verkaufen">${links}</nav>
    <a class="${ctaKlasse}" href="${ziel}">${ctaText}</a>
    <details class="menue">
      <summary><span class="sr">Menü</span><i></i></summary>
      <div class="menue-panel">${links}</div>
    </details>
  </div></header>`;
}

function fuss() {
  return `<footer class="site"><div class="wrap site-innen">
    <a class="logo" href="/immobilie-verkaufen-koeln/">immo<i>.</i>cousins</a>
    <nav aria-label="Fuß">
      <a href="/">Kapitalanlage</a>
      <a href="/immobilie-verkaufen-koeln/">Verkaufen</a>
      <a href="/hausbewertung-koeln/">Bewertung</a>
      <a href="/tippgeber/">Tippgeber</a>
      <a href="https://instagram.com/immo.cousins" rel="noopener">Instagram</a>
      <a href="/impressum/">Impressum</a>
      <a href="/datenschutz/">Datenschutz</a>
    </nav>
    <p class="firma">Heimkauf CGN GmbH · Pilgrimstr. 6, 50674 Köln · Navid Chenari und Mir Nikan Chenari</p>
  </div></footer>`;
}

function leiste(pfad) {
  if (pfad === '/hausbewertung-koeln/') return '';
  if (pfad === '/immobilie-verkaufen-koeln/') {
    return '<div class="leiste"><a class="btn btn-gold" href="#bewerten">Jetzt kostenlos bewerten</a></div>';
  }
  if (pfad === '/tippgeber/') {
    return '<div class="leiste"><a class="btn btn-gold" href="#tippForm">Tipp senden</a></div>';
  }
  const ziel = pfad === '/mehrfamilienhaus-verkaufen-koeln/'
    ? '/hausbewertung-koeln/?art=mfh'
    : pfad === '/erbimmobilie-verkaufen-koeln/'
      ? '/hausbewertung-koeln/?anlass=erbe'
      : pfad === '/wohnung-verkaufen-koeln/'
        ? '/hausbewertung-koeln/?art=etw'
        : '/hausbewertung-koeln/';
  return `<div class="leiste"><a class="btn btn-gold" href="${ziel}">Jetzt kostenlos bewerten</a></div>`;
}

const BUSINESS = {
  '@type': ['RealEstateAgent', 'LocalBusiness'],
  name: 'immo.cousins',
  legalName: 'Heimkauf CGN GmbH',
  url: BASIS + '/immobilie-verkaufen-koeln/',
  image: BASIS + '/immo-cousins-hero.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Pilgrimstr. 6',
    postalCode: '50674',
    addressLocality: 'Köln',
    addressCountry: 'DE',
  },
  areaServed: ['Köln', 'Rhein-Erft-Kreis'],
  sameAs: ['https://instagram.com/immo.cousins'],
  description: 'Navid und Mir Nikan Chenari kaufen Immobilien in Köln und im Rhein-Erft-Kreis an oder verkaufen sie als Makler.',
};

function jsonLd(graph) {
  const daten = { '@context': 'https://schema.org', '@graph': graph };
  return '<script type="application/ld+json">' + JSON.stringify(daten).replace(/</g, '\\u003c') + '</script>';
}

function faqLd(eintraege) {
  return {
    '@type': 'FAQPage',
    mainEntity: eintraege.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  };
}

function faqHtml(eintraege) {
  return '<div class="faq">' + eintraege.map(([frage, antwort]) =>
    `<details><summary>${frage}</summary><p>${antwort}</p></details>`
  ).join('') + '</div>';
}

function dokument(seite) {
  const pfad = seite.pfad;
  const graph = [BUSINESS];
  if (seite.faq) graph.push(faqLd(seite.faq));
  const robots = seite.robots || 'index,follow';
  const klasse = [seite.tool ? 'seite-tool' : 'mit-leiste', seite.bild ? 'hat-buehne' : ''].filter(Boolean).join(' ');
  const preload = seite.bild
    ? `<link rel="preload" as="image" href="/verkaufen/bilder/hero-800.webp" media="(max-width: 899px)" fetchpriority="high">
<link rel="preload" as="image" href="/verkaufen/bilder/hero-1600.webp" media="(min-width: 900px)" fetchpriority="high">`
    : '';
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
<link rel="preload" href="/verkaufen/fonts/plus-jakarta-700.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="/verkaufen/basis.css">
${seite.tool ? '<!-- TODO Navid: WhatsApp-Nummer international ohne Plus, z. B. 491701234567 -->\n<meta name="ic-whatsapp" content="">' : ''}
${jsonLd(graph)}
</head>
<body class="${klasse}">
${kopf(pfad)}
<main id="inhalt">
${seite.main}
</main>
${leiste(pfad)}
${fuss()}
${seite.tool ? '' : `<script>
(function(){
  var bar=document.querySelector('.leiste');
  var ziel=document.querySelector('.buehne .btn-gold');
  if(!bar||!ziel||!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(es){
    var weg = !!es[0].isIntersecting;
    bar.classList.toggle('weg', weg);
    bar.toggleAttribute('inert', weg);
  },{threshold:0.5}).observe(ziel);
})();
</script>`}
${seite.script || ''}
</body>
</html>
`;
}

const faqHub = [
  ['Bekomme ich wirklich ein Angebot in 48 Stunden?', 'Beim Direktankauf ja: ein Kaufangebot innerhalb von 48 Stunden, nachdem deine Angaben da sind. Gemeldet haben wir uns in der Regel schon innerhalb von 24 Stunden.'],
  ['Was ist der Unterschied zwischen Kaufen und Makeln?', 'Wenn wir selbst kaufen, gibt es keine Maklerprovision und der Ablauf ist kurz: Unterlagen, Besichtigung, Angebot, Notar. Wenn wir für dich verkaufen, vermarkten wir die Immobilie. Die Erlaubnis nach § 34c GewO liegt vor. Wer von beiden welche Rolle hat, steht vor der Entscheidung und im Impressum.'],
  ['Muss ich eine Provision zahlen, wenn ihr selbst kauft?', 'Nein. Eine Provision verlangen wir nicht, wenn die Heimkauf CGN GmbH selbst kauft.'],
  ['Für welche Immobilien ist das gedacht?', 'Wohnungen, Häuser, Mehrfamilienhäuser und Grundstücke in Köln und im Rhein-Erft-Kreis. Besonders oft: Häuser mit Sanierungsstau, Leerstand oder aus einer Erbengemeinschaft.'],
  ['Ist die Online-Spanne ein Gutachten?', 'Nein. Es ist eine unverbindliche Modellrechnung auf amtlichen Durchschnittswerten. Keine Wertermittlung nach § 194 BauGB.'],
];

const faqMfh = [
  ['Gibt es in Köln einen Immobilienrichtwert für Mehrfamilienhäuser?', 'Nein. BORIS.NRW weist für Köln Immobilienrichtwerte für Eigentumswohnungen und freistehende Ein- und Zweifamilienhäuser aus, nicht für Mehrfamilienhäuser. Deshalb rechnen wir mit der Faktor-Spanne aus dem Grundstücksmarktbericht.'],
  ['Welche Faktoren nutzt ihr?', 'Für Mietwohnhäuser in Köln 15, 21 und 29 auf die Jahresnettokaltmiete. Für Wohn- und Geschäftshäuser mit bis zu 50 Prozent Gewerbe 15, 21 und 26. Liegenschaftszins 2,9 Prozent, Ø-Miete 11,70 €/m², Ø-Kaufpreis 2.978 €/m², Stand Grundstücksmarktbericht Köln 2026.'],
  ['Kauft ihr auch mit Mietern und Sanierungsstau?', 'Ja. Leerstand, günstige Mieten und offene Gewerke sind für einen Ankauf oft der Normalfall, nicht ein Ausschlussgrund.'],
  ['Wie viele Wohnungen sollten es sein?', 'Am besten passen Häuser mit etwa 5 bis 20 Wohnungen in Köln oder im Rhein-Erft-Kreis. Kleiner oder größer schauen wir uns trotzdem an.'],
];

const faqErb = [
  ['Können mehrere Erben gemeinsam verkaufen?', 'Ja. Wir sprechen mit der Person, die sich meldet, und auf Wunsch mit der Gemeinschaft. Niemand muss allein unterschreiben, was die anderen nicht mittragen.'],
  ['Müssen wir die Wohnung vorher ausräumen?', 'Nein. Entrümpelung kann Teil des Ablaufs sein. Das klären wir, bevor ein Angebot steht, und setzen es nicht als Hausaufgabe voraus.'],
  ['Beratet ihr zur Erbschaftsteuer?', 'Nein. Wir sind keine Steuerberatung. Für die steuerliche Seite brauchst du eine Steuerkanzlei. Wir können sagen, wie ein Verkauf oder ein Ankauf zeitlich abläuft.'],
  ['Wie diskret läuft das?', 'Es gibt keine öffentliche Besichtigungstour, solange ihr das nicht wollt. Beim Direktankauf sehen das Objekt wir und die Leute, die für das Angebot nötig sind.'],
];

const faqWohnung = [
  ['Vermietet oder leer, was ist besser?', 'Beides geht. Eine leere Wohnung ist einfacher zu besichtigen, eine vermietete ist für viele Käufer eine laufende Einnahme. Die Spanne kennzeichnen wir nicht als besser oder schlechter, der Zustand und die Miete zählen.'],
  ['Braucht ihr das Hausgeld?', 'Für die grobe Spanne nicht. Für ein Kaufangebot ist das Hausgeld hilfreich, plus Teilungserklärung, wenn du sie griffbereit hast.'],
  ['Rechnet ihr mit dem Immobilienrichtwert?', 'Ja, soweit BORIS für die Adresse eine Zone für Eigentumswohnungen ausweist. Der Richtwert gilt für ein Normobjekt. Fläche, Baujahr, Geschoss und Zustand ordnen wir nur grob ein, nicht mit der amtlichen Umrechnungstabelle.'],
];

function pills() {
  return `<ul class="trust">
    <li><a href="https://instagram.com/immo.cousins" rel="noopener">Instagram</a></li>
    <li>48h Angebot</li>
    <li>§34c</li>
    <li>kostenlos &amp; unverbindlich</li>
  </ul>`;
}

const hub = `
<section class="buehne">
  ${HERO}
  <div class="buehne-copy">
    <p class="kicker">Köln · Rhein-Erft</p>
    <h1>Verkaufe deine Immobilie in Köln.</h1>
    <p class="sub">Kostenlose Spanne. Kaufangebot in 48 Stunden.</p>
    ${pills()}
    <form class="suche" id="bewerten" action="/hausbewertung-koeln/" method="get">
      <label>Straße<input name="strasse" type="text" autocomplete="address-line1" enterkeyhint="next"></label>
      <label>Nr.<input name="nr" type="text" autocomplete="address-line2" enterkeyhint="next"></label>
      <label>PLZ<input name="plz" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" enterkeyhint="next"></label>
      <label>Ort<input name="ort" type="text" value="Köln" autocomplete="address-level2" enterkeyhint="done"></label>
      <button class="btn btn-gold" type="submit">Jetzt kostenlos bewerten</button>
    </form>
  </div>
</section>
<section class="wrap band" aria-labelledby="ablauf">
  <h2 id="ablauf">So einfach.</h2>
  <div class="karten drei">
    <article class="karte">${ico(SVG.pin)}<h3>Adresse</h3><p>Bodenrichtwert sofort.</p></article>
    <article class="karte">${ico(SVG.chart)}<h3>Spanne</h3><p>Aus amtlichen Werten.</p></article>
    <article class="karte">${ico(SVG.clock)}<h3>Angebot</h3><p>In 48 Stunden bei dir.</p></article>
  </div>
</section>
<section class="wrap band" aria-labelledby="faelle">
  <h2 id="faelle">Wobei wir helfen.</h2>
  <div class="karten drei">
    <a class="karte karte-link" href="/wohnung-verkaufen-koeln/">${ico(SVG.home)}<h3>Wohnung</h3><p>Richtwert der Zone.</p></a>
    <a class="karte karte-link" href="/mehrfamilienhaus-verkaufen-koeln/">${ico(SVG.blocks)}<h3>Mehrfamilienhaus</h3><p>Miete mal Faktor.</p></a>
    <a class="karte karte-link" href="/erbimmobilie-verkaufen-koeln/">${ico(SVG.key)}<h3>Erbe</h3><p>Diskret, ohne Entrümpeln.</p></a>
  </div>
</section>
<section class="team" aria-labelledby="wer">
  <img src="/immo-cousins-hero.webp" width="360" height="360" alt="Navid und Mir Nikan Chenari, immo.cousins aus Köln">
  <div>
    <h2 id="wer">Navid und Nikan.</h2>
    <p>Cousins in Köln. Wir kaufen selbst oder verkaufen als Makler.</p>
    <p><a href="https://instagram.com/immo.cousins" rel="noopener">@immo.cousins</a></p>
  </div>
</section>
<section class="wrap faq-block" aria-labelledby="hFaq">
  <h2 id="hFaq">Fragen</h2>
  ${faqHtml(faqHub)}
</section>
`;

function spoke(kicker, titel, sub, ziel, karten) {
  return `
<section class="buehne buehne-kurz">
  ${HERO}
  <div class="buehne-copy">
    <p class="kicker">${kicker}</p>
    <h1>${titel}</h1>
    <p class="sub">${sub}</p>
    ${pills()}
    <p style="margin-top:18px"><a class="btn btn-gold" href="${ziel}">Jetzt kostenlos bewerten</a></p>
  </div>
</section>
<section class="wrap band">
  <div class="karten drei">${karten}</div>
</section>`;
}

const mfh = spoke(
  'Mehrfamilienhaus',
  'Mehrfamilienhaus verkaufen.',
  'Miete mal Faktor. Angebot in 48 Stunden.',
  '/hausbewertung-koeln/?art=mfh',
  `<article class="karte">${ico(SVG.chart)}<h3>Faktor</h3><p>15, 21 und 29 auf die Jahresmiete.</p></article>
   <article class="karte">${ico(SVG.blocks)}<h3>Mit Mietern</h3><p>Leerstand ist kein Ausschluss.</p></article>
   <article class="karte">${ico(SVG.home)}<h3>Köln</h3><p>Kein erfundener Quadratmeterpreis.</p></article>`,
) + `
<section class="wrap faq-block" aria-labelledby="hFaqMfh">
  <h2 id="hFaqMfh">Fragen</h2>
  ${faqHtml(faqMfh)}
</section>`;

const erb = spoke(
  'Erbe',
  'Geerbt. Und jetzt?',
  'Diskret. Ohne Entrümpeln vorher.',
  '/hausbewertung-koeln/?anlass=erbe',
  `<article class="karte">${ico(SVG.key)}<h3>Gemeinschaft</h3><p>Eine Ansprechperson für alle.</p></article>
   <article class="karte">${ico(SVG.home)}<h3>Direktkauf</h3><p>Angebot ohne Provision.</p></article>
   <article class="karte">${ico(SVG.clock)}<h3>Oder Makler</h3><p>Wenn ihr den Marktpreis wollt.</p></article>`,
) + `
<section class="wrap faq-block" aria-labelledby="hFaqErb">
  <h2 id="hFaqErb">Fragen</h2>
  ${faqHtml(faqErb)}
</section>`;

const wohnung = spoke(
  'Wohnung',
  'Wohnung in Köln verkaufen.',
  'Richtwert der Zone. Danach deine Wahl.',
  '/hausbewertung-koeln/?art=etw',
  `<article class="karte">${ico(SVG.pin)}<h3>Zone</h3><p>Immobilienrichtwert von BORIS.</p></article>
   <article class="karte">${ico(SVG.home)}<h3>Leer oder vermietet</h3><p>Beides geht.</p></article>
   <article class="karte">${ico(SVG.clock)}<h3>48 Stunden</h3><p>Wenn wir selbst kaufen.</p></article>`,
) + `
<section class="wrap faq-block">
  <h2>Fragen</h2>
  ${faqHtml(faqWohnung)}
</section>`;

const tipp = `
<article class="prosa wrap">
  <p class="kicker">Tippgeber</p>
  <h1>Du kennst ein Objekt?</h1>
  <p class="sub">Bonus, wenn wir kaufen. Der Betrag folgt.</p>
  <div class="todo"><strong>TODO für Navid:</strong> Bonus-Betrag eintragen. Vorschlag für den Satz danach: „Du erhältst [Betrag] €, wenn wir die Immobilie kaufen.“</div>
  <p><strong>Bonus: Betrag folgt.</strong> Gezahlt wird er, wenn aus dem Tipp ein Ankauf durch die Heimkauf CGN GmbH wird, nicht schon für die Nachricht und nicht bei einer reinen Maklervermittlung.</p>
</article>
<section class="wrap band">
  <div class="karten drei">
    <article class="karte">${ico(SVG.pin)}<h3>Hinweis</h3><p>Adresse oder Kontakt. Fremde Daten nur mit Wissen der Person.</p></article>
    <article class="karte">${ico(SVG.clock)}<h3>Prüfung</h3><p>Wir melden uns bei dir.</p></article>
    <article class="karte">${ico(SVG.key)}<h3>Ankauf</h3><p>Dann läuft der Bonus.</p></article>
  </div>
</section>
<section class="wrap" style="padding-bottom:72px">
  <form id="tippForm" class="form-karte" novalidate>
    <h2>Tipp schicken</h2>
    <div class="feld">
      <label class="lbl" for="tVorname">Dein Vorname</label>
      <input id="tVorname" type="text" autocomplete="given-name" required>
    </div>
    <div class="feld">
      <label class="lbl" for="tEmail">E-Mail</label>
      <input id="tEmail" type="email" autocomplete="email" inputmode="email" required>
    </div>
    <div class="feld">
      <label class="lbl" for="tTelefon">Telefon <span class="opt">optional</span></label>
      <input id="tTelefon" type="tel" autocomplete="tel" inputmode="tel">
    </div>
    <div class="feld-paar">
      <div class="feld">
        <label class="lbl" for="tPlz">PLZ des Objekts</label>
        <input id="tPlz" type="text" inputmode="numeric" maxlength="5">
      </div>
      <div class="feld">
        <label class="lbl" for="tOrt">Ort</label>
        <input id="tOrt" type="text" value="Köln">
      </div>
    </div>
    <p class="lbl" style="margin-top:14px">Was für ein Objekt?</p>
    <div class="kacheln gitter" role="radiogroup" aria-label="Objektart des Tipps">
      <label class="kachel"><input type="radio" name="tippArt" value="etw"><strong>Wohnung</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="efh"><strong>Haus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="mfh"><strong>Mehrfamilienhaus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="grundstueck"><strong>Grundstück</strong></label>
    </div>
    <div class="feld">
      <label class="lbl" for="tText">Was weißt du? <span class="opt">optional</span></label>
      <textarea id="tText" placeholder="Zum Beispiel: Mehrfamilienhaus in Nippes, etwa 8 Wohnungen."></textarea>
    </div>
    <div class="honigtopf" aria-hidden="true">
      <label for="tWebsite">Website</label>
      <input id="tWebsite" type="text" tabindex="-1" autocomplete="off">
    </div>
    <div class="einwilligung">
      <input type="checkbox" id="tDritte" required>
      <label for="tDritte">Die Person, um die es geht, weiß davon, oder ich nenne nur eine Adresse ohne fremde Kontaktdaten.</label>
    </div>
    <div class="einwilligung">
      <input type="checkbox" id="tDsgvo" required>
      <label for="tDsgvo">Ich habe die <a href="/datenschutz/">Datenschutzerklärung</a> gelesen. Meine Angaben werden zur Bearbeitung dieses Tipps gespeichert.</label>
    </div>
    <div class="einwilligung">
      <input type="checkbox" id="tTelefonJa">
      <label for="tTelefonJa">Ja, ihr dürft mich unter der angegebenen Nummer anrufen. Nur nötig, wenn du eine Nummer einträgst.</label>
    </div>
    <button type="submit" class="btn btn-gold btn-block" id="tippSenden" style="margin-top:16px">Tipp senden</button>
    <p class="form-fehler" id="tippFehler" role="status"></p>
  </form>
</section>
`;

const impressum = `
<article class="prosa wrap">
  <p class="kicker">Rechtliches</p>
  <h1>Impressum</h1>
  <p class="sub">Angaben nach § 5 DDG für immocousins.de. Offene Felder müssen vor dem Livegang ergänzt werden.</p>
  <h2>Anbieter</h2>
  <p><strong>Heimkauf CGN GmbH</strong><br>Pilgrimstr. 6<br>50674 Köln</p>
  <p>Geschäftsführer: Navid Chenari und Mir Nikan Chenari</p>
  <div class="todo"><strong>TODO für Navid:</strong> E-Mail-Adresse für das Impressum (§ 5 DDG). Telefon, falls ihr eines nennen wollt. Handelsregister, Registergericht und HRB-Nummer. Umsatzsteuer-Identifikationsnummer.</div>
  <h2>Erlaubnis nach § 34c GewO</h2>
  <p>Für die Maklertätigkeit liegt eine Erlaubnis nach § 34c der Gewerbeordnung vor.</p>
  <div class="todo"><strong>TODO für Navid:</strong> zuständige Behörde (IHK Köln oder Ordnungsamt) und Aktenzeichen der Erlaubnis. Berufsbezeichnung und die Kammer, die sie verliehen hat, falls abweichend. Verweis auf die berufsrechtlichen Regelungen.</div>
  <h2>Verantwortlich für den Inhalt</h2>
  <div class="todo"><strong>TODO für Navid:</strong> Name und Anschrift der inhaltlich Verantwortlichen nach § 18 Abs. 2 MStV, falls abweichend von der Geschäftsführung.</div>
  <h2>Streitschlichtung</h2>
  <p>Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
  <p>Die Datenschutzerklärung steht unter <a href="/datenschutz/">/datenschutz/</a>. Die bisherige Firmenfassung auf heimkauf.de bleibt erreichbar, solange die offenen Felder hier nicht gefüllt sind: <a href="https://heimkauf.de/impressum/" rel="noopener">heimkauf.de/impressum</a>.</p>
</article>
`;

const seiten = [
  {
    pfad: '/immobilie-verkaufen-koeln/',
    titel: 'Immobilie verkaufen in Köln | immo.cousins',
    description: 'Navid und Nikan kaufen deine Immobilie in Köln oder im Rhein-Erft-Kreis an, Kaufangebot in 48 Stunden, oder verkaufen sie als Makler. Grobe Preisspanne aus BORIS.NRW.',
    main: hub,
    faq: faqHub,
    bild: true,
  },
  {
    pfad: '/hausbewertung-koeln/',
    titel: 'Hausbewertung Köln – grobe Preisspanne | immo.cousins',
    description: 'Bodenrichtwert sofort, danach eine grobe Preisspanne für Wohnung, Haus, Mehrfamilienhaus oder Grundstück in Köln. Keine Wertermittlung nach § 194 BauGB.',
    main: readFileSync(join(wurzel, 'verkaufen/tool-inhalt.html'), 'utf8'),
    faq: [
      ['Kostet die Spanne etwas?', 'Nein. Die grobe Spanne siehst du ohne E-Mail. Die E-Mail brauchen wir erst, wenn du ein Kaufangebot oder eine Vermarktung willst.'],
      ['Ist das ein Verkehrswert nach § 194 BauGB?', 'Nein. Es ist eine unverbindliche Modellrechnung auf amtlichen Durchschnittswerten, kein Gutachten nach der ImmoWertV.'],
      ['Kauft ihr wirklich selbst?', 'Ja. Hinter immo.cousins steht die Heimkauf CGN GmbH. Wenn wir selbst kaufen, gibt es keine Maklerprovision. Wenn du den Verkauf über uns als Makler willst, sagen wir das vorher.'],
      ['Wie schnell kommt das Angebot?', 'Beim Direktankauf bekommst du ein Kaufangebot innerhalb von 48 Stunden, nachdem die Angaben da sind. Gemeldet haben wir uns in der Regel innerhalb von 24 Stunden.'],
      ['Welche Orte?', 'Köln und der Rhein-Erft-Kreis. Weiter weg zeigen wir den Bodenrichtwert, wenn er vorliegt, und sagen dazu, dass uns die Vergleichszahlen fehlen.'],
    ],
    tool: true,
    script: '<script src="/verkaufen/funnel.js"></script>',
  },
  {
    pfad: '/mehrfamilienhaus-verkaufen-koeln/',
    titel: 'Mehrfamilienhaus verkaufen in Köln | immo.cousins',
    description: 'Mehrfamilienhaus in Köln verkaufen: Preisspanne aus Jahresnettokaltmiete und der Faktor-Spanne des Grundstücksmarktberichts. Direktankauf oder Maklerverkauf.',
    main: mfh,
    faq: faqMfh,
    bild: true,
  },
  {
    pfad: '/erbimmobilie-verkaufen-koeln/',
    titel: 'Erbimmobilie verkaufen in Köln | immo.cousins',
    description: 'Geerbte Immobilie in Köln verkaufen, auch aus einer Erbengemeinschaft. Diskret, ohne vorherige Entrümpelung, Kaufangebot in 48 Stunden oder Verkauf über uns als Makler.',
    main: erb,
    faq: faqErb,
    bild: true,
  },
  {
    pfad: '/wohnung-verkaufen-koeln/',
    titel: 'Wohnung verkaufen in Köln | immo.cousins',
    description: 'Eigentumswohnung in Köln verkaufen. Grobe Preisspanne auf Basis des Immobilienrichtwerts, danach Direktankauf oder Maklerverkauf durch immo.cousins.',
    main: wohnung,
    faq: faqWohnung,
    bild: true,
  },
  {
    pfad: '/tippgeber/',
    titel: 'Tippgeber-Programm | immo.cousins',
    description: 'Tippgeber für Immobilien in Köln und im Rhein-Erft-Kreis. Bonus, wenn immo.cousins die Immobilie kauft. Betrag wird noch ergänzt.',
    main: tipp,
    script: '<script src="/verkaufen/tipp.js"></script>',
  },
  {
    pfad: '/impressum/',
    titel: 'Impressum | immo.cousins',
    description: 'Impressum der Heimkauf CGN GmbH für immocousins.de.',
    robots: 'noindex,follow',
    main: impressum,
  },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASIS}/</loc></url>
  <url><loc>${BASIS}/cashflowrechner/</loc></url>
${seiten.filter((s) => s.robots !== 'noindex,follow').map((s) => `  <url><loc>${BASIS}${s.pfad}</loc></url>`).join('\n')}
</urlset>
`;

for (const seite of seiten) {
  const ordner = join(wurzel, seite.pfad.replace(/^\//, '').replace(/\/$/, ''));
  mkdirSync(ordner, { recursive: true });
  writeFileSync(join(ordner, 'index.html'), dokument(seite));
}
writeFileSync(join(wurzel, 'sitemap.xml'), sitemap);
console.log('Seiten geschrieben: ' + seiten.map((s) => s.pfad).join(', '));
