# CRM-Prozess (kostenlos: Google-Tabelle + Datenbank)

Kein HubSpot, keine Lizenzkosten. Drei Bausteine, die du schon hast oder die kostenlos sind:

| Baustein | Rolle |
|---|---|
| **Cloudflare D1** (Datenbank des Workers) | Eingang und Sicherung: Jede Anfrage und jeder Verzeichnis-Eintrag wird hier gespeichert, auch wenn n8n mal nicht läuft. |
| **n8n** (deine Instanz auf Google Cloud) | Briefträger: verschickt Mails über Gmail und schreibt neue Zeilen in die Tabelle. Workflow: `n8n-mailer-workflow.json`. |
| **Google-Tabelle "Nexara Pipeline"** (Google Workspace) | Dein CRM: eine Zeile pro Deal, Phase per Auswahlliste, nächster Schritt mit Datum. |

Ablauf: Website-Formular → Worker `/api/anfrage` → D1 → n8n → (1) Mail an dich, (2) neue Zeile im Blatt "Pipeline".
Verzeichnis: Eintrag → D1 → Bestätigungsmail → nach Bestätigung Mail an dich mit Freigabe-Link + Zeile im Blatt "Verzeichnis".

## 1. Google-Tabelle anlegen (15 Min)
1. In Google Drive neue Tabelle **"Nexara Pipeline"**.
2. Blatt **"Pipeline"**: Datei → Importieren → `tabelle-pipeline.csv` (Trennzeichen Semikolon) → "Aktuelles Tabellenblatt ersetzen". Kopfzeile fixieren.
3. Blatt **"Verzeichnis"** anlegen und `tabelle-verzeichnis.csv` genauso importieren.
4. Spalte **Phase** (Blatt Pipeline): Daten → Datenvalidierung → Drop-down mit:
   `1 Lead`, `2 Qualifiziert`, `3 Erstgespräch`, `4 Prozessanalyse`, `5 Angebot`, `6 Verhandlung`, `7 Gewonnen`, `8 Verloren`
5. Spalte **Wahrscheinlichkeit**: Formel in der ersten Datenzeile, nach unten ziehen:
   `=IF(M2="";"";VLOOKUP(LEFT(M2;1)*1;{1\0,05;2\0,1;3\0,2;4\0,4;5\0,6;6\0,8;7\1;8\0};2;0))`
   (Englische Funktionsnamen funktionieren in jeder Spracheinstellung; bei deutscher Einstellung Semikolon als Trenner.)
6. Bedingte Formatierung: Zeilen mit "Datum nächster Schritt" ≤ TODAY() gelb einfärben. Das ist deine Aufgabenliste.
7. Ein zusätzliches Blatt **"Übersicht"** mit
   `=COUNTIF(Pipeline!M:M;"5*")` usw. je Phase und `=SUMPRODUCT(Pipeline!P2:P;Pipeline!Q2:Q)` für die gewichtete Pipeline.
8. URL der Tabelle kopieren, sie kommt in den n8n-Workflow.

## 2. Pipeline-Phasen

| # | Phase | Eintritt (muss erfüllt sein) | Austritt / nächster Schritt | Wahrscheinlichkeit | Max. Verweildauer |
|---|---|---|---|---|---|
| 1 | **Lead** | Kontakt mit Namen, Firma und Kanal | Qualifizierung per Telefon/Mail | 5 % | 3 Tage |
| 2 | **Qualifiziert** | Erfüllt die 6 Muss-Kriterien (Strategie Abschnitt 6), Lead-Score ≥ 4 | Erstgespräch terminiert | 10 % | 7 Tage |
| 3 | **Erstgespräch** | Gespräch gebucht | Gespräch geführt + Kurz-Einschätzung versendet | 20 % | 7 Tage |
| 4 | **Prozessanalyse** | Analyse vereinbart (bezahlt oder Gründungskunde) | Ergebnis vorgestellt | 40 % | 14 Tage |
| 5 | **Angebot** | Umsetzungsangebot im Termin vorgestellt | Rückmeldung | 60 % | 10 Tage |
| 6 | **Verhandlung** | Kunde will, offene Punkte | Beauftragung per Mail | 80 % | 10 Tage |
| 7 | **Gewonnen** | Schriftliche Beauftragung | Umsetzung, Betreuung, Empfehlung (Spalte Notizen) | 100 % | |
| 8 | **Verloren** | Absage oder 20 Tage ohne Reaktion nach letztem Follow-up | Verlustgrund + Wiedervorlage 90 Tage | 0 % | |

