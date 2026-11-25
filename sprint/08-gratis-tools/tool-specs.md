# Gratis-Tools: Spezifikation

Stand: 25.11.2026. Grundlage für den Bau ab Do 26.11.
Ziel: Tools auf der Website, bei denen ein Betrieb denkt "das muss ich ausprobieren". Jedes Tool ist eine Live-Demo eines bezahlten Bausteins aus `01-strategie.md` Abschnitt 7 und endet bei genau diesem Baustein.

Zeitangaben und Kosten pro Nutzung sind **Schätzungen** und werden beim Bau gemessen.

---

## Gemeinsame Regeln (gelten für jedes Tool)

1. **Ein Klick bis zum Aha.** Jedes Tool hat Beispieldaten ("Beispiel ansehen"). Niemand muss eigene Daten haben, um das Ergebnis zu sehen.
2. **Keine Mailadresse vor dem Ergebnis.** Danach optional: "Ergebnis per Mail schicken" mit Häkchen zur Einwilligung, Versand über den bestehenden n8n-Mailer. Wer das Häkchen setzt, darf einmal nachgefasst werden.
3. **Jedes Ergebnis endet beim Angebot:** Name des Bausteins, Festpreisspanne netto, Button "Kostenloses Erstgespräch" (Cal-Link aus `site.cal` in `scripts/automation-content.mjs`), Hinweis auf die Gründungskonditionen (3 Analysen kostenlos gegen Fallstudie).
4. **Ehrlichkeitszeile unter jedem KI-Ergebnis:** "Automatisch erstellt. In Ihrem Betrieb prüft und gibt immer ein Mensch frei." (Transparenz, passt zur Strategie: Mensch gibt frei.)
5. **Handy zuerst.** Handwerker sind auf der Baustelle, Verwalter lesen Briefe am Schreibtisch und scannen den QR-Code mit dem Handy.
6. **Design wie die Landingpages** (Zeichenblatt): Tokens aus `src/automation.css` (`--paper`, `--sheet`, `--ink`, `--red` = Rotstift für Verschwendung, `--marker` = Lime für "läuft automatisch", `--data` = Space Grotesk für Zahlen und Tabellen).
7. **Sprache:** Sie-Form, "ich" statt "wir", keine Gedankenstriche, keine KI-Floskeln ("revolutionär", "Gamechanger").

---

## Technik (gemeinsam)

| Thema | Umsetzung |
|---|---|
| Seiten | Hub `automatisierung/ausprobieren/` + je Tool ein Unterordner. Bevorzugt über `scripts/build-automation-pages.mjs`, damit Kopf, Fuß und Design einheitlich sind; Tool-Logik in eigener TS-Datei je Tool. Neue Einstiege in `vite.config.ts`. |
| Backend | Neue Routen im bestehenden Worker (`worker/api.ts`, Routing in `worker/index.ts`): `POST /api/tool/schadensmelder`, `/api/tool/regiebericht`, `/api/tool/postfach`, `/api/tool/beleg`, `/api/tool/objekt`. Der Rechner läuft komplett im Browser. |
| KI | Claude API über das offizielle SDK `@anthropic-ai/sdk` im Worker. Standard: `claude-opus-5-5`, niedriger Effort, JSON über Structured Outputs (`output_config.format`), serverseitige Fallbacks aktiv. Alternative: `claude-haiku-5-5` (Entscheidung Adrien, siehe README). |
| Sprache zu Text | Nur Regiebericht: Cloudflare Workers AI (Whisper-Modell, genauen Modellnamen beim Bau prüfen), Binding `AI` in `wrangler.jsonc`. Fallback immer: Texteingabe. |
| Schutz vor Missbrauch | 1. Cloudflare Turnstile vor jedem KI-Aufruf (kostenlos). 2. Drosselung pro IP-Hash nach dem bestehenden Muster `tooMany()` in `worker/api.ts`, neue Tabelle `tool_nutzung` (Migration `0003`). 3. Globales Tageslimit über Variable `TOOL_TAGESLIMIT`; danach freundliche Meldung "Für heute ausgebucht, morgen geht es weiter" plus Erstgespräch-Button. 4. Monatliches Ausgabenlimit in der Anthropic Console. |
| Speicherung | **Keine Inhalte** (keine Fotos, Mails, Texte). Nur Zähler: Tool, Zeitpunkt, IP-Hash. IP-Hash nach 30 Tagen löschen, analog zu `cleanup()` in `worker/index.ts`. |
| Sicherheitsheader | `permissions-policy` in `worker/index.ts` sperrt aktuell Kamera und Mikrofon für alle Seiten. Für `/automatisierung/ausprobieren/regiebericht/` wird `microphone=(self)` erlaubt, alles andere bleibt gesperrt. Foto-Upload über `<input type="file" accept="image/*" capture>` braucht keine Kamera-Freigabe. |
| Upload-Grenzen | Bilder im Browser auf max. 1600 px verkleinern, max. 3 Bilder. PDF max. 5 MB und 5 Seiten. Audio max. 60 Sekunden. |
| Kosten pro Nutzung (Schätzung) | Opus 5.5: ca. 2-5 Cent. Haiku 5.5: unter 1 Cent. Workers AI: im kostenlosen Tageskontingent. Wird beim Bau mit echten Aufrufen gemessen. |
| Messen | Pro Tool zählen: Aufrufe, Beispiel vs. eigene Daten, Klicks auf "Erstgespräch", Mail-Einwilligungen. Ohne Cookies, serverseitig über die Zähler-Tabelle. |
| Datenschutz | Neuer Abschnitt in `datenschutz.html`: Zweck, Anthropic als Auftragsverarbeiter (API, keine Nutzung zum Training), Cloudflare (Hosting, Turnstile, Workers AI), keine Speicherung der Inhalte, Löschfrist IP-Hash. **Entwurf mache ich, du prüfst. Ohne diesen Abschnitt geht kein Tool live.** |

