// Einrichtung bei Cloudflare in einem Rutsch. Jeder Schritt prüft, ob er schon erledigt ist,
// das Skript kann also gefahrlos mehrfach laufen.
//
//   npm run cf:setup                       Anmelden, Datenbank, Tabellen, Geheimnisse, erster Deploy
//   npm run cf:setup -- --neues-mail-secret  neuen Wert für den n8n-Header erzeugen
//   npm run cf:domain                      nexara-ai.de verbinden (erst wenn die Zone aktiv ist)
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { PLACEHOLDER_ID, ROOT, deployFromCommit, fail, main, wrangler } from './cf-deploy.mjs'

const CONFIG = join(ROOT, 'wrangler.jsonc')
const DB_NAME = 'nexara'
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const argv = process.argv.slice(2)

const stripAnsi = s => String(s ?? '').replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
// Wrangler ohne Rückfragen ausführen und Ausgabe einsammeln
function quiet(args) {
  const r = wrangler(args, { stdio: ['ignore', 'pipe', 'pipe'] })
  return { ok: r.status === 0, stdout: stripAnsi(r.stdout), all: stripAnsi(`${r.stdout}\n${r.stderr}`) }
}
const jsonFrom = (s, fallback) => {
  const m = s.match(/[[{][\s\S]*[\]}]/)
  try { return m ? JSON.parse(m[0]) : fallback } catch { return fallback }
}
const readConfig = () => readFileSync(CONFIG, 'utf8')
const siteOrigin = () => readConfig().match(/"SITE_ORIGIN":\s*"([^"]+)"/)?.[1] ?? 'https://nexara-ai.de'

async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try { return (await rl.question(question)).trim() } finally { rl.close() }
}

