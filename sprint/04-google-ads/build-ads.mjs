// Erzeugt Import-Dateien für den Google Ads Editor (UTF-16LE, tabgetrennt, wie Editor-Export).
// Prüft Zeichenlimits: Anzeigentitel ≤ 30, Beschreibungen ≤ 90, Pfade ≤ 15.
// Aufruf: node sprint/04-google-ads/build-ads.mjs
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const BASE = 'https://nexara-ai.de/automatisierung/'

const common = {
  hv: ['Hausverwaltung entlasten', 'Weniger Zeit im Postfach', 'Kostenloses Erstgespräch', 'Prozessanalyse für Verwalter', 'Nutzen vorab durchgerechnet', 'Passt zu Ihrer Software', 'Freigabe bleibt bei Ihnen', 'Festpreis statt Stundenzettel', 'Vor Ort in Dresden und Bautzen', 'Termin online buchen', 'Direkt mit dem Gründer', 'Nexara Prozessberatung'],
  hw: ['Büro im Handwerk entlasten', 'Angebote nicht mehr abends', 'Kostenloses Erstgespräch', 'Nachfassen läuft automatisch', 'Passt zu Ihrer Software', 'Nutzen vorab durchgerechnet', 'Festpreis statt Stundenzettel', 'Vor Ort in Dresden und Bautzen', 'Termin online buchen', 'Direkt mit dem Gründer', 'Für Betriebe mit 5-50 Leuten', 'Nexara Prozessberatung'],
  pa: ['Prozesse automatisieren', 'Abläufe, die sich rechnen', 'Kostenloses Erstgespräch', 'Nutzen vorab durchgerechnet', 'Festpreis statt Stundenzettel', 'Passt zu Ihrer Software', 'Vor Ort in Dresden und Bautzen', 'Prozessberatung mit Umsetzung', 'Für KMU in Sachsen', 'Termin online buchen', 'Direkt mit dem Gründer', 'Nexara Prozessberatung'],
  tools: ['Kostenloses Erstgespräch', 'Nutzen vorab durchgerechnet', 'Festpreis statt Stundenzettel', 'Prozessberatung mit Umsetzung', 'Dokumentiert und übergeben', 'Ihre Zugänge, Ihre Daten', 'Termin online buchen', 'Remote im DACH-Raum', 'APIs, Webhooks, CRM', 'Nexara Prozessberatung', 'Direkt mit dem Gründer', 'Erst rechnen, dann bauen'],
}

