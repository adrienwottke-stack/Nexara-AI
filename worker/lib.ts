// Gemeinsame Typen, Konstanten und Hilfsfunktionen für den Nexara-Worker.

export interface Env {
  ASSETS: { fetch: (req: Request | string) => Promise<Response> }
  DB: D1Database
  SITE_ORIGIN: string
  ADMIN_EMAIL: string
  ADMIN_SECRET?: string
  MAIL_WEBHOOK_URL?: string
  MAIL_WEBHOOK_SECRET?: string
  DEV_MODE?: string
}

// Minimal-Typen für D1, damit keine zusätzlichen Pakete nötig sind.
export interface D1Result<T> { results: T[]; meta?: unknown }
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  run(): Promise<{ meta: { last_row_id?: number; changes?: number } }>
}
export interface D1Database { prepare(query: string): D1PreparedStatement }
export interface Ctx { waitUntil(p: Promise<unknown>): void }

export type Eintrag = {
  id: number; slug: string; name: string; kategorie: string; gemeinde: string; ortsteil: string | null
  strasse: string | null; plz: string | null; kurz: string; beschreibung: string; leistungen: string | null
  telefon: string | null; email_oeffentlich: string | null; website: string | null; oeffnungszeiten: string | null
  kontakt_name: string; kontakt_email: string; marketing_ok: number; status: string; quelle: string
  hinweis: string | null; token: string | null; erstellt_am: string; bestaetigt_am: string | null
  freigegeben_am: string | null; aktualisiert_am: string
}

export const KATEGORIEN: Record<string, { label: string; plural: string; schema: string }> = {
  handwerk: { label: 'Handwerk & Bauen', plural: 'Handwerksbetriebe', schema: 'HomeAndConstructionBusiness' },
  gastronomie: { label: 'Essen, Erleben & Übernachten', plural: 'Gastronomie- und Freizeitbetriebe', schema: 'LocalBusiness' },
  gesundheit: { label: 'Gesundheit & Wohlbefinden', plural: 'Gesundheitsangebote', schema: 'HealthAndBeautyBusiness' },
  service: { label: 'Service & Handel', plural: 'Dienstleister und Händler', schema: 'LocalBusiness' },
  digital: { label: 'Digital & Kreativ', plural: 'Digital- und Kreativdienstleister', schema: 'ProfessionalService' },
  landwirtschaft: { label: 'Landwirtschaft & Hofläden', plural: 'Höfe und Hofläden', schema: 'LocalBusiness' },
}

const GEMEINDE_NAMEN = [
  'Arnsdorf', 'Bautzen', 'Bernsdorf', 'Bischofswerda', 'Burkau', 'Crostwitz', 'Cunewalde', 'Demitz-Thumitz',
  'Doberschau-Gaußig', 'Elsterheide', 'Elstra', 'Göda', 'Großdubrau', 'Großharthau', 'Großpostwitz',
  'Großröhrsdorf', 'Haselbachtal', 'Hochkirch', 'Hoyerswerda', 'Kamenz', 'Königsbrück', 'Königswartha',
  'Kubschütz', 'Lauta', 'Lohsa', 'Malschwitz', 'Nebelschütz', 'Neschwitz', 'Neukirch/Lausitz', 'Obergurig',
  'Ohorn', 'Oßling', 'Ottendorf-Okrilla', 'Panschwitz-Kuckau', 'Pulsnitz', 'Puschwitz', 'Radeberg', 'Radibor',
  'Ralbitz-Rosenthal', 'Räckelwitz', 'Schirgiswalde-Kirschau', 'Schmölln-Putzkau', 'Sohland an der Spree',
  'Spreetal', 'Steinigtwolmsdorf', 'Wachau', 'Weißenberg', 'Wilthen', 'Wittichenau', 'Dresden', 'Görlitz', 'Löbau',
]

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export const GEMEINDEN: Record<string, string> = Object.fromEntries(GEMEINDE_NAMEN.map(n => [slugify(n), n]))
export const gemeindeName = (slug: string) => GEMEINDEN[slug] ?? slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')

export function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// Verhindert Gedankenstriche in nutzergenerierten Texten (Stilregel der Seite).
export const clean = (v: unknown, max = 500) =>
  String(v ?? '').replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim().slice(0, max)
export const cleanMultiline = (v: unknown, max = 1200) =>
  String(v ?? '').replace(/[\u2013\u2014]/g, '-').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, max)

export const now = () => new Date().toISOString()
export const dateDe = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' }) : '')

export function html(body: string, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...extra } })
}
export function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...extra } })
}

export function randomToken(bytes = 24): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}
// Ohne ADMIN_SECRET gibt es nur lokal (DEV_MODE) einen festen Testschlüssel. Live schlagen
// Signaturen dann fehl, statt mit einem öffentlich bekannten Schlüssel zu arbeiten.
let isolateKey = ''
function secretOf(env: Env, strict: boolean): string {
  if (env.ADMIN_SECRET) return env.ADMIN_SECRET
  if (env.DEV_MODE === '1') return 'dev-secret'
  if (strict) throw new Error('ADMIN_SECRET fehlt (npm run cf:setup)')
  return (isolateKey ||= randomToken(32))
}
export const sign = (env: Env, msg: string) => hmacHex(secretOf(env, true), msg)
export async function verify(env: Env, msg: string, sig: string): Promise<boolean> {
  if (!env.ADMIN_SECRET && env.DEV_MODE !== '1') return false
  const expected = await sign(env, msg)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

export async function ipHash(env: Env, req: Request): Promise<string> {
  const ip = req.headers.get('cf-connecting-ip') || 'local'
  const day = new Date().toISOString().slice(0, 10)
  return (await hmacHex(secretOf(env, false), `${ip}|${day}`)).slice(0, 32)
}

export type Mail = { to: string; subject: string; text: string; replyTo?: string }
export type SheetRow = { sheet: string; values: Record<string, string | number> }

// Versand über den n8n-Workflow "Nexara Mailer" (Gmail + Google Sheets). Ohne Konfiguration nur Log.
export async function notify(env: Env, payload: { mail?: Mail; row?: SheetRow }): Promise<boolean> {
  if (!env.MAIL_WEBHOOK_URL) {
    console.log('[mail:dev]', JSON.stringify(payload))
    return false
  }
  try {
    const res = await fetch(env.MAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-nexara-secret': env.MAIL_WEBHOOK_SECRET || '' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.log('[mail:error]', res.status)
    return res.ok
  } catch (e) {
    console.log('[mail:error]', String(e))
    return false
  }
}

export function normalizeUrl(v: string): string {
  const s = clean(v, 300)
  if (!s) return ''
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`
  try {
    const u = new URL(withProto)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : ''
  } catch {
    return ''
  }
}
