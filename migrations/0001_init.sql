-- Verzeichnis-Einträge und Website-Anfragen
CREATE TABLE IF NOT EXISTS eintraege (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kategorie TEXT NOT NULL,
  gemeinde TEXT NOT NULL,
  ortsteil TEXT,
  strasse TEXT,
  plz TEXT,
  kurz TEXT NOT NULL,
  beschreibung TEXT NOT NULL,
  leistungen TEXT,
  telefon TEXT,
  email_oeffentlich TEXT,
  website TEXT,
  oeffnungszeiten TEXT,
  kontakt_name TEXT NOT NULL,
  kontakt_email TEXT NOT NULL,
  marketing_ok INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unbestaetigt', -- unbestaetigt | wartend | aktiv | abgelehnt | entfernt
  quelle TEXT NOT NULL DEFAULT 'betrieb',      -- betrieb | redaktion | eigen
  hinweis TEXT,
  token TEXT,
  ip_hash TEXT,
  erstellt_am TEXT NOT NULL,
  bestaetigt_am TEXT,
  freigegeben_am TEXT,
  aktualisiert_am TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_eintraege_status ON eintraege (status);
CREATE INDEX IF NOT EXISTS idx_eintraege_kat ON eintraege (kategorie, status);
CREATE INDEX IF NOT EXISTS idx_eintraege_gem ON eintraege (gemeinde, status);
CREATE INDEX IF NOT EXISTS idx_eintraege_token ON eintraege (token);

CREATE TABLE IF NOT EXISTS anfragen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zeit TEXT NOT NULL,
  name TEXT NOT NULL,
  unternehmen TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT,
  branche TEXT,
  mitarbeiter TEXT,
  engpass TEXT NOT NULL,
  rueckruf TEXT,
  seite TEXT,
  attribution TEXT,
  consent_ads INTEGER NOT NULL DEFAULT 0,
  weitergeleitet INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT
);
