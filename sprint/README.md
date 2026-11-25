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
| `05-crm/` | HubSpot-Pipeline, KPI-Definitionen, n8n-Workflow Formular → HubSpot, Datenschutz-Ergänzungen, Kontakt-Importvorlage |
| `Nexara_Vertriebs-Toolkit.xlsx` | ROI-Rechner, KPI-Woche, Dashboard mit Zielkurve, Ads-Budget-Szenarien |

## Website (im Repo)
- Seiten: `/automatisierung/` (Überblick), `/automatisierung/hausverwaltung/`, `/automatisierung/handwerk/`, `/automatisierung/ingenieurbuero/`, `/automatisierung/danke/`
- Inhalte ändern: `scripts/automation-content.mjs`, dann `npm run pages` (läuft bei `npm run build` automatisch mit).
- Gestaltung: `src/automation.css`, Verhalten (Umschalter, Rechner, Formular, Einwilligung): `src/automation.ts`.
- Konfiguration: `.env` nach Vorlage `.env.example` (Formular-Webhook, Google-Ads-IDs).

## Vor Livegang (Blocker)
Erledigt am 25.11.2026: Erfahrungsliste bestätigt, FAQ-Datenschutzantwort an dein Setup angepasst (n8n auf Google Cloud EU), Preise/Garantie/Gründungskonditionen bestätigt, Cal.com-Link gesetzt, Datenschutzerklärung ergänzt, Impressum mit USt-IdNr. und aktuellen Gesetzesverweisen.

Noch offen (nur du kannst das):
- [ ] **Cal.com:** Termintyp "Prozess-Erstgespräch", 30 Min, Kurz-URL `prozess-erstgespraech`, Weiterleitung auf die Danke-Seite (`05-crm/crm-prozess.md`, Abschnitt Kalender). Bis dahin führt der Buchungsknopf auf eine Fehlerseite.
- [ ] **HubSpot-Konto mit EU-Rechenzentrum** anlegen, dann n8n-Workflow importieren, `VITE_LEAD_ENDPOINT` setzen, Testanfrage durchspielen.
- [ ] **Auftragsverarbeitungsverträge** der Dienste akzeptieren und **Vercel-Tarif** prüfen (`05-crm/datenschutz-ergaenzungen.md`).
- [ ] AV-Vertrag-Vorlage für Kunden, bevor das erste Umsetzungsprojekt startet.

## Nicht automatisch getestet
- Einwilligungs-Hinweis und Conversion-Events (erst mit echter Google-Ads-ID testbar, siehe `04-google-ads/tracking.md`).
- n8n-Workflow (Knotenversionen können je nach n8n-Version abweichen; nach Import einmal mit Testdaten durchlaufen lassen).
- Excel-Formeln rechnen beim ersten Öffnen in Excel.
