/**
 * Freigegebene Texte, Stand 20.10.2026.
 * Platzhalter in eckigen Klammern bleiben stehen.
 */
import {
  ANGEBOT_48,
  ANGEBOT_VERBINDLICH,
  COURTAGE,
  DISCLAIMER,
  FOTO_NAVID_NIKAN,
  STUNDEN_48,
  TIPP_PRAEMIE,
  TIPP_REGELN_OFFEN,
  UNTERLAGEN,
  UNTERLAGEN_VERSAND,
  VARIANTE_B,
  VIDEO_URL,
} from '../lib/texte.js';

const TEL = '0157 85568680';
const TEL_HREF = 'tel:+4915785568680';
const WA = 'https://wa.me/4915785568680';
const MAIL = 'anfrage@immocousins.de';
const CAL = 'https://calendly.com/nikan-heimkauf/45min';
const IG = 'https://instagram.com/immo.cousins';

const VERSAND_HTML = `Was fehlt, fordern wir nach. Am einfachsten lädst du die Unterlagen direkt im Funnel hoch. Alternativ per Mail an <a href="mailto:${MAIL}">${MAIL}</a> oder per WhatsApp an <a href="${WA}">${TEL}</a>.`;
const VERBINDLICH_HTML = `${ANGEBOT_VERBINDLICH} ${STUNDEN_48}`;
const COURTAGE_SATZ = `Provision: ${COURTAGE}.`;

function faq(eintraege) {
  return '<div class="faq">' + eintraege.map(([frage, antwort, id]) =>
    `<details data-frage="${id}"><summary>${frage}</summary><p>${antwort}</p></details>`
  ).join('') + '</div>';
}

function brot() {
  return '<p class="brot"><a href="/immobilie-verkaufen-koeln/">Immobilie verkaufen</a></p>';
}

function kontakt(seite) {
  return `<p class="kontaktzeile">Telefon <a href="${TEL_HREF}" data-track="contact_click" data-kanal="telefon">${TEL}</a> · <a href="${WA}" data-track="contact_click" data-kanal="whatsapp">WhatsApp</a> · <a href="${IG}" data-track="contact_click" data-kanal="instagram">Instagram @immo.cousins</a> · <a href="${CAL}" data-track="contact_click" data-kanal="calendly">Termin</a></p>`;
}

function cta(href, label, ctaName) {
  return `<p><a class="btn btn-primary" href="${href}" data-track="cta_click" data-cta="${ctaName}">${label}</a></p>`;
}

function micro(text) {
  return `<p class="micro">${text}</p>`;
}

function zweiWege(href, label, ctaName) {
  return `<h2>Direktankauf oder Maklerverkauf</h2>
  <div class="karten zwei">
    <article class="karte"><h3>Direktankauf</h3><p>Die Heimkauf CGN GmbH kauft selbst. Keine Provision für dich, ${ANGEBOT_48}. ${ANGEBOT_VERBINDLICH} ${STUNDEN_48}</p></article>
    <article class="karte"><h3>Maklerverkauf</h3><p>Wir vermarkten mit Erlaubnis nach § 34c GewO. ${COURTAGE_SATZ}</p></article>
  </div>
  <p class="micro">Wir sind beides, Käufer und Makler. Wir sagen dir immer klar, in welcher Rolle wir gerade sprechen. Kaufen wir selbst, zahlst du keine Provision.</p>
  ${cta(href, label, ctaName)}`;
}

function mehr(links) {
  const liste = links.map(([href, text]) => `<a href="${href}">${text}</a>`).join(' · ');
  return `<p class="mehr">Weiterlesen: ${liste}</p>`;
}

const HUB_LINKS = [
  ['/mehrfamilienhaus-verkaufen-koeln/', 'Mehrfamilienhaus verkaufen'],
  ['/mehrfamilienhaus-bewerten-koeln/', 'Mehrfamilienhaus bewerten'],
  ['/wohnung-verkaufen-koeln/', 'Wohnung verkaufen'],
  ['/geerbte-immobilie-verkaufen-koeln/', 'Geerbte Immobilie'],
  ['/immobilie-mit-sanierungsstau-verkaufen/', 'Sanierungsstau'],
  ['/vermietete-immobilie-verkaufen-koeln/', 'Vermietete Immobilie'],
  ['/bodenrichtwert-koeln/', 'Bodenrichtwert'],
  ['/ueber-uns/', 'Über uns'],
  ['/tippgeber/', 'Tippgeber'],
];

const ORTE = [
  ['/immobilie-verkaufen-koeln-ehrenfeld/', 'Köln-Ehrenfeld'],
  ['/immobilie-verkaufen-koeln-nippes/', 'Köln-Nippes'],
  ['/immobilie-verkaufen-koeln-suelz/', 'Köln-Sülz'],
  ['/immobilie-verkaufen-koeln-kalk/', 'Köln-Kalk'],
  ['/immobilie-verkaufen-koeln-porz/', 'Köln-Porz'],
  ['/immobilie-verkaufen-koeln-muelheim/', 'Köln-Mülheim'],
  ['/immobilie-verkaufen-huerth/', 'Hürth'],
  ['/immobilie-verkaufen-frechen/', 'Frechen'],
  ['/immobilie-verkaufen-bruehl/', 'Brühl'],
  ['/immobilie-verkaufen-pulheim/', 'Pulheim'],
  ['/immobilie-verkaufen-kerpen/', 'Kerpen'],
];

function stadtteile() {
  return '<p>Wert in deinem Stadtteil: ' + ORTE.map(([href, name]) => `<a href="${href}">${name}</a>`).join(' · ') + '</p>';
}

const faqHub = [
  ['Kostet die Bewertung etwas?', 'Nein. Die Wertspanne ist kostenlos und du musst dich dafür nicht anmelden.', 'kosten'],
  ['Wie genau ist das Ergebnis?', 'Es ist eine Modellrechnung auf Basis amtlicher Durchschnittswerte. Sie ersetzt kein Gutachten und keine Wertermittlung nach § 194 BauGB. Für ein konkretes Kaufangebot brauchen wir deine Angaben und Unterlagen. Die 48 Stunden laufen ab Eingang deiner Angaben und Unterlagen. Die Besichtigung bestätigt das Angebot nur.', 'genau'],
  ['Muss ich meine Telefonnummer angeben?', 'Nein. Die E-Mail reicht für die ausführliche Auswertung. Anrufen tun wir nur, wenn du das ausdrücklich ankreuzt.', 'telefon'],
  ['Was ist der Unterschied zwischen Direktankauf und Maklerverkauf?', 'Beim Direktankauf kauft die Heimkauf CGN GmbH selbst, du zahlst keine Provision. Beim Maklerverkauf suchen wir einen Käufer für dich. Dafür fällt eine Provision an: in der Regel 3 % zzgl. MwSt. je Seite (Käufer und Verkäufer), je nach Objekt individuell vereinbar.', 'unterschied'],
  ['Wie schnell bekomme ich ein Kaufangebot?', 'Beim Direktankauf innerhalb von 48 Stunden. Die 48 Stunden laufen ab Eingang deiner Angaben und Unterlagen. Die Besichtigung bestätigt das Angebot nur.', 'schnell'],
  ['Welche Unterlagen braucht ihr für das Kaufangebot?', `${UNTERLAGEN} ${UNTERLAGEN_VERSAND}`, 'unterlagen'],
  ['Wie verbindlich ist das Angebot nach 48 Stunden?', VERBINDLICH_HTML, 'verbindlich'],
  ['In welcher Region seid ihr aktiv?', 'Köln und Rhein-Erft-Kreis.', 'region'],
  ['Was passiert mit meinen Daten?', 'Wir nutzen sie nur für deine Anfrage. Details stehen in der <a href="/datenschutz/">Datenschutzerklärung</a>.', 'daten'],
];

const hub = `
<!-- track: page_view {page:"hub"} -->
<header class="hero">
  <div class="hero-grid">
    <img class="duo" src="/immo-cousins-hero.webp" width="168" height="168" alt="Navid und Nikan, immo.cousins aus Köln">
    <div>
      <p class="marke">immo.cousins · Köln</p>
      <h1>Immobilie in Köln verkaufen: erst den Wert sehen, dann entscheiden</h1>
      <p class="lead">Gib deine Adresse ein und sieh in wenigen Klicks eine Wertspanne für deine Immobilie, berechnet mit amtlichen Daten von BORIS.NRW und dem Gutachterausschuss. Ohne Anmeldung. Danach entscheidest du: Wir kaufen selbst und du bekommst innerhalb von 48 Stunden ab Eingang deiner Angaben und Unterlagen ein Kaufangebot. Oder wir verkaufen für dich als Makler.</p>
      <form class="hero-adresse" action="/hausbewertung-koeln/" method="get">
        <label class="lbl" for="hubAdresse">Wo steht deine Immobilie?</label>
        <input id="hubAdresse" name="adresse" type="text" placeholder="Straße, Hausnummer, PLZ" autocomplete="street-address">
        <button class="btn btn-primary" type="submit" data-track="cta_click" data-cta="wert_berechnen">Wert jetzt berechnen</button>
      </form>
      ${micro('Kostenlos · ohne Anmeldung · Telefonnummer freiwillig')}
    </div>
  </div>
</header>
<section>
  <h2>Zwei Wege, eine Bewertung</h2>
  <div class="karten zwei">
    <article class="karte"><h3>Wir kaufen selbst (Direktankauf).</h3><p>Die Heimkauf CGN GmbH kauft deine Immobilie direkt. Du zahlst keine Maklerprovision. Du bekommst innerhalb von 48 Stunden ab Eingang deiner Angaben und Unterlagen ein Kaufangebot, Navid gibt es persönlich ab.</p></article>
    <article class="karte"><h3>Wir verkaufen für dich (Maklerverkauf).</h3><p>Du willst den Markt testen? Dann übernehmen wir den Verkauf als Makler mit Erlaubnis nach § 34c GewO.</p></article>
  </div>
  ${cta('/hausbewertung-koeln/', 'Wert berechnen und Weg wählen', 'wert_berechnen')}
</section>
<section>
  <h2>Woher unsere Zahlen kommen</h2>
  <p>Wir rechnen nicht mit Fantasiewerten, sondern mit offiziellen Daten: Bodenrichtwerte und Immobilienrichtwerte von BORIS.NRW, Liegenschaftszinsen und Marktkennzahlen der Gutachterausschüsse Köln und Rhein-Erft-Kreis, Grundstücksmarktbericht Köln 2026. Für Mehrfamilienhäuser rechnen wir zusätzlich das vereinfachte Ertragswertverfahren nach ImmoWertV.</p>
  ${micro('Ergebnis ist eine Orientierung, keine Wertermittlung nach § 194 BauGB.')}
</section>
<section>
  <h2>Was willst du verkaufen?</h2>
  <div class="karten drei">
    <article class="karte"><h3><a href="/mehrfamilienhaus-verkaufen-koeln/" data-track="cta_click" data-cta="kachel" data-ziel="mfh">Mehrfamilienhaus / Wohn- und Geschäftshaus</a></h3><p>Wert, den die Miete trägt.</p></article>
    <article class="karte"><h3><a href="/wohnung-verkaufen-koeln/" data-track="cta_click" data-cta="kachel" data-ziel="wohnung">Wohnung</a></h3><p>Mit dem Immobilienrichtwert deiner Zone.</p></article>
    <article class="karte"><h3><a href="/geerbte-immobilie-verkaufen-koeln/" data-track="cta_click" data-cta="kachel" data-ziel="erbe">Geerbte Immobilie</a></h3><p>Erst die Spanne, dann in Ruhe entscheiden.</p></article>
    <article class="karte"><h3><a href="/immobilie-mit-sanierungsstau-verkaufen/" data-track="cta_click" data-cta="kachel" data-ziel="sanierungsstau">Immobilie mit Sanierungsstau</a></h3><p>Ohne vorher zu renovieren.</p></article>
    <article class="karte"><h3><a href="/vermietete-immobilie-verkaufen-koeln/" data-track="cta_click" data-cta="kachel" data-ziel="vermietet">Vermietete Immobilie</a></h3><p>Deine Mieter bleiben.</p></article>
    <article class="karte"><h3><a href="/mehrfamilienhaus-bewerten-koeln/" data-track="cta_click" data-cta="kachel" data-ziel="mfh-bewertung">Mehrfamilienhaus bewerten (Ertragswert)</a></h3><p>Faktor und vereinfachtes Ertragswertverfahren.</p></article>
    <article class="karte"><h3><a href="/bodenrichtwert-koeln/" data-track="cta_click" data-cta="kachel" data-ziel="bodenrichtwert">Bodenrichtwert für deine Adresse</a></h3><p>Was der Bodenwert sagt und was nicht.</p></article>
  </div>
  ${stadtteile()}
</section>
<section>
  <h2>So läuft es ab</h2>
  <div class="karten zwei">
    <article class="karte"><span class="nr">1</span><h3>Wert berechnen</h3><p>Adresse und ein paar Eckdaten, die Spanne siehst du sofort.</p></article>
    <article class="karte"><span class="nr">2</span><h3>Weg wählen</h3><p>Direktankauf oder Maklerverkauf.</p></article>
    <article class="karte"><span class="nr">3</span><h3>Persönlich sprechen</h3><p>Navid oder Nikan melden sich bei dir, je nachdem, wer gerade Zeit hat. Kein Callcenter.</p></article>
    <article class="karte"><span class="nr">4</span><h3>Angebot oder Vermarktung</h3><p>Beim Direktankauf bekommst du innerhalb von 48 Stunden ab Eingang deiner Angaben und Unterlagen ein Kaufangebot. Die Besichtigung bestätigt das Angebot nur.</p></article>
  </div>
</section>
<section>
  <h2>Wer wir sind</h2>
  <p>Wir sind Navid und Nikan, die immo.cousins. Hinter uns steht die Heimkauf CGN GmbH: Wir kaufen selbst Immobilien in Köln und Umgebung und vermitteln als Makler. Du sprichst immer direkt mit einem von uns beiden.</p>
  ${kontakt('hub')}
  <p><a href="${TEL_HREF}" data-track="contact_click" data-kanal="telefon">Lieber direkt anrufen: ${TEL}</a> · <a href="${WA}" data-track="contact_click" data-kanal="whatsapp">WhatsApp schreiben</a></p>
</section>
<section>
  <h2>Häufige Fragen</h2>
  ${faq(faqHub)}
</section>
`;

