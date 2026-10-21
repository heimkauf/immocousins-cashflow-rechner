# Cashflow-Rechner für Kapitalanleger — @immo.cousins

Mobile-first Landingpage, die den Excel-Cashflow-Rechner „immo.cousins Cashflow-Rechner v9"
als interaktives Web-Tool abbildet. Gedacht als Link-in-Bio-Asset für Instagram.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette Seite — HTML, CSS und JS inline, keine externen Abhängigkeiten. |
| `tests.html` | Test-Runner für die Akzeptanztests (109 Prüfungen). |
| `immo-cousins-hero.png` | Hero-Bild, 360 × 360 px (wird auf 140 px dargestellt). |
| `_headers` / `_redirects` | Cloudflare-Pages-Konfiguration: Security-Header, Cache, Redirect. |
| `deploy.sh` | Stellt `dist/` mit genau den Dateien zusammen, die live gehen. |
| `check-live.sh` | Prüft nach dem Deploy DNS, E-Mail, TLS, Header, Redirect und Inhalt. |

## Live

Der Rechner läuft unter **<https://immocousins.de/cashflowrechner/>**.

Die Wurzel `immocousins.de/` leitet per **302** dorthin weiter — bewusst temporär,
damit dort später eine echte Startseite stehen kann, ohne eine dauerhafte
Umleitung in den Suchmaschinen zu hinterlassen. `www.immocousins.de` ist
ebenfalls verbunden.

## Anleitungsvideo

Unten rechts im Rechner sitzt ein kleiner Hinweis mit Standbild; ein Klick zieht
das Video groß auf, Escape oder ein Klick daneben schließt es wieder. Das × am
Hinweis blendet ihn für die laufende Sitzung aus — nichts wird gespeichert.

**Der Punkt, auf den es ankommt:** `preload="none"` und die Videoquelle wird
erst beim ersten Öffnen gesetzt. Beim Seitenaufruf lädt der Browser nur das
11 KB große Standbild, nicht die 22 MB. Nachgemessen, nicht angenommen.

Die Vorlage war eine 437 MB große Bildschirmaufnahme (1920×1080, 30 fps,
6,2 Mbit/s, 9:53 min). Der Weg zur ausgelieferten Fassung:

```bash
ffmpeg -i roh.mov -vf "scale=1280:-2" \
  -c:v libx264 -preset medium -crf 28 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -g 60 -c:a aac -b:a 64k -ac 1 \
  -movflags +faststart video/anleitung.mp4
```

Ergebnis: 22 MB bei 234 kbit/s, Schrift weiterhin scharf. `+faststart` ist
Pflicht, sonst muss der Browser erst die ganze Datei holen, bevor er anfängt.

Damit passt das Video unter die **25-MiB-Grenze von Cloudflare Pages** und
liegt direkt neben der Seite — kein R2, kein zweiter Dienst. Cloudflare liefert
es mit `accept-ranges: bytes` aus, Vorspulen funktioniert also.

**Offen:** Im Video wird gesprochen, Untertitel gibt es keine. Wer nicht hören
kann oder ohne Ton schaut, bekommt den Inhalt nicht mit. Eine VTT-Datei
nachzureichen wäre der saubere Weg.

## Deploy — Cloudflare Pages

Projekt: `immocousins-rechner` (Direct Upload), Account `verwaltung@heimkauf.de`.
Fallback-Adresse: `immocousins-rechner.pages.dev`.

```bash
./deploy.sh
npx wrangler pages deploy dist --project-name=immocousins-rechner
```

`deploy.sh` legt `dist/` an — kein Build-Werkzeug, nur Kopieren:

```
dist/
  404.html  robots.txt  _headers  _redirects     <- Wurzel
  cashflowrechner/
    index.html  immo-cousins-hero.png            <- der Rechner
```

README, `tests.html` und die Skripte bleiben außen vor.

### Warum der Unterordner

Der Rechner liegt unter `/cashflowrechner/`, damit `immocousins.de/` für eine
spätere Hauptseite frei bleibt. Wichtig dabei: Die Bildreferenz in `index.html`
ist **relativ** (`immo-cousins-hero.png`), damit die Datei auch per Doppelklick
offline funktioniert. Deshalb leitet `_redirects` `/cashflowrechner` per 301 auf
`/cashflowrechner/` **mit** Schrägstrich um — ohne ihn würde der Browser das Bild
in der Domainwurzel suchen.

