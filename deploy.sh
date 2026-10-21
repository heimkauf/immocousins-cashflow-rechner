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
for d in immobilie-verkaufen-koeln hausbewertung-koeln mehrfamilienhaus-verkaufen-koeln \
         erbimmobilie-verkaufen-koeln wohnung-verkaufen-koeln tippgeber impressum; do
  mkdir -p "dist/$d"
  cp "$d/index.html" "dist/$d/index.html"
done
mkdir -p dist/verkaufen/fonts dist/verkaufen/bilder
cp verkaufen/basis.css verkaufen/funnel.js verkaufen/tipp.js verkaufen/motion.js dist/verkaufen/
cp verkaufen/fonts/*.woff2 dist/verkaufen/fonts/
cp verkaufen/bilder/*.webp dist/verkaufen/bilder/

echo "dist/ bereit:"
find dist -type f | sed 's|^dist/|  |' | sort
echo
echo "Deploy:  npx wrangler pages deploy dist --project-name=immocousins-rechner"