const faqMfh = [
  ['Welche Mehrfamilienhäuser kauft ihr?', 'Mehrfamilienhäuser und Wohn- und Geschäftshäuser in Köln und im Rhein-Erft-Kreis, auch mit Sanierungsbedarf oder Leerstand.', 'welche'],
  ['Warum fragt ihr nach der Jahresnettokaltmiete?', 'Sie ist die wichtigste Größe für den Ertragswert. Nimm die aktuelle Ist-Miete ohne Nebenkosten.', 'miete'],
  ['Ich kenne die Grundstücksfläche nicht. Geht es trotzdem?', 'Ja. Dann rechnen wir nur mit der Faktor-Methode, die Spanne wird etwas breiter.', 'flaeche'],
  ['Gibt es für Mehrfamilienhäuser keine Immobilienrichtwerte?', 'Nein, für MFH in Köln und Rhein-Erft veröffentlicht BORIS.NRW keine. Deshalb rechnen wir über Miete und Ertragswert.', 'irw'],
  ['Wie verbindlich ist das Kaufangebot nach 48 Stunden?', VERBINDLICH_HTML, 'verbindlich'],
  ['Ist das ein Gutachten?', 'Nein. Es ist eine unverbindliche Modellrechnung, keine Wertermittlung nach § 194 BauGB.', 'gutachten'],
  ['Bleibt der Verkauf diskret?', 'Ja. Beim Direktankauf gibt es keine öffentliche Anzeige und keine Besichtigungstouristen.', 'diskret'],
  ['Was passiert mit meinen Mietern?', 'Bestehende Mietverträge gehen beim Verkauf auf den Käufer über (§ 566 BGB). Deine Mieter müssen nicht ausziehen.', 'mieter'],
];

const mfh = `
<!-- track: page_view {page:"mfh"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Mehrfamilienhaus · Köln</p>
  <h1>Mehrfamilienhaus in Köln verkaufen, zum Wert, den die Miete trägt</h1>
  <p class="lead">Ein Mehrfamilienhaus ist so viel wert, wie seine Mieten hergeben. Deshalb rechnen wir mit deiner Ist-Miete, den amtlichen Kölner Liegenschaftszinsen und dem Bodenrichtwert deiner Adresse. Das Ergebnis siehst du sofort. Wenn du willst, kaufen wir selbst und machen dir innerhalb von 48 Stunden ab Eingang deiner Angaben und Unterlagen ein Angebot.</p>
  ${cta('/hausbewertung-koeln/?art=mfh', 'Mehrfamilienhaus bewerten', 'mfh_bewerten')}
  ${micro('Du brauchst: Adresse, Anzahl Einheiten, Wohnfläche, Jahresnettokaltmiete. Grundstücksfläche optional.')}
</header>
<section class="eng">
  <h2>So rechnen wir dein MFH</h2>
  <ul>
    <li><strong>Faktor-Methode:</strong> Jahresnettokaltmiete × Rohertragsfaktor. In Köln liegt der amtliche Faktor für Mietwohnhäuser bei 21, die Spanne reicht von 15 bis 29 (Grundstücksmarktbericht Köln 2026).</li>
    <li><strong>Ertragswert (vereinfacht nach ImmoWertV):</strong> Reinertrag, Liegenschaftszins (Köln Mehrfamilienhäuser: 2,9 %), Restnutzungsdauer und Bodenwert aus dem Bodenrichtwert deiner Adresse.</li>
    <li><strong>Plausibilität:</strong> Wir gleichen mit dem durchschnittlichen Kaufpreis pro m² Wohnfläche ab (Köln: 2.978 €/m², Gutachterausschuss).</li>
  </ul>
  ${micro('Kennzahlen Köln, Berichtsjahr 2025 / Grundstücksmarktbericht 2026. Für den Rhein-Erft-Kreis nutzt das Tool die dortigen Werte.')}
</section>
<section class="eng">
  <h2>Auch mit Sanierungsstau, Leerstand oder schwierigen Mietverhältnissen</h2>
  <p>Wir kaufen Häuser, die andere Käufer abschrecken: alte Heizung, Leerstand, Mieten unter Markt, Erbengemeinschaft. Du musst vorher nichts renovieren. Wir bewerten das Haus so, wie es ist: mit deinen Angaben und Unterlagen, die Besichtigung bestätigt unser Angebot nur.</p>
  ${cta('/hausbewertung-koeln/?art=mfh', 'Haus bewerten, auch im jetzigen Zustand', 'mfh_bewerten')}
</section>
<section class="eng">
  <h2>Direktankauf oder Maklerverkauf</h2>
  <div class="karten zwei">
    <article class="karte"><h3>Direktankauf</h3><p>Die Heimkauf CGN GmbH kauft selbst. Keine Provision für dich, ${ANGEBOT_48}, keine Besichtigungstouren mit Fremden.</p></article>
    <article class="karte"><h3>Maklerverkauf</h3><p>Wir vermarkten dein Haus mit Erlaubnis nach § 34c GewO. ${COURTAGE_SATZ}</p></article>
  </div>
  ${micro('Wir sind beides, Käufer und Makler. Wir sagen dir immer klar, in welcher Rolle wir gerade sprechen. Kaufen wir selbst, zahlst du keine Provision.')}
  ${mehr([['/mehrfamilienhaus-bewerten-koeln/', 'Mehrfamilienhaus bewerten'], ['/vermietete-immobilie-verkaufen-koeln/', 'Vermietete Immobilie verkaufen']])}
</section>
<section class="eng">
  <h2>Häufige Fragen zum MFH-Verkauf</h2>
  ${faq(faqMfh)}
</section>
`;

const faqWohnung = [
  ['Brauche ich die Zustimmung des Verwalters?', 'Das steht in deiner Teilungserklärung. Manche Teilungserklärungen verlangen eine Zustimmung des Verwalters oder der Eigentümer zum Verkauf (§ 12 WEG). Schau dort nach oder frag deinen Verwalter.', 'verwalter'],
  ['Muss ich Steuern auf den Gewinn zahlen?', 'Allgemein gilt: Verkaufst du eine Immobilie innerhalb von zehn Jahren nach dem Kauf, kann der Gewinn steuerpflichtig sein (§ 23 EStG). Ausnahmen gibt es, wenn du selbst darin gewohnt hast. Ob das für dich gilt, klärt dein Steuerberater.', 'steuer'],
  ['Wie genau ist der Richtwert?', 'Er ist ein amtlicher Durchschnittswert für eine typische Wohnung in der Zone. Deine Wohnung kann darüber oder darunter liegen.', 'genau'],
  ['Wie verbindlich ist euer Kaufangebot?', VERBINDLICH_HTML, 'verbindlich'],
];

