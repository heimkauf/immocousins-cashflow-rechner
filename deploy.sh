#!/bin/sh
# Stellt in dist/ genau die Dateien zusammen, die live gehen sollen.
# Kopiert, was live gehen soll. Der Verkäufer-Funnel wird vorher aus
# scripts/build-seiten.mjs nachgebaut. README, tests.html und die Skripte
# bleiben außen vor.
#
# Struktur: Der Rechner liegt unter /cashflowrechner/, damit die Wurzel der
# Domain fuer eine spaetere Hauptseite frei bleibt.
set -eu
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/cashflowrechner

# Wurzel: Startseite, Fehlerseite und Konfiguration
cp startseite.html dist/index.html
mkdir -p dist/datenschutz && cp datenschutz.html dist/datenschutz/index.html
node scripts/build-seiten.mjs

cp 404.html robots.txt _headers _redirects sitemap.xml dist/
for f in immo-cousins-hero.png immo-cousins-hero.webp; do
  [ -f "$f" ] && cp "$f" dist/
done

# Anleitungsvideo und Standbild
mkdir -p dist/cashflowrechner/video
cp video/anleitung.mp4 video/anleitung-standbild.webp dist/cashflowrechner/video/

# Der Rechner selbst
cp index.html dist/cashflowrechner/
for f in immo-cousins-hero.png immo-cousins-hero.webp; do
  [ -f "$f" ] && cp "$f" dist/cashflowrechner/
done

# Verkäufer-Funnel: SEO-Seiten und die gemeinsamen Dateien.
# tool-inhalt.html ist nur die Bauvorlage und geht nicht mit.
while IFS= read -r pfad; do
  [ -n "$pfad" ] || continue
  rel=${pfad#/}
  rel=${rel%/}
  mkdir -p "dist/$rel"
  cp "$rel/index.html" "dist/$rel/index.html"
done < verkaufen-seiten.txt
mkdir -p dist/verkaufen
cp verkaufen/basis.css verkaufen/funnel.js verkaufen/tipp.js verkaufen/danke.js verkaufen/track.js dist/verkaufen/

echo "dist/ bereit:"
find dist -type f | sed 's|^dist/|  |' | sort
echo
echo "Deploy:  npx wrangler pages deploy dist --project-name=immocousins-rechner"
