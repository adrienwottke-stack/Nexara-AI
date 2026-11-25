# Umzug von Vercel zu Cloudflare (kostenlos)

**Ist-Stand (geprüft am 25.11.2026):** nexara-ai.de zeigt per A-Record auf Vercel (Projekt `nexara-ai`). Das DNS liegt bei **Google Cloud DNS** (Nameserver `ns-cloud-b1…b4.googledomains.com`), die Mails bei **Google Workspace**.

**Ziel-Stand:** DNS und Hosting bei Cloudflare (Free-Tarif). Ein Cloudflare Worker liefert die statische Website aus `dist/`, beantwortet `/api/*`, rendert das Verzeichnis aus der kostenlosen Datenbank D1 und räumt täglich nach den Löschfristen auf. Kosten: 0 € (Free: 100.000 Worker-Aufrufe/Tag, D1 5 GB).

**Was gleich bleibt:** Google Workspace (MX, SPF, DKIM), n8n auf Google Cloud.

Alle Befehle im Projektordner in PowerShell ausführen.

---

## Schritt 1: Cloudflare-Konto und Zone (15 Min)
1. Konto auf dash.cloudflare.com anlegen (du selbst), Free-Tarif.
2. **"Domain hinzufügen"** → `nexara-ai.de` → Free. Cloudflare liest die bestehenden DNS-Einträge ein.
3. **DNS-Einträge prüfen.** Diese müssen danach in Cloudflare stehen (Stand der Abfrage):

| Typ | Name | Inhalt | Proxy |
|---|---|---|---|
| MX | `@` | `smtp.google.com`, Priorität 1 | (nur DNS) |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | |
| TXT | `google._domainkey` | DKIM-Schlüssel `v=DKIM1; k=rsa; p=MIIBIjAN…` (vollständig aus Cloud DNS übernehmen) | |
| A | `@` | **löschen** (zeigt auf Vercel; der Worker übernimmt) | |

   Fehlende Einträge vergleichst du mit der Google-Cloud-Konsole → Netzwerkdienste → Cloud DNS → Zone `nexara-ai.de`.
4. **Empfohlen neu:** DMARC-Eintrag (gibt es aktuell nicht):
   TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:a.wottke@nexara-ai.de`
5. Cloudflare zeigt zwei Nameserver an. **Noch nicht umstellen**, erst Schritt 2 bis 4.

## Schritt 2: Datenbank und Worker vorbereiten (15 Min)
```powershell
npx wrangler login
```
```powershell
npx wrangler d1 create nexara --location=weur
```
Die ausgegebene `database_id` in `wrangler.jsonc` eintragen (ersetzt `00000000-…`). Dann:
```powershell
npm run db:migrate
```
Geheimnisse setzen (jeweils Wert eingeben, wenn gefragt):
```powershell
npx wrangler secret put ADMIN_SECRET
```
```powershell
npx wrangler secret put MAIL_WEBHOOK_URL
```
```powershell
npx wrangler secret put MAIL_WEBHOOK_SECRET
```
- `ADMIN_SECRET`: langer Zufallstext, signiert die Freigabe-Links. Nie weitergeben.
- `MAIL_WEBHOOK_URL` und `MAIL_WEBHOOK_SECRET`: aus dem n8n-Workflow (`05-crm/crm-prozess.md`, Abschnitt 4).

## Schritt 3: Erster Deploy auf workers.dev (5 Min)
```powershell
npm run cf:deploy
```
Wrangler zeigt eine Adresse wie `https://nexara.<dein-name>.workers.dev`. Dort testen:
- [ ] `/automatisierung/` lädt, Formular sendet, Mail kommt an, Zeile in der Tabelle
- [ ] `/verzeichnis/` zeigt 6 Einträge, `/verzeichnis/eintragen/` → Testeintrag → Bestätigungsmail → Freigabe-Mail an dich → Freigabe → Eintrag sichtbar
- [ ] `/llms.txt`, `/verzeichnis/sitemap.xml`, `/verzeichnis/betriebe.json`
Testeintrag danach entfernen:
```powershell
npx wrangler d1 execute nexara --remote --command "DELETE FROM eintraege WHERE name LIKE 'Test%'"
```

