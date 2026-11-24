# Google-Ads-Strategie

**Ziel:** Nicht Klicks oder Formulare, sondern **qualifizierte Erstgespräche und zahlende Kunden** zu vertretbaren Kosten. Ads sind im Sprint ein **Kanaltest**: Gibt es in Sachsen genug kaufbereite Suchanfragen für unsere Zielgruppen?

**Status: Alles vorbereitet, nichts aktiv.** Kampagnen werden pausiert importiert. Aktivierung nur nach deiner Freigabe (Kriterien im Launchplan, Tag 7).

## Prinzipien
1. **Nur Suchnetzwerk.** Kein Display, keine Suchpartner, kein Performance Max, kein "AI Max", kein Broad Match.
2. **Nur Phrase und Exact** mit klarer Dienstleister- oder Problemabsicht.
3. **Eine Kampagne pro Zielgruppe** mit eigener Landingpage. Budget pro Zielgruppe steuerbar.
4. **Manuelle Gebote** bis genug Conversions da sind (Smart Bidding braucht realistisch ≥ 15-30 Conversions/Monat; die haben wir nicht).
5. **Optimiert wird auf qualifizierte Leads und Abschlüsse** (Offline-Import aus HubSpot), nicht auf Formularabsendungen.
6. **Wöchentlich Suchbegriffe prüfen.** Jede irrelevante Suchanfrage wird Negativ-Keyword.

## Kampagnenstruktur

| Kampagne | Anzeigengruppen | Landingpage | Geo | Start-Max-CPC |
|---|---|---|---|---|
| NX \| Suche \| Hausverwaltung \| SN | HV Automatisierung · HV Digitalisierung · HV Abläufe | `/automatisierung/hausverwaltung/` | Sachsen | 3,50 € |
| NX \| Suche \| Handwerk \| SN | HW Digitalisierung · HW Büro und Angebote · HW Software-Einführung | `/automatisierung/handwerk/` | Sachsen | 3,00 € |
| NX \| Suche \| Prozessautomatisierung \| SN | PA Automatisierung Beratung · PA KI Automatisierung · PA Lokal | `/automatisierung/` | Sachsen | 4,00 € |
| NX \| Suche \| Tools n8n Make Zapier \| DACH | Tools n8n · Tools Make Zapier | `/automatisierung/` | DE, AT, CH | 4,00 € |
| *(Ingenieurbüro)* | keine Ads im ersten Monat, zu wenig Suchvolumen erwartet | `/automatisierung/ingenieurbuero/` | | |

Keywords, Negativ-Keywords und Anzeigentexte stehen vollständig in `build-ads.mjs` (Quelle) und den erzeugten Import-Dateien `1-…` bis `5-…`. Änderungen immer in `build-ads.mjs`, dann `node sprint/04-google-ads/build-ads.mjs 500` (Zahl = Budget-Szenario).

### Keyword-Logik (Auszug)
- **Hausverwaltung:** "hausverwaltung automatisieren", "hausverwaltung digitalisieren", "mieteranfragen automatisieren", "schadensmeldung digitalisieren", "ki für hausverwaltung" …
- **Handwerk:** "handwerksbetrieb digitalisieren", "digitalisierung handwerk beratung", "angebote schneller erstellen handwerk", "handwerkersoftware einführen" …
- **Allgemein:** "prozessautomatisierung beratung", "geschäftsprozesse automatisieren lassen", "workflow automatisierung agentur", "ki beratung dresden", "digitalisierungsberatung sachsen" …
- **Tools (DACH):** "n8n agentur", "n8n experte", "zapier experte", "make.com agentur" …

