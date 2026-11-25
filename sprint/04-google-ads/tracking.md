# Conversion-Tracking (datenschutzkonform)

## Wie die Website es umsetzt (bereits eingebaut)
- Ohne `VITE_GADS_ID` in `.env`: **kein Google-Code, kein Cookie-Hinweis.**
- Mit `VITE_GADS_ID`: Hinweis "Messung von Google-Anzeigen" mit gleichwertigen Knöpfen "Ablehnen" / "Erlauben". **Vor der Zustimmung wird kein Google-Skript geladen** (Consent Mode "basic"). Personalisierte Werbung bleibt aus (`ad_personalization: denied`).
- Mit Zustimmung: gtag.js lädt, GCLID und UTM-Parameter werden 90 Tage im Browser gespeichert und mit dem Formular an den Worker (Datenbank) und die CRM-Tabelle übergeben.
- Conversions feuern **nur auf der Danke-Seite** (`/automatisierung/danke/?typ=anfrage` bzw. `?typ=termin`), einmal pro Sitzung.
- Widerruf: Link "Cookie-Einstellungen" im Footer.

## Einrichtung im Google-Ads-Konto
1. **Ziele → Conversions → Neue Conversion-Aktion → Website → Manuell einrichten**
   - "Anfrage gesendet": Kategorie *Lead-Formular senden*, Wert: keinen, Zählung: *Eine*, Klick-Zeitraum 90 Tage, **primär**.
   - "Termin gebucht": Kategorie *Termin buchen*, sonst wie oben, **primär**.
   - Bei "Tag einrichten" → "Google-Tag selbst installieren" → **Conversion-ID (AW-…)** und **Conversion-Label** ablesen.
2. In `.env` eintragen:
   ```
   VITE_GADS_ID=AW-XXXXXXXXXX
   VITE_GADS_LABEL_LEAD=xxxxxxxxxxxxxxxxx
   VITE_GADS_LABEL_BOOKING=yyyyyyyyyyyyyyyyy
   ```
   Dann `npm run build` und deployen.
3. **Offline-Conversions** (der eigentliche Optimierungshebel):
   - "Qualifizierter Lead": Ziele → Conversions → Neu → **Import → CRMs, Dateien oder andere Datenquellen → Klicks erfassen**, Kategorie *Qualifizierter Lead*. Anfangs **sekundär**, ab ≥ 15/Monat primär.
   - "Kunde gewonnen": wie oben, Kategorie *Konvertierter Lead*, mit Wert (Auftragswert netto).
4. **Tracking-Vorlage** (Konto → Einstellungen → Tracking):
   `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}&utm_content={adgroupid}`
   Auto-Tagging (GCLID) eingeschaltet lassen.
5. **Test:** Seite mit `?gclid=TEST123` öffnen → "Erlauben" → Formular absenden → Danke-Seite. Im Google Tag Assistant muss das Conversion-Event erscheinen; in der CRM-Tabelle steht in der Spalte GCLID `TEST123`. Testkontakt danach löschen.
6. Cal.com: Weiterleitung nach Buchung auf `https://nexara-ai.de/automatisierung/danke/?typ=termin`, **ohne** Weitergabe von Buchungsdaten in der URL.

## Offline-Import (wöchentlich, 10 Min)
CRM-Tabelle: Zeilen filtern, die eine GCLID haben und die diese Woche "Qualifiziert" oder "Gewonnen" erreicht haben. Export → in dieses Format bringen → in Google Ads hochladen (Ziele → Conversions → Uploads).

Datei `offline-conversions-vorlage.csv`:
```
Parameters:TimeZone=Europe/Berlin
Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
TEST123,Qualifizierter Lead,2026-12-03 14:00:00,300,EUR
TEST123,Kunde gewonnen,2026-12-18 10:00:00,2500,EUR
```
Nur GCLIDs von Kontakten verwenden, die der Messung zugestimmt haben (das Formular übergibt die GCLID ohnehin nur mit Zustimmung). Klicks älter als 90 Tage werden nicht mehr zugeordnet.

**Später automatisieren:** n8n-Workflow (wöchentlich): Tabellen-Abfrage → CSV → Upload über die Google Ads API oder geplanten Datei-Upload. Erst bauen, wenn Ads nach 4 Wochen weiterlaufen.
