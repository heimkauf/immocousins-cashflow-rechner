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

## Deploy — Cloudflare Pages auf immocousins.de

Kein Build-Schritt, kein npm, keine CDN-Skripte.

```bash
./deploy.sh
```

legt `dist/` an — genau die Dateien, die live gehen (`index.html`, Hero-Bild,
`_headers`, `_redirects`). README, `tests.html` und `deploy.sh` selbst bleiben
außen vor. Diesen Ordner in Cloudflare unter *Workers & Pages → Create →
Pages → Upload assets* hochladen.

### Warum die Nameserver zu Cloudflare müssen

Der Rechner soll auf dem Apex `immocousins.de` laufen. Ein Apex lässt sich per
Standard-DNS nicht auf einen Pages-Host zeigen (CNAME am Apex ist nicht erlaubt),
und Strato kann kein CNAME-Flattening. Cloudflare kann es — aber nur, wenn die
Domain auch dort in der DNS-Verwaltung liegt.

Stand heute liegt die Domain vollständig bei Strato:

- Nameserver: `docks04.rzone.de`, `shades03.rzone.de`
- Apex `A` → `217.160.0.99`, `AAAA` → `2001:8d8:100f:f000::200`
  (Strato-Parkseite „Domain reserved", kein gültiges TLS-Zertifikat)
- `www` → CNAME auf den Apex

Es liegt also **kein produktiver Inhalt** auf der Domain, den der Rechner
verdrängen würde.

### ⚠️ Diese Einträge beim Umzug übernehmen — sonst bricht die E-Mail

Cloudflare importiert beim Hinzufügen der Domain die vorhandenen Einträge
automatisch. Vor dem Nameserver-Wechsel bei Strato trotzdem prüfen, dass beide
Zeilen in Cloudflare stehen:

| Typ | Name | Wert |
|---|---|---|
| `MX` | `immocousins.de` | `smtpin.rzone.de` (Priorität 5) |
| `TXT` | `_dmarc.immocousins.de` | `v=DMARC1;p=reject;` |

Die alten `A`/`AAAA`-Einträge des Apex dürfen weg — die ersetzt Pages beim
Verbinden der Custom Domain.

Randnotiz: Es gibt keinen SPF-Eintrag, aber DMARC steht auf `p=reject`. Das ist
schon heute so und unabhängig von diesem Umzug, kann aber dazu führen, dass
legitime Mails abgelehnt werden. Einmal separat anschauen.

### Ablauf

1. Cloudflare-Account anlegen, *Add a site* → `immocousins.de`, Free-Plan.
2. Importierte DNS-Einträge gegen die Tabelle oben prüfen.
3. Bei Strato die Nameserver auf die beiden von Cloudflare genannten umstellen.
   Aktivierung dauert meist Minuten, laut Cloudflare bis zu 24 Stunden.
4. `./deploy.sh`, dann `dist/` unter *Workers & Pages → Create → Pages →
   Upload assets* hochladen.
5. Im Pages-Projekt unter *Custom domains* sowohl `immocousins.de` als auch
   `www.immocousins.de` hinzufügen. HTTPS stellt Cloudflare selbst aus.

6. Danach prüfen:

   ```bash
   ./check-live.sh
   ```

   Das Skript kontrolliert Nameserver, **MX und DMARC** (also ob die E-Mail den
   Umzug überlebt hat), TLS, alle Security-Header, den `tests.html`-Redirect und
   ob wirklich die aktuelle Version mit dem Termin-Link ausgeliefert wird.
   Solange der Umzug nicht durch ist, meldet es erwartungsgemäß Fehler.

Für spätere Updates: `./deploy.sh` und `dist/` erneut hochladen.

### Was ich nicht übernehmen kann

Der Cloudflare-Account und die Nameserver-Umstellung bei Strato brauchen eure
Zugangsdaten — Logins und Passwörter gebe ich grundsätzlich nicht ein. Auf diesem
Rechner sind auch keine Cloudflare-Credentials hinterlegt (kein API-Token, keine
Wrangler-Anmeldung), sonst hätte ich den Upload selbst gefahren. Alles andere ist
vorbereitet: `dist/` ist fertig, `check-live.sh` prüft das Ergebnis.

### Was `_headers` und `_redirects` setzen

- `tests.html` → 301 auf `/`
- `Cache-Control: immutable` fürs Hero-Bild, `must-revalidate` für `index.html`
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` und eine Content-Security-Policy

Beide Dateien werden von Pages als Konfiguration gelesen und nicht ausgeliefert.
Die CSP wurde gegen die laufende Seite getestet: kein Verstoß, alles funktioniert.
Sie erlaubt `'unsafe-inline'` für Style und Skript — unvermeidlich bei der Vorgabe
„eine einzige `index.html`" — verbietet aber jede externe Ressource
(`connect-src 'none'`, `object-src 'none'`).

**Alternativen:** Netlify funktioniert identisch (dort heißt die Konfiguration
`netlify.toml`); der Apex ginge dann ebenfalls nur mit Netlify-DNS. Offline
funktioniert `index.html` weiterhin per Doppelklick.

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
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

FCP 1,2 s · LCP 1,8 s · TBT 0 ms · CLS 0,001.

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
- **image-delivery-insight** — verlangt WebP für das Hero-Bild, siehe „Offene Punkte".

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

## Offene Punkte

- **WebP fehlt.** Auf diesem Rechner war kein WebP-Encoder installiert
  (`sips` kann kein WebP schreiben, `cwebp`/ImageMagick nicht vorhanden), deshalb
  liegt nur das PNG bei (153 KB). WebP nachrüsten:

  ```bash
  brew install webp && cwebp -q 80 immo-cousins-hero.png -o immo-cousins-hero.webp
  ```

  Danach im Hero das `<img>` durch `<picture>` ersetzen:

  ```html
  <picture>
    <source srcset="immo-cousins-hero.webp" type="image/webp">
    <img src="immo-cousins-hero.png" width="140" height="140"
         alt="Die immo.cousins – zwei Immobilien-Investoren aus Köln">
  </picture>
  ```

  Das `<source>` erst einbauen, wenn die WebP-Datei wirklich existiert — ein
  fehlendes `<source>`-Ziel fällt nicht auf das `<img>` zurück, sondern bricht.
- **Rechtstexte gehören auf die neue Domain angepasst.** Der Footer verlinkt auf
  `heimkauf.de/impressum/` (Heimkauf CGN GmbH, Geschäftsführer Navid Chenari,
  HRB 122712) und `heimkauf.de/privacy-policy/` — beide erreichbar und geprüft.
  Mit dem Umzug auf `immocousins.de` kommen drei Punkte dazu:
  1. Das Impressum gilt für das Angebot auf heimkauf.de. Betreibt dieselbe GmbH
     auch immocousins.de, genügt der Verweis grundsätzlich — sauberer ist es,
     immocousins.de im Impressum ausdrücklich mit aufzuführen.
  2. Die Datenschutzerklärung nennt weder **Cloudflare als Hoster** dieser Seite
     (Server-Logs, Drittlandtransfer) noch die Opt-in-Speicherung im
     localStorage (§ 25 TDDDG). Beides gehört ergänzt.
  3. Das Impressum firmiert als „Heimkauf CGN GmbH", die Datenschutzerklärung
     nennt in der Verantwortlichen-Zeile „HEIMKAUF GmbH" — einmal angleichen.

  Der Rechner selbst ist unkritisch: kein Backend, kein Tracking, keine Cookies,
  Speicherung nur per Opt-in. Extern sind nur die Navigationslinks zu Calendly
  und Instagram. Trotzdem einmal anwaltlich gegenlesen lassen.

- **WebP fehlt.** Auf diesem Rechner war kein WebP-Encoder installiert
  (`sips` kann kein WebP schreiben, `cwebp`/ImageMagick nicht vorhanden), deshalb
  liegt nur das PNG bei (153 KB). WebP nachrüsten:

  ```bash
  brew install webp && cwebp -q 80 immo-cousins-hero.png -o immo-cousins-hero.webp
  ```

  Danach im Hero das `<img>` durch `<picture>` ersetzen:

  ```html
  <picture>
    <source srcset="immo-cousins-hero.webp" type="image/webp">
    <img src="immo-cousins-hero.png" width="140" height="140"
         alt="Die immo.cousins – zwei Immobilien-Investoren aus Köln">
  </picture>
  ```

  Das `<source>` erst einbauen, wenn die WebP-Datei wirklich existiert — ein
  fehlendes `<source>`-Ziel fällt nicht auf das `<img>` zurück, sondern bricht.
- **Datenschutzerklärung deckt diese Seite noch nicht ab.** Der Footer verlinkt
  jetzt auf `heimkauf.de/impressum/` (Heimkauf CGN GmbH, Geschäftsführer
  Navid Chenari) und `heimkauf.de/privacy-policy/` — beide erreichbar, beide
  geprüft. Zwei Punkte bleiben:
  1. Die Datenschutzerklärung ist für heimkauf.de geschrieben und nennt weder den
     Hoster dieser Seite noch die Opt-in-Speicherung im localStorage. Sobald der
     Rechner unter einer eigenen Domain bzw. bei einem anderen Hoster liegt,
     gehört beides ergänzt (Server-Logs des Hosters, § 25 TDDDG / Einwilligung).
  2. Das Impressum firmiert als „Heimkauf CGN GmbH", die Datenschutzerklärung
     nennt in der Verantwortlichen-Zeile „HEIMKAUF GmbH" — auf der bestehenden
     Seite uneinheitlich, einmal angleichen.

  Der Rechner selbst ist unkritisch: kein Backend, kein Tracking, keine Cookies,
  Speicherung nur per Opt-in; extern ist nur der Instagram-Link im CTA.
  Trotzdem einmal anwaltlich gegenlesen lassen.