## Schritt 4: Eigene Domain verbinden (5 Min)
In `wrangler.jsonc` vor `"observability"` ergänzen:
```jsonc
"routes": [
  { "pattern": "nexara-ai.de", "custom_domain": true },
  { "pattern": "www.nexara-ai.de", "custom_domain": true }
],
```
Das funktioniert erst, wenn die Zone in Cloudflare aktiv ist (Schritt 5). Bis dahin ist die workers.dev-Adresse die Testumgebung.

## Schritt 5: Nameserver umstellen (5 Min, dann warten)
1. Beim **Registrar** der Domain (dort, wo du nexara-ai.de gekauft hast und die Rechnung bekommst) die Nameserver auf die zwei Cloudflare-Nameserver ändern.
2. Warten, bis Cloudflare die Zone als **aktiv** meldet (meist 1 bis 24 Std.). Mails laufen dabei weiter, wenn MX/SPF/DKIM aus Schritt 1 stimmen.
3. `npm run cf:deploy` erneut ausführen (jetzt mit den Routen aus Schritt 4).
4. Cloudflare → SSL/TLS → Modus **"Vollständig (streng)"**, "Immer HTTPS verwenden" an.
5. `www.nexara-ai.de` auf `nexara-ai.de` umleiten: Regeln → Weiterleitungsregeln → "WWW zu Root" (Vorlage).

## Schritt 6: KI-Suche und Suchmaschinen freischalten (10 Min) **wichtig für das Verzeichnis**
Cloudflare blockiert KI-Crawler bei neuen Domains je nach Einstellung standardmäßig.
1. Cloudflare → Sicherheit → Bots bzw. **"KI-Crawler-Steuerung" (AI Crawl Control)**: KI-Crawler **erlauben**, insbesondere `OAI-SearchBot` und `ChatGPT-User` (ChatGPT-Suche), `PerplexityBot`, `Claude-SearchBot`, `GPTBot`. Option "KI-Bots blockieren" **aus**.
2. **"Verwaltete robots.txt" aus**, damit unsere `robots.txt` (KI-Bots ausdrücklich erlaubt) gilt.
3. **Crawler Hints an** (Cloudflare meldet Änderungen per IndexNow an Bing und andere).
4. **Bing Webmaster Tools**: Website hinzufügen (Import aus Google Search Console geht in einem Schritt), Sitemaps `https://nexara-ai.de/sitemap.xml` und `https://nexara-ai.de/verzeichnis/sitemap.xml` einreichen. ChatGPT-Suche greift stark auf den Bing-Index zurück.
5. **Google Search Console**: Domain-Property per DNS-TXT bestätigen, beide Sitemaps einreichen.

## Schritt 7: Vercel abschalten (nach 7 Tagen ohne Probleme)
- Vercel-Projekt `nexara-ai`: Domain `nexara-ai.de` entfernen, Projekt archivieren oder löschen.
- In der Google-Cloud-Konsole die alte Cloud-DNS-Zone löschen (sonst laufen dort kleine Kosten weiter).

## Deploys ab jetzt
```powershell
npm run cf:deploy
```
Baut Seiten und Worker und lädt beides hoch. Lokaler Test vorher: `npm run cf:dev` (Worker + lokale Datenbank auf http://localhost:8787, vorher einmal `npm run db:migrate:local`). Im lokalen Modus stehen Bestätigungslinks direkt auf der Seite (`DEV_MODE=1` in `.dev.vars`).

Optional später: Cloudflare mit dem GitHub-Repo verbinden (Workers → Einstellungen → Builds), dann deployt jeder Push auf `main` automatisch.