### Was `_headers` und `_redirects` setzen

| Regel | Wirkung |
|---|---|
| `/` → `/cashflowrechner/` | 302, temporär |
| `/cashflowrechner` → `/cashflowrechner/` | 301, schützt die relativen Pfade |
| `/tests.html` → `/cashflowrechner/` | 301 |
| `Cache-Control` | Bild `immutable`, `index.html` `must-revalidate` |
| Security-Header | CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |

Die CSP erlaubt `'unsafe-inline'` für Style und Skript — unvermeidlich bei der
Vorgabe „eine einzige `index.html`" — verbietet aber jede externe Ressource.
`connect-src` steht auf `'self'`: Die Seite selbst ruft nichts ab, mit `'none'`
scheiterte jedoch das Auslesen der `robots.txt` durch Crawler-Werkzeuge.

### DNS

Die Domain liegt bei Strato (Registrar), die Nameserver zeigen auf Cloudflare
(`christian` / `penny.ns.cloudflare.com`). Der Apex ist ein CNAME auf
`immocousins-rechner.pages.dev` (CNAME-Flattening).

**Die E-Mail blieb dabei vollständig bei Strato** und ist nach dem Umzug geprüft:

| Typ | Name | Wert |
|---|---|---|
| `MX` | `immocousins.de`, `*` | `smtpin.rzone.de` (Prio 5) |
| `TXT` | `_dmarc` | `v=DMARC1;p=reject;` |
| `TXT` | `_domainkey` | `o=~; t=y; r=dkim@rzone.de` |
| `SRV` | `_autodiscover._tcp` | `autoconfigure.strato.de` |
| `CNAME` | `autoconfig` | `autoconfigure.strato.de`, **DNS only** |

`autoconfig` wurde bewusst aus dem Cloudflare-Proxy genommen — Mail-Einträge
gehören laut Cloudflare nicht durch den Proxy.

### Nach jedem Deploy prüfen

```bash
./check-live.sh
```

18 Prüfungen: Nameserver, MX und DMARC, TLS, alle Security-Header, Redirects,
Termin-Link, Impressum, Rechenlogik, Hero-Bild, 404-Verhalten.

## Startseite, Tor und Leads

`immocousins.de/` ist eine eigene Landingpage (`startseite.html`, wird als
`index.html` in die Wurzel deployt): Hero, Leistungen, Rechner-Verweis,
Instagram und Kontaktformular.

### Zwei Wege zum Rechner

| Adresse | Verhalten | Wofür |
|---|---|---|
| `immocousins.de/cashflowrechner/` | **offen**, kein Formular | der Link, den ihr teilt |
| `immocousins.de/rechner` | 302 auf dieselbe Seite | kurze Zweitadresse |
| `immocousins.de/cashflowrechner/?start=1` | **Tor**: Vor-/Nachname, E-Mail, Telefon, Einwilligung | so verlinken alle drei Buttons der Startseite |

Nach dem Absenden verschwindet `?start=1` aus der Adresszeile und die
Freischaltung liegt im **sessionStorage** — sie gilt nur für die laufende
Sitzung und braucht deshalb keine Einwilligung nach § 25 TDDDG.

**Was das bedeutet:** Abgefragt wird nur, wer über die Startseite kommt. Wer die
Adresse `/cashflowrechner/` kennt — aus Instagram, aus Google, aus einer
Weiterleitung — kommt ohne Formular hinein. Das ist so gewollt; der geteilte
Link soll ohne Hürde funktionieren. Zum Vergleich: Ein Tor auf der offenen
Adresse würde mehr Leads bringen, dafür aber jeden geteilten Link mit einem
Formular belasten.

Ohnehin gilt: Das Tor ist clientseitig. Wer JavaScript abschaltet, sieht den
Rechner direkt. Als Lead-Magnet ist das üblich, als Zugriffsschutz taugt es
nicht.

### Wo die Leads landen

Beide Formulare schicken an die Pages Function `functions/api/lead.js`, die in
die D1-Datenbank `immocousins-leads` schreibt (Region **EEUR**, also EU).
Gespeichert wird nur, was der Nutzer eingibt — **keine IP, kein User-Agent,
keine Cookies**. Ein unsichtbares Honeypot-Feld fängt Bots ab.

```bash
./leads.sh          # letzte 50 Leads als Tabelle
./leads.sh csv      # alles nach leads.csv (Excel-tauglich, mit BOM)
./leads.sh anzahl   # nur die Anzahl
```

