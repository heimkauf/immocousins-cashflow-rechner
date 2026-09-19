#!/bin/sh
# Zeigt die gesammelten Leads oder exportiert sie.
#   ./leads.sh          letzte 50 Leads als Tabelle
#   ./leads.sh csv      alles nach leads.csv (Excel-tauglich)
#   ./leads.sh anzahl   nur die Anzahl
set -eu
cd "$(dirname "$0")"

DB=immocousins-leads
MODUS="${1:-liste}"

case "$MODUS" in
  anzahl) SQL="SELECT COUNT(*) AS leads FROM leads;" ;;
  csv)    SQL="SELECT * FROM leads ORDER BY id;" ;;
  *)      SQL="SELECT id, erstellt, quelle, vorname, nachname, email, telefon FROM leads ORDER BY id DESC LIMIT 50;" ;;
esac

npx --yes wrangler@4 d1 execute "$DB" --remote --command "$SQL" --json -y 2>/dev/null \
  | node leads-format.js "$MODUS"
