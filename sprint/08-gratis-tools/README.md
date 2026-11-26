# Gratis-Tools und Briefwelle: Start Do 26.11.2026

**Worum es geht:** Interaktive Tools auf der Website, die Betriebe sofort ausprobieren wollen. Jedes Tool ist eine Live-Demo eines bezahlten Bausteins und endet beim Erstgespräch. Dazu die Leadliste für Briefwelle 1. Details zu den Tools: [tool-specs.md](tool-specs.md).

**Arbeitsteilung:** Ich baue und recherchiere. Du richtest die Konten ein, testest am Handy, gibst frei und machst weiter Akquise. Das passt zur Grundregel aus dem Launchplan: jeden Werktag mindestens 2 Stunden Akquise.

---

## Ziel bis So 29.11.

| Ergebnis | Wofür |
|---|---|
| Schadensmelder live auf nexara-ai.de | QR-Code im Brief an die Hausverwaltungen |
| Sprach-Regiebericht live | Link für die Handwerk-Telefonate |
| 50 Hausverwaltungen recherchiert ([leadliste-hv.csv](leadliste-hv.csv)) | 20 Briefe am Mo 30.11. einwerfen, Rest für Welle 2 |
| Brief an Hausverwaltungen mit QR-Code fertig | Druck am So 29.11. |

**Warum es eng ist:** Die Briefe gehen am Mo 30.11. raus und kommen ca. 01.-02.12. an. Bis dahin muss die Domain auf Cloudflare umgezogen sein und der Schadensmelder laufen. Der Umzug der Nameserver kann bis zu 24 Stunden dauern, deshalb morgen als Erstes.

---

## Morgen früh zuerst: Blocker, die nur du lösen kannst

| # | Was | Anleitung | Zeit (Schätzung) |
|---|---|---|---|
| 1 | Cloudflare: Konto und Domain mit der vorbereiteten Zonendatei (Schritt 1), sofort danach Nameserver beim Registrar umstellen (Schritt 2), weil es dauern kann. Die Seite läuft währenddessen weiter. | [06-cloudflare-umzug.md](../06-cloudflare-umzug.md) | 15 Min |
| 2 | `npm run cf:setup` (Datenbank, Geheimnisse, Test-Deploy auf workers.dev), dann n8n-Mailer verbinden und testen (Schritte 3-4, Launchplan Tag 2). Nach der Aktiv-Mail von Cloudflare: `npm run cf:domain` und Schritt 6. | [06-cloudflare-umzug.md](../06-cloudflare-umzug.md) | 50 Min |
| 3 | Anthropic-API-Key: Konto auf console.anthropic.com, Zahlungsdaten selbst eintragen, **monatliches Ausgabenlimit setzen**, Key anlegen. Dann `npx wrangler secret put ANTHROPIC_API_KEY` und lokal eine Zeile `ANTHROPIC_API_KEY=...` in `.dev.vars`. | unten | 15 Min |
| 4 | Turnstile: Cloudflare-Dashboard → Turnstile → Widget anlegen für `nexara-ai.de`, die workers.dev-Adresse und `localhost`. Den **Site-Key** (öffentlich) gibst du mir, den **Secret Key** setzt du mit `npx wrangler secret put TURNSTILE_SECRET`. | unten | 10 Min |
| 5 | 3 Beispielfotos machen: Wasserfleck an einer Decke, gesprungene Scheibe, Schimmel in einer Ecke (oder Entscheidung 4 = KI-Bilder) | | 10 Min |
| 6 | Die 5 Entscheidungen unten treffen | | 10 Min |
| 7 | Falls noch offen: Cal.com-Termintyp "Prozess-Erstgespräch" anlegen. Jedes Tool endet mit diesem Button, ohne ihn landet der Besucher auf einer Fehlerseite. | [05-crm/crm-prozess.md](../05-crm/crm-prozess.md), Abschnitt Kalender | 15 Min |
| 8 | Auftragsverarbeitung mit Anthropic und Cloudflare akzeptieren (wie bei den anderen Diensten) | [05-crm/datenschutz-ergaenzungen.md](../05-crm/datenschutz-ergaenzungen.md) | 10 Min |

**Wichtig:** API-Key und Secrets nie in den Chat kopieren. Nur über `wrangler secret put` oder `.dev.vars` (steht in `.gitignore`).

Befehle für 3 und 4, jeweils im Projektordner:
```powershell
npx wrangler secret put ANTHROPIC_API_KEY
```
```powershell
npx wrangler secret put TURNSTILE_SECRET
```

---

## Entscheidungen (morgen früh, je eine Zeile Antwort reicht)

