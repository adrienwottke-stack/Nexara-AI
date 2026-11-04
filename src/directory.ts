import './commerce'
import './directory.css'

const query = document.querySelector<HTMLInputElement>('#search-service')!
const place = document.querySelector<HTMLInputElement>('#search-place')!
const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-category]')]
const results = document.querySelector<HTMLElement>('#directory-results')!
const empty = document.querySelector<HTMLElement>('#directory-empty')!
const count = document.querySelector<HTMLElement>('#directory-count')!
let category = 'all'

function normalized(value: string) {
  return value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').trim()
}

type Category = 'handwerk' | 'digital' | 'service' | 'gesundheit' | 'gastronomie'
type DirectoryEntry = {
  id: string
  name: string
  place: string
  category: Category
  description: string
  summary: string
  displayName?: string
  image: { src: string; alt: string; width: number; height: number; source: string; position?: string }
  tags: string[]
  website: string
  source: string
  own?: boolean
}
const categoryLabels: Record<Category, string> = {
  handwerk: 'Handwerk & Bauen',
  digital: 'Digital & Kreativ',
  service: 'Service & Handel',
  gesundheit: 'Gesundheit & Wohlbefinden',
  gastronomie: 'Essen & Erleben',
}
// These are public, editorial entries, not partner endorsements or capacity confirmations.
// The original websites were read on 03.11.2026. No logos, ratings or contact-person data are copied.
// Original-site photos are local feedback-preview assets only; reuse rights are NOT cleared.
// See evidence/nexara-cinematic-20261103/BILDQUELLEN.md before any public release.
const entries: DirectoryEntry[] = [
  {
    id: 'tischlerei-stuebner',
    name: 'Bau- und Möbeltischlerei Sebastian Stübner',
    place: 'Malschwitz OT Baruth',
    category: 'handwerk',
    description: 'Türen, Fenster, Möbel- und Innenausbau sowie Restaurationen und Reparaturarbeiten.',
    summary: 'Türen, Möbel, Innenausbau und Restaurationen aus der Region.',
    displayName: 'Tischlerei Sebastian Stübner',
    image: { src: '/media/directory/stuebner-tisch.jpg', alt: 'Massivholztisch mit Sitzbank aus der Bildergalerie der Tischlerei Stübner', width: 2000, height: 980, source: 'https://www.tischlerei-stuebner.de/media/slider/slider_03.jpeg' },
    tags: ['Tischlerei', 'Möbel', 'Innenausbau'],
    website: 'https://www.tischlerei-stuebner.de/index.html',
    source: 'https://www.tischlerei-stuebner.de/index.html',
  },
  {
    id: 'landbaeckerei-trittmacher',
    name: 'UrGetreide – Landbäckerei Trittmacher GmbH',
    place: 'Malschwitz',
    category: 'gastronomie',
    description: 'Bäckerei mit Brot, Brötchen und Kuchen, darunter Backwaren aus Urgetreide.',
    summary: 'Brot, Brötchen und Kuchen – auch aus Urgetreide.',
    displayName: 'Landbäckerei Trittmacher',
    image: { src: '/media/directory/trittmacher-brot.jpg', alt: 'Brot und Getreideähren von der Website der Landbäckerei Trittmacher', width: 1920, height: 1080, source: 'https://www.oberlausitzer-urgetreide.de/files/seiteninhalt/1920x1080/urgetreide-brot.jpg' },
    tags: ['Bäckerei', 'Brot & Brötchen', 'Urgetreide'],
    website: 'https://www.oberlausitzer-urgetreide.de/',
    source: 'https://www.oberlausitzer-urgetreide.de/Produkte-aus-Urgetriede',
  },
  {
    id: 'gasthof-eisvogel',
    name: 'Gasthof Zum Eisvogel',
    place: 'Malschwitz OT Wartha',
    category: 'gastronomie',
    description: 'Gaststätte und Pension am Olbasee mit Catering und Partyservice.',
    summary: 'Gaststätte, Pension und Catering am Olbasee.',
    image: { src: '/media/directory/eisvogel-pension.webp', alt: 'Gästezimmer aus der Website der Pension Zum Eisvogel in Wartha', width: 768, height: 512, source: 'https://www.eisvogel-wartha.de/wp-content/uploads/2026/05/pension-wartha-gasthof-zum-eisvogel-768x512.webp' },
    tags: ['Gaststätte', 'Pension', 'Catering'],
    website: 'https://www.eisvogel-wartha.de/',
    source: 'https://www.eisvogel-wartha.de/',
  },
  {
    id: 'ferienhof-olbasee',
    name: 'Ferienhof Olbasee',
    place: 'Malschwitz OT Wartha',
    category: 'gastronomie',
    description: 'Ferienwohnungen und Gästezimmer direkt am Olbasee in der Oberlausitz.',
    summary: 'Ferienwohnungen und Gästezimmer direkt am Olbasee.',
    image: { src: '/media/directory/ferienhof-olbasee.jpg', alt: 'Außenansicht des Ferienhofs Olbasee aus dessen Website', width: 940, height: 467, source: 'https://www.ferienhof-olbasee.de/s/img/emotionheader.jpg?1763294881.940px.467px' },
    tags: ['Ferienwohnung', 'Gästezimmer', 'Olbasee'],
    website: 'https://www.ferienhof-olbasee.de/',
    source: 'https://www.ferienhof-olbasee.de/',
  },
  {
    id: 'physiotherapie-kieschnick',
    name: 'Physiotherapie Kieschnick',
    place: 'Malschwitz und Baruth',
    category: 'gesundheit',
    description: 'Physiotherapiepraxis mit Standorten in Malschwitz und Baruth; Behandlungen unter anderem in den Bereichen Orthopädie, Neurologie und CMD.',
    summary: 'Physiotherapie in Malschwitz und Baruth.',
    image: { src: '/media/directory/kieschnick-behandlungsraum.jpg', alt: 'Leerer Behandlungsraum von der Website der Physiotherapie Kieschnick', width: 1400, height: 550, source: 'https://www.physiotherapie-kieschnick.de/img/slider/behandlungsraum-1.jpg' },
    tags: ['Physiotherapie', 'Orthopädie', 'Neurologie'],
    website: 'https://www.physiotherapie-kieschnick.de/',
    source: 'https://www.physiotherapie-kieschnick.de/kontakt',
  },
  {
    id: 'nexara',
    name: 'Nexara · Adrien Wottke',
    place: 'Brösa / Malschwitz',
    category: 'digital',
    description: 'Websites für Selbstständige und kleine Unternehmen. Auf Wunsch mit digitalem Anfrage-Assistenten und passenden Automatisierungen.',
    summary: 'Websites und Anfrage-Assistenten für kleine Unternehmen.',
    image: { src: '/media/personal/portrait-original.webp', alt: 'Originalporträt von Adrien Wottke im weißen Hemd', width: 640, height: 800, source: '/media/personal/portrait-original.webp', position: 'center 28%' },
    tags: ['Webdesign', 'Unternehmenswebsite', 'Anfrage-Assistent', 'Chatbot'],
    website: '/websites.html',
    source: '/websites.html',
    own: true,
  },
]

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag)
  node.className = className
  if (text) node.textContent = text
  return node
}
function websiteLink(text: string, url: string, className = '') {
  const link = element('a', className, text)
  link.href = url
  if (url.startsWith('https://')) {
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
  }
  return link
}

