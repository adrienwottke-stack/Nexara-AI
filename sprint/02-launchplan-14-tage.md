# 14-Tage-Launchplan (Mi 25.11. bis Di 08.12.2026)

Grundregel: **Jeden Werktag mindestens 2 Stunden Akquise, bevor irgendetwas gebaut wird.** Alles andere ist zweitrangig.
Zeitbudget: ~28 Std./Woche. Wochenende = Vorbereitung, keine Anrufe.

## Ziele nach 14 Tagen
| Kennzahl | Ziel |
|---|---|
| Echte Entscheider-Kontakte (Gespräch, Brief, persönliche Nachricht) | ≥ 60 |
| Erstgespräche gebucht | ≥ 8 |
| Erstgespräche geführt | ≥ 5 |
| Prozessanalysen vereinbart (davon Gründungskunden) | ≥ 2 |
| Angebote versendet | ≥ 1 |
| Website live, Formular + Buchung + Tracking getestet | ja |
| Google-Ads-Kampagnen importiert, geprüft, **pausiert bis Freigabe** | ja |

Erster zahlender Kunde: **Ziel Tag 30 (24.12.)**, realistisch eher Anfang Januar wegen Weihnachtspause. Deshalb jedes Angebot bis 18.12. raus.

---

## Woche 1: Fundament + erste Gespräche

### Tag 1 · Mi 25.11. (4 Std.)
- [ ] 30 Min: Entscheidungen aus `01-strategie.md` Abschnitt 8 treffen (Garantie, Gründungskonditionen, Preise). Danach nicht mehr diskutieren.
- [ ] 90 Min: **"Warme 50"** anlegen in `05-crm/kontakte-import.csv`: Familie, Freunde mit Betrieben, TU-Kontakte, Ex-Kollegen, alle bisherigen Website-Kunden, Effectscope/Louis. Pro Person: Name, Betrieb, Branche, Beziehung.
- [ ] 60 Min: **10 persönliche Nachrichten** an die Wärmsten (Vorlage `03-vertrieb/vorlagen-nachrichten.md` → "Netzwerk"). Bitte um Empfehlung, nicht um Auftrag.
- [ ] 30 Min: Cal.com: Termintyp **"Prozess-Erstgespräch (30 Min)"** anlegen, 2 Fragen im Buchungsformular (Branche, Engpass), Weiterleitung nach Buchung auf `https://nexara-ai.de/automatisierung/danke/?typ=termin`. Link in `scripts/automation-content.mjs` (`site.cal`) eintragen.

### Tag 2 · Do 26.11. (4 Std.)
- [ ] 60 Min: Landingpages lesen, **alle Stellen mit `PRÜFEN`** in `scripts/automation-content.mjs` korrigieren (Erfahrung, Projekte). Nur Wahres bleibt stehen. Dann `npm run pages`.
- [ ] 60 Min: n8n-Workflow importieren (`05-crm/n8n-mailer-workflow.json`), Gmail und Google Sheets verbinden, Cloudflare-Secrets setzen (`06-cloudflare-umzug.md`). Testanfrage schicken.
- [ ] 45 Min: Datenschutzerklärung ergänzen (`05-crm/datenschutz-ergaenzungen.md`). **Ohne diesen Schritt kein Livegang des Formulars.**
- [ ] 15 Min: Deploy. Testbuchung + Testformular auf dem Handy.
- [ ] 60 Min: **Bestandskunden** (alle bisherigen Website-Kunden) anrufen: "Was kostet euch im Büro gerade am meisten Zeit?" Ziel: 2 Erstgespräche.

### Tag 3 · Fr 27.11. (4 Std.)
- [ ] 45 Min: Google-Tabelle "Nexara Pipeline" nach `05-crm/crm-prozess.md` anlegen. Warme 50 importieren.
- [ ] 2 Std: **Telefonblock Handwerk** (Liste `Nexara_Anrufliste_Handwerk_Bautzen.xlsx`), Leitfaden `03-vertrieb/telefon-leitfaden.md`. Ziel: 15 Entscheider erreicht, 2 Termine. Rechtlichen Hinweis im Leitfaden beachten.
- [ ] 45 Min: Nachrichten 11-25 ans Netzwerk.
- [ ] 30 Min: Follow-ups zu Tag 1.

### Tag 4 · Sa 28.11. (3 Std.)
- [ ] 90 Min: **Google-Ads-Konto** anlegen (du selbst: Konto, Rechnungsdaten, Werbetreibenden-Bestätigung). Conversions anlegen nach `04-google-ads/tracking.md`. Keyword-Planer: Volumen + Gebotsspannen in `04-google-ads/keyword-recherche.csv` eintragen, Sachsen + Deutschland.
- [ ] 45 Min: Google Ads Editor: CSVs importieren (Reihenfolge in `04-google-ads/README.md`). **Alles bleibt pausiert.**
- [ ] 45 Min: LinkedIn-Profil umstellen (Headline + Info, Vorlage `03-vertrieb/akquise-kanaele.md`, Abschnitt LinkedIn).

### Tag 5 · So 29.11. (3 Std.)
- [ ] 2 Std: **Briefwelle Hausverwaltungen vorbereiten**: 20 Verwaltungen (Startliste in `01-strategie.md` + jacasa.de + Google Maps Dresden/Bautzen/Görlitz). Pro Brief: 1 konkreter, beobachteter Bezug (Stellenanzeige, Größe). Vorlage `03-vertrieb/vorlagen-nachrichten.md` (Abschnitt Briefe).
- [ ] 60 Min: Erster LinkedIn-Post ("Warum ich Nexara gründe", ehrlich, ohne KI-Floskeln).

