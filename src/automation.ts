import '@fontsource-variable/mona-sans/standard.css'
import '@fontsource-variable/space-grotesk/wght.css'
import './automation.css'

// Konfiguration über .env (siehe .env.example). Ohne Werte: kein Tracking, Formular per Mail.
const ENDPOINT = (import.meta.env.VITE_LEAD_ENDPOINT as string | undefined) || ''
const GADS_ID = (import.meta.env.VITE_GADS_ID as string | undefined) || ''
const LABEL_LEAD = (import.meta.env.VITE_GADS_LABEL_LEAD as string | undefined) || ''
const LABEL_BOOKING = (import.meta.env.VITE_GADS_LABEL_BOOKING as string | undefined) || ''
const EMAIL = 'a.wottke@nexara-ai.de'
const CONSENT_KEY = 'nx_consent_ads'
const CLICK_KEY = 'nx_click'

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)
const $$ = <T extends Element>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel))
const fmt = (n: number) => Math.round(n).toLocaleString('de-DE')

document.querySelectorAll('[data-year]').forEach(el => (el.textContent = String(new Date().getFullYear())))

// Menü --------------------------------------------------------------------
const menu = $<HTMLButtonElement>('[data-menu]')
const nav = $<HTMLElement>('#nx-nav')
if (menu && nav) {
  const setOpen = (open: boolean) => {
    nav.classList.toggle('is-open', open)
    menu.setAttribute('aria-expanded', String(open))
    menu.textContent = open ? 'Schließen' : 'Menü'
  }
  menu.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')))
  nav.addEventListener('click', e => { if ((e.target as HTMLElement).closest('a')) setOpen(false) })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false) })
}

// Wertstrom-Umschalter ----------------------------------------------------
$$<HTMLElement>('[data-stream]').forEach(stream => {
  const status = $<HTMLElement>('[data-stream-status]', stream)
  const buttons = $$<HTMLButtonElement>('[data-stream-mode]', stream)
  buttons.forEach(btn =>
    btn.addEventListener('click', () => {
      const mode = btn.dataset.streamMode === 'after' ? 'after' : 'today'
      if (stream.dataset.mode === mode) return
      stream.classList.add('has-switched')
      stream.dataset.mode = mode
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)))
      const today = stream.dataset.todayTotal
      const after = stream.dataset.afterTotal
      if (status) status.textContent = mode === 'after'
        ? `Ansicht mit Automatisierung: ${after} Minuten Arbeitszeit statt ${today}.`
        : `Ansicht heute: ${today} Minuten Arbeitszeit pro Vorgang.`
      track('stream_toggle', { mode })
    })
  )
})

// Rechenblatt -------------------------------------------------------------
$$<HTMLFormElement>('[data-calc]').forEach(form => {
  const out = $<HTMLOutputElement>('[data-calc-result]', form)
  const hoursOut = $<HTMLElement>('[data-calc-hours]', form)
  const read = (name: string) => {
    const el = form.elements.namedItem(name) as HTMLInputElement | null
    const v = Number(String(el?.value ?? '').replace(',', '.'))
    return Number.isFinite(v) && v > 0 ? v : 0
  }
  const update = () => {
    const hours = read('hours'), rate = read('rate'), share = Math.min(read('share'), 100) / 100
    if (out) out.value = `${fmt(hours * rate * 46 * share)} €`
    if (hoursOut) hoursOut.textContent = `${fmt(hours * 46 * share)} Stunden`
  }
  form.addEventListener('input', update)
})

// Einwilligung + Google Ads (Basic Consent Mode: vor Zustimmung wird nichts geladen) ----
type Consent = 'granted' | 'denied' | null
declare global { interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void } }

