#!/bin/sh
# Stellt in dist/ genau die Dateien zusammen, die live gehen sollen.
# Kein Build-Werkzeug - nur Kopieren, damit README, tests.html und dieses
# Skript nicht versehentlich mit auf die Produktivdomain wandern.
#
# Struktur: Der Rechner liegt unter /cashflowrechner/, damit die Wurzel der
# Domain fuer eine spaetere Hauptseite frei bleibt.
set -eu
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/cashflowrechner

# Wurzel: Startseite, Fehlerseite und Konfiguration
cp startseite.html dist/index.html
mkdir -p dist/datenschutz && cp datenschutz.html dist/datenschutz/index.html
cp 404.html robots.txt _headers _redirects dist/
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

echo "dist/ bereit:"
find dist -type f | sed 's|^dist/|  |' | sort
echo
echo "Deploy:  npx wrangler pages deploy dist --project-name=immocousins-rechner"
