# CRM-Prozess (HubSpot Free)

Warum HubSpot Free: kennst du schon, kostenlos, Kontakte/Firmen/Deals/Aufgaben/Mail-Tracking/Meeting-Links, App fürs Handy. Einschränkungen von Free (Stand prüfen): nur **eine** Deal-Pipeline, begrenzte Automatisierung. Automatisierung übernimmt n8n.

## Pipeline "Nexara Vertrieb" (Deal-Phasen)

| # | Phase | Eintritt (muss erfüllt sein) | Austritt / nächster Schritt | Wahrscheinlichkeit | Max. Verweildauer |
|---|---|---|---|---|---|
| 1 | **Lead** | Kontakt mit Namen, Firma und Kanal angelegt | Qualifizierung per Telefon/Mail | 5 % | 3 Tage |
| 2 | **Qualifiziert** | Erfüllt die 6 Muss-Kriterien (Strategie Abschnitt 6), Lead-Score ≥ 4 | Erstgespräch terminiert | 10 % | 7 Tage |
| 3 | **Erstgespräch** | Gespräch gebucht (Datum im Deal) | Gespräch geführt + Kurz-Einschätzung versendet | 20 % | 7 Tage |
| 4 | **Prozessanalyse** | Analyse vereinbart (bezahlt oder Gründungskunde) | Ergebnis vorgestellt | 40 % | 14 Tage |
| 5 | **Angebot** | Umsetzungsangebot im Termin vorgestellt | Rückmeldung | 60 % | 10 Tage |
| 6 | **Verhandlung** | Kunde will, offene Punkte (Umfang, Termin, Preis) | Beauftragung per Mail | 80 % | 10 Tage |
| 7 | **Gewonnen** | Schriftliche Beauftragung | → Kundenphase "Umsetzung" | 100 % | |
| 8 | **Verloren** | Absage oder 20 Tage ohne Reaktion nach letztem Follow-up | Verlustgrund + Wiedervorlage 90 Tage | 0 % | |

**Nach "Gewonnen"** (Free hat nur eine Pipeline): Firmen-Eigenschaft **Kundenphase** = Umsetzung → Betreuung → Empfehlung gegeben. Wenn du auf Starter gehst: zweite Pipeline "Kunden".

**Bezahlte Analyse ohne Umsetzung** ist ein eigener gewonnener Deal (690 €). Die Umsetzung wird ein neuer Deal in Phase 5.

## Eigenschaften (max. ~10 eigene, Free-Limit prüfen)

| Objekt | Eigenschaft | Typ | Werte |
|---|---|---|---|
| Kontakt | **Kanal** | Auswahl | Netzwerk, Bestandskunde, Telefon, Brief, Partner, Event, LinkedIn, Google Ads, Website organisch, Empfehlung |
| Kontakt | **Grund für Kontakt** | Text | z. B. "Stellenanzeige WEG-Verwalter 11/2026" (Nachweis mutmaßliche Einwilligung) |
| Kontakt | **Werbewiderspruch** | Ja/Nein | Ja = nie wieder anrufen/anschreiben |
| Kontakt | **GCLID** | Text | aus Formular (nur mit Einwilligung) |
| Firma | **Zielgruppe** | Auswahl | Hausverwaltung, Handwerk, Ingenieurbüro, Personaldienstleister, Andere |
| Firma | **Kundenphase** | Auswahl | Interessent, Umsetzung, Betreuung, Empfehlung gegeben, Ehemalig |
| Deal | **Lead-Score** | Zahl | Punkte laut Strategie |
| Deal | **Engpass-Ablauf** | Text | in Kundenworten |
| Deal | **Std. pro Woche (Kunde)** | Zahl | |
| Deal | **Potenzial € pro Jahr** | Zahl | aus ROI-Rechnung |

Standardfelder nutzen: Deal-Betrag, Abschlussdatum, Verlustgrund, Branche, Telefon.

