// Schreibende Endpunkte: Website-Anfrage, Verzeichnis-Eintrag, Moderation.
import { type Env, type Ctx, type Eintrag, KATEGORIEN, GEMEINDEN, clean, cleanMultiline, now, json, html, randomToken, ipHash, notify, normalizeUrl, slugify, verify } from './lib'
import { form, type FormValues } from './directory'
import { layout, message, entryPath, ortText } from './views'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function tooMany(env: Env, table: 'anfragen' | 'eintraege', hash: string, limit: number): Promise<boolean> {
  const col = table === 'anfragen' ? 'zeit' : 'erstellt_am'
  const since = new Date(Date.now() - 3600_000).toISOString()
  const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ip_hash = ? AND ${col} > ?`).bind(hash, since).first<{ n: number }>()
  return (row?.n ?? 0) >= limit
}

// POST /api/anfrage  (JSON vom Formular auf /automatisierung/)
export async function anfrage(req: Request, env: Env, ctx: Ctx): Promise<Response> {
  let b: Record<string, unknown>
  try { b = await req.json() } catch { return json({ ok: false, error: 'Ungültige Daten' }, 400) }
  const d = {
    name: clean(b.name, 100), unternehmen: clean(b.unternehmen, 120), email: clean(b.email, 120).toLowerCase(),
    telefon: clean(b.telefon, 40), branche: clean(b.branche, 40), mitarbeiter: clean(b.mitarbeiter, 30),
    engpass: cleanMultiline(b.engpass, 2000), rueckruf: clean(b.rueckruf, 5) === 'ja' ? 'ja' : 'nein', seite: clean(b.seite, 120),
  }
  if (!d.name || !d.unternehmen || !d.engpass || !EMAIL.test(d.email)) return json({ ok: false, error: 'Pflichtfelder fehlen' }, 400)
  const consent = b.consent_ads === true
  const attr = (consent && typeof b.attribution === 'object' && b.attribution) ? b.attribution as Record<string, unknown> : {}
  const attribution = Object.fromEntries(['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].map(k => [k, clean(attr[k], 200)]).filter(([, v]) => v))
  const hash = await ipHash(env, req)
  if (await tooMany(env, 'anfragen', hash, 5)) return json({ ok: false, error: 'Zu viele Anfragen' }, 429)
  const ts = now()
  const res = await env.DB.prepare(
    `INSERT INTO anfragen (zeit, name, unternehmen, email, telefon, branche, mitarbeiter, engpass, rueckruf, seite, attribution, consent_ads, ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(ts, d.name, d.unternehmen, d.email, d.telefon, d.branche, d.mitarbeiter, d.engpass, d.rueckruf, d.seite, JSON.stringify(attribution), consent ? 1 : 0, hash).run()
  const id = res.meta.last_row_id
  const kanal = attribution.gclid || attribution.utm_source === 'google' ? 'Google Ads' : attribution.utm_source === 'brief' ? 'Brief' : 'Website'
  ctx.waitUntil(
    notify(env, {
      mail: {
        to: env.ADMIN_EMAIL,
        replyTo: d.email,
        subject: `Neue Anfrage: ${d.unternehmen} (${d.branche || 'Branche offen'})`,
        text: `Name: ${d.name}\nUnternehmen: ${d.unternehmen}\nE-Mail: ${d.email}\nTelefon: ${d.telefon || '-'}\nRückruf gewünscht: ${d.rueckruf}\nBranche: ${d.branche}\nMitarbeiter: ${d.mitarbeiter}\nSeite: ${d.seite}\nKanal: ${kanal}${attribution.utm_campaign ? ` / ${attribution.utm_campaign} / ${attribution.utm_term ?? ''}` : ''}\n\nAblauf:\n${d.engpass}\n\nZiel: Antwort innerhalb von 4 Arbeitsstunden.`,
      },
      row: { sheet: 'Pipeline', values: { Datum: ts.slice(0, 10), Name: d.name, Unternehmen: d.unternehmen, 'E-Mail': d.email, Telefon: d.telefon, Branche: d.branche, Mitarbeiter: d.mitarbeiter, Engpass: d.engpass, Rückruf: d.rueckruf, Seite: d.seite, Kanal: kanal, GCLID: attribution.gclid ?? '', Phase: '1 Lead', 'Nächster Schritt': 'Antworten (≤ 4 Std.)' } },
    }).then(ok => (ok && id ? env.DB.prepare(`UPDATE anfragen SET weitergeleitet = 1 WHERE id = ?`).bind(id).run() : null))
  )
  return json({ ok: true })
}

// POST /api/verzeichnis/eintragen  (klassisches Formular, funktioniert ohne JavaScript)
export async function eintragen(req: Request, env: Env, ctx: Ctx, url: URL): Promise<Response> {
  const fd = await req.formData()
  const raw: FormValues = {}
  for (const [k, v] of fd.entries()) if (typeof v === 'string') raw[k] = v
  if (clean(raw.firma_url)) return html(layout({ title: 'Danke', description: '', path: '/verzeichnis/eintragen/', origin: env.SITE_ORIGIN, noindex: true }, message('Danke.', 'Wir melden uns.')))

  const v = {
    betrieb: slugify(raw.betrieb ?? ''),
    name: clean(raw.name, 120), kategorie: clean(raw.kategorie, 30), gemeinde: clean(raw.gemeinde, 60),
    ortsteil: clean(raw.ortsteil, 80), strasse: clean(raw.strasse, 120), plz: clean(raw.plz, 5).replace(/\D/g, ''),
    kurz: clean(raw.kurz, 160), beschreibung: cleanMultiline(raw.beschreibung, 1200),
    leistungen: clean(raw.leistungen, 300).split(',').map(s => s.trim()).filter(Boolean).slice(0, 8).join(', '),
    telefon: clean(raw.telefon, 40), email_oeffentlich: clean(raw.email_oeffentlich, 120).toLowerCase(),
    website: normalizeUrl(raw.website ?? ''), oeffnungszeiten: clean(raw.oeffnungszeiten, 200),
    kontakt_name: clean(raw.kontakt_name, 100), kontakt_email: clean(raw.kontakt_email, 120).toLowerCase(),
    einwilligung: raw.einwilligung === 'ja', marketing: raw.marketing === 'ja',
  }
  const errors: Record<string, string> = {}
  if (v.name.length < 2) errors.name = 'Bitte den Namen des Betriebs angeben.'
  if (!KATEGORIEN[v.kategorie]) errors.kategorie = 'Bitte eine Kategorie wählen.'
  if (!GEMEINDEN[v.gemeinde]) errors.gemeinde = 'Bitte eine Gemeinde wählen.'
  if (v.kurz.length < 10) errors.kurz = 'Bitte in einem Satz beschreiben, was du anbietest (mindestens 10 Zeichen).'
  if (v.beschreibung.length < 60) errors.beschreibung = 'Bitte etwas ausführlicher beschreiben (mindestens 60 Zeichen).'
  if (v.email_oeffentlich && !EMAIL.test(v.email_oeffentlich)) errors.email_oeffentlich = 'Diese E-Mail-Adresse sieht nicht gültig aus.'
  if (raw.website && !v.website) errors.website = 'Diese Website-Adresse sieht nicht gültig aus.'
  if (v.kontakt_name.length < 2) errors.kontakt_name = 'Bitte deinen Namen angeben.'
  if (!EMAIL.test(v.kontakt_email)) errors.kontakt_email = 'Bitte eine gültige E-Mail-Adresse angeben.'
  if (!v.einwilligung) errors.einwilligung = 'Ohne dein Einverständnis kann ich den Eintrag nicht veröffentlichen.'
  if (Object.keys(errors).length) return form(env, url, { ...raw, betrieb: v.betrieb, einwilligung: v.einwilligung ? 'ja' : '', marketing: v.marketing ? 'ja' : '' }, errors)

  const hash = await ipHash(env, req)
  if (await tooMany(env, 'eintraege', hash, 5)) return html(layout({ title: 'Bitte später erneut', description: '', path: '/verzeichnis/eintragen/', origin: env.SITE_ORIGIN, noindex: true }, message('Kurz durchatmen.', 'Von diesem Anschluss kamen gerade viele Einträge. Bitte versuche es in einer Stunde erneut oder schreib an a.wottke@nexara-ai.de.')), 429)

  // Eindeutigen Slug finden
  const base = slugify(`${v.name} ${v.ortsteil || GEMEINDEN[v.gemeinde]}`) || 'betrieb'
  let slug = base
  for (let i = 2; await env.DB.prepare(`SELECT 1 FROM eintraege WHERE slug = ?`).bind(slug).first(); i++) slug = `${base}-${i}`
  const token = randomToken()
  const ts = now()
  const claim = v.betrieb ? await env.DB.prepare(`SELECT slug FROM eintraege WHERE slug = ? AND status = 'aktiv'`).bind(v.betrieb).first<{ slug: string }>() : null
  await env.DB.prepare(
    `INSERT INTO eintraege (slug, name, kategorie, gemeinde, ortsteil, strasse, plz, kurz, beschreibung, leistungen, telefon, email_oeffentlich, website, oeffnungszeiten, kontakt_name, kontakt_email, marketing_ok, status, quelle, hinweis, token, ip_hash, erstellt_am, aktualisiert_am)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'unbestaetigt', 'betrieb', ?, ?, ?, ?, ?)`
  ).bind(slug, v.name, v.kategorie, v.gemeinde, v.ortsteil || null, v.strasse || null, v.plz || null, v.kurz, v.beschreibung, v.leistungen || null, v.telefon || null, v.email_oeffentlich || null, v.website || null, v.oeffnungszeiten || null, v.kontakt_name, v.kontakt_email, v.marketing ? 1 : 0, claim ? `claim:${claim.slug}` : null, token, hash, ts, ts).run()

  // Links in Mails zeigen auf die Adresse, über die eingetragen wurde (auch workers.dev im Test).
  const link = `${url.origin}/verzeichnis/bestaetigen/?t=${token}`
  ctx.waitUntil(
    notify(env, {
      mail: {
        to: v.kontakt_email,
        subject: `Bitte bestätigen: Eintrag für ${v.name}`,
        text: `Hallo ${v.kontakt_name},\n\ndanke für deinen Eintrag im Verzeichnis „Aus der Region“.\n\nBitte bestätige mit diesem Link, dass du ihn abgeschickt hast:\n${link}\n\nDanach prüfe ich den Eintrag und schalte ihn frei, meist innerhalb von zwei Werktagen.${v.marketing ? '\n\nDu hast außerdem zugestimmt, gelegentlich Tipps von Nexara per E-Mail zu bekommen. Mit dem Klick auf den Link bestätigst du auch das. Abmelden kannst du dich jederzeit mit einer kurzen Antwort.' : ''}\n\nWenn du nichts eingetragen hast, ignoriere diese Mail einfach. Dann wird nichts veröffentlicht.\n\nViele Grüße\nAdrien Wottke\nNexara · Brösa bei Bautzen\nhttps://nexara-ai.de/verzeichnis/`,
      },
    })
  )
  const devHint = env.DEV_MODE === '1' ? `<p class="vz-small">Entwicklungsmodus: <a href="/verzeichnis/bestaetigen/?t=${token}">Bestätigungslink öffnen</a></p>` : ''
  return html(layout({ title: 'Fast geschafft · Verzeichnis', description: '', path: '/verzeichnis/eintragen/', origin: env.SITE_ORIGIN, noindex: true }, message('Fast geschafft: <em>Bitte bestätigen.</em>', `Ich habe dir eine E-Mail an ${v.kontakt_email.replace(/[<>&"]/g, '')} geschickt. Klick auf den Link darin, damit ich den Eintrag prüfen und freischalten kann. Keine Mail da? Schau im Spam-Ordner nach.`, devHint)))
}

// POST /api/verzeichnis/moderation  (Freigeben oder Ablehnen, signiert)
export async function moderation(req: Request, env: Env, ctx: Ctx): Promise<Response> {
  const fd = await req.formData()
  const id = Number(fd.get('id'))
  const sig = String(fd.get('sig') ?? '')
  const aktion = String(fd.get('aktion') ?? '')
  const meta = { title: 'Moderation · Verzeichnis', description: '', path: '/verzeichnis/moderation/', origin: env.SITE_ORIGIN, noindex: true }
  if (!id || !(await verify(env, `moderation:${id}`, sig))) return html(layout(meta, message('Link ungültig.', 'Die Signatur passt nicht.')), 403)
  const e = await env.DB.prepare(`SELECT * FROM eintraege WHERE id = ?`).bind(id).first<Eintrag>()
  if (!e) return html(layout(meta, message('Nicht gefunden.', '')), 404)
  const ts = now()
  if (aktion === 'ablehnen') {
    await env.DB.prepare(`UPDATE eintraege SET status = 'abgelehnt', aktualisiert_am = ? WHERE id = ?`).bind(ts, id).run()
    return html(layout(meta, message('Abgelehnt.', `${e.name} wird nicht veröffentlicht. Der Betrieb bekommt keine automatische Mail; schreib ihm bei Bedarf persönlich.`)))
  }
  if (aktion !== 'freigeben') return html(layout(meta, message('Unbekannte Aktion.', '')), 400)

  let slug = e.slug
  const claimed = e.hinweis?.startsWith('claim:') ? e.hinweis.slice(6) : ''
  if (claimed && claimed !== e.slug) {
    // Bestätigung eines redaktionellen Eintrags: alter Eintrag geht offline, neuer übernimmt die Adresse
    const old = await env.DB.prepare(`SELECT id FROM eintraege WHERE slug = ?`).bind(claimed).first<{ id: number }>()
    if (old) {
      await env.DB.prepare(`UPDATE eintraege SET status = 'entfernt', slug = ?, aktualisiert_am = ? WHERE id = ?`).bind(`${claimed}-alt-${old.id}`, ts, old.id).run()
      await env.DB.prepare(`UPDATE eintraege SET slug = ? WHERE id = ?`).bind(claimed, id).run()
      slug = claimed
    }
  }
  await env.DB.prepare(`UPDATE eintraege SET status = 'aktiv', freigegeben_am = ?, aktualisiert_am = ? WHERE id = ?`).bind(ts, ts, id).run()
  const pageUrl = `${new URL(req.url).origin}${entryPath({ slug })}`
  ctx.waitUntil(
    notify(env, {
      mail: {
        to: e.kontakt_email,
        subject: `Dein Eintrag ist online: ${e.name}`,
        text: `Hallo ${e.kontakt_name},\n\ndein Eintrag ist jetzt im Verzeichnis „Aus der Region“ online:\n${pageUrl}\n\nTipp: Wenn du den Link auf deiner Website, in deinem Google-Unternehmensprofil oder in Social Media teilst, finden dich Kunden aus der Region leichter.\n\nÄnderungen? Antworte einfach auf diese Mail.\n\nViele Grüße\nAdrien Wottke\nNexara · Brösa bei Bautzen`,
      },
    })
  )
  return html(layout(meta, message('Freigegeben.', `${e.name} (${ortText(e)}) ist online.`, `<p><a class="vz-btn" href="${entryPath({ slug })}">Eintrag ansehen</a></p>`)))
}