### E-Mail-Benachrichtigung (aktiv)

Jeder Lead löst sofort eine Mail an `verwaltung@heimkauf.de` aus — Name,
E-Mail, Telefon, Quelle, Zeit und ggf. Nachricht. Als Antwortadresse steht die
Adresse des Interessenten drin, ein „Antworten" geht also direkt an ihn.

Versand über **Resend**, Region Irland (eu-west-1). Absenderdomain
`immocousins.de` ist dort verifiziert.

**Diese drei DNS-Einträge tragen den Versand** (Cloudflare, `immocousins.de`):

| Typ | Name | Wert | Proxy |
|---|---|---|---|
| TXT | `resend._domainkey` | DKIM-Schlüssel (218 Zeichen) | — |
| CNAME | `rsend` | `rsend-euw1.forge.rmta.net` | DNS only |
| CNAME | `send` | `send.forge.rmta.net` | DNS only |

**Zwei Dinge wurden bewusst nicht gemacht:**

1. Resends „Auto configure" hätte Resend Schreibzugriff auf die Cloudflare-DNS-Zone
   gegeben — in derselben Zone liegen die Strato-MX-Einträge. Stattdessen manuell
   eingetragen.
2. Resend wollte unter „Enable Receiving" einen MX auf die Root-Domain setzen
   (`@` → `inbound-smtp.eu-west-1.amazonaws.com`, **Priorität 4**). Stratos MX hat
   Priorität 5 — der Amazon-Eintrag hätte die eingehende Post abgefangen. **Nicht
   eingetragen**, es wird nur gesendet, nicht empfangen. Wer Resend später auch
   zum Empfangen nutzen will, muss vorher die Postfächer migrieren.

Auch Click- und Open-Tracking sind in Resend abgeschaltet; sie waren
standardmäßig aktiv und hätten Links in den Mails umgeschrieben.

**Konfiguration im Pages-Projekt** (Settings → Variables and Secrets):

| Name | Typ | Zweck |
|---|---|---|
| `RESEND_API_KEY` | Secret | Versandzugang |
| `MAIL_VON` | Variable | Absender, Standard `immo.cousins <lead@immocousins.de>` |
| `MAIL_AN` | Variable | Empfänger, Standard `verwaltung@heimkauf.de` |

`MAIL_VON` und `MAIL_AN` haben Vorgabewerte im Code — fehlen sie, funktioniert
der Versand trotzdem. Fehlt `RESEND_API_KEY`, wird der Lead weiterhin in D1
gespeichert, nur ohne Benachrichtigung. Der Versand läuft in `waitUntil` und kann
die Anfrage nie scheitern lassen.

**Nach Änderungen an den Variablen muss einmal neu deployt werden**, sonst
arbeitet die Funktion mit dem alten Stand.

## Teilbare Vorschau

Die Seite ist zusätzlich als Artifact veröffentlicht, um sie ohne Deploy
herumschicken zu können:

<https://claude.ai/artifact/3kP6ZeHvX8ZUfVy3JEt2WF>