function renderEntry(entry: DirectoryEntry) {
  const article = element('article', 'dir-listing dir-listing--editorial dir-listing--photo')
  article.id = `${entry.id}-listing`
  const photo = element('div', 'dir-listing__photo')
  const image = element('img', '')
  image.src = entry.image.src
  image.alt = entry.image.alt
  image.width = entry.image.width
  image.height = entry.image.height
  image.loading = 'lazy'
  image.decoding = 'async'
  image.sizes = '(max-width: 760px) calc(100vw - 44px), (max-width: 1440px) 42vw, 630px'
  if (entry.image.position) image.style.objectPosition = entry.image.position
  image.addEventListener('error', () => {
    if (image.dataset.fallback) return
    image.dataset.fallback = 'true'
    image.src = '/media/directory/fallback.svg'
    image.alt = 'Bild derzeit nicht verfügbar. Die Betriebsangaben stehen darunter.'
  })
  photo.append(image, element('span', 'dir-listing__photo-badge', entry.own ? 'Eigener Eintrag' : categoryLabels[entry.category]))
  const content = element('div', 'dir-listing__body')
  const heading = element('h3', '')
  heading.append(websiteLink(entry.displayName ?? entry.name, entry.website))
  const bottom = element('div', 'dir-listing__bottom')
  bottom.append(websiteLink(entry.own ? 'Angebot ansehen ↗' : 'Website des Betriebs ↗', entry.website))
  const details = element('details', 'dir-listing__details')
  details.append(element('summary', '', 'Angaben & Quelle'))
  details.append(element('p', 'dir-listing__confirmation', entry.own ? 'Eigener Eintrag · Kapazität auf Anfrage' : 'Redaktionell recherchiert · Nicht vom Betrieb bestätigt · Kapazität auf Anfrage'))
  if (entry.displayName) details.append(element('p', 'dir-listing__full-name', entry.name))
  details.append(element('p', 'dir-listing__full-description', entry.description))
  const provenance = element('div', 'dir-listing__source')
  provenance.append(websiteLink('Quelle: eigene Angebotsseite', entry.source), element('span', '', 'Stand: 03.11.2026'))
  if (!entry.own) provenance.firstElementChild!.textContent = 'Quelle: Website des Betriebs'
  const imageSource = websiteLink('Bildquelle: eigene Projektmedien', entry.image.source, 'dir-listing__image-source')
  if (!entry.own) imageSource.textContent = 'Bildquelle: Website des Betriebs'
  const correction = websiteLink('Angaben korrigieren oder entfernen', `mailto:a.wottke@nexara-ai.de?subject=${encodeURIComponent(`Verzeichnis-Eintrag ändern: ${entry.name}`)}`, 'dir-listing__correction')
  details.append(provenance, imageSource, correction)
  content.append(heading, element('p', 'dir-listing__place', entry.place), element('p', 'dir-listing__description', entry.summary), bottom, details)
  article.append(photo, content)
  return article
}