Kontakte aus Netzwerk, Telefon und Briefen trägst du selbst als neue Zeile ein (Kanal nicht vergessen). Website-Anfragen kommen automatisch.

## 3. Regeln
1. **Keine Zeile ohne "Nächster Schritt" mit Datum.** Jeden Morgen nach Datum sortieren.
2. **Freitag 30 Min Pipeline-Review:** Zeilen über der Max. Verweildauer → nachfassen oder auf "8 Verloren".
3. **Verlustgrund immer ausfüllen** (Preis, Timing, kein Bedarf, kein Kontakt, Wettbewerb, selbst gemacht).
4. **Kanal immer ausfüllen**, sonst ist keine Kanalbewertung möglich.
5. Werbewiderspruch ("kein Interesse") in Notizen vermerken und nie wieder anrufen.

## 4. n8n-Workflow einrichten (20 Min)
1. n8n → Workflows → Import → `n8n-mailer-workflow.json`.
2. Knoten **Webhook**: Credential "Header Auth" anlegen, Name `X-Nexara-Secret`, Wert: ein langer Zufallstext (z. B. in PowerShell: `[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()`). Den gleichen Wert später als Cloudflare-Secret `MAIL_WEBHOOK_SECRET` setzen.
3. Knoten **Gmail senden**: Gmail-Credential mit deinem Workspace-Konto verbinden.
4. Knoten **In Tabelle eintragen**: Google-Sheets-Credential verbinden, Platzhalter `HIER_URL_DER_TABELLE_NEXARA_PIPELINE` durch die Tabellen-URL ersetzen.
5. Workflow aktivieren, **Production-URL** des Webhooks kopieren → Cloudflare-Secret `MAIL_WEBHOOK_URL` (siehe `../06-cloudflare-umzug.md`).
6. Test nach dem Deploy: Formular auf `/automatisierung/` absenden → Mail bei dir + Zeile im Blatt "Pipeline".

Falls n8n mal ausfällt: Nichts geht verloren. `npm run db:anfragen` zeigt die letzten 20 Anfragen aus der Datenbank, `npm run db:wartend` offene Verzeichnis-Einträge.

## 5. Kalender (Cal.com)
- Termintyp **"Prozess-Erstgespräch"**, Dauer **30 Min**, Kurz-URL (Slug) genau **`prozess-erstgespraech`**. Die Website verlinkt bereits auf `https://cal.com/adrien-wottke-hogs97/prozess-erstgespraech`; solange der Termintyp fehlt, landen Besucher auf einer Fehlerseite.
- Ort: Google Meet oder Telefon. Puffer 15 Min, max. 3 pro Tag, Vorlauf min. 12 Std.
- Den alten Typ "18 min meeting" ausblenden oder behalten, er wird von den Automatisierungsseiten nicht mehr verlinkt.
- Buchungsfragen: Firma, Branche, "Welcher Ablauf kostet Sie am meisten Zeit?"
- Weiterleitung nach Buchung: `https://nexara-ai.de/automatisierung/danke/?typ=termin`. **Weitergabe von Buchungsparametern an die URL ausschalten** (keine Namen/E-Mails in URLs).
- Buchungen trägst du als Zeile mit Phase "3 Erstgespräch" ein (oder später: Cal.com-Webhook → n8n → Tabelle).
