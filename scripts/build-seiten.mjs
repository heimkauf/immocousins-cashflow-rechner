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
    ? '<a class="btn btn-linie" href="/">Für Anleger</a>'
    : '<a class="btn btn-primary" href="/hausbewertung-koeln/">Wert sehen</a>';
  return `<header class="top"><div class="top-innen">
    <a class="logo" href="/immobilie-verkaufen-koeln/">immo<i>.</i>cousins</a>
    <nav aria-label="Verkaufen">${links}</nav>
    ${cta}
  </div></header>`;
}

function fuss() {
  return `<footer class="site"><div class="wrap">
    <a href="/">Kapitalanlage</a> ·
    <a href="/immobilie-verkaufen-koeln/">Immobilie verkaufen</a> ·
    <a href="/hausbewertung-koeln/">Bewertung</a> ·
    <a href="/tippgeber/">Tippgeber</a> ·
    <a href="https://instagram.com/immo.cousins" rel="noopener">Instagram</a> ·
    <a href="/impressum/">Impressum</a> ·
    <a href="/datenschutz/">Datenschutz</a>
    <p class="firma">Heimkauf CGN GmbH · Pilgrimstr. 6, 50674 Köln · Navid Chenari und Mir Nikan Chenari</p>
  </div></footer>`;
}