### Negativ-Keywords (alle Kampagnen)
Jobs/Karriere (job, gehalt, ausbildung, praktikum, werkstudent, bachelorarbeit …), Lernen (kurs, seminar, tutorial, youtube, pdf, definition, was ist …), Gratis/DIY (vorlage, template, open source, github, freeware, kostenlos download), Recherche (erfahrungen, forum, reddit), privat.
Kampagnenspezifisch, z. B. Hausverwaltung: "hausverwaltung gesucht", "wohnung", "mietvertrag", "kündigung"; Handwerk: "handwerker finden", "meisterschule", "vergleich", "kostenlose software"; Tools: "download", "docker", "self hosted", "pricing", "login".

### Anzeigen
Eine responsive Suchanzeige pro Anzeigengruppe: 15 Titel, 4 Beschreibungen. Die drei gruppenspezifischen Titel (Keyword-nah) sind auf Position 1 gepinnt, Google rotiert zwischen ihnen. Die restlichen 12 Titel sind frei.
Inhaltliche Leitplanken (UWG und Google-Richtlinien): keine Einsparversprechen, keine Superlative ohne Beleg, keine Ausrufezeichen in Titeln, keine fremden Marken im Anzeigentext außer in der Tool-Kampagne (wird ggf. abgelehnt, dann umformulieren).

Beispiel Hausverwaltung:
> **Hausverwaltung automatisieren | Weniger Zeit im Postfach | Kostenloses Erstgespräch**
> Mieteranfragen sortieren, Schäden erfassen, Belege zuordnen. Angebunden an Ihre Software. 30 Min. kostenlos: Danach wissen Sie, ob sich Automatisierung für Ihre Verwaltung lohnt.

### Assets (manuell im Konto anlegen)
- **Sitelinks:** Für Hausverwaltungen · Für Handwerksbetriebe · Preise (`#preise`) · So arbeite ich (`#ablauf`)
- **Callouts:** Kostenloses Erstgespräch · Festpreise je Etappe · Vor Ort in Sachsen · Nutzen vorab gerechnet · AV-Vertrag nach DSGVO
- **Snippets** (Leistungen): Prozessanalyse, Automatisierung, Software-Anbindung, Betreuung
- **Anruf-Asset** nur, wenn du werktags erreichbar bist. Sonst weglassen.
- **Automatisch erstellte Assets: aus** (damit Google keine Versprechen formuliert, die wir nicht machen).

## Landingpage-Zuordnung
Jede Kampagne hat ihre eigene Seite mit passender Überschrift, passendem Wertstrom-Beispiel und passender FAQ. Die Überschrift der Seite greift die Sprache der Keywords auf ("Hausverwaltung", "Angebote", "Postfach").
Primäre Conversion: Termin über Cal.com. Sekundär: Formular. Beides endet auf `/automatisierung/danke/`.

## Geografisches Targeting
- Sachsen, Option **"Präsenz: Personen, die sich in Ihren Zielregionen befinden oder regelmäßig dort aufhalten"** (nicht "Interesse").
- Tools-Kampagne: Deutschland, Österreich, Schweiz.
- Nach 4 Wochen: Wenn Sachsen-Volumen zu klein ist, Thüringen, Brandenburg (Süd) und Sachsen-Anhalt ergänzen, bevor das Budget steigt.
- Sprache: Deutsch.

## Gebotsstrategie
- **Start: Manueller CPC**, Start-Gebote siehe Tabelle.
- Wöchentlich: Keywords mit > 30 Klicks ohne Lead → Gebot −20 % oder pausieren. Keywords mit Leads und Impression-Anteil < 50 % → Gebot +15 %.
- Wechsel auf **"Conversions maximieren" mit Ziel-CPA** erst, wenn **≥ 15 qualifizierte Leads (Offline-Import) in 30 Tagen**. Vorher nicht.
- Werbezeitplan: anfangs **alle Tage, ganztägig** (Handwerksinhaber suchen oft abends und am Wochenende). Nach 4 Wochen anhand der Stundenauswertung einschränken.
- **Pause 20.12.2026 bis 04.01.2027**: Entscheider sind im Urlaub, Gespräche kommen nicht zustande. Neustart 05.01.

## Budget-Szenarien

**Annahmen (ausdrücklich Schätzungen, ohne Kontodaten):**