const wohnung = `
<!-- track: page_view {page:"wohnung"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Wohnung · Köln</p>
  <h1>Wohnung in Köln verkaufen: erst den Wert sehen, dann entscheiden</h1>
  <p class="lead">Für Eigentumswohnungen veröffentlicht der Gutachterausschuss Köln amtliche Immobilienrichtwerte. Das sind Werte in Euro pro m² Wohnfläche für eine typische Wohnung in deiner Lage. Unser Tool nimmt den Richtwert deiner Zone und passt ihn an deine Wohnung an. So siehst du in wenigen Klicks, wo du ungefähr liegst.</p>
  ${cta('/hausbewertung-koeln/?art=etw', 'Wohnung bewerten', 'wohnung_bewerten')}
  ${micro('Du brauchst: Adresse, Wohnfläche, Etage, Baujahr des Hauses. Kostenlos, ohne Anmeldung.')}
</header>
<section class="eng">
  <h2>So rechnen wir den Wert deiner Wohnung</h2>
  <ul>
    <li><strong>Immobilienrichtwert deiner Zone:</strong> In Köln gibt es 59 Richtwertzonen für Eigentumswohnungen (Stichtag 01.01.2026). Die Werte reichen von 2.270 €/m² (Urbach Süd) bis 10.400 €/m² (Rheinauhafen).</li>
    <li><strong>Normobjekt:</strong> Jeder Richtwert gilt für eine typische Wohnung. In den meisten Kölner Zonen ist das eine Wohnung mit 60 m² im 2. Obergeschoss, Weiterverkauf (kein Neubau). Das Baujahr unterscheidet sich je nach Zone (z. B. 1955, 1975 oder 1995).</li>
    <li><strong>Anpassung an deine Wohnung:</strong> Weicht deine Wohnung ab (Größe, Baujahr, Etage, Modernisierung), rechnen wir mit den Umrechnungskoeffizienten des Gutachterausschusses um.</li>
    <li><strong>Beispiele (Normobjekt Baujahr 1955, 60 m²):</strong> Rathenau-Viertel 5.010 €/m², Belgisches Viertel 5.550 €/m², Kalk 3.060 €/m², Humboldt/Gremberg 3.010 €/m².</li>
    <li><strong>Rhein-Erft-Kreis:</strong> Auch hier gibt es Richtwerte für Eigentumswohnungen. In Hürth, Frechen, Brühl, Pulheim und Kerpen liegen sie zwischen 2.000 und 4.100 €/m² (Normobjekte 65 oder 90 m², Baujahr 1974 bis 2007).</li>
  </ul>
  <p class="quelle">Immobilienrichtwerte der Gutachterausschüsse für Grundstückswerte in der Stadt Köln und im Rhein-Erft-Kreis, Stichtag 01.01.2026, BORIS.NRW (Datenlizenz Deutschland – Zero – Version 2.0).</p>
  ${micro('Richtwerte sind Durchschnittswerte für eine typische Wohnung, keine Wertermittlung nach § 194 BauGB.')}
</section>
<section class="eng">
  <h2>Selbst bewohnt, vermietet oder leer?</h2>
  <p>Das fragen wir im Tool ab, weil es für Käufer einen Unterschied macht. Ist deine Wohnung vermietet, bleibt der Mietvertrag beim Verkauf bestehen. Mehr dazu: <a href="/vermietete-immobilie-verkaufen-koeln/">vermietete Immobilie verkaufen</a>.</p>
</section>
<section class="eng">
  <h2>Welche Unterlagen beim Wohnungsverkauf üblich sind</h2>
  <p>Käufer und Notar fragen beim Verkauf einer Eigentumswohnung in der Regel nach: Grundbuchauszug, Teilungserklärung mit Aufteilungsplan, Protokollen der letzten Eigentümerversammlungen, Wirtschaftsplan und Hausgeldabrechnung, Energieausweis und, falls vermietet, dem Mietvertrag. Für unser 48-h-Angebot brauchen wir: ${UNTERLAGEN} ${VERSAND_HTML}</p>
</section>
<section class="eng">
  <h2>Direktankauf oder Maklerverkauf</h2>
  <div class="karten zwei">
    <article class="karte"><h3>Direktankauf</h3><p>Die Heimkauf CGN GmbH kauft selbst, ohne Provision für dich. ${ANGEBOT_48}.</p></article>
    <article class="karte"><h3>Maklerverkauf</h3><p>Mit Erlaubnis nach § 34c GewO. ${COURTAGE_SATZ}</p></article>
  </div>
  ${cta('/hausbewertung-koeln/?art=etw', 'Wohnung bewerten und Weg wählen', 'wohnung_bewerten')}
</section>
<section class="eng">
  <h2>Häufige Fragen zum Wohnungsverkauf</h2>
  ${faq(faqWohnung)}
  ${micro('Keine Steuer-/Rechtsberatung. Die Angaben sind allgemein und ersetzen keine Beratung durch Steuerberater, Notar oder Anwalt.')}
</section>
`;

const faqErbe = [
  ['Kann ich die Bewertung allein starten?', 'Ja. Die Wertspanne ist unverbindlich. Für den Verkauf selbst braucht es später alle Erben.', 'allein'],
  ['Müssen wir vorher ausräumen oder renovieren?', 'Renovieren musst du nicht, wir bewerten die Immobilie so, wie sie ist. Ob und wie wir beim Ausräumen helfen, besprechen wir im Einzelfall.', 'ausraeumen'],
  ['Wir sind uns noch nicht einig. Lohnt sich eine Anfrage trotzdem?', 'Ja. Die Spanne hilft euch, eine gemeinsame Grundlage zu haben. Verkaufen müsst ihr deshalb nicht.', 'uneinig'],
  ['Ist das Ergebnis ein Gutachten für das Finanzamt?', 'Nein. Es ist eine unverbindliche Modellrechnung, keine Wertermittlung nach § 194 BauGB.', 'gutachten'],
  ['Wie verbindlich ist euer Kaufangebot?', VERBINDLICH_HTML, 'verbindlich'],
];

const erbe = `
<!-- track: page_view {page:"erbe"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Erbe · Köln</p>
  <h1>Immobilie geerbt? Erst Klarheit über den Wert, dann in Ruhe entscheiden</h1>
  <p class="lead">Eine geerbte Immobilie bringt viele Fragen mit: Was ist sie wert? Wollen alle Erben verkaufen? Was muss vorher geklärt werden? Mit unserem Tool siehst du zuerst eine Wertspanne auf Basis amtlicher Daten. Die kannst du mit deinen Miterben teilen. Danach entscheidet ihr gemeinsam, ob ihr verkaufen wollt und wie.</p>
  ${cta('/hausbewertung-koeln/?anlass=erbe', 'Geerbte Immobilie bewerten', 'erbe_bewerten')}
  ${micro('Kostenlos, ohne Anmeldung. Im Tool kannst du „Ich habe geerbt“ auswählen.')}
</header>
<section class="eng">
  <h2>Erbengemeinschaft: Verkaufen geht nur gemeinsam</h2>
  <p>Erben mehrere Personen, gehört ihnen die Immobilie gemeinsam. Über den Verkauf können sie grundsätzlich nur gemeinsam entscheiden (§ 2040 BGB). Können sich die Erben nicht einigen, bleibt als letzter Weg die Teilungsversteigerung (§ 180 ZVG). Eine Wertspanne, die alle sehen können, hilft oft, eine gemeinsame Grundlage zu finden.</p>
  <h2>Grundbuch und Erbnachweis</h2>
  <p>Bevor verkauft wird, müssen die Erben in der Regel im Grundbuch eingetragen werden. Dafür braucht das Grundbuchamt einen Erbnachweis, meist einen Erbschein oder ein notarielles Testament mit Eröffnungsniederschrift (§ 35 GBO). Stellt ihr den Antrag innerhalb von zwei Jahren nach dem Erbfall, ist die Eintragung der Erben gebührenfrei.</p>
  <h2>Steuern: allgemein gut zu wissen</h2>
  <ul>
    <li><strong>Spekulationsfrist:</strong> Beim Erben läuft die Zehn-Jahres-Frist des Verstorbenen weiter. Entscheidend ist, wann er die Immobilie gekauft hat (§ 23 EStG).</li>
    <li><strong>Erbschaftsteuer:</strong> Sie ist eine eigene Steuer und hängt von Wert, Verwandtschaftsgrad und Freibeträgen ab.</li>
  </ul>
  ${micro('Keine Steuer-/Rechtsberatung. Bitte klär deine konkrete Situation mit Steuerberater, Notar oder Anwalt.')}
</section>
<section class="eng">
  <h2>Wie wir helfen</h2>
  <ul>
    <li><strong>Direktankauf:</strong> Die Heimkauf CGN GmbH kauft selbst, auch Immobilien mit Sanierungsbedarf. Ohne Provision, ohne öffentliche Anzeige. Kaufangebot innerhalb von 48 Stunden ab Eingang eurer Angaben und Unterlagen.</li>
    <li><strong>Maklerverkauf:</strong> Mit Erlaubnis nach § 34c GewO. ${COURTAGE_SATZ}</li>
    <li><strong>Persönlich:</strong> Navid oder Nikan sprechen persönlich mit dir.</li>
  </ul>
  ${cta('/hausbewertung-koeln/?anlass=erbe', 'Wert berechnen und mit Miterben teilen', 'erbe_bewerten')}
  ${mehr([['/immobilie-mit-sanierungsstau-verkaufen/', 'Haus mit Sanierungsstau'], ['/bodenrichtwert-koeln/', 'Bodenrichtwert Köln']])}
</section>
<section class="eng">
  <h2>Häufige Fragen zum Erbe</h2>
  ${faq(faqErbe)}
  ${micro('Keine Steuer-/Rechtsberatung.')}
</section>
`;

const faqSanierung = [
  ['Muss ich vor dem Verkauf renovieren?', 'Nein. Beim Direktankauf bewerten wir das Haus im jetzigen Zustand.', 'renovieren'],
  ['Muss ich Mängel angeben?', 'Ja, bekannte Mängel solltest du offen nennen. Ehrliche Angaben sind auch die Grundlage für unser verbindliches Angebot.', 'maengel'],
  ['Kauft ihr auch Mehrfamilienhäuser mit Leerstand?', 'Ja. Mehr dazu auf der Seite <a href="/mehrfamilienhaus-verkaufen-koeln/">Mehrfamilienhaus verkaufen</a>.', 'leerstand'],
  ['Wie verbindlich ist euer Kaufangebot?', VERBINDLICH_HTML, 'verbindlich'],
  ['Ist das Ergebnis ein Gutachten?', 'Nein. Es ist eine unverbindliche Modellrechnung, keine Wertermittlung nach § 194 BauGB.', 'gutachten'],
];

const sanierung = `
<!-- track: page_view {page:"sanierungsstau"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Sanierungsstau</p>
  <h1>Haus mit Sanierungsstau verkaufen, ohne vorher zu renovieren</h1>
  <p class="lead">Alte Heizung, undichtes Dach, Leitungen aus den Sechzigern: Viele Eigentümer glauben, sie müssten vor dem Verkauf erst sanieren. Musst du nicht. Wir kaufen als Heimkauf CGN GmbH auch Häuser, die Arbeit brauchen. In unserem Tool gibst du den Zustand ehrlich an und siehst trotzdem sofort eine Wertspanne.</p>
  ${cta('/hausbewertung-koeln/?zustand=sanierung', 'Haus im jetzigen Zustand bewerten', 'bewerten')}
  ${micro('Kostenlos, ohne Anmeldung. Zustand „Sanierungsstau“ ist im Tool eine ganz normale Auswahl.')}
</header>
<section class="eng">
  <h2>Wie der Zustand in die Rechnung eingeht</h2>
  <p>Im Tool fragen wir ab, was in den letzten 20 Jahren modernisiert wurde (Dach, Fenster, Heizung, Leitungen, Bäder) und wie du den Zustand einschätzt. Das beeinflusst vor allem die Restnutzungsdauer des Gebäudes, also wie lange es noch wirtschaftlich genutzt werden kann. Bei Mehrfamilienhäusern wirkt sich das direkt auf den Ertragswert aus. Zum Vergleich: In der Auswertung des Gutachterausschusses Köln für Mehrfamilienhäuser liegt die Restnutzungsdauer im Durchschnitt bei 36 Jahren (Gesamtnutzungsdauer 80 Jahre).</p>
  <h2>Was Käufer nach dem Kauf erledigen müssen</h2>
  <p>Nach einem Eigentümerwechsel hat der neue Eigentümer nach dem Gebäudeenergiegesetz (GEG) bestimmte Nachrüstpflichten, zum Beispiel bei sehr alten Heizkesseln, ungedämmten Heizungsrohren oder der obersten Geschossdecke. Dafür gelten Fristen. Diese Kosten rechnen Käufer ein. Beim Direktankauf planen wir das selbst ein, du musst vorher nichts davon erledigen.</p>
  <p>Unabhängig davon brauchst du beim Verkauf grundsätzlich einen Energieausweis (GEG).</p>
  ${micro('Keine Steuer-/Rechtsberatung. Welche Pflichten genau gelten, hängt vom Gebäude ab.')}
</section>
<section class="eng">
  <h2>Direktankauf oder Maklerverkauf</h2>
  <div class="karten zwei">
    <article class="karte"><h3>Direktankauf</h3><p>Wir kaufen dein Haus so, wie es ist. Keine Provision für dich, keine Besichtigungstouren mit Fremden. ${ANGEBOT_48}, die Besichtigung bestätigt das Angebot nur.</p></article>
    <article class="karte"><h3>Maklerverkauf</h3><p>Mit Erlaubnis nach § 34c GewO. ${COURTAGE_SATZ}</p></article>
  </div>
  ${cta('/hausbewertung-koeln/?zustand=sanierung', 'Haus bewerten, auch im jetzigen Zustand', 'bewerten')}
  ${mehr([['/mehrfamilienhaus-verkaufen-koeln/', 'Mehrfamilienhaus verkaufen']])}
</section>
<section class="eng">
  <h2>Häufige Fragen zum Verkauf mit Sanierungsstau</h2>
  ${faq(faqSanierung)}
  ${micro('Keine Steuer-/Rechtsberatung.')}
</section>
`;

