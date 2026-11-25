# Verzeichnis „Aus der Region“: Konzept und Wachstumsplan

**Adresse:** `https://nexara-ai.de/verzeichnis/` (die alte `/verzeichnis.html` leitet dorthin um)
**Technik:** Cloudflare Worker + D1, serverseitig gerendert, funktioniert ohne JavaScript.

## Wozu (ehrlich)
1. **Für die Betriebe:** eine kostenlose, saubere Seite mit Leistungen, Kontakt und Link zur eigenen Website. Das hilft bei Google (Erwähnung mit Ort und Link) und macht sie für KI-Suchen leichter auffindbar.
2. **Für Nexara:** Jeder Eintrag ist ein Kontakt, der von sich aus kommt. Mit der optionalen Einwilligung "Tipps per E-Mail" darfst du diesen Betrieben schreiben, was per Kaltakquise verboten wäre. Dazu kommen Sichtbarkeit und Vertrauen in der Region.
3. **Für die Region:** Wer sucht, findet Betriebe in der Nähe.

## Was gebaut ist
| Seite | Inhalt | Für Google und KI |
|---|---|---|
| `/verzeichnis/` | Suche, alle Betriebe, Kategorien, Orte, FAQ | CollectionPage, ItemList, FAQPage |
| `/verzeichnis/betrieb/<name>/` | eigene Seite je Betrieb mit "Auf einen Blick" (Art, Ort, Leistungen, Kontakt, Stand) | LocalBusiness (passender Typ), BreadcrumbList |
| `/verzeichnis/kategorie/<k>/`, `/verzeichnis/ort/<gemeinde>/` | Übersichten mit automatischem Einleitungssatz | ItemList; erst ab 3 Einträgen indexierbar (sonst "dünner Inhalt") |
| `/verzeichnis/eintragen/` | Formular, ohne JavaScript nutzbar | |
| `/verzeichnis/sitemap.xml` | alle indexierbaren Seiten mit Datum | |
| `/verzeichnis/betriebe.json` | offene Daten aller öffentlichen Einträge | maschinenlesbar für KI-Werkzeuge |
| `/llms.txt` | Kurzbeschreibung von Nexara + Liste aller Betriebe mit Links | Leitfaden für KI-Assistenten |
| `robots.txt` | KI-Suchdienste ausdrücklich erlaubt | |

**Ablauf eines Eintrags:** Formular → Bestätigungsmail an den Betrieb (Double-Opt-in) → Mail an dich mit Prüf-Link → Freigeben/Ablehnen per Klick → Betrieb bekommt den Link zu seiner Seite.
**Übernahme:** Bei redaktionellen Einträgen steht "Das ist dein Betrieb? Eintrag bestätigen". Nach Freigabe ersetzt der bestätigte Eintrag den redaktionellen unter derselben Adresse.
**Reihenfolge:** bestätigte Einträge vor redaktionellen, dann alphabetisch. **Keine bezahlten Platzierungen.** Das bleibt so. Es ist das wichtigste Vertrauenssignal für Nutzer, Google und KI-Systeme.

## Zu deiner Idee "Websites verlinken das Verzeichnis, damit sie höher stehen"
- **Unser Link zu ihrer Website** (normaler Link, kein `nofollow`) hilft dem Betrieb: Erwähnung mit Ort, Kategorie und Kontakt, auch strukturiert für Suchmaschinen.
- **Ihr Link zu uns** hilft dem Verzeichnis. Dafür gibt es auf jeder bestätigten Betriebsseite einen fertigen Code-Schnipsel ("Wir sind im Verzeichnis Aus der Region").
- **Bewusst nicht gebaut:** "Wer uns verlinkt, steht weiter oben." Platzierung gegen Rücklink gilt bei Google als Linktausch (Spam-Richtlinien) und kann beiden Seiten schaden. Bessere Position gibt es nur durch Bestätigung und vollständige Angaben.

## Realistische Erwartung an ChatGPT und Co.
- KI-Suchen (ChatGPT-Suche, Perplexity, Google KI-Übersichten) stützen sich auf Suchindizes (vor allem Bing und Google) und auf Seiten, die klar, aktuell und oft erwähnt sind. Garantien gibt es nicht.
- Ein Verzeichnis mit 6 Einträgen wird nicht zitiert. **Ab etwa 50 bis 100 bestätigten Einträgen** und einigen Erwähnungen von außen (Gemeindeblatt, Lokalpresse, Websites der Betriebe) wird es für sehr lokale Fragen ("Tischler in Malschwitz", "Bäcker bei Bautzen") interessant. Rechne mit 2 bis 6 Monaten.
- Was wir dafür tun: eigene Seite pro Betrieb mit Fakten in Klartext, strukturierte Daten, Sitemap, `llms.txt`, offene JSON-Daten, KI-Crawler erlaubt, Bing Webmaster Tools + IndexNow (siehe `06-cloudflare-umzug.md`, Schritt 6).

