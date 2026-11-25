// HTML-Bausteine für die Verzeichnisseiten (serverseitig gerendert, ohne JavaScript nutzbar).
import { esc, KATEGORIEN, GEMEINDEN, gemeindeName, dateDe, type Eintrag } from './lib'

export type PageMeta = {
  title: string
  description: string
  path: string
  origin: string
  noindex?: boolean
  jsonld?: unknown[]
}

export function layout(meta: PageMeta, body: string): string {
  const url = `${meta.origin}${meta.path}`
  const ld = (meta.jsonld ?? []).map(d => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`).join('\n')
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}" />
${meta.noindex ? '<meta name="robots" content="noindex, follow" />' : `<link rel="canonical" href="${esc(url)}" />`}
<meta name="theme-color" content="#f7f8f2" />
<link rel="icon" type="image/svg+xml" href="/aw.svg" />
<link rel="preload" href="/verzeichnis/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/verzeichnis/v.css?v=2" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="de_DE" />
<meta property="og:site_name" content="Aus der Region · Verzeichnis Bautzen-Region" />
<meta property="og:title" content="${esc(meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:url" content="${esc(url)}" />
<link rel="alternate" type="application/json" href="/verzeichnis/betriebe.json" title="Alle Betriebe als JSON" />
${ld}
</head>
<body class="vz">
<a class="vz-skip" href="#inhalt">Zum Inhalt</a>
<header class="vz-top">
  <div class="vz-shell vz-top__row">
    <a class="vz-brand" href="/verzeichnis/">Aus der Region<small>Verzeichnis Bautzen-Region · von Nexara</small></a>
    <nav class="vz-nav" aria-label="Verzeichnis">
      <a href="/verzeichnis/#kategorien">Kategorien</a>
      <a href="/verzeichnis/#orte">Orte</a>
      <a class="vz-btn vz-btn--small" href="/verzeichnis/eintragen/">Kostenlos eintragen</a>
    </nav>
  </div>
</header>
<main id="inhalt">
${body}
</main>
<footer class="vz-footer">
  <div class="vz-shell vz-footer__row">
    <p>Aus der Region ist ein kostenloses Verzeichnis von <a href="/">Adrien Wottke</a> · Nexara, Brösa bei Bautzen. Keine bezahlten Platzierungen.</p>
    <nav aria-label="Weitere Links">
      <a href="/verzeichnis/eintragen/">Betrieb eintragen</a>
      <a href="/verzeichnis/betriebe.json">Offene Daten (JSON)</a>
      <a href="/automatisierung/">Nexara Prozessberatung</a>
      <a href="/impressum.html">Impressum</a>
      <a href="/datenschutz.html">Datenschutz</a>
    </nav>
  </div>
</footer>
</body>
</html>`
}

export const entryPath = (e: Pick<Eintrag, 'slug'>) => `/verzeichnis/betrieb/${e.slug}/`
export const katPath = (k: string) => `/verzeichnis/kategorie/${k}/`
export const ortPath = (g: string) => `/verzeichnis/ort/${g}/`
export const ortText = (e: Pick<Eintrag, 'gemeinde' | 'ortsteil'>) =>
  e.ortsteil ? `${e.ortsteil}, ${gemeindeName(e.gemeinde)}` : gemeindeName(e.gemeinde)

export function statusBadge(e: Eintrag): string {
  if (e.quelle === 'eigen') return `<span class="vz-badge vz-badge--own">Eigener Eintrag von Nexara</span>`
  if (e.quelle === 'betrieb') return `<span class="vz-badge vz-badge--ok">Vom Betrieb eingetragen${e.bestaetigt_am ? ` · ${dateDe(e.bestaetigt_am)}` : ''}</span>`
  return `<span class="vz-badge">Redaktionell recherchiert · noch nicht bestätigt</span>`
}

export function monogram(name: string): string {
  const letters = name.replace(/[^A-Za-zÄÖÜäöü0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return `<span class="vz-mono" aria-hidden="true">${esc(letters || '·')}</span>`
}

export function card(e: Eintrag): string {
  const tags = (e.leistungen || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4)
  return `<article class="vz-card">
  ${monogram(e.name)}
  <div class="vz-card__body">
    <p class="vz-card__meta">${esc(KATEGORIEN[e.kategorie]?.label ?? e.kategorie)} · ${esc(ortText(e))}</p>
    <h3><a href="${entryPath(e)}">${esc(e.name)}</a></h3>
    <p>${esc(e.kurz)}</p>
    ${tags.length ? `<ul class="vz-tags">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${statusBadge(e)}
  </div>
</article>`
}

export function cardList(list: Eintrag[]): string {
  return list.length ? `<div class="vz-cards">${list.map(card).join('')}</div>` : ''
}

export function searchForm(params: { q?: string; kategorie?: string; ort?: string }, orte: string[]): string {
  const kats = Object.entries(KATEGORIEN)
    .map(([k, v]) => `<option value="${k}"${params.kategorie === k ? ' selected' : ''}>${esc(v.label)}</option>`)
    .join('')
  const ortOpts = orte
    .map(g => `<option value="${g}"${params.ort === g ? ' selected' : ''}>${esc(gemeindeName(g))}</option>`)
    .join('')
  return `<form class="vz-search" action="/verzeichnis/" method="get" role="search">
  <label><span>Was suchst du?</span><input type="search" name="q" value="${esc(params.q ?? '')}" placeholder="z. B. Tischler, Bäcker, Physiotherapie" /></label>
  <label><span>Kategorie</span><select name="kategorie"><option value="">Alle Kategorien</option>${kats}</select></label>
  <label><span>Ort</span><select name="ort"><option value="">Alle Orte</option>${ortOpts}</select></label>
  <button class="vz-btn" type="submit">Finden</button>
</form>`
}

export function gemeindeOptions(selected = ''): string {
  return Object.entries(GEMEINDEN)
    .sort((a, b) => a[1].localeCompare(b[1], 'de'))
    .map(([k, v]) => `<option value="${k}"${selected === k ? ' selected' : ''}>${esc(v)}</option>`)
    .join('')
}

export function message(title: string, text: string, extra = ''): string {
  return `<section class="vz-shell vz-message"><p class="vz-kicker">Verzeichnis</p><h1>${title}</h1><p class="vz-lead">${text}</p>${extra}<p><a class="vz-link" href="/verzeichnis/">Zum Verzeichnis</a></p></section>`
}