| Annahme | pessimistisch | erwartet | optimistisch |
|---|---|---|---|
| Ø Klickpreis | 5,00 € | 3,50 € | 2,50 € |
| Klick → Lead | 2 % | 4 % | 6 % |
| Lead → qualifiziert | 50 % | 60 % | 70 % |
| qualifiziert → Erstgespräch | 70 % | 80 % | 90 % |
| Erstgespräch → Abschluss | 15 % | 25 % | 35 % |
| Ø erster Auftrag | 2.000 € | 2.500 € | 3.000 € |
| Variable Projektkosten | 5 % | 5 % | 5 % |
| Kunden mit Betreuung / Preis | 30 % / 149 € | 40 % / 249 € | 50 % / 349 € |

**Ergebnis pro Monat, Szenario "erwartet":**

| | 300 €/Monat | 500 €/Monat | 1.000 €/Monat |
|---|---|---|---|
| Kampagnen (Tagesbudget) | HV 5 €, HW 5 € | HV 6,50 €, HW 6,50 €, PA 3,50 € | HV 10 €, HW 9 €, PA 7 €, Tools 7 € |
| Klicks | 86 | 143 | 286 |
| Leads | 3,4 | 5,7 | 11,4 |
| Qualifizierte Leads | 2,1 | 3,4 | 6,9 |
| Erstgespräche | 1,6 | 2,7 | 5,5 |
| Abschlüsse | 0,41 | 0,69 | 1,37 |
| CAC (Kosten pro Kunde) | 729 € | 729 € | 729 € |
| Kosten pro qualifiziertem Lead | 146 € | 146 € | 146 € |
| Umsatz erster Auftrag | 1.029 € | 1.714 € | 3.429 € |
| Deckungsbeitrag I (Umsatz − Ads − var. Kosten) | 677 € | 1.129 € | 2.257 € |
| DB inkl. 12 Monate Betreuung | 1.169 € | 1.948 € | 3.896 € |

**Spannweite (pessimistisch ↔ optimistisch):** CAC 4.762 € ↔ 189 €. Deckungsbeitrag I bei 500 €: −301 € ↔ 7.041 €. Die Spanne zeigt, warum getestet werden muss: Ohne Kontodaten ist jede Prognose eine Annahme.

**Lesart:**
- 0,41 Abschlüsse heißt: im Schnitt **ein Kunde alle 2-3 Monate** aus 300 €/Monat.
- **Zeitverzug:** Zwischen Klick und Auftrag liegen meist 3-8 Wochen. Im ersten Monat ist Ads-Umsatz unwahrscheinlich.
- **Sättigung:** Das Modell ist linear. Bei 1.000 € reicht das Suchvolumen in Sachsen wahrscheinlich nicht; deshalb kommt die DACH-Tools-Kampagne dazu, bei der die Konkurrenz härter ist.
- Deckungsbeitrag **ohne** deine Arbeitszeit (ein Auftrag à 2.500 € kostet dich ca. 20-28 Std.).

**Break-even-Regel (erwarteter Funnel):** Ein Auftrag bringt ~2.375 € Deckungsbeitrag. Damit sich Ads tragen, muss bei 3,50 € CPC **mindestens jeder 80. Klick zu einer Anfrage** werden (≈ 1,2 %). Bei 5 € CPC jeder 57. (≈ 1,75 %).

Alle Werte sind als Formeln im Blatt **"Ads-Szenarien"** von `../Nexara_Vertriebs-Toolkit.xlsx` hinterlegt. Gelbe Annahmen nach 4 Wochen durch echte Werte ersetzen.

