// Verzeichnisseiten: Übersicht, Kategorie- und Ortsseiten, Betriebsseiten, Eintragsformular, Sitemap, llms.txt.
import { type Env, type Eintrag, KATEGORIEN, GEMEINDEN, gemeindeName, esc, html, json, dateDe, sign, verify, now, notify } from './lib'
import { layout, cardList, searchForm, entryPath, katPath, ortPath, ortText, statusBadge, monogram, gemeindeOptions, message } from './views'

// Bestätigte Einträge (Betrieb selbst oder eigener) vor redaktionell recherchierten, dann alphabetisch.
const ORDER = `CASE quelle WHEN 'redaktion' THEN 1 ELSE 0 END, name COLLATE NOCASE`
const PAGE_HEADERS = { 'cache-control': 'public, max-age=120' }

export async function activeEntries(env: Env): Promise<Eintrag[]> {
  const { results } = await env.DB.prepare(`SELECT * FROM eintraege WHERE status = 'aktiv' ORDER BY ${ORDER}`).all<Eintrag>()
  return results
}

function countBy(list: Eintrag[], key: 'kategorie' | 'gemeinde'): [string, number][] {
  const m = new Map<string, number>()
  list.forEach(e => m.set(e[key], (m.get(e[key]) ?? 0) + 1))
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

const lastUpdate = (list: Eintrag[]) => list.reduce((d, e) => (e.aktualisiert_am > d ? e.aktualisiert_am : d), '')

function matches(e: Eintrag, q: string): boolean {
  const hay = `${e.name} ${e.kurz} ${e.beschreibung} ${e.leistungen ?? ''} ${e.ortsteil ?? ''} ${gemeindeName(e.gemeinde)} ${KATEGORIEN[e.kategorie]?.label ?? ''}`.toLowerCase()
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))
}