// 1. Anmeldung
async function ensureLogin() {
  let who = quiet(['whoami'])
  if (!who.ok || /not authenticated/i.test(who.all)) {
    console.log('→ Anmeldung bei Cloudflare. Es öffnet sich ein Browserfenster, dort "Allow" klicken.')
    if (wrangler(['login']).status !== 0) fail('Anmeldung abgebrochen.')
    who = quiet(['whoami'])
    if (!who.ok || /not authenticated/i.test(who.all)) fail('Anmeldung hat nicht geklappt. Bitte "npx wrangler login" einzeln ausführen.')
  }
  // Mehrere Konten: einmal auswählen und in wrangler.jsonc festhalten
  const ids = [...new Set(who.all.match(/\b[0-9a-f]{32}\b/g) ?? [])]
  const cfg = readConfig()
  if (ids.length > 1 && !cfg.includes('"account_id"')) {
    console.log('\nDein Login hat mehrere Cloudflare-Konten:')
    ids.forEach((id, i) => console.log(`  ${i + 1}) ${id}`))
    const pick = Number(await ask('Welches Konto soll nexara-ai.de bekommen? Nummer: '))
    const id = ids[pick - 1]
    if (!id) fail('Keine gültige Auswahl.')
    writeFileSync(CONFIG, cfg.replace(/("name":\s*"[^"]+",)/, `$1\n  "account_id": "${id}",`))
  }
  console.log('✓ Bei Cloudflare angemeldet')
}

// 2. Datenbank anlegen und ID eintragen
function findDb() {
  const r = quiet(['d1', 'list', '--json'])
  if (!r.ok) fail(`Konnte die Datenbanken nicht abrufen:\n${r.all}`)
  return jsonFrom(r.stdout, []).find(d => d.name === DB_NAME)
}
function ensureDatabase() {
  const cfg = readConfig()
  if (!cfg.includes(PLACEHOLDER_ID)) return console.log('✓ Datenbank-ID steht schon in wrangler.jsonc')
  let db = findDb()
  if (!db) {
    console.log(`→ Datenbank "${DB_NAME}" in Westeuropa anlegen …`)
    const r = quiet(['d1', 'create', DB_NAME, '--location', 'weur', '--update-config=false'])
    if (!r.ok) fail(`Datenbank konnte nicht angelegt werden:\n${r.all}`)
    db = findDb() ?? { uuid: r.all.match(UUID)?.[0] }
  }
  if (!db?.uuid) fail('Datenbank-ID nicht gefunden. Im Dashboard unter "Storage & Databases → D1" nachsehen und in wrangler.jsonc eintragen.')
  writeFileSync(CONFIG, cfg.replace(PLACEHOLDER_ID, db.uuid))
  console.log(`✓ Datenbank verbunden (${db.uuid})`)
}

// 3. Tabellen und Startdaten (bereits eingespielte Migrationen werden übersprungen)
function migrate() {
  console.log('→ Tabellen und Startdaten einspielen. Falls Wrangler fragt "Ok to proceed?": mit y bestätigen.')
  if (wrangler(['d1', 'migrations', 'apply', DB_NAME, '--remote']).status !== 0) fail('Migration fehlgeschlagen (siehe oben).')
  console.log('✓ Datenbank bereit')
}

// 4. Geheimnisse ermitteln (fehlende werden erzeugt bzw. abgefragt)
async function collectSecrets() {
  const r = quiet(['secret', 'list', '--format', 'json'])
  let have = []
  if (r.ok) have = jsonFrom(r.stdout, []).map(s => s.name)
  else if (!/10007|not found|does not exist|could not be found/i.test(r.all)) fail(`Konnte die Geheimnisse nicht abrufen:\n${r.all}`)

  const secrets = {}
  let mailSecret = ''
  if (!have.includes('ADMIN_SECRET')) secrets.ADMIN_SECRET = randomBytes(32).toString('hex')
  if (!have.includes('MAIL_WEBHOOK_SECRET') || argv.includes('--neues-mail-secret')) {
    mailSecret = secrets.MAIL_WEBHOOK_SECRET = randomBytes(24).toString('hex')
  }
  if (!have.includes('MAIL_WEBHOOK_URL')) {
    console.log('\nWebhook-URL von n8n (Workflow "Nexara Mailer" → Knoten Webhook → Production URL).')
    const url = await ask('Einfügen und Enter. Noch nicht eingerichtet? Einfach Enter, dann später erneut ausführen: ')
    if (url) {
      if (!/^https:\/\/\S+$/.test(url)) fail('Die Webhook-URL muss mit https:// beginnen.')
      secrets.MAIL_WEBHOOK_URL = url
    }
  }
  const mailReady = have.includes('MAIL_WEBHOOK_URL') || Boolean(secrets.MAIL_WEBHOOK_URL)
  return { secrets, mailSecret, mailReady }
}

// 5. Eigene Domain (erst wenn die Zone in Cloudflare aktiv ist)
function addRoutes() {
  const host = new URL(siteOrigin()).hostname
  const cfg = readConfig()
  if (cfg.includes('"routes"')) return console.log('✓ Domains stehen schon in wrangler.jsonc')
  // www leitet eine Weiterleitungsregel im Dashboard um (Anleitung Schritt 6), nicht der Worker.
  const block = `"routes": [{ "pattern": "${host}", "custom_domain": true }],\n  "observability"`
  const next = cfg.replace('"observability"', block)
  if (next === cfg) fail('Konnte die Domains nicht in wrangler.jsonc eintragen.')
  writeFileSync(CONFIG, next)
  console.log(`✓ ${host} in wrangler.jsonc eingetragen`)
}

async function setup() {
  console.log('\nNexara: Einrichtung bei Cloudflare\n')
  await ensureLogin()

  if (argv.includes('--domain')) {
    addRoutes()
    console.log('  Wrangler fragt, ob der vorhandene DNS-Eintrag (Vercel) ersetzt werden soll: mit y bestätigen.')
    deployFromCommit()
    console.log('Jetzt im Dashboard: www-Weiterleitung und SSL (Anleitung Schritt 6), dann')
    console.log(`prüfen: npm run cf:check -- ${siteOrigin()}\n`)
    return
  }

  ensureDatabase()
  migrate()
  const { secrets, mailSecret, mailReady } = await collectSecrets()
  const neu = Object.keys(secrets)
  if (neu.length) console.log(`→ Neue Geheimnisse gehen mit diesem Deploy hoch: ${neu.join(', ')}`)
  deployFromCommit({ secrets })

  console.log('Nächste Schritte:')
  console.log('  • Die workers.dev-Adresse von oben prüfen: npm run cf:check -- https://nexara.DEIN-NAME.workers.dev')
  if (mailSecret) {
    console.log('  • In n8n beim Webhook-Knoten das Credential "Header Auth" so anlegen:')
    console.log('      Name:  X-Nexara-Secret')
    console.log(`      Wert:  ${mailSecret}`)
    console.log('    Der Wert wird nur jetzt angezeigt. Verloren? npm run cf:setup -- --neues-mail-secret')
  }
  if (!mailReady) console.log('  • Sobald der n8n-Workflow aktiv ist: npm run cf:setup erneut ausführen und die Webhook-URL einfügen.')
  else console.log('  • Test: Formular auf /automatisierung/ der workers.dev-Adresse absenden, Mail und Tabellenzeile prüfen.')
  console.log('')
}

main(setup)