---

## 1. Schadensmelder (Hausverwaltung) · Priorität 1

**URL:** `/automatisierung/ausprobieren/schadensmelder/`
**Bezahlter Baustein:** Schadensmeldung bis Handwerkerauftrag (S, 1.500-2.900 € netto)
**Warum zuerst:** Am stärksten visuell, funktioniert mit Beispielfotos, braucht keine Mieterdaten. Der QR-Code im Brief an die Hausverwaltungen zeigt hierher.

**Eingabe**
- 1-3 Fotos (Kamera am Handy oder Datei) und optional ein Satz: "Seit gestern tropft es im Bad von der Decke."
- Drei Beispiel-Buttons: Wasserfleck an der Decke, gesprungene Fensterscheibe, Schimmel in der Zimmerecke.
- Hinweis über dem Upload: "Bitte keine Personen, Namensschilder oder Dokumente fotografieren."

**Ausgabe (eine Karte, wie eine fertige Meldung)**
1. Schadensart und betroffenes Bauteil
2. Dringlichkeit: sofort / diese Woche / planbar, mit einem Satz Begründung
3. Zuständiges Gewerk (Sanitär, Glaser, Maler, Dachdecker …)
4. Was fehlt: Rückfragen an den Mieter (z. B. "Seit wann?", "Ist der Strom in der Nähe betroffen?")
5. Entwurf Handwerkerauftrag (Betreff und Text, Platzhalter für Objekt und Wohnung)
6. Entwurf Statusmail an den Mieter
7. Rechner-Zeile: "Bei [20] Meldungen im Monat und [15] Minuten Bearbeitung pro Meldung sind das [X] Stunden im Monat." Beide Werte sind Regler mit dem Hinweis "Ihre Schätzung".

**Grenzen, offen gesagt:** "Das ist eine Einschätzung anhand des Fotos, keine Begutachtung. Die Ursache klärt der Handwerker."

**CTA-Text (Entwurf):** "In Ihrer Verwaltung kommt die Meldung über ein Formular rein und landet fertig sortiert in Ihrem Postfach oder Ihrer Verwaltungssoftware. Sie geben nur noch frei."

**Beispielfotos:** 3 eigene Fotos von Adrien (empfohlen, echt und ohne Lizenzfragen) oder KI-generiert (Entscheidung, siehe README).

---

## 2. Sprach-Regiebericht (Handwerk) · Priorität 2

**URL:** `/automatisierung/ausprobieren/regiebericht/`
**Bezahlter Baustein:** Digitaler Stundenzettel / Regiebericht bis Rechnungsentwurf (M, 3.000-6.000 € netto)
**Warum:** Reinsprechen und sofort einen fertigen Bericht sehen ist der stärkste "geil"-Moment. Perfekt als Link am Telefon: "Ich schicke Ihnen einen Link, sprechen Sie einfach Ihren letzten Einsatz rein."

**Eingabe**
- Großer Aufnahme-Button (max. 60 Sekunden), alternativ Textfeld.
- Beispiel-Button füllt diesen Text ein: "Heute bei Familie Müller in Bautzen, Bad, mit Kollege, von halb acht bis zwölf, Eckventil getauscht, zwei Meter Kupferrohr 15 Millimeter, drei Pressfittinge, Silikonfuge an der Wanne erneuert."

**Ausgabe**
1. Regiebericht als Tabelle: Datum, Kunde/Baustelle, Personen, Arbeitszeit je Person, Tätigkeiten, Material (Menge, Einheit, Bezeichnung)
2. Offene Punkte als Rückfragen ("Hat der Kollege auch bis 12 Uhr gearbeitet?")
3. Rechnungspositionen-Entwurf mit Platzhalter "Ihr Stundensatz" und "Ihr Materialpreis" (keine erfundenen Preise)
4. Rechner-Zeile: "Bei [8] Berichten pro Woche und [10] Minuten Abtippen pro Bericht …"

**Technik-Hinweis:** Aufnahme über MediaRecorder im Browser, auf iPhone und Android testen (unterschiedliche Audioformate). Audio geht an Workers AI, der Text an Claude. Audio wird nicht gespeichert.