function itemListLd(origin: string, list: Eintrag[], name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: list.length,
    itemListElement: list.slice(0, 100).map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${origin}${entryPath(e)}`, name: e.name })),
  }
}

const FAQ = [
  ['Was kostet ein Eintrag?', 'Nichts. Der Eintrag ist dauerhaft kostenlos. Es gibt keine bezahlten Platzierungen und keine Premium-Pakete.'],
  ['Wer steckt hinter dem Verzeichnis?', 'Adrien Wottke aus Brösa bei Bautzen. Ich betreibe Nexara, eine Prozessberatung für kleine und mittlere Unternehmen, und baue dieses Verzeichnis auf, damit Betriebe aus der Region leichter gefunden werden.'],
  ['Warum ist das kostenlos?', 'Weil ein Verzeichnis nur nützt, wenn viele Betriebe drinstehen. Und ehrlich: Manche Betriebe fragen mich später nach einer Website oder einer Automatisierung. Das ist freiwillig und hat keinen Einfluss auf deinen Eintrag.'],
  ['In welcher Reihenfolge stehen die Betriebe?', 'Vom Betrieb selbst eingetragene und bestätigte Einträge stehen vor redaktionell recherchierten. Innerhalb davon alphabetisch. Niemand kann sich eine bessere Position kaufen.'],
  ['Wie schnell ist mein Eintrag online?', 'Nach der Bestätigung deiner E-Mail-Adresse prüfe ich jeden Eintrag von Hand, meist innerhalb von zwei Werktagen.'],
  ['Wie ändere oder lösche ich meinen Eintrag?', 'Schreib eine kurze Mail an a.wottke@nexara-ai.de. Änderungen und Löschungen erledige ich zeitnah.'],
]

export async function home(env: Env, url: URL): Promise<Response> {
  const all = await activeEntries(env)
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80)
  const kategorie = url.searchParams.get('kategorie') ?? ''
  const ort = url.searchParams.get('ort') ?? ''
  const filtered = all.filter(e => (!q || matches(e, q)) && (!kategorie || e.kategorie === kategorie) && (!ort || e.gemeinde === ort))
  const isSearch = Boolean(q || kategorie || ort)
  const kats = countBy(all, 'kategorie')
  const orte = countBy(all, 'gemeinde')
  const origin = env.SITE_ORIGIN

  const results = isSearch
    ? `<section class="vz-shell vz-section" aria-labelledby="treffer"><h2 id="treffer" class="vz-h2">${filtered.length} ${filtered.length === 1 ? 'Treffer' : 'Treffer'}${q ? ` für „${esc(q)}“` : ''}</h2>${cardList(filtered) || `<p class="vz-empty">Dazu gibt es noch keinen Eintrag. Kennst du einen passenden Betrieb? <a href="/verzeichnis/eintragen/">Hier kann er sich kostenlos eintragen.</a></p>`}</section>`
    : `<section class="vz-shell vz-section" aria-labelledby="alle"><h2 id="alle" class="vz-h2">Alle Betriebe</h2>${cardList(all)}</section>`

  const body = `
<section class="vz-hero">
  <div class="vz-shell">
    <p class="vz-kicker">Kostenloses Verzeichnis · Landkreis Bautzen</p>
    <h1>Gutes gibt’s<br />gleich <em>um die Ecke.</em></h1>
    <p class="vz-lead">Betriebe aus Malschwitz, Bautzen und der Region: Handwerk, Essen, Gesundheit, Service. Jeder Eintrag mit eigener Seite, direktem Kontakt und Link zur Website. Kostenlos und ohne bezahlte Platzierungen.</p>
    ${searchForm({ q, kategorie, ort }, orte.map(([g]) => g))}
    <p class="vz-stats">${all.length} Betriebe · ${orte.length} ${orte.length === 1 ? 'Ort' : 'Orte'} · zuletzt aktualisiert am ${dateDe(lastUpdate(all)) || dateDe(now())}</p>
  </div>
</section>
${results}
<section class="vz-shell vz-section vz-split" id="kategorien" aria-labelledby="kat-title">
  <div>
    <h2 class="vz-h2" id="kat-title">Nach Kategorie</h2>
    <ul class="vz-links">${Object.entries(KATEGORIEN).map(([k, v]) => { const n = kats.find(([x]) => x === k)?.[1] ?? 0; return `<li><a href="${katPath(k)}">${esc(v.label)}</a><span>${n}</span></li>` }).join('')}</ul>
  </div>
  <div id="orte">
    <h2 class="vz-h2">Nach Ort</h2>
    <ul class="vz-links">${orte.map(([g, n]) => `<li><a href="${ortPath(g)}">${esc(gemeindeName(g))}</a><span>${n}</span></li>`).join('') || '<li>Noch keine Orte</li>'}</ul>
  </div>
</section>
<section class="vz-cta">
  <div class="vz-shell vz-cta__row">
    <div><h2 class="vz-h2">Dein Betrieb fehlt noch?</h2><p>Eintragen dauert fünf Minuten und kostet nichts. Eine eigene Website brauchst du dafür nicht.</p></div>
    <a class="vz-btn vz-btn--light" href="/verzeichnis/eintragen/">Betrieb kostenlos eintragen</a>
  </div>
</section>
<section class="vz-shell vz-section" aria-labelledby="faq-title">
  <h2 class="vz-h2" id="faq-title">Fragen zum Verzeichnis</h2>
  <div class="vz-faq">${FAQ.map(([qq, a]) => `<details><summary>${esc(qq)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
</section>`

  return html(
    layout(
      {
        title: isSearch ? `Suche im Verzeichnis Bautzen-Region${q ? `: ${q}` : ''}` : 'Betriebe in Malschwitz, Bautzen und Umgebung · Verzeichnis Aus der Region',
        description: `Kostenloses Verzeichnis lokaler Betriebe im Landkreis Bautzen: ${all.length} Betriebe aus Handwerk, Gastronomie, Gesundheit und Service mit Kontakt und Website. Ohne bezahlte Platzierungen.`,
        path: '/verzeichnis/',
        origin,
        noindex: isSearch,
        jsonld: [
          { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Verzeichnis Aus der Region (Landkreis Bautzen)', url: `${origin}/verzeichnis/`, inLanguage: 'de', isPartOf: { '@type': 'WebSite', name: 'Nexara', url: origin }, about: { '@type': 'AdministrativeArea', name: 'Landkreis Bautzen' } },
          itemListLd(origin, all, 'Betriebe im Verzeichnis Aus der Region'),
          { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
        ],
      },
      body
    ),
    200,
    isSearch ? { 'cache-control': 'no-store' } : PAGE_HEADERS
  )
}

export async function hub(env: Env, type: 'kategorie' | 'ort', key: string): Promise<Response | null> {
  if (type === 'kategorie' && !KATEGORIEN[key]) return null
  const all = await activeEntries(env)
  const list = all.filter(e => (type === 'kategorie' ? e.kategorie === key : e.gemeinde === key))
  if (type === 'ort' && !list.length && !GEMEINDEN[key]) return null
  const origin = env.SITE_ORIGIN
  const label = type === 'kategorie' ? KATEGORIEN[key].label : gemeindeName(key)
  const title = type === 'kategorie' ? `${KATEGORIEN[key].plural} in der Bautzen-Region` : `Betriebe in ${label} und Umgebung`
  const groups = countBy(list, type === 'kategorie' ? 'gemeinde' : 'kategorie')
  const groupText = groups
    .map(([g, n]) => `${n} in ${type === 'kategorie' ? gemeindeName(g) : KATEGORIEN[g]?.label ?? g}`)
    .join(', ')
  const intro = list.length
    ? `Im Verzeichnis stehen aktuell ${list.length} ${list.length === 1 ? 'Eintrag' : 'Einträge'}${groupText ? ` (${groupText})` : ''}. Jeder Betrieb hat eine eigene Seite mit Leistungen, Kontakt und Website.`
    : `Hier gibt es noch keinen Eintrag. Kennst du einen Betrieb aus ${esc(label)}? Er kann sich kostenlos eintragen.`
  const path = type === 'kategorie' ? katPath(key) : ortPath(key)
  const body = `
<section class="vz-hero vz-hero--small">
  <div class="vz-shell">
    <nav class="vz-crumbs" aria-label="Brotkrumen"><a href="/verzeichnis/">Verzeichnis</a> › <span>${esc(label)}</span></nav>
    <h1>${esc(title)}</h1>
    <p class="vz-lead">${intro}</p>
  </div>
</section>
<section class="vz-shell vz-section">${cardList(list)}</section>
<section class="vz-cta"><div class="vz-shell vz-cta__row"><div><h2 class="vz-h2">Hier fehlt ein Betrieb?</h2><p>Der Eintrag ist kostenlos und in fünf Minuten erledigt.</p></div><a class="vz-btn vz-btn--light" href="/verzeichnis/eintragen/">Betrieb eintragen</a></div></section>`
  return html(
    layout(
      {
        title: `${title} · Verzeichnis Aus der Region`,
        description: list.length ? `${title}: ${list.slice(0, 5).map(e => e.name).join(', ')}${list.length > 5 ? ' und weitere' : ''}. Mit Kontakt und Website, kostenlos gelistet.` : `${title}: Noch keine Einträge. Betriebe können sich kostenlos eintragen.`,
        path,
        origin,
        noindex: list.length < 3,
        jsonld: [
          itemListLd(origin, list, title),
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Verzeichnis', item: `${origin}/verzeichnis/` }, { '@type': 'ListItem', position: 2, name: label, item: `${origin}${path}` }] },
        ],
      },
      body
    ),
    200,
    PAGE_HEADERS
  )
}

export async function entry(env: Env, slug: string): Promise<Response | null> {
  const e = await env.DB.prepare(`SELECT * FROM eintraege WHERE slug = ? AND status = 'aktiv'`).bind(slug).first<Eintrag>()
  if (!e) return null
  const all = await activeEntries(env)
  const near = all.filter(x => x.id !== e.id && x.gemeinde === e.gemeinde).slice(0, 6)
  const same = all.filter(x => x.id !== e.id && x.kategorie === e.kategorie && x.gemeinde !== e.gemeinde).slice(0, 6)
  const origin = env.SITE_ORIGIN
  const kat = KATEGORIEN[e.kategorie]
  const leistungen = (e.leistungen || '').split(',').map(s => s.trim()).filter(Boolean)
  const adresse = e.strasse || e.plz ? [e.strasse, [e.plz, e.ortsteil || gemeindeName(e.gemeinde)].filter(Boolean).join(' ')].filter(Boolean).join(', ') : ''
  const stand = e.quelle === 'redaktion'
    ? `Redaktionell recherchiert am ${dateDe(e.erstellt_am)} anhand öffentlicher Angaben. Der Betrieb hat den Eintrag noch nicht bestätigt.`
    : `Angaben vom Betrieb${e.bestaetigt_am ? `, bestätigt am ${dateDe(e.bestaetigt_am)}` : ''}. Zuletzt aktualisiert am ${dateDe(e.aktualisiert_am)}.`
  const website = e.website ? (e.website.startsWith('/') ? `${origin}${e.website}` : e.website) : ''
  const facts: [string, string][] = [
    ['Betrieb', esc(e.name)],
    ['Art', esc(kat?.label ?? e.kategorie)],
    ['Ort', `${esc(ortText(e))}, Landkreis Bautzen, Sachsen`],
    ...(leistungen.length ? ([['Leistungen', esc(leistungen.join(', '))]] as [string, string][]) : []),
    ...(e.telefon ? ([['Telefon', `<a href="tel:${esc(e.telefon.replace(/[^+\d]/g, ''))}">${esc(e.telefon)}</a>`]] as [string, string][]) : []),
    ...(e.email_oeffentlich ? ([['E-Mail', `<a href="mailto:${esc(e.email_oeffentlich)}">${esc(e.email_oeffentlich)}</a>`]] as [string, string][]) : []),
    ...(website ? ([['Website', `<a href="${esc(website)}" rel="noopener">${esc(website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`]] as [string, string][]) : []),
    ...(adresse ? ([['Adresse', esc(adresse)]] as [string, string][]) : []),
    ...(e.oeffnungszeiten ? ([['Öffnungszeiten', esc(e.oeffnungszeiten)]] as [string, string][]) : []),
    ['Stand', esc(stand)],
  ]
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': kat?.schema ?? 'LocalBusiness',
    '@id': `${origin}${entryPath(e)}#betrieb`,
    name: e.name,
    description: e.kurz,
    url: website || `${origin}${entryPath(e)}`,
    address: { '@type': 'PostalAddress', addressLocality: e.ortsteil ? `${gemeindeName(e.gemeinde)} OT ${e.ortsteil}` : gemeindeName(e.gemeinde), addressRegion: 'Sachsen', addressCountry: 'DE', ...(e.strasse ? { streetAddress: e.strasse } : {}), ...(e.plz ? { postalCode: e.plz } : {}) },
    areaServed: { '@type': 'AdministrativeArea', name: 'Landkreis Bautzen' },
    ...(e.telefon ? { telephone: e.telefon } : {}),
    ...(e.email_oeffentlich ? { email: e.email_oeffentlich } : {}),
    ...(website && !website.startsWith(origin) ? { sameAs: [website] } : {}),
    ...(leistungen.length ? { knowsAbout: leistungen } : {}),
  }
  const owner = e.quelle !== 'eigen'
    ? `<section class="vz-owner" aria-labelledby="owner-title">
  <h2 id="owner-title">Das ist dein Betrieb?</h2>
  ${e.quelle === 'redaktion' ? `<p>Dieser Eintrag wurde aus öffentlichen Angaben zusammengestellt. Bestätige oder ergänze ihn kostenlos, dann steht er als bestätigter Eintrag weiter oben.</p><p><a class="vz-btn" href="/verzeichnis/eintragen/?betrieb=${esc(e.slug)}">Eintrag bestätigen oder ergänzen</a></p>` : `<p>Änderungen? Schreib kurz an <a href="mailto:a.wottke@nexara-ai.de?subject=${encodeURIComponent(`Änderung Verzeichnis: ${e.name}`)}">a.wottke@nexara-ai.de</a>.</p>`}
  <p class="vz-small">Angaben falsch oder Eintrag entfernen? <a href="mailto:a.wottke@nexara-ai.de?subject=${encodeURIComponent(`Verzeichnis: ${e.name}`)}">Kurze Mail genügt.</a></p>
  ${e.quelle === 'betrieb' ? `<details class="vz-embed"><summary>Eintrag auf deiner Website verlinken</summary><p class="vz-small">Optional. Kopiere diesen Code in deine Website, zum Beispiel in den Footer:</p><textarea readonly rows="3">&lt;a href="${origin}${entryPath(e)}"&gt;Wir sind im Verzeichnis Aus der Region (Bautzen)&lt;/a&gt;</textarea></details>` : ''}
</section>`
    : ''
  const body = `
<article class="vz-shell vz-entry">
  <nav class="vz-crumbs" aria-label="Brotkrumen"><a href="/verzeichnis/">Verzeichnis</a> › <a href="${katPath(e.kategorie)}">${esc(kat?.label ?? e.kategorie)}</a> › <span>${esc(e.name)}</span></nav>
  <header class="vz-entry__head">
    ${monogram(e.name)}
    <div>
      <p class="vz-card__meta">${esc(kat?.label ?? e.kategorie)} · <a href="${ortPath(e.gemeinde)}">${esc(ortText(e))}</a></p>
      <h1>${esc(e.name)}</h1>
      ${statusBadge(e)}
    </div>
  </header>
  <div class="vz-entry__grid">
    <div class="vz-entry__text">
      <p class="vz-lead">${esc(e.kurz)}</p>
      ${e.beschreibung.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}
      ${leistungen.length ? `<h2>Leistungen</h2><ul class="vz-tags vz-tags--big">${leistungen.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    </div>
    <aside class="vz-facts" aria-labelledby="facts-title">
      <h2 id="facts-title">Auf einen Blick</h2>
      <dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      ${website ? `<a class="vz-btn" href="${esc(website)}" rel="noopener">Zur Website</a>` : ''}
    </aside>
  </div>
  ${near.length ? `<section class="vz-section--tight"><h2 class="vz-h2">Weitere Betriebe in ${esc(gemeindeName(e.gemeinde))}</h2>${cardList(near)}</section>` : ''}
  ${same.length ? `<section class="vz-section--tight"><h2 class="vz-h2">Weitere ${esc(kat?.plural ?? 'Betriebe')} in der Region</h2>${cardList(same)}</section>` : ''}
  ${owner}
</article>`
  return html(
    layout(
      {
        title: `${e.name} in ${ortText(e)} · ${kat?.label ?? ''}`,
        description: `${e.name} (${ortText(e)}): ${e.kurz}${leistungen.length ? ` Leistungen: ${leistungen.slice(0, 4).join(', ')}.` : ''}`.slice(0, 300),
        path: entryPath(e),
        origin,
        jsonld: [
          ld,
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Verzeichnis', item: `${origin}/verzeichnis/` }, { '@type': 'ListItem', position: 2, name: kat?.label ?? e.kategorie, item: `${origin}${katPath(e.kategorie)}` }, { '@type': 'ListItem', position: 3, name: e.name, item: `${origin}${entryPath(e)}` }] },
        ],
      },
      body
    ),
    200,
    PAGE_HEADERS
  )
}

export type FormValues = Record<string, string>
export async function form(env: Env, url: URL, values: FormValues = {}, errors: Record<string, string> = {}): Promise<Response> {
  const claimSlug = values.betrieb ?? url.searchParams.get('betrieb') ?? ''
  let claim: Eintrag | null = null
  if (claimSlug && !values.name) {
    claim = await env.DB.prepare(`SELECT * FROM eintraege WHERE slug = ? AND status = 'aktiv'`).bind(claimSlug).first<Eintrag>()
    if (claim) values = { betrieb: claim.slug, name: claim.name, kategorie: claim.kategorie, gemeinde: claim.gemeinde, ortsteil: claim.ortsteil ?? '', kurz: claim.kurz, beschreibung: claim.beschreibung, leistungen: claim.leistungen ?? '', website: claim.website ?? '' }
  }
  const v = (k: string) => esc(values[k] ?? '')
  const err = (k: string) => (errors[k] ? `<span class="vz-error" id="err-${k}">${esc(errors[k])}</span>` : '')
  const inv = (k: string) => (errors[k] ? ` aria-invalid="true" aria-describedby="err-${k}"` : '')
  const kats = Object.entries(KATEGORIEN).map(([k, x]) => `<option value="${k}"${values.kategorie === k ? ' selected' : ''}>${esc(x.label)}</option>`).join('')
  const body = `
<section class="vz-hero vz-hero--small">
  <div class="vz-shell">
    <nav class="vz-crumbs" aria-label="Brotkrumen"><a href="/verzeichnis/">Verzeichnis</a> › <span>Betrieb eintragen</span></nav>
    <h1>${claim || values.betrieb ? 'Eintrag bestätigen oder <em>ergänzen.</em>' : 'Betrieb kostenlos <em>eintragen.</em>'}</h1>
    <p class="vz-lead">Fünf Minuten, kostenlos, ohne Vertrag. Du bekommst eine eigene Seite mit Leistungen, Kontakt und Link zu deiner Website. Nach der Bestätigung deiner E-Mail prüfe ich den Eintrag und schalte ihn frei.</p>
  </div>
</section>
<section class="vz-shell vz-section">
  ${Object.keys(errors).length ? `<p class="vz-alert" role="alert">Bitte prüfe die markierten Felder.</p>` : ''}
  <form class="vz-form" method="post" action="/api/verzeichnis/eintragen" novalidate>
    <input type="hidden" name="betrieb" value="${v('betrieb')}" />
    <div class="vz-hp" aria-hidden="true"><label>Firmen-URL<input type="text" name="firma_url" tabindex="-1" autocomplete="off" /></label></div>
    <fieldset>
      <legend>Dein Betrieb <span>(öffentlich)</span></legend>
      <label>Name des Betriebs<input name="name" required maxlength="120" value="${v('name')}"${inv('name')} />${err('name')}</label>
      <div class="vz-row">
        <label>Kategorie<select name="kategorie" required${inv('kategorie')}><option value="">Bitte wählen</option>${kats}</select>${err('kategorie')}</label>
        <label>Gemeinde<select name="gemeinde" required${inv('gemeinde')}><option value="">Bitte wählen</option>${gemeindeOptions(values.gemeinde)}</select>${err('gemeinde')}</label>
      </div>
      <div class="vz-row vz-row--3">
        <label>Ortsteil <small>(optional)</small><input name="ortsteil" maxlength="80" value="${v('ortsteil')}" placeholder="z. B. Brösa" /></label>
        <label>Straße und Nr. <small>(optional)</small><input name="strasse" maxlength="120" value="${v('strasse')}" autocomplete="street-address" /></label>
        <label>PLZ <small>(optional)</small><input name="plz" maxlength="5" inputmode="numeric" value="${v('plz')}" autocomplete="postal-code" /></label>
      </div>
      <label>In einem Satz: Was bietest du an?<input name="kurz" required maxlength="160" value="${v('kurz')}" placeholder="z. B. Tischlerei für Möbel, Türen und Innenausbau"${inv('kurz')} />${err('kurz')}</label>
      <label>Beschreibung<textarea name="beschreibung" required rows="5" maxlength="1200" placeholder="Was macht ihr, für wen, seit wann, was ist euch wichtig?"${inv('beschreibung')}>${v('beschreibung')}</textarea>${err('beschreibung')}</label>
      <label>Leistungen <small>(mit Komma getrennt, bis zu 8)</small><input name="leistungen" maxlength="300" value="${v('leistungen')}" placeholder="z. B. Möbelbau, Treppen, Fenster, Reparaturen" /></label>
    </fieldset>
    <fieldset>
      <legend>Kontakt <span>(öffentlich, alles optional)</span></legend>
      <div class="vz-row vz-row--3">
        <label>Telefon<input name="telefon" type="tel" maxlength="40" value="${v('telefon')}" autocomplete="tel" /></label>
        <label>E-Mail<input name="email_oeffentlich" type="email" maxlength="120" value="${v('email_oeffentlich')}"${inv('email_oeffentlich')} />${err('email_oeffentlich')}</label>
        <label>Website<input name="website" maxlength="200" value="${v('website')}" placeholder="www.beispiel.de"${inv('website')} />${err('website')}</label>
      </div>
      <label>Öffnungszeiten <small>(optional)</small><input name="oeffnungszeiten" maxlength="200" value="${v('oeffnungszeiten')}" placeholder="z. B. Mo bis Fr 7 bis 16 Uhr, Termine nach Vereinbarung" /></label>
    </fieldset>
    <fieldset>
      <legend>Für die Bestätigung <span>(nicht öffentlich)</span></legend>
      <div class="vz-row">
        <label>Dein Name<input name="kontakt_name" required maxlength="100" value="${v('kontakt_name')}" autocomplete="name"${inv('kontakt_name')} />${err('kontakt_name')}</label>
        <label>Deine E-Mail<input name="kontakt_email" type="email" required maxlength="120" value="${v('kontakt_email')}" autocomplete="email"${inv('kontakt_email')} />${err('kontakt_email')}</label>
      </div>
      <label class="vz-check"><input type="checkbox" name="einwilligung" value="ja"${values.einwilligung ? ' checked' : ''}${inv('einwilligung')} /> <span>Ich darf diesen Betrieb eintragen und bin einverstanden, dass die öffentlichen Angaben im Verzeichnis veröffentlicht werden. Ich kann den Eintrag jederzeit löschen lassen. <a href="/datenschutz.html#verzeichnis">Datenschutz</a></span></label>${err('einwilligung')}
      <label class="vz-check"><input type="checkbox" name="marketing" value="ja"${values.marketing ? ' checked' : ''} /> <span>Optional: Ich möchte gelegentlich Tipps von Nexara per E-Mail bekommen, wie mein Betrieb online besser gefunden wird. Abmeldung jederzeit möglich.</span></label>
    </fieldset>
    <button class="vz-btn" type="submit">Eintrag absenden</button>
    <p class="vz-small">Danach bekommst du eine E-Mail mit einem Bestätigungslink. Erst nach deiner Bestätigung und meiner Prüfung wird der Eintrag veröffentlicht.</p>
  </form>
</section>`
  return html(layout({ title: 'Betrieb kostenlos eintragen · Verzeichnis Aus der Region', description: 'Trag deinen Betrieb aus dem Landkreis Bautzen kostenlos ins Verzeichnis Aus der Region ein: eigene Seite, Kontakt, Link zur Website, keine bezahlten Platzierungen.', path: '/verzeichnis/eintragen/', origin: env.SITE_ORIGIN, noindex: Boolean(claimSlug) }, body), Object.keys(errors).length ? 400 : 200)
}

export async function confirm(env: Env, url: URL): Promise<Response> {
  const token = (url.searchParams.get('t') ?? '').slice(0, 80)
  const meta = { title: 'Eintrag bestätigt · Verzeichnis', description: 'Bestätigung', path: '/verzeichnis/bestaetigen/', origin: env.SITE_ORIGIN, noindex: true }
  if (!token) return html(layout(meta, message('Link unvollständig.', 'Bitte öffne den Link aus der E-Mail vollständig.')), 400)
  const e = await env.DB.prepare(`SELECT * FROM eintraege WHERE token = ? AND status = 'unbestaetigt'`).bind(token).first<Eintrag>()
  if (!e) return html(layout(meta, message('Schon erledigt.', 'Dieser Link wurde bereits verwendet oder ist abgelaufen. Wenn dein Eintrag noch nicht online ist, melde dich kurz bei a.wottke@nexara-ai.de.')), 200)
  const ts = now()
  await env.DB.prepare(`UPDATE eintraege SET status = 'wartend', token = NULL, bestaetigt_am = ?, aktualisiert_am = ? WHERE id = ?`).bind(ts, ts, e.id).run()
  const sig = await sign(env, `moderation:${e.id}`)
  const link = `${env.SITE_ORIGIN}/verzeichnis/moderation/?id=${e.id}&sig=${sig}`
  await notify(env, {
    mail: {
      to: env.ADMIN_EMAIL,
      subject: `Verzeichnis: neuer Eintrag zur Prüfung (${e.name})`,
      text: `Neuer bestätigter Eintrag:\n\n${e.name}\n${KATEGORIEN[e.kategorie]?.label ?? e.kategorie} · ${ortText(e)}\n${e.kurz}\n\nWebsite: ${e.website ?? '-'}\nTelefon: ${e.telefon ?? '-'}\nKontakt (privat): ${e.kontakt_name}, ${e.kontakt_email}\nTipps von Nexara gewünscht: ${e.marketing_ok ? 'ja' : 'nein'}\n${e.hinweis ? `Hinweis: ${e.hinweis}\n` : ''}\nPrüfen und freigeben:\n${link}`,
    },
    row: { sheet: 'Verzeichnis', values: { Datum: ts.slice(0, 10), Betrieb: e.name, Kategorie: KATEGORIEN[e.kategorie]?.label ?? e.kategorie, Ort: ortText(e), Ansprechperson: e.kontakt_name, 'E-Mail': e.kontakt_email, Telefon: e.telefon ?? '', Website: e.website ?? '', 'Tipps erlaubt': e.marketing_ok ? 'ja' : 'nein', Status: 'zur Prüfung' } },
  })
  return html(layout(meta, message('Danke, <em>bestätigt.</em>', `Dein Eintrag für ${esc(e.name)} liegt jetzt bei mir zur Prüfung. Sobald er online ist, bekommst du eine kurze E-Mail mit dem Link.`)))
}

export async function moderationPage(env: Env, url: URL): Promise<Response> {
  const id = Number(url.searchParams.get('id'))
  const sig = url.searchParams.get('sig') ?? ''
  const meta = { title: 'Moderation · Verzeichnis', description: 'Moderation', path: '/verzeichnis/moderation/', origin: env.SITE_ORIGIN, noindex: true }
  if (!id || !(await verify(env, `moderation:${id}`, sig))) return html(layout(meta, message('Link ungültig.', 'Die Signatur passt nicht.')), 403)
  const e = await env.DB.prepare(`SELECT * FROM eintraege WHERE id = ?`).bind(id).first<Eintrag>()
  if (!e) return html(layout(meta, message('Nicht gefunden.', 'Diesen Eintrag gibt es nicht mehr.')), 404)
  const rows: [string, string | null | number][] = [
    ['Status', e.status], ['Name', e.name], ['Kategorie', KATEGORIEN[e.kategorie]?.label ?? e.kategorie], ['Ort', ortText(e)], ['Straße', e.strasse], ['PLZ', e.plz],
    ['Kurz', e.kurz], ['Beschreibung', e.beschreibung], ['Leistungen', e.leistungen], ['Telefon', e.telefon], ['E-Mail öffentlich', e.email_oeffentlich],
    ['Website', e.website], ['Öffnungszeiten', e.oeffnungszeiten], ['Kontakt (privat)', `${e.kontakt_name}, ${e.kontakt_email}`], ['Tipps erlaubt', e.marketing_ok ? 'ja' : 'nein'], ['Hinweis', e.hinweis],
  ]
  const body = `<section class="vz-shell vz-section vz-moderation">
  <h1>Eintrag prüfen</h1>
  <p class="vz-small">Prüfe: Gibt es den Betrieb? Passt die Website? Keine Werbung für Dritte, keine unzulässigen Inhalte.</p>
  <dl class="vz-facts vz-facts--wide">${rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val ?? '')}</dd></div>`).join('')}</dl>
  <form method="post" action="/api/verzeichnis/moderation" class="vz-mod-actions">
    <input type="hidden" name="id" value="${e.id}" /><input type="hidden" name="sig" value="${esc(sig)}" />
    <button class="vz-btn" name="aktion" value="freigeben">Freigeben</button>
    <button class="vz-btn vz-btn--ghost" name="aktion" value="ablehnen">Ablehnen</button>
  </form>
</section>`
  return html(layout(meta, body), 200, { 'cache-control': 'no-store' })
}

export async function sitemap(env: Env): Promise<Response> {
  const all = await activeEntries(env)
  const o = env.SITE_ORIGIN
  const urls: [string, string][] = [[`${o}/verzeichnis/`, lastUpdate(all)]]
  countBy(all, 'kategorie').filter(([, n]) => n >= 3).forEach(([k]) => urls.push([`${o}${katPath(k)}`, lastUpdate(all.filter(e => e.kategorie === k))]))
  countBy(all, 'gemeinde').filter(([, n]) => n >= 3).forEach(([g]) => urls.push([`${o}${ortPath(g)}`, lastUpdate(all.filter(e => e.gemeinde === g))]))
  all.forEach(e => urls.push([`${o}${entryPath(e)}`, e.aktualisiert_am]))
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${esc(u)}</loc>${d ? `<lastmod>${d.slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}

export async function openData(env: Env): Promise<Response> {
  const all = await activeEntries(env)
  const o = env.SITE_ORIGIN
  return json(
    {
      name: 'Verzeichnis Aus der Region (Landkreis Bautzen)',
      herausgeber: 'Nexara · Adrien Wottke, Malschwitz',
      stand: lastUpdate(all),
      hinweis: 'Öffentliche Angaben der Betriebe. Redaktionelle Einträge sind als solche gekennzeichnet.',
      betriebe: all.map(e => ({
        name: e.name,
        url: `${o}${entryPath(e)}`,
        kategorie: KATEGORIEN[e.kategorie]?.label ?? e.kategorie,
        gemeinde: gemeindeName(e.gemeinde),
        ortsteil: e.ortsteil,
        kurz: e.kurz,
        leistungen: (e.leistungen || '').split(',').map(s => s.trim()).filter(Boolean),
        telefon: e.telefon,
        email: e.email_oeffentlich,
        website: e.website && e.website.startsWith('/') ? `${o}${e.website}` : e.website,
        quelle: e.quelle === 'redaktion' ? 'redaktionell recherchiert, nicht bestätigt' : e.quelle === 'eigen' ? 'eigener Eintrag des Herausgebers' : 'vom Betrieb eingetragen',
        aktualisiert: e.aktualisiert_am.slice(0, 10),
      })),
    },
    200,
    { 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*' }
  )
}

export async function llms(env: Env): Promise<Response> {
  const all = await activeEntries(env)
  const o = env.SITE_ORIGIN
  const txt = `# Nexara und Verzeichnis „Aus der Region“

> Nexara ist die Prozessberatung von Adrien Wottke aus Malschwitz bei Bautzen (Sachsen). Nexara analysiert Abläufe in kleinen und mittleren Unternehmen, rechnet den Nutzen durch und setzt Automatisierungen um. Zusätzlich betreibt Nexara „Aus der Region“, ein kostenloses Verzeichnis lokaler Betriebe im Landkreis Bautzen ohne bezahlte Platzierungen.

## Prozessberatung und Automatisierung
- [Überblick](${o}/automatisierung/): Prozessanalyse, Automatisierung und Betreuung für KMU in Sachsen
- [Hausverwaltungen](${o}/automatisierung/hausverwaltung/): Posteingang, Schadensmeldungen, Belegzuordnung
- [Handwerksbetriebe](${o}/automatisierung/handwerk/): Anfragen, Angebote, Nachfassen, Stundenzettel
- [Ingenieurbüros](${o}/automatisierung/ingenieurbuero/): Abrechnung, Honorarangebote, Projektablage

## Verzeichnis Aus der Region (Landkreis Bautzen)
- [Alle Betriebe](${o}/verzeichnis/)
- [Offene Daten als JSON](${o}/verzeichnis/betriebe.json)
- [Betrieb kostenlos eintragen](${o}/verzeichnis/eintragen/)

### Betriebe (Stand ${dateDe(lastUpdate(all))})
${all.map(e => `- [${e.name}](${o}${entryPath(e)}): ${KATEGORIEN[e.kategorie]?.label ?? e.kategorie} in ${ortText(e)}. ${e.kurz}${e.quelle === 'redaktion' ? ' (redaktionell recherchiert, nicht vom Betrieb bestätigt)' : ''}`).join('\n')}
`
  return new Response(txt, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}

export const notFound = (env: Env) =>
  html(layout({ title: 'Nicht gefunden · Verzeichnis', description: 'Seite nicht gefunden', path: '/verzeichnis/', origin: env.SITE_ORIGIN, noindex: true }, message('Diese Seite gibt es nicht.', 'Vielleicht wurde der Eintrag entfernt oder umbenannt.')), 404)