function getConsent(): Consent {
  try { const v = localStorage.getItem(CONSENT_KEY); return v === 'granted' || v === 'denied' ? v : null } catch { return null }
}
let gtagLoaded = false
function loadAds() {
  if (!GADS_ID || gtagLoaded) return
  gtagLoaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) } // eslint-disable-line prefer-rest-params
  window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' })
  window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted' })
  window.gtag('js', new Date())
  window.gtag('config', GADS_ID, { allow_ad_personalization_signals: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GADS_ID)}`
  document.head.append(s)
}
function track(event: string, params: Record<string, unknown> = {}) {
  if (window.gtag && getConsent() === 'granted') window.gtag('event', event, params)
}

// Klick-IDs und Kampagnenparameter: ohne Einwilligung nur in-page, mit Einwilligung 90 Tage gespeichert
const url = new URL(location.href)
const CLICK_PARAMS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const fromUrl: Record<string, string> = {}
CLICK_PARAMS.forEach(k => { const v = url.searchParams.get(k); if (v) fromUrl[k] = v.slice(0, 200) })
function storedClick(): Record<string, string> {
  if (getConsent() !== 'granted') return {}
  try {
    const raw = JSON.parse(localStorage.getItem(CLICK_KEY) || 'null')
    if (raw && raw.exp > Date.now()) return raw.data
  } catch { /* ignorieren */ }
  return {}
}
function persistClick() {
  if (getConsent() !== 'granted' || !Object.keys(fromUrl).length) return
  try { localStorage.setItem(CLICK_KEY, JSON.stringify({ exp: Date.now() + 90 * 864e5, data: fromUrl })) } catch { /* ignorieren */ }
}
function attribution(): Record<string, string> {
  const data = { ...storedClick(), ...fromUrl }
  if (getConsent() !== 'granted') { delete data.gclid; delete data.gbraid; delete data.wbraid }
  return data
}

const banner = $<HTMLElement>('[data-consent]')
const reopen = $<HTMLButtonElement>('[data-consent-open]')
function applyConsent(choice: Consent) {
  if (choice === 'granted') { loadAds(); persistClick(); fireThanksConversion() }
  if (choice === 'denied') { try { localStorage.removeItem(CLICK_KEY) } catch { /* ignorieren */ } }
}
if (GADS_ID && banner) {
  if (reopen) reopen.hidden = false
  const current = getConsent()
  if (current) applyConsent(current)
  else banner.hidden = false
  $$<HTMLButtonElement>('[data-consent-choice]', banner).forEach(btn =>
    btn.addEventListener('click', () => {
      const choice = btn.dataset.consentChoice === 'granted' ? 'granted' : 'denied'
      try { localStorage.setItem(CONSENT_KEY, choice) } catch { /* ignorieren */ }
      banner.hidden = true
      applyConsent(choice)
      if (choice === 'denied' && gtagLoaded) location.reload()
    })
  )
  reopen?.addEventListener('click', () => { banner.hidden = false })
}

// CTA-Klicks (nur Auswertung, keine Conversion)
$$<HTMLAnchorElement>('[data-cta]').forEach(a => a.addEventListener('click', () => track('cta_click', { cta: a.dataset.cta })))

// Sticky-CTA ausblenden, wenn der Kontaktbereich sichtbar ist
const sticky = $<HTMLElement>('[data-sticky]')
const contact = $<HTMLElement>('#kontakt')
if (sticky && contact && 'IntersectionObserver' in window) {
  const hero = $<HTMLElement>('.nx-hero')
  let contactVisible = false, heroVisible = true
  const sync = () => sticky.classList.toggle('is-hidden', contactVisible || heroVisible)
  new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; sync() }, { threshold: 0.05 }).observe(contact)
  if (hero) new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; sync() }, { threshold: 0.35 }).observe(hero)
  sync()
}

// Anfrageformular ---------------------------------------------------------
const form = $<HTMLFormElement>('[data-lead-form]')
if (form) {
  const status = $<HTMLElement>('[data-form-status]', form)!
  const button = $<HTMLButtonElement>('button[type="submit"]', form)!
  const say = (text: string, tone: 'info' | 'error' = 'info') => { status.textContent = text; status.dataset.tone = tone }

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const fd = new FormData(form)
    if (String(fd.get('website') || '').trim()) return // Honeypot
    const required = ['name', 'unternehmen', 'email', 'engpass']
    let firstInvalid: HTMLElement | null = null
    required.forEach(name => {
      const el = form.elements.namedItem(name) as HTMLInputElement
      const ok = name === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) : el.value.trim().length > 1
      el.setAttribute('aria-invalid', String(!ok))
      if (!ok && !firstInvalid) firstInvalid = el
    })
    if (firstInvalid) { (firstInvalid as HTMLElement).focus(); say('Bitte füllen Sie die markierten Felder aus.', 'error'); return }

    const payload: Record<string, unknown> = Object.fromEntries(
      ['name', 'unternehmen', 'email', 'telefon', 'branche', 'mitarbeiter', 'engpass', 'rueckruf', 'seite'].map(k => [k, String(fd.get(k) || '').trim()])
    )
    payload.attribution = attribution()
    payload.consent_ads = getConsent() === 'granted'
    payload.zeit = new Date().toISOString()

    if (!ENDPOINT) {
      const body = `Name: ${payload.name}\nUnternehmen: ${payload.unternehmen}\nTelefon: ${payload.telefon}\nBranche: ${payload.branche}\nMitarbeiter: ${payload.mitarbeiter}\nRückruf: ${payload.rueckruf || 'nein'}\n\nAblauf:\n${payload.engpass}`
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Anfrage Prozess-Erstgespräch')}&body=${encodeURIComponent(body)}`
      say('Ihr Mailprogramm öffnet sich mit der vorbereiteten Anfrage. Bitte dort auf Senden klicken.')
      return
    }

    button.disabled = true
    say('Wird gesendet …')
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(String(res.status))
      try { sessionStorage.setItem('nx_sent', '1') } catch { /* ignorieren */ }
      location.href = '/automatisierung/danke/?typ=anfrage'
    } catch {
      button.disabled = false
      say(`Das Senden hat nicht geklappt. Bitte schreiben Sie direkt an ${EMAIL}. Ihre Eingaben bleiben erhalten.`, 'error')
    }
  })
  form.addEventListener('input', e => (e.target as HTMLElement).removeAttribute('aria-invalid'))
}