const campaigns = [
  {
    name: 'NX | Suche | Hausverwaltung | SN', budget: { 300: 5, 500: 6.5, 1000: 10 }, url: BASE + 'hausverwaltung/', path: ['hausverwaltung', 'prozessanalyse'], cpc: 3.5, set: 'hv',
    desc: [
      'Mieteranfragen sortieren, Schäden erfassen, Belege zuordnen. Angebunden an Ihre Software.',
      '30 Min. kostenlos: Danach wissen Sie, ob sich Automatisierung für Ihre Verwaltung lohnt.',
      'Gerechnet wird mit Ihren Zahlen, nicht mit Werbeversprechen. Festpreis je Etappe.',
      'Prozessanalyse vor Ort in Dresden und Bautzen oder per Video. Freigabe bleibt bei Ihnen.',
    ],
    groups: [
      { name: 'HV Automatisierung', pin: ['Hausverwaltung automatisieren', 'KI für Hausverwaltungen', 'Verwaltung effizienter machen'],
        kw: ['hausverwaltung automatisieren', 'hausverwaltung automatisierung', 'immobilienverwaltung automatisieren', 'prozesse hausverwaltung optimieren', 'ki für hausverwaltung', 'ki hausverwaltung', 'ki immobilienverwaltung', 'hausverwaltung effizienter'] },
      { name: 'HV Digitalisierung', pin: ['Hausverwaltung digitalisieren', 'Digitalisierung mit Plan', 'Erst rechnen, dann bauen'],
        kw: ['hausverwaltung digitalisieren', 'digitalisierung hausverwaltung', 'digitalisierung immobilienverwaltung', 'immobilienverwaltung digitalisieren', 'digitalisierung hausverwaltung beratung', 'digitale hausverwaltung beratung'] },
      { name: 'HV Abläufe', pin: ['Mieteranfragen vorsortieren', 'Schadensmeldungen strukturiert', 'Postfach automatisch sortiert'],
        kw: ['mieteranfragen automatisieren', 'mieterkommunikation automatisieren', 'schadensmeldung digitalisieren', 'posteingang hausverwaltung', 'e-mails hausverwaltung sortieren'] },
    ],
    negatives: ['hausverwaltung gesucht', 'hausverwaltung finden', 'hausverwaltung in der nähe', 'hausverwalter werden', 'hausverwaltung kosten', 'wohnung', 'mietwohnung', 'mietvertrag', 'kündigung', 'beschwerde', 'nebenkostenabrechnung prüfen', 'hausmeister'],
  },
  {
    name: 'NX | Suche | Handwerk | SN', budget: { 300: 5, 500: 6.5, 1000: 9 }, url: BASE + 'handwerk/', path: ['handwerk', 'angebote'], cpc: 3.0, set: 'hw',
    desc: [
      'Anfragen mit Maßen und Fotos erfassen, Angebote vorbereiten, automatisch nachfassen.',
      '30 Minuten, kostenlos: Danach wissen Sie, ob sich Automatisierung für Ihren Betrieb lohnt.',
      'Gerechnet wird mit Ihren Zahlen, nicht mit Werbeversprechen. Festpreis je Etappe.',
      'Passend zu Ihrer Handwerkersoftware. Vor Ort in Dresden, Bautzen und ganz Sachsen.',
    ],
    groups: [
      { name: 'HW Digitalisierung', pin: ['Handwerk digitalisieren', 'Digitalisierung mit Plan', 'Erst rechnen, dann bauen'],
        kw: ['handwerksbetrieb digitalisieren', 'digitalisierung handwerksbetrieb', 'digitalisierung handwerk beratung', 'handwerk digitalisieren', 'digitalisierung im handwerk beratung', 'ki im handwerk beratung', 'ki handwerksbetrieb'] },
      { name: 'HW Büro und Angebote', pin: ['Angebote schneller erstellen', 'Anfragen sauber erfassen', 'Stundenzettel bis Rechnung'],
        kw: ['angebote schneller erstellen handwerk', 'angebotserstellung handwerk automatisieren', 'büro handwerk organisieren', 'büroorganisation handwerksbetrieb', 'handwerk büro entlasten', 'handwerker büro automatisieren', 'angebote nachfassen handwerk'] },
      { name: 'HW Software-Einführung', pin: ['Handwerkersoftware einführen', 'Hilfe bei der Einführung', 'Software richtig verbinden'],
        kw: ['handwerkersoftware einführen', 'handwerkersoftware einführung', 'handwerkersoftware beratung', 'handwerkersoftware umstellen'] },
    ],
    negatives: ['handwerker finden', 'handwerker gesucht', 'handwerker in der nähe', 'handwerkerportal', 'meisterschule', 'meisterbonus', 'azubi', 'lehrling', 'handwerkskammer', 'vergleich', 'testsieger', 'kostenlose software', 'gratis'],
  },
  {
    name: 'NX | Suche | Prozessautomatisierung | SN', budget: { 300: 0, 500: 3.5, 1000: 7 }, url: BASE, path: ['automatisierung', 'erstgespraech'], cpc: 4.0, set: 'pa',
    desc: [
      'Nexara findet die Abläufe, die Ihren Betrieb Zeit kosten, und setzt um, was sich lohnt.',
      '30 Minuten, kostenlos: Danach wissen Sie, ob sich Automatisierung für Sie lohnt.',
      'Gerechnet wird mit Ihren Zahlen. Ihre Programme werden verbunden, nicht ersetzt.',
      'Prozessanalyse vor Ort in Dresden und Bautzen oder per Video. Festpreis je Etappe.',
    ],
    groups: [
      { name: 'PA Automatisierung Beratung', pin: ['Büroprozesse automatisieren', 'Workflow-Automatisierung', 'Prozessautomatisierung KMU'],
        kw: ['prozessautomatisierung beratung', 'prozessautomatisierung kmu', 'geschäftsprozesse automatisieren', 'geschäftsprozesse automatisieren lassen', 'büroprozesse automatisieren', 'workflow automatisierung beratung', 'workflow automatisierung agentur', 'prozessoptimierung kmu beratung'] },
      { name: 'PA KI Automatisierung', pin: ['KI im Betrieb mit Augenmaß', 'KI, wo sie sich rechnet', 'Automatisierung für KMU'],
        kw: ['ki automatisierung unternehmen', 'ki automatisierung kmu', 'ki beratung kmu', 'ki agentur mittelstand', 'ki im unternehmen einführen beratung'] },
      { name: 'PA Lokal', pin: ['Digitalisierung in Dresden', 'Beratung aus Bautzen', 'Prozessberatung Sachsen'],
        kw: ['digitalisierung beratung dresden', 'ki beratung dresden', 'prozessoptimierung dresden', 'automatisierung dresden', 'digitalisierungsberatung sachsen', 'prozessoptimierung sachsen', 'ki beratung sachsen', 'digitalisierung beratung bautzen', 'ki agentur dresden'] },
    ],
    negatives: ['rpa software', 'sap', 'salesforce', 'großunternehmen', 'konzern'],
  },
  {
    name: 'NX | Suche | Tools n8n Make Zapier | DACH', budget: { 300: 0, 500: 0, 1000: 7 }, url: BASE, path: ['automatisierung', 'umsetzung'], cpc: 4.0, set: 'tools',
    desc: [
      'Automatisierungen mit n8n, Make, APIs und CRM, sauber dokumentiert und auf Ihren Konten.',
      '30 Minuten, kostenlos: Wir prüfen, welcher Ablauf sich lohnt, und rechnen es vorab durch.',
      'Festpreis je Etappe, Übergabe mit Dokumentation. Sie bleiben unabhängig.',
      'Für KMU im deutschsprachigen Raum, per Video. Vor Ort in Dresden und Bautzen.',
    ],
    groups: [
      { name: 'Tools n8n', pin: ['n8n-Automatisierung für KMU', 'n8n Experte für KMU', 'n8n-Workflows, die laufen'],
        kw: ['n8n agentur', 'n8n experte', 'n8n beratung', 'n8n freelancer', 'n8n entwickler'] },
      { name: 'Tools Make Zapier', pin: ['Make und Zapier Umsetzung', 'Automatisierung mit Make', 'Zapier-Workflows für KMU'],
        kw: ['make.com agentur', 'make agentur automatisierung', 'zapier experte', 'zapier agentur', 'zapier beratung'] },
    ],
    negatives: ['download', 'docker', 'install', 'installieren', 'self hosted', 'selbst hosten', 'templates', 'pricing', 'preise', 'login', 'vs', 'community', 'nodes'],
  },
]

