# Nexara Sprint (24.11.2026 bis 15.03.2027)

Ziel: 10.000 € bezahlter Umsatz, erste zahlende Kunden in 30 Tagen, Aufbau wiederkehrender Einnahmen.

## Hier anfangen
1. `01-strategie.md` lesen, **Abschnitt 8 (offene Entscheidungen)** treffen.
2. `02-launchplan-14-tage.md` ab morgen abarbeiten.
3. Jeden Montag `Nexara_Vertriebs-Toolkit.xlsx` → Blatt "KPI-Woche".

## Inhalt
| Ordner/Datei | Wofür |
|---|---|
| `01-strategie.md` | Geschäftsmodell-Kritik, Zielgruppen-Scoring, kaufbereite Kunden, Positionierung, Angebot, Preise, Qualifizierung |
| `02-launchplan-14-tage.md` | Tagesplan 25.11. bis 08.12. mit Zielen und Ads-Freigabekriterien |
| `03-vertrieb/` | Gesprächsleitfaden, Telefonleitfaden, Prozessanalyse-Fragebogen, ROI-Methode, Angebotsvorlagen, Follow-up, Akquisekanäle (inkl. Rechtsrahmen), Nachrichten- und Briefvorlagen |
| `04-google-ads/` | Strategie, Tracking, Import-Dateien für den Ads Editor (pausiert), Keyword-Recherche |
| `05-crm/` | CRM als Google-Tabelle (Vorlagen), KPI-Definitionen, n8n-Mailer-Workflow, Datenschutz-Stand, Kontakt-Importvorlage |
| `06-cloudflare-umzug.md` | Umzug von Vercel zu Cloudflare in 8 Schritten mit `npm run cf:setup`, `cf:check`, `cf:domain`; Zonendatei `06-dns-zone-nexara-ai.de.txt` für den DNS-Import |
| `07-verzeichnis.md` | Verzeichnis „Aus der Region“: Konzept, ehrliche Erwartung an KI-Suche, Wachstumsplan 50 Einträge, Pflege |
| `08-gratis-tools/` | Interaktive Gratis-Tools (Schadensmelder, Sprach-Regiebericht u. a.): Spezifikation, Startplan ab 26.11., Leadliste Hausverwaltungen für Briefwelle 1 |
| `Nexara_Vertriebs-Toolkit.xlsx` | ROI-Rechner, KPI-Woche, Dashboard mit Zielkurve, Ads-Budget-Szenarien |

## Website (im Repo)
- Seiten: `/automatisierung/` (Überblick), `/automatisierung/hausverwaltung/`, `/automatisierung/handwerk/`, `/automatisierung/ingenieurbuero/`, `/automatisierung/danke/`
- Inhalte ändern: `scripts/automation-content.mjs`, dann `npm run pages` (läuft bei `npm run build` automatisch mit).
- Gestaltung: `src/automation.css`, Verhalten (Umschalter, Rechner, Formular, Einwilligung): `src/automation.ts`.
- Konfiguration: `.env` nach Vorlage `.env.example` (Google-Ads-IDs), Cloudflare-Secrets laut `06-cloudflare-umzug.md`.
- Server-Teil (Formular, Verzeichnis, llms.txt): `worker/`, Datenbank-Schema: `migrations/`, Einstellungen: `wrangler.jsonc`. Lokal testen: `npm run db:migrate:local`, dann `npm run cf:dev` und `npm run cf:check`. Deploy: `npm run cf:deploy` (aus dem letzten Commit, nicht Committetes bleibt lokal).

## Vor Livegang (Blocker)
Erledigt am 25.11.2026: Erfahrungsliste bestätigt, FAQ-Datenschutzantwort an dein Setup angepasst (n8n auf eigenem Server in der EU, seit 26.11. Hetzner), Preise/Garantie/Gründungskonditionen bestätigt, Cal.com-Link gesetzt, Datenschutzerklärung ergänzt, Impressum mit USt-IdNr. und aktuellen Gesetzesverweisen.

Noch offen (nur du kannst das):
- [ ] **Cal.com:** Termintyp "Prozess-Erstgespräch", 30 Min, Kurz-URL `prozess-erstgespraech`, Weiterleitung auf die Danke-Seite (`05-crm/crm-prozess.md`, Abschnitt Kalender). Bis dahin führt der Buchungsknopf auf eine Fehlerseite.
- [ ] **Cloudflare-Umzug** nach `06-cloudflare-umzug.md`, Abschnitt "Morgen in dieser Reihenfolge" (Konto und Zonendatei, Nameserver, `npm run cf:setup`, n8n, `npm run cf:domain`, KI-Crawler erlauben).
- [ ] **Google-Tabelle "Nexara Pipeline"** anlegen und **n8n-Mailer** importieren (`05-crm/crm-prozess.md`). Kein HubSpot nötig.
- [ ] **Auftragsverarbeitungsverträge** der Dienste akzeptieren (`05-crm/datenschutz-ergaenzungen.md`).
- [ ] AV-Vertrag-Vorlage für Kunden, bevor das erste Umsetzungsprojekt startet.
- [ ] **Gratis-Tools:** Anthropic-API-Key mit Ausgabenlimit, Turnstile-Widget, Datenschutz-Abschnitt für die Tools (`08-gratis-tools/README.md`).

## Nicht automatisch getestet
- Einwilligungs-Hinweis und Conversion-Events (erst mit echter Google-Ads-ID testbar, siehe `04-google-ads/tracking.md`).
- n8n-Workflow (Knotenversionen können je nach n8n-Version abweichen; nach Import einmal mit Testdaten durchlaufen lassen).
- Excel-Formeln rechnen beim ersten Öffnen in Excel.