const faqVermietet = [
  ['Muss ich meinen Mietern kündigen, bevor ich verkaufe?', 'Nein. Der Mietvertrag läuft mit dem Käufer weiter (§ 566 BGB).', 'kuendigen'],
  ['Welche Unterlagen zu den Mietern brauche ich?', `Für unser 48-h-Angebot brauchen wir: ${UNTERLAGEN} ${UNTERLAGEN_VERSAND}`, 'unterlagen'],
  ['Wie verbindlich ist euer Kaufangebot?', VERBINDLICH_HTML, 'verbindlich'],
  ['Ist das Ergebnis ein Gutachten?', 'Nein. Es ist eine unverbindliche Modellrechnung, keine Wertermittlung nach § 194 BauGB.', 'gutachten'],
];

const vermietet = `
<!-- track: page_view {page:"vermietet"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Vermietet · Köln</p>
  <h1>Vermietete Immobilie in Köln verkaufen: Deine Mieter bleiben</h1>
  <p class="lead">Du willst verkaufen, aber deine Wohnung oder dein Haus ist vermietet? Das ist kein Hindernis. Der Mietvertrag geht beim Verkauf auf den Käufer über. Für Mehrfamilienhäuser rechnen wir den Wert direkt über deine Ist-Miete. Die Spanne siehst du sofort.</p>
  ${cta('/hausbewertung-koeln/?nutzung=vermietet', 'Vermietete Immobilie bewerten', 'bewerten')}
  ${micro('Kostenlos, ohne Anmeldung. Für Mehrfamilienhäuser brauchst du die Jahresnettokaltmiete.')}
</header>
<section class="eng">
  <h2>Kauf bricht nicht Miete</h2>
  <p>Verkaufst du eine vermietete Immobilie, tritt der Käufer in den bestehenden Mietvertrag ein (§ 566 BGB). Auch die Mietkaution geht auf ihn über (§ 566a BGB). Deine Mieter müssen nicht ausziehen und behalten ihre Rechte.</p>
  <h2>Wie die Miete den Wert bestimmt</h2>
  <ul>
    <li><strong>Mehrfamilienhaus:</strong> Wir rechnen mit deiner Ist-Miete. Der amtliche Rohertragsfaktor für Mietwohnhäuser in Köln liegt bei 21 (Spanne 15 bis 29), der Liegenschaftszins bei 2,9 % (Grundstücksmarktbericht Köln 2026). Mehr dazu: <a href="/mehrfamilienhaus-bewerten-koeln/">Mehrfamilienhaus bewerten</a>.</li>
    <li><strong>Wohnung:</strong> Wir starten beim amtlichen Immobilienrichtwert deiner Zone und fragen ab, ob die Wohnung vermietet ist. Mehr dazu: <a href="/wohnung-verkaufen-koeln/">Wohnung verkaufen</a>.</li>
    <li><strong>Mieten unter Markt oder Leerstand:</strong> Gib das im Tool an. Wir kaufen auch solche Objekte.</li>
  </ul>
  <h2>Was du beim Verkauf mit Mietern allgemein beachten solltest</h2>
  <ul>
    <li><strong>Mieter informieren:</strong> Sag deinen Mietern früh Bescheid, dass du verkaufen willst. Besichtigungen musst du rechtzeitig ankündigen.</li>
    <li><strong>Vorkaufsrecht:</strong> Wurde die Wohnung erst nach Einzug des Mieters in eine Eigentumswohnung umgewandelt, kann der Mieter beim ersten Verkauf ein Vorkaufsrecht haben (§ 577 BGB).</li>
    <li><strong>Eigenbedarf:</strong> Ob ein neuer Eigentümer später kündigen darf, hängt vom Einzelfall ab. Nach einer Umwandlung gelten Sperrfristen (§ 577a BGB).</li>
  </ul>
  ${micro('Keine Steuer-/Rechtsberatung. Das sind allgemeine Hinweise, für deinen Fall frag bitte Anwalt oder Notar.')}
</section>
<section class="eng">
  ${zweiWege('/hausbewertung-koeln/?nutzung=vermietet', 'Vermietete Immobilie bewerten', 'bewerten')}
</section>
<section class="eng">
  <h2>Häufige Fragen zum Verkauf mit Mietern</h2>
  ${faq(faqVermietet)}
  ${micro('Keine Steuer-/Rechtsberatung.')}
</section>
`;

const faqBewerten = [
  ['Warum zwei Rechenwege?', 'Der Faktor zeigt schnell, was der Markt im Durchschnitt zahlt. Der Ertragswert berücksichtigt zusätzlich Kosten, Grundstück und Restnutzungsdauer.', 'zwei'],
  ['Welche Miete soll ich angeben?', 'Die aktuelle Ist-Kaltmiete aller Einheiten pro Jahr, ohne Nebenkosten. Leer stehende Einheiten gibst du extra an.', 'miete'],
  ['Warum gibt es keinen Immobilienrichtwert für mein MFH?', 'BORIS.NRW veröffentlicht für Mehrfamilienhäuser in Köln und im Rhein-Erft-Kreis keine Immobilienrichtwerte.', 'irw'],
  ['Ist das ein Gutachten?', 'Nein. Keine Wertermittlung nach § 194 BauGB, kein Gutachten nach ImmoWertV.', 'gutachten'],
];

const mfhBewerten = `
<!-- track: page_view {page:"mfh_bewerten"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Ertragswert</p>
  <h1>Mehrfamilienhaus bewerten: Ertragswert mit amtlichen Kölner Zahlen</h1>
  <p class="lead">Für Mehrfamilienhäuser gibt es in Köln und im Rhein-Erft-Kreis keine amtlichen Immobilienrichtwerte. Ihr Wert hängt vor allem an der Miete. Deshalb rechnen wir zwei Wege: über den Rohertragsfaktor und über ein vereinfachtes Ertragswertverfahren nach ImmoWertV. Beides mit den Kennzahlen der Gutachterausschüsse.</p>
  ${cta('/hausbewertung-koeln/?art=mfh', 'Ertragswert berechnen', 'ertragswert')}
  ${micro('Du brauchst: Adresse, Anzahl Einheiten, Wohnfläche, Jahresnettokaltmiete. Grundstücksfläche optional.')}
</header>
<section class="eng">
  <h2>Weg 1: Rohertragsfaktor</h2>
  <p>Jahresnettokaltmiete × Rohertragsfaktor. Der Gutachterausschuss Köln nennt für Mietwohnhäuser einen Faktor von 21, die Spanne reicht von 15 bis 29. Für Wohn- und Geschäftshäuser mit bis zu 50 % Gewerbe liegt er bei 21 (15 bis 26). Daraus ergibt sich eine schnelle Spanne.</p>
  <h2>Weg 2: Vereinfachtes Ertragswertverfahren (§§ 27 ff. ImmoWertV)</h2>
  <ol>
    <li><strong>Rohertrag:</strong> deine Jahresnettokaltmiete</li>
    <li><strong>Reinertrag:</strong> Rohertrag minus Bewirtschaftungskosten (Köln Mehrfamilienhäuser im Durchschnitt 17,4 %)</li>
    <li><strong>Bodenwert:</strong> Bodenrichtwert deiner Adresse × Grundstücksfläche</li>
    <li><strong>Gebäudeertrag:</strong> Reinertrag minus Bodenwert × Liegenschaftszins (Köln 2,9 %)</li>
    <li><strong>Barwert:</strong> Gebäudeertrag × Barwertfaktor (aus Restnutzungsdauer und Liegenschaftszins)</li>
    <li><strong>Ertragswert:</strong> Barwert plus Bodenwert</li>
  </ol>
  <p>Ohne Grundstücksfläche rechnen wir nur Weg 1.</p>
  <h2>Die amtlichen Kennzahlen</h2>
  <div class="tabelle-wrap"><table class="tabelle">
    <thead><tr><th>Kennzahl Mehrfamilienhäuser</th><th>Köln</th><th>Rhein-Erft-Kreis</th></tr></thead>
    <tbody>
      <tr><td>Liegenschaftszins</td><td>2,9 % ± 0,9 (98 Fälle)</td><td>2,3 % ± 0,8</td></tr>
      <tr><td>Ø Miete</td><td>11,70 €/m²</td><td>7,20 €/m²</td></tr>
      <tr><td>Bewirtschaftungskosten</td><td>17,4 %</td><td>25 %</td></tr>
      <tr><td>Ø Kaufpreis je m² Wohnfläche</td><td>2.978 € ± 852</td><td>2.007 €</td></tr>
      <tr><td>Rohertragsfaktor</td><td>21 (15 bis 29)</td><td>–</td></tr>
      <tr><td>Restnutzungsdauer / Gesamtnutzungsdauer</td><td>36 / 80 Jahre</td><td>–</td></tr>
    </tbody>
  </table></div>
  <p class="quelle">Grundstücksmarktdaten NRW (Berichtsjahr 2025), Grundstücksmarktbericht Köln 2026, Gutachterausschüsse Köln und Rhein-Erft-Kreis, BORIS.NRW (Datenlizenz Deutschland – Zero – Version 2.0).</p>
  <h2>Rechenbeispiel</h2>
  <p>10 Wohnungen, 650 m² Wohnfläche, 11,70 €/m² Kaltmiete, 450 m² Grundstück, Bodenrichtwert 1.500 €/m²:</p>
  <ul>
    <li>Rohertrag: rund 91.000 € pro Jahr</li>
    <li>Weg 1 (Faktor 15 bis 29): rund 1,37 bis 2,65 Mio. €, Mitte (Faktor 21) rund 1,92 Mio. €</li>
    <li>Weg 2 (Ertragswert): rund 1,91 Mio. €</li>
  </ul>
  ${micro('Beispielrechnung mit Durchschnittswerten, kein reales Objekt.')}
  <p class="disclaimer">${DISCLAIMER}</p>
</section>
<section class="eng">
  <h2>Und dann?</h2>
  <p>Du siehst dein Ergebnis sofort. Danach kannst du ein Kaufangebot anfordern (Direktankauf durch die Heimkauf CGN GmbH, ohne Provision, innerhalb von 48 Stunden ab Eingang deiner Angaben und Unterlagen) oder den Maklerverkauf besprechen.</p>
  ${cta('/hausbewertung-koeln/?art=mfh', 'Ertragswert berechnen', 'ertragswert')}
  ${mehr([['/mehrfamilienhaus-verkaufen-koeln/', 'Mehrfamilienhaus verkaufen'], ['/vermietete-immobilie-verkaufen-koeln/', 'Vermietete Immobilie']])}
</section>
<section class="eng">
  <h2>Häufige Fragen zur MFH-Bewertung</h2>
  ${faq(faqBewerten)}
</section>
`;

const faqBoden = [
  ['Wer legt den Bodenrichtwert fest?', 'Der zuständige Gutachterausschuss für Grundstückswerte, in Köln der Gutachterausschuss der Stadt Köln, im Rhein-Erft-Kreis der des Kreises.', 'wer'],
  ['Wie aktuell sind die Werte?', 'Die Werte in unserem Tool gelten zum Stichtag 01.01.2026.', 'aktuell'],
  ['Kostet die Abfrage etwas?', 'Nein, weder bei BORIS.NRW noch bei uns.', 'kosten'],
  ['Kann ich den Bodenrichtwert mit der Grundstücksfläche multiplizieren?', 'Für eine grobe Orientierung ja. Das ergibt den Bodenwert, nicht den Wert der ganzen Immobilie.', 'multiplizieren'],
];

