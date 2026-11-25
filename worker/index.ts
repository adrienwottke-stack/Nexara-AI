// Einstieg des Cloudflare Workers. Statische Dateien kommen aus dist/ (ASSETS),
// API, Verzeichnis und llms.txt werden hier beantwortet.
import { type Env, type Ctx, json } from './lib'
import * as dir from './directory'
import * as api from './api'

const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

async function route(req: Request, env: Env, ctx: Ctx): Promise<Response | null> {
  const url = new URL(req.url)
  const p = url.pathname
  const method = req.method

  // Alte Adresse der Verzeichnisseite
  if (p === '/verzeichnis.html' || p === '/verzeichnis') return Response.redirect(`${url.origin}/verzeichnis/${url.search}`, 301)

  if (p.startsWith('/api/')) {
    if (method !== 'POST') return json({ ok: false, error: 'Nur POST' }, 405, { allow: 'POST' })
    const origin = req.headers.get('origin')
    if (origin && origin !== url.origin && origin !== env.SITE_ORIGIN) return json({ ok: false, error: 'Herkunft nicht erlaubt' }, 403)
    if (p === '/api/anfrage') return api.anfrage(req, env, ctx)
    if (p === '/api/verzeichnis/eintragen') return api.eintragen(req, env, ctx, url)
    if (p === '/api/verzeichnis/moderation') return api.moderation(req, env, ctx)
    return json({ ok: false, error: 'Unbekannt' }, 404)
  }

  if (p === '/llms.txt') return dir.llms(env)

  if (p.startsWith('/verzeichnis/')) {
    // Statische Dateien des Verzeichnisses (CSS, Schriften) direkt ausliefern
    if (/\.(css|woff2|txt|svg|png|jpe?g|webp)$/.test(p) && !p.endsWith('/llms.txt')) return env.ASSETS.fetch(req)
    if (method !== 'GET' && method !== 'HEAD') return new Response('Methode nicht erlaubt', { status: 405 })
    if (!p.endsWith('/') && !/\.(xml|json)$/.test(p)) return Response.redirect(`${url.origin}${p}/${url.search}`, 301)
    const parts = p.split('/').filter(Boolean) // ['verzeichnis', ...]
    if (parts.length === 1) return dir.home(env, url)
    if (p === '/verzeichnis/sitemap.xml') return dir.sitemap(env)
    if (p === '/verzeichnis/betriebe.json') return dir.openData(env)
    if (parts[1] === 'eintragen' && parts.length === 2) return dir.form(env, url)
    if (parts[1] === 'bestaetigen' && parts.length === 2) return dir.confirm(env, url)
    if (parts[1] === 'moderation' && parts.length === 2) return dir.moderationPage(env, url)
    if (parts[1] === 'betrieb' && parts.length === 3) return (await dir.entry(env, parts[2])) ?? dir.notFound(env)
    if (parts[1] === 'kategorie' && parts.length === 3) return (await dir.hub(env, 'kategorie', parts[2])) ?? dir.notFound(env)
    if (parts[1] === 'ort' && parts.length === 3) return (await dir.hub(env, 'ort', parts[2])) ?? dir.notFound(env)
    return dir.notFound(env)
  }
  return null
}

// Löschfristen laut Datenschutzerklärung
async function cleanup(env: Env): Promise<void> {
  const days = (n: number) => new Date(Date.now() - n * 864e5).toISOString()
  await env.DB.prepare(`DELETE FROM eintraege WHERE status = 'unbestaetigt' AND erstellt_am < ?`).bind(days(30)).run()
  await env.DB.prepare(`DELETE FROM eintraege WHERE status IN ('abgelehnt', 'entfernt') AND aktualisiert_am < ?`).bind(days(30)).run()
  await env.DB.prepare(`DELETE FROM anfragen WHERE zeit < ?`).bind(days(730)).run()
  await env.DB.prepare(`UPDATE anfragen SET ip_hash = NULL WHERE zeit < ?`).bind(days(30)).run()
  await env.DB.prepare(`UPDATE eintraege SET ip_hash = NULL WHERE erstellt_am < ?`).bind(days(30)).run()
}

export default {
  async scheduled(_event: unknown, env: Env, ctx: Ctx): Promise<void> {
    ctx.waitUntil(cleanup(env))
  },
  async fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> {
    let res: Response
    try {
      res = (await route(req, env, ctx)) ?? (await env.ASSETS.fetch(req))
    } catch (e) {
      console.log('[error]', String(e), (e as Error)?.stack)
      res = new Response('Da ist etwas schiefgegangen. Bitte versuche es später erneut oder schreib an a.wottke@nexara-ai.de.', { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } })
    }
    const out = new Response(res.body, res)
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!out.headers.has(k)) out.headers.set(k, v)
    return out
  },
}