| # | Frage | Vorschlag |
|---|---|---|
| 1 | **Modell:** Claude Opus 5.5 (Standard, beste Qualität bei Fotos und Sprache, ca. 2-5 Cent pro Nutzung geschätzt) oder Claude Haiku 5.5 (unter 1 Cent, schwächer bei Feinheiten)? | Start mit Opus 5.5. Wenn die Nutzung hoch ist, Haiku 5.5 gegen dieselben Beispiele testen. Deine Entscheidung. |
| 2 | **Tageslimit:** Wie viele KI-Aufrufe pro Tag insgesamt, wie viele pro Besucher? | 100 pro Tag gesamt, 5 pro Besucher |
| 3 | **Ausgabenlimit** in der Anthropic Console pro Monat? | 20 € (aus deinem Marketingbudget), später anpassen |
| 4 | **Beispielfotos:** eigene oder KI-generiert? | Eigene, wirken echter und haben keine Lizenzfragen |
| 5 | **Adresse:** `/automatisierung/ausprobieren/schadensmelder/` usw. in Ordnung? | Ja, der QR-Code hängt UTM-Parameter an |

---

## Tagesplan Do 26.11.

| Zeit | Du | Ich |
|---|---|---|
| 08:00-09:00 | Blocker 1-4 | Schadensmelder: Worker-Route, Zähler-Tabelle, Seite, lokal lauffähig |
| 09:00-10:30 | **Warme 50** in [kontakte-import.csv](../05-crm/kontakte-import.csv) anlegen (steht noch leer, das kann nur du) | Schadensmelder fertig bauen, sobald der API-Key da ist mit echten Aufrufen testen |
| 10:30-11:00 | Schadensmelder am Handy testen, Texte freigeben oder korrigieren | Korrekturen, Entwurf Datenschutz-Abschnitt |
| 11:00-12:00 | 10 persönliche Nachrichten an die Wärmsten (Vorlage "Netzwerk" in [vorlagen-nachrichten.md](../03-vertrieb/vorlagen-nachrichten.md)) | Leadliste Hausverwaltungen recherchieren |
| Nachmittag | In der [Anrufliste Handwerk](../../../Nexara_Anrufliste_Handwerk_Bautzen.xlsx) markieren, wen du im Sommer schon erreicht hast (15 Min). Bestandskunden anrufen (Launchplan Tag 2). | Sprach-Regiebericht |
| Abend | Datenschutz-Abschnitt prüfen, Deploy freigeben (sobald die Domain aktiv ist) | Brief an Hausverwaltungen mit QR-Code und Strichliste (A4) druckfertig. Brieftext ist schon angepasst: [vorlagen-nachrichten.md](../03-vertrieb/vorlagen-nachrichten.md), Abschnitt "Brief Hausverwaltung". |

## Fr 27.11. bis So 29.11.
- **Fr:** Telefonblock Handwerk (Launchplan Tag 3), jetzt mit dem Link zum Sprach-Regiebericht als Angebot am Ende des Gesprächs. Ich: Regiebericht fertig, Rechner.
- **Sa:** Laut Launchplan Google-Ads-Konto (bleibt pausiert) und LinkedIn-Profil. Ich: Hub-Seite, Feinschliff, Bildschirmaufnahme vom Schadensmelder für LinkedIn.
- **So:** 20 Briefe aus der Leadliste auswählen, drucken, unterschreiben. Erster LinkedIn-Post.
- **Mo 30.11.:** Briefe einwerfen.

---

## Leadliste Hausverwaltungen: Regeln für die Recherche

Datei: [leadliste-hv.csv](leadliste-hv.csv) (Semikolon, öffnet direkt in Excel). Die 8 Verwaltungen aus der Strategie stehen schon drin.

- **Ziel:** 50 Verwaltungen in Dresden, Bautzen, Görlitz und Umgebung. Quellen: Stellenportale (JOIN, StepStone, Arbeitsagentur), Karriereseiten, jacasa.de, Google Maps, Impressum der Website.
- **Pro Zeile Pflicht:** Firma, Ort, Anschrift für den Brief, Telefon, Geschäftsführung laut Impressum, ein **konkretes Kaufsignal mit Quelle**. Das Signal ist der Sachbezug für Brief und Anruf. Ohne Signal kommt die Firma in Welle 2.
- **Reihenfolge Welle 1:** stärkstes Signal zuerst (Unterschriftsbonus, lange offene Stelle, Quereinsteiger gesucht, Wachstum).
- **Vor dem Brief:** Signal noch aktuell? Datum in "Signal geprüft am" eintragen.
- **Nur Geschäftsdaten** aus öffentlichen Quellen (Impressum, Stellenanzeige). Keine privaten Daten, keine Mailadressen für Werbung.
- Wer "kein Interesse" oder "keine Werbung" sagt: `Werbewiderspruch` auf Ja, nie wieder kontaktieren.

---

## Was nicht passiert
- Google Ads bleibt pausiert, bis du ausdrücklich freigibst.
- Kein Tool geht live ohne deinen Handytest und ohne Datenschutz-Abschnitt.
- Postfach-Test, Beleg-Leser und Objekt-Chat kommen erst nach den ersten beiden.
- Keine Kalt-E-Mails. Die Leadliste ist für Briefe und Telefon.
