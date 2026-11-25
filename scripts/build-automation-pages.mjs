// Erzeugt die statischen Landingpages unter /automatisierung/ aus scripts/automation-content.mjs.
// Aufruf: npm run pages
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { site, pages, processSteps, prices, guarantee, founding, experience, faqCommon } from './automation-content.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const pathOf = p => (p.slug ? `/automatisierung/${p.slug}/` : '/automatisierung/')
const fmt = n => n.toLocaleString('de-DE')
const branches = pages.filter(p => p.slug)
const DASH = /[]/

function head({ title, description, canonical, noindex = false, jsonld = '' }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  ${noindex ? '<meta name="robots" content="noindex, follow" />' : `<link rel="canonical" href="${site.origin}${canonical}" />`}
  <meta name="theme-color" content="#f7f8f2" />
  <link rel="icon" type="image/svg+xml" href="/aw.svg" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${site.origin}${canonical}" />
  <meta property="og:image" content="${site.origin}/media/personal/portrait-original.webp" />
  <meta name="twitter:card" content="summary" />
  <link rel="preload" href="/media/personal/portrait-original.webp" as="image" fetchpriority="low" />
  ${jsonld}
</head>`
}

function header(current) {
  const base = current === 'danke' ? '/automatisierung/' : ''
  const links = branches
    .map(b => `<a href="${pathOf(b)}"${current === b.slug ? ' aria-current="page"' : ''}>${esc(b.navLabel)}</a>`)
    .join('')
  return `<a class="skip-link" href="#inhalt">Zum Inhalt</a>
  <header class="nx-top">
    <div class="nx-shell nx-top__row">
      <a class="nx-brand" href="/automatisierung/" aria-label="Nexara Prozessberatung, Überblick">NEXARA.<small>Prozesse &amp; Automatisierung</small></a>
      <button class="nx-menu" type="button" data-menu aria-controls="nx-nav" aria-expanded="false">Menü</button>
      <nav class="nx-nav" id="nx-nav" aria-label="Hauptnavigation">
        <span class="nx-nav__group" role="group" aria-label="Branchen">${links}</span>
        <a href="${base}#ablauf">Ablauf</a><a href="${base}#preise">Preise</a><a href="${base}#fragen">Fragen</a>
        <a class="nx-btn nx-btn--small" href="${base}#kontakt" data-cta="nav">Gespräch buchen</a>
      </nav>
    </div>
  </header>`
}

function stream(s) {
  const totalToday = s.steps.reduce((a, b) => a + b.min, 0)
  const totalAfter = s.steps.reduce((a, b) => a + b.afterMin, 0)
  const pct = Math.max(4, Math.round((totalAfter / totalToday) * 100))
  const steps = s.steps
    .map((st, i) => {
      const kind = st.afterMin > 0 ? 'check' : 'auto'
      return `<li class="vs-step" data-kind="${kind}" style="--i:${i}">
          <span class="vs-step__no" aria-hidden="true">${i + 1}</span>
          <div class="vs-step__body">
            <p class="vs-step__label"><span class="is-today">${esc(st.today)}</span><span class="is-after">${esc(st.after)}</span></p>
            <p class="vs-step__tool"><span class="is-today">${esc(st.tool)}</span><span class="is-after">${kind === 'auto' ? 'läuft automatisch' : 'Sie prüfen und geben frei'}</span></p>
          </div>
          <p class="vs-step__time"><span class="is-today">${st.min} Min</span><span class="is-after">${kind === 'auto' ? 'automatisch' : `${st.afterMin} Min`}</span></p>
        </li>`
    })
    .join('\n        ')
  return `<figure class="vs" data-stream data-mode="today" data-today-total="${totalToday}" data-after-total="${totalAfter}" aria-labelledby="vs-title">
      <div class="vs__head">
        <div>
          <p class="vs__eyebrow">Ablauf · Beispiel</p>
          <p class="vs__title" id="vs-title">${esc(s.title)}</p>
        </div>
        <div class="vs__switch" role="group" aria-label="Ansicht des Ablaufs">
          <button type="button" data-stream-mode="today" aria-pressed="true">Heute</button>
          <button type="button" data-stream-mode="after" aria-pressed="false">Mit Automatisierung</button>
        </div>
      </div>
      <ol class="vs__steps">
        ${steps}
      </ol>
      <div class="vs__ladder">
        <div class="vs-row">
          <span class="vs-row__label">Ihre Arbeitszeit pro Vorgang</span>
          <strong class="vs-row__value"><span class="is-today">${totalToday} Min</span><span class="is-after">${totalAfter} Min</span></strong>
          <span class="vs-row__track" aria-hidden="true"><i class="vs-row__bar" style="--after:${pct}%"></i></span>
        </div>
        <div class="vs-row vs-row--wait">
          <span class="vs-row__label">${esc(s.waitLabel)}</span>
          <strong class="vs-row__value"><span class="is-today">${esc(s.waitToday)}</span><span class="is-after">${esc(s.waitAfter)}</span></strong>
        </div>
      </div>
      <figcaption class="vs__block">
        <span><b>Blatt</b> 1/1</span>
        <span><b>Stand</b> Beispiel mit geschätzten Zeiten</span>
        <span><b>Ihre Zahlen</b> ermitteln wir im Gespräch</span>
      </figcaption>
      <p class="sr-only" data-stream-status aria-live="polite"></p>
    </figure>`
}

function hero(p) {
  const proof = p.proof
    ? `<p class="nx-proof">${esc(p.proof.text)} <a href="${p.proof.href}" target="_blank" rel="noopener noreferrer">${esc(p.proof.source)}</a></p>`
    : ''
  return `<section class="nx-hero" aria-labelledby="hero-title">
    <div class="nx-shell nx-hero__grid">
      <div class="nx-hero__copy">
        <p class="nx-kicker">${esc(p.kicker)}</p>
        <h1 id="hero-title">${p.h1}</h1>
        <p class="nx-lead">${esc(p.lead)}</p>
        <div class="nx-actions">
          <a class="nx-btn" href="${site.cal}" target="_blank" rel="noopener noreferrer" data-cta="hero-cal">Kostenloses Erstgespräch buchen <span aria-hidden="true">↗</span></a>
          <a class="nx-link" href="#kontakt" data-cta="hero-form">Lieber schriftlich anfragen</a>
        </div>
        <ul class="nx-trust">
          <li>30 Minuten, kostenlos</li>
          <li>Sie sprechen direkt mit mir</li>
          <li>Festpreise statt Stundenzettel</li>
        </ul>
        ${proof}
      </div>
      ${stream(p.stream)}
    </div>
  </section>`
}

function chooser() {
  const cards = branches
    .map(
      b => `<a class="nx-route" href="${pathOf(b)}"><span class="nx-route__kicker">${esc(b.navLabel)}</span><span class="nx-route__title">${strip(b.h1)}</span><span class="nx-route__arrow" aria-hidden="true">→</span></a>`
    )
    .join('')
  return `<section class="nx-section nx-routes" aria-labelledby="routes-title">
    <div class="nx-shell">
      <h2 class="nx-h2 nx-h2--small" id="routes-title">Für welche Betriebe?</h2>
      <div class="nx-routes__grid">${cards}</div>
      <p class="nx-note">Andere Branche? Die Methode ist dieselbe. Erzählen Sie mir im Erstgespräch, wo es hakt.</p>
    </div>
  </section>`
}

function problems(p) {
  const items = p.problems.map(x => `<li><strong>${esc(x.t)}</strong> <span>${esc(x.d)}</span></li>`).join('')
  return `<section class="nx-section" id="probleme" aria-labelledby="problems-title">
    <div class="nx-shell">
      <h2 class="nx-h2" id="problems-title">${p.problemsTitle}</h2>
      <ul class="nx-marks">${items}</ul>
      <p class="nx-outro">${esc(p.problemsOutro)}</p>
    </div>
  </section>`
}

function examples(p) {
  const cards = p.examples
    .map(
      x => `<article class="nx-sheet">
          <p class="nx-sheet__tag">${esc(x.tag)}</p>
          <h3>${esc(x.title)}</h3>
          <dl>
            <div class="nx-sheet__today"><dt>Heute</dt><dd>${esc(x.today)}</dd></div>
            <div class="nx-sheet__after"><dt>Danach</dt><dd>${esc(x.after)}</dd></div>
          </dl>
          <p class="nx-sheet__measure"><span>Gemessen an</span> ${esc(x.measure)}</p>
        </article>`
    )
    .join('\n        ')
  const note = p.softwareNote ? `<p class="nx-note nx-note--box">${esc(p.softwareNote)}</p>` : ''
  return `<section class="nx-section nx-section--tint" id="beispiele" aria-labelledby="examples-title">
    <div class="nx-shell">
      <h2 class="nx-h2" id="examples-title">${p.examplesTitle}</h2>
      <div class="nx-sheets">
        ${cards}
      </div>
      <p class="nx-note">Typische Abläufe, keine Kundenprojekte. Was davon bei Ihnen Sinn ergibt, klärt die Analyse.</p>
      ${note}
    </div>
  </section>`
}

function calc(p) {
  const { hours, rate, share } = p.calc
  const value = Math.round(hours * rate * 46 * (share / 100))
  return `<section class="nx-section" id="nutzen" aria-labelledby="calc-title">
    <div class="nx-shell nx-calc">
      <div class="nx-calc__intro">
        <h2 class="nx-h2" id="calc-title">Erst rechnen.<br /><em>Dann bauen.</em></h2>
        <p>Bevor etwas gebaut wird, rechnen wir mit Ihren Zahlen, nicht mit Durchschnittswerten aus Werbebroschüren. Probieren Sie es mit einem Ablauf aus Ihrem Betrieb.</p>
        <p class="nx-small"><strong>Woran wir den Erfolg messen:</strong> Stunden pro Woche, Durchlaufzeit, Antwortzeit, Fehler und Rückfragen, offene Vorgänge. Gemessen vorher und nachher.</p>
      </div>
      <form class="nx-calc__sheet" data-calc aria-labelledby="calc-sheet-title" onsubmit="return false">
        <p class="nx-calc__title" id="calc-sheet-title">Rechenblatt · ein Ablauf</p>
        <div class="nx-calc__line">
          <label><span>Stunden/Woche</span><input type="number" inputmode="decimal" min="0.5" max="80" step="0.5" value="${hours}" name="hours" /></label>
          <span class="nx-calc__op" aria-hidden="true">×</span>
          <label><span>€ pro Stunde</span><input type="number" inputmode="decimal" min="10" max="250" step="1" value="${rate}" name="rate" /></label>
          <span class="nx-calc__op" aria-hidden="true">×</span>
          <span class="nx-calc__fixed"><span>Wochen</span><b>46</b></span>
          <span class="nx-calc__op" aria-hidden="true">×</span>
          <label><span>% automatisierbar</span><input type="number" inputmode="numeric" min="5" max="90" step="5" value="${share}" name="share" /></label>
        </div>
        <div class="nx-calc__result" aria-live="polite">
          <span>Rechnerisches Potenzial pro Jahr</span>
          <output name="result" data-calc-result>${fmt(value)} €</output>
          <span data-calc-hours>${fmt(Math.round(hours * 46 * (share / 100)))} Stunden</span>
        </div>
        <p class="nx-small">€ pro Stunde: Lohn inklusive Nebenkosten, bei Inhabern der eigene Stundensatz. 46 Arbeitswochen pro Jahr. Ein Rechenbeispiel mit Ihren Annahmen, keine Zusage. In der Prozessanalyse prüfen wir jede Annahme an Ihrem echten Ablauf.</p>
      </form>
    </div>
  </section>`
}

function process() {
  const items = processSteps
    .map(
      (s, i) => `<li><span class="nx-steps__no" aria-hidden="true">${i + 1}</span><h3>${esc(s.name)}</h3><p class="nx-steps__meta">${esc(s.meta)}</p><p>${esc(s.text)}</p></li>`
    )
    .join('')
  return `<section class="nx-section nx-section--tint" id="ablauf" aria-labelledby="process-title">
    <div class="nx-shell">
      <h2 class="nx-h2" id="process-title">So arbeite ich.<br /><em>In fünf Schritten.</em></h2>
      <ol class="nx-steps">${items}</ol>
    </div>
  </section>`
}

function pricing() {
  const rows = prices
    .map(r => `<div class="nx-price"><dt>${esc(r.name)}</dt><dd><strong>${esc(r.value)}</strong><span>${esc(r.note)}</span></dd></div>`)
    .join('')
  return `<section class="nx-section" id="preise" aria-labelledby="price-title">
    <div class="nx-shell nx-pricing">
      <div>
        <h2 class="nx-h2" id="price-title">Preise, bevor<br /><em>Sie fragen müssen.</em></h2>
        <p>Alle Preise netto zzgl. 19 % USt. Den genauen Festpreis kennen Sie vor jeder Entscheidung.</p>
      </div>
      <div>
        <dl class="nx-prices">${rows}</dl>
        <div class="nx-promise">
          <p><strong>Garantie.</strong> ${esc(guarantee)}</p>
          <p><strong>Gründungskonditionen.</strong> ${esc(founding)}</p>
        </div>
      </div>
    </div>
  </section>`
}

function about() {
  const list = experience.map(x => `<li>${esc(x)}</li>`).join('')
  return `<section class="nx-section nx-section--tint" id="ueber-mich" aria-labelledby="about-title">
    <div class="nx-shell nx-about">
      <figure class="nx-about__photo">
        <img src="/media/personal/portrait-original.webp" width="640" height="800" alt="Adrien Wottke, Gründer von Nexara" loading="lazy" decoding="async" />
        <figcaption>Adrien Wottke · ${esc(site.place)}</figcaption>
      </figure>
      <div class="nx-about__copy">
        <h2 class="nx-h2" id="about-title">Wer das<br /><em>für Sie macht.</em></h2>
        <p class="nx-about__intro">Ich bin Adrien Wottke, 21. Ich studiere Maschinenbau an der TU Dresden und habe Nexara gegründet, weil ich in vielen Betrieben dasselbe sehe: gute Arbeit, aber zu viele Stunden im Büro, die keiner bezahlt.</p>
        <p class="nx-about__label">Was ich mitbringe</p>
        <ul class="nx-about__list">${list}</ul>
        <div class="nx-honest">
          <p class="nx-honest__title">Was Sie auch wissen sollten</p>
          <p>Nexara ist jung. Eine lange Liste von Beratungsreferenzen habe ich noch nicht. Deshalb arbeite ich mit Festpreisen, Zahlung in Etappen und Zielen, die wir vorher gemeinsam festlegen und nachher messen. Zugänge und Dokumentation liegen immer bei Ihnen.</p>
        </div>
        <a class="nx-link" href="${site.linkedin}" target="_blank" rel="noopener noreferrer">Mein Profil auf LinkedIn ↗</a>
      </div>
    </div>
  </section>`
}

function faq(p) {
  const items = [...p.faq, ...faqCommon]
    .map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
    .join('')
  return `<section class="nx-section" id="fragen" aria-labelledby="faq-title">
    <div class="nx-shell nx-faq">
      <h2 class="nx-h2" id="faq-title">Fragen, die<br /><em>fast jeder stellt.</em></h2>
      <div class="nx-faq__list">${items}</div>
    </div>
  </section>`
}

function contact(p) {
  const opt = (v, l) => `<option value="${v}"${p.branch === v ? ' selected' : ''}>${l}</option>`
  return `<section class="nx-contact" id="kontakt" aria-labelledby="contact-title">
    <div class="nx-shell nx-contact__grid">
      <div class="nx-contact__intro">
        <h2 class="nx-h2" id="contact-title">30 Minuten.<br /><em>Danach wissen Sie, ob es sich lohnt.</em></h2>
        <p>Sie erzählen, welcher Ablauf Sie am meisten Zeit kostet. Ich sage ehrlich, ob und wie sich das automatisieren lässt. Innerhalb von 24 Stunden bekommen Sie eine kurze schriftliche Einschätzung.</p>
        <a class="nx-btn nx-btn--light" href="${site.cal}" target="_blank" rel="noopener noreferrer" data-cta="contact-cal">Termin im Kalender wählen <span aria-hidden="true">↗</span></a>
        <p class="nx-small">Der Kalender öffnet sich bei Cal.com in einem neuen Tab. Lieber per Mail? <a href="mailto:${site.email}">${site.email}</a></p>
      </div>
      <form class="nx-form" data-lead-form novalidate>
        <p class="nx-form__title">Oder schreiben Sie mir kurz</p>
        <input type="hidden" name="seite" value="${pathOf(p)}" />
        <div class="nx-form__hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div>
        <div class="nx-form__row">
          <label>Name<input type="text" name="name" autocomplete="name" required /></label>
          <label>Unternehmen<input type="text" name="unternehmen" autocomplete="organization" required /></label>
        </div>
        <div class="nx-form__row">
          <label>E-Mail<input type="email" name="email" autocomplete="email" required /></label>
          <label><span>Telefon <span class="nx-optional">(optional)</span></span><input type="tel" name="telefon" autocomplete="tel" /></label>
        </div>
        <div class="nx-form__row">
          <label>Branche<select name="branche">${opt('hausverwaltung', 'Haus- oder Immobilienverwaltung')}${opt('handwerk', 'Handwerk')}${opt('ingenieurbuero', 'Ingenieur- oder Planungsbüro')}${opt('andere', 'Andere Branche')}</select></label>
          <label>Mitarbeiter<select name="mitarbeiter"><option value="">Bitte wählen</option><option>1 bis 4</option><option>5 bis 19</option><option>20 bis 49</option><option>50 oder mehr</option></select></label>
        </div>
        <label>Welcher Ablauf kostet Sie am meisten Zeit?<textarea name="engpass" rows="4" required placeholder="Zum Beispiel: Wir schreiben jede Woche etwa 15 Angebote, das dauert jeweils fast eine Stunde."></textarea></label>
        <label class="nx-check"><input type="checkbox" name="rueckruf" value="ja" /> Bitte rufen Sie mich zurück</label>
        <button class="nx-btn nx-btn--light" type="submit">Anfrage senden</button>
        <p class="nx-form__status" data-form-status role="status" aria-live="polite"></p>
        <p class="nx-small">Ich verwende Ihre Angaben nur, um Ihre Anfrage zu beantworten. Mehr dazu in der <a href="/datenschutz.html">Datenschutzerklärung</a>.</p>
      </form>
    </div>
  </section>`
}

function footer() {
  const links = branches.map(b => `<a href="${pathOf(b)}">Automatisierung ${esc(b.navLabel)}</a>`).join('')
  return `<footer class="nx-footer">
    <div class="nx-shell nx-footer__row">
      <p>© <span data-year>2026</span> Nexara · Adrien Wottke · ${esc(site.place)}</p>
      <nav aria-label="Weitere Links"><a href="/automatisierung/">Überblick</a>${links}<a href="/">Über Adrien</a><a href="/impressum.html">Impressum</a><a href="/datenschutz.html">Datenschutz</a><button type="button" class="nx-footer__consent" data-consent-open hidden>Cookie-Einstellungen</button></nav>
    </div>
  </footer>
  <a class="nx-sticky" href="#kontakt" data-sticky data-cta="sticky">30-Min-Gespräch anfragen</a>
  <div class="nx-consent" data-consent hidden role="dialog" aria-labelledby="consent-title" aria-describedby="consent-text">
    <p class="nx-consent__title" id="consent-title">Messung von Google-Anzeigen</p>
    <p id="consent-text">Ich möchte messen, ob meine Google-Anzeigen zu Anfragen führen. Dafür setzt Google Ads ein Cookie. Ohne Ihre Zustimmung wird nichts an Google übertragen. <a href="/datenschutz.html">Details</a></p>
    <div><button type="button" data-consent-choice="denied">Ablehnen</button><button type="button" data-consent-choice="granted">Erlauben</button></div>
  </div>`
}

function jsonld(p) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Nexara',
    url: `${site.origin}${pathOf(p)}`,
    description: p.description,
    founder: { '@type': 'Person', name: 'Adrien Wottke' },
    email: site.email,
    areaServed: [{ '@type': 'State', name: 'Sachsen' }, { '@type': 'Country', name: 'Deutschland' }],
    address: { '@type': 'PostalAddress', addressLocality: 'Malschwitz', addressRegion: 'Sachsen', addressCountry: 'DE' },
    serviceType: p.slug ? `Prozessautomatisierung für ${p.navLabel}` : 'Prozessberatung und Prozessautomatisierung für KMU',
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

function page(p) {
  return `${head({ title: p.title, description: p.description, canonical: pathOf(p), jsonld: jsonld(p) })}
<body class="nx">
  ${header(p.slug)}
  <main id="inhalt">
  ${hero(p)}
  ${p.slug ? '' : chooser()}
  ${problems(p)}
  ${examples(p)}
  ${calc(p)}
  ${process()}
  ${pricing()}
  ${about()}
  ${faq(p)}
  ${contact(p)}
  </main>
  ${footer()}
  <script type="module" src="/src/automation.ts"></script>
</body>
</html>
`
}

function thanks() {
  return `${head({ title: 'Danke · Nexara', description: 'Ihre Anfrage ist angekommen.', canonical: '/automatisierung/danke/', noindex: true })}
<body class="nx nx--thanks">
  ${header('danke')}
  <main id="inhalt" class="nx-shell nx-thanks" data-thanks>
    <p class="nx-kicker">Angekommen</p>
    <h1 data-thanks-title>Danke. Ich melde mich innerhalb eines Werktags.</h1>
    <p class="nx-lead" data-thanks-text>Ihre Anfrage liegt bei mir. Sie bekommen eine persönliche Antwort, keine automatische Massenmail.</p>
    <div class="nx-sheet nx-thanks__prep">
      <p class="nx-sheet__tag">Optional · zur Vorbereitung</p>
      <h2>Damit sich die 30 Minuten lohnen</h2>
      <ol>
        <li>Welcher Ablauf nervt Sie oder Ihr Team am meisten?</li>
        <li>Wie oft kommt er pro Woche vor, und wie lange dauert er ungefähr?</li>
        <li>Welche Programme, Listen oder Postfächer sind beteiligt?</li>
      </ol>
      <p class="nx-small">Grobe Schätzungen reichen. Genau messen wir später gemeinsam.</p>
    </div>
    <p><a class="nx-link" href="/automatisierung/">Zurück zur Übersicht</a></p>
  </main>
  ${footer()}
  <script type="module" src="/src/automation.ts"></script>
</body>
</html>
`
}

const out = []
for (const p of pages) out.push([join(root, 'automatisierung', p.slug, 'index.html'), page(p)])
out.push([join(root, 'automatisierung', 'danke', 'index.html'), thanks()])

for (const [file, html] of out) {
  if (DASH.test(html)) throw new Error(`Gedankenstrich (Unicode 2013 oder 2014) gefunden in ${file}. Bitte durch "-" ersetzen.`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  console.log('geschrieben:', file.replace(root, '.'))
}