const sharedNegatives = ['job', 'jobs', 'stellenangebot', 'stellenangebote', 'stelle', 'gehalt', 'ausbildung', 'studium', 'studiengang', 'praktikum', 'werkstudent', 'bachelorarbeit', 'masterarbeit', 'hausarbeit', 'karriere', 'bewerbung', 'kurs', 'kurse', 'seminar', 'schulung', 'weiterbildung', 'zertifikat', 'zertifizierung', 'lernen', 'tutorial', 'youtube', 'pdf', 'definition', 'was ist', 'was bedeutet', 'bedeutung', 'vorlage', 'vorlagen', 'template', 'open source', 'github', 'reddit', 'forum', 'freeware', 'kostenlos download', 'erfahrungen', 'privat']

// Prüfung -------------------------------------------------------------------
const errors = []
const DASH = /[ -  - ]/
const check = (s, max, what) => {
  if (s.length > max) errors.push(`${what} zu lang (${s.length}/${max}): ${s}`)
  if (DASH.test(s)) errors.push(`${what} enthält Gedankenstrich: ${s}`)
  if (what.startsWith('Titel') && s.includes('!')) errors.push(`Titel mit Ausrufezeichen: ${s}`)
}
for (const c of campaigns) {
  c.desc.forEach(d => check(d, 90, 'Beschreibung'))
  c.path.forEach(p => check(p, 15, 'Pfad'))
  for (const g of c.groups) {
    const hl = [...g.pin, ...common[c.set]]
    if (hl.length !== 15) errors.push(`${g.name}: ${hl.length} statt 15 Titel`)
    if (new Set(hl.map(h => h.toLowerCase())).size !== hl.length) errors.push(`${g.name}: doppelte Titel`)
    hl.forEach(h => check(h, 30, `Titel (${g.name})`))
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }

// Ausgabe (UTF-16LE + BOM, Tab) -------------------------------------------
const write = (file, header, rows) => {
  const text = [header, ...rows].map(r => r.map(v => String(v ?? '').replace(/[\t\n]/g, ' ')).join('\t')).join('\r\n')
  writeFileSync(join(dir, file), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]))
  console.log('geschrieben:', file, `(${rows.length} Zeilen)`)
}

