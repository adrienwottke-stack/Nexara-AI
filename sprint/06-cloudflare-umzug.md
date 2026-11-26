# Umzug von Vercel zu Cloudflare (kostenlos)

**Ist-Stand (geprüft am 25.11.2026):** nexara-ai.de zeigt per A-Eintrag auf Vercel (`216.198.79.1`). Das DNS liegt bei **Google Cloud DNS** (`ns-cloud-b1…b4.googledomains.com`), die Mails bei **Google Workspace**. DNSSEC ist aus (kein DS-Eintrag), `www.nexara-ai.de` gibt es bisher nicht.

**Ziel-Stand:** DNS und Hosting bei Cloudflare (Free-Tarif, 0 €). Ein Worker liefert die Website, beantwortet die Formulare, rendert das Verzeichnis aus der Datenbank D1 und räumt nachts nach den Löschfristen auf. Mail bleibt bei Google Workspace, n8n läuft auf deinem Hetzner-Server.

**Vorbereitet ist:** die Zonendatei mit allen DNS-Einträgen ([06-dns-zone-nexara-ai.de.txt](06-dns-zone-nexara-ai.de.txt)) und drei Befehle, die die Kommandozeilen-Arbeit übernehmen:

| Befehl | Was er macht |
|---|---|
| `npm run cf:setup` | Anmelden, Datenbank anlegen und eintragen, Tabellen und Startdaten einspielen, Geheimnisse erzeugen, erster Deploy. Kann beliebig oft laufen, erledigte Schritte überspringt er. |
| `npm run cf:check -- <Adresse>` | Prüft gut 20 Seiten und Funktionen einer laufenden Version. Legt keine Daten an. |
| `npm run cf:domain` | Verbindet nexara-ai.de mit dem Worker (erst wenn Cloudflare die Domain als aktiv meldet). |

Alle Befehle im Projektordner in PowerShell. **Geheimnisse nie in den Chat kopieren.**

---

## Morgen in dieser Reihenfolge

Aktive Zeit etwa 75 Minuten, dazwischen Wartezeit für den Nameserver-Wechsel (meist unter einer Stunde, bis zu 24 Stunden). Die Seite läuft die ganze Zeit weiter.

### Schritt 1: Cloudflare-Konto und Domain (10 Min)
1. dash.cloudflare.com: anmelden oder Konto anlegen (falls du schon eins hast, zum Beispiel für den n8n-Tunnel, nimm das). Free-Tarif.
2. **Domain hinzufügen** → `nexara-ai.de` → Free.
3. Bei der Frage nach den DNS-Einträgen **Zonendatei hochladen** wählen: [06-dns-zone-nexara-ai.de.txt](06-dns-zone-nexara-ai.de.txt). Das Häkchen **"über Proxy leiten" aus** lassen.
   Falls Cloudflare stattdessen selbst gescannt hat: unter DNS → Einträge prüfen, ob diese 6 Einträge da sind, fehlende über "Importieren" nachholen:

| Typ | Name | Inhalt | Proxy |
|---|---|---|---|
| MX | `@` | `smtp.google.com`, Priorität 1 | nur DNS |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | nur DNS |
| TXT | `google._domainkey` | `v=DKIM1; k=rsa; p=MIIBIjAN…` (vollständig in der Zonendatei) | nur DNS |
| TXT | `_dmarc` | `v=DMARC1; p=none` (neu) | nur DNS |
| A | `@` | `216.198.79.1` (Vercel, bleibt bis Schritt 5) | **nur DNS** |
| AAAA | `www` | `100::` (Platzhalter für die Weiterleitung) | nur DNS, in Schritt 6 umstellen |

4. Kurzer Abgleich mit der Google-Cloud-Konsole → Netzwerkdienste → Cloud DNS → Zone `nexara-ai.de`: Steht dort ein Eintrag, der oben fehlt (etwa eine Subdomain oder eine `google-site-verification`)? Dann in Cloudflare von Hand ergänzen. Öffentlich waren keine weiteren zu finden.
5. Cloudflare zeigt jetzt **zwei Nameserver** an (etwa `xxx.ns.cloudflare.com`). Fenster offen lassen.

