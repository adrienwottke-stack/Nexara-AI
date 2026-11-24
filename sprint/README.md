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

## Vor Livegang prüfen (Blocker)
- [ ] Alle `PRÜFEN`-Stellen in `scripts/automation-content.mjs`: Erfahrungsliste, Datenschutz-Antwort in der FAQ, Cal.com-Link.
- [ ] Cal.com-Termintyp "Prozess-Erstgespräch (30 Min)" mit Weiterleitung auf die Danke-Seite.
- [ ] n8n-Workflow aktiv, `VITE_LEAD_ENDPOINT` gesetzt, Testanfrage kommt in HubSpot an.
- [ ] `datenschutz.html` um Formular, HubSpot, n8n, Cal.com, Google Ads ergänzt (`05-crm/datenschutz-ergaenzungen.md`).
- [ ] Impressum: USt-ID nachgetragen (war noch offen).
- [ ] AV-Vertrag-Vorlage für Kunden bereit, bevor das erste Projekt startet.
- [ ] Preise, Garantie, Gründungskonditionen bestätigt (stehen so auf der Website).

## Nicht automatisch getestet
- Einwilligungs-Hinweis und Conversion-Events (erst mit echter Google-Ads-ID testbar, siehe `04-google-ads/tracking.md`).
- n8n-Workflow (Knotenversionen können je nach n8n-Version abweichen; nach Import einmal mit Testdaten durchlaufen lassen).
- Excel-Formeln rechnen beim ersten Öffnen in Excel.