**CTA-Text (Entwurf):** "Bei Ihnen spricht der Monteur den Bericht auf der Baustelle ein, und im Büro liegt am Abend der Rechnungsentwurf in Ihrer Handwerkersoftware."

---

## 3. Postfach-Test (Hausverwaltung) · Priorität 3

**URL:** `/automatisierung/ausprobieren/postfach/`
**Bezahlter Baustein:** Posteingang vorsortieren (S/M)

**Eingabe:** bis zu 10 Mails einfügen (getrennt durch eine Leerzeile mit `---`) oder "10 Beispiel-Mails laden". Hinweis: "Bitte Namen und Adressen vorher entfernen." Beispiel-Mails sind fiktiv und decken die typischen Anliegen ab (Schaden, Nebenkosten, Schlüssel, Lärm, Kündigung, Eigentümerfrage, Rechnung eines Dienstleisters).

**Ausgabe:** Tabelle mit Anliegen, Dringlichkeit, erkannter Einheit/Objekt (ja/nein), fehlenden Angaben, Antwortentwurf zum Aufklappen. Darüber eine Zählung pro Anliegen. Keine Prozentversprechen.

---

## 4. Beleg-Leser (alle Branchen) · Priorität 4

**URL:** `/automatisierung/ausprobieren/beleg/`
**Bezahlter Baustein:** Dienstleisterrechnungen zuordnen (Hausverwaltung, S) / Belege an Steuerbüro (Handwerk, S)

**Eingabe:** Rechnung als PDF oder Foto. Beispiel: fiktive Dachdeckerrechnung an eine Hausverwaltung.

**Ausgabe:** Lieferant, Rechnungsnummer, Datum, Leistungszeitraum, Netto / USt / Brutto, Vorschlag Kostenart, Vorschlag Objekt (aus der Leistungsadresse), Plausibilitätsprüfung (Summe stimmt? USt-Satz plausibel?), Button "Als CSV-Zeile kopieren".

---

## 5. Objekt-Chat (Hausverwaltung) · Priorität 5

**URL:** `/automatisierung/ausprobieren/objekt-chat/`
**Bezahlter Baustein:** Objektwissen durchsuchbar (M)

**Eingabe:** Frage an drei **fiktive** Beispieldokumente (Teilungserklärung, Hausordnung, Protokoll einer Eigentümerversammlung), die ich erstelle. Vorgeschlagene Fragen als Chips ("Wer zahlt neue Balkonfenster?", "Wann ist Ruhezeit?", "Was wurde zur Dachsanierung beschlossen?"). In Version 1 kein eigener Upload.

**Ausgabe:** Antwort mit wörtlicher Fundstelle (Zitatfunktion der API), Dokument und Abschnitt.

**Pflichtsatz:** "Zeigt, was in den Unterlagen steht. Keine Rechtsauskunft." Der Prompt beschränkt die Antwort auf Wiedergabe des Dokuments, keine rechtliche Bewertung.

---

## 6. Zeitfresser-Rechner (alle Branchen) · läuft in 1 und 2 mit, eigenständig ab Priorität 3

**URL:** `/automatisierung/ausprobieren/rechner/`
**Ohne KI, komplett im Browser, keine laufenden Kosten.**

**Eingabe (Regler):** Vorgänge pro Tag, Minuten pro Vorgang, Arbeitstage pro Woche, Kosten pro Stunde (Feld mit Hinweis "Ihre Zahl", Formel aus `roi-kalkulation.md` als Hilfe: Bruttojahreslohn × 1,3 / 1.600).

**Rechnung:** nach `03-vertrieb/roi-kalkulation.md`. Std./Woche × €/Std. × 46 Wochen = Jahreskosten des Ablaufs. Drei Szenarien für den automatisierbaren Anteil (vorsichtig / erwartet / gut, Werte beim Bau festlegen, vorsichtig als Hauptzahl).

**Pflichtsatz aus der ROI-Methode:** "Eingesparte Zeit ist nicht automatisch eingespartes Geld. Was Sie mit den freien Stunden machen, entscheiden Sie."

---

## Reihenfolge und Termine

| Tool | Bau | Live | Grund |
|---|---|---|---|
| Hub "Ausprobieren statt glauben" + Schadensmelder | Do 26.11. bis Fr 27.11. | spätestens So 29.11. | QR-Code im HV-Brief, Briefe gehen Mo 30.11. raus |
| Sprach-Regiebericht | Fr 27.11. bis Sa 28.11. | So 29.11. | Link für die Handwerk-Telefonate |
| Rechner eigenständig | Sa 28.11. | So 29.11. | Ohne KI, schnell |
| Postfach-Test, Beleg-Leser, Objekt-Chat | ab Mo 30.11. | nach deinem Test | erst, wenn die ersten beiden laufen |

Jedes Tool geht erst online, wenn Adrien es am Handy getestet und die Texte freigegeben hat.