function filterDirectory(updateUrl = true) {
  const filtered = entries.filter(entry => {
    const searchable = normalized(`${entry.name} ${entry.description} ${entry.tags.join(' ')} ${categoryLabels[entry.category]}`)
    const locationText = normalized(`${entry.place} Bautzen-Region Landkreis Bautzen Sachsen Oberlausitz`)
    return normalized(query.value).split(/\s+/).every(word => searchable.includes(word))
      && normalized(place.value).split(/\s+/).every(word => locationText.includes(word))
      && (category === 'all' || category === entry.category)
  })
  results.replaceChildren(...filtered.map(renderEntry))
  results.hidden = filtered.length === 0
  empty.hidden = filtered.length !== 0
  count.textContent = filtered.length === 0 ? 'Keine passenden Angebote · Verzeichnis im Aufbau' : `${filtered.length} ${filtered.length === 1 ? 'passendes Angebot' : 'passende Angebote'} · Verzeichnis im Aufbau`
  chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.category === category)))
  if (updateUrl) {
    const url = new URL(location.href)
    for (const [key, value] of [['suche', query.value.trim()], ['ort', place.value.trim()], ['kategorie', category === 'all' ? '' : category]]) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    history.replaceState(null, '', url)
  }
}

const initial = new URLSearchParams(location.search)
query.value = initial.get('suche') ?? ''
place.value = initial.get('ort') ?? ''
if (chips.some(chip => chip.dataset.category === initial.get('kategorie'))) category = initial.get('kategorie')!
filterDirectory(false)
query.addEventListener('input', () => filterDirectory())
place.addEventListener('input', () => filterDirectory())
document.querySelector('#directory-search')!.addEventListener('submit', event => {
  event.preventDefault()
  filterDirectory()
  count.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
})
chips.forEach(chip => chip.addEventListener('click', () => {
  category = chip.dataset.category!
  filterDirectory()
}))
document.querySelector('#reset-directory')!.addEventListener('click', () => {
  query.value = ''
  place.value = ''
  category = 'all'
  filterDirectory()
  query.focus({ preventScroll: true })
})