const boden = `
<!-- track: page_view {page:"bodenrichtwert"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Bodenrichtwert · 2026</p>
  <h1>Bodenrichtwert Köln: Was er aussagt und was nicht</h1>
  <p class="lead">Der Bodenrichtwert sagt dir, was Grund und Boden in deiner Lage ungefähr pro Quadratmeter wert ist. In Köln ermittelt ihn der Gutachterausschuss für Grundstückswerte in der Stadt Köln. Die aktuellen Werte gelten zum Stichtag 01.01.2026. In unserem Tool siehst du den Bodenrichtwert deiner Adresse direkt nach der Eingabe.</p>
  ${cta('/hausbewertung-koeln/', 'Bodenrichtwert für meine Adresse anzeigen', 'brw_anzeigen')}
  ${micro('Kostenlos, ohne Anmeldung. Danach kannst du direkt den Wert deiner Immobilie berechnen.')}
</header>
<section class="eng">
  <h2>Was ist ein Bodenrichtwert?</h2>
  <p>Der Bodenrichtwert ist ein durchschnittlicher Lagewert des Bodens in Euro pro m² Grundstücksfläche (§ 196 BauGB). Er gilt für eine Zone, in der die Grundstücke ähnliche Merkmale haben, und für ein typisches Grundstück in dieser Zone. Das Gebäude ist nicht enthalten.</p>
  <h2>Wo du ihn findest</h2>
  <ul>
    <li><strong>BORIS.NRW:</strong> Das Bodenrichtwertinformationssystem des Landes NRW zeigt alle Bodenrichtwerte kostenlos auf der Karte. Die Daten stehen unter der Datenlizenz Deutschland – Zero – Version 2.0.</li>
    <li><strong>In unserem Tool:</strong> Gib deine Adresse ein, wir zeigen dir den Wert deiner Zone und rechnen damit weiter.</li>
  </ul>
  <h2>Beispiel aus der Kölner Innenstadt</h2>
  <p>Beispiel: In der Bodenrichtwertzone 103010 (amtliche Bezeichnung „Hohenzollernring 75–85“, Köln-Altstadt/Nord, abgefragt an der Pilgrimstraße 6) liegt der Bodenrichtwert bei 2.670 €/m² (Kerngebiet, V bis VII Geschosse, GFZ 3,5, Stichtag 01.01.2026, Gutachterausschuss Köln).</p>
  <h2>Wo die Grenzen liegen</h2>
  <ul>
    <li>Der Bodenrichtwert ist <strong>kein Verkehrswert</strong> deiner Immobilie. Er sagt nichts über das Gebäude, seinen Zustand oder die Mieten.</li>
    <li>Er gilt für ein <strong>typisches Grundstück</strong> der Zone. Weicht dein Grundstück ab (Größe, Bebaubarkeit, Zuschnitt), kann der Bodenwert höher oder niedriger sein.</li>
    <li>Für Häuser und Wohnungen braucht es zusätzliche Daten. Deshalb nutzen wir außerdem Immobilienrichtwerte (Wohnungen, freistehende Häuser) und für Mehrfamilienhäuser das Ertragswertverfahren.</li>
  </ul>
  ${micro('Unsere Werte sind eine unverbindliche Orientierung, keine Wertermittlung nach § 194 BauGB.')}
  ${mehr([['/mehrfamilienhaus-bewerten-koeln/', 'Mehrfamilienhaus bewerten'], ['/wohnung-verkaufen-koeln/', 'Wohnung verkaufen'], ...ORTE.slice(0, 3)])}
  ${stadtteile()}
</section>
<section class="eng">
  <h2>Häufige Fragen zum Bodenrichtwert</h2>
  ${faq(faqBoden)}
</section>
`;

const faqUeber = [
  ['Wer ist die Heimkauf CGN GmbH?', 'Das ist unser Unternehmen. Sie kauft Immobilien selbst und vermittelt als Makler. Alle Angaben stehen im Impressum.', 'gmbh'],
  ['Seid ihr Makler oder Käufer?', 'Beides. Du entscheidest, ob wir selbst kaufen oder für dich verkaufen.', 'rolle'],
  ['Wo seid ihr aktiv?', 'In Köln und im Rhein-Erft-Kreis.', 'wo'],
];

const ueber = `
<!-- track: page_view {page:"ueber_uns"} -->
${brot()}
<header class="hero eng">
  <p class="marke">immo.cousins</p>
  <h1>Wir sind Navid und Nikan, die immo.cousins</h1>
  <p class="lead">Hinter immo.cousins stehen wir zwei: Navid und Nikan. Wir kaufen mit der Heimkauf CGN GmbH selbst Immobilien in Köln und im Rhein-Erft-Kreis. Und wir vermitteln Immobilien als Makler. Wenn du uns schreibst oder anrufst, sprichst du immer mit einem von uns beiden.</p>
  <div class="foto-platzhalter" role="img" aria-label="${FOTO_NAVID_NIKAN}">${FOTO_NAVID_NIKAN}</div>
  <p class="micro">Foto: Dreh am 29.10.2026</p>
</header>
<section class="eng">
  <h2>Was wir machen</h2>
  <ul>
    <li><strong>Ankauf:</strong> Die Heimkauf CGN GmbH kauft Immobilien selbst, auch mit Sanierungsbedarf. Du zahlst dabei keine Provision. Navid gibt die Kaufangebote persönlich ab.</li>
    <li><strong>Maklerverkauf:</strong> Die Heimkauf CGN GmbH hat die Erlaubnis nach § 34c GewO. ${COURTAGE_SATZ}</li>
    <li><strong>Für Investoren:</strong> Auf unserer <a href="/">Startseite</a> zeigen wir Immobilien als Kapitalanlage, mit eigenem <a href="/cashflowrechner/">Cashflowrechner</a>.</li>
  </ul>
  <h2>Wie wir arbeiten</h2>
  <ul>
    <li><strong>Mit amtlichen Zahlen:</strong> Unsere Bewertung nutzt Daten von BORIS.NRW und den Gutachterausschüssen.</li>
    <li><strong>Mit klaren Rollen:</strong> Wir sind Käufer und Makler. Wir sagen dir immer, in welcher Rolle wir gerade sprechen.</li>
    <li><strong>Persönlich:</strong> Dich ruft Navid oder Nikan zurück, je nachdem, wer gerade Zeit hat.</li>
  </ul>
  <h2>So erreichst du uns</h2>
  ${kontakt('ueber_uns')}
  ${cta('/hausbewertung-koeln/', 'Wert deiner Immobilie berechnen', 'wert_berechnen')}
</section>
<section class="eng">
  <h2>Häufige Fragen</h2>
  ${faq(faqUeber)}
</section>
`;

const faqTipp = [
  ['Wie viel bekomme ich genau?', 'Bis zu 5.000 €, abhängig vom Objekt. Die Höhe hängt von Art und Größe der Immobilie ab, die wir kaufen. Einen Pauschalbetrag gibt es nicht.', 'hoehe'],
  ['Wann bekomme ich die Prämie?', 'Nur wenn die Heimkauf CGN GmbH die Immobilie tatsächlich kauft. Die Prämie zahlen wir mit dem Notarvertrag aus.', 'wann'],
  ['Was, wenn der Eigentümer über einen Makler verkauft?', 'Dann gibt es keine Tippgeber-Prämie. Sie gilt nur für den Ankauf durch uns.', 'makler'],
  ['Darf ich die Kontaktdaten des Eigentümers einfach weitergeben?', 'Bitte nur, wenn er einverstanden ist. Sonst reicht uns die Adresse.', 'kontakt'],
  ['Muss ich die Prämie versteuern?', 'Das klärst du bitte mit deinem Steuerberater.', 'steuer'],
];

const tipp = `
<!-- track: page_view {page:"tippgeber"} -->
${brot()}
<header class="hero eng">
  <p class="marke">Tippgeber</p>
  <h1>Du kennst jemanden, der verkaufen will? Dein Tipp ist bis zu 5.000 € wert.</h1>
  <p class="lead">Ein Nachbar mit einem Mehrfamilienhaus, eine Erbengemeinschaft, ein Vermieter, der aufhören will: Wenn du von einer Immobilie in Köln oder im Rhein-Erft-Kreis weißt, die verkauft werden soll, sag uns Bescheid. Kauft die Heimkauf CGN GmbH das Objekt tatsächlich, bekommst du eine Prämie von <strong>${TIPP_PRAEMIE}</strong>.</p>
  <p><a class="btn btn-primary" href="#tippForm" data-track="cta_click" data-cta="tipp_abgeben">Tipp abgeben</a></p>
</header>
<section class="eng">
  <h2>So funktioniert es</h2>
  <div class="karten drei">
    <article class="karte"><span class="nr">1</span><h3>Tipp abgeben</h3><p>Adresse oder Lage, Art der Immobilie, Kontakt zum Eigentümer (nur mit dessen Einverständnis).</p></article>
    <article class="karte"><span class="nr">2</span><h3>Wir kümmern uns</h3><p>Navid oder Nikan sprechen mit dem Eigentümer und prüfen die Immobilie.</p></article>
    <article class="karte"><span class="nr">3</span><h3>Prämie bei Ankauf</h3><p>Kauft die Heimkauf CGN GmbH die Immobilie, bekommst du deine Prämie.</p></article>
  </div>
  <h2>Wie hoch ist die Prämie?</h2>
  <p>Bis zu 5.000 €, abhängig vom Objekt. Die Höhe richtet sich nach Art und Größe der Immobilie, die wir kaufen. Einen festen Betrag gibt es nicht. Die Prämie gibt es nur, wenn die Heimkauf CGN GmbH die Immobilie tatsächlich kauft.</p>
  <h2>Welche Tipps suchen wir?</h2>
  <ul>
    <li>Mehrfamilienhäuser und Wohn- und Geschäftshäuser</li>
    <li>Häuser und Wohnungen, auch mit Sanierungsstau oder Leerstand</li>
    <li>Geerbte Immobilien und Erbengemeinschaften</li>
    <li>in Köln und im Rhein-Erft-Kreis</li>
  </ul>
  <h2>Bedingungen</h2>
  <ul>
    <li>Prämie: ${TIPP_PRAEMIE}</li>
    <li>Nur bei tatsächlichem Ankauf durch die Heimkauf CGN GmbH. Für Maklerverkäufe gibt es keine Tippgeber-Prämie.</li>
    <li>Auszahlung der Prämie mit dem Notarvertrag (bei tatsächlichem Ankauf durch die Heimkauf CGN GmbH).</li>
    <li>${TIPP_REGELN_OFFEN}</li>
  </ul>
</section>
<section class="eng">
  <h2>Tipp abgeben</h2>
  <form id="tippForm" novalidate>
    <div class="feld-paar">
      <div class="feld"><label class="lbl" for="tVorname">Dein Vorname</label><input id="tVorname" type="text" autocomplete="given-name" required></div>
      <div class="feld"><label class="lbl" for="tNachname">Dein Nachname</label><input id="tNachname" type="text" autocomplete="family-name" required></div>
    </div>
    <div class="feld"><label class="lbl" for="tEmail">Deine E-Mail</label><input id="tEmail" type="email" autocomplete="email" inputmode="email" required></div>
    <div class="feld"><label class="lbl" for="tTelefon">Deine Telefonnummer <span class="opt">(optional)</span></label><input id="tTelefon" type="tel" autocomplete="tel" inputmode="tel"></div>
    <div class="feld"><label class="lbl" for="tLage">Lage der Immobilie</label><input id="tLage" type="text" required placeholder="Adresse oder Straße und Stadtteil"></div>
    <p class="lbl">Art</p>
    <div class="kacheln zwei" role="radiogroup" aria-label="Art der Immobilie">
      <label class="kachel"><input type="radio" name="tippArt" value="mfh" required><strong>Mehrfamilienhaus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="wgh"><strong>Wohn- und Geschäftshaus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="etw"><strong>Wohnung</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="efh"><strong>Haus</strong></label>
      <label class="kachel"><input type="radio" name="tippArt" value="grundstueck"><strong>Grundstück</strong></label>
    </div>
    <div class="feld" style="margin-top:14px">
      <label class="lbl" for="tText">Was weißt du über die Situation? <span class="opt">(optional)</span></label>
      <textarea id="tText" placeholder="z. B. Erbe, Leerstand, Eigentümer will in Rente gehen"></textarea>
    </div>
    <div class="feld">
      <label class="lbl" for="tEigentuemer">Kontakt des Eigentümers <span class="opt">(optional)</span></label>
      <input id="tEigentuemer" type="text">
    </div>
    <div class="honigtopf" aria-hidden="true"><label for="tWebsite">Website</label><input id="tWebsite" type="text" tabindex="-1" autocomplete="off"></div>
    <div class="einwilligung" id="tEigentuemerJaZeile" hidden>
      <input type="checkbox" id="tEigentuemerJa">
      <label for="tEigentuemerJa">Der Eigentümer weiß von meinem Tipp und ist einverstanden, dass immo.cousins ihn kontaktiert.</label>
    </div>
    <div class="einwilligung">
      <input type="checkbox" id="tDsgvo" required>
      <label for="tDsgvo">Ich bin einverstanden, dass die Heimkauf CGN GmbH meine Angaben zur Bearbeitung des Tipps verarbeitet. Hinweise in der <a href="/datenschutz/">Datenschutzerklärung</a>.</label>
    </div>
    <div class="einwilligung" id="tTelefonJaZeile">
      <input type="checkbox" id="tTelefonJa">
      <label for="tTelefonJa">Ja, ruft mich unter der angegebenen Nummer an. Diese Einwilligung kann ich jederzeit widerrufen. Nur nötig, wenn du eine Nummer einträgst.</label>
    </div>
    <button type="submit" class="btn btn-tuerkis btn-block" id="tippSenden">Tipp absenden</button>
    ${micro('Wir melden uns bei dir, sobald wir den Tipp geprüft haben.')}
    <p class="form-fehler" id="tippFehler" role="status"></p>
  </form>
</section>
<section class="eng">
  <h2>Häufige Fragen</h2>
  ${faq(faqTipp)}
</section>
`;

