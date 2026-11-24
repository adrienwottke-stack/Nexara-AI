# ROI-Kalkulation (Methode)

Das Rechenwerkzeug liegt in `Nexara_Vertriebs-Toolkit.xlsx` (Blatt "ROI-Rechner"). Die Website hat einen vereinfachten Rechner im Abschnitt "Erst rechnen. Dann bauen."

## Grundformel

**Jährlicher Nutzen** = Stunden pro Woche × Kosten pro Stunde × Arbeitswochen × automatisierbarer Anteil
\+ vermiedene Verluste pro Jahr (nur wenn der Kunde sie selbst beziffert)

**Laufende Kosten** = Betreuung pro Monat × 12 + Tool-/Hostingkosten pro Jahr

**Netto-Nutzen pro Jahr** = Jährlicher Nutzen − Laufende Kosten

**Amortisation (Monate)** = Einmalpreis / (Netto-Nutzen / 12)

**ROI Jahr 1** = (Netto-Nutzen − Einmalpreis) / Einmalpreis

## Eingaben und wie du sie bekommst

| Eingabe | Quelle | Faustregel, wenn der Kunde keine Zahl hat |
|---|---|---|
| Stunden pro Woche | Analyse: Schritte × Dauer × Häufigkeit | Eigene Messung bei 3-5 echten Vorgängen vor Ort |
| Kosten pro Stunde | Kunde | Bruttojahreslohn × 1,3 / 1.600 Std. (Bürokraft Sachsen oft 30-40 €, Ingenieur 55-80 €; **beim Kunden erfragen**) |
| Arbeitswochen | fest | 46 |
| Automatisierbarer Anteil | deine Einschätzung je Schritt | konservativ: nur Schritte, die komplett regelbasiert sind, zählen voll; Schritte mit Prüfung zählen 50 %, Rest 0 % |
| Vermiedene Verluste | Kunde | Nur verwenden, wenn der Kunde die Zahl nennt (z. B. "2 Aufträge à 4.000 € im Jahr gingen verloren, weil das Angebot zu spät kam") |

## Regeln, damit die Rechnung glaubwürdig bleibt
1. **Kundenzahlen statt Benchmarks.** Keine Studienwerte in die Rechnung.
2. **Konservativ rechnen.** Lieber 40 % als 70 % Anteil. Kunden glauben vorsichtigen Zahlen.
3. **Eingesparte Zeit ist nicht automatisch eingespartes Geld.** Sag es offen: "Die Stunden werden frei. Ob Sie damit eine offene Stelle nicht besetzen müssen, mehr Aufträge bearbeiten oder Überstunden abbauen, entscheiden Sie." Das schafft Vertrauen.
4. **Drei Szenarien zeigen:** vorsichtig / erwartet / gut. Entscheidung auf Basis "vorsichtig".
5. **Nachher messen** mit denselben Größen (Baseline aus der Analyse).

## Beispiel (alle Zahlen Annahmen)
Hausverwaltung, Posteingang vorsortieren:
- 2 Mitarbeiterinnen × 1 Std./Tag × 5 Tage = 10 Std./Woche
- 38 €/Std. (vom Kunden genannt)
- automatisierbar: 40 % (Sortieren, Zuordnen; Antworten bleiben manuell, Entwurf hilft)
- Nutzen: 10 × 38 × 46 × 0,4 = **6.992 €/Jahr**
- Laufende Kosten: 149 € × 12 + 300 € Tools = 2.088 €/Jahr
- Netto-Nutzen: 4.904 €/Jahr
- Einmalpreis: 2.900 € → **Amortisation ca. 7 Monate**, ROI Jahr 1: 69 %

## Ab welchem Wert lohnt sich ein Angebot?
- Amortisation ≤ 12 Monate (vorsichtiges Szenario) → anbieten.
- 12-24 Monate → nur anbieten, wenn ein strategischer Grund dazukommt (offene Stelle, Wachstum).
- > 24 Monate → ehrlich abraten. Das ist Teil des Versprechens auf der Website.