const scenario = Number(process.argv[2] || 500)
write('1-kampagnen.csv', ['Campaign', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Bid Strategy Type', 'Campaign Status'],
  campaigns.filter(c => c.budget[scenario] > 0).map(c => [c.name, 'Search', 'Google search', c.budget[scenario].toFixed(2), 'Daily', 'Manual CPC', 'Paused']))

const active = campaigns.filter(c => c.budget[scenario] > 0)
write('2-anzeigengruppen.csv', ['Campaign', 'Ad Group', 'Max CPC', 'Ad Group Status'],
  active.flatMap(c => c.groups.map(g => [c.name, g.name, c.cpc.toFixed(2), 'Enabled'])))

write('3-keywords.csv', ['Campaign', 'Ad Group', 'Keyword', 'Criterion Type', 'Status'],
  active.flatMap(c => c.groups.flatMap(g => g.kw.flatMap(k => [[c.name, g.name, k, 'Exact', 'Enabled'], [c.name, g.name, k, 'Phrase', 'Enabled']]))))

write('4-negative-keywords.csv', ['Campaign', 'Ad Group', 'Keyword', 'Criterion Type'],
  active.flatMap(c => [...sharedNegatives, ...c.negatives].map(k => [c.name, '', k, 'Negative Phrase'])))

const adHeader = ['Campaign', 'Ad Group', 'Ad type', ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`), 'Headline 1 position', 'Headline 2 position', 'Headline 3 position', ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`), 'Path 1', 'Path 2', 'Final URL', 'Status']
write('5-anzeigen.csv', adHeader, active.flatMap(c => c.groups.map(g => {
  const hl = [...g.pin, ...common[c.set]]
  return [c.name, g.name, 'Responsive search ad', ...hl, '1', '1', '1', ...c.desc, c.path[0], c.path[1], c.url, 'Enabled']
})))

// Übersicht für die Keyword-Recherche (UTF-8 mit BOM, Semikolon, für Excel)
const research = [['Kampagne', 'Anzeigengruppe', 'Keyword', 'Suchvolumen Sachsen (Keyword-Planer)', 'Suchvolumen DE', 'Gebot unteres Ende (€)', 'Gebot oberes Ende (€)', 'Entscheidung (behalten/raus)']]
campaigns.forEach(c => c.groups.forEach(g => g.kw.forEach(k => research.push([c.name, g.name, k, '', '', '', '', '']))))
writeFileSync(join(dir, 'keyword-recherche.csv'), '﻿' + research.map(r => r.join(';')).join('\r\n'))
console.log('geschrieben: keyword-recherche.csv', `(${research.length - 1} Keywords)`, '· Szenario', scenario, '€')