### Schritt 2: Nameserver umstellen (5 Min, dann warten)
1. Beim **Registrar** einloggen, also dort, wo du nexara-ai.de gekauft hast und die Rechnung bekommst. Google Cloud DNS ist nur der DNS-Dienst. Nicht sicher? Im Postfach nach "nexara-ai.de" mit "Rechnung" oder "Domain" suchen.
2. Nameserver auf die zwei von Cloudflare ändern (die vier `ns-cloud-b…`-Einträge ersetzen).
3. Weiter mit Schritt 3. Cloudflare schickt eine Mail, sobald die Domain aktiv ist. Mail und Website laufen in der Zwischenzeit unverändert weiter, weil Cloudflare dieselben Einträge ausliefert.

### Schritt 3: Datenbank, Geheimnisse, erster Deploy (15 Min)
```powershell
npm run cf:setup
```
Was dabei passiert und was du tust:
- Ein Browserfenster öffnet sich für die Anmeldung → **Allow**.
- Falls Wrangler nach einer **workers.dev-Subdomain** fragt: einen Namen wählen, zum Beispiel `nexara-ai`. Die Testadresse heißt dann `https://nexara.nexara-ai.workers.dev`.
- Bei **"Ok to proceed?"** (Tabellen einspielen): `y`.
- Frage nach der **n8n-Webhook-URL**: Ist n8n noch nicht eingerichtet, einfach Enter. Das holst du in Schritt 4 nach.
- Am Ende stehen die **Testadresse** und ein **Wert für n8n** (Header `X-Nexara-Secret`) im Fenster. Den Wert gleich in Schritt 4 verwenden, er wird nur einmal angezeigt.

Dann die Testadresse prüfen:
```powershell
npm run cf:check -- https://nexara.DEIN-NAME.workers.dev
```
Erwartung: alle Zeilen mit ✓. Die Testadresse ist für Suchmaschinen gesperrt (noindex), es entsteht also keine Doppelung.

### Schritt 4: Mails und Tabelle verbinden, Test (35 Min)
1. Google-Tabelle "Nexara Pipeline" anlegen: [05-crm/crm-prozess.md](05-crm/crm-prozess.md), Abschnitt 1.
2. n8n-Workflow importieren und verbinden: [05-crm/crm-prozess.md](05-crm/crm-prozess.md), Abschnitt 4. Als Header-Wert den aus Schritt 3 nehmen.
3. Workflow aktivieren, Production-URL kopieren, dann:
```powershell
npm run cf:setup
```
   Diesmal fragt er nur nach der Webhook-URL: einfügen, Enter. Er lädt sie hoch und deployt neu.
4. **Test Anfrage:** Auf der Testadresse `/automatisierung/` das Formular mit deinen Daten absenden → Mail an dich, Zeile im Blatt "Pipeline".
5. **Test Verzeichnis:** `/verzeichnis/eintragen/` mit Namen "Test …" und deiner Mailadresse → Bestätigungsmail → Link → Freigabe-Mail an dich → **Freigeben** → Eintrag sichtbar, "Online"-Mail kommt an. Alle Links führen auf die Testadresse.
6. Testdaten löschen:
```powershell
npx wrangler d1 execute nexara --remote --command "DELETE FROM eintraege WHERE name LIKE 'Test%'"
```
   Die Testanfrage in der Datenbank verschwindet nach der Löschfrist von selbst. Die Zeile in der Google-Tabelle löschst du von Hand.

### Schritt 5: Domain verbinden (5 Min, sobald die Domain aktiv ist)
Erst wenn Cloudflare die Domain als **aktiv** meldet (Mail oder Übersichtsseite):
```powershell
npm run cf:domain
```
Wrangler fragt, ob der vorhandene DNS-Eintrag (Vercel) ersetzt werden soll → `y`. Ab jetzt liefert der Worker nexara-ai.de aus.

