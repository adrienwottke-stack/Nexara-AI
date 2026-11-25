# Datenschutz und Impressum: Stand

**Umgesetzt am 25.11.2026** (keine Rechtsberatung; bei Unsicherheit prüfen lassen):

`datenschutz.html`, neue bzw. ergänzte Abschnitte:
- Webhosting: **Vercel** (USA), Schriftarten lokal
- **Anfrageformular, Automatisierung und CRM**: n8n auf **Google Cloud, Rechenzentrum EU**; **HubSpot** mit EU-Rechenzentrum; E-Mail über **Google Workspace**; Rechtsgrundlagen; Löschung nach 24 Monaten ohne Vertrag
- **Terminbuchung über Cal.com** (nur nach Klick, Rückleitung ohne Daten in der URL)
- **Google Ads und Conversion-Messung** (nur mit Einwilligung, kein Remarketing, GCLID 90 Tage, Offline-Meldung, Widerruf über "Cookie-Einstellungen")

`impressum.html`:
- § 5 TMG → **§ 5 DDG** (TMG gilt seit Mai 2024 nicht mehr)
- "Redaktionell verantwortlich" → **"Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV"**
- USt-IdNr. **DE464019752** statt "Wird nachgereicht"
- Gedankenstriche entfernt

## Damit die Texte stimmen, musst du noch:
- [ ] **HubSpot-Konto mit EU-Rechenzentrum** anlegen (siehe `crm-prozess.md`, Schritt 0).
- [ ] **Auftragsverarbeitungsverträge (DPA)** akzeptieren bzw. prüfen: Vercel, Google Cloud, Google Workspace, HubSpot, Cal.com, Google Ads (Datenverarbeitungsbedingungen für Werbetreibende). Meist ein Klick in den Kontoeinstellungen.
- [ ] **Vercel-Tarif prüfen:** Der kostenlose Hobby-Tarif ist laut Vercel-Bedingungen nur für nicht-kommerzielle Nutzung. Für eine Geschäftsseite mit Werbung ist der Pro-Tarif vorgesehen. Bitte in den Vercel-Bedingungen gegenprüfen.
- [ ] n8n-Instanz: Region in der Google-Cloud-Konsole einmal bestätigen (z. B. `europe-west3`).
- [ ] Wenn du später einen KI-Dienst in Kundenlösungen einsetzt: im jeweiligen Angebot und AV-Vertrag mit Kunden benennen (nicht in dieser Website-Erklärung).
