-- Verkaeufer-Leads. Dieselbe Anweisung fuehrt die Function beim
-- ersten Verkaufslead aus (CREATE TABLE IF NOT EXISTS). Dieses Skript
-- ist die lesbare Fassung fuer ein manuelles Anlegen in D1.
-- Nicht automatisch gegen die Produktion ausfuehren.

CREATE TABLE IF NOT EXISTS leads_verkauf (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  erstellt TEXT NOT NULL,
  vorname TEXT,
  nachname TEXT,
  email TEXT NOT NULL,
  telefon TEXT,
  telefon_einwilligung INTEGER NOT NULL DEFAULT 0,
  einwilligung INTEGER NOT NULL,
  weg TEXT,
  score TEXT,
  plz TEXT,
  ort TEXT,
  art TEXT,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_verkauf_erstellt ON leads_verkauf(erstellt);