function leiste(pfad) {
  if (pfad === '/hausbewertung-koeln/') return '';
  if (pfad === '/tippgeber/') {
    return '<div class="leiste"><a class="btn btn-primary" href="#tippForm">Tipp senden</a></div>';
  }
  const ziel = pfad === '/mehrfamilienhaus-verkaufen-koeln/'
    ? '/hausbewertung-koeln/?art=mfh'
    : pfad === '/erbimmobilie-verkaufen-koeln/'
      ? '/hausbewertung-koeln/?anlass=erbe'
      : pfad === '/wohnung-verkaufen-koeln/'
        ? '/hausbewertung-koeln/?art=etw'
        : '/hausbewertung-koeln/';
  return `<div class="leiste"><a class="btn btn-primary" href="${ziel}">Kaufangebot in 48 Stunden</a></div>`;
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
  const klasse = seite.tool ? 'seite-tool' : 'mit-leiste';
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
${seite.tool ? '<!-- TODO Navid: WhatsApp-Nummer international ohne Plus, z. B. 491701234567 -->\n<meta name="ic-whatsapp" content="">' : ''}
${jsonLd(graph)}
</head>
<body class="${klasse}">
${kopf(pfad)}
<main class="wrap">
${seite.main}
</main>
${leiste(pfad)}
${fuss()}
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

const hub = `
<header class="hero">
  <div class="hero-grid">
    <img class="duo" src="/immo-cousins-hero.webp" width="168" height="168" alt="Navid und Mir Nikan Chenari, immo.cousins aus Köln">
    <div>
      <p class="marke">immo.cousins · Köln</p>
      <h1>Immobilie verkaufen in Köln. Kaufangebot in 48 Stunden.</h1>
      <p class="lead">Wir sind Navid und Nikan. Wir kaufen Wohnungen, Häuser und Mehrfamilienhäuser in Köln und im Rhein-Erft-Kreis selbst an. Wenn du lieber am Markt verkaufen willst, machen wir das als Makler.</p>
      <div class="hero-aktionen">
        <a class="btn btn-primary" href="/hausbewertung-koeln/">Wert in 60 Sekunden sehen</a>
        <a class="btn btn-linie" href="/hausbewertung-koeln/">Kaufangebot in 48 Stunden</a>
      </div>
    </div>
  </div>
</header>

<section aria-labelledby="hWege">
  <h2 id="hWege">Zwei Wege, eine Ansprechperson</h2>
  <p class="sek-unter">Du entscheidest am Ende der Bewertung, nicht wir vorher.</p>
  <div class="karten zwei">
    <article class="karte">
      <h3>Wir kaufen direkt</h3>
      <p>Kaufangebot in 48 Stunden. Keine Maklerprovision, weil die Heimkauf CGN GmbH selbst kauft. Kein Inserat, keine Besichtigungsreihe. Passt, wenn du Klarheit willst: Erbe, Sanierungsstau, Leerstand, Trennung.</p>
    </article>
    <article class="karte">
      <h3>Wir verkaufen für dich als Makler</h3>
      <p>Wir vermarkten die Immobilie und begleiten dich bis zum Notar. Die Erlaubnis nach § 34c GewO liegt vor. Diesen Weg nimmst du, wenn du den Marktpreis suchst und Zeit hast.</p>
    </article>
  </div>
</section>

<section aria-labelledby="hAblauf">
  <h2 id="hAblauf">So läuft die Bewertung</h2>
  <div class="karten drei">
    <article class="karte"><span class="nr">1</span><h3>Adresse</h3><p>Du siehst den Bodenrichtwert aus BORIS.NRW, bevor wir nach dem Zustand fragen.</p></article>
    <article class="karte"><span class="nr">2</span><h3>Spanne</h3><p>Eine grobe Preisspanne, mit Quelle und dem Hinweis: keine Wertermittlung nach § 194 BauGB.</p></article>
    <article class="karte"><span class="nr">3</span><h3>Deine Wahl</h3><p>Direktankauf oder Maklerverkauf. Danach Name und E-Mail. Telefon nur, wenn du es willst.</p></article>
  </div>
</section>

<section aria-labelledby="hFaelle">
  <h2 id="hFaelle">Womit wir oft zu tun haben</h2>
  <div class="karten drei">
    <article class="karte"><h3><a href="/mehrfamilienhaus-verkaufen-koeln/">Mehrfamilienhaus</a></h3><p>Mieter, Leerstand, Gewerbe im Erdgeschoss. Die Spanne kommt aus Miete mal Faktor, nicht aus einem erfundenen Quadratmeterpreis.</p></article>
    <article class="karte"><h3><a href="/erbimmobilie-verkaufen-koeln/">Erbimmobilie</a></h3><p>Gemeinschaft, volle Wohnung, keine Lust auf zehn Besichtigungstermine. Diskret, und ohne dass vorher entrümpelt werden muss.</p></article>
    <article class="karte"><h3><a href="/wohnung-verkaufen-koeln/">Wohnung</a></h3><p>Eigentumswohnung in Köln, selbst genutzt oder vermietet. Der Immobilienrichtwert der Zone ist die Basis.</p></article>
  </div>
</section>

<section aria-labelledby="hWir">
  <h2 id="hWir">Wer den Hörer in die Hand nimmt</h2>
  <div class="gesichter">
    <figure>
      <img src="/immo-cousins-hero.webp" width="112" height="112" alt="Navid und Mir Nikan Chenari">
      <figcaption>Navid und Nikan</figcaption>
    </figure>
    <figure>
      <div class="platzhalter" role="img" aria-label="Platzhalter, Porträt von Navid folgt">N</div>
      <figcaption>Navid · Foto folgt</figcaption>
    </figure>
    <figure>
      <div class="platzhalter" role="img" aria-label="Platzhalter, Porträt von Nikan folgt">N</div>
      <figcaption>Nikan · Foto folgt</figcaption>
    </figure>
  </div>
  <p style="margin-top:14px">Wir sind Cousins und arbeiten unter der Marke immo.cousins. Auf Instagram zeigen wir unter <a href="https://instagram.com/immo.cousins" rel="noopener">@immo.cousins</a>, woran wir gerade arbeiten. Die Kapitalanlage-Seite für Käufer bleibt unter <a href="/">immocousins.de</a>, der Rechner unter <a href="/cashflowrechner/">/cashflowrechner/</a>.</p>
  <p>Einen Tipp zu einem Objekt, das nicht dir gehört, kannst du über das <a href="/tippgeber/">Tippgeber-Programm</a> schicken. Den Bonus trägt Navid noch ein.</p>
</section>

<section aria-labelledby="hFaq">
  <h2 id="hFaq">Häufige Fragen</h2>
  ${faqHtml(faqHub)}
</section>
`;

const mfh = `
<header class="hero eng">
  <p class="marke">Mehrfamilienhaus · Köln</p>
  <h1>Mehrfamilienhaus verkaufen in Köln</h1>
  <p class="lead">Mieter, Leerstand oder ein Dach, das seit Jahren wartet: dafür ist der Direktankauf da. Die grobe Spanne rechnen wir aus der Jahresnettokaltmiete und der Faktor-Spanne des Grundstücksmarktberichts, nicht aus einem pauschalen Quadratmeterpreis.</p>
  <div class="hero-aktionen">
    <a class="btn btn-primary" href="/hausbewertung-koeln/?art=mfh">Haus bewerten</a>
  </div>
</header>
<section class="eng">
  <h2>Warum hier kein Immobilienrichtwert steht</h2>
  <p>Für Köln weist BORIS.NRW Immobilienrichtwerte für Eigentumswohnungen und für freistehende Ein- und Zweifamilienhäuser aus. Für Mehrfamilienhäuser ist der Layer leer, im Rhein-Erft-Kreis ebenfalls. Wer an dieser Stelle trotzdem einen Quadratmeterpreis aus dem EFH-Richtwert nimmt, rechnet das falsche Objekt.</p>
  <p>Amtlich belegt sind für Kölner Mietwohnhäuser, Berichtsjahr 2025, Grundstücksmarktbericht 2026: Liegenschaftszins 2,9&nbsp;%, Ø-Miete 11,70&nbsp;€/m², Ø-Kaufpreis 2.978&nbsp;€/m², Rohertragsfaktor 21 bei einer Spanne von 15 bis 29. Wohn- und Geschäftshäuser mit bis zu 50&nbsp;% Gewerbe: Faktor 21, Spanne 15 bis 26, Liegenschaftszins 3,1&nbsp;%. Im Rhein-Erft-Kreis liegen Liegenschaftszins bei 2,3&nbsp;%, die Ø-Miete bei 7,20&nbsp;€/m² und der Ø-Kaufpreis bei 2.007&nbsp;€/m². Eine Faktor-Spanne weist der von uns ausgewertete Auszug dort nicht aus. Wir leiten 18 / 23 / 28 ab und schreiben das dazu.</p>
  <div class="hinweis"><p>Die Zahl auf der Ergebnisseite ist eine Modellrechnung. Keine Wertermittlung nach § 194 BauGB. Den Ankaufspreis, den wir selbst zahlen würden, zeigen wir online nicht.</p></div>
</section>
<section class="eng">
  <h2>Was wir dafür wissen müssen</h2>
  <div class="karten drei">
    <article class="karte"><h3>Adresse</h3><p>Für den Bodenrichtwert. Der Grundstückswert fließt in die interne Gegenrechnung ein, wenn du die Fläche kennst.</p></article>
    <article class="karte"><h3>Miete und Fläche</h3><p>Monatliche Nettokaltmiete und Wohn- und Nutzfläche. Ohne Miete nehmen wir den Marktansatz und kennzeichnen ihn.</p></article>
    <article class="karte"><h3>Leerstand und Gewerbe</h3><p>Leere Wohnungen und ein Laden im Erdgeschoss ändern die Dringlichkeit und die Faktor-Wahl.</p></article>
  </div>
  <p>Sanierungsstau ist kein Grund, das Formular wegzulegen. Dach, Fenster, Heizung, Leitungen, Bäder: du hakst an, was in den letzten 15 Jahren gemacht wurde. Den Rest unterstellen wir nicht.</p>
  <p><a class="btn btn-tuerkis" href="/hausbewertung-koeln/?art=mfh">Zur Bewertung für Mehrfamilienhäuser</a></p>
</section>
<section class="eng" aria-labelledby="hFaqMfh">
  <h2 id="hFaqMfh">Häufige Fragen</h2>
  ${faqHtml(faqMfh)}
</section>
`;

const erb = `
<header class="hero eng">
  <p class="marke">Erbe · Köln</p>
  <h1>Erbimmobilie verkaufen in Köln</h1>
  <p class="lead">Ein Haus oder eine Wohnung aus einem Erbfall braucht selten eine öffentliche Besichtigungstour. Es braucht eine Zahl, eine klare Rolle und jemanden, der mit mehreren Leuten gleichzeitig sprechen kann.</p>
  <div class="hero-aktionen">
    <a class="btn btn-primary" href="/hausbewertung-koeln/?anlass=erbe">Geerbtes Objekt einordnen</a>
  </div>
</header>
<section class="eng">
  <h2>Was sich am Ablauf ändert</h2>
  <p>Im Formular gibst du als Anlass „Erbe“ an. Die Preisspanne bleibt dieselbe Modellrechnung wie bei einem normalen Verkauf. Was sich ändert, ist die Dringlichkeit auf unserer Seite und das Versprechen: keine Besichtigungen durch fremde Interessenten, solange ihr das nicht ausdrücklich wollt.</p>
  <div class="karten zwei">
    <article class="karte"><h3>Wir kaufen direkt</h3><p>Ein Angebot an die Gemeinschaft, ohne Provision. Entrümpelung und offene Schönheitsreparaturen können im Angebot stecken, statt vorher erledigt werden zu müssen.</p></article>
    <article class="karte"><h3>Wir verkaufen für euch</h3><p>Wenn die Gemeinschaft den Marktpreis will, vermarkten wir als Makler. Auch dann mit einem Ansprechpartner, nicht mit einer Liste von Telefonnummern.</p></article>
  </div>
  <p>Steuern, Pflichtteilsfragen und wer unterschreiben darf, klären Notar und Steuerberatung. Wir tun nicht so, als könnten wir das nebenbei.</p>
  <p><a class="btn btn-tuerkis" href="/hausbewertung-koeln/?anlass=erbe">Bewertung starten, Anlass Erbe</a></p>
</section>
<section class="eng">
  <h2 id="hFaqErb">Häufige Fragen</h2>
  ${faqHtml(faqErb)}
</section>
`;

const wohnung = `
<header class="hero eng">
  <p class="marke">Wohnung · Köln</p>
  <h1>Wohnung verkaufen in Köln</h1>
  <p class="lead">Für Eigentumswohnungen gibt es in Köln Immobilienrichtwerte, Zone für Zone. Die grobe Spanne setzt darauf auf. Ob wir die Wohnung selbst kaufen oder für dich verkaufen, entscheidest du nach der Zahl.</p>
  <div class="hero-aktionen">
    <a class="btn btn-primary" href="/hausbewertung-koeln/?art=etw">Wohnung bewerten</a>
  </div>
</header>
<section class="eng">
  <h2>Was in die Spanne eingeht</h2>
  <p>Der Immobilienrichtwert beschreibt ein Normobjekt des Gutachterausschusses, oft mit Baujahr, Wohnfläche und Geschosslage. Deine Wohnung weicht davon ab. Wir verschieben den Richtwert dafür nur in einem engen Rahmen und schreiben dazu, dass das nicht die Umrechnungstabelle des Gutachterausschusses ist. Den Link zur Tabelle zeigen wir am Ergebnis, wenn BORIS ihn mitliefert.</p>
  <p>Selbst genutzt, vermietet oder leer: die Nutzung ändert den Preisrahmen hier nicht stark, sie ändert, wie wir das Gespräch vorbereiten. Eine leere Wohnung können wir schneller ansehen. Eine vermietete braucht den Mietvertrag, nicht eine geräumte Wohnung.</p>
  <p><a class="btn btn-tuerkis" href="/hausbewertung-koeln/?art=etw">Zur Wohnungsbewertung</a></p>
</section>
<section class="eng">
  <h2>Häufige Fragen</h2>
  ${faqHtml(faqWohnung)}
</section>
`;

const tipp = `
<header class="hero eng">
  <p class="marke">Tippgeber</p>
  <h1>Du kennst ein Objekt. Wir zahlen einen Bonus, wenn wir kaufen.</h1>
  <p class="lead">Hausverwaltungen, Handwerk, Nachbarschaft, Familie: wenn du von einer Immobilie in Köln oder im Rhein-Erft-Kreis weißt, die verkauft werden könnte, schick uns den Hinweis.</p>
</header>
<section class="eng">
  <div class="todo"><strong>TODO für Navid:</strong> Bonus-Betrag eintragen. Vorschlag für den Satz danach: „Du erhältst [Betrag] €, wenn wir die Immobilie kaufen.“</div>
  <p style="margin-top:14px"><strong>Bonus: Betrag folgt.</strong> Gezahlt wird er, wenn aus dem Tipp ein Ankauf durch die Heimkauf CGN GmbH wird, nicht schon für die Nachricht und nicht bei einer reinen Maklervermittlung. Die Höhe steht hier, sobald Navid sie festlegt.</p>
  <div class="karten drei">
    <article class="karte"><span class="nr">1</span><h3>Hinweis</h3><p>Adresse oder Kontakt. Personenbezogene Daten einer anderen Person nur, wenn sie davon weiß.</p></article>
    <article class="karte"><span class="nr">2</span><h3>Prüfung</h3><p>Wir melden uns bei dir und, wenn es passt, bei der Eigentümerseite.</p></article>
    <article class="karte"><span class="nr">3</span><h3>Ankauf</h3><p>Kommt der Kauf zustande, läuft der Bonus. Vorher sagen wir dir, woran es hängt.</p></article>
  </div>
</section>
<section class="eng">
  <h2>Tipp schicken</h2>
  <form id="tippForm" novalidate>
    <div class="feld">
      <label class="lbl" for="tVorname">Dein Vorname</label>
      <input id="tVorname" type="text" autocomplete="given-name" required>
    </div>
    <div class="feld">
      <label class="lbl" for="tEmail">E-Mail</label>
      <input id="tEmail" type="email" autocomplete="email" inputmode="email" required>
    </div>
    <div class="feld">
      <label class="lbl" for="tTelefon">Telefon <span class="opt">(optional)</span></label>
      <input id="tTelefon" type="tel" autocomplete="tel" inputmode="tel">
    </div>
    <div class="feld-paar plz">
      <div class="feld">
        <label class="lbl" for="tPlz">PLZ des Objekts</label>
        <input id="tPlz" type="text" inputmode="numeric" maxlength="5">
      </div>
      <div class="feld">
        <label class="lbl" for="tOrt">Ort</label>
        <input id="tOrt" type="text" value="Köln">
      </div>
    </div>
    <p class="lbl">Was für ein Objekt?</p>
    <div class="kacheln zwei" role="radiogroup" aria-label="Objektart des Tipps">
      <label class="kachel"><input type="radio" name="tippArt" value="etw"><strong>Wohnung</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="efh"><strong>Haus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="mfh"><strong>Mehrfamilienhaus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="grundstueck"><strong>Grundstück</strong></label>
    </div>
    <div class="feld" style="margin-top:14px">
      <label class="lbl" for="tText">Was weißt du? <span class="opt">(optional)</span></label>
      <textarea id="tText" placeholder="Zum Beispiel: Mehrfamilienhaus in Nippes, etwa 8 Wohnungen, Eigentümer möchte im nächsten halben Jahr verkaufen."></textarea>
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
    <button type="submit" class="btn btn-tuerkis btn-block" id="tippSenden">Tipp senden</button>
    <p class="form-fehler" id="tippFehler" role="status"></p>
  </form>
</section>
`;

const impressum = `
<header class="hero eng">
  <p class="marke">Impressum</p>
  <h1>Impressum</h1>
  <p class="lead">Angaben nach § 5 DDG für immocousins.de. Felder, die noch fehlen, sind markiert und müssen vor dem Livegang des Verkäufer-Bereichs ergänzt werden.</p>
</header>
<section class="eng">
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
</section>
`;

const seiten = [
  {
    pfad: '/immobilie-verkaufen-koeln/',
    titel: 'Immobilie verkaufen in Köln | immo.cousins',
    description: 'Navid und Nikan kaufen deine Immobilie in Köln oder im Rhein-Erft-Kreis an, Kaufangebot in 48 Stunden, oder verkaufen sie als Makler. Grobe Preisspanne aus BORIS.NRW.',
    main: hub,
    faq: faqHub,
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
  },
  {
    pfad: '/erbimmobilie-verkaufen-koeln/',
    titel: 'Erbimmobilie verkaufen in Köln | immo.cousins',
    description: 'Geerbte Immobilie in Köln verkaufen, auch aus einer Erbengemeinschaft. Diskret, ohne vorherige Entrümpelung, Kaufangebot in 48 Stunden oder Verkauf über uns als Makler.',
    main: erb,
    faq: faqErb,
  },
  {
    pfad: '/wohnung-verkaufen-koeln/',
    titel: 'Wohnung verkaufen in Köln | immo.cousins',
    description: 'Eigentumswohnung in Köln verkaufen. Grobe Preisspanne auf Basis des Immobilienrichtwerts, danach Direktankauf oder Maklerverkauf durch immo.cousins.',
    main: wohnung,
    faq: faqWohnung,
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