const entryForm = document.querySelector<HTMLFormElement>('#entry-form')!
const capacity = document.querySelector<HTMLSelectElement>('#entry-capacity')!
const capacityUntil = document.querySelector<HTMLInputElement>('#entry-capacity-until')!
const preview = document.querySelector<HTMLElement>('#entry-preview')!
const bodyPreview = document.querySelector<HTMLTextAreaElement>('#entry-preview-body')!
const mailLink = document.querySelector<HTMLAnchorElement>('#entry-mail-link')!
const copyStatus = document.querySelector<HTMLElement>('#entry-copy-status')!
let preparedSubject = ''
let preparedBody = ''

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function refreshDateBounds() {
  const today = new Date()
  const limit = new Date(today)
  limit.setDate(limit.getDate() + 30)
  capacityUntil.min = localDate(today)
  capacityUntil.max = localDate(limit)
}
refreshDateBounds()
capacity.addEventListener('change', () => {
  capacityUntil.disabled = capacity.value === ''
  capacityUntil.required = capacity.value !== ''
  if (!capacity.value) capacityUntil.value = ''
  refreshDateBounds()
})
entryForm.addEventListener('input', event => {
  if (event.target === bodyPreview) return
  preview.hidden = true
  copyStatus.textContent = ''
})
entryForm.addEventListener('submit', event => {
  event.preventDefault()
  refreshDateBounds()
  if (!entryForm.reportValidity()) return
  const values = new FormData(entryForm)
  const value = (key: string) => String(values.get(key) ?? '').trim()
  preparedSubject = `Verzeichnis-Eintrag: ${value('company')}`
  const capacityText = value('capacity') ? `${value('capacity')} (bestätigt bis ${value('capacityUntil')})` : 'Keine Angabe — Kapazität auf Anfrage'
  preparedBody = [
    'Hallo Adrien,', '',
    'ich möchte meinen Betrieb für das regionale Nexara-Verzeichnis vorschlagen.', '',
    `Betrieb: ${value('company')}`,
    `Kategorie: ${value('category')}`,
    `Ort / Einzugsgebiet: ${value('place')}`,
    `Angebot: ${value('service')}`,
    `Website: ${value('website') || 'Keine Website angegeben'}`,
    `Kapazität: ${capacityText}`, '',
    'Kontakt für Rückfragen (nicht zur Veröffentlichung):',
    `Ansprechpartner: ${value('person')}`,
    `Kontakt-E-Mail: ${value('email')}`, '',
    'Ich bestätige, dass ich diesen Betrieb vertreten darf. Ich bin mit der Veröffentlichung der Geschäftsbeschreibung, des Orts, der Kategorie, einer angegebenen Website und der bestätigten Kapazitätsangabe nach Rücksprache einverstanden.',
    'Die Datenschutzhinweise habe ich zur Kenntnis genommen.', '',
    'Bitte melde dich vor einer Veröffentlichung bei mir.', '',
    `Viele Grüße\n${value('person')}`,
  ].join('\n')
  document.querySelector('#entry-preview-subject')!.textContent = preparedSubject
  bodyPreview.value = preparedBody
  mailLink.href = `mailto:a.wottke@nexara-ai.de?subject=${encodeURIComponent(preparedSubject)}&body=${encodeURIComponent(preparedBody)}`
  preview.hidden = false
  document.querySelector<HTMLElement>('#preview-title')!.focus({ preventScroll: true })
  preview.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
})
document.querySelector('#copy-entry')!.addEventListener('click', async () => {
  const fullMessage = `An: a.wottke@nexara-ai.de\nBetreff: ${preparedSubject}\n\n${preparedBody}`
  try {
    await navigator.clipboard.writeText(fullMessage)
    copyStatus.textContent = 'Nachricht kopiert. Füge sie in eine E-Mail an a.wottke@nexara-ai.de ein und sende sie selbst ab.'
  } catch {
    bodyPreview.focus()
    bodyPreview.select()
    copyStatus.textContent = 'Kopieren ist hier nicht automatisch möglich. Der Nachrichtentext ist markiert: Kopiere ihn mit Strg+C oder über das Textmenü.'
  }
})
entryForm.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled = false
