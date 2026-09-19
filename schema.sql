CREATE TABLE IF NOT EXISTS leads (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  erstellt     TEXT    NOT NULL,
  quelle       TEXT    NOT NULL,   -- 'rechner' oder 'kontakt'
  vorname      TEXT,
  nachname     TEXT,
  email        TEXT    NOT NULL,
  telefon      TEXT,
  nachricht    TEXT,
  einwilligung INTEGER NOT NULL    -- 1 = Datenschutzhinweis bestaetigt
);
CREATE INDEX IF NOT EXISTS idx_leads_erstellt ON leads(erstellt);