## Wachstumsplan: 50 Einträge in 6 Wochen
| Woche | Aktion | Ziel |
|---|---|---|
| 1 | Bestehende Website-Kunden und warme Kontakte persönlich bitten (Vorlage unten) | 10 |
| 2-3 | Briefwelle "Kostenloser Eintrag" an Betriebe in Malschwitz, Großdubrau, Radibor, Bautzen (Brief zulässig, Mail an Unbekannte nicht) | +20 |
| 2-6 | Persönlich vorbeigehen (Bäcker, Werkstatt, Friseur, Hofladen): 1-Seiter mit QR-Code zu `/verzeichnis/eintragen/` | +15 |
| 3 | Gemeindeverwaltung Malschwitz und Ortschaftsräte fragen: Hinweis im Amtsblatt bzw. Gemeindewebsite | Erwähnung + Link |
| 4 | Gewerbevereine, Handwerkskammer-Kreishandwerkerschaft, Wirtschaftsförderung Landkreis Bautzen ansprechen | Erwähnung + Link |
| laufend | Jede Freigabe: Betrieb bitten, den Link im Google-Profil oder auf der Website zu teilen | Rücklinks |

**Redaktionelle Einträge** (aus öffentlichen Angaben, ohne Fotos und ohne Privatpersonen) sind möglich und als solche gekennzeichnet. Nutze sie sparsam: lieber 30 bestätigte als 300 unbestätigte. Jeden redaktionell eingetragenen Betrieb zeitnah anschreiben (Brief) oder anrufen und zur Bestätigung einladen. Widerspruch = sofort löschen.

## Vom Eintrag zum Kunden (ohne aufdringlich zu sein)
1. Freigabe-Mail (automatisch) mit Link.
2. Bei Einwilligung "Tipps": nach 7 Tagen eine persönliche Mail mit **einem** konkreten, kostenlosen Hinweis zu ihrem Google-Profil oder ihrer Website (5 Min Aufwand).
3. Wer antwortet: kostenloses Erstgespräch anbieten (Website, Google-Profil, Anfragen, Automatisierung).
4. In der CRM-Tabelle Kanal = "Verzeichnis".
**Kennzahl:** Anteil Einträge mit Tipps-Einwilligung, daraus Erstgespräche, daraus Aufträge.

## Vorlagen
**Persönliche Nachricht (warm, du):**
> Hi [Name], ich baue gerade ein kostenloses Verzeichnis für Betriebe aus unserer Ecke auf: nexara-ai.de/verzeichnis. Jeder Betrieb bekommt eine eigene Seite mit Leistungen, Kontakt und Link zur Website, ohne Kosten und ohne Haken. Magst du [Betrieb] eintragen? Dauert fünf Minuten: nexara-ai.de/verzeichnis/eintragen

**Brief (Betreff):** "Ihr Betrieb, kostenlos gelistet: das neue Verzeichnis für den Landkreis Bautzen". Inhalt: wer du bist, was der Eintrag bringt, dass er kostenlos bleibt und keine Platzierungen verkauft werden, QR-Code zu `/verzeichnis/eintragen/?utm_source=brief&utm_medium=print&utm_campaign=verzeichnis`.

## Pflege (15 Min pro Woche)
- Freigabe-Mails bearbeiten (Ziel: innerhalb von 2 Werktagen).
- `npm run db:wartend` zeigt offene Einträge, falls eine Mail fehlt.
- Änderungswünsche per Mail: direkt in der Datenbank ändern, z. B.
  `npx wrangler d1 execute nexara --remote --command "UPDATE eintraege SET telefon='…', aktualisiert_am=datetime('now') WHERE slug='…'"`
- Löschungen: `UPDATE eintraege SET status='entfernt', aktualisiert_am=datetime('now') WHERE slug='…'` (wird nach 30 Tagen automatisch endgültig gelöscht).

## Später (erst wenn es trägt)
- Fotos pro Eintrag (Cloudflare R2, nur mit Rechten des Betriebs)
- Self-Service-Bearbeitung per Link aus der Mail
- Eigene Domain für das Verzeichnis, falls es größer als Nexara wird
- Unterseiten "Kategorie in Ort" (z. B. Handwerk in Malschwitz), sobald je Kombination ≥ 3 Einträge
