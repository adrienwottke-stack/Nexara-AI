// Schnelltest einer laufenden Version (lokal, workers.dev oder live). Legt keine Daten an.
//   npm run cf:check                                   → http://localhost:8787
//   npm run cf:check -- https://nexara.NAME.workers.dev
//   npm run cf:check -- https://nexara-ai.de
const base = (process.argv[2] || 'http://localhost:8787').replace(/\/+$/, '')
const origin = new URL(base).origin
const host = new URL(base).hostname
const live = host === 'nexara-ai.de'
const workersDev = host.endsWith('.workers.dev')

const checks = [
  { path: '/', status: 200, has: '<html' },
  { path: '/automatisierung/', status: 200, has: 'Prozesse automatisieren' },
  { path: '/automatisierung/handwerk/', status: 200 },
  { path: '/automatisierung/hausverwaltung/', status: 200 },
  { path: '/impressum', status: 200, has: 'DE464019752' },
  { path: '/datenschutz', status: 200, has: 'Cloudflare' },
  { path: '/impressum.html', status: 307, location: '/impressum', note: 'alte Links funktionieren' },
  { path: '/verzeichnis/', status: 200, has: 'Aus der Region' },
  { path: '/verzeichnis/eintragen/', status: 200, has: '<form' },
  { path: '/verzeichnis/betrieb/nexara-broesa/', status: 200, has: 'application/ld+json' },
  { path: '/verzeichnis/ort/malschwitz/', status: 200 },
  { path: '/verzeichnis/sitemap.xml', status: 200, has: '<urlset' },
  { path: '/verzeichnis/betriebe.json', status: 200, has: '"name"' },
  { path: '/verzeichnis/v.css', status: 200 },
  { path: '/verzeichnis/fonts/mona-sans.woff2', status: 200 },
  { path: '/llms.txt', status: 200, has: 'Verzeichnis' },
  { path: '/robots.txt', status: 200, has: 'OAI-SearchBot' },
  { path: '/sitemap.xml', status: 200, has: '<urlset' },
  { path: '/verzeichnis.html', status: 301, location: '/verzeichnis/' },
  { path: '/gibt-es-nicht/', status: 404 },
  { path: '/api/anfrage', status: 405 },
  { path: '/api/anfrage', method: 'POST', body: '{}', status: 400, note: 'leere Anfrage wird abgelehnt' },
]

let failed = 0
const line = (ok, label, detail = '') => {
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? `  (${detail})` : ''}`)
}

console.log(`\nPrüfe ${base}\n`)
for (const c of checks) {
  const method = c.method || 'GET'
  try {
    const res = await fetch(base + c.path, {
      method,
      redirect: 'manual',
      headers: c.body ? { 'content-type': 'application/json', origin } : {},
      body: c.body,
    })
    const text = c.has ? await res.text() : ''
    const problems = []
    if (res.status !== c.status) problems.push(`Status ${res.status} statt ${c.status}`)
    if (c.has && !text.includes(c.has)) problems.push(`"${c.has}" fehlt`)
    if (c.location && !(res.headers.get('location') || '').endsWith(c.location)) problems.push(`Weiterleitung nach ${res.headers.get('location')}`)
    if (c.path === '/' || c.path === '/verzeichnis/') {
      if (res.headers.get('x-content-type-options') !== 'nosniff') problems.push('Sicherheits-Header fehlen')
      // Live: indexierbar. workers.dev: überall noindex. localhost: nur Worker-Seiten setzen noindex.
      const noindex = (res.headers.get('x-robots-tag') || '').includes('noindex')
      if (live && noindex) problems.push('live, aber noindex gesetzt')
      if ((workersDev || (!live && c.path === '/verzeichnis/')) && !noindex) problems.push('Testadresse ohne noindex')
    }
    line(!problems.length, `${method} ${c.path}${c.note ? ` · ${c.note}` : ''}`, problems.join(', '))
  } catch (e) {
    line(false, `${method} ${c.path}`, `nicht erreichbar: ${e.cause?.code || e.message}`)
  }
}

if (live) {
  try {
    const res = await fetch('https://www.nexara-ai.de/verzeichnis/', { redirect: 'manual' })
    line(res.status === 301 && res.headers.get('location') === 'https://nexara-ai.de/verzeichnis/', 'www leitet auf nexara-ai.de um', `Status ${res.status}`)
  } catch (e) {
    line(false, 'www.nexara-ai.de', `nicht erreichbar: ${e.cause?.code || e.message}`)
  }
}

console.log(failed ? `\n✗ ${failed} Prüfung(en) fehlgeschlagen.\n` : '\n✓ Alles in Ordnung.\n')
process.exit(failed ? 1 : 0)