### Schritt 6: Einstellungen im Cloudflare-Dashboard (10 Min)
1. **www-Weiterleitung:** DNS → Eintrag `www` → Proxy **an** (orange Wolke). Dann Regeln → Weiterleitungsregeln → Vorlage **"Redirect from WWW to root"** → Bereitstellen.
2. **SSL/TLS** → Edgezertifikate → **"Immer HTTPS verwenden"** an.
3. **KI-Suche freigeben** (wichtig für das Verzeichnis), Cloudflare blockiert KI-Crawler je nach Einstellung von sich aus:
   - **AI Crawl Control** (KI-Crawler-Steuerung): Suchdienste erlauben, insbesondere `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `GPTBot`. "KI-Bots blockieren" **aus**.
   - **Verwaltete robots.txt aus**, damit unsere `robots.txt` gilt.
   - **Bot Fight Mode** aus lassen.
   - **Crawler Hints an** (Caching → Konfiguration). Cloudflare meldet Änderungen dann an Bing und andere.
4. Live prüfen:
```powershell
npm run cf:check -- https://nexara-ai.de
```
   Prüft zusätzlich, dass `www` weiterleitet und die echte Seite **nicht** auf noindex steht.

### Schritt 7: Suchmaschinen (15 Min, kann auch später)
- **Google Search Console:** Domain-Property `nexara-ai.de` hinzufügen. Die Bestätigung per DNS geht mit Cloudflare meist per Klick, sonst den angezeigten TXT-Eintrag in Cloudflare anlegen. Sitemaps `https://nexara-ai.de/sitemap.xml` und `https://nexara-ai.de/verzeichnis/sitemap.xml` einreichen.
- **Bing Webmaster Tools:** Import aus der Search Console, dieselben Sitemaps. ChatGPT-Suche greift stark auf den Bing-Index zurück.

### Schritt 8: Vercel abschalten (nach 7 Tagen ohne Probleme)
- Vercel-Projekt `nexara-ai`: Domain entfernen, Projekt archivieren oder löschen.
- Google-Cloud-Konsole: alte Cloud-DNS-Zone löschen (kostet sonst weiter ein paar Cent im Monat).

---

## Deploys ab jetzt
```powershell
npm run cf:deploy
```
Baut den **letzten Commit** in einem eigenen Ordner und lädt ihn hoch, genau wie bisher bei Vercel. Halbfertige, nicht committete Änderungen bleiben lokal. Datenbank-ID und `.env` kommen aus deinem Arbeitsordner.

- Probelauf ohne Upload: `npm run cf:deploy -- --dry-run`
- Bewusst den Arbeitsstand hochladen (inkl. nicht Committetem): `npm run cf:deploy:arbeitsstand`
- Lokal testen: `npm run db:migrate:local` (einmalig), dann `npm run cf:dev` → http://localhost:8787 und `npm run cf:check`. Lokal stehen Bestätigungslinks direkt auf der Seite (`DEV_MODE=1` in `.dev.vars`).
- Optional später: Cloudflare mit dem GitHub-Repo verbinden (Worker → Einstellungen → Builds), dann deployt jeder Push automatisch.

## Wenn etwas hakt
| Meldung | Lösung |
|---|---|
| "You are not authenticated" | `npx wrangler login`, dann den Befehl erneut |
| Mehrere Konten | `cf:setup` fragt einmal, welches, und merkt es sich in `wrangler.jsonc` |
| `cf:domain`: "externally managed DNS records" | In Cloudflare unter DNS den A-Eintrag `@` (216.198.79.1) löschen, `npm run cf:domain` erneut |
| Formular sendet, aber keine Mail | `npm run db:anfragen` zeigt, ob die Anfrage gespeichert ist (dann geht nichts verloren). In n8n unter Executions nachsehen. Header-Wert verloren: `npm run cf:setup -- --neues-mail-secret` und in n8n eintragen |
| Freigabe-Link sagt "Signatur passt nicht" | Link unvollständig kopiert, oder `ADMIN_SECRET` wurde neu gesetzt (alte Links verfallen dann) |

## Gut zu wissen
- Cloudflare leitet `.html`-Adressen auf die Form ohne Endung um (`/impressum.html` → `/impressum`). Alte Links funktionieren. In deiner neuen `public/sitemap.xml` (noch nicht committet) stehen `websites.html` und `verzeichnis.html`: Trag dort besser `/websites` und `/verzeichnis/` ein, sonst meldet die Search Console Weiterleitungen.
- Ohne gesetztes `ADMIN_SECRET` funktionieren Freigabe-Links live absichtlich nicht. `cf:setup` setzt es beim ersten Deploy mit.
- Kosten im Free-Tarif: 100.000 Worker-Aufrufe pro Tag (statische Seiten zählen nicht mit), D1 bis 5 GB.