function dankeAbsatz(schluessel, text) {
  return `<p data-danke="${schluessel}" hidden>${text}</p>`;
}

const ankaufRest = `Navid oder Nikan meldet sich bei dir, je nachdem, wer von uns beiden gerade Zeit hat. Dein Kaufangebot bekommst du innerhalb von 48 Stunden ab Eingang deiner Angaben und Unterlagen, Navid gibt es persönlich ab. Schick uns dafür bitte: ${UNTERLAGEN} ${VERSAND_HTML} ${ANGEBOT_VERBINDLICH} Die Besichtigung bestätigt das Angebot nur.`;

const danke = `
<!-- track: page_view {page:"danke_verkauf"} -->
<header class="hero eng danke">
  <p class="marke">Anfrage</p>
  <h1 id="dankeTitel">Danke! Wir haben deine Anfrage.</h1>
  ${dankeAbsatz('a-ankauf', 'Deine ausführliche Auswertung ist unterwegs in dein Postfach. ' + ankaufRest)}
  ${dankeAbsatz('b-ankauf', 'Deine Angaben sind bei uns angekommen. ' + VARIANTE_B + '. ' + ankaufRest)}
  ${dankeAbsatz('a-makler', 'Deine ausführliche Auswertung ist unterwegs in dein Postfach. Navid oder Nikan meldet sich bei dir, um den Verkauf mit dir zu besprechen.')}
  ${dankeAbsatz('b-makler', 'Deine Angaben sind bei uns angekommen. ' + VARIANTE_B + '. Navid oder Nikan meldet sich bei dir, um den Verkauf mit dir zu besprechen.')}
  ${dankeAbsatz('a-auswertung', 'Deine ausführliche Auswertung ist unterwegs in dein Postfach. Wenn du Fragen hast, sind wir für dich da.')}
  ${dankeAbsatz('b-auswertung', 'Deine Angaben sind bei uns angekommen. ' + VARIANTE_B + '. Wenn du Fragen hast, sind wir für dich da.')}
  <p id="dankeExtra" hidden></p>
  ${micro('Keine Mail da? Schau bitte im Spam-Ordner nach.')}
  <div class="video-platzhalter">${VIDEO_URL}<p>Navid &amp; Nikan, immo.cousins</p></div>
  <p class="micro">Video: Dreh am Do 29.10.2026, danach URL einsetzen</p>
  <h2>Lieber gleich selbst einen Termin wählen?</h2>
  <p>
    <a class="btn btn-tuerkis" href="${CAL}" data-track="contact_click" data-kanal="calendly">Termin buchen</a>
    <a class="btn btn-primary" href="${WA}" data-track="contact_click" data-kanal="whatsapp">Per WhatsApp schreiben</a>
  </p>
  <p><a href="/tippgeber/" data-track="cta_click" data-cta="tippgeber">Kennst du jemanden, der verkaufen will? Bis zu 5.000 €, abhängig vom Objekt</a></p>
</header>
`;

const impressum = `
<header class="hero eng">
  <p class="marke">Impressum</p>
  <h1>Impressum</h1>
  <p class="lead">Angaben nach § 5 DDG. Die Firmendaten stehen so auf <a href="https://heimkauf.de/impressum/">heimkauf.de/impressum</a>.</p>
</header>
<section class="eng">
  <h2>Anbieter</h2>
  <p><strong>Heimkauf CGN GmbH</strong><br>c/o WeWork<br>Pilgrimstr. 6<br>50674 Köln<br>Deutschland</p>
  <p>Handelsregister: HRB 122712<br>Registergericht: Amtsgericht Köln</p>
  <p>Vertreten durch die Geschäftsführer:<br>Navid Chenari und Mir Nikan Chenari</p>
  <h2>Kontakt</h2>
  <p>E-Mail: <a href="mailto:info@heimkauf.de">info@heimkauf.de</a><br>
  Telefon: <a href="tel:+4915259848383">+49 1525 984 8383</a></p>
  <p>Für Anfragen über immocousins.de: <a href="mailto:${MAIL}">${MAIL}</a> · <a href="${TEL_HREF}">${TEL}</a> · <a href="${WA}">WhatsApp</a></p>
  <h2>Umsatzsteuer</h2>
  <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE454564838</p>
  <h2>Erlaubnis nach § 34c GewO</h2>
  <p>Die Heimkauf CGN GmbH besitzt die Erlaubnis zur Vermittlung von Immobilien nach § 34c der Gewerbeordnung. Zuständige Behörde und Aktenzeichen stehen auf heimkauf.de/impressum nicht und werden hier nicht ergänzt.</p>
  <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
  <p>Navid Chenari<br>c/o Heimkauf CGN GmbH<br>Pilgrimstr. 6<br>50674 Köln</p>
  <h2>Streitschlichtung</h2>
  <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr">https://ec.europa.eu/consumers/odr</a>. Unsere E-Mail-Adresse findest du oben im Impressum.</p>
  <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
  <h2>Haftung für Inhalte und Links</h2>
  <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
  <p>Die <a href="/datenschutz/">Datenschutzerklärung</a> steht auf dieser Website.</p>
</section>
`;