// Danke-Seite: Conversion nur mit Einwilligung, nur einmal pro Sitzung ---------
const thanks = $<HTMLElement>('[data-thanks]')
if (thanks) {
  const typ = url.searchParams.get('typ') === 'termin' ? 'termin' : 'anfrage'
  if (typ === 'termin') {
    const t = $<HTMLElement>('[data-thanks-title]'), p = $<HTMLElement>('[data-thanks-text]')
    if (t) t.textContent = 'Danke. Ihr Termin steht.'
    if (p) p.textContent = 'Die Bestätigung mit dem Link zum Gespräch kommt per E-Mail von Cal.com. Falls etwas dazwischenkommt, können Sie dort umbuchen.'
  }
  fireThanksConversion()
}

function fireThanksConversion() {
  if (!document.querySelector('[data-thanks]')) return
  const typ = new URL(location.href).searchParams.get('typ') === 'termin' ? 'termin' : 'anfrage'
  const label = typ === 'termin' ? LABEL_BOOKING : LABEL_LEAD
  const flag = `nx_conv_${typ}`
  let already = false
  try { already = sessionStorage.getItem(flag) === '1' } catch { /* ignorieren */ }
  if (already || !GADS_ID || !label || getConsent() !== 'granted' || !window.gtag) return
  window.gtag('event', 'conversion', { send_to: `${GADS_ID}/${label}` })
  try { sessionStorage.setItem(flag, '1') } catch { /* ignorieren */ }
}