### Tag 6 · Mo 30.11. (4 Std.)
- [ ] 30 Min: 20 Briefe drucken, unterschreiben, einwerfen (Porto ~19 €).
- [ ] 2 Std: Telefonblock Handwerk (zweite Runde) + Rückrufe.
- [ ] 60 Min: Erstgespräche aus Woche 1 führen (Leitfaden `03-vertrieb/gespraechsleitfaden.md`).
- [ ] 30 Min: Kurz-Einschätzungen nach den Gesprächen versenden (Vorlage im Leitfaden). **Innerhalb von 24 Std.**

### Tag 7 · Di 01.12. (4 Std.)
- [ ] 60 Min: **Partnerliste**: 10 Steuerberater, 5 IT-Systemhäuser, 3 Webagenturen im Raum Dresden/Bautzen. Erste 5 anrufen/anschreiben (Vorlage "Partner").
- [ ] 2 Std: Erstgespräche + Kurz-Einschätzungen.
- [ ] 60 Min: **Wochenreview**: KPI-Woche in `Nexara_Vertriebs-Toolkit.xlsx` ausfüllen (Definitionen: `05-crm/kpi-dashboard.md`). Was hat Termine gebracht? Doppelt davon in Woche 2.
- [ ] **Entscheidung Google Ads**: Freigabe ja/nein + Budget (siehe Kriterien unten). Bei Ja: Kampagnen aktivieren.

## Woche 2: Gespräche → Analysen → erstes Angebot

### Tag 8 · Mi 02.12. (4 Std.)
- [ ] 2 Std: Telefon-Nachfass Hausverwaltungen (Brief kam an), Leitfaden-Variante HV.
- [ ] 60 Min: Erstgespräche.
- [ ] 60 Min: 15 Briefe an **Ingenieurbüros** Dresden vorbereiten.

### Tag 9 · Do 03.12. (4 Std.)
- [ ] 3 Std: **Erste Prozessanalyse** (Gründungskunde) mit Fragebogen `03-vertrieb/prozessanalyse-fragebogen.md`.
- [ ] 60 Min: Ads: Suchbegriffe prüfen, Negativ-Keywords ergänzen (falls live).

### Tag 10 · Fr 04.12. (4 Std.)
- [ ] 2 Std: Analysebericht + ROI-Rechnung (`Nexara_Vertriebs-Toolkit.xlsx`, Blatt ROI-Rechner) + **Festpreisangebot** (Vorlage `03-vertrieb/angebotsvorlage.md`).
- [ ] 60 Min: Angebot **persönlich** vorstellen (Termin, nicht nur per Mail).
- [ ] 60 Min: Telefonblock / Follow-ups.

### Tag 11 · Sa 05.12. (3 Std.)
- [ ] 90 Min: Ingenieurbüro-Briefe fertig + Versand Montag.
- [ ] 90 Min: Zweiter LinkedIn-Post (Beobachtung aus einem Erstgespräch, anonymisiert, mit Erlaubnis).

### Tag 12 · So 06.12. (2 Std.)
- [ ] 2 Std: Baustein-Vorlage für das erste wahrscheinliche Projekt vorbereiten (n8n-Grundgerüst), damit die Umsetzung nach Zusage sofort startet.

### Tag 13 · Mo 07.12. (4 Std.)
- [ ] 2 Std: Zweite Prozessanalyse.
- [ ] 60 Min: Netzwerk-Event dieser Woche suchen und anmelden (IHK Dresden, HWK Dresden, BVMW, Wirtschaftsjunioren Bautzen/Dresden, BNI). Termine ab Januar: VDIV Mitteldeutsches Verwalterforum 2027 prüfen.
- [ ] 60 Min: Follow-ups (Rhythmus in `03-vertrieb/follow-up.md`).

### Tag 14 · Di 08.12. (4 Std.)
- [ ] 60 Min: **Review 14 Tage**: KPIs pro Kanal und Zielgruppe. Entscheidungen:
  - Kanal mit Terminen → verdoppeln.
  - Zielgruppe ohne qualifiziertes Gespräch nach ≥ 30 Kontakten → Botschaft ändern; nach 40 → durch Reserve (Personaldienstleister) ersetzen.
  - Ads nach Abbruch-/Skalierungskriterien (`04-google-ads/strategie.md`).
- [ ] 2 Std: Akquise-Block.
- [ ] 60 Min: Plan Woche 3-4 (Ziel: 2 Angebote bis 18.12., erste Zahlung vor Weihnachten oder Projektstart 07.01.).

---

## Freigabe-Kriterien für Google Ads (Tag 7)
Aktivieren nur, wenn **alle** erfüllt sind:
1. Landingpages live, PageSpeed mobil ≥ 85, Formular und Buchung getestet.
2. Conversion "Termin gebucht" und "Anfrage gesendet" feuern (Test über Tag-Assistant, mit Einwilligung).
3. Datenschutzerklärung enthält Google Ads, Formular-Verarbeitung, Cal.com.
4. Negativ-Keyword-Liste ist auf allen Kampagnen.
5. Du kannst eine Anfrage innerhalb von 4 Arbeitsstunden beantworten.
6. Budget-Szenario gewählt und Monatslimit in der Abrechnung gesetzt.