function tabelle(kopf, zeilen) {
  const head = '<tr>' + kopf.map((z) => `<th>${z}</th>`).join('') + '</tr>';
  const body = zeilen.map((zeile) => '<tr>' + zeile.map((z) => `<td>${z}</td>`).join('') + '</tr>').join('');
  return `<div class="tabelle-wrap"><table class="tabelle"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function faqOrt(ort) {
  return [
    [`Sind das die Preise in ${ort}?`, 'Nein, es sind amtliche Richtwerte für ein typisches Objekt. Deine Immobilie kann davon abweichen, das Tool passt den Wert an deine Angaben an.', 'preise'],
    ['Gibt es auch Werte für Mehrfamilienhäuser?', 'Immobilienrichtwerte für Mehrfamilienhäuser veröffentlicht BORIS.NRW hier nicht. Wir rechnen sie über die Miete: <a href="/mehrfamilienhaus-bewerten-koeln/">Mehrfamilienhaus bewerten</a>.', 'mfh'],
    ['Ist das ein Gutachten?', 'Nein. Keine Wertermittlung nach § 194 BauGB.', 'gutachten'],
  ];
}

function ortSeite(def) {
  const faqEintraege = faqOrt(def.ort);
  const quelle = def.rek
    ? 'Immobilienrichtwerte des Gutachterausschusses für Grundstückswerte im Rhein-Erft-Kreis, Stichtag 01.01.2026, BORIS.NRW (dl-de/zero-2-0).'
    : 'Immobilienrichtwerte des Gutachterausschusses für Grundstückswerte in der Stadt Köln, Stichtag 01.01.2026, BORIS.NRW (dl-de/zero-2-0).';
  return {
    pfad: def.pfad,
    titel: def.titel,
    description: def.description,
    track: 'ort_' + def.slug,
    leiste: { href: '/hausbewertung-koeln/', label: 'Wert meiner Immobilie berechnen', cta: 'wert_berechnen' },
    faq: faqEintraege.map(([frage, antwort]) => [frage, antwort]),
    main: `
<!-- track: page_view {page:"ort_${def.slug}"} -->
${brot()}
<header class="hero eng">
  <p class="marke">${def.ort}</p>
  <h1>${def.h1}</h1>
  <p class="lead">${def.intro}</p>
  ${cta('/hausbewertung-koeln/', 'Wert meiner Immobilie berechnen', 'wert_berechnen')}
  ${micro('Kostenlos, ohne Anmeldung.')}
</header>
<section class="eng">
  <h2>${def.h2}</h2>
  ${tabelle(def.kopf, def.zeilen)}
  ${micro(def.micro)}
  <p class="quelle">${quelle}</p>
  <h2>Bodenrichtwert für deine Adresse</h2>
  <p>Den Bodenrichtwert zeigen wir dir adressgenau im Tool, direkt nach Eingabe deiner Adresse.</p>
  <h2>Direktankauf oder Maklerverkauf</h2>
  <p>Direktankauf durch die Heimkauf CGN GmbH ohne Provision, ${ANGEBOT_48}. Oder Maklerverkauf (§ 34c GewO), Provision ${COURTAGE}.</p>
  ${mehr([['/immobilie-verkaufen-koeln/', 'Immobilie verkaufen'], ['/bodenrichtwert-koeln/', 'Bodenrichtwert'], ['/mehrfamilienhaus-bewerten-koeln/', 'Mehrfamilienhaus bewerten'], ['/wohnung-verkaufen-koeln/', 'Wohnung verkaufen']])}
</section>
<section class="eng">
  <h2>Häufige Fragen</h2>
  ${faq(faqEintraege)}
</section>`,
  };
}

const KOELN_KOPF = ['Zone', 'Teilmarkt', 'Richtwert', 'Normobjekt'];
const REK_KOPF = ['Teilmarkt', 'Zonen', 'Richtwert-Spanne', 'Normobjekte'];

const orte = [
  ortSeite({
    pfad: '/immobilie-verkaufen-koeln-ehrenfeld/', slug: 'ehrenfeld', ort: 'Ehrenfeld', rek: false,
    titel: 'Immobilie verkaufen Köln-Ehrenfeld: Richtwerte 2026',
    description: 'Immobilie in Köln-Ehrenfeld verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 3.610 bis 4.900 €/m². Wert deiner Immobilie kostenlos berechnen.',
    h1: 'Immobilie in Köln-Ehrenfeld verkaufen: die amtlichen Richtwerte',
    intro: 'Was ist eine Immobilie in Ehrenfeld wert? Der Gutachterausschuss Köln veröffentlicht dafür Immobilienrichtwerte. Hier siehst du die Werte der Zonen in Ehrenfeld. Für deine eigene Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Ehrenfeld (Stichtag 01.01.2026)',
    kopf: KOELN_KOPF,
    zeilen: [
      ['Ehrenfeld', 'Eigentumswohnung', '4.500 €/m²', 'Baujahr 1955, 60 m², 2. OG, 40 Wohnungen im Haus, Weiterverkauf'],
      ['Ehrenfeld Süd', 'Eigentumswohnung', '4.900 €/m²', 'Baujahr 1995, 60 m², 2. OG, 40 Wohnungen im Haus, Weiterverkauf'],
      ['Ehrenfeld West', 'Eigentumswohnung', '4.810 €/m²', 'Baujahr 1995, 60 m², 2. OG, 16 Wohnungen im Haus, Weiterverkauf'],
      ['Ehrenfeld Lukasstraße', 'Eigentumswohnung', '4.610 €/m²', 'Baujahr 1995, 60 m², 2. OG, 40 Wohnungen im Haus, Weiterverkauf'],
      ['Ehrenfeld Kanalstraße', 'Eigentumswohnung', '3.610 €/m²', 'Baujahr 1975, 35 m², 2. OG, 80 Wohnungen im Haus, Weiterverkauf'],
    ],
    micro: 'Für freistehende Ein- und Zweifamilienhäuser gibt es im Datensatz keine Zone mit dem Namen Ehrenfeld. Reihenhäuser und Doppelhaushälften bewerten wir in Köln persönlich.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-koeln-nippes/', slug: 'nippes', ort: 'Nippes', rek: false,
    titel: 'Immobilie verkaufen Köln-Nippes: Richtwerte 2026',
    description: 'Immobilie in Köln-Nippes verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 4.650 €/m². Wert deiner Immobilie kostenlos berechnen.',
    h1: 'Immobilie in Köln-Nippes verkaufen: die amtlichen Richtwerte',
    intro: 'Was ist eine Immobilie in Nippes wert? Der Gutachterausschuss Köln veröffentlicht dafür Immobilienrichtwerte. Hier siehst du die Werte der Zonen in Nippes. Für deine eigene Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Nippes (Stichtag 01.01.2026)',
    kopf: KOELN_KOPF,
    zeilen: [['Nippes', 'Eigentumswohnung', '4.650 €/m²', 'Baujahr 1955, 60 m², 2. OG, 10 Wohnungen im Haus, Weiterverkauf']],
    micro: 'Für freistehende Ein- und Zweifamilienhäuser gibt es im Datensatz keine Zone mit dem Namen Nippes. Reihenhäuser und Doppelhaushälften bewerten wir in Köln persönlich.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-koeln-suelz/', slug: 'suelz', ort: 'Sülz', rek: false,
    titel: 'Immobilie verkaufen Köln-Sülz: Richtwerte 2026',
    description: 'Immobilie in Köln-Sülz verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 3.510 bis 5.250 €/m². Wert deiner Immobilie kostenlos berechnen.',
    h1: 'Immobilie in Köln-Sülz verkaufen: die amtlichen Richtwerte',
    intro: 'Was ist eine Immobilie in Sülz wert? Der Gutachterausschuss Köln veröffentlicht dafür Immobilienrichtwerte. Hier siehst du die Werte der Zonen in Sülz. Für deine eigene Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Sülz (Stichtag 01.01.2026)',
    kopf: KOELN_KOPF,
    zeilen: [
      ['Sülz', 'Eigentumswohnung', '5.250 €/m²', 'Baujahr 1955, 60 m², 2. OG, 10 Wohnungen im Haus, Weiterverkauf'],
      ['Sülz Justiz Viertel', 'Eigentumswohnung', '3.510 €/m²', 'Baujahr 1975, 60 m², 2. OG, 80 Wohnungen im Haus, Weiterverkauf'],
      ['Sülz', 'Ein-/Zweifamilienhaus freistehend', '7.000 €/m²', 'Baujahr 1955, 140 m² Wohnfläche, 250 m² Grundstück'],
    ],
    micro: 'Reihenhäuser und Doppelhaushälften bewerten wir in Köln persönlich, weil es dafür keine Immobilienrichtwerte gibt.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-koeln-kalk/', slug: 'kalk', ort: 'Kalk', rek: false,
    titel: 'Immobilie verkaufen Köln-Kalk: Richtwerte 2026',
    description: 'Immobilie in Köln-Kalk verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 3.060 €/m². Wert deiner Immobilie kostenlos berechnen.',
    h1: 'Immobilie in Köln-Kalk verkaufen: die amtlichen Richtwerte',
    intro: 'Was ist eine Immobilie in Kalk wert? Der Gutachterausschuss Köln veröffentlicht dafür Immobilienrichtwerte. Hier siehst du die Werte der Zonen in Kalk. Für deine eigene Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Kalk (Stichtag 01.01.2026)',
    kopf: KOELN_KOPF,
    zeilen: [['Kalk', 'Eigentumswohnung', '3.060 €/m²', 'Baujahr 1955, 60 m², 2. OG, 16 Wohnungen im Haus, Weiterverkauf']],
    micro: 'Für freistehende Ein- und Zweifamilienhäuser gibt es im Datensatz keine Zone mit dem Namen Kalk. Reihenhäuser und Doppelhaushälften bewerten wir in Köln persönlich.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-koeln-porz/', slug: 'porz', ort: 'Porz', rek: false,
    titel: 'Immobilie verkaufen Köln-Porz: Richtwerte 2026',
    description: 'Immobilie in Köln-Porz verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 2.810 bis 2.830 €/m². Wert deiner Immobilie kostenlos berechnen.',
    h1: 'Immobilie in Köln-Porz verkaufen: die amtlichen Richtwerte',
    intro: 'Was ist eine Immobilie in Porz wert? Der Gutachterausschuss Köln veröffentlicht dafür Immobilienrichtwerte. Hier siehst du die Werte der Zonen in Porz. Für deine eigene Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Porz (Stichtag 01.01.2026)',
    kopf: KOELN_KOPF,
    zeilen: [
      ['Eil/Porz Ost/Urbach', 'Eigentumswohnung', '2.830 €/m²', 'Baujahr 1975, 60 m², 2. OG, 16 Wohnungen im Haus, Weiterverkauf'],
      ['Porz/Zündorf Nord', 'Eigentumswohnung', '2.810 €/m²', 'Baujahr 1975, 60 m², 2. OG, 80 Wohnungen im Haus, Weiterverkauf'],
      ['Eil / Finkenberg / Porz / Urbach / Elsdorf', 'Ein-/Zweifamilienhaus freistehend', '3.200 €/m²', 'Baujahr 1975, 120 m² Wohnfläche, 250 m² Grundstück'],
    ],
    micro: 'Reihenhäuser und Doppelhaushälften bewerten wir in Köln persönlich, weil es dafür keine Immobilienrichtwerte gibt.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-koeln-muelheim/', slug: 'muelheim', ort: 'Mülheim', rek: false,
    titel: 'Immobilie verkaufen Köln-Mülheim: Richtwerte 2026',
    description: 'Immobilie in Köln-Mülheim verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 3.480 bis 3.810 €/m². Wert deiner Immobilie kostenlos berechnen.',
    h1: 'Immobilie in Köln-Mülheim verkaufen: die amtlichen Richtwerte',
    intro: 'Was ist eine Immobilie in Mülheim wert? Der Gutachterausschuss Köln veröffentlicht dafür Immobilienrichtwerte. Hier siehst du die Werte der Zonen in Mülheim. Für deine eigene Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Mülheim (Stichtag 01.01.2026)',
    kopf: KOELN_KOPF,
    zeilen: [
      ['Mülheim', 'Eigentumswohnung', '3.480 €/m²', 'Baujahr 1955, 60 m², 2. OG, 16 Wohnungen im Haus, Weiterverkauf'],
      ['Mülheim West', 'Eigentumswohnung', '3.810 €/m²', 'Baujahr 1955, 60 m², 2. OG, 40 Wohnungen im Haus, Weiterverkauf'],
    ],
    micro: 'Für freistehende Ein- und Zweifamilienhäuser gibt es im Datensatz keine Zone mit dem Namen Mülheim. Reihenhäuser und Doppelhaushälften bewerten wir in Köln persönlich.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-huerth/', slug: 'huerth', ort: 'Hürth', rek: true,
    titel: 'Immobilie verkaufen Hürth: Immobilienrichtwerte 2026',
    description: 'Immobilie in Hürth verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 2.800 bis 3.900 €/m². Wert kostenlos berechnen.',
    h1: 'Immobilie in Hürth verkaufen: die amtlichen Richtwerte',
    intro: 'Für Hürth veröffentlicht der Gutachterausschuss im Rhein-Erft-Kreis Immobilienrichtwerte für Wohnungen, freistehende Häuser sowie Reihenhäuser und Doppelhaushälften. Hier siehst du die Spannen über alle Zonen in Hürth. Den Wert deiner Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Hürth (Stichtag 01.01.2026)',
    kopf: REK_KOPF,
    zeilen: [
      ['Eigentumswohnung', '17', '2.800 bis 3.900 €/m²', 'Baujahr 1974 bis 2007, 65 bis 90 m² Wohnfläche'],
      ['Ein-/Zweifamilienhaus freistehend', '4', '4.200 bis 5.000 €/m²', 'Baujahr 1974, 120 bis 165 m² Wohnfläche, Grundstück 525 bis 700 m²'],
      ['Reihenhaus/Doppelhaushälfte', '22', '3.400 bis 4.600 €/m²', 'Baujahr 1950 bis 1992, 85 bis 140 m² Wohnfläche, Grundstück 200 bis 700 m²'],
    ],
    micro: 'Die Spannen fassen Zonen mit unterschiedlichen Normobjekten zusammen (Baujahr, Größe). Den Richtwert deiner Zone zeigt das Tool nach Eingabe der Adresse.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-frechen/', slug: 'frechen', ort: 'Frechen', rek: true,
    titel: 'Immobilie verkaufen Frechen: Immobilienrichtwerte 2026',
    description: 'Immobilie in Frechen verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 2.400 bis 3.600 €/m². Wert kostenlos berechnen.',
    h1: 'Immobilie in Frechen verkaufen: die amtlichen Richtwerte',
    intro: 'Für Frechen veröffentlicht der Gutachterausschuss im Rhein-Erft-Kreis Immobilienrichtwerte für Wohnungen, freistehende Häuser sowie Reihenhäuser und Doppelhaushälften. Hier siehst du die Spannen über alle Zonen in Frechen. Den Wert deiner Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Frechen (Stichtag 01.01.2026)',
    kopf: REK_KOPF,
    zeilen: [
      ['Eigentumswohnung', '19', '2.400 bis 3.600 €/m²', 'Baujahr 1974 bis 2007, 65 bis 90 m² Wohnfläche'],
      ['Ein-/Zweifamilienhaus freistehend', '9', '3.600 bis 4.600 €/m²', 'Baujahr 1950 bis 1992, 100 bis 165 m² Wohnfläche, Grundstück 400 bis 700 m²'],
      ['Reihenhaus/Doppelhaushälfte', '14', '3.100 bis 5.700 €/m²', 'Baujahr 1950 bis 2018, 100 bis 190 m² Wohnfläche, Grundstück 200 bis 400 m²'],
    ],
    micro: 'Die Spannen fassen Zonen mit unterschiedlichen Normobjekten zusammen (Baujahr, Größe). Den Richtwert deiner Zone zeigt das Tool nach Eingabe der Adresse.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-bruehl/', slug: 'bruehl', ort: 'Brühl', rek: true,
    titel: 'Immobilie verkaufen Brühl: Immobilienrichtwerte 2026',
    description: 'Immobilie in Brühl verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 2.900 bis 4.100 €/m². Wert kostenlos berechnen.',
    h1: 'Immobilie in Brühl verkaufen: die amtlichen Richtwerte',
    intro: 'Für Brühl veröffentlicht der Gutachterausschuss im Rhein-Erft-Kreis Immobilienrichtwerte für Wohnungen, freistehende Häuser sowie Reihenhäuser und Doppelhaushälften. Hier siehst du die Spannen über alle Zonen in Brühl. Den Wert deiner Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Brühl (Stichtag 01.01.2026)',
    kopf: REK_KOPF,
    zeilen: [
      ['Eigentumswohnung', '16', '2.900 bis 4.100 €/m²', 'Baujahr 1974 bis 2007, 65 bis 90 m² Wohnfläche'],
      ['Ein-/Zweifamilienhaus freistehend', '4', '4.000 bis 4.200 €/m²', 'Baujahr 1950 bis 1974, 100 bis 120 m² Wohnfläche, Grundstück 400 bis 525 m²'],
      ['Reihenhaus/Doppelhaushälfte', '9', '3.000 bis 4.200 €/m²', 'Baujahr 1950 bis 2007, 100 bis 165 m² Wohnfläche, Grundstück 200 bis 400 m²'],
    ],
    micro: 'Die Spannen fassen Zonen mit unterschiedlichen Normobjekten zusammen (Baujahr, Größe). Den Richtwert deiner Zone zeigt das Tool nach Eingabe der Adresse.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-pulheim/', slug: 'pulheim', ort: 'Pulheim', rek: true,
    titel: 'Immobilie verkaufen Pulheim: Immobilienrichtwerte 2026',
    description: 'Immobilie in Pulheim verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 2.700 bis 3.500 €/m². Wert kostenlos berechnen.',
    h1: 'Immobilie in Pulheim verkaufen: die amtlichen Richtwerte',
    intro: 'Für Pulheim veröffentlicht der Gutachterausschuss im Rhein-Erft-Kreis Immobilienrichtwerte für Wohnungen, freistehende Häuser sowie Reihenhäuser und Doppelhaushälften. Hier siehst du die Spannen über alle Zonen in Pulheim. Den Wert deiner Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Pulheim (Stichtag 01.01.2026)',
    kopf: REK_KOPF,
    zeilen: [
      ['Eigentumswohnung', '14', '2.700 bis 3.500 €/m²', 'Baujahr 1974 bis 2007, 65 bis 90 m² Wohnfläche'],
      ['Ein-/Zweifamilienhaus freistehend', '6', '3.700 bis 4.500 €/m²', 'Baujahr 1974 bis 2007, 140 bis 165 m² Wohnfläche, Grundstück 400 bis 700 m²'],
      ['Reihenhaus/Doppelhaushälfte', '17', '3.400 bis 4.400 €/m²', 'Baujahr 1974 bis 2007, 100 bis 140 m² Wohnfläche, Grundstück 200 bis 400 m²'],
    ],
    micro: 'Die Spannen fassen Zonen mit unterschiedlichen Normobjekten zusammen (Baujahr, Größe). Den Richtwert deiner Zone zeigt das Tool nach Eingabe der Adresse.',
  }),
  ortSeite({
    pfad: '/immobilie-verkaufen-kerpen/', slug: 'kerpen', ort: 'Kerpen', rek: true,
    titel: 'Immobilie verkaufen Kerpen: Immobilienrichtwerte 2026',
    description: 'Immobilie in Kerpen verkaufen? Amtliche Immobilienrichtwerte 2026 für Wohnungen: 2.000 bis 3.100 €/m². Wert kostenlos berechnen.',
    h1: 'Immobilie in Kerpen verkaufen: die amtlichen Richtwerte',
    intro: 'Für Kerpen veröffentlicht der Gutachterausschuss im Rhein-Erft-Kreis Immobilienrichtwerte für Wohnungen, freistehende Häuser sowie Reihenhäuser und Doppelhaushälften. Hier siehst du die Spannen über alle Zonen in Kerpen. Den Wert deiner Immobilie rechnet unser Tool mit deiner Adresse und deinen Angaben.',
    h2: 'Immobilienrichtwerte in Kerpen (Stichtag 01.01.2026)',
    kopf: REK_KOPF,
    zeilen: [
      ['Eigentumswohnung', '18', '2.000 bis 3.100 €/m²', 'Baujahr 1974 bis 2007, 65 bis 90 m² Wohnfläche'],
      ['Ein-/Zweifamilienhaus freistehend', '9', '3.000 bis 4.400 €/m²', 'Baujahr 1950 bis 2007, 100 bis 190 m² Wohnfläche, Grundstück 525 bis 700 m²'],
      ['Reihenhaus/Doppelhaushälfte', '19', '2.400 bis 4.100 €/m²', 'Baujahr 1974 bis 2018, 100 bis 165 m² Wohnfläche, Grundstück 200 bis 525 m²'],
    ],
    micro: 'Die Spannen fassen Zonen mit unterschiedlichen Normobjekten zusammen (Baujahr, Größe). Den Richtwert deiner Zone zeigt das Tool nach Eingabe der Adresse.',
  }),
];

function seite(pfad, titel, description, track, main, faqEintraege, extra) {
  return {
    pfad,
    titel,
    description,
    track,
    main,
    faq: faqEintraege ? faqEintraege.map(([frage, antwort]) => [frage, antwort]) : undefined,
    leiste: extra && extra.leiste,
    robots: extra && extra.robots,
    script: extra && extra.script,
  };
}

export function inhaltsSeiten() {
  return [
    seite('/immobilie-verkaufen-koeln/', 'Immobilie verkaufen Köln: Angebot in 48 h | immo.cousins', 'Wert deiner Immobilie in Köln & Rhein-Erft kostenlos berechnen, mit amtlichen Daten. Dann entscheiden: Direktankauf ohne Provision oder Maklerverkauf.', 'hub', hub, faqHub, { leiste: { href: '/hausbewertung-koeln/', label: 'Wert jetzt berechnen', cta: 'wert_berechnen' } }),
    seite('/mehrfamilienhaus-verkaufen-koeln/', 'Mehrfamilienhaus verkaufen Köln: Ertragswert & Ankauf', 'Was ist dein Mehrfamilienhaus in Köln wert? Ertragswert mit amtlichen Kölner Liegenschaftszinsen berechnen. Direktankauf ohne Provision oder Maklerverkauf.', 'mfh', mfh, faqMfh, { leiste: { href: '/hausbewertung-koeln/?art=mfh', label: 'Mehrfamilienhaus bewerten', cta: 'mfh_bewerten' } }),
    seite('/wohnung-verkaufen-koeln/', 'Wohnung verkaufen Köln: Wert per Immobilienrichtwert', 'Was ist deine Eigentumswohnung in Köln wert? Spanne mit amtlichen Immobilienrichtwerten sehen. Dann Direktankauf ohne Provision oder Maklerverkauf.', 'wohnung', wohnung, faqWohnung, { leiste: { href: '/hausbewertung-koeln/?art=etw', label: 'Wohnung bewerten', cta: 'wohnung_bewerten' } }),
    seite('/geerbte-immobilie-verkaufen-koeln/', 'Geerbte Immobilie verkaufen Köln: Wert & Direktankauf', 'Haus oder Wohnung in Köln geerbt? Wert mit amtlichen Daten berechnen, mit Miterben teilen und entscheiden: Direktankauf ohne Provision oder Maklerverkauf.', 'erbe', erbe, faqErbe, { leiste: { href: '/hausbewertung-koeln/?anlass=erbe', label: 'Geerbte Immobilie bewerten', cta: 'erbe_bewerten' } }),
    seite('/immobilie-mit-sanierungsstau-verkaufen/', 'Haus mit Sanierungsstau verkaufen: Köln & Rhein-Erft', 'Alte Heizung, Dach, Leitungen? Wert deines Hauses mit Sanierungsstau in Köln & Rhein-Erft berechnen. Direktankauf ohne Provision, ohne Renovierung.', 'sanierungsstau', sanierung, faqSanierung, { leiste: { href: '/hausbewertung-koeln/?zustand=sanierung', label: 'Haus im jetzigen Zustand bewerten', cta: 'bewerten' } }),
    seite('/vermietete-immobilie-verkaufen-koeln/', 'Vermietete Immobilie verkaufen Köln: Wert & Ankauf', 'Vermietete Wohnung oder MFH in Köln verkaufen? Wert mit amtlichen Daten berechnen. Mieter bleiben. Direktankauf ohne Provision oder Maklerverkauf.', 'vermietet', vermietet, faqVermietet, { leiste: { href: '/hausbewertung-koeln/?nutzung=vermietet', label: 'Vermietete Immobilie bewerten', cta: 'bewerten' } }),
    seite('/mehrfamilienhaus-bewerten-koeln/', 'Mehrfamilienhaus bewerten Köln: Ertragswert-Rechner', 'Ertragswert deines Mehrfamilienhauses in Köln oder Rhein-Erft berechnen: mit amtlichen Liegenschaftszinsen, Faktoren und Bodenrichtwert. Kostenlos.', 'mfh_bewerten', mfhBewerten, faqBewerten, { leiste: { href: '/hausbewertung-koeln/?art=mfh', label: 'Ertragswert berechnen', cta: 'ertragswert' } }),
    seite('/bodenrichtwert-koeln/', 'Bodenrichtwert Köln 2026: Was er ist und wo du ihn findest', 'Bodenrichtwert Köln für deine Adresse: was er aussagt, wo du ihn bei BORIS.NRW findest und wo seine Grenzen liegen. Mit Wertrechner für deine Immobilie.', 'bodenrichtwert', boden, faqBoden, { leiste: { href: '/hausbewertung-koeln/', label: 'Bodenrichtwert für meine Adresse anzeigen', cta: 'brw_anzeigen' } }),
    seite('/ueber-uns/', 'Über uns: Navid & Nikan von immo.cousins aus Köln', 'Wir sind Navid und Nikan, die immo.cousins. Mit der Heimkauf CGN GmbH kaufen wir Immobilien in Köln und Rhein-Erft und vermitteln als Makler (§ 34c GewO).', 'ueber_uns', ueber, faqUeber, { leiste: { href: '/hausbewertung-koeln/', label: 'Wert deiner Immobilie berechnen', cta: 'wert_berechnen' } }),
    seite('/tippgeber/', 'Tippgeber Köln: bis zu 5.000 €, abhängig vom Objekt', 'Du kennst jemanden, der in Köln oder Rhein-Erft verkaufen will? Gib uns den Tipp. Kaufen wir, bekommst du bis zu 5.000 €, abhängig vom Objekt.', 'tippgeber', tipp, faqTipp, { leiste: { href: '#tippForm', label: 'Tipp abgeben', cta: 'tipp_abgeben' }, script: '<script src="/verkaufen/tipp.js"></script>' }),
    seite('/danke-verkauf/', 'Danke für deine Anfrage | immo.cousins', 'Wir haben deine Anfrage. Navid oder Nikan meldet sich bei dir.', 'danke_verkauf', danke, null, { robots: 'noindex,follow', script: '<script src="/verkaufen/danke.js"></script>' }),
    seite('/impressum/', 'Impressum | immo.cousins', 'Impressum der Heimkauf CGN GmbH, Pilgrimstr. 6, 50674 Köln.', 'impressum', impressum, null, {}),
    ...orte,
  ];
}
