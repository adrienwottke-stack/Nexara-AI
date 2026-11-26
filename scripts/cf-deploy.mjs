// Deploy zu Cloudflare aus dem letzten Commit, nicht aus dem Arbeitsordner.
// So gehen nur committete Seiten live, halbfertige Änderungen bleiben lokal (wie bisher bei Vercel).
// Aufruf: npm run cf:deploy            (normal)
//         npm run cf:deploy -- --dry-run  (nur bauen und prüfen, nichts hochladen)
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const WRANGLER = join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const DEPLOY_DIR = join(ROOT, '.cf-deploy')
export const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000'

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', encoding: 'utf8', ...opts })
  if (r.error) throw r.error
  return r
}
export const git = (args, opts) => run('git', args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })
// Wrangler direkt über Node starten (funktioniert auch im Deploy-Ordner ohne eigenes node_modules)
export const wrangler = (args, opts) => run(process.execPath, [WRANGLER, ...args], opts)

// Fehler werfen statt sofort beenden, damit der Deploy-Ordner immer aufgeräumt wird.
export class Abbruch extends Error {}
export function fail(msg) {
  throw new Abbruch(msg)
}
export function main(fn) {
  Promise.resolve()
    .then(fn)
    .catch(e => {
      console.error(`\n✗ ${e instanceof Abbruch ? e.message : e?.stack || e}\n`)
      process.exit(1)
    })
}

function cleanup() {
  if (existsSync(DEPLOY_DIR)) git(['worktree', 'remove', '--force', DEPLOY_DIR])
  if (existsSync(DEPLOY_DIR)) rmSync(DEPLOY_DIR, { recursive: true, force: true })
  git(['worktree', 'prune'])
}

/**
 * Baut den letzten Commit in einem eigenen Ordner und lädt ihn hoch.
 * secrets: optionale Geheimnisse, die mit diesem Deploy hochgeladen werden (bleiben danach bestehen).
 */
export function deployFromCommit({ secrets = null, dryRun = false } = {}) {
  if (!existsSync(WRANGLER)) fail('Wrangler fehlt. Bitte zuerst: npm install')
  const config = readFileSync(join(ROOT, 'wrangler.jsonc'), 'utf8')
  if (!dryRun && config.includes(PLACEHOLDER_ID)) fail('Die Datenbank ist noch nicht eingerichtet. Bitte zuerst: npm run cf:setup')

  const head = git(['log', '-1', '--format=%h %s']).stdout.trim()
  const dirty = git(['status', '--porcelain']).stdout.split('\n').filter(Boolean).length
  console.log(`\n→ Deploy aus Commit ${head}`)
  if (dirty) console.log(`  ${dirty} nicht committete Änderungen bleiben lokal und gehen nicht live.`)

  cleanup()
  const add = git(['worktree', 'add', '--detach', DEPLOY_DIR, 'HEAD'])
  if (add.status !== 0) fail(`Konnte den Deploy-Ordner nicht anlegen:\n${add.stderr}`)

  const secretsFile = join(DEPLOY_DIR, '.cf-secrets.json')
  try {
    // Einstellungen aus dem Arbeitsordner übernehmen (Datenbank-ID, Routen, Google-Ads-IDs)
    copyFileSync(join(ROOT, 'wrangler.jsonc'), join(DEPLOY_DIR, 'wrangler.jsonc'))
    if (existsSync(join(ROOT, '.env'))) copyFileSync(join(ROOT, '.env'), join(DEPLOY_DIR, '.env'))

    console.log('→ Seiten bauen …')
    // npm findet vite über node_modules im Projektordner (eine Ebene höher)
    const build = run('npm', ['run', 'build'], { cwd: DEPLOY_DIR, shell: true })
    if (build.status !== 0) fail('Build fehlgeschlagen (siehe oben). Es wurde nichts hochgeladen.')

    const args = ['deploy']
    if (dryRun) args.push('--dry-run', '--outdir', join(DEPLOY_DIR, '.bundle'))
    if (secrets && Object.keys(secrets).length) {
      writeFileSync(secretsFile, JSON.stringify(secrets), { mode: 0o600 })
      args.push('--secrets-file', secretsFile)
    }
    console.log(dryRun ? '→ Probelauf (kein Upload) …' : '→ Hochladen zu Cloudflare …')
    const dep = wrangler(args, { cwd: DEPLOY_DIR })
    if (dep.status !== 0) fail('Deploy fehlgeschlagen (siehe oben).')
  } finally {
    rmSync(secretsFile, { force: true })
    cleanup()
  }
  console.log(dryRun ? '\n✓ Probelauf ok, nichts hochgeladen.\n' : '\n✓ Deploy fertig.\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(() => deployFromCommit({ dryRun: process.argv.includes('--dry-run') }))
}