**Der Link ist zunächst privat** — erst über das Teilen-Menü auf der Seite wird er
für andere zugänglich. Die Artifact-Fassung wird aus `index.html` erzeugt
(Doctype-, `html`-, `head`- und `body`-Tags entfernt, `lang="de"` per Skript
gesetzt, Titel auf „immo.cousins Cashflow-Rechner"); inhaltlich ist sie identisch.
Für den Link in der Instagram-Bio ist eine eigene Domain die bessere Wahl —
schon weil Impressum und Datenschutz dann unter derselben Domain liegen.

## Tests ausführen

Die Rechenlogik liegt in genau einem Block in `index.html` — zwischen den Markern
`/* ===== ENGINE START ===== */` und `/* ===== ENGINE END ===== */`. `tests.html`
liest diesen Block zur Laufzeit aus und testet ihn. Dadurch gibt es keine zweite
Kopie der Logik, die auseinanderlaufen könnte.

Weil Browser das Nachladen von Dateien über `file://` blockieren, brauchen die
Tests einen lokalen Server:

```bash
cd cashflow-rechner && python3 -m http.server 8000
```

Dann `http://localhost:8000/tests.html` öffnen. Grün = alles in Ordnung.
(`index.html` selbst braucht keinen Server.)

## Lighthouse (gemessen, Mobile)

Lighthouse 13.4.1, headless Chrome, Form-Faktor Mobile (412 × 823), gegen einen
lokalen Server:

| Kategorie | Score |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

FCP 1,1 s · LCP 1,1 s · TBT 0 ms · CLS 0,001. Der LCP-Sprung von 1,8 s auf 1,1 s kam durch das WebP-Hero (11 KB statt 153 KB).

Nachstellen:

```bash
npx lighthouse http://localhost:8000/index.html --chrome-flags="--headless=new" --view
```

Die verbleibenden Abzüge sind nicht Seitencode:

- **unminified-css / unminified-javascript** — Folge der Vorgabe „eine einzige
  `index.html` mit inline CSS und JS". Kostet in der Messung nichts Relevantes
  (Performance 99, TBT 0 ms).
- **cache-insight / document-latency-insight** — fehlende `Cache-Control`- und
  Kompressions-Header von `python3 -m http.server`. Auf Netlify/Vercel erledigt
  sich das von selbst.

## Barrierefreiheit: Abweichungen von der Excel-Palette

Drei Farbwerte der Vorlage verfehlen WCAG AA. Sie wurden auf den nächstliegenden
konformen Wert abgedunkelt — der visuelle Unterschied ist minimal, vorher fielen
98 Knoten durch:

| Token | Vorlage | jetzt | Grund |
|---|---|---|---|
| `--grau-600` | `#7A7A7A` | `#666666` | 4,29:1 auf Weiß, 3,52:1 auf Mint → jetzt ≥ 4,71:1 auf allen benutzten Flächen |
| `--grau-400` | `#8A8A8A` | `#757575` | 3,45:1 auf Weiß → 4,61:1 |
| Text auf Gold/Koralle | `--petrol-900` | `--auf-gold` `#0C4B45` | Petrol auf Gold nur 4,25:1, auf Koralle 3,87:1 → jetzt 5,40:1 bzw. 4,93:1 |

Zusätzlich: die Deckkraft der Sektionsnummer (`01`, `02`, …) von 0,65 auf 0,85
erhöht — 0,65 ergab auf Mint nur 3,04:1.

Die Flächenfarben selbst (`--gold-500`, `--coral-300`, `--mint-*`, `--petrol-*`)
sind unverändert. Wenn ihr die Originalwerte zurückwollt, ist das eine bewusste
Entscheidung gegen WCAG AA — dann bitte im Token-Block oben ändern, nicht an den
einzelnen Regeln.

## Aufbau der Rechenlogik

`IC.berechne(inputs) → ergebnisse` ist eine pure function ohne DOM-Zugriff.
Prozentwerte werden intern als Bruch geführt (4,00 % → `0.04`).

- `IC.DEFAULTS` — Beispielwerte
- `IC.FELDER` — Feldarten, Grenzen (Klemmung), Anzeige-Nachkommastellen
- `IC.parseZahl` / `IC.parseFeld` — akzeptiert `1.234,56`, `1234.56` und `1 234,56`
- `IC.fmtEuroGlatt` / `IC.fmtEuroCent` / `IC.fmtPct` / `IC.fmtFaktor` / `IC.fmtEurQm`
  — zentrale Formatierung; fängt `NaN`, `Infinity`, `undefined` und `-0 €` ab
- `IC.norm` — Klemmung ungültiger Eingaben
- `IC.loeseLinear` — Break-even per Sekante, Schrittweite 1.000

### Zahlenformat

Große/absolute Beträge ohne Nachkommastellen (`170.000 €`), laufende Monats- und
Jahreswerte mit Cent (`566,67 €`, `84,47 €`), Prozent mit zwei Nachkommastellen
(`3,57 %`), Faktor als `15,74x`.

### Bewusste fachliche Festlegungen

Diese Punkte sehen auf den ersten Blick wie Fehler aus, sind aber so gewollt:

- **`hausgeldGesamt` fließt nicht in den Cashflow ein** — nur der nicht umlegbare
  Anteil ist Kosten des Vermieters. Das Gesamt-Hausgeld steht nur als Info in der
  Tabelle (ausgegraut).
- **Tilgung ist kein steuerlicher Aufwand** — sie mindert den Cashflow, nicht das
  zu versteuernde Ergebnis.
- **AfA-Bemessungsgrundlage ist der Kaufpreis inkl. Nebenkosten.**
- **Bruttorendite und Kaufpreis-Faktor** beziehen sich auf den Kaufpreis **exkl.**
  Nebenkosten.
- **Eigenkapital-Default** deckt nur die Anschaffungsnebenkosten (Courtage, Notar,
  Grunderwerbsteuer) — **ohne** die zusätzlichen Kosten.

## Eigenkapital: Auto- und Manuell-Modus

Im Auto-Modus folgt das EK-Feld der Formel `kaufpreis × nkSatz` und aktualisiert
sich live. Sobald jemand hineintippt, friert der Wert ein und der Link „↺ Auto"
erscheint. Beim Break-even-Kaufpreis wandert das EK im Auto-Modus mit (Fußnote
unter dem Wert), im Manuell-Modus bleibt es fest.

## Termin-CTA

Der Rechner endet auf einem Termin-Block (`.termin`, direkt nach Block 07) mit
dem hervorgehobenen Button „Kostenfreien Termin buchen" →
`https://calendly.com/nikan-heimkauf/45min`. Fläche `--mint-100`, Button
`--petrol-700` mit weißer Schrift (5,41:1).

Wer stattdessen das helle Hero-Türkis als Buttonfläche will: in `.btn-tuerkis`
`background`/`border-color` auf `var(--mint-300)` und `color` auf
`var(--auf-gold)` setzen — ebenfalls AA-konform (6,33:1), wirkt aber weicher.

Das frühere „Beispielwerte"-Element ist kein Button mehr, sondern ein
zurückhaltender Textlink unter den beiden Werkzeug-Buttons (`.reset-link`) —
die Funktion bleibt erhalten, ohne dem Termin-CTA Aufmerksamkeit zu nehmen.
Soll sie ganz weg, reicht es, das `<p class="reset-zeile">` zu entfernen.

## Speicherung & Teilen

- **Speichern ist Opt-in.** Ohne das Häkchen „Eingaben auf diesem Gerät merken"
  schreibt die Seite **nichts** in den Speicher — auch kein Einwilligungs-Flag.
  Erst das Häkchen legt `ic-cashflow-merken = 1` und `ic-cashflow-v1` an; das
  Abwählen löscht beide sofort. Hintergrund: § 25 TDDDG erfasst jeden Zugriff auf
  Endgeräte-Speicher, und das Wiederherstellen von Eingaben über Sitzungen hinweg
  ist nicht zweifelsfrei „unbedingt erforderlich". So bleibt die Seite ohne
  Cookie-Banner auskömmlich. Beim Ändern des Datenformats den Schlüssel
  `ic-cashflow-v1` hochzählen, damit alte Stände nicht brechen.
- „Berechnung teilen" schreibt alle Werte base64-kodiert in den Query-Parameter `d`
  und kopiert den Link. Beim Laden hat die URL Vorrang vor localStorage.
- Die Feldreihenfolge in der Konstanten `SER` (im UI-Block) bestimmt das Link-Format
  — **nicht umsortieren**, sonst brechen bereits geteilte Links.

## Rechtstexte

`immocousins.de/datenschutz/` ist eine **eigene** Datenschutzerklärung für diese
Website (`datenschutz.html`). Die auf heimkauf.de deckte weder Cloudflare als
Hoster noch die Lead-Speicherung noch Resend ab. Sie beschreibt konkret:

- Cloudflare als Hoster, Server-Logs, Standardvertragsklauseln
- die beiden Formulare: welche Felder, Pflicht oder freiwillig, Zweck,
  Rechtsgrundlage (Art. 6 Abs. 1 lit. b bzw. f DSGVO), Speicherort EU
- Resend als Auftragsverarbeiter für die Benachrichtigungen
- `localStorage` nur mit Einwilligung (§ 25 Abs. 1 TDDDG), `sessionStorage`
  für die Tor-Freischaltung als unbedingt erforderlich (§ 25 Abs. 2 Nr. 2)
- dass Calendly und Instagram reine Links sind, keine Einbettungen
- Betroffenenrechte, Aufsichtsbehörde (LDI NRW), Speicherdauer

Das **Impressum** verlinkt weiter auf heimkauf.de — dort steht die vollständige
Firmierung samt der gesetzlich vorgeschriebenen E-Mail-Adresse. Eine eigene
Impressumsseite wurde bewusst nicht angelegt: § 5 DDG verlangt eine erreichbare
E-Mail-Adresse, und `info@heimkauf.de` sollte auf immocousins.de nicht sichtbar
sein. Die Datenschutzerklärung verweist für Kontaktdaten deshalb aufs Impressum.

> **Der Text ist von mir verfasst, nicht von einem Anwalt.** Er beschreibt die
> tatsächliche Verarbeitung korrekt und vollständig — die rechtliche Würdigung
> gehört trotzdem einmal gegengelesen. Zusätzlich nötig: der
> Auftragsverarbeitungsvertrag mit Resend (in deren Einstellungen abrufbar).

## E-Mail-Absicherung

| Eintrag | Wert | Zweck |
|---|---|---|
| `TXT @` | `v=spf1 include:_spf.strato.com ~all` | erlaubt Stratos Mailserver, alles andere Softfail |
| `TXT _dmarc` | `v=DMARC1;p=reject;` | war bereits vorhanden |
| `TXT resend._domainkey` | DKIM | signiert die Lead-Benachrichtigungen |

Vorher gab es **keinen SPF-Eintrag** bei gleichzeitig strengem DMARC — Cloudflare
hatte das angemahnt. `~all` statt `-all` gewählt, damit ein übersehener
Versandweg nicht hart abgelehnt, sondern nur markiert wird.

Nach dem Setzen gegengeprüft: Resend stellt weiterhin zu (DKIM-Alignment trägt
die DMARC-Prüfung), MX und DMARC unverändert.

Wird künftig aus `immocousins.de` über Microsoft 365 versendet — heimkauf.de
nutzt das —, muss `include:spf.protection.outlook.com` ergänzt werden.

## Verkäufer-Funnel

Zweite Säule neben der Investoren-Startseite, unter anderem:

| Adresse | Inhalt |
|---|---|
| `/immobilie-verkaufen-koeln/` | Hub |
| `/hausbewertung-koeln/` | Bewertung, acht Schritte |
| `/mehrfamilienhaus-verkaufen-koeln/` | Mehrfamilienhaus |
| `/erbimmobilie-verkaufen-koeln/` | Erbimmobilie |
| `/wohnung-verkaufen-koeln/` | Eigentumswohnung |
| `/tippgeber/` | Tippgeber, Bonus noch Platzhalter |
| `/impressum/` | eigenes Impressum, Pflichtfelder noch offen |

Die Investoren-Startseite bleibt. Im Footer steht ein zusätzlicher Link hierher.

Bewertung und Leads laufen über Pages Functions: `POST /api/lage` (Bodenrichtwert), `POST /api/bewertung` (Spanne), `POST /api/lead` mit `quelle: "verkauf"` oder `"tippgeber"`. Investoren-Leads (`kontakt`, `rechner`) laufen unverändert. Verkaufsleads liegen zusätzlich in `leads_verkauf`; das `CREATE TABLE` macht die Function beim ersten Lead, `schema-verkauf.sql` ist dieselbe Anweisung zum Nachlesen.

Richtwerte kommen serverseitig von BORIS.NRW (WMS GetFeatureInfo, Datenlizenz Deutschland Zero 2.0). Für Mehrfamilienhäuser: Jahresnettokaltmiete × Faktor aus dem Grundstücksmarktbericht Köln 2026. Kein Autocomplete. Produktiv `GEOCODER_URL` auf eine eigene Photon-Instanz setzen. Ohne diese URL löst ein einzelner Aufruf pro Adresse über Nominatim auf.

Asana und die Mail an `chenari.immo@gmail.com` laufen nur, wenn `ASANA_TOKEN` bzw. `RESEND_API_KEY` gesetzt sind. Fehlt ein Schlüssel, wird der Lead trotzdem gespeichert. Schlüssel nicht ins Repo.

```bash
node --test
node scripts/vorschau.mjs
```

Die Vorschau spricht die echten BORIS-Dienste an und speichert Leads nur im Speicher des Prozesses. `./deploy.sh` baut `dist/`, ein Deploy ist damit nicht verbunden.

## Offene Punkte

- **Datenschutzerklärung anwaltlich gegenlesen lassen** und den
  Auftragsverarbeitungsvertrag mit Resend abschließen (Resend → Settings).
- **Impressum ergänzen:** Auf heimkauf.de ist immocousins.de nicht aufgeführt.
  Sauberer wäre, die Domain dort mit aufzunehmen. Außerdem firmiert das
  Impressum als „Heimkauf CGN GmbH", die dortige Datenschutzerklärung nennt
  „HEIMKAUF GmbH" — einmal angleichen.
