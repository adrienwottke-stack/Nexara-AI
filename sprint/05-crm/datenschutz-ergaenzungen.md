# Datenschutz und Impressum: Stand

**Aktualisiert am 25.11.2026** (keine Rechtsberatung; bei Unsicherheit prüfen lassen):

`datenschutz.html` beschreibt:
- Hosting über **Cloudflare** (Workers, DNS, Netzwerk), Schriftarten lokal
- **Anfrageformular**: Speicherung in **Cloudflare D1 (Westeuropa)**, Weiterleitung per **n8n auf Google Cloud (EU)** als Mail und Zeile in der **Kundentabelle (Google Sheets)**; E-Mail über **Google Workspace**; Löschung nach 24 Monaten ohne Vertrag
- **Verzeichnis „Aus der Region“** (Anker `#verzeichnis`): öffentliche und nicht öffentliche Angaben, Double-Opt-in, Veröffentlichung inkl. Sitemap und offener Daten, redaktionelle Einträge mit Widerspruchsrecht, Löschfristen
- **Terminbuchung über Cal.com**
- **Google Ads** nur mit Einwilligung

Die Löschfristen setzt der Worker täglich selbst um (Cron 3 Uhr UTC): unbestätigte Einträge nach 30 Tagen, abgelehnte/entfernte nach 30 Tagen, Anfragen nach 24 Monaten, IP-Prüfwerte nach 30 Tagen.

`impressum.html`: § 5 DDG, § 18 Abs. 2 MStV, USt-IdNr. DE464019752.

## Damit die Texte stimmen, musst du noch:
- [ ] **Cloudflare** einrichten wie in `../06-cloudflare-umzug.md`. Bis dahin läuft die Live-Seite noch bei Vercel, und die Erklärung beschreibt schon den Zielzustand. Deshalb Datenschutzerklärung und Umzug zusammen live stellen.
- [ ] **Auftragsverarbeitung** akzeptieren bzw. prüfen: Cloudflare (DPA im Dashboard unter Konfiguration/Compliance), Google Cloud, Google Workspace (inkl. Sheets), Cal.com, Google Ads.
- [ ] n8n-Instanz: Region in der Google-Cloud-Konsole einmal bestätigen (z. B. `europe-west3`).
- [ ] Wenn du später einen KI-Dienst in Kundenlösungen einsetzt: im jeweiligen Angebot und AV-Vertrag mit Kunden benennen.
