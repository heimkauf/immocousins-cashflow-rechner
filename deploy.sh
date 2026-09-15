#!/bin/sh
# Stellt in dist/ genau die Dateien zusammen, die live gehen sollen.
# Kein Build-Werkzeug – nur Kopieren, damit README, tests.html und dieses
# Skript nicht versehentlich mit auf die Produktivdomain wandern.
set -eu
cd "$(dirname "$0")"
rm -rf dist && mkdir dist
cp index.html 404.html _headers _redirects dist/
for f in immo-cousins-hero.png immo-cousins-hero.webp; do
  [ -f "$f" ] && cp "$f" dist/
done
echo "dist/ bereit:"
ls -1 dist
echo
echo "Diesen Ordner auf Cloudflare Pages hochladen (Upload assets)."