## Regeln
1. **Kein Deal ohne nächste Aufgabe mit Datum.** Jeden Morgen: Ansicht "Aufgaben heute fällig".
2. **Jeden Freitag 30 Min Pipeline-Review:** Deals über Max. Verweildauer → nachfassen oder verlieren.
3. **Verlustgrund immer ausfüllen** (Preis, Timing, kein Bedarf, kein Kontakt, Wettbewerb, selbst gemacht). Das ist die wichtigste Lerndatenquelle.
4. **Kanal immer ausfüllen.** Sonst ist keine Kanalbewertung möglich.

## Automatisierung mit n8n (Datei `n8n-lead-workflow.json`)
Website-Formular → Webhook → Prüfung (Pflichtfelder, Honeypot) → HubSpot: Kontakt anlegen/aktualisieren → Deal in Phase "Lead" anlegen und verknüpfen → Mail an dich mit allen Angaben → Antwort an die Website (Weiterleitung auf Danke-Seite).

Einrichtung:
0. **HubSpot-Konto mit EU-Rechenzentrum anlegen** (bei der Registrierung bzw. in den Kontoeinstellungen "Datenhosting: EU" wählen; erkennbar an `app-eu1.hubspot.com`). Die Datenschutzerklärung beschreibt bereits das EU-Rechenzentrum. Landet das Konto in den USA, muss der Abschnitt "CRM-System HubSpot" angepasst werden.
1. HubSpot: Einstellungen → Integrationen → **Private Apps** → App "n8n Lead-Eingang" mit Scopes `crm.objects.contacts.write`, `crm.objects.contacts.read`, `crm.objects.deals.write`, `crm.objects.deals.read`. Token kopieren. (Falls dein HubSpot-Konto Private Apps anders benennt: "Legacy Apps"/"Service-Schlüssel" in der aktuellen Oberfläche suchen.)
2. HubSpot: Pipeline-ID und Phasen-ID für "Lead" nachschlagen (Einstellungen → Objekte → Deals → Pipelines; interne IDs). Im Workflow in den Platzhaltern `PIPELINE_ID` und `STAGE_ID_LEAD` eintragen.
3. Eigene Kontakt-Eigenschaften `kanal` und `gclid` in HubSpot anlegen (interne Namen genau so), sonst lehnt die API sie ab.
4. n8n: Workflow importieren, Credential "Header Auth" mit `Authorization: Bearer <Token>` anlegen und in beiden HTTP-Knoten wählen. SMTP-/Gmail-Credential für die Benachrichtigung wählen.
5. Webhook-Knoten: Production-URL kopieren → `.env` → `VITE_LEAD_ENDPOINT=…` → neu bauen und deployen. Unter Webhook-Optionen "Allowed Origins" auf `https://nexara-ai.de` setzen.
6. Testen: Formular auf der Live-Seite ausfüllen → Kontakt + Deal in HubSpot, Mail bei dir, Weiterleitung auf Danke-Seite.

**Später (wenn Ads laufen):** zweiter n8n-Workflow, der wöchentlich Deals mit GCLID in Phase "Qualifiziert"/"Gewonnen" als Offline-Conversions an Google Ads meldet (oder CSV-Upload in Google Ads). Damit optimiert Google auf zahlende Kunden statt Formulare.

## Kalender (Cal.com)
- Termintyp **"Prozess-Erstgespräch"**, Dauer **30 Min**, Kurz-URL (Slug) genau **`prozess-erstgespraech`**. Die Website verlinkt bereits auf `https://cal.com/adrien-wottke-hogs97/prozess-erstgespraech`; solange der Termintyp fehlt, landen Besucher auf einer Fehlerseite.
- Ort: Google Meet oder Telefon. Puffer 15 Min, max. 3 pro Tag, Vorlauf min. 12 Std.
- Den alten Typ "18 min meeting" ausblenden oder behalten, er wird von den Automatisierungsseiten nicht mehr verlinkt.
- Buchungsfragen: Firma, Branche, "Welcher Ablauf kostet Sie am meisten Zeit?"
- Weiterleitung nach Buchung: `https://nexara-ai.de/automatisierung/danke/?typ=termin`. **Weitergabe von Buchungsparametern an die URL ausschalten** (keine Namen/E-Mails in URLs).
- Optional: Cal.com-Webhook "Booking created" → n8n → HubSpot-Deal in Phase "Erstgespräch".