### Empfehlung
1. **Start mit 300 €/Monat** (nur Hausverwaltung + Handwerk), sobald die Freigabe-Kriterien erfüllt sind. Ziel der ersten 4 Wochen: Suchbegriffsqualität und erste Leads, nicht CAC.
2. **Auf 500 € erhöhen**, wenn nach 4 Wochen **≥ 2 qualifizierte Leads aus Ads** kamen und der Suchbegriffsbericht sauber ist (≥ 70 % der Kosten auf relevanten Suchen).
3. **1.000 €** erst nach dem **ersten Ads-Kunden** und CAC-Schätzung < 1.000 €.
4. Monatslimit in der Abrechnung setzen. Prüfen, ob Google für Neukunden aktuell eine Startgutschrift anbietet (Bedingungen im Konto ansehen, nicht darauf planen).

## A/B-Tests (in dieser Reihenfolge, immer nur eine Variable)
Bei kleinen Budgets sind echte Signifikanztests kaum möglich. Deshalb: wenige, große Unterschiede testen, nacheinander, mit Mindestmengen.

| # | Test | Variante A | Variante B | Entscheiden nach |
|---|---|---|---|---|
| 1 | Anzeigenwinkel | Schmerz ("Weniger Zeit im Postfach") | Rechnung ("Nutzen vorab durchgerechnet") | je ≥ 1.000 Impressionen; Kriterium CTR, dann Lead-Rate |
| 2 | Primärer CTA auf der LP | "Erstgespräch buchen" (Kalender) | "Rückruf anfordern" (Formular oben) | je ≥ 100 Klicks; Kriterium Leads pro Klick |
| 3 | Hero-Überschrift HV | "Weniger Postfach. Mehr Verwaltung." | "Ihr Sammelpostfach kostet eine halbe Stelle?" | je ≥ 100 Klicks |
| 4 | Angebot | Kostenloses Erstgespräch | Kostenlose Kurz-Einschätzung per Video (5 Min, ohne Termin) | je ≥ 150 Klicks |

Test 1 über eine zweite responsive Suchanzeige mit anderen gepinnten Titeln (Kampagneneinstellung Anzeigenrotation "optimieren" ausschalten → "gleichmäßig"). Tests 2-4 nacheinander je 3-4 Wochen (sequenziell, saisonale Effekte beachten).

## Abbruch- und Skalierungskriterien

| Situation | Aktion |
|---|---|
| CTR < 3 % nach 500 Impressionen (Anzeigengruppe) | Anzeigentexte überarbeiten, Keywords prüfen |
| > 30 % der Kosten auf irrelevante Suchbegriffe | Negativ-Keywords ergänzen, Phrase → Exact |
| **100 Klicks ohne einen Lead** (Kampagne) | Landingpage und Suchbegriffe prüfen, Gebote −20 % |
| **200 Klicks oder 600 € ohne qualifizierten Lead** (Kampagne) | **Kampagne pausieren**, Botschaft/Zielgruppe überdenken |
| Kosten pro qualifiziertem Lead > 300 € nach ≥ 3 qualifizierten Leads | Gebote senken, schwache Keywords pausieren |
| **Insgesamt 1.000 € Ads-Kosten ohne Abschluss und ohne Angebot in Phase 5** | **Ads komplett pausieren**, Budget in Direktakquise |
| ≥ 2 qualifizierte Leads in 4 Wochen, saubere Suchbegriffe | Budget von 300 € auf 500 € |
| CAC (Ads) ≤ 800 € und ≥ 2 Abschlüsse aus Ads | Budget +25 % alle 2 Wochen, solange Kosten pro qualifiziertem Lead ≤ 200 € bleiben |
| Impression-Anteil > 80 %, Budget nicht ausgeschöpft | Geo erweitern (Nachbarländer), dann neue Keywords |

## Wöchentliche Routine (30 Min, montags)
1. Suchbegriffsbericht → Negativ-Keywords.
2. Kosten, Klicks, Leads, qualifizierte Leads je Kampagne → `KPI-Woche`.
3. Gebote nach Regeln oben.
4. HubSpot: Leads mit GCLID qualifiziert/gewonnen? → Offline-Import (siehe `tracking.md`).
5. Abbruch-/Skalierungstabelle durchgehen, Entscheidung notieren.
