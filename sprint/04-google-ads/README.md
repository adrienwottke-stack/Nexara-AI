# Google Ads: Einrichtung und Import

**Nichts hiervon kostet Geld, solange die Kampagnen pausiert sind.** Konto anlegen, Zahlungsdaten und Werbetreibenden-Bestätigung machst du selbst; aktiviert wird erst nach deiner Freigabe.

## Dateien
| Datei | Inhalt |
|---|---|
| `strategie.md` | Struktur, Keywords, Gebote, Budget-Szenarien, Tests, Abbruch-/Skalierungsregeln |
| `tracking.md` | Conversion-Tracking, Einwilligung, Offline-Import |
| `build-ads.mjs` | Quelle aller Keywords/Anzeigen, prüft Zeichenlimits, erzeugt die Import-Dateien |
| `1-kampagnen.csv` … `5-anzeigen.csv` | Import-Dateien für den Google Ads Editor (UTF-16, tabgetrennt; aktuell Szenario 500 €) |
| `keyword-recherche.csv` | Alle Keywords zum Eintragen von Suchvolumen und Gebotsspannen aus dem Keyword-Planer (Excel) |
| `offline-conversions-vorlage.csv` | Vorlage für den wöchentlichen Upload qualifizierter Leads/Abschlüsse |

Anderes Szenario erzeugen: `node sprint/04-google-ads/build-ads.mjs 300` (oder 500, 1000).

## 1. Konto (du selbst, ca. 30 Min)
- [ ] ads.google.com → Konto im **Expertenmodus** anlegen (nicht "Smart-Kampagne"; beim Assistenten "Ohne Kampagne fortfahren").
- [ ] Zeitzone **Europe/Berlin**, Währung **EUR** (nachträglich nicht änderbar).
- [ ] Abrechnung + Werbetreibenden-Bestätigung (Gewerbe Nexara).
- [ ] Monatliches Ausgabenlimit / Budget-Obergrenze setzen.
- [ ] **Automatisch angewendete Empfehlungen: alle aus** (Empfehlungen → Automatisch anwenden).
- [ ] Konto-Einstellungen → Tracking-Vorlage (siehe `tracking.md`), Auto-Tagging an.
- [ ] Conversion-Aktionen anlegen (`tracking.md`).

## 2. Import mit Google Ads Editor
1. Google Ads Editor installieren, Konto herunterladen.
2. **Konto → Importieren → Aus Datei** und in dieser Reihenfolge importieren:
   `1-kampagnen.csv` → `2-anzeigengruppen.csv` → `3-keywords.csv` → `4-negative-keywords.csv` → `5-anzeigen.csv`
   (Alternative: Datei in Excel öffnen, alles kopieren, im Editor "Mehrere Änderungen vornehmen" → "Aus Zwischenablage einfügen".)
3. Nach jedem Import die Vorschau prüfen; Fehler/Warnungen lesen.
4. Kampagneneinstellungen im Editor oder in der Weboberfläche **pro Kampagne prüfen bzw. setzen**:
   - [ ] Netzwerke: **nur Google-Suche** (Suchnetzwerk-Partner und Displaynetzwerk **aus**)
   - [ ] Standort: **Sachsen** (Tools-Kampagne: Deutschland, Österreich, Schweiz), Option **"Präsenz"**
   - [ ] Sprache: Deutsch
   - [ ] Gebotsstrategie: Manueller CPC (ohne "auto-optimierten CPC", falls angeboten)
   - [ ] **AI Max / Ausweitung der finalen URL / automatisch erstellte Assets: aus**
   - [ ] Anzeigenrotation: "Optimieren" (für Test 1 später "gleichmäßig")
   - [ ] Status: **Pausiert**
5. Assets anlegen (Sitelinks, Callouts, Snippets, siehe `strategie.md`).
6. **Änderungen veröffentlichen** (bleibt pausiert).

## 3. Vor dem Aktivieren
- [ ] Keyword-Planer: Suchvolumen + Gebotsspannen in `keyword-recherche.csv` eintragen. Keywords ohne messbares Volumen nicht löschen (Planer zeigt kleine Volumen oft nicht), aber Gebote an Spannen anpassen.
- [ ] Freigabe-Kriterien aus `../02-launchplan-14-tage.md` erfüllt.
- [ ] Budget-Szenario entschieden (Empfehlung: Start 300 €).
- [ ] **Deine Freigabe** → Kampagnen aktivieren.
