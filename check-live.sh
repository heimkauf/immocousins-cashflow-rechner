#!/bin/sh
# Prueft nach dem Cloudflare-Deploy, ob alles steht - inklusive der Frage,
# ob die E-Mail den Nameserver-Umzug ueberlebt hat.
# Aufruf:  ./check-live.sh [domain]     (Standard: immocousins.de)
set -u
D="${1:-immocousins.de}"
ok=0; warn=0; fail=0
gut()  { echo "  ✓ $1"; ok=$((ok+1)); }
hm()   { echo "  ! $1"; warn=$((warn+1)); }
weg()  { echo "  ✗ $1"; fail=$((fail+1)); }

echo "=== 1. DNS ==="
ns=$(dig +short NS "$D" @1.1.1.1 | tr '\n' ' ')
case "$ns" in
  *ns.cloudflare.com*) gut "Nameserver bei Cloudflare: $ns" ;;
  *rzone.de*)          hm  "Nameserver noch bei Strato: $ns (Umzug nicht aktiv)" ;;
  "")                  weg "Keine Nameserver gefunden" ;;
  *)                   hm  "Unerwartete Nameserver: $ns" ;;
esac

echo "=== 2. E-Mail (muss den Umzug ueberlebt haben) ==="
mx=$(dig +short MX "$D" @1.1.1.1 | tr '\n' ' ')
case "$mx" in
  *smtpin.rzone.de*) gut "MX steht: $mx" ;;
  "")                weg "KEIN MX-EINTRAG - eingehende E-Mail ist tot. Sofort in Cloudflare nachtragen: MX $D -> smtpin.rzone.de (Prio 5)" ;;
  *)                 hm  "MX weicht ab: $mx" ;;
esac
dm=$(dig +short TXT "_dmarc.$D" @1.1.1.1)
[ -n "$dm" ] && gut "DMARC steht: $dm" || hm "DMARC fehlt (war: v=DMARC1;p=reject;)"

echo "=== 3. Erreichbarkeit & TLS ==="
for host in "$D" "www.$D"; do
  code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' -L "https://$host/")
  case "$code" in
    200) gut "https://$host -> 200" ;;
    000) weg "https://$host nicht erreichbar oder TLS fehlgeschlagen" ;;
    *)   hm  "https://$host -> $code" ;;
  esac
done
curl -s -o /dev/null -m 20 -w '' "https://$D/" 2>/dev/null \
  && gut "TLS-Zertifikat wird akzeptiert" \
  || weg "TLS-Zertifikat wird nicht akzeptiert (bei Cloudflare ggf. noch in Ausstellung)"

echo "=== 4. Security-Header (_headers) ==="
H=$(curl -sI -m 20 -L "https://$D/")
for h in "content-security-policy" "x-content-type-options" "x-frame-options" "referrer-policy" "permissions-policy"; do
  echo "$H" | grep -qi "^$h:" && gut "$h gesetzt" || weg "$h fehlt - liegt _headers mit im Upload?"
done
echo "$H" | grep -qi "^cache-control:.*must-revalidate" \
  && gut "index.html: must-revalidate" || hm "Cache-Control fuer index.html unerwartet"

echo "=== 5. Redirect (_redirects) ==="
rc=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://$D/tests.html")
[ "$rc" = "301" ] && gut "/tests.html -> 301" || hm "/tests.html liefert $rc (erwartet 301)"

echo "=== 6. Inhalt ==="
P=$(curl -s -m 25 -L "https://$D/")
echo "$P" | grep -q "calendly.com/nikan-heimkauf/45min" && gut "Termin-Link ist live" || weg "Termin-Link fehlt - alte Version online?"
echo "$P" | grep -q "heimkauf.de/impressum"            && gut "Impressum verlinkt"   || weg "Impressum-Link fehlt"
echo "$P" | grep -q "ENGINE START"                      && gut "Rechenlogik ausgeliefert" || weg "Rechenlogik fehlt"
ic=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://$D/immo-cousins-hero.png")
[ "$ic" = "200" ] && gut "Hero-Bild erreichbar" || weg "Hero-Bild -> $ic"
nf=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://$D/gibtesnicht-$(date +%s)")
[ "$nf" = "404" ] && gut "Unbekannte Pfade liefern 404" || hm "Unbekannter Pfad -> $nf (404.html fehlt im Upload?)"

echo
echo "=== Ergebnis: $ok ok, $warn Hinweise, $fail Fehler ==="
[ "$fail" -eq 0 ] && echo "Alles Wesentliche steht." || echo "Bitte die mit ✗ markierten Punkte beheben."
